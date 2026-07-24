import { ArrowDown, Play } from 'lucide-react'
import Card from '../ui/Card'

export default function WhyFeatureCard({ feature, icon: Icon, onNavigate }) {
  return (
    <Card className="why-card">
      <div className="why-card-hdr">
        <span className="why-card-icon"><Icon size={20} /></span>
        <div>
          <div className="why-card-title">{feature.title}</div>
          <div className="why-card-context">{feature.context}</div>
        </div>
        <span className="why-gap-badge">Gap Today</span>
      </div>
      <div className="why-card-content">
        <div className="why-card-body">
          <div className="why-pain">
            <div className="why-pain-label">Current DM ATS</div>
            <div className="why-pain-text">{feature.pain}</div>
          </div>
          <ArrowDown size={14} className="why-transform-arrow" />
          <div className="why-solution">
            <div className="why-solution-label">DM Hire</div>
            <div className="why-solution-text">{feature.solution}</div>
          </div>
        </div>
        <button type="button" className="why-action why-no-print" onClick={onNavigate}>
          <Play size={12} /> See it in action: {feature.action}
        </button>
      </div>
    </Card>
  )
}
