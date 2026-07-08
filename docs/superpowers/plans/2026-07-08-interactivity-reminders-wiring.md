# Interactivity + Reminders Wiring Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wire Send Reminder, Extend, and the Candidate Profile Docs tab (View/Verify/Initiate) to real Supabase state, replace Offers.jsx's fake `setTimeout` reminder simulation and Dashboard's context-free "Nudge" redirect with real writes to the (currently empty) `reminders` table, and add a Reminders Log to the Offers page.

**Architecture:** One additive migration (`010_candidate_doc_status.sql`) adds three columns to `candidates`. One new hook, `useReminders()`, follows the exact fetch/mutate pattern of the existing per-entity hooks. `useCandidates()` gains one generic `updateCandidate(id, patch)` mutation. Four view files get their dead or fake buttons wired to these hooks — no new components, no new routes.

**Tech Stack:** Existing stack only — `@supabase/supabase-js`, the `src/hooks/*` pattern, `src/lib/caseConvert.js`. No new dependencies.

**Reference:** Design spec at `docs/superpowers/specs/2026-07-08-interactivity-reminders-design.md`. Supabase project `ATS`, id `uvwsxzynbpmrbckmqhzy` (confirmed live via `list_migrations`/`list_tables` while writing this plan — 9 migrations applied, `reminders` table exists with 0 rows, `candidates` has no doc-status columns yet).

---

## Task 1: Migration — candidate doc-status columns

**Files:**
- Create: `supabase/migrations/010_candidate_doc_status.sql`

- [ ] **Step 1: Write the migration SQL**

```sql
-- supabase/migrations/010_candidate_doc_status.sql

alter table candidates add column background_check_status text not null default 'not_started';
alter table candidates add column drug_screen_status text not null default 'not_started';
alter table candidates add column cert_verified boolean not null default false;

update candidates set background_check_status = 'cleared', drug_screen_status = 'cleared' where stage = 'hired';
update candidates set background_check_status = 'in_progress', drug_screen_status = 'in_progress' where stage = 'offer';
```

- [ ] **Step 2: Apply the migration**

Call `mcp__plugin_supabase_supabase__apply_migration` with `project_id: "uvwsxzynbpmrbckmqhzy"`, `name: "candidate_doc_status"`, and `query` set to the exact SQL above.

- [ ] **Step 3: Verify**

Call `mcp__plugin_supabase_supabase__execute_sql` with `project_id: "uvwsxzynbpmrbckmqhzy"` and query:
```sql
select id, stage, background_check_status, drug_screen_status, cert_verified from candidates order by id;
```
Expected: `cand-001` (stage `hired`) → `cleared`/`cleared`/`false`. `cand-002` (stage `offer`) → `in_progress`/`in_progress`/`false`. All others → `not_started`/`not_started`/`false`.

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/010_candidate_doc_status.sql
git commit -m "Add candidate doc-status columns (background check, drug screen, cert verified)"
```

---

## Task 2: `useReminders` hook

**Files:**
- Create: `src/hooks/useReminders.js`

- [ ] **Step 1: Write the hook**

```js
// src/hooks/useReminders.js
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'
import { rowToCamel, toSnakeRow } from '../lib/caseConvert'

export function useReminders() {
  const [reminders, setReminders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    supabase.from('reminders').select('*').then(({ data, error }) => {
      if (error) setError(error)
      else setReminders(data.map(rowToCamel))
      setLoading(false)
    })
  }, [])

  const sendReminder = useCallback(async (reminder) => {
    const { data, error } = await supabase.from('reminders')
      .insert(toSnakeRow(reminder))
      .select().single()
    if (error) { setError(error); return null }
    const shaped = rowToCamel(data)
    setReminders((list) => [...list, shaped])
    return shaped
  }, [])

  return { reminders, loading, error, sendReminder }
}
```

- [ ] **Step 2: Verify**

Run: `npm run lint`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useReminders.js
git commit -m "Add useReminders hook with sendReminder mutation"
```

---

## Task 3: `useCandidates` — add `updateCandidate` mutation

