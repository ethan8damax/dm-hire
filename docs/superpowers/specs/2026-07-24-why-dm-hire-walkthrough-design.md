# Why DM Hire — One-Card-at-a-Time Walkthrough — Design Spec

## 1. Context & Purpose

`WhyDMHire.jsx` (`/why-dm-hire`) currently renders all 28 gap/solution features as a static 2-column grid below a banner and a 3-stage story strip (ATS → Onboarding → Payroll). The user's own description: "a fire hydrant of tons of information... too much." The page is used both live (narrated in front of Brandon/Sarah or a prospect) and self-serve (opened cold, or exported via the existing print button), so the redesign has to work both ways.

This spec replaces the always-on grid with a default one-card-at-a-time walkthrough, grouped by the existing ATS/Onboarding/Payroll story stages, while keeping a "View All" toggle and print/export fully intact.

## 2. Scope Decision

**In scope:**
1. Add a `stage` column (`ats` / `onboarding` / `payroll`) to `why_dm_hire_features`, backfilled so the existing 28 rows split 24/3/1 across the three stages (confirmed with user — no rebalancing).
2. Merge the existing static 3-stage story strip into a clickable stage picker that drives the walkthrough below it — all three stage blocks stay visible simultaneously exactly as today (it's a flow diagram, not a tab set), each becomes clickable, and the active one gets a highlight.
3. New default view: one feature card at a time within the active stage, with prev/next arrows on either side and a clickable filmstrip of per-feature icon chips underneath (also acting as a position indicator).
4. "View All" toggle (next to the existing Export button) that swaps to the current grid layout for on-screen skimming.
5. Print/export always renders the full grid regardless of which on-screen mode is active — no change to what gets exported today.
6. Extract the feature-card body (icon, title, context, gap badge, pain/solution, action button) into a shared `WhyFeatureCard` component, used by both the walkthrough and the grid.

**Explicitly out of scope:**
- Rebalancing the 24/3/1 stage split, or introducing sub-categories within ATS (considered, rejected by user).
- Any change to the "See it in action" navigation behavior (`onClick={() => navigate(f.route)}`) — same routes, same action labels.
- Keyboard-arrow-key navigation (not requested; mouse/touch only, matching the rest of the app's nav patterns).
- Auto-advancing from the last card of one stage into the next stage — arrows simply disable at each stage's boundary.
- Any change to `useWhyDmHireFeatures.js`'s fetch shape beyond the new `stage` field flowing through the existing `rowToCamel` conversion.

## 3. Architecture

- **Data**: `why_dm_hire_features.stage` (`text not null default 'ats'`), added via new migration `supabase/migrations/016_why_dm_hire_stage.sql`. Default covers the 24 ATS rows; the migration explicitly updates the 4 non-ATS rows by `title` match (`'Payroll + onboarding integration'` → `payroll`; `'Automated department notifications'`, `'State-based onboarding packets'`, `'Background check + drug screen integrations'` → `onboarding`). No RLS changes — existing `why_dm_hire_features_anon_select` policy already covers all columns.
- **`WhyFeatureCard.jsx`** (new, `src/components/why/`): pure presentational component, props `{ feature, iconMap }`. Renders exactly the card body markup that exists today inside `.why-grid`'s `.map()` (icon, title, context, gap badge, pain/solution split, action button with `onNavigate`). No internal state.
- **`WhyDMHireWalkthrough.jsx`** (new, `src/components/why/`): props `{ features }` (already filtered to the active stage by the parent). Owns `activeIndex` state, reset to `0` automatically whenever the parent remounts it with a `key={activeStage}` (no explicit reset effect needed). Renders left/right arrow buttons (disabled at `0`/`length - 1`, same pattern as `CandidateProfile.jsx`'s `cp-nav-arrow`), the current `WhyFeatureCard`, and a filmstrip of small icon chips below (one per feature in the stage; clicking a chip sets `activeIndex` directly). Filmstrip scroll container reuses the existing global `.no-scrollbar` utility class.
- **`WhyDMHire.jsx`** (modified): 
  - `STORY_STAGES` gains a `key` per stage (`'ats' | 'onboarding' | 'payroll'`) matching the DB column.
  - New `activeStage` state, default `'ats'`. The story-strip stages become clickable buttons; the active one is visually highlighted (reusing the existing `.why-story-stage` styling plus an `active` modifier class).
  - New `mode` state, default `'walkthrough'` (`'walkthrough' | 'grid'`). A small toggle button next to Export flips it.
  - `whyDmHireFeatures.filter(f => f.stage === activeStage)` computed once, passed to `<WhyDMHireWalkthrough features={...} key={activeStage} />`.
  - The existing grid `.map()` is kept, now rendering `<WhyFeatureCard>` instead of inline JSX, over the full unfiltered `whyDmHireFeatures` list (grid always shows all 28, not just the active stage — it's the "see everything" mode, stage filtering is walkthrough-only).
  - Both the walkthrough block and the grid block are always present in the DOM; CSS (not conditional rendering) controls which one is visible, so print never depends on JS state (see below).

## 4. Visual / Interaction Details (confirmed via mockup)

- Stage picker: same 3-stage strip already on the page (all three blocks always visible, arrows between them unchanged), now clickable; active stage highlighted in maroon (matching the existing numbered-circle styling).
- Walkthrough card: prev/next circular arrow buttons flank the card directly (not top/bottom); disabled state matches `CandidateProfile.jsx`'s existing `cp-nav-arrow` visual treatment.
- Filmstrip: row of small rounded icon chips directly below the card, horizontally scrollable with no visible scrollbar, active chip highlighted with a ring plus a small "3 / 24" position label.
- "View All" toggle: icon+label button next to Export, following the existing `Button` component / icon-button conventions already used elsewhere on this page (e.g. the view-toggle buttons on `JobRequisitions.jsx`).

## 5. CSS / Print Behavior

New classes in `WhyDMHire.css`:
```css
.why-mode-grid .why-walkthrough { display: none; }
.why-mode-walkthrough .why-grid { display: none; }

@media print {
  .why-walkthrough { display: none !important; }
  .why-grid { display: grid !important; grid-template-columns: 1fr; }
}
```
This extends the page root class to `why-view why-mode-${mode}`. Because both blocks always exist in the DOM, the existing `@media print` rules (already forcing `.why-grid` to a single column and hiding `.why-no-print` elements) continue to work unchanged — print output is identical to today's regardless of whichever mode is active on screen when the user clicks Export.

## 6. Error Handling & Loading States

No new network calls — `stage` rides along with the existing single `useWhyDmHireFeatures()` fetch. Loading state unchanged (`<Loading />` while the fetch is in flight). No mutations on this page, so no new error states to handle.

## 7. Testing

Non-trivial logic here is the stage-filter/index bookkeeping (`activeIndex` bounds, stage-switch reset, filmstrip jump). Following this codebase's existing precedent (no unit test suite; smoke-tested per prior sub-projects), one small assertion-based check plus a manual smoke pass:

- `WhyDMHireWalkthrough`'s index-clamping logic (disable-at-boundary, jump-to-index) gets a small `assert`-based self-check (no test framework) verifying: index starts at 0, prev is a no-op at 0, next is a no-op at `length - 1`, and jumping to an arbitrary valid index works.
- Manual smoke pass: switch between all 3 stages, confirm the walkthrough resets to card 1 each time and the story-strip highlight follows; step through the full 24-card ATS stage via both arrows and filmstrip clicks; toggle View All and confirm it matches today's grid; print/export in both modes and confirm the output is the full grid either way; click "See it in action" from within the walkthrough and confirm it still routes correctly.

## 8. Out of Scope

Restated from Section 2: rebalancing the stage split or sub-categorizing ATS, changes to "See it in action" routing, keyboard navigation, auto-advancing across stage boundaries, and any change to the features fetch shape beyond adding `stage`.
