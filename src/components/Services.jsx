import React, { useEffect, useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { services } from '#content/services.js';
import ServiceCard from './ServiceCard.jsx';

// Stagger List (Standard tier) from the ui-ux-pro-max db, gated on viewport
// entry and skipped entirely under prefers-reduced-motion.
const Services = () => {
    const gridRef = useRef(null);

    useGSAP(
        () => {
            const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            const cards = gridRef.current?.querySelectorAll('.service-card');
            if (!cards?.length) return;

            if (reduceMotion) {
                gsap.set(cards, { opacity: 1, y: 0, scale: 1 });
                return;
            }

            gsap.set(cards, { opacity: 0, y: 16, scale: 0.96 });
            gsap.to(cards, {
                opacity: 1,
                y: 0,
                scale: 1,
                duration: 0.4,
                ease: 'back.out(1.4)',
                stagger: { each: 0.06, from: 'start', grid: 'auto' },
                scrollTrigger: { trigger: gridRef.current, start: 'top 85%', once: true },
            });
        },
        { scope: gridRef }
    );

    // Web fonts (loaded via @import in index.css) can swap after ScrollTrigger's
    // initial measurement and shift this section's position — refresh once they
    // settle so the trigger point stays accurate instead of firing early/late.
    useEffect(() => {
        document.fonts?.ready?.then(() => ScrollTrigger.refresh());
    }, []);

    return (
        <section id="services" className="border-b border-border/60 py-16 sm:py-20">
            <div className="mx-auto max-w-5xl px-5">
                <h2 className="mono mb-1 text-xs uppercase tracking-wider text-accent">~/services</h2>
                <p className="mb-8 max-w-xl text-fg-muted">
                    Projects, run as services. Each one links to a real write-up — problem, tradeoffs, what got cut.
                </p>

                <div ref={gridRef} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {services.map((service) => (
                        <ServiceCard key={service.id} service={service} />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Services;
