import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { profile } from '#content/profile.js';
import { services } from '#content/services.js';
import { stackLayers } from '#content/stack.js';
import useStatusStore from '#store/status.js';

const download = () => {
    const a = document.createElement('a');
    a.href = profile.resumeUrl;
    a.download = '';
    a.click();
};

const HELP_TEXT = [
    'available commands:',
    '  help              — show this list',
    '  whoami            — who you\'re talking to',
    '  stack             — technologies, by layer',
    '  services          — projects run as services',
    '  contact           — how to reach me',
    '  resume            — download the pdf',
    '  github, linkedin  — open my profiles',
    '  clear             — clear the screen',
];

const buildCommands = ({ navigate, triggerEasterEgg, triggerMatrix, print, clear }) => ({
    help: () => print(HELP_TEXT),
    whoami: () => print([`${profile.name} — ${profile.role}`, profile.tagline, `${profile.location} · open to: ${profile.openTo}`]),
    stack: () =>
        print(stackLayers.flatMap((l) => [`${l.label}:`, `  ${l.items.map((i) => i.name).join(', ')}`])),
    services: () =>
        print(services.map((s) => `${s.name.padEnd(24)} ${s.status.padEnd(12)} ${s.live ? s.live : 'write-up only'}`)),
    projects: () => buildCommands({ navigate, triggerEasterEgg, triggerMatrix, print, clear }).services(),
    contact: () => print([`email    ${profile.email}`, `github   ${profile.github}`, `linkedin ${profile.linkedin}`]),
    resume: () => {
        download();
        print(['downloading resume.pdf…']);
    },
    github: () => {
        window.open(profile.github, '_blank', 'noopener,noreferrer');
        print(['opening github…']);
    },
    linkedin: () => {
        window.open(profile.linkedin, '_blank', 'noopener,noreferrer');
        print(['opening linkedin…']);
    },
    clear: () => clear(),
    matrix: () => {
        triggerMatrix();
        print(['wake up…']);
    },
    sudo: (rest) => {
        if (rest.trim() === 'hire-me' || rest.trim() === '') {
            triggerEasterEgg();
            print(['permission granted.']);
        } else {
            print([`sudo: ${rest}: command not found`]);
        }
    },
});

// A real, typeable terminal — opened via the backtick key or by clicking the
// Hero's command log. Not a gimmick layered on top of the terminal aesthetic;
// it's the one thing the rest of the site only pretends to be.
const Terminal = () => {
    const [open, setOpen] = useState(false);
    const [lines, setLines] = useState([{ type: 'output', text: 'type "help" to see what this does.' }]);
    const [input, setInput] = useState('');
    const [history, setHistory] = useState([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const inputRef = useRef(null);
    const scrollRef = useRef(null);
    const navigate = useNavigate();
    const triggerEasterEgg = useStatusStore((s) => s.triggerEasterEgg);
    const triggerMatrix = useStatusStore((s) => s.triggerMatrix);

    const print = (textOrLines) => {
        const arr = Array.isArray(textOrLines) ? textOrLines : [textOrLines];
        setLines((prev) => [...prev, ...arr.map((text) => ({ type: 'output', text }))]);
    };
    const clear = () => setLines([]);

    useEffect(() => {
        const openTerminal = () => setOpen(true);
        const handleKeydown = (e) => {
            const tag = document.activeElement?.tagName;
            const typing = tag === 'INPUT' || tag === 'TEXTAREA';
            if (e.key === '`' && !typing) {
                e.preventDefault();
                setOpen((v) => !v);
                return;
            }
            if (e.key === 'Escape') setOpen(false);
        };
        window.addEventListener('open-terminal', openTerminal);
        window.addEventListener('keydown', handleKeydown);
        return () => {
            window.removeEventListener('open-terminal', openTerminal);
            window.removeEventListener('keydown', handleKeydown);
        };
    }, []);

    useEffect(() => {
        if (open) requestAnimationFrame(() => inputRef.current?.focus());
    }, [open]);

    useEffect(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, [lines, open]);

    const runCommand = (raw) => {
        const trimmed = raw.trim();
        setLines((prev) => [...prev, { type: 'input', text: raw }]);
        if (!trimmed) return;

        setHistory((prev) => [...prev, raw]);
        setHistoryIndex(-1);

        const [cmd, ...rest] = trimmed.split(' ');
        const commands = buildCommands({ navigate, triggerEasterEgg, triggerMatrix, print, clear });
        const handler = commands[cmd.toLowerCase()];

        if (handler) handler(rest.join(' '));
        else print([`command not found: ${cmd} — type "help"`]);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            runCommand(input);
            setInput('');
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (!history.length) return;
            const nextIndex = historyIndex === -1 ? history.length - 1 : Math.max(historyIndex - 1, 0);
            setHistoryIndex(nextIndex);
            setInput(history[nextIndex]);
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (historyIndex === -1) return;
            const nextIndex = historyIndex + 1;
            if (nextIndex >= history.length) {
                setHistoryIndex(-1);
                setInput('');
            } else {
                setHistoryIndex(nextIndex);
                setInput(history[nextIndex]);
            }
        }
    };

    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-[70] flex items-end justify-center bg-bg/70 px-4 pb-[10vh] backdrop-blur-sm sm:items-start sm:pb-0 sm:pt-[12vh]"
            onClick={() => setOpen(false)}
        >
            <div
                className="mono flex h-[70vh] w-full max-w-2xl flex-col overflow-hidden rounded-lg border border-border bg-surface shadow-2xl sm:h-[60vh]"
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-label="Interactive terminal"
            >
                <div className="flex items-center gap-1.5 border-b border-border px-4 py-2.5">
                    <span className="h-3 w-3 rounded-full bg-destructive/70" />
                    <span className="h-3 w-3 rounded-full bg-warn/70" />
                    <span className="h-3 w-3 rounded-full bg-accent/70" />
                    <span className="ml-2 text-xs text-fg-muted">shushant@dev: ~</span>
                    <kbd className="ml-auto rounded border border-border px-1.5 py-0.5 text-[10px] text-fg-muted">esc</kbd>
                </div>

                <div ref={scrollRef} className="flex-1 space-y-1 overflow-y-auto px-4 py-3 text-[13px] leading-relaxed">
                    {lines.map((line, i) =>
                        line.type === 'input' ? (
                            <p key={i} className="text-fg">
                                <span className="text-accent">$ </span>
                                {line.text}
                            </p>
                        ) : (
                            <p key={i} className="whitespace-pre-wrap text-fg-muted">
                                {line.text}
                            </p>
                        )
                    )}
                </div>

                <div className="flex items-center gap-2 border-t border-border px-4 py-2.5">
                    <span className="text-accent">$</span>
                    <input
                        ref={inputRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        spellCheck={false}
                        autoComplete="off"
                        placeholder="type a command…"
                        className="flex-1 bg-transparent text-sm text-fg outline-none placeholder:text-fg-muted"
                        aria-label="Terminal input"
                    />
                </div>
            </div>
        </div>
    );
};

export default Terminal;
