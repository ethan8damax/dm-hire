import { useEffect } from 'react'

// Scrolls to + focuses the field targeted by Review's "Fix" links or a
// Submit-while-incomplete click, then clears the pending target. Steps are
// mounted fresh on navigation, so this fires once per arrival.
export function useFocusJump(pendingFocusId, clearPendingFocus) {
  useEffect(() => {
    if (!pendingFocusId) return
    const el = document.getElementById(pendingFocusId)
    if (el) {
      el.scrollIntoView({ block: 'center', behavior: 'smooth' })
      el.focus({ preventScroll: true })
    }
    clearPendingFocus()
  }, [pendingFocusId, clearPendingFocus])
}
