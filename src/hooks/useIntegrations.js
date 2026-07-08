import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'
import { rowToCamel, toSnakeRow } from '../lib/caseConvert'

export function useIntegrations() {
  const [integrations, setIntegrations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    supabase.from('integrations').select('*').then(({ data, error }) => {
      if (error) setError(error)
      else setIntegrations(rowToCamel(data))
      setLoading(false)
    })
  }, [])

  const updateIntegration = useCallback(async (id, patch) => {
    const { error } = await supabase.from('integrations').update(toSnakeRow(patch)).eq('id', id)
    if (error) { setError(error); return }
    setIntegrations((list) => list.map((i) => (i.id === id ? { ...i, ...patch } : i)))
  }, [])

  return { integrations, loading, error, updateIntegration }
}
