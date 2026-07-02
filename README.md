# DM Hire

High-fidelity interactive ATS prototype for Doeren Mayhew, built to run alongside DM Payroll. No backend — all data is mocked in `src/data/`.

## Stack

React 19 + Vite, React Router v6, Lucide icons, Recharts, plain CSS with custom properties (no UI framework). See `docs/superpowers/specs/2026-07-02-dm-hire-design.md` for the full product spec and sprint plan.

## Local development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## Deployment

Auto-deploys to Vercel from `main`. `vercel.json` includes the SPA rewrite rule so client-side routes survive a hard refresh.
