# Supabase Data Layer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace every hardcoded `src/data/*.js` business-record file with real tables in the Supabase `ATS` project (`uvwsxzynbpmrbckmqhzy`), and rewire every view that reads/writes that data to go through Supabase instead.

**Architecture:** Schema + RLS created via the Supabase MCP `apply_migration` tool (also saved as plain `.sql` files under `supabase/migrations/` for review/history, no CLI required). Seed data transcribed directly from the current JS arrays as SQL `INSERT`s in dedicated seed migrations. React side gets one hook per entity in `src/hooks/`, each returning the exact same camelCase shape components already use, so view components need only a top-of-file import swap plus the specific mutation call-sites this plan identifies.

**Tech Stack:** `@supabase/supabase-js` (new dependency), existing React 18 + Context/useState pattern (no new state library), Postgres 17 on Supabase.

**Reference:** Design spec at `docs/superpowers/specs/2026-07-08-supabase-data-layer-design.md`.

---

## Task 1: Dependency, env, Supabase client, shared utilities

**Files:**
- Modify: `package.json`
- Create: `.env.local`
- Create: `src/lib/supabaseClient.js`
- Create: `src/lib/caseConvert.js`
- Create: `src/components/ui/Loading.jsx`
- Create: `src/components/ui/Loading.css`

- [ ] **Step 1: Install supabase-js**

Run: `npm install @supabase/supabase-js`

Expected: `package.json` `dependencies` gains `"@supabase/supabase-js": "^2.x.x"`.

- [ ] **Step 2: Create `.env.local`**

```
VITE_SUPABASE_URL=https://uvwsxzynbpmrbckmqhzy.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_kl1cWmUtSGgHYU6cocCPZw_KFitR7I8
```

Verify it's ignored: `git check-ignore -v .env.local` → should print a match against the `*.local` line in `.gitignore`. Do not commit this file.

- [ ] **Step 3: Create the Supabase client**

```js
// src/lib/supabaseClient.js
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
)
```

- [ ] **Step 4: Create the case-conversion utility**

Shallow only, by design: nested jsonb payloads (e.g. `ai_dimensions`) keep their original inner keys untouched, only the top-level DB column name is converted.

```js
// src/lib/caseConvert.js
function snakeToCamel(str) {
  return str.replace(/_([a-z0-9])/g, (_, c) => c.toUpperCase())
}

function camelToSnake(str) {
  return str.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`)
}

export function rowToCamel(row) {
  if (Array.isArray(row)) return row.map(rowToCamel)
  if (row === null || typeof row !== 'object') return row
  return Object.fromEntries(Object.entries(row).map(([k, v]) => [snakeToCamel(k), v]))
}

export function toSnakeRow(obj) {
  return Object.fromEntries(Object.entries(obj).map(([k, v]) => [camelToSnake(k), v]))
}
```

- [ ] **Step 5: Create the shared Loading component**

```jsx
// src/components/ui/Loading.jsx
export default function Loading() {
  return <div className="view-loading">Loading…</div>
}
```

```css
/* src/components/ui/Loading.css */
.view-loading {
  padding: var(--space-8);
  text-align: center;
  color: var(--gray-500);
}
```

- [ ] **Step 6: Verify**

Run: `npm run lint`
Expected: no errors (new files are simple enough that oxlint should pass clean).

- [ ] **Step 7: Commit**

```bash
git add package.json package-lock.json src/lib/supabaseClient.js src/lib/caseConvert.js src/components/ui/Loading.jsx src/components/ui/Loading.css
git commit -m "Add Supabase client, case-conversion utility, and shared Loading component"
```

(`.env.local` is intentionally not added — it's gitignored.)

---

## Task 2: Migration — reference tables + RLS

**Files:**
- Create: `supabase/migrations/001_reference_tables.sql`

- [ ] **Step 1: Write the migration SQL**

```sql
-- supabase/migrations/001_reference_tables.sql

create table offices (
  id text primary key,
  name text not null,
  city text not null,
  state text not null,
  address text not null,
  region text not null
);
alter table offices enable row level security;
create policy "offices_anon_select" on offices for select to anon using (true);
create policy "offices_anon_insert" on offices for insert to anon with check (true);
create policy "offices_anon_update" on offices for update to anon using (true) with check (true);

create table users (
  id text primary key,
  name text not null,
  email text not null,
  role text not null,
  assigned_job_ids text[] not null default '{}',
  status text not null
);
alter table users enable row level security;
create policy "users_anon_select" on users for select to anon using (true);
create policy "users_anon_insert" on users for insert to anon with check (true);
create policy "users_anon_update" on users for update to anon using (true) with check (true);

create table role_workflow_templates (
  role_key text primary key,
  label text not null,
  knockout_years int not null,
  approval_chain text[] not null default '{}',
  stages jsonb not null
);
alter table role_workflow_templates enable row level security;
create policy "role_workflow_templates_anon_select" on role_workflow_templates for select to anon using (true);
create policy "role_workflow_templates_anon_insert" on role_workflow_templates for insert to anon with check (true);
create policy "role_workflow_templates_anon_update" on role_workflow_templates for update to anon using (true) with check (true);

create table onboarding_packets (
  state text primary key,
  state_name text not null,
  documents text[] not null default '{}'
);
alter table onboarding_packets enable row level security;
create policy "onboarding_packets_anon_select" on onboarding_packets for select to anon using (true);
create policy "onboarding_packets_anon_insert" on onboarding_packets for insert to anon with check (true);
create policy "onboarding_packets_anon_update" on onboarding_packets for update to anon using (true) with check (true);

create table integrations (
  id text primary key,
  name text not null,
  category text not null,
  description text not null,
  status text not null,
  last_sync text,
  new_hire_count int,
  boards text[],
  tools text[]
);
alter table integrations enable row level security;
create policy "integrations_anon_select" on integrations for select to anon using (true);
create policy "integrations_anon_insert" on integrations for insert to anon with check (true);
create policy "integrations_anon_update" on integrations for update to anon using (true) with check (true);

create table why_dm_hire_features (
  id bigint generated always as identity primary key,
  icon text not null,
  title text not null,
  context text not null,
  pain text not null,
  solution text not null,
  route text not null,
  action text not null
);
alter table why_dm_hire_features enable row level security;
create policy "why_dm_hire_features_anon_select" on why_dm_hire_features for select to anon using (true);
create policy "why_dm_hire_features_anon_insert" on why_dm_hire_features for insert to anon with check (true);
create policy "why_dm_hire_features_anon_update" on why_dm_hire_features for update to anon using (true) with check (true);

create table analytics (
  id text primary key default 'default',
  data jsonb not null
);
alter table analytics enable row level security;
create policy "analytics_anon_select" on analytics for select to anon using (true);
create policy "analytics_anon_insert" on analytics for insert to anon with check (true);
create policy "analytics_anon_update" on analytics for update to anon using (true) with check (true);
```

- [ ] **Step 2: Apply via Supabase MCP**

Call `mcp__plugin_supabase_supabase__apply_migration` with `project_id: "uvwsxzynbpmrbckmqhzy"`, `name: "reference_tables"`, and `query` set to the exact SQL above.

- [ ] **Step 3: Verify**

Call `mcp__plugin_supabase_supabase__list_tables` with `project_id: "uvwsxzynbpmrbckmqhzy"`, `schemas: ["public"]`, `verbose: true`.
Expected: `offices`, `users`, `role_workflow_templates`, `onboarding_packets`, `integrations`, `why_dm_hire_features`, `analytics` all present with the columns above.

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/001_reference_tables.sql
git commit -m "Add Supabase schema for reference tables (offices, users, workflows, onboarding, integrations, why-dm-hire features, analytics)"
```

---

## Task 3: Seed reference tables

**Files:**
- Create: `supabase/migrations/002_seed_reference_tables.sql`

- [ ] **Step 1: Write the seed SQL**

