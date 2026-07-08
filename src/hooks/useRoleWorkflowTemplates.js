import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'
import { rowToCamel } from '../lib/caseConvert'

export function useRoleWorkflowTemplates() {
  const [roleWorkflows, setRoleWorkflows] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    supabase.from('role_workflow_templates').select('*').then(({ data, error }) => {
      if (error) { setError(error); setLoading(false); return }
      const byKey = {}
      rowToCamel(data).forEach((t) => {
        byKey[t.roleKey] = { label: t.label, knockoutYears: t.knockoutYears, approvalChain: t.approvalChain, stages: t.stages }
      })
      setRoleWorkflows(byKey)
      setLoading(false)
    })
  }, [])

  const updateStages = useCallback(async (roleKey, stages) => {
    const { error } = await supabase.from('role_workflow_templates').update({ stages }).eq('role_key', roleKey)
    if (error) { setError(error); return }
    setRoleWorkflows((t) => ({ ...t, [roleKey]: { ...t[roleKey], stages } }))
  }, [])

  return { roleWorkflows, loading, error, updateStages }
}
