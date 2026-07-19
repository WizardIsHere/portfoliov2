import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowUpRight, Github } from 'lucide-react';
import { getServiceById } from '#content/services.js';
import Nav from '#components/Nav.jsx';
import Footer from '#components/Footer.jsx';
import NotFound from './NotFound.jsx';

const STATUS_STYLE = {
    operational: { dot: 'bg-accent', text: 'text-accent', label: 'operational' },
    private: { dot: 'bg-warn', text: 'text-warn', label: 'private' },
};

const CaseStudy = () => {
    const { id } = useParams();
    const service = getServiceById(id);

    if (!service) return <NotFound />;

    const { caseStudy: cs } = service;
    const statusStyle = STATUS_STYLE[service.status] || STATUS_STYLE.operational;

    return (
        <>
            <Nav />
            <main className="mx-auto max-w-3xl px-5 py-12 sm:py-16">
                <Link to="/#services" className="mono -mx-2 -mt-2 mb-6 flex min-h-11 items-center gap-1.5 rounded-md px-2 text-sm text-fg-muted hover:text-fg">
                    <ArrowLeft size={14} />
                    back to services
                </Link>

                <div className="mono mb-3 flex items-center gap-2 text-[11px] uppercase tracking-wider">
                    <span className={`status-dot ${statusStyle.dot}`} />
                    <span className={statusStyle.text}>{statusStyle.label}</span>
                </div>

                <h1 className="mono text-3xl font-bold text-fg sm:text-4xl">{service.name}</h1>
                <p className="mt-3 text-lg leading-relaxed text-fg-muted">{cs.summary}</p>

                <div className="mono mt-5 flex flex-wrap gap-1.5 text-[11px] text-fg-muted">
                    {service.stack.map((s) => (
                        <span key={s} className="rounded border border-border/80 px-1.5 py-0.5">
                            {s}
                        </span>
                    ))}
                </div>

                <div className="mono -mx-2 mt-5 flex flex-wrap items-center gap-1 text-sm">
                    {service.live && (
                        <a href={service.live} target="_blank" rel="noopener noreferrer" className="flex min-h-11 items-center gap-1 rounded-md px-2 text-accent hover:underline">
                            live demo <ArrowUpRight size={14} />
                        </a>
                    )}
                    {service.source && (
                        <a href={service.source} target="_blank" rel="noopener noreferrer" className="flex min-h-11 items-center gap-1 rounded-md px-2 text-fg-muted hover:text-fg">
                            <Github size={14} />
                            source
                        </a>
                    )}
                </div>

                <hr className="my-10 border-border/60" />

                <section className="mb-10">
                    <h2 className="mono mb-3 text-xs uppercase tracking-wider text-accent">problem</h2>
                    <p className="leading-relaxed text-fg-muted">{cs.problem}</p>
                </section>

                <section className="mb-10">
                    <h2 className="mono mb-3 text-xs uppercase tracking-wider text-accent">architecture</h2>
                    <ul className="space-y-2">
                        {cs.architecture.map((line, i) => (
                            <li key={i} className="flex gap-2 leading-relaxed text-fg-muted">
                                <span className="mono shrink-0 text-accent">▸</span>
                                <span>{line}</span>
                            </li>
                        ))}
                    </ul>
                </section>

                <section className="mb-10">
                    <h2 className="mono mb-4 text-xs uppercase tracking-wider text-accent">decisions &amp; tradeoffs</h2>
                    <div className="space-y-5">
                        {cs.decisions.map((d) => (
                            <div key={d.title} className="rounded-lg border border-border bg-surface/50 p-4">
                                <p className="mb-1.5 font-semibold text-fg">{d.title}</p>
                                <p className="text-[15px] leading-relaxed text-fg-muted">{d.body}</p>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="mb-10">
                    <h2 className="mono mb-3 text-xs uppercase tracking-wider text-accent">stack &amp; why</h2>
                    <ul className="space-y-2">
                        {cs.stackWhy.map((line, i) => (
                            <li key={i} className="flex gap-2 leading-relaxed text-fg-muted">
                                <span className="mono shrink-0 text-accent">▸</span>
                                <span>{line}</span>
                            </li>
                        ))}
                    </ul>
                </section>

                <section className="rounded-lg border border-accent/30 bg-accent/5 p-5">
                    <h2 className="mono mb-2 text-xs uppercase tracking-wider text-accent">outcome</h2>
                    <p className="leading-relaxed text-fg">{cs.outcome}</p>
                </section>
            </main>
            <Footer />
        </>
    );
};

export default CaseStudy;
