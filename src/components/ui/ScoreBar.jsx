import './ScoreBar.css'

export default function ScoreBar({ label, value, color = 'var(--color-cyan)', compact = false }) {
  if (compact) {
    return (
      <span className="score-wrap">
        <span className="score-bar">
          <span className="score-fill" style={{ width: `${value}%`, background: color }} />
        </span>
        <span className="score-num">{value}</span>
      </span>
    )
  }

  return (
    <div className="scorebar">
      <div className="scorebar-hdr">
        <span className="scorebar-label">{label}</span>
        <span className="scorebar-val">{value}%</span>
      </div>
      <div className="scorebar-track">
        <div className="scorebar-fill" style={{ width: `${value}%`, background: color }} />
      </div>
    </div>
  )
}
