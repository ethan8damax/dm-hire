import { useNavigate } from 'react-router-dom'
import {
  Briefcase, Users, Clock, CheckCircle2, AlertTriangle,
  CalendarClock, FileWarning, UserCheck, Wallet, ArrowRight,
} from 'lucide-react'
import Card from '../components/ui/Card'
import MetricCard from '../components/ui/MetricCard'
import Badge from '../components/ui/Badge'
import Avatar from '../components/ui/Avatar'
import ScoreBar from '../components/ui/ScoreBar'
import Button from '../components/ui/Button'
import DataTable from '../components/ui/DataTable'
import PipelineFunnel from '../components/ui/PipelineFunnel'
import { candidates } from '../data/candidates'
import { jobs } from '../data/jobs'
import { offers } from '../data/offers'
import { analytics } from '../data/analytics'
import './Dashboard.css'

function daysUntil(dateStr) {
  const ms = new Date(dateStr) - new Date()
  return Math.ceil(ms / (1000 * 60 * 60 * 24))
}

function greetingForHour(hour) {
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

export default function Dashboard() {
  const navigate = useNavigate()

  const openRequisitions = jobs.filter((j) => j.status === 'open').length
  const activeCandidates = candidates.filter((c) => !['hired', 'rejected'].includes(c.stage)).length

  const funnelStages = [
    { label: 'New', count: jobs.reduce((sum, j) => sum + j.stageCounts.new, 0) },
    { label: 'Screening', count: jobs.reduce((sum, j) => sum + j.stageCounts.screening, 0) },
    { label: 'Interview', count: jobs.reduce((sum, j) => sum + j.stageCounts.interviewing, 0) },
    { label: 'Offer', count: jobs.reduce((sum, j) => sum + j.stageCounts.offer, 0) },
    { label: 'Hired', count: jobs.reduce((sum, j) => sum + j.stageCounts.hired, 0) },
  ]

  const expiringOffers = offers
    .filter((o) => o.status === 'awaiting')
    .map((o) => ({ ...o, daysLeft: daysUntil(o.expiryDate) }))
    .filter((o) => o.daysLeft <= 5)

  const pendingApprovalJobs = jobs.filter((j) => j.status === 'pending_approval')
  const staleCandidates = candidates.filter((c) => c.isStale)

  const pendingActionCount = expiringOffers.length + pendingApprovalJobs.length + staleCandidates.length

  const pendingSync = offers.filter((o) => o.status === 'accepted' && !o.payrollSynced)
  const syncedOffers = offers.filter((o) => o.payrollSynced)
  const mostRecentSync = syncedOffers[syncedOffers.length - 1]

  const now = new Date()
  const dateLabel = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-greeting">{greetingForHour(now.getHours())}, T. Smith 👋</h1>
          <div className="dashboard-subtitle">
            {dateLabel} · {pendingActionCount} action{pendingActionCount === 1 ? '' : 's'} need your attention today
          </div>
        </div>
      </div>

      {expiringOffers.length > 0 && (
        <div className="notif-strip">
          <AlertTriangle size={16} />
          <span>
            <strong>{expiringOffers.length} offer{expiringOffers.length === 1 ? '' : 's'} expiring soon</strong>
            {' — '}
            {expiringOffers.map((o) => candidates.find((c) => c.id === o.candidateId)?.name).filter(Boolean).join(', ')} {expiringOffers.length === 1 ? "hasn't" : "haven't"} responded yet.
            {' '}
            <button type="button" className="notif-link" onClick={() => navigate('/offers')}>Send reminders →</button>
          </span>
        </div>
      )}

      <div className="metric-grid">
        <MetricCard icon={Briefcase} iconColor="navy" label="Open Requisitions" value={openRequisitions} />
        <MetricCard icon={Users} iconColor="green" label="Active Candidates" value={activeCandidates} />
        <MetricCard icon={Clock} iconColor="orange" label="Avg. Days to Fill" value={analytics.timeToFill.avg} />
        <MetricCard icon={CheckCircle2} iconColor="blue" label="Offer Acceptance Rate" value={`${Math.round(analytics.offerAcceptanceRate.overall * 100)}%`} />
      </div>

      <div className="dashboard-grid">
        <Card>
          <Card.Header>
            <Card.Title>Candidate Pipeline — All Jobs</Card.Title>
            <Button variant="ghost" size="sm" onClick={() => navigate('/pipeline')}>
              View Board <ArrowRight size={14} />
            </Button>
          </Card.Header>
          <Card.Body>
            <PipelineFunnel stages={funnelStages} />
            <DataTable
              keyField="id"
              onRowClick={(row) => navigate(`/candidates/${row.id}`)}
              rows={candidates}
              columns={[
                {
                  key: 'name',
                  label: 'Candidate',
                  render: (row) => (
                    <div className="cand-cell">
                      <Avatar initials={row.initials} color={row.avatarColor} size="sm" />
                      <span className="cand-cell-name">{row.name}</span>
                    </div>
                  ),
                },
                { key: 'currentRole', label: 'Role' },
                { key: 'stage', label: 'Stage', render: (row) => <Badge variant={row.stage} /> },
                { key: 'daysInStage', label: 'Days', sortable: true },
                { key: 'aiScore', label: 'Score', sortable: true, render: (row) => <ScoreBar value={row.aiScore} compact /> },
              ]}
            />
          </Card.Body>
        </Card>

        <div className="dashboard-side">
          <Card>
            <Card.Header>
              <Card.Title>Action Items</Card.Title>
              <Badge variant="screening">{pendingActionCount} pending</Badge>
            </Card.Header>
            <Card.Body className="action-items" style={{ padding: 'var(--space-3) var(--space-5)' }}>
              {expiringOffers.map((o) => {
                const cand = candidates.find((c) => c.id === o.candidateId)
                return (
                  <div className="action-item" key={o.id}>
                    <FileWarning size={16} className="action-item-icon warn" />
                    <div className="action-item-body">
                      <div className="action-item-title">{cand?.name} — Offer Expiring</div>
                      <div className="action-item-sub warn">Expires in {o.daysLeft} day{o.daysLeft === 1 ? '' : 's'} · No response</div>
                    </div>
                    <Button size="sm" variant="ghost" onClick={() => navigate('/offers')}>Nudge</Button>
                  </div>
                )
              })}
              {pendingApprovalJobs.map((j) => (
                <div className="action-item" key={j.id}>
                  <CalendarClock size={16} className="action-item-icon" />
                  <div className="action-item-body">
                    <div className="action-item-title">Hiring approval pending</div>
                    <div className="action-item-sub">{j.title} req · {j.daysOpen} days waiting</div>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => navigate('/jobs')}>Chase</Button>
                </div>
              ))}
              {staleCandidates.map((c) => (
                <div className="action-item" key={c.id}>
                  <UserCheck size={16} className="action-item-icon" />
                  <div className="action-item-body">
                    <div className="action-item-title">{c.name} needs review</div>
                    <div className="action-item-sub">No update in {c.daysInStage}+ days</div>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => navigate(`/candidates/${c.id}`)}>Review</Button>
                </div>
              ))}
              {pendingActionCount === 0 && <div className="action-item-empty">All caught up.</div>}
            </Card.Body>
          </Card>

          <Card>
            <Card.Header>
              <Card.Title>DM Payroll Integration</Card.Title>
              <Badge variant="open">Connected</Badge>
            </Card.Header>
            <Card.Body className="payroll-card">
              {pendingSync.length > 0 ? (
                <div className="payroll-ready">
                  <Wallet size={24} />
                  <div>
                    <div className="payroll-ready-title">{pendingSync.length} New Hire{pendingSync.length === 1 ? '' : 's'} Ready</div>
                    <div className="payroll-ready-sub">Data queued for DM Payroll handoff</div>
                  </div>
                  <Button
                    size="sm"
                    className="payroll-sync-btn"
                    style={{ background: 'white', color: 'var(--color-green-dark)' }}
                  >
                    Sync
                  </Button>
                </div>
              ) : (
                <div className="payroll-synced-note">
                  ✓ All accepted offers synced.
                  {mostRecentSync && (
                    <> Last: {candidates.find((c) => c.id === mostRecentSync.candidateId)?.name} on {mostRecentSync.esigSignedDate}.</>
                  )}
                </div>
              )}
            </Card.Body>
          </Card>
        </div>
      </div>
    </div>
  )
}
