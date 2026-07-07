# DM Hire — Product Design Spec
**Version:** 1.2  
**Date:** 2026-07-02  
**Author:** Ethan Maxey / Griffin Global Technologies  
**Project:** DM Hire — Applicant Tracking System for Doeren Mayhew  

---

## 1. Context & Purpose

Doeren Mayhew (DM) owns a payroll platform (DM Payroll) and wants to expand their HRIS offering by adding a purpose-built ATS they can sell alongside it. The current ATS used by DM clients is ClearCompany (via Asure Software). ClearCompany has strong recruiting UX but no native payroll. DM Payroll has strong payroll but no recruiting. The opportunity: build an ATS that delivers both, deeply integrated, with a modern UX that makes ClearCompany look dated.

**DM Hire** is that product. This spec covers a high-fidelity interactive prototype — no backend, all mock data — built to serve three audiences in sequence:

1. **Griffin Global managers (Cassie, Eli)** — internal deliverable and progress review
2. **DM stakeholders (Brandon, Sarah)** — product vision and gap-closure story
3. **DM's potential clients** — sales demo showing the full product experience

The prototype must feel like a real product, not a mockup. Every interaction should be clickable, every screen should be populated with realistic data, and every feature on the wishlist should be demonstrable.

**Key stakeholders:**
- **Brandon** — owner of DM Payroll; provided the first wishlist; cares about payroll integration, automation, and operational efficiency
- **Sarah** — relationship owner with Asure/ClearCompany; provided the second wishlist; cares about recruiter workflow, analytics, and configurability
- **Cassie Lorey** — Griffin Global PM; ultimate decision-maker on scope and deliverable quality
- **Eli Powell** — Griffin Global supervisor; focused on clarity of scope and presentation quality

---

## 2. What We Are Building

A **React single-page application** that simulates DM Hire — a full-featured ATS platform. It is:

- A **high-fidelity interactive prototype** (no real API calls, no database, no auth)
- **Deployed publicly** on Vercel from a private GitHub repo
- **Navigable** via React Router — every screen has its own URL
- **Demo-ready** with a built-in guided tour overlay and persona switcher
- **Mobile-aware** with a `/portal` route for the candidate-facing experience shown in a phone-frame mockup

---

## 3. Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | React 18 | Component model handles the many views and interactive states cleanly |
| Build tool | Vite | Fast dev server, zero config, static output Vercel can serve directly |
| Routing | React Router v6 | Client-side navigation, URL reflects current screen |
| Styling | CSS custom properties | Existing DM design tokens carry over directly; no extra dependency |
| Icons | Lucide React | Clean SVG icon set, tree-shakeable, matches the design system aesthetic |
| Charts | Recharts | Reports view needs real trend lines and breakdowns; CSS bars alone can't do it. Recharts is declarative, React-native, and lightweight |
| State | React Context + useState | Enough for demo tour state, active persona, and filters — no Redux needed |
| Data | `/src/data/*.js` mock files | All candidates, jobs, analytics in plain JS; easy to update without touching UI |
| Hosting | Vercel | Native Vite/React support, auto-deploys from GitHub main |
| Repo | Private GitHub | Source of truth; Vercel connected for CI/CD |

**No external UI library.** The existing DM design system (tokens, components) is the foundation. We build on it.

---

## 4. Brand & Design System

Inherited from existing `dm-design-system.html`. Canonical values:

**Colors:**
- Navy: `#0D2D5C` (primary, sidebar, headers, CTAs)
- Navy Light: `#1A4080`
- Navy Dark: `#081D3F`
- Green: `#6DB33F` (accent, success, hired states)
- Green Dark: `#4E8A28`
- Orange: `#E5541C` (alerts, DM brand accent, urgent)
- Gray scale: 50 through 900 (see tokens)
- Semantic: success `#22C55E`, warning `#F59E0B`, danger `#EF4444`, info `#3B82F6`

**Typography:** Inter (Google Fonts). Weight 400 body, 500–600 UI labels, 700–800 headings. Letter-spacing `-0.02em` on display text.

**Layout:**
- Sidebar: 240px, navy-dark background
- Topbar: 56px, white, sticky
- Content: scrollable, 28px padding, gray-50 background
- Cards: white, 12px radius, 1px gray-100 border, sm shadow

---

## 5. Application Structure

```
dm-hire/
├── public/
│   └── favicon.svg
├── src/
│   ├── styles/
│   │   ├── tokens.css          # All CSS custom properties
│   │   └── global.css          # Reset, body, shared utilities
│   ├── components/             # Shared UI components
│   │   ├── layout/
│   │   │   ├── Sidebar.jsx
│   │   │   ├── Topbar.jsx
│   │   │   └── AppShell.jsx
│   │   ├── ui/
│   │   │   ├── Button.jsx
│   │   │   ├── Badge.jsx
│   │   │   ├── Card.jsx
│   │   │   ├── Avatar.jsx
│   │   │   ├── ScoreBar.jsx
│   │   │   ├── MetricCard.jsx
│   │   │   ├── FilterChip.jsx
│   │   │   ├── DataTable.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── Timeline.jsx
│   │   │   ├── EmptyState.jsx
│   │   │   └── KanbanCard.jsx
│   │   └── demo/
│   │       ├── DemoTour.jsx    # Guided tour overlay
│   │       └── PersonaSwitcher.jsx
│   ├── views/
│   │   ├── Dashboard.jsx
│   │   ├── JobRequisitions.jsx # Modal for New Requisition lives here
│   │   ├── Pipeline.jsx        # Kanban board; filters reactively by persona
│   │   ├── CandidateProfile.jsx
│   │   ├── Offers.jsx
│   │   ├── Reports.jsx
│   │   ├── Integrations.jsx
│   │   ├── Settings.jsx        # Tabbed: Offices, Workflows, Onboarding, Notifs, Users, Branding
│   │   ├── InternalJobs.jsx
│   │   ├── CandidatePortal.jsx # /portal — phone-frame wrapper
│   │   └── WhyDMHire.jsx
│   ├── data/
│   │   ├── candidates.js       # See Section 5a for schema
│   │   ├── jobs.js             # See Section 5a for schema
│   │   ├── offers.js
│   │   ├── analytics.js
│   │   ├── offices.js
│   │   └── tourSteps.js        # Demo tour step definitions (see Section 6.2)
│   ├── context/
│   │   ├── PersonaContext.jsx  # Active persona (Recruiter / HM / Candidate)
│   │   └── TourContext.jsx     # Demo tour active state + current step
│   ├── App.jsx                 # Router + AppShell wrapper
│   └── main.jsx
├── index.html
├── vite.config.js
├── vercel.json                 # SPA rewrite rule — all routes serve index.html
├── README.md
└── package.json
```

### 5a. Mock Data Schemas

These are the core object shapes for mock data files. Views derive everything from these.

**`candidates.js`** — array of candidate objects:
```js
{
  id: 'cand-001',
  name: 'Jordan Alvarez',
  initials: 'JA',
  avatarColor: 'navy',            // navy | green | orange | purple | blue | pink
  jobId: 'job-001',               // which opening they applied to
  stage: 'interviewing',          // new | screening | interviewing | offer | hired | rejected
  source: 'LinkedIn',             // LinkedIn | Indeed | ZipRecruiter | Referral | Career Site | Internal
  location: 'Chicago, IL',
  email: 'j.alvarez@email.com',
  phone: '(312) 555-0142',
  currentRole: 'Payroll Sr. Assoc. · ADP',
  expectedSalary: '$95K–$105K',
  availability: '2 weeks notice',
  daysInStage: 12,
  aiScore: 87,                    // 0–100
  aiDimensions: {
    payrollExpertise: 96,
    softwareSystems: 88,
    compliance: 82,
    leadership: 74,
    cultureFit: 91,
  },
  skills: ['ADP Workforce Now', 'CPP Certified', 'Multi-state Tax'],
  priorInteraction: null,         // null | { year: 2024, role: 'Tax Analyst', recruiter: 'T. Smith' }
  isDuplicate: false,             // true shows duplicate warning badge
  isStale: false,                 // true if > 7 days no update
  isTopCandidate: false,
  notes: [{ author: 'T. Smith', office: 'Detroit', date: '2026-06-18', body: '...' }],
  timeline: [{ stage: 'Application', date: '2026-06-15', note: 'Applied via LinkedIn' }],
  scorecard: [{ interviewer: 'T. Smith', date: '2026-06-18', dimensions: { ... } }],
}
```

