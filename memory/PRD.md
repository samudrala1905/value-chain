# PRD — Saurient Carbon Passport · Value Chain (Supplier & Customer Network)

## Original problem statement
Enhancement to the existing Saurient Carbon Passport Platform: build the complete inner-page
workflow for Value Chain → Supplier & Customer Network with 8 fully functional, connected tabs
(Suppliers, Invitations, Declarations, Evidence, Scorecards, Supply Catalogue, Customer Requests,
Customer Catalogue). Must demonstrate the full chain: Supplier → Evidence → Declaration → Supplier
PCF → Material → BOM → Scope 3 → Product PCF → MRV → Carbon Passport → Customer, with shared state,
data classification, impact analysis and confidentiality-aware sharing.

## User choices (confirmed)
- Frontend-only with shared mock state (React Context). No backend/DB.
- Org Admin role only for this pass.
- Deep links land on lightweight stub pages + toasts.
- Build all 8 tabs now. Charts via recharts.

## Architecture
- React 19 + CRA/craco, Tailwind + shadcn/ui, recharts, sonner, framer-motion available.
- `src/data/mockData.js` — single source of truth (org, materials, suppliers, invitations,
  declarations, evidence, catalogue, improvements, customer requests/catalogue, packages, audit).
- `src/context/ValueChainContext.jsx` — shared state + actions + derived metrics + Scope 3 calc
  + impact engine + reverse traceability + audit log.
- `src/components/shared/*` — primitives (KPI, status/class/sharing badges, quality bar, intensity
  pill, workflow tracker, lineage flow) and Analytics (10 recharts + scorecard radar).
- `src/pages/ValueChain.jsx` — header, filters, 4 KPIs, 8-metric strip, workflow tracker, analytics,
  tabs, audit drawer, dynamic primary action, download menu.
- `src/pages/tabs/*` — 8 tab pages with tables, drawers, modals, wizard.
- `src/pages/SupplierPortal.jsx`, `DeepLinkTargets.jsx`, `StubModule.jsx`.

## Implemented (2026-06)
- All 8 tabs functional & connected via shared state.
- Suppliers CRUD-ish (add), profile drawer w/ relationship & dependencies.
- Invitations: 9-step wizard, statuses, supplier portal deep-link.
- Declarations: review actions (accept/correct/reject/map), data classification badges.
- Evidence: category filters, review w/ versioning (never silently deleted), traceability.
- Scorecards: data-quality radar + breakdown, SEPARATE carbon performance panel, improvement requests.
- Supply Catalogue: PCF selection engine, data lineage, material mapping, supplier-data-change impact engine.
- Customer Requests: workflow, sharing checks, package generation.
- Customer Catalogue: product carbon profile, sharing panel, package builder.
- Supplier Portal (no account), Scope 3 & Passport deep-link targets, 12-item download menu, audit trail.
- KPIs/metrics computed from shared mock data (Scope 3 = volume × intensity).

## Backlog (P1/P2)
- P1: Role switcher to demo Procurement / Carbon Manager / Verifier / Customer / Public views.
- P1: Persist generated change events into a visible Change Control timeline tab.
- P2: Backend + Mongo persistence; real file uploads via object storage.
- P2: Global command-palette search across all entity types.

## Next tasks
- Run testing agent → fix any blocking issues → finish.
