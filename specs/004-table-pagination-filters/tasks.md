# Tasks: Branch and Product Table Controls

**Input**: Design documents from `/specs/004-table-pagination-filters/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Test-specific tasks are not generated because the feature specification does not require a TDD workflow. Validation is handled through build checks and story-level manual verification from `quickstart.md`.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- Single project: `src/`, `specs/` at repository root
- Angular feature files live under `src/app/`

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Install the latest Angular-20-compatible PrimeNG stack and prepare global styling hooks

- [X] T001 Add `primeng@20.4.0`, `@angular/cdk@20.0.3`, `@primeuix/themes`, and `primeicons` dependency entries in `package.json`
- [X] T002 Update the resolved PrimeNG installation metadata for the Angular-20-compatible dependency set in `package-lock.json`
- [X] T003 Configure PrimeNG provider/theme wiring in `src/main.ts` and required global style imports in `src/styles.css`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Build the shared table-state foundation required before either table can gain controls

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T004 [P] Add reusable pagination, branch-table, product-table, and sorting state interfaces in `src/app/models/merchant-catalog.models.ts`
- [X] T005 [P] Create client-side query normalization, filter matching, and page slicing helpers in `src/app/merchant-catalog/merchant-catalog-table-state.ts`
- [X] T006 Import PrimeNG table-control modules and initialize independent branch/product table state in `src/app/merchant-catalog/merchant-catalog.component.ts`
- [X] T007 Update merchant load, branch refresh, product refresh, and branch-selection flows to synchronize table state in `src/app/merchant-catalog/merchant-catalog.component.ts`

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Find the Right Branch Faster (Priority: P1) 🎯 MVP

**Goal**: Let admins filter, sort, and page the branches table without breaking branch selection or existing row actions

**Independent Test**: Load a merchant with many branches, filter by branch name/country/city/zipcode, sort by branch name in both directions, move between pages, and select a visible branch while keeping branch actions available

- [X] T008 [P] [US1] Add the branch table toolbar, filter input, visible-count report, and paginator bindings in `src/app/merchant-catalog/merchant-catalog.component.html`
- [X] T009 [P] [US1] Add branch table control, selected-row, and paginator styles in `src/app/merchant-catalog/merchant-catalog.component.css`
- [X] T010 [US1] Implement branch filter matching for branch name, country, city, and zipcode plus page-size changes, visible branch row derivation, and selected-branch preservation in `src/app/merchant-catalog/merchant-catalog.component.ts`
- [X] T011 [US1] Add branch-name sortable column behavior and sort-state handling in `src/app/merchant-catalog/merchant-catalog.component.ts` and `src/app/merchant-catalog/merchant-catalog.component.html`
- [X] T012 [P] [US1] Add branch sort-indicator styling and interactive header affordances in `src/app/merchant-catalog/merchant-catalog.component.css`

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Find the Right Product Within the Selected Branch (Priority: P2)

**Goal**: Let admins filter, sort, and page branch-scoped products while preserving the existing product edit entry points

**Independent Test**: Select a branch with many products, filter products by product code/category/name, sort by product name/product code/category in both directions, move between product-result pages, and open the expected product from the filtered set

- [X] T013 [P] [US2] Add the products table toolbar, branch-scope report, filter input, and paginator bindings in `src/app/merchant-catalog/merchant-catalog.component.html`
- [X] T014 [P] [US2] Add products table control, branch-scope, and paginator styles in `src/app/merchant-catalog/merchant-catalog.component.css`
- [X] T015 [US2] Implement product filter matching for product code, category, and product name plus visible product row derivation and independent product page-size/page-report behavior in `src/app/merchant-catalog/merchant-catalog.component.ts`
- [X] T016 [US2] Reset product table state on branch changes and prevent stale product rows during product reloads in `src/app/merchant-catalog/merchant-catalog.component.ts`
- [X] T017 [US2] Add product sortable column behavior for name, product code, and category in `src/app/merchant-catalog/merchant-catalog.component.ts` and `src/app/merchant-catalog/merchant-catalog.component.html`
- [X] T018 [P] [US2] Add product sort-indicator styling and interactive header affordances in `src/app/merchant-catalog/merchant-catalog.component.css`

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Recover Quickly From Empty Or Narrowed Results (Priority: P3)

**Goal**: Make over-restrictive filters or sort/page combinations easy to understand and recover from across both tables

**Independent Test**: Apply branch and product filters that return zero rows, change sorting while filtered and paged, verify the tables distinguish empty-data versus zero-match states, and clear filters without rerunning merchant search

- [X] T019 [P] [US3] Add filter-specific empty-state copy and clear-filter actions for both tables in `src/app/merchant-catalog/merchant-catalog.component.html`
- [X] T020 [P] [US3] Add zero-result, empty-state, and compact responsive control styles in `src/app/merchant-catalog/merchant-catalog.component.css`
- [X] T021 [US3] Implement no-data versus no-filter-results state resolution and clear-filter handlers in `src/app/merchant-catalog/merchant-catalog.component.ts`
- [X] T022 [US3] Normalize current page after branch or product edits, deletes, refreshes, filters, and sorting changes in `src/app/merchant-catalog/merchant-catalog.component.ts`

**Checkpoint**: All user stories should now be independently functional

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final integration, validation, and documentation alignment

- [X] T023 Update the PrimeNG compatibility notes to reference `primeng@20.4.0` in `specs/004-table-pagination-filters/research.md`, `specs/004-table-pagination-filters/plan.md`, and `specs/004-table-pagination-filters/quickstart.md`
- [X] T024 Update documentation examples and validation steps to cover branch-name sorting and product sorting by name/code/category in `specs/004-table-pagination-filters/contracts/merchant-catalog-table-controls-ui.md` and `specs/004-table-pagination-filters/quickstart.md`
- [ ] T025 Run quickstart validation scenarios and adjust the walkthrough if needed in `specs/004-table-pagination-filters/quickstart.md`
- [ ] T026 Run Angular build validation and fix any remaining integration issues in `src/main.ts`, `src/styles.css`, `src/app/models/merchant-catalog.models.ts`, `src/app/merchant-catalog/merchant-catalog-table-state.ts`, `src/app/merchant-catalog/merchant-catalog.component.ts`, `src/app/merchant-catalog/merchant-catalog.component.html`, and `src/app/merchant-catalog/merchant-catalog.component.css`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: Depend on Foundational completion
- **Polish (Phase 6)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2), but should land after US1 because both stories extend the same merchant-catalog component files and US1 establishes the branch-table interaction pattern
- **User Story 3 (P3)**: Depends on US1 and US2 because it refines both tables' empty-state and recovery behavior across filtering, sorting, and pagination

### Within Each User Story

- Table-state foundation before user-facing bindings
- Component behavior before template completion
- Template completion before styling polish
- Sorting behavior before quickstart/build validation

### Parallel Opportunities

- `T004` and `T005` can run in parallel after Setup completes
- `T008` and `T009` can run in parallel once branch-table behavior is defined from the foundational state
- `T012` can run in parallel with `T011` after the sortable branch-header structure is decided
- `T013` and `T014` can run in parallel once product-table behavior is defined from the foundational state
- `T018` can run in parallel with `T017` after the sortable product-header structure is decided
- `T019` and `T020` can run in parallel while empty-state behavior is being finalized

---

## Parallel Example: User Story 2

```bash
# After foundational table-state work is complete, these can proceed in parallel:
Task: "Add product sortable column behavior for name, product code, and category in src/app/merchant-catalog/merchant-catalog.component.ts and src/app/merchant-catalog/merchant-catalog.component.html"
Task: "Add product sort-indicator styling and interactive header affordances in src/app/merchant-catalog/merchant-catalog.component.css"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. Validate branch filtering, branch-name sorting, and pagination independently
5. Stop for review before adding product-table sorting

### Incremental Delivery

1. Complete Setup + Foundational
2. Deliver User Story 1 branch-table controls with filtering, sorting, and pagination
3. Add User Story 2 product-table controls with filtering, sorting, and pagination
4. Add User Story 3 recovery and zero-result behaviors across combined states
5. Finish with build validation and quickstart verification

### Parallel Team Strategy

With multiple developers:

1. One developer handles dependency and global-style setup in `package.json`, `package-lock.json`, `src/main.ts`, and `src/styles.css`
2. One developer handles shared table-state models and helpers in `src/app/models/` and `src/app/merchant-catalog/merchant-catalog-table-state.ts`
3. One developer handles merchant-catalog template and CSS composition in `src/app/merchant-catalog/`

---

## Notes

- [P] tasks are limited to tasks that can proceed without editing the same implementation file concurrently
- The PrimeNG research result for this repository is: latest overall PrimeNG is `21.1.6`, but the latest version compatible with Angular 20 is `20.4.0`
- The suggested MVP scope is **User Story 1 only**
- All tasks follow the required checklist format with IDs, labels where required, and exact file paths
