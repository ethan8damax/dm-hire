import './PipelineFunnel.css'

// Ordinal ramp (one hue, monotone lightness) — DM's cyan/teal brand family, light to dark.
// Re-verified with the dataviz skill's validate_palette.js --ordinal check after
// the original light-end (#C8ECF1) measured only 1.22:1 against the white card
// surface (below the 2:1 floor) — its seam against the page was nearly invisible.
// Ink flips from maroon to white at the lightness crossover; there's a dead zone
// (background luminance ~0.18-0.36) where NEITHER ink clears 4.5:1, so the ramp
// jumps straight from the one maroon-safe step to four white-safe steps rather
// than interpolating smoothly through it.
const STEPS = [
  { fill: '#52C2D4', ink: 'maroon' },
  { fill: '#1D7E90', ink: 'white' },
  { fill: '#17677A', ink: 'white' },
  { fill: '#123F52', ink: 'white' },
  { fill: '#0A2733', ink: 'white' },
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