```sql
-- supabase/migrations/002_seed_reference_tables.sql

insert into offices (id, name, city, state, address, region) values
('office-detroit', 'Detroit HQ', 'Detroit', 'MI', '333 W Fort St, Detroit, MI 48226', 'Midwest'),
('office-troy', 'Troy', 'Troy', 'MI', '5480 Corporate Dr, Troy, MI 48098', 'Midwest'),
('office-chicago', 'Chicago', 'Chicago', 'IL', '150 N Riverside Plaza, Chicago, IL 60606', 'Midwest'),
('office-grand-rapids', 'Grand Rapids', 'Grand Rapids', 'MI', '99 Monroe Ave NW, Grand Rapids, MI 49503', 'Midwest');

insert into users (id, name, email, role, assigned_job_ids, status) values
('user-001', 'T. Smith', 't.smith@doerenmayhew.com', 'Recruiter', ARRAY['job-001','job-002','job-003','job-004','job-005'], 'active'),
('user-002', 'R. Patel', 'r.patel@doerenmayhew.com', 'Hiring Manager', ARRAY['job-001','job-005'], 'active'),
('user-003', 'K. Nguyen', 'k.nguyen@doerenmayhew.com', 'Hiring Manager', ARRAY['job-002'], 'active'),
('user-004', 'J. Brooks', 'j.brooks@doerenmayhew.com', 'Hiring Manager', ARRAY['job-003'], 'active'),
('user-005', 'M. Osei', 'm.osei@doerenmayhew.com', 'Hiring Manager', ARRAY['job-004'], 'active'),
('user-006', 'A. Chen', 'a.chen@doerenmayhew.com', 'Admin', ARRAY[]::text[], 'active'),
('user-007', 'L. Torres', 'l.torres@doerenmayhew.com', 'Admin', ARRAY[]::text[], 'active');

insert into role_workflow_templates (role_key, label, knockout_years, approval_chain, stages) values
('intern', 'Intern', 0, ARRAY['hiring_manager'], '[{"name":"Phone Screen","approver":"Recruiter","slaDays":3},{"name":"Team Interview","approver":"Hiring Manager","slaDays":5},{"name":"Offer","approver":"Hiring Manager","slaDays":3}]'),
('ic', 'Individual Contributor', 1, ARRAY['hiring_manager'], '[{"name":"Phone Screen","approver":"Recruiter","slaDays":3},{"name":"Interview","approver":"Hiring Manager","slaDays":5},{"name":"Offer","approver":"Hiring Manager","slaDays":3}]'),
('manager', 'Manager', 3, ARRAY['hiring_manager','hr_director'], '[{"name":"Phone Screen","approver":"Recruiter","slaDays":3},{"name":"Interview","approver":"Hiring Manager","slaDays":5},{"name":"Panel Interview","approver":"Hiring Manager","slaDays":5},{"name":"Offer","approver":"HR Director","slaDays":3}]'),
('director', 'Director', 8, ARRAY['hiring_manager','hr_director','vp_finance'], '[{"name":"Phone Screen","approver":"Recruiter","slaDays":3},{"name":"Interview","approver":"Hiring Manager","slaDays":5},{"name":"Panel Interview","approver":"Hiring Manager","slaDays":5},{"name":"Executive Interview","approver":"HR Director","slaDays":7},{"name":"Offer","approver":"VP Finance","slaDays":3}]'),
('csuite', 'C-Suite', 12, ARRAY['hiring_manager','hr_director','vp_finance'], '[{"name":"Executive Screen","approver":"HR Director","slaDays":5},{"name":"Board Interview","approver":"VP Finance","slaDays":10},{"name":"Offer","approver":"VP Finance","slaDays":5}]'),
('floor', 'Production Floor', 0, ARRAY['hiring_manager'], '[{"name":"Phone Screen","approver":"Recruiter","slaDays":2},{"name":"In-Person Interview","approver":"Hiring Manager","slaDays":3},{"name":"Offer","approver":"Hiring Manager","slaDays":2}]');

insert into onboarding_packets (state, state_name, documents) values
('MI', 'Michigan', ARRAY['Form I-9 (Employment Eligibility)','Form W-4 (Federal Tax Withholding)','Michigan MI-W4 (State Tax Withholding)','Direct Deposit Authorization','Michigan New Hire Reporting Form','Employee Handbook Acknowledgment']),
('IL', 'Illinois', ARRAY['Form I-9 (Employment Eligibility)','Form W-4 (Federal Tax Withholding)','Illinois IL-W-4 (State Tax Withholding)','Direct Deposit Authorization','Illinois New Hire Reporting Form','Employee Handbook Acknowledgment']);

insert into integrations (id, name, category, description, status, last_sync, new_hire_count, boards, tools) values
('dm-payroll', 'DM Payroll', 'Payroll', 'Auto-syncs new hires straight into payroll the moment an offer is accepted.', 'connected', '2026-07-07 08:14 AM', 12, null, null),
('ms365', 'Microsoft 365 / Outlook', 'Calendar', 'Calendar sync and Teams interview links. Invites are sent from the hiring manager''s own email, not a shared inbox.', 'connected', '2026-07-07 07:02 AM', null, null, null),
('linkedin', 'LinkedIn Recruiter', 'Sourcing', 'One-click candidate import with automatic profile matching against open requisitions.', 'connected', '2026-07-06 04:45 PM', null, null, null),
('job-boards', 'Job Boards', 'Sourcing', 'Posting distribution across external job boards.', 'connected', '2026-07-07 06:00 AM', null, ARRAY['Indeed','ZipRecruiter','Glassdoor'], null),
('background-check', 'Background Check (Sterling)', 'Screening', 'Triggered automatically the moment an offer is accepted.', 'connected', '2026-07-05 11:20 AM', null, null, null),
('drug-screen', 'Drug Screen', 'Screening', 'Ordered alongside the background check on offer acceptance.', 'paused', '2026-06-30 09:15 AM', null, null, null),
('assessments', 'Assessment Tools', 'Assessment', 'Skills, personality, and cognitive assessments, assigned automatically per role template.', 'connected', '2026-07-06 02:30 PM', null, null, ARRAY['Criteria Corp (Skills)','Predictive Index (Personality)','Wonderlic (Cognitive)']),
('dm-payroll-hris', 'DM Payroll HRIS', 'HRIS', 'Benefits eligibility and employee record sync for new hires.', 'not_connected', null, null, null, null);

insert into why_dm_hire_features (icon, title, context, pain, solution, route, action) values
('boards', 'Automated job posting to multiple boards', 'Brandon''s wishlist', 'Recruiters log into LinkedIn, Indeed, Glassdoor, and ZipRecruiter separately for every posting.', 'Select boards once in the requisition. DM Hire distributes to all of them at the same time.', '/jobs', 'Job Requisitions → any open role''s board/link badges'),
('payroll', 'Payroll + onboarding integration', 'Brandon''s wishlist: the whole reason DM Hire exists', 'ClearCompany has no native payroll link, so new hires are manually re-keyed into DM Payroll.', 'Hired candidates auto-sync to DM Payroll the moment they''re marked hired. No re-entry.', '/', 'Dashboard → DM Payroll status card'),
('notifications', 'Automated department notifications', 'Brandon''s wishlist', 'IT, Facilities, and Security find out about a new hire only when someone remembers to email them.', 'A configurable notification matrix decides which department gets notified on which trigger, and what info they receive.', '/settings', 'Settings → Notifications tab'),
('sourceTracking', 'Applicant source tracking', 'Flagged as important to DM specifically', 'Zero visibility into where applicants actually come from; every board looks the same.', 'Every applicant is tagged by source at the moment they apply, rolled up into full conversion and cost reporting.', '/reports', 'Reports → Source ROI table'),
('templates', 'Role-type posting templates', 'Sarah''s wishlist', 'Every requisition, whether intern or C-suite, is built completely from scratch.', 'Six role templates (Intern through C-Suite) pre-fill interview stages, knockout defaults, and the approval chain.', '/jobs', 'Job Requisitions → New Requisition → Role Template'),
('linkedin', 'LinkedIn Recruiter connection', 'Sarah''s wishlist', 'No LinkedIn integration; sourcing and importing candidates is entirely manual.', 'One-click LinkedIn Recruiter import with automatic profile matching to open requisitions.', '/integrations', 'Integrations → LinkedIn Recruiter card'),
('history', 'Prior interaction history indicator', 'Sarah''s wishlist', 'A candidate who applied two years ago for a different role looks brand new to the recruiter today.', 'Prior interactions surface automatically on the pipeline card and candidate profile.', '/pipeline', 'Pipeline → any card with a prior-interaction badge'),
('notes', 'Org-wide shared notes', 'Sarah''s wishlist', 'Notes are siloed to whichever office entered them, so candidates get asked the same questions twice.', 'Every note is visible to every office, with author and location attached.', '/pipeline', 'Any Candidate Profile → Notes tab'),
('esign', 'Electronic offer letters + e-signature', 'Sarah''s wishlist: legal enforceability concern', 'The current "e-signature" is just a timestamped name entry, not a legally binding e-sign.', 'A full e-signature flow with a real audit trail (sent, opened, signed) plus approval routing before it ever reaches the candidate.', '/offers', 'Offers → any offer''s audit trail'),
('sms', 'Candidate text/SMS communication', 'Sarah''s wishlist', 'No native texting; recruiters use personal phones or a separate tool entirely.', 'SMS and email threads live directly on the candidate profile, side by side.', '/pipeline', 'Any Candidate Profile → Comms tab'),
('onboarding', 'State-based onboarding packets', 'Brandon''s wishlist', 'The same onboarding paperwork goes out regardless of which state a new hire works in.', 'Each state has its own configurable document packet, assigned automatically.', '/settings', 'Settings → Onboarding Packets tab'),
('approvals', 'Approval workflows', 'Sarah''s wishlist', 'No configurable approval routing; every requisition and offer moves the same way regardless of level.', 'Role-based approval chains for both requisitions and offers, with status visible at every step.', '/jobs', 'Job Requisitions → any Pending Approval job'),
('duplicates', 'Duplicate candidate detection', 'ClearCompany named as the benchmark: the current DM ATS has nothing', 'Duplicate applicants beyond an exact email match go completely undetected.', 'DM Hire flags likely duplicates before a recruiter wastes time on a repeat application.', '/pipeline?job=job-002', 'Pipeline → job-002 → duplicate-flagged card'),
('navigation', 'Prev/next arrow navigation', 'Quality-of-life ask from recruiters', 'Reviewing a stack of candidates means backing out to the list and reopening each one.', 'Prev/Next arrows step through the exact filtered, sorted list you came from.', '/pipeline', 'Any Candidate Profile → header arrows'),
('aiScore', 'AI qualification scoring', 'Sarah''s wishlist', 'No scoring or qualification signal; recruiters read every resume cold.', 'Every candidate gets an AI match score against the role, broken into five weighted dimensions.', '/pipeline', 'Pipeline → any card''s score badge'),
('offices', 'New office setup + geo-based posting', 'Brandon''s wishlist', 'Adding a new office location isn''t reflected anywhere in how jobs get targeted or posted.', 'Office setup drives geo-based job board targeting automatically.', '/settings', 'Settings → Offices tab'),
('hiringManager', 'Hiring Manager role (screened-only access)', 'Sarah''s wishlist: data governance concern', 'Hiring managers either get full recruiter access or none; there''s no restricted, screened-only view.', 'A dedicated Hiring Manager persona sees only screened candidates on their own jobs, with scorecard submission only and no offer visibility.', '/pipeline', 'Topbar persona switcher → Hiring Manager'),
('outlook', 'Outlook integration', 'Brandon''s wishlist', 'No calendar integration; scheduling is manual back-and-forth email, adding 1-3 days per interview.', 'Interview invites send from the hiring manager''s own Outlook, with Teams links attached automatically.', '/integrations', 'Integrations → Microsoft 365 / Outlook card'),
('scheduler', 'Scheduler tool (Calendly-like)', 'Multiple clients and prospects have asked for this', 'Recruiter emails candidate, candidate replies, recruiter manually builds the invite. Every single time.', 'Candidates self-select from real interviewer availability; the invite goes out automatically.', '/pipeline', 'Any Candidate Profile → Schedule tab'),
('knockout', 'Knockout questions', 'Sarah''s wishlist', 'The current "knockout" is just a waiver acknowledgment, not real disqualifying logic.', 'Per-job knockout rules with a decline note, editable right in the requisition form.', '/jobs', 'New Requisition → Knockout Questions section'),
('scorecards', 'Scorecards', 'Sarah''s wishlist', 'Interview feedback is inconsistent freeform email with no structured comparison across candidates.', 'Every interviewer submits a consistent, dimension-by-dimension scorecard.', '/pipeline', 'Any Candidate Profile → Scorecard tab'),
('portal', 'Mobile-optimized candidate portal', 'Brandon''s wishlist', 'Candidates have no self-service way to apply, check status, or sign an offer from their phone.', 'A dedicated mobile-first candidate portal covers search, apply, status tracking, self-scheduling, and e-sign end to end.', '/portal', 'Candidate Portal (persona switcher → Candidate)'),
('internalJobs', 'Internal job board + internal-only postings', 'Brandon''s wishlist', 'No internal mobility path; current employees find out about openings the same way external applicants do, or not at all.', 'Toggle any requisition Internal Only; employees browse and apply with their existing HRIS record auto-populating the application.', '/internal-jobs', 'Internal Job Board'),
('backgroundCheck', 'Background check + drug screen integrations', 'Brandon''s wishlist', 'Background checks and drug screens are ordered and tracked completely outside the ATS.', 'Both trigger automatically on offer acceptance, with status visible right on the candidate''s Docs tab.', '/integrations', 'Integrations → Background Check / Drug Screen cards'),
('analytics', 'Advanced reporting (TTF, CPH, OAR, IOR)', 'Sarah''s wishlist', 'No analytics layer beyond raw candidate counts; every metric is a manual spreadsheet pull.', 'Time to Fill, Cost per Hire, Offer Acceptance Rate, and Interview-to-Offer Ratio, live from real pipeline data.', '/reports', 'Reports & Analytics'),
('workflows', 'Configurable workflows per role type', 'Sarah''s wishlist', 'Interview stages and approvers are hardcoded; changing them means a vendor support ticket.', 'Every role template''s stages, approvers, and SLAs are editable directly in Settings.', '/settings', 'Settings → Workflows tab'),
('assessments', 'Assessment tool integrations', 'Sarah''s wishlist', 'Skills, personality, and cognitive assessments are ordered and tracked outside the ATS entirely.', 'Criteria Corp, Predictive Index, and Wonderlic all connect directly, assigned automatically per role template.', '/integrations', 'Integrations → Assessment Tools card'),
('jobBoardPerf', 'Job board performance analytics', 'Sarah''s wishlist', 'No visibility into which job board spend is actually converting into hires.', 'One table shows applicants, interviews, hires, conversion rate, and cost by source, with underperformers flagged.', '/reports', 'Reports → Source ROI & Job Board Performance');

insert into analytics (id, data) values ('default', '{
  "timeToFill": {"avg": 18.4, "byDepartment": [{"dept":"Finance","avg":16.2},{"dept":"Client Services","avg":24.5},{"dept":"Human Resources","avg":12.8}], "trend": [{"month":"Jan","value":22},{"month":"Feb","value":20},{"month":"Mar","value":19.5},{"month":"Apr","value":18.1},{"month":"May","value":17.6},{"month":"Jun","value":18.4}]},
  "costPerHire": {"avg": 4210, "bySource": [{"source":"LinkedIn","cost":1200},{"source":"Indeed","cost":800},{"source":"Employee Referral","cost":400},{"source":"Career Site","cost":150},{"source":"ZipRecruiter","cost":650}]},
  "offerAcceptanceRate": {"overall": 0.92, "byRoleType": [{"role":"Manager","rate":0.88},{"role":"IC","rate":0.95},{"role":"Director","rate":0.83}], "trend": [{"month":"Jan","value":0.85},{"month":"Feb","value":0.87},{"month":"Mar","value":0.89},{"month":"Apr","value":0.90},{"month":"May","value":0.91},{"month":"Jun","value":0.92}]},
  "interviewToOfferRatio": {"overall": 4.2, "byDepartment": [{"dept":"Finance","ratio":3.8},{"dept":"Client Services","ratio":5.1},{"dept":"Human Resources","ratio":3.2}]},
  "sourceRoi": [{"source":"LinkedIn","applicants":84,"interviews":22,"hires":9,"conversionRate":0.107,"avgDays":16.2},{"source":"Employee Referral","applicants":31,"interviews":14,"hires":8,"conversionRate":0.258,"avgDays":12.4},{"source":"Career Site","applicants":62,"interviews":11,"hires":4,"conversionRate":0.065,"avgDays":21.1},{"source":"Indeed","applicants":94,"interviews":8,"hires":2,"conversionRate":0.021,"avgDays":24.7},{"source":"ZipRecruiter","applicants":47,"interviews":4,"hires":0,"conversionRate":0,"avgDays":null}]
}'::jsonb);
```

- [ ] **Step 2: Apply via Supabase MCP**

Call `apply_migration` with `name: "seed_reference_tables"` and the SQL above.

- [ ] **Step 3: Verify**

Call `mcp__plugin_supabase_supabase__execute_sql` with:
```sql
select
  (select count(*) from offices) as offices,
  (select count(*) from users) as users,
  (select count(*) from role_workflow_templates) as workflows,
  (select count(*) from onboarding_packets) as packets,
  (select count(*) from integrations) as integrations,
  (select count(*) from why_dm_hire_features) as features,
  (select count(*) from analytics) as analytics;
```
Expected: `4, 7, 6, 2, 8, 28, 1`.

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/002_seed_reference_tables.sql
git commit -m "Seed reference tables from existing src/data/*.js content"
```

---

## Task 4: Migration — jobs + RLS

**Files:**
- Create: `supabase/migrations/003_jobs.sql`

- [ ] **Step 1: Write the migration SQL**

```sql
-- supabase/migrations/003_jobs.sql

create table jobs (
  id text primary key,
  title text not null,
  department text not null,
  location text not null,
  office_id text references offices(id),
  comp_range text not null,
  posted_date date not null,
  status text not null,
  is_internal boolean not null default false,
  role_template text not null,
  boards text[] not null default '{}',
  knockout_rules jsonb not null default '[]',
  approval_chain text[] not null default '{}',
  hiring_manager_id text references users(id),
  days_open int not null default 0,
  applicant_count int not null default 0
);
alter table jobs enable row level security;
create policy "jobs_anon_select" on jobs for select to anon using (true);
create policy "jobs_anon_insert" on jobs for insert to anon with check (true);
create policy "jobs_anon_update" on jobs for update to anon using (true) with check (true);
```

- [ ] **Step 2: Apply via Supabase MCP**

Call `apply_migration` with `name: "jobs"` and the SQL above.

- [ ] **Step 3: Verify**

Call `list_tables` (verbose) and confirm `jobs` exists with FKs to `offices` and `users`.

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/003_jobs.sql
git commit -m "Add Supabase schema for jobs"
```

---

## Task 5: Seed jobs

**Files:**
- Create: `supabase/migrations/004_seed_jobs.sql`

- [ ] **Step 1: Write the seed SQL**

