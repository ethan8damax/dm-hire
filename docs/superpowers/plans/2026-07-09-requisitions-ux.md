# Requisitions UX + Approval Workflow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement sub-project C from `docs/superpowers/specs/2026-07-09-requisitions-ux-design.md` — clean up the Job Requisitions flow (topbar button, Hiring Manager dropdown, knockout rules, a new Requisition Detail page, list views), make the Pipeline's current-requisition indicator prominent, add a confirmed stage-advance path on both the Candidate Profile page and Pipeline's drag-and-drop, fix a shared DatePicker viewport-clipping bug, and add a real Hiring-Manager approval gate for requisitions.

**Architecture:** All changes are additive edits to existing React views/hooks/components already following this codebase's established conventions (plain hooks over `supabase-js`, `camelCase` in React / `snake_case` in Postgres via `caseConvert.js`, no shared constants module — small constants like `CURRENT_HM_ID` are duplicated per file where already established). One new route/page (`RequisitionDetail.jsx`) is added, reusing the existing `RequisitionModal` (now exported) rather than duplicating it. No schema migrations are needed — every column involved already exists.

**Tech Stack:** React 19 + Vite, `react-router-dom` v7, Supabase (`@supabase/supabase-js`), `lucide-react` icons. **No test runner is installed in this project** (`package.json` has no `vitest`/`jest`) and no prior sub-project in this codebase added one — this plan follows that established convention. "Verify" steps below use `npm run lint` (oxlint, already configured) plus explicit manual smoke-test instructions instead of automated test code, matching this spec's own stated testing posture ("one smoke pass... no unit test suite, not warranted for a demo prototype").

**Note:** the spec's "database permission to allow deletion of postings" item needs no task here — confirmed already resolved during brainstorming (the `jobs_anon_delete` RLS policy is already live on the production database via `pg_policies`, just untracked in the migrations history table).

---

## Task 1: Remove Topbar's redundant "+ New Requisition" button

**Files:**
- Modify: `src/components/layout/Topbar.jsx:160-162`

- [ ] **Step 1: Delete the button**

In `src/components/layout/Topbar.jsx`, remove these lines (currently sitting between the "Start Demo Tour" button and the notifications bell):

```jsx
      <Button variant="primary" onClick={() => navigate('/jobs')}>
        <Plus size={16} /> New Requisition
      </Button>

```

Leave everything else in the file untouched — `Plus` is still used by the notification "Add" button (`<Plus size={13} /> Add`) and `navigate` is still used by `handlePersonaChange`, `goToCandidate`, and `goToJob`, so no imports need to change.

- [ ] **Step 2: Verify**

Run: `npm run lint`
Expected: no errors.

Manually: with the dev server running, load any page and confirm the topbar no longer shows a "+ New Requisition" button. Go to `/jobs` and confirm that page's own "+ New Requisition" button still opens the modal.

- [ ] **Step 3: Commit**

```bash
git add src/components/layout/Topbar.jsx
git commit -m "Remove redundant New Requisition button from Topbar"
```

---

## Task 2: Fix DatePicker popup viewport clipping

**Files:**
- Modify: `src/components/ui/DatePicker.jsx`
- Modify: `src/components/ui/DatePicker.css:25-37`

