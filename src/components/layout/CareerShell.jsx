import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { Briefcase, FileText, UserCircle, LogOut } from 'lucide-react'
import { usePersona } from '../../context/PersonaContext'
import { useCandidateSession } from '../../context/CandidateSessionContext'
import Avatar from '../ui/Avatar'
import './CareerShell.css'

const NAV_ITEMS = [
  { to: '/careers', label: 'Find Jobs', icon: Briefcase, end: true },
  { to: '/careers/applications', label: 'My Applications', icon: FileText },
  { to: '/careers/profile', label: 'Profile', icon: UserCircle },
]

export default function CareerShell() {
  const navigate = useNavigate()
  const { setPersona } = usePersona()
  const { session } = useCandidateSession()

  function exitToRecruiterView() {
    setPersona('recruiter')
    navigate('/')
  }

  return (
    <div className="career-shell">
      <header className="career-header">
        <div className="career-logo" onClick={() => navigate('/careers')}>
          DM <span>Hire</span> <span className="career-logo-sub">Careers</span>
        </div>
        <nav className="career-nav">
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => `career-nav-link${isActive ? ' active' : ''}`}
            >
              <Icon size={16} strokeWidth={2} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="career-header-right">
          {session?.name && (
            <div className="career-session">
              <Avatar initials={session.name.split(' ').map((p) => p[0]).join('').toUpperCase()} size="sm" />
              <span className="career-session-name">{session.name}</span>
            </div>
          )}
          <button type="button" className="career-exit" onClick={exitToRecruiterView}>
            <LogOut size={14} /> Switch to Recruiter View
          </button>
        </div>
      </header>
      <main className="career-content">
        <Outlet />
      </main>
    </div>
  )
}