**`jobs.js`** — array of job objects:
```js
{
  id: 'job-001',
  title: 'Senior Payroll Analyst',
  department: 'Finance & Accounting',
  location: 'Detroit, MI',
  officeId: 'office-detroit',
  compRange: '$85K–$105K',
  postedDate: '2026-06-12',
  status: 'open',                 // open | pending_approval | draft | closed
  isInternal: false,
  roleTemplate: 'manager',        // intern | ic | manager | director | csuite | floor
  boards: ['LinkedIn', 'Indeed', 'Career Site'],
  knockoutRules: [{ field: 'yearsExperience', operator: 'gte', value: 3 }],
  approvalChain: ['hiring_manager', 'hr_director'],
  hiringManagerId: 'user-002',    // used by PersonaContext to filter HM view
  daysOpen: 18,
  applicantCount: 42,
  stageCounts: { new: 8, screening: 12, interviewing: 7, offer: 3, hired: 5, rejected: 12 },
}
```

**`offers.js`** — array of offer objects:
```js
{
  id: 'offer-001',
  candidateId: 'cand-002',
  jobId: 'job-001',
  salary: 101000,
  bonus: '10% of base',
  pto: '15 days + 10 holidays',
  startDate: '2026-08-01',
  sentDate: '2026-06-28',
  expiryDate: '2026-07-04',
  status: 'awaiting',             // awaiting | accepted | declined | expired
  approvalChain: [
    { role: 'HR Director', name: 'A. Chen', approved: true, date: '2026-06-27' },
    { role: 'VP Finance', name: 'L. Torres', approved: false, date: null },
  ],
  esigStatus: 'pending',          // pending | signed | voided
  esigSignedDate: null,
  payrollSynced: false,
}
```

**`analytics.js`** — static summary object used by the Reports view:
```js
{
  timeToFill: {
    avg: 18.4,
    byDepartment: [{ dept: 'Finance', avg: 16.2 }, { dept: 'Engineering', avg: 21.1 }],
    trend: [{ month: 'Jan', value: 22 }, { month: 'Feb', value: 20 }, ...], // 6-month array
  },
  costPerHire: {
    avg: 4210,
    bySource: [{ source: 'LinkedIn', cost: 1200 }, { source: 'Indeed', cost: 800 }],
  },
  offerAcceptanceRate: {
    overall: 0.92,
    byRoleType: [{ role: 'Manager', rate: 0.88 }, { role: 'IC', rate: 0.95 }],
    trend: [{ month: 'Jan', value: 0.85 }, ...],
  },
  interviewToOfferRatio: {
    overall: 4.2,                 // 4.2 interviews per hire on average
    byDepartment: [{ dept: 'Finance', ratio: 3.8 }],
  },
  sourceRoi: [
    { source: 'LinkedIn', applicants: 84, interviews: 22, hires: 9, conversionRate: 0.107, avgDays: 16.2 },
    { source: 'Employee Referral', applicants: 31, interviews: 14, hires: 8, conversionRate: 0.258, avgDays: 12.4 },
    { source: 'Career Site', applicants: 62, interviews: 11, hires: 4, conversionRate: 0.065, avgDays: 21.1 },
    { source: 'Indeed', applicants: 94, interviews: 8, hires: 2, conversionRate: 0.021, avgDays: 24.7 },
    { source: 'ZipRecruiter', applicants: 47, interviews: 4, hires: 0, conversionRate: 0, avgDays: null },
  ],
}
```

### 5b. Route Table

| Path | View | Notes |
|---|---|---|
| `/` | Dashboard | Default landing |
| `/jobs` | JobRequisitions | New Requisition is a modal within this view |
| `/pipeline` | Pipeline | Job selector in header; filters by persona |
| `/candidates/:id` | CandidateProfile | Prev/next arrows navigate within current filtered list |
| `/offers` | Offers | Hidden from Hiring Manager persona |
| `/reports` | Reports | Admin + Recruiter only |
| `/integrations` | Integrations | Admin only |
| `/settings` | Settings | Admin only; tabbed sub-sections |
| `/internal-jobs` | InternalJobs | Internal-only postings list |
| `/portal` | CandidatePortal | Candidate-facing; phone-frame on desktop |
| `/why-dm-hire` | WhyDMHire | All 28 gap-close cards; print-optimized |

**Vercel SPA config** (`vercel.json`) — required so refreshing any route doesn't 404:
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

---

## 6. Personas & Demo Tour

### 6.0 Sidebar Navigation Structure

The sidebar has four sections. Every route must appear exactly once:

```
RECRUITING
  Dashboard           /
  Job Requisitions    /jobs
  Candidate Pipeline  /pipeline
  Internal Jobs       /internal-jobs

TOOLS
  Offers              /offers
  Reports             /reports
  Integrations        /integrations

ADMIN
  Settings            /settings

DEMO
  Why DM Hire         /why-dm-hire   ← highlighted green, always visible
```

The "Demo" section is visible to all personas and is the entry point for the sales narrative. The `Why DM Hire` item has a distinct green highlight so it stands out as the pitch deck equivalent.

---

### 6.1 Persona Switcher

A toggle in the topbar (always visible) lets the demo presenter switch between three perspectives:

| Persona | What they see |
|---|---|
| **Recruiter** | Full access — all screens, all candidates at all stages |
| **Hiring Manager** | Restricted — only screened candidates for their assigned jobs; no offer management |
| **Candidate** | Redirects to `/portal` — the mobile-frame candidate experience |

Switching persona is instant, no reload. The sidebar nav items and candidate visibility change reactively.

### 6.2 Demo Tour

A floating "▶ Start Demo Tour" button in the topbar (distinct from the persona switcher). When active:

- A step counter appears (`Step 3 of 18`)
- A spotlight/highlight appears around the relevant UI element
- A tooltip card explains what the feature is and why it matters vs. the competition
- Prev / Next / Skip controls
- Tour can be paused and resumed
- Tour covers the **18 highest-impact features** from the wishlist (not all 28 — a 28-step tour is too long for a live meeting). Ordered to tell a story: job creation → pipeline → candidate intelligence → offer → hire → analytics → admin. The full 28-feature story lives in the Why DM Hire view.

Tour steps are defined in `/src/data/tourSteps.js` as data — each step is an object:
```js
{
  id: 'step-01',
  route: '/jobs',
  elementSelector: '[data-tour="job-board-distribution"]', // added to JSX via data-tour attr
  heading: 'One-click job board distribution',
  body: 'Post to LinkedIn, Indeed, Glassdoor, and ZipRecruiter simultaneously. Current ATS requires logging into each board separately.',
  vsCompetition: 'ClearCompany has no native distribution — all manual.',
}
```
Steps are updated without touching component code. The `data-tour` attribute convention ensures the spotlight always finds the right element.

---

## 7. Feature Inventory

Every item from Brandon and Sarah's wishlists mapped to a view and sprint.

| # | Feature | View | Sprint |
|---|---|---|---|
| 1 | Automated job posting to multiple boards | New Requisition | 2 |
| 2 | Payroll + onboarding integration | Dashboard, Pipeline (Hired col) | 1, 3 |
| 3 | Automated dept. notifications (IT, facilities) | Pipeline (Hired col log), Settings (Notifications tab) | 3, 7b |
| 4 | Applicant source tracking (LinkedIn, Indeed, etc.) | Pipeline, Candidate Profile, Reports | 3, 4, 6 |
| 5 | Role-type posting templates (intern vs. senior) | New Requisition | 2 |
| 6 | LinkedIn Recruiter connection | Integrations | 7a |
| 7 | Prior interaction history indicator | Pipeline (card), Candidate Profile | 3, 4 |
| 8 | Org-wide shared notes (cross-office) | Candidate Profile (Notes tab) | 4 |
| 9 | Electronic offer letters + e-signature | Offers, Candidate Profile (Offer tab) | 5 |
| 10 | Candidate text/SMS communication | Candidate Profile (Comms tab) | 4 |
| 11 | State-based onboarding packets | Settings (Onboarding tab), Pipeline (Hired col) | 7b |
| 12 | Approval workflows | New Requisition, Offers | 2, 5 |
| 13 | Duplicate candidate detection (beyond email) | Pipeline, Candidate Profile | 3 |
| 14 | Prev/next arrow navigation in candidate profile | Candidate Profile | 4 |
| 15 | AI qualification scoring | Pipeline cards, Candidate Profile | 3, 4 |
| 16 | New office setup + geo-based posting | Settings (Offices tab) | 7b |
| 17 | Hiring Manager role (screened-only access) | Pipeline (persona-filtered), PersonaSwitcher | 8 |
| 18 | Outlook integration (invite from client email) | Integrations, Candidate Profile (Timeline) | 7a |
| 19 | Scheduler tool (Calendly-like) | Candidate Profile (Schedule modal) | 4 |
| 20 | Knockout questions | New Requisition | 2 |
| 21 | Scorecards | Candidate Profile (Scorecard tab) | 4 |
| 22 | Mobile-optimized candidate portal | CandidatePortal (/portal) | 8 |
| 23 | Internal job board + internal-only postings | InternalJobs | 7a |
| 24 | Background check + drug screen integrations | Integrations, Candidate Profile (Docs tab) | 7a |
| 25 | Advanced reporting (TTF, CPH, OAR, IOR) | Reports | 6 |
| 26 | Configurable workflows per role type | Settings (Workflows tab) | 7b |
| 27 | Assessment tool integrations (skills/personality/cognitive) | Integrations, Candidate Profile | 7a |
| 28 | Job board performance analytics | Reports (Source ROI) | 6 |

