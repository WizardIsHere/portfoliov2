import React, { useState } from 'react';
import { kpis } from '#content/profile.js';
import useGithub from '#hooks/useGithub.js';
import NumberTick from './NumberTick.jsx';

const KpiStrip = () => {
    const { status, repos } = useGithub();
    const [activeTip, setActiveTip] = useState(null);

    return (
        <section aria-label="Key numbers" className="border-b border-border/60">
            <div className="mono mx-auto grid max-w-5xl grid-cols-2 divide-x divide-y divide-border/60 border-border/60 sm:grid-cols-4 sm:divide-y-0">
                {kpis.map((kpi, i) => {
                    const liveErrored = kpi.live && status === 'error';
                    const tickValue = kpi.live ? (status === 'ready' ? repos.length : null) : kpi.to;

                    return (
                        <button
                            key={kpi.label}
                            type="button"
                            onClick={() => setActiveTip((prev) => (prev === i ? null : i))}
                            onMouseEnter={() => setActiveTip(i)}
                            onMouseLeave={() => setActiveTip((prev) => (prev === i ? null : prev))}
                            className="relative flex min-h-24 flex-col items-start justify-center gap-1 px-5 py-4 text-left transition-colors hover:bg-surface/50"
                        >
                            <span className="text-2xl font-bold tabular-nums text-fg sm:text-3xl">
                                {liveErrored ? '—' : <NumberTick value={tickValue} />}
                                {!liveErrored && tickValue != null && kpi.suffix}
                                {kpi.unit && <span className="ml-1 text-sm font-normal text-fg-muted">{kpi.unit}</span>}
                            </span>
                            <span className="text-xs text-fg-muted">{kpi.label}</span>

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
