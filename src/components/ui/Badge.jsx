import './Badge.css'

// candidate stages + job statuses share one visual language
const VARIANT_LABELS = {
  new: 'New',
  screening: 'Screening',
  interviewing: 'Interviewing',
  offer: 'Offer',
  hired: 'Hired',
  rejected: 'Not Selected',
  open: 'Open',
  pending_approval: 'Pending Approval',
  draft: 'Draft',
  closed: 'Closed',
  awaiting: 'Awaiting Response',
  accepted: 'Accepted',
  expired: 'Expired',
  declined: 'Declined',
  connected: 'Connected',
  paused: 'Paused',
  not_connected: 'Not Connected',
}

export default function Badge({ variant, children, className = '' }) {
  return (
    <span className={`badge badge-${variant} ${className}`.trim()}>
      <span className="badge-dot" />
      {children ?? VARIANT_LABELS[variant] ?? variant}
    </span>
  )
}
