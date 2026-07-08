# Supabase Data Layer — Design Spec

## 1. Context & Purpose

DM Hire is currently a high-fidelity prototype with **no backend** — every entity (jobs, candidates, offers, offices, integrations, etc.) lives as a hardcoded array/object in `src/data/*.js`, imported directly by view components. Several screens (Settings, Integrations) already let users edit this data in local `useState`, but edits vanish on refresh since nothing persists.

This is sub-project **A** of a larger demo-notes effort (candidate portal work is out of scope here — handled separately). It stands up a real Supabase project as the single source of truth for all ATS records, so that:
- Data survives refreshes and is "actually stored, updated, and reflected in the UI"
- Sub-project B (interactivity: Send Reminder, Extend, View/Verify, View Offer, reminders log) has a real place to write to

Supabase project: **`ATS`** (id `uvwsxzynbpmrbckmqhzy`, region us-east-1), created empty for this purpose.

## 2. Scope Decision

**Full migration**: every file in `src/data/*.js` that represents a business record becomes a Supabase table — including files that today are read-only display data (`analytics.js`, `whyDmHireFeatures.js`) and files that are already edited in local state but not persisted (`offices.js`, `integrations.js`, `onboardingPackets.js`, `workflows.js`). After this lands, all of those files are **deleted**, not left as unused dead code.

**Explicitly out of scope / stays a JS file:** `tourSteps.js` — guided-tour UI copy, not a business record.

## 3. Architecture

