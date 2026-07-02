import './Button.css'

export default function Button({
  variant = 'primary',   // primary | accent | outline | ghost | danger
  size = 'default',      // sm | default | lg
  iconOnly = false,
  className = '',
  children,
  ...rest
}) {
  const classes = [
    iconOnly ? 'btn-icon' : 'btn',
    !iconOnly && `btn-${variant}`,
    !iconOnly && size !== 'default' && `btn-${size}`,
    className,
  ].filter(Boolean).join(' ')

  return (
    <button className={classes} {...rest}>
      {children}
    </button>
  )
}
