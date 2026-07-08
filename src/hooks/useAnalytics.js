import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

export function useAnalytics() {
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    supabase.from('analytics').select('data').eq('id', 'default').single().then(({ data, error }) => {
      if (error) setError(error)
      else setAnalytics(data.data)
      setLoading(false)
    })
  }, [])

  return { analytics, loading, error }
}
