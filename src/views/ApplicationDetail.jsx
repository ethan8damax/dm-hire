import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ChevronLeft, MapPin, DollarSign, FileSignature, Loader2, CheckCircle2 } from 'lucide-react'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Timeline from '../components/ui/Timeline'
import EmptyState from '../components/ui/EmptyState'
import { useCandidateSession } from '../context/CandidateSessionContext'
import { candidates, withdrawCandidateApplication } from '../data/candidates'
import { jobs } from '../data/jobs'
import { offers, addOrUpdateOffer } from '../data/offers'
import './ApplicationDetail.css'

const FORWARD_STAGES = [
  { key: 'screening', label: 'Phone Screen' },
  { key: 'interviewing', label: 'Interview' },
  { key: 'offer', label: 'Offer' },
  { key: 'hired', label: 'Hired' },
]

function today() {
  return new Date().toISOString().slice(0, 10)
}

// Candidate-safe timeline — never surfaces internal recruiter notes or scorecards.
function buildCandidateTimeline(candidate) {
  const applied = candidate.timeline.find((t) => t.stage === 'Application')
  const steps = [{ status: 'complete', label: 'Application Received', date: applied?.date }]

  if (candidate.stage === 'withdrawn') {
    steps.push({ status: 'complete', label: 'Withdrawn', date: candidate.timeline.at(-1)?.date, note: 'You withdrew this application.' })
    return steps
  }
  if (candidate.stage === 'rejected') {
    steps.push({ status: 'complete', label: 'Not Selected', note: 'Thank you for your interest — we\'ve decided to move forward with other candidates.' })
    return steps
  }

  const stageIdx = FORWARD_STAGES.findIndex((s) => s.key === candidate.stage)
  FORWARD_STAGES.forEach((s, i) => {
    const status = stageIdx === -1 ? 'pending' : i < stageIdx ? 'complete' : i === stageIdx ? 'active' : 'pending'
    steps.push({ status, label: s.label })
  })
  return steps
}

export default function ApplicationDetail() {
  const { candidateId } = useParams()
  const navigate = useNavigate()
  const { session } = useCandidateSession()
  const [, setTick] = useState(0)
  const [esigPhase, setEsigPhase] = useState('idle') // idle | signing
  const [agreed, setAgreed] = useState(false)

  const candidate = candidates.find((c) => c.id === candidateId)
  const job = jobs.find((j) => j.id === candidate?.jobId)
  const offer = offers.find((o) => o.candidateId === candidateId)

  if (!candidate) {
    return (
      <EmptyState
        title="Application not found"
        subtitle="This application may have been removed."
        ctaLabel="Back to My Applications"
        onCta={() => navigate('/careers/applications')}
      />
    )
  }

  if (session?.email && candidate.email.toLowerCase() !== session.email.toLowerCase()) {
    return (
      <EmptyState
        title="You don't have access to this application"
        subtitle="This application belongs to a different candidate account."
        ctaLabel="Back to My Applications"
        onCta={() => navigate('/careers/applications')}
      />
    )
  }

  function refresh() {
    setTick((t) => t + 1)
  }

  function handleWithdraw() {
    if (!window.confirm('Withdraw this application? This can\'t be undone.')) return
    withdrawCandidateApplication(candidate.id)
    refresh()
  }

  function handleAcceptOffer() {
    setEsigPhase('signing')
    setTimeout(() => {
      addOrUpdateOffer({ ...offer, status: 'accepted', esigViewedDate: offer.esigViewedDate ?? today(), esigSignedDate: today() })
      setEsigPhase('idle')
      refresh()
    }, 900)
  }

  function handleDeclineOffer() {
    if (!window.confirm('Decline this offer? This can\'t be undone.')) return
    addOrUpdateOffer({ ...offer, status: 'declined' })
    refresh()
  }

  const canWithdraw = !['hired', 'rejected', 'withdrawn'].includes(candidate.stage)
  const showOffer = offer && offer.status !== 'draft'

  return (
    <div className="application-detail">
      <Button variant="ghost" size="sm" onClick={() => navigate('/careers/applications')}>
        <ChevronLeft size={16} /> Back to My Applications
      </Button>

      <div className="page-header">
        <div>
          <h1 className="page-title">{job?.title ?? 'Role no longer listed'}</h1>
          <div className="page-subtitle">
            {job ? `${job.department} · ${job.location}` : 'This posting has since been removed'}
          </div>
        </div>
        <Badge variant={candidate.stage} />
      </div>

      <Card>
        <Card.Header><Card.Title>Application Status</Card.Title></Card.Header>
        <Card.Body>
          <Timeline steps={buildCandidateTimeline(candidate)} />
        </Card.Body>
      </Card>

      {showOffer && (
        <Card className="application-offer-card">
          <Card.Header><Card.Title><FileSignature size={15} /> Your Offer</Card.Title></Card.Header>
          <Card.Body>
            <div className="app-offer-row"><span>Role</span><span>{job?.title}</span></div>
            <div className="app-offer-row"><span><DollarSign size={13} /> Compensation</span><span>${offer.salary.toLocaleString()} / year</span></div>
            <div className="app-offer-row"><span>Bonus</span><span>{offer.bonus}</span></div>
            <div className="app-offer-row"><span>PTO</span><span>{offer.pto}</span></div>
            <div className="app-offer-row"><span>Start Date</span><span>{offer.startDate || 'TBD'}</span></div>
            <div className="app-offer-row"><span>Status</span><span className={`app-offer-status app-offer-status-${offer.status}`}>{offer.status.replace('_', ' ')}</span></div>

            {offer.status === 'awaiting' && (
              <>
                <label className="app-offer-agree">
                  <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
                  <span>I have reviewed and agree to the terms of this offer.</span>
                </label>
                <div className="app-offer-actions">
                  <Button variant="primary" disabled={!agreed || esigPhase === 'signing'} onClick={handleAcceptOffer}>
                    {esigPhase === 'signing' && <Loader2 size={14} className="app-offer-spin" />}
                    {esigPhase === 'signing' ? 'Signing…' : 'Accept & Sign Offer'}
                  </Button>
                  <Button variant="danger" onClick={handleDeclineOffer}>Decline Offer</Button>
                </div>
              </>
            )}
            {offer.status === 'accepted' && (
              <div className="app-offer-signed"><CheckCircle2 size={14} /> Signed {offer.esigSignedDate}. Welcome to the team!</div>
            )}
          </Card.Body>
        </Card>
      )}

      <Card>
        <Card.Body className="app-info-body">
          <div className="app-info-row"><MapPin size={14} /><span>{candidate.location || 'No location on file'}</span></div>
          <div className="app-info-row"><span className="app-info-label">Applied via</span><span>{candidate.source}</span></div>
        </Card.Body>
      </Card>

      {canWithdraw && (
        <Button variant="danger" className="app-withdraw-btn" onClick={handleWithdraw}>
          Withdraw Application
        </Button>
      )}
    </div>
  )
}
