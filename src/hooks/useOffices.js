import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'
import { rowToCamel, toSnakeRow } from '../lib/caseConvert'

export function useOffices() {
  const [offices, setOffices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    supabase.from('offices').select('*').then(({ data, error }) => {
      if (error) setError(error)
      else setOffices(rowToCamel(data))
      setLoading(false)
    })
  }, [])

  const addOffice = useCallback(async (office) => {
    const { data, error } = await supabase.from('offices').insert(toSnakeRow(office)).select().single()
    if (error) { setError(error); return }
    setOffices((list) => [...list, rowToCamel(data)])
  }, [])

  return { offices, loading, error, addOffice }
}
