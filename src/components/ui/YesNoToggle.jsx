import './YesNoToggle.css'

// value: true | false | null(unanswered). id lands on the "Yes" button so
// FormField's <label htmlFor> and the wizard's focus-jump both have a target.
export default function YesNoToggle({ id, value, onChange }) {
  return (
    <div className="yn-toggle" role="group">
      <button
        type="button"
        id={id}
        className={`yn-toggle-btn${value === true ? ' yn-active' : ''}`}
        onClick={() => onChange(true)}
      >
        Yes
      </button>
      <button
        type="button"
        className={`yn-toggle-btn${value === false ? ' yn-active' : ''}`}
        onClick={() => onChange(false)}
      >
        No
      </button>
    </div>
  )
}
