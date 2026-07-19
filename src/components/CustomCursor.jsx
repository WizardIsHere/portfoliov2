import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

const HOVER_SELECTOR = 'a, button, [role="button"], input, textarea, [data-cursor-hover]';

// Desktop-only (pointer: fine) and reduced-motion gated — same reasoning as
// SmoothScroll: this is pure decoration with no information a native cursor
// doesn't already convey, so it's the first thing to cut for those users.
const CustomCursor = () => {
    const [enabled] = useState(
        () =>
            typeof window !== 'undefined' &&
            window.matchMedia('(pointer: fine)').matches &&
            !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    );
    const dotRef = useRef(null);
    const ringRef = useRef(null);

    useEffect(() => {
        if (!enabled) return;

        document.documentElement.classList.add('custom-cursor-active');

        const dot = dotRef.current;
        const ring = ringRef.current;

        // Both start invisible — until the first real mousemove, we don't know
        // where the pointer actually is, so showing them at their (0,0) mount
        // position would flash a stray dot/ring in the corner on every load.
        gsap.set([dot, ring], { opacity: 0 });

        const dotX = gsap.quickTo(dot, 'x', { duration: 0.1, ease: 'power3.out' });
        const dotY = gsap.quickTo(dot, 'y', { duration: 0.1, ease: 'power3.out' });
        // The ring trails behind the dot — the actual "custom cursor" feel.
        const ringX = gsap.quickTo(ring, 'x', { duration: 0.35, ease: 'power3.out' });
        const ringY = gsap.quickTo(ring, 'y', { duration: 0.35, ease: 'power3.out' });

        let hasMoved = false;
        const handleMove = (e) => {
            if (!hasMoved) {
                hasMoved = true;
                gsap.set([dot, ring], { x: e.clientX, y: e.clientY });
                gsap.to([dot, ring], { opacity: 1, duration: 0.2 });
            }
            dotX(e.clientX);
            dotY(e.clientY);
            ringX(e.clientX);
            ringY(e.clientY);
        };

        const handleOver = (e) => {
            if (e.target.closest?.(HOVER_SELECTOR)) {
                gsap.to(ring, { scale: 1.8, opacity: 0.5, duration: 0.25, ease: 'power2.out' });
                gsap.to(dot, { scale: 0, duration: 0.2 });
            }
        };
        const handleOut = (e) => {
            if (e.target.closest?.(HOVER_SELECTOR)) {
                gsap.to(ring, { scale: 1, opacity: 1, duration: 0.25, ease: 'power2.out' });
                gsap.to(dot, { scale: 1, duration: 0.2 });
            }
        };

        const handleLeaveWindow = () => gsap.to([dot, ring], { opacity: 0, duration: 0.2 });
        const handleEnterWindow = () => gsap.to([dot, ring], { opacity: 1, duration: 0.2 });

        window.addEventListener('mousemove', handleMove);
        document.addEventListener('mouseover', handleOver);
        document.addEventListener('mouseout', handleOut);
        document.addEventListener('mouseleave', handleLeaveWindow);
        document.addEventListener('mouseenter', handleEnterWindow);

        return () => {
            document.documentElement.classList.remove('custom-cursor-active');
            window.removeEventListener('mousemove', handleMove);
            document.removeEventListener('mouseover', handleOver);
            document.removeEventListener('mouseout', handleOut);
            document.removeEventListener('mouseleave', handleLeaveWindow);
            document.removeEventListener('mouseenter', handleEnterWindow);
        };
    }, [enabled]);

    if (!enabled) return null;

    return (
        <>
            <div
                ref={dotRef}
                aria-hidden="true"
                className="pointer-events-none fixed left-0 top-0 z-[100] h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent"
            />
            <div
                ref={ringRef}
                aria-hidden="true"
                className="pointer-events-none fixed left-0 top-0 z-[100] h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full border border-accent"
            />
        </>
    );
};

export default CustomCursor;
