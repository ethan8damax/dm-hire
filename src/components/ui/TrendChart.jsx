import { useRef, useState } from 'react'
import './TrendChart.css'

const W = 480
const H = 120
const PAD_X = 8
const PAD_TOP = 16
const PAD_BOTTOM = 24

// data: [{ month, value }] — single series, format(value) for labels/tooltip
export default function TrendChart({ data, color = 'var(--color-green)', format = (v) => v }) {
  const svgRef = useRef(null)
  const [hoverIdx, setHoverIdx] = useState(null)

  const values = data.map((d) => d.value)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const span = max - min || 1
  const plotW = W - PAD_X * 2
  const plotH = H - PAD_TOP - PAD_BOTTOM

  const points = data.map((d, i) => ({
    ...d,
    x: PAD_X + (data.length === 1 ? plotW / 2 : (i / (data.length - 1)) * plotW),
    y: PAD_TOP + plotH - ((d.value - min) / span) * plotH,
  }))

  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ')

  function handleMove(e) {
    const rect = svgRef.current.getBoundingClientRect()
    const relX = ((e.clientX - rect.left) / rect.width) * W
    let nearest = 0
    let nearestDist = Infinity
    points.forEach((p, i) => {
      const dist = Math.abs(p.x - relX)
      if (dist < nearestDist) { nearestDist = dist; nearest = i }
    })
    setHoverIdx(nearest)
  }

  const hovered = hoverIdx != null ? points[hoverIdx] : null

  return (
    <div className="trend-chart">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        className="trend-chart-svg"
        onMouseMove={handleMove}
        onMouseLeave={() => setHoverIdx(null)}
      >
        <line x1={PAD_X} y1={PAD_TOP} x2={W - PAD_X} y2={PAD_TOP} className="trend-gridline" />
        <line x1={PAD_X} y1={PAD_TOP + plotH} x2={W - PAD_X} y2={PAD_TOP + plotH} className="trend-gridline" />

        {hovered && (
          <line x1={hovered.x} y1={PAD_TOP} x2={hovered.x} y2={PAD_TOP + plotH} className="trend-crosshair" />
        )}

        <path d={path} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />

        {points.map((p, i) => {
          const isEnd = i === points.length - 1
          const isHovered = i === hoverIdx
          if (!isEnd && !isHovered) return null
          return (
            <circle key={i} cx={p.x} cy={p.y} r={4} fill={color} stroke="var(--color-white, #fff)" strokeWidth="2" />
          )
        })}

        {/* end-value direct label — the one point the story is about */}
        <text x={points[points.length - 1].x} y={PAD_TOP - 4} textAnchor="end" className="trend-end-label">
          {format(points[points.length - 1].value)}
        </text>

        {points.map((p, i) => (
          <text key={i} x={p.x} y={H - 6} textAnchor="middle" className="trend-month-label">{p.month}</text>
        ))}
      </svg>

      {hovered && (
        <div
          className="trend-tooltip"
          style={{ left: `${(hovered.x / W) * 100}%`, top: `${(hovered.y / H) * 100}%` }}
        >
          <div className="trend-tooltip-value">{format(hovered.value)}</div>
          <div className="trend-tooltip-label">{hovered.month}</div>
        </div>
      )}
    </div>
  )
}
