import React from 'react';

const Footer = () => (
    <footer className="border-t border-border/60">
        <div className="mono mx-auto flex max-w-5xl flex-col items-center gap-1 px-4 text-xs text-fg-muted sm:flex-row sm:justify-between">
            <span>© {new Date().getFullYear()} · built by shushant</span>
            {/* Points at the profile until this repo is pushed — swap for the
                actual repo URL then (plan §5.7: "the site itself is a work sample"). */}
            <a
                href="https://github.com/WizardIsHere"
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-h-11 items-center px-2 hover:text-fg"
            >
                view source ↗
            </a>
        </div>
    </footer>
);

export default Footer;
