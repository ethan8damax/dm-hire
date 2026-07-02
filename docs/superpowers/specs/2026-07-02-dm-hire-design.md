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

- [ ] Dashboard view: greeting, date, action count
- [ ] 4 metric cards with realistic numbers
- [ ] Pipeline funnel visualization (chevron style)
- [ ] Recent candidates table (5 rows, clickable)
- [ ] Action items panel (expiring offers, interviews, approvals)
- [ ] DM Payroll integration status card
- [ ] Notification strip
- [ ] Topbar: search field, "+ New Requisition" button, notification bell
- [ ] Persona switcher in topbar (visual only, logic in Sprint 8)

**Deliverable:** Dashboard fully populated and polished.

---

### Sprint 2 — Job Requisitions + New Requisition
**Goal:** Show the full job creation workflow including job board distribution, knockout questions, role templates, and approval routing.

- [ ] Job Requisitions list view with filter chips
- [ ] Job row component: title, meta, stats, avatar stack, share link, status badge
- [ ] "Share Link" button copies per-job URL (clipboard API)
- [ ] New Requisition modal: all fields, role template selector, job board checkboxes, knockout question builder, approval chain preview
- [ ] Submit → success state with "posting to boards" animation
- [ ] Pending Approval state visible in job list

**Deliverable:** Full job creation flow demonstrable.

---

### Sprint 3 — Candidate Pipeline (Kanban)
**Goal:** The pipeline is the heart of the demo. Every differentiating feature should be visible on cards.

- [ ] Kanban board layout with horizontal scroll
- [ ] All 6 columns with correct colors and counts
- [ ] Kanban card component: avatar, name, source badge, AI score, days, action buttons
- [ ] Duplicate detection warning badge (Chris Lawson pattern)
- [ ] Prior interaction indicator
- [ ] Stale candidate warning (> 7 days)
- [ ] Top Candidate highlight ring
- [ ] Hired column: DM Payroll sync badge + dept notification log (IT ✓, Facilities ✓)
- [ ] Filter chips (All / My Candidates / Needs Action / Stale)
- [ ] Card click → navigate to Candidate Profile
- [ ] Job selector to switch between open jobs

**Deliverable:** Full Kanban board, all card states, all differentiating indicators visible.

---

### Sprint 4 — Candidate Profile
**Goal:** The deepest screen in the demo — should feel like a real product, not a mockup.

- [ ] Profile layout: left card + right tabbed panel
- [ ] Prev / Next navigation arrows in header
- [ ] Left card: avatar, stage badge, all contact/meta info, prior interaction history
- [ ] AI Match Score card: overall % + 5-dimension bars + skill tags
- [ ] Timeline tab: full history, inline notes, current stage highlighted
- [ ] Notes tab: shared notes with author + office location, add note input
- [ ] Scorecard tab: per-interviewer ratings with dimension breakdown
- [ ] Comms tab: SMS thread + email thread, compose input
- [ ] Schedule tab: availability grid (Calendly-style), "Send Invite" → Outlook confirmation
- [ ] Offer tab: offer terms, edit, send for approval, e-sig status
- [ ] Docs tab: resume (auto-parsed), BGC status, drug screen status, signed offer

**Deliverable:** All candidate profile tabs functional and polished.

---

### Sprint 5 — Offer Management + E-Signature
**Goal:** Show the full offer lifecycle: create → approve → send → e-sign → accept → sync.

- [ ] Offers list view: all active offers, expiry countdowns, status badges
- [ ] Notification strip for expiring offers
- [ ] Bulk send reminders action
- [ ] Offer detail view: full terms, approval chain status, e-sig audit trail
- [ ] E-signature flow (simulated): candidate receives link → signs → audit trail updates
- [ ] Accepted offer → "Synced to DM Payroll" badge appears
- [ ] Approval workflow visualization (who has approved, who is pending)

**Deliverable:** Full offer lifecycle demonstrable end-to-end.

---

### Sprint 6 — Reports & Analytics
**Goal:** Show the advanced reporting Sarah asked for — every metric, every angle.

- [ ] Reports view header with date range selector
- [ ] Time to Fill: avg metric + trend + by department table
- [ ] Cost Per Hire: metric + source cost breakdown
- [ ] Offer Acceptance Rate: metric + by role type + trend
- [ ] Interview-to-Offer Ratio: metric + by department
- [ ] Per-Opening stats: job selector → full funnel for that opening
- [ ] Source ROI table (LinkedIn, Indeed, Referral, Career Site, ZipRecruiter)
- [ ] Job Board Performance section with conversion rate highlights

**Deliverable:** Full analytics story demonstrable.

---

### Sprint 7a — Integrations + Internal Job Board
**Goal:** Show the ecosystem depth — everything connects to everything.

- [ ] Integrations page: all 8 integration cards with status, description, last sync
- [ ] Each card has a "Connected" / "Paused" / "Connect" state that toggles on click (simulated)
- [ ] DM Payroll card shows new hire count + last sync time
- [ ] Microsoft 365 card notes "invites sent from hiring manager's email"
- [ ] Assessment tools card lists Criteria Corp, Predictive Index, Wonderlic
- [ ] Internal Job Board view: internal-only postings, "Internal Applicant" badge on pipeline cards
- [ ] Internal toggle on New Requisition wires through to this view

**Deliverable:** Integrations page fully populated; internal job board demonstrable.

---

