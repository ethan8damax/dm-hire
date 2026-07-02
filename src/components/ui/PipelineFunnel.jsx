import './PipelineFunnel.css'

// Ordinal ramp (one hue, monotone lightness) — validated with the dataviz skill's
// validate_palette.js --ordinal check. Ink flips from navy to white at the
// lightness crossover so every segment's label clears 4.5:1 contrast.
const STEPS = [
  { fill: '#7EC452', ink: 'navy' },
  { fill: '#61A630', ink: 'navy' },
  { fill: '#418500', ink: 'white' },
  { fill: '#206400', ink: 'white' },
  { fill: '#004700', ink: 'white' },
]

// stages: [{ label, count }] in funnel order, New -> Hired (max 5)
export default function PipelineFunnel({ stages }) {
  return (
    <div className="pipeline-funnel">
      {stages.map((stage, i) => {
        const step = STEPS[i] ?? STEPS[STEPS.length - 1]
        return (
          <div
            className="funnel-stage"
            key={stage.label}
            title={`${stage.label}: ${stage.count}`}
          >
            <div
              className={`funnel-stage-inner ink-${step.ink}`}
              style={{
                background: step.fill,
                borderRadius: i === 0 ? '8px 0 0 8px' : i === stages.length - 1 ? '0 8px 8px 0' : 0,
              }}
            >
              <div className="funnel-count">{stage.count}</div>
              <div className="funnel-label">{stage.label}</div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