```sql
-- supabase/migrations/004_seed_jobs.sql

insert into jobs (id, title, department, location, office_id, comp_range, posted_date, status, is_internal, role_template, boards, knockout_rules, approval_chain, hiring_manager_id, days_open, applicant_count) values
('job-001', 'Senior Payroll Analyst', 'Finance & Accounting', 'Detroit, MI', 'office-detroit', '$85K–$105K', '2026-06-12', 'open', false, 'manager', ARRAY['LinkedIn','Indeed','Career Site'], '[{"field":"yearsExperience","operator":"gte","value":3}]', ARRAY['hiring_manager','hr_director'], 'user-002', 18, 42),
('job-002', 'Staff Accountant', 'Finance & Accounting', 'Troy, MI', 'office-troy', '$58K–$68K', '2026-06-20', 'open', true, 'ic', ARRAY[]::text[], '[{"field":"yearsExperience","operator":"gte","value":1}]', ARRAY['hiring_manager'], 'user-003', 10, 27),
('job-003', 'Director of Client Services', 'Client Services', 'Chicago, IL', 'office-chicago', '$130K–$155K', '2026-05-28', 'pending_approval', false, 'director', ARRAY['LinkedIn','Career Site'], '[{"field":"yearsExperience","operator":"gte","value":8}]', ARRAY['hiring_manager','hr_director','vp_finance'], 'user-004', 35, 14),
('job-004', 'HR Coordinator (Summer Intern)', 'Human Resources', 'Grand Rapids, MI', 'office-grand-rapids', '$20/hr', '2026-06-25', 'draft', false, 'intern', ARRAY[]::text[], '[]', ARRAY['hiring_manager'], 'user-005', 0, 0),
('job-005', 'Payroll Tax Specialist', 'Finance & Accounting', 'Detroit, MI', 'office-detroit', '$70K–$85K', '2026-05-15', 'closed', false, 'ic', ARRAY['LinkedIn','Indeed'], '[{"field":"certification","operator":"eq","value":"CPP"}]', ARRAY['hiring_manager'], 'user-002', 41, 36);
```

- [ ] **Step 2: Apply via Supabase MCP**

Call `apply_migration` with `name: "seed_jobs"` and the SQL above.

- [ ] **Step 3: Verify**

`execute_sql`: `select count(*) from jobs;` → expected `5`.

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/004_seed_jobs.sql
git commit -m "Seed jobs from existing src/data/jobs.js content"
```

---

## Task 6: Migration — candidates + candidate_notes + candidate_timeline_events + candidate_scorecards + RLS

**Files:**
- Create: `supabase/migrations/005_candidates.sql`

- [ ] **Step 1: Write the migration SQL**

```sql
-- supabase/migrations/005_candidates.sql

create table candidates (
  id text primary key,
  name text not null,
  initials text not null,
  avatar_color text not null,
  job_id text references jobs(id),
  stage text not null,
  source text not null,
  location text not null,
  email text not null,
  phone text not null,
  current_role text not null,
  expected_salary text not null,
  availability text not null,
  days_in_stage int not null default 0,
  ai_score int not null,
  ai_dimensions jsonb not null,
  skills text[] not null default '{}',
  prior_interaction jsonb,
  is_duplicate boolean not null default false,
  is_stale boolean not null default false,
  is_top_candidate boolean not null default false,
  is_internal_applicant boolean not null default false
);
alter table candidates enable row level security;
create policy "candidates_anon_select" on candidates for select to anon using (true);
create policy "candidates_anon_insert" on candidates for insert to anon with check (true);
create policy "candidates_anon_update" on candidates for update to anon using (true) with check (true);

create table candidate_notes (
  id bigint generated always as identity primary key,
  candidate_id text not null references candidates(id),
  author text not null,
  office text not null,
  date date not null,
  body text not null
);
alter table candidate_notes enable row level security;
create policy "candidate_notes_anon_select" on candidate_notes for select to anon using (true);
create policy "candidate_notes_anon_insert" on candidate_notes for insert to anon with check (true);
create policy "candidate_notes_anon_update" on candidate_notes for update to anon using (true) with check (true);

create table candidate_timeline_events (
  id bigint generated always as identity primary key,
  candidate_id text not null references candidates(id),
  stage text not null,
  date date not null,
  note text
);
alter table candidate_timeline_events enable row level security;
create policy "candidate_timeline_events_anon_select" on candidate_timeline_events for select to anon using (true);
create policy "candidate_timeline_events_anon_insert" on candidate_timeline_events for insert to anon with check (true);
create policy "candidate_timeline_events_anon_update" on candidate_timeline_events for update to anon using (true) with check (true);

create table candidate_scorecards (
  id bigint generated always as identity primary key,
  candidate_id text not null references candidates(id),
  interviewer text not null,
  date date not null,
  dimensions jsonb not null
);
alter table candidate_scorecards enable row level security;
create policy "candidate_scorecards_anon_select" on candidate_scorecards for select to anon using (true);
create policy "candidate_scorecards_anon_insert" on candidate_scorecards for insert to anon with check (true);
create policy "candidate_scorecards_anon_update" on candidate_scorecards for update to anon using (true) with check (true);
```

Note: `is_internal_applicant` covers the one-off `isInternalApplicant: true` flag on `cand-005` in the source data — easy to miss, confirmed present by re-reading `src/data/candidates.js` directly.

- [ ] **Step 2: Apply via Supabase MCP**

Call `apply_migration` with `name: "candidates"` and the SQL above.

- [ ] **Step 3: Verify**

`list_tables` (verbose): confirm all four tables exist with FKs to `candidates`/`jobs`.

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/005_candidates.sql
git commit -m "Add Supabase schema for candidates, notes, timeline events, and scorecards"
```

---

## Task 7: Seed candidates + notes + timeline + scorecards

**Files:**
- Create: `supabase/migrations/006_seed_candidates.sql`

- [ ] **Step 1: Write the seed SQL**

```sql
-- supabase/migrations/006_seed_candidates.sql

insert into candidates (id, name, initials, avatar_color, job_id, stage, source, location, email, phone, current_role, expected_salary, availability, days_in_stage, ai_score, ai_dimensions, skills, prior_interaction, is_duplicate, is_stale, is_top_candidate, is_internal_applicant) values
('cand-001', 'Jordan Alvarez', 'JA', 'navy', 'job-001', 'hired', 'LinkedIn', 'Chicago, IL', 'j.alvarez@email.com', '(312) 555-0142', 'Payroll Sr. Assoc. · ADP', '$95K–$105K', '2 weeks notice', 4, 87, '{"payrollExpertise":96,"softwareSystems":88,"compliance":82,"leadership":74,"cultureFit":91}', ARRAY['ADP Workforce Now','CPP Certified','Multi-state Tax'], null, false, false, true, false),
('cand-002', 'Priya Natarajan', 'PN', 'green', 'job-001', 'offer', 'Referral', 'Detroit, MI', 'p.natarajan@email.com', '(313) 555-0198', 'Payroll Manager · Paychex', '$100K–$110K', 'Immediate', 3, 93, '{"payrollExpertise":94,"softwareSystems":90,"compliance":95,"leadership":89,"cultureFit":88}', ARRAY['UKG Pro','CPP Certified','Team Leadership'], '{"year":2024,"role":"Tax Analyst","recruiter":"T. Smith"}', false, false, true, false),
('cand-003', 'Chris Lawson', 'CL', 'orange', 'job-002', 'screening', 'Indeed', 'Troy, MI', 'c.lawson@email.com', '(248) 555-0177', 'Staff Accountant · RSM', '$60K–$66K', '4 weeks notice', 4, 71, '{"payrollExpertise":58,"softwareSystems":74,"compliance":70,"leadership":45,"cultureFit":79}', ARRAY['QuickBooks','Excel','GAAP'], null, true, false, false, false),
('cand-004', 'Maya Okafor', 'MO', 'purple', 'job-003', 'interviewing', 'LinkedIn', 'Chicago, IL', 'm.okafor@email.com', '(312) 555-0163', 'VP Client Services · Insperity', '$140K–$150K', '3 weeks notice', 9, 90, '{"payrollExpertise":70,"softwareSystems":82,"compliance":85,"leadership":97,"cultureFit":93}', ARRAY['Client Retention','Team Leadership','HRIS Implementation'], null, false, true, true, false),
('cand-005', 'Diego Fernandez', 'DF', 'blue', 'job-002', 'new', 'Internal Job Board', 'Grand Rapids, MI', 'd.fernandez@email.com', '(616) 555-0104', 'Jr. Accountant · Rehmann', '$55K–$60K', '2 weeks notice', 1, 64, '{"payrollExpertise":40,"softwareSystems":68,"compliance":60,"leadership":30,"cultureFit":75}', ARRAY['Excel','NetSuite'], null, false, false, false, true),
('cand-006', 'Sara Kim', 'SK', 'green', 'job-001', 'new', 'Career Site', 'Detroit, MI', 's.kim@email.com', '(313) 555-0121', 'Payroll Coordinator · Kelly Services', '$78K–$88K', '2 weeks notice', 1, 74, '{"payrollExpertise":68,"softwareSystems":72,"compliance":65,"leadership":55,"cultureFit":80}', ARRAY['Excel','Multi-state Tax'], null, false, false, false, false),
('cand-007', 'Marcus Webb', 'MW', 'blue', 'job-001', 'screening', 'Indeed', 'Detroit, MI', 'm.webb@email.com', '(313) 555-0134', 'Payroll Specialist · Gusto', '$82K–$92K', '3 weeks notice', 4, 68, '{"payrollExpertise":62,"softwareSystems":70,"compliance":66,"leadership":48,"cultureFit":71}', ARRAY['Gusto','Payroll Reconciliation'], null, false, false, false, false),
('cand-008', 'Elena Vasquez', 'EV', 'purple', 'job-001', 'interviewing', 'LinkedIn', 'Detroit, MI', 'e.vasquez@email.com', '(313) 555-0147', 'Sr. Payroll Analyst · Ceridian', '$92K–$102K', '2 weeks notice', 6, 81, '{"payrollExpertise":84,"softwareSystems":79,"compliance":80,"leadership":68,"cultureFit":83}', ARRAY['Ceridian Dayforce','CPP Certified','Compliance Audits'], null, false, false, false, false),
('cand-009', 'Brian Yoder', 'BY', 'orange', 'job-001', 'rejected', 'Indeed', 'Detroit, MI', 'b.yoder@email.com', '(313) 555-0158', 'AP Clerk · Local Company', '$60K–$65K', 'Immediate', 20, 52, '{"payrollExpertise":38,"softwareSystems":55,"compliance":40,"leadership":30,"cultureFit":60}', ARRAY['Accounts Payable'], null, false, false, false, false);

insert into candidate_notes (candidate_id, author, office, date, body) values
('cand-001', 'T. Smith', 'Detroit', '2026-06-18', 'Strong technical interview. Very sharp on multi-state compliance.'),
('cand-002', 'T. Smith', 'Detroit', '2026-06-27', 'Referred by current employee. Excellent culture fit signals.'),
('cand-003', 'M. Reyes', 'Troy', '2026-06-24', 'Possible duplicate: matches candidate cand-003b on phone + resume similarity, different email domain.'),
('cand-007', 'T. Smith', 'Detroit', '2026-06-29', 'Solid fundamentals, light on multi-state experience.'),
('cand-009', 'T. Smith', 'Detroit', '2026-06-15', 'Did not meet minimum payroll experience requirement.');

insert into candidate_timeline_events (candidate_id, stage, date, note) values
('cand-001', 'Application', '2026-06-15', 'Applied via LinkedIn'),
('cand-002', 'Application', '2026-06-10', 'Referred by A. Chen'),
('cand-003', 'Application', '2026-06-21', 'Applied via Indeed'),
('cand-004', 'Application', '2026-06-05', 'Applied via LinkedIn'),
('cand-005', 'Application', '2026-07-01', 'Applied via Internal Job Board'),
('cand-006', 'Application', '2026-07-01', 'Applied via Career Site'),
('cand-007', 'Application', '2026-06-27', 'Applied via Indeed'),
('cand-008', 'Application', '2026-06-19', 'Applied via LinkedIn'),
('cand-009', 'Application', '2026-06-10', 'Applied via Indeed');

insert into candidate_scorecards (candidate_id, interviewer, date, dimensions) values
('cand-001', 'T. Smith', '2026-06-18', '{"payrollExpertise":9,"softwareSystems":8,"compliance":8,"leadership":7,"cultureFit":9}'),
('cand-002', 'T. Smith', '2026-06-22', '{"payrollExpertise":9,"softwareSystems":9,"compliance":10,"leadership":9,"cultureFit":9}'),
('cand-004', 'A. Chen', '2026-06-19', '{"payrollExpertise":6,"softwareSystems":8,"compliance":8,"leadership":10,"cultureFit":9}');
```

- [ ] **Step 2: Apply via Supabase MCP**

Call `apply_migration` with `name: "seed_candidates"` and the SQL above.

- [ ] **Step 3: Verify**

`execute_sql`:
```sql
select
  (select count(*) from candidates) as candidates,
  (select count(*) from candidate_notes) as notes,
  (select count(*) from candidate_timeline_events) as timeline_events,
  (select count(*) from candidate_scorecards) as scorecards;
```
Expected: `9, 5, 9, 3`.

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/006_seed_candidates.sql
git commit -m "Seed candidates, notes, timeline events, and scorecards from existing src/data/candidates.js"
```

---

## Task 8: Migration — offers + offer_approvals + RLS

**Files:**
- Create: `supabase/migrations/007_offers.sql`

- [ ] **Step 1: Write the migration SQL**

```sql
-- supabase/migrations/007_offers.sql

create table offers (
  id text primary key,
  candidate_id text not null references candidates(id),
  job_id text references jobs(id),
  salary numeric not null,
  bonus text not null,
  pto text not null,
  start_date date,
  sent_date date,
  expiry_date date,
  status text not null,
  esig_status text not null,
  esig_viewed_date date,
  esig_signed_date date,
  payroll_synced boolean not null default false
);
alter table offers enable row level security;
create policy "offers_anon_select" on offers for select to anon using (true);
create policy "offers_anon_insert" on offers for insert to anon with check (true);
create policy "offers_anon_update" on offers for update to anon using (true) with check (true);

