import React from 'react';
import { changelog } from '#content/changelog.js';

const Changelog = () => (
    <section id="changelog" className="border-b border-border/60 py-16 sm:py-20">
        <div className="mx-auto max-w-5xl px-5">
            <h2 className="mono mb-1 text-xs uppercase tracking-wider text-accent">~/changelog</h2>
            <p className="mb-8 max-w-xl text-fg-muted">No buzzwords, just diffs — every release shipped, newest first.</p>

            <div className="flex flex-col gap-6">
                {changelog.map((entry) => (
                    <div key={entry.version} className="mono relative rounded-lg border border-border bg-surface/50 p-5">
                        <div className="mb-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                            <span className="text-accent">v{entry.version}</span>
                            <span className="text-xs text-fg-muted">{entry.range}</span>
                        </div>
                        <p className="mb-3 text-sm font-semibold text-fg">
                            {entry.role} <span className="font-normal text-fg-muted">— {entry.org}</span>
                        </p>
                        <ul className="space-y-1.5 text-[13px] leading-relaxed text-fg-muted">
                            {entry.entries.map((line, i) => (
                                <li key={i} className="flex gap-2">
                                    <span className="text-accent">+</span>
                                    <span>{line}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </div>
    </section>
);

export default Changelog;
