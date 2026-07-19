// Mirrors how the systems I build are actually layered — a request's real path
// from browser to datastore, then the rails that wrap around it. Every entry is
// a technology I've shipped with, pulled straight from the resume.
export const stackLayers = [
    {
        id: "edge",
        label: "frontend / edge",
        items: [
            { name: "React.js", note: "primary UI library across every project here" },
            { name: "Next.js", note: "App Router, SSR/SSG where it earns its keep" },
            { name: "TypeScript", note: "strict mode on anything shipped" },
            { name: "Angular", note: "used in earlier production work" },
            { name: "Context API", note: "app-wide state without reaching for Redux" },
            { name: "D3.js", note: "custom data viz beyond off-the-shelf charts" },
            { name: "Tailwind CSS", note: "utility-first styling — this site included" },
            { name: "Vite", note: "fast dev server + lean production bundles" },
            { name: "Bootstrap", note: "" },
            { name: "jQuery", note: "legacy surfaces still in production" },
            { name: "HTML / CSS", note: "" },
        ],
    },
    {
        id: "api",
        label: "API layer",
        items: [
            { name: "Node.js", note: "runtime behind every backend here" },
            { name: "NestJS", note: "structured APIs at OEM Insights scale" },
            { name: "Express.js", note: "thin HTTP layer where NestJS is overkill" },
            { name: "GraphQL", note: "typed query layer for client-shaped data" },
            { name: "Laravel", note: "PHP backend work" },
            { name: "REST APIs", note: "the default contract between services" },
        ],
    },
    {
        id: "data",
        label: "data stores",
        items: [
            { name: "MongoDB", note: "document store for flexible schemas" },
            { name: "MySQL", note: "relational system of record" },
            { name: "PostgreSQL", note: "relational + geospatial workloads" },
            { name: "DynamoDB", note: "serverless key-value on AWS" },
            { name: "ClickHouse", note: "columnar store for analytics at volume" },
        ],
    },
];

export const railGroups = [
    {
        id: "cloud",
        label: "cloud & devops",
        items: ["AWS S3", "AWS Lambda", "IAM", "CloudWatch", "Docker", "Jenkins", "CI/CD"],
    },
    {
        id: "observability",
        label: "observability",
        items: ["Grafana", "ClickHouse", "Elasticsearch", "Centralized Logging", "Dashboards"],
    },
    {
        id: "languages",
        label: "languages",
        items: ["JavaScript", "TypeScript", "Python"],
    },
    {
        id: "tools",
        label: "tools & practices",
        items: ["Git", "GitHub", "JIRA", "System Design"],
    },
];