create table offer_approvals (
  id bigint generated always as identity primary key,
  offer_id text not null references offers(id),
  role text not null,
  name text not null,
  approved boolean not null default false,
  date date
);
alter table offer_approvals enable row level security;
create policy "offer_approvals_anon_select" on offer_approvals for select to anon using (true);
create policy "offer_approvals_anon_insert" on offer_approvals for insert to anon with check (true);
create policy "offer_approvals_anon_update" on offer_approvals for update to anon using (true) with check (true);
```

- [ ] **Step 2: Apply via Supabase MCP**

Call `apply_migration` with `name: "offers"` and the SQL above.

- [ ] **Step 3: Verify**

`list_tables` (verbose): confirm both tables exist with FKs.

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/007_offers.sql
git commit -m "Add Supabase schema for offers and offer approvals"
```

---

## Task 9: Seed offers + offer_approvals

**Files:**
- Create: `supabase/migrations/008_seed_offers.sql`

- [ ] **Step 1: Write the seed SQL**

```sql
-- supabase/migrations/008_seed_offers.sql

insert into offers (id, candidate_id, job_id, salary, bonus, pto, start_date, sent_date, expiry_date, status, esig_status, esig_viewed_date, esig_signed_date, payroll_synced) values
('offer-001', 'cand-002', 'job-001', 101000, '10% of base', '15 days + 10 holidays', '2026-08-01', '2026-06-28', '2026-07-10', 'awaiting', 'pending', null, null, false),
('offer-002', 'cand-004', 'job-003', 145000, '15% of base', '20 days + 10 holidays', '2026-08-15', '2026-06-20', '2026-06-27', 'expired', 'pending', null, null, false),
('offer-003', 'cand-001', 'job-001', 98000, '8% of base', '15 days + 10 holidays', '2026-07-20', '2026-06-15', '2026-06-22', 'accepted', 'signed', '2026-06-17', '2026-06-18', true),
('offer-004', 'cand-006', 'job-001', 82000, '5% of base', '15 days + 10 holidays', '2026-07-21', '2026-06-25', '2026-07-02', 'declined', 'pending', '2026-06-26', null, false);

insert into offer_approvals (offer_id, role, name, approved, date) values
('offer-001', 'HR Director', 'A. Chen', true, '2026-06-27'),
('offer-001', 'VP Finance', 'L. Torres', false, null),
('offer-002', 'HR Director', 'A. Chen', true, '2026-06-19'),
('offer-002', 'VP Finance', 'L. Torres', true, '2026-06-19'),
('offer-003', 'HR Director', 'A. Chen', true, '2026-06-14'),
('offer-004', 'HR Director', 'A. Chen', true, '2026-06-24');
```

- [ ] **Step 2: Apply via Supabase MCP**

Call `apply_migration` with `name: "seed_offers"` and the SQL above.

- [ ] **Step 3: Verify**

`execute_sql`:
```sql
select (select count(*) from offers) as offers, (select count(*) from offer_approvals) as approvals;
```
Expected: `4, 6`.

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/008_seed_offers.sql
git commit -m "Seed offers and offer approvals from existing src/data/offers.js"
```

---

## Task 10: Migration — reminders + RLS (no seed)

**Files:**
- Create: `supabase/migrations/009_reminders.sql`

- [ ] **Step 1: Write the migration SQL**

```sql
-- supabase/migrations/009_reminders.sql

create table reminders (
  id bigint generated always as identity primary key,
  candidate_id text references candidates(id),
  offer_id text references offers(id),
  type text not null,
  sent_at timestamptz not null default now(),
  sent_by text,
  message text
);
alter table reminders enable row level security;
create policy "reminders_anon_select" on reminders for select to anon using (true);
create policy "reminders_anon_insert" on reminders for insert to anon with check (true);
create policy "reminders_anon_update" on reminders for update to anon using (true) with check (true);
```

This table stays empty — it exists for sub-project B (reminders wiring) to write into. No hook is built for it in this plan (nothing here would call it yet — that's YAGNI until B wires the actual Send Reminder buttons).

- [ ] **Step 2: Apply via Supabase MCP**

Call `apply_migration` with `name: "reminders"` and the SQL above.

- [ ] **Step 3: Verify**

`list_tables` (verbose): confirm `reminders` exists with FKs to `candidates` and `offers`.

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/009_reminders.sql
git commit -m "Add empty Supabase schema for reminders log (backs sub-project B)"
```

---

## Task 11: Full schema verification

**Files:** none (verification only)

- [ ] **Step 1: List every table**

Call `list_tables` with `verbose: true`. Expected 15 tables total: `offices`, `users`, `role_workflow_templates`, `onboarding_packets`, `integrations`, `why_dm_hire_features`, `analytics`, `jobs`, `candidates`, `candidate_notes`, `candidate_timeline_events`, `candidate_scorecards`, `offers`, `offer_approvals`, `reminders`.

- [ ] **Step 2: Run advisors check**

Call `mcp__plugin_supabase_supabase__get_advisors` with `project_id: "uvwsxzynbpmrbckmqhzy"`, `type: "security"`.
Expected: no unexpected findings beyond the intentional open RLS policies documented in the spec (those are a deliberate, spec-approved decision, not a bug to fix).

- [ ] **Step 3: Spot-check a join**

`execute_sql`:
```sql
select c.name, c.stage, j.title
from candidates c
join jobs j on j.id = c.job_id
order by c.id
limit 3;
```
Expected: `Jordan Alvarez | hired | Senior Payroll Analyst`, `Priya Natarajan | offer | Senior Payroll Analyst`, `Chris Lawson | screening | Staff Accountant`.

No commit for this task — verification only.

---

## Task 12: `useOffices` hook

**Files:**
- Create: `src/hooks/useOffices.js`

- [ ] **Step 1: Write the hook**

```js
// src/hooks/useOffices.js
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'
import { rowToCamel, toSnakeRow } from '../lib/caseConvert'

export function useOffices() {
  const [offices, setOffices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    supabase.from('offices').select('*').then(({ data, error }) => {
      if (error) setError(error)
      else setOffices(rowToCamel(data))
      setLoading(false)
    })
  }, [])

  const addOffice = useCallback(async (office) => {
    const { data, error } = await supabase.from('offices').insert(toSnakeRow(office)).select().single()
    if (error) { setError(error); return }
    setOffices((list) => [...list, rowToCamel(data)])
  }, [])

  return { offices, loading, error, addOffice }
}
```

- [ ] **Step 2: Verify**

Run: `npm run lint`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useOffices.js
git commit -m "Add useOffices hook"
```

---

## Task 13: `useUsers` hook

**Files:**
- Create: `src/hooks/useUsers.js`

- [ ] **Step 1: Write the hook**

```js
// src/hooks/useUsers.js
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'
import { rowToCamel, toSnakeRow } from '../lib/caseConvert'

export function useUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    supabase.from('users').select('*').then(({ data, error }) => {
      if (error) setError(error)
      else setUsers(rowToCamel(data))
      setLoading(false)
    })
  }, [])

  const inviteUser = useCallback(async (user) => {
    const { data, error } = await supabase.from('users').insert(toSnakeRow(user)).select().single()
    if (error) { setError(error); return }
    setUsers((list) => [...list, rowToCamel(data)])
  }, [])

  return { users, loading, error, inviteUser }
}
```

- [ ] **Step 2: Verify**

Run: `npm run lint`

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useUsers.js
git commit -m "Add useUsers hook"
```

---

## Task 14: `useRoleWorkflowTemplates` hook

**Files:**
- Create: `src/hooks/useRoleWorkflowTemplates.js`

- [ ] **Step 1: Write the hook**

Returns `roleWorkflows` as a keyed object (matching the original `roleWorkflows.manager.stages` access pattern).

```js
// src/hooks/useRoleWorkflowTemplates.js
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'
import { rowToCamel } from '../lib/caseConvert'

export function useRoleWorkflowTemplates() {
  const [roleWorkflows, setRoleWorkflows] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    supabase.from('role_workflow_templates').select('*').then(({ data, error }) => {
      if (error) { setError(error); setLoading(false); return }
      const byKey = {}
      rowToCamel(data).forEach((t) => {
        byKey[t.roleKey] = { label: t.label, knockoutYears: t.knockoutYears, approvalChain: t.approvalChain, stages: t.stages }
      })
      setRoleWorkflows(byKey)
      setLoading(false)
    })
  }, [])

  const updateStages = useCallback(async (roleKey, stages) => {
    const { error } = await supabase.from('role_workflow_templates').update({ stages }).eq('role_key', roleKey)
    if (error) { setError(error); return }
    setRoleWorkflows((t) => ({ ...t, [roleKey]: { ...t[roleKey], stages } }))
  }, [])

  return { roleWorkflows, loading, error, updateStages }
}
```

- [ ] **Step 2: Verify**

Run: `npm run lint`

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useRoleWorkflowTemplates.js
git commit -m "Add useRoleWorkflowTemplates hook"
```

---

## Task 15: `useOnboardingPackets` hook

**Files:**
- Create: `src/hooks/useOnboardingPackets.js`

- [ ] **Step 1: Write the hook**

```js
// src/hooks/useOnboardingPackets.js
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'
import { rowToCamel } from '../lib/caseConvert'

export function useOnboardingPackets() {
  const [onboardingPackets, setOnboardingPackets] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    supabase.from('onboarding_packets').select('*').then(({ data, error }) => {
      if (error) { setError(error); setLoading(false); return }
      const byState = {}
      rowToCamel(data).forEach((p) => {
        byState[p.state] = { state: p.stateName, documents: p.documents }
      })
      setOnboardingPackets(byState)
      setLoading(false)
    })
  }, [])

  const addDocument = useCallback(async (stateKey, doc) => {
    const nextDocs = [...onboardingPackets[stateKey].documents, doc]
    const { error } = await supabase.from('onboarding_packets').update({ documents: nextDocs }).eq('state', stateKey)
    if (error) { setError(error); return }
    setOnboardingPackets((p) => ({ ...p, [stateKey]: { ...p[stateKey], documents: nextDocs } }))
  }, [onboardingPackets])

  const removeDocument = useCallback(async (stateKey, doc) => {
    const nextDocs = onboardingPackets[stateKey].documents.filter((d) => d !== doc)
    const { error } = await supabase.from('onboarding_packets').update({ documents: nextDocs }).eq('state', stateKey)
    if (error) { setError(error); return }
    setOnboardingPackets((p) => ({ ...p, [stateKey]: { ...p[stateKey], documents: nextDocs } }))
  }, [onboardingPackets])

  const addPacket = useCallback(async (stateKey, stateName) => {
    const { error } = await supabase.from('onboarding_packets').insert({ state: stateKey, state_name: stateName, documents: [] })
    if (error) { setError(error); return }
    setOnboardingPackets((p) => ({ ...p, [stateKey]: { state: stateName, documents: [] } }))
  }, [])

  return { onboardingPackets, loading, error, addDocument, removeDocument, addPacket }
}
```

- [ ] **Step 2: Verify**

Run: `npm run lint`

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useOnboardingPackets.js
git commit -m "Add useOnboardingPackets hook"
```

---

## Task 16: `useIntegrations` hook

**Files:**
- Create: `src/hooks/useIntegrations.js`

- [ ] **Step 1: Write the hook**

```js
// src/hooks/useIntegrations.js
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'
import { rowToCamel, toSnakeRow } from '../lib/caseConvert'

export function useIntegrations() {
  const [integrations, setIntegrations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    supabase.from('integrations').select('*').then(({ data, error }) => {
      if (error) setError(error)
      else setIntegrations(rowToCamel(data))
      setLoading(false)
    })
  }, [])

  const updateIntegration = useCallback(async (id, patch) => {
    const { error } = await supabase.from('integrations').update(toSnakeRow(patch)).eq('id', id)
    if (error) { setError(error); return }
    setIntegrations((list) => list.map((i) => (i.id === id ? { ...i, ...patch } : i)))
  }, [])

  return { integrations, loading, error, updateIntegration }
}
```

- [ ] **Step 2: Verify**

Run: `npm run lint`

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useIntegrations.js
git commit -m "Add useIntegrations hook"
```

---

## Task 17: `useAnalytics` hook

**Files:**
- Create: `src/hooks/useAnalytics.js`

- [ ] **Step 1: Write the hook**

The `data` jsonb blob was seeded with camelCase keys already (it's an opaque display payload, not a row of columns), so no case conversion is needed here.

```js
// src/hooks/useAnalytics.js
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

export function useAnalytics() {
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    supabase.from('analytics').select('data').eq('id', 'default').single().then(({ data, error }) => {
      if (error) setError(error)
      else setAnalytics(data.data)
      setLoading(false)
    })
  }, [])

  return { analytics, loading, error }
}
```

- [ ] **Step 2: Verify**

Run: `npm run lint`

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useAnalytics.js
git commit -m "Add useAnalytics hook"
```

---

## Task 18: `useWhyDmHireFeatures` hook

**Files:**
- Create: `src/hooks/useWhyDmHireFeatures.js`

- [ ] **Step 1: Write the hook**

```js
// src/hooks/useWhyDmHireFeatures.js
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { rowToCamel } from '../lib/caseConvert'

export function useWhyDmHireFeatures() {
  const [whyDmHireFeatures, setWhyDmHireFeatures] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    supabase.from('why_dm_hire_features').select('*').order('id').then(({ data, error }) => {
      if (error) setError(error)
      else setWhyDmHireFeatures(rowToCamel(data))
      setLoading(false)
    })
  }, [])

  return { whyDmHireFeatures, loading, error }
}
```

