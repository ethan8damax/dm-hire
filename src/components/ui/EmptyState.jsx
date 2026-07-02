import Button from './Button'
import './EmptyState.css'

export default function EmptyState({ icon: Icon, title, subtitle, ctaLabel, onCta }) {
  return (
    <div className="empty-state">
      {Icon && <Icon className="empty-icon" size={40} strokeWidth={1.5} />}
      <div className="empty-title">{title}</div>
      {subtitle && <div className="empty-subtitle">{subtitle}</div>}
      {ctaLabel && (
        <Button variant="outline" size="sm" className="empty-cta" onClick={onCta}>
          {ctaLabel}
        </Button>
      )}
    </div>
  )
}
