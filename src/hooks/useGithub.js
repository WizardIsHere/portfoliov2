import { useEffect, useState } from 'react';
import { profile } from '#content/profile.js';

// One shared GitHub data source for the whole site (live tile, KPI repo count,
// activity feed). Fetched once, degrades to `status: "error"` on failure —
// every consumer must render a real fallback, never a blank/broken state.
const useGithub = () => {
    const [state, setState] = useState({ status: 'loading', profile: null, repos: [], events: [] });

    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            try {
                const [profileRes, reposRes, eventsRes] = await Promise.all([
                    fetch(`https://api.github.com/users/${profile.githubUser}`),
                    fetch(`https://api.github.com/users/${profile.githubUser}/repos?sort=updated&per_page=6`),
                    fetch(`https://api.github.com/users/${profile.githubUser}/events/public`),
                ]);
                if (!profileRes.ok || !reposRes.ok || !eventsRes.ok) throw new Error('GitHub API error');

                const [profileData, reposData, eventsData] = await Promise.all([
                    profileRes.json(),
                    reposRes.json(),
                    eventsRes.json(),
                ]);
                if (cancelled) return;

                setState({
                    status: 'ready',
                    profile: profileData,
                    repos: Array.isArray(reposData) ? reposData : [],
                    events: Array.isArray(eventsData) ? eventsData : [],
                });
            } catch {
                if (!cancelled) setState((prev) => ({ ...prev, status: 'error' }));
            }
        };

        load();
        return () => {
            cancelled = true;
        };
    }, []);

    return state;
};

export default useGithub;
