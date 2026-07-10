import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Plus, Link2, Check, X, Loader2, CheckCircle2, Trash2,
  Landmark, Users, Handshake, Code2, Briefcase, LayoutGrid, List,
} from 'lucide-react'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Avatar from '../components/ui/Avatar'
import Button from '../components/ui/Button'
import FilterChip from '../components/ui/FilterChip'
import Modal from '../components/ui/Modal'
import EmptyState from '../components/ui/EmptyState'
import { useJobs } from '../hooks/useJobs'
import { useOffices } from '../hooks/useOffices'
import { useUsers } from '../hooks/useUsers'
import { useCandidates } from '../hooks/useCandidates'
import { useRoleWorkflowTemplates } from '../hooks/useRoleWorkflowTemplates'
import { usePersona } from '../context/PersonaContext'
import Loading from '../components/ui/Loading'
import './JobRequisitions.css'

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'open', label: 'Open' },
  { key: 'pending_approval', label: 'Pending Approval' },
  { key: 'draft', label: 'Draft' },
  { key: 'closed', label: 'Closed' },
]

const DEPT_ICONS = {
  'Finance & Accounting': Landmark,
  'Human Resources': Users,
  'Client Services': Handshake,
  'Engineering': Code2,
}

const APPROVAL_ROLE_LABELS = {
  hiring_manager: 'Hiring Manager',
  hr_director: 'HR Director',
  vp_finance: 'VP Finance',
}

const ALL_BOARDS = ['LinkedIn', 'Indeed', 'ZipRecruiter', 'Glassdoor', 'Career Site']

