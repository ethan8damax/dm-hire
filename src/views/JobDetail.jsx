import { useNavigate, useParams } from 'react-router-dom'
import { ChevronLeft, MapPin, DollarSign, CalendarDays, Briefcase } from 'lucide-react'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import EmptyState from '../components/ui/EmptyState'
import { jobs } from '../data/jobs'
import './JobDetail.css'

export default function JobDetail() {
  const { jobId } = useParams()
  const navigate = useNavigate()
  const job = jobs.find((j) => j.id === jobId && j.status === 'open' && !j.isInternal)

  if (!job) {
    return (
      <EmptyState
        icon={Briefcase}
        title="This role is no longer available"
        subtitle="It may have been filled or taken down."
        ctaLabel="Back to Find Jobs"
        onCta={() => navigate('/careers')}
      />
    )
  }

  return (
    <div className="job-detail">
      <Button variant="ghost" size="sm" onClick={() => navigate('/careers')}>
        <ChevronLeft size={16} /> Back to Find Jobs
      </Button>

      <div className="job-detail-header">
        <h1 className="page-title">{job.title}</h1>
        <div className="job-detail-dept">{job.department}</div>
        <div className="job-detail-meta-row">
          <span className="career-job-meta"><MapPin size={14} /> {job.location}</span>
          <span className="career-job-meta"><DollarSign size={14} /> {job.compRange}</span>
          <span className="career-job-meta"><CalendarDays size={14} /> Posted {job.postedDate}</span>
        </div>
      </div>

      <Card>
        <Card.Body>
          <div className="job-detail-section">
            <div className="job-detail-section-label">About the Role</div>
            <p>{job.description}</p>
          </div>

          {job.responsibilities?.length > 0 && (
            <div className="job-detail-section">
              <div className="job-detail-section-label">Responsibilities</div>
              <ul className="job-detail-list">
                {job.responsibilities.map((r) => <li key={r}>{r}</li>)}
              </ul>
            </div>
          )}

          {job.requirements?.length > 0 && (
            <div className="job-detail-section">
              <div className="job-detail-section-label">Requirements</div>
              <ul className="job-detail-list">
                {job.requirements.map((r) => <li key={r}>{r}</li>)}
              </ul>
            </div>
          )}
        </Card.Body>
        <Card.Footer>
          <Button variant="primary" size="lg" onClick={() => navigate(`/careers/jobs/${job.id}/apply`)}>
            Apply Now
          </Button>
        </Card.Footer>
      </Card>
    </div>
  )
}
