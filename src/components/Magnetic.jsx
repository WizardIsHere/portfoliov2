import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

// Wraps an interactive element so it's gently pulled toward the cursor while
// hovered — the classic "magnetic button" micro-interaction. Desktop + motion
// only (same gating as CustomCursor). The wrapper is inline-flex so it hugs
// its child and doesn't disturb surrounding layout.
const Magnetic = ({ children, strength = 0.35, className = '' }) => {
    const ref = useRef(null);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        if (!window.matchMedia('(pointer: fine)').matches || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

        const xTo = gsap.quickTo(el, 'x', { duration: 0.4, ease: 'power3.out' });
        const yTo = gsap.quickTo(el, 'y', { duration: 0.4, ease: 'power3.out' });

        const onMove = (e) => {
            const r = el.getBoundingClientRect();
            xTo((e.clientX - (r.left + r.width / 2)) * strength);
            yTo((e.clientY - (r.top + r.height / 2)) * strength);
        };
        const onLeave = () => {
            xTo(0);
            yTo(0);
        };

        el.addEventListener('pointermove', onMove);
        el.addEventListener('pointerleave', onLeave);
        return () => {
            el.removeEventListener('pointermove', onMove);
            el.removeEventListener('pointerleave', onLeave);
        };
    }, [strength]);

    return (
        <span ref={ref} className={`inline-flex ${className}`}>
            {children}
        </span>
    );
};

export default Magnetic;
