# Why DM Hire Walkthrough Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the static 28-card grid on `/why-dm-hire` with a default one-card-at-a-time walkthrough grouped by stage (ATS/Onboarding/Payroll), keeping a "View All" grid toggle and print/export output unchanged.

**Architecture:** Add a `stage` column to `why_dm_hire_features` (migration + backfill). Extract the existing card markup into a shared `WhyFeatureCard` component. Add a new `WhyDMHireWalkthrough` component (arrows + filmstrip + current card) driven by `activeStage`/`activeIndex` state in `WhyDMHire.jsx`. The existing grid stays in the DOM at all times; CSS (not conditional rendering) decides whether the grid or the walkthrough is visible on screen, so print always renders the full grid regardless of on-screen mode.

**Tech Stack:** React (Vite), Supabase (Postgres + RLS), plain CSS with design tokens from `src/styles/tokens.css`. No test framework exists in this repo — verification is `npm run lint`, manual smoke-testing via `npm run dev`, and one Node `assert`-based self-check script for the only non-trivial logic (index clamping).

---

## File Structure

- **Create** `supabase/migrations/016_why_dm_hire_stage.sql` — adds and backfills the `stage` column.
- **Create** `src/components/why/WhyFeatureCard.jsx` — the card body (icon, title, context, gap badge, pain/solution, action button), extracted so both the grid and the walkthrough render identical cards.
- **Create** `src/components/why/WhyDMHireWalkthrough.jsx` — owns `activeIndex`, renders prev/next arrows + current `WhyFeatureCard` + filmstrip.
- **Create** `src/components/why/clampIndex.js` — the one piece of non-trivial logic (index boundary clamping), pulled into its own file so it can be self-checked without a test framework.
- **Create** `scripts/check-why-walkthrough.mjs` — tiny Node `assert`-based self-check for `clampIndex`.
- **Modify** `src/views/WhyDMHire.jsx` — add `activeStage`/`mode` state, clickable stage strip, "View All" toggle, walkthrough + grid rendering.
- **Modify** `src/views/WhyDMHire.css` — walkthrough arrows, filmstrip, clickable stage-strip states, mode-based show/hide rules, print block update.

---

### Task 1: Add `stage` column to `why_dm_hire_features`

**Files:**
- Create: `supabase/migrations/016_why_dm_hire_stage.sql`

- [ ] **Step 1: Write the migration**

```sql
alter table why_dm_hire_features add column stage text not null default 'ats';

update why_dm_hire_features set stage = 'onboarding' where title in (
  'Automated department notifications',
  'State-based onboarding packets',
  'Background check + drug screen integrations'
);

update why_dm_hire_features set stage = 'payroll' where title = 'Payroll + onboarding integration';
```

- [ ] **Step 2: Apply the migration to the linked project**

Run: `supabase db push`
Expected: output lists `016_why_dm_hire_stage.sql` as applied, no errors.

- [ ] **Step 3: Verify the backfill**

Run: `supabase db execute --sql "select stage, count(*) from why_dm_hire_features group by stage order by stage"` (or run the equivalent query in the Supabase SQL editor)
Expected: `ats` → 24, `onboarding` → 3, `payroll` → 1.

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/016_why_dm_hire_stage.sql
git commit -m "Add stage column to why_dm_hire_features"
```

---

### Task 2: Extract `WhyFeatureCard`

**Files:**
- Create: `src/components/why/WhyFeatureCard.jsx`
- Modify: `src/views/WhyDMHire.jsx:93-122`

- [ ] **Step 1: Create the extracted component**

```jsx
// src/components/why/WhyFeatureCard.jsx
import { Play } from 'lucide-react'
import Card from '../ui/Card'

