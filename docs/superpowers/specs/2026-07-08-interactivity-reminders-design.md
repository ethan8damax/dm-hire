# Interactivity + Reminders Wiring — Design Spec

## 1. Context & Purpose

This is sub-project **B** of the demo-notes effort, following sub-project A (Supabase data layer, see `2026-07-08-supabase-data-layer-design.md`). A now gives every entity a real Supabase-backed home; B spends that foundation on the buttons across Pipeline, Offers, Dashboard, and Candidate Profile that are currently either fully decorative (no `onClick` at all) or fake (`setTimeout`-simulated with no persistence).

Audited before writing this spec:
- **Pipeline.jsx** (offer-stage column): "Send Reminder" and "Extend" render with a `tone` but no `onClick` — clicking does nothing.
- **Offers.jsx**: "Send Reminders" runs a `setTimeout` phase animation (`idle → sending → sent`) with no database write.
- **Dashboard.jsx**: "Nudge" (per expiring offer) calls `navigate('/offers')` with no context — same underlying action as Send Reminder, just a dead-end redirect.
- **CandidateProfile.jsx** `DocsTab`: resume "View", certification "Verify", and background-check/drug-screen "Initiate"/"View" all have no `onClick`. The displayed status for background check / drug screen is not real state — `docStatus(candidate)` derives it purely from `candidate.stage` (hired → cleared, offer → in_progress, else not_started).
- **CandidateProfile.jsx header**: "View Offer" already switches to the real, Supabase-backed Offer tab (built in sub-project A). **No change needed — out of scope.**

A separate ATS feedback document was reviewed against this scope. Nearly all of it belongs to other sub-projects (sidebar collapse, navbar, notifications button, requisition creation flow/detail view, Why DM Hire layout, sort-by bug, Scorecard button, pipeline CSS layering, demo links) and is intentionally left out here. The one overlapping item — Dashboard's "Nudge" being a context-free redirect — is folded in below since it's the same action this spec already wires.

## 2. Scope Decision

**In scope:**
1. Send Reminder — three call sites (Pipeline single-candidate, Offers bulk, Dashboard Nudge), all backed by one real mutation that inserts into `reminders`.
2. Extend — push an offer's `expiry_date` out by a fixed 7 days.
3. Docs tab View/Verify/Initiate — wired to real state where real state is warranted (see below), local-only where it isn't.
4. Reminders log — a new, real read surface for the `reminders` table (empty since migration 009).

**Explicitly out of scope:** everything else raised in the separate feedback doc (tracked for future sub-projects, not duplicated here), and "View Offer" (already correct).

**Docs tab granularity — the judgment call this spec makes:**
- **Background Check / Drug Screen "Initiate"**: currently a *formula*, not state (`docStatus(candidate)` off `candidate.stage`), but it's displayed and matters to the story. Promoted to two real columns per candidate, seeded to match today's derived values, so "Initiate" performs a real `in_progress → cleared` transition.
- **Certification "Verify"**: one boolean column per candidate. Seed data never lists more than one certification per candidate, so a per-certification table would be schema with no current use — a single flag covers it.
- **Resume "View"**: this app has no file storage, and nothing downstream reads a "resume viewed" flag. Adding a column here would be state with zero consumers. Kept as a local, ephemeral UI reaction only (button flips to "Viewed ✓"), the same pattern already used for the e-sig "Simulate: Candidate Opens Link" button — no schema change.

## 3. Architecture

- New hook `src/hooks/useReminders.js`, following the exact pattern of `useOffers`/`useCandidates`: fetch on mount, expose `{ reminders, loading, error, sendReminder }`.
  - `sendReminder({ candidateId, offerId, type, sentBy, message })` inserts one row and appends it to local state on success.
  - No nested-select join to candidates/offers — call sites (Offers.jsx, Dashboard.jsx) already have `candidates` loaded via `useCandidates()` and map `candidateId → name` client-side, exactly like `Offers.jsx` already does for its own table rows. Keeps the hook a plain single-table fetch, consistent with `useOffices`/`useUsers`.
- `useCandidates.js` gains one generic mutation, `updateCandidate(id, patch)` — a single-table `update` + local-state merge, matching the shape of `updateOffer` in `useOffers.js`. Backs `certVerified` and the two doc-status columns; not offer- or reminder-specific, so it lives on the candidate hook rather than three bespoke functions.
- No new components. The reminders log renders with the existing `DataTable` component (already used on Offers.jsx and Dashboard.jsx), and the Docs tab / Pipeline card / Dashboard action-item changes are inline edits to existing JSX.
- Date math: no shared date-util module exists in this codebase today — each view has its own tiny local helpers (`daysUntil` in Pipeline.jsx/Offers.jsx, inline `cursor.setDate(...)` in CandidateProfile.jsx/CandidatePortal.jsx). `Extend` follows suit with a local `addDays(dateStr, 7)` helper in Pipeline.jsx, not a new shared module.

