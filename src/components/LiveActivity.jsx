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
const Stat = ({ value, label }) => (
    <div className="flex flex-col justify-center bg-surface/30 px-3 py-2.5">
        <span className="text-lg font-bold tabular-nums leading-none text-fg">{value}</span>
        <span className="mt-1 text-[10px] uppercase tracking-wider text-fg-muted">{label}</span>
    </div>
);

const GithubHeatmap = ({ events }) => {
    const { weeks, stats, startLabel } = useMemo(() => {
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

        const inRange = allDays.filter((d) => d.count !== null);
        const total = inRange.reduce((s, d) => s + d.count, 0);
        const activeDays = inRange.filter((d) => d.count > 0).length;
        const busiest = inRange.reduce((max, d) => (d.count > (max?.count || 0) ? d : max), null);
        // current streak: consecutive days up to today with activity
        let streak = 0;
        for (let i = inRange.length - 1; i >= 0; i--) {
            if (inRange[i].count > 0) streak++;
            else break;
        }

        return {
            weeks: weekCols,
            startLabel: start.format('MMM D'),
            stats: { total, activeDays, busiest: busiest?.count ? busiest.date.format('MMM D') : '—', streak },
        };
    }, [events]);

    return (
        <div className="flex flex-col gap-5 lg:flex-row lg:items-stretch lg:justify-between">
            <div className="min-w-0">
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
                <div className="mono mt-2.5 flex items-center gap-1.5 text-[10px] text-fg-muted/60">
                    <span className="mr-1">{startLabel}</span>
                    <span className="ml-auto mr-1">less</span>
                    {LEVEL_CLASS.map((c, i) => (
                        <span key={i} className={`h-[10px] w-[10px] rounded-sm ${c}`} />
                    ))}
                    <span className="ml-1">more</span>
                </div>
            </div>

            {/* stats readout — fills the panel to the right instead of leaving dead space */}
            <div className="mono grid grid-cols-2 gap-px self-start overflow-hidden rounded-md border border-border/50 lg:w-60 lg:shrink-0">
                <Stat value={stats.total} label={`events / ${HEATMAP_DAYS}d`} />
                <Stat value={stats.activeDays} label="active days" />
                <Stat value={stats.streak} label="day streak" />
                <Stat value={stats.busiest} label="busiest day" />
            </div>
        </div>
    );
};

// GitHub's public events API no longer returns the `commits` array on PushEvent
// payloads, so we can't show commit messages here anymore — but the push itself
// (repo · branch @ sha · when) is real and available, so that's what we show.
const ActivityLine = ({ event }) => {
    const repo = event.repo.name.split('/')[1];
    const branch = (event.payload?.ref || '').replace('refs/heads/', '');
    const sha = (event.payload?.head || '').slice(0, 7);

    return (
        <li className="mono flex items-center gap-2.5 text-[13px]">
            <GitCommitHorizontal size={14} className="shrink-0 text-accent" />
            <span className="min-w-0 flex-1 truncate text-fg-muted">
                pushed to <span className="text-fg">{repo}</span>
                {branch && <span className="text-fg-muted/70"> · {branch}</span>}
                {sha && <span className="text-accent-2/70"> @{sha}</span>}
            </span>
            <span className="shrink-0 text-fg-muted/70">{dayjs(event.created_at).fromNow()}</span>
        </li>
    );
};

const LiveActivity = () => {
    const { status, events, repos } = useGithub();
    const pushEvents = events.filter((e) => e.type === 'PushEvent').slice(0, 6);

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
