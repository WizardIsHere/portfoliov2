import React, { useEffect, useState } from 'react';

const prefersReducedMotion = () =>
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// One short typed line, ≤1.5s total, fully skipped (renders instantly) under
// prefers-reduced-motion — this is the site's only "boot"-flavored moment,
// deliberately small (see PORTFOLIO_V2_PLAN.md §4, "no full-screen boot gate like v1").
const TypedLine = ({ text, className = '' }) => {
    // Lazy initializer (not a ref) — reads the media query once, outside render's
    // reactive path, without triggering the react-hooks/refs "ref read during render" rule.
    const [reduceMotion] = useState(prefersReducedMotion);
    const [shown, setShown] = useState(reduceMotion ? text.length : 0);
    const [done, setDone] = useState(reduceMotion);

    useEffect(() => {
        if (reduceMotion) return;
        const stepMs = Math.max(1200 / text.length, 18);
        const id = setInterval(() => {
            setShown((prev) => {
                const next = prev + 1;
                if (next >= text.length) {
                    clearInterval(id);
                    setDone(true);
                }
                return next;
            });
        }, stepMs);
        return () => clearInterval(id);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <span className={className}>
            {text.slice(0, shown)}
            {!done && <span className="type-caret" aria-hidden="true" />}
        </span>
    );
};

export default TypedLine;
