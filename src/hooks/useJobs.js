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

  return { jobs, loading, error, createJob }
}
