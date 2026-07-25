import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import useLenisStore from '#store/lenis.js';
import useViewModeStore from '#store/viewMode.js';

const SECTIONS = [
    { id: 'home', label: 'home' },
    { id: 'services', label: 'services' },
    { id: 'stack', label: 'stack' },
    { id: 'changelog', label: 'changelog' },
    { id: 'activity', label: 'activity' },
    { id: 'contact', label: 'contact' },
];

// Fixed left-edge progress rail (desktop only) — lights the section currently
// in view and lets you jump between them, tying the page into one continuous
// "session". Suppressed in recruiter mode and off the home route.
const SectionRail = () => {
    const location = useLocation();
    const recruiterMode = useViewModeStore((s) => s.recruiterMode);
    const lenis = useLenisStore((s) => s.lenis);
    const [active, setActive] = useState('home');

    const onHome = location.pathname === '/';
    const enabled = onHome && !recruiterMode;

    useEffect(() => {
        if (!enabled) return;
        const ratios = new Map();
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((e) => ratios.set(e.target.id, e.isIntersecting ? e.intersectionRatio : 0));
                let best = active;
                let bestRatio = 0;
                for (const { id } of SECTIONS) {
                    const r = ratios.get(id) || 0;
                    if (r > bestRatio) {
                        bestRatio = r;
                        best = id;
                    }
                }
                if (bestRatio > 0) setActive(best);
            },
            { threshold: [0.25, 0.5, 0.75], rootMargin: '-20% 0px -20% 0px' }
        );
        SECTIONS.forEach(({ id }) => {
            const el = document.getElementById(id);
            if (el) observer.observe(el);
        });
        return () => observer.disconnect();
        // active is intentionally read as a fallback only; re-subscribing on every
        // active change would thrash the observer.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [enabled]);

    if (!enabled) return null;

    const goTo = (id) => {
        if (lenis) lenis.scrollTo(`#${id}`, { offset: id === 'home' ? 0 : -72 });
        else document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <nav aria-label="Section progress" className="fixed left-5 top-1/2 z-30 hidden -translate-y-1/2 lg:block">
            <ul className="flex flex-col gap-1">
                {SECTIONS.map(({ id, label }) => {
                    const isActive = active === id;
                    return (
                        <li key={id}>
                            <button
                                type="button"
                                onClick={() => goTo(id)}
                                aria-current={isActive ? 'true' : undefined}
                                className="group flex min-h-11 items-center gap-2.5"
                            >
                                <span className="relative flex h-2.5 w-2.5 items-center justify-center">
                                    <span
                                        className={`h-2.5 w-2.5 rounded-full border transition-all duration-300 ${
                                            isActive
                                                ? 'scale-100 border-accent-2 bg-accent-2 shadow-[0_0_10px_var(--color-accent-2)]'
                                                : 'scale-75 border-border bg-transparent group-hover:border-fg-muted'
                                        }`}
                                    />
                                </span>
                                <span
                                    className={`mono text-[10px] uppercase tracking-widest transition-all duration-300 ${
                                        isActive
                                            ? 'text-accent-2 opacity-100'
                                            : 'text-fg-muted opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0'
                                    }`}
                                >
                                    {label}
                                </span>
                            </button>
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
};

export default SectionRail;
