import { useEffect, useState } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import {
  ChevronLeft, ChevronRight, Mail, CalendarClock, FileSignature, MapPin, Phone,
  Link2, DollarSign, Briefcase, CalendarCheck, Sparkles, FileText, ShieldCheck,
  BadgeCheck, Loader2, CheckCircle2, Send,
} from 'lucide-react'
import Avatar from '../components/ui/Avatar'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import EmptyState from '../components/ui/EmptyState'
import Timeline from '../components/ui/Timeline'
import ScoreBar from '../components/ui/ScoreBar'
import { candidates } from '../data/candidates'
import { jobs } from '../data/jobs'
import { offers as initialOffers } from '../data/offers'
import './CandidateProfile.css'

const CURRENT_RECRUITER = 'T. Smith'
const CURRENT_OFFICE = 'Detroit'
const TODAY = '2026-07-07'

const DIMENSION_LABELS = {
  payrollExpertise: 'Payroll Expertise',
  softwareSystems: 'Software Systems',
  compliance: 'Compliance & Tax',
  leadership: 'Team Leadership',
  cultureFit: 'Culture Fit',
}

const FORWARD_STAGES = [
  { key: 'screening', label: 'Phone Screen' },
  { key: 'interviewing', label: 'Interview' },
  { key: 'offer', label: 'Offer Management' },
  { key: 'hired', label: 'DM Payroll Handoff' },
]

const TABS = [
  { key: 'timeline', label: 'Timeline' },
  { key: 'notes', label: 'Notes' },
  { key: 'scorecard', label: 'Scorecard' },
  { key: 'comms', label: 'Comms' },
  { key: 'schedule', label: 'Schedule' },
  { key: 'offer', label: 'Offer' },
  { key: 'docs', label: 'Docs' },
]

function buildTimeline(candidate) {
  const steps = candidate.timeline.map((t) => ({ status: 'complete', label: t.stage, date: t.date, note: t.note }))

  if (candidate.stage === 'rejected') {
    const last = candidate.notes[candidate.notes.length - 1]
    steps.push({ status: 'complete', label: 'Not Selected', date: last?.date, note: last?.body })
    return steps
  }

  const stageIdx = FORWARD_STAGES.findIndex((s) => s.key === candidate.stage)
  FORWARD_STAGES.forEach((s, i) => {
    const status = stageIdx === -1 ? 'pending' : i < stageIdx ? 'complete' : i === stageIdx ? 'active' : 'pending'
    let date, note
    if (status !== 'pending') {
      const sc = candidate.scorecard[i] ?? candidate.scorecard[candidate.scorecard.length - 1]
      if (sc) {
        date = sc.date
        note = `Scorecard submitted by ${sc.interviewer}`
      } else {
        const n = candidate.notes[candidate.notes.length - 1]
        if (n) { date = n.date; note = n.body }
      }
    }
    steps.push({ status, label: s.label, date, note })
  })
  return steps
}

function docStatus(candidate) {
  if (candidate.stage === 'hired') return 'cleared'
  if (candidate.stage === 'offer') return 'in_progress'
  return 'not_started'
}

