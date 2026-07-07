---
name: DM Hire
description: Enterprise ATS prototype pairing DM Payroll's trustworthiness with a modern recruiting workflow
colors:
  navy: "#0D2D5C"
  navy-light: "#1A4080"
  navy-dark: "#081D3F"
  green: "#6DB33F"
  green-light: "#8DC85C"
  green-dark: "#4E8A28"
  dm-orange: "#E5541C"
  dm-orange-light: "#F0724A"
  gray-50: "#F8FAFC"
  gray-100: "#F1F5F9"
  gray-200: "#E2E8F0"
  gray-300: "#CBD5E1"
  gray-400: "#94A3B8"
  gray-500: "#64748B"
  gray-600: "#475569"
  gray-700: "#334155"
  gray-800: "#1E293B"
  gray-900: "#0F172A"
  success: "#22C55E"
  warning: "#F59E0B"
  danger: "#EF4444"
  info: "#3B82F6"
  badge-blue-bg: "#EFF6FF"
  badge-blue-text: "#1D4ED8"
  badge-orange-bg: "#FFF7ED"
  badge-orange-text: "#C2410C"
  badge-purple-bg: "#F5F3FF"
  badge-purple-text: "#6D28D9"
  badge-purple-dot: "#7C3AED"
  badge-green-bg-1: "#ECFDF5"
  badge-green-text-1: "#065F46"
  badge-green-bg-2: "#F0FDF4"
  badge-green-text-2: "#15803D"
  badge-red-bg: "#FEF2F2"
  badge-red-text: "#991B1B"
  badge-amber-bg: "#FFFBEB"
  badge-amber-text: "#B45309"
typography:
  display:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: "1.875rem"
    fontWeight: 800
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "0.06em"
rounded:
  sm: "4px"
  md: "8px"
  lg: "12px"
  xl: "16px"
  full: "9999px"
spacing:
  1: "0.25rem"
  2: "0.5rem"
  3: "0.75rem"
  4: "1rem"
  5: "1.25rem"
  6: "1.5rem"
  8: "2rem"
components:
  button-primary:
    backgroundColor: "{colors.navy}"
    textColor: "#FFFFFF"
    rounded: "{rounded.md}"
    padding: "12px 20px"
  button-primary-hover:
    backgroundColor: "{colors.navy-light}"
    textColor: "#FFFFFF"
    rounded: "{rounded.md}"
  button-accent:
    backgroundColor: "{colors.green}"
    textColor: "#FFFFFF"
    rounded: "{rounded.md}"
    padding: "12px 20px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.gray-600}"
    rounded: "{rounded.md}"
    padding: "12px 20px"
  card:
    backgroundColor: "#FFFFFF"
    rounded: "{rounded.lg}"
    padding: "24px"
  badge:
    rounded: "{rounded.full}"
    padding: "3px 10px"
    typography: "{typography.label}"
---

# Design System: DM Hire

## 1. Overview

**Creative North Star: "The Instrument Panel"**

DM Hire reads like the control panel of a well-built machine: navy is the housing, green is the go-signal, and every readout (a match score, a funnel stage, a metric change) is precise and legible at a glance. Nothing is decorative for its own sake — the deep navy chrome exists to recede so that data (candidate scores, pipeline counts, offer status) can be the loudest thing on the screen, the same way a cockpit gauge stays quiet until it has something urgent to say. This is deliberately not the cream-and-gradient SaaS-startup aesthetic; it's closer to enterprise financial software with better ergonomics — precise, numeric, unhurried, but never bland.

DM Hire explicitly rejects two things: **ClearCompany's dated, recruiting-only chrome** (the incumbent this product is built to outclass), and **generic admin-template SaaS** — interchangeable card grids, flat gray-on-white with no accent discipline, decorative gradients with no informational job. Every color, weight, and radius choice earns its place by making a real screen (a Kanban board, a candidate profile, a dashboard) easier to read under time pressure, whether that's a recruiter triaging 40 candidates or an executive watching a live sales demo.

**Key Characteristics:**
- Deep navy chrome, used for structure and default UI, not for excitement
- Green reserved almost exclusively as a positive/go signal (scores, success states, upward metrics)
- Orange reserved for urgency/alerts only — never a general-purpose accent
- Flat by default; shadow appears only in response to hover, focus, or a true overlay (modal)
- Inter, one family, carrying the whole hierarchy through weight and size alone

## 2. Colors

The palette is restrained and semantic — three brand colors, each with exactly one job, plus a full neutral ramp and four state colors for badges.

### Primary
- **Deep Navy** (`#0D2D5C`): the system's structural color — sidebar, headers, primary buttons, page titles, the "briefing room" register that says *enterprise, trustworthy, in control*. Used constantly but never loudly; it's chrome, not decoration.

### Secondary
- **Confident Green** (`#6DB33F`): the system's only "good news" color — AI match-score bars, positive metric deltas, Hired-column payroll-sync badges, accent buttons that move something forward (Advance, Extend, Move to Offer). If it's green, it means "this is going well."

