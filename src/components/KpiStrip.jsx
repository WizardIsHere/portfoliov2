import React, { useState } from 'react';
import dayjs from 'dayjs';
import { kpis } from '#content/profile.js';
import useGithub from '#hooks/useGithub.js';
import NumberTick from './NumberTick.jsx';

const KpiStrip = () => {
    const { status, profile: githubProfile } = useGithub();
    const [activeTip, setActiveTip] = useState(null);

    return (
        <section aria-label="Key numbers" className="border-b border-border/60">
            <div className="mono mx-auto grid max-w-5xl grid-cols-2 divide-x divide-y divide-border/60 border-border/60 sm:grid-cols-4 sm:divide-y-0">
                {kpis.map((kpi, i) => {
                    const liveErrored = kpi.live && status === 'error';
                    // public_repos is the account's real total; the repos array
                    // elsewhere is capped at per_page=6 and would undercount here.
                    const tickValue = kpi.live
                        ? status === 'ready'
                            ? githubProfile?.public_repos
                            : null
                        : kpi.since
                          ? dayjs().diff(dayjs(kpi.since), 'year')
                          : kpi.to;

                    return (
                        <button
                            key={kpi.label}
                            type="button"
                            onClick={() => setActiveTip((prev) => (prev === i ? null : i))}
                            onMouseEnter={() => setActiveTip(i)}
                            onMouseLeave={() => setActiveTip((prev) => (prev === i ? null : prev))}
                            className="relative flex min-h-32 flex-col items-start justify-center gap-1.5 px-5 py-4 text-left transition-colors hover:bg-surface/50 sm:min-h-40"
                        >
                            <span className="text-[clamp(2.25rem,5vw,3.75rem)] font-black leading-none tracking-tight tabular-nums text-fg">
                                {liveErrored ? '—' : <NumberTick value={tickValue} />}
                                {!liveErrored && tickValue != null && kpi.suffix}
                                {kpi.unit && <span className="ml-1.5 text-sm font-normal text-fg-muted">{kpi.unit}</span>}
                            </span>
                            <span className="text-[11px] uppercase tracking-wider text-fg-muted">{kpi.label}</span>

                            {activeTip === i && (
                                <span
                                    role="tooltip"
                                    className="absolute left-3 top-full z-10 mt-1 w-56 rounded-md border border-border bg-muted p-2.5 text-[11px] font-normal leading-snug text-fg-muted shadow-lg"
                                >
                                    {kpi.detail}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>
        </section>
    );
};

export default KpiStrip;
