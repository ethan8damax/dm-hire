import './Avatar.css'

export default function Avatar({ initials, color = 'navy', size = 'md', className = '' }) {
  return (
    <span className={`avatar avatar-${size} av-${color} ${className}`.trim()}>
      {initials}
    </span>
  )
}

Avatar.Group = function AvatarGroup({ children }) {
  return <div className="avatar-group">{children}</div>
}
