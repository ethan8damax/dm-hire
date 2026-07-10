import { useState } from 'react'
import { DocusealForm } from '@docuseal/react'
import { Loader2 } from 'lucide-react'
import FormField from '../../components/ui/FormField'
import Button from '../../components/ui/Button'
import YesNoToggle from '../../components/ui/YesNoToggle'
import { WOTC_QUESTIONS } from '../../data/applicationValidation'
import { useFocusJump } from '../../hooks/useFocusJump'
import { createDocusealSubmission, buildWotcConsentHtml } from '../../lib/docuseal'
import './ApplySteps.css'

export const WOTC_LABELS = Object.fromEntries(WOTC_QUESTIONS.map((q) => [q.key, q.label]))
WOTC_LABELS.consentSignatureName = 'Signature'
WOTC_LABELS.consentSignatureDate = 'Date'

function today() {
  return new Date().toISOString().slice(0, 10)
}

export default function StepWotc({ wotc, personal, errors, showErrors, onChange, pendingFocusId, clearPendingFocus }) {
  useFocusJump(pendingFocusId, clearPendingFocus)
  const [preparingSignature, setPreparingSignature] = useState(false)

  function err(fieldId) {
    return showErrors ? errors[fieldId]?.message : undefined
  }

  async function handleStartSigning() {
    setPreparingSignature(true)
    try {
      const slug = await createDocusealSubmission({
        documentTitle: `WOTC Consent — ${personal.name}`,
        html: buildWotcConsentHtml({ candidateName: personal.name }),
        submitterName: personal.name,
        submitterEmail: personal.email,
      })
      onChange({ docusealSlug: slug })
    } finally {
      setPreparingSignature(false)
    }
  }

  function handleSigningComplete() {
    onChange({ consentSignatureName: personal.name, consentSignatureDate: today() })
  }

  return (
    <div className="wizard-step">
      <p className="wotc-intro">
        The Work Opportunity Tax Credit (WOTC) is a federal tax credit available to employers who hire
        individuals from certain target groups. Answering these questions is voluntary and has no effect
        on our hiring decision — every question below just needs a response, "No" is a complete answer.
      </p>

      <div>
        {WOTC_QUESTIONS.map((q) => {
          const fieldId = `wotc-${q.key}`
          return (
            <div className="wotc-question" key={q.key}>
              <div>
                <div className="wotc-question-label">{q.label}</div>
                {err(fieldId) && <div className="wotc-question-error">{err(fieldId)}</div>}
              </div>
              <YesNoToggle id={fieldId} value={wotc[q.key]} onChange={(v) => onChange({ [q.key]: v })} />
            </div>
          )
        })}
      </div>

      <div className="wotc-consent">
        <div id="wotc-consentSignatureName" className="wotc-esig-section">
          <FormField label="Signature" required error={err('wotc-consentSignatureName') || err('wotc-consentSignatureDate')}>
            {wotc.consentSignatureDate ? (
              <div className="wotc-esig-signed">Signed as {wotc.consentSignatureName} on {wotc.consentSignatureDate}</div>
            ) : wotc.docusealSlug ? (
              <div className="wotc-esig-embed">
                <DocusealForm
                  src={`https://docuseal.com/s/${wotc.docusealSlug}`}
                  email={personal.email}
                  onComplete={handleSigningComplete}
                />
              </div>
            ) : (
              <Button type="button" variant="primary" disabled={preparingSignature} onClick={handleStartSigning}>
                {preparingSignature && <Loader2 size={14} className="wotc-esig-spin" />}
                {preparingSignature ? 'Preparing document…' : 'Sign Consent Form'}
              </Button>
            )}
          </FormField>
        </div>
        <label className="wotc-affirm-row" id="wotc-consentAffirmed">
          <input
            type="checkbox"
            checked={wotc.consentAffirmed}
            onChange={(e) => onChange({ consentAffirmed: e.target.checked })}
          />
          I affirm the information provided above is accurate to the best of my knowledge.
        </label>
        {err('wotc-consentAffirmed') && <div className="wotc-question-error">{err('wotc-consentAffirmed')}</div>}
      </div>
    </div>
  )
}
