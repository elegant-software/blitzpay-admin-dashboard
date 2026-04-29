# Implementation Plan: Payment Operations Dashboard

**Branch**: `002-keycloak-sso-auth` | **Date**: 2026-04-29 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-payment-ops-dashboard/spec.md`

## Summary

Redesign the authenticated dashboard so the default operations landing view uses business-relevant mock data for merchants, branches, products, payment transactions, and online/mobile customer activity. The implementation will stay inside the existing Angular admin shell, introduce a dedicated payment operations dashboard component and mock-data service, and preserve the existing merchant catalog as the drill-down workspace for detailed maintenance flows.

## Technical Context

**Language/Version**: TypeScript 5.8, Angular 20  
**Primary Dependencies**: Angular standalone components, Angular Router, Angular forms, Angular HttpClient, RxJS 7.8, CoreUI 5 CSS, `keycloak-js`  
**Storage**: In-memory mock data only for the redesigned dashboard; no new persistent storage  
**Testing**: Angular CLI build validation; targeted unit/component tests for new dashboard view-model and rendering logic  
**Target Platform**: Browser-based internal admin dashboard served by Angular  
**Project Type**: Single frontend web application  
**Performance Goals**: Dashboard overview renders initial mock data in under 2 seconds on a standard developer machine; primary overview metrics remain readable without scrolling on a standard desktop viewport; merchant-to-detail drill-in completes within 1 interaction step  
**Constraints**: No backend changes in this phase; use mock data only for the redesigned overview; preserve existing authenticated shell and merchant catalog route/section; all rendered dates must use `DisplayDatePipe`; all HTTP access remains inside services; desktop and mobile layouts must remain understandable  
**Scale/Scope**: One redesigned shell dashboard section, one new feature component subtree, one mock data source, overview metrics, merchant/branch/product drill-down panels, transaction summaries, and online/mobile channel summaries

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- The project constitution requires date and timestamp values to render through `DisplayDatePipe`; the dashboard design will route all raw timestamps through the existing pipe.
- Angular component rules require standalone components and explicit imports; the dashboard will be implemented as standalone feature components.
- HTTP access must remain inside services; even though this phase uses mock data, the data source will still be encapsulated in a service rather than embedded directly in templates.
- The existing shell and merchant catalog workflows must not be broken by the redesign; the dashboard will be a new primary shell section while the merchant catalog remains available for detail operations.
- No constitution rule blocks mock-data-based dashboard redesign work.

**Initial Gate Result**: PASS

## Project Structure

### Documentation (this feature)

```text
specs/003-payment-ops-dashboard/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── payment-ops-dashboard-ui.md
├── checklists/
│   └── requirements.md
└── tasks.md              # Phase 2 output from /speckit.tasks, not created here
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── auth/
│   │   └── components/
│   │       ├── auth-shell.component.ts
│   │       ├── auth-shell.component.html
│   │       └── auth-shell.component.css
│   ├── payment-ops-dashboard/
│   │   ├── payment-ops-dashboard.component.ts
│   │   ├── payment-ops-dashboard.component.html
│   │   ├── payment-ops-dashboard.component.css
│   │   └── payment-ops-dashboard.models.ts
│   ├── pipes/
│   │   └── display-date.pipe.ts
│   └── services/
│       └── payment-ops-dashboard-data.service.ts
├── main.ts
└── styles.css
```

**Structure Decision**: Keep the implementation inside the existing Angular application. Add a dedicated operations dashboard feature under `src/app/payment-ops-dashboard/`, wire it into the authenticated shell as the default dashboard section, and keep existing merchant catalog files intact for detailed lookup and editing.

## Phase 0: Research

Research output is captured in [research.md](./research.md). All material planning questions were resolved without open clarifications by choosing a shell-integrated mock-data dashboard, typed dashboard-specific view models, and a staged path that keeps live API integration out of this phase.

## Phase 1: Design & Contracts

Design outputs:

- [data-model.md](./data-model.md)
- [contracts/payment-ops-dashboard-ui.md](./contracts/payment-ops-dashboard-ui.md)
- [quickstart.md](./quickstart.md)

## Post-Design Constitution Check

- The design keeps all new UI as standalone Angular components with explicit imports.
- Raw timestamps are modeled explicitly so templates can apply `DisplayDatePipe` where needed.
- Service boundaries are preserved by locating mock dashboard data in a feature service.
- The merchant catalog remains available as a separate shell section, so the redesign does not violate the existing maintenance flow.
- No additional architecture or policy violations were introduced by the design.

**Post-Design Gate Result**: PASS

## Complexity Tracking

No constitution violations or exceptional complexity require justification.
