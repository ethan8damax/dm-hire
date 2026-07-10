import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Loader2, CheckCircle2 } from 'lucide-react'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Timeline from '../../components/ui/Timeline'
import EmptyState from '../../components/ui/EmptyState'
import WizardRail from '../../components/ui/WizardRail'
import Loading from '../../components/ui/Loading'
import { useCandidateSession } from '../../context/CandidateSessionContext'
import { useJobs } from '../../hooks/useJobs'
import { useCandidates } from '../../hooks/useCandidates'
import { extractResumeText, parseResumeText } from '../../data/resumeParser'
import { buildBlankEmploymentEntry, buildBlankEducationEntry, buildBlankTrainingEntry, isEntryBlank } from '../../data/applicationValidation'
import { useApplicationWizard, WIZARD_STEPS } from '../../hooks/useApplicationWizard'
import StepPersonalInfo from './StepPersonalInfo'
import StepEmploymentHistory from './StepEmploymentHistory'
import StepEducation from './StepEducation'
import StepTraining from './StepTraining'
import StepWotc from './StepWotc'
import StepReview from './StepReview'
import './ApplyWizard.css'

const STEP_DESCRIPTIONS = [
  'Tell us how to reach you and a bit about your background.',
  "List your previous employers, most recent first. At least one entry is required.",
  'List your educational background. At least one entry is required.',
  'Add any relevant training or certifications — this step is optional.',
  'A few questions used only for federal tax credit eligibility screening — never used in hiring decisions.',
  'Review your application below. Anything missing is flagged so you can fix it before submitting.',
]

