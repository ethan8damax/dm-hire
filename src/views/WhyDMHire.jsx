import { useNavigate } from 'react-router-dom'
import {
  Target, Download, ArrowRight,
  Share2, Link2, Bell, BarChart3, LayoutTemplate, Users, History, StickyNote,
  FileSignature, MessageSquare, Package, CheckCircle2, Copy, ArrowLeftRight, Sparkles,
  Building2, Lock, Mail, CalendarClock, ShieldAlert, ClipboardList, Smartphone, Landmark,
  ShieldCheck, TrendingUp, Cog, Brain,
} from 'lucide-react'
import Button from '../components/ui/Button'
import { useWhyDmHireFeatures } from '../hooks/useWhyDmHireFeatures'
import Loading from '../components/ui/Loading'
import WhyFeatureCard from '../components/why/WhyFeatureCard'
import './WhyDMHire.css'

const ICON_MAP = {
  boards: Share2,
  payroll: Link2,
  notifications: Bell,
  sourceTracking: BarChart3,
  templates: LayoutTemplate,
  linkedin: Users,
  history: History,
  notes: StickyNote,
  esign: FileSignature,
  sms: MessageSquare,
  onboarding: Package,
  approvals: CheckCircle2,
  duplicates: Copy,
  navigation: ArrowLeftRight,
  aiScore: Sparkles,
  offices: Building2,
  hiringManager: Lock,
  outlook: Mail,
  scheduler: CalendarClock,
  knockout: ShieldAlert,
  scorecards: ClipboardList,
  portal: Smartphone,
  internalJobs: Landmark,
  backgroundCheck: ShieldCheck,
  analytics: TrendingUp,
  workflows: Cog,
  assessments: Brain,
  jobBoardPerf: Target,
}

const STORY_STAGES = [
  { label: 'ATS', body: 'Source, screen, and interview candidates through a modern, AI-assisted pipeline.' },
  { label: 'Onboarding', body: 'State-specific document packets, background checks, and department notifications kick off automatically.' },
  { label: 'DM Payroll', body: 'The hire syncs straight into payroll with no re-entry and no gap between "hired" and "on payroll."' },
]

export default function WhyDMHire() {
  const navigate = useNavigate()
  const { whyDmHireFeatures, loading } = useWhyDmHireFeatures()

  if (loading) return <Loading />

  return (
    <div className="why-view">
      <div className="page-header why-no-print">
        <div>
          <h1 className="page-title">Why DM Hire</h1>
          <div className="page-subtitle">{whyDmHireFeatures.length} confirmed gaps in the current DM ATS, and exactly how we solve them</div>
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
          <WhyFeatureCard
            key={f.title}
            feature={f}
            icon={ICON_MAP[f.icon]}
            onNavigate={() => navigate(f.route)}
          />
        ))}
      </div>
    </div>
  )
}
