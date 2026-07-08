import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'
import { rowToCamel, toSnakeRow } from '../lib/caseConvert'

const SELECT = '*, offer_approvals(*)'

function shapeOffer(row) {
  return { ...rowToCamel(row), approvalChain: rowToCamel(row.offer_approvals ?? []) }
}

export function useOffers() {
  const [offers, setOffers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    supabase.from('offers').select(SELECT).then(({ data, error }) => {
      if (error) setError(error)
      else setOffers(data.map(shapeOffer))
      setLoading(false)
    })
  }, [])

  const createOffer = useCallback(async (offer) => {
    const { approvalChain, startDate, ...rest } = offer
    const { data, error } = await supabase.from('offers')
      .insert(toSnakeRow({ ...rest, startDate: startDate || null }))
      .select().single()
    if (error) { setError(error); return null }
    const approvalRows = approvalChain.map((a) => ({ offer_id: data.id, ...toSnakeRow(a) }))
    const { data: approvalData, error: approvalError } = await supabase.from('offer_approvals').insert(approvalRows).select()
    if (approvalError) { setError(approvalError); return null }
    const shaped = { ...rowToCamel(data), approvalChain: rowToCamel(approvalData) }
    setOffers((list) => [...list, shaped])
    return shaped
  }, [])

  const updateOffer = useCallback(async (id, patch) => {
    const { approvalChain, ...fieldPatch } = patch
    if (Object.keys(fieldPatch).length > 0) {
      const { error } = await supabase.from('offers').update(toSnakeRow(fieldPatch)).eq('id', id)
      if (error) { setError(error); return }
    }
    if (approvalChain) {
      for (const approval of approvalChain) {
        const { error } = await supabase.from('offer_approvals')
          .update({ approved: approval.approved, date: approval.date })
          .eq('offer_id', id).eq('role', approval.role)
        if (error) { setError(error); return }
      }
    }
    setOffers((list) => list.map((o) => (o.id === id ? { ...o, ...patch } : o)))
  }, [])

  return { offers, loading, error, createOffer, updateOffer }
}
