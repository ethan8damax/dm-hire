# Product

## Register

product

## Users
Recruiters and hiring managers at Doeren Mayhew (DM) client companies are the in-product users — running requisitions, triaging pipelines, scheduling interviews, and sending offers day-to-day. But this specific build is a **high-fidelity interactive prototype, no backend**, being driven in sequence through three audiences: Griffin Global managers (Cassie, Eli) for internal progress review, DM stakeholders (Brandon, Sarah) for product-vision buy-in, and ultimately DM's potential ATS clients as a sales demo. Every screen has to hold up under a live click-through in front of any of these three, not just look right in a static mock.

## Product Purpose
DM Hire closes the gap between DM's existing payroll product (DM Payroll, no recruiting) and their clients' current ATS (ClearCompany via Asure, no native payroll). It's a full-featured ATS — requisitions, Kanban pipeline, candidate profiles, offers, reporting — designed to be sold alongside DM Payroll as one integrated HRIS story. Success for this prototype specifically: every wishlist feature from Brandon and Sarah is clickable and demonstrable with realistic mock data, so the demo reads as "real product," not slideware.

## Brand Personality
Modern, polished, trustworthy — confident enterprise software that makes the incumbent (ClearCompany) look dated, without tipping into flashy. Efficient and sharp in the details (fast interactions, no wasted clicks) but never at the expense of feeling premium enough that DM would be proud to charge for it in a client demo.

## Anti-references
ClearCompany (via Asure Software) is the explicit incumbent to look better than — recruiting-capable but visually and functionally dated. Avoid anything that reads as a generic admin-template SaaS dashboard (interchangeable card grids, flat gray-on-white with no accent discipline); DM Hire should feel like a considered, single product, not a component-library default.

## Design Principles
- **Feel like a real product, not a mockup** — every interaction clickable, every screen populated with realistic data (the spec's own stated bar, repeated at nearly every sprint goal).
- **Every differentiating feature must be visible, not just listed** — if it's on Brandon or Sarah's wishlist, it needs to show up as an actual interaction somewhere (duplicate detection, AI match scoring, DM Payroll sync status, etc.), not a bullet point.
- **Derive from data, don't hardcode** — screens compute from `src/data/*.js` wherever possible so the demo narrative stays internally consistent (e.g. a hired candidate's linked offer must actually show accepted/signed/synced).
- **No stage-transition logic without being asked for it** — action buttons and status changes are allowed to be decorative (matching the reference mockup's own non-functional `onclick`s) unless a sprint goal specifically calls for real state mutation. Don't over-build interactivity the spec didn't ask for.
- **One shared visual language, not per-view reinvention** — page chrome, cards, badges, and tabs get promoted to shared CSS/components once a second view needs them, not before.

## Accessibility & Inclusion
WCAG 2.1 AA baseline. Contrast has already been manually verified once (Sprint 1's pipeline funnel ink-color ramp, checked to clear 4.5:1 for body text). Carry that same bar forward for any new data-viz or color-coded status work.
