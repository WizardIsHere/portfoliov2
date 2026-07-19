import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { Download, Github, Linkedin, MapPin } from 'lucide-react';
import { profile } from '#content/profile.js';
import useGithub from '#hooks/useGithub.js';
import useStatusStore from '#store/status.js';
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

const LiveTile = () => {
    const { status, events, repos } = useGithub();
    const uptime = useUptime();

    const lastPush = events.find((e) => e.type === 'PushEvent');
    const thirtyDaysAgo = dayjs().subtract(30, 'day');
    const commits30d = events
        .filter((e) => e.type === 'PushEvent' && dayjs(e.created_at).isAfter(thirtyDaysAgo))
        .reduce((sum, e) => sum + (e.payload?.commits?.length || 0), 0);

    return (
        <div className="mono w-full max-w-xs shrink-0 rounded-lg border border-border bg-surface/60 p-4 text-xs">
            <p className="mb-3 text-[10px] uppercase tracking-wider text-fg-muted">live session</p>
            <dl className="space-y-2">
                <div className="flex items-center justify-between">
                    <dt className="text-fg-muted">session uptime</dt>
                    <dd className="tabular-nums text-fg">{uptime}</dd>
                </div>
                <div className="flex items-center justify-between">
                    <dt className="text-fg-muted">last push</dt>
                    <dd className="tabular-nums text-fg">
                        {status === 'ready' ? (lastPush ? dayjs(lastPush.created_at).fromNow() : '—') : status === 'error' ? 'unavailable' : '…'}
                    </dd>
                </div>
                <div className="flex items-center justify-between">
                    <dt className="text-fg-muted">commits (30d)</dt>
                    <dd className="tabular-nums text-fg">
                        {status === 'error' ? '—' : <NumberTick value={status === 'ready' ? commits30d : null} />}
                    </dd>
                </div>
                <div className="flex items-center justify-between">
                    <dt className="text-fg-muted">public repos</dt>
                    <dd className="tabular-nums text-fg">
                        {status === 'error' ? (
                            '—'
                        ) : (
                            <>
                                <NumberTick value={status === 'ready' ? repos.length : null} />
                                {status === 'ready' && '+'}
                            </>
                        )}
                    </dd>
                </div>
            </dl>
        </div>
    );
};

const Hero = () => {
    const status = useStatusStore((s) => s.status);
    const degraded = status === 'degraded';

    return (
    <section id="home" className="relative overflow-hidden border-b border-border/60">
        <div
            aria-hidden="true"
            className="ambient-glow pointer-events-none absolute -top-40 left-1/2 h-[36rem] w-[36rem] -translate-x-1/2 rounded-full bg-accent/10 blur-3xl"
        />
        <div className="grid-texture pointer-events-none absolute inset-0 opacity-40" aria-hidden="true" />

        <div className="relative mx-auto max-w-5xl px-5 py-16 sm:py-24">
            <div className="flex flex-col gap-10 sm:flex-row sm:items-start sm:justify-between">
                <div className="max-w-xl">
                    <div className={`mono mb-5 flex items-center gap-2 text-xs ${degraded ? 'text-warn' : 'text-accent'}`}>
                        <span className={`status-dot relative ${degraded ? 'bg-warn' : 'bg-accent'}`}>
                            <span className="status-pulse absolute inset-0" aria-hidden="true" />
                        </span>
                        {degraded ? 'DEGRADED' : 'OPERATIONAL'}
                    </div>

                    <h1 className="text-4xl font-bold tracking-tight text-fg sm:text-5xl">{profile.name}</h1>

                    <p className="mono mt-3 text-base text-fg-muted sm:text-lg">
                        <TypedLine text={`${profile.role} — ${profile.tagline}`} />
                    </p>

                    <div className="mono mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-fg-muted">
                        <span className="flex items-center gap-1.5">
                            <MapPin size={13} />
                            {profile.location}
                        </span>
                        <span className="text-border">·</span>
                        <span>open to: {profile.openTo}</span>
                    </div>

                    <div className="mt-8 flex flex-wrap items-center gap-3">
                        <a
                            href={profile.resumeUrl}
                            download
                            className="mono flex min-h-11 items-center gap-2 rounded-md bg-accent px-4 text-sm font-semibold text-bg transition-opacity hover:opacity-90"
                        >
                            <Download size={16} />
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
                </div>

                <LiveTile />
            </div>
        </div>
    </section>
    );
};

export default Hero;
