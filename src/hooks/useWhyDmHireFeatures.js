import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { rowToCamel } from '../lib/caseConvert'

export function useWhyDmHireFeatures() {
  const [whyDmHireFeatures, setWhyDmHireFeatures] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    supabase.from('why_dm_hire_features').select('*').order('id').then(({ data, error }) => {
      if (error) setError(error)
      else setWhyDmHireFeatures(rowToCamel(data))
      setLoading(false)
    })
  }, [])

  return { whyDmHireFeatures, loading, error }
}
