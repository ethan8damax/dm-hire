import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ChevronLeft, Loader2, CheckCircle2, Upload } from 'lucide-react'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Timeline from '../components/ui/Timeline'
import EmptyState from '../components/ui/EmptyState'
import { useCandidateSession } from '../context/CandidateSessionContext'
import { jobs, recordNewApplicant } from '../data/jobs'
import { addCandidateApplication } from '../data/candidates'
import './ApplyPage.css'

const EMPTY_FORM = {
  name: '', email: '', phone: '', location: '', currentRole: '',
  expectedSalary: '', availability: '', linkedin: '', skills: '',
}

export default function ApplyPage() {
  const { jobId } = useParams()
  const navigate = useNavigate()
  const { session, login } = useCandidateSession()
  const job = jobs.find((j) => j.id === jobId && j.status === 'open' && !j.isInternal)

  const [form, setForm] = useState({ ...EMPTY_FORM, ...session })
  const [resumeFileName, setResumeFileName] = useState('')
  const [phase, setPhase] = useState('form') // form | submitting | done
  const [newCandidateId, setNewCandidateId] = useState(null)

  if (!job) {
    return (
      <EmptyState
        title="This role is no longer available"
        subtitle="It may have been filled or taken down."
        ctaLabel="Back to Find Jobs"
        onCta={() => navigate('/careers')}
      />
    )
  }

  function updateField(key, value) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  function handleFileChange(e) {
    setResumeFileName(e.target.files?.[0]?.name ?? '')
  }

  const canSubmit = form.name.trim() && form.email.trim()

  function handleSubmit(e) {
    e.preventDefault()
    if (!canSubmit) return
    setPhase('submitting')
    setTimeout(() => {
      const candidate = addCandidateApplication({ jobId: job.id, resumeFileName, ...form })
      recordNewApplicant(job.id)
      login({
        name: form.name, email: form.email, phone: form.phone, location: form.location,
        currentRole: form.currentRole, linkedin: form.linkedin,
      })
      setNewCandidateId(candidate.id)
      setPhase('done')
    }, 900)
  }

  if (phase === 'done') {
    return (
      <div className="apply-page">
        <Card>
          <Card.Body className="apply-done">
            <CheckCircle2 size={32} className="apply-done-icon" />
            <div className="apply-done-title">Application received!</div>
            <div className="apply-done-sub">Thanks, {form.name.split(' ')[0]}. We'll be in touch about the {job.title} role.</div>
            <Timeline steps={[
              { status: 'complete', label: 'Application Received', date: 'Today' },
              { status: 'active', label: 'Recruiter Review', note: 'A recruiter is reviewing your application' },
              { status: 'pending', label: 'Interview' },
              { status: 'pending', label: 'Offer' },
            ]} />
            <div className="apply-done-actions">
              <Button variant="primary" onClick={() => navigate(`/careers/applications/${newCandidateId}`)}>
                View Application Status
              </Button>
              <Button variant="ghost" onClick={() => navigate('/careers')}>Browse More Jobs</Button>
            </div>
          </Card.Body>
        </Card>
      </div>
    )
  }

  return (
    <div className="apply-page">
      <Button variant="ghost" size="sm" onClick={() => navigate(`/careers/jobs/${job.id}`)}>
        <ChevronLeft size={16} /> Back to job details
      </Button>

      <div className="page-header">
        <div>
          <h1 className="page-title">Apply: {job.title}</h1>
          <div className="page-subtitle">{job.department} · {job.location}</div>
        </div>
      </div>

      <Card>
        <Card.Body>
          <form className="apply-form" onSubmit={handleSubmit}>
            <div className="apply-grid">
              <label className="apply-field">
                <span>Full Name *</span>
                <input required value={form.name} onChange={(e) => updateField('name', e.target.value)} />
              </label>
              <label className="apply-field">
                <span>Email *</span>
                <input required type="email" value={form.email} onChange={(e) => updateField('email', e.target.value)} />
              </label>
              <label className="apply-field">
                <span>Phone</span>
                <input type="tel" value={form.phone} onChange={(e) => updateField('phone', e.target.value)} />
              </label>
              <label className="apply-field">
                <span>Location</span>
                <input value={form.location} onChange={(e) => updateField('location', e.target.value)} placeholder="City, State" />
              </label>
              <label className="apply-field">
                <span>Current Role</span>
                <input value={form.currentRole} onChange={(e) => updateField('currentRole', e.target.value)} placeholder="e.g. Payroll Analyst · ADP" />
              </label>
              <label className="apply-field">
                <span>Expected Salary</span>
                <input value={form.expectedSalary} onChange={(e) => updateField('expectedSalary', e.target.value)} placeholder="e.g. $80K–$90K" />
              </label>
              <label className="apply-field">
                <span>Availability</span>
                <input value={form.availability} onChange={(e) => updateField('availability', e.target.value)} placeholder="e.g. 2 weeks notice" />
              </label>
              <label className="apply-field">
                <span>LinkedIn (optional)</span>
                <input value={form.linkedin} onChange={(e) => updateField('linkedin', e.target.value)} placeholder="linkedin.com/in/…" />
              </label>
            </div>

            <label className="apply-field">
              <span>Top Skills (comma-separated)</span>
              <input value={form.skills} onChange={(e) => updateField('skills', e.target.value)} placeholder="e.g. ADP Workforce Now, CPP Certified" />
            </label>

            <label className="apply-field">
              <span>Resume</span>
              <label className="apply-upload">
                <Upload size={14} />
                {resumeFileName || 'Choose a file to upload'}
                <input type="file" className="apply-upload-input" onChange={handleFileChange} accept=".pdf,.doc,.docx" />
              </label>
            </label>

            <Button variant="primary" size="lg" type="submit" disabled={!canSubmit || phase === 'submitting'} className="apply-submit">
              {phase === 'submitting' && <Loader2 size={14} className="apply-spin" />}
              {phase === 'submitting' ? 'Submitting…' : 'Submit Application'}
            </Button>
          </form>
        </Card.Body>
      </Card>
    </div>
  )
}