export default function CandidateProfile() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const candidate = candidates.find((c) => c.id === id)
  const job = jobs.find((j) => j.id === candidate?.jobId)

  const [activeTab, setActiveTab] = useState(location.state?.tab ?? 'timeline')
  const [notes, setNotes] = useState(candidate?.notes ?? [])
  const [noteDraft, setNoteDraft] = useState('')
  const [offer, setOffer] = useState(() => initialOffers.find((o) => o.candidateId === id) ?? null)
  const [offerEditing, setOfferEditing] = useState(false)
  const [offerPhase, setOfferPhase] = useState('idle') // idle | sending

  useEffect(() => {
    setActiveTab(location.state?.tab ?? 'timeline')
    setNotes(candidate?.notes ?? [])
    setNoteDraft('')
    setOffer(initialOffers.find((o) => o.candidateId === id) ?? null)
    setOfferEditing(false)
    setOfferPhase('idle')
  }, [id, candidate, location])

  if (!candidate) {
    return (
      <EmptyState
        title="Candidate not found"
        subtitle="This candidate may have been removed."
        ctaLabel="Back to Pipeline"
        onCta={() => navigate('/pipeline')}
      />
    )
  }

  const candidateIds = location.state?.candidateIds ?? candidates.filter((c) => c.jobId === candidate.jobId).map((c) => c.id)
  const posInList = candidateIds.indexOf(candidate.id)
  const prevId = posInList > 0 ? candidateIds[posInList - 1] : null
  const nextId = posInList >= 0 && posInList < candidateIds.length - 1 ? candidateIds[posInList + 1] : null

  function goTo(candId) {
    if (!candId) return
    navigate(`/candidates/${candId}`, { state: { candidateIds } })
  }

  function handleAddNote() {
    if (!noteDraft.trim()) return
    setNotes([...notes, { author: CURRENT_RECRUITER, office: CURRENT_OFFICE, date: TODAY, body: noteDraft.trim() }])
    setNoteDraft('')
  }

  function handleGenerateOffer() {
    setOffer({
      id: `offer-draft-${candidate.id}`,
      candidateId: candidate.id,
      jobId: candidate.jobId,
      salary: 0,
      bonus: '10% of base',
      pto: '15 days + 10 holidays',
      startDate: '',
      sentDate: null,
      expiryDate: null,
      status: 'draft',
      approvalChain: [
        { role: 'HR Director', name: 'A. Chen', approved: false, date: null },
        { role: 'VP Finance', name: 'L. Torres', approved: false, date: null },
      ],
      esigStatus: 'pending',
      esigViewedDate: null,
      esigSignedDate: null,
      payrollSynced: false,
    })
    setOfferEditing(true)
  }

  function handleSendForApproval() {
    setOfferPhase('sending')
    setTimeout(() => {
      setOffer((o) => ({
        ...o,
        status: 'awaiting',
        sentDate: TODAY,
        expiryDate: '2026-07-14',
        approvalChain: o.approvalChain.map((a) => ({ ...a, approved: true, date: a.date ?? TODAY })),
      }))
      setOfferEditing(false)
      setOfferPhase('idle')
    }, 1000)
  }

  return (
    <div className="candidate-profile">
      <div className="page-header cp-header">
        <div className="cp-header-left">
          <Button variant="ghost" size="sm" onClick={() => navigate(`/pipeline?job=${candidate.jobId}`)}>
            <ChevronLeft size={16} /> Pipeline
          </Button>
          <button type="button" className="cp-nav-arrow" disabled={!prevId} onClick={() => goTo(prevId)} aria-label="Previous candidate">
            <ChevronLeft size={16} />
          </button>
          <button type="button" className="cp-nav-arrow" disabled={!nextId} onClick={() => goTo(nextId)} aria-label="Next candidate">
            <ChevronRight size={16} />
          </button>
          <h1 className="page-title cp-name">{candidate.name}</h1>
          <Badge variant={candidate.stage} />
        </div>
        <div className="cp-header-actions">
          <Button variant="ghost" size="sm" onClick={() => setActiveTab('comms')}><Mail size={14} /> Email</Button>
          <Button variant="ghost" size="sm" onClick={() => setActiveTab('schedule')}><CalendarClock size={14} /> Schedule</Button>
          <Button variant="accent" size="sm" onClick={() => setActiveTab('offer')}><FileSignature size={14} /> Generate Offer</Button>
        </div>
      </div>

      <div className="cp-layout">
        <div className="cp-left">
          <Card className="cp-hero-card">
            <div className="cp-hero">
              <Avatar initials={candidate.initials} color={candidate.avatarColor} size="xl" />
              <div className="cp-hero-name">{candidate.name}</div>
              <div className="cp-hero-role">{job ? `${job.title} Candidate` : candidate.currentRole}</div>
              <div className="cp-parsed-badge"><Sparkles size={11} /> Resume auto-parsed · 0 fields re-entered</div>
              <div className="cp-hero-badges">
                <Badge variant={candidate.stage} />
                <span className="cp-day-badge">Day {candidate.daysInStage}</span>
              </div>
            </div>
            <div className="cp-info">
              <div className="cp-info-row"><MapPin size={14} /><span className="cp-info-label">Location</span><span className="cp-info-val">{candidate.location}</span></div>
              <div className="cp-info-row"><Mail size={14} /><span className="cp-info-label">Email</span><span className="cp-info-val cp-info-link">{candidate.email}</span></div>
              <div className="cp-info-row"><Phone size={14} /><span className="cp-info-label">Phone</span><span className="cp-info-val">{candidate.phone}</span></div>
              <div className="cp-info-row"><Link2 size={14} /><span className="cp-info-label">Source</span><span className="cp-info-val">{candidate.source}</span></div>
              <div className="cp-info-row"><DollarSign size={14} /><span className="cp-info-label">Exp. Salary</span><span className="cp-info-val">{candidate.expectedSalary}</span></div>
              <div className="cp-info-row"><Briefcase size={14} /><span className="cp-info-label">Current Role</span><span className="cp-info-val">{candidate.currentRole}</span></div>
              <div className="cp-info-row"><CalendarCheck size={14} /><span className="cp-info-label">Available</span><span className="cp-info-val">{candidate.availability}</span></div>
              {candidate.priorInteraction && (
                <div className="cp-prior-interaction">
                  Spoke with {candidate.priorInteraction.recruiter} in {candidate.priorInteraction.year} for a different role ({candidate.priorInteraction.role})
                </div>
              )}
            </div>
            <div className="cp-actions">
              <Button variant="primary" onClick={() => setActiveTab('offer')} className="cp-full-btn">Generate Offer Letter</Button>
              <Button variant="ghost" onClick={() => setActiveTab('schedule')} className="cp-full-btn"><CalendarClock size={14} /> Schedule Interview</Button>
              <Button variant="danger" className="cp-full-btn cp-danger-ghost">Mark Not Selected</Button>
            </div>
          </Card>

          <Card>
            <Card.Header>
              <Card.Title>AI Match Score</Card.Title>
              <span className="cp-score-total">{candidate.aiScore}%</span>
            </Card.Header>
            <Card.Body>
              {Object.entries(candidate.aiDimensions).map(([key, value]) => (
                <ScoreBar key={key} label={DIMENSION_LABELS[key] ?? key} value={value} />
              ))}
              <div className="cp-skill-tags">
                {candidate.skills.map((skill) => <span key={skill} className="cp-tag">{skill}</span>)}
              </div>
            </Card.Body>
          </Card>
        </div>

        <div className="cp-right">
          <div className="detail-tabs">
            {TABS.map((t) => (
              <div key={t.key} className={`dtab${activeTab === t.key ? ' active' : ''}`} onClick={() => setActiveTab(t.key)}>
                {t.label}
              </div>
            ))}
          </div>

          {activeTab === 'timeline' && (
            <Card><Card.Body><Timeline steps={buildTimeline(candidate)} /></Card.Body></Card>
          )}

          {activeTab === 'notes' && (
            <Card>
              <Card.Body className="cp-notes-body">
                {notes.length === 0 && <div className="cp-empty-inline">No notes yet.</div>}
                {notes.map((n, i) => (
                  <div className="cp-note" key={i}>
                    <Avatar initials={n.author.split(' ').map((p) => p[0]).join('')} size="sm" />
                    <div className="cp-note-body">
                      <div className="cp-note-meta">{n.author} · {n.office} · {n.date}</div>
                      <div className="cp-note-text">{n.body}</div>
                    </div>
                  </div>
                ))}
                <div className="cp-note-compose">
                  <textarea
                    placeholder="Add a note, visible to all offices…"
                    value={noteDraft}
                    onChange={(e) => setNoteDraft(e.target.value)}
                  />
                  <Button variant="primary" size="sm" onClick={handleAddNote}>Add Note</Button>
                </div>
              </Card.Body>
            </Card>
          )}

          {activeTab === 'scorecard' && (
            <Card>
              <Card.Body>
                {candidate.scorecard.length === 0 ? (
                  <EmptyState title="No scorecards submitted yet" subtitle="Scorecards appear here once interviewers submit feedback." />
                ) : (
                  candidate.scorecard.map((sc, i) => (
                    <div className="cp-scorecard-entry" key={i}>
                      <div className="cp-scorecard-hdr">{sc.interviewer} · {sc.date}</div>
                      {Object.entries(sc.dimensions).map(([key, value]) => (
                        <ScoreBar key={key} label={DIMENSION_LABELS[key] ?? key} value={value * 10} />
                      ))}
                    </div>
                  ))
                )}
              </Card.Body>
            </Card>
          )}

          {activeTab === 'comms' && <CommsTab key={candidate.id} candidate={candidate} />}
          {activeTab === 'schedule' && <ScheduleTab key={candidate.id} candidate={candidate} />}

          {activeTab === 'offer' && (
            <OfferTab
              offer={offer}
              editing={offerEditing}
              phase={offerPhase}
              onGenerate={handleGenerateOffer}
              onEdit={() => setOfferEditing(true)}
              onChange={setOffer}
              onSendForApproval={handleSendForApproval}
            />
          )}

          {activeTab === 'docs' && <DocsTab candidate={candidate} offer={offer} />}
        </div>
      </div>
    </div>
  )
}

