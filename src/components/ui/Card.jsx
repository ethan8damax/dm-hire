import './Card.css'

export default function Card({ children, className = '', ...rest }) {
  return <div className={`card ${className}`.trim()} {...rest}>{children}</div>
}

Card.Header = function CardHeader({ children, className = '' }) {
  return <div className={`card-header ${className}`.trim()}>{children}</div>
}

Card.Title = function CardTitle({ children, className = '' }) {
  return <div className={`card-title ${className}`.trim()}>{children}</div>
}

Card.Body = function CardBody({ children, className = '' }) {
  return <div className={`card-body ${className}`.trim()}>{children}</div>
}

Card.Footer = function CardFooter({ children, className = '' }) {
  return <div className={`card-footer ${className}`.trim()}>{children}</div>
}
