import { createContext, useContext, useState } from 'react'

const TourContext = createContext(null)

export function TourProvider({ children }) {
  const [isActive, setIsActive] = useState(false)
  const [stepIndex, setStepIndex] = useState(0)

  return (
    <TourContext.Provider value={{ isActive, setIsActive, stepIndex, setStepIndex }}>
      {children}
    </TourContext.Provider>
  )
}

export function useTour() {
  return useContext(TourContext)
}
