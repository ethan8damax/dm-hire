import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { CheckCircle2, Wallet, AlertTriangle } from 'lucide-react'
import KanbanCard from '../components/ui/KanbanCard'
import FilterChip from '../components/ui/FilterChip'
import EmptyState from '../components/ui/EmptyState'
import { usePersona } from '../context/PersonaContext'
import { useJobs } from '../hooks/useJobs'
import { useCandidates } from '../hooks/useCandidates'
import { useOffers } from '../hooks/useOffers'
import { useUsers } from '../hooks/useUsers'
import { useReminders } from '../hooks/useReminders'
import Loading from '../components/ui/Loading'
import './Pipeline.css'

const CURRENT_RECRUITER = 'T. Smith'
const CURRENT_HM_ID = 'user-002' // R. Patel — the assumed logged-in Hiring Manager
const HM_RESTRICTED_COLUMNS = ['new', 'offer'] // no unscreened applicants, no offer management
const TODAY = '2026-07-07'

function daysUntil(dateStr) {
  return Math.ceil((new Date(dateStr) - new Date(TODAY)) / (1000 * 60 * 60 * 24))
}

function addDays(dateStr, days) {
  const d = new Date(dateStr)
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

const COLUMNS = [
  { key: 'new', label: 'New Applicants', dot: '#3B82F6' },
  { key: 'screening', label: 'Phone Screen', dot: 'var(--color-dm-orange)' },
  { key: 'interviewing', label: 'Interviewing', dot: '#7C3AED' },
  { key: 'offer', label: 'Offer Stage', dot: 'var(--color-cyan)' },
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

function isExpiringOffer(candidate, offers) {
  const offer = offers.find((o) => o.candidateId === candidate.id)
  return offer?.status === 'awaiting'
}

function matchesFilter(candidate, filterKey, offers) {
  switch (filterKey) {
    case 'mine':
      return candidate.notes.some((n) => n.author === CURRENT_RECRUITER)
    case 'needs_action':
      return candidate.isStale || candidate.isDuplicate || isExpiringOffer(candidate, offers)
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

const SCORECARD_ONLY_ACTION = [{ label: 'Scorecard' }]

function cardPropsForColumn(columnKey, candidate, isHiringManager, offers, onSendReminder, onExtend) {
  if (isHiringManager) {
    const base = cardPropsForColumn(columnKey, candidate, false, offers, onSendReminder, onExtend)
    const canScore = columnKey === 'screening' || columnKey === 'interviewing'
    return { ...base, actions: canScore ? SCORECARD_ONLY_ACTION : [] }
  }
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
      actions: [{ label: 'Scorecard' }, { label: 'Advance →', tone: 'accent' }],
    }
  }
  if (columnKey === 'interviewing') {
    return {
      ...(candidate.isStale ? {} : { note: `${candidate.daysInStage}d in stage` }),
      actions: [{ label: 'Feedback' }, { label: 'Move to Offer', tone: 'accent' }],
    }
  }
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
  if (columnKey === 'hired') {
    const offer = offers.find((o) => o.candidateId === candidate.id)
    const note = (
      <div className="kc-payroll-block">
        {offer?.payrollSynced ? (
          <span className="kc-payroll-note"><CheckCircle2 size={11} /> Synced to DM Payroll</span>
        ) : (
          <span className="kc-payroll-note kc-payroll-note-pending"><Wallet size={11} /> Queued for DM Payroll sync</span>
        )}
        <span className="kc-notif-log">IT and Facilities notified</span>
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
  const { persona } = usePersona()
  const { jobs, loading: jobsLoading } = useJobs()
  const { candidates, loading: candidatesLoading } = useCandidates()
  const { offers, loading: offersLoading, updateOffer } = useOffers()
  const { users, loading: usersLoading } = useUsers()
  const { sendReminder } = useReminders()
  const isHiringManager = persona === 'hiring_manager'

  const hmAssignedJobIds = users.find((u) => u.id === CURRENT_HM_ID)?.assignedJobIds ?? []
  const selectableJobs = isHiringManager
    ? jobs.filter((j) => hmAssignedJobIds.includes(j.id))
    : jobs.filter((j) => j.status !== 'draft')
  const visibleColumns = isHiringManager ? COLUMNS.filter((c) => !HM_RESTRICTED_COLUMNS.includes(c.key)) : COLUMNS
  const queryJobId = searchParams.get('job')
  const selectedJobId = selectableJobs.some((j) => j.id === queryJobId) ? queryJobId : selectableJobs[0]?.id
  const selectedJob = jobs.find((j) => j.id === selectedJobId)

  function handleJobChange(jobId) {
    setSearchParams({ job: jobId })
  }

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

  const jobCandidates = useMemo(
    () => candidates.filter((c) => c.jobId === selectedJobId && matchesFilter(c, filter, offers)),
    [selectedJobId, filter, candidates, offers],
  )

  const flatCandidateIds = visibleColumns.flatMap((c) => sortCandidates(jobCandidates.filter((jc) => jc.stage === c.key), sort).map((jc) => jc.id))

  if (jobsLoading || candidatesLoading || offersLoading || usersLoading) return <Loading />
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
          <div className="page-subtitle">
            {selectedJob.applicantCount} candidates · {selectedJob.daysOpen} days open
            {isHiringManager && ' · Hiring Manager view: screened candidates only, no offer management'}
          </div>
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

      <div className="kanban-board" data-tour="tour-pipeline-board">
        {visibleColumns.map((col) => {
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
                    {...cardPropsForColumn(col.key, candidate, isHiringManager, offers, handleSendReminder, handleExtend)}
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
