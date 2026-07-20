import React, { useEffect, useRef } from 'react';
import useStatusStore from '#store/status.js';

const CHARS = 'アイウエオカキクケコ01<>/{}[]=+-*'.split('');

// A 3-second canvas easter egg — see status.js: triggerMatrix() (called from
// the Terminal's `matrix` command). Gated on prefers-reduced-motion at the
// trigger itself, so this component only ever mounts when motion is allowed.
const MatrixRain = () => {
    const active = useStatusStore((s) => s.matrixActive);
    const canvasRef = useRef(null);

    useEffect(() => {
        if (!active) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1;
        const fontSize = 16;
        let columns = 0;
        let drops = [];

        const resize = () => {
            canvas.width = window.innerWidth * dpr;
            canvas.height = window.innerHeight * dpr;
            canvas.style.width = `${window.innerWidth}px`;
            canvas.style.height = `${window.innerHeight}px`;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            columns = Math.ceil(window.innerWidth / fontSize);
            drops = Array.from({ length: columns }, () => Math.random() * -50);
        };
        resize();
        window.addEventListener('resize', resize);

        let frame;
        const draw = () => {
            ctx.fillStyle = 'rgba(15, 23, 42, 0.15)';
            ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
            ctx.font = `${fontSize}px monospace`;
            ctx.fillStyle = '#22c55e';
            drops.forEach((y, i) => {
                const char = CHARS[Math.floor(Math.random() * CHARS.length)];
                ctx.fillText(char, i * fontSize, y * fontSize);
                drops[i] = y * fontSize > window.innerHeight && Math.random() > 0.975 ? 0 : y + 1;
            });
            frame = requestAnimationFrame(draw);
        };
        frame = requestAnimationFrame(draw);

        return () => {
            cancelAnimationFrame(frame);
            window.removeEventListener('resize', resize);
        };
    }, [active]);

    if (!active) return null;

    // z-[55] — below the Terminal (z-[70]) and CommandPalette (z-[60]) so it
    // reads as ambient background, never drawing over an open overlay's text.
    return <canvas ref={canvasRef} aria-hidden="true" className="pointer-events-none fixed inset-0 z-[55] opacity-80" />;
};

export default MatrixRain;
