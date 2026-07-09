// Pure validation for the application wizard — no React, no side effects.
// Returns a flat map of fieldId -> { stepIndex, message } for anything missing/invalid.
// A field simply not appearing in the map means it's valid (including WOTC "No" answers).

let idCounter = 0
export function nextEntryId(prefix) {
  idCounter += 1
  return `${prefix}-${idCounter}`
}

export const STEP_PERSONAL = 0
export const STEP_EMPLOYMENT = 1
export const STEP_EDUCATION = 2
export const STEP_TRAINING = 3
export const STEP_WOTC = 4
export const STEP_REVIEW = 5

export function buildBlankPersonal(seed = {}) {
  return {
    name: '', email: '', phone: '',
    street: '', city: '', state: '', zip: '',
    currentRole: '', expectedSalary: '', availability: '',
    workAuthorized: null, requiresSponsorship: null,
    linkedin: '', skills: '', resumeFileName: '',
    ...seed,
  }
}

export function buildBlankEmploymentEntry() {
  return {
    id: nextEntryId('emp'),
    employer: '', jobTitle: '', startDate: '', endDate: '',
    currentlyWorking: false, reasonForLeaving: '', responsibilities: '',
  }
}

export function buildBlankEducationEntry() {
  return {
    id: nextEntryId('edu'),
    schoolName: '', degreeLevel: '', fieldOfStudy: '',
    graduationDate: '', currentlyEnrolled: false, city: '', state: '',
  }
}

export function buildBlankTrainingEntry() {
  return {
    id: nextEntryId('trn'),
    name: '', provider: '', completionDate: '', certNumber: '', expirationDate: '',
  }
}

export const WOTC_QUESTIONS = [
  { key: 'veteran', label: 'Are you a veteran of the U.S. Armed Forces?' },
  { key: 'receivedSnapTanf', label: 'Has your family received SNAP (food stamp) or TANF benefits in the last 6 months?' },
  { key: 'felonyConvictionOrReleaseLastYear', label: 'Have you been convicted of a felony, or released from prison, within the last year?' },
  { key: 'vocationalRehabReferral', label: 'Are you referred by a vocational rehabilitation agency, Employment Network, or Ticket to Work program?' },
  { key: 'ssiRecipient', label: 'Do you currently receive Supplemental Security Income (SSI)?' },
  { key: 'longTermUnemployed', label: 'Have you been unemployed for 27 weeks or more?' },
  { key: 'summerYouthEmpowermentZone', label: 'Are you 16-17 years old and live in an Empowerment Zone (summer youth employee)?' },
]

export function buildBlankWotc() {
  const base = { consentSignatureName: '', consentSignatureDate: '', consentAffirmed: false }
  WOTC_QUESTIONS.forEach((q) => { base[q.key] = null })
  return base
}

export function buildInitialWizardData(personalSeed = {}) {
  return {
    personal: buildBlankPersonal(personalSeed),
    employmentHistory: [buildBlankEmploymentEntry()],
    education: [buildBlankEducationEntry()],
    training: [],
    wotc: buildBlankWotc(),
  }
}

function req(errors, condition, fieldId, stepIndex, message) {
  if (!condition) errors[fieldId] = { stepIndex, message }
}

const EMAIL_RE = /\S+@\S+\.\S+/

