import React, { useEffect, useState } from 'react';

const LINES = [
    '> initializing shushant.dev',
    '> mounting modules ................ ok',
    '> establishing telemetry uplink ... ok',
    '> all systems operational',
];

const SESSION_KEY = 'booted';

// Brief first-load "system coming online" overlay. Shows once per session,
// skippable by click/keypress, and skipped entirely under reduced motion.
// Purely decorative: the real page is already mounted underneath it.
const BootSequence = () => {
    const [show, setShow] = useState(() => {
        if (typeof window === 'undefined') return false;
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
        return sessionStorage.getItem(SESSION_KEY) !== '1';
    });
    const [leaving, setLeaving] = useState(false);

    useEffect(() => {
        if (!show) return;
        sessionStorage.setItem(SESSION_KEY, '1');

        const dismiss = () => setLeaving(true);
        const autoTimer = setTimeout(dismiss, 1700);
        const removeTimer = setTimeout(() => setShow(false), 2150);
        window.addEventListener('keydown', dismiss, { once: true });
        window.addEventListener('pointerdown', dismiss, { once: true });

        return () => {
            clearTimeout(autoTimer);
            clearTimeout(removeTimer);
            window.removeEventListener('keydown', dismiss);
            window.removeEventListener('pointerdown', dismiss);
        };
    }, [show]);

    if (!show) return null;

    return (
        <div
            className={`fixed inset-0 z-[100] flex items-center justify-center bg-bg transition-opacity duration-[450ms] ${leaving ? 'opacity-0' : 'opacity-100'}`}
            aria-hidden="true"
        >
            <div className="grid-texture pointer-events-none absolute inset-0 opacity-40" />
            <div className="mono relative w-full max-w-md px-6 text-[13px] leading-relaxed">
                {LINES.map((line, i) => (
                    <p
                        key={line}
                        className={i === LINES.length - 1 ? 'text-accent' : 'text-fg-muted'}
                        style={{ opacity: 0, animation: `boot-line 0.3s ease-out ${0.12 + i * 0.32}s forwards` }}
                    >
                        {line}
                    </p>
                ))}
                <span className="mono mt-3 block text-[10px] uppercase tracking-widest text-fg-muted/50">press any key to skip</span>
            </div>
        </div>
    );
};

export default BootSequence;