- [ ] **Step 2: Verify**

Run: `npm run lint`

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useWhyDmHireFeatures.js
git commit -m "Add useWhyDmHireFeatures hook"
```

---

## Task 19: `useJobs` hook

**Files:**
- Create: `src/hooks/useJobs.js`

- [ ] **Step 1: Write the hook**

`stageCounts` is computed here (not stored in the DB — see spec section 4), by reducing a lightweight `job_id, stage` fetch from `candidates`.

```js
// src/hooks/useJobs.js
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'
import { rowToCamel, toSnakeRow } from '../lib/caseConvert'

const STAGES = ['new', 'screening', 'interviewing', 'offer', 'hired', 'rejected']

function computeStageCounts(jobId, candidateRows) {
  const counts = Object.fromEntries(STAGES.map((s) => [s, 0]))
  candidateRows.filter((c) => c.job_id === jobId).forEach((c) => { counts[c.stage] += 1 })
  return counts
}

export function useJobs() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    Promise.all([
      supabase.from('jobs').select('*'),
      supabase.from('candidates').select('job_id, stage'),
    ]).then(([jobsRes, candidatesRes]) => {
      if (jobsRes.error) { setError(jobsRes.error); setLoading(false); return }
      if (candidatesRes.error) { setError(candidatesRes.error); setLoading(false); return }
      const withCounts = jobsRes.data.map((j) => ({ ...j, stage_counts: computeStageCounts(j.id, candidatesRes.data) }))
      setJobs(rowToCamel(withCounts))
      setLoading(false)
    })
  }, [])

  const createJob = useCallback(async (job) => {
    const { stageCounts: _unused, ...toInsert } = job
    const { data, error } = await supabase.from('jobs').insert(toSnakeRow(toInsert)).select().single()
    if (error) { setError(error); return }
    setJobs((list) => [{ ...rowToCamel(data), stageCounts: computeStageCounts(data.id, []) }, ...list])
  }, [])

  return { jobs, loading, error, createJob }
}
```

- [ ] **Step 2: Verify**

Run: `npm run lint`

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useJobs.js
git commit -m "Add useJobs hook with client-computed stageCounts"
```

---

## Task 20: `useCandidates` hook

**Files:**
- Create: `src/hooks/useCandidates.js`

- [ ] **Step 1: Write the hook**

Nested `select` reattaches `candidate_notes`/`candidate_timeline_events`/`candidate_scorecards` as `notes`/`timeline`/`scorecard` arrays on each candidate, matching the original embedded-array shape.

```js
// src/hooks/useCandidates.js
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'
import { rowToCamel, toSnakeRow } from '../lib/caseConvert'

const SELECT = '*, candidate_notes(*), candidate_timeline_events(*), candidate_scorecards(*)'

function shapeCandidate(row) {
  return {
    ...rowToCamel(row),
    notes: rowToCamel(row.candidate_notes ?? []),
    timeline: rowToCamel(row.candidate_timeline_events ?? []),
    scorecard: rowToCamel(row.candidate_scorecards ?? []),
  }
}

export function useCandidates() {
  const [candidates, setCandidates] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    supabase.from('candidates').select(SELECT).then(({ data, error }) => {
      if (error) setError(error)
      else setCandidates(data.map(shapeCandidate))
      setLoading(false)
    })
  }, [])

  const updateStage = useCallback(async (id, stage) => {
    const today = new Date().toISOString().slice(0, 10)
    const { error: updateError } = await supabase.from('candidates').update({ stage }).eq('id', id)
    if (updateError) { setError(updateError); return }
    const { data: eventData, error: insertError } = await supabase.from('candidate_timeline_events')
      .insert({ candidate_id: id, stage, date: today, note: `Moved to ${stage}` })
      .select().single()
    if (insertError) { setError(insertError); return }
    setCandidates((list) => list.map((c) => (c.id === id
      ? { ...c, stage, timeline: [...c.timeline, rowToCamel(eventData)] }
      : c)))
  }, [])

  const addNote = useCallback(async (id, note) => {
    const { data, error } = await supabase.from('candidate_notes')
      .insert({ candidate_id: id, ...toSnakeRow(note) })
      .select().single()
    if (error) { setError(error); return }
    setCandidates((list) => list.map((c) => (c.id === id ? { ...c, notes: [...c.notes, rowToCamel(data)] } : c)))
  }, [])

  return { candidates, loading, error, updateStage, addNote }
}
```

- [ ] **Step 2: Verify**

Run: `npm run lint`

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useCandidates.js
git commit -m "Add useCandidates hook with nested notes/timeline/scorecard and updateStage/addNote mutations"
```

---

## Task 21: `useOffers` hook

**Files:**
- Create: `src/hooks/useOffers.js`

- [ ] **Step 1: Write the hook**

`offer_approvals` reattaches as `approvalChain`, matching the original embedded-array shape. `createOffer` treats an empty-string `startDate` (used by the draft-offer default in `CandidateProfile.jsx`) as `null`, since Postgres `date` columns reject `''`.

```js
// src/hooks/useOffers.js
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'
import { rowToCamel, toSnakeRow } from '../lib/caseConvert'

const SELECT = '*, offer_approvals(*)'

function shapeOffer(row) {
  return { ...rowToCamel(row), approvalChain: rowToCamel(row.offer_approvals ?? []) }
}

export function useOffers() {
  const [offers, setOffers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    supabase.from('offers').select(SELECT).then(({ data, error }) => {
      if (error) setError(error)
      else setOffers(data.map(shapeOffer))
      setLoading(false)
    })
  }, [])

  const createOffer = useCallback(async (offer) => {
    const { approvalChain, startDate, ...rest } = offer
    const { data, error } = await supabase.from('offers')
      .insert(toSnakeRow({ ...rest, startDate: startDate || null }))
      .select().single()
    if (error) { setError(error); return null }
    const approvalRows = approvalChain.map((a) => ({ offer_id: data.id, ...toSnakeRow(a) }))
    const { data: approvalData, error: approvalError } = await supabase.from('offer_approvals').insert(approvalRows).select()
    if (approvalError) { setError(approvalError); return null }
    const shaped = { ...rowToCamel(data), approvalChain: rowToCamel(approvalData) }
    setOffers((list) => [...list, shaped])
    return shaped
  }, [])

  const updateOffer = useCallback(async (id, patch) => {
    const { approvalChain, ...fieldPatch } = patch
    if (Object.keys(fieldPatch).length > 0) {
      const { error } = await supabase.from('offers').update(toSnakeRow(fieldPatch)).eq('id', id)
      if (error) { setError(error); return }
    }
    if (approvalChain) {
      for (const approval of approvalChain) {
        const { error } = await supabase.from('offer_approvals')
          .update({ approved: approval.approved, date: approval.date })
          .eq('offer_id', id).eq('role', approval.role)
        if (error) { setError(error); return }
      }
    }
    setOffers((list) => list.map((o) => (o.id === id ? { ...o, ...patch } : o)))
  }, [])

  return { offers, loading, error, createOffer, updateOffer }
}
```

- [ ] **Step 2: Verify**

Run: `npm run lint`

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useOffers.js
git commit -m "Add useOffers hook with nested approvalChain and createOffer/updateOffer mutations"
```

---

## Task 22: Wire `Settings.jsx`

**Files:**
- Modify: `src/views/Settings.jsx`

- [ ] **Step 1: Swap imports**

Replace lines 1-15:

```jsx
import { useState } from 'react'
import { Plus, X, FileText } from 'lucide-react'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import FilterChip from '../components/ui/FilterChip'
import Modal from '../components/ui/Modal'
import DataTable from '../components/ui/DataTable'
import Loading from '../components/ui/Loading'
import { useSimulatedLoad } from '../hooks/useSimulatedLoad'
import { useOffices } from '../hooks/useOffices'
import { useRoleWorkflowTemplates } from '../hooks/useRoleWorkflowTemplates'
import { useOnboardingPackets } from '../hooks/useOnboardingPackets'
import { useUsers } from '../hooks/useUsers'
import { useJobs } from '../hooks/useJobs'
import './Settings.css'
```

- [ ] **Step 2: `OfficesTab` — read from hook, persist Add Office**

Replace the `OfficesTab` function (originally lines 67-127):

```jsx
function OfficesTab() {
  const { offices, loading, addOffice } = useOffices()
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({ name: '', address: '', region: 'Midwest' })

  function submit() {
    addOffice({ id: `office-${Date.now()}`, name: form.name, address: form.address, region: form.region, city: form.name, state: 'MI' })
    setModalOpen(false)
    setForm({ name: '', address: '', region: 'Midwest' })
  }

  if (loading) return <Loading />

  return (
    <div>
      <div className="settings-panel-hdr">
        <div>
          <div className="settings-panel-title">Offices</div>
          <div className="settings-panel-sub">Each office's location informs geo-based job board targeting.</div>
        </div>
        <Button variant="primary" size="sm" onClick={() => setModalOpen(true)}><Plus size={14} /> Add Office</Button>
      </div>

      <div className="settings-card-grid">
        {offices.map((o) => (
          <Card key={o.id}>
            <Card.Body>
              <div className="settings-office-name">{o.name}</div>
              <div className="settings-office-addr">{o.address}</div>
              <div className="settings-office-region">{o.region} region</div>
            </Card.Body>
          </Card>
        ))}
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Add Office"
        footer={<>
          <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
          <Button variant="primary" disabled={!form.name.trim() || !form.address.trim()} onClick={submit}>Add Office</Button>
        </>}
      >
        <div className="settings-form-row">
          <label>Office Name</label>
          <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. Grand Rapids" />
        </div>
        <div className="settings-form-row">
          <label>Address</label>
          <input value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} placeholder="Street, City, State ZIP" />
        </div>
        <div className="settings-form-row">
          <label>Region</label>
          <select value={form.region} onChange={(e) => setForm((f) => ({ ...f, region: e.target.value }))}>
            {REGIONS.map((r) => <option key={r}>{r}</option>)}
          </select>
        </div>
        <div className="settings-geo-preview">Jobs posted from this office will be geo-targeted to boards serving the {form.region} region.</div>
      </Modal>
    </div>
  )
}
```

Note: the original form has no city/state fields, only name/address/region — `city`/`state` are set to placeholder values (`form.name`/`'MI'`) since the `offices` table requires them `not null`. This is a pre-existing UI gap (the Add Office form never collected city/state), not something this migration should silently paper over with better UX than before — flagging it here rather than expanding scope.

- [ ] **Step 3: `WorkflowsTab` — read from hook, auto-persist stage edits**

Replace the `WorkflowsTab` function (originally lines 129-179):

```jsx
function WorkflowsTab() {
  const { roleWorkflows, loading, updateStages } = useRoleWorkflowTemplates()
  const [roleKey, setRoleKey] = useState('manager')
  const [stages, setStages] = useState(null)

  if (loading) return <Loading />
  const activeStages = stages ?? roleWorkflows[roleKey].stages

  function selectRole(key) {
    setRoleKey(key)
    setStages(null)
  }
  function updateStage(i, field, value) {
    const next = activeStages.map((st, idx) => (idx === i ? { ...st, [field]: value } : st))
    setStages(next)
    updateStages(roleKey, next)
  }
  function addStage() {
    const next = [...activeStages, { name: '', approver: 'Hiring Manager', slaDays: 3 }]
    setStages(next)
    updateStages(roleKey, next)
  }
  function removeStage(i) {
    const next = activeStages.filter((_, idx) => idx !== i)
    setStages(next)
    updateStages(roleKey, next)
  }

  return (
    <div>
      <div className="settings-panel-hdr">
        <div>
          <div className="settings-panel-title">Workflows</div>
          <div className="settings-panel-sub">Interview stages, approver, and SLA per role template.</div>
        </div>
      </div>

      <div className="settings-role-tabs">
        {Object.entries(roleWorkflows).map(([key, t]) => (
          <FilterChip key={key} active={roleKey === key} onClick={() => selectRole(key)}>{t.label}</FilterChip>
        ))}
      </div>

      <div className="settings-stage-list">
        <div className="settings-stage-row settings-stage-row-hdr">
          <span>Stage</span><span>Approver</span><span>SLA (days)</span><span />
        </div>
        {activeStages.length === 0 && <div className="settings-hint">No stages in this workflow yet. Add one below.</div>}
        {activeStages.map((s, i) => (
          <div className="settings-stage-row" key={i}>
            <input value={s.name} onChange={(e) => updateStage(i, 'name', e.target.value)} />
            <input value={s.approver} onChange={(e) => updateStage(i, 'approver', e.target.value)} />
            <input type="number" min="1" value={s.slaDays} onChange={(e) => updateStage(i, 'slaDays', Number(e.target.value))} />
            <button type="button" className="settings-row-remove" onClick={() => removeStage(i)} aria-label="Remove stage"><X size={14} /></button>
          </div>
        ))}
      </div>
      <Button variant="ghost" size="sm" onClick={addStage}><Plus size={14} /> Add Stage</Button>
    </div>
  )
}
```

Note: this is a behavior improvement over the original (which never persisted stage edits anywhere, even to the in-memory `roleWorkflows` object) — full migration means these edits now actually stick, per the scope decision in the spec.

- [ ] **Step 4: `OnboardingTab` — read from hook, persist doc/packet edits**

Replace the `OnboardingTab` function (originally lines 181-268):