export function validateApplication(data) {
  const errors = {}
  const p = data.personal ?? {}

  req(errors, p.name?.trim(), 'personal-name', STEP_PERSONAL, 'Full name is required')
  req(errors, p.email?.trim() && EMAIL_RE.test(p.email), 'personal-email', STEP_PERSONAL, 'A valid email is required')
  req(errors, p.phone?.trim(), 'personal-phone', STEP_PERSONAL, 'Phone number is required')
  req(errors, p.street?.trim(), 'personal-street', STEP_PERSONAL, 'Street address is required')
  req(errors, p.city?.trim(), 'personal-city', STEP_PERSONAL, 'City is required')
  req(errors, p.state?.trim(), 'personal-state', STEP_PERSONAL, 'State is required')
  req(errors, p.zip?.trim(), 'personal-zip', STEP_PERSONAL, 'ZIP code is required')
  req(errors, p.currentRole?.trim(), 'personal-currentRole', STEP_PERSONAL, 'Current role is required')
  req(errors, p.expectedSalary?.trim(), 'personal-expectedSalary', STEP_PERSONAL, 'Expected salary is required')
  req(errors, p.availability?.trim(), 'personal-availability', STEP_PERSONAL, 'Availability is required')
  req(errors, p.workAuthorized !== null && p.workAuthorized !== undefined, 'personal-workAuthorized', STEP_PERSONAL, 'Please answer this question')
  if (p.workAuthorized === true) {
    req(errors, p.requiresSponsorship !== null && p.requiresSponsorship !== undefined, 'personal-requiresSponsorship', STEP_PERSONAL, 'Please answer this question')
  }
  req(errors, p.resumeFileName?.trim(), 'personal-resumeFileName', STEP_PERSONAL, 'Resume upload is required')

  const employment = data.employmentHistory ?? []
  req(errors, employment.length > 0, 'employment-section', STEP_EMPLOYMENT, 'At least one employment entry is required')
  employment.forEach((entry, i) => {
    const p2 = `employment-${i}-`
    req(errors, entry.employer?.trim(), `${p2}employer`, STEP_EMPLOYMENT, 'Employer is required')
    req(errors, entry.jobTitle?.trim(), `${p2}jobTitle`, STEP_EMPLOYMENT, 'Job title is required')
    req(errors, entry.startDate?.trim(), `${p2}startDate`, STEP_EMPLOYMENT, 'Start date is required')
    req(errors, entry.responsibilities?.trim(), `${p2}responsibilities`, STEP_EMPLOYMENT, 'A brief description is required')
    if (!entry.currentlyWorking) {
      req(errors, entry.endDate?.trim(), `${p2}endDate`, STEP_EMPLOYMENT, 'End date is required')
      req(errors, entry.reasonForLeaving?.trim(), `${p2}reasonForLeaving`, STEP_EMPLOYMENT, 'Reason for leaving is required')
    }
  })

  const education = data.education ?? []
  req(errors, education.length > 0, 'education-section', STEP_EDUCATION, 'At least one education entry is required')
  education.forEach((entry, i) => {
    const p2 = `education-${i}-`
    req(errors, entry.schoolName?.trim(), `${p2}schoolName`, STEP_EDUCATION, 'School name is required')
    req(errors, entry.degreeLevel?.trim(), `${p2}degreeLevel`, STEP_EDUCATION, 'Degree/level is required')
    req(errors, entry.fieldOfStudy?.trim(), `${p2}fieldOfStudy`, STEP_EDUCATION, 'Field of study is required')
    req(errors, entry.city?.trim(), `${p2}city`, STEP_EDUCATION, 'City is required')
    req(errors, entry.state?.trim(), `${p2}state`, STEP_EDUCATION, 'State is required')
    if (!entry.currentlyEnrolled) {
      req(errors, entry.graduationDate?.trim(), `${p2}graduationDate`, STEP_EDUCATION, 'Graduation date is required')
    }
  })

  const training = data.training ?? []
  training.forEach((entry, i) => {
    const p2 = `training-${i}-`
    req(errors, entry.name?.trim(), `${p2}name`, STEP_TRAINING, 'Training/certification name is required')
    req(errors, entry.provider?.trim(), `${p2}provider`, STEP_TRAINING, 'Provider/issuer is required')
    req(errors, entry.completionDate?.trim(), `${p2}completionDate`, STEP_TRAINING, 'Completion date is required')
  })

  const wotc = data.wotc ?? {}
  WOTC_QUESTIONS.forEach((q) => {
    req(errors, wotc[q.key] !== null && wotc[q.key] !== undefined, `wotc-${q.key}`, STEP_WOTC, 'Please answer this question')
  })
  req(errors, wotc.consentSignatureName?.trim(), 'wotc-consentSignatureName', STEP_WOTC, 'Signature (typed full name) is required')
  req(errors, wotc.consentSignatureDate?.trim(), 'wotc-consentSignatureDate', STEP_WOTC, 'Date is required')
  req(errors, wotc.consentAffirmed === true, 'wotc-consentAffirmed', STEP_WOTC, 'You must affirm this before submitting')

  return errors
}

// Whether a list entry is still exactly as a blank*() factory produced it —
// used to decide whether resume-parsed data may safely replace it (never
// overwrite something the applicant already started filling in themselves).
export function isEntryBlank(entry, buildBlank) {
  const blank = buildBlank()
  return Object.keys(blank).every((key) => key === 'id' || entry[key] === blank[key])
}

export function firstErrorEntry(errors) {
  const entries = Object.entries(errors)
  if (entries.length === 0) return null
  return entries.sort((a, b) => a[1].stepIndex - b[1].stepIndex)[0]
}