function CommsTab({ candidate }) {
  const [emailThread, setEmailThread] = useState([
    { from: candidate.name, date: candidate.timeline[0]?.date, body: `Application submitted via ${candidate.source}.` },
  ])
  const [smsThread, setSmsThread] = useState([])
  const [emailDraft, setEmailDraft] = useState('')
  const [smsDraft, setSmsDraft] = useState('')

  return (
    <Card>
      <Card.Body className="cp-comms-body">
        <div className="cp-comms-col">
          <div className="cp-comms-hdr">Email Thread</div>
          <div className="cp-comms-thread">
            {emailThread.map((m, i) => (
              <div className="cp-comms-msg" key={i}><div className="cp-comms-meta">{m.from} · {m.date}</div><div>{m.body}</div></div>
            ))}
          </div>
          <div className="cp-comms-compose">
            <textarea placeholder="Write an email…" value={emailDraft} onChange={(e) => setEmailDraft(e.target.value)} />
            <Button
              variant="primary" size="sm"
              onClick={() => {
                if (!emailDraft.trim()) return
                setEmailThread([...emailThread, { from: CURRENT_RECRUITER, date: TODAY, body: emailDraft.trim() }])
                setEmailDraft('')
              }}
            ><Send size={13} /> Send</Button>
          </div>
        </div>
        <div className="cp-comms-col">
          <div className="cp-comms-hdr">SMS Thread</div>
          <div className="cp-comms-thread">
            {smsThread.length === 0 && <div className="cp-empty-inline">No messages yet.</div>}
            {smsThread.map((m, i) => (
              <div className="cp-comms-msg" key={i}><div className="cp-comms-meta">{m.from} · {m.date}</div><div>{m.body}</div></div>
            ))}
          </div>
          <div className="cp-comms-compose">
            <textarea placeholder="Write a text message…" value={smsDraft} onChange={(e) => setSmsDraft(e.target.value)} />
            <Button
              variant="primary" size="sm"
              onClick={() => {
                if (!smsDraft.trim()) return
                setSmsThread([...smsThread, { from: CURRENT_RECRUITER, date: TODAY, body: smsDraft.trim() }])
                setSmsDraft('')
              }}
            ><Send size={13} /> Send</Button>
          </div>
        </div>
      </Card.Body>
    </Card>
  )
}

