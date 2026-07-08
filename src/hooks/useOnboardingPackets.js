import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'
import { rowToCamel } from '../lib/caseConvert'

export function useOnboardingPackets() {
  const [onboardingPackets, setOnboardingPackets] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    supabase.from('onboarding_packets').select('*').then(({ data, error }) => {
      if (error) { setError(error); setLoading(false); return }
      const byState = {}
      rowToCamel(data).forEach((p) => {
        byState[p.state] = { state: p.stateName, documents: p.documents }
      })
      setOnboardingPackets(byState)
      setLoading(false)
    })
  }, [])

  const addDocument = useCallback(async (stateKey, doc) => {
    const nextDocs = [...onboardingPackets[stateKey].documents, doc]
    const { error } = await supabase.from('onboarding_packets').update({ documents: nextDocs }).eq('state', stateKey)
    if (error) { setError(error); return }
    setOnboardingPackets((p) => ({ ...p, [stateKey]: { ...p[stateKey], documents: nextDocs } }))
  }, [onboardingPackets])

  const removeDocument = useCallback(async (stateKey, doc) => {
    const nextDocs = onboardingPackets[stateKey].documents.filter((d) => d !== doc)
    const { error } = await supabase.from('onboarding_packets').update({ documents: nextDocs }).eq('state', stateKey)
    if (error) { setError(error); return }
    setOnboardingPackets((p) => ({ ...p, [stateKey]: { ...p[stateKey], documents: nextDocs } }))
  }, [onboardingPackets])

  const addPacket = useCallback(async (stateKey, stateName) => {
    const { error } = await supabase.from('onboarding_packets').insert({ state: stateKey, state_name: stateName, documents: [] })
    if (error) { setError(error); return }
    setOnboardingPackets((p) => ({ ...p, [stateKey]: { state: stateName, documents: [] } }))
  }, [])

  return { onboardingPackets, loading, error, addDocument, removeDocument, addPacket }
}
