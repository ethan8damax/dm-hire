import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import './TrendChart.css'

// data: [{ month, value }] — single series, format(value) for labels/tooltip
export default function TrendChart({ data, color = 'var(--color-cyan)', format = (v) => v }) {
  const lastIndex = data.length - 1

  function renderEndDot(props) {
    const { cx, cy, index, key } = props
    if (index !== lastIndex) return null
    return <circle key={key} cx={cx} cy={cy} r={4} fill={color} stroke="var(--color-white, #fff)" strokeWidth={2} />
  }

  // end-value direct label — the one point the story is about
  function renderEndLabel(props) {
    const { x, y, index, key } = props
    if (index !== lastIndex) return null
    return (
      <text key={key} x={x} y={y - 10} textAnchor="end" className="trend-end-label">
        {format(data[lastIndex].value)}
      </text>
    )
  }

  function ChartTooltip({ active, payload }) {
    if (!active || !payload?.length) return null
    const point = payload[0].payload
    return (
      <div className="trend-tooltip-box">
        <div className="trend-tooltip-value">{format(point.value)}</div>
        <div className="trend-tooltip-label">{point.month}</div>
      </div>
    )
  }

  return (
    <div className="trend-chart">
      <ResponsiveContainer width="100%" height={120}>
        <LineChart data={data} margin={{ top: 16, right: 8, bottom: 4, left: 8 }}>
          <CartesianGrid vertical={false} stroke="var(--color-gray-200)" />
          <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: 'var(--color-gray-400)' }} />
          <YAxis hide domain={['dataMin', 'dataMax']} />
          <Tooltip content={<ChartTooltip />} cursor={{ stroke: 'var(--color-gray-300)' }} />
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            dot={renderEndDot}
            label={renderEndLabel}
            activeDot={{ r: 4, fill: color, stroke: 'var(--color-white, #fff)', strokeWidth: 2 }}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
