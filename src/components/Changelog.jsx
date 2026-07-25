import React, { useRef } from 'react';
import { changelog } from '#content/changelog.js';
import useReveal from '#hooks/useReveal.js';

const Changelog = () => {
    const ref = useRef(null);
    useReveal(ref, { stagger: 0.12 });

    return (
        <section id="changelog" ref={ref} className="border-b border-border/60 py-16 sm:py-20">
            <div className="mx-auto max-w-5xl px-5">
                <h2 className="mono mb-1 text-xs uppercase tracking-wider text-accent">~/changelog</h2>
                <p className="mb-8 max-w-xl text-fg-muted">No buzzwords, just diffs — every release shipped, newest first.</p>

                <div className="flex flex-col">
                    {changelog.map((entry, i) => {
                        const isLast = i === changelog.length - 1;
                        return (
                            <div key={entry.version} className="reveal flex gap-4">
                                {/* timeline rail */}
                                <div className="flex flex-col items-center pt-1.5">
                                    <span className="h-2.5 w-2.5 shrink-0 rounded-full border border-accent-2/50 bg-accent-2/20 shadow-[0_0_8px_var(--color-accent-2)]" />
                                    {!isLast && <span className="w-px flex-1 bg-gradient-to-b from-accent-2/40 to-border" />}
                                </div>

                                <div className={`mono min-w-0 flex-1 rounded-lg border border-border bg-surface/50 p-5 ${isLast ? 'mb-0' : 'mb-4'}`}>
                                    <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1">
                                        <span className="rounded border border-accent-2/40 bg-accent-2/10 px-1.5 py-0.5 text-[11px] text-accent-2">
                                            v{entry.version}
                                        </span>
                                        <span className="text-xs text-fg-muted">{entry.range}</span>
                                    </div>
                                    <p className="mb-3 text-sm font-semibold text-fg">
                                        {entry.role} <span className="font-normal text-fg-muted">— {entry.org}</span>
                                    </p>
                                    <ul className="space-y-1.5 text-[13px] leading-relaxed text-fg-muted">
                                        {entry.entries.map((line, j) => (
                                            <li key={j} className="flex gap-2">
                                                <span className="text-accent">+</span>
                                                <span>{line}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default Changelog;
