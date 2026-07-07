import { createContext, useContext, useState } from 'react'
import { tourSteps } from '../data/tourSteps'

const TourContext = createContext(null)

export function TourProvider({ children }) {
  const [isActive, setIsActive] = useState(false)
  const [stepIndex, setStepIndex] = useState(0)

  function start() {
    setStepIndex(0)
    setIsActive(true)
  }
  function stop() {
    setIsActive(false)
  }
  function next() {
    setStepIndex((i) => Math.min(i + 1, tourSteps.length - 1))
  }
  function prev() {
    setStepIndex((i) => Math.max(i - 1, 0))
  }

  return (
    <TourContext.Provider value={{ isActive, stepIndex, start, stop, next, prev }}>
      {children}
    </TourContext.Provider>
  )
}

export function useTour() {
  return useContext(TourContext)
}
