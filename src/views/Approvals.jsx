import { useNavigate } from 'react-router-dom'
import { CalendarClock, CheckCircle2 } from 'lucide-react'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import EmptyState from '../components/ui/EmptyState'
import Loading from '../components/ui/Loading'
import { useJobs } from '../hooks/useJobs'
import { useNotifications } from '../hooks/useNotifications'
import { usePersona } from '../context/PersonaContext'

function ApprovalRow({ job, onOpenDetail, onApprove, onReject }) {
  return (
    <div className="job-row" onClick={() => onOpenDetail(job)}>
      <div className="job-info">
        <div className="job-title">{job.title}</div>
        <div className="job-meta">
          {job.department} · {job.location} · {job.compRange || 'Comp TBD'}
        </div>
        <div className="job-badges">
          <Badge variant={job.status} />
          <span className="job-tag"><CalendarClock size={11} /> {job.daysOpen} day{job.daysOpen === 1 ? '' : 's'} waiting</span>
        </div>
      </div>
      <div className="rd-approval-buttons" onClick={(e) => e.stopPropagation()}>
        <Button variant="danger" size="sm" onClick={() => onReject(job)}>Reject</Button>
        <Button variant="primary" size="sm" onClick={() => onApprove(job)}>Approve</Button>
      </div>
    </div>
  )
}

export default function Approvals() {
  const navigate = useNavigate()
  const { currentHmId } = usePersona()
  const { jobs, loading, updateJob } = useJobs()
  const { addNotification } = useNotifications()

  if (loading) return <Loading />

  const pendingJobs = jobs.filter((j) => !j.archived && j.status === 'pending_approval' && j.hiringManagerId === currentHmId)

  function handleApprove(job) {
    updateJob(job.id, { status: 'open' })
    addNotification('Requisition approved', `"${job.title}" was approved and is now open.`)
  }

  function handleReject(job) {
    const reason = window.prompt('Reason for rejecting (optional):')
    updateJob(job.id, { status: 'draft' })
    addNotification('Requisition rejected', `"${job.title}" was rejected${reason ? `: ${reason}` : '.'}`)
  }

  return (
    <div className="job-requisitions">
      <div className="page-header">
        <div>
          <h1 className="page-title">Approvals</h1>
          <div className="page-subtitle">{pendingJobs.length} requisition{pendingJobs.length === 1 ? '' : 's'} waiting on your approval</div>
        </div>
      </div>

      {pendingJobs.length === 0 ? (
        <Card><EmptyState icon={CheckCircle2} title="Nothing to approve" subtitle="New requisitions submitted by recruiters will show up here." /></Card>
      ) : (
        <div className="jobs-grouped-list">
          {pendingJobs.map((job) => (
            <ApprovalRow
              key={job.id}
              job={job}
              onOpenDetail={(j) => navigate(`/jobs/${j.id}`)}
              onApprove={handleApprove}
              onReject={handleReject}
            />
          ))}
        </div>
      )}
    </div>
  )
}
