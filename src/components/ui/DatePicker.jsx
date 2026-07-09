import { useEffect, useRef, useState } from 'react'
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react'
import './DatePicker.css'

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const MONTH_ABBR = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const WEEKDAY_ABBR = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

function pad(n) {
  return String(n).padStart(2, '0')
}

function parseValue(value) {
  if (!value) return null
  const [year, month, day] = value.split('-').map(Number)
  return { year, month: month - 1, day }
}

function formatDisplay(value, granularity) {
  const parsed = parseValue(value)
  if (!parsed) return ''
  return granularity === 'month'
    ? `${MONTH_NAMES[parsed.month]} ${parsed.year}`
    : `${MONTH_NAMES[parsed.month]} ${parsed.day}, ${parsed.year}`
}

function daysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate()
}
function firstWeekday(year, month) {
  return new Date(year, month, 1).getDay()
}

// Custom popup calendar replacing the native <input type="month"|"date">
// picker — browsers render those wildly differently (and un-stylably) across
// OSes, so this keeps the date-picking experience consistent with the rest of
// the app's design. granularity="month" shows a year+month-grid picker;
// granularity="day" shows a full day-grid calendar.
export default function DatePicker({ id, value, onChange, granularity = 'month', placeholder = 'Select…' }) {
  const [open, setOpen] = useState(false)
  const today = new Date()
  const initial = parseValue(value)
  const [viewYear, setViewYear] = useState(initial?.year ?? today.getFullYear())
  const [viewMonth, setViewMonth] = useState(initial?.month ?? today.getMonth())
  const containerRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false)
    }
    function handleEscape(e) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [])

  function goToPrevious() {
    if (granularity === 'month') {
      setViewYear((y) => y - 1)
    } else if (viewMonth === 0) {
      setViewMonth(11)
      setViewYear((y) => y - 1)
    } else {
      setViewMonth((m) => m - 1)
    }
  }

  function goToNext() {
    if (granularity === 'month') {
      setViewYear((y) => y + 1)
    } else if (viewMonth === 11) {
      setViewMonth(0)
      setViewYear((y) => y + 1)
    } else {
      setViewMonth((m) => m + 1)
    }
  }

  function selectMonth(monthIdx) {
    onChange(`${viewYear}-${pad(monthIdx + 1)}`)
    setOpen(false)
  }

  function selectDay(day) {
    onChange(`${viewYear}-${pad(viewMonth + 1)}-${pad(day)}`)
    setOpen(false)
  }

  const parsed = parseValue(value)

  return (
    <div className="date-picker" ref={containerRef}>
      <button type="button" id={id} className="date-picker-trigger" onClick={() => setOpen((o) => !o)}>
        <Calendar size={14} />
        <span className={value ? '' : 'date-picker-placeholder'}>{value ? formatDisplay(value, granularity) : placeholder}</span>
      </button>
      {open && (
        <div className="date-picker-popup">
          <div className="date-picker-header">
            <button type="button" className="date-picker-nav" onClick={goToPrevious} aria-label="Previous"><ChevronLeft size={16} /></button>
            <span className="date-picker-header-label">{granularity === 'month' ? viewYear : `${MONTH_NAMES[viewMonth]} ${viewYear}`}</span>
            <button type="button" className="date-picker-nav" onClick={goToNext} aria-label="Next"><ChevronRight size={16} /></button>
          </div>

          {granularity === 'month' ? (
            <div className="date-picker-month-grid">
              {MONTH_ABBR.map((label, idx) => (
                <button
                  type="button"
                  key={label}
                  className={`date-picker-cell${parsed?.year === viewYear && parsed?.month === idx ? ' date-picker-cell-selected' : ''}`}
                  onClick={() => selectMonth(idx)}
                >
                  {label}
                </button>
              ))}
            </div>
          ) : (
            <div className="date-picker-day-grid">
              {WEEKDAY_ABBR.map((d) => <div className="date-picker-weekday" key={d}>{d}</div>)}
              {Array.from({ length: firstWeekday(viewYear, viewMonth) }).map((_, i) => <div key={`blank-${i}`} />)}
              {Array.from({ length: daysInMonth(viewYear, viewMonth) }).map((_, i) => {
                const day = i + 1
                const selected = parsed?.year === viewYear && parsed?.month === viewMonth && parsed?.day === day
                return (
                  <button
                    type="button"
                    key={day}
                    className={`date-picker-cell date-picker-cell-day${selected ? ' date-picker-cell-selected' : ''}`}
                    onClick={() => selectDay(day)}
                  >
                    {day}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
