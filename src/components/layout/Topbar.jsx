import { useNavigate } from 'react-router-dom'
import { Search, Bell, Plus, Play } from 'lucide-react'
import { usePersona } from '../../context/PersonaContext'
import { useTour } from '../../context/TourContext'
import Button from '../ui/Button'
import './Topbar.css'

const PERSONAS = [
  { id: 'recruiter', label: 'Recruiter' },
  { id: 'hiring_manager', label: 'Hiring Manager' },
  { id: 'candidate', label: 'Candidate' },
]

export default function Topbar() {
  const navigate = useNavigate()
  const { persona, setPersona } = usePersona()
  const { start: startTour } = useTour()

  function handlePersonaChange(id) {
    setPersona(id)
    if (id === 'candidate') navigate('/careers')
  }

  return (
    <header className="topbar">
      <div className="topbar-search">
        <Search size={15} />
        <input type="text" placeholder="Search candidates, jobs, notes…" />
      </div>

      <div className="topbar-persona">
        {PERSONAS.map((p) => (
          <button
            key={p.id}
            type="button"
            className={`topbar-persona-btn${persona === p.id ? ' active' : ''}`}
            onClick={() => handlePersonaChange(p.id)}
          >
            {p.label}
          </button>
        ))}
      </div>

      <Button variant="accent" size="sm" onClick={startTour}>
        <Play size={14} /> Start Demo Tour
      </Button>

      <Button variant="primary" onClick={() => navigate('/jobs')}>
        <Plus size={16} /> New Requisition
      </Button>

      <button type="button" className="topbar-notif" aria-label="Notifications">
        <Bell size={17} />
        <span className="topbar-notif-dot" />
      </button>
    </header>
  )
}
