import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import DemoTour from '../demo/DemoTour'
import './AppShell.css'

export default function AppShell() {
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="app-shell-main">
        <Topbar />
        <main className="app-shell-content">
          <Outlet />
        </main>
      </div>
      <DemoTour />
    </div>
  )
}
