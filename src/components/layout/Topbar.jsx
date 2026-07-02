import { useNavigate } from 'react-router-dom'
import { Search, Bell, Plus } from 'lucide-react'
import { usePersona } from '../../context/PersonaContext'
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
            onClick={() => setPersona(p.id)}
          >
            {p.label}
          </button>
        ))}
      </div>

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
