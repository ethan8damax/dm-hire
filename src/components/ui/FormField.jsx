import './FormField.css'

// Wraps a single label + input + validation message. The child input/select/textarea
// must carry id={id} itself so label association and focus-jump targeting both work.
export default function FormField({ id, label, required, error, hint, className = '', children }) {
  return (
    <div className={`form-field${error ? ' form-field-error' : ''} ${className}`.trim()}>
      <label htmlFor={id}>{label}{required && <span className="form-field-req">*</span>}</label>
      {children}
      {hint && !error && <div className="form-field-hint">{hint}</div>}
      {error && <div className="form-field-error-msg">{error}</div>}
    </div>
  )
}
