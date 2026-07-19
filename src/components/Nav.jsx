import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Download, Menu, Search, X } from 'lucide-react';
import { profile } from '#content/profile.js';
import useLenisStore from '#store/lenis.js';

const openCommandPalette = () => window.dispatchEvent(new Event('open-command-palette'));

const SECTIONS = [
    { id: 'services', label: '~/services' },
    { id: 'stack', label: '~/stack' },
    { id: 'changelog', label: '~/changelog' },
    { id: 'contact', label: '~/contact' },
];

const Nav = () => {
    const location = useLocation();
    const onHome = location.pathname === '/';
    const [open, setOpen] = useState(false);
    const lenis = useLenisStore((s) => s.lenis);

    // On the home page with Lenis active, route the jump through it so it's
    // smooth like the rest of the page instead of a native instant/jump-cut
    // anchor scroll fighting Lenis's own virtual scroll position.
    const handleSectionClick = (e, id) => {
        if (!onHome || !lenis) return; // let the native /#id navigation happen
        e.preventDefault();
        lenis.scrollTo(`#${id}`, { offset: -72 }); // clears the sticky header
    };

    return (
        <header className="sticky top-0 z-40 border-b border-border/60 bg-bg/85 backdrop-blur-md">
            <nav className="mono mx-auto flex max-w-5xl items-center justify-between gap-4 px-5 py-3 text-sm">
                <Link to="/" className="-mx-2 flex min-h-11 items-center gap-2 rounded-md px-2 font-semibold text-fg" onClick={() => setOpen(false)}>
                    <span className="text-accent">&gt;_</span>
                    <span>shushant.dev</span>
                </Link>

                <ul className="hidden items-center gap-6 sm:flex">
                    {SECTIONS.map((s) => (
                        <li key={s.id}>
                            <a
                                href={onHome ? `#${s.id}` : `/#${s.id}`}
                                onClick={(e) => handleSectionClick(e, s.id)}
                                className="text-fg-muted transition-colors hover:text-fg"
                            >
                                {s.label}
                            </a>
                        </li>
                    ))}
                </ul>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={openCommandPalette}
                        aria-label="Open command palette"
                        className="flex h-11 min-w-11 items-center gap-1.5 rounded-md border border-border px-2.5 text-fg-muted transition-colors hover:border-fg-muted hover:text-fg"
                    >
                        <Search size={14} />
                        <kbd className="hidden text-[10px] sm:inline">⌘K</kbd>
                    </button>
                    <a
                        href={profile.resumeUrl}
                        download
                        className="hidden items-center gap-1.5 rounded-md bg-accent px-3 py-1.5 text-xs font-semibold text-bg transition-opacity hover:opacity-90 sm:flex"
                    >
                        <Download size={14} />
                        resume
                    </a>
                    <button
                        type="button"
                        aria-label={open ? 'Close menu' : 'Open menu'}
                        onClick={() => setOpen((v) => !v)}
                        className="flex h-11 w-11 items-center justify-center rounded-md text-fg sm:hidden"
                    >
                        {open ? <X size={18} /> : <Menu size={18} />}
                    </button>
                </div>
            </nav>

            {open && (
                <ul className="mono flex flex-col gap-1 border-t border-border/60 px-5 py-3 sm:hidden">
                    {SECTIONS.map((s) => (
                        <li key={s.id}>
                            <a
                                href={onHome ? `#${s.id}` : `/#${s.id}`}
                                onClick={(e) => {
                                    handleSectionClick(e, s.id);
                                    setOpen(false);
                                }}
                                className="block min-h-11 py-2.5 text-fg-muted"
                            >
                                {s.label}
                            </a>
                        </li>
                    ))}
                    <li>
                        <a
                            href={profile.resumeUrl}
                            download
                            className="mt-1 flex min-h-11 items-center gap-1.5 rounded-md bg-accent px-3 py-2.5 text-sm font-semibold text-bg w-fit"
                        >
                            <Download size={14} />
                            resume
                        </a>
                    </li>
                </ul>
            )}
        </header>
    );
};

export default Nav;
