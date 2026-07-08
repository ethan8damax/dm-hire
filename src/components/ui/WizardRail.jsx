import { AlertCircle, Check } from 'lucide-react'
import './WizardRail.css'

// Horizontal clickable step rail for the application wizard. Visually echoes
// Timeline's dot styling, but (unlike Timeline) supports click-to-jump and an
// invalid-step indicator, which the wizard's review-flagging flow needs.
export default function WizardRail({ steps, currentIndex, visitedSteps, stepHasError, onStepClick }) {
  return (
    <nav className="wizard-rail" aria-label="Application steps">
      {steps.map((step, i) => {
        const status = i === currentIndex ? 'active' : i < currentIndex ? 'complete' : 'pending'
        const invalid = stepHasError(i) && visitedSteps.has(i) && i !== currentIndex
        return (
          <button
            key={step.key}
            type="button"
            className={`wizard-rail-step wr-${status}${invalid ? ' wr-invalid' : ''}`}
            onClick={() => onStepClick(i)}
            aria-current={i === currentIndex ? 'step' : undefined}
          >
            <span className="wizard-rail-dot">
              {invalid ? <AlertCircle size={14} /> : status === 'complete' ? <Check size={14} /> : i + 1}
            </span>
            <span className="wizard-rail-label">{step.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
