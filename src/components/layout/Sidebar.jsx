import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Briefcase, Kanban, Building2,
  FileSignature, BarChart3, Plug, Settings, Sparkles,
} from 'lucide-react'
import { usePersona } from '../../context/PersonaContext'
import './Sidebar.css'

const NAV_SECTIONS = [
  {
    label: 'Recruiting',
    items: [
      { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
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

export default function Sidebar() {
  const { persona } = usePersona()
  const isHiringManager = persona === 'hiring_manager'
  const navSections = isHiringManager
    ? NAV_SECTIONS.map((s) => ({ ...s, items: s.items.filter((i) => i.hmVisible || i.to === '/') })).filter((s) => s.items.length > 0)
    : NAV_SECTIONS

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        DM <span>Hire</span>
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
