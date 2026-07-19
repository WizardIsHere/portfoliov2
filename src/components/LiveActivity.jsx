import React from 'react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { GitCommitHorizontal, Star } from 'lucide-react';
import useGithub from '#hooks/useGithub.js';

dayjs.extend(relativeTime);

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
        <section aria-label="Live activity" className="border-b border-border/60 py-16 sm:py-20">
            <div className="mx-auto grid max-w-5xl gap-6 px-5 sm:grid-cols-2">
                <div>
                    <h2 className="mono mb-1 text-xs uppercase tracking-wider text-accent">~/activity</h2>
                    <p className="mb-4 text-fg-muted">Pulled live from the GitHub events API — not a static list.</p>

                    <div className="rounded-lg border border-border bg-surface/50 p-4">
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

                    <div className="rounded-lg border border-border bg-surface/50 p-4">
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
