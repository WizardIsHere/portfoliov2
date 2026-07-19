import React, { useState } from 'react';
import { Download, Github, Linkedin, Loader2, Mail, MapPin, Phone, Send } from 'lucide-react';
import { profile } from '#content/profile.js';

const ROWS = [
    { icon: Mail, label: 'email', value: (p) => p.email, href: (p) => `mailto:${p.email}` },
    { icon: Phone, label: 'mobile', value: (p) => p.phone, href: (p) => `tel:${p.phone.replace(/\s/g, '')}` },
    { icon: Github, label: 'github', value: () => 'github.com/WizardIsHere', href: (p) => p.github },
    { icon: Linkedin, label: 'linkedin', value: (p) => p.linkedin.replace('https://', ''), href: (p) => p.linkedin },
    { icon: MapPin, label: 'location', value: (p) => p.location, href: null },
];

const FORMSPREE_ID = import.meta.env.VITE_FORMSPREE_ID;

// Idle -> sending -> ok | error. Falls back to a plain mailto link when no
// Formspree ID is configured, so the form never silently pretends to work.
const ContactForm = () => {
    const [state, setState] = useState('idle');

    if (!FORMSPREE_ID) {
        return (
            <a
                href={`mailto:${profile.email}`}
                className="mono flex min-h-14 items-center justify-center gap-2 rounded-lg border border-dashed border-border px-4 text-sm text-fg-muted transition-colors hover:border-fg-muted hover:text-fg"
            >
                <Mail size={16} />
                form not configured — email directly
            </a>
        );
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setState('sending');
        const form = e.target;
        try {
            const res = await fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
                method: 'POST',
                headers: { Accept: 'application/json' },
                body: new FormData(form),
            });
            if (!res.ok) throw new Error('request failed');
            setState('ok');
            form.reset();
        } catch {
            setState('error');
        }
    };

    if (state === 'ok') {
        return (
            <div className="mono flex min-h-full flex-col items-center justify-center gap-2 rounded-lg border border-accent/40 bg-accent/10 p-6 text-center text-sm text-accent">
                <Send size={18} />
                message sent — I'll reply by email.
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="mono flex flex-col gap-3 rounded-lg border border-border bg-surface/50 p-4">
            <input
                type="text"
                name="name"
                required
                placeholder="name"
                className="min-h-11 rounded-md border border-border bg-bg px-3 text-sm text-fg placeholder:text-fg-muted focus-visible:outline-none"
            />
            <input
                type="email"
                name="email"
                required
                placeholder="email"
                className="min-h-11 rounded-md border border-border bg-bg px-3 text-sm text-fg placeholder:text-fg-muted focus-visible:outline-none"
            />
            <textarea
                name="message"
                required
                rows={3}
                placeholder="message"
                className="resize-none rounded-md border border-border bg-bg p-3 text-sm text-fg placeholder:text-fg-muted focus-visible:outline-none"
            />
            <button
                type="submit"
                disabled={state === 'sending'}
                className="flex min-h-11 items-center justify-center gap-2 rounded-md bg-accent px-4 text-sm font-semibold text-bg transition-opacity hover:opacity-90 disabled:opacity-60"
            >
                {state === 'sending' ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                {state === 'sending' ? 'sending…' : 'send message'}
            </button>
            {state === 'error' && <p className="text-xs text-destructive">Something went wrong — email me directly instead.</p>}
        </form>
    );
};

const Contact = () => (
    <section id="contact" className="py-16 sm:py-20">
        <div className="mx-auto max-w-5xl px-5">
            <h2 className="mono mb-1 text-xs uppercase tracking-wider text-accent">~/contact</h2>
            <p className="mb-8 max-w-xl text-fg-muted">Open a channel — every link below goes somewhere real.</p>

            <div className="grid min-w-0 gap-4 sm:grid-cols-2">
                {/* min-w-0 here matters: this is the CSS Grid *item*, and per the grid
                    auto-min-sizing spec its automatic minimum track width is based on
                    its own overflow (visible → max-content), not a descendant's
                    `truncate` three levels down. Without this, the value spans below
                    never actually get to clip and the row silently overflows the page. */}
                <div className="flex min-w-0 flex-col gap-4">
                    <div className="min-w-0 rounded-lg border border-border bg-surface/50 divide-y divide-border/60">
                        {ROWS.map((row) => {
                            const Icon = row.icon;
                            const { label, value, href } = row;
                            const Wrapper = href ? 'a' : 'div';
                            const link = href?.(profile);
                            const linkProps = link
                                ? { href: link, target: link.startsWith('http') ? '_blank' : undefined, rel: link.startsWith('http') ? 'noopener noreferrer' : undefined }
                                : {};

                            return (
                                <Wrapper key={label} {...linkProps} className="block transition-colors hover:bg-muted">
                                    <span className="mono flex min-h-14 min-w-0 items-center gap-3 px-4 text-sm">
                                        <Icon size={16} className="shrink-0 text-accent" />
                                        <span className="w-20 shrink-0 text-fg-muted">{label}</span>
                                        <span className="min-w-0 flex-1 truncate text-fg">{value(profile)}</span>
                                    </span>
                                </Wrapper>
                            );
                        })}
                    </div>

                    <a
                        href={profile.resumeUrl}
                        download
                        className="mono flex min-h-14 items-center justify-center gap-2 rounded-lg bg-accent px-4 text-sm font-semibold text-bg transition-opacity hover:opacity-90"
                    >
                        <Download size={16} />
                        download resume (pdf)
                    </a>
                </div>

                <ContactForm />
            </div>
        </div>
    </section>
);

export default Contact;