**Context:** `.date-picker-popup` is hardcoded to open downward (`top: calc(100% + gap)`), so when the trigger sits near the bottom of the viewport (e.g. the WOTC step's signature-date field), the calendar renders clipped off-screen with no way to scroll to it. Fix: measure the trigger's position on open and flip the popup upward when there isn't enough room below.

- [ ] **Step 1: Add flip-detection state and an estimated popup height constant**

In `src/components/ui/DatePicker.jsx`, add this constant right after the existing `WEEKDAY_ABBR` constant (line 7):

```jsx
// ponytail: fixed height estimate for the flip threshold rather than measuring
// the actual popup (which isn't in the DOM until it opens) — good enough since
// this only needs to catch the "clearly not enough room" case, not pixel-perfect fit.
const POPUP_ESTIMATED_HEIGHT = 360
```

Then inside the `DatePicker` component, add an `openUpward` state next to the existing `open` state (line 40):

```jsx
  const [open, setOpen] = useState(false)
  const [openUpward, setOpenUpward] = useState(false)
```

- [ ] **Step 2: Measure on open and set the flip flag**

Replace the trigger button's inline `onClick={() => setOpen((o) => !o)}` (line 98) with a named handler. First add the handler function right before the `return` statement (after the `parsed` line, ~line 94):

```jsx
  function handleTriggerClick() {
    if (!open && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      setOpenUpward(window.innerHeight - rect.bottom < POPUP_ESTIMATED_HEIGHT)
    }
    setOpen((o) => !o)
  }
```

Then update the trigger button:

```jsx
      <button type="button" id={id} className="date-picker-trigger" onClick={handleTriggerClick}>
```

- [ ] **Step 3: Apply the flip class to the popup**

Change the popup's className (line 103) from:

```jsx
        <div className="date-picker-popup">
```

to:

```jsx
        <div className={`date-picker-popup${openUpward ? ' date-picker-popup-up' : ''}`}>
```

- [ ] **Step 4: Add the CSS variant**

In `src/components/ui/DatePicker.css`, add this rule right after the existing `.date-picker-popup { ... }` block (after line 37):

```css
.date-picker-popup-up {
  top: auto;
  bottom: calc(100% + var(--space-2));
}
```

- [ ] **Step 5: Verify**

Run: `npm run lint`
Expected: no errors.

Manually: open the candidate-facing apply flow (`/careers/jobs/:jobId/apply`), navigate to the WOTC step, and open the Date picker near the bottom of the viewport (shrink the browser window if needed to force the trigger close to the bottom edge). Confirm the calendar now opens upward and is fully visible. Then check a DatePicker higher up the page (e.g. Employment History's start date) still opens downward as before.

- [ ] **Step 6: Commit**

```bash
git add src/components/ui/DatePicker.jsx src/components/ui/DatePicker.css
git commit -m "Fix DatePicker popup clipping by flipping upward near viewport bottom"
```

---

## Task 3: Wire a real Hiring Manager dropdown, persist hiringManagerId

**Files:**
- Modify: `src/views/JobRequisitions.jsx`

**Context:** `jobs.hiring_manager_id` already exists as a real FK column and `users` already has four real `role = 'Hiring Manager'` rows, but the form's Hiring Manager field is free text and is never persisted — `buildJob()` hardcodes `hiringManagerId: null` and the edit-save path never sends it either.

- [ ] **Step 1: Import useUsers and load the users list**

Add the import near the other hook imports (after line 15, `import { useOffices } from '../hooks/useOffices'`):

```jsx
import { useUsers } from '../hooks/useUsers'
```

In the `JobRequisitions` component (around line 460-463), add:

```jsx
  const { users, loading: usersLoading } = useUsers()
```

Update the loading guard (line 469) to include it:

```jsx
  if (jobsLoading || officesLoading || candidatesLoading || workflowsLoading || usersLoading) return <Loading />
```

- [ ] **Step 2: Update EMPTY_FORM and formFromJob**

In `EMPTY_FORM` (line 103-116), change:

```jsx
  hiringManager: '',
```

to:

```jsx
  hiringManagerId: '',
```

In `formFromJob` (line 118-135), change:

```jsx
    hiringManager: '',
```

to:

```jsx
    hiringManagerId: job.hiringManagerId || '',
```

- [ ] **Step 3: Update RequisitionModal to accept and use hiringManagers**

Change the `RequisitionModal` function signature (line 137) from:

```jsx
function RequisitionModal({ open, onClose, onCreate, onSave, onDelete, job, offices, roleWorkflows, canEdit }) {
```

to:

```jsx
function RequisitionModal({ open, onClose, onCreate, onSave, onDelete, job, offices, roleWorkflows, hiringManagers, canEdit }) {
```

In `buildJob()` (line 197-218), change:

```jsx
      hiringManagerId: null,
```

to:

```jsx
      hiringManagerId: form.hiringManagerId || null,
```

In `handleSubmit`'s edit path (the `onSave` call, line 241-253), add `hiringManagerId` to the updates object:

```jsx
      onSave(job.id, {
        title: form.title || 'Untitled Requisition',
        department: form.department,
        location: office ? `${office.city}, ${office.state}` : job.location,
        officeId: form.officeId,
        hiringManagerId: form.hiringManagerId || null,
        compRange: form.compRange,
        status: form.status,
        isInternal: form.internalOnly,
        roleTemplate: form.roleTemplate,
        boards: form.internalOnly ? [] : form.boards,
        knockoutRules: form.knockoutRules,
        approvalChain: template.approvalChain,
      })
```

- [ ] **Step 4: Replace the free-text input with a dropdown**

Replace the Hiring Manager field (line 322-325):

```jsx
            <label className="req-field">
              <span>Hiring Manager</span>
              <input value={form.hiringManager} onChange={(e) => updateField('hiringManager', e.target.value)} placeholder="e.g. A. Chen" />
            </label>
```

with:

```jsx
            <label className="req-field">
              <span>Hiring Manager</span>
              <select value={form.hiringManagerId} onChange={(e) => updateField('hiringManagerId', e.target.value)}>
                <option value="">— Select —</option>
                {hiringManagers.map((hm) => <option key={hm.id} value={hm.id}>{hm.name}</option>)}
              </select>
            </label>
```

- [ ] **Step 5: Pass hiringManagers down from JobRequisitions**

At the `<RequisitionModal ... />` call site (line 540-550), add the `hiringManagers` prop — leave every other prop exactly as it is today (Task 5 changes `open`/`job` later, don't touch them here):

```jsx
      <RequisitionModal
        open={modalOpen || !!editingJob}
        job={editingJob}
        onClose={closeModal}
        onCreate={handleCreate}
        onSave={handleSave}
        onDelete={handleDelete}
        canEdit={isRecruiter}
        offices={offices}
        roleWorkflows={roleWorkflows}
        hiringManagers={users.filter((u) => u.role === 'Hiring Manager')}
      />
```

- [ ] **Step 6: Verify**

Run: `npm run lint`
Expected: no errors.

Manually: open `/jobs`, click "+ New Requisition", confirm the Hiring Manager field is now a dropdown listing R. Patel, K. Nguyen, J. Brooks, M. Osei. Pick one, fill in a title, save as draft. Reopen that requisition's edit modal and confirm the same Hiring Manager is still selected (proving `hiring_manager_id` persisted). Edit an existing requisition, change its Hiring Manager, save, and confirm it sticks after a page refresh.

- [ ] **Step 7: Commit**

```bash
git add src/views/JobRequisitions.jsx
git commit -m "Wire real Hiring Manager dropdown, persist hiring_manager_id"
```

---

## Task 4: Restructure knockout rules into structured types

**Files:**
- Modify: `src/views/JobRequisitions.jsx`
- Modify: `src/views/JobRequisitions.css:119-147`

**Context:** Replace the two free-text inputs (`text`, `declineNote`) with one structured rule per row: a type dropdown (Years of Experience / Certification Required / Yes-No Question) plus the type-specific value field(s). No migration needed — `knockout_rules` is `jsonb`.

- [ ] **Step 1: Update the default/seed rule shapes**

In `EMPTY_FORM` (line 115), change:

```jsx
  knockoutRules: [{ id: 1, text: 'Minimum years payroll experience: 1', declineNote: 'Auto-decline if < 1' }],
```

to:

```jsx
  knockoutRules: [{ id: 1, type: 'years_experience', value: 1 }],
```

In `handleRoleTemplateChange` (line 151-160), change:

```jsx
  function handleRoleTemplateChange(key) {
    const template = roleWorkflows[key]
    setForm((f) => ({
      ...f,
      roleTemplate: key,
      knockoutRules: template.knockoutYears > 0
        ? [{ id: Date.now(), text: `Minimum years experience: ${template.knockoutYears}`, declineNote: `Auto-decline if < ${template.knockoutYears}` }]
        : [],
    }))
  }
```

to:

```jsx
  function handleRoleTemplateChange(key) {
    const template = roleWorkflows[key]
    setForm((f) => ({
      ...f,
      roleTemplate: key,
      knockoutRules: template.knockoutYears > 0
        ? [{ id: Date.now(), type: 'years_experience', value: template.knockoutYears }]
        : [],
    }))
  }
```

- [ ] **Step 2: Update addKnockoutRule and add a type-change handler**

Change `addKnockoutRule` (line 169-174):

```jsx
  function addKnockoutRule() {
    setForm((f) => ({
      ...f,
      knockoutRules: [...f.knockoutRules, { id: Date.now(), text: '', declineNote: '' }],
    }))
  }
```

to:

```jsx
  function addKnockoutRule() {
    setForm((f) => ({
      ...f,
      knockoutRules: [...f.knockoutRules, { id: Date.now(), type: 'years_experience', value: '' }],
    }))
  }
```

Add a new function right after `updateKnockoutRule` (after line 181):

```jsx
  function updateKnockoutRuleType(id, type) {
    setForm((f) => ({
      ...f,
      knockoutRules: f.knockoutRules.map((r) => (r.id === id
        ? { id: r.id, type, value: '', ...(type === 'yes_no' ? { disqualifyingAnswer: 'no' } : {}) }
        : r)),
    }))
  }
```

(`updateKnockoutRule` and `removeKnockoutRule` stay exactly as they are — they're already generic over field name.)

- [ ] **Step 3: Replace the knockout row JSX**

Replace the row-rendering block (line 393-414):

```jsx
            <div className="req-knockout-list">
              {form.knockoutRules.map((rule) => (
                <div className="req-knockout-row" key={rule.id}>
                  <input
                    className="req-knockout-text"
                    value={rule.text}
                    placeholder="Rule description, e.g. Minimum years experience: 3"
                    onChange={(e) => updateKnockoutRule(rule.id, 'text', e.target.value)}
                  />
                  <input
                    className="req-knockout-decline"
                    value={rule.declineNote}
                    placeholder="Auto-decline condition"
                    onChange={(e) => updateKnockoutRule(rule.id, 'declineNote', e.target.value)}
                  />
                  <button type="button" className="req-knockout-remove" onClick={() => removeKnockoutRule(rule.id)} aria-label="Remove rule">
                    <X size={14} />
                  </button>
                </div>
              ))}
              {form.knockoutRules.length === 0 && <div className="req-hint">No knockout rules for this role template.</div>}
            </div>
```

with:

```jsx
            <div className="req-knockout-list">
              {form.knockoutRules.map((rule) => (
                <div className="req-knockout-row" key={rule.id}>
                  <select
                    className="req-knockout-type"
                    value={rule.type}
                    onChange={(e) => updateKnockoutRuleType(rule.id, e.target.value)}
                  >
                    <option value="years_experience">Years of Experience</option>
                    <option value="certification">Certification Required</option>
                    <option value="yes_no">Yes/No Question</option>
                  </select>

                  {rule.type === 'years_experience' && (
                    <label className="req-knockout-field">
                      <span>Minimum years</span>
                      <input
                        type="number"
                        min="0"
                        value={rule.value}
                        onChange={(e) => updateKnockoutRule(rule.id, 'value', e.target.value)}
                      />
                    </label>
                  )}

                  {rule.type === 'certification' && (
                    <label className="req-knockout-field">
                      <span>Certification name</span>
                      <input
                        value={rule.value}
                        placeholder="e.g. CPP Certified"
                        onChange={(e) => updateKnockoutRule(rule.id, 'value', e.target.value)}
                      />
                    </label>
                  )}

                  {rule.type === 'yes_no' && (
                    <>
                      <label className="req-knockout-field">
                        <span>Question</span>
                        <input
                          value={rule.value}
                          placeholder="e.g. Are you legally authorized to work in the U.S.?"
                          onChange={(e) => updateKnockoutRule(rule.id, 'value', e.target.value)}
                        />
                      </label>
                      <label className="req-knockout-field req-knockout-disqualify">
                        <span>Disqualify if answer is</span>
                        <select
                          value={rule.disqualifyingAnswer}
                          onChange={(e) => updateKnockoutRule(rule.id, 'disqualifyingAnswer', e.target.value)}
                        >
                          <option value="no">No</option>
                          <option value="yes">Yes</option>
                        </select>
                      </label>
                    </>
                  )}

                  <button type="button" className="req-knockout-remove" onClick={() => removeKnockoutRule(rule.id)} aria-label="Remove rule">
                    <X size={14} />
                  </button>
                </div>
              ))}
              {form.knockoutRules.length === 0 && <div className="req-hint">No knockout rules for this role template.</div>}
            </div>
```

- [ ] **Step 4: Update the CSS for the new row shape**

In `src/views/JobRequisitions.css`, replace lines 121-133:

```css
.req-knockout-row { display: flex; align-items: center; gap: var(--space-2); }
.req-knockout-text { flex: 2; }
.req-knockout-decline { flex: 1; }
.req-knockout-text,
.req-knockout-decline {
  padding: var(--space-2) var(--space-3);
  border: 1.5px solid var(--color-gray-200);
  border-radius: var(--radius-md);
  font-family: var(--font-family);
  font-size: var(--text-xs);
  outline: none;
  background: white;
}
```

with:

```css
.req-knockout-row { display: flex; align-items: flex-end; gap: var(--space-2); flex-wrap: wrap; }
.req-knockout-type { flex: 1; min-width: 170px; }
.req-knockout-field { display: flex; flex-direction: column; gap: 2px; flex: 2; min-width: 160px; }
.req-knockout-field span { font-size: 11px; font-weight: 600; color: var(--color-gray-500); }
.req-knockout-disqualify { flex: 1; min-width: 130px; }
.req-knockout-type,
.req-knockout-field input,
.req-knockout-field select {
  width: 100%;
  padding: var(--space-2) var(--space-3);
  border: 1.5px solid var(--color-gray-200);
  border-radius: var(--radius-md);
  font-family: var(--font-family);
  font-size: var(--text-xs);
  outline: none;
  background: white;
}
```

- [ ] **Step 5: Verify**

Run: `npm run lint`
Expected: no errors.

Manually: open "+ New Requisition", confirm a default "Years of Experience" rule shows with a number input. Switch its type to "Yes/No Question", confirm the question-text input and Yes/No disqualify select appear. Add a "Certification Required" rule. Save as draft, reopen it, confirm all three rules round-trip with their correct values. Switch Role Template and confirm the seeded rule still appears correctly as a Years of Experience rule.

- [ ] **Step 6: Commit**

```bash
git add src/views/JobRequisitions.jsx src/views/JobRequisitions.css
git commit -m "Restructure knockout rules into typed, quantifiable fields"
```

---

## Task 5: Add Requisition Detail page; route row clicks there

**Files:**
- Modify: `src/views/JobRequisitions.jsx`
- Create: `src/views/RequisitionDetail.jsx`
- Create: `src/views/RequisitionDetail.css`
- Modify: `src/App.jsx`

**Context:** No Requisition Detail page exists today — clicking a row opens the Edit modal directly. This adds `/jobs/:id`, reusing the existing `RequisitionModal` (exported for reuse) rather than duplicating it, and repoints row clicks there.

- [ ] **Step 1: Export RequisitionModal**

In `src/views/JobRequisitions.jsx`, change line 137 from:

```jsx
function RequisitionModal({ open, onClose, onCreate, onSave, onDelete, job, offices, roleWorkflows, hiringManagers, canEdit }) {
```

to:

```jsx
export function RequisitionModal({ open, onClose, onCreate, onSave, onDelete, job, offices, roleWorkflows, hiringManagers, canEdit }) {
```

- [ ] **Step 2: Change row-click behavior and remove the now-dead editingJob state**

In `JobRow` (line 49), change the destructured props from:

```jsx
function JobRow({ job, candidates, onShare, sharedId, onEdit, onViewPipeline }) {
```

to:

```jsx
function JobRow({ job, candidates, onShare, sharedId, onOpenDetail, onViewPipeline }) {
```

Change the row wrapper's `onClick` (line 55) from:

```jsx
    <div className="job-row" onClick={() => onEdit(job)}>
```

to:

```jsx
    <div className="job-row" onClick={() => onOpenDetail(job)}>
```

In the `JobRequisitions` component, remove the now-unused `editingJob` state (line 466):

```jsx
  const [editingJob, setEditingJob] = useState(null)
```

Delete this line entirely.

Update `closeModal` (line 497-500) from:

```jsx
  function closeModal() {
    setModalOpen(false)
    setEditingJob(null)
  }
```

to:

```jsx
  function closeModal() {
    setModalOpen(false)
  }
```

Update the `JobRow` call site (line 526-536) from:

```jsx
          {filteredJobs.map((job) => (
            <JobRow
              key={job.id}
              job={job}
              candidates={candidates}
              onShare={handleShare}
              sharedId={sharedId}
              onEdit={(j) => setEditingJob(j)}
              onViewPipeline={(j) => navigate(`/pipeline?job=${j.id}`)}
            />
          ))}
```

to:

```jsx
          {filteredJobs.map((job) => (
            <JobRow
              key={job.id}
              job={job}
              candidates={candidates}
              onShare={handleShare}
              sharedId={sharedId}
              onOpenDetail={(j) => navigate(`/jobs/${j.id}`)}
              onViewPipeline={(j) => navigate(`/pipeline?job=${j.id}`)}
            />
          ))}
```

Update the `<RequisitionModal>` call site (from Task 3, currently `open={modalOpen || !!editingJob}` / `job={editingJob}`) to:

```jsx
      <RequisitionModal
        open={modalOpen}
        job={null}
        onClose={closeModal}
        onCreate={handleCreate}
        onSave={handleSave}
        onDelete={handleDelete}
        canEdit={isRecruiter}
        offices={offices}
        roleWorkflows={roleWorkflows}
        hiringManagers={users.filter((u) => u.role === 'Hiring Manager')}
      />
```

- [ ] **Step 3: Add the route**

In `src/App.jsx`, add the import after line 8 (`import JobRequisitions from './views/JobRequisitions'`):

```jsx
import RequisitionDetail from './views/RequisitionDetail'
```

Add the route right after line 33 (`<Route path="/jobs" element={<JobRequisitions />} />`):

```jsx
                <Route path="/jobs/:id" element={<RequisitionDetail />} />
```

- [ ] **Step 4: Create RequisitionDetail.jsx**

Create `src/views/RequisitionDetail.jsx`:

```jsx
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ChevronLeft, Users } from 'lucide-react'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import EmptyState from '../components/ui/EmptyState'
import Loading from '../components/ui/Loading'
import { useJobs } from '../hooks/useJobs'
import { useCandidates } from '../hooks/useCandidates'
import { useOffices } from '../hooks/useOffices'
import { useUsers } from '../hooks/useUsers'
import { useRoleWorkflowTemplates } from '../hooks/useRoleWorkflowTemplates'
import { usePersona } from '../context/PersonaContext'
import { RequisitionModal } from './JobRequisitions'
import './RequisitionDetail.css'

const STAGE_ORDER = ['new', 'screening', 'interviewing', 'offer', 'hired', 'rejected']
const STAGE_LABELS = {
  new: 'New Applicants',
  screening: 'Phone Screen',
  interviewing: 'Interviewing',
  offer: 'Offer Stage',
  hired: 'Hired',
  rejected: 'Not Selected',
}

export default function RequisitionDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { persona } = usePersona()
  const isRecruiter = persona === 'recruiter'
  const { jobs, loading: jobsLoading, updateJob, deleteJob } = useJobs()
  const { candidates, loading: candidatesLoading } = useCandidates()
  const { offices, loading: officesLoading } = useOffices()
  const { users, loading: usersLoading } = useUsers()
  const { roleWorkflows, loading: workflowsLoading } = useRoleWorkflowTemplates()
  const [editing, setEditing] = useState(false)

  if (jobsLoading || candidatesLoading || officesLoading || usersLoading || workflowsLoading) return <Loading />

  const job = jobs.find((j) => j.id === id)
  if (!job) return <EmptyState icon={Users} title="Requisition not found" subtitle="It may have been deleted." />

  const applicants = candidates.filter((c) => c.jobId === job.id)

  async function handleDelete(jobId) {
    const ok = await deleteJob(jobId)
    if (ok) navigate('/jobs')
    return ok
  }

  return (
    <div className="requisition-detail">
      <div className="page-header">
        <div className="rd-header-left">
          <Button variant="ghost" size="sm" onClick={() => navigate('/jobs')}>
            <ChevronLeft size={16} /> Requisitions
          </Button>
          <h1 className="page-title">{job.title}</h1>
          <Badge variant={job.status} />
        </div>
        <div className="rd-header-actions">
          <Button variant="ghost" size="sm" onClick={() => navigate(`/pipeline?job=${job.id}`)}>
            <Users size={14} /> View Pipeline
          </Button>
          {isRecruiter && (
            <Button variant="primary" size="sm" onClick={() => setEditing(true)}>Edit</Button>
          )}
        </div>
      </div>

      <div className="rd-layout">
        <Card>
          <Card.Header><Card.Title>Requisition Info</Card.Title></Card.Header>
          <Card.Body>
            <div className="rd-info-grid">
              <div className="rd-info-row"><span className="rd-info-label">Department</span><span>{job.department}</span></div>
              <div className="rd-info-row"><span className="rd-info-label">Location</span><span>{job.location}</span></div>
              <div className="rd-info-row"><span className="rd-info-label">Comp Range</span><span>{job.compRange}</span></div>
              <div className="rd-info-row"><span className="rd-info-label">Posted</span><span>{job.postedDate}</span></div>
              <div className="rd-info-row"><span className="rd-info-label">Days Open</span><span>{job.daysOpen}</span></div>
              <div className="rd-info-row"><span className="rd-info-label">Applicants</span><span>{job.applicantCount}</span></div>
            </div>
          </Card.Body>
        </Card>

        <Card>
          <Card.Header><Card.Title>Pipeline Funnel</Card.Title></Card.Header>
          <Card.Body>
            <div className="rd-funnel">
              {STAGE_ORDER.map((key) => (
                <div className="rd-funnel-stage" key={key}>
                  <div className="rd-funnel-count">{job.stageCounts[key]}</div>
                  <div className="rd-funnel-label">{STAGE_LABELS[key]}</div>
                </div>
              ))}
            </div>
            {applicants.length === 0 && <div className="req-hint">No applicants yet.</div>}
          </Card.Body>
        </Card>
      </div>

      <RequisitionModal
        open={editing}
        job={job}
        onClose={() => setEditing(false)}
        onCreate={() => {}}
        onSave={(jobId, updates) => updateJob(jobId, updates)}
        onDelete={handleDelete}
        canEdit={isRecruiter}
        offices={offices}
        roleWorkflows={roleWorkflows}
        hiringManagers={users.filter((u) => u.role === 'Hiring Manager')}
      />
    </div>
  )
}
```

- [ ] **Step 5: Create RequisitionDetail.css**

Create `src/views/RequisitionDetail.css`:

```css
.rd-header-left { display: flex; align-items: center; gap: var(--space-3); }
.rd-header-actions { display: flex; align-items: center; gap: var(--space-2); }

.rd-layout { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4); align-items: start; }

.rd-info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-3); }
.rd-info-row { display: flex; flex-direction: column; gap: 2px; font-size: var(--text-sm); color: var(--color-gray-800); }
.rd-info-label { font-size: var(--text-xs); font-weight: 600; color: var(--color-gray-500); }

.rd-funnel { display: flex; flex-wrap: wrap; gap: var(--space-4); }
.rd-funnel-stage { text-align: center; min-width: 80px; }
.rd-funnel-count { font-size: var(--text-xl); font-weight: 700; color: var(--color-maroon); }
.rd-funnel-label { font-size: var(--text-xs); color: var(--color-gray-500); margin-top: 2px; }

.rd-approval-actions { display: flex; flex-direction: column; gap: var(--space-3); }
.rd-approval-buttons { display: flex; gap: var(--space-2); }

@media (max-width: 860px) {
  .rd-layout { grid-template-columns: 1fr; }
}
```

- [ ] **Step 6: Verify**

Run: `npm run lint`
Expected: no errors.

Manually: go to `/jobs`, click any requisition row — confirm it navigates to `/jobs/<id>` (not the edit modal) and shows department/location/comp/posted/days-open/applicants plus a stage funnel matching the numbers shown on the grid card. Click "Edit" — confirm the existing modal opens and still saves correctly. Click "View Pipeline" — confirm it reaches `/pipeline?job=<id>`. From the requisitions list, confirm "+ New Requisition" still works (it's unaffected by this task).

- [ ] **Step 7: Commit**

```bash
git add src/views/JobRequisitions.jsx src/views/RequisitionDetail.jsx src/views/RequisitionDetail.css src/App.jsx
git commit -m "Add Requisition Detail page; route row clicks there instead of the edit modal"
```

---

## Task 6: Real approval gate — submission logic + Status dropdown restriction

**Files:**
- Modify: `src/views/JobRequisitions.jsx`

**Context:** Today, single-approver chains (Intern, IC, Production Floor — all `approvalChain: ['hiring_manager']`, length 1) skip `pending_approval` entirely and go straight to `open`. Every role template lists at least `hiring_manager` in its chain, so this task makes ALL chains pause for real approval, and removes the recruiter's ability to bypass by setting status directly to `open` while pending.

- [ ] **Step 1: Change the submission status logic**

In `handleSubmit` (line 257-258), change:

```jsx
    const template = roleWorkflows[form.roleTemplate]
    const status = template.approvalChain.length > 1 ? 'pending_approval' : 'open'
```

to:

```jsx
    const template = roleWorkflows[form.roleTemplate]
    const status = template.approvalChain.length > 0 ? 'pending_approval' : 'open'
```

- [ ] **Step 2: Update the submission-phase messaging to match**

In the "posting"/"success" phase JSX (line 284 and 287-289), change:

```jsx
                {template.approvalChain.length > 1 ? 'Submitted for approval' : `Posted to ${form.boards.length} board${form.boards.length === 1 ? '' : 's'}`}
```

to:

```jsx
                {template.approvalChain.length > 0 ? 'Submitted for approval' : `Posted to ${form.boards.length} board${form.boards.length === 1 ? '' : 's'}`}
```

and:

```jsx
                {template.approvalChain.length > 1
                  ? `Routing through ${template.approvalChain.map((r) => APPROVAL_ROLE_LABELS[r]).join(' → ')}`
                  : 'Knockout rules active · E-sig enabled on offer letter'}
```

to:

```jsx
                {template.approvalChain.length > 0
                  ? `Routing through ${template.approvalChain.map((r) => APPROVAL_ROLE_LABELS[r]).join(' → ')}`
                  : 'Knockout rules active · E-sig enabled on offer letter'}
```

- [ ] **Step 3: Restrict the Status dropdown while pending_approval**

In the Status field (line 302-309), change:

```jsx
            {job && (
              <label className="req-field">
                <span>Status</span>
                <select value={form.status} onChange={(e) => updateField('status', e.target.value)}>
                  {FILTERS.filter((f) => f.key !== 'all').map((f) => <option key={f.key} value={f.key}>{f.label}</option>)}
                </select>
              </label>
            )}
```

to:

```jsx
            {job && (
              <label className="req-field">
                <span>Status</span>
                <select value={form.status} onChange={(e) => updateField('status', e.target.value)}>
                  {FILTERS.filter((f) => f.key !== 'all' && !(job.status === 'pending_approval' && f.key === 'open')).map((f) => <option key={f.key} value={f.key}>{f.label}</option>)}
                </select>
              </label>
            )}
```

- [ ] **Step 4: Verify**

Run: `npm run lint`
Expected: no errors.

Manually: create a new requisition using the "Intern" or "IC" role template (single-step chain) — confirm it now lands in `pending_approval` (previously it would have gone straight to `open`). Create one using "Manager" or "Director" (multi-step chain) — confirm it also lands in `pending_approval` as before. Open a `pending_approval` requisition's edit modal as a recruiter and confirm the Status dropdown no longer offers "Open" as an option (Draft/Pending Approval/Closed still available).

- [ ] **Step 5: Commit**

```bash
git add src/views/JobRequisitions.jsx
git commit -m "Require real approval for every requisition chain; remove recruiter's open-status bypass while pending"
```

---

## Task 7: Add Hiring Manager Approve/Reject action to Requisition Detail

**Files:**
- Modify: `src/views/RequisitionDetail.jsx`

**Context:** This app only has 3 real personas (Recruiter, Hiring Manager, Candidate) — `hr_director`/`vp_finance` steps stay display-only since no persona exists to act as them. Every chain lists `hiring_manager` first, so this is the one real, actionable gate. Approve moves the requisition to `open`. Reject moves it back to `draft` and, if a reason is entered, surfaces it via the existing `useNotifications` store (no new schema).

- [ ] **Step 1: Add the imports and the CURRENT_HM_ID constant**

In `src/views/RequisitionDetail.jsx`, add to the imports:

```jsx
import { useNotifications } from '../hooks/useNotifications'
```

Add this constant near the top of the file, after the `STAGE_LABELS` object:

```jsx
const CURRENT_HM_ID = 'user-002' // R. Patel — the assumed logged-in Hiring Manager, matching Pipeline.jsx
```

- [ ] **Step 2: Compute approval state and add the handlers**

Inside the `RequisitionDetail` component, after the `const { persona } = usePersona()` / `isRecruiter` lines, add:

```jsx
  const { addNotification } = useNotifications()
  const isHiringManager = persona === 'hiring_manager'
```

After the `const job = jobs.find(...)` / not-found guard, add (still inside the component, before the `return`):

```jsx
  const isMyApproval = isHiringManager && job.hiringManagerId === CURRENT_HM_ID && job.status === 'pending_approval'

  function handleApprove() {
    updateJob(job.id, { status: 'open' })
  }

  function handleReject() {
    const reason = window.prompt('Reason for rejecting (optional):')
    updateJob(job.id, { status: 'draft' })
    if (reason) addNotification('Requisition rejected', `"${job.title}" was rejected: ${reason}`)
  }
```

- [ ] **Step 3: Render the Approval card**

Add this `Card` right after the "Pipeline Funnel" `Card` closes (before the closing `</div>` of `.rd-layout`):

```jsx
        {job.status === 'pending_approval' && (
          <Card>
            <Card.Header><Card.Title>Approval</Card.Title></Card.Header>
            <Card.Body>
              {isMyApproval ? (
                <div className="rd-approval-actions">
                  <p className="req-hint">This requisition is awaiting your approval as the assigned Hiring Manager.</p>
                  <div className="rd-approval-buttons">
                    <Button variant="danger" size="sm" onClick={handleReject}>Reject</Button>
                    <Button variant="primary" size="sm" onClick={handleApprove}>Approve</Button>
                  </div>
                </div>
              ) : (
                <p className="req-hint">Awaiting hiring manager approval.</p>
              )}
            </Card.Body>
          </Card>
        )}
```

- [ ] **Step 4: Verify**

Run: `npm run lint`
Expected: no errors.

Manually: as a recruiter, create a requisition and assign R. Patel (`user-002`) as its Hiring Manager — confirm it's `pending_approval`. Open its Detail page as the Recruiter persona — confirm it shows "Awaiting hiring manager approval" with no buttons. Switch to the Hiring Manager persona (topbar switcher) and revisit the same Detail page — confirm "Approve"/"Reject" buttons now appear. Click Approve — confirm status becomes `open` (check the badge and the requisitions list filter counts). Repeat with a fresh pending requisition and click Reject with a reason — confirm status returns to `draft` and the reason appears in the topbar's notification bell.

- [ ] **Step 5: Commit**

```bash
git add src/views/RequisitionDetail.jsx
git commit -m "Add Hiring Manager Approve/Reject action to Requisition Detail page"
```

---

## Task 8: Add grid/grouped-by-department list view toggle

**Files:**
- Modify: `src/views/JobRequisitions.jsx`
- Modify: `src/views/JobRequisitions.css`

**Files:** reuses the existing `.job-row` styling for both views — no new row component needed.

- [ ] **Step 1: Import view-toggle icons and add view state**

Add `LayoutGrid, List` to the existing lucide-react import (line 3-6):

```jsx
import {
  Plus, Link2, Check, X, Loader2, CheckCircle2, Trash2,
  Landmark, Users, Handshake, Code2, Briefcase, LayoutGrid, List,
} from 'lucide-react'
```

In the `JobRequisitions` component, add next to the other `useState` calls (near line 464-467):

```jsx
  const [view, setView] = useState('grid')
```

- [ ] **Step 2: Add the toggle control**

In the `filter-strip` div (line 514-520), add the toggle right after the closing `))}` of the `FILTERS.map(...)`:

```jsx
      <div className="filter-strip">
        {FILTERS.map((f) => (
          <FilterChip key={f.key} active={filter === f.key} onClick={() => setFilter(f.key)}>
            {f.label} ({counts[f.key]})
          </FilterChip>
        ))}
        <div className="view-toggle">
          <button type="button" className={`view-toggle-btn${view === 'grid' ? ' active' : ''}`} onClick={() => setView('grid')} aria-label="Grid view">
            <LayoutGrid size={15} />
          </button>
          <button type="button" className={`view-toggle-btn${view === 'list' ? ' active' : ''}`} onClick={() => setView('list')} aria-label="Grouped list view">
            <List size={15} />
          </button>
        </div>
      </div>
```

- [ ] **Step 3: Render the grouped-list view**

Replace the results block (line 522-538):

```jsx
      {filteredJobs.length === 0 ? (
        <Card><EmptyState icon={Briefcase} title="No requisitions here" subtitle="Try a different filter, or create a new one." /></Card>
      ) : (
        <div className="jobs-grid">
          {filteredJobs.map((job) => (
            <JobRow
              key={job.id}
              job={job}
              candidates={candidates}
              onShare={handleShare}
              sharedId={sharedId}
              onOpenDetail={(j) => navigate(`/jobs/${j.id}`)}
              onViewPipeline={(j) => navigate(`/pipeline?job=${j.id}`)}
            />
          ))}
        </div>
      )}
```

with:

```jsx
      {filteredJobs.length === 0 ? (
        <Card><EmptyState icon={Briefcase} title="No requisitions here" subtitle="Try a different filter, or create a new one." /></Card>
      ) : view === 'grid' ? (
        <div className="jobs-grid">
          {filteredJobs.map((job) => (
            <JobRow
              key={job.id}
              job={job}
              candidates={candidates}
              onShare={handleShare}
              sharedId={sharedId}
              onOpenDetail={(j) => navigate(`/jobs/${j.id}`)}
              onViewPipeline={(j) => navigate(`/pipeline?job=${j.id}`)}
            />
          ))}
        </div>
      ) : (
        <div className="jobs-grouped-list">
          {Object.entries(
            filteredJobs.reduce((groups, job) => {
              (groups[job.department] ??= []).push(job)
              return groups
            }, {}),
          )
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([department, jobsInDept]) => (
              <div className="jobs-dept-group" key={department}>
                <div className="jobs-dept-group-hdr">
                  {department} <span className="jobs-dept-group-count">({jobsInDept.length})</span>
                </div>
                {jobsInDept.map((job) => (
                  <JobRow
                    key={job.id}
                    job={job}
                    candidates={candidates}
                    onShare={handleShare}
                    sharedId={sharedId}
                    onOpenDetail={(j) => navigate(`/jobs/${j.id}`)}
                    onViewPipeline={(j) => navigate(`/pipeline?job=${j.id}`)}
                  />
                ))}
              </div>
            ))}
        </div>
      )}
```

- [ ] **Step 4: Add CSS**

In `src/views/JobRequisitions.css`, add after the existing `.jobs-grid` rule (line 1):

```css
.view-toggle { display: flex; gap: var(--space-1); margin-left: auto; }
.view-toggle-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1.5px solid var(--color-gray-200);
  border-radius: var(--radius-md);
  background: white;
  color: var(--color-gray-500);
  cursor: pointer;
}
.view-toggle-btn.active { background: var(--color-maroon); border-color: var(--color-maroon); color: white; }

.jobs-grouped-list { display: flex; flex-direction: column; gap: var(--space-5); }
.jobs-dept-group { display: flex; flex-direction: column; gap: var(--space-3); }
.jobs-dept-group-hdr { font-size: var(--text-sm); font-weight: 700; color: var(--color-gray-700); }
.jobs-dept-group-count { font-weight: 400; color: var(--color-gray-400); }
```

- [ ] **Step 5: Verify**

Run: `npm run lint`
Expected: no errors.

Manually: on `/jobs`, confirm the grid/list toggle appears at the right end of the filter strip. Click the list icon — confirm requisitions now render grouped under department headers, alphabetically ordered, each showing a correct count. Confirm clicking a row in list view still navigates to its Detail page. Switch back to grid — confirm the original layout is unchanged.

- [ ] **Step 6: Commit**

```bash
git add src/views/JobRequisitions.jsx src/views/JobRequisitions.css
git commit -m "Add grid/grouped-by-department list view toggle to Job Requisitions"
```

---

## Task 9: Flip Pipeline header emphasis to the requisition title

**Files:**
- Modify: `src/views/Pipeline.jsx:207-222`
- Modify: `src/views/Pipeline.css:1-13`

- [ ] **Step 1: Restructure the header JSX**

In `src/views/Pipeline.jsx`, replace lines 207-222:

```jsx
  return (
    <div className="pipeline">
      <div className="page-header">
        <div>
          <div className="pipeline-title-row">
            <h1 className="page-title">Candidate Pipeline</h1>
            <select className="pipeline-job-select" value={selectedJobId} onChange={(e) => handleJobChange(e.target.value)}>
              {selectableJobs.map((j) => <option key={j.id} value={j.id}>{j.title}</option>)}
            </select>
          </div>
          <div className="page-subtitle">
            {selectedJob.applicantCount} candidates · {selectedJob.daysOpen} days open
            {isHiringManager && ' · Hiring Manager view: screened candidates only, no offer management'}
          </div>
        </div>
      </div>
```

with:

```jsx
  return (
    <div className="pipeline">
      <div className="page-header">
        <div>
          <div className="pipeline-eyebrow">Candidate Pipeline</div>
          <div className="pipeline-title-row">
            <h1 className="page-title pipeline-job-title" onClick={() => navigate(`/jobs/${selectedJobId}`)}>{selectedJob.title}</h1>
            <select className="pipeline-job-select" value={selectedJobId} onChange={(e) => handleJobChange(e.target.value)}>
              {selectableJobs.map((j) => <option key={j.id} value={j.id}>{j.title}</option>)}
            </select>
          </div>
          <div className="page-subtitle">
            {selectedJob.applicantCount} candidates · {selectedJob.daysOpen} days open
            {isHiringManager && ' · Hiring Manager view: screened candidates only, no offer management'}
          </div>
        </div>
      </div>
```

(`navigate` is already defined via `const navigate = useNavigate()` at line 147 — no new import needed.)

- [ ] **Step 2: Update the CSS**

In `src/views/Pipeline.css`, replace lines 1-13:

```css
.pipeline-title-row { display: flex; align-items: center; gap: var(--space-3); }
.pipeline-job-select {
  padding: var(--space-1) var(--space-3);
  border: 1.5px solid var(--color-gray-200);
  border-radius: var(--radius-full);
  font-family: var(--font-family);
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--color-maroon);
  background: white;
  outline: none;
  cursor: pointer;
}
```

with:

```css
.pipeline-eyebrow {
  font-size: var(--text-xs);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .04em;
  color: var(--color-gray-400);
  margin-bottom: 2px;
}
.pipeline-title-row { display: flex; align-items: center; gap: var(--space-3); }
.pipeline-job-title { cursor: pointer; }
.pipeline-job-title:hover { text-decoration: underline; }
.pipeline-job-select {
  padding: var(--space-2) var(--space-4);
  border: 1.5px solid var(--color-maroon-light);
  border-radius: var(--radius-full);
  font-family: var(--font-family);
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--color-maroon);
  background: rgba(109,23,78,.06);
  outline: none;
  cursor: pointer;
}
```

- [ ] **Step 3: Verify**

Run: `npm run lint`
Expected: no errors.

Manually: open `/pipeline`. Confirm the requisition's actual title (e.g. "Sr. Payroll Analyst") is now the large headline, with a small "CANDIDATE PIPELINE" label above it. Confirm the job-switcher dropdown is now visually heavier (tinted background, thicker border) rather than a bare native select. Click the title — confirm it navigates to that requisition's Detail page (`/jobs/:id`). Switch jobs via the dropdown — confirm the URL's `?job=` param and the displayed candidates still update correctly.

- [ ] **Step 4: Commit**

```bash
git add src/views/Pipeline.jsx src/views/Pipeline.css
git commit -m "Make the current requisition the Pipeline page's headline, not a subtle select"
```

---

## Task 10: Add confirmation dialog to Pipeline's drag-and-drop

**Files:**
- Modify: `src/views/Pipeline.jsx:188-193`

- [ ] **Step 1: Add the confirm check**

Replace `handleDrop` (line 188-193):

```jsx
  function handleDrop(columnKey) {
    setDragOverCol(null)
    const candidate = jobCandidates.find((c) => c.id === draggedId)
    setDraggedId(null)
    if (candidate && candidate.stage !== columnKey) updateStage(candidate.id, columnKey)
  }
```

with:

```jsx
  function handleDrop(columnKey) {
    setDragOverCol(null)
    const candidate = jobCandidates.find((c) => c.id === draggedId)
    setDraggedId(null)
    if (!candidate || candidate.stage === columnKey) return
    const columnLabel = COLUMNS.find((c) => c.key === columnKey)?.label ?? columnKey
    if (!window.confirm(`Move ${candidate.name} to ${columnLabel}?`)) return
    updateStage(candidate.id, columnKey)
  }
```

- [ ] **Step 2: Verify**

Run: `npm run lint`
Expected: no errors.

Manually: on `/pipeline`, drag a candidate card to a different column. Confirm a "Move [Name] to [Column Label]?" dialog appears before anything happens. Confirm clicking Cancel leaves the candidate in their original column, and clicking OK moves them as before. Confirm dropping a candidate back into their own current column still does nothing (no dialog, matching the existing no-op guard).

- [ ] **Step 3: Commit**

```bash
git add src/views/Pipeline.jsx
git commit -m "Require confirmation before drag-and-drop stage changes in Pipeline"
```

---

## Task 11: Add "Advance to next stage" button on Candidate Profile

**Files:**
- Modify: `src/views/CandidateProfile.jsx`

**Context:** `useCandidates.js` already has a working `updateStage(id, stage)` mutation (used by Pipeline's drag-and-drop) and this file already defines the ordered `FORWARD_STAGES` list (`screening → interviewing → offer → hired`) for the timeline. This task adds the missing forward step from `CandidateProfile.jsx` itself, using the same confirm-dialog pattern as Task 10.

- [ ] **Step 1: Add the ArrowRight icon import**

Change line 3-7 from:

```jsx
import {
  ChevronLeft, ChevronRight, Mail, CalendarClock, FileSignature, MapPin, Phone,
  Link2, DollarSign, Briefcase, CalendarCheck, Sparkles, FileText, ShieldCheck,
  BadgeCheck, Loader2, CheckCircle2, Send,
} from 'lucide-react'
```

to:

```jsx
import {
  ChevronLeft, ChevronRight, Mail, CalendarClock, FileSignature, MapPin, Phone,
  Link2, DollarSign, Briefcase, CalendarCheck, Sparkles, FileText, ShieldCheck,
  BadgeCheck, Loader2, CheckCircle2, Send, ArrowRight,
} from 'lucide-react'
```

- [ ] **Step 2: Add a nextStageFor helper next to FORWARD_STAGES**

After the `FORWARD_STAGES` constant (line 35-40), add:

```jsx
const STAGE_ADVANCE_ORDER = ['new', ...FORWARD_STAGES.map((s) => s.key)]

function nextStageFor(stage) {
  const idx = STAGE_ADVANCE_ORDER.indexOf(stage)
  if (idx === -1 || idx === STAGE_ADVANCE_ORDER.length - 1) return null
  const nextKey = STAGE_ADVANCE_ORDER[idx + 1]
  const label = FORWARD_STAGES.find((s) => s.key === nextKey)?.label ?? nextKey
  return { key: nextKey, label }
}
```

- [ ] **Step 3: Destructure updateStage and compute nextStage**

Change line 85 from:

```jsx
  const { candidates, loading: candidatesLoading, addNote, updateCandidate } = useCandidates()
```

to:

```jsx
  const { candidates, loading: candidatesLoading, addNote, updateCandidate, updateStage } = useCandidates()
```

After the `const candidate = candidates.find((c) => c.id === id)` line (line 110) — this is after the loading/not-found guards further down, so add it right where `candidate` is first available for use in the component body (near the other derived values, before the `return`):

```jsx
  const nextStage = candidate ? nextStageFor(candidate.stage) : null
```

- [ ] **Step 4: Add the handler**

Next to the existing `handleMarkNotSelected` function (line 187-190), add:

```jsx
  function handleAdvanceStage() {
    if (!window.confirm(`Move ${candidate.name} to ${nextStage.label}?`)) return
    updateStage(candidate.id, nextStage.key)
  }
```

- [ ] **Step 5: Render the button**

In `cp-header-actions` (line 208-216), add the new button after the existing Generate Offer / View Offer button:

```jsx
        <div className="cp-header-actions">
          <Button variant="ghost" size="sm" onClick={() => setActiveTab('comms')}><Mail size={14} /> Email</Button>
          <Button variant="ghost" size="sm" onClick={() => setActiveTab('schedule')}><CalendarClock size={14} /> Schedule</Button>
          {!isHiringManager && (
            <Button variant="accent" size="sm" onClick={() => setActiveTab('offer')}>
              <FileSignature size={14} /> {offer ? 'View Offer' : 'Generate Offer'}
            </Button>
          )}
          {nextStage && (
            <Button variant="primary" size="sm" onClick={handleAdvanceStage}>
              <ArrowRight size={14} /> Advance to {nextStage.label}
            </Button>
          )}
        </div>
```

- [ ] **Step 6: Verify**

Run: `npm run lint`
Expected: no errors.

Manually: open a candidate at each stage (`new`, `screening`, `interviewing`, `offer`) and confirm the "Advance to [next stage] →" button shows the correct next-stage label each time, prompts a confirm dialog naming the candidate and target stage, and — on confirming — updates the candidate's stage (check the badge in the header changes and Pipeline reflects the move). Open a candidate already at `hired` or `rejected` and confirm the button doesn't render at all.

- [ ] **Step 7: Commit**

```bash
git add src/views/CandidateProfile.jsx
git commit -m "Add Advance to next stage button on Candidate Profile"
```

---

## Final Check

After all 11 tasks:

- [ ] Run `npm run build` once to confirm the whole app still builds cleanly end-to-end: `npm run build` — expected: build succeeds with no errors.
- [ ] Do one full manual walkthrough covering every item in the spec's Section 7 (Testing) in one sitting, since individual task-level smoke checks don't catch cross-task interactions (e.g. a requisition created in Task 6's pending-approval state being approved in Task 7, then viewed via Task 5's Detail page and Task 9's Pipeline header in the same session).
