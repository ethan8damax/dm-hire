import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'
import { rowToCamel, toSnakeRow } from '../lib/caseConvert'

const SELECT = '*, candidate_notes(*), candidate_timeline_events(*), candidate_scorecards(*)'

const AVATAR_COLORS = ['navy', 'green', 'orange', 'purple', 'blue', 'pink']

function initialsFor(name) {
  const parts = name.trim().split(/\s+/)
  return ((parts[0]?.[0] ?? '') + (parts[parts.length - 1]?.[0] ?? '')).toUpperCase()
}

function colorFor(name) {
  const sum = [...name].reduce((acc, ch) => acc + ch.charCodeAt(0), 0)
  return AVATAR_COLORS[sum % AVATAR_COLORS.length]
}

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

  // A candidate can have multiple applications under the same email (career
  // site account edits), so this patches every matching row, not just one id.
  const updateCandidateByEmail = useCallback(async (email, patch) => {
    const { error } = await supabase.from('candidates').update(toSnakeRow(patch)).ilike('email', email)
    if (error) { setError(error); return }
    setCandidates((list) => list.map((c) => (c.email.toLowerCase() === email.toLowerCase() ? { ...c, ...patch } : c)))
  }, [])

  // Inserts a candidate created by the career-site application wizard, which
  // collects fields (address, employment/education/training history, WOTC)
  // that recruiter-entered candidates never have.
  const addApplication = useCallback(async ({
    jobId, name, email, phone, location, currentRole, expectedSalary, availability, linkedin, resumeFileName, skills,
    address, workAuthorization, employmentHistory, education, training, wotc,
  }) => {
    const today = new Date().toISOString().slice(0, 10)
    const row = {
      id: `cand-${Date.now()}`,
      name,
      initials: initialsFor(name),
      avatar_color: colorFor(name),
      job_id: jobId,
      stage: 'new',
      source: 'Career Site',
      location: location || '',
      email,
      phone: phone || '',
      current_role: currentRole || '',
      expected_salary: expectedSalary || '',
      availability: availability || '',
      skills: skills ? skills.split(',').map((s) => s.trim()).filter(Boolean) : [],
      linkedin: linkedin || '',
      resume_file_name: resumeFileName || '',
      address: address ?? {},
      work_authorization: workAuthorization ?? {},
      employment_history: employmentHistory ?? [],
      education: education ?? [],
      training: training ?? [],
      wotc: wotc ?? null,
      application_meta: { wizardVersion: 1, completedAt: new Date().toISOString() },
    }
    const { data, error } = await supabase.from('candidates').insert(row).select().single()
    if (error) { setError(error); return null }
    const { data: eventData, error: eventError } = await supabase.from('candidate_timeline_events')
      .insert({ candidate_id: data.id, stage: 'Application', date: today, note: 'Applied via Career Site' })
      .select().single()
    if (eventError) { setError(eventError); return null }
    const candidate = { ...shapeCandidate(data), timeline: [rowToCamel(eventData)] }
    setCandidates((list) => [...list, candidate])
    return candidate
  }, [])

  return { candidates, loading, error, updateStage, addNote, updateCandidate, updateCandidateByEmail, addApplication }
}