## 4. Schema Changes

One migration, `010_candidate_doc_status.sql`, additive only (no changes to existing sub-project A tables/columns):

```sql
alter table candidates add column background_check_status text not null default 'not_started';
alter table candidates add column drug_screen_status text not null default 'not_started';
alter table candidates add column cert_verified boolean not null default false;

update candidates set background_check_status = 'cleared', drug_screen_status = 'cleared' where stage = 'hired';
update candidates set background_check_status = 'in_progress', drug_screen_status = 'in_progress' where stage = 'offer';
```

No CHECK constraint on the two status columns — consistent with sub-project A's decision not to enforce enums at the DB level (`stage`, `status`, `esig_status` etc. are all unconstrained text). `cert_verified` defaults `false` for every seeded candidate, matching the current universal "Verification pending" copy.

The `reminders` table itself needs no schema change — migration 009 already created it correctly for this use.

## 5. Component Wiring

**`Pipeline.jsx`** (offer-stage column, `cardPropsForColumn`):
- Takes two new callback params (`onSendReminder`, `onExtend`) from the `Pipeline` component, which owns `useReminders()`/`useOffers()`.
- "Send Reminder" → `sendReminder({ candidateId, offerId: offer.id, type: 'expiry_reminder', sentBy: CURRENT_RECRUITER, message: \`Reminder sent — offer expires ${offer.expiryDate}\` })`.
- "Extend" → `updateOffer(offer.id, { expiryDate: addDays(offer.expiryDate, 7) })`.

**`Offers.jsx`**:
- `handleSendReminders` keeps its existing `idle → sending → sent` visual phase (no UX regression), but the "sending" phase now does a real `Promise.all` of `sendReminder(...)` calls, one per row in `expiringOffers`, before flipping to "sent".
- New **Reminders Log** section below the offers table: `useReminders()` + existing `DataTable`, columns = candidate (via the already-loaded `candidates` list), type, sent date, sent by, message. Empty state reuses the existing `EmptyState` component ("No reminders sent yet").

**`Dashboard.jsx`**:
- Adds `useReminders()` and a local `CURRENT_RECRUITER` constant (matching the duplication already present in Pipeline.jsx/CandidateProfile.jsx — no shared constant module exists, so none is introduced here).
- "Nudge" → calls `sendReminder(...)` directly for that offer (same shape as Pipeline's) instead of `navigate('/offers')`. Button disables and relabels to "Sent" for that row after a successful send (local state, keyed by offer id) — no more context-free redirect.

**`CandidateProfile.jsx` (`DocsTab`)**:
- Drops the shared `docStatus(candidate)` derivation. Reads `candidate.backgroundCheckStatus` / `candidate.drugScreenStatus` directly for each row's label/dimming.
- Resume "View" → local `useState` flip to "Viewed ✓", no persistence, no revert timer.
- Certification "Verify" → `updateCandidate(candidate.id, { certVerified: true })`; label swaps from "Verification pending" to "Verified" once `candidate.certVerified` is true.
- Background Check / Drug Screen "Initiate" → `updateCandidate(candidate.id, { backgroundCheckStatus: 'cleared' })` (or `drugScreenStatus`) when the row is currently `in_progress`. Still disabled when `not_started` (unchanged behavior).

## 6. Error Handling & Loading States

Same posture as sub-project A: confirm-first mutations (call Supabase, update local state only on success), inline error message on failure, no optimistic updates, no retry/offline queue. Nothing here introduces a new error-handling pattern.

## 7. Testing

One smoke pass after implementation, following sub-project A's precedent:
- Pipeline: Send Reminder and Extend on an offer-stage candidate; confirm a `reminders` row appears and `expiry_date` moves.
- Offers: bulk Send Reminders; confirm one row per expiring offer lands in the new log.
- Dashboard: Nudge; confirm it sends without navigating away.
- Candidate Profile Docs tab: View (local toggle), Verify, and Initiate (background check + drug screen) on a candidate in the `offer` stage; confirm persistence survives a refresh.
- No unit test suite — consistent with sub-project A, not warranted for a demo prototype.

## 8. Out of Scope

- Everything from the separate ATS feedback document except Dashboard's Nudge button (sidebar collapse, navbar tour button placement, notifications button, requisition creation flow/detail view/hiring-manager dropdown/knockout questions, Why DM Hire page layout, Candidate Pipeline sort-by bug, Scorecard button, Offer/Hired column CSS layering, demo "See It In Action" links) — each belongs to a different sub-project and is not duplicated here.
- Real file storage for resumes/documents.
- Per-certification (as opposed to per-candidate) verification tracking.
- Authentication / RLS tightening (unchanged from sub-project A's stance).
