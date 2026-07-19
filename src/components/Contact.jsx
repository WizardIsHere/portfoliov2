import React from 'react';
import { Download, Github, Linkedin, Mail, MapPin, Phone } from 'lucide-react';
import { profile } from '#content/profile.js';

const ROWS = [
    { icon: Mail, label: 'email', value: (p) => p.email, href: (p) => `mailto:${p.email}` },
    { icon: Phone, label: 'mobile', value: (p) => p.phone, href: (p) => `tel:${p.phone.replace(/\s/g, '')}` },
    { icon: Github, label: 'github', value: () => 'github.com/WizardIsHere', href: (p) => p.github },
    { icon: Linkedin, label: 'linkedin', value: (p) => p.linkedin.replace('https://', ''), href: (p) => p.linkedin },
    { icon: MapPin, label: 'location', value: (p) => p.location, href: null },
];

const Contact = () => (
    <section id="contact" className="py-16 sm:py-20">
        <div className="mx-auto max-w-5xl px-5">
            <h2 className="mono mb-1 text-xs uppercase tracking-wider text-accent">~/contact</h2>
            <p className="mb-8 max-w-xl text-fg-muted">Open a channel — every link below goes somewhere real.</p>

            <div className="grid min-w-0 gap-4 sm:grid-cols-[1.2fr_1fr]">
                {/* min-w-0 here matters: this is the CSS Grid *item*, and per the grid
                    auto-min-sizing spec its automatic minimum track width is based on
                    its own overflow (visible → max-content), not a descendant's
                    `truncate` three levels down. Without this, the value spans below
                    never actually get to clip and the row silently overflows the page. */}
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
                    className="mono flex min-h-14 items-center justify-center gap-2 rounded-lg bg-accent px-4 text-sm font-semibold text-bg transition-opacity hover:opacity-90 sm:min-h-full"
                >
                    <Download size={16} />
                    download resume (pdf)
                </a>
            </div>
        </div>
    </section>
);

export default Contact;
