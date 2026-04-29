# Tasks: Payment Operations Dashboard

**Input**: Design documents from `/specs/003-payment-ops-dashboard/`
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

**Purpose**: Establish the new dashboard feature area and align the shell with the planned structure

- [X] T001 Create the payment operations dashboard feature directory structure under `src/app/payment-ops-dashboard/`
- [X] T002 Update navigation and shell section typing for the redesigned dashboard entry point in `src/app/auth/components/auth-shell.component.ts`
- [X] T003 [P] Add placeholder shell content region and section host updates in `src/app/auth/components/auth-shell.component.html`
- [X] T004 [P] Add baseline shell styling hooks for the redesigned dashboard region in `src/app/auth/components/auth-shell.component.css`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Build the shared data and component foundation required by all user stories

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T005 Create typed dashboard view models from the planned data model in `src/app/payment-ops-dashboard/payment-ops-dashboard.models.ts`
- [X] T006 Implement mock dashboard snapshot assembly and selection helpers in `src/app/services/payment-ops-dashboard-data.service.ts`
- [X] T007 Create the standalone payment operations dashboard component scaffold and state wiring in `src/app/payment-ops-dashboard/payment-ops-dashboard.component.ts`
- [X] T008 Create the base dashboard layout skeleton with mock-data banner and section placeholders in `src/app/payment-ops-dashboard/payment-ops-dashboard.component.html`
- [X] T009 Create the base responsive visual system, CSS variables, and section layout styles in `src/app/payment-ops-dashboard/payment-ops-dashboard.component.css`
- [X] T010 Import and render the new dashboard component from the authenticated shell in `src/app/auth/components/auth-shell.component.ts`

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Review Business Health At A Glance (Priority: P1) 🎯 MVP

**Goal**: Deliver a redesigned operations overview that shows merchants, branches, products, transactions, and online/mobile activity together on the default dashboard screen

**Independent Test**: Open the `Dashboard` section and verify that summary indicators, mock-data labeling, mixed-status visibility, and top-level portfolio overview render correctly without selecting a merchant

- [X] T011 [P] [US1] Extend summary and snapshot model helpers for overview cards and status rollups in `src/app/payment-ops-dashboard/payment-ops-dashboard.models.ts`
- [X] T012 [US1] Populate portfolio summary, mixed-status counts, and top-level metrics in `src/app/services/payment-ops-dashboard-data.service.ts`
- [X] T013 [US1] Bind overview view-model state and default dashboard behaviors in `src/app/payment-ops-dashboard/payment-ops-dashboard.component.ts`
- [X] T014 [US1] Implement the overview hero, summary cards, and mock-data disclosure banner in `src/app/payment-ops-dashboard/payment-ops-dashboard.component.html`
- [X] T015 [US1] Implement responsive overview card, banner, and status styling in `src/app/payment-ops-dashboard/payment-ops-dashboard.component.css`

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Drill Into Merchant, Branch, And Product Performance (Priority: P2)

**Goal**: Let users select merchants and inspect related branches and products without leaving the dashboard context

**Independent Test**: Select a merchant on the dashboard and verify that all related branches and products, including non-active ones, appear with clear status and contextual summary values

- [X] T016 [P] [US2] Extend merchant, branch, product, and selection-state models for contextual drill-down behavior in `src/app/payment-ops-dashboard/payment-ops-dashboard.models.ts`
- [X] T017 [US2] Add merchant selection, branch selection, and derived merchant-context helpers in `src/app/services/payment-ops-dashboard-data.service.ts`
- [X] T018 [US2] Implement merchant and branch selection state handling in `src/app/payment-ops-dashboard/payment-ops-dashboard.component.ts`
- [X] T019 [US2] Build the merchant portfolio, branch context, and product context sections in `src/app/payment-ops-dashboard/payment-ops-dashboard.component.html`
- [X] T020 [US2] Add visual treatment for merchant cards, branch lists, product panels, and empty states in `src/app/payment-ops-dashboard/payment-ops-dashboard.component.css`

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Monitor Payment And Channel Activity (Priority: P3)

**Goal**: Add payment transaction visibility and online/mobile channel comparison tied to the current dashboard context

