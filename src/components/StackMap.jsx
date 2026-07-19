import React, { useState } from 'react';
import { stackLayers, observabilityRail, platformRail, toolsRow } from '#content/stack.js';

const Chip = ({ name, note, tone = 'default' }) => {
    const [show, setShow] = useState(false);
    const toneClass =
        tone === 'accent'
            ? 'border-accent/40 text-accent'
            : tone === 'warn'
                ? 'border-warn/40 text-warn'
                : 'border-border text-fg';

    return (
        <span className="relative inline-block">
            <button
                type="button"
                onClick={() => note && setShow((v) => !v)}
                onMouseEnter={() => note && setShow(true)}
                onMouseLeave={() => setShow(false)}
                onFocus={() => note && setShow(true)}
                onBlur={() => setShow(false)}
                className={`mono min-h-8 rounded-md border px-2.5 py-1 text-xs transition-colors ${toneClass} ${note ? 'cursor-help hover:bg-surface' : 'cursor-default'}`}
            >
                {name}
            </button>
            {show && note && (
                <span
                    role="tooltip"
                    className="mono absolute left-1/2 top-full z-20 mt-1 w-48 -translate-x-1/2 rounded-md border border-border bg-muted p-2 text-[11px] leading-snug text-fg-muted shadow-lg"
                >
                    {note}
                </span>
            )}
        </span>
    );
};

const Rail = ({ label, items, tone }) => (
    <div className="flex flex-col gap-2 rounded-lg border border-dashed border-border/70 p-4">
        <p className="mono text-[10px] uppercase tracking-wider text-fg-muted">{label}</p>
        <div className="flex flex-wrap gap-2">
            {items.map((item) => (
                <Chip key={item} name={item} tone={tone} />
            ))}
        </div>
    </div>
);

const StackMap = () => (
    <section id="stack" className="border-b border-border/60 py-16 sm:py-20">
        <div className="mx-auto max-w-5xl px-5">
            <h2 className="mono mb-1 text-xs uppercase tracking-wider text-accent">~/stack</h2>
            <p className="mb-8 max-w-xl text-fg-muted">
                Not a tag cloud — how the systems I build are actually layered.
            </p>

            <div className="flex flex-col gap-3">
                {stackLayers.map((layer) => (
                    <div key={layer.id} className="flex flex-col gap-2 rounded-lg border border-border bg-surface/50 p-4 sm:flex-row sm:items-center sm:gap-6">
                        <p className="mono w-full shrink-0 text-[10px] uppercase tracking-wider text-fg-muted sm:w-36">
                            {layer.label}
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {layer.items.map((item) => (
                                <Chip key={item.name} name={item.name} note={item.note} tone="accent" />
                            ))}
                        </div>
                    </div>
                ))}

                <Rail label={observabilityRail.label} items={observabilityRail.items} />
                <Rail label={platformRail.label} items={platformRail.items} />
                <Rail label={toolsRow.label} items={toolsRow.items} />
            </div>
        </div>
    </section>
);

export default StackMap;
