import DatePicker from '../../components/ui/DatePicker'
import FormField from '../../components/ui/FormField'
import YesNoToggle from '../../components/ui/YesNoToggle'
import { WOTC_QUESTIONS } from '../../data/applicationValidation'
import { useFocusJump } from '../../hooks/useFocusJump'
import './ApplySteps.css'

export const WOTC_LABELS = Object.fromEntries(WOTC_QUESTIONS.map((q) => [q.key, q.label]))
WOTC_LABELS.consentSignatureName = 'Signature'
WOTC_LABELS.consentSignatureDate = 'Date'

export default function StepWotc({ wotc, errors, showErrors, onChange, pendingFocusId, clearPendingFocus }) {
  useFocusJump(pendingFocusId, clearPendingFocus)

  function err(fieldId) {
    return showErrors ? errors[fieldId]?.message : undefined
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
        <div className="wizard-step-grid">
          <FormField id="wotc-consentSignatureName" label="Signature (type your full name)" required error={err('wotc-consentSignatureName')}>
            <input id="wotc-consentSignatureName" value={wotc.consentSignatureName} onChange={(e) => onChange({ consentSignatureName: e.target.value })} />
          </FormField>
          <FormField id="wotc-consentSignatureDate" label="Date" required error={err('wotc-consentSignatureDate')}>
            <DatePicker id="wotc-consentSignatureDate" granularity="day" value={wotc.consentSignatureDate} onChange={(v) => onChange({ consentSignatureDate: v })} />
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
