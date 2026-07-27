import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Bell, Plus, Play, X, User, Briefcase, FileText } from 'lucide-react'
import { usePersona } from '../../context/PersonaContext'
import { useTour } from '../../context/TourContext'
import { useCandidates } from '../../hooks/useCandidates'
import { useJobs } from '../../hooks/useJobs'
import { useUsers } from '../../hooks/useUsers'
import { useNotifications } from '../../hooks/useNotifications'
import Button from '../ui/Button'
import './Topbar.css'

const PERSONAS = [
  { id: 'recruiter', label: 'Recruiter' },
  { id: 'hiring_manager', label: 'Hiring Manager' },
  { id: 'candidate', label: 'Candidate' },
]

function timeAgo(iso) {
  const mins = Math.floor((Date.now() - new Date(iso)) / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

export default function Topbar() {
  const navigate = useNavigate()
  const { persona, setPersona, currentHmId, setCurrentHmId } = usePersona()
  const { start: startTour } = useTour()
  const { candidates } = useCandidates()
  const { jobs } = useJobs()
  const { users } = useUsers()
  const { notifications, unreadCount, addNotification, markAllRead, dismissNotification } = useNotifications()
  const hiringManagers = users.filter((u) => u.role === 'Hiring Manager')

  const [query, setQuery] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const searchRef = useRef(null)

  const [notifOpen, setNotifOpen] = useState(false)
  const [addFormOpen, setAddFormOpen] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newMessage, setNewMessage] = useState('')
  const notifRef = useRef(null)

  useEffect(() => {
    function handleClick(e) {
      if (searchRef.current && !searchRef.current.contains(e.target)) setSearchOpen(false)
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function handlePersonaChange(id) {
    setPersona(id)
    if (id === 'candidate') navigate('/careers')
  }

  const q = query.trim().toLowerCase()
  const matchedCandidates = q.length < 2 ? [] : candidates.filter((c) => (
    c.name.toLowerCase().includes(q)
    || c.email.toLowerCase().includes(q)
    || c.currentRole?.toLowerCase().includes(q)
    || c.skills?.some((s) => s.toLowerCase().includes(q))
    || c.notes?.some((n) => n.body.toLowerCase().includes(q))
  )).slice(0, 5)
  const matchedJobs = q.length < 2 ? [] : jobs.filter((j) => (
    j.title.toLowerCase().includes(q) || j.department.toLowerCase().includes(q)
  )).slice(0, 5)
  const hasResults = matchedCandidates.length > 0 || matchedJobs.length > 0

  function goToCandidate(id) {
    navigate(`/candidates/${id}`)
    setQuery('')
    setSearchOpen(false)
  }

  function goToJob() {
    navigate('/jobs')
    setQuery('')
    setSearchOpen(false)
  }

  function toggleNotifPanel() {
    setNotifOpen((open) => {
      if (!open) markAllRead()
      return !open
    })
    setAddFormOpen(false)
  }

  function handleAddNotification(e) {
    e.preventDefault()
    if (!newTitle.trim()) return
    addNotification(newTitle.trim(), newMessage.trim())
    setNewTitle('')
    setNewMessage('')
    setAddFormOpen(false)
  }

  return (
    <header className="topbar">
      <div className="topbar-search" ref={searchRef}>
        <Search size={15} />
        <input
          type="text"
          placeholder="Search candidates, jobs, notes…"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setSearchOpen(true) }}
          onFocus={() => setSearchOpen(true)}
        />
        {searchOpen && q.length >= 2 && (
          <div className="topbar-search-results">
            {!hasResults && <div className="topbar-search-empty">No matches for "{query}"</div>}
            {matchedCandidates.length > 0 && (
              <div className="topbar-search-group">
                <div className="topbar-search-group-label">Candidates</div>
                {matchedCandidates.map((c) => (
                  <button type="button" key={c.id} className="topbar-search-result" onClick={() => goToCandidate(c.id)}>
                    <User size={13} />
                    <span className="tsr-title">{c.name}</span>
                    <span className="tsr-sub">{c.currentRole || c.email}</span>
                  </button>
                ))}
              </div>
            )}
            {matchedJobs.length > 0 && (
              <div className="topbar-search-group">
                <div className="topbar-search-group-label">Jobs</div>
                {matchedJobs.map((j) => (
                  <button type="button" key={j.id} className="topbar-search-result" onClick={goToJob}>
                    <Briefcase size={13} />
                    <span className="tsr-title">{j.title}</span>
                    <span className="tsr-sub">{j.department}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
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

      {persona === 'hiring_manager' && (
        <select
          className="topbar-hm-select"
          aria-label="Viewing as which hiring manager"
          value={currentHmId}
          onChange={(e) => setCurrentHmId(e.target.value)}
        >
          {hiringManagers.map((hm) => <option key={hm.id} value={hm.id}>Viewing as {hm.name}</option>)}
        </select>
      )}

      <Button variant="accent" size="sm" onClick={startTour}>
        <Play size={14} /> Start Demo Tour
      </Button>

      <div className="topbar-notif-wrap" ref={notifRef}>
        <button type="button" className="topbar-notif" aria-label="Notifications" onClick={toggleNotifPanel}>
          <Bell size={17} />
          {unreadCount > 0 && <span className="topbar-notif-dot" />}
        </button>

        {notifOpen && (
          <div className="topbar-notif-panel">
            <div className="topbar-notif-panel-hdr">
              <span>Notifications</span>
              <button type="button" className="topbar-notif-add-btn" onClick={() => setAddFormOpen((v) => !v)}>
                <Plus size={13} /> Add
              </button>
            </div>

            {addFormOpen && (
              <form className="topbar-notif-add-form" onSubmit={handleAddNotification}>
                <input
                  autoFocus
                  placeholder="Notification title"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  required
                />
                <textarea
                  rows={2}
                  placeholder="Message (optional)"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                />
                <Button type="submit" variant="primary" size="sm">Add Notification</Button>
              </form>
            )}

            <div className="topbar-notif-list">
              {notifications.length === 0 && <div className="topbar-notif-empty"><FileText size={16} /> No notifications yet.</div>}
              {notifications.map((n) => (
                <div key={n.id} className="topbar-notif-item">
                  <div className="topbar-notif-item-body">
                    <div className="topbar-notif-item-title">{n.title}</div>
                    {n.message && <div className="topbar-notif-item-msg">{n.message}</div>}
                    <div className="topbar-notif-item-time">{timeAgo(n.createdAt)}</div>
                  </div>
                  <button type="button" className="topbar-notif-item-dismiss" aria-label="Dismiss" onClick={() => dismissNotification(n.id)}>
                    <X size={13} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