- New dependency: `@supabase/supabase-js` (only new package — no query library added; the codebase's existing pattern is Context + useState, so per-entity hooks follow that, not React Query).
- `src/lib/supabaseClient.js` — creates the client from `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`, read from `.env.local` (already covered by the repo's existing `*.local` gitignore pattern — no gitignore change needed).
  - URL: `https://uvwsxzynbpmrbckmqhzy.supabase.co`
  - Use the modern `sb_publishable_...` key, not the legacy anon JWT.
- **IDs**: existing string IDs (`'cand-001'`, `'job-001'`, etc.) are kept as `text` primary keys. No switch to UUIDs — they're already unique and readable, and every cross-reference in the current data uses them.
  - **Exception**: tables backing what were array entries with no natural ID in the source data (`candidate_notes`, `candidate_timeline_events`, `candidate_scorecards`, `offer_approvals`, `reminders`, `why_dm_hire_features`) get a generated `bigint generated always as identity` primary key instead.
- **Security**: there is no login/auth in this app — personas are switched client-side via Context, not real accounts — and the anon/publishable key will sit in the browser bundle. Every table gets RLS **enabled**, with a policy granting the `anon` role **SELECT, INSERT, UPDATE** (`USING (true) WITH CHECK (true)`). **No DELETE policy** — nothing in the app deletes a record, so it isn't granted. This open-write posture is acceptable because all data is synthetic demo data; it would need real auth + scoped policies before ever touching real candidate data.
- **No CHECK constraints or enums** on status-like text columns (`stage`, `status`, `esig_status`, etc.) — the original app never validated these beyond JS string literals; adding DB-level enforcement now would be new, unrequested behavior.
- **Date columns use Postgres `date`** (not `text`): `posted_date`, `sent_date`, `expiry_date`, `start_date`, `esig_viewed_date`, `esig_signed_date`, and the `date` column on `candidate_notes`/`candidate_timeline_events`/`candidate_scorecards`/`offer_approvals`. The one exception is `integrations.last_sync`, which stays `text` — it's a pre-formatted display string ("2026-07-07 08:14 AM"), not an ISO date, and reformatting it into a real timestamp is out of scope here. `reminders.sent_at` is the only `timestamptz` (it's a real event time, not a demo-narrative date).

## 4. Schema

All tables in the `public` schema.

### Core entities (mutated by user interaction)

**`jobs`**
`id` text PK, `title`, `department`, `location`, `office_id` FK→offices, `comp_range` text (free-form range like `"$85K–$105K"`, not numeric), `posted_date`, `status`, `is_internal` bool, `role_template`, `boards` text[], `knockout_rules` jsonb, `approval_chain` text[], `hiring_manager_id` FK→users, `days_open` int, `applicant_count` int.
*`stage_counts` is dropped* — computed client-side in `useJobs`, by reducing the already-fetched `candidates` list grouped by `job_id`/`stage`. Not a stored column, and not a DB view either — it's a single UI aggregate, not worth a view for.
*`days_open` stays a stored int, not derived from `now() - posted_date`.* This is the opposite call from `stage_counts`: `stage_counts` is an aggregate of current true state, so deriving it live keeps it correct forever. `days_open` is a narrative value anchored to the demo's fixed "present" (dates cluster around 2026-06/07); deriving it from real wall-clock `now()` would make every requisition look open for hundreds of days the further real time moves past the demo's setting. Same reasoning applies to `candidates.days_in_stage` below.

**`candidates`**
`id` text PK, `name`, `initials`, `avatar_color`, `job_id` FK→jobs, `stage`, `source`, `location`, `email`, `phone`, `current_role`, `expected_salary` text (free-form range, not numeric), `availability`, `days_in_stage` int (stored, not derived — see `days_open` above), `ai_score` int, `ai_dimensions` jsonb, `skills` text[], `prior_interaction` jsonb nullable (source data is either `null` or a structured object like `{ year, role, recruiter }`, never a plain string), `is_duplicate` bool, `is_stale` bool, `is_top_candidate` bool.

**`candidate_notes`** — `id` identity PK, `candidate_id` FK→candidates, `author`, `office` (plain text, no FK), `date`, `body`.

**`candidate_timeline_events`** — `id` identity PK, `candidate_id` FK→candidates, `stage`, `date`, `note`.

**`candidate_scorecards`** — `id` identity PK, `candidate_id` FK→candidates, `interviewer`, `date`, `dimensions` jsonb.

**`offers`**
`id` text PK, `candidate_id` FK→candidates, `job_id` FK→jobs, `salary` numeric, `bonus`, `pto`, `start_date`, `sent_date`, `expiry_date`, `status`, `esig_status`, `esig_viewed_date`, `esig_signed_date`, `payroll_synced` bool.

**`offer_approvals`** — `id` identity PK, `offer_id` FK→offers, `role`, `name` (plain text, no FK), `approved` bool, `date`.

**`reminders`** (new — backs the reminders log, sub-project B) — `id` identity PK, `candidate_id` FK→candidates nullable, `offer_id` FK→offers nullable, `type` text, `sent_at` timestamptz, `sent_by`, `message`.

### Reference/config entities (currently edited in local state only, or read-only)

**`offices`** — `id` text PK, `name`, `city`, `state`, `address`, `region`.

**`integrations`** — `id` text PK, `name`, `category`, `description`, `status`, `last_sync`, `new_hire_count` int.

**`onboarding_packets`** — `state` text PK, `state_name`, `documents` text[].

**`role_workflow_templates`** — `role_key` text PK, `label`, `knockout_years` int, `approval_chain` text[], `stages` jsonb. (Stages are edited as a whole list per role in Settings today — jsonb here matches that access pattern; no child table.)

**`users`** — `id` text PK, `name`, `email`, `role`, `assigned_job_ids` text[], `status`.

**`analytics`** — singleton: `id` text PK default `'default'`, `data` jsonb not null. Always queried by `id = 'default'`. Nothing writes to this; Reports charts read it.

**`why_dm_hire_features`** — `id` identity PK, `icon`, `title`, `context`, `pain`, `solution`, `route`, `action`. Static marketing content, never mutated.

## 5. Data Access Pattern (React side)

- One hook per entity in `src/hooks/` (`useCandidates()`, `useJobs()`, `useOffers()`, etc.): fetches on mount, exposes state plus mutation functions (`updateStage(id, stage)`, `addNote(...)`, `connectIntegration(id)`, etc.).
- **Hooks translate snake_case DB columns back to the exact camelCase shape components already use** (`avatar_color` → `avatarColor`, `job_id` → `jobId`, etc.). This is what keeps the diff small: view components need zero internal changes, only the top-of-file swap from `import { candidates } from '../data/candidates'` to `const { candidates, updateStage } = useCandidates()`.
- Cross-entity joins use Supabase's nested `select` (e.g. `candidates.select('*, jobs(title)')`) rather than separate fetches manually joined in JS.
- **Mutations are confirm-first, not optimistic**: call Supabase, update local state only from the successful response. On failure, show an inline error message and leave prior state untouched. No optimistic update/rollback logic — unnecessary complexity for a demo on a stable connection.
- Some mutations are compound (e.g. moving a candidate's stage should both update `candidates.stage` and insert a `candidate_timeline_events` row) — the schema supports this (that's exactly what the timeline table is for), but the actual wiring and its failure-mode handling belongs to sub-project B, not here.

## 6. Migration & Seeding

- Schema created via Supabase MCP `apply_migration` against the `ATS` project, in FK-dependency order:
  1. Reference tables with no dependencies: `offices`, `users`, `role_workflow_templates`, `onboarding_packets`, `integrations`, `why_dm_hire_features`, `analytics`
  2. `jobs` (depends on `offices`, `users`)
  3. `candidates` (depends on `jobs`)
  4. `candidate_notes`, `candidate_timeline_events`, `candidate_scorecards` (depend on `candidates`)
  5. `offers` (depends on `candidates`, `jobs`)
  6. `offer_approvals` (depends on `offers`)
  7. `reminders` (depends on `candidates`, `offers`)
- **Seeding**: plain SQL `INSERT` statements transcribed from the current `src/data/*.js` arrays, embedded directly in the migration files — not a separate seed script. The dataset is small (single-digit jobs/candidates/offers), and a throwaway Node script has no purpose after the one-time seed.
- Once seeding is verified (see below), the corresponding `src/data/*.js` files are deleted.

## 7. Error Handling & Loading States

- Each hook exposes `{ data, loading, error }`.
- **Loading**: most views already have an "empty results" UI, but that's for *zero rows after filtering* on synchronous data — there was never an *initial-fetch-in-progress* state before, since data was previously synchronous. This is genuinely new: kept minimal, plain "Loading…" text, no spinner library or skeleton components.
- **Error**: simple inline error message on fetch/mutation failure. No retry logic, no offline queue — not warranted for a live demo on a stable connection.

## 8. Testing

- One smoke check after seeding: a verification pass loads each affected view (Dashboard, Job Requisitions, Pipeline, Candidate Profile, Offers, Reports, Integrations, Settings, Internal Jobs) and confirms real Supabase-backed data renders correctly.
- No unit test suite — not warranted for a demo prototype. Full functional testing of interactivity itself (button wiring, reminders) belongs to sub-project B's own spec, not this one.

## 9. Out of Scope

- Candidate/applicant portal migration — handled on a separate branch by another contributor.
- Real authentication — the open RLS policy exists because there's no auth layer; adding auth is a future concern, not part of this spec.
- Sub-projects B (interactivity/reminders wiring), C (pipeline/requisition UX), D (logo), E (QA pass) — each gets its own spec.
