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

// kind drives color: "ok" = passing step (accent), "cmd" = a shell command
// ($ prompt highlighted), "run" = tool output line.
const LOG_LINES = [
    { kind: 'cmd', text: 'git commit -m "fix: retry on 5xx"' },
    { kind: 'cmd', text: 'npm run build' },
    { kind: 'ok', text: '✓ compiled in 1.02s' },
    { kind: 'cmd', text: 'docker push registry/api:1.7.2' },
    { kind: 'cmd', text: 'kubectl rollout status deploy/api' },
    { kind: 'ok', text: '✓ deployment "api" rolled out' },
    { kind: 'cmd', text: 'npm test -- --coverage' },
    { kind: 'ok', text: '✓ 148 passing' },
    { kind: 'cmd', text: 'git push origin main' },
    { kind: 'cmd', text: 'eslint . --fix' },
    { kind: 'cmd', text: 'vercel deploy --prod' },
    { kind: 'ok', text: '✓ production: shushant.dev' },
    { kind: 'run', text: 'psql -c "ANALYZE orders;"' },
    { kind: 'cmd', text: 'git log --oneline -5' },
];

const LINE_TONE = { ok: 'text-accent', cmd: 'text-fg', run: 'text-fg-muted' };

// A slow-scrolling log of real dev commands along the hero's edge — legible
// text reads as unmistakably "developer" in a way an abstract shape doesn't.
// The list is rendered twice back-to-back so the loop can wrap seamlessly.
const CommandLog = () => (
    <div
        aria-hidden="true"
        className="log-scroll-mask pointer-events-none absolute bottom-0 right-0 top-0 hidden w-72 overflow-hidden opacity-25 lg:block"
    >
        <div className="log-scroll mono flex flex-col gap-3 text-[11px] leading-relaxed">
            {[...LOG_LINES, ...LOG_LINES].map((line, i) => (
                <p key={i} className={`whitespace-nowrap ${LINE_TONE[line.kind]}`}>
                    {line.kind === 'cmd' && <span className="text-accent/70">$ </span>}
                    {line.text}
                </p>
            ))}
        </div>
    </div>
);

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
    const { status, events, profile: githubProfile } = useGithub();
    const uptime = useUptime();

    const lastPush = events.find((e) => e.type === 'PushEvent');
    const thirtyDaysAgo = dayjs().subtract(30, 'day');
    // GitHub's events API no longer includes a commits array on PushEvent
    // payloads, so an accurate commit count isn't derivable from this feed —
    // counting pushes themselves is the honest number available here.
    const pushes30d = events.filter((e) => e.type === 'PushEvent' && dayjs(e.created_at).isAfter(thirtyDaysAgo)).length;

    const items = [
        { label: 'session uptime', value: uptime },
        {
            label: 'last push',
            value:
                status === 'ready' ? (lastPush ? dayjs(lastPush.created_at).fromNow() : '—') : status === 'error' ? 'unavailable' : '…',
        },
        {
            label: 'pushes (30d)',
            value: status === 'error' ? '—' : <NumberTick value={status === 'ready' ? pushes30d : null} />,
        },
        {
            label: 'public repos',
            // public_repos is the account's real total; the fetched repos array
            // elsewhere is capped at per_page=6 and would undercount here.
            value: status === 'error' ? '—' : <NumberTick value={status === 'ready' ? githubProfile?.public_repos : null} />,
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
            <CommandLog />
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
