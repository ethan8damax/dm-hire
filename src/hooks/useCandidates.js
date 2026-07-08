import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'
import { rowToCamel, toSnakeRow } from '../lib/caseConvert'

const SELECT = '*, candidate_notes(*), candidate_timeline_events(*), candidate_scorecards(*)'

function shapeCandidate(row) {
  return {
    ...rowToCamel(row),
    notes: rowToCamel(row.candidate_notes ?? []),
    timeline: rowToCamel(row.candidate_timeline_events ?? []),
    scorecard: rowToCamel(row.candidate_scorecards ?? []),
  }
}

export function useCandidates() {
  const [candidates, setCandidates] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    supabase.from('candidates').select(SELECT).then(({ data, error }) => {
      if (error) setError(error)
      else setCandidates(data.map(shapeCandidate))
      setLoading(false)
    })
  }, [])

  const updateStage = useCallback(async (id, stage) => {
    const today = new Date().toISOString().slice(0, 10)
    const { error: updateError } = await supabase.from('candidates').update({ stage }).eq('id', id)
    if (updateError) { setError(updateError); return }
    const { data: eventData, error: insertError } = await supabase.from('candidate_timeline_events')
      .insert({ candidate_id: id, stage, date: today, note: `Moved to ${stage}` })
      .select().single()
    if (insertError) { setError(insertError); return }
    setCandidates((list) => list.map((c) => (c.id === id
      ? { ...c, stage, timeline: [...c.timeline, rowToCamel(eventData)] }
      : c)))
  }, [])

  const addNote = useCallback(async (id, note) => {
    const { data, error } = await supabase.from('candidate_notes')
      .insert({ candidate_id: id, ...toSnakeRow(note) })
      .select().single()
    if (error) { setError(error); return }
    setCandidates((list) => list.map((c) => (c.id === id ? { ...c, notes: [...c.notes, rowToCamel(data)] } : c)))
  }, [])

  const updateCandidate = useCallback(async (id, patch) => {
    const { error } = await supabase.from('candidates').update(toSnakeRow(patch)).eq('id', id)
    if (error) { setError(error); return }
    setCandidates((list) => list.map((c) => (c.id === id ? { ...c, ...patch } : c)))
  }, [])

  return { candidates, loading, error, updateStage, addNote, updateCandidate }
}
