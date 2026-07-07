import { useNavigate } from 'react-router-dom'
import { Target, Download, ArrowRight } from 'lucide-react'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import { whyDmHireFeatures } from '../data/whyDmHireFeatures'
import './WhyDMHire.css'

const STORY_STAGES = [
  { label: 'ATS', body: 'Source, screen, and interview candidates through a modern, AI-assisted pipeline.' },
  { label: 'Onboarding', body: 'State-specific document packets, background checks, and department notifications kick off automatically.' },
  { label: 'DM Payroll', body: 'The hire syncs straight into payroll — no re-entry, no gap between "hired" and "on payroll."' },
]

export default function WhyDMHire() {
  const navigate = useNavigate()

  return (
    <div className="why-view">
      <div className="page-header why-no-print">
        <div>
          <h1 className="page-title">Why DM Hire</h1>
          <div className="page-subtitle">{whyDmHireFeatures.length} confirmed gaps in the current DM ATS — and exactly how we solve them</div>
        </div>
        <Button variant="primary" onClick={() => window.print()}>
          <Download size={16} /> Export
        </Button>
      </div>

      <div className="why-banner">
        <Target size={32} />
        <div className="why-banner-text">
          <div className="why-banner-title">Every item below traces to Brandon's or Sarah's wishlist</div>
          <div className="why-banner-sub">DM Hire was designed to close all of them while keeping the seamless onboarding → payroll handoff that already works.</div>
        </div>
        <div className="why-banner-count">
          <div className="why-banner-num">{whyDmHireFeatures.length}</div>
          <div className="why-banner-label">Gaps Closed</div>
        </div>
      </div>

      <div className="why-story">
        {STORY_STAGES.map((stage, i) => (
          <div className="why-story-stage" key={stage.label}>
            <div className="why-story-num">{i + 1}</div>
            <div className="why-story-label">{stage.label}</div>
            <div className="why-story-body">{stage.body}</div>
            {i < STORY_STAGES.length - 1 && <ArrowRight size={16} className="why-story-arrow" />}
          </div>
        ))}
      </div>

      <div className="why-grid">
        {whyDmHireFeatures.map((f) => (
          <Card key={f.title} className="why-card">
            <div className="why-card-hdr">
              <span className="why-card-icon">{f.icon}</span>
              <div>
                <div className="why-card-title">{f.title}</div>
                <div className="why-card-context">{f.context}</div>
              </div>
              <span className="why-gap-badge">Gap Today</span>
            </div>
            <div className="why-card-body">
              <div className="why-pain">
                <div className="why-pain-label">Current DM ATS</div>
                <div className="why-pain-text">{f.pain}</div>
              </div>
              <div className="why-solution">
                <div className="why-solution-label">DM Hire</div>
                <div className="why-solution-text">{f.solution}</div>
              </div>
            </div>
            <button type="button" className="why-action why-no-print" onClick={() => navigate(f.route)}>
              ✦ See it in action → {f.action}
            </button>
          </Card>
        ))}
      </div>
    </div>
  )
}
