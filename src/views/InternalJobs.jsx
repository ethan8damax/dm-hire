import { useState } from 'react'
import { MapPin, DollarSign, CheckCircle2, Loader2 } from 'lucide-react'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import EmptyState from '../components/ui/EmptyState'
import { jobs } from '../data/jobs'
import './InternalJobs.css'

export default function InternalJobs() {
  const [appliedIds, setAppliedIds] = useState([])
  const [applyingId, setApplyingId] = useState(null)

  const internalJobs = jobs.filter((j) => j.isInternal && j.status === 'open')

  function apply(jobId) {
    setApplyingId(jobId)
    setTimeout(() => {
      setAppliedIds((ids) => [...ids, jobId])
      setApplyingId(null)
    }, 900)
  }

  return (
    <div className="internal-jobs-view">
      <div className="page-header">
        <div>
          <h1 className="page-title">Internal Job Board</h1>
          <div className="page-subtitle">Open opportunities exclusively for current Doeren Mayhew employees</div>
        </div>
      </div>

      {internalJobs.length === 0 ? (
        <EmptyState title="No internal postings right now" subtitle="Check back soon — new internal opportunities will appear here." />
      ) : (
        <div className="internal-jobs-grid" data-tour="tour-internal-jobs">
          {internalJobs.map((job) => {
            const applying = applyingId === job.id
            const applied = appliedIds.includes(job.id)
            return (
              <Card key={job.id} className="internal-job-card">
                <Card.Body>
                  <span className="internal-job-tag">Internal Only</span>
                  <div className="internal-job-title">{job.title}</div>
                  <div className="internal-job-dept">{job.department}</div>
                  <div className="internal-job-meta"><MapPin size={13} /> {job.location}</div>
                  <div className="internal-job-meta"><DollarSign size={13} /> {job.compRange}</div>

                  {applied ? (
                    <div className="internal-job-applied">
                      <CheckCircle2 size={14} /> Applied — your HRIS profile auto-populated the application
                    </div>
                  ) : (
                    <Button variant="primary" disabled={applying} onClick={() => apply(job.id)} className="internal-job-apply">
                      {applying && <Loader2 size={14} className="internal-job-spin" />}
                      {applying ? 'Submitting…' : 'Apply'}
                    </Button>
                  )}
                </Card.Body>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
