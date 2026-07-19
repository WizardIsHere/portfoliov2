import React, { useEffect, useRef, useState } from 'react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ChevronDown, Download, Github, Linkedin, MapPin } from 'lucide-react';
import { profile } from '#content/profile.js';
import useGithub from '#hooks/useGithub.js';
import useStatusStore from '#store/status.js';
import useLenisStore from '#store/lenis.js';
import TypedLine from './TypedLine.jsx';
import NumberTick from './NumberTick.jsx';

dayjs.extend(relativeTime);

const useUptime = () => {
    const [seconds, setSeconds] = useState(0);
    useEffect(() => {
        const start = performance.now();
        const id = setInterval(() => setSeconds(Math.floor((performance.now() - start) / 1000)), 1000);
        return () => clearInterval(id);
    }, []);
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${String(s).padStart(2, '0')}s`;
};

// Reframed from a floating side card into a horizontal HUD strip along the
// hero's bottom edge — frees the fold for the headline to actually dominate.
const TelemetryBar = () => {
    const { status, events, repos } = useGithub();
    const uptime = useUptime();

    const lastPush = events.find((e) => e.type === 'PushEvent');
    const thirtyDaysAgo = dayjs().subtract(30, 'day');
    const commits30d = events
        .filter((e) => e.type === 'PushEvent' && dayjs(e.created_at).isAfter(thirtyDaysAgo))
        .reduce((sum, e) => sum + (e.payload?.commits?.length || 0), 0);

    const items = [
        { label: 'session uptime', value: uptime },
        {
            label: 'last push',
            value:
                status === 'ready' ? (lastPush ? dayjs(lastPush.created_at).fromNow() : '—') : status === 'error' ? 'unavailable' : '…',
        },
        {
            label: 'commits (30d)',
            value: status === 'error' ? '—' : <NumberTick value={status === 'ready' ? commits30d : null} />,
        },
        {
            label: 'public repos',
            value:
                status === 'error' ? (
                    '—'
                ) : (
                    <>
                        <NumberTick value={status === 'ready' ? repos.length : null} />
                        {status === 'ready' && '+'}
                    </>
                ),
        },
    ];

    return (
        <div className="hero-reveal relative border-t border-border/60 bg-surface/40 backdrop-blur-sm">
            <div className="mono mx-auto grid max-w-5xl grid-cols-2 divide-x divide-y divide-border/40 sm:grid-cols-4 sm:divide-y-0">
                {items.map((item) => (
                    <div key={item.label} className="px-5 py-3.5">
                        <p className="text-[10px] uppercase tracking-wider text-fg-muted">{item.label}</p>
                        <p className="mt-1 text-sm tabular-nums text-fg">{item.value}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

const ScrollCue = () => {
    const lenis = useLenisStore((s) => s.lenis);

    const handleClick = () => {
        if (lenis) lenis.scrollTo('#services', { offset: -72 });
        else document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <button
            type="button"
            onClick={handleClick}
            aria-label="Scroll to services"
            className="hero-reveal scroll-cue-bounce mono absolute bottom-6 left-1/2 flex min-h-11 -translate-x-1/2 flex-col items-center gap-1 px-4 text-[10px] uppercase tracking-widest text-fg-muted transition-colors hover:text-fg"
        >
            scroll
            <ChevronDown size={16} />
        </button>
    );
};

const Hero = () => {
    const status = useStatusStore((s) => s.status);
    const degraded = status === 'degraded';
    const contentRef = useRef(null);

    // Boot-sequence-style staggered reveal — status pill, then headline, then
    // the rest, in order. Snaps straight to the final state under reduced motion.
    useGSAP(
        () => {
            const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            const items = contentRef.current?.querySelectorAll('.hero-reveal');
            if (!items?.length) return;

            if (reduceMotion) {
                gsap.set(items, { opacity: 1, y: 0 });
                return;
            }

            gsap.set(items, { opacity: 0, y: 24 });
            gsap.to(items, { opacity: 1, y: 0, duration: 0.7, stagger: 0.12, ease: 'power3.out', delay: 0.15 });
        },
        { scope: contentRef }
    );

    return (
        <section id="home" className="relative overflow-hidden border-b border-border/60">
            {/* Radar sweep — outer div handles the static centering transform,
                inner div only rotates, so the two transforms don't fight each other. */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute left-1/2 top-1/2 h-[85vw] w-[85vw] max-h-[820px] max-w-[820px] -translate-x-1/2 -translate-y-1/2 opacity-[0.08]"
            >
                <div className="radar-sweep h-full w-full rounded-full" />
            </div>
            <div
                aria-hidden="true"
                className="ambient-glow pointer-events-none absolute -top-40 left-1/2 h-[36rem] w-[36rem] -translate-x-1/2 rounded-full bg-accent/10 blur-3xl"
            />
            <div className="grid-texture pointer-events-none absolute inset-0 opacity-40" aria-hidden="true" />

            <div ref={contentRef} className="relative mx-auto flex min-h-[85dvh] max-w-5xl flex-col justify-center px-5 py-16">
                <div className={`hero-reveal mono mb-5 flex items-center gap-2 text-xs ${degraded ? 'text-warn' : 'text-accent'}`}>
                    <span className={`status-dot relative ${degraded ? 'bg-warn' : 'bg-accent'}`}>
                        <span className="status-pulse absolute inset-0" aria-hidden="true" />
                    </span>
                    {degraded ? 'DEGRADED' : 'OPERATIONAL'}
                </div>

                <h1 className="hero-reveal text-[clamp(2.5rem,6vw,4.75rem)] font-black leading-[0.95] tracking-[-0.03em] text-fg">
                    {profile.name}
                </h1>

                <p className="hero-reveal mono mt-4 max-w-2xl text-base text-fg-muted sm:text-lg">
                    <TypedLine text={`${profile.role} — ${profile.tagline}`} />
                </p>

                <div className="hero-reveal mono mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-fg-muted">
                    <span className="flex items-center gap-1.5">
                        <MapPin size={13} />
                        {profile.location}
                    </span>
                    <span className="text-border">·</span>
                    <span>open to: {profile.openTo}</span>
                </div>

                <div className="hero-reveal mt-10 flex flex-wrap items-center gap-3">
                    {/* group-hover triggers a small "liftoff" bob on the icon — a CSS
                        keyframe (index.css: .liftoff-icon) rather than a one-way translate,
                        which would leave an empty gap once the icon moved out of the flex row. */}
                    <a
                        href={profile.resumeUrl}
                        download
                        className="group mono flex min-h-11 items-center gap-2 rounded-md bg-accent px-4 text-sm font-semibold text-bg transition-opacity hover:opacity-90"
                    >
                        <Download size={16} className="group-hover:liftoff-icon group-focus-visible:liftoff-icon" />
                        download resume
                    </a>
                    <a
                        href={profile.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mono flex min-h-11 items-center gap-2 rounded-md border border-border px-4 text-sm text-fg transition-colors hover:border-fg-muted"
                    >
                        <Github size={16} />
                        GitHub
                    </a>
                    <a
                        href={profile.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mono flex min-h-11 items-center gap-2 rounded-md border border-border px-4 text-sm text-fg transition-colors hover:border-fg-muted"
                    >
                        <Linkedin size={16} />
                        LinkedIn
                    </a>
                </div>

                <ScrollCue />
            </div>

            <TelemetryBar />
        </section>
    );
};

export default Hero;
