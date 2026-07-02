import { TrendingUp, TrendingDown } from 'lucide-react'
import './MetricCard.css'

export default function MetricCard({ icon: Icon, iconColor = 'navy', label, value, change }) {
  return (
    <div className="metric-card">
      {Icon && (
        <div className={`metric-icon ${iconColor}`}>
          <Icon size={20} />
        </div>
      )}
      <div className="metric-label">{label}</div>
      <div className="metric-value">{value}</div>
      {change != null && (
        <div className={`metric-change ${change >= 0 ? 'up' : 'down'}`}>
          {change >= 0 ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
          {Math.abs(change)}% vs last period
        </div>
      )}
    </div>
  )
}
