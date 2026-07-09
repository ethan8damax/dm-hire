# Job Requisitions UX + Approval Workflow — Design Spec

## 1. Context & Purpose

This is sub-project **C** of the demo-notes effort, following sub-project A (Supabase data layer) and sub-project B (interactivity + reminders wiring, both already implemented and merged). C addresses client feedback specific to the Job Requisitions flow: the requisition list, the New/Edit Requisition modal, the pipeline's requisition indicator, and a related gap on the Candidate Profile page (no way to advance a candidate's stage from their own page).

**Audited against current code before writing this spec** (nothing below was already implemented):
- `Topbar.jsx`'s "+ New Requisition" button (line 160) just calls `navigate('/jobs')` — no modal wiring, redundant with the identical button already on `JobRequisitions.jsx`.
- The Hiring Manager field (`JobRequisitions.jsx` ~line 324) is free text and — more importantly — **is never persisted anywhere**: `buildJob()` hardcodes `hiringManagerId: null` and the edit path never sends it either, even though `jobs.hiring_manager_id` already exists as a real FK column and `users` already has four real `role = 'Hiring Manager'` rows.
- The knockout-questions builder (~line 383-415) is two parallel free-text inputs (`text`, `declineNote`) with no structure — confirmed via the client's own words: "it just doesn't make sense that you can write anything in there and there is no logic, no units, i just don't know how its quantified." Also confirmed knockout rules are never evaluated anywhere in the app (checked `ApplyWizard.jsx` and everywhere else) despite UI copy claiming "auto-declined after a 24-hour delay."
- No Requisition Detail page exists. Clicking a row opens the Edit modal directly (line 55); "View Pipeline" jumps straight to the Kanban board.
- The requisitions list is a single card grid with status filter chips only — no alternate view, no department grouping.
- `Pipeline.jsx`'s requisition indicator is a bare native `<select>` (line 213) sitting next to a generic, unchanging "Candidate Pipeline" H1 — the client called this "too subtle."
- `CandidateProfile.jsx` has no way to advance a candidate to the next stage — only "Mark Not Selected" (rejection) exists, despite `useCandidates.js` already having a working `updateStage(id, stage)` mutation (used today by Pipeline's drag-and-drop) and this same file already defining the ordered `FORWARD_STAGES` list.
- Pipeline's drag-and-drop (`handleDrop`, line 188-193) calls `updateStage` directly with zero confirmation.
- The shared `DatePicker.jsx` popup (`DatePicker.css` line 25-27) is hardcoded to open downward (`top: calc(100% + gap)`) with no viewport-edge detection — confirmed via screenshot showing the WOTC step's signature-date calendar clipped at the bottom of the viewport, because the trigger sits near the bottom of the page.
- No real approval action exists anywhere. Worse: for any single-approver chain (Intern, IC, Production Floor templates are all `approvalChain: ['hiring_manager']`, length 1), `JobRequisitions.jsx` line 258 skips `pending_approval` entirely and sets status straight to `'open'`. Even for multi-step chains that do reach `pending_approval`, nothing ever advances them except a recruiter manually editing the Status dropdown — and Hiring Managers can't even do that today, since the modal is fully read-only for them (`canEdit={isRecruiter}`).

**Already resolved, confirmed via direct database check — no work needed:** the "database permission to allow deletion of postings" ask. `supabase/migrations/012_jobs_anon_delete.sql` exists locally and the `jobs_anon_delete` policy is already live on the production database (confirmed via `pg_policies`), just untracked in the migrations history table (applied out-of-band at some point). Deletion already works.

## 2. Scope Decision

**In scope:**
1. Remove the redundant "+ New Requisition" button from `Topbar.jsx`.
2. Real Hiring Manager dropdown, persisted to the existing `hiring_manager_id` column.
3. Structured knockout rules (three types), replacing the free-text pair.
4. New Requisition Detail page (`/jobs/:id`), including hosting the new approval action (item 10).
5. Toggle between the existing card grid and a new grouped-by-department list view.
6. Pipeline header: requisition title becomes the real headline; job-switcher becomes a real control.
7. "Advance to next stage" button on `CandidateProfile.jsx`.
8. Confirmation dialog on Pipeline's drag-and-drop stage changes (same dialog pattern as #7).
9. Shared `DatePicker.jsx` viewport-flip fix (opens upward when there's no room below).
10. Real Hiring Manager approval gate: every requisition with an approval chain pauses at `pending_approval` until the assigned Hiring Manager approves; recruiters lose the direct bypass to `open` while pending.

**Explicitly out of scope (confirmed with user):**
- Wiring the *other* dead Kanban card action buttons ("Advance →", "Move to Offer", "Scorecard", "Phone Screen", "Decline", "Contact", "Feedback") — these echo item 7/8 but belong to sub-project **E** (drag-and-drop pipeline movement + list view + Scorecard button), not C. Only the already-working drag-and-drop path gets a confirm dialog added; the dead buttons are untouched.
- Real auto-evaluation of knockout rules against applicants (structure only, per client decision).
- Department/office-based filtering of the Hiring Manager dropdown (no such mapping exists in the data model; shows all Hiring Managers).
- Conversion-rate / time-in-stage metrics on the Requisition Detail page (funnel counts only, reusing existing `stageCounts`).
- Kanban-by-department view (grid + grouped-list only).
- Simulating `hr_director`/`vp_finance` approval steps via a fake persona-switch or "approve as" action — no persona exists for these roles (persona work is sub-project **G**); those chain steps remain display-only, unchanged from today.
- A persisted rejection-reason field/audit trail — captured via a simple optional prompt and surfaced through the existing `useNotifications` store, not a new schema column.
- Everything else already carved out for sub-projects E, F, G, H, I (dashboard funnel/table rework, sidebar/navbar/persona/profile, demo tour + Why DM Hire content, Reports PDF export + README).

## 3. Architecture

- **`Topbar.jsx`**: delete the button and its now-unused `navigate('/jobs')` handler reference. No new state, no context.
- **Hiring Manager dropdown**: no changes to `useUsers.js` — filtering `users.filter(u => u.role === 'Hiring Manager')` happens inline in `JobRequisitions.jsx`, the only call site (matches this codebase's existing pattern of not adding hook params for a single consumer). `form.hiringManagerId` replaces `form.hiringManager`; both `buildJob()` and the edit-save path in `handleSubmit` now send `hiringManagerId`.
- **Knockout rules**: `knockout_rules` is `jsonb` — no migration needed, only a shape change: `{ id, type: 'years_experience' | 'certification' | 'yes_no', value, disqualifyingAnswer? }` replaces `{ id, text, declineNote }`. `handleRoleTemplateChange`'s seeding logic updates to emit the new shape (role templates' `knockoutYears` seeds a `years_experience` rule, same as today).
- **Requisition Detail page**: new `src/views/RequisitionDetail.jsx`, new route `/jobs/:id` in `App.jsx` (parallel to the existing `/candidates/:id` → `CandidateProfile.jsx` pattern). Row click in `JobRequisitions.jsx` (`JobRow`'s `onClick`) navigates here instead of opening the edit modal; "View Pipeline" is unchanged. The page reuses `useJobs()`, `useCandidates()` (for the stage funnel), and the existing `RequisitionModal` (opened via an "Edit" button) — no new modal.
- **List views**: a local `view` state (`'grid' | 'list'`) in `JobRequisitions.jsx`, toggled by two icon buttons near the filter strip. The grouped-list view derives department groups client-side from the same `jobsList`/`filteredJobs` array already in memory — no new data fetching.
- **Pipeline header**: `Pipeline.jsx`'s header JSX restructures so `selectedJob.title` renders as the `<h1>` (wrapped in a `Link`/`onClick` to `/jobs/:id`), "Candidate Pipeline" becomes a small eyebrow label above it, and the job-switcher becomes a styled button/dropdown (still backed by the same `handleJobChange`/`searchParams` logic — no state changes, just markup and CSS).
- **Advance-stage button**: `CandidateProfile.jsx` gains a `NEXT_STAGE` lookup derived from the existing stage order (`new → screening → interviewing → offer → hired`), rendered in `cp-header-actions` when a next stage exists (hidden at `hired`/`rejected`). Calls the existing `updateStage(candidate.id, nextStage)` from `useCandidates()` after a `window.confirm('Move [Name] to [Stage]?')`.
- **Drag-and-drop confirm**: `Pipeline.jsx`'s `handleDrop` gains the identical `window.confirm(...)` check before calling `updateStage`, reusing the same message format as the new button for consistency.
- **DatePicker flip fix**: `DatePicker.jsx`'s trigger `onClick` measures `containerRef.current.getBoundingClientRect()` against `window.innerHeight` when opening; if insufficient room below (using the popup's typical height as a threshold), sets a boolean `openUpward` state. `DatePicker.css` gains a `.date-picker-popup-up` variant (`bottom: calc(100% + gap); top: auto;`) applied conditionally. No new dependency — plain DOM measurement, consistent with this component's existing hand-rolled approach (documented in its own comment as a deliberate choice over native `<input type="date">`).
- **Approval gate**: `JobRequisitions.jsx`'s `handleSubmit` submission logic changes from `template.approvalChain.length > 1 ? 'pending_approval' : 'open'` to always `'pending_approval'` when `template.approvalChain.length > 0` (which is every template today — all list at least `hiring_manager`). The Status `<select>` in the edit form (`RequisitionModal`, ~line 305) excludes the `'open'` option from its choices whenever the job's current status is `'pending_approval'`, forcing that transition through the real approval action instead. The approval action itself lives on the new Requisition Detail page: a `CURRENT_HM_ID = 'user-002'` constant (matching the same constant already duplicated in `Pipeline.jsx`, following this codebase's established no-shared-constants-module pattern) gates visibility — when `persona === 'hiring_manager' && job.hiringManagerId === CURRENT_HM_ID && job.status === 'pending_approval'`, "Approve" and "Reject" buttons render. Both call the existing `updateJob(job.id, { status })` from `useJobs()` — no new hook functions needed. Approve → `status: 'open'`. Reject → prompts `window.prompt('Reason for rejecting (optional):')`, then `updateJob(job.id, { status: 'draft' })`, then (if a reason was entered) `addNotification('Requisition rejected', reason)` via the already-existing `useNotifications()` store, so the recruiter sees it the next time they open the bell icon — no new schema, no new notification infrastructure.

## 4. Schema Changes

**None required.** Every field involved already exists:
- `jobs.hiring_manager_id` — exists, currently unused, now wired for real.
- `jobs.knockout_rules` — `jsonb`, shape change only, no migration.
- `jobs.status` — same column, same string values (`draft`/`pending_approval`/`open`/`closed`), only the transition rules around it change.
- The `jobs_anon_delete` RLS policy is already live (confirmed via `pg_policies`), so item 9's original ask needs no migration.
- No new column for rejection reasons — surfaced through the existing localStorage-backed `useNotifications` store instead.

## 5. Component Wiring

**`Topbar.jsx`**: remove the "+ New Requisition" `<Button>` (and the now-dead `navigate('/jobs')` handler if unused elsewhere in the file).

**`JobRequisitions.jsx`**:
- `EMPTY_FORM`/`formFromJob`: `hiringManager: ''` → `hiringManagerId: null`. Hiring Manager field becomes `<select>` populated from `users.filter(u => u.role === 'Hiring Manager')`, showing each manager's `name`.
- Knockout rule rows: `updateKnockoutRule`/`addKnockoutRule`/`removeKnockoutRule` unchanged in shape (still keyed by `id`), but each row now renders a type `<select>` (Years of Experience / Certification Required / Yes-No Question) plus the type-specific input(s): a number input for years, a text input for certification name, or a question-text input + Yes/No disqualifying-answer toggle. `handleRoleTemplateChange` seeds a single `years_experience` rule from `template.knockoutYears` (unchanged trigger condition, new shape).
- `JobRow`'s `onClick` (line 55) changes from `onEdit(job)` to `navigate(`/jobs/${job.id}`)`. The Edit modal is no longer reachable by row click — only from within the new Detail page.
- New view toggle (grid/list) rendered near `filter-strip`; list view groups `filteredJobs` by `department`, sorted alphabetically, each group collapsible.
- `handleSubmit`: `status = template.approvalChain.length > 0 ? 'pending_approval' : 'open'`.
- `RequisitionModal`'s Status `<select>` (~line 305): when `job.status === 'pending_approval'`, filter `'open'` out of the rendered options.

**`RequisitionDetail.jsx`** (new): requisition info card, stage funnel (reusing `job.stageCounts`/`applicantCount`/`daysOpen`, same data already computed by `useJobs.js` — no new computation), an "Edit" button opening the existing `RequisitionModal`, a "View Pipeline" link (`/pipeline?job=id`), and the Approve/Reject section described in Architecture above (visible only to the assigned Hiring Manager while `pending_approval`; other personas see a plain "Awaiting hiring manager approval" note in that state).

**`Pipeline.jsx`**:
- Header restructure: job title as `<h1>` (linking to `/jobs/:id`), "Candidate Pipeline" demoted to an eyebrow label, job-switcher restyled.
- `handleDrop`: add `if (!window.confirm(`Move ${candidate.name} to ${COLUMNS.find(c => c.key === columnKey).label}?`)) return` before calling `updateStage`.

**`CandidateProfile.jsx`**:
- New `STAGE_ORDER = ['new', 'screening', 'interviewing', 'offer', 'hired']` (or reuse/extend the existing `FORWARD_STAGES` keys). Compute `nextStage` from `candidate.stage`; render an "Advance to [next stage label] →" button in `cp-header-actions` when `nextStage` exists. `onClick` confirms via `window.confirm`, then calls `updateStage(candidate.id, nextStage)` from `useCandidates()`.

**`DatePicker.jsx` / `DatePicker.css`**: viewport-edge measurement on open, `openUpward` state, `.date-picker-popup-up` CSS variant. Applies to every date field in the app (WOTC signature date, employment history, education, training) since it's the one shared component.

## 6. Error Handling & Loading States

Same posture as sub-projects A and B: mutations call Supabase directly and update local state only on success (all reusing already-existing `updateJob`/`updateStage` mutations — no new error-handling pattern introduced). The rejection-reason notification is best-effort (already how `useNotifications` behaves — it's a localStorage-backed store, not a network call, so it can't fail in a way that needs handling). No optimistic updates, no retry queues, consistent with this being a demo prototype, not a production system.

## 7. Testing

One smoke pass after implementation, following prior sub-projects' precedent (no unit test suite, not warranted for a demo prototype):
- Topbar: confirm the button is gone; the Job Requisitions page's own button still opens the modal.
- Create a requisition, select a Hiring Manager from the dropdown, save, confirm `hiring_manager_id` persists (check via the Detail page and/or a page refresh).
- Add a knockout rule of each of the three types, save, reopen the requisition, confirm the structured values round-trip correctly.
- Click a requisition row → lands on the new Detail page (not the edit modal); confirm stage funnel numbers match what's shown on the grid card; Edit button still opens the working modal; View Pipeline still reaches the Kanban board.
- Toggle to grouped-list view; confirm every requisition appears under the correct department, alphabetically grouped.
- Open Pipeline: confirm the requisition title is now the visible headline and switching jobs still works via the restyled control.
- On Candidate Profile, advance a candidate through each stage via the new button; confirm the confirm dialog appears and Pipeline reflects the change.
- On Pipeline, drag a candidate to a new column; confirm the same confirm dialog appears before the move persists.
- Resize the browser (or use a field near the bottom of a long form) to trigger DatePicker's flip-upward behavior; confirm the calendar no longer clips off-screen.
- Submit a new requisition under each role template; confirm it lands in `pending_approval` (including single-step Intern/IC/Floor templates, which previously skipped straight to `open`). Switch to the Hiring Manager persona, confirm Approve moves it to `open` and Reject returns it to `draft` with the reason appearing in the notifications bell.
- Confirm the recruiter's edit-modal Status dropdown no longer offers `open` while a requisition is `pending_approval`.

## 8. Out of Scope

Restated from Section 2 for clarity: dead Kanban action buttons (sub-project E), knockout-rule auto-evaluation against applicants, HM-dropdown department/office filtering, Detail page conversion/time metrics, Kanban-by-department view, simulated `hr_director`/`vp_finance` approval personas, persisted rejection-reason schema/audit trail, and everything already carved out for sub-projects E/F/G/H/I.
