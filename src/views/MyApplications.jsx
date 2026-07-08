import { useNavigate } from 'react-router-dom'
import { Briefcase, MapPin } from 'lucide-react'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import EmptyState from '../components/ui/EmptyState'
import { useCandidateSession } from '../context/CandidateSessionContext'
import { candidates } from '../data/candidates'
import { jobs } from '../data/jobs'
import './MyApplications.css'

export default function MyApplications() {
  const navigate = useNavigate()
  const { session } = useCandidateSession()

  if (!session?.email) {
    return (
      <EmptyState
        icon={Briefcase}
        title="No applications yet"
        subtitle="Once you apply to a role, you'll be able to track its status here."
        ctaLabel="Find Jobs"
        onCta={() => navigate('/careers')}
      />
    )
  }

  const myApplications = candidates
    .filter((c) => c.email.toLowerCase() === session.email.toLowerCase())
    .map((c) => ({ candidate: c, job: jobs.find((j) => j.id === c.jobId) }))
    .sort((a, b) => (b.candidate.timeline[0]?.date ?? '').localeCompare(a.candidate.timeline[0]?.date ?? ''))

  return (
    <div className="my-applications">
      <div className="page-header">
        <div>
          <h1 className="page-title">My Applications</h1>
          <div className="page-subtitle">{myApplications.length} application{myApplications.length === 1 ? '' : 's'}</div>
        </div>
        <Button variant="primary" onClick={() => navigate('/careers')}>Find More Jobs</Button>
      </div>

      {myApplications.length === 0 ? (
        <Card>
          <EmptyState
            icon={Briefcase}
            title="No applications yet"
            subtitle="Once you apply to a role, you'll be able to track its status here."
            ctaLabel="Find Jobs"
            onCta={() => navigate('/careers')}
          />
        </Card>
      ) : (
        <div className="my-app-list">
          {myApplications.map(({ candidate, job }) => (
            <Card key={candidate.id} className="my-app-card" onClick={() => navigate(`/careers/applications/${candidate.id}`)}>
              <Card.Body className="my-app-body">
                <div className="my-app-info">
                  <div className="my-app-title">{job?.title ?? 'Role no longer listed'}</div>
                  {job && (
                    <div className="my-app-meta"><MapPin size={12} /> {job.location}</div>
                  )}
                  <div className="my-app-applied">Applied {candidate.timeline[0]?.date}</div>
                </div>
                <Badge variant={candidate.stage} />
              </Card.Body>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
