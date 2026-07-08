import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'
import { rowToCamel, toSnakeRow } from '../lib/caseConvert'

export function useUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    supabase.from('users').select('*').then(({ data, error }) => {
      if (error) setError(error)
      else setUsers(rowToCamel(data))
      setLoading(false)
    })
  }, [])

  const inviteUser = useCallback(async (user) => {
    const { data, error } = await supabase.from('users').insert(toSnakeRow(user)).select().single()
    if (error) { setError(error); return }
    setUsers((list) => [...list, rowToCamel(data)])
  }, [])

  return { users, loading, error, inviteUser }
}