function slugify(title) {
  return title.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

function locationLabel(offices, officeIds) {
  const selected = officeIds.map((id) => offices.find((o) => o.id === id)).filter(Boolean)
  return selected.map((o) => `${o.city}, ${o.state}`).join('; ')
}

function JobRow({ job, candidates, onShare, sharedId, onOpenDetail, onViewPipeline }) {
  const Icon = DEPT_ICONS[job.department] ?? Briefcase
  const topCandidates = candidates.filter((c) => c.jobId === job.id)
  const overflow = job.applicantCount - topCandidates.length

  return (
    <div className="job-row" onClick={() => onOpenDetail(job)}>
      <div className="job-dept-icon"><Icon size={19} /></div>

      <div className="job-info">
        <div className="job-title">{job.title}</div>
        <div className="job-meta">
          {job.department} · {job.location} · {job.compRange} · Posted {job.postedDate}
        </div>
        <div className="job-badges" data-tour="tour-approval-workflow">
          <Badge variant={job.status} />
          {job.isInternal && <span className="job-tag">Internal Only</span>}
          <span className="job-link-preview" data-tour="tour-job-boards">
            <Link2 size={11} /> dmhire.com/apply/<span className="job-slug">{slugify(job.title)}</span>
          </span>
        </div>
      </div>

      <div className="job-stats">
        <div className="job-stat"><div className="js-val">{job.applicantCount}</div><div className="js-label">Applicants</div></div>
        <div className="job-stat"><div className="js-val">{job.stageCounts.screening}</div><div className="js-label">Screening</div></div>
        <div className="job-stat"><div className="js-val">{job.stageCounts.interviewing}</div><div className="js-label">Interview</div></div>
        <div className="job-stat"><div className="js-val js-val-warn">{job.daysOpen}</div><div className="js-label">Days Open</div></div>
      </div>

      <div className="job-actions" onClick={(e) => e.stopPropagation()}>
        {topCandidates.length > 0 && (
          <Avatar.Group>
            {topCandidates.slice(0, 2).map((c) => (
              <Avatar key={c.id} initials={c.initials} color={c.avatarColor} size="sm" />
            ))}
            {overflow > 0 && <Avatar initials={`+${overflow}`} color="navy" size="sm" />}
          </Avatar.Group>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onShare(job)}
        >
          {sharedId === job.id ? <><Check size={13} /> Copied!</> : <><Link2 size={13} /> Share Link</>}
        </Button>
        <Button variant="ghost" size="sm" onClick={() => onViewPipeline(job)}>
          <Users size={13} /> View Pipeline
        </Button>
      </div>
    </div>
  )
}

const EMPTY_FORM = {
  title: '',
  department: 'Finance & Accounting',
  officeIds: ['office-detroit'],
  hiringManagerId: '',
  compRange: '',
  startDate: '',
  headcountJustification: '',
  description: '',
  roleTemplate: 'ic',
  boards: ['LinkedIn', 'Indeed', 'Career Site'],
  internalOnly: false,
  knockoutRules: [{ id: 1, type: 'years_experience', value: 1 }],
}

function formFromJob(job) {
  if (!job) return EMPTY_FORM
  return {
    title: job.title,
    department: job.department,
    officeIds: job.officeIds?.length ? job.officeIds : [],
    hiringManagerId: job.hiringManagerId || '',
    compRange: job.compRange,
    startDate: '',
    headcountJustification: '',
    description: job.description || '',
    roleTemplate: job.roleTemplate,
    boards: job.boards || [],
    internalOnly: job.isInternal,
    knockoutRules: job.knockoutRules || [],
    status: job.status,
  }
}

export function RequisitionModal({ open, onClose, onCreate, onSave, onDelete, job, offices, roleWorkflows, hiringManagers, canEdit }) {
  const [form, setForm] = useState(() => formFromJob(job))
  const [phase, setPhase] = useState('form') // form | posting | success
  const readOnly = !!job && !canEdit

  // Re-derive the form whenever the modal opens, so editing job A then job B
  // (or opening "New Requisition" after an edit) doesn't leak stale field values.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (open) { setForm(formFromJob(job)); setPhase('form') } }, [open, job?.id])

  function updateField(key, value) {
    setForm((f) => ({ ...f, [key]: value }))
  }

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

  function toggleBoard(board) {
    setForm((f) => ({
      ...f,
      boards: f.boards.includes(board) ? f.boards.filter((b) => b !== board) : [...f.boards, board],
    }))
  }

  function toggleOffice(officeId) {
    setForm((f) => ({
      ...f,
      officeIds: f.officeIds.includes(officeId) ? f.officeIds.filter((id) => id !== officeId) : [...f.officeIds, officeId],
    }))
  }

  function addKnockoutRule() {
    setForm((f) => ({
      ...f,
      knockoutRules: [...f.knockoutRules, { id: Date.now(), type: 'years_experience', value: '' }],
    }))
  }

  function updateKnockoutRule(id, key, value) {
    setForm((f) => ({
      ...f,
      knockoutRules: f.knockoutRules.map((r) => (r.id === id ? { ...r, [key]: value } : r)),
    }))
  }

  function updateKnockoutRuleType(id, type) {
    setForm((f) => ({
      ...f,
      knockoutRules: f.knockoutRules.map((r) => (r.id === id
        ? { id: r.id, type, value: '', ...(type === 'yes_no' ? { disqualifyingAnswer: 'no' } : {}) }
        : r)),
    }))
  }

  function removeKnockoutRule(id) {
    setForm((f) => ({ ...f, knockoutRules: f.knockoutRules.filter((r) => r.id !== id) }))
  }

  function reset() {
    setForm(EMPTY_FORM)
    setPhase('form')
  }

  function handleClose() {
    reset()
    onClose()
  }

  function buildJob(status) {
    const template = roleWorkflows[form.roleTemplate]
    return {
      id: `job-${Date.now()}`,
      title: form.title || 'Untitled Requisition',
      department: form.department,
      location: locationLabel(offices, form.officeIds),
      officeIds: form.officeIds,
      compRange: form.compRange,
      postedDate: new Date().toISOString().slice(0, 10),
      status,
      isInternal: form.internalOnly,
      roleTemplate: form.roleTemplate,
      boards: form.internalOnly ? [] : form.boards,
      knockoutRules: form.knockoutRules,
      approvalChain: template.approvalChain,
      hiringManagerId: form.hiringManagerId || null,
      daysOpen: 0,
      applicantCount: 0,
    }
  }

  function handleSaveDraft() {
    onCreate(buildJob('draft'))
    handleClose()
  }

  async function handleDelete() {
    if (!window.confirm(`Delete "${job.title}"? This can't be undone.`)) return
    const ok = await onDelete(job.id)
    if (!ok) {
      window.alert('Could not delete this requisition — the database rejected the delete (permission not enabled yet).')
      return
    }
    handleClose()
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (readOnly) return
    if (job) {
      const template = roleWorkflows[form.roleTemplate]
      onSave(job.id, {
        title: form.title || 'Untitled Requisition',
        department: form.department,
        location: form.officeIds.length ? locationLabel(offices, form.officeIds) : job.location,
        officeIds: form.officeIds,
        hiringManagerId: form.hiringManagerId || null,
        compRange: form.compRange,
        status: form.status,
        isInternal: form.internalOnly,
        roleTemplate: form.roleTemplate,
        boards: form.internalOnly ? [] : form.boards,
        knockoutRules: form.knockoutRules,
        approvalChain: template.approvalChain,
      })
      handleClose()
      return
    }
    const template = roleWorkflows[form.roleTemplate]
    const status = template.approvalChain.length > 0 ? 'pending_approval' : 'open'
    setPhase('posting')
    setTimeout(() => setPhase('success'), 1100)
    setTimeout(() => {
      onCreate(buildJob(status))
      handleClose()
    }, 2300)
  }

  const template = roleWorkflows[form.roleTemplate]

  return (
    <Modal open={open} onClose={handleClose} title={phase === 'form' ? (job ? (readOnly ? 'View Job Requisition' : 'Edit Job Requisition') : 'New Job Requisition') : 'Submitting…'}>
      {phase !== 'form' ? (
        <div className="req-submit-state">
          {phase === 'posting' ? (
            <>
              <Loader2 size={32} className="req-spinner" />
              <div className="req-submit-title">
                {form.internalOnly ? 'Submitting internal posting…' : `Posting to ${form.boards.length} board${form.boards.length === 1 ? '' : 's'}…`}
              </div>
            </>
          ) : (
            <>
              <CheckCircle2 size={32} className="req-success-icon" />
              <div className="req-submit-title">
                {template.approvalChain.length > 0 ? 'Submitted for approval' : `Posted to ${form.boards.length} board${form.boards.length === 1 ? '' : 's'}`}
              </div>
              <div className="req-submit-sub">
                {template.approvalChain.length > 0
                  ? `Routing through ${template.approvalChain.map((r) => APPROVAL_ROLE_LABELS[r]).join(' → ')}`
                  : 'Knockout rules active · E-sig enabled on offer letter'}
              </div>
            </>
          )}
        </div>
      ) : (
        <form className="req-form" onSubmit={handleSubmit}>
          <fieldset className="req-fieldset" disabled={readOnly}>
          <div className="req-grid">
            <label className="req-field">
              <span>Job Title</span>
              <input required value={form.title} onChange={(e) => updateField('title', e.target.value)} placeholder="e.g. Sr. Payroll Analyst" />
            </label>
            {job && (
              <label className="req-field">
                <span>Status</span>
                <select value={form.status} onChange={(e) => updateField('status', e.target.value)}>
                  {FILTERS.filter((f) => f.key !== 'all' && !(job.status === 'pending_approval' && f.key === 'open')).map((f) => <option key={f.key} value={f.key}>{f.label}</option>)}
                </select>
              </label>
            )}
            <label className="req-field">
              <span>Department</span>
              <select value={form.department} onChange={(e) => updateField('department', e.target.value)}>
                {Object.keys(DEPT_ICONS).concat('Operations').map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </label>
            <label className="req-field">
              <span>Hiring Manager</span>
              <select value={form.hiringManagerId} onChange={(e) => updateField('hiringManagerId', e.target.value)}>
                <option value="">— Select —</option>
                {hiringManagers.map((hm) => <option key={hm.id} value={hm.id}>{hm.name}</option>)}
              </select>
            </label>
            <label className="req-field">
              <span>Comp Range</span>
              <input value={form.compRange} onChange={(e) => updateField('compRange', e.target.value)} placeholder="e.g. $85K–$105K" />
            </label>
            <label className="req-field">
              <span>Start Date</span>
              <input type="date" value={form.startDate} onChange={(e) => updateField('startDate', e.target.value)} />
            </label>
          </div>

          <div className="req-section">
            <div className="req-section-label">Locations</div>
            <div className="req-checkbox-row">
              {offices.map((o) => (
                <label className="req-checkbox" key={o.id}>
                  <input type="checkbox" checked={form.officeIds.includes(o.id)} onChange={() => toggleOffice(o.id)} />
                  {o.name} - {o.city}, {o.state}
                </label>
              ))}
            </div>
            {form.officeIds.length === 0 && <div className="req-hint">Select at least one location.</div>}
          </div>

          <label className="req-field">
            <span>Headcount Justification</span>
            <textarea rows={2} value={form.headcountJustification} onChange={(e) => updateField('headcountJustification', e.target.value)} placeholder="Why is this role needed?" />
          </label>

          <label className="req-field">
            <span>Job Description</span>
            <textarea rows={3} value={form.description} onChange={(e) => updateField('description', e.target.value)} placeholder="Role summary, responsibilities, requirements…" />
          </label>

          <div className="req-section">
            <div className="req-section-label">Role Template</div>
            <div className="req-role-grid">
              {Object.entries(roleWorkflows).map(([key, t]) => (
                <button
                  type="button"
                  key={key}
                  className={`req-role-btn${form.roleTemplate === key ? ' active' : ''}`}
                  onClick={() => handleRoleTemplateChange(key)}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <div className="req-role-preview">Interview stages: {template.stages.map((s) => s.name).join(' → ')}</div>
          </div>

          <div className="req-section req-boards">
            <div className="req-section-label">
              Distribute to Job Boards <span className="req-pill">One-click posting</span>
            </div>
            <label className="req-checkbox req-internal-toggle">
              <input type="checkbox" checked={form.internalOnly} onChange={(e) => updateField('internalOnly', e.target.checked)} />
              Internal Only (skip external job boards)
            </label>
            {!form.internalOnly && (
              <div className="req-checkbox-row">
                {ALL_BOARDS.map((board) => (
                  <label className="req-checkbox" key={board}>
                    <input type="checkbox" checked={form.boards.includes(board)} onChange={() => toggleBoard(board)} />
                    {board}
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="req-section req-knockout">
            <div className="req-knockout-hdr">
              <div>
                <div className="req-section-label">
                  Knockout Questions <span className="req-pill req-pill-navy">New in DM Hire</span>
                </div>
                <div className="req-hint">Unqualified applicants are auto-declined after a 24-hour delay, so there are no abrupt rejections.</div>
              </div>
              <Button type="button" size="sm" onClick={addKnockoutRule}><Plus size={13} /> Add</Button>
            </div>
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
          </div>

          <div className="req-section req-approval-preview">
            <div className="req-section-label">Approval Workflow Preview</div>
            <div className="req-approval-chain">
              {template.approvalChain.map((role, i) => (
                <span key={role} className="req-approval-step">
                  {i > 0 && <span className="req-approval-arrow">→</span>}
                  {APPROVAL_ROLE_LABELS[role]}
                </span>
              ))}
            </div>
          </div>
          </fieldset>

          <div className="req-actions">
            {readOnly ? (
              <Button type="button" variant="ghost" onClick={handleClose}>Close</Button>
            ) : job ? (
              <Button type="button" variant="ghost" onClick={handleClose}>Cancel</Button>
            ) : (
              <Button type="button" variant="ghost" onClick={handleSaveDraft}>Save Draft</Button>
            )}
            {!readOnly && (
              <Button type="submit" variant="primary" disabled={form.officeIds.length === 0}>{job ? 'Save Changes' : 'Submit for Approval →'}</Button>
            )}
          </div>

          {job && !readOnly && (
            <div className="req-danger-zone">
              <Button type="button" variant="danger" onClick={handleDelete}>
                <Trash2 size={13} /> Delete Requisition
              </Button>
            </div>
          )}
        </form>
      )}
    </Modal>
  )
}

export default function JobRequisitions() {
  const navigate = useNavigate()
  const { persona } = usePersona()
  const isRecruiter = persona === 'recruiter'
  const { jobs: jobsList, loading: jobsLoading, createJob, updateJob, deleteJob } = useJobs()
  const { offices, loading: officesLoading } = useOffices()
  const { users, loading: usersLoading } = useUsers()
  const { candidates, loading: candidatesLoading } = useCandidates()
  const { roleWorkflows, loading: workflowsLoading } = useRoleWorkflowTemplates()
  const [filter, setFilter] = useState('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [sharedId, setSharedId] = useState(null)
  const [view, setView] = useState('grid')

  if (jobsLoading || officesLoading || candidatesLoading || workflowsLoading || usersLoading) return <Loading />

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

  function handleSave(jobId, updates) {
    updateJob(jobId, updates)
  }

  function handleDelete(jobId) {
    return deleteJob(jobId)
  }

  function closeModal() {
    setModalOpen(false)
  }

  return (
    <div className="job-requisitions">
      <div className="page-header">
        <div>
          <h1 className="page-title">Job Requisitions</h1>
          <div className="page-subtitle">{counts.open} open position{counts.open === 1 ? '' : 's'} across {new Set(jobsList.map((j) => j.department)).size} departments</div>
        </div>
        <Button variant="primary" size="lg" onClick={() => setModalOpen(true)} data-tour="tour-new-req-btn">
          <Plus size={16} /> New Requisition
        </Button>
      </div>

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
    </div>
  )
}
