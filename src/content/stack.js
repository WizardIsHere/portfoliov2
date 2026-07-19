// Mirrors how the systems I build are actually layered — not a flat tag cloud.
export const stackLayers = [
    {
        id: "edge",
        label: "frontend / edge",
        items: [
            { name: "React.js", note: "primary UI library across every project here" },
            { name: "Next.js", note: "App Router, SSR/SSG where it earns its keep" },
            { name: "TypeScript", note: "strict mode on anything shipped" },
            { name: "Angular", note: "used in earlier production work" },
        ],
    },
    {
        id: "api",
        label: "API layer",
        items: [
            { name: "Node.js", note: "" },
            { name: "NestJS", note: "structured APIs at OEM Insights scale" },
            { name: "Express.js", note: "" },
            { name: "REST APIs", note: "" },
        ],
    },
    {
        id: "data",
        label: "data stores",
        items: [
            { name: "PostgreSQL", note: "system of record" },
            { name: "MongoDB", note: "" },
            { name: "ClickHouse", note: "analytics workloads" },
        ],
    },
];

export const observabilityRail = {
    label: "observability",
    items: ["Grafana", "Elasticsearch", "Centralized Logging", "Dashboards"],
};

export const platformRail = {
    label: "CI/CD & platform",
    items: ["Docker", "Jenkins", "CI/CD Pipelines", "AWS (Lambda, S3)", "Secrets Management"],
};

export const toolsRow = {
    label: "tools & practices",
    items: ["Git", "GitHub", "JIRA", "System Design (Basics)"],
};