export default function WhyFeatureCard({ feature, icon: Icon, onNavigate }) {
  return (
    <Card className="why-card">
      <div className="why-card-hdr">
        <span className="why-card-icon"><Icon size={18} /></span>
        <div>
          <div className="why-card-title">{feature.title}</div>
          <div className="why-card-context">{feature.context}</div>
        </div>
        <span className="why-gap-badge">Gap Today</span>
      </div>
      <div className="why-card-body">
        <div className="why-pain">
          <div className="why-pain-label">Current DM ATS</div>
          <div className="why-pain-text">{feature.pain}</div>
        </div>
        <div className="why-solution">
          <div className="why-solution-label">DM Hire</div>
          <div className="why-solution-text">{feature.solution}</div>
        </div>
      </div>
      <button type="button" className="why-action why-no-print" onClick={onNavigate}>
        <Play size={12} /> See it in action: {feature.action}
      </button>
    </Card>
  )
}
```

- [ ] **Step 2: Use it from the existing grid in `WhyDMHire.jsx`**

`Card` is no longer used directly in this file once the grid switches to `WhyFeatureCard` — remove its import line:

```jsx
import Card from '../components/ui/Card'
```

Replace lines 93-122 (the `.why-grid` block) with:

```jsx
      <div className="why-grid">
        {whyDmHireFeatures.map((f) => (
          <WhyFeatureCard
            key={f.title}
            feature={f}
            icon={ICON_MAP[f.icon]}
            onNavigate={() => navigate(f.route)}
          />
        ))}
      </div>
```

Add the import near the top of `WhyDMHire.jsx` (with the other component imports):

```jsx
import WhyFeatureCard from '../components/why/WhyFeatureCard'
```

- [ ] **Step 3: Verify nothing changed visually**

Run: `npm run dev`, open `http://localhost:5173/why-dm-hire`
Expected: page renders identically to before this task — same 28 cards, same 2-column grid, "See it in action" still navigates correctly.

- [ ] **Step 4: Lint**

Run: `npm run lint`
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add src/components/why/WhyFeatureCard.jsx src/views/WhyDMHire.jsx
git commit -m "Extract WhyFeatureCard from Why DM Hire grid"
```

---

### Task 3: Index-clamping helper + self-check

**Files:**
- Create: `src/components/why/clampIndex.js`
- Create: `scripts/check-why-walkthrough.mjs`

- [ ] **Step 1: Write the helper**

```js
// src/components/why/clampIndex.js
export function clampIndex(index, delta, length) {
  const next = index + delta
  return next < 0 || next >= length ? index : next
}
```

- [ ] **Step 2: Write the self-check script**

```js
// scripts/check-why-walkthrough.mjs
import assert from 'node:assert/strict'
import { clampIndex } from '../src/components/why/clampIndex.js'

// prev is a no-op at the first index
assert.equal(clampIndex(0, -1, 5), 0)

// next is a no-op at the last index
assert.equal(clampIndex(4, 1, 5), 4)

// normal prev/next move by one
assert.equal(clampIndex(2, -1, 5), 1)
assert.equal(clampIndex(2, 1, 5), 3)

// single-item list clamps both directions
assert.equal(clampIndex(0, 1, 1), 0)
assert.equal(clampIndex(0, -1, 1), 0)

console.log('why-walkthrough clampIndex: all checks passed')
```

- [ ] **Step 3: Run the self-check**

Run: `node scripts/check-why-walkthrough.mjs`
Expected: `why-walkthrough clampIndex: all checks passed`

- [ ] **Step 4: Commit**

```bash
git add src/components/why/clampIndex.js scripts/check-why-walkthrough.mjs
git commit -m "Add clampIndex helper with assert-based self-check"
```

---

### Task 4: Build `WhyDMHireWalkthrough`

**Files:**
- Create: `src/components/why/WhyDMHireWalkthrough.jsx`

- [ ] **Step 1: Write the component**

```jsx
// src/components/why/WhyDMHireWalkthrough.jsx
import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import WhyFeatureCard from './WhyFeatureCard'
import { clampIndex } from './clampIndex'

