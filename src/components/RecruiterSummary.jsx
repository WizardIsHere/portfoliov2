import React from 'react';
import { Link } from 'react-router-dom';
import dayjs from 'dayjs';
import { Download, Github, Linkedin, Mail, MapPin } from 'lucide-react';
import { profile, kpis } from '#content/profile.js';
import { changelog } from '#content/changelog.js';
import { services } from '#content/services.js';
import useGithub from '#hooks/useGithub.js';

const KpiRow = () => {
    const { status, profile: githubProfile } = useGithub();
    return (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {kpis.map((kpi) => {
                // Mirror KpiStrip: live → real repo total; `since` → dynamic years; else static.
                const value = kpi.live
                    ? status === 'ready'
                        ? githubProfile?.public_repos
                        : '—'
                    : kpi.since
                      ? dayjs().diff(dayjs(kpi.since), 'year')
                      : kpi.to;
                return (
                    <div key={kpi.label} className="rounded-lg border border-border bg-surface/50 p-4">
                        <p className="text-2xl font-bold tabular-nums text-fg sm:text-3xl">
                            {value ?? '…'}
                            {kpi.suffix}
                            {kpi.unit && <span className="ml-1 text-sm font-normal text-fg-muted">{kpi.unit}</span>}
                        </p>
                        <p className="mt-1 text-xs text-fg-muted">{kpi.label}</p>
                    </div>
                );
            })}
        </div>
    );
};

// The other 90% of this site talks like a shell prompt. A recruiter skimming
// 50 tabs in 30 seconds doesn't need the bit — this is the same real facts,
// laid out like an actual resume. Toggled from Nav (store/viewMode.js).
const RecruiterSummary = () => {
    const latestRole = changelog[0];
    const featured = services.filter((s) => s.featured);

    return (
        <div className="mx-auto max-w-3xl px-5 py-12 sm:py-16">
            <p className="text-sm font-medium uppercase tracking-wide text-accent">Full-stack software developer</p>
            <h1 className="mt-2 text-4xl font-bold text-fg sm:text-5xl">{profile.name}</h1>
            <p className="mt-3 max-w-xl text-lg leading-relaxed text-fg-muted">{profile.tagline}.</p>
            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-fg-muted">
                <span className="flex items-center gap-1.5">
                    <MapPin size={14} />
                    {profile.location}
                </span>
                <span>Open to: {profile.openTo}</span>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
                <a
                    href={profile.resumeUrl}
                    download
                    className="flex min-h-11 items-center gap-2 rounded-md bg-accent px-5 text-sm font-semibold text-bg transition-opacity hover:opacity-90"
                >
                    <Download size={16} />
                    Download résumé
                </a>
                <a
                    href={`mailto:${profile.email}`}
                    className="flex min-h-11 items-center gap-2 rounded-md border border-border px-5 text-sm text-fg transition-colors hover:border-fg-muted"
                >
                    <Mail size={16} />
                    Email me
                </a>
                <a
                    href={profile.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex min-h-11 items-center gap-2 rounded-md border border-border px-5 text-sm text-fg transition-colors hover:border-fg-muted"
                >
                    <Linkedin size={16} />
                    LinkedIn
                </a>
                <a
                    href={profile.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex min-h-11 items-center gap-2 rounded-md border border-border px-5 text-sm text-fg transition-colors hover:border-fg-muted"
                >
                    <Github size={16} />
                    GitHub
                </a>
            </div>

            <div className="mt-10">
                <KpiRow />
            </div>

            <section className="mt-10">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-fg-muted">
                    Current role — {latestRole.role} at {latestRole.org}
                </h2>
                <ul className="mt-3 space-y-2.5">
                    {latestRole.entries.map((line, i) => (
                        <li key={i} className="flex gap-2.5 text-[15px] leading-relaxed text-fg-muted">
                            <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent" />
                            <span>{line}</span>
                        </li>
                    ))}
                </ul>
            </section>

            <section className="mt-10">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-fg-muted">Featured projects</h2>
                <div className="mt-3 space-y-3">
                    {featured.map((service) => (
                        <Link
                            key={service.id}
                            to={`/services/${service.id}`}
                            className="block rounded-lg border border-border bg-surface/50 p-4 transition-colors hover:border-accent/40"
                        >
                            <p className="font-semibold text-fg">{service.name}</p>
                            <p className="mt-1 text-sm leading-relaxed text-fg-muted">{service.pitch}</p>
                        </Link>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default RecruiterSummary;