### Tertiary
- **DM Orange** (`#E5541C`): reserved for urgency and the DM brand mark specifically — expiring-offer warnings, stale-candidate flags, "Send Reminder" actions. Never used as a general accent; its rarity is what makes it read as urgent.

### Neutral
- **Gray-50 → Gray-900** (`#F8FAFC` → `#0F172A`): a 9-step neutral ramp carrying body text (gray-700/800), secondary text (gray-400/500), borders and dividers (gray-100/200), and page background (gray-50). White is the card/surface color throughout.

### Status & Category Badges
A fixed identity ramp used by the shared `Badge` component (`components/ui/Badge.css`) for every stage, status, and category tag across the app: candidate stage, job status, offer status, integration status. Each color is a tint background + a saturated text/dot pair, never the raw brand hue at full strength. This has been consistent since Sprint 0b; it just hadn't been written down until now.

| Meaning | Background | Text / dot | Used for |
|---|---|---|---|
| New / info | `#EFF6FF` | `#1D4ED8` / `#3B82F6` | new candidates, internal notes |
| Screening / warning | `#FFF7ED` | `#C2410C` / DM Orange | phone screen stage, paused integrations |
| Interviewing / active | `#F5F3FF` | `#6D28D9` / `#7C3AED` | interview stage |
| Success / go | `#ECFDF5` or `#F0FDF4` | `#065F46` or `#15803D` | offer, hired, open, accepted, connected |
| Danger / stop | `#FEF2F2` | `#991B1B` | rejected, expired, declined |
| Pending | `#FFFBEB` | `#B45309` | pending approval, awaiting response |
| Neutral / inactive | Gray-100 | Gray-500 | draft, closed, not connected |

**Rule:** this ramp is for identity/status badges only, never for structural chrome. It doesn't compete with the Single-Job Rule below; navy/green/orange still each have exactly one job as brand colors, and this ramp is the separate, semantic vocabulary for "what state is this record in."

### Named Rules
**The Single-Job Rule.** Every brand color has exactly one semantic job — navy is structure, green is "good," orange is "urgent." None of the three is ever repurposed decoratively (no navy-as-accent-on-a-white-card, no green used for a neutral CTA). If a new screen needs a fourth meaning, it borrows from the semantic state colors (`info` `#3B82F6`, `warning` `#F59E0B`) before inventing a new brand hue.

## 3. Typography

**Display / Body / Label Font:** Inter (with `-apple-system, BlinkMacSystemFont, sans-serif` fallback) — one family for the entire system.

**Character:** A single geometric-humanist sans carrying the whole hierarchy through weight (400→800) and size alone, never a second family. This is deliberate: DM Hire's precision comes from restraint, not from typographic variety.

### Hierarchy
- **Display** (800, 1.875rem/30px, -0.02em tracking): Page titles (`.page-title`) — always navy, never black.
- **Title** (700, 1.125rem/18px, -0.02em tracking): Card headers, candidate name in the profile hero.
- **Metric** (800, up to 1.875rem, -0.02em tracking): Dashboard metric values — the one place display-weight numbers appear outside a page title.
- **Body** (400, 0.875rem/14px, 1.6 line-height): Default text color gray-800, secondary text gray-400/500. Cap prose blocks (notes, comms messages) at a comfortable reading measure even though most content here is short-form.
- **Label** (600, 0.75rem/12px, 0.06em tracking, uppercase where used): Table headers, metric labels, badge dots' adjacent text — the one place uppercase+tracking is used, and only for structural labels, never body copy.

### Named Rules
**The One-Family Rule.** Inter carries every role. A second typeface would read as decoration in a system whose whole personality is "precise instrument," not "editorial voice."

## 4. Elevation

Flat by default; shadow is a response to state, not a resting decoration. Nearly every card, table, and panel sits at `shadow-sm` or no shadow at rest. Shadow escalates only for hover lift (buttons, Kanban cards) and for the one true overlay in the system (the New Requisition modal). This keeps dense screens (a 6-column Kanban board, a data table) calm — nothing is visually "floating" unless the user is actively interacting with it.

### Shadow Vocabulary
- **sm** (`0 1px 2px rgba(0,0,0,.06), 0 1px 3px rgba(0,0,0,.1)`): Resting state for cards, metric tiles, Kanban cards. The default, almost-invisible baseline.
- **md** (`0 4px 6px rgba(0,0,0,.07), 0 2px 4px rgba(0,0,0,.06)`): Hover state for buttons and Kanban cards — the "this is now interactive" signal.
- **lg** (`0 10px 15px rgba(0,0,0,.1), 0 4px 6px rgba(0,0,0,.05)`): Reserved for larger floating elements (dropdowns, popovers) as the system grows.
- **xl** (`0 20px 25px rgba(0,0,0,.1), 0 10px 10px rgba(0,0,0,.04)`): The modal only. This is the single "this is a true overlay above everything else" shadow in the system — don't reuse it for cards.

