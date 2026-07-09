import { useCallback, useSyncExternalStore } from 'react'

const STORAGE_KEY = 'dm-hire-notifications'
const listeners = new Set()

function loadInitial() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

let state = loadInitial()

// Module-level store (not per-component state) so every mounted useNotifications()
// caller — the Topbar bell and the Settings tab — sees the same list instantly,
// without needing a shared Context provider wrapping both.
function setState(next) {
  state = next
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  listeners.forEach((listener) => listener())
}

function subscribe(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function getSnapshot() {
  return state
}

export function useNotifications() {
  const notifications = useSyncExternalStore(subscribe, getSnapshot)

  const addNotification = useCallback((title, message, notifyDepartments = [], receives = '') => {
    setState([
      { id: `notif-${Date.now()}`, title, message, notifyDepartments, receives, createdAt: new Date().toISOString(), read: false },
      ...state,
    ])
  }, [])

  const markAllRead = useCallback(() => {
    if (state.some((n) => !n.read)) setState(state.map((n) => ({ ...n, read: true })))
  }, [])

  const dismissNotification = useCallback((id) => {
    setState(state.filter((n) => n.id !== id))
  }, [])

  const unreadCount = notifications.filter((n) => !n.read).length

  return { notifications, unreadCount, addNotification, markAllRead, dismissNotification }
}
