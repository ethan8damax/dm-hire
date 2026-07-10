# DM Hire

High-fidelity interactive ATS prototype for Doeren Mayhew (DM), built to demo alongside DM's existing payroll product (DM Payroll). This is a sales/demo prototype, not a production app — no real auth, personas are switched client-side — but it has a **real backend**: every entity (jobs, candidates, offers, offices, integrations, etc.) lives in a real Supabase Postgres database, not a hardcoded JS array. Offer letters and WOTC consent forms use a real DocuSeal e-signature integration, not a simulated one.

Live: https://dm-hire.vercel.app

## Start here

1. `docs/superpowers/specs/` holds one dated design doc per feature/sub-project (not a single growing spec). `2026-07-02-dm-hire-design.md` is the original full product spec and sprint-by-sprint build plan, with a **Work Log** at the bottom covering Sprints 0–10 plus post-MVP work (design audit, DM corporate rebrand). Later work is split into its own smaller specs (`2026-07-08-supabase-data-layer-design.md`, `2026-07-08-interactivity-reminders-design.md`, `2026-07-09-requisitions-ux-design.md`) — check the directory listing for the most recent one before assuming the original spec is still current for a given screen.
2. `npm install && npm run dev`, click around. You'll need `.env.local` with `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` (ask Ethan) — nothing renders without a working Supabase connection.
3. Switch personas (Recruiter / Hiring Manager / Candidate) via the topbar to see role-scoped views, or visit `/careers` directly for the candidate-facing career site.

## Stack

