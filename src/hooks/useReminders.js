import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'
import { rowToCamel, toSnakeRow } from '../lib/caseConvert'

export function useReminders() {
  const [reminders, setReminders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    supabase.from('reminders').select('*').then(({ data, error }) => {
      if (error) setError(error)
      else setReminders(data.map(rowToCamel))
      setLoading(false)
    })
  }, [])

  const sendReminder = useCallback(async (reminder) => {
    const { data, error } = await supabase.from('reminders')
      .insert(toSnakeRow(reminder))
      .select().single()
    if (error) { setError(error); return null }
    const shaped = rowToCamel(data)
    setReminders((list) => [...list, shaped])
    return shaped
  }, [])

  return { reminders, loading, error, sendReminder }
}
