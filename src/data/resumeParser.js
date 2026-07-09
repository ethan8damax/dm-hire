import * as pdfjsLib from 'pdfjs-dist'
import mammoth from 'mammoth'

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).href

export async function extractPdfText(file) {
  const data = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data }).promise
  let text = ''
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    // hasEOL preserves the PDF's original line breaks — without it every text
    // run on a page collapses onto one giant line, which breaks guessName below.
    for (const item of content.items) {
      text += item.str
      text += item.hasEOL ? '\n' : ' '
    }
    text += '\n'
  }
  return text
}

export async function extractDocxText(file) {
  const arrayBuffer = await file.arrayBuffer()
  const result = await mammoth.extractRawText({ arrayBuffer })
  return result.value
}

// Legacy .doc (pre-2007 binary OLE format) has no reliable pure-browser parser —
// there's no backend here to hand it off to. Best-effort: Word interleaves plain
// text runs with binary structure bytes, so scanning for sufficiently long runs
// of printable characters sometimes surfaces usable fragments. This is noisy and
// often incomplete; treat it as a lower-confidence fallback, not a real parser.
export async function extractLegacyDocText(file) {
  const buffer = await file.arrayBuffer()
  const bytes = new Uint8Array(buffer)
  let text = ''
  let run = ''
  for (const byte of bytes) {
    if (byte >= 32 && byte <= 126) {
      run += String.fromCharCode(byte)
    } else {
      if (run.length >= 4) text += `${run}\n`
      run = ''
    }
  }
  if (run.length >= 4) text += run
  return text
}

// Dispatches by extension/MIME type. Returns null for formats we don't attempt
// to parse at all (caller falls back to "upload only, no auto-fill").
export async function extractResumeText(file) {
  const name = file.name.toLowerCase()
  if (name.endsWith('.pdf') || file.type === 'application/pdf') {
    return { text: await extractPdfText(file), confidence: 'medium' }
  }
  if (name.endsWith('.docx')) {
    return { text: await extractDocxText(file), confidence: 'high' }
  }
  if (name.endsWith('.doc')) {
    return { text: await extractLegacyDocText(file), confidence: 'low' }
  }
  if (name.endsWith('.txt') || file.type === 'text/plain') {
    return { text: await file.text(), confidence: 'high' }
  }
  return null
}

