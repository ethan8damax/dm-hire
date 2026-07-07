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
import { offers } from '../data/offers'
import { candidates } from '../data/candidates'
import { jobs } from '../data/jobs'
import './Offers.css'

const TODAY = '2026-07-07'

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

  const rows = offers.map((o) => ({
    ...o,
    candidateName: candidates.find((c) => c.id === o.candidateId)?.name ?? 'Unknown',
    jobTitle: jobs.find((j) => j.id === o.jobId)?.title ?? '-',
    daysLeft: daysUntil(o.expiryDate),
  }))

  const expiringOffers = rows.filter((o) => o.status === 'awaiting' && o.daysLeft >= 0 && o.daysLeft <= 5)
  const filteredRows = filter === 'all' ? rows : rows.filter((o) => o.status === filter)

  function handleSendReminders() {
    setReminderPhase('sending')
    setTimeout(() => setReminderPhase('sent'), 900)
    setTimeout(() => setReminderPhase('idle'), 2600)
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
    </div>
  )
}
