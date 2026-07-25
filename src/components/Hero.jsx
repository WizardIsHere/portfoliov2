import React, { useEffect, useRef, useState } from 'react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ChevronDown, Download, Github, Linkedin, MapPin, TerminalSquare } from 'lucide-react';
import { profile } from '#content/profile.js';
import useGithub from '#hooks/useGithub.js';
import useStatusStore from '#store/status.js';
import useLenisStore from '#store/lenis.js';
import TypedLine from './TypedLine.jsx';
import NumberTick from './NumberTick.jsx';
import TextScramble from './TextScramble.jsx';
import Magnetic from './Magnetic.jsx';

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

const openTerminal = () => window.dispatchEvent(new Event('open-terminal'));

// A slow-scrolling log of real dev commands along the hero's edge — legible
// text reads as unmistakably "developer" in a way an abstract shape doesn't.
// Doubles as the desktop entry point into the real Terminal (Terminal.jsx).
// The list is rendered twice back-to-back so the loop can wrap seamlessly.
const CommandLog = () => (
    <button
        type="button"
        onClick={openTerminal}
        aria-label="Open interactive terminal"
        className="log-scroll-mask group absolute bottom-0 right-0 top-0 hidden w-72 cursor-pointer overflow-hidden text-left opacity-25 transition-opacity hover:opacity-60 lg:block"
    >
        <div className="log-scroll mono flex flex-col gap-3 text-[11px] leading-relaxed">
            {[...LOG_LINES, ...LOG_LINES].map((line, i) => (
                <p key={i} className={`whitespace-nowrap ${LINE_TONE[line.kind]}`}>
                    {line.kind === 'cmd' && <span className="text-accent/70">$ </span>}
                    {line.text}
                </p>
            ))}
        </div>
    </button>
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
        <div className="hero-reveal glass relative border-x-0 border-b-0 border-t border-t-accent-2/30">
            <div className="mono mx-auto grid max-w-5xl grid-cols-2 divide-x divide-y divide-border/40 sm:grid-cols-4 sm:divide-y-0">
                {items.map((item) => (
                    <div key={item.label} className="group px-5 py-3.5">
                        <p className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-fg-muted">
                            <span className="h-1 w-1 rounded-full bg-accent-2/70" aria-hidden="true" />
                            {item.label}
                        </p>
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

// Click the status dot 5 times within 2s of each other to trigger the same
// incident/hired easter egg as typing `sudo` — a physical, discoverable
// alternative to the hidden command for anyone who never opens the terminal.
const useSecretClicks = (onTrigger, threshold = 5, windowMs = 2000) => {
    const clicksRef = useRef([]);
    return () => {
        const now = Date.now();
        clicksRef.current = [...clicksRef.current, now].filter((t) => now - t < windowMs);
        if (clicksRef.current.length >= threshold) {
            clicksRef.current = [];
            onTrigger();
        }
    };
};

const Hero = () => {
    const status = useStatusStore((s) => s.status);
    const triggerEasterEgg = useStatusStore((s) => s.triggerEasterEgg);
    const degraded = status === 'degraded';
    const contentRef = useRef(null);
    const handleStatusClick = useSecretClicks(triggerEasterEgg);
    const uptime = useUptime();

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

            <div className="relative mx-auto flex min-h-[85dvh] max-w-5xl flex-col justify-center px-5 py-16">
                <div ref={contentRef} className="hud-frame relative px-5 py-8 sm:px-8 sm:py-10">
                    {/* HUD status strip */}
                    <div className="hero-reveal mono mb-7 flex items-center gap-3 text-[10px] uppercase tracking-widest text-fg-muted">
                        <span className="text-accent-2">SYS.ONLINE</span>
                        <span className="h-px flex-1 bg-gradient-to-r from-accent-2/40 to-transparent" aria-hidden="true" />
                        <span className="tabular-nums">uptime {uptime}</span>
                    </div>

                    <button
                        type="button"
                        onClick={handleStatusClick}
                        aria-label="System status"
                        className={`hero-reveal mono mb-5 flex min-h-8 w-fit items-center gap-2 text-xs ${degraded ? 'text-warn' : 'text-accent'}`}
                    >
                        <span className={`status-dot relative ${degraded ? 'bg-warn' : 'bg-accent'}`}>
                            <span className="status-pulse absolute inset-0" aria-hidden="true" />
                        </span>
                        {degraded ? 'DEGRADED' : 'OPERATIONAL'}
                    </button>

                    <h1 className="hero-reveal text-glow-cyan text-[clamp(2.5rem,6vw,4.75rem)] font-black leading-[0.95] tracking-[-0.03em] text-fg">
                        <TextScramble text={profile.name} />
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
                        <Magnetic>
                            <a
                                href={profile.resumeUrl}
                                download
                                className="group mono flex min-h-11 items-center gap-2 rounded-md bg-accent px-4 text-sm font-semibold text-bg transition-opacity hover:opacity-90"
                            >
                                <Download size={16} className="group-hover:liftoff-icon group-focus-visible:liftoff-icon" />
                                download resume
                            </a>
                        </Magnetic>
                        <Magnetic>
                            <a
                                href={profile.github}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mono flex min-h-11 items-center gap-2 rounded-md border border-border px-4 text-sm text-fg transition-colors hover:border-accent-2/50"
                            >
                                <Github size={16} />
                                GitHub
                            </a>
                        </Magnetic>
                        <Magnetic>
                            <a
                                href={profile.linkedin}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mono flex min-h-11 items-center gap-2 rounded-md border border-border px-4 text-sm text-fg transition-colors hover:border-accent-2/50"
                            >
                                <Linkedin size={16} />
                                LinkedIn
                            </a>
                        </Magnetic>
                        <Magnetic>
                            <button
                                type="button"
                                onClick={openTerminal}
                                className="mono flex min-h-11 items-center gap-2 rounded-md border border-dashed border-border px-4 text-sm text-fg-muted transition-colors hover:border-accent/50 hover:text-accent"
                            >
                                <TerminalSquare size={16} />
                                open terminal
                                <kbd className="hidden rounded border border-border px-1 text-[10px] sm:inline">`</kbd>
                            </button>
                        </Magnetic>
                    </div>
                </div>

                <ScrollCue />
            </div>

            <TelemetryBar />
        </section>
    );
};

export default Hero;