```jsx
function OnboardingTab() {
  const { onboardingPackets, loading, addDocument, removeDocument, addPacket } = useOnboardingPackets()
  const [stateKey, setStateKey] = useState(null)
  const [editing, setEditing] = useState(false)
  const [docDraft, setDocDraft] = useState('')
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [newPacket, setNewPacket] = useState({ abbr: '', state: '' })

  if (loading) return <Loading />

  const states = Object.keys(onboardingPackets)
  const activeKey = stateKey ?? states[0]
  const packet = onboardingPackets[activeKey]

  function addDoc() {
    if (!docDraft.trim()) return
    addDocument(activeKey, docDraft.trim())
    setDocDraft('')
  }
  function submitNewPacket() {
    const abbr = newPacket.abbr.trim().toUpperCase()
    addPacket(abbr, newPacket.state.trim())
    setStateKey(abbr)
    setAddModalOpen(false)
    setNewPacket({ abbr: '', state: '' })
    setEditing(true)
  }

  return (
    <div>
      <div className="settings-panel-hdr">
        <div>
          <div className="settings-panel-title">Onboarding Packets</div>
          <div className="settings-panel-sub">State-specific documents required for new hires.</div>
        </div>
        <Button variant="primary" size="sm" onClick={() => setAddModalOpen(true)}><Plus size={14} /> Add Packet</Button>
      </div>

      <div className="settings-role-tabs">
        {states.map((s) => (
          <FilterChip key={s} active={activeKey === s} onClick={() => { setStateKey(s); setEditing(false) }}>{onboardingPackets[s].state}</FilterChip>
        ))}
      </div>

      <Card>
        <Card.Body>
          {packet.documents.length === 0 && <div className="settings-hint">No documents in this packet yet.</div>}
          {packet.documents.map((doc) => (
            <div className="settings-doc-row" key={doc}>
              <FileText size={14} /> <span>{doc}</span>
              {editing && <button type="button" className="settings-row-remove" onClick={() => removeDocument(activeKey, doc)} aria-label="Remove document"><X size={14} /></button>}
            </div>
          ))}
          {editing && (
            <div className="settings-doc-add">
              <input value={docDraft} onChange={(e) => setDocDraft(e.target.value)} placeholder="Add a document…" />
              <Button variant="ghost" size="sm" onClick={addDoc}>Add</Button>
            </div>
          )}
          <div className="settings-panel-actions">
            <Button variant={editing ? 'primary' : 'ghost'} size="sm" onClick={() => setEditing((e) => !e)}>
              {editing ? 'Done Editing' : 'Edit Packet'}
            </Button>
          </div>
        </Card.Body>
      </Card>

      <Modal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Add Onboarding Packet"
        footer={<>
          <Button variant="ghost" onClick={() => setAddModalOpen(false)}>Cancel</Button>
          <Button variant="primary" disabled={!newPacket.abbr.trim() || !newPacket.state.trim()} onClick={submitNewPacket}>Add Packet</Button>
        </>}
      >
        <div className="settings-form-row">
          <label>State Abbreviation</label>
          <input value={newPacket.abbr} onChange={(e) => setNewPacket((f) => ({ ...f, abbr: e.target.value }))} placeholder="e.g. OH" maxLength={2} />
        </div>
        <div className="settings-form-row">
          <label>State Name</label>
          <input value={newPacket.state} onChange={(e) => setNewPacket((f) => ({ ...f, state: e.target.value }))} placeholder="e.g. Ohio" />
        </div>
      </Modal>
    </div>
  )
}
```

- [ ] **Step 5: `UsersTab` — read from hook, persist Invite User**

Replace the `UsersTab` function (originally lines 336-406) — swap `users`/`setUsers` for the hook, `jobs` import for `useJobs()`, and call `inviteUser`:

```jsx
function UsersTab() {
  const { users, loading: usersLoading, inviteUser } = useUsers()
  const { jobs } = useJobs()
  const [modalOpen, setModalOpen] = useState(false)
  const [phase, setPhase] = useState('idle') // idle | inviting
  const simulatedLoading = useSimulatedLoad()
  const [form, setForm] = useState({ name: '', email: '', role: 'Recruiter' })

  function invite() {
    setPhase('inviting')
    setTimeout(() => {
      inviteUser({ id: `user-${Date.now()}`, ...form, assignedJobIds: [], status: 'invited' })
      setPhase('idle')
      setModalOpen(false)
      setForm({ name: '', email: '', role: 'Recruiter' })
    }, 900)
  }

  const columns = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'role', label: 'Role', sortable: true, render: (r) => <Badge variant={r.role === 'Admin' ? 'accepted' : r.role === 'Recruiter' ? 'new' : 'interviewing'}>{r.role}</Badge> },
    {
      key: 'assignedJobIds', label: 'Assigned Jobs',
      render: (r) => r.assignedJobIds.length
        ? r.assignedJobIds.map((id) => jobs.find((j) => j.id === id)?.title).filter(Boolean).join(', ')
        : '-',
    },
    { key: 'status', label: 'Status', render: (r) => r.status === 'invited' ? <Badge variant="awaiting">Invited</Badge> : <Badge variant="accepted">Active</Badge> },
  ]

  if (usersLoading) return <Loading />

  return (
    <div>
      <div className="settings-panel-hdr">
        <div>
          <div className="settings-panel-title">Users</div>
          <div className="settings-panel-sub">Who has access, their role, and which jobs they're assigned to.</div>
        </div>
        <Button variant="primary" size="sm" onClick={() => setModalOpen(true)}><Plus size={14} /> Invite User</Button>
      </div>

      <Card><DataTable columns={columns} rows={users} loading={simulatedLoading} /></Card>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Invite User"
        footer={<>
          <Button variant="ghost" onClick={() => setModalOpen(false)} disabled={phase === 'inviting'}>Cancel</Button>
          <Button variant="primary" disabled={!form.name.trim() || !form.email.trim() || phase === 'inviting'} onClick={invite}>
            {phase === 'inviting' ? 'Sending Invite…' : 'Send Invite'}
          </Button>
        </>}
      >
        <div className="settings-form-row">
          <label>Name</label>
          <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
        </div>
        <div className="settings-form-row">
          <label>Email</label>
          <input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
        </div>
        <div className="settings-form-row">
          <label>Role</label>
          <select value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}>
            {ROLE_OPTIONS.map((r) => <option key={r}>{r}</option>)}
          </select>
        </div>
      </Modal>
    </div>
  )
}
```

- [ ] **Step 6: Verify**

Run: `npm run lint`
Run: `npm run dev`, open `/settings`, click through Offices/Workflows/Onboarding/Users tabs. Confirm each renders real data (no "Loading…" stuck, no console errors), and that Add Office / edit a workflow stage / add an onboarding doc / Invite User all work and persist across a page refresh (real proof the Supabase write worked, not just local state).

- [ ] **Step 7: Commit**

```bash
git add src/views/Settings.jsx
git commit -m "Wire Settings.jsx to Supabase-backed hooks"
```

---

## Task 23: Wire `Integrations.jsx`

**Files:**
- Modify: `src/views/Integrations.jsx`

- [ ] **Step 1: Swap import and state**

Replace line 1 and line 6:

```jsx
import { Wallet, CalendarClock, Link2, Globe2, ShieldCheck, ClipboardList, Building2, Loader2 } from 'lucide-react'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Loading from '../components/ui/Loading'
import { useIntegrations } from '../hooks/useIntegrations'
import './Integrations.css'
```

- [ ] **Step 2: Replace state/handlers**

Replace lines 20-38 (component body through `connect`):

```jsx
export default function Integrations() {
  const { integrations, loading, updateIntegration } = useIntegrations()
  const [connectingId, setConnectingId] = useState(null)

  function togglePause(id) {
    const current = integrations.find((i) => i.id === id)
    updateIntegration(id, { status: current.status === 'connected' ? 'paused' : 'connected' })
  }

  function connect(id) {
    setConnectingId(id)
    setTimeout(() => {
      updateIntegration(id, { status: 'connected', lastSync: TODAY })
      setConnectingId(null)
    }, 900)
  }
```

Note: `useState` needs to stay imported for `connectingId` — since `useState` was removed from the import line replaced in Step 1, add it back:

```jsx
import { useState } from 'react'
```

(as the first line of the file, ahead of the lucide-react import).

- [ ] **Step 3: Add a loading guard**

Immediately after the `connect` function's closing brace, before the `return (`, add:

```jsx
  if (loading) return <Loading />

```

- [ ] **Step 4: Verify**

Run: `npm run lint`
Run: `npm run dev`, open `/integrations`, click Connect on `dm-payroll-hris` and Pause on `dm-payroll`. Refresh the page and confirm both changes persisted.

- [ ] **Step 5: Commit**

```bash
git add src/views/Integrations.jsx
git commit -m "Wire Integrations.jsx to useIntegrations hook"
```

---

## Task 24: Wire `JobRequisitions.jsx`

**Files:**
- Modify: `src/views/JobRequisitions.jsx`

`candidates`, `offices`, and `roleWorkflows` (as `ROLE_TEMPLATES`) are currently plain module-level imports referenced directly by name inside `JobRow`, `NewRequisitionModal`, and the exported component (confirmed by reading the full file — none of it is threaded through props today). Since these become hook-sourced values owned by the exported component, `JobRow` and `NewRequisitionModal` need new props for them.

- [ ] **Step 1: Swap imports**

Replace lines 14-17:

```jsx
import { useJobs } from '../hooks/useJobs'
import { useOffices } from '../hooks/useOffices'
import { useCandidates } from '../hooks/useCandidates'
import { useRoleWorkflowTemplates } from '../hooks/useRoleWorkflowTemplates'
import Loading from '../components/ui/Loading'
```

- [ ] **Step 2: `JobRow` — accept `candidates` as a prop**

Replace line 47 and line 49:

```jsx
function JobRow({ job, candidates, onShare, sharedId, onOpen }) {
  const Icon = DEPT_ICONS[job.department] ?? Briefcase
  const topCandidates = candidates.filter((c) => c.jobId === job.id)
```

(everything else in `JobRow`, lines 50-96, is unchanged)

- [ ] **Step 3: `NewRequisitionModal` — accept `offices` and `roleWorkflows` as props, rename `ROLE_TEMPLATES` throughout**

Replace line 113:

```jsx
function NewRequisitionModal({ open, onClose, onCreate, offices, roleWorkflows }) {
```

Replace line 122 (`handleRoleTemplateChange`):

```jsx
  function handleRoleTemplateChange(key) {
    const template = roleWorkflows[key]
```

Replace `buildJob` (lines 167-189) — also drops `stageCounts`, which `useJobs().createJob` now computes fresh from the (empty) candidate set for a brand-new job:

```jsx
  function buildJob(status) {
    const office = offices.find((o) => o.id === form.officeId)
    const template = roleWorkflows[form.roleTemplate]
    return {
      id: `job-${Date.now()}`,
      title: form.title || 'Untitled Requisition',
      department: form.department,
      location: office ? `${office.city}, ${office.state}` : '',
      officeId: form.officeId,
      compRange: form.compRange,
      postedDate: new Date().toISOString().slice(0, 10),
      status,
      isInternal: form.internalOnly,
      roleTemplate: form.roleTemplate,
      boards: form.internalOnly ? [] : form.boards,
      knockoutRules: form.knockoutRules,
      approvalChain: template.approvalChain,
      hiringManagerId: null,
      daysOpen: 0,
      applicantCount: 0,
    }
  }
```

Replace line 208 (just above the `return (`):

```jsx
  const template = roleWorkflows[form.roleTemplate]
```

Replace line 251 (office `<select>` options — unchanged reference, `offices` is now a prop instead of a module import, so this line's text is identical, listed here only so the diff is unambiguous):

```jsx
                {offices.map((o) => <option key={o.id} value={o.id}>{o.name} - {o.city}, {o.state}</option>)}
```

Replace line 281 (role template buttons):

```jsx
              {Object.entries(roleWorkflows).map(([key, t]) => (
```

- [ ] **Step 4: Replace the exported component**

Replace lines 371-394:

```jsx
export default function JobRequisitions() {
  const navigate = useNavigate()
  const { jobs: jobsList, loading: jobsLoading, createJob } = useJobs()
  const { offices, loading: officesLoading } = useOffices()
  const { candidates, loading: candidatesLoading } = useCandidates()
  const { roleWorkflows, loading: workflowsLoading } = useRoleWorkflowTemplates()
  const [filter, setFilter] = useState('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [sharedId, setSharedId] = useState(null)

  if (jobsLoading || officesLoading || candidatesLoading || workflowsLoading) return <Loading />

  const counts = FILTERS.reduce((acc, f) => {
    acc[f.key] = f.key === 'all' ? jobsList.length : jobsList.filter((j) => j.status === f.key).length
    return acc
  }, {})

  const filteredJobs = filter === 'all' ? jobsList : jobsList.filter((j) => j.status === filter)

  function handleShare(job) {
    const url = `https://dmhire.com/apply/${slugify(job.title)}`
    navigator.clipboard?.writeText(url).catch(() => {})
    setSharedId(job.id)
    setTimeout(() => setSharedId(null), 1500)
  }

  function handleCreate(job) {
    createJob(job)
  }
```

(the `counts`/`filteredJobs`/`handleShare` bodies are unchanged from the original — reproduced here since Step 4 replaces the whole block they live in)

- [ ] **Step 5: Update the render to pass the new props through**

Replace lines 419-432 (the `jobs-grid` map and the modal render):

```jsx
        <div className="jobs-grid">
          {filteredJobs.map((job) => (
            <JobRow
              key={job.id}
              job={job}
              candidates={candidates}
              onShare={handleShare}
              sharedId={sharedId}
              onOpen={(j) => navigate(`/pipeline?job=${j.id}`)}
            />
          ))}
        </div>
      )}

      <NewRequisitionModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreate={handleCreate}
        offices={offices}
        roleWorkflows={roleWorkflows}
      />
