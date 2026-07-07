import { useEffect, useState } from 'react'

// Simulates an initial data fetch so tables get a brief shimmer instead of popping in fully-formed.
export function useSimulatedLoad(ms = 300) {
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    const timeout = setTimeout(() => setLoading(false), ms)
    return () => clearTimeout(timeout)
  }, [ms])
  return loading
}
