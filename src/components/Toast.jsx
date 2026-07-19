import React from 'react';
import { X } from 'lucide-react';
import useStatusStore from '#store/status.js';

// Single-slot toast, currently only used by the ⌘K palette's `sudo` easter egg
// (see CommandPalette.jsx / store/status.js) — deliberately minimal, not a
// general notification system, since nothing else in v2 needs one yet.
const Toast = () => {
    const toast = useStatusStore((s) => s.toast);
    const dismissToast = useStatusStore((s) => s.dismissToast);

    if (!toast) return null;

    return (
        <div className="fixed bottom-5 left-1/2 z-50 w-[calc(100%-2.5rem)] max-w-sm -translate-x-1/2 sm:left-auto sm:right-5 sm:translate-x-0">
            <div className="mono animate-toast-in flex items-start gap-3 rounded-lg border border-border bg-surface p-4 text-sm shadow-lg">
                <div className="min-w-0 flex-1">
                    <p className="font-semibold text-fg">{toast.title}</p>
                    <p className="mt-0.5 text-xs text-fg-muted">{toast.message}</p>
                </div>
                <button
                    type="button"
                    onClick={dismissToast}
                    aria-label="Dismiss"
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md text-fg-muted hover:text-fg"
                >
                    <X size={14} />
                </button>
            </div>
        </div>
    );
};

export default Toast;
