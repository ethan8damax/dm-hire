import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Briefcase, Kanban, Building2,
  FileSignature, BarChart3, Plug, Settings, Sparkles, ClipboardCheck,
  Users, UserCheck, User, PanelLeftClose, PanelLeftOpen,
} from 'lucide-react'
import { usePersona } from '../../context/PersonaContext'
import './Sidebar.css'

const NAV_SECTIONS = [
  {
    label: 'Recruiting',
    items: [
      { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
      { to: '/approvals', label: 'Approvals', icon: ClipboardCheck, hmVisible: true, hmOnly: true },
      { to: '/jobs', label: 'Job Requisitions', icon: Briefcase, hmVisible: false },
      { to: '/pipeline?job=all', label: 'Candidate Pipeline', icon: Kanban, hmVisible: true },
      { to: '/internal-jobs', label: 'Internal Jobs', icon: Building2, hmVisible: false },
    ],
  },
  {
    label: 'Tools',
    items: [
      { to: '/offers', label: 'Offers', icon: FileSignature, hmVisible: false },
      { to: '/reports', label: 'Reports', icon: BarChart3, hmVisible: false },
      { to: '/integrations', label: 'Integrations', icon: Plug, hmVisible: false },
    ],
  },
  {
    label: 'Admin',
    items: [
      { to: '/settings', label: 'Settings', icon: Settings, hmVisible: false },
    ],
  },
]

const DEMO_ITEM = { to: '/why-dm-hire', label: 'Why DM Hire', icon: Sparkles }

const PERSONAS = [
  { id: 'recruiter', label: 'Recruiter', icon: Users },
  { id: 'hiring_manager', label: 'Hiring Manager', icon: UserCheck },
  { id: 'candidate', label: 'Candidate', icon: User },
]

export default function Sidebar() {
  const navigate = useNavigate()
  const { persona, setPersona } = usePersona()
  const [collapsed, setCollapsed] = useState(false)
  const isHiringManager = persona === 'hiring_manager'
  const navSections = NAV_SECTIONS
    .map((s) => ({
      ...s,
      items: s.items.filter((i) => (isHiringManager ? i.hmVisible || i.to === '/' : !i.hmOnly)),
    }))
    .filter((s) => s.items.length > 0)

  function handlePersonaChange(id) {
    setPersona(id)
    if (id === 'candidate') navigate('/careers')
  }

  return (
    <aside className={`sidebar${collapsed ? ' collapsed' : ''}`}>
      <div className="sidebar-logo">
        <div className="sidebar-logo-text">DM <span>Hire</span></div>
        <button
          type="button"
          className="sidebar-collapse-btn"
          onClick={() => setCollapsed((c) => !c)}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
        </button>
        <div className="sidebar-logo-mask" aria-hidden="true" />
      </div>

      <nav className="sidebar-nav">
        {navSections.map((section) => (
          <div className="sidebar-section" key={section.label}>
            <div className="sidebar-section-label">{section.label}</div>
            {section.items.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                aria-label={label}
                className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
              >
                <Icon size={18} strokeWidth={2} />
                <span>{label}</span>
              </NavLink>
            ))}
          </div>
        ))}

        <div className="sidebar-section sidebar-section-demo">
          <div className="sidebar-section-label">Demo</div>
          {PERSONAS.map((p) => (
            <button
              key={p.id}
              type="button"
              aria-label={p.label}
              aria-current={persona === p.id ? 'true' : undefined}
              className={`sidebar-link sidebar-persona-btn${persona === p.id ? ' active' : ''}`}
              onClick={() => handlePersonaChange(p.id)}
            >
              <p.icon size={18} strokeWidth={2} />
              <span>{p.label}</span>
            </button>
          ))}
          <NavLink
            to={DEMO_ITEM.to}
            aria-label={DEMO_ITEM.label}
            className={({ isActive }) => `sidebar-link sidebar-link-demo${isActive ? ' active' : ''}`}
          >
            <DEMO_ITEM.icon size={18} strokeWidth={2} />
            <span>{DEMO_ITEM.label}</span>
          </NavLink>
        </div>
      </nav>
    </aside>
  )
}