- **React 19 + Vite**, **React Router v7** for routing (every screen has its own URL)
- **Supabase** (Postgres + Edge Functions) as the real backend — see "Backend" below
- **`@docuseal/react`** for embedded, real e-signature on offer letters and WOTC consent
- **Lucide** for icons
- Plain CSS with custom properties — no Tailwind, no CSS-in-JS, no component library. Design tokens live in `src/styles/tokens.css`; shared page chrome (`.page-header`, `.page-title`, `.filter-strip`, etc.) lives in `src/styles/global.css`
- `recharts` powers `TrendChart.jsx` (Reports' trend line); everything else chart-shaped (`PipelineFunnel`, sparklines) is hand-built SVG per the project's `dataviz` skill guidance
- `oxlint` for linting (`npm run lint`)

## Backend

Supabase project **`ATS`** (id `uvwsxzynbpmrbckmqhzy`, region us-east-1). Schema lives in `supabase/migrations/` (one file per change, applied in order — see any migration's filename prefix for sequence). No auth: every table has RLS enabled with an open `anon` policy (SELECT/INSERT/UPDATE). The app itself doesn't expose hard deletes anywhere — `jobs` has an `archived` boolean instead (see `JobRequisitions.jsx`'s Archive flow, which also moves that requisition's active applicants to Not Selected). This open-write posture is acceptable because all data is synthetic demo data; it would need real auth + scoped policies before ever touching real candidate data.

Each entity has a thin `src/hooks/use<Entity>.js` hook (`useJobs`, `useCandidates`, `useOffers`, ...) that fetches on mount and exposes mutation functions calling Supabase directly — no React Query, no global store, just Context + useState per the codebase's established pattern. `src/lib/supabaseClient.js` creates the client from the `.env.local` vars; `src/lib/caseConvert.js` handles snake_case (DB) ↔ camelCase (JS) conversion at the hook boundary.

`supabase/functions/docuseal-submission/` is a Supabase Edge Function that proxies DocuSeal's submissions API — it holds the `DOCUSEAL_API_KEY` secret server-side (`supabase secrets set`, never in `.env.local` or the client bundle) and returns an embed slug the client renders via `<DocusealForm>`.

## Commands

```bash
npm install
npm run dev       # local dev server
npm run lint      # oxlint
npm run build     # production build to dist/
npm run preview   # preview the production build locally
```

There is no automated test suite — verification is `npm run lint` + `npm run build` (clean compile) plus a manual click-through, and increasingly a Playwright MCP-driven browser check before anything ships (browser automation works in this environment now; it didn't for most of the project's early history — see the spec's Work Log if you're curious about that transition).

## Project layout

```
src/
  views/            One file per screen (Dashboard.jsx, Pipeline.jsx, CandidateProfile.jsx, Offers.jsx,
                     JobRequisitions.jsx, RequisitionDetail.jsx, Reports.jsx, ...), each with a co-located
                     .css file of the same name. Views are intentionally large single files rather than
                     split into many subcomponents. `views/apply/` holds the multi-step application wizard
                     (StepPersonalInfo, StepEmploymentHistory, StepEducation, StepTraining, StepWotc,
                     StepReview) used by the candidate-facing career site.
  components/
    ui/              Shared, generic UI primitives (Button, Badge, Card, DataTable, Modal, MetricCard,
                     FilterChip, Timeline, EmptyState, PipelineFunnel, TrendChart, DatePicker, WizardRail, ...).
                     Each is a small .jsx + co-located .css pair. If you need a new visual pattern, check
                     here first — most screens are built almost entirely out of these plus page-specific CSS.
    layout/          AppShell, Sidebar, Topbar (recruiter/HM chrome) and CareerShell (career-site chrome) —
                     the persistent chrome around every routed view.
    demo/            DemoTour — the guided spotlight-overlay tour, driven by src/data/tourSteps.js.
  hooks/             One use<Entity>.js hook per Supabase table (useJobs, useCandidates, useOffers,
                     useOffices, useUsers, useIntegrations, useReminders, ...) — fetch + mutations, no shared
                     data-fetching library. useNotifications is the one exception, still localStorage-backed
                     (not a Supabase table). Plus a few non-data hooks (useApplicationWizard, useFocusJump,
                     useSimulatedLoad).
  lib/               supabaseClient.js (the Supabase client), caseConvert.js (snake_case/camelCase),
                     docuseal.js (DocuSeal submission helper + document-HTML builders).
  data/              What's left after the Supabase migration: applicationValidation.js (wizard field rules),
                     resumeParser.js (client-side resume text extraction), tourSteps.js (guided-tour copy).
                     Business records used to live here as arrays — they're all in Supabase now.
  context/           PersonaContext (recruiter/hiring-manager/candidate view switcher), CandidateSessionContext
                     (localStorage-backed login for the career site's "My Applications"/offer pages), TourContext.
  styles/            tokens.css (design tokens) + global.css (shared page chrome, reused across views).
App.jsx              All routes declared here. Recruiter/HM/admin routes are grouped under AppShell; the
                     candidate-facing career site (/careers, /careers/jobs/:id, /careers/jobs/:id/apply,
                     /careers/applications, /careers/profile) is grouped under CareerShell as a separate chrome.
supabase/
  migrations/        Schema, in order — the real source of truth for the data model.
  functions/         Edge Functions (currently just docuseal-submission).
```

## Conventions worth knowing before you write code here

- **Computed over stored, wherever possible.** e.g. a job's `stageCounts` is derived client-side in `useJobs` from the already-fetched candidates list rather than a stored column; Candidate Profile's Docs tab statuses and Timeline steps are computed from `candidate.stage` + existing arrays rather than hand-authored. Look for an existing derivation before adding a new stored field or column.
- **`TODAY` is a hardcoded constant** (currently `'2026-07-07'`) defined near the top of whichever view needs "now" (`CandidateProfile.jsx`, `Offers.jsx`, `Pipeline.jsx`, `Integrations.jsx`) — there's no real clock dependency, so date-relative demo logic (expiry countdowns, "days in stage") stays deterministic. If you add a new date-relative feature, reuse the pattern rather than calling `new Date()` directly.
- **Some async actions are real, some are still simulated** — know which is which before you touch one. Offer letter and WOTC consent signing are **real** (DocuSeal, actual documents, actual completion events). Things like "sending an offer for approval" or "scheduling an interview" still use a simulated two-phase local-state pattern (`idle → sending/simulating → idle`, a `setTimeout` in the 700–1400ms range, a spinner, no real network call beyond the eventual Supabase write) — search for `phase === 'sending'` for examples before inventing a new loading pattern.
- **Page chrome is shared, not repeated.** `.page-header` / `.page-title` / `.page-subtitle` / `.filter-strip` in `global.css` are used by nearly every view. A CSS class used identically in 3+ views should move to `global.css` rather than being redefined per view.
- **Before building any chart/graph**, read the `dataviz` skill (if using Claude Code — it's installed as a project skill) or at minimum match `TrendChart.jsx`'s existing pattern: form before color, single-hue for a single series, hover crosshair + tooltip, and never let a trend's color imply "up is good" without checking.
- **Router `state` carries context between routes**, not query params, for anything richer than an ID — e.g. `Pipeline.jsx` passes the currently filtered/sorted candidate-id list so Prev/Next on Candidate Profile respects the board's filters; `Offers.jsx` passes `{ tab: 'offer' }` so linking into a candidate's profile opens straight to the Offer tab.
- **Secrets never go in `.env.local` or the client bundle.** Anything server-side-only (like `DOCUSEAL_API_KEY`) is a Supabase Edge Function secret (`supabase secrets set`), read via `Deno.env.get()` inside the function — never a `VITE_`-prefixed variable, since those get inlined into the shipped JS.
- **Design before code, plan before implementation** — this repo is built using the `superpowers` skill's brainstorming → spec → plan → execute flow (see `docs/superpowers/specs/`). A spec doc doesn't have to be written for every small change, but any real feature or schema change should get one.

## Git workflow

Pushes go straight to `main` — there's no standing branch-per-change requirement. `main` auto-deploys to Vercel on every push (see Deployment below), so treat a push as "this is now live," not as a draft.

## Deployment

Vercel project `dm-hire` (scope `ethan8damaxs-projects`), GitHub-connected to the private `ethan8damax/dm-hire` repo — every push to `main` auto-deploys. `vercel.json` has the SPA rewrite rule so client-side routes survive a hard refresh; if you add a new route, no config change is needed. Vercel only serves the frontend — Supabase (data + Edge Functions) is a separate, independently-deployed service; an Edge Function change needs its own deploy (`supabase functions deploy <name>` or equivalent), a Vercel deploy won't pick it up.

## Working with Claude Code on this repo

This project has been built with Claude Code, using three plugins beyond the defaults. `.claude/settings.json` is committed and registers/enables all three automatically — the first time you open this repo in Claude Code, it should prompt you to trust and install them (standard behavior for any repo-configured plugin; nothing runs without that prompt).

- **[superpowers](https://github.com/obra/superpowers-marketplace)** — the skills framework this whole project's workflow runs on: brainstorming a design before touching code, writing a plan, then executing it, plus TDD/debugging/code-review skills. The spec docs in `docs/superpowers/specs/` exist because of this skill's brainstorming → spec → plan flow.
- **[ponytail](https://github.com/DietrichGebert/ponytail)** — a "laziest solution that works" discipline: reuse before you build, stdlib/native before a dependency, no speculative abstractions. Keeps a demo prototype like this one from accumulating premature infrastructure it doesn't need.
- **[impeccable](https://github.com/pbakaus/impeccable)** — a design-review hook that runs after every CSS/JSX edit and flags literal colors that fall outside `DESIGN.md`'s documented palette. In practice most findings have been **intentional reuse of an existing color already used elsewhere in the same file** — read the finding, check whether the value already exists nearby, and only "fix" it if it's genuinely new drift. Colors used only in a document generated for a third-party service (e.g. the DocuSeal document HTML in `src/lib/docuseal.js`) are out of scope for the app's own palette.

None of these are required to work on the repo — they're conventions the project has been built with, documented here so a new contributor understands *why* the code looks the way it does (small view files with embedded subcomponents, data derivation over duplication, spec-before-code, etc.) rather than fighting the pattern.
