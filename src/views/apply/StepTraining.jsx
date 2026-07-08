import DatePicker from '../../components/ui/DatePicker'
import FormField from '../../components/ui/FormField'
import RepeatableSection from '../../components/ui/RepeatableSection'
import { buildBlankTrainingEntry } from '../../data/applicationValidation'
import { useFocusJump } from '../../hooks/useFocusJump'
import './ApplySteps.css'

export const TRAINING_LABELS = {
  name: 'Training / Certification Name', provider: 'Provider / Issuer',
  completionDate: 'Completion Date', certNumber: 'Certificate Number', expirationDate: 'Expiration Date',
}

export default function StepTraining({ items, errors, showErrors, onAdd, onRemove, onUpdate, pendingFocusId, clearPendingFocus }) {
  useFocusJump(pendingFocusId, clearPendingFocus)

  function err(index, key) {
    return showErrors ? errors[`training-${index}-${key}`]?.message : undefined
  }

  return (
    <div className="wizard-step">
      <RepeatableSection
        items={items}
        minRequired={0}
        addLabel="Add training / certification"
        emptyLabel="No training or certifications added"
        onAdd={() => onAdd(buildBlankTrainingEntry)}
        onRemove={onRemove}
        renderItem={(item, i) => (
          <div className="wizard-step-grid">
            <FormField id={`training-${i}-name`} label="Training / Certification Name" required error={err(i, 'name')}>
              <input id={`training-${i}-name`} value={item.name} onChange={(e) => onUpdate(item.id, { name: e.target.value })} placeholder="e.g. CPP Certification" />
            </FormField>
            <FormField id={`training-${i}-provider`} label="Provider / Issuer" required error={err(i, 'provider')}>
              <input id={`training-${i}-provider`} value={item.provider} onChange={(e) => onUpdate(item.id, { provider: e.target.value })} placeholder="e.g. APA" />
            </FormField>
            <FormField id={`training-${i}-completionDate`} label="Completion Date" required error={err(i, 'completionDate')}>
              <DatePicker id={`training-${i}-completionDate`} value={item.completionDate} onChange={(v) => onUpdate(item.id, { completionDate: v })} />
            </FormField>
            <FormField id={`training-${i}-certNumber`} label="Certificate Number (optional)">
              <input id={`training-${i}-certNumber`} value={item.certNumber} onChange={(e) => onUpdate(item.id, { certNumber: e.target.value })} />
            </FormField>
            <FormField id={`training-${i}-expirationDate`} label="Expiration Date (optional)">
              <DatePicker id={`training-${i}-expirationDate`} value={item.expirationDate} onChange={(v) => onUpdate(item.id, { expirationDate: v })} />
            </FormField>
          </div>
        )}
      />
    </div>
  )
}
