---
name: DM Hire
description: Enterprise ATS prototype pairing DM Payroll's trustworthiness with a modern recruiting workflow
colors:
  maroon: "#6D174E"
  maroon-light: "#8F2D6B"
  maroon-dark: "#4A0F37"
  cyan: "#28A6BC"
  cyan-light: "#59C2D3"
  cyan-dark: "#145571"
  dm-orange: "#F26F2D"
  dm-orange-light: "#F6935F"
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
  success: "#28A6BC"
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
    fontFamily: "Libre Baskerville, Georgia, 'Times New Roman', serif"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "-0.01em"
  title:
    fontFamily: "Archivo, -apple-system, BlinkMacSystemFont, Arial, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "-0.01em"
  body:
    fontFamily: "Archivo, -apple-system, BlinkMacSystemFont, Arial, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Archivo, -apple-system, BlinkMacSystemFont, Arial, sans-serif"
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
    backgroundColor: "{colors.maroon}"
    textColor: "#FFFFFF"
    rounded: "{rounded.md}"
    padding: "12px 20px"
  button-primary-hover:
    backgroundColor: "{colors.maroon-light}"
    textColor: "#FFFFFF"
    rounded: "{rounded.md}"
  button-accent:
    backgroundColor: "{colors.cyan}"
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

**Creative North Star: "The Instrument Panel, in Doeren Mayhew's own colors"**

DM Hire reads like the control panel of a well-built machine: maroon is the housing, cyan is the go-signal, and every readout (a match score, a funnel stage, a metric change) is precise and legible at a glance. Nothing is decorative for its own sake — the deep maroon chrome exists to recede so that data (candidate scores, pipeline counts, offer status) can be the loudest thing on the screen, the same way a cockpit gauge stays quiet until it has something urgent to say. This is deliberately not the cream-and-gradient SaaS-startup aesthetic; it's closer to enterprise financial software with better ergonomics — precise, numeric, unhurried, but never bland.

DM Hire explicitly rejects two things: **ClearCompany's dated, recruiting-only chrome** (the incumbent this product is built to outclass), and **generic admin-template SaaS** — interchangeable card grids, flat gray-on-white with no accent discipline, decorative gradients with no informational job. Every color, weight, and radius choice earns its place by making a real screen (a Kanban board, a candidate profile, a dashboard) easier to read under time pressure, whether that's a recruiter triaging 40 candidates or an executive watching a live sales demo.

**This palette and type system are Doeren Mayhew's real corporate identity**, not an invented one — see `Doeren Mayhew Employee Branding Guidelines` (Ethan's copy, 2026-07-07). Sprints 0a–10 shipped with a placeholder navy/green/Inter system; this pass (branch `design-system-rebrand`, 2026-07-07) replaced it with DM's actual Maroon/Orange/Cyan palette and Mackinac/Tenon type pairing (substituted with the Google Fonts DM's own guide names, Libre Baskerville/Archivo, for on-screen use — see Section 3). The Instrument Panel metaphor and every structural principle below survive the swap unchanged; only the specific hues and typeface changed.

**Key Characteristics:**
- Deep maroon chrome, used for structure and default UI, not for excitement
- Cyan reserved almost exclusively as a positive/go signal (scores, success states, upward metrics) — merged with the generic "success" semantic so there is exactly one positive color in the system, not two
- Orange reserved for urgency/alerts only — never a general-purpose accent
- Flat by default; shadow appears only in response to hover, focus, or a true overlay (modal)
- Libre Baskerville (serif) for the single most prominent headline per screen; Archivo (sans) for everything else — mirroring Doeren Mayhew's own "Mixing Typefaces" rule rather than one family for everything

## 2. Colors

The palette is restrained and semantic — three brand colors, each with exactly one job, plus a full neutral ramp and four state colors for badges. All three brand colors are drawn directly from Doeren Mayhew's Level 1 palette (Maroon PMS 2357, Orange PMS 3564, Cyan PMS 6128 / Teal PMS 7700) — four of their seven official colors, used deliberately rather than the full seven at once.

