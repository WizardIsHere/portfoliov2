import React, { useEffect, useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Boxes, Cloud, Code2, Database, Eye, Server, Wrench } from 'lucide-react';
import { stackLayers, railGroups } from '#content/stack.js';

const LAYER_ICON = { edge: Boxes, api: Server, data: Database };
const RAIL_ICON = { cloud: Cloud, observability: Eye, languages: Code2, tools: Wrench };

const Chip = ({ name, note, tone = 'default' }) => {
    const [show, setShow] = useState(false);
    const toneClass =
        tone === 'accent'
            ? 'border-accent/40 text-accent hover:border-accent hover:bg-accent/10'
            : 'border-border text-fg hover:border-fg-muted hover:bg-surface';

    return (
        <span className="relative inline-block">
            <button
                type="button"
                onClick={() => note && setShow((v) => !v)}
                onMouseEnter={() => note && setShow(true)}
                onMouseLeave={() => setShow(false)}
                onFocus={() => note && setShow(true)}
                onBlur={() => setShow(false)}
                className={`mono min-h-8 rounded-md border px-2.5 py-1 text-xs transition-colors ${toneClass} ${note ? 'cursor-help' : 'cursor-default'}`}
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

const Rail = ({ group }) => {
    const Icon = RAIL_ICON[group.id];
    return (
        <div className="stack-reveal flex flex-col gap-2 rounded-lg border border-dashed border-border/70 p-4 transition-colors hover:border-border">
            <p className="mono flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-fg-muted">
                {Icon && <Icon size={12} />}
                {group.label}
            </p>
            <div className="flex flex-wrap gap-2">
                {group.items.map((item) => (
                    <Chip key={item} name={item} />
                ))}
            </div>
        </div>
    );
};

const StackMap = () => {
    const sectionRef = useRef(null);

    const totalCount =
        stackLayers.reduce((n, l) => n + l.items.length, 0) + railGroups.reduce((n, g) => n + g.items.length, 0);

    useGSAP(
        () => {
            const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            const items = sectionRef.current?.querySelectorAll('.stack-reveal');
            const lines = sectionRef.current?.querySelectorAll('.stack-line');
            if (!items?.length) return;

            if (reduceMotion) {
                gsap.set(items, { opacity: 1, x: 0 });
                if (lines?.length) gsap.set(lines, { scaleY: 1 });
                return;
            }

            gsap.set(items, { opacity: 0, x: -20 });
            if (lines?.length) gsap.set(lines, { scaleY: 0, transformOrigin: 'top' });

            const tl = gsap.timeline({ scrollTrigger: { trigger: sectionRef.current, start: 'top 80%', once: true } });
            tl.to(items, { opacity: 1, x: 0, duration: 0.5, ease: 'power3.out', stagger: 0.08 });
            if (lines?.length) tl.to(lines, { scaleY: 1, duration: 0.4, ease: 'power2.out', stagger: 0.1 }, 0.15);
        },
        { scope: sectionRef }
    );

    useEffect(() => {
        document.fonts?.ready?.then(() => ScrollTrigger.refresh());
    }, []);

    return (
        <section id="stack" ref={sectionRef} className="border-b border-border/60 py-16 sm:py-20">
            <div className="mx-auto max-w-5xl px-5">
                <div className="mb-8 flex flex-wrap items-end justify-between gap-2">
                    <div>
                        <h2 className="mono mb-1 text-xs uppercase tracking-wider text-accent">~/stack</h2>
                        <p className="max-w-xl text-fg-muted">Not a tag cloud — a request's actual path, top to bottom.</p>
                    </div>
                    <span className="mono text-[11px] uppercase tracking-wider text-fg-muted">{totalCount} technologies</span>
                </div>

                <div className="mb-3 flex flex-col">
                    {stackLayers.map((layer, i) => {
                        const Icon = LAYER_ICON[layer.id];
                        const isLast = i === stackLayers.length - 1;
                        return (
                            <div key={layer.id} className="flex gap-4">
                                <div className="flex flex-col items-center">
                                    <span className="stack-reveal stack-badge flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-accent/40 bg-accent/10 text-accent">
                                        <Icon size={16} />
                                    </span>
                                    {!isLast && <span className="stack-line w-px flex-1 bg-gradient-to-b from-accent/50 to-border" />}
                                </div>
                                <div
                                    className={`stack-reveal group relative flex min-w-0 flex-1 flex-col gap-3 overflow-hidden rounded-lg border border-border bg-surface/50 p-4 transition-colors hover:border-accent/40 ${isLast ? 'mb-0' : 'mb-3'}`}
                                >
                                    {/* accent edge that lights up on hover */}
                                    <span className="pointer-events-none absolute inset-y-0 left-0 w-0.5 bg-accent/30 transition-colors group-hover:bg-accent" aria-hidden="true" />
                                    <div className="flex items-center justify-between">
                                        <p className="mono text-[10px] uppercase tracking-wider text-fg-muted">{layer.label}</p>
                                        <p className="mono text-[10px] tabular-nums text-fg-muted/60">{layer.items.length}</p>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {layer.items.map((item) => (
                                            <Chip key={item.name} name={item.name} note={item.note} tone="accent" />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                    {railGroups.map((group) => (
                        <Rail key={group.id} group={group} />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default StackMap;
