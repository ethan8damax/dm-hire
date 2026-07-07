import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { CheckCircle2, Wallet } from 'lucide-react'
import KanbanCard from '../components/ui/KanbanCard'
import FilterChip from '../components/ui/FilterChip'
import EmptyState from '../components/ui/EmptyState'
import { jobs } from '../data/jobs'
import { candidates } from '../data/candidates'
import { offers } from '../data/offers'
import './Pipeline.css'

const CURRENT_RECRUITER = 'T. Smith'

const COLUMNS = [
  { key: 'new', label: 'New Applicants', dot: '#3B82F6' },
  { key: 'screening', label: 'Phone Screen', dot: 'var(--color-dm-orange)' },
  { key: 'interviewing', label: 'Interviewing', dot: '#7C3AED' },
  { key: 'offer', label: 'Offer Stage', dot: 'var(--color-green)' },
  { key: 'hired', label: 'Hired → Payroll', dot: 'var(--color-success)' },
  { key: 'rejected', label: 'Not Selected', dot: 'var(--color-gray-400)' },
]

const FILTERS = [
  { key: 'all', label: 'All Candidates' },
  { key: 'mine', label: 'My Candidates' },
  { key: 'needs_action', label: 'Needs Action' },
  { key: 'stale', label: 'Stale (>7 days)' },
]

const SORTS = [
  { key: 'score', label: 'Score' },
  { key: 'days', label: 'Days' },
  { key: 'source', label: 'Source' },
]

function isExpiringOffer(candidate) {
  const offer = offers.find((o) => o.candidateId === candidate.id)
  return offer?.status === 'awaiting'
}

function matchesFilter(candidate, filterKey) {
  switch (filterKey) {
    case 'mine':
      return candidate.notes.some((n) => n.author === CURRENT_RECRUITER)
    case 'needs_action':
      return candidate.isStale || candidate.isDuplicate || isExpiringOffer(candidate)
    case 'stale':
      return candidate.isStale
    default:
      return true
  }
}

function sortCandidates(list, sortKey) {
  const sorted = [...list]
  if (sortKey === 'score') sorted.sort((a, b) => b.aiScore - a.aiScore)
  if (sortKey === 'days') sorted.sort((a, b) => b.daysInStage - a.daysInStage)
  if (sortKey === 'source') sorted.sort((a, b) => a.source.localeCompare(b.source))
  return sorted
}

const DECLINE_ACTION = { label: 'Decline', tone: 'danger' }

function cardPropsForColumn(columnKey, candidate) {
  if (columnKey === 'new') {
    return {
      note: `Applied ${candidate.daysInStage}d ago`,
      actions: [{ label: 'Phone Screen' }, DECLINE_ACTION],
    }
  }
  if (columnKey === 'screening') {
    if (candidate.isStale) {
      return { actions: [{ label: 'Contact' }, DECLINE_ACTION] }
    }
    return {
      note: `${candidate.daysInStage}d in stage`,
      actions: [{ label: '📝 Scorecard' }, { label: 'Advance →', tone: 'accent' }],
    }
  }
  if (columnKey === 'interviewing') {
    return {
      ...(candidate.isStale ? {} : { note: `${candidate.daysInStage}d in stage` }),
      actions: [{ label: '📝 Feedback' }, { label: 'Move to Offer', tone: 'accent' }],
    }
  }
  if (columnKey === 'offer') {
    const offer = offers.find((o) => o.candidateId === candidate.id)
    const actions = [{ label: 'Send Reminder', tone: 'warn' }, { label: 'Extend', tone: 'accent' }]
    if (offer?.status === 'awaiting') {
      return { note: `⚠ Offer expires ${offer.expiryDate}`, noteVariant: 'warn', actions }
    }
    return { note: `${candidate.daysInStage}d in stage`, actions }
  }
  if (columnKey === 'hired') {
    const offer = offers.find((o) => o.candidateId === candidate.id)
    const note = (
      <div className="kc-payroll-block">
        {offer?.payrollSynced ? (
          <span className="kc-payroll-note"><CheckCircle2 size={11} /> Synced to DM Payroll</span>
        ) : (
          <span className="kc-payroll-note kc-payroll-note-pending"><Wallet size={11} /> Queued for DM Payroll sync</span>
        )}
        <span className="kc-notif-log">IT notified ✓ · Facilities notified ✓</span>
      </div>
    )
    return { note }
  }
  if (columnKey === 'rejected') {
    return { showScore: false, dimmed: true }
  }
  return {}
}

export default function Pipeline() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [filter, setFilter] = useState('all')
  const [sort, setSort] = useState('score')

  const selectableJobs = jobs.filter((j) => j.status !== 'draft')
  const queryJobId = searchParams.get('job')
  const selectedJobId = selectableJobs.some((j) => j.id === queryJobId) ? queryJobId : selectableJobs[0]?.id
  const selectedJob = jobs.find((j) => j.id === selectedJobId)

  function handleJobChange(jobId) {
    setSearchParams({ job: jobId })
  }

  const jobCandidates = useMemo(
    () => candidates.filter((c) => c.jobId === selectedJobId && matchesFilter(c, filter)),
    [selectedJobId, filter],
  )

  const flatCandidateIds = COLUMNS.flatMap((c) => sortCandidates(jobCandidates.filter((jc) => jc.stage === c.key), sort).map((jc) => jc.id))

  if (!selectedJob) {
    return <EmptyState title="No requisitions yet" subtitle="Create a job requisition to start a pipeline." />
  }

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
          <div className="page-subtitle">{selectedJob.applicantCount} candidates · {selectedJob.daysOpen} days open</div>
        </div>
      </div>

      <div className="filter-strip">
        {FILTERS.map((f) => (
          <FilterChip key={f.key} active={filter === f.key} onClick={() => setFilter(f.key)}>
            {f.label}
          </FilterChip>
        ))}
        <div className="pipeline-sort">
          <span>Sort by</span>
          <select value={sort} onChange={(e) => setSort(e.target.value)}>
            {SORTS.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
          </select>
        </div>
      </div>

      <div className="kanban-board">
        {COLUMNS.map((col) => {
          const columnCandidates = sortCandidates(jobCandidates.filter((c) => c.stage === col.key), sort)
          return (
            <div className="kanban-col" key={col.key}>
              <div className="kanban-col-hdr">
                <div className="col-dot" style={{ background: col.dot }} />
                <span className="col-name">{col.label}</span>
                <span className="col-count">{selectedJob.stageCounts[col.key]}</span>
              </div>
              <div className="kanban-cards">
                {columnCandidates.map((candidate) => (
                  <KanbanCard
                    key={candidate.id}
                    candidate={candidate}
                    onClick={() => navigate(`/candidates/${candidate.id}`, { state: { candidateIds: flatCandidateIds } })}
                    {...cardPropsForColumn(col.key, candidate)}
                  />
                ))}
                {columnCandidates.length === 0 && <div className="kanban-col-empty">No candidates</div>}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
