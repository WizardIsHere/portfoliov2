# shushant.dev v2 — "Live Ops Console"

A complete start-to-end plan for replacing the macOS-clone portfolio with something
modern, unique, and built to convert hirers.

---

## 1. Why replace v1

Honest read on the current macOS/iOS simulation:

- **It's a recognized template genre.** Hirers and senior engineers have seen many
  macOS-clone portfolios (it's a well-known tutorial project). Recognition kills the
  "wow" — the first impression becomes "tutorial follow-along," not "original work."
- **It hides the goods.** Your projects, skills, and resume sit behind fake OS chrome
  that requires exploration. A recruiter gives a portfolio ~30 seconds; v1 spends
  those seconds on a boot screen and a wallpaper.
- **The metaphor isn't *yours*.** Anyone can clone macOS. Nothing about it says
  "Shushant, the developer who builds finance platforms, analytics dashboards, and
  observability tooling."
- **What DID work in v1:** the Monitor app (live sparklines + real GitHub deploy log)
  was the single most distinctive screen — visitors' attention went there. That's the
  signal: **your identity is the ops/observability engineer.** v2 makes that the whole
  site instead of one hidden window.

## 2. The concept

**Your portfolio styled as a production observability console — because that's your
actual job.** You build LEAP (vehicle finance), OEM Insights (analytics on 80K+
records), Grafana/ClickHouse performance dashboards, CI/CD pipelines. So the site
presents *you* as a production system:

- Header reads like a status page: `shushant.dev ▸ all systems operational`
- Projects are **services** with stack, status, metrics, and case-study drill-downs
- Experience is a **changelog/deploy history** (`v2024.01 — joined Cholamandalam…`)
- Skills are a **stack map** grouped the way infra actually groups (frontend edge →
  API layer → data stores → observability)
- Live widgets pull **real data**: GitHub commits/repos (already proven in v1 code),
  uptime counter, latest push timestamp

Why this wins:
- **Unique but honest.** Terminal-y portfolios exist; a *tastefully designed
  observability console* is rare — and for you it's not a costume, it's the résumé.
- **Hirer-first.** Everything is on one scrollable page — name, role, proof, projects,
  contact — no exploration required. The theme is seasoning, not a lock.
- **Conversation bait.** Every widget invites an interview question you *want*:
  "Is that data real?" → "Yes, here's how I wired the GitHub events API…"

## 3. Audiences & success criteria

| Audience | Behavior | Must get within… |
|---|---|---|
| Recruiter | Skims, forwards, downloads resume | 10s: name, role, seniority signal. 30s: 2 projects + resume button |
| Hiring engineer | Reads a case study, checks GitHub, views source | 2min: one deep case study, live-data credibility, clean code if they inspect |
| You | Maintains it | Adding a project = editing one data file |

Success = resume downloads + outbound clicks (GitHub/LinkedIn) + "saw your portfolio"
mentions in interviews.

## 4. Design system

Grounded in the ui-ux-pro-max db (query: *developer observability dashboard dark
technical premium*, variance 6 / motion 5 / density 7).

### Color tokens (dark-primary; no light mode at launch — matches the genre)

```css
--bg:          #0F172A;  /* deep slate — avoid pure #000 (OLED smear) */
--surface:     #1E293B;  /* cards / panels */
--muted:       #272F42;  /* inset panels, code blocks */
--border:      #475569;  /* 1px hairlines */
--fg:          #F8FAFC;  /* primary text */
--fg-muted:    #94A3B8;  /* secondary text — keep ≥4.5:1 on --bg */
--accent:      #22C55E;  /* "operational" green — status, CTAs, sparklines */
--warn:        #F59E0B;  /* "degraded" — used sparingly for personality */
--destructive: #EF4444;  /* errors/easter eggs only */
```

Rule: **green means status/action, nothing else.** One accent, used with discipline,
is what makes consoles look expensive instead of gamer-y.

### Typography (db pairing: "Developer Mono")

- **JetBrains Mono** — headings, metrics, statuses, code, nav. The identity font.
- **IBM Plex Sans** — body/case-study prose. Recruiters read paragraphs; mono body
  text at length is hostile.
- Base 16px, line-height 1.5 prose / 1.2 data rows. Tabular numerals everywhere
  numbers appear.

### Surfaces & effects

- Flat dark surfaces + 1px borders; **no glassmorphism** (that was v1's language).
- One ambient signature: a slow-drifting radial glow behind the hero (reuse v1's
  ambient-drift know-how), and a subtle scanline/grid texture at ~3% opacity.
- Elevation via border brightness, not shadows.

### Motion (db preset: Stagger List, Standard tier)

```js
gsap.from('.grid-item', { opacity: 0, scale: 0.92, y: 16, duration: 0.4,
  stagger: { each: 0.06, from: 'start', grid: 'auto' }, ease: 'back.out(1.4)' });
```

- Section reveals on scroll (IntersectionObserver + the stagger above).
- Live numbers tick with 300ms transitions (v1 Monitor already does this — port it).
- Boot moment: ONE fast typed line in the hero (`$ whoami → shushant`), ≤1.5s,
  skipped entirely under `prefers-reduced-motion`. No full-screen boot gate like v1.

## 5. Information architecture — top to bottom

Single scrolling page + per-project case-study pages. Sticky mono nav:
`~/home  ~/services  ~/stack  ~/changelog  ~/contact  [resume ⬇]`.

### 5.1 Hero — "status header"
- Left: `● OPERATIONAL` pulse dot, then **Shushant M** (Plex, large), one line in
  mono: `full-stack engineer — fintech platforms · analytics · observability`,
  location + `open to: senior frontend / full-stack roles`.
- Right: compact **live tile**: `uptime`, `last deploy: <real latest GitHub push>`,
  `commits (30d): <n>`.
- CTAs: `[Download resume]` (accent) + `[GitHub]` `[LinkedIn]` (ghost). All above
  the fold at 375px.

### 5.2 KPI strip
Four mono stat tiles (real, not vanity): `2+ yrs production fintech` ·
`80K+ records/API @ OEM Insights` · `<n> public repos (live)` · `6 services
monitored daily` — each with a one-line tooltip explaining the number. Never fake a
metric; a caught-fake here costs all credibility.

### 5.3 Services (projects) — the core section
Grid of **service cards** (Portfolio Grid pattern from db). Each card:

```
● operational   shortlistai
AI car-buying advisor — scoring engine + Gemini explanations
stack: Next.js · TS · Gemini        [case study] [live] [source]
```

Order: **ShortlistAI first** (most impressive: deterministic scoring + LLM division
of labor), Nile, Admin Dashboard, + LEAP/OEM Insights as `internal — case study
only` (status: `private`). 4–6 max, quality over count.

**Case-study pages** (the hirer-converter — this is what v1 completely lacked):
Problem → Constraints → Architecture (simple diagram) → Decisions & tradeoffs
("what I deliberately cut" — you already write this well in the ShortlistAI README)
→ Outcome → Stack. 400–600 words, one screenshot, honest.

### 5.4 Stack map (skills)
Not a tag cloud — an **architecture diagram of you**:
`[React/Next] → [Node/NestJS APIs] → [Postgres · Mongo · ClickHouse]` with a
horizontal `observability: Grafana · Elasticsearch · centralized logging` bus
underneath and a `CI/CD: Docker · Jenkins · AWS` rail. Communicates *system
thinking*, which a skills list never does. (SVG or CSS grid; hover = 1-line
"how I've used it".)

### 5.5 Changelog (experience + education)
Deploy-log timeline in mono, newest first:

```
2024.01 → current   Cholamandalam Investment & Finance — Software Developer
  + shipped SSO w/ enterprise IDPs across LEAP
  + built OEM Insights: NestJS APIs over 80K+ records, real-time dashboards
  + centralized perf monitoring (Grafana + ClickHouse)
2022.12 – 2023.09   Mahatma Gandhi University — Associate Developer (trainee)
```

### 5.6 Live activity
Reuse v1's proven GitHub integrations: recent-commits feed (events API) + repo list.
Optional contribution heatmap from the events data. Graceful fallback text when
rate-limited (v1 already handles this pattern).

### 5.7 Contact — "open a channel"
Mono block styled like a connection panel: email, GitHub, LinkedIn, location — all
real links (keep v1's `tel:`/`mailto:` discipline). Resume button repeated.
Footer: `© 2026 · built by shushant · view source ↗` — **link the repo; the site
itself is a work sample.**

### 5.8 Easter eggs (cheap, memorable, optional)
- `⌘K` command palette (port v1 Spotlight's logic, restyle as console command bar).
- Konami/`sudo` in the palette → status flips to `degraded` for 3s with a toast
  `incident resolved: hired`.

## 6. Live data sources

| Widget | Source | Fallback |
|---|---|---|
| Last deploy / commits | GitHub events API (unauth, proven in v1) | static "recently" |
| Repo list | GitHub repos API (proven in v1) | curated static list |
| Uptime | client counter since page load (labeled "session") | — |
| Repo stars | included in repos payload | hide |

No backend. No keys. Everything degrades to static content.

## 7. Tech stack & repo strategy

- **Keep: Vite + React + Tailwind v4 + GSAP + zustand.** The stack was never the
  problem; rebuilding on Next.js adds migration cost for one page's SEO. Mitigate
  SEO the v1 way (meta/OG + sr-only content + prerendered static build) — already
  half-done.
- **Fresh repo** (`portfolio-v2`) or orphan branch — don't mutate v1 in place; it
  stays deployable while v2 is built, and its history stays clean as a work sample.
- Salvage list (copy, don't import): Monitor's sparkline + `useMetric` walk logic,
  GitHub fetch patterns (Safari + Monitor), Spotlight's index/keyboard logic,
  reduced-motion patterns, meta/SEO block, resume PDF + viewer, project
  screenshots, contact data.
- Content as data: `src/content/{services,changelog,stack}.ts` — adding a project
  = one object + one MD case study.

## 8. Build phases (each ends verified in-browser at 375px and 1440px)

**Phase 0 — Scaffold (½ day)**
Vite app, tokens as CSS variables, fonts, Tailwind theme, layout shell + sticky nav.
✓ Accept: deployed skeleton at a preview URL, Lighthouse ≥95 perf.

**Phase 1 — Hero + KPI strip (1 day)**
Status header, typed line (reduced-motion safe), live tile w/ GitHub fetch + fallback,
resume CTA. ✓ Accept: everything meaningful above the fold on iPhone 13; LCP <1.5s.

**Phase 2 — Services grid + case-study route (1–2 days)**
Cards from data file; one route template; **write ShortlistAI case study first.**
✓ Accept: recruiter path Home→Case study→Resume in ≤3 clicks; stagger reveal works.

**Phase 3 — Stack map + changelog (1 day)**
✓ Accept: readable at 375px (stack map stacks vertically), tooltips keyboard-reachable.

**Phase 4 — Live activity + contact (½ day)**
✓ Accept: unplugged network → page still looks complete (fallbacks render).

**Phase 5 — Polish pass (1 day)**
Ambient glow, number-tick animations, ⌘K palette, easter egg, OG image, favicon
(`▸_` mono glyph), 404 page styled as `404 — service not found`.
✓ Accept: full pre-delivery checklist below.

**Phase 6 — Content + launch (½ day)**
Remaining case studies, resume freshness, deploy to shushant.dev, add `view source`
link, submit to Google.

## 9. Guardrails (from skill priority table — checked every phase)

- **A11y:** all text ≥4.5:1 on its surface (compute, don't eyeball — v1 lesson);
  focus-visible rings on everything interactive; semantic headings h1→h3; status
  dots always paired with text (never color-only).
- **Touch:** ≥44px targets, ≥8px gaps (v1 lesson: pad the small mono links).
- **Perf:** WebP screenshots, lazy-load below-fold images, reserve space for live
  widgets (no CLS when data arrives), font `display=swap` + preload the two families.
- **Motion:** 150–450ms only; everything decorative gated on `prefers-reduced-motion`
  (v1 already established the pattern — port it).
- **Responsive:** 375 / 768 / 1024 / 1440 checked per phase; no horizontal scroll
  anywhere (v1 lesson).
- **No emoji as icons** — Lucide only, mono-weight strokes.

## 10. Content checklist (write before Phase 6, not after)

- [ ] ShortlistAI case study (adapt its README — the "what I cut" section is gold)
- [ ] OEM Insights / LEAP case study (internal-safe numbers only)
- [ ] Nile + Admin Dashboard short write-ups
- [ ] Resume PDF current + one-line "updated 2026-07"
- [ ] OG image: dark console card with `● operational — shushant.dev`
- [ ] 3 KPI numbers verified true
- [ ] Alt text for every screenshot

## 11. Kill criteria / honesty check

Before launch, show the site to one non-engineer for 15 seconds. If they can't answer
"who is this and what do they do?" — the theme has overtaken the content; strip
chrome until they can. The console is decoration on a résumé, never the reverse.