**Files:**
- Modify: `src/hooks/useCandidates.js`

- [ ] **Step 1: Add the mutation**

Insert after the existing `addNote` callback (after the closing `}, [])` that follows `addNote`, before the `return` statement:

```js
  const updateCandidate = useCallback(async (id, patch) => {
    const { error } = await supabase.from('candidates').update(toSnakeRow(patch)).eq('id', id)
    if (error) { setError(error); return }
    setCandidates((list) => list.map((c) => (c.id === id ? { ...c, ...patch } : c)))
  }, [])
```

- [ ] **Step 2: Update the return statement**

Change:
```js
  return { candidates, loading, error, updateStage, addNote }
```
to:
```js
  return { candidates, loading, error, updateStage, addNote, updateCandidate }
```

- [ ] **Step 3: Verify**

Run: `npm run lint`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/hooks/useCandidates.js
git commit -m "Add updateCandidate mutation to useCandidates hook"
```

---

## Task 4: Wire `Pipeline.jsx` — Send Reminder + Extend

**Files:**
- Modify: `src/views/Pipeline.jsx`

- [ ] **Step 1: Import `useReminders`**

Change:
```js
import { useUsers } from '../hooks/useUsers'
```
to:
```js
import { useUsers } from '../hooks/useUsers'
import { useReminders } from '../hooks/useReminders'
```

- [ ] **Step 2: Add the `addDays` helper**

Add right after the existing `daysUntil` helper (below its closing `}`):

```js
function addDays(dateStr, days) {
  const d = new Date(dateStr)
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}
```

- [ ] **Step 3: Fix the offer-column action gating and wire the two buttons**

Replace the entire `if (columnKey === 'offer') { ... }` block in `cardPropsForColumn` — currently:
```js
  if (columnKey === 'offer') {
    const offer = offers.find((o) => o.candidateId === candidate.id)
    const isExpiringSoon = offer?.status === 'awaiting' && daysUntil(offer.expiryDate) >= 0 && daysUntil(offer.expiryDate) <= 5
    const actions = isExpiringSoon
      ? [{ label: 'Send Reminder', tone: 'warn' }, { label: 'Extend', tone: 'accent' }]
      : [{ label: 'Extend', tone: 'accent' }]
    if (isExpiringSoon) {
      const note = <><AlertTriangle size={11} /> Offer expires {offer.expiryDate}</>
      return { note, noteVariant: 'warn', actions }
    }
    return { note: `${candidate.daysInStage}d in stage`, actions }
  }
```
with:
```js
  if (columnKey === 'offer') {
    const offer = offers.find((o) => o.candidateId === candidate.id)
    const isAwaiting = offer?.status === 'awaiting'
    const isExpiringSoon = isAwaiting && daysUntil(offer.expiryDate) >= 0 && daysUntil(offer.expiryDate) <= 5
    const extendAction = { label: 'Extend', tone: 'accent', onClick: () => onExtend(offer) }
    const actions = !isAwaiting
      ? []
      : isExpiringSoon
        ? [{ label: 'Send Reminder', tone: 'warn', onClick: () => onSendReminder(candidate, offer) }, extendAction]
        : [extendAction]
    if (isExpiringSoon) {
      const note = <><AlertTriangle size={11} /> Offer expires {offer.expiryDate}</>
      return { note, noteVariant: 'warn', actions }
    }
    return { note: `${candidate.daysInStage}d in stage`, actions }
  }
