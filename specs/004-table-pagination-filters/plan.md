# Implementation Plan: Branch and Product Table Controls

**Branch**: `004-table-pagination-filters` | **Date**: 2026-05-05 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/004-table-pagination-filters/spec.md`

## Summary

Add independent pagination, filtering, and column sorting controls to the merchant catalog's branches and products tables without changing merchant lookup or branch-driven product scoping. The implementation will stay inside the existing Angular 20 admin app, preserve the current two-card merchant-catalog layout, and adopt PrimeNG 20.4.0 table and paginator components because that is the latest PrimeNG release compatible with the project's Angular 20 dependency range.

## Technical Context

**Language/Version**: TypeScript 5.8, Angular 20  
**Primary Dependencies**: Angular standalone components, Angular forms, Angular HttpClient, RxJS 7.8, CoreUI 5 CSS, PrimeNG 20.4.0 table/paginator/input components, `@angular/cdk`, `@primeuix/themes`, `primeicons`  
**Storage**: N/A; table control state remains in browser memory only  
**Testing**: Angular CLI build validation; targeted unit/component tests for filter normalization, sorting, pagination state, and branch-change product refresh behavior  
**Target Platform**: Browser-based internal admin dashboard served by Angular  
**Project Type**: Single frontend web application  
**Performance Goals**: Filter, sort, and page changes update visible branch or product rows within 1 second after data is loaded; branch changes replace product rows without stale content; UI remains usable on common admin laptop and desktop widths  
**Constraints**: Preserve merchant catalog layout and branch-to-product interaction defined in `CONSTITUTION.md`; all components remain standalone; all raw dates still use `DisplayDatePipe`; all HTTP access stays in `MerchantApiService`; no backend API changes; current project Angular version requires PrimeNG 20.4.0 rather than the latest PrimeNG 21.x line  
**Scale/Scope**: One existing merchant catalog component, one or more feature-local table state models/helpers, and dependency additions needed to support pagination, filtering, and sorting for branch and product tables only

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- The authoritative project constitution is [CONSTITUTION.md](/Users/mehdi/MyProject/blitzpay-admin-dashboard/CONSTITUTION.md); the `.specify/memory/constitution.md` copy is a generic placeholder and does not override repo rules.
- The constitution requires the merchant catalog to remain the existing Operations -> Merchants workspace with branches in `col-lg-5` and products in `col-lg-7`; this feature layers controls into those existing cards instead of redesigning the page structure.
- The constitution requires clicking a branch row to reload branch-scoped products and auto-selecting the first branch after merchant load; the design preserves that behavior while adding sort/filter/page state.
- Angular component rules require standalone components, explicit imports, `DisplayDatePipe` for rendered dates, and all HTTP access inside `MerchantApiService`; the plan keeps those boundaries intact.
- No constitution rule prevents introducing a component dependency for table controls as long as user-facing status, layout, and data-handling rules stay intact.

**Initial Gate Result**: PASS

## Project Structure

### Documentation (this feature)

```text
specs/004-table-pagination-filters/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── merchant-catalog-table-controls-ui.md
├── checklists/
│   └── requirements.md
└── tasks.md              # Phase 2 output from /speckit.tasks, not created here
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── merchant-catalog/
│   │   ├── merchant-catalog.component.ts
│   │   ├── merchant-catalog.component.html
│   │   ├── merchant-catalog.component.css
│   │   └── merchant-catalog-table-state.ts
│   ├── models/
│   │   └── merchant-catalog.models.ts
│   ├── pipes/
│   │   └── display-date.pipe.ts
│   └── services/
│       └── merchant-api.service.ts
├── styles.css
└── main.ts

package.json
```

**Structure Decision**: Keep the feature inside the existing Angular application and extend the current merchant-catalog component and its supporting models. The only expected code footprint is the merchant-catalog feature, related model definitions/helpers for table state, and package/dependency configuration needed for the chosen open-source table controls.

## Phase 0: Research

Research output is captured in [research.md](./research.md). The main decisions are to use PrimeNG 20.4.0 instead of custom table mechanics or Angular Material, to keep pagination/filtering/sorting client-side on already-fetched data, and to maintain independent state for the branches and products tables while preserving branch-driven product loading.

## Phase 1: Design & Contracts

Design outputs:

- [data-model.md](./data-model.md)
- [contracts/merchant-catalog-table-controls-ui.md](./contracts/merchant-catalog-table-controls-ui.md)
- [quickstart.md](./quickstart.md)

## Post-Design Constitution Check

- The design keeps the existing merchant catalog entry point, two-card layout, and branch-driven product workflow intact.
- The design stays within standalone Angular component rules and does not move HTTP logic out of `MerchantApiService`.
- The feature introduces table controls only for branches and products, which fits the constitution's merchant catalog scope.
- No change introduces a conflict with date-display rules, status-tag rules, or dialog/edit flow rules.

**Post-Design Gate Result**: PASS

## Complexity Tracking

No constitution violations or exceptional complexity require justification.