---

## 8. Screen-by-Screen Spec

### Dashboard
- Personalized greeting with date and count of pending actions
- 4 metric cards: Open Requisitions, Active Candidates, Avg. Days to Fill, Offer Acceptance Rate
- Pipeline funnel visualization (count per stage, all jobs)
- Recent candidates table (name, role, stage, days, AI score) — rows clickable → Candidate Profile
- Action items panel (expiring offers, interviews today, approvals pending)
- DM Payroll integration status card (new hires queued, last sync time)
- Notification strip for urgent items

### Job Requisitions
- Filterable list: All / Open / Pending Approval / Draft / Closed
- Each row: job title, dept, location, comp range, posted date, applicant count, stage counts, days open, sharing tools
- "Share Link" copies clean per-job apply URL
- Status badges (Open, Draft, Pending Approval, Closed)
- Avatar stack showing top candidates
- "+ New Requisition" → New Requisition modal

### New Requisition (Modal)
- Opened from the "+ New Requisition" button; lives as a modal over the Job Requisitions view, not a separate route
- Fields: Job Title, Department, Location (auto-populates from office list), Hiring Manager, Comp Range, Start Date, Headcount Justification, Job Description
- **Role Template selector**: Intern / Individual Contributor / Manager / Director / C-Suite / Production Floor — pre-populates interview stages and knockout thresholds for that role type
- **Job Board Distribution**: checkboxes for LinkedIn, Indeed, ZipRecruiter, Glassdoor, Career Site, Internal Only toggle
- **Knockout Questions**: add/remove rules (min years, authorization, license required, etc.) with note explaining the 24-hour delayed rejection behavior
- **Approval Workflow preview**: shows the approval chain that will be triggered for this role type, so the requester knows what to expect
- Submit → simulated success state: modal shows "Submitted for approval" or "Posted to [N] boards" depending on role config; job appears in the requisitions list with correct status

### Candidate Pipeline (Kanban)
- Per-job board — job selector in header lets recruiter switch between open positions
- Columns: New Applicants → Phone Screen → Interviewing → Offer Stage → Hired → Not Selected
- Each card: avatar, name, location, source badge (LinkedIn / Indeed / Referral / etc.), AI score, days in stage, action buttons
- Duplicate detection warning badge (multi-signal, not email-only)
- Prior interaction indicator on card ("You spoke with this person in 2024 for a different role")
- Stale candidate warning (> 7 days no update)
- Top Candidate highlight ring
- Filters: All / My Candidates / Needs Action / Stale
- Sort by: Score / Days / Source
- Hired column shows DM Payroll sync status + dept notification log (IT notified, Facilities notified)
- **Persona behavior:** When persona = Hiring Manager, only candidates in Phone Screen stage or later are shown, and only for jobs assigned to that HM. No offer actions visible. This is handled by PersonaContext filtering the candidate list — no separate view file.

### Candidate Profile
- **Prev / Next arrows** in the page header to navigate between candidates in the current filtered list
- Left column: avatar, name, current stage badge, contact info, source, expected salary, availability, prior interaction history
- AI Match Score card: overall % + dimension breakdown (Expertise, Systems, Compliance, Leadership, Culture Fit) with bar chart per dimension + skill tags
- Right column tabs:
  - **Timeline** — full history from application to current stage, with notes inline
  - **Notes** — shared across org/offices; each note shows author + office location
  - **Scorecard** — structured per-dimension ratings from each interviewer
  - **Comms** — text/SMS thread + email thread in one view; compose new message
  - **Schedule** — Calendly-style availability picker; sends Outlook invite from hiring manager's email
  - **Offer** — offer details, edit, send for approval, track e-signature status
  - **Docs** — resume (auto-parsed indicator), certifications, background check status, drug screen status, signed offer letter
- Action buttons: Email, Schedule, Generate Offer, Mark Not Selected

### Offers
- List of active offers with status (Awaiting Response, Accepted, Declined, Expired)
- Expiry countdown on pending offers
- Bulk "Send Reminders" for expiring offers
- Each offer: candidate name/role, salary, sent date, expiry, status badge
- Click → offer detail with full terms + e-signature audit trail
- "Synced to DM Payroll" indicator on accepted offers

### Reports & Analytics
- **Time to Fill** — avg days, trend line, by department, by job level
- **Cost Per Hire** — total spend / hires, broken down by source spend
- **Offer Acceptance Rate** — overall + by role type + trend
- **Interview-to-Offer Ratio** — how many interviews per hire, by department
- **Per-Opening Stats** — select any job, see its full funnel performance
- **Source ROI table** — applicants / interviews / hires / conversion rate / avg days / estimated cost per source
- **Job Board Performance** — which boards are producing vs. which are dead weight

### Integrations
- Status cards for each integration: Connected / Paused / Not Connected
- **DM Payroll** — auto-sync on hire; last sync time; record count
- **Microsoft 365 / Outlook** — calendar sync, Teams interview links, invite-from-HM-email
- **LinkedIn Recruiter** — one-click import, profile matching
- **Indeed / ZipRecruiter / Glassdoor** — posting distribution status
- **Background Check (Sterling)** — triggered on offer accept; status visible in Docs tab
- **Drug Screen** — separate integration card; ordered alongside BGC
- **Assessment Tools** — skills test (Criteria Corp), personality (Predictive Index), cognitive (Wonderlic); assigned per role template
- **DM Payroll HRIS** — benefits eligibility, employee record sync

### Settings
- **Office Management** — add/edit offices; each office has a location that informs geo-based job board targeting; easy "Add Office" flow
- **Workflow Templates** — per role type (Intern / IC / Manager / Director / C-Suite / Production Floor); configure stages, approvers, SLAs per template
- **Onboarding Packets** — create/assign state-specific onboarding packet sets; each packet contains documents required by that state
- **Department Notifications** — configure which departments are notified when a hire is made (IT, Facilities, Security, Finance); configure what info they receive and when
- **User Management** — roles: Admin, Recruiter, Hiring Manager; configure what each HM can see
- **Branding** — logo, primary color override (for client demos)

### Internal Job Board
- Toggle on any requisition: "Internal Only" or "Internal + External"
- `/internal-jobs` — a candidate-facing internal portal (styled differently, shows only internal postings)
- Employees can apply directly; their existing HRIS record auto-populates the application
- Hiring team sees "Internal Applicant" badge on pipeline cards

### Candidate Portal (`/portal`)
- Rendered inside a phone-frame mockup on desktop (for demo purposes)
- Candidate-facing: apply to a job, check application status, self-schedule an interview, upload documents, review and e-sign offer letter
- Mobile-first layout, fully responsive
- Persona switcher → Candidate routes here automatically

### Why DM Hire
- All 28 wishlist features presented as gap-close cards
- Each card: current pain (red) vs. DM Hire solution (green) + "See it in action" pointer
- Summary: ATS → Onboarding → DM Payroll handoff story
- Export button (print-optimized layout)

---

## 9. Sprint Plan

Each sprint is a focused, shippable increment. The goal is that after every sprint the demo is live on Vercel and shows more than the sprint before. Sprints are sized for a working session of a few focused hours each.

---

### Sprint 0a — Scaffold & Deploy
**Goal:** Repo live, Vercel connected, design tokens in place, all routes wired to placeholder views. First deploy happens here.