export default function ApplyWizard() {
  const { jobId } = useParams()
  const navigate = useNavigate()
  const { login } = useCandidateSession()
  const { jobs, loading: jobsLoading, recordApplicant } = useJobs()
  const { addApplication } = useCandidates()
  const job = jobs.find((j) => j.id === jobId && j.status === 'open' && !j.isInternal)

  // Deliberately not seeded from the candidate's saved profile/session — the
  // application should only ever auto-fill from a parsed resume upload, never
  // from prior account data. login() below still updates that profile after
  // submit, so "My Applications" / account record-keeping is unaffected.
  const wizard = useApplicationWizard()
  const [submitPhase, setSubmitPhase] = useState('idle') // idle | submitting | done
  const [newCandidateId, setNewCandidateId] = useState(null)
  const [parseState, setParseState] = useState({ phase: 'idle', message: '' }) // idle | parsing | done | error

  if (jobsLoading) return <Loading />

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

  const { data, stepIndex, currentStep, visitedSteps, attemptedSteps, errors, pendingFocusId } = wizard
  const isReview = currentStep.key === 'review'
  const isFirstStep = stepIndex === 0
  const personalBaselineOk = data.personal.name.trim() && data.personal.email.trim()

  function stepHasError(index) {
    const key = WIZARD_STEPS[index].key
    if (key === 'review') return false
    return Object.keys(errors).some((k) => k.startsWith(`${key}-`))
  }

  // Lives here (not in StepPersonalInfo) because a parsed resume can populate
  // Employment History, Education, and Training too — every section the wizard
  // owns, not just Personal Info. Never overwrites a section the applicant has
  // already started filling in themselves (see isEntryBlank / the per-field
  // "only if still empty" checks below).
  async function handleResumeFileChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    wizard.updateSection('personal', { resumeFileName: file.name })

    setParseState({ phase: 'parsing', message: '' })
    try {
      const extracted = await extractResumeText(file)
      if (!extracted) {
        setParseState({ phase: 'done', message: "Uploaded. Auto-fill from resume text isn't available for this file type." })
        return
      }
      const parsed = parseResumeText(extracted.text)
      const personal = data.personal

      const personalPatch = {}
      if (parsed.name && !personal.name.trim()) personalPatch.name = parsed.name
      if (parsed.email && !personal.email.trim()) personalPatch.email = parsed.email
      if (parsed.phone && !personal.phone.trim()) personalPatch.phone = parsed.phone
      if (parsed.linkedin && !personal.linkedin.trim()) personalPatch.linkedin = parsed.linkedin
      if (parsed.skills && !personal.skills.trim()) personalPatch.skills = parsed.skills
      if (parsed.city && !personal.city.trim()) personalPatch.city = parsed.city
      if (parsed.state && !personal.state.trim()) personalPatch.state = parsed.state
      if (parsed.currentRole && !personal.currentRole.trim()) personalPatch.currentRole = parsed.currentRole
      if (Object.keys(personalPatch).length > 0) wizard.updateSection('personal', personalPatch)
      const fieldCount = Object.keys(personalPatch).length

      let entryCount = 0
      const employmentUntouched = data.employmentHistory.length === 1 && isEntryBlank(data.employmentHistory[0], buildBlankEmploymentEntry)
      if (employmentUntouched && parsed.employmentHistory.length > 0) {
        wizard.replaceListSection('employmentHistory', parsed.employmentHistory.map((entry) => ({ ...buildBlankEmploymentEntry(), ...entry })))
        entryCount += parsed.employmentHistory.length
      }

      const educationUntouched = data.education.length === 1 && isEntryBlank(data.education[0], buildBlankEducationEntry)
      if (educationUntouched && parsed.education.length > 0) {
        wizard.replaceListSection('education', parsed.education.map((entry) => ({ ...buildBlankEducationEntry(), ...entry })))
        entryCount += parsed.education.length
      }

      const trainingUntouched = data.training.length === 0
      if (trainingUntouched && parsed.training.length > 0) {
        wizard.replaceListSection('training', parsed.training.map((entry) => ({ ...buildBlankTrainingEntry(), ...entry })))
        entryCount += parsed.training.length
      }

      const lowConfidenceNote = extracted.confidence === 'low' ? ' (older .doc files parse least reliably — please double check)' : ''
      const parts = []
      if (fieldCount > 0) parts.push(`${fieldCount} field${fieldCount === 1 ? '' : 's'}`)
      if (entryCount > 0) parts.push(`${entryCount} ${entryCount === 1 ? 'entry' : 'entries'} (Employment/Education/Training)`)
      setParseState({
        phase: 'done',
        message: parts.length > 0
          ? `Resume parsed — ${parts.join(' and ')} auto-filled${lowConfidenceNote}. Review everything before continuing.`
          : `Resume parsed, but we couldn't confidently extract anything${lowConfidenceNote} — please fill the sections in manually.`,
      })
    } catch {
      setParseState({ phase: 'error', message: "Couldn't read this file — please fill in the fields manually." })
    }
  }

  async function handleSubmit(payload) {
    setSubmitPhase('submitting')
    const { personal, employmentHistory, education, training, wotc } = payload
    const candidate = await addApplication({
      jobId: job.id,
      name: personal.name, email: personal.email, phone: personal.phone,
      location: [personal.city, personal.state].filter(Boolean).join(', '),
      currentRole: personal.currentRole, expectedSalary: personal.expectedSalary,
      availability: personal.availability, linkedin: personal.linkedin,
      resumeFileName: personal.resumeFileName, skills: personal.skills,
      address: { street: personal.street, city: personal.city, state: personal.state, zip: personal.zip },
      workAuthorization: { authorized: personal.workAuthorized, requiresSponsorship: personal.requiresSponsorship },
      employmentHistory, education, training, wotc,
    })
    if (!candidate) { setSubmitPhase('idle'); return }
    recordApplicant(job.id)
    login({
      name: personal.name, email: personal.email, phone: personal.phone,
      location: [personal.city, personal.state].filter(Boolean).join(', '),
      currentRole: personal.currentRole, linkedin: personal.linkedin,
    })
    setNewCandidateId(candidate.id)
    setSubmitPhase('done')
  }

  if (submitPhase === 'done') {
    return (
      <div className="apply-wizard-page">
        <Card>
          <Card.Body className="apply-done">
            <CheckCircle2 size={32} className="apply-done-icon" />
            <div className="apply-done-title">Application received!</div>
            <div className="apply-done-sub">Thanks, {data.personal.name.split(' ')[0]}. We'll be in touch about the {job.title} role.</div>
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
    <div className="apply-wizard-page">
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
          <WizardRail
            steps={WIZARD_STEPS}
            currentIndex={stepIndex}
            visitedSteps={visitedSteps}
            stepHasError={stepHasError}
            onStepClick={wizard.goToStep}
          />
          <p className="wizard-step-intro">{STEP_DESCRIPTIONS[stepIndex]}</p>

          {currentStep.key === 'personal' && (
            <StepPersonalInfo
              personal={data.personal}
              errors={errors}
              showErrors={attemptedSteps.has(0)}
              onChange={(patch) => wizard.updateSection('personal', patch)}
              parseState={parseState}
              onResumeFileChange={handleResumeFileChange}
              pendingFocusId={pendingFocusId}
              clearPendingFocus={wizard.clearPendingFocus}
            />
          )}
          {currentStep.key === 'employment' && (
            <StepEmploymentHistory
              items={data.employmentHistory}
              errors={errors}
              showErrors={attemptedSteps.has(1)}
              onAdd={(factory) => wizard.addListItem('employmentHistory', factory)}
              onRemove={(id) => wizard.removeListItem('employmentHistory', id)}
              onUpdate={(id, patch) => wizard.updateListItem('employmentHistory', id, patch)}
              pendingFocusId={pendingFocusId}
              clearPendingFocus={wizard.clearPendingFocus}
            />
          )}
          {currentStep.key === 'education' && (
            <StepEducation
              items={data.education}
              errors={errors}
              showErrors={attemptedSteps.has(2)}
              onAdd={(factory) => wizard.addListItem('education', factory)}
              onRemove={(id) => wizard.removeListItem('education', id)}
              onUpdate={(id, patch) => wizard.updateListItem('education', id, patch)}
              pendingFocusId={pendingFocusId}
              clearPendingFocus={wizard.clearPendingFocus}
            />
          )}
          {currentStep.key === 'training' && (
            <StepTraining
              items={data.training}
              errors={errors}
              showErrors={attemptedSteps.has(3)}
              onAdd={(factory) => wizard.addListItem('training', factory)}
              onRemove={(id) => wizard.removeListItem('training', id)}
              onUpdate={(id, patch) => wizard.updateListItem('training', id, patch)}
              pendingFocusId={pendingFocusId}
              clearPendingFocus={wizard.clearPendingFocus}
            />
          )}
          {currentStep.key === 'wotc' && (
            <StepWotc
              wotc={data.wotc}
              personal={data.personal}
              errors={errors}
              showErrors={attemptedSteps.has(4)}
              onChange={(patch) => wizard.updateSection('wotc', patch)}
              pendingFocusId={pendingFocusId}
              clearPendingFocus={wizard.clearPendingFocus}
            />
          )}
          {isReview && (
            <StepReview
              data={data}
              errors={errors}
              onFix={(fieldId) => wizard.goToStepAndFlag(errors[fieldId].stepIndex, fieldId)}
              onEditStep={wizard.goToStep}
            />
          )}

          <div className="wizard-footer">
            <Button variant="ghost" onClick={wizard.goBack} disabled={isFirstStep}>
              <ChevronLeft size={16} /> Back
            </Button>
            {isReview ? (
              <Button
                variant="primary"
                size="lg"
                disabled={submitPhase === 'submitting'}
                onClick={() => wizard.attemptSubmit(handleSubmit)}
              >
                {submitPhase === 'submitting' && <Loader2 size={14} className="apply-spin" />}
                {submitPhase === 'submitting' ? 'Submitting…' : 'Submit Application'}
              </Button>
            ) : (
              <Button
                variant="primary"
                onClick={wizard.goNext}
                disabled={isFirstStep && !personalBaselineOk}
              >
                Next <ChevronRight size={16} />
              </Button>
            )}
          </div>
        </Card.Body>
      </Card>
    </div>
  )
}
