import { Check } from 'lucide-react'
import './Timeline.css'

// steps: [{ status: 'complete' | 'active' | 'pending', label, date, note }]
export default function Timeline({ steps }) {
  return (
    <div className="timeline">
      {steps.map((step, i) => (
        <div className="timeline-item" key={i}>
          <div className={`timeline-dot td-${step.status}`}>
            {step.status === 'complete' ? <Check size={14} /> : i + 1}
          </div>
          <div className="timeline-content">
            <div className="timeline-label">{step.label}</div>
            {step.date && <div className="timeline-date">{step.date}</div>}
            {step.note && <div className="timeline-note">{step.note}</div>}
          </div>
        </div>
      ))}
    </div>
  )
}