```

This is the bug fix called out in the spec (Section 5): previously `Extend` rendered even when there was no offer yet, or the offer was `draft`/`accepted`/`declined`/`expired` — clicking it in those states would either throw (`offer.id` on `undefined`) or act on an offer nobody is waiting on. Now the offer column shows no actions unless there's a real `awaiting` offer.

- [ ] **Step 4: Update `cardPropsForColumn`'s signature and its recursive HM-branch call**

Change:
```js
function cardPropsForColumn(columnKey, candidate, isHiringManager, offers) {
  if (isHiringManager) {
    const base = cardPropsForColumn(columnKey, candidate, false, offers)
```
to:
```js
function cardPropsForColumn(columnKey, candidate, isHiringManager, offers, onSendReminder, onExtend) {
  if (isHiringManager) {
    const base = cardPropsForColumn(columnKey, candidate, false, offers, onSendReminder, onExtend)
```

(The Hiring Manager branch strips actions down to `SCORECARD_ONLY_ACTION` regardless, so it never calls `onSendReminder`/`onExtend` — passing them through is just so the recursive call signature matches.)

- [ ] **Step 5: Add `updateOffer` and `useReminders` to the `Pipeline` component, plus the two handlers**

Change:
```js
  const { offers, loading: offersLoading } = useOffers()
  const { users, loading: usersLoading } = useUsers()
```
to:
```js
  const { offers, loading: offersLoading, updateOffer } = useOffers()
  const { users, loading: usersLoading } = useUsers()
  const { sendReminder } = useReminders()
```

Then add these two functions inside `Pipeline`, right after `handleJobChange`:

```js
  function handleSendReminder(candidate, offer) {
    sendReminder({
      candidateId: candidate.id,
      offerId: offer.id,
      type: 'expiry_reminder',
      sentBy: CURRENT_RECRUITER,
      message: `Reminder sent — offer expires ${offer.expiryDate}`,
    })
  }

  function handleExtend(offer) {
    updateOffer(offer.id, { expiryDate: addDays(offer.expiryDate, 7) })
  }
```

- [ ] **Step 6: Pass the handlers into the render call**

Change:
```js
                    {...cardPropsForColumn(col.key, candidate, isHiringManager, offers)}
```
to:
```js
                    {...cardPropsForColumn(col.key, candidate, isHiringManager, offers, handleSendReminder, handleExtend)}
```

- [ ] **Step 7: Verify**

Run: `npm run lint`
Run: `npm run dev`, open `/pipeline?job=job-001`:
1. Find a candidate in the Offer Stage column with an `awaiting` offer expiring within 5 days (seed data has one — check via the Offers page first if unsure which). Confirm both "Send Reminder" and "Extend" render.
2. Click "Extend" → confirm the "Offer expires" date note advances by 7 days. Refresh the page → confirm it persisted.
3. Click "Send Reminder" → no visible UI change on the card itself (log is on the Offers page, added in Task 5), but no console error either.
4. Find or create a candidate in the Offer Stage column whose offer is `draft`/`accepted`/`declined` (or who has no offer row at all) → confirm no action buttons render in that column for them.

- [ ] **Step 8: Commit**

```bash
git add src/views/Pipeline.jsx
git commit -m "Wire Pipeline.jsx Send Reminder and Extend to Supabase, gate on awaiting offers"
```

---

## Task 5: Wire `Offers.jsx` — real Send Reminders + Reminders Log

**Files:**
- Modify: `src/views/Offers.jsx`
- Modify: `src/views/Offers.css`

- [ ] **Step 1: Add imports and the `CURRENT_RECRUITER` constant**

Change:
```js
import { useOffers } from '../hooks/useOffers'
import { useCandidates } from '../hooks/useCandidates'
import { useJobs } from '../hooks/useJobs'
import Loading from '../components/ui/Loading'
import './Offers.css'

const TODAY = '2026-07-07'
```
to:
```js
import { useOffers } from '../hooks/useOffers'
import { useCandidates } from '../hooks/useCandidates'
import { useJobs } from '../hooks/useJobs'
import { useReminders } from '../hooks/useReminders'
import Loading from '../components/ui/Loading'
import './Offers.css'

const TODAY = '2026-07-07'
const CURRENT_RECRUITER = 'T. Smith'
```

- [ ] **Step 2: Add the hook call and extend the loading guard**

Change:
```js
  const { offers, loading: offersLoading } = useOffers()
  const { candidates, loading: candidatesLoading } = useCandidates()
  const { jobs, loading: jobsLoading } = useJobs()

  if (offersLoading || candidatesLoading || jobsLoading) return <Loading />
```
to:
```js
  const { offers, loading: offersLoading } = useOffers()
  const { candidates, loading: candidatesLoading } = useCandidates()
  const { jobs, loading: jobsLoading } = useJobs()
  const { reminders, loading: remindersLoading, sendReminder } = useReminders()

  if (offersLoading || candidatesLoading || jobsLoading || remindersLoading) return <Loading />
```

- [ ] **Step 3: Replace the fake `handleSendReminders` with a real one**

Change:
```js
  function handleSendReminders() {
    setReminderPhase('sending')
    setTimeout(() => setReminderPhase('sent'), 900)
    setTimeout(() => setReminderPhase('idle'), 2600)
  }
```
to:
```js
  async function handleSendReminders() {
    setReminderPhase('sending')
    await Promise.all(expiringOffers.map((o) => sendReminder({
      candidateId: o.candidateId,
      offerId: o.id,
      type: 'expiry_reminder',
      sentBy: CURRENT_RECRUITER,
      message: `Reminder sent — offer expires ${o.expiryDate}`,
    })))
    setReminderPhase('sent')
    setTimeout(() => setReminderPhase('idle'), 1700)
  }
```

- [ ] **Step 4: Build the reminders log rows/columns and render the section**

Add right before the `return (` statement:
```js
  const reminderRows = [...reminders]
    .sort((a, b) => new Date(b.sentAt) - new Date(a.sentAt))
    .map((r) => ({ ...r, candidateName: candidates.find((c) => c.id === r.candidateId)?.name ?? 'Unknown' }))

  const reminderColumns = [
    { key: 'candidateName', label: 'Candidate' },
    { key: 'type', label: 'Type' },
    { key: 'sentAt', label: 'Sent', render: (r) => new Date(r.sentAt).toLocaleString() },
    { key: 'sentBy', label: 'Sent By' },
    { key: 'message', label: 'Message' },
  ]
```

Then change the end of the render (the tail of the existing offers table block, right before the closing `</div>` of `.offers-view`) from:
```jsx
      {filteredRows.length === 0 ? (
        <EmptyState title="No offers" subtitle="No offers match this filter." />
      ) : (
        <Card data-tour="tour-offers-list">
          <DataTable columns={columns} rows={filteredRows} onRowClick={openOffer} loading={loading} />
        </Card>
      )}
    </div>
  )
}
```
to:
```jsx
      {filteredRows.length === 0 ? (
        <EmptyState title="No offers" subtitle="No offers match this filter." />
      ) : (
        <Card data-tour="tour-offers-list">
          <DataTable columns={columns} rows={filteredRows} onRowClick={openOffer} loading={loading} />
        </Card>
      )}

      <div className="page-header">
        <h2 className="offers-log-title">Reminders Log</h2>
      </div>

      {reminderRows.length === 0 ? (
        <EmptyState title="No reminders sent yet" subtitle="Send a reminder from an expiring offer above and it'll show up here." />
      ) : (
        <Card>
          <DataTable columns={reminderColumns} rows={reminderRows} />
        </Card>
      )}
    </div>
  )
}
```

- [ ] **Step 5: Add the section title style**

Append to `src/views/Offers.css`:
```css
.offers-log-title {
  font-size: 12px;
  font-weight: 700;
  color: var(--color-gray-500);
  text-transform: uppercase;
  letter-spacing: .04em;
  margin: var(--space-6) 0 var(--space-2);
}
```

- [ ] **Step 6: Verify**

Run: `npm run lint`
Run: `npm run dev`, open `/offers`:
1. Confirm the "Reminders Log" section renders below the offers table, showing "No reminders sent yet" (table is empty from Task 1's live-schema check).
2. Click "Send Reminders" in the expiring-offers notice strip → confirm the button shows "Sending…" then "Reminders sent", and the log below now has one row per expiring offer with the correct candidate name and message.
3. Refresh the page → confirm the log rows persisted.

- [ ] **Step 7: Commit**

```bash
git add src/views/Offers.jsx src/views/Offers.css
git commit -m "Wire Offers.jsx Send Reminders to Supabase and add Reminders Log section"
```

---

## Task 6: Wire `Dashboard.jsx` — Nudge sends a real reminder

**Files:**
- Modify: `src/views/Dashboard.jsx`

- [ ] **Step 1: Add imports and the `CURRENT_RECRUITER` constant**

Change:
```js
import { useNavigate } from 'react-router-dom'
```
to:
```js
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
```

Change:
```js
import { useAnalytics } from '../hooks/useAnalytics'
import Loading from '../components/ui/Loading'
import './Dashboard.css'

function daysUntil(dateStr) {
```
to:
```js
import { useAnalytics } from '../hooks/useAnalytics'
import { useReminders } from '../hooks/useReminders'
import Loading from '../components/ui/Loading'
import './Dashboard.css'

const CURRENT_RECRUITER = 'T. Smith'

function daysUntil(dateStr) {
```

- [ ] **Step 2: Add the hook call and local sent-tracking state**

Change:
```js
  const { candidates, loading: candidatesLoading } = useCandidates()
  const { jobs, loading: jobsLoading } = useJobs()
  const { offers, loading: offersLoading } = useOffers()
  const { analytics, loading: analyticsLoading } = useAnalytics()

  if (candidatesLoading || jobsLoading || offersLoading || analyticsLoading) return <Loading />
```
to:
```js
  const { candidates, loading: candidatesLoading } = useCandidates()
  const { jobs, loading: jobsLoading } = useJobs()
  const { offers, loading: offersLoading } = useOffers()
  const { analytics, loading: analyticsLoading } = useAnalytics()
  const { sendReminder } = useReminders()
  const [nudgedOfferIds, setNudgedOfferIds] = useState(new Set())

  if (candidatesLoading || jobsLoading || offersLoading || analyticsLoading) return <Loading />
```

- [ ] **Step 3: Add the `handleNudge` function**

Add right after the `dateLabel` line (before the `return (`):
```js
  function handleNudge(offer) {
    sendReminder({
      candidateId: offer.candidateId,
      offerId: offer.id,
      type: 'expiry_reminder',
      sentBy: CURRENT_RECRUITER,
      message: `Reminder sent — offer expires ${offer.expiryDate}`,
    })
    setNudgedOfferIds((ids) => new Set(ids).add(offer.id))
  }
```

- [ ] **Step 4: Replace the Nudge button**

Change:
```jsx
                    <Button size="sm" variant="ghost" onClick={() => navigate('/offers')}>Nudge</Button>
```
to:
```jsx
                    <Button size="sm" variant="ghost" disabled={nudgedOfferIds.has(o.id)} onClick={() => handleNudge(o)}>
                      {nudgedOfferIds.has(o.id) ? 'Sent' : 'Nudge'}
                    </Button>
```

- [ ] **Step 5: Verify**

Run: `npm run lint`
Run: `npm run dev`, open `/` (Dashboard). If there's an expiring offer in the Action Items list, click "Nudge" → confirm the button disables and relabels to "Sent" without navigating away. Open `/offers` in the same session and confirm the new row appears in the Reminders Log.

- [ ] **Step 6: Commit**

```bash
git add src/views/Dashboard.jsx
git commit -m "Wire Dashboard Nudge button to send a real reminder instead of redirecting"
```

---

## Task 7: Wire `CandidateProfile.jsx` — Docs tab View/Verify/Initiate

**Files:**
- Modify: `src/views/CandidateProfile.jsx`

- [ ] **Step 1: Remove the now-unused `docStatus` derivation**

Delete this function (it's only used by `DocsTab`, which stops using it in Step 4):
```js
function docStatus(candidate) {
  if (candidate.stage === 'hired') return 'cleared'
  if (candidate.stage === 'offer') return 'in_progress'
  return 'not_started'
}
```

- [ ] **Step 2: Add `updateCandidate` to the `useCandidates` destructure**

Change:
```js
  const { candidates, loading: candidatesLoading, addNote } = useCandidates()
```
to:
```js
  const { candidates, loading: candidatesLoading, addNote, updateCandidate } = useCandidates()
```

- [ ] **Step 3: Pass it down to `DocsTab`**

Change:
```jsx
              <DocsTab candidate={candidate} offer={offer} />
```
to:
```jsx
              <DocsTab candidate={candidate} offer={offer} onUpdateCandidate={updateCandidate} />
```

- [ ] **Step 4: Rewrite `DocsTab`**

Replace the entire function (from `function DocsTab({ candidate, offer }) {` through its closing `}`) with:

```jsx
function DocsTab({ candidate, offer, onUpdateCandidate }) {
  const [resumeViewed, setResumeViewed] = useState(false)
  const [checksViewed, setChecksViewed] = useState({ background: false, drug: false })
  const certifications = candidate.skills.filter((s) => s.toLowerCase().includes('certified'))

  function renderCheckRow(label, status, field, viewedKey) {
    return (
      <div className={`cp-doc-row${status === 'not_started' ? ' cp-doc-row-dim' : ''}`} key={field}>
        <ShieldCheck size={20} />
        <div className="cp-doc-info">
          <div className="cp-doc-title">{label}</div>
          <div className="cp-doc-sub">
            {status === 'cleared' ? 'Cleared' : status === 'in_progress' ? 'In progress' : 'Not yet initiated, awaiting offer acceptance'}
          </div>
        </div>
        {status === 'cleared' ? (
          <Button variant="ghost" size="sm" onClick={() => setChecksViewed((v) => ({ ...v, [viewedKey]: true }))}>
            {checksViewed[viewedKey] ? 'Viewed ✓' : 'View'}
          </Button>
        ) : (
          <Button variant="ghost" size="sm" disabled={status === 'not_started'} onClick={() => onUpdateCandidate(candidate.id, { [field]: 'cleared' })}>
            Initiate
          </Button>
        )}
      </div>
    )
  }

  return (
    <Card>
      <Card.Body className="cp-docs-body">
        <div className="cp-doc-row">
          <FileText size={20} />
          <div className="cp-doc-info">
            <div className="cp-doc-title">Resume: {candidate.name.replace(' ', '_')}_Resume.pdf</div>
            <div className="cp-doc-sub">Uploaded {candidate.timeline[0]?.date} · Auto-parsed</div>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setResumeViewed(true)}>{resumeViewed ? 'Viewed ✓' : 'View'}</Button>
        </div>

        {certifications.map((cert) => (
          <div className="cp-doc-row" key={cert}>
            <BadgeCheck size={20} />
            <div className="cp-doc-info">
              <div className="cp-doc-title">{cert}</div>
              <div className="cp-doc-sub">{candidate.certVerified ? 'Verified' : 'Self-reported · Verification pending'}</div>
            </div>
            <Button variant="ghost" size="sm" disabled={candidate.certVerified} onClick={() => onUpdateCandidate(candidate.id, { certVerified: true })}>
              {candidate.certVerified ? 'Verified' : 'Verify'}
            </Button>
          </div>
        ))}

        {renderCheckRow('Background Check', candidate.backgroundCheckStatus, 'backgroundCheckStatus', 'background')}
        {renderCheckRow('Drug Screen', candidate.drugScreenStatus, 'drugScreenStatus', 'drug')}

        <div className={`cp-doc-row${!offer ? ' cp-doc-row-dim' : ''}`}>
          <FileSignature size={20} />
          <div className="cp-doc-info">
            <div className="cp-doc-title">Signed Offer Letter</div>
            <div className="cp-doc-sub">
              {offer?.esigStatus === 'signed' ? `Signed ${offer.esigSignedDate}` : offer ? 'Pending, offer not yet signed' : 'Pending, offer not yet sent'}
            </div>
          </div>
        </div>
      </Card.Body>
    </Card>
  )
}
```

(`useState` is already imported at the top of this file for the main `CandidateProfile` component, so no new import is needed.)

- [ ] **Step 5: Verify**

Run: `npm run lint`
Run: `npm run dev`:
1. Open `/candidates/cand-003` (stage `screening` → both checks `not_started`). Confirm both check rows are dimmed and their buttons disabled; certification row (if any skill contains "Certified" — `cand-003` has none, so open `/candidates/cand-007` instead, which also has no cert; use `/candidates/cand-002` for the cert row) shows "Verification pending" / "Verify" enabled.
2. Open `/candidates/cand-002` (stage `offer` → both checks `in_progress`). Click "Initiate" on Background Check → confirm it flips to "Cleared" with a "View" button. Refresh the page → confirm it persisted. Click "Verify" on the CPP Certified row → confirm it flips to "Verified" and the button disables. Refresh → confirm it persisted.
3. On the same candidate, click "View" on the resume row → confirm it flips to "Viewed ✓" without a refresh-persisting expectation (local-only, per the spec).
4. Open `/candidates/cand-001` (stage `hired` → both checks already `cleared`). Confirm both rows show "View" (not "Initiate") and clicking flips them to "Viewed ✓" locally.

- [ ] **Step 6: Commit**

```bash
git add src/views/CandidateProfile.jsx
git commit -m "Wire CandidateProfile Docs tab View/Verify/Initiate to Supabase and local state"
```

---

## Task 8: Full manual verification pass

**Files:** none (verification only)

- [ ] **Step 1: Run the full lint and build**

Run: `npm run lint` — expected: no errors across `src/`.
Run: `npm run build` — expected: succeeds.

- [ ] **Step 2: Click through every touched surface in one session**

Run: `npm run dev`.
1. `/pipeline` — offer column: awaiting-offer candidate shows working Send Reminder + Extend; non-awaiting/no-offer candidate shows no actions.
2. `/offers` — bulk Send Reminders populates the Reminders Log; log persists on refresh.
3. `/` (Dashboard) — Nudge sends without navigating, disables, and shows up in the Offers log.
4. `/candidates/cand-002` and `/candidates/cand-001` — Docs tab Initiate/Verify persist across refresh; resume View and cleared-check View are local-only "Viewed ✓" reactions.

No commit for this task — it's a verification pass over work already committed in Tasks 1-7.

---

## Self-Review Notes

- **Spec coverage:** Section 4 (schema) → Task 1. Section 3 (`useReminders`, `updateCandidate`) → Tasks 2-3. Section 5's four wiring targets (Pipeline, Offers, Dashboard, CandidateProfile) → Tasks 4-7, in the same order and with the same field names (`expiry_reminder` type, `CURRENT_RECRUITER` sentBy) used consistently across all three Send-Reminder call sites so the log reads as one coherent feed rather than three differently-shaped event types.
- **Bug fix carried over from spec self-review:** Task 4 Step 3 applies the `offer?.status === 'awaiting'` gate the design spec flagged — confirmed by re-reading the live `cardPropsForColumn` code again while writing this plan, not just trusting the spec's summary.
- **Rules-of-hooks check:** every new hook call (`useReminders()` in Pipeline/Offers/Dashboard, the two new `useState` calls inside `DocsTab`) was placed alongside each component's existing hook calls, before any conditional `return`. Confirmed by reading each file's actual hook order rather than assuming — this is the exact class of bug the sub-project A plan's retrospective called out.
- **`CURRENT_RECRUITER` duplication:** Dashboard.jsx didn't have this constant before; Task 6 adds it as a fourth copy, matching the existing duplication already present in Pipeline.jsx and CandidateProfile.jsx rather than introducing a shared constants module — consistent with this codebase's established (if repetitive) pattern.
- **Local-only vs. persisted state, verified per-button:** resume View and the cleared-check "View" (Background Check/Drug Screen once `cleared`) are the only two buttons in this plan that do *not* hit Supabase — confirmed against Section 2 of the spec, which explicitly calls out that nothing downstream reads a "viewed" flag. Every other button in this plan (Send Reminder ×3, Extend, Verify, Initiate) does a real write.
