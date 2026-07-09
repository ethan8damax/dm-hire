import DatePicker from '../../components/ui/DatePicker'
import FormField from '../../components/ui/FormField'
import RepeatableSection from '../../components/ui/RepeatableSection'
import { buildBlankEducationEntry } from '../../data/applicationValidation'
import { useFocusJump } from '../../hooks/useFocusJump'
import './ApplySteps.css'

export const EDUCATION_LABELS = {
  schoolName: 'School Name', degreeLevel: 'Degree / Level', fieldOfStudy: 'Field of Study',
  graduationDate: 'Graduation Date', city: 'City', state: 'State',
}

const DEGREE_OPTIONS = ['High School', 'Associate', "Bachelor's", "Master's", 'Doctorate', 'Certificate', 'Other']

export default function StepEducation({ items, errors, showErrors, onAdd, onRemove, onUpdate, pendingFocusId, clearPendingFocus }) {
  useFocusJump(pendingFocusId, clearPendingFocus)

  function err(index, key) {
    return showErrors ? errors[`education-${index}-${key}`]?.message : undefined
  }

  return (
    <div className="wizard-step">
      {showErrors && errors['education-section'] && (
        <div className="wotc-question-error">{errors['education-section'].message}</div>
      )}
      <RepeatableSection
        items={items}
        minRequired={1}
        addLabel="Add another school"
        emptyLabel="No education added yet"
        onAdd={() => onAdd(buildBlankEducationEntry)}
        onRemove={onRemove}
        renderItem={(item, i) => (
          <>
            <div className="wizard-step-grid">
              <FormField id={`education-${i}-schoolName`} label="School Name" required error={err(i, 'schoolName')}>
                <input id={`education-${i}-schoolName`} value={item.schoolName} onChange={(e) => onUpdate(item.id, { schoolName: e.target.value })} />
              </FormField>
              <FormField id={`education-${i}-degreeLevel`} label="Degree / Level" required error={err(i, 'degreeLevel')}>
                <select id={`education-${i}-degreeLevel`} value={item.degreeLevel} onChange={(e) => onUpdate(item.id, { degreeLevel: e.target.value })}>
                  <option value="">Select…</option>
                  {DEGREE_OPTIONS.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </FormField>
              <FormField id={`education-${i}-fieldOfStudy`} label="Field of Study" required error={err(i, 'fieldOfStudy')}>
                <input id={`education-${i}-fieldOfStudy`} value={item.fieldOfStudy} onChange={(e) => onUpdate(item.id, { fieldOfStudy: e.target.value })} />
              </FormField>
              {!item.currentlyEnrolled && (
                <FormField id={`education-${i}-graduationDate`} label="Graduation Date" required error={err(i, 'graduationDate')}>
                  <DatePicker id={`education-${i}-graduationDate`} value={item.graduationDate} onChange={(v) => onUpdate(item.id, { graduationDate: v })} />
                </FormField>
              )}
              <FormField id={`education-${i}-city`} label="City" required error={err(i, 'city')}>
                <input id={`education-${i}-city`} value={item.city} onChange={(e) => onUpdate(item.id, { city: e.target.value })} />
              </FormField>
              <FormField id={`education-${i}-state`} label="State" required error={err(i, 'state')}>
                <input id={`education-${i}-state`} value={item.state} onChange={(e) => onUpdate(item.id, { state: e.target.value })} />
              </FormField>
            </div>

            <label className="wizard-checkbox-row">
              <input
                type="checkbox"
                checked={item.currentlyEnrolled}
                onChange={(e) => onUpdate(item.id, { currentlyEnrolled: e.target.checked, graduationDate: e.target.checked ? '' : item.graduationDate })}
              />
              I'm currently enrolled here
            </label>
          </>
        )}
      />
    </div>
  )
}