const EMAIL_RE = /[\w.+-]+@[\w-]+\.[\w.-]+/
const PHONE_RE = /(\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/
const LINKEDIN_RE = /linkedin\.com\/in\/[A-Za-z0-9-_%]+/i

const US_STATE_ABBREVIATIONS = new Set([
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA',
  'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT',
  'VA', 'WA', 'WV', 'WI', 'WY', 'DC',
])
const CITY_STATE_RE = /\b([A-Z][a-zA-Z.]*(?:\s[A-Z][a-zA-Z.]*){0,2}),\s*([A-Z]{2})\b/

function guessCityStateNear(line) {
  const match = line.match(CITY_STATE_RE)
  return match && US_STATE_ABBREVIATIONS.has(match[2]) ? { city: match[1].trim(), state: match[2] } : { city: '', state: '' }
}

// "City, ST" near the top of the resume — usually the candidate's own address/
// header line, not (yet) an employer's or school's location further down.
function guessCityState(lines) {
  for (const line of lines.slice(0, 10)) {
    const found = guessCityStateNear(line)
    if (found.city) return found
  }
  return { city: '', state: '' }
}

// ---- Section heading detection (shared across every extractor below) ----
// Anchored to the WHOLE line, not a substring match — a combined heading like
// "Skills & Experience" or "Summary of Experience" must never be mistaken for
// one specific section, or whatever follows it gets misattributed.
const SECTION_MATCHERS = {
  experience: /^(?:(?:relevant|professional|work)\s+)?experience$|^employment\s+history$/i,
  education: /^education(?:al\s+background)?$/i,
  certifications: /^(?:licenses?\s*(?:&|and)\s*)?certifications?$|^certificates?$/i,
  // Deliberately doesn't match "Skills & Strengths"/"Skills & Abilities" — that
  // combined phrasing is ambiguous with noise text that sometimes lands right
  // after an Experience heading (multi-column resumes interleave badly), and
  // it's safer to miss a rare heading style than to misattribute a real one.
  skills: /^(?:(?:technical|key|core)\s+)?skills$|^core\s+competencies$|^areas?\s+of\s+expertise$|^technical\s+proficienc(?:y|ies)$/i,
  other: /^(summary|objective|profile|projects|references|awards|languages|interests|activities|volunteer(?:\s+experience)?)$/i,
}

function matchHeading(line) {
  const cleaned = line.trim().replace(/:\s*$/, '')
  if (!cleaned || cleaned.length > 40) return null
  for (const [key, re] of Object.entries(SECTION_MATCHERS)) {
    if (re.test(cleaned)) return key
  }
  return null
}

// Finds where a named section starts and where it ends (the next heading of any
// kind, or end of document) — order-independent, so it works whether Education
// comes before or after Experience.
function findSectionRange(lines, key) {
  const start = lines.findIndex((l) => matchHeading(l) === key)
  if (start === -1) return { start: -1, end: -1 }
  let end = lines.length
  for (let i = start + 1; i < lines.length; i++) {
    if (matchHeading(lines[i])) { end = i; break }
  }
  return { start, end }
}

const TITLE_KEYWORDS = /\b(Analyst|Manager|Coordinator|Specialist|Director|Engineer|Consultant|Administrator|Officer|Lead|Associate|Representative|Executive|Supervisor|Accountant|Recruiter|Developer|Assistant|Owner|Founder|President|Head)\b/i
// Other section headings that sometimes end up adjacent to an "Experience"
// heading after text extraction (e.g. multi-column resumes get their columns'
// reading order interleaved) — never a job title, so always reject as a candidate.
const NON_ROLE_HEADING_RE = /\b(skills|strengths|summary|objective|profile|competencies|qualifications|certifications?|education|projects|references|awards|languages|interests|activities|volunteer|technical)\b/i
// A lowercase letter immediately followed by an uppercase one with no space is a
// telltale sign two separate lines got glued together during text extraction.
const MERGED_TEXT_RE = /[a-z][A-Z]/

// Job-history lines commonly read "Title | Company | Dates" or "Title, Company,
// Dates" or "Title – Company" — isolate just the title portion before validating
// it, rather than validating (and rejecting on length) the whole combined line.
// Only splits on a hyphen/dash when it has spaces on both sides, so compound
// words like "Full-Stack" don't get truncated.
const TITLE_SEPARATOR_RE = /\s*\|\s*|,\s*|\s+[-–—]\s+|\s+at\s+/i
function splitSegments(line) {
  return line.split(TITLE_SEPARATOR_RE).map((s) => s.trim()).filter(Boolean)
}
function extractTitleSegment(line) {
  return splitSegments(line)[0] ?? ''
}

function looksLikeRoleCandidate(segment) {
  if (!segment || segment.length > 45) return false
  if (NON_ROLE_HEADING_RE.test(segment) || MERGED_TEXT_RE.test(segment)) return false
  if (EMAIL_RE.test(segment) || PHONE_RE.test(segment)) return false
  return true
}

// Prefer the line right after an "Experience" heading (most recent/current role
// convention) — most resumes list jobs most-recent-first, so the first valid
// candidate found is treated as the current role. Falls back to the first
// title-keyword line near the top of the resume, which often doubles as a
// professional headline under the candidate's name.
function guessCurrentRole(lines) {
  const { start } = findSectionRange(lines, 'experience')
  if (start !== -1) {
    for (const line of lines.slice(start + 1, start + 4)) {
      const trimmed = line.trim()
      if (!trimmed || /^[•*-]/.test(trimmed)) continue
      const segment = extractTitleSegment(trimmed)
      if (!looksLikeRoleCandidate(segment)) continue
      return segment
    }
  }
  for (const line of lines.slice(0, 10)) {
    const segment = extractTitleSegment(line.trim())
    if (looksLikeRoleCandidate(segment) && TITLE_KEYWORDS.test(segment)) {
      return segment
    }
  }
  return ''
}

// First short, all-capitalized-word line near the top that isn't an email/phone —
// resumes overwhelmingly lead with the candidate's name.
function guessName(lines) {
  for (const line of lines.slice(0, 8)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.length > 40 || /[\d@]/.test(trimmed)) continue
    const words = trimmed.split(/\s+/)
    if (words.length < 2 || words.length > 4) continue
    if (!words.every((w) => /^[A-Z][a-zA-Z'.-]*$/.test(w))) continue
    return trimmed
  }
  return ''
}

function cleanSkillItems(rawLines) {
  const items = rawLines
    .flatMap((line) => line
      .replace(/^[•*-]\s*/, '')
      .replace(/^[A-Za-z][\w\s]{0,25}:\s*/, '')
      .split(/[,;|]/))
    .map((s) => s.trim())
    .filter((s) => s && s.length < 40)
  return [...new Set(items)].slice(0, 8).join(', ')
}

// Some resumes put the heading and its content on one line — "Skills: ADP,
// Excel, Kronos" — rather than a heading line followed by content below it.
// matchHeading only recognizes whole-line headings, so that inline style needs
// its own check first.
const SKILLS_INLINE_RE = /^(?:(?:technical|key|core)\s+)?skills\s*:\s*(.+)$|^core\s+competencies\s*:\s*(.+)$|^areas?\s+of\s+expertise\s*:\s*(.+)$|^technical\s+proficienc(?:y|ies)\s*:\s*(.+)$/i

// Grabs every line inside a skills-type section (resumes use many names for
// this — Skills, Core Competencies, Areas of Expertise, etc). Handles bullets
// (•, *, -), a leading category label ("Technical:", "Software:"), and any of
// comma/semicolon/pipe as in-line separators — then dedupes.
function guessSkills(lines) {
  for (const line of lines) {
    const inlineMatch = line.trim().match(SKILLS_INLINE_RE)
    if (inlineMatch) {
      const content = inlineMatch.slice(1).find(Boolean) ?? ''
      return cleanSkillItems([content])
    }
  }
  const { start, end } = findSectionRange(lines, 'skills')
  if (start === -1) return ''
  return cleanSkillItems(lines.slice(start + 1, end))
}

// ---- Dates ----
const MONTH_MAP = {
  jan: '01', january: '01', feb: '02', february: '02', mar: '03', march: '03',
  apr: '04', april: '04', may: '05', jun: '06', june: '06', jul: '07', july: '07',
  aug: '08', august: '08', sep: '09', sept: '09', september: '09', oct: '10', october: '10',
  nov: '11', november: '11', dec: '12', december: '12',
}
function normalizeMonthYear(str) {
  if (!str) return ''
  const trimmed = str.trim()
  const monthYear = trimmed.match(/^([A-Za-z]+)\.?\s+(\d{4})$/)
  if (monthYear) {
    const mon = MONTH_MAP[monthYear[1].toLowerCase()]
    if (mon) return `${monthYear[2]}-${mon}`
  }
  const numeric = trimmed.match(/^(\d{1,2})\/(\d{4})$/)
  if (numeric) return `${numeric[2]}-${numeric[1].padStart(2, '0')}`
  const bareYear = trimmed.match(/^(\d{4})$/)
  if (bareYear) return `${bareYear[1]}-01`
  return ''
}
const DATE_TOKEN = '(?:[A-Za-z]+\\.?\\s+\\d{4}|\\d{1,2}\\/\\d{4}|\\d{4})'
const DATE_RANGE_RE = new RegExp(`(${DATE_TOKEN})\\s*(?:-|–|—|to)\\s*(Present|Current|${DATE_TOKEN})`, 'i')
function parseDateRange(line) {
  const m = line.match(DATE_RANGE_RE)
  if (!m) return null
  const startDate = normalizeMonthYear(m[1])
  if (!startDate) return null
  const isCurrent = /present|current/i.test(m[2])
  return { startDate, endDate: isCurrent ? '' : normalizeMonthYear(m[2]), currentlyWorking: isCurrent }
}
const YEAR_RE = /\b(19|20)\d{2}\b/

// ---- Employment history (multiple entries) ----
// Detects a new job entry by finding non-bullet lines containing a date range
// (the header row) and attributes subsequent bullet lines to that entry's
// responsibilities, until the next date-range header or the section ends.
function guessEmploymentHistory(lines) {
  const { start, end } = findSectionRange(lines, 'experience')
  if (start === -1) return []
  const entries = []
  let current = null
  for (const raw of lines.slice(start + 1, end)) {
    const trimmed = raw.trim()
    if (!trimmed) continue
    const isBullet = /^[•*-]/.test(trimmed)
    const dateRange = !isBullet ? parseDateRange(trimmed) : null
    if (dateRange) {
      if (current) entries.push(current)
      if (entries.length >= 5) { current = null; break }
      const segments = splitSegments(trimmed)
      const jobTitle = segments[0] ?? ''
      const employer = segments.find((s, i) => i > 0 && s !== jobTitle && !YEAR_RE.test(s)) ?? ''
      current = { jobTitle, employer, ...dateRange, responsibilities: '' }
    } else if (isBullet && current) {
      const bullet = trimmed.replace(/^[•*-]\s*/, '')
      const combined = current.responsibilities ? `${current.responsibilities}; ${bullet}` : bullet
      current.responsibilities = combined.slice(0, 500)
    }
  }
  if (current) entries.push(current)
  return entries.slice(0, 5)
}

// ---- Education (multiple entries) ----
const SCHOOL_KEYWORDS_RE = /\b(University|College|Institute|Academy|School)\b/i
const DEGREE_PATTERNS = [
  { re: /\bph\.?\s?d\.?\b|\bdoctorate\b/i, level: 'Doctorate' },
  { re: /\bmaster'?s?\b|\bm\.?b\.?a\.?\b|\bm\.?s\.?\b|\bm\.?a\.?\b/i, level: "Master's" },
  { re: /\bbachelor'?s?\b|\bb\.?s\.?\b|\bb\.?a\.?\b/i, level: "Bachelor's" },
  { re: /\bassociate'?s?\b|\ba\.?a\.?\b|\ba\.?s\.?\b/i, level: 'Associate' },
  { re: /\bhigh\s?school\b|\bdiploma\b|\bged\b/i, level: 'High School' },
  { re: /\bcertificate\b/i, level: 'Certificate' },
]
function guessDegreeLevel(text) {
  for (const { re, level } of DEGREE_PATTERNS) {
    if (re.test(text)) return level
  }
  return ''
}
function classifyEducationSegment(segment) {
  if (SCHOOL_KEYWORDS_RE.test(segment)) return 'school'
  if (guessDegreeLevel(segment) || /\bin\s+[A-Z]/.test(segment)) return 'degree'
  if (YEAR_RE.test(segment)) return 'date'
  return 'unknown'
}

// A degree entry is often spread across several lines — degree, a concentration/
// minor line, then a separate school+location+year line. Buffers lines until a
// year appears (the natural "this entry is complete" signal) and builds ONE
// entry from everything buffered, instead of treating each qualifying line as
// its own entry (which used to fabricate a second bogus entry out of a
// concentration or school-only line with no degree info of its own).
function buildEducationEntry(bufferLines) {
  const combinedText = bufferLines.join(' | ')
  const allSegments = bufferLines.flatMap((l) => splitSegments(l))
  let schoolName = ''
  let degreeSegment = ''
  for (const seg of allSegments) {
    const kind = classifyEducationSegment(seg)
    if (kind === 'school' && !schoolName) schoolName = seg
    else if (kind === 'degree' && !degreeSegment) degreeSegment = seg
  }
  if (!schoolName) {
    schoolName = allSegments.find((s) => classifyEducationSegment(s) === 'unknown') ?? ''
  }
  if (!schoolName && !degreeSegment) return null

  const degreeLevel = guessDegreeLevel(degreeSegment || combinedText)
  const fieldMatch = (degreeSegment || combinedText).match(/\bin\s+([A-Z][a-zA-Z\s&]{2,40}?)(?:,|\||$)/)
  const fieldOfStudy = fieldMatch ? fieldMatch[1].trim() : ''
  const { city, state } = guessCityStateNear(combinedText)
  const yearMatch = combinedText.match(YEAR_RE)
  const graduationDate = yearMatch ? `${yearMatch[0]}-05` : ''
  return { schoolName, degreeLevel, fieldOfStudy, graduationDate, city, state }
}

function guessEducation(lines) {
  const { start, end } = findSectionRange(lines, 'education')
  if (start === -1) return []
  const entries = []
  let buffer = []
  for (const raw of lines.slice(start + 1, end)) {
    const trimmed = raw.trim()
    if (!trimmed || /^[•*-]/.test(trimmed)) continue
    const hasYear = YEAR_RE.test(trimmed)
    const hasSchoolOrDegree = SCHOOL_KEYWORDS_RE.test(trimmed) || guessDegreeLevel(trimmed) || /\bin\s+[A-Z]/.test(trimmed)
    if (!hasYear && !hasSchoolOrDegree) continue

    buffer.push(trimmed)
    if (hasYear) {
      const entry = buildEducationEntry(buffer)
      if (entry) entries.push(entry)
      buffer = []
      if (entries.length >= 4) break
    }
  }
  if (buffer.length > 0 && entries.length < 4) {
    const entry = buildEducationEntry(buffer)
    if (entry) entries.push(entry)
  }
  return entries
}

// ---- Training / certifications (multiple entries) ----
function guessTraining(lines) {
  const { start, end } = findSectionRange(lines, 'certifications')
  if (start === -1) return []
  const entries = []
  for (const raw of lines.slice(start + 1, end)) {
    const trimmed = raw.replace(/^[•*-]\s*/, '').trim()
    if (!trimmed) continue
    const segments = splitSegments(trimmed)
    const name = segments[0] ?? ''
    const provider = segments[1] && !YEAR_RE.test(segments[1]) ? segments[1] : ''
    const yearMatch = trimmed.match(YEAR_RE)
    if (name && name.length <= 80 && !MERGED_TEXT_RE.test(name)) {
      entries.push({ name, provider, completionDate: yearMatch ? `${yearMatch[0]}-01` : '' })
    }
    if (entries.length >= 5) break
  }
  return entries
}

// Heuristic only — regex/keyword matching over raw extracted text, not real NLP.
// Expect low-to-medium accuracy; callers should treat results as suggestions to
// pre-fill, never as authoritative, and only apply them to still-empty fields/
// still-blank sections.
export function parseResumeText(text) {
  const lines = text.split('\n').filter(Boolean)
  const { city, state } = guessCityState(lines)
  return {
    name: guessName(lines),
    email: text.match(EMAIL_RE)?.[0] ?? '',
    phone: text.match(PHONE_RE)?.[0] ?? '',
    linkedin: text.match(LINKEDIN_RE)?.[0] ?? '',
    skills: guessSkills(lines),
    city,
    state,
    currentRole: guessCurrentRole(lines),
    employmentHistory: guessEmploymentHistory(lines),
    education: guessEducation(lines),
    training: guessTraining(lines),
  }
}
