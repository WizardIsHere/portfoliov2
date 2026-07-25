import React, { useEffect, useRef, useState } from 'react';

const GLYPHS = '!<>-_\\/[]{}=+*^?#·:;01';
const prefersReduced = () =>
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Decrypt/scramble-in reveal for a line of text. Each character resolves at a
// staggered threshold; before it resolves it flickers through random glyphs.
// Under reduced motion it renders the final text immediately — no animation.
const TextScramble = ({ text, className, duration = 900 }) => {
    const [output, setOutput] = useState(() => (prefersReduced() ? text : ''));
    const rafRef = useRef(null);

    useEffect(() => {
        // Reduced motion is already handled by the lazy initializer (output = text).
        if (prefersReduced()) return;
        const start = performance.now();
        // Each char resolves somewhere in the timeline — earlier chars sooner.
        const thresholds = Array.from(text, (_, i) => (i / text.length) * 0.55 + Math.random() * 0.4);

        const tick = (now) => {
            const p = Math.min((now - start) / duration, 1);
            let out = '';
            for (let i = 0; i < text.length; i++) {
                const ch = text[i];
                if (ch === ' ') out += ' ';
                else if (p >= thresholds[i]) out += ch;
                else out += GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
            }
            setOutput(out);
            if (p < 1) rafRef.current = requestAnimationFrame(tick);
            else setOutput(text);
        };
        rafRef.current = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(rafRef.current);
    }, [text, duration]);

    return (
        <span className={className} aria-label={text}>
            <span aria-hidden="true">{output || ' '}</span>
        </span>
    );
};

export default TextScramble;
