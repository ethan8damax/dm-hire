import { createContext, useContext, useState } from 'react'

const PersonaContext = createContext(null)

export function PersonaProvider({ children }) {
  const [persona, setPersona] = useState('recruiter') // recruiter | hiring_manager | candidate

  return (
    <PersonaContext.Provider value={{ persona, setPersona }}>
      {children}
    </PersonaContext.Provider>
  )
}

export function usePersona() {
  return useContext(PersonaContext)
}
