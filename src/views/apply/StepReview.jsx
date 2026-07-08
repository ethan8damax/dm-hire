import Badge from '../../components/ui/Badge'
import Card from '../../components/ui/Card'
import { WIZARD_STEPS } from '../../hooks/useApplicationWizard'
import { PERSONAL_LABELS } from './StepPersonalInfo'
import { EMPLOYMENT_LABELS } from './StepEmploymentHistory'
import { EDUCATION_LABELS } from './StepEducation'
import { TRAINING_LABELS } from './StepTraining'
import { WOTC_LABELS } from './StepWotc'
import { WOTC_QUESTIONS } from '../../data/applicationValidation'
import './ApplySteps.css'

function displayValue(value) {
  if (value === true) return 'Yes'
  if (value === false) return 'No'
  if (!value) return '—'
  return value
}

function sectionErrorCount(errors, prefix) {
  return Object.keys(errors).filter((k) => k.startsWith(prefix)).length
}

function Row({ label, fieldId, value, errors, onFix }) {
  const error = errors[fieldId]
  return (
    <div className="review-row">
      <span className="review-row-label">{label}</span>
      {error ? (
        <span className="review-row-val">
          <Badge variant="missing" /> <button type="button" className="review-fix-link" onClick={() => onFix(fieldId)}>Fix</button>
        </span>
      ) : (
        <span className="review-row-val">{displayValue(value)}</span>
      )}
    </div>
  )
}

function SectionHeader({ title, stepIndex, errorCount, onEdit }) {
  return (
    <div className="review-section-header">
      <div className="review-section-title">{title}</div>
      <div className="review-section-actions">
        {errorCount > 0 && <Badge variant="missing">{errorCount} missing</Badge>}
        <button type="button" className="review-fix-link" onClick={() => onEdit(stepIndex)}>Edit</button>
      </div>
    </div>
  )
}

export default function StepReview({ data, errors, onFix, onEditStep }) {
  const { personal, employmentHistory, education, training, wotc } = data

  return (
    <div className="wizard-step">
      <Card>
        <Card.Body>
          <SectionHeader title="Personal Info" stepIndex={0} errorCount={sectionErrorCount(errors, 'personal-')} onEdit={onEditStep} />
          {Object.entries(PERSONAL_LABELS)
            .filter(([key]) => key !== 'requiresSponsorship' || personal.workAuthorized === true)
            .map(([key, label]) => (
              <Row key={key} label={label} fieldId={`personal-${key}`} value={personal[key]} errors={errors} onFix={onFix} />
            ))}
        </Card.Body>
      </Card>

      <Card>
        <Card.Body>
          <SectionHeader title="Employment History" stepIndex={1} errorCount={sectionErrorCount(errors, 'employment-')} onEdit={onEditStep} />
          {errors['employment-section'] && (
            <div className="review-row">
              <span className="review-row-label">{errors['employment-section'].message}</span>
              <Badge variant="missing" />
            </div>
          )}
          {employmentHistory.map((entry, i) => (
            <div key={entry.id}>
              <div className="review-entry-title">{entry.employer || `Employer ${i + 1}`}{entry.jobTitle ? ` — ${entry.jobTitle}` : ''}</div>
              {Object.entries(EMPLOYMENT_LABELS)
                .filter(([key]) => !((key === 'endDate' || key === 'reasonForLeaving') && entry.currentlyWorking))
                .map(([key, label]) => (
                  <Row key={key} label={label} fieldId={`employment-${i}-${key}`} value={entry[key]} errors={errors} onFix={onFix} />
                ))}
            </div>
          ))}
        </Card.Body>
      </Card>

      <Card>
        <Card.Body>
          <SectionHeader title="Education" stepIndex={2} errorCount={sectionErrorCount(errors, 'education-')} onEdit={onEditStep} />
          {errors['education-section'] && (
            <div className="review-row">
              <span className="review-row-label">{errors['education-section'].message}</span>
              <Badge variant="missing" />
            </div>
          )}
          {education.map((entry, i) => (
            <div key={entry.id}>
              <div className="review-entry-title">{entry.schoolName || `School ${i + 1}`}</div>
              {Object.entries(EDUCATION_LABELS)
                .filter(([key]) => !(key === 'graduationDate' && entry.currentlyEnrolled))
                .map(([key, label]) => (
                  <Row key={key} label={label} fieldId={`education-${i}-${key}`} value={entry[key]} errors={errors} onFix={onFix} />
                ))}
            </div>
          ))}
        </Card.Body>
      </Card>

      <Card>
        <Card.Body>
          <SectionHeader title="Training / Certifications" stepIndex={3} errorCount={sectionErrorCount(errors, 'training-')} onEdit={onEditStep} />
          {training.length === 0 && <div className="cp-empty-inline">None provided</div>}
          {training.map((entry, i) => (
            <div key={entry.id}>
              <div className="review-entry-title">{entry.name || `Entry ${i + 1}`}</div>
              {Object.entries(TRAINING_LABELS).map(([key, label]) => (
                <Row key={key} label={label} fieldId={`training-${i}-${key}`} value={entry[key]} errors={errors} onFix={onFix} />
              ))}
            </div>
          ))}
        </Card.Body>
      </Card>

      <Card>
        <Card.Body>
          <SectionHeader title="WOTC Questionnaire" stepIndex={4} errorCount={sectionErrorCount(errors, 'wotc-')} onEdit={onEditStep} />
          {WOTC_QUESTIONS.map((q) => (
            <Row key={q.key} label={q.label} fieldId={`wotc-${q.key}`} value={wotc[q.key]} errors={errors} onFix={onFix} />
          ))}
          <Row label={WOTC_LABELS.consentSignatureName} fieldId="wotc-consentSignatureName" value={wotc.consentSignatureName} errors={errors} onFix={onFix} />
          <Row label={WOTC_LABELS.consentSignatureDate} fieldId="wotc-consentSignatureDate" value={wotc.consentSignatureDate} errors={errors} onFix={onFix} />
          <Row label="Affirmed accurate" fieldId="wotc-consentAffirmed" value={wotc.consentAffirmed} errors={errors} onFix={onFix} />
        </Card.Body>
      </Card>

      <p className="wizard-step-intro">
        {Object.keys(errors).length > 0
          ? `${Object.keys(errors).length} item(s) need attention above before you can submit.`
          : `Everything looks complete across all ${WIZARD_STEPS.length - 1} sections. You're ready to submit.`}
      </p>
    </div>
  )
}
