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
import { useNotifications } from '../hooks/useNotifications'
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

const CURRENT_HM_ID = 'user-002' // R. Patel — the assumed logged-in Hiring Manager, matching Pipeline.jsx

export default function RequisitionDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { persona } = usePersona()
  const isRecruiter = persona === 'recruiter'
  const { addNotification } = useNotifications()
  const isHiringManager = persona === 'hiring_manager'
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
  const isMyApproval = isHiringManager && job.hiringManagerId === CURRENT_HM_ID && job.status === 'pending_approval'

  async function handleDelete(jobId) {
    const ok = await deleteJob(jobId)
    if (ok) navigate('/jobs')
    return ok
  }

  function handleApprove() {
    updateJob(job.id, { status: 'open' })
  }

  function handleReject() {
    const reason = window.prompt('Reason for rejecting (optional):')
    updateJob(job.id, { status: 'draft' })
    if (reason) addNotification('Requisition rejected', `"${job.title}" was rejected: ${reason}`)
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
