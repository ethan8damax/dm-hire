import { FileWarning, Loader2, Sparkles, Upload } from 'lucide-react'
import FormField from '../../components/ui/FormField'
import YesNoToggle from '../../components/ui/YesNoToggle'
import { useFocusJump } from '../../hooks/useFocusJump'
import './ApplySteps.css'

export const PERSONAL_LABELS = {
  name: 'Full Name', email: 'Email', phone: 'Phone',
  street: 'Street Address', city: 'City', state: 'State', zip: 'ZIP Code',
  currentRole: 'Current Role', expectedSalary: 'Expected Salary', availability: 'Availability',
  workAuthorized: 'Legally authorized to work in the U.S.?', requiresSponsorship: 'Will you require visa sponsorship?',
  linkedin: 'LinkedIn', skills: 'Top Skills', resumeFileName: 'Resume',
}

// Resume upload/parsing is orchestrated by the parent (ApplyWizard) — a parsed
// resume can populate Employment History, Education, and Training too, not
// just this step's own fields, so that logic lives where all sections are
// reachable. This component just renders the file input and reports the
// parent-supplied parseState.
export default function StepPersonalInfo({ personal, errors, showErrors, onChange, parseState, onResumeFileChange, pendingFocusId, clearPendingFocus }) {
  useFocusJump(pendingFocusId, clearPendingFocus)

  function err(key) {
    return showErrors ? errors[`personal-${key}`]?.message : undefined
  }

  function set(key, value) {
    onChange({ [key]: value })
  }

  return (
    <div className="wizard-step">
      <FormField id="personal-resumeFileName" label="Resume" required error={err('resumeFileName')} hint="PDF, DOC, DOCX, or TXT. Uploading auto-fills matching fields below.">
        <label className="wizard-upload">
          <Upload size={14} />
          {personal.resumeFileName || 'Choose a file to upload'}
          <input id="personal-resumeFileName" type="file" className="wizard-upload-input" onChange={onResumeFileChange} accept=".pdf,.doc,.docx,.txt" />
        </label>
      </FormField>
      {parseState.phase === 'parsing' && (
        <div className="wizard-parse-status wizard-parse-loading"><Loader2 size={14} className="apply-spin" /> Parsing resume…</div>
      )}
      {parseState.phase === 'done' && (
        <div className="wizard-parse-status wizard-parse-success"><Sparkles size={14} /> {parseState.message}</div>
      )}
      {parseState.phase === 'error' && (
        <div className="wizard-parse-status wizard-parse-error"><FileWarning size={14} /> {parseState.message}</div>
      )}

      <div className="wizard-step-grid">
        <FormField id="personal-name" label="Full Name" required error={err('name')}>
          <input id="personal-name" value={personal.name} onChange={(e) => set('name', e.target.value)} />
        </FormField>
        <FormField id="personal-email" label="Email" required error={err('email')}>
          <input id="personal-email" type="email" value={personal.email} onChange={(e) => set('email', e.target.value)} />
        </FormField>
        <FormField id="personal-phone" label="Phone" required error={err('phone')}>
          <input id="personal-phone" type="tel" value={personal.phone} onChange={(e) => set('phone', e.target.value)} />
        </FormField>
        <FormField id="personal-street" label="Street Address" required error={err('street')}>
          <input id="personal-street" value={personal.street} onChange={(e) => set('street', e.target.value)} />
        </FormField>
        <FormField id="personal-city" label="City" required error={err('city')}>
          <input id="personal-city" value={personal.city} onChange={(e) => set('city', e.target.value)} />
        </FormField>
        <FormField id="personal-state" label="State" required error={err('state')}>
          <input id="personal-state" value={personal.state} onChange={(e) => set('state', e.target.value)} placeholder="e.g. MI" />
        </FormField>
        <FormField id="personal-zip" label="ZIP Code" required error={err('zip')}>
          <input id="personal-zip" value={personal.zip} onChange={(e) => set('zip', e.target.value)} />
        </FormField>
        <FormField id="personal-currentRole" label="Current Role" required error={err('currentRole')}>
          <input id="personal-currentRole" value={personal.currentRole} onChange={(e) => set('currentRole', e.target.value)} placeholder="e.g. Payroll Analyst · ADP" />
        </FormField>
        <FormField id="personal-expectedSalary" label="Expected Salary" required error={err('expectedSalary')}>
          <input id="personal-expectedSalary" value={personal.expectedSalary} onChange={(e) => set('expectedSalary', e.target.value)} placeholder="e.g. $80K–$90K" />
        </FormField>
        <FormField id="personal-availability" label="Availability" required error={err('availability')}>
          <input id="personal-availability" value={personal.availability} onChange={(e) => set('availability', e.target.value)} placeholder="e.g. 2 weeks notice" />
        </FormField>
        <FormField id="personal-linkedin" label="LinkedIn (optional)">
          <input id="personal-linkedin" value={personal.linkedin} onChange={(e) => set('linkedin', e.target.value)} placeholder="linkedin.com/in/…" />
        </FormField>
      </div>

      <div className="wizard-step-grid">
        <FormField id="personal-workAuthorized" label="Legally authorized to work in the U.S.?" required error={err('workAuthorized')}>
          <YesNoToggle id="personal-workAuthorized" value={personal.workAuthorized} onChange={(v) => set('workAuthorized', v)} />
        </FormField>
        {personal.workAuthorized === true && (
          <FormField id="personal-requiresSponsorship" label="Will you require visa sponsorship?" required error={err('requiresSponsorship')}>
            <YesNoToggle id="personal-requiresSponsorship" value={personal.requiresSponsorship} onChange={(v) => set('requiresSponsorship', v)} />
          </FormField>
        )}
      </div>

      <FormField id="personal-skills" label="Top Skills (comma-separated, optional)">
        <input id="personal-skills" value={personal.skills} onChange={(e) => set('skills', e.target.value)} placeholder="e.g. ADP Workforce Now, CPP Certified" />
      </FormField>
    </div>
  )
}
