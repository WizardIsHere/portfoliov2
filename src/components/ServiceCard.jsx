import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, FileText, Github, Lock } from 'lucide-react';
import gsap from 'gsap';

const STATUS_STYLE = {
    operational: { dot: 'bg-accent', text: 'text-accent', label: 'operational' },
    private: { dot: 'bg-warn', text: 'text-warn', label: 'private' },
};

const ServiceCard = ({ service }) => {
    const statusStyle = STATUS_STYLE[service.status] || STATUS_STYLE.operational;
    const cardRef = useRef(null);
    const [tiltEnabled] = useState(
        () =>
            typeof window !== 'undefined' &&
            window.matchMedia('(pointer: fine)').matches &&
            !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    );

    // Mouse-tracking 3D tilt — desktop + motion-allowed only, same gating
    // rationale as CustomCursor.jsx (pure decoration, cut first for those users).
    useEffect(() => {
        if (!tiltEnabled) return;
        const el = cardRef.current;
        if (!el) return;

        const rotateX = gsap.quickTo(el, 'rotationX', { duration: 0.4, ease: 'power3.out' });
        const rotateY = gsap.quickTo(el, 'rotationY', { duration: 0.4, ease: 'power3.out' });
        const lift = gsap.quickTo(el, 'z', { duration: 0.4, ease: 'power3.out' });

        const handleMove = (e) => {
            const rect = el.getBoundingClientRect();
            const px = (e.clientX - rect.left) / rect.width - 0.5;
            const py = (e.clientY - rect.top) / rect.height - 0.5;
            rotateX(py * -12);
            rotateY(px * 12);
            lift(20);
        };
        const handleLeave = () => {
            rotateX(0);
            rotateY(0);
            lift(0);
        };

        el.addEventListener('mousemove', handleMove);
        el.addEventListener('mouseleave', handleLeave);
        return () => {
            el.removeEventListener('mousemove', handleMove);
            el.removeEventListener('mouseleave', handleLeave);
        };
    }, [tiltEnabled]);

    return (
        <article
            ref={cardRef}
            style={{ transformStyle: 'preserve-3d', transformPerspective: 800 }}
            className="service-card group flex flex-col gap-3 overflow-hidden rounded-lg border border-border bg-surface/60 p-5 transition-colors hover:border-fg-muted">
            <div className="-mx-5 -mt-5 mb-1 aspect-video overflow-hidden border-b border-border bg-muted">
                {service.image ? (
                    <img
                        src={service.image}
                        alt={`${service.name} screenshot`}
                        loading="lazy"
                        className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                    />
                ) : (
                    <div className="grid-texture mono flex h-full w-full flex-col items-center justify-center gap-1.5 text-fg-muted/70">
                        <Lock size={18} />
                        <span className="text-[11px] uppercase tracking-wider">no public preview</span>
                    </div>
                )}
            </div>
            <div className="mono flex items-center gap-2 text-[11px] uppercase tracking-wider">
                <span className={`status-dot ${statusStyle.dot}`} />
                <span className={statusStyle.text}>{statusStyle.label}</span>
            </div>

            <h3 className="mono text-lg font-semibold text-fg">{service.name}</h3>
            <p className="flex-1 text-sm leading-relaxed text-fg-muted">{service.pitch}</p>

            <ul className="mono flex flex-wrap gap-1.5 text-[11px] text-fg-muted">
                {service.stack.map((s) => (
                    <li key={s} className="rounded border border-border/80 px-1.5 py-0.5">
                        {s}
                    </li>
                ))}
            </ul>

            {/* -mx-1 offsets the items' own horizontal padding so the row still lines
                up with the card edge above, while each link keeps a real ≥44px tap target. */}
            <div className="mono -mx-1 -my-1 mt-1 flex flex-wrap items-center gap-1 text-xs">
                <Link
                    to={`/services/${service.id}`}
                    className="flex min-h-11 items-center rounded-md px-1 font-semibold text-accent hover:underline"
                >
                    case study →
                </Link>
                {service.live && (
                    <a
                        href={service.live}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex min-h-11 items-center gap-1 rounded-md px-2 text-fg-muted hover:text-fg"
                    >
                        live <ArrowUpRight size={12} />
                    </a>
                )}
                {service.source && (
                    <a
                        href={service.source}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex min-h-11 items-center gap-1 rounded-md px-2 text-fg-muted hover:text-fg"
                    >
                        <Github size={12} />
                        source
                    </a>
                )}
                {!service.live && !service.source && (
                    <span className="flex min-h-11 items-center gap-1 px-2 text-fg-muted/70">
                        <FileText size={12} />
                        write-up only
                    </span>
                )}
            </div>
        </article>
    );
};

export default ServiceCard;
