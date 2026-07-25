import React, { useEffect, useRef } from 'react';

// The site-wide "mission control" backdrop: a perspective grid, drifting
// green/cyan aurora, a diagonal light-sweep, and a lightweight 2D-canvas
// constellation. Fixed at -z-10 so it sits above the body's solid slate but
// behind all (transparent-background) content. No WebGL, no deps.
//
// Perf discipline: DPR capped at 2, single rAF loop, paused when the tab is
// hidden, node count scaled to viewport and halved on coarse pointers, and
// under prefers-reduced-motion it renders exactly one static frame (no loop).
const MissionControlBackground = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const coarse = window.matchMedia('(pointer: coarse)').matches;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);

        let width = 0;
        let height = 0;
        let nodes = [];
        const LINK_DIST = 130;
        const pointer = { x: -9999, y: -9999 };

        const seed = () => {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width * dpr;
            canvas.height = height * dpr;
            canvas.style.width = `${width}px`;
            canvas.style.height = `${height}px`;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

            // ~1 node per 22k px², capped; halved on touch devices.
            const base = Math.round((width * height) / 22000);
            const count = Math.min(coarse ? Math.round(base / 2) : base, coarse ? 34 : 68);
            nodes = Array.from({ length: count }, () => ({
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * 0.22,
                vy: (Math.random() - 0.5) * 0.22,
                cyan: Math.random() > 0.4, // mostly cyan, some green
            }));
        };

        const draw = () => {
            ctx.clearRect(0, 0, width, height);

            for (let i = 0; i < nodes.length; i++) {
                const n = nodes[i];
                // links
                for (let j = i + 1; j < nodes.length; j++) {
                    const m = nodes[j];
                    const dx = n.x - m.x;
                    const dy = n.y - m.y;
                    const dist = Math.hypot(dx, dy);
                    if (dist < LINK_DIST) {
                        const a = (1 - dist / LINK_DIST) * 0.22;
                        ctx.strokeStyle = `rgba(34, 211, 238, ${a})`;
                        ctx.lineWidth = 1;
                        ctx.beginPath();
                        ctx.moveTo(n.x, n.y);
                        ctx.lineTo(m.x, m.y);
                        ctx.stroke();
                    }
                }
                // node dot; brightens near the pointer
                const pd = Math.hypot(n.x - pointer.x, n.y - pointer.y);
                const near = pd < 150 ? 1 - pd / 150 : 0;
                const alpha = 0.42 + near * 0.5;
                ctx.fillStyle = n.cyan ? `rgba(34, 211, 238, ${alpha})` : `rgba(34, 197, 94, ${alpha})`;
                ctx.beginPath();
                ctx.arc(n.x, n.y, 1.7 + near * 1.7, 0, Math.PI * 2);
                ctx.fill();
            }
        };

        const step = () => {
            for (const n of nodes) {
                n.x += n.vx;
                n.y += n.vy;
                if (n.x < 0 || n.x > width) n.vx *= -1;
                if (n.y < 0 || n.y > height) n.vy *= -1;
            }
            draw();
        };

        let raf = null;
        const loop = () => {
            step();
            raf = requestAnimationFrame(loop);
        };
        const start = () => {
            if (raf == null) raf = requestAnimationFrame(loop);
        };
        const stop = () => {
            if (raf != null) {
                cancelAnimationFrame(raf);
                raf = null;
            }
        };

        const onVisibility = () => (document.hidden ? stop() : start());
        const onResize = () => {
            seed();
            if (reduceMotion) draw();
        };
        const onPointerMove = (e) => {
            pointer.x = e.clientX;
            pointer.y = e.clientY;
        };

        seed();
        if (reduceMotion) {
            draw(); // one static frame, no loop
        } else {
            start();
            document.addEventListener('visibilitychange', onVisibility);
            if (!coarse) window.addEventListener('pointermove', onPointerMove);
        }
        window.addEventListener('resize', onResize);

        return () => {
            stop();
            document.removeEventListener('visibilitychange', onVisibility);
            window.removeEventListener('pointermove', onPointerMove);
            window.removeEventListener('resize', onResize);
        };
    }, []);

    return (
        <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
            {/* drifting aurora — green + cyan */}
            <div className="ambient-glow absolute -left-40 -top-40 h-[42rem] w-[42rem] rounded-full bg-accent/[0.13] blur-3xl" />
            <div
                className="ambient-glow absolute -bottom-52 -right-32 h-[38rem] w-[38rem] rounded-full blur-3xl"
                style={{ background: 'color-mix(in srgb, var(--color-accent-2) 13%, transparent)', animationDelay: '-8s' }}
            />
            {/* grid, faded to center via radial mask */}
            <div
                className="grid-texture absolute inset-0 opacity-50"
                style={{ maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 78%)', WebkitMaskImage: 'radial-gradient(ellipse at center, black 30%, transparent 78%)' }}
            />
            {/* diagonal light sweep riding over the grid */}
            <div className="grid-sweep absolute inset-0" />
            {/* constellation */}
            <canvas ref={canvasRef} className="absolute inset-0" />
        </div>
    );
};

export default MissionControlBackground;