### Named Rules
**The Flat-by-Default Rule.** Surfaces are flat at rest. Shadow appears only as a response to state (hover, focus, or true overlay) — never as ambient decoration on a resting card.

## 5. Components

### Buttons
- **Shape:** 8px radius (`--radius-md`), 12px/20px padding at default size, 600 weight, 120ms transitions.
- **Primary:** Navy fill, white text; hover lifts 1px and steps to navy-light with a `shadow-md` lift.
- **Accent:** Green fill, white text; same hover-lift pattern, used for "this moves the candidate/job forward" actions (Advance, Send for Approval, Extend).
- **Outline:** Transparent with a 1.5px navy border and navy text; fills solid navy on hover. Used sparingly.
- **Ghost:** Transparent with a 1.5px gray-200 border and gray-600 text; the default for secondary/non-committal actions (Email, Schedule, View, Edit).
- **Danger:** Solid red fill for destructive actions; a ghost-danger variant (transparent + red border) exists for lower-emphasis negative actions like "Mark Not Selected."
- **Disabled:** 50% opacity, no hover transform, no shadow — a hard, unambiguous disabled state.

### Chips
- **Filter chips:** Pill-shaped (`radius-full`), white background, gray-200 border, gray-500 text at rest; active state fills solid navy with white text. Used for the All/Mine/Needs-Action/Stale-style filter rows above every list/board view.
- **Kanban action buttons:** Same pill/rounded-rect family but semantic-toned (`default` navy-tint, `accent` green-tint, `danger` red-tint, `warn` orange-tint) — one visual language reused across every column's action pair.

### Cards / Containers
- **Corner Style:** 12px radius (`--radius-lg`) for cards; 8px (`--radius-md`) for buttons/inputs/chips — cards are always one step rounder than interactive controls.
- **Background:** White on the gray-50 page background — the only two surface tones in the system.
- **Shadow Strategy:** `shadow-sm` at rest (see Elevation); cards never gain a hover shadow themselves (only Kanban cards, which are also click targets, do).
- **Border:** 1px gray-100 hairline, doing most of the "separation from background" work rather than shadow.
- **Internal Padding:** 24px (`--space-6`) body padding is the default; headers/footers step down to 16-20px.

### Inputs / Fields
- **Style:** 1.5px gray-200 border, 8px radius, white background, Inter body size.
- **Focus:** A 2px navy-light outline with 2px offset (`:focus-visible`), not a glow or color-shift — keeps focus states consistent with the system's flat, precise character.

### Navigation
- **Detail tabs** (candidate profile, and any future tabbed panel): underline style — 2px transparent border-bottom at rest, gray-500 text; active tab turns navy text with a green underline. This is the one place green appears outside a "success" context, functioning here as a selection indicator rather than a status signal.
- **Sidebar/Topbar:** Navy sidebar as the primary navigation surface (structural color, per the Single-Job Rule); white topbar carrying search, the primary "+ New" action, and persona switching.

### Kanban Card (signature component)
The system's most information-dense component: avatar + name + location/source subtitle, an optional flexible note slot (color-coded via `noteVariant`), optional warning badges (duplicate/stale, orange/amber-toned), an optional "Top Candidate" green-ring highlight, a stage badge + AI score in the footer, and up to two semantic-toned action buttons. Every visual signal on this card is functional — nothing is decorative — which is the clearest single expression of the Instrument Panel north star.

## 6. Do's and Don'ts

### Do:
- **Do** keep navy as structural chrome (sidebar, headers, primary buttons) — it should recede so data is the loudest thing on any screen.
- **Do** reserve green exclusively for positive/forward-moving signals (scores, success badges, "advance" actions) and orange exclusively for urgency — the Single-Job Rule.
- **Do** keep cards flat (`shadow-sm` or less) at rest; escalate shadow only on hover or for the modal overlay.
- **Do** use Inter's weight scale (400/500/600/700/800) to carry hierarchy instead of introducing a second typeface.
- **Do** promote a pattern to shared CSS/components only once a second view actually needs it (the project's own established practice, e.g. `.page-header`/`.filter-strip` were promoted to `global.css` only after Sprint 2 needed what Sprint 1 built).

### Don't:
- **Don't** use `border-left`/`border-right` colored stripes as a status indicator — this system encodes status via badge fill + dot color, not side-stripes.
- **Don't** use gradient text or decorative glassmorphism anywhere — the flat, precise aesthetic has no room for either.
- **Don't** let this drift toward generic admin-template SaaS: interchangeable gray card grids with no accent discipline are exactly what DM Hire is built to look better than.
- **Don't** repurpose green or orange for anything outside their one job (green = good/forward, orange = urgent) — a green "neutral" button or an orange decorative accent breaks the Single-Job Rule and the instrument-panel legibility it protects.
- **Don't** add hover shadow-lift to resting cards that aren't click targets — only genuinely interactive elements (buttons, Kanban cards) get the lift; a static metric card or info panel stays flat even on hover.
