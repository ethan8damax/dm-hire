import './FilterChip.css'

export default function FilterChip({ active = false, children, ...rest }) {
  return (
    <button type="button" className={`filter-chip${active ? ' active' : ''}`} {...rest}>
      {children}
    </button>
  )
}
