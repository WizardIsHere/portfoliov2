import React, { useMemo } from 'react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { GitCommitHorizontal, Star } from 'lucide-react';
import useGithub from '#hooks/useGithub.js';

dayjs.extend(relativeTime);

const HEATMAP_DAYS = 90; // ~13 weeks — the real window the events API can see (see useGithub.js)
const LEVEL_CLASS = ['bg-muted', 'bg-accent/25', 'bg-accent/50', 'bg-accent/75', 'bg-accent'];
const levelFor = (count) => (count === 0 ? 0 : count <= 1 ? 1 : count <= 3 ? 2 : count <= 6 ? 3 : 4);

// Counts *all* public events per day, not just pushes — GitHub's own graph
// blends commits/PRs/issues/reviews too, and our events feed can only see
// pushes reliably (see Hero.jsx's pushes-30d comment on why commit counts
// aren't derivable at all anymore). "activity" is the honest word for it.
const GithubHeatmap = ({ events }) => {
    const weeks = useMemo(() => {
        const counts = new Map();
        events.forEach((e) => {
            const day = dayjs(e.created_at).format('YYYY-MM-DD');
            counts.set(day, (counts.get(day) || 0) + 1);
        });

        const today = dayjs().startOf('day');
        const start = today.subtract(HEATMAP_DAYS - 1, 'day');
        // Pad to the previous Sunday so every column is a full 7-day week.
        const gridStart = start.subtract(start.day(), 'day');

        const allDays = [];
        for (let d = gridStart; !d.isAfter(today); d = d.add(1, 'day')) {
            const key = d.format('YYYY-MM-DD');
            allDays.push({ key, date: d, count: d.isBefore(start) ? null : counts.get(key) || 0 });
        }

        const weekCols = [];
        for (let i = 0; i < allDays.length; i += 7) weekCols.push(allDays.slice(i, i + 7));
        return weekCols;
    }, [events]);

    return (
        <div className="mono flex gap-[3px] overflow-x-auto pb-1">
            {weeks.map((week) => (
                <div key={week[0].key} className="flex flex-col gap-[3px]">
                    {week.map((day) =>
                        day.count === null ? (
                            <span key={day.key} className="h-[11px] w-[11px]" aria-hidden="true" />
                        ) : (
                            <span
                                key={day.key}
                                title={`${day.count} event${day.count === 1 ? '' : 's'} — ${day.date.format('MMM D')}`}
                                className={`h-[11px] w-[11px] rounded-sm ${LEVEL_CLASS[levelFor(day.count)]}`}
                            />
                        )
                    )}
                </div>
            ))}
        </div>
    );
};

const ActivityLine = ({ event }) => {
    const commit = event.payload.commits[event.payload.commits.length - 1];

    return (
        <li className="mono flex items-start gap-2.5 text-[13px]">
            <GitCommitHorizontal size={14} className="mt-0.5 shrink-0 text-accent" />
            <span className="min-w-0 flex-1 truncate text-fg-muted">
                <span className="text-fg">{event.repo.name.split('/')[1]}</span> — {commit.message.split('\n')[0].slice(0, 72)}
            </span>
            <span className="shrink-0 text-fg-muted/70">{dayjs(event.created_at).fromNow()}</span>
        </li>
    );
};

const LiveActivity = () => {
    const { status, events, repos } = useGithub();
    // Some PushEvents carry zero commits (force-pushes, branch deletes) — exclude
    // those here so "pushEvents.length === 0" below is a reliable empty-state check.
    const pushEvents = events
        .filter((e) => e.type === 'PushEvent' && e.payload?.commits?.length > 0)
        .slice(0, 6);

    return (
        <section id="activity" aria-label="Live activity" className="border-b border-border/60 py-16 sm:py-20">
            <div className="mx-auto mb-8 max-w-5xl px-5">
                <h2 className="mono mb-1 flex items-center gap-2 text-xs uppercase tracking-wider text-accent">
                    ~/activity/heatmap
                    {status === 'ready' && (
                        <span className="mono inline-flex items-center gap-1.5 rounded border border-accent-2/40 bg-accent-2/10 px-1.5 py-0.5 text-[9px] text-accent-2">
                            <span className="status-dot relative bg-accent-2">
                                <span className="status-pulse absolute inset-0" aria-hidden="true" />
                            </span>
                            LIVE
                        </span>
                    )}
                </h2>
                <p className="mb-4 text-fg-muted">{HEATMAP_DAYS} days of public GitHub activity, live.</p>

                <div className="glass rounded-lg p-4">
                    {status === 'ready' ? (
                        <GithubHeatmap events={events} />
                    ) : (
                        <p className="mono text-xs text-fg-muted">{status === 'error' ? 'Unavailable — see GitHub directly.' : 'fetching…'}</p>
                    )}
                </div>
            </div>

            <div className="mx-auto grid max-w-5xl gap-6 px-5 sm:grid-cols-2">
                <div>
                    <h2 className="mono mb-1 text-xs uppercase tracking-wider text-accent">~/activity</h2>
                    <p className="mb-4 text-fg-muted">Pulled live from the GitHub events API — not a static list.</p>

                    <div className="glass rounded-lg p-4">
                        {status === 'loading' && <p className="mono text-xs text-fg-muted">fetching…</p>}
                        {status === 'error' && (
                            <p className="mono text-xs text-fg-muted">
                                GitHub API unavailable right now —{' '}
                                <a href="https://github.com/WizardIsHere" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
                                    view activity on GitHub ↗
                                </a>
                            </p>
                        )}
                        {status === 'ready' && pushEvents.length === 0 && (
                            <p className="mono text-xs text-fg-muted">No recent public push activity.</p>
                        )}
                        {status === 'ready' && pushEvents.length > 0 && (
                            <ul className="space-y-2.5">
                                {pushEvents.map((e) => (
                                    <ActivityLine key={e.id} event={e} />
                                ))}
                            </ul>
                        )}
                    </div>
                </div>

                <div>
                    <h2 className="mono mb-1 text-xs uppercase tracking-wider text-accent">~/repos</h2>
                    <p className="mb-4 text-fg-muted">Recently updated public repositories.</p>

                    <div className="glass rounded-lg p-4">
                        {status !== 'ready' && (
                            <p className="mono text-xs text-fg-muted">
                                {status === 'error' ? 'Unavailable — see GitHub directly.' : 'fetching…'}
                            </p>
                        )}
                        {status === 'ready' && (
                            <ul className="divide-y divide-border/40">
                                {repos.slice(0, 5).map((repo) => (
                                    <li key={repo.id}>
                                        <a
                                            href={repo.html_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="mono flex min-h-11 items-center justify-between gap-3 text-[13px] text-fg-muted hover:text-fg"
                                        >
                                            <span className="truncate text-fg">{repo.name}</span>
                                            <span className="flex shrink-0 items-center gap-1">
                                                <Star size={12} />
                                                {repo.stargazers_count}
                                            </span>
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default LiveActivity;
