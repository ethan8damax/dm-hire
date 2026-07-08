import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertTriangle, Loader2, CheckCircle2 } from 'lucide-react'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import FilterChip from '../components/ui/FilterChip'
import DataTable from '../components/ui/DataTable'
import EmptyState from '../components/ui/EmptyState'
import { useSimulatedLoad } from '../hooks/useSimulatedLoad'
import { useOffers } from '../hooks/useOffers'
import { useCandidates } from '../hooks/useCandidates'
import { useJobs } from '../hooks/useJobs'
import { useReminders } from '../hooks/useReminders'
import Loading from '../components/ui/Loading'
import './Offers.css'

const TODAY = '2026-07-07'
const CURRENT_RECRUITER = 'T. Smith'

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'awaiting', label: 'Awaiting Response' },
  { key: 'accepted', label: 'Accepted' },
  { key: 'declined', label: 'Declined' },
  { key: 'expired', label: 'Expired' },
]

function daysUntil(dateStr) {
  const ms = new Date(dateStr) - new Date(TODAY)
  return Math.ceil(ms / (1000 * 60 * 60 * 24))
}

export default function Offers() {
  const navigate = useNavigate()
  const [filter, setFilter] = useState('all')
  const [reminderPhase, setReminderPhase] = useState('idle') // idle | sending | sent
  const loading = useSimulatedLoad()
  const { offers, loading: offersLoading } = useOffers()
  const { candidates, loading: candidatesLoading } = useCandidates()
  const { jobs, loading: jobsLoading } = useJobs()
  const { reminders, loading: remindersLoading, sendReminder } = useReminders()

  if (offersLoading || candidatesLoading || jobsLoading || remindersLoading) return <Loading />

  const rows = offers.map((o) => ({
    ...o,
    candidateName: candidates.find((c) => c.id === o.candidateId)?.name ?? 'Unknown',
    jobTitle: jobs.find((j) => j.id === o.jobId)?.title ?? '-',
    daysLeft: daysUntil(o.expiryDate),
  }))

  const expiringOffers = rows.filter((o) => o.status === 'awaiting' && o.daysLeft >= 0 && o.daysLeft <= 5)
  const filteredRows = filter === 'all' ? rows : rows.filter((o) => o.status === filter)

  async function handleSendReminders() {
    setReminderPhase('sending')
    await Promise.all(expiringOffers.map((o) => sendReminder({
      candidateId: o.candidateId,
      offerId: o.id,
      type: 'expiry_reminder',
      sentBy: CURRENT_RECRUITER,
      message: `Reminder sent — offer expires ${o.expiryDate}`,
    })))
    setReminderPhase('sent')
    setTimeout(() => setReminderPhase('idle'), 1700)
  }

  function openOffer(row) {
    navigate(`/candidates/${row.candidateId}`, { state: { tab: 'offer' } })
  }

  const columns = [
    {
      key: 'candidateName', label: 'Candidate', sortable: true,
      render: (r) => (
        <div>
          <div className="offer-candidate-name">{r.candidateName}</div>
          <div className="offer-candidate-role">{r.jobTitle}</div>
        </div>
      ),
    },
    { key: 'salary', label: 'Salary', sortable: true, render: (r) => `$${r.salary.toLocaleString()}` },
    { key: 'sentDate', label: 'Sent', sortable: true, render: (r) => r.sentDate ?? '-' },
    {
      key: 'expiryDate', label: 'Expires', sortable: true,
      render: (r) => {
        if (r.status !== 'awaiting') return r.expiryDate ?? '-'
        return (
          <span className={r.daysLeft <= 2 ? 'offer-expiry-urgent' : ''}>
            {r.expiryDate} ({r.daysLeft >= 0 ? `${r.daysLeft}d left` : 'overdue'})
          </span>
        )
      },
    },
    { key: 'status', label: 'Status', sortable: true, render: (r) => <Badge variant={r.status} /> },
    {
      key: 'payrollSynced', label: 'DM Payroll',
      render: (r) => r.payrollSynced && (
        <span className="offer-synced-badge"><CheckCircle2 size={12} /> Synced</span>
      ),
    },
  ]

  const reminderRows = [...reminders]
    .sort((a, b) => new Date(b.sentAt) - new Date(a.sentAt))
    .map((r) => ({ ...r, candidateName: candidates.find((c) => c.id === r.candidateId)?.name ?? 'Unknown' }))

  const reminderColumns = [
    { key: 'candidateName', label: 'Candidate' },
    { key: 'type', label: 'Type' },
    { key: 'sentAt', label: 'Sent', render: (r) => new Date(r.sentAt).toLocaleString() },
    { key: 'sentBy', label: 'Sent By' },
    { key: 'message', label: 'Message' },
  ]

  return (
    <div className="offers-view">
      <div className="page-header">
        <div>
          <h1 className="page-title">Offers</h1>
          <div className="page-subtitle">{rows.length} offer{rows.length === 1 ? '' : 's'} · {expiringOffers.length} expiring soon</div>
        </div>
      </div>

      {expiringOffers.length > 0 && (
        <div className="notif-strip offer-notif-strip" data-tour="tour-offers-notif">
          <AlertTriangle size={16} />
          <span>
            <strong>{expiringOffers.length} offer{expiringOffers.length === 1 ? '' : 's'} expiring soon.</strong>
            {' '}
            {expiringOffers.map((o) => o.candidateName).join(', ')} {expiringOffers.length === 1 ? "hasn't" : "haven't"} responded yet.
          </span>
          <Button variant="ghost" size="sm" disabled={reminderPhase !== 'idle'} onClick={handleSendReminders}>
            {reminderPhase === 'sending' && <Loader2 size={14} className="offer-spin" />}
            {reminderPhase === 'sent' && <CheckCircle2 size={14} />}
            {reminderPhase === 'sending' ? 'Sending…' : reminderPhase === 'sent' ? 'Reminders sent' : `Send Reminders (${expiringOffers.length})`}
          </Button>
        </div>
      )}

      <div className="filter-strip">
        {FILTERS.map((f) => (
          <FilterChip key={f.key} active={filter === f.key} onClick={() => setFilter(f.key)}>{f.label}</FilterChip>
        ))}
      </div>

      {filteredRows.length === 0 ? (
        <EmptyState title="No offers" subtitle="No offers match this filter." />
      ) : (
        <Card data-tour="tour-offers-list">
          <DataTable columns={columns} rows={filteredRows} onRowClick={openOffer} loading={loading} />
        </Card>
      )}

      <div className="page-header">
        <h2 className="offers-log-title">Reminders Log</h2>
      </div>

      {reminderRows.length === 0 ? (
        <EmptyState title="No reminders sent yet" subtitle="Send a reminder from an expiring offer above and it'll show up here." />
      ) : (
        <Card>
          <DataTable columns={reminderColumns} rows={reminderRows} />
        </Card>
      )}
    </div>
  )
}
