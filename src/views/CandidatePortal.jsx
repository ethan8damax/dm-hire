import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search, MapPin, DollarSign, ArrowLeft, Loader2, CheckCircle2,
  FileSignature, CalendarClock, LogOut,
} from 'lucide-react'
import Button from '../components/ui/Button'
import Timeline from '../components/ui/Timeline'
import { usePersona } from '../context/PersonaContext'
import { jobs } from '../data/jobs'
import './CandidatePortal.css'

const SCHEDULE_SLOTS = ['9:00 AM', '11:00 AM', '1:00 PM', '3:00 PM']

function upcomingWeekdays(count) {
  const days = []
  const cursor = new Date('2026-07-08T00:00:00')
  while (days.length < count) {
    if (cursor.getDay() !== 0 && cursor.getDay() !== 6) days.push(new Date(cursor))
    cursor.setDate(cursor.getDate() + 1)
  }
  return days
}

const EMPTY_APPLY_FORM = { name: '', email: '', phone: '' }

export default function CandidatePortal() {
  const navigate = useNavigate()
  const { setPersona } = usePersona()
  const [step, setStep] = useState('search')
  const [query, setQuery] = useState('')
  const [selectedJobId, setSelectedJobId] = useState(null)
  const [applyForm, setApplyForm] = useState(EMPTY_APPLY_FORM)
  const [applyPhase, setApplyPhase] = useState('idle') // idle | submitting
  const [scheduleSelected, setScheduleSelected] = useState(null)
  const [agreed, setAgreed] = useState(false)
  const [signPhase, setSignPhase] = useState('idle') // idle | signing | signed

  const openJobs = jobs.filter((j) => j.status === 'open' && !j.isInternal)
  const filteredJobs = openJobs.filter((j) =>
    `${j.title} ${j.department}`.toLowerCase().includes(query.toLowerCase()))
  const selectedJob = jobs.find((j) => j.id === selectedJobId)
  const days = upcomingWeekdays(4)

  function exitPortal() {
    setPersona('recruiter')
    navigate('/')
  }

  function submitApplication() {
    setApplyPhase('submitting')
    setTimeout(() => {
      setApplyPhase('idle')
      setStep('status')
    }, 900)
  }

  function confirmSchedule() {
    setStep('offer')
  }

  function signOffer() {
    setSignPhase('signing')
    setTimeout(() => setSignPhase('signed'), 1000)
  }

  const stageBadge = { search: 1, apply: 1, status: 1, schedule: 2, offer: 3 }[step] ?? 1

  return (
    <div className="portal-page">
      <button type="button" className="portal-exit" onClick={exitPortal}>
        <LogOut size={14} /> Exit candidate view
      </button>

      <div className="portal-frame">
        <div className="portal-notch" />
        <div className="portal-screen">
          <div className="portal-topbar">DM Hire Careers</div>

          {step === 'search' && (
            <div className="portal-body">
              <div className="portal-search-box">
                <Search size={15} />
                <input
                  type="text"
                  placeholder="Search open roles…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
              {filteredJobs.length === 0 && <div className="portal-empty">No open roles match your search.</div>}
              {filteredJobs.map((job) => (
                <div key={job.id} className="portal-job-card" onClick={() => { setSelectedJobId(job.id); setStep('apply') }}>
                  <div className="portal-job-title">{job.title}</div>
                  <div className="portal-job-meta"><MapPin size={12} /> {job.location}</div>
                  <div className="portal-job-meta"><DollarSign size={12} /> {job.compRange}</div>
                </div>
              ))}
            </div>
          )}

          {step === 'apply' && selectedJob && (
            <div className="portal-body">
              <button type="button" className="portal-back" onClick={() => setStep('search')}><ArrowLeft size={14} /> Back to search</button>
              <div className="portal-apply-title">{selectedJob.title}</div>
              <div className="portal-apply-sub">{selectedJob.department} · {selectedJob.location}</div>

              <label className="portal-field">
                <span>Full Name</span>
                <input value={applyForm.name} onChange={(e) => setApplyForm((f) => ({ ...f, name: e.target.value }))} />
              </label>
              <label className="portal-field">
                <span>Email</span>
                <input type="email" value={applyForm.email} onChange={(e) => setApplyForm((f) => ({ ...f, email: e.target.value }))} />
              </label>
              <label className="portal-field">
                <span>Phone</span>
                <input type="tel" value={applyForm.phone} onChange={(e) => setApplyForm((f) => ({ ...f, phone: e.target.value }))} />
              </label>
              <div className="portal-field">
                <span>Resume</span>
                <div className="portal-upload-placeholder">Tap to upload résumé (placeholder)</div>
              </div>

              <Button
                variant="primary"
                className="portal-full-btn"
                disabled={!applyForm.name.trim() || !applyForm.email.trim() || applyPhase === 'submitting'}
                onClick={submitApplication}
              >
                {applyPhase === 'submitting' && <Loader2 size={14} className="portal-spin" />}
                {applyPhase === 'submitting' ? 'Submitting…' : 'Submit Application'}
              </Button>
            </div>
          )}

          {step === 'status' && selectedJob && (
            <div className="portal-body">
              <div className="portal-status-hero">
                <CheckCircle2 size={28} />
                <div className="portal-status-title">Application received!</div>
                <div className="portal-status-sub">Thanks, {applyForm.name.split(' ')[0] || 'there'}. We'll be in touch about {selectedJob.title}.</div>
              </div>
              <Timeline steps={[
                { status: 'complete', label: 'Application Received', date: 'Today' },
                { status: 'active', label: 'Recruiter Review', note: 'A recruiter is reviewing your application' },
                { status: 'pending', label: 'Interview' },
                { status: 'pending', label: 'Offer' },
              ]} />
              <Button variant="primary" className="portal-full-btn" onClick={() => setStep('schedule')}>
                <CalendarClock size={14} /> Self-Schedule Your Interview
              </Button>
            </div>
          )}

          {step === 'schedule' && (
            <div className="portal-body">
              <div className="portal-apply-title">Schedule Your Interview</div>
              <div className="portal-apply-sub">Pick a time that works for you</div>
              <div className="portal-schedule-grid">
                {days.map((day, dayIdx) => {
                  const dayLabel = day.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
                  return (
                    <div className="portal-schedule-day" key={dayIdx}>
                      <div className="portal-schedule-day-hdr">{dayLabel}</div>
                      <div className="portal-schedule-slots">
                        {SCHEDULE_SLOTS.map((slot) => {
                          const isSelected = scheduleSelected?.dayLabel === dayLabel && scheduleSelected?.slot === slot
                          return (
                            <button
                              key={slot}
                              type="button"
                              className={`portal-slot${isSelected ? ' portal-slot-selected' : ''}`}
                              onClick={() => setScheduleSelected({ dayLabel, slot })}
                            >
                              {slot}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
              <Button variant="primary" className="portal-full-btn" disabled={!scheduleSelected} onClick={confirmSchedule}>
                Confirm {scheduleSelected ? `${scheduleSelected.dayLabel} · ${scheduleSelected.slot}` : 'a time'}
              </Button>
            </div>
          )}

          {step === 'offer' && selectedJob && signPhase !== 'signed' && (
            <div className="portal-body">
              <div className="portal-apply-title"><FileSignature size={16} /> Your Offer Letter</div>
              <div className="portal-offer-panel">
                <div className="portal-offer-row"><span>Role</span><span>{selectedJob.title}</span></div>
                <div className="portal-offer-row"><span>Compensation</span><span>{selectedJob.compRange}</span></div>
                <div className="portal-offer-row"><span>Start Date</span><span>Two weeks from acceptance</span></div>
              </div>
              <label className="portal-agree">
                <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
                <span>I have reviewed and agree to the terms of this offer.</span>
              </label>
              <Button variant="primary" className="portal-full-btn" disabled={!agreed || signPhase === 'signing'} onClick={signOffer}>
                {signPhase === 'signing' && <Loader2 size={14} className="portal-spin" />}
                {signPhase === 'signing' ? 'Signing…' : 'Sign Offer'}
              </Button>
            </div>
          )}

          {step === 'offer' && signPhase === 'signed' && (
            <div className="portal-body">
              <div className="portal-status-hero">
                <CheckCircle2 size={32} />
                <div className="portal-status-title">Welcome to the team!</div>
                <div className="portal-status-sub">Your signed offer has been sent to the hiring team. Onboarding details are on their way to your inbox.</div>
              </div>
            </div>
          )}

          <div className="portal-step-dots">
            {[1, 2, 3].map((n) => <span key={n} className={`portal-dot${n <= stageBadge ? ' active' : ''}`} />)}
          </div>
        </div>
      </div>
    </div>
  )
}
