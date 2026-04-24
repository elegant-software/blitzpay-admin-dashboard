# Implementation Plan: Merchant Catalog Page

**Branch**: `001-merchant-catalog-page` | **Date**: 2026-04-23 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-merchant-catalog-page/spec.md`

## Summary

Add a merchant catalog workspace to the existing BlitzPay admin dashboard so internal admins can search/open merchants, inspect summary/location/branch/product data, and maintain merchant location, branches, product details/images, and logo storage references. The implementation will stay within the existing Angular application, use typed client-side models and services for the provided BlitzPay merchant APIs, and keep the UI consistent with the current CoreUI admin layout.

## Technical Context

**Language/Version**: TypeScript 5.8, Angular 20  
**Primary Dependencies**: Angular standalone components, Angular forms, Angular HttpClient, RxJS 7.8, CoreUI 5 CSS  
**Storage**: N/A for persistent storage; transient form state and selected environment only  
**Testing**: Angular CLI build validation; targeted unit/component tests where task generation introduces test scaffolding  
**Target Platform**: Browser-based internal admin dashboard served by Angular  
**Project Type**: Single frontend web application  
**Performance Goals**: Known merchant detail view presents summary, location, branches, and products within 3 seconds on a healthy backend connection; admin can complete product update flow in under 3 minutes  
**Constraints**: No new backend service; use existing merchant APIs; preserve current dashboard navigation/layout; local base address `http://localhost:8080`; staging base address `https://api-blitzpay-staging.elegantsoftware.de/`; logo file upload is out of scope because the provided API only accepts a stored logo reference  
**Scale/Scope**: One new admin workspace with merchant search, nearby search, merchant summary, location form, branch list/create/view, product list/create/view/update/remove, and logo reference update

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

The local constitution is still the uncustomized Spec Kit template and defines no enforceable project-specific principles. No gate violations are present.

**Initial Gate Result**: PASS

## Project Structure

### Documentation (this feature)

```text
specs/001-merchant-catalog-page/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── api-capabilities.md
├── contracts/
│   └── merchant-catalog-ui.md
├── checklists/
│   └── requirements.md
└── tasks.md              # Phase 2 output from /speckit.tasks, not created here
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── app.component.html          # Current shell; add navigation entry and route/view host
│   ├── app.component.ts            # Current shell state; add merchant catalog section
│   ├── merchant-catalog/
│   │   ├── merchant-catalog.component.html
│   │   ├── merchant-catalog.component.ts
│   │   └── merchant-catalog.component.css
│   ├── models/
│   │   └── merchant-catalog.models.ts
│   └── services/
│       ├── merchant-api.service.ts
│       └── merchant-environment.service.ts
├── main.ts
└── styles.css
```

**Structure Decision**: Use the existing single Angular application. Add feature-specific component, model, and service files under `src/app/` while keeping global layout and shared styling in the existing app shell. Do not introduce a backend or multi-project structure.

## Phase 0: Research

Research output is captured in [research.md](./research.md). All technical unknowns were resolved with conservative choices based on the existing app and provided OpenAPI document.

## Phase 1: Design & Contracts

Design outputs:

- [data-model.md](./data-model.md)
- [contracts/merchant-catalog-ui.md](./contracts/merchant-catalog-ui.md)
- [quickstart.md](./quickstart.md)

## Post-Design Constitution Check

The design remains inside the existing frontend project, uses the existing dependencies, and introduces no additional architectural complexity. No constitution gate violations are present.

**Post-Design Gate Result**: PASS

## Complexity Tracking

No constitution violations or exceptional complexity require justification.