const SCHEDULE_SLOTS = ['9:00 AM', '11:00 AM', '1:00 PM', '3:00 PM']

function upcomingWeekdays(count) {
  const days = []
  const cursor = new Date(`${TODAY}T00:00:00`)
  cursor.setDate(cursor.getDate() + 1)
  while (days.length < count) {
    if (cursor.getDay() !== 0 && cursor.getDay() !== 6) {
      days.push(new Date(cursor))
    }
    cursor.setDate(cursor.getDate() + 1)
  }
  return days
}

function ScheduleTab({ candidate }) {
  const days = upcomingWeekdays(4)
  const [selected, setSelected] = useState(null)
  const [phase, setPhase] = useState('idle') // idle | sending | sent

  function slotUnavailable(dayIdx, slotIdx) {
    return (dayIdx + slotIdx) % 3 === 0
  }

  if (phase === 'sent') {
    return (
      <Card>
        <Card.Body className="cp-schedule-sent">
          <CheckCircle2 size={32} className="cp-schedule-sent-icon" />
          <div className="cp-schedule-sent-title">Outlook invite sent</div>
          <div className="cp-schedule-sent-sub">
            Calendar hold created for {candidate.name} — {selected.dayLabel} at {selected.slot}. Candidate can self-schedule via the link.
          </div>
          <Button variant="ghost" size="sm" onClick={() => { setPhase('idle'); setSelected(null) }}>Schedule Another</Button>
        </Card.Body>
      </Card>
    )
  }

  return (
    <Card>
      <Card.Body>
        <div className="cp-schedule-grid">
          {days.map((day, dayIdx) => (
            <div className="cp-schedule-day" key={dayIdx}>
              <div className="cp-schedule-day-hdr">
                {day.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
              </div>
              {SCHEDULE_SLOTS.map((slot, slotIdx) => {
                const unavailable = slotUnavailable(dayIdx, slotIdx)
                const dayLabel = day.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
                const isSelected = selected?.dayLabel === dayLabel && selected?.slot === slot
                return (
                  <button
                    key={slot}
                    type="button"
                    className={`cp-schedule-slot${unavailable ? ' cp-schedule-slot-off' : ''}${isSelected ? ' cp-schedule-slot-selected' : ''}`}
                    disabled={unavailable}
                    onClick={() => setSelected({ dayLabel, slot })}
                  >
                    {slot}
                  </button>
                )
              })}
            </div>
          ))}
        </div>
        <div className="cp-schedule-footer">
          <Button
            variant="primary"
            disabled={!selected || phase === 'sending'}
            onClick={() => { setPhase('sending'); setTimeout(() => setPhase('sent'), 900) }}
          >
            {phase === 'sending' ? <Loader2 size={14} className="cp-spin" /> : <CalendarClock size={14} />}
            {phase === 'sending' ? 'Sending Outlook invite…' : 'Send Invite'}
          </Button>
        </div>
      </Card.Body>
    </Card>
  )
}

function OfferTab({ offer, editing, phase, onGenerate, onEdit, onChange, onSendForApproval }) {
  const [esigPhase, setEsigPhase] = useState('idle') // idle | viewing | signing

  function handleSimulateView() {
    setEsigPhase('viewing')
    setTimeout(() => {
      onChange((o) => ({ ...o, esigViewedDate: TODAY }))
      setEsigPhase('idle')
    }, 900)
  }

  function handleSimulateSign() {
    setEsigPhase('signing')
    setTimeout(() => {
      onChange((o) => ({ ...o, esigStatus: 'signed', esigSignedDate: TODAY, status: 'accepted' }))
      setEsigPhase('idle')
      setTimeout(() => onChange((o) => ({ ...o, payrollSynced: true })), 1400)
    }, 900)
  }

  if (!offer) {
    return (
      <Card>
        <Card.Body>
          <EmptyState
            icon={FileSignature}
            title="No offer yet"
            subtitle="Generate an offer letter to start the approval process."
            ctaLabel="Generate Offer"
            onCta={onGenerate}
          />
        </Card.Body>
      </Card>
    )
  }

  return (
    <Card>
      <Card.Body>
        <div className="cp-offer-panel">
          {editing ? (
            <>
              <div className="cp-offer-edit-row"><label>Base Salary</label><input type="number" value={offer.salary} onChange={(e) => onChange({ ...offer, salary: Number(e.target.value) })} /></div>
              <div className="cp-offer-edit-row"><label>Bonus</label><input value={offer.bonus} onChange={(e) => onChange({ ...offer, bonus: e.target.value })} /></div>
              <div className="cp-offer-edit-row"><label>PTO</label><input value={offer.pto} onChange={(e) => onChange({ ...offer, pto: e.target.value })} /></div>
              <div className="cp-offer-edit-row"><label>Start Date</label><input type="date" value={offer.startDate} onChange={(e) => onChange({ ...offer, startDate: e.target.value })} /></div>
            </>
          ) : (
            <>
              <div className="cp-offer-row"><span>Base Salary</span><span className="cp-offer-accent">${offer.salary.toLocaleString()} / year</span></div>
              <div className="cp-offer-row"><span>Bonus Target</span><span>{offer.bonus}</span></div>
              <div className="cp-offer-row"><span>PTO</span><span>{offer.pto}</span></div>
              <div className="cp-offer-row"><span>Start Date</span><span>{offer.startDate || '—'}</span></div>
            </>
          )}
          <div className="cp-offer-row"><span>Status</span><span className={`cp-offer-status cp-offer-status-${offer.status}`}>{offer.status.replace('_', ' ')}</span></div>
        </div>

        <div className="cp-approval-chain">
          <div className="cp-section-label">Approval Chain</div>
          {offer.approvalChain.map((a, i) => (
            <div className="cp-approval-row" key={i}>
              <BadgeCheck size={14} className={a.approved ? 'cp-approved-icon' : 'cp-pending-icon'} />
              <span>{a.role} · {a.name}</span>
              <span className="cp-approval-date">{a.approved ? `Approved ${a.date}` : 'Pending'}</span>
            </div>
          ))}
        </div>

        <div className="cp-esig-section">
          <div className="cp-section-label">E-Signature Audit Trail</div>
          {[
            offer.sentDate && { label: 'Offer sent', date: offer.sentDate },
            offer.esigViewedDate && { label: 'Signature link opened', date: offer.esigViewedDate },
            offer.esigSignedDate && { label: 'Signed', date: offer.esigSignedDate },
          ].filter(Boolean).map((ev, i) => (
            <div className="cp-approval-row" key={i}>
              <ShieldCheck size={14} className="cp-approved-icon" />
              <span>{ev.label}</span>
              <span className="cp-approval-date">{ev.date}</span>
            </div>
          ))}

          {esigPhase !== 'idle' && (
            <div className="cp-approval-row">
              <Loader2 size={14} className="cp-spin cp-pending-icon" />
              <span>{esigPhase === 'viewing' ? 'Candidate opening signature link…' : 'Candidate signing…'}</span>
            </div>
          )}

          {esigPhase === 'idle' && offer.status === 'awaiting' && !offer.esigViewedDate && (
            <Button variant="ghost" size="sm" onClick={handleSimulateView}>Simulate: Candidate Opens Link</Button>
          )}
          {esigPhase === 'idle' && offer.status === 'awaiting' && offer.esigViewedDate && !offer.esigSignedDate && (
            <Button variant="primary" size="sm" onClick={handleSimulateSign}>Simulate: Candidate Signs →</Button>
          )}
        </div>

        {offer.status === 'accepted' && (
          <div className="cp-esig-row cp-synced-row">
            {offer.payrollSynced
              ? <><CheckCircle2 size={14} className="cp-approved-icon" /><span>Synced to DM Payroll</span></>
              : <><Loader2 size={14} className="cp-spin cp-pending-icon" /><span>Syncing to DM Payroll…</span></>}
          </div>
        )}

        <div className="cp-offer-actions">
          {offer.status === 'draft' && !editing && <Button variant="ghost" onClick={onEdit}>Edit Offer</Button>}
          {offer.status === 'draft' && (
            <Button variant="primary" disabled={phase === 'sending'} onClick={onSendForApproval}>
              {phase === 'sending' ? <Loader2 size={14} className="cp-spin" /> : null}
              {phase === 'sending' ? 'Sending…' : 'Send for Approval →'}
            </Button>
          )}
        </div>
      </Card.Body>
    </Card>
  )
}

function DocsTab({ candidate, offer }) {
  const status = docStatus(candidate)
  const certifications = candidate.skills.filter((s) => s.toLowerCase().includes('certified'))

  return (
    <Card>
      <Card.Body className="cp-docs-body">
        <div className="cp-doc-row">
          <FileText size={20} />
          <div className="cp-doc-info">
            <div className="cp-doc-title">Resume — {candidate.name.replace(' ', '_')}_Resume.pdf</div>
            <div className="cp-doc-sub">Uploaded {candidate.timeline[0]?.date} · Auto-parsed</div>
          </div>
          <Button variant="ghost" size="sm">View</Button>
        </div>

        {certifications.map((cert) => (
          <div className="cp-doc-row" key={cert}>
            <BadgeCheck size={20} />
            <div className="cp-doc-info">
              <div className="cp-doc-title">{cert}</div>
              <div className="cp-doc-sub">Self-reported · Verification pending</div>
            </div>
            <Button variant="ghost" size="sm">Verify</Button>
          </div>
        ))}

        <div className={`cp-doc-row${status === 'not_started' ? ' cp-doc-row-dim' : ''}`}>
          <ShieldCheck size={20} />
          <div className="cp-doc-info">
            <div className="cp-doc-title">Background Check</div>
            <div className="cp-doc-sub">
              {status === 'cleared' ? 'Cleared' : status === 'in_progress' ? 'In progress' : 'Not yet initiated — awaiting offer acceptance'}
            </div>
          </div>
          <Button variant="ghost" size="sm" disabled={status === 'not_started'}>{status === 'cleared' ? 'View' : 'Initiate'}</Button>
        </div>

        <div className={`cp-doc-row${status === 'not_started' ? ' cp-doc-row-dim' : ''}`}>
          <ShieldCheck size={20} />
          <div className="cp-doc-info">
            <div className="cp-doc-title">Drug Screen</div>
            <div className="cp-doc-sub">
              {status === 'cleared' ? 'Cleared' : status === 'in_progress' ? 'In progress' : 'Not yet initiated — awaiting offer acceptance'}
            </div>
          </div>
          <Button variant="ghost" size="sm" disabled={status === 'not_started'}>{status === 'cleared' ? 'View' : 'Initiate'}</Button>
        </div>

        <div className={`cp-doc-row${!offer ? ' cp-doc-row-dim' : ''}`}>
          <FileSignature size={20} />
          <div className="cp-doc-info">
            <div className="cp-doc-title">Signed Offer Letter</div>
            <div className="cp-doc-sub">
              {offer?.esigStatus === 'signed' ? `Signed ${offer.esigSignedDate}` : offer ? 'Pending — offer not yet signed' : 'Pending — offer not yet sent'}
            </div>
          </div>
        </div>
      </Card.Body>
    </Card>
  )
}
