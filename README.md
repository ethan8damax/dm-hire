# DM Hire

High-fidelity interactive ATS prototype for Doeren Mayhew (DM), built to demo alongside DM's existing payroll product (DM Payroll). **No backend — everything is mocked** in `src/data/`. This is a sales/demo prototype, not a production app: every screen should feel real and be populated with realistic data, but there's no auth, no API, no database.

Live: https://dm-hire.vercel.app

## Start here

1. Read `docs/superpowers/specs/2026-07-02-dm-hire-design.md` — **this is the source of truth** for what DM Hire is, who it's for, and what every screen should do. It contains the full product spec, the sprint-by-sprint build plan, and a **Work Log** at the bottom with a dated entry per completed sprint explaining what was actually built and any non-obvious decisions made along the way. Read the relevant sprint's log entry before touching that screen.
2. Check the Work Log's most recent entry to see what sprint is current and what's next.
3. `npm install && npm run dev`, click around.

## Stack

- **React 19 + Vite**, **React Router v7** for routing (every screen has its own URL)
- **Lucide** for icons
- Plain CSS with custom properties — no Tailwind, no CSS-in-JS, no component library. Design tokens live in `src/styles/tokens.css`; shared page chrome (`.page-header`, `.page-title`, `.filter-strip`, etc.) lives in `src/styles/global.css`
- `recharts` is an installed dependency but **not currently used** — the one chart component so far (`TrendChart`) was hand-built in plain SVG per the project's `dataviz` skill guidance. Worth revisiting before adding another chart type.
- `oxlint` for linting (`npm run lint`)

## Commands

```bash
npm install
npm run dev       # local dev server
npm run lint      # oxlint
npm run build     # production build to dist/
npm run preview   # preview the production build locally
```

There is no test suite — verification for each sprint has been `npm run lint` + `npm run build` (clean compile) plus manual code trace. **There is currently no working browser-automation tool in this environment** (the Playwright MCP server is configured but the `chrome` channel it wants isn't installed, and the fallback install needs interactive `sudo`), so nothing shipped so far has actually been eyeballed running in a browser by the agent building it — a manual click-through of anything you touch is worth doing before you trust it.

## Project layout

```
src/
  views/            One file per screen (Dashboard.jsx, Pipeline.jsx, CandidateProfile.jsx, Offers.jsx, Reports.jsx, ...),
                     each with a co-located .css file of the same name. Views are intentionally
                     large single files rather than split into many subcomponents — established
                     from JobRequisitions.jsx onward, see the spec's Section 5 file tree.
  components/
    ui/              Shared, generic UI primitives (Button, Badge, Card, DataTable, Modal, MetricCard,
                     FilterChip, Timeline, EmptyState, PipelineFunnel, TrendChart, ...). Each is a small
                     .jsx + co-located .css pair. If you need a new visual pattern, check here first —
                     most screens are built almost entirely out of these plus page-specific CSS.
    layout/          AppShell, Sidebar, Topbar — the persistent chrome around every routed view.
  data/              All mock data (candidates.js, jobs.js, offers.js, analytics.js, offices.js).
                     This is the only "database." Views import directly from here; some (JobRequisitions,
                     CandidateProfile's offer state) lift the imported array into local component state
                     so the demo can simulate creating/editing records without persisting anything.
  context/           PersonaContext (recruiter/hiring-manager/candidate view switcher) and TourContext
                     (guided demo tour) — both scaffolded, not fully wired yet (Sprint 8/9).
  styles/            tokens.css (design tokens) + global.css (shared page chrome, reused across views).
App.jsx              All routes declared here. `/test` is a dev-only route (Sprint 0b) rendering every
                     ui/ component variant — must be removed before the Sprint 10 final pass.
```

## Conventions worth knowing before you write code here

- **Mock data is derived, not duplicated, wherever possible.** e.g. Candidate Profile's Docs tab statuses and Timeline steps are computed from `candidate.stage` + existing arrays rather than hand-authored per candidate; the e-sig audit trail on an offer is computed from a few date fields rather than a separately stored log. Look for an existing derivation before adding a new stored field.
- **`TODAY` is a hardcoded constant** (currently `'2026-07-07'`) defined near the top of whichever view needs "now" (e.g. `CandidateProfile.jsx`, `Offers.jsx`) — there's no real clock dependency, so date-relative demo logic (expiry countdowns, "days in stage") stays deterministic. If you add a new date-relative feature, reuse the pattern rather than calling `new Date()` directly.
- **Simulated async actions** (sending an offer for approval, scheduling an interview, signing an offer) use a two-phase local-state pattern: `idle → sending/simulating → idle`, with a `setTimeout` in the 700–1400ms range and a spinner, no real network call. Search for `phase === 'sending'` for examples before inventing a new loading pattern.
- **Page chrome is shared, not repeated.** `.page-header` / `.page-title` / `.page-subtitle` / `.filter-strip` in `global.css` are used by nearly every view. A CSS class used identically in 3+ views should move to `global.css` rather than being redefined per view.
- **Before building any chart/graph**, read the `dataviz` skill (if using Claude Code — it's installed as a project skill) or at minimum match `TrendChart.jsx`'s existing pattern: form before color, single-hue for a single series, hover crosshair + tooltip, and never let a trend's color imply "up is good" without checking — a decreasing metric can be the good direction (see the Reports sprint's Work Log entry for a bug that was caught here).
- **Router `state` carries context between routes**, not query params, for anything richer than an ID — e.g. `Pipeline.jsx` passes the currently filtered/sorted candidate-id list so Prev/Next on Candidate Profile respects the board's filters; `Offers.jsx` passes `{ tab: 'offer' }` so linking into a candidate's profile opens straight to the Offer tab.
- **Every sprint ends with a Work Log entry** in the spec doc — a paragraph of what was built, what was reused vs. added, and any non-obvious decisions or bugs caught. Read the entry for a screen before changing it; write one when you finish a sprint.
- **Commit convention:** one commit per completed sprint, message format `Sprint N: <title>` (see `git log`).

## Deployment

Vercel project `dm-hire` (scope `ethan8damaxs-projects`), GitHub-connected to the private `ethan8damax/dm-hire` repo — every push to `main` auto-deploys. `vercel.json` has the SPA rewrite rule so client-side routes survive a hard refresh; if you add a new route, no config change is needed.
