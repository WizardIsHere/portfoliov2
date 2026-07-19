export const profile = {
    name: "Shushant M",
    role: "Full-stack software developer",
    tagline: "fintech platforms · analytics dashboards · observability tooling",
    location: "Bangalore, KA",
    openTo: "senior frontend / full-stack roles",
    email: "mshushant236@gmail.com",
    phone: "+91 ••••••••78",
    github: "https://github.com/WizardIsHere",
    githubUser: "WizardIsHere",
    linkedin: "https://linkedin.com/in/m-shushant",
    website: "shushant.dev",
    resumeUrl: "/resume.pdf",
};

// Real, verifiable numbers only — never invent a metric (see plan §11).
// `to`/`suffix` (rather than a pre-formatted string) so NumberTick can count up
// to the actual numeric value instead of animating a string.
export const kpis = [
    {
        // Computed at render time from this date (see KpiStrip.jsx), not a
        // static number — so it never needs another manual correction.
        since: "2023-01-01",
        suffix: "+",
        unit: "yrs",
        label: "production fintech",
        detail: "Shipping LEAP (vehicle finance) and OEM Insights in production since early 2023.",
    },
    {
        to: 80,
        suffix: "K+",
        unit: "rows",
        label: "records / API @ OEM Insights",
        detail: "NestJS APIs processing 80K+ records to power real-time OEM partner dashboards.",
    },
    {
        to: 6,
        suffix: "",
        unit: "",
        label: "services monitored daily",
        detail: "Grafana + ClickHouse dashboards covering API health, system usage, and DB performance.",
    },
    {
        live: true,
        suffix: "",
        unit: "",
        label: "public repos (GitHub API)",
        detail: "Pulled live from the GitHub API below — not a static number.",
    },
];