**Independent Test**: Load the dashboard with mock transactions, select a merchant or branch, and verify transaction summaries plus online/mobile comparisons update correctly and remain readable when one channel has no activity

- [X] T021 [P] [US3] Extend transaction and channel snapshot models for contextual activity views in `src/app/payment-ops-dashboard/payment-ops-dashboard.models.ts`
- [X] T022 [US3] Add transaction aggregation, channel comparison, and fallback relationship handling in `src/app/services/payment-ops-dashboard-data.service.ts`
- [X] T023 [US3] Bind contextual transaction and channel state into the dashboard component in `src/app/payment-ops-dashboard/payment-ops-dashboard.component.ts`
- [X] T024 [US3] Build the transaction activity and online/mobile comparison sections in `src/app/payment-ops-dashboard/payment-ops-dashboard.component.html`
- [X] T025 [US3] Add styles for transaction lists, amount/status emphasis, and channel comparison panels in `src/app/payment-ops-dashboard/payment-ops-dashboard.component.css`

**Checkpoint**: All user stories should now be independently functional

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final integration, UX hardening, and validation across the redesigned dashboard

- [X] T026 Update dashboard copy, empty-state language, and mock-data labeling consistency in `src/app/payment-ops-dashboard/payment-ops-dashboard.component.html`
- [X] T027 Ensure all dashboard timestamps render with `DisplayDatePipe` and required standalone imports in `src/app/payment-ops-dashboard/payment-ops-dashboard.component.ts` and `src/app/payment-ops-dashboard/payment-ops-dashboard.component.html`
- [X] T028 Verify shell-to-dashboard and dashboard-to-merchant-catalog navigation continuity in `src/app/auth/components/auth-shell.component.ts` and `src/app/auth/components/auth-shell.component.html`
- [X] T029 Run quickstart validation scenarios and document any adjustments in `specs/003-payment-ops-dashboard/quickstart.md`
- [X] T030 Run Angular build validation and fix any remaining integration issues across `src/app/auth/components/` and `src/app/payment-ops-dashboard/`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
- **Polish (Phase 6)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Depends on User Story 1 data and component foundation because merchant/branch/product drill-down extends the overview state already exposed on the dashboard
- **User Story 3 (P3)**: Depends on User Story 2 contextual selection behavior so transaction and channel activity can follow merchant/branch context cleanly

### Within Each User Story

- Models before data-service extensions
- Data-service extensions before component state wiring
- Component state wiring before template rendering
- Template rendering before styling polish

### Parallel Opportunities

- `T003` and `T004` can run in parallel after `T002`
- `T011` can run in parallel with planning review before `T012`
- `T016` and `T021` are parallelizable if separate contributors handle later story phases independently after their prerequisites

---

## Parallel Example: User Story 2

```bash
# After User Story 1 is complete, these can be prepared in parallel:
Task: "Extend merchant, branch, product, and selection-state models in src/app/payment-ops-dashboard/payment-ops-dashboard.models.ts"
Task: "Review merchant/branch/product UI structure in specs/003-payment-ops-dashboard/contracts/payment-ops-dashboard-ui.md"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. Validate the new default dashboard overview independently
5. Stop for review before adding drill-down and transaction complexity

### Incremental Delivery

1. Complete Setup + Foundational
2. Deliver User Story 1 as the new operations landing experience
3. Add User Story 2 merchant/branch/product context
4. Add User Story 3 transaction and channel visibility
5. Finish with polish and build validation

### Parallel Team Strategy

With multiple developers:

1. One developer handles shell integration in `src/app/auth/components/`
2. One developer handles typed models and mock-data service in `src/app/payment-ops-dashboard/` and `src/app/services/`
3. One developer handles dashboard template and CSS composition in `src/app/payment-ops-dashboard/`

---

## Notes

- [P] tasks are limited to tasks that can realistically proceed without editing the same implementation file concurrently
- Each user story remains demonstrable as a usable increment inside the authenticated shell
- The suggested MVP scope is **User Story 1 only**
- All tasks follow the required checklist format with IDs, labels where required, and exact file paths
