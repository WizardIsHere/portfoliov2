import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { profile } from '#content/profile.js';
import { services } from '#content/services.js';
import useStatusStore from '#store/status.js';

const SECTIONS = [
    { id: 'home', label: '~/home' },
    { id: 'services', label: '~/services' },
    { id: 'stack', label: '~/stack' },
    { id: 'changelog', label: '~/changelog' },
    { id: 'contact', label: '~/contact' },
];

const goToSection = (id, onHome) => {
    if (onHome) {
        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        document.getElementById(id)?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
    } else {
        // Full navigation (matches Nav.jsx) — lets the browser land on the anchor after load.
        window.location.href = `/#${id}`;
    }
};

const downloadResume = () => {
    const a = document.createElement('a');
    a.href = profile.resumeUrl;
    a.download = '';
    a.click();
};

const buildIndex = (navigate, onHome) => {
    const items = [];

    SECTIONS.forEach((s) => {
        items.push({ id: `section-${s.id}`, title: s.label, subtitle: 'Section', action: () => goToSection(s.id, onHome) });
    });

    services.forEach((svc) => {
        items.push({ id: `service-${svc.id}`, title: svc.name, subtitle: 'Case study', action: () => navigate(`/services/${svc.id}`) });
    });

    items.push({ id: 'resume', title: 'Download résumé', subtitle: 'Action', action: downloadResume });
    items.push({ id: 'email', title: profile.email, subtitle: 'Email', action: () => { window.location.href = `mailto:${profile.email}`; } });
    items.push({ id: 'github', title: 'GitHub', subtitle: 'Profile ↗', action: () => window.open(profile.github, '_blank', 'noopener,noreferrer') });
    items.push({ id: 'linkedin', title: 'LinkedIn', subtitle: 'Profile ↗', action: () => window.open(profile.linkedin, '_blank', 'noopener,noreferrer') });

    return items;
};

const CommandPalette = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const onHome = location.pathname === '/';
    const triggerEasterEgg = useStatusStore((s) => s.triggerEasterEgg);

    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [activeIndex, setActiveIndex] = useState(0);
    const inputRef = useRef(null);

    const index = useMemo(() => buildIndex(navigate, onHome), [navigate, onHome]);

    const results = useMemo(() => {
        if (!query.trim()) return index.slice(0, 8);
        const q = query.toLowerCase();
        return index.filter((item) => item.title.toLowerCase().includes(q) || item.subtitle.toLowerCase().includes(q)).slice(0, 8);
    }, [query, index]);

    const openPalette = useCallback(() => {
        setQuery('');
        setActiveIndex(0);
        setOpen(true);
    }, []);

    useEffect(() => {
        const handleKeydown = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                open ? setOpen(false) : openPalette();
                return;
            }
            if (e.key === 'Escape') setOpen(false);
        };
        window.addEventListener('keydown', handleKeydown);
        window.addEventListener('open-command-palette', openPalette);
        return () => {
            window.removeEventListener('keydown', handleKeydown);
            window.removeEventListener('open-command-palette', openPalette);
        };
    }, [open, openPalette]);

    useEffect(() => {
        if (open) requestAnimationFrame(() => inputRef.current?.focus());
    }, [open]);

    const runItem = (item) => {
        item.action();
        setOpen(false);
    };

    const handleInputKeyDown = (e) => {
        // Easter egg: typed straight into the command bar, like a real shell.
        if (e.key === 'Enter' && query.trim().toLowerCase() === 'sudo') {
            e.preventDefault();
            triggerEasterEgg();
            setOpen(false);
            return;
        }
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActiveIndex((prev) => Math.min(prev + 1, results.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActiveIndex((prev) => Math.max(prev - 1, 0));
        } else if (e.key === 'Enter') {
            e.preventDefault();
            const item = results[activeIndex];
            if (item) runItem(item);
        }
    };

    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-[60] flex items-start justify-center bg-bg/70 px-4 pt-[15vh] backdrop-blur-sm"
            onClick={() => setOpen(false)}
        >
            <div
                className="mono w-full max-w-lg overflow-hidden rounded-lg border border-border bg-surface shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center gap-2 border-b border-border px-4 py-3">
                    <span className="text-accent">$</span>
                    <Search size={14} className="text-fg-muted" />
                    <input
                        ref={inputRef}
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value);
                            setActiveIndex(0);
                        }}
                        onKeyDown={handleInputKeyDown}
                        placeholder="search services, sections, contact…"
                        className="flex-1 bg-transparent text-sm text-fg outline-none placeholder:text-fg-muted"
                        aria-label="Command palette"
                    />
                    <kbd className="rounded border border-border px-1.5 py-0.5 text-[10px] text-fg-muted">esc</kbd>
                </div>

                <ul className="max-h-80 overflow-y-auto py-1.5">
                    {results.length === 0 && (
                        <li className="px-4 py-6 text-center text-sm text-fg-muted">no matches for &quot;{query}&quot;</li>
                    )}
                    {results.map((item, i) => (
                        <li
                            key={item.id}
                            onMouseEnter={() => setActiveIndex(i)}
                            onClick={() => runItem(item)}
                            className={`mx-1.5 flex min-h-11 cursor-pointer items-center justify-between rounded-md px-3 text-sm transition-colors ${
                                i === activeIndex ? 'bg-accent text-bg' : 'text-fg'
                            }`}
                        >
                            <span className="font-medium">{item.title}</span>
                            {/* text-bg/70 measured at 4.38:1 on the accent row — below the 4.5:1
                                minimum for this 12px text; /80 clears it at 5.49:1 (verified). */}
                            <span className={`text-xs ${i === activeIndex ? 'text-bg/80' : 'text-fg-muted'}`}>{item.subtitle}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default CommandPalette;
