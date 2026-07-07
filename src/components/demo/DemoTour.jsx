import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import Button from '../ui/Button'
import { useTour } from '../../context/TourContext'
import { tourSteps } from '../../data/tourSteps'
import './DemoTour.css'

const CARD_WIDTH = 320

export default function DemoTour() {
  const { isActive, stepIndex, next, prev, stop } = useTour()
  const navigate = useNavigate()
  const location = useLocation()
  const [rect, setRect] = useState(null)

  const step = tourSteps[stepIndex]
  const isLast = stepIndex === tourSteps.length - 1

  useEffect(() => {
    if (!isActive || !step) return
    navigate(step.route)
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

  if (!isActive || !step) return null

  const cardTop = rect ? Math.min(rect.bottom + 12, window.innerHeight - 240) : window.innerHeight / 2 - 120
  const cardLeft = rect ? Math.min(Math.max(rect.left, 16), window.innerWidth - CARD_WIDTH - 16) : window.innerWidth / 2 - CARD_WIDTH / 2

  return (
    <>
      {rect && (
        <div
          className="tour-spotlight"
          style={{ top: rect.top - 6, left: rect.left - 6, width: rect.width + 12, height: rect.height + 12 }}
        />
      )}
      <div className="tour-card" style={{ top: cardTop, left: cardLeft, width: CARD_WIDTH }}>
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
