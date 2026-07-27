import { createContext, useContext, useState } from 'react'

const PersonaContext = createContext(null)

export function PersonaProvider({ children }) {
  const [persona, setPersona] = useState('recruiter') // recruiter | hiring_manager | candidate
  // Which of the 4 seeded hiring managers the Hiring Manager persona is currently simulating —
  // stands in for a real login since this app has no per-user auth.
  const [currentHmId, setCurrentHmId] = useState('user-002') // R. Patel

  return (
    <PersonaContext.Provider value={{ persona, setPersona, currentHmId, setCurrentHmId }}>
      {children}
    </PersonaContext.Provider>
  )
}

export function usePersona() {
  return useContext(PersonaContext)
}
