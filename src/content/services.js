// Each service is a real project. `status` is honest: "operational" means a
// live public demo exists; "private" means it's real production work you can
// only read about (never fake a live link for something that isn't public).
export const services = [
    {
        id: "shortlistai",
        name: "shortlistai",
        status: "operational",
        pitch: "AI-guided car-buying advisor — scoring engine + LLM explanations for the Indian market.",
        stack: ["Next.js", "TypeScript", "Tailwind", "Gemini API"],
        live: "https://shortlistai-lac.vercel.app/",
        source: null,
        image: "/images/shortlistai.png",
        featured: true,
        caseStudy: {
            summary:
                "A confused car buyer answers 6 quick questions and gets a shortlist of 5 cars in under 3 minutes — each with an AI-written fit explanation, an honest \"devil's advocate\" gotcha, and a real 3-year cost-of-ownership breakdown instead of just a spec sheet.",
            problem:
                "Car-shopping sites dump specs and let you drown. The interesting problem wasn't \"call an LLM\" — it was deciding which parts of the decision are deterministic and which need judgment, and never letting the LLM own a decision a formula can make more reliably.",
            architecture: [
                "/ — landing page.",
                "/quiz — 6-question form: budget slider, use-case, body type, seats, fuel, free-text notes.",
                "/results — a weighted scoring engine (price/body/seats/fuel/safety) ranks the top 8 of a 72-car dataset. Gemini picks and explains the best 5 of those 8. lib/tco.ts computes real EMI/fuel/insurance/maintenance costs per car.",
                "/compare — side-by-side spec table with winning cells highlighted, plus a Gemini verdict for 2–3 shortlisted cars.",
            ],
            decisions: [
                {
                    title: "Scoring and the LLM do different jobs — on purpose",
                    body:
                        "Weighted scoring is deterministic and auditable: you can always explain why a car ranked where it did. Gemini's job is strictly narrower — pick the best 5 of the pre-scored 8 and explain human tradeoffs (comfort, \"what owners complain about\") that a formula can't capture. If Gemini is down, the app still works and just shows ranked results without prose.",
                },
                {
                    title: "No database",
                    body: "72 cars is a static typed array generated once from the provided CSV. A query layer would have been pure overhead.",
                },
                {
                    title: "No accounts, no cross-session history",
                    body: "One quiz → one session in localStorage for 24h. There was no requirement to remember past sessions, so it wasn't built.",
                },
                {
                    title: "A defensive empty-state I built, then deleted",
                    body:
                        "I initially worried the scoring engine could return fewer than 5 cars for an impossible budget/fuel/seat combo. It structurally can't — every car gets a partial-credit score, so rankTop8 always returns 8. Once testing proved that, the unreachable UI came out. Building for a state that can't occur is wasted work.",
                },
                {
                    title: "Tests explicitly out of scope for the time box",
                    body: "Leaned on tsc --noEmit, eslint, a full next build, and Playwright-scripted manual passes instead.",
                },
            ],
            stackWhy: [
                "Next.js 14 App Router, TypeScript strict — thin Route Handlers for the two API calls, everything else static/client.",
                "Gemini gemini-2.5-flash, server-side only — two narrow single-purpose calls (generateShortlist, generateComparison), each forced to JSON output and defensively parsed.",
                "Static JSON-as-TypeScript, no ORM — the dataset is 72 rows; a database would be pure overhead.",
            ],
            outcome:
                "A working, deployed advisor that survives its own edge cases (LLM down, impossible query combos) without the UI lying about what it can do.",
        },
    },
    {
        id: "negative-area-geocoding",
        name: "Negative Area Geocoding API",
        status: "private",
        pitch: "Geospatial risk-intelligence microservice — flags addresses inside underwriting negative areas in milliseconds.",
        stack: ["Node.js", "MongoDB", "ClickHouse", "Turf.js", "Google Maps API"],
        live: null,
        source: null,
        featured: true,
        caseStudy: {
            summary:
                "A production Node.js/Express API that fuses Google Maps geocoding with a custom in-memory geospatial index to flag addresses falling inside loan/delivery underwriting \"negative areas\" — zones a lender or vendor wants to avoid — for real-time decisions in Tamil Nadu, India.",
            problem:
                "Underwriting and delivery decisions need to know, in milliseconds, whether an address falls inside a zone the business wants to avoid. Google's own geocoding accuracy tiers don't settle that on their own — an \"APPROXIMATE\" result needs a second, independent signal before a decision can trust it.",
            architecture: [
                "Assembles polygons from raw MongoDB corner-point documents via Turf.js at load time, precomputing per-polygon pincode sets so a lookup is O(1) instead of a database re-scan on every request.",
                "Point-in-polygon + viewport-overlap dual detection: a hard match means the coordinate is inside the zone; a soft match means only Google's uncertainty viewport overlaps it — kept as two distinct signals.",
                "Multi-signal confidence scoring cross-validates Google's returned pincode against polygon membership and 10km-radius neighbors, classifying each geocode as High/Low/Reject.",
                "Every vendor (Google) call is logged to MongoDB and ClickHouse in parallel via Promise.allSettled — a durable compliance trail that never blocks the response.",
                "/polygons-invalidate reloads the entire spatial index from MongoDB with zero restart, so ops can push new negative-area boundaries live.",
            ],
            decisions: [
                {
                    title: "Precompute pincode sets instead of querying per request",
                    body: "Polygons are assembled from raw MongoDB corner points via Turf.js once at load (and on invalidation), with each polygon's pincode set precomputed — turning a per-request DB scan into an O(1) in-memory lookup.",
                },
                {
                    title: "Two match types, not one boolean",
                    body: "A coordinate landing inside a zone (hard match) and Google's uncertainty viewport merely overlapping it (soft match) are different confidence levels. Collapsing them into a single yes/no would silently drop the partial-confidence cases that are often the ones worth flagging for review.",
                },
                {
                    title: "Confidence scoring turns \"APPROXIMATE\" into a decision",
                    body: "Google's accuracy tier isn't enough alone — cross-validating the returned pincode against polygon membership and 10km-radius neighbors reclassifies ambiguous results into High/Low/Reject, so downstream code branches on a real trust signal instead of guessing.",
                },
                {
                    title: "Dual-sink logging via Promise.allSettled, not sequential writes",
                    body: "Writing the same audit record to MongoDB and ClickHouse in parallel — tolerating either failing independently — means a slow analytics store never blocks or fails the request path, while still producing a durable compliance trail in both places.",
                },
                {
                    title: "Zero-downtime index reload over a redeploy",
                    body: "A dedicated /polygons-invalidate endpoint rebuilds the entire spatial index from MongoDB in place. Ops pushing new negative-area boundaries don't need a deploy or restart for it to take effect.",
                },
                {
                    title: "A self-mocking test harness instead of hitting Google in CI",
                    body: "A stub server mirrors Google's exact API shape and path, so the whole pipeline — geocoding, polygon matching, confidence scoring — runs and is tested offline, with zero external dependency or per-run API cost.",
                },
                {
                    title: "Skipped: auth/rate-limiting, vendor retry/backoff",
                    body: "Both are real gaps, left out deliberately because this runs as an internal service-to-service call today. They're the first things to add if this moves beyond that — not before, since building them now would be effort spent on a threat model that doesn't exist yet.",
                },
            ],
            stackWhy: [
                "Turf.js — computational geometry (point-in-polygon, viewport overlap, radius-neighbor checks) without hand-rolling geometry math.",
                "MongoDB — source of truth for raw polygon corner points and audit records.",
                "ClickHouse — the second audit sink, built for the query patterns compliance/analytics actually need over a high-volume log.",
                "Express — thin HTTP layer; the real logic lives in the spatial engine and scoring modules, not the framework.",
                "Google Maps Geocoding API — the vendor coordinate source being cross-validated, not trusted blindly.",
            ],
            outcome:
                "A geocode goes in and a trust-scored, audited zone decision comes out in milliseconds — in-memory polygon lookups instead of per-request DB scans, dual-sink writes so analytics never blocks the response path, and a live-reloadable zone index that needs no deploy to update.",
        },
    },
    {
        id: "oem-insights",
        name: "OEM Insights",
        status: "private",
        pitch: "Full-stack analytics dashboard for OEM partners — leads, disbursed amounts, and business KPIs over 80K+ records.",
        stack: ["React", "NestJS", "PostgreSQL", "Grafana"],
        live: null,
        source: null,
        featured: true,
        caseStudy: {
            summary:
                "Internal production dashboard at Cholamandalam Investment & Finance. NestJS APIs process 80K+ records to deliver real-time insights to OEM partners through a dynamic frontend with interactive charts and filters.",
            problem:
                "OEM partners needed visibility into leads, disbursed amounts, and business KPIs without waiting on manual reports — the existing process was spreadsheet exports on request.",
            architecture: [
                "NestJS APIs designed to process 80K+ records and serve real-time aggregate + row-level queries.",
                "React frontend with interactive charts and filters, built for partners to self-serve instead of requesting reports.",
                "Centralized performance monitoring layered on top with Grafana + ClickHouse — API health, system usage, and database performance in one place.",
            ],
            decisions: [
                {
                    title: "Real-time queries over batch reports",
                    body:
                        "Partners self-serve filtered views instead of waiting on exports, which meant the API layer had to be designed for query performance at 80K+ rows from day one, not retrofitted later.",
                },
                {
                    title: "Observability built alongside the feature, not after",
                    body:
                        "Grafana + ClickHouse dashboards for API health and DB performance shipped as part of the same effort — so regressions in a live partner-facing tool surface immediately instead of via a support ticket.",
                },
            ],
            stackWhy: [
                "NestJS — structured, testable API layer for a system that needed to grow past a single dashboard.",
                "PostgreSQL — the existing system of record; no case for a migration.",
                "Grafana + ClickHouse — purpose-built for the monitoring layer rather than building custom dashboards from scratch.",
            ],
            outcome:
                "A partner-facing analytics surface that replaced manual reporting, plus the monitoring to know when it's unhealthy before a partner does.",
        },
    },
    {
        id: "nile",
        name: "Nile",
        status: "operational",
        pitch: "Ecommerce storefront for audio devices — full shopping flow from listing to checkout.",
        stack: ["React", "Sanity CMS"],
        live: "https://chipper-seahorse-51781d.netlify.app/",
        source: "https://github.com/WizardIsHere/Nile",
        image: "/images/nile.png",
        featured: false,
        caseStudy: {
            summary: "A storefront for headphones, speakers, and earphones — product listings, a promo hero, a cart, and checkout.",
            problem: "Build a complete ecommerce flow with real product management, without hand-rolling a backend for content that changes often (product copy, images, pricing).",
            architecture: [
                "React storefront: promo hero, best-sellers grid, product detail, cart, checkout.",
                "Sanity as the headless CMS — product data is editable content, not hardcoded JSON.",
            ],
            decisions: [
                {
                    title: "Headless CMS over a custom admin panel",
                    body: "Sanity's Studio gives content editing for free — building a bespoke admin UI for a scoped ecommerce demo would have been effort spent on the wrong problem.",
                },
            ],
            stackWhy: ["React — component-driven storefront UI.", "Sanity — structured content without owning a CMS backend."],
            outcome: "A deployed, browsable storefront demonstrating a full commerce flow backed by real content management.",
        },
    },
    {
        id: "admin-dashboard",
        name: "Admin Dashboard",
        status: "operational",
        pitch: "React Material admin panel — Kanban board, calendar, and data grids over revenue/orders KPIs.",
        stack: ["React", "Material UI", "Nivo"],
        live: "https://tiny-faloodeh-e6f0d7.netlify.app",
        source: "https://github.com/WizardIsHere/admin_dashboard_v_2",
        image: "/images/admin-dashboard.png",
        featured: false,
        caseStudy: {
            summary: "Back-office surface area in one place: revenue/orders overview, a Trello-style Kanban board, calendar scheduling, and sortable/filterable data grids.",
            problem: "Admin tooling is usually four separate half-built screens. This scopes the common back-office surfaces into one consistent shell.",
            architecture: [
                "Dashboard: revenue/orders/expenses/profit overview with Nivo charts.",
                "Kanban board, calendar, and DataGrid pages sharing one Material UI shell and navigation.",
            ],
            decisions: [
                {
                    title: "Material UI over a custom design system",
                    body: "Admin tooling rewards consistency and speed over visual novelty — MUI's data grid and layout primitives cover 90% of what an admin panel needs out of the box.",
                },
            ],
            stackWhy: ["React + Material UI — fast, consistent admin surfaces.", "Nivo — charting library matched to the data-density needs of a dashboard."],
            outcome: "A cohesive multi-page admin panel instead of four disconnected demos.",
        },
    },
];

export const getServiceById = (id) => services.find((s) => s.id === id);