### Primary
- **Maroon** (`#6D174E`, DM's PMS 2357): the system's structural color — sidebar, headers, primary buttons, page titles, the "briefing room" register that says *enterprise, trustworthy, in control*. Used constantly but never loudly; it's chrome, not decoration.

### Secondary
- **Cyan** (`#28A6BC`, DM's PMS 6128, with Teal `#145571`/PMS 7700 as its dark variant): the system's only "good news" color — AI match-score bars, positive metric deltas, Hired-column payroll-sync badges, accent buttons that move something forward (Advance, Extend, Move to Offer). If it's cyan, it means "this is going well." Doeren Mayhew doesn't have a semantic green in their real palette, so this replaces the placeholder green entirely — including the generic `success` state color, which now points at the same cyan rather than an off-brand green.

### Tertiary
- **DM Orange** (`#F26F2D`, DM's real PMS 3564): reserved for urgency and the DM brand mark specifically — expiring-offer warnings, stale-candidate flags, "Send Reminder" actions. Never used as a general accent; its rarity is what makes it read as urgent.

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

**Rule:** this ramp is for identity/status badges only, never for structural chrome. It doesn't compete with the Single-Job Rule below; maroon/cyan/orange still each have exactly one job as brand colors, and this ramp is the separate, semantic vocabulary for "what state is this record in." (These category colors — blue, purple, red, amber, plus the green-toned success tints — are conventional UI-status hues, not drawn from DM's brand palette; only the three Single-Job brand colors above carry DM identity.)

### Named Rules
**The Single-Job Rule.** Every brand color has exactly one semantic job — maroon is structure, cyan is "good," orange is "urgent." None of the three is ever repurposed decoratively (no maroon-as-accent-on-a-white-card, no cyan used for a neutral CTA). If a new screen needs a fourth meaning, it borrows from the semantic state colors (`info` `#3B82F6`, `warning` `#F59E0B`) before inventing a new brand hue.

## 3. Typography

**Display Font:** Libre Baskerville (serif, with `Georgia, 'Times New Roman', serif` fallback) — the substitute Doeren Mayhew's own brand guide names for their real primary typeface, Mackinac, when it isn't installed.

**Body / Label Font:** Archivo (sans, with `-apple-system, BlinkMacSystemFont, Arial, sans-serif` fallback) — the substitute for Tenon, DM's real secondary typeface.

**Character:** A genuine serif + sans pairing, not one family stretched across every role. This mirrors Doeren Mayhew's own "Mixing Typefaces" guidance directly: *"the most prominent headline in any application uses [the serif] Book and [the sans] Bold... this treatment should only be used for the highest-level message per deliverable."* In practice that means the display serif appears in exactly one place per screen (the page title, matching that "one headline per deliverable" rule) and the sans carries every dense, data-heavy surface — tables, badges, buttons, form fields — where a serif at 12–14px would hurt legibility. This is a deliberate synthesis, not a literal transcription of DM's print/editorial collateral: their own guide uses the serif for both headline and body copy in whitepapers and insight articles, but a dense admin tool (this app) is a different register than an editorial page, so the split follows their *typeface pairing logic* rather than their *print body-copy convention*.

### Hierarchy
- **Display** (Libre Baskerville 700, 1.5rem/24px, -0.01em tracking): Page titles (`.page-title`) and the sidebar wordmark — always maroon, never black. The one place per screen the serif appears.
- **Title** (Archivo 700, 1.125rem/18px, -0.01em tracking): Card headers, candidate name in the profile hero.
- **Metric** (Archivo 800, up to 1.875rem, -0.01em tracking): Dashboard metric values — the one place display-weight numbers appear outside a page title.
- **Body** (Archivo 400, 0.875rem/14px, 1.6 line-height): Default text color gray-800, secondary text gray-400/500. Cap prose blocks (notes, comms messages) at a comfortable reading measure even though most content here is short-form.
- **Label** (Archivo 600, 0.75rem/12px, 0.06em tracking, uppercase where used): Table headers, metric labels, badge dots' adjacent text — the one place uppercase+tracking is used, and only for structural labels, never body copy.

### Named Rules
**The Display/Body Rule.** Libre Baskerville marks the single most prominent headline per screen; Archivo carries everything else — body, labels, buttons, data. Never mix the serif into dense or small-size UI (badges, table cells, form inputs); never let the sans appear in the one page-title slot the serif owns.

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
- **Primary:** Maroon fill, white text; hover lifts 1px and steps to maroon-light with a `shadow-md` lift.
- **Accent:** Cyan fill, white text; same hover-lift pattern, used for "this moves the candidate/job forward" actions (Advance, Send for Approval, Extend).
- **Outline:** Transparent with a 1.5px maroon border and maroon text; fills solid maroon on hover. Used sparingly.
- **Ghost:** Transparent with a 1.5px gray-200 border and gray-600 text; the default for secondary/non-committal actions (Email, Schedule, View, Edit).
- **Danger:** Solid red fill for destructive actions; a ghost-danger variant (transparent + red border) exists for lower-emphasis negative actions like "Mark Not Selected."
- **Disabled:** 50% opacity, no hover transform, no shadow — a hard, unambiguous disabled state.

### Chips
- **Filter chips:** Pill-shaped (`radius-full`), white background, gray-200 border, gray-500 text at rest; active state fills solid maroon with white text. Used for the All/Mine/Needs-Action/Stale-style filter rows above every list/board view.
- **Kanban action buttons:** Same pill/rounded-rect family but semantic-toned (`default` maroon-tint, `accent` cyan-tint, `danger` red-tint, `warn` orange-tint) — one visual language reused across every column's action pair.

### Cards / Containers
- **Corner Style:** 12px radius (`--radius-lg`) for cards; 8px (`--radius-md`) for buttons/inputs/chips — cards are always one step rounder than interactive controls.
- **Background:** White on the gray-50 page background — the only two surface tones in the system.
- **Shadow Strategy:** `shadow-sm` at rest (see Elevation); cards never gain a hover shadow themselves (only Kanban cards, which are also click targets, do).
- **Border:** 1px gray-100 hairline, doing most of the "separation from background" work rather than shadow.
- **Internal Padding:** 24px (`--space-6`) body padding is the default; headers/footers step down to 16-20px.

### Inputs / Fields
- **Style:** 1.5px gray-200 border, 8px radius, white background, Archivo body size.
- **Focus:** A 2px maroon-light outline with 2px offset (`:focus-visible`), not a glow or color-shift — keeps focus states consistent with the system's flat, precise character.

### Navigation
- **Detail tabs** (candidate profile, and any future tabbed panel): underline style — 2px transparent border-bottom at rest, gray-500 text; active tab turns maroon text with a cyan underline. This is the one place cyan appears outside a "success" context, functioning here as a selection indicator rather than a status signal.
- **Sidebar/Topbar:** Maroon sidebar as the primary navigation surface (structural color, per the Single-Job Rule); white topbar carrying search, the primary "+ New" action, and persona switching.

### Kanban Card (signature component)
The system's most information-dense component: avatar + name + location/source subtitle, an optional flexible note slot (color-coded via `noteVariant`), optional warning badges (duplicate/stale, orange/amber-toned), an optional "Top Candidate" cyan-ring highlight, a stage badge + AI score in the footer, and up to two semantic-toned action buttons. Every visual signal on this card is functional — nothing is decorative — which is the clearest single expression of the Instrument Panel north star.

## 6. Logo

DM Hire does not yet have Doeren Mayhew's real logo asset. The sidebar currently renders a placeholder text wordmark ("DM Hire", set in `--font-family-display`, maroon on the maroon-dark sidebar background) — this is **not** DM's actual mark, which pairs a serif "DoerenMayhew" logotype (in Mackinac) with an orange abstract ribbon/swoosh symbol, in horizontal (primary) and vertical (narrow-space) layouts, with full-color/one-color/semi-reversed/reversed variants.

The branding guidelines PDF only contains embedded slide-deck preview images of the logo, not usable production files. **Before the real logo can go in this app, Doeren Mayhew needs to provide the actual asset files** (PNG or SVG at minimum, ideally the full AI/EPS/PDF/JPG/PNG set their guide mentions) — this is a hard blocker, not something to approximate from the PDF screenshots. Once real files exist: replace the placeholder in `Sidebar.jsx`'s `.sidebar-logo` div, respecting DM's documented minimum size (1"/96px horizontal) and clear-space rules, and never recoloring, stretching, or using the symbol/logotype independently per their logo rules.

## 7. Do's and Don'ts

### Do:
- **Do** keep maroon as structural chrome (sidebar, headers, primary buttons) — it should recede so data is the loudest thing on any screen.
- **Do** reserve cyan exclusively for positive/forward-moving signals (scores, success badges, "advance" actions) and orange exclusively for urgency — the Single-Job Rule.
- **Do** keep cards flat (`shadow-sm` or less) at rest; escalate shadow only on hover or for the modal overlay.
- **Do** use Archivo's weight scale (400/500/600/700/800) for every role except the single page-title moment, which is Libre Baskerville.
- **Do** promote a pattern to shared CSS/components only once a second view actually needs it (the project's own established practice, e.g. `.page-header`/`.filter-strip` were promoted to `global.css` only after Sprint 2 needed what Sprint 1 built).

### Don't:
- **Don't** use `border-left`/`border-right` colored stripes as a status indicator — this system encodes status via badge fill + dot color, not side-stripes.
- **Don't** use gradient text or decorative glassmorphism anywhere — the flat, precise aesthetic has no room for either.
- **Don't** let this drift toward generic admin-template SaaS: interchangeable gray card grids with no accent discipline are exactly what DM Hire is built to look better than.
- **Don't** repurpose cyan or orange for anything outside their one job (cyan = good/forward, orange = urgent) — a cyan "neutral" button or an orange decorative accent breaks the Single-Job Rule and the instrument-panel legibility it protects.
- **Don't** add hover shadow-lift to resting cards that aren't click targets — only genuinely interactive elements (buttons, Kanban cards) get the lift; a static metric card or info panel stays flat even on hover.
- **Don't** use the display serif (Libre Baskerville) anywhere outside the single page-title/wordmark moment — dense UI (tables, badges, buttons, inputs) stays in Archivo for legibility, matching DM's own "highest-level message per deliverable" rule.
- **Don't** invent or approximate Doeren Mayhew's actual logo mark from the branding PDF's slide previews — wait for real asset files (see Section 6).