export default function WhyDMHireWalkthrough({ features, iconMap, navigate }) {
  const [activeIndex, setActiveIndex] = useState(0)
  const feature = features[activeIndex]

  return (
    <div className="why-walkthrough">
      <div className="why-walk-row">
        <button
          type="button"
          className="why-walk-arrow"
          disabled={activeIndex === 0}
          onClick={() => setActiveIndex((i) => clampIndex(i, -1, features.length))}
          aria-label="Previous feature"
        >
          <ChevronLeft size={18} />
        </button>

        <WhyFeatureCard
          feature={feature}
          icon={iconMap[feature.icon]}
          onNavigate={() => navigate(feature.route)}
        />

        <button
          type="button"
          className="why-walk-arrow"
          disabled={activeIndex === features.length - 1}
          onClick={() => setActiveIndex((i) => clampIndex(i, 1, features.length))}
          aria-label="Next feature"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="why-filmstrip no-scrollbar">
        {features.map((f, i) => {
          const Icon = iconMap[f.icon]
          return (
            <button
              type="button"
              key={f.title}
              className={`why-filmstrip-chip${i === activeIndex ? ' active' : ''}`}
              onClick={() => setActiveIndex(i)}
              aria-label={f.title}
            >
              <Icon size={14} />
            </button>
          )
        })}
        <span className="why-filmstrip-pos">{activeIndex + 1} / {features.length}</span>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Lint**

Run: `npm run lint`
Expected: no errors. (Not yet wired into `WhyDMHire.jsx`, so no visual check until Task 5.)

- [ ] **Step 3: Commit**

```bash
git add src/components/why/WhyDMHireWalkthrough.jsx
git commit -m "Add WhyDMHireWalkthrough component"
```

---

### Task 5: Wire stage/mode state into `WhyDMHire.jsx`

**Files:**
- Modify: `src/views/WhyDMHire.jsx`

- [ ] **Step 1: Update imports and add the `key` field to `STORY_STAGES`**

After Task 2, the top of `WhyDMHire.jsx` reads:

```jsx
import { useNavigate } from 'react-router-dom'
import {
  Target, Download, ArrowRight, Play,
  Share2, Link2, Bell, BarChart3, LayoutTemplate, Users, History, StickyNote,
  FileSignature, MessageSquare, Package, CheckCircle2, Copy, ArrowLeftRight, Sparkles,
  Building2, Lock, Mail, CalendarClock, ShieldAlert, ClipboardList, Smartphone, Landmark,
  ShieldCheck, TrendingUp, Cog, Brain,
} from 'lucide-react'
import Button from '../components/ui/Button'
import { useWhyDmHireFeatures } from '../hooks/useWhyDmHireFeatures'
import Loading from '../components/ui/Loading'
import WhyFeatureCard from '../components/why/WhyFeatureCard'
import './WhyDMHire.css'
```

Replace it with:

```jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Target, Download, ArrowRight, Play, LayoutGrid,
  Share2, Link2, Bell, BarChart3, LayoutTemplate, Users, History, StickyNote,
  FileSignature, MessageSquare, Package, CheckCircle2, Copy, ArrowLeftRight, Sparkles,
  Building2, Lock, Mail, CalendarClock, ShieldAlert, ClipboardList, Smartphone, Landmark,
  ShieldCheck, TrendingUp, Cog, Brain,
} from 'lucide-react'
import Button from '../components/ui/Button'
import { useWhyDmHireFeatures } from '../hooks/useWhyDmHireFeatures'
import Loading from '../components/ui/Loading'
import WhyFeatureCard from '../components/why/WhyFeatureCard'
import WhyDMHireWalkthrough from '../components/why/WhyDMHireWalkthrough'
import './WhyDMHire.css'
```

Then replace:

```jsx
const STORY_STAGES = [
  { label: 'ATS', body: 'Source, screen, and interview candidates through a modern, AI-assisted pipeline.' },
  { label: 'Onboarding', body: 'State-specific document packets, background checks, and department notifications kick off automatically.' },
  { label: 'DM Payroll', body: 'The hire syncs straight into payroll with no re-entry and no gap between "hired" and "on payroll."' },
]
```

with:

```jsx
const STORY_STAGES = [
  { key: 'ats', label: 'ATS', body: 'Source, screen, and interview candidates through a modern, AI-assisted pipeline.' },
  { key: 'onboarding', label: 'Onboarding', body: 'State-specific document packets, background checks, and department notifications kick off automatically.' },
  { key: 'payroll', label: 'DM Payroll', body: 'The hire syncs straight into payroll with no re-entry and no gap between "hired" and "on payroll."' },
]
```

- [ ] **Step 2: Add `activeStage`/`mode` state and the filtered stage list**

In the `WhyDMHire` function body, right after `const { whyDmHireFeatures, loading } = useWhyDmHireFeatures()`, add:

```jsx
  const [activeStage, setActiveStage] = useState('ats')
  const [mode, setMode] = useState('walkthrough')

  const stageFeatures = whyDmHireFeatures.filter((f) => f.stage === activeStage)
```

Add `useState` to the existing `react` import at the top of the file:

```jsx
import { useState } from 'react'
```

- [ ] **Step 3: Update the root div and header**

Replace:

```jsx
  return (
    <div className="why-view">
      <div className="page-header why-no-print">
        <div>
          <h1 className="page-title">Why DM Hire</h1>
          <div className="page-subtitle">{whyDmHireFeatures.length} confirmed gaps in the current DM ATS, and exactly how we solve them</div>
        </div>
        <Button variant="primary" onClick={() => window.print()}>
          <Download size={16} /> Export
        </Button>
      </div>
```

with:

```jsx
  return (
    <div className={`why-view why-mode-${mode}`}>
      <div className="page-header why-no-print">
        <div>
          <h1 className="page-title">Why DM Hire</h1>
          <div className="page-subtitle">{whyDmHireFeatures.length} confirmed gaps in the current DM ATS, and exactly how we solve them</div>
        </div>
        <div className="why-header-actions">
          <Button variant="ghost" onClick={() => setMode((m) => (m === 'walkthrough' ? 'grid' : 'walkthrough'))}>
            <LayoutGrid size={16} /> {mode === 'walkthrough' ? 'View All' : 'Walkthrough'}
          </Button>
          <Button variant="primary" onClick={() => window.print()}>
            <Download size={16} /> Export
          </Button>
        </div>
      </div>
```

- [ ] **Step 4: Make the story strip clickable**

Replace:

```jsx
      <div className="why-story">
        {STORY_STAGES.map((stage, i) => (
          <div className="why-story-stage" key={stage.label}>
            <div className="why-story-num">{i + 1}</div>
            <div className="why-story-label">{stage.label}</div>
            <div className="why-story-body">{stage.body}</div>
            {i < STORY_STAGES.length - 1 && <ArrowRight size={16} className="why-story-arrow" />}
          </div>
        ))}
      </div>
```

with:

```jsx
      <div className="why-story">
        {STORY_STAGES.map((stage, i) => (
          <div
            className={`why-story-stage${stage.key === activeStage ? ' active' : ''}`}
            key={stage.key}
            role="button"
            tabIndex={0}
            onClick={() => setActiveStage(stage.key)}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setActiveStage(stage.key) }}
          >
            <div className="why-story-num">{i + 1}</div>
            <div className="why-story-label">{stage.label}</div>
            <div className="why-story-body">{stage.body}</div>
            {i < STORY_STAGES.length - 1 && <ArrowRight size={16} className="why-story-arrow" />}
          </div>
        ))}
      </div>
```

- [ ] **Step 5: Add the walkthrough, keep the grid full-list**

Replace the `.why-grid` block (rewritten in Task 2) with the walkthrough placed before it:

```jsx
      <WhyDMHireWalkthrough
        features={stageFeatures}
        iconMap={ICON_MAP}
        navigate={navigate}
        key={activeStage}
      />

      <div className="why-grid">
        {whyDmHireFeatures.map((f) => (
          <WhyFeatureCard
            key={f.title}
            feature={f}
            icon={ICON_MAP[f.icon]}
            onNavigate={() => navigate(f.route)}
          />
        ))}
      </div>
```

- [ ] **Step 6: Lint**

Run: `npm run lint`
Expected: no errors.

- [ ] **Step 7: Manual check (visual will be wrong until Task 6 adds CSS — that's expected)**

Run: `npm run dev`, open `http://localhost:5173/why-dm-hire`
Expected: no console errors; both the walkthrough block and the grid render in the DOM (unstyled/overlapping is fine for now — Task 6 fixes visibility rules).

- [ ] **Step 8: Commit**

```bash
git add src/views/WhyDMHire.jsx
git commit -m "Wire stage/mode state and walkthrough into WhyDMHire"
```

---

### Task 6: CSS — walkthrough, filmstrip, clickable stages, mode visibility, print

**Files:**
- Modify: `src/views/WhyDMHire.css`

- [ ] **Step 1: Make the story stage clickable and add an active state**

Find:

```css
.why-story-stage { flex: 1; position: relative; }
```

Replace with:

```css
.why-story-stage { flex: 1; position: relative; cursor: pointer; border-radius: var(--radius-md); }
.why-story-stage:focus-visible { outline: 2px solid var(--color-maroon-light); }
.why-story-stage.active .why-story-num { background: var(--color-cyan-dark); }
.why-story-stage.active .why-story-label { color: var(--color-cyan-dark); }
```

- [ ] **Step 2: Add header-actions layout**

Add after the `.why-banner-label` rule:

```css
.why-header-actions { display: flex; gap: var(--space-3); }
```

- [ ] **Step 3: Add walkthrough + filmstrip styles**

Add after the `.why-action:hover` rule (before `@media print`):

```css
.why-walkthrough { margin-bottom: var(--space-6); }

.why-walk-row { display: flex; align-items: center; gap: var(--space-4); margin-bottom: var(--space-4); }
.why-walk-row .why-card { flex: 1; }

.why-walk-arrow {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1.5px solid var(--color-gray-200);
  background: var(--color-white);
  color: var(--color-maroon);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
}
.why-walk-arrow:hover:not(:disabled) { background: var(--color-gray-50); }
.why-walk-arrow:disabled { opacity: .35; cursor: default; }

.why-filmstrip { display: flex; align-items: center; gap: var(--space-2); overflow-x: auto; padding: 2px; }
.why-filmstrip-chip {
  width: 30px;
  height: 30px;
  border-radius: var(--radius-md);
  border: 1.5px solid var(--color-gray-200);
  background: var(--color-white);
  color: var(--color-gray-400);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
}
.why-filmstrip-chip.active { border-color: var(--color-maroon); color: var(--color-maroon); box-shadow: 0 0 0 2px rgba(109,23,78,.15); }
.why-filmstrip-pos { font-size: 11px; color: var(--color-gray-400); margin-left: var(--space-2); flex-shrink: 0; white-space: nowrap; }

.why-mode-grid .why-walkthrough { display: none; }
.why-mode-walkthrough .why-grid { display: none; }
```

- [ ] **Step 4: Update the print block**

Replace:

```css
@media print {
  .why-no-print { display: none !important; }
  .why-grid { grid-template-columns: 1fr; }
  .why-card { break-inside: avoid; box-shadow: none !important; border: 1px solid var(--color-gray-200); }
  .why-banner { background: var(--color-maroon) !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
}
```

with:

```css
@media print {
  .why-no-print { display: none !important; }
  .why-walkthrough { display: none !important; }
  .why-grid { display: grid !important; grid-template-columns: 1fr; }
  .why-card { break-inside: avoid; box-shadow: none !important; border: 1px solid var(--color-gray-200); }
  .why-banner { background: var(--color-maroon) !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
}
```

- [ ] **Step 5: Lint**

Run: `npm run lint`
Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add src/views/WhyDMHire.css
git commit -m "Style Why DM Hire walkthrough, filmstrip, and mode toggle"
```

---

### Task 7: Manual smoke pass

**Files:** none (verification only)

- [ ] **Step 1: Start the dev server**

Run: `npm run dev`, open `http://localhost:5173/why-dm-hire`

- [ ] **Step 2: Walk through each check**

- Page loads on the ATS stage, card 1 of 24, "ATS" highlighted in the story strip.
- Click the right arrow repeatedly through all 24 ATS cards; it disables at card 24 and never wraps into Onboarding.
- Click the left arrow back to card 1; it disables at card 1.
- Click a filmstrip chip in the middle of the row; the card jumps directly to that feature and the chip gets the active ring.
- Click "Onboarding" in the story strip; walkthrough resets to card 1 of 3 and the strip highlight moves to Onboarding.
- Click "DM Payroll" in the story strip; walkthrough shows the single payroll card (1 of 1), both arrows disabled.
- Click "View All"; the grid of all 28 cards appears, walkthrough disappears, button label changes to "Walkthrough".
- Click "Walkthrough"; back to the single-card view, on whichever stage was last active.
- Click "See it in action" on a card in the walkthrough; confirm it navigates to the same route/page it did before this change.
- With mode set to "Walkthrough", open the browser print dialog (or `window.print()` via Export); confirm the print preview shows the full 28-card grid, not the walkthrough.
- Switch mode to "View All", print again; confirm the print preview is identical to the previous print preview.

- [ ] **Step 3: Fix anything that doesn't match, then re-run Step 2**

- [ ] **Step 4: Final commit if any fixes were made**

```bash
git add -A
git commit -m "Fix issues found in Why DM Hire walkthrough smoke pass"
```