- [x] Create private GitHub repo (`dm-hire`)
- [x] Initialize Vite + React project (`npm create vite@latest`) — React 19, current create-vite default
- [x] Add `vercel.json` with SPA rewrite rule
- [x] Add `README.md` with project overview and local dev instructions
- [x] Connect repo to Vercel (auto-deploy from `main`)
- [x] Port design tokens to `src/styles/tokens.css`
- [x] Port global reset + utilities to `src/styles/global.css`
- [x] Install dependencies: `react-router-dom`, `lucide-react`, `recharts`
- [x] Build AppShell (Sidebar + Topbar layout — visual only, no logic)
- [x] Wire React Router with placeholder `<div>Coming soon</div>` views for all routes in the route table
- [x] Add PersonaContext and TourContext (scaffolded, no logic yet)
- [x] Scaffold mock data files with 3–5 realistic entries each (candidates, jobs, offers, analytics, offices) matching schemas in Section 5a
- [x] First deploy — navigable shell with all routes live on Vercel

**Deliverable:** Live Vercel URL, all routes reachable, design tokens applied, no 404s on refresh.

---

### Sprint 0b — Component Library
**Goal:** Every shared UI component built, documented with a usage example, ready to be dropped into any view.

- [x] Button (variants: primary, accent, outline, ghost, danger; sizes: sm, default, lg; icon-only variant)
- [x] Badge (all candidate stage and job status variants with dot indicator)
- [x] Card (header, body, footer slots)
- [x] Avatar (sizes: sm, md, lg, xl; color variants; stacked group variant)
- [x] MetricCard (icon, label, value, change indicator)
- [x] ScoreBar (label, value %, fill color)
- [x] FilterChip (active/inactive toggle)
- [x] DataTable (columns config, rows, clickable row, sortable headers)
- [x] Modal (overlay, close button, header/body/footer slots, focus trap)
- [x] Timeline (step list, dot variants: complete/active/pending, connector line)
- [x] EmptyState (icon, title, subtitle, optional CTA)
- [x] KanbanCard (avatar, name, role, source badge, score, days, action buttons, warning states)
- [x] Simple visual test page at `/test` that renders every component in every variant — removed before final deploy

**Deliverable:** All shared components built and visually verified. Views from Sprint 1 onward import from this library.

---

### Sprint 1 — Dashboard
**Goal:** The first thing anyone sees when they open the demo looks impressive and tells the story.

- [x] Dashboard view: greeting, date, action count
- [x] 4 metric cards with realistic numbers
- [x] Pipeline funnel visualization (chevron style)
- [x] Recent candidates table (5 rows, clickable)
- [x] Action items panel (expiring offers, approvals pending, stale-candidate review — "interviews today" swapped for stale-candidate review, see Work Log)
- [x] DM Payroll integration status card
- [x] Notification strip
- [x] Topbar: search field, "+ New Requisition" button, notification bell
- [x] Persona switcher in topbar (visual only, logic in Sprint 8)

**Deliverable:** Dashboard fully populated and polished.

---

### Sprint 2 — Job Requisitions + New Requisition
**Goal:** Show the full job creation workflow including job board distribution, knockout questions, role templates, and approval routing.

- [x] Job Requisitions list view with filter chips
- [x] Job row component: title, meta, stats, avatar stack, share link, status badge
- [x] "Share Link" button copies per-job URL (clipboard API)
- [x] New Requisition modal: all fields, role template selector, job board checkboxes, knockout question builder, approval chain preview
- [x] Submit → success state with "posting to boards" animation
- [x] Pending Approval state visible in job list

**Deliverable:** Full job creation flow demonstrable.

---

### Sprint 3 — Candidate Pipeline (Kanban)
**Goal:** The pipeline is the heart of the demo. Every differentiating feature should be visible on cards.

- [x] Kanban board layout with horizontal scroll
- [x] All 6 columns with correct colors and counts
- [x] Kanban card component: avatar, name, source badge, AI score, days, action buttons
- [x] Duplicate detection warning badge (Chris Lawson pattern)
- [x] Prior interaction indicator
- [x] Stale candidate warning (> 7 days)
- [x] Top Candidate highlight ring
- [x] Hired column: DM Payroll sync badge + dept notification log (IT ✓, Facilities ✓)
- [x] Filter chips (All / My Candidates / Needs Action / Stale)
- [x] Card click → navigate to Candidate Profile
- [x] Job selector to switch between open jobs

**Deliverable:** Full Kanban board, all card states, all differentiating indicators visible.

---

### Sprint 4 — Candidate Profile
**Goal:** The deepest screen in the demo — should feel like a real product, not a mockup.

- [x] Profile layout: left card + right tabbed panel
- [x] Prev / Next navigation arrows in header
- [x] Left card: avatar, stage badge, all contact/meta info, prior interaction history
- [x] AI Match Score card: overall % + 5-dimension bars + skill tags
- [x] Timeline tab: full history, inline notes, current stage highlighted
- [x] Notes tab: shared notes with author + office location, add note input
- [x] Scorecard tab: per-interviewer ratings with dimension breakdown
- [x] Comms tab: SMS thread + email thread, compose input
- [x] Schedule tab: availability grid (Calendly-style), "Send Invite" → Outlook confirmation
- [x] Offer tab: offer terms, edit, send for approval, e-sig status
- [x] Docs tab: resume (auto-parsed), BGC status, drug screen status, signed offer

**Deliverable:** All candidate profile tabs functional and polished.

---

### Sprint 5 — Offer Management + E-Signature
**Goal:** Show the full offer lifecycle: create → approve → send → e-sign → accept → sync.

- [x] Offers list view: all active offers, expiry countdowns, status badges
- [x] Notification strip for expiring offers
- [x] Bulk send reminders action
- [x] Offer detail view: full terms, approval chain status, e-sig audit trail
- [x] E-signature flow (simulated): candidate receives link → signs → audit trail updates
- [x] Accepted offer → "Synced to DM Payroll" badge appears
- [x] Approval workflow visualization (who has approved, who is pending)

**Deliverable:** Full offer lifecycle demonstrable end-to-end.

---

### Sprint 6 — Reports & Analytics
**Goal:** Show the advanced reporting Sarah asked for — every metric, every angle.

- [x] Reports view header with date range selector
- [x] Time to Fill: avg metric + trend + by department table
- [x] Cost Per Hire: metric + source cost breakdown
- [x] Offer Acceptance Rate: metric + by role type + trend
- [x] Interview-to-Offer Ratio: metric + by department
- [x] Per-Opening stats: job selector → full funnel for that opening
- [x] Source ROI table (LinkedIn, Indeed, Referral, Career Site, ZipRecruiter)
- [x] Job Board Performance section with conversion rate highlights

**Deliverable:** Full analytics story demonstrable.

---

### Sprint 7a — Integrations + Internal Job Board
**Goal:** Show the ecosystem depth — everything connects to everything.

- [x] Integrations page: all 8 integration cards with status, description, last sync
- [x] Each card has a "Connected" / "Paused" / "Connect" state that toggles on click (simulated)
- [x] DM Payroll card shows new hire count + last sync time
- [x] Microsoft 365 card notes "invites sent from hiring manager's email"
- [x] Assessment tools card lists Criteria Corp, Predictive Index, Wonderlic
- [x] Internal Job Board view: internal-only postings, "Internal Applicant" badge on pipeline cards
- [x] Internal toggle on New Requisition wires through to this view

**Deliverable:** Integrations page fully populated; internal job board demonstrable.

---

### Sprint 7b — Settings
**Goal:** Show that DM Hire is configurable for any organization's structure.

- [x] Settings view with left-side tab navigation: Offices | Workflows | Onboarding | Notifications | Users | Branding
- [x] **Offices tab**: office list with location; "Add Office" flow (name, address, region) — shows geo-based board targeting preview
- [x] **Workflows tab**: role-type selector (Intern / IC / Manager / Director / C-Suite / Floor) → editable stage list with approver and SLA per stage
- [x] **Onboarding Packets tab**: state dropdown → list of documents assigned to that state's packet; "Add Packet" and "Edit" actions
- [x] **Notifications tab**: toggle matrix — department (IT, Facilities, Security, Finance) × trigger (Offer Accepted, Start Date -7 days, Day 1) — shows what info each dept receives
- [x] **Users tab**: table of users with role (Admin / Recruiter / HM) and assigned jobs; "Invite User" button
- [x] **Branding tab**: logo upload placeholder + primary color picker (updates the sidebar color live in the demo)

**Deliverable:** All 6 settings sub-sections functional. Org configurability story fully demonstrable.

---

### Sprint 8 — Hiring Manager View + Candidate Portal
**Goal:** Show two additional perspectives — the restricted HM view and the candidate mobile experience.

