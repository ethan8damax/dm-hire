import DatePicker from '../../components/ui/DatePicker'
import FormField from '../../components/ui/FormField'
import RepeatableSection from '../../components/ui/RepeatableSection'
import { buildBlankEmploymentEntry } from '../../data/applicationValidation'
import { useFocusJump } from '../../hooks/useFocusJump'
import './ApplySteps.css'

export const EMPLOYMENT_LABELS = {
  employer: 'Employer', jobTitle: 'Job Title', startDate: 'Start Date', endDate: 'End Date',
  reasonForLeaving: 'Reason for Leaving', responsibilities: 'Responsibilities',
}

export default function StepEmploymentHistory({ items, errors, showErrors, onAdd, onRemove, onUpdate, pendingFocusId, clearPendingFocus }) {
  useFocusJump(pendingFocusId, clearPendingFocus)

  function err(index, key) {
    return showErrors ? errors[`employment-${index}-${key}`]?.message : undefined
  }

  return (
    <div className="wizard-step">
      {showErrors && errors['employment-section'] && (
        <div className="wotc-question-error">{errors['employment-section'].message}</div>
      )}
      <RepeatableSection
        items={items}
        minRequired={1}
        addLabel="Add another employer"
        emptyLabel="No employment history added yet"
        onAdd={() => onAdd(buildBlankEmploymentEntry)}
        onRemove={onRemove}
        renderItem={(item, i) => (
          <>
            <div className="wizard-step-grid">
              <FormField id={`employment-${i}-employer`} label="Employer" required error={err(i, 'employer')}>
                <input id={`employment-${i}-employer`} value={item.employer} onChange={(e) => onUpdate(item.id, { employer: e.target.value })} />
              </FormField>
              <FormField id={`employment-${i}-jobTitle`} label="Job Title" required error={err(i, 'jobTitle')}>
                <input id={`employment-${i}-jobTitle`} value={item.jobTitle} onChange={(e) => onUpdate(item.id, { jobTitle: e.target.value })} />
              </FormField>
              <FormField id={`employment-${i}-startDate`} label="Start Date" required error={err(i, 'startDate')}>
                <DatePicker id={`employment-${i}-startDate`} value={item.startDate} onChange={(v) => onUpdate(item.id, { startDate: v })} />
              </FormField>
              {!item.currentlyWorking && (
                <FormField id={`employment-${i}-endDate`} label="End Date" required error={err(i, 'endDate')}>
                  <DatePicker id={`employment-${i}-endDate`} value={item.endDate} onChange={(v) => onUpdate(item.id, { endDate: v })} />
                </FormField>
              )}
            </div>

            <label className="wizard-checkbox-row">
              <input
                type="checkbox"
                checked={item.currentlyWorking}
                onChange={(e) => onUpdate(item.id, { currentlyWorking: e.target.checked, endDate: e.target.checked ? '' : item.endDate })}
              />
              I currently work here
            </label>

            {!item.currentlyWorking && (
              <FormField id={`employment-${i}-reasonForLeaving`} label="Reason for Leaving" required error={err(i, 'reasonForLeaving')}>
                <input id={`employment-${i}-reasonForLeaving`} value={item.reasonForLeaving} onChange={(e) => onUpdate(item.id, { reasonForLeaving: e.target.value })} />
              </FormField>
            )}

            <FormField id={`employment-${i}-responsibilities`} label="Responsibilities" required error={err(i, 'responsibilities')}>
              <textarea id={`employment-${i}-responsibilities`} value={item.responsibilities} onChange={(e) => onUpdate(item.id, { responsibilities: e.target.value })} placeholder="Brief summary of your role" />
            </FormField>
          </>
        )}
      />
    </div>
  )
}
