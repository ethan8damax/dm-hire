import { useEffect, useRef, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import Button from '../ui/Button'
import { useTour } from '../../context/TourContext'
import { tourSteps } from '../../data/tourSteps'
import './DemoTour.css'

const CARD_WIDTH = 320
const FALLBACK_CARD_HEIGHT = 240

export default function DemoTour() {
  const { isActive, stepIndex, next, prev, stop } = useTour()
  const navigate = useNavigate()
  const location = useLocation()
  const [rect, setRect] = useState(null)
  const cardRef = useRef(null)
  const [cardHeight, setCardHeight] = useState(FALLBACK_CARD_HEIGHT)

  const step = tourSteps[stepIndex]
  const isLast = stepIndex === tourSteps.length - 1

  useEffect(() => {
    if (!isActive || !step) return
    navigate(step.route, step.tab ? { state: { tab: step.tab } } : undefined)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive, stepIndex])

  useEffect(() => {
    if (!isActive || !step) { setRect(null); return }

    function measure() {
      const el = document.querySelector(step.elementSelector)
      setRect(el ? el.getBoundingClientRect() : null)
    }

    let raf
    const timeout = setTimeout(() => {
      measure()
      raf = requestAnimationFrame(measure)
    }, 150)
    window.addEventListener('resize', measure)
    return () => {
      clearTimeout(timeout)
      if (raf) cancelAnimationFrame(raf)
      window.removeEventListener('resize', measure)
    }
  }, [isActive, stepIndex, location.pathname, location.search])

  // The card's real height varies with each step's copy length (step 16's is
  // notably longer) — track it via ResizeObserver instead of assuming a fixed
  // height, otherwise the bottom of the card (Next button included) can clamp
  // itself past the viewport edge on long-copy steps.
  useEffect(() => {
    if (!cardRef.current) return
    // contentRect excludes the card's own padding, undershooting the real
    // footprint — read offsetHeight (border-box) instead, same box model
    // getBoundingClientRect() uses for the clamp math below.
    const observer = new ResizeObserver(() => setCardHeight(cardRef.current.offsetHeight))
    observer.observe(cardRef.current)
    return () => observer.disconnect()
  }, [isActive])

  if (!isActive || !step) return null

  const cardTop = rect
    ? Math.max(16, Math.min(rect.bottom + 12, window.innerHeight - cardHeight - 16))
    : window.innerHeight / 2 - cardHeight / 2
  const cardLeft = rect ? Math.min(Math.max(rect.left, 16), window.innerWidth - CARD_WIDTH - 16) : window.innerWidth / 2 - CARD_WIDTH / 2

  return (
    <>
      {rect && (
        <div
          className="tour-spotlight"
          style={{ top: rect.top - 6, left: rect.left - 6, width: rect.width + 12, height: rect.height + 12 }}
        />
      )}
      <div ref={cardRef} className="tour-card" style={{ top: cardTop, left: cardLeft, width: CARD_WIDTH }}>
        <div className="tour-card-hdr">
          <span className="tour-step-count">Step {stepIndex + 1} of {tourSteps.length}</span>
          <button type="button" className="tour-close" onClick={stop} aria-label="Close tour"><X size={14} /></button>
        </div>
        <div className="tour-heading">{step.heading}</div>
        <div className="tour-body">{step.body}</div>
        <div className="tour-vs">vs. today: {step.vsCompetition}</div>
        <div className="tour-actions">
          <Button variant="ghost" size="sm" onClick={stop}>Skip Tour</Button>
          <div className="tour-nav-btns">
            <Button variant="ghost" size="sm" disabled={stepIndex === 0} onClick={prev}><ChevronLeft size={14} /> Prev</Button>
            <Button variant="primary" size="sm" onClick={isLast ? stop : next}>
              {isLast ? 'Finish' : <>Next <ChevronRight size={14} /></>}
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
