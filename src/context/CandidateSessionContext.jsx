import { createContext, useContext, useState } from 'react'

const STORAGE_KEY = 'dmhire_candidate_session'

const CandidateSessionContext = createContext(null)

function readStoredSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

// Simulates a logged-in candidate identity (name/email/phone/…) with no real
// auth backing it — persisted to localStorage so "My Applications" survives a
// refresh. Swap this for real session/auth state once a backend exists.
export function CandidateSessionProvider({ children }) {
  const [session, setSession] = useState(readStoredSession)

  function login(profile) {
    setSession(profile)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile))
  }

  function updateProfile(patch) {
    setSession((prev) => {
      const next = { ...prev, ...patch }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }

  function logout() {
    setSession(null)
    localStorage.removeItem(STORAGE_KEY)
  }

  return (
    <CandidateSessionContext.Provider value={{ session, login, updateProfile, logout }}>
      {children}
    </CandidateSessionContext.Provider>
  )
}

export function useCandidateSession() {
  return useContext(CandidateSessionContext)
}
