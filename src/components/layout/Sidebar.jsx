import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Briefcase, Kanban, Building2,
  FileSignature, BarChart3, Plug, Settings, Sparkles,
} from 'lucide-react'
import './Sidebar.css'

const NAV_SECTIONS = [
  {
    label: 'Recruiting',
    items: [
      { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
      { to: '/jobs', label: 'Job Requisitions', icon: Briefcase },
      { to: '/pipeline', label: 'Candidate Pipeline', icon: Kanban },
      { to: '/internal-jobs', label: 'Internal Jobs', icon: Building2 },
    ],
  },
  {
    label: 'Tools',
    items: [
      { to: '/offers', label: 'Offers', icon: FileSignature },
      { to: '/reports', label: 'Reports', icon: BarChart3 },
      { to: '/integrations', label: 'Integrations', icon: Plug },
    ],
  },
  {
    label: 'Admin',
    items: [
      { to: '/settings', label: 'Settings', icon: Settings },
    ],
  },
]

const DEMO_ITEM = { to: '/why-dm-hire', label: 'Why DM Hire', icon: Sparkles }

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        DM <span>Hire</span>
      </div>

      <nav className="sidebar-nav">
        {NAV_SECTIONS.map((section) => (
          <div className="sidebar-section" key={section.label}>
            <div className="sidebar-section-label">{section.label}</div>
            {section.items.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
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
