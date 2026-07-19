import React, { useEffect, useState } from 'react';

const prefersReducedMotion = () =>
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Counts up from 0 to `value` once it's known (e.g. once GitHub data resolves).
// `null`/`undefined` renders `placeholder` unchanged — no animation runs until
// there's a real number, so a slow API never displays a fake counting-up-from-0.
const NumberTick = ({ value, duration = 700, placeholder = '…' }) => {
    const [reduceMotion] = useState(prefersReducedMotion);
    const [display, setDisplay] = useState(reduceMotion ? value ?? null : null);
    const [prevValue, setPrevValue] = useState(value);

    // Reduced motion: snap straight to the new value during render (React's
    // documented "adjust state during render" pattern) instead of an effect,
    // since setState-in-effect would cause an extra, avoidable render pass.
    if (reduceMotion && value !== prevValue) {
        setPrevValue(value);
        setDisplay(value);
    }

    useEffect(() => {
        if (reduceMotion || value == null) return;

        let raf;
        const start = performance.now();
        const tick = (now) => {
            const t = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - t, 3);
            setDisplay(Math.round(value * eased));
            if (t < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, [value, duration, reduceMotion]);

    return <>{display ?? placeholder}</>;
};

export default NumberTick;