```

- [ ] **Step 6: Verify**

Run: `npm run lint`
Run: `npm run dev`, open `/jobs`. Confirm the funnel counts (`stageCounts`) render correctly, then create a new draft requisition and confirm it appears in the list and persists across a refresh.

- [ ] **Step 7: Commit**

```bash
git add src/views/JobRequisitions.jsx
git commit -m "Wire JobRequisitions.jsx to Supabase-backed hooks"
```

---

## Task 25: Wire `Dashboard.jsx`

**Files:**
- Modify: `src/views/Dashboard.jsx`

- [ ] **Step 1: Swap imports**

Replace lines 14-17:

```jsx
import { useCandidates } from '../hooks/useCandidates'
import { useJobs } from '../hooks/useJobs'
import { useOffers } from '../hooks/useOffers'
import { useAnalytics } from '../hooks/useAnalytics'
import Loading from '../components/ui/Loading'
```

- [ ] **Step 2: Replace the data-fetching lines at the top of the component**

Replace line 32 (`const navigate = useNavigate()`) — insert the hooks and loading guard immediately after it, before line 34's `openRequisitions` (the first line that reads `jobs`):

```jsx
  const navigate = useNavigate()
  const { candidates, loading: candidatesLoading } = useCandidates()
  const { jobs, loading: jobsLoading } = useJobs()
  const { offers, loading: offersLoading } = useOffers()
  const { analytics, loading: analyticsLoading } = useAnalytics()

  if (candidatesLoading || jobsLoading || offersLoading || analyticsLoading) return <Loading />

```

Everything from the original line 34 (`const openRequisitions = ...`) onward is unchanged — it already reads `jobs`/`candidates`/`offers`/`analytics` by the same names the hooks now provide.

- [ ] **Step 3: Verify**

Run: `npm run lint`
Run: `npm run dev`, open `/` (Dashboard). Confirm funnel counts, DM Payroll status card, and reminders link all render with real data.

- [ ] **Step 4: Commit**

```bash
git add src/views/Dashboard.jsx
git commit -m "Wire Dashboard.jsx to Supabase-backed hooks"
```

---

## Task 26: Wire `Pipeline.jsx`

**Files:**
- Modify: `src/views/Pipeline.jsx`

- [ ] **Step 1: Swap imports**

Replace lines 8-11:

```jsx
import { useJobs } from '../hooks/useJobs'
import { useCandidates } from '../hooks/useCandidates'
import { useOffers } from '../hooks/useOffers'
import { useUsers } from '../hooks/useUsers'
import Loading from '../components/ui/Loading'
```

- [ ] **Step 2: Add the data hooks after the last existing hook call**

The component calls several hooks before doing any data work (`useNavigate`, `useSearchParams`, two `useState`, `usePersona`), then a `useMemo` further down (line 155) before its first early return (`if (!selectedJob)` at line 162). React requires every hook to run unconditionally on every render, so the new data hooks go in with the others and the loading guard goes after the *last* hook call (the `useMemo`), not before the first one — otherwise the loading-guard's early return would skip hooks on some renders and React will throw "Rendered fewer hooks than expected."

Replace line 139 (`const { persona } = usePersona()`) — insert the four new hooks immediately after it:

```jsx
  const { persona } = usePersona()
  const { jobs, loading: jobsLoading } = useJobs()
  const { candidates, loading: candidatesLoading } = useCandidates()
  const { offers, loading: offersLoading } = useOffers()
  const { users, loading: usersLoading } = useUsers()
```

Lines 140-158 (`isHiringManager` through the `useMemo` closing `)`) are unchanged — they already reference `jobs`/`candidates`/`users` by the same names the hooks provide.

Replace line 162 (the existing `if (!selectedJob)` guard) to add the loading check ahead of it, since it must come after the `useMemo` on line 155-158:

```jsx
  if (jobsLoading || candidatesLoading || offersLoading || usersLoading) return <Loading />
  if (!selectedJob) {
    return <EmptyState title="No requisitions yet" subtitle="Create a job requisition to start a pipeline." />
  }
```

No mutation wiring needed here — confirmed by inspection that Pipeline.jsx has no existing stage-transition or data-mutation logic today (card action buttons are decorative, per the product design principle of not adding stage-transition logic until a sprint/task specifically calls for it — that's sub-projects B and C, not this one).

- [ ] **Step 3: Verify**

Run: `npm run lint`
Run: `npm run dev`, open `/pipeline`, confirm the kanban board renders real candidates grouped by stage, with correct counts.

- [ ] **Step 4: Commit**

```bash
git add src/views/Pipeline.jsx
git commit -m "Wire Pipeline.jsx to Supabase-backed hooks"
```

---

## Task 27: Wire `Offers.jsx`

**Files:**
- Modify: `src/views/Offers.jsx`

- [ ] **Step 1: Swap imports**

Replace lines 11-13:

```jsx
import { useOffers } from '../hooks/useOffers'
import { useCandidates } from '../hooks/useCandidates'
import { useJobs } from '../hooks/useJobs'
import Loading from '../components/ui/Loading'
```

- [ ] **Step 2: Add the data hooks after the last existing hook call**

The component already calls `useNavigate`, two `useState`s, and `useSimulatedLoad` (line 35 — a decorative loading-shimmer flag, not real data loading; keep it, it's unrelated). Add the new hooks immediately after line 35, so the loading guard comes after every hook in the component:

```jsx
  const loading = useSimulatedLoad()
  const { offers, loading: offersLoading } = useOffers()
  const { candidates, loading: candidatesLoading } = useCandidates()
  const { jobs, loading: jobsLoading } = useJobs()

  if (offersLoading || candidatesLoading || jobsLoading) return <Loading />