- [x] Persona switcher logic wired (Recruiter / Hiring Manager / Candidate)
- [x] Hiring Manager view: filtered pipeline showing only screened candidates for assigned jobs; no offer management; scorecard submission only
- [x] Candidate Portal route (`/portal`): phone-frame wrapper on desktop
- [x] Candidate Portal screens: job search → apply → application status → self-schedule → e-sign offer
- [x] Mobile-first layout inside the phone frame
- [x] Persona → Candidate automatically routes to `/portal`

**Deliverable:** All three personas switchable and demonstrable.

---

### Sprint 9 — Demo Tour + Why DM Hire
**Goal:** Add the narrative layer that transforms the prototype into a sales tool.

- [x] TourContext wired with step state, active flag, current step index
- [x] DemoTour overlay component: spotlight, tooltip card, step counter, prev/next/skip
- [x] 18 tour steps defined in `tourSteps.js` (route, element, heading, body, "vs. competition" line) — covering the highest-impact features in narrative order
- [x] Tour auto-navigates to the correct route for each step
- [x] "Why DM Hire" view rebuilt: all 28 gap-close cards (not just 8)
- [x] ATS → Onboarding → DM Payroll story section
- [x] Export / print-optimized layout for Why DM Hire

**Deliverable:** Guided tour fully functional. Why DM Hire covers all 28 features.

---

### Sprint 10 — Polish & QA
**Goal:** Make it feel like a product, not a prototype.

- [x] Remove `/test` component page (built in Sprint 0b for development only)
- [x] Verify all Sprint 0a placeholder routes are fully replaced — no "Coming soon" remaining
- [x] Consistent micro-animations: card hover lift, modal enter/exit fade, tab switch, tour spotlight pulse
- [x] Responsive audit: sidebar collapses gracefully on narrow viewports (laptop screens)
- [x] Empty states for all views (no candidates, no jobs, etc.) — verify EmptyState component is wired everywhere
- [x] Loading shimmer states on data tables (simulated 300ms `setTimeout` delay to feel live — no real network call)
- [x] Final data pass: realistic names, numbers, dates, dollar amounts, office locations throughout all mock files
- [ ] Cross-browser check: Chrome, Safari, Edge — **not done**, no browser tool available this session (see Work Log)
- [x] Vercel deployment verified: all routes work on hard refresh (SPA rewrite rule confirmed via curl against every route, including ones added since Sprint 0a)
- [ ] Share final Vercel URL with Griffin Global team — **Ethan's action, not mine**

**Deliverable:** Production-quality demo live on Vercel. Ready for Brandon and Sarah.

---

## 10. Work Log

*Entries added as sprints are completed.*