### Sprint 7b — Settings
**Goal:** Show that DM Hire is configurable for any organization's structure.

- [ ] Settings view with left-side tab navigation: Offices | Workflows | Onboarding | Notifications | Users | Branding
- [ ] **Offices tab**: office list with location; "Add Office" flow (name, address, region) — shows geo-based board targeting preview
- [ ] **Workflows tab**: role-type selector (Intern / IC / Manager / Director / C-Suite / Floor) → editable stage list with approver and SLA per stage
- [ ] **Onboarding Packets tab**: state dropdown → list of documents assigned to that state's packet; "Add Packet" and "Edit" actions
- [ ] **Notifications tab**: toggle matrix — department (IT, Facilities, Security, Finance) × trigger (Offer Accepted, Start Date -7 days, Day 1) — shows what info each dept receives
- [ ] **Users tab**: table of users with role (Admin / Recruiter / HM) and assigned jobs; "Invite User" button
- [ ] **Branding tab**: logo upload placeholder + primary color picker (updates the sidebar color live in the demo)

**Deliverable:** All 6 settings sub-sections functional. Org configurability story fully demonstrable.

---

### Sprint 8 — Hiring Manager View + Candidate Portal
**Goal:** Show two additional perspectives — the restricted HM view and the candidate mobile experience.

- [ ] Persona switcher logic wired (Recruiter / Hiring Manager / Candidate)
- [ ] Hiring Manager view: filtered pipeline showing only screened candidates for assigned jobs; no offer management; scorecard submission only
- [ ] Candidate Portal route (`/portal`): phone-frame wrapper on desktop
- [ ] Candidate Portal screens: job search → apply → application status → self-schedule → e-sign offer
- [ ] Mobile-first layout inside the phone frame
- [ ] Persona → Candidate automatically routes to `/portal`

**Deliverable:** All three personas switchable and demonstrable.

---

### Sprint 9 — Demo Tour + Why DM Hire
**Goal:** Add the narrative layer that transforms the prototype into a sales tool.

- [ ] TourContext wired with step state, active flag, current step index
- [ ] DemoTour overlay component: spotlight, tooltip card, step counter, prev/next/skip
- [ ] 18 tour steps defined in `tourSteps.js` (route, element, heading, body, "vs. competition" line) — covering the highest-impact features in narrative order
- [ ] Tour auto-navigates to the correct route for each step
- [ ] "Why DM Hire" view rebuilt: all 28 gap-close cards (not just 8)
- [ ] ATS → Onboarding → DM Payroll story section
- [ ] Export / print-optimized layout for Why DM Hire

**Deliverable:** Guided tour fully functional. Why DM Hire covers all 28 features.

---

### Sprint 10 — Polish & QA
**Goal:** Make it feel like a product, not a prototype.

- [ ] Remove `/test` component page (built in Sprint 0b for development only)
- [ ] Verify all Sprint 0a placeholder routes are fully replaced — no "Coming soon" remaining
- [ ] Consistent micro-animations: card hover lift, modal enter/exit fade, tab switch, tour spotlight pulse
- [ ] Responsive audit: sidebar collapses gracefully on narrow viewports (laptop screens)
- [ ] Empty states for all views (no candidates, no jobs, etc.) — verify EmptyState component is wired everywhere
- [ ] Loading shimmer states on data tables (simulated 300ms `setTimeout` delay to feel live — no real network call)
- [ ] Final data pass: realistic names, numbers, dates, dollar amounts, office locations throughout all mock files
- [ ] Cross-browser check: Chrome, Safari, Edge
- [ ] Vercel deployment verified: all routes work on hard refresh (SPA rewrite rule confirmed)
- [ ] Share final Vercel URL with Griffin Global team

**Deliverable:** Production-quality demo live on Vercel. Ready for Brandon and Sarah.

---

## 10. Work Log

*Entries added as sprints are completed.*

| Date | Sprint | Status | Notes |
|---|---|---|---|
| 2026-07-02 | Spec | ✅ Complete | Design spec written and approved |
| 2026-07-02 | 0a | ✅ Complete | Vite+React app scaffolded at repo root (`ethan8damax/dm-hire`, private). Design tokens + global reset ported from `dm-design-system.html`. AppShell (Sidebar/Topbar) built, all 11 routes wired with placeholder views, PersonaContext/TourContext scaffolded (no logic), mock data files populated (3–5 entries each) per Section 5a schemas. Deployed to Vercel: https://dm-hire.vercel.app — GitHub-connected for auto-deploy on push to `main`. Hard-refresh on nested routes verified (no 404s). Used React 19 (create-vite's current default) instead of React 18 — no behavioral difference for this app's usage. |
| 2026-07-02 | 0b | ✅ Complete | All 12 shared UI components built in `src/components/ui/` (Button, Badge, Card, Avatar, MetricCard, ScoreBar, FilterChip, DataTable, Modal, Timeline, EmptyState, KanbanCard), each co-located with its CSS. Visual patterns ported directly from `dm-design-system.html` and `dm-hire-demo.html` reference files rather than redesigned from scratch. `/test` route added rendering every variant — flagged for removal in Sprint 10. Modal has a real (dependency-free) focus trap + Escape/overlay-click close. Verified via `npm run build`, `npm run lint`, and route/module resolution checks; no browser/screenshot tool was available in this session so visual QA was code-trace + build-verified, not eyeballed in an actual browser — worth a manual look before Sprint 1. |

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