```

No mutation wiring for `handleSendReminders` — its `reminderPhase` simulation doesn't write to any migrated entity today (it doesn't touch `offers` at all), and building the real reminders log is explicitly sub-project B's scope, not this one.

- [ ] **Step 3: Verify**

Run: `npm run lint`
Run: `npm run dev`, open `/offers`, confirm the offers table renders with correct candidate/job names and days-until-expiry.

- [ ] **Step 4: Commit**

```bash
git add src/views/Offers.jsx
git commit -m "Wire Offers.jsx to Supabase-backed hooks"
```

---

## Task 28: Wire `Reports.jsx`

**Files:**
- Modify: `src/views/Reports.jsx`

- [ ] **Step 1: Swap imports**

Replace lines 10-11:

```jsx
import { useAnalytics } from '../hooks/useAnalytics'
import { useJobs } from '../hooks/useJobs'
import Loading from '../components/ui/Loading'
```

- [ ] **Step 2: Replace the data-fetching lines, keeping every hook unconditional**

The original `const [selectedJobId, setSelectedJobId] = useState(jobs[0].id)` (line 28) assumed `jobs` was already populated synchronously — with async fetching, `jobs` starts as `[]` and `jobs[0].id` would throw. The component also calls `useSimulatedLoad()` (line 30) with no existing early return anywhere — that hook call must stay unconditional too, so it has to run *before* the new loading guard, not get skipped by it.

Replace lines 26-30 (`export default function Reports() {` through `const loading = useSimulatedLoad()`):

```jsx
export default function Reports() {
  const { analytics, loading: analyticsLoading } = useAnalytics()
  const { jobs, loading: jobsLoading } = useJobs()
  const [dateRange, setDateRange] = useState(DATE_RANGES[0])
  const [selectedJobId, setSelectedJobId] = useState(null)
  const loading = useSimulatedLoad()

  if (analyticsLoading || jobsLoading) return <Loading />

  const activeJobId = selectedJobId ?? jobs[0].id
  const selectedJob = jobs.find((j) => j.id === activeJobId)
```

This drops the original line 29 (`const selectedJob = jobs.find((j) => j.id === selectedJobId)`) since it's now folded into the block above using `activeJobId`.

Then at line 130, change the job-picker `<select>`'s `value` prop from `selectedJobId` to `activeJobId` (it's a controlled input — using the raw, possibly-`null` `selectedJobId` before the user has picked anything would break the control):

```jsx
          <select className="reports-job-select" value={activeJobId} onChange={(e) => setSelectedJobId(e.target.value)}>
```

No other reference to `selectedJobId` or `selectedJob` in the file needs to change (lines 38-42, 135) — they already read `selectedJob`, which is still defined, just now derived from `activeJobId`.

- [ ] **Step 3: Verify**

Run: `npm run lint`
Run: `npm run dev`, open `/reports`, confirm charts render, and switching the job selector updates the per-job funnel.

- [ ] **Step 4: Commit**

```bash
git add src/views/Reports.jsx
git commit -m "Wire Reports.jsx to Supabase-backed hooks"
```

---

## Task 29: Wire `InternalJobs.jsx`

**Files:**
- Modify: `src/views/InternalJobs.jsx`

- [ ] **Step 1: Swap import**

Replace line 6:

```jsx
import { useJobs } from '../hooks/useJobs'
import Loading from '../components/ui/Loading'
```

- [ ] **Step 2: Add the data hook after the existing hooks**

The component calls two `useState`s (lines 10-11) with no existing early return. Add the new hook after both, so the loading guard doesn't skip them on the loading render:

```jsx
  const [appliedIds, setAppliedIds] = useState([])
  const [applyingId, setApplyingId] = useState(null)
  const { jobs, loading } = useJobs()

  if (loading) return <Loading />
```

- [ ] **Step 3: Verify**

Run: `npm run lint`
Run: `npm run dev`, open `/internal-jobs`, confirm internal-only listings render.

- [ ] **Step 4: Commit**

```bash
git add src/views/InternalJobs.jsx
git commit -m "Wire InternalJobs.jsx to useJobs hook"
```

---

## Task 30: Wire `WhyDMHire.jsx`

**Files:**
- Modify: `src/views/WhyDMHire.jsx`

- [ ] **Step 1: Swap import**

Replace line 11:

```jsx
import { useWhyDmHireFeatures } from '../hooks/useWhyDmHireFeatures'
import Loading from '../components/ui/Loading'
```

- [ ] **Step 2: Add the data hook after the existing hook**

The component's only hook is `useNavigate()` (line 52), with no existing early return. Add the new hook after it, so the loading guard doesn't skip it:

```jsx
  const navigate = useNavigate()
  const { whyDmHireFeatures, loading } = useWhyDmHireFeatures()

  if (loading) return <Loading />
```

- [ ] **Step 3: Verify**

Run: `npm run lint`
Run: `npm run dev`, open `/why-dm-hire`, confirm all 28 feature cards render.

- [ ] **Step 4: Commit**

```bash
git add src/views/WhyDMHire.jsx
git commit -m "Wire WhyDMHire.jsx to useWhyDmHireFeatures hook"
```

---

## Task 31: Wire `CandidatePortal.jsx` (minimal — owned by another branch)

**Files:**
- Modify: `src/views/CandidatePortal.jsx`

This file is being rebuilt on a separate branch (`candidate-applicant-view`) by another contributor, so this task makes the smallest possible change: swap the one `jobs` import so this branch doesn't break once `src/data/jobs.js` is deleted (Task 33). No other behavior in this file changes.

- [ ] **Step 1: Swap import**

Replace line 10:

```jsx
import { useJobs } from '../hooks/useJobs'
import Loading from '../components/ui/Loading'
```

- [ ] **Step 2: Add the hook call and loading guard after the existing hooks**

The component calls nine hooks before doing anything else (`useNavigate`, `usePersona`, seven `useState`s, lines 28-37), with no existing early return. Add the new hook after all of them:

```jsx
  const [signPhase, setSignPhase] = useState('idle') // idle | signing | signed
  const { jobs, loading } = useJobs()

  if (loading) return <Loading />
```

- [ ] **Step 3: Verify**

Run: `npm run lint`
Run: `npm run dev`, open `/portal`, confirm job search still renders.

- [ ] **Step 4: Commit**

```bash
git add src/views/CandidatePortal.jsx
git commit -m "Wire CandidatePortal.jsx jobs import to useJobs hook (minimal change, file owned by candidate-applicant-view branch)"
```

---

## Task 32: Wire `CandidateProfile.jsx`

**Files:**
- Modify: `src/views/CandidateProfile.jsx`

This is the most involved view: it already has real mutations (add note, generate/edit/send offer, simulate e-sign) that today only touch local `useState`, never persisted. This task makes those mutations write to Supabase.

- [ ] **Step 1: Swap imports**

Replace lines 16-18:

```jsx
import { useCandidates } from '../hooks/useCandidates'
import { useJobs } from '../hooks/useJobs'
import { useOffers } from '../hooks/useOffers'
import Loading from '../components/ui/Loading'
```

- [ ] **Step 2: Replace the top of the component through the `useEffect`**

Replace lines 84-121:

```jsx
export default function CandidateProfile() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { candidates, loading: candidatesLoading, addNote } = useCandidates()
  const { jobs, loading: jobsLoading } = useJobs()
  const { offers, loading: offersLoading, createOffer, updateOffer } = useOffers()
  const { persona } = usePersona()
  const isHiringManager = persona === 'hiring_manager'
  const tabs = isHiringManager ? TABS.filter((t) => t.key !== 'offer') : TABS

  const [activeTab, setActiveTab] = useState(location.state?.tab ?? 'timeline')
  const [noteDraft, setNoteDraft] = useState('')
  const [offerDraft, setOfferDraft] = useState(null)
  const [offerEditing, setOfferEditing] = useState(false)
  const [offerPhase, setOfferPhase] = useState('idle') // idle | sending
  const [notSelected, setNotSelected] = useState(false)

  useEffect(() => {
    setActiveTab(location.state?.tab ?? 'timeline')
    setNoteDraft('')
    setOfferDraft(null)
    setOfferEditing(false)
    setOfferPhase('idle')
    setNotSelected(false)
  }, [id, location])

  if (candidatesLoading || jobsLoading || offersLoading) return <Loading />

  const candidate = candidates.find((c) => c.id === id)

  if (!candidate) {
    return (
      <EmptyState
        title="Candidate not found"
        subtitle="This candidate may have been removed."
        ctaLabel="Back to Pipeline"
        onCta={() => navigate('/pipeline')}
      />
    )
  }

  const job = jobs.find((j) => j.id === candidate.jobId)
  const persistedOffer = offers.find((o) => o.candidateId === id) ?? null
  const offer = offerDraft ?? persistedOffer
```

Note: `notes` is now read directly off `candidate.notes` (from the hook) instead of separate local state — see Step 3. The original `if (!candidate)` guard (originally lines 112-120) is preserved above, just moved after the loading guard and `candidate` lookup.

Note on the `useEffect` dependency array: the original was `[id, candidate, location]`. This drops `candidate` deliberately — `candidate` now comes fresh from the `useCandidates` hook on every render instead of being copied into local state, so its object reference changes on *any* candidates-array mutation (e.g. right after `addNote` succeeds), not just on navigating to a different candidate. Keeping `candidate` in the deps would re-fire this effect after every note/stage mutation and kick the user back to the `timeline` tab immediately after, say, adding a note while on the Notes tab — a real regression the dependency array must avoid, not an oversight.

- [ ] **Step 3: Replace `handleAddNote`, `handleGenerateOffer`, `handleSendForApproval`, `handleMarkNotSelected`**

Replace the block originally at lines 133-181:

```jsx
  function handleAddNote() {
    if (!noteDraft.trim()) return
    addNote(candidate.id, { author: CURRENT_RECRUITER, office: CURRENT_OFFICE, date: TODAY, body: noteDraft.trim() })
    setNoteDraft('')
  }

  function handleGenerateOffer() {
    createOffer({
      id: `offer-${Date.now()}`,
      candidateId: candidate.id,
      jobId: candidate.jobId,
      salary: 0,
      bonus: '10% of base',
      pto: '15 days + 10 holidays',
      startDate: '',
      sentDate: null,
      expiryDate: null,
      status: 'draft',
      approvalChain: [
        { role: 'HR Director', name: 'A. Chen', approved: false, date: null },
        { role: 'VP Finance', name: 'L. Torres', approved: false, date: null },
      ],
      esigStatus: 'pending',
      esigViewedDate: null,
      esigSignedDate: null,
      payrollSynced: false,
    })
    setOfferEditing(true)
  }

  function handleSendForApproval() {
    setOfferPhase('sending')
    setTimeout(() => {
      const patch = {
        status: 'awaiting',
        sentDate: TODAY,
        expiryDate: '2026-07-14',
        salary: offer.salary,
        bonus: offer.bonus,
        pto: offer.pto,
        startDate: offer.startDate,
        approvalChain: offer.approvalChain.map((a) => ({ ...a, approved: true, date: a.date ?? TODAY })),
      }
      updateOffer(offer.id, patch)
      setOfferDraft(null)
      setOfferEditing(false)
      setOfferPhase('idle')
    }, 1000)
  }

  function handleMarkNotSelected() {
    if (!window.confirm(`Mark ${candidate.name} as Not Selected?`)) return
    setNotSelected(true)
  }
```

Note: `handleMarkNotSelected` is deliberately left exactly as it was — a local-only, undoable banner (the existing "Undo" button just calls `setNotSelected(false)`). Wiring it to a real, persisted `stage: 'rejected'` update would break that Undo affordance (the DB write would stick even after "undoing" the banner, since Undo has no way to revert a stage change back to its prior value). Real, correctly-reversible stage transitions are sub-project C's job (pipeline stage progression), not this data-layer task — this task only persists mutations that were already meant to be permanent (notes, offers, e-sign).

Note: `createOffer` in the hook (Task 21) already generates the row via the id you pass — swapped the old `offer-draft-${candidate.id}` placeholder id for a real `offer-${Date.now()}` id since this row is now actually inserted into Postgres, not just held in local state. Field edits during `offerEditing` (salary/bonus/pto/startDate inputs) continue to only update `offerDraft` locally — see Step 4 — and are only persisted in bulk on `handleSendForApproval`, consistent with the "confirm-first, not optimistic" mutation design from the spec (nothing is written to Supabase per-keystroke).

- [ ] **Step 4: Update the `OfferTab` `onChange` wiring for draft editing vs. persisted e-sign actions**

Where `<OfferTab offer={offer} editing={offerEditing} phase={offerPhase} onGenerate={handleGenerateOffer} onEdit={() => setOfferEditing(true)} onChange={setOffer} onSendForApproval={handleSendForApproval} />` is rendered (originally around line 246), replace with two distinct callbacks:

```jsx
          <OfferTab
            offer={offer}
            editing={offerEditing}
            phase={offerPhase}
            onGenerate={handleGenerateOffer}
            onEdit={() => setOfferEditing(true)}
            onDraftChange={(next) => setOfferDraft(typeof next === 'function' ? next(offer) : next)}
            onPersistedChange={(patch) => {
              const resolved = typeof patch === 'function' ? patch(offer) : patch
              updateOffer(offer.id, resolved)
            }}
            onSendForApproval={handleSendForApproval}
          />
```

- [ ] **Step 5: Update `OfferTab` itself to use the two callbacks**

Replace the `OfferTab` function signature and esig handlers (originally lines 528-546):

```jsx
function OfferTab({ offer, editing, phase, onGenerate, onEdit, onDraftChange, onPersistedChange, onSendForApproval }) {
  const [esigPhase, setEsigPhase] = useState('idle') // idle | viewing | signing

  function handleSimulateView() {
    setEsigPhase('viewing')
    setTimeout(() => {
      onPersistedChange({ esigViewedDate: TODAY })
      setEsigPhase('idle')
    }, 900)
  }

  function handleSimulateSign() {
    setEsigPhase('signing')
    setTimeout(() => {
      onPersistedChange({ esigStatus: 'signed', esigSignedDate: TODAY, status: 'accepted' })
      setEsigPhase('idle')
      setTimeout(() => onPersistedChange({ payrollSynced: true }), 1400)
    }, 900)
  }
```

Then further down in the same function, every field edit during `editing` mode (originally `onChange={(e) => onChange({ ...offer, salary: Number(e.target.value) })}` etc., around lines 570-573) becomes `onDraftChange`:

```jsx
              <div className="cp-offer-edit-row"><label>Base Salary</label><input type="number" value={offer.salary} onChange={(e) => onDraftChange({ ...offer, salary: Number(e.target.value) })} /></div>
              <div className="cp-offer-edit-row"><label>Bonus</label><input value={offer.bonus} onChange={(e) => onDraftChange({ ...offer, bonus: e.target.value })} /></div>
              <div className="cp-offer-edit-row"><label>PTO</label><input value={offer.pto} onChange={(e) => onDraftChange({ ...offer, pto: e.target.value })} /></div>
              <div className="cp-offer-edit-row"><label>Start Date</label><input type="date" value={offer.startDate} onChange={(e) => onDraftChange({ ...offer, startDate: e.target.value })} /></div>
```

- [ ] **Step 6: Update the Notes tab render to read `candidate.notes`**

The only place the render body reads the old local `notes` state directly is the Notes tab (originally lines 309-310); `buildTimeline` (lines 54, 69) already reads `candidate.notes`, not local state, so those need no change. Replace:

```jsx
                  {candidate.notes.length === 0 && <div className="cp-empty-inline">No notes yet.</div>}
                  {candidate.notes.map((n, i) => (
```

- [ ] **Step 7: Verify**

Run: `npm run lint`
Run: `npm run dev`, open a candidate profile (e.g. `/candidates/cand-003`, which has no offer yet):
1. Add a note → confirm it appears, refresh the page, confirm it's still there.
2. Generate an offer, edit the salary field, click Send for Approval → confirm status changes to "awaiting" and persists across a refresh.
3. On an already-accepted offer's profile (`/candidates/cand-001`), confirm the offer renders without needing to regenerate it.
4. Simulate view + sign on an awaiting offer (e.g. `/candidates/cand-002`) → confirm `esigStatus`/`status` update and persist across a refresh.

- [ ] **Step 8: Commit**

```bash
git add src/views/CandidateProfile.jsx
git commit -m "Wire CandidateProfile.jsx to Supabase-backed hooks with persisted note/offer/esig mutations"
```

---

## Task 33: Delete old static data files

**Files:**
- Delete: `src/data/candidates.js`
- Delete: `src/data/jobs.js`
- Delete: `src/data/offers.js`
- Delete: `src/data/offices.js`
- Delete: `src/data/users.js`
- Delete: `src/data/workflows.js`
- Delete: `src/data/integrations.js`
- Delete: `src/data/whyDmHireFeatures.js`
- Delete: `src/data/onboardingPackets.js`
- Delete: `src/data/analytics.js`

`src/data/tourSteps.js` is explicitly kept — it's guided-tour UI copy, not a business record (see spec section 2).

- [ ] **Step 1: Confirm no remaining references**

Run: `grep -rn "from '\.\./data/candidates'\|from '\.\./data/jobs'\|from '\.\./data/offers'\|from '\.\./data/offices'\|from '\.\./data/users'\|from '\.\./data/workflows'\|from '\.\./data/integrations'\|from '\.\./data/whyDmHireFeatures'\|from '\.\./data/onboardingPackets'\|from '\.\./data/analytics'" src/`
Expected: no output (every view was already re-pointed at a hook in Tasks 22-32).

- [ ] **Step 2: Delete the files**

```bash
git rm src/data/candidates.js src/data/jobs.js src/data/offers.js src/data/offices.js src/data/users.js src/data/workflows.js src/data/integrations.js src/data/whyDmHireFeatures.js src/data/onboardingPackets.js src/data/analytics.js
```

- [ ] **Step 3: Verify the build still works**

Run: `npm run build`
Expected: build succeeds with no "module not found" errors.

- [ ] **Step 4: Commit**

```bash
git commit -m "Delete static src/data/*.js files now that all entities are Supabase-backed"
```

---

## Task 34: Full manual verification pass

**Files:** none (verification only)

- [ ] **Step 1: Start the dev server**

Run: `npm run dev`

- [ ] **Step 2: Click through every affected view**

For each route, confirm it loads real Supabase data with no console errors: `/` (Dashboard), `/jobs` (Job Requisitions), `/pipeline` (Pipeline), `/candidates/cand-001` (Candidate Profile), `/offers` (Offers), `/reports` (Reports), `/integrations` (Integrations), `/settings` (all six tabs), `/internal-jobs`, `/why-dm-hire`, `/portal`.

- [ ] **Step 3: Confirm persistence end-to-end**

Perform one write in each of these and refresh the browser to confirm it survived: Add Office (Settings), edit a Workflow stage (Settings), add an Onboarding document (Settings), Invite a User (Settings), connect/pause an Integration, create a draft Job Requisition, add a Candidate Note, generate + send an Offer for approval.

- [ ] **Step 4: Run the full lint pass**

Run: `npm run lint`
Expected: no errors across the whole `src/` tree.

- [ ] **Step 5: Run the full build**

Run: `npm run build`
Expected: succeeds.

No commit for this task — it's a verification pass over work already committed in Tasks 1-33.

---

## Self-Review Notes

- **Spec coverage:** every table in spec section 4 has a migration task (2, 4, 6, 8, 10); every hook in spec section 5's pattern has a task (12-21); every view identified as touching migrated data (11 views, verified by grep) has a wiring task (22-32); spec section 6 (seeding, deletion) is Tasks 3/5/7/9 and 33; spec section 7 (loading/error) is the shared `Loading` component plus per-view guards threaded through every wiring task.
- **Found during planning, not in the original spec:** `candidates.is_internal_applicant` (a one-off flag on `cand-005` easy to miss from a quick read) and `integrations.boards`/`integrations.tools` (extra columns on two integration rows) are both included in the DDL and seed data above — confirmed by re-reading the full source files before writing SQL, not by relying on the spec's summarized column lists.
- **Type consistency check:** hook return shapes were cross-checked against every view's actual field access (e.g. `job.stageCounts.screening`, `candidate.timeline`, `offer.approvalChain`) rather than assumed from the spec alone — this is what surfaced the need for `useJobs` to internally fetch `candidates` for count computation, and for `useCandidates`/`useOffers` to reattach child-table rows as the original array field names.
- **Rules-of-hooks pass:** every wiring task (22-32) was checked against the *actual* hook call order in each file, not assumed. This caught six real bugs where a loading-guard early return would have landed between existing hook calls — which crashes React with "Rendered fewer hooks than expected" the moment `loading` flips from `true` to `false` (Dashboard, Pipeline, Offers, Reports, InternalJobs, CandidatePortal all needed the guard moved after the *last* hook call, not the first). Reports.jsx additionally needed its `useState(jobs[0].id)` restructured since `jobs` is no longer synchronously populated.
- **Props-threading gap (Task 24):** `JobRequisitions.jsx`'s `JobRow` and `NewRequisitionModal` read `candidates`/`offices`/`roleWorkflows` as bare module-level imports today, not props — confirmed by reading the full file rather than assuming from the grep summary. Task 24 now gives the exact new prop signatures and call sites instead of "thread it down to wherever it's used."
- **Undo-safety gap (Task 32):** the original plan wired `handleMarkNotSelected` to a real, persisted `stage: 'rejected'` update — but the existing "Undo" button only ever did a local `setNotSelected(false)`, never a real revert. Persisting the forward action without a matching persisted undo would leave a candidate silently stuck as rejected after the user clicks "Undo." Reverted that one action to its original, fully-decorative behavior; real reversible stage transitions are sub-project C's job.
