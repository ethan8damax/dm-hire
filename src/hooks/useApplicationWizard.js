import { useMemo, useState } from 'react'
import { buildInitialWizardData, firstErrorEntry, validateApplication } from '../data/applicationValidation'

export const WIZARD_STEPS = [
  { key: 'personal', label: 'Personal Info' },
  { key: 'employment', label: 'Employment History' },
  { key: 'education', label: 'Education' },
  { key: 'training', label: 'Training / Certifications' },
  { key: 'wotc', label: 'WOTC Questionnaire' },
  { key: 'review', label: 'Review & Submit' },
]

export function useApplicationWizard(personalSeed) {
  const [data, setData] = useState(() => buildInitialWizardData(personalSeed))
  const [stepIndex, setStepIndex] = useState(0)
  const [visitedSteps, setVisitedSteps] = useState(() => new Set([0]))
  const [attemptedSteps, setAttemptedSteps] = useState(() => new Set())
  const [pendingFocusId, setPendingFocusId] = useState(null)

  const errors = useMemo(() => validateApplication(data), [data])

  function updateSection(sectionKey, patch) {
    setData((d) => ({ ...d, [sectionKey]: { ...d[sectionKey], ...patch } }))
  }

  function addListItem(sectionKey, blankItemFactory) {
    setData((d) => ({ ...d, [sectionKey]: [...d[sectionKey], blankItemFactory()] }))
  }

  function removeListItem(sectionKey, itemId) {
    setData((d) => ({ ...d, [sectionKey]: d[sectionKey].filter((item) => item.id !== itemId) }))
  }

  // Bulk-replaces a whole list section — used to apply resume-parsed entries,
  // never called unless the caller has already confirmed the section is still
  // untouched (see isEntryBlank), so it can't clobber real applicant input.
  function replaceListSection(sectionKey, items) {
    setData((d) => ({ ...d, [sectionKey]: items }))
  }

  function updateListItem(sectionKey, itemId, patch) {
    setData((d) => ({
      ...d,
      [sectionKey]: d[sectionKey].map((item) => (item.id === itemId ? { ...item, ...patch } : item)),
    }))
  }

  function markVisited(index) {
    setVisitedSteps((prev) => new Set(prev).add(index))
  }

  function goToStep(index) {
    setStepIndex(index)
    markVisited(index)
  }

  function markAttempted(index) {
    setAttemptedSteps((prev) => new Set(prev).add(index))
  }

  // Used by Review's "Fix" links and the submit-while-incomplete redirect —
  // unlike a plain rail click, these should surface inline errors immediately.
  function goToStepAndFlag(index, fieldId) {
    goToStep(index)
    markAttempted(index)
    focusField(fieldId)
  }

  function goNext() {
    markAttempted(stepIndex)
    const next = Math.min(stepIndex + 1, WIZARD_STEPS.length - 1)
    setStepIndex(next)
    markVisited(next)
  }

  function goBack() {
    const prev = Math.max(stepIndex - 1, 0)
    setStepIndex(prev)
    markVisited(prev)
  }

  function focusField(fieldId) {
    setPendingFocusId(fieldId)
  }

  function clearPendingFocus() {
    setPendingFocusId(null)
  }

  const canSubmit = Object.keys(errors).length === 0

  function attemptSubmit(onValid) {
    const first = firstErrorEntry(errors)
    if (first) {
      const [fieldId, { stepIndex: errStep }] = first
      goToStepAndFlag(errStep, fieldId)
      return
    }
    onValid(data)
  }

  return {
    data,
    stepIndex,
    currentStep: WIZARD_STEPS[stepIndex],
    visitedSteps,
    attemptedSteps,
    errors,
    canSubmit,
    pendingFocusId,
    updateSection,
    addListItem,
    removeListItem,
    replaceListSection,
    updateListItem,
    goToStep,
    goToStepAndFlag,
    goNext,
    goBack,
    focusField,
    clearPendingFocus,
    attemptSubmit,
  }
}