| Date | Sprint | Status | Notes |
|---|---|---|---|
| 2026-07-02 | Spec | ✅ Complete | Design spec written and approved |
| 2026-07-02 | 0a | ✅ Complete | Vite+React app scaffolded at repo root (`ethan8damax/dm-hire`, private). Design tokens + global reset ported from `dm-design-system.html`. AppShell (Sidebar/Topbar) built, all 11 routes wired with placeholder views, PersonaContext/TourContext scaffolded (no logic), mock data files populated (3–5 entries each) per Section 5a schemas. Deployed to Vercel: https://dm-hire.vercel.app — GitHub-connected for auto-deploy on push to `main`. Hard-refresh on nested routes verified (no 404s). Used React 19 (create-vite's current default) instead of React 18 — no behavioral difference for this app's usage. |
| 2026-07-02 | 0b | ✅ Complete | All 12 shared UI components built in `src/components/ui/` (Button, Badge, Card, Avatar, MetricCard, ScoreBar, FilterChip, DataTable, Modal, Timeline, EmptyState, KanbanCard), each co-located with its CSS. Visual patterns ported directly from `dm-design-system.html` and `dm-hire-demo.html` reference files rather than redesigned from scratch. `/test` route added rendering every variant — flagged for removal in Sprint 10. Modal has a real (dependency-free) focus trap + Escape/overlay-click close. Verified via `npm run build`, `npm run lint`, and route/module resolution checks; no browser/screenshot tool was available in this session so visual QA was code-trace + build-verified, not eyeballed in an actual browser — worth a manual look before Sprint 1. |
| 2026-07-02 | 1 | ✅ Complete | Dashboard built with real data derived from `src/data/*` (no hardcoded numbers except the two-tier ink-color ramp). Added `PipelineFunnel` to `components/ui/` (reusable — Sprint 6's "Per-Opening Stats" funnel will reuse it) using the dataviz skill's procedure: funnel stage is an **ordinal** encoding (position in a sequence), not categorical, so it's a single-hue green ramp with monotone lightness, not 5 arbitrary hues. Validated with `validate_palette.js --ordinal` (all 4 checks pass) plus a manual WCAG contrast pass to place the navy/white ink crossover so every segment's label clears 4.5:1. Topbar filled in (search, + New Requisition → `/jobs`, notification bell, persona switcher wired to `PersonaContext` for visual state only — no filtering behavior yet, that's Sprint 8). Fixed a data inconsistency from Sprint 0a: `cand-001` was `interviewing` while its linked `offer-003` was already accepted/signed/synced — moved to `hired` so the payroll status card tells a coherent story. Action Items panel substitutes a stale-candidate-review item for the spec's "interviews today" — there's no interview-scheduling data model yet (arrives with the Schedule tab in Sprint 4), so a fabricated calendar entry would've been disconnected from real data; used what the mock data actually supports instead. `Card`'s Header/Body/Footer subcomponents now forward arbitrary props (`style`, etc.) — needed for the payroll card's inverted button and avoided `!important` overrides. |
| 2026-07-02 | 2 | ✅ Complete | Job Requisitions list + New Requisition modal, per spec kept in `JobRequisitions.jsx` (single file, matches the Section 5 file tree note). Jobs held in local component state seeded from `data/jobs.js` so submitting the modal actually appends a new row with the correct computed status — `pending_approval` when the role template's approval chain has more than one step, `open` otherwise, `draft` via "Save Draft". Role Template selector (6 templates) drives three things at once from one config object: interview-stage preview, default knockout rule, and the approval-chain preview — avoids maintaining three separate mappings. Knockout question builder is fully add/remove/edit, not just static display. Submit runs a two-phase (posting → success) inline state inside the same `Modal`, no separate route. Promoted `.page-header`/`.page-title`/`.page-subtitle`/`.filter-strip` from one-off Dashboard styles to `global.css` — the reference demo uses this exact page-chrome pattern on every remaining view, so this avoids re-declaring it 6 more times. |
| 2026-07-02 | 3 | ✅ Complete | Candidate Pipeline Kanban board. Sprint 0a's 5-candidate sample was too thin to demonstrate a full 6-column board on the flagship job (job-001 only had candidates in "offer" and "hired") — added 4 more candidates (cand-006..009) so job-001 has one candidate in every column, matching the reference mockup's approach of showing a handful of illustrative cards per column while the column-count badge displays the larger real number from `job.stageCounts`. Reworked `KanbanCard` (built generically in 0b, before the real screen requirements were known) to match what this screen actually needs: location+source subtitle instead of role, a flexible `note`/`noteVariant` slot for column-specific context (applied-N-days-ago, offer countdown from `offers.js`, payroll sync + dept notification log), a `priorInteraction` indicator (previously missing), and a generic `actions` array instead of hardcoded Schedule/Move buttons so each column can show its own pair (Phone Screen/Decline, Advance/Feedback, Send Reminder/Extend, etc.) — action buttons are decorative only, matching the reference mockup's own `onclick`-less buttons; no stage-transition logic was requested. Filter chips are real: "My Candidates" checks `notes[].author === 'T. Smith'` (the same assumed-logged-in recruiter established in the Sprint 1 Dashboard greeting), "Needs Action" covers stale + duplicate + an awaiting offer expiring soon. Job selector reads/writes the `?job=` query param already wired from the Sprint 2 job-row click-through. |
| 2026-07-07 | 3 (follow-up) | 🔧 Fix | Audit before starting Sprint 4 found `KanbanCard` supported an `actions` prop but `Pipeline.jsx`'s `cardPropsForColumn` never actually populated it — no card in any column rendered action buttons despite the checklist being marked done. Wired the per-column pairs described in the original log entry (New: Phone Screen/Decline; Phone Screen: Scorecard/Advance→ or Contact/Decline when stale; Interviewing: Feedback/Move to Offer; Offer: Send Reminder/Extend; Hired/Not Selected: none), matching the reference demo exactly. Added `.kc-act-warn` (orange) tone to `KanbanCard.css` for Send Reminder. Verified with `npm run lint` + `npm run build` (both clean); no browser/screenshot tool available this session, so this is code-trace + build-verified, not eyeballed. |
| 2026-07-07 | 4 | ✅ Complete | Candidate Profile — the deepest screen, kept as a single `CandidateProfile.jsx` per the Section 5 file tree (473-line `JobRequisitions.jsx` was already precedent for a single large view file). The reference demo (`dm-hire-demo.html`) only mocks 4 of the 7 required tabs (Timeline, Notes, Offer, Docs) — Scorecard, Comms, and Schedule are net-new, designed to match the existing card/tag/badge visual language since there was no markup to port. Timeline tab is **computed**, not hand-authored per candidate: reuses each candidate's existing `timeline`/`scorecard`/`notes` array entries as historical (complete) steps, then auto-appends the remaining forward pipeline stages (Phone Screen → Interview → Offer Management → DM Payroll Handoff) as active/pending based on `candidate.stage` — avoids hand-writing a narrative for all 9 candidates while still giving every one of them a coherent, correct timeline. Comms tab seeds an initial "Application submitted via {source}" email so the thread is never blank, then compose is local state (SMS/email) per candidate. Offer tab reads the real `offers.js` entry when one exists (cand-001/002/004); otherwise "Generate Offer" creates an editable local draft, and "Send for Approval" runs the same posting→success two-phase pattern as the Sprint 2 modal, auto-approving the chain and flipping status to `awaiting`. Docs tab's BGC/drug-screen/signed-offer rows are **derived**, not stored — status computed from `candidate.stage` (not_started/in_progress/cleared) and from the shared `offer` state (lifted to the parent so Offer and Docs tabs stay in sync) — no new data fields needed. **Prev/Next respects "the current filtered list"** per spec (not just same-job): `Pipeline.jsx` now passes the board's flattened, currently-filtered/sorted candidate id order via router `state` on card click; `CandidateProfile` falls back to same-job order if a candidate is opened via direct URL (no `state`). All profile-scoped local state (notes, offer draft, active tab) resets via a `useEffect` keyed on `id`/`candidate` — React Router doesn't remount the component on a route-param-only change, so without this, clicking Next would carry the previous candidate's note draft into the new one; Comms/Schedule tabs are additionally given `key={candidate.id}` since they hold their own thread/slot-selection state and would otherwise leak across candidates if the user clicked Next while already on that tab. Verified with `npm run lint` + `npm run build` (clean); no browser/screenshot tool available this session, so this is code-trace + build-verified, not eyeballed in an actual browser — worth a manual look. This sprint's work sat uncommitted until the start of Sprint 5, when it was committed as-is. |
| 2026-07-07 | 5 | ✅ Complete | Offer Management + E-Signature. Per a direct steer from the user, the "offer detail view" the spec calls for is **not** a new component — it's the existing Sprint 4 `OfferTab` inside `CandidateProfile.jsx`, reused. `Offers.jsx` (previously a stub) is a `DataTable` list of every `offers.js` record with candidate/job lookups joined in; row click navigates to `/candidates/:id` with router `state: { tab: 'offer' }`, and `CandidateProfile` now reads `location.state?.tab` (falling back to `'timeline'`) to preselect the tab — same state-passing mechanism `Pipeline.jsx` already uses for prev/next order, just carrying a tab name instead of an id list. E-sig audit trail is **derived**, not a new stored array — one new field (`esigViewedDate`) plus the existing `sentDate`/`esigSignedDate` render as a 3-step trail, continuing Sprint 4's "derived over stored" pattern for the Docs tab. The simulated sign flow lives entirely in `OfferTab`: "Simulate: Candidate Opens Link" and "Simulate: Candidate Signs →" buttons call the same lifted `onChange`/`setOffer` the Offer tab already used for editing, walking `esigStatus` `pending → viewed → signed` and, on signing, flipping `offer.status` to `accepted` and (after a second delayed update, echoing the existing send-for-approval two-phase pattern) `payrollSynced` to `true`, which is what surfaces the "Synced to DM Payroll" row. Bulk "Send Reminders" is a single button (posting→"sent" two-phase, no per-row selection — spec asked for a bulk action, not a multi-select UI). Data fixes made to unblock the demo: `offer-001`'s `expiryDate` was already 3 days past "today" (2026-07-07) despite `status: 'awaiting'`, so nothing was actually "expiring soon"; moved it to 2026-07-10. Added `offer-004` (`declined`, `cand-006`) since no existing offer used that status and the spec's status list names it explicitly. Also fixed Dashboard's `expiringOffers` filter to exclude already-negative `daysLeft` (it only checked `<= 5`, so an overdue-but-still-`awaiting` offer would double-count as "expiring soon") — found while building the identical filter for the new Offers page and wanted the two views to agree. Playwright MCP is configured but unusable in this environment: it targets the `chrome` channel specifically, no `/Applications/Google Chrome.app` is installed, and the bundled fallback install requires interactive `sudo`. Verified with `npm run lint` + `npm run build` (clean); no browser available this session, so again code-trace + build-verified only. |
| 2026-07-07 | 6 | ✅ Complete | Reports & Analytics. `analytics.js` (seeded back in Sprint 0a) already had every metric the spec asks for — Time to Fill, Cost Per Hire, Offer Acceptance Rate, Interview-to-Offer Ratio, Source ROI — so this sprint was pure view work, no new mock data. Reused `PipelineFunnel` (built in Sprint 1 specifically anticipating this) for Per-Opening Stats, driven by a job-select dropdown over `jobs[].stageCounts`. Reused `MetricCard`'s existing `change` prop for the two metrics that have trend arrays (Time to Fill, Offer Acceptance) — note the sign is **inverted** for Time to Fill before passing it in, since `MetricCard` colors "up" green as "good," but a falling time-to-fill (fewer days) is the improvement, not a rising one; got this wrong on the first pass and caught it self-reviewing against the dataviz skill's "delta color = direction × whether up is good" rule. Added one new shared component, `TrendChart` (`components/ui/`), for the two trend line series — didn't exist before, no chart component in the library did line/trend, so this was built following the dataviz skill's read-first procedure: single series (no legend needed), 2px round-join line, 4px end-dot with a surface ring, hover crosshair that snaps to the nearest point via pointer-position math (not per-point listeners), a tooltip that only ever restates a value also visible as the direct end-label or gridline scale (never gates data), and hairline gray gridlines. Colors pulled from the project's own navy/green tokens already in `global.css`, not the dataviz skill's generic placeholder palette. Merged the spec's "Source ROI table" and "Job Board Performance" bullets into one `DataTable` (source/applicants/interviews/hires/conversion/avg days/est. cost/performance badge) rather than building two views over identical rows — the spec's own bullets describe the same data twice, once raw and once as a highlight, so a `performance` badge column (Top Performer / Underperforming) covers both without duplicating the table. Cost Per Hire's per-source breakdown and Source ROI's est.-cost column both join `analytics.costPerHire.bySource` by source name — no new field added to either array. Verified with `npm run lint` + `npm run build` (clean); Playwright still unusable in this environment (see Sprint 5 entry), so no browser eyeball this session either. |
| 2026-07-07 | 7a | ✅ Complete | Integrations + Internal Job Board. Read the spec's Integrations bullet list literally against "8 cards": counting `Indeed / ZipRecruiter / Glassdoor` as one combined "Job Boards" card (posting distribution status, one integration in practice) makes the bullet list add up to exactly 8 — new `src/data/integrations.js` has one entry per card, each with `status: connected \| paused \| not_connected`. Connect/Pause/Resume is local state seeded from the data module (same "lift into local state" pattern as jobs/offers elsewhere) — clicking Connect on the one `not_connected` card (DM Payroll HRIS) runs the same posting→success two-phase pattern used everywhere else in the app. Added `connected`/`paused`/`not_connected` variants to the shared `Badge` component, reusing the exact existing color pairs (`accepted`→green, `awaiting`→amber, `draft`→gray) rather than inventing new ones. For Internal Job Board: no job in the seed data was actually `isInternal: true` (all 5 defaulted false since Sprint 0a), so the New Requisition modal's already-wired internal toggle (built in Sprint 2) had nothing to point at — flipped `job-002` (Staff Accountant, Troy) to `isInternal: true` and emptied its `boards` array to match the invariant the New Requisition modal itself enforces (`boards: form.internalOnly ? [] : form.boards`). `InternalJobs.jsx` is deliberately **not** a copy of the recruiter-facing `JobRequisitions` list — the spec describes it as candidate-facing ("employees can apply directly"), so it's a simpler card grid with an "Apply" button that simulates HRIS auto-populate, not an admin table. For the "Internal Applicant" pipeline badge: flagged `cand-005` (already on job-002) as `isInternalApplicant: true` and changed its `source` to `'Internal Job Board'` for narrative consistency, then added the badge to `KanbanCard.jsx` reusing the exact blue tokens already on that file's `kc-prior` badge rather than picking a new color. Verified with `npm run lint` + `npm run build` (clean); Playwright still unusable in this environment. |
| 2026-07-07 | 7b | ✅ Complete | Settings. Extracted the New Requisition modal's local `ROLE_TEMPLATES` (Sprint 2) into a new shared `src/data/workflows.js` (`roleWorkflows`), enriching each stage from a plain string into `{ name, approver, slaDays }` so the Workflows tab's "editable stage list with approver and SLA per stage" requirement could be met — without this, the same six role templates would have existed as two independently-editable copies (`JobRequisitions.jsx` and Settings), which would drift and read as a bug the moment someone compared the two screens in a demo. `JobRequisitions.jsx` now imports the shared file; its one call site that read `template.stages` as plain strings was updated to `.map(s => s.name)`, no other behavior change. Three new data files: `workflows.js` (above), `users.js` (7 users — `user-002..005` deliberately reuse the same IDs already referenced by `jobs[].hiringManagerId`, and `A. Chen`/`L. Torres` are the same names already used as named approvers in `offers.js`, so Settings > Users ties back to data that already existed rather than introducing disconnected fake people), and `onboardingPackets.js` (MI/IL, matching the states already in `offices.js`). Workflow stage edits and onboarding-packet document edits are local component state only, reset on tab/selection change — consistent with this being a demo of configurability, not a persistence layer (nothing in this app persists). Branding tab's color picker is a real, live effect: `document.documentElement.style.setProperty('--color-navy-dark', hex)` — that's the actual CSS variable `Sidebar.css` reads for its background, so picking a color visibly repaints the sidebar immediately; added a "Reset to Default" button so there's no dead end if a user picks an odd color. Verified with `npm run lint` + `npm run build` (clean); Playwright still unusable in this environment, so — as with every sprint since 0b — this has not been visually eyeballed in a browser, only code-traced. |
| 2026-07-07 | 8 | ✅ Complete | Hiring Manager view + Candidate Portal. `PersonaContext` existed since Sprint 0a but was visual-only (Sprint 1 log); this sprint gives it real behavior. Picked `user-002` (R. Patel, from Sprint 7b's `users.js`) as the assumed logged-in Hiring Manager — he's already assigned to `job-001` (the flagship job, fully populated across every pipeline stage) and `job-005`, so switching personas has real, richly-populated data to filter down to rather than an empty board. `Pipeline.jsx`'s HM restriction is column-level, not just action-level: the "New Applicants" and "Offer Stage" columns are hidden outright (not just their actions) for `persona === 'hiring_manager'`, since "only screened candidates" and "no offer management" both read as visibility restrictions, not just disabled buttons — the remaining screening/interviewing/hired/rejected columns get a single "📝 Scorecard" action instead of the recruiter's full action set. `CandidateProfile.jsx` mirrors this: the Offer tab is removed from the tab bar, its content is guarded from rendering even if `activeTab` were somehow still `'offer'` (defensive, since router `state` could theoretically pass a stale tab), and both "Generate Offer" buttons (header + hero) are hidden. `Sidebar.jsx` now filters `NAV_SECTIONS` per persona — HM sees only Dashboard + Candidate Pipeline; everything recruiter/admin-specific (Job Requisitions, Internal Jobs, Offers, Reports, Integrations, Settings) is hidden, matching the sprint goal's own "restricted view" framing even though the checklist only named Pipeline explicitly. **Candidate Portal is a new full-page route, moved outside `AppShell`** in `App.jsx` (previously grouped with all other views) — a phone-frame mockup with no recruiter sidebar/topbar makes no sense inside the recruiter chrome; it's now a sibling of the dev-only `/test` route. Clicking the "Candidate" persona button in `Topbar.jsx` both sets the persona and navigates to `/portal` directly (`handlePersonaChange`), satisfying "Persona → Candidate automatically routes to /portal" at the exact point of the switch rather than via a watching effect. The portal itself is a single-file local-state wizard (`step`: search → apply → status → schedule → offer), reusing the shared `Timeline` component for application status and a simplified inline copy of `CandidateProfile`'s Calendly-style scheduling grid (not exported from that file, and small enough that duplicating it was cheaper than refactoring a shared export out of a 600+ line view for one reuse). The phone-frame bezel only renders above 768px (`@media (min-width: 768px)`) — below that it's a full-bleed mobile screen, per spec's "mobile-first layout inside the phone frame." Added an explicit "Exit candidate view" control (resets persona to recruiter, navigates home) since the portal has no other way back into the admin app — avoiding the kind of dead-end the Sprint 4 critique flagged. Verified with `npm run lint` + `npm run build` (clean); Playwright still unusable in this environment. **Git workflow note:** this sprint went straight to `main`, no feature branch — a branch-per-sprint workflow was tried for exactly one sprint (7b) and reversed by Ethan the same day. |
| 2026-07-07 | 9 | ✅ Complete | Demo Tour + Why DM Hire. `TourContext` (scaffolded since 0a) gained real `start`/`stop`/`next`/`prev`; a new `DemoTour.jsx` (`components/demo/`, the directory Sprint 0a's file tree reserved for it) is the actual spotlight overlay — it reads the current step from a new `src/data/tourSteps.js` (18 entries), calls `navigate(step.route)` on every step change, then `document.querySelector(step.elementSelector)` to find the target and render a spotlight box (`box-shadow: 0 0 0 9999px` trick — one positioned div, not four masking rectangles) plus a tooltip card with step counter, heading/body/vs-competition copy, and Prev/Next/Skip. **The 18 steps needed real, already-rendered DOM anchors** — modal-gated elements (e.g. the knockout-question editor, which only exists once the New Requisition modal is open) were deliberately avoided so the tour never has to simulate opening a modal; every `data-tour` attribute added (`JobRequisitions.jsx` ×3, `Pipeline.jsx` ×1 + `KanbanCard.jsx` ×2, `CandidateProfile.jsx`'s tab bar via one generic `data-tour={`tour-cp-${t.key}`}` covering 5 tabs at once, `Offers.jsx` ×2, `Reports.jsx` ×2, `Integrations.jsx`/`InternalJobs.jsx`/`Settings.jsx` ×1 each) targets something that renders on a plain route visit. One step (`tour-candidate-intel`, duplicate detection) had to route to `/pipeline?job=job-002` specifically — no job-001 candidate has `isDuplicate: true`, only `cand-003` on job-002 does, so the step's own route carries the right job via the query param Pipeline.jsx already reads, rather than changing seed data just for the tour. The tour intentionally skips `/portal` and any Hiring-Manager-persona step — `DemoTour` is mounted inside `AppShell` (next to `Topbar`), and `/portal` is a sibling route outside `AppShell` (per Sprint 8), so the overlay literally isn't present there; switching personas mid-tour would also fight the tour's own route-driven navigation. **Why DM Hire** is fully data-driven from a new `src/data/whyDmHireFeatures.js` — all 28 wishlist items from the spec's own Section 7 Feature Inventory table, each with a pain/solution pair (written to match the reference demo's `dm-hire-demo.html` gap-card pattern, which only mocked 8 of the 28) and a "See it in action" pointer that's a real clickable nav button, not just text. Export is a real `window.print()` call with `@media print` rules (hide chrome/buttons, single-column card grid, force the navy banner's background color to print) — a native browser API rather than a PDF-generation library. Verified with `npm run lint` + `npm run build` (clean); Playwright still unusable in this environment, so the spotlight positioning math (getBoundingClientRect timing after route change, the 150ms settle delay) is reasoned through and code-traced, not watched running — worth an actual click-through before a live demo. |
| 2026-07-07 | 10 | ✅ Mostly Complete | Polish & QA — run with the `impeccable:impeccable` skill's `polish` flow at Ethan's request. Setup pulled in the project's real `PRODUCT.md`/`DESIGN.md` (register: `product`) and, per the flow's own instructions, the one deferred critique still sitting in `.impeccable/critique/` (Sprint 4, Candidate Profile + Kanban actions, score 20/40) — that critique had been intentionally deferred since Sprint 4 ("come back once the MVP is built"), and Sprint 10 is that dedicated pass. **All of it got fixed, not just logged:** both P0s (detail tabs were fully keyboard/screen-reader unreachable — converted the tab strip to a real `role="tablist"`/`role="tab"` pattern with arrow-key navigation and matching `role="tabpanel"` content wrappers; "Mark Not Selected" was a dead button with a destructive hover-fill that over-promised an effect it didn't have — added a `window.confirm` + local-only "marked not selected" banner with Undo, still no global stage mutation per the project's own "no stage-transition logic unless asked" principle), both P1s (a real bug — `buildTimeline()`'s `scorecard[i] ?? scorecard[length-1]` fallback was repeating the same scorecard entry across multiple timeline steps whenever a candidate had fewer scorecards than stages passed, confirmed against `cand-004`; removed the fallback entirely rather than patch around it — root cause, not symptom. Also: expired offers had zero recovery actions, a dead end — added a "Resend Offer →" button that reuses the exact same `onSendForApproval` handler already wired for drafts, no new logic needed), and the P2s (the two "Generate Offer" buttons said that even when a real offer already existed, since they only ever switched tabs — now read "View Offer" when `offer` is truthy; the offer-panel gradient's secondary label text measured 4.23:1 against the lighter end of the navy→navy-light gradient, below the 4.5:1 AA floor — computed the WCAG luminance math by hand to confirm, then bumped `rgba(255,255,255,.55)` → `.65`, which computes to ~5.25:1 at the same point). Also fixed two things the critique's "Minor Observations" flagged: Pipeline's Offer column showed a "Send Reminder" action unconditionally regardless of whether the offer was actually close to expiring — gated it to the same `daysUntil` ≤5-and-≥0 window Dashboard/Offers already use; Notes/Comms compose Send buttons silently no-op'd on empty input — added `disabled` so the UI states match the real requirement instead of failing silently. **Then the Sprint 10 checklist itself:** removed `/test` + `ComponentTest.jsx` entirely; confirmed zero "Coming soon" stubs remain (grep, clean); added the four missing animation types (modal enter/exit via a `rendered`/`closing` state machine in `Modal.jsx` so unmounting isn't instant, a shared `[role="tabpanel"] { animation: tabpanel-in }` rule in `global.css` that covers every current and future tab panel with one selector, and a `box-shadow`-only pulsing ring on the tour spotlight) plus **one global `prefers-reduced-motion` rule** in `global.css` that flattens every animation/transition duration to near-zero app-wide, rather than annotating each animation individually; added an icon-only collapse breakpoint (1100px) to `Sidebar.jsx`/`.css` for laptop-narrow viewports, with `aria-label` added to nav links so the collapsed icon-only state doesn't lose its accessible name; audited every view for reachable empty states and found one real gap (Settings' Workflows tab lets you remove every stage via the row `X` button, leaving a blank list with no message) — fixed with the same `.settings-hint` pattern already used one tab over, not a new component, for a nested list this small; added shimmer-loading support directly to the shared `DataTable` component (a `loading` prop rendering skeleton rows) plus a new `src/hooks/useSimulatedLoad.js` (this repo's first hook — justified now because the same 3-line "simulate a 300ms load" pattern was about to be duplicated across 5 call sites: Offers, three tables in Reports, and Settings' Users tab) rather than duplicating the timeout logic five times; did a data pass across `src/data/*.js` (grepped for lorem/placeholder/TBD-style tells — none found) and confirmed every `TODAY` constant across views agrees on `2026-07-07`. Vercel deployment check was done via `curl` against `/`, `/pipeline`, `/candidates/cand-002`, `/portal`, and `/settings` on the live URL — all 200s, confirming the existing catch-all SPA rewrite in `vercel.json` still covers every route added since Sprint 0a without needing changes. **Two checklist items are explicitly not done by me**: cross-browser check (still no browser tool available this session — same limitation as every prior sprint) and sharing the final URL with the Griffin Global team (that's Ethan's action to take, not something an agent should do on his behalf). Verified with `npm run lint` + `npm run build` after every single fix in this sprint (not just at the end) — clean throughout. |
| 2026-07-07 | Post-MVP | ✅ Complete | Design audit + cleanup, on branch `design-audit-cleanup`. Ethan asked for a full whole-app `impeccable:impeccable` design audit (not scoped to one file) checking specifically for AI slop, then a branch to fix what it found — the first real use of the git-branch workflow since the "revisit once all 10 sprints are done" trigger point. Ran the plugin's deterministic `detect.mjs` scanner across all of `src/` and did a manual pass against the plugin's Absolute Bans list. Verdict: mostly clean (no gradient text, no glassmorphism, no hero-metric template, no card-grid sameness, no numbered-eyebrow scaffolding), but three real findings: (1) emoji used as UI icons/copy flourish, inconsistent with the rest of the app's all-lucide icon vocabulary; (2) a genuine, named Absolute Ban hit — `Timeline.css`'s `.timeline-note` had a `border-left: 3px solid green` side-stripe accent; (3) ~70 real em-dash instances in rendered copy (`tourSteps.js`, `whyDmHireFeatures.js`, and most views), which reads as a distinct LLM-writing tell once you notice the density. Fixed all three: swapped all 28 Why DM Hire emoji icons for lucide components via a new `icon` key + `ICON_MAP` in `WhyDMHire.jsx` (kept `whyDmHireFeatures.js` framework-agnostic, matching every other file in `data/` — no React imports there) — note `Linkedin` isn't exported by the installed lucide-react version (brand icons were dropped), used `Users` instead; removed every other emoji/unicode-symbol flourish (👋 🎉 ✦ ✓ ⚠ 📝) across Dashboard/Offers/Pipeline/CandidatePortal, replacing with existing lucide icon components where the symbol was doing an icon's job, or plain text where it was pure decoration; rewrote all ~70 em-dash instances with contextually appropriate punctuation (period, colon, comma) rather than a blind find-replace — left the handful of single-em-dash "empty cell" placeholders (`?? '—'` in Offers/Reports/Settings/CandidateProfile) as a separate, legitimate UI convention but swapped them to plain hyphens anyway per Ethan's literal "any em-dash" ask; removed the Timeline side-stripe entirely (the background tint already does the separation job, per the ban's own suggested fix). Also closed the systemic gap the color-advisory noise pointed at all session: added a "Status & Category Badges" section to `DESIGN.md` documenting the badge-color ramp that's been consistently reused since Sprint 0b but never written down, plus the actual hex values to the frontmatter `colors:` map so the detector recognizes them going forward — re-ran `detect.mjs` after and `design-system-color` findings dropped from 65 to 25 (remaining ones are other one-off colors already individually reviewed as legitimate reuse earlier in the session, not new drift). Verified with `npm run lint` + `npm run build` after every fix. **This work is on `design-audit-cleanup`, pushed but not merged** — first real exercise of the resumed branch workflow; Ethan pulls/merges to `main` on his own schedule. |

---

## 11. Decisions & Rationale

| Decision | Why |
|---|---|
| React + Vite over plain HTML | The existing single-file demo will become unmanageable with 15+ views and complex state. Component model is essential. |
| No UI library (Tailwind, shadcn, etc.) | Existing DM design system is complete and well-specified. Adding a library creates conflicts and dependencies without benefit. |
| Lucide React for icons | Emoji icons in the existing demo look unprofessional at demo scale. Lucide is lightweight, consistent, and matches the clean aesthetic. |
| Recharts for charts | Reports view requires real trend lines, bar comparisons, and funnel shapes. CSS-only bars can't do this credibly. Recharts is the lightest React-native charting library that doesn't fight a custom design system. |
| CSS custom properties over CSS-in-JS | Tokens are already defined this way; no reason to change. Keeps the styling readable and portable. |
| Persona switcher over separate apps | One app with a toggle is dramatically easier to maintain and more impressive in a live demo than navigating between URLs. |
| HM persona filters existing views via context | No separate `HiringManagerView.jsx` file — PersonaContext filters the candidate list in `Pipeline.jsx` and hides offer-related UI. One source of truth, no duplicated layout code. |
| Phone-frame wrapper for candidate portal | Lets the presenter show the mobile experience without leaving the desktop app — better for a meeting/screen-share context. |
| Mock data in JS files | Fast to update, no server needed, easy to version in Git alongside the UI code. |
| `vercel.json` rewrite rule | Vercel serves a static site; without a catch-all rewrite, refreshing any route besides `/` returns a 404. One config line fixes this permanently. |
| Sprint 0 split into 0a + 0b | Scaffold + deploy (0a) and component library (0b) are independent concerns. Splitting lets each session end with a clean deliverable rather than a half-built shell. |
| Sprint 7 split into 7a + 7b | Integrations and Settings are both substantial screens. Combining them would make Sprint 7 the largest in the plan by far. |
| Sprint-based delivery | Allows iterative review with Griffin managers after each sprint; each sprint is a shippable, deployed increment. |
