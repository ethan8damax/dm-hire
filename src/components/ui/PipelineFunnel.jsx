import './PipelineFunnel.css'

// Ordinal ramp (one hue, monotone lightness) — DM's cyan/teal brand family, light to dark.
// Ink flips from maroon to white at the lightness crossover so every segment's
// label clears 4.5:1 contrast (verified by hand: step 3 maroon-on-fill is ~5.4:1,
// step 4 white-on-fill is ~4.9:1 — both sides of the flip have margin, not just passing).
const STEPS = [
  { fill: '#C8ECF1', ink: 'maroon' },
  { fill: '#7DD3E0', ink: 'maroon' },
  { fill: '#52C2D4', ink: 'maroon' },
  { fill: '#1D7E90', ink: 'white' },
  { fill: '#123F52', ink: 'white' },
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
