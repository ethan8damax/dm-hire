import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'
import { rowToCamel, toSnakeRow } from '../lib/caseConvert'

const STAGES = ['new', 'screening', 'interviewing', 'offer', 'hired', 'rejected']

function computeStageCounts(jobId, candidateRows) {
  const counts = Object.fromEntries(STAGES.map((s) => [s, 0]))
  candidateRows.filter((c) => c.job_id === jobId).forEach((c) => { counts[c.stage] += 1 })
  return counts
}

export function useJobs() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    Promise.all([
      supabase.from('jobs').select('*'),
      supabase.from('candidates').select('job_id, stage'),
    ]).then(([jobsRes, candidatesRes]) => {
      if (jobsRes.error) { setError(jobsRes.error); setLoading(false); return }
      if (candidatesRes.error) { setError(candidatesRes.error); setLoading(false); return }
      const withCounts = jobsRes.data.map((j) => ({ ...j, stage_counts: computeStageCounts(j.id, candidatesRes.data) }))
      setJobs(rowToCamel(withCounts))
      setLoading(false)
    })
  }, [])

  const createJob = useCallback(async (job) => {
    const { stageCounts: _unused, ...toInsert } = job
    const { data, error } = await supabase.from('jobs').insert(toSnakeRow(toInsert)).select().single()
    if (error) { setError(error); return }
    setJobs((list) => [{ ...rowToCamel(data), stageCounts: computeStageCounts(data.id, []) }, ...list])
  }, [])

  const updateJob = useCallback(async (jobId, updates) => {
    const { data, error } = await supabase.from('jobs').update(toSnakeRow(updates)).eq('id', jobId).select().single()
    if (error) { setError(error); return }
    setJobs((list) => list.map((j) => (j.id === jobId ? { ...j, ...rowToCamel(data) } : j)))
  }, [])

  const deleteJob = useCallback(async (jobId) => {
    // .select() forces Postgrest to return the deleted rows, so an RLS-blocked
    // delete (which "succeeds" with 0 rows affected, not an error) is detectable.
    const { data, error } = await supabase.from('jobs').delete().eq('id', jobId).select()
    if (error) {
      setError(error)
      // 23503 = foreign_key_violation — candidates.job_id still references this
      // job, which Postgres correctly refuses rather than orphaning that data.
      if (error.code === '23503') return { ok: false, reason: 'has-applicants' }
      return { ok: false, reason: 'error', message: error.message }
    }
    if (!data || data.length === 0) {
      setError(new Error('Delete was blocked — no rows removed (check the jobs table\'s delete RLS policy).'))
      return { ok: false, reason: 'rls-blocked' }
    }
    setJobs((list) => list.filter((j) => j.id !== jobId))
    return { ok: true }
  }, [])

  // Called when a career-site applicant submits, so the job's applicant count
  // stays accurate for recruiters without needing a full jobs refetch.
  const recordApplicant = useCallback(async (jobId) => {
    setJobs((list) => {
      const job = list.find((j) => j.id === jobId)
      if (!job) return list
      const nextCount = job.applicantCount + 1
      supabase.from('jobs').update({ applicant_count: nextCount }).eq('id', jobId).then(({ error }) => {
        if (error) setError(error)
      })
      return list.map((j) => (j.id === jobId
        ? { ...j, applicantCount: nextCount, stageCounts: { ...j.stageCounts, new: j.stageCounts.new + 1 } }
        : j))
    })
  }, [])

  return { jobs, loading, error, createJob, updateJob, deleteJob, recordApplicant }
}
