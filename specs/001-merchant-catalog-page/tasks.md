# Tasks: Merchant Catalog Page

**Input**: Design documents from `/specs/001-merchant-catalog-page/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/merchant-catalog-ui.md, quickstart.md

**Tests**: No explicit TDD or test-first request was made. This task list focuses on implementation tasks and final build/quickstart verification.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel because it touches different files and has no dependency on incomplete tasks.
- **[Story]**: Which user story this task belongs to.
- Every task includes an exact file path.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare the Angular app structure for the merchant catalog workspace.

- [ ] T001 Create feature directories `src/app/merchant-catalog`, `src/app/models`, and `src/app/services`.
- [ ] T002 [P] Add shared merchant catalog type definitions for BackendEnvironment, Merchant, MerchantLocation, NearbyMerchantResult, Branch, Product, ImageAssetReference, request payloads, and UI state in `src/app/models/merchant-catalog.models.ts`.
- [ ] T003 [P] Add merchant environment selection constants and URL helpers for local, staging, and API version path construction in `src/app/services/merchant-environment.service.ts`.
- [ ] T004 Register Angular HttpClient providers for the standalone app in `src/main.ts`.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Build reusable service and shell integration that all user stories depend on.

**CRITICAL**: No user story work can begin until this phase is complete.

- [ ] T005 Implement typed merchant API client methods for merchant lookup, nearby search, location CRUD, branch list/create/get, product list/create/get/update/delete, and logo update in `src/app/services/merchant-api.service.ts`.
- [ ] T006 Implement shared request state, error message mapping, dirty-form tracking, and confirmation helpers in `src/app/merchant-catalog/merchant-catalog.component.ts`.
- [ ] T007 Create the base merchant catalog component layout with environment controls, API version control, empty initial state, and section placeholders in `src/app/merchant-catalog/merchant-catalog.component.html`.
- [ ] T008 Add base merchant catalog component styles for dense admin layout, cards, tables, forms, image previews, and responsive desktop behavior in `src/app/merchant-catalog/merchant-catalog.component.css`.
- [ ] T009 Integrate Merchant Catalog into the app shell section model and imports in `src/app/app.component.ts`.
- [ ] T010 Add a sidebar navigation item and content host for Merchant Catalog in `src/app/app.component.html`.

**Checkpoint**: Foundation ready. The app can navigate to an empty Merchant Catalog workspace and user story implementation can start.

---

## Phase 3: User Story 1 - Find and Review Merchant Details (Priority: P1) MVP

**Goal**: Admin users can search by merchant/application ID or nearby coordinates, open a merchant, and review summary, location state, branch state, product state, and empty/error states without editing.

**Independent Test**: Search for an existing merchant ID, confirm merchant summary and related sections load; search nearby by valid latitude/longitude/radius and open a result; verify clear empty states for missing location, branches, products, or logo.

### Implementation for User Story 1

- [ ] T011 [US1] Implement direct merchant ID search state, validation, service call, and selected merchant loading flow in `src/app/merchant-catalog/merchant-catalog.component.ts`.
- [ ] T012 [US1] Implement nearby merchant search state, coordinate/radius validation, service call, ordered results handling, and open-result flow in `src/app/merchant-catalog/merchant-catalog.component.ts`.
- [ ] T013 [US1] Implement loading of merchant location, active branches, and active products after selecting a merchant in `src/app/merchant-catalog/merchant-catalog.component.ts`.
- [ ] T014 [US1] Render direct lookup form, nearby search form, validation messages, and nearby results table in `src/app/merchant-catalog/merchant-catalog.component.html`.
- [ ] T015 [US1] Render merchant summary fields, logo state, status, submitted date, last updated date, and empty summary fallback in `src/app/merchant-catalog/merchant-catalog.component.html`.
- [ ] T016 [US1] Render read-only merchant location panel including missing-location empty state and enrichment metadata when available in `src/app/merchant-catalog/merchant-catalog.component.html`.
- [ ] T017 [US1] Render read-only branch list, product list, branch filter display, image preview fallback, and empty list states in `src/app/merchant-catalog/merchant-catalog.component.html`.
- [ ] T018 [US1] Add US1-specific responsive spacing, table density, empty-state, and loading-state styles in `src/app/merchant-catalog/merchant-catalog.component.css`.

**Checkpoint**: User Story 1 is fully functional and independently testable as the MVP.

---

## Phase 4: User Story 2 - Maintain Merchant and Branch Location Data (Priority: P2)

**Goal**: Admin users can update/remove merchant location and create/view branches with address, coordinate, geofence, Google place, and payment-provider setup fields.

**Independent Test**: Open a merchant, save valid merchant location values, confirm refreshed display; remove location and confirm no stale values remain; create a branch with a required name and verify it appears in the active branch list; open a branch detail panel.

### Implementation for User Story 2

- [ ] T019 [P] [US2] Add merchant location form model, branch create form model, and branch detail selection types in `src/app/models/merchant-catalog.models.ts`.
- [ ] T020 [US2] Implement merchant location edit initialization, validation, save, refresh, remove confirmation, and failure-preserving form behavior in `src/app/merchant-catalog/merchant-catalog.component.ts`.
- [ ] T021 [US2] Implement branch create validation, secret-field clearing/masking after save, branch list refresh, and branch detail loading in `src/app/merchant-catalog/merchant-catalog.component.ts`.
- [ ] T022 [US2] Render merchant location edit form with latitude, longitude, geofence radius, Google place ID, address fields, save/remove actions, and validation messages in `src/app/merchant-catalog/merchant-catalog.component.html`.
- [ ] T023 [US2] Render branch create form with name, address, coordinates, geofence, Google place ID, Stripe fields, Braintree fields, save state, and validation messages in `src/app/merchant-catalog/merchant-catalog.component.html`.
- [ ] T024 [US2] Render branch detail panel and branch selection behavior without exposing write-only secret values in `src/app/merchant-catalog/merchant-catalog.component.html`.
- [ ] T025 [US2] Add US2-specific form grid, destructive action, branch detail, and secret-field visual styles in `src/app/merchant-catalog/merchant-catalog.component.css`.

**Checkpoint**: User Stories 1 and 2 work independently; location and branch workflows can be validated without product editing.

---

## Phase 5: User Story 3 - Manage Product Catalog and Images (Priority: P3)

**Goal**: Admin users can create, view, update, filter, and soft-remove active products, including product image files.

**Independent Test**: Open a merchant, create a product with name and unit price, optionally include branch/description/image, verify it appears; edit product fields/image and verify refreshed values; filter by branch; soft-remove the product and verify it disappears from active products.

### Implementation for User Story 3

- [ ] T026 [P] [US3] Add product create/edit form model, product image selection state, and product action state types in `src/app/models/merchant-catalog.models.ts`.
- [ ] T027 [US3] Implement product create form initialization, validation, multipart payload assembly, save, and list refresh in `src/app/merchant-catalog/merchant-catalog.component.ts`.
- [ ] T028 [US3] Implement product detail loading, edit initialization, validation, multipart update, refreshed detail/list state, and failure-preserving form behavior in `src/app/merchant-catalog/merchant-catalog.component.ts`.
- [ ] T029 [US3] Implement branch product filtering, image file selection/clearing, image preview fallback, and soft-remove confirmation flow in `src/app/merchant-catalog/merchant-catalog.component.ts`.
- [ ] T030 [US3] Render product create form with name, unit price, branch, description, image file input, save state, and validation messages in `src/app/merchant-catalog/merchant-catalog.component.html`.
- [ ] T031 [US3] Render product table controls, branch filter, product detail/edit form, image preview area, update action, and soft-remove action in `src/app/merchant-catalog/merchant-catalog.component.html`.
- [ ] T032 [US3] Add US3-specific product table, image preview, file input, price field, and soft-remove confirmation styles in `src/app/merchant-catalog/merchant-catalog.component.css`.

**Checkpoint**: User Stories 1, 2, and 3 are independently functional; product catalog workflows are usable end to end.

---

## Phase 6: User Story 4 - Update Merchant Logo (Priority: P4)

**Goal**: Admin users can set or replace a merchant logo storage reference and see whether the merchant has a logo configured.

**Independent Test**: Open a merchant, enter a valid logo storage key, save it, and confirm the refreshed merchant summary shows the updated logo state; attempt an empty invalid save and verify validation prevents the update.

### Implementation for User Story 4

- [ ] T033 [P] [US4] Add merchant logo form model, logo validation state, and logo preview state types in `src/app/models/merchant-catalog.models.ts`.
- [ ] T034 [US4] Implement logo form initialization, storage-key validation, save action, merchant summary refresh, and failure-preserving form behavior in `src/app/merchant-catalog/merchant-catalog.component.ts`.
- [ ] T035 [US4] Render logo storage-key form, save state, validation messages, configured/unconfigured state, and preview fallback in `src/app/merchant-catalog/merchant-catalog.component.html`.
- [ ] T036 [US4] Add US4-specific logo preview, logo form, and logo fallback styles in `src/app/merchant-catalog/merchant-catalog.component.css`.

**Checkpoint**: All user stories are independently functional.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Finish cross-story quality, validation, docs, and build verification.

- [ ] T037 Audit all merchant catalog requests for consistent loading, empty, validation, success, and service failure states in `src/app/merchant-catalog/merchant-catalog.component.ts`.
- [ ] T038 Audit unsaved-change prompts for merchant switching, nearby-result opening, environment changes, API version changes, and branch/product selection changes in `src/app/merchant-catalog/merchant-catalog.component.ts`.
- [ ] T039 Review accessibility labels, form labels, button text, table headings, and keyboard-friendly controls in `src/app/merchant-catalog/merchant-catalog.component.html`.
- [ ] T040 Align Merchant Catalog visuals with the existing dashboard and remove redundant CSS in `src/app/merchant-catalog/merchant-catalog.component.css`.
- [ ] T041 Update the project README with Merchant Catalog run and validation notes in `README.md`.
- [ ] T042 Run the production build and fix any compile or template errors in `src/app/merchant-catalog/merchant-catalog.component.ts`, `src/app/merchant-catalog/merchant-catalog.component.html`, `src/app/models/merchant-catalog.models.ts`, and `src/app/services/merchant-api.service.ts`.
- [ ] T043 Validate quickstart scenarios and record any backend/environment limitations in `specs/001-merchant-catalog-page/quickstart.md`.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies; can start immediately.
- **Foundational (Phase 2)**: Depends on Setup completion; blocks all user stories.
- **User Story 1 (Phase 3)**: Depends on Foundational; delivers the MVP.
- **User Story 2 (Phase 4)**: Depends on Foundational and benefits from selected-merchant state from US1.
- **User Story 3 (Phase 5)**: Depends on Foundational and benefits from selected-merchant/branch state from US1 and US2.
- **User Story 4 (Phase 6)**: Depends on Foundational and selected-merchant state from US1.
- **Polish (Phase 7)**: Depends on all desired user stories being complete.

### User Story Dependencies

- **US1 (P1)**: Required MVP; no dependency on other user stories.
- **US2 (P2)**: Can be implemented after foundation, but normal validation uses a merchant selected through US1.
- **US3 (P3)**: Can be implemented after foundation, but branch filtering is richer after US2.
- **US4 (P4)**: Can be implemented after foundation, but normal validation uses a merchant selected through US1.

### Within Each User Story

- Models and state types before component behavior.
- Service methods from Phase 2 before component service calls.
- Component behavior before template binding.
- Template binding before story-specific CSS polish.
- Story checkpoint validation before starting the next priority if working sequentially.

### Parallel Opportunities

- T002 and T003 can run in parallel after T001.
- T007 and T008 can run in parallel after T006 if the component shell path exists.
- T019, T026, and T033 can run in parallel because they extend shared model types for separate stories.
- Template/style tasks for one story can be paired after the component behavior for that story is complete.
- US2, US3, and US4 can be staffed in parallel after Phase 2 if changes to `merchant-catalog.component.ts` are coordinated carefully.

---

## Parallel Example: User Story 1

```text
Task: "Render direct lookup form, nearby search form, validation messages, and nearby results table in src/app/merchant-catalog/merchant-catalog.component.html"
Task: "Add US1-specific responsive spacing, table density, empty-state, and loading-state styles in src/app/merchant-catalog/merchant-catalog.component.css"
```

## Parallel Example: User Story 2

```text
Task: "Add merchant location form model, branch create form model, and branch detail selection types in src/app/models/merchant-catalog.models.ts"
Task: "Add US2-specific form grid, destructive action, branch detail, and secret-field visual styles in src/app/merchant-catalog/merchant-catalog.component.css"
```

## Parallel Example: User Story 3

```text
Task: "Add product create/edit form model, product image selection state, and product action state types in src/app/models/merchant-catalog.models.ts"
Task: "Add US3-specific product table, image preview, file input, price field, and soft-remove confirmation styles in src/app/merchant-catalog/merchant-catalog.component.css"
```

## Parallel Example: User Story 4

```text
Task: "Add merchant logo form model, logo validation state, and logo preview state types in src/app/models/merchant-catalog.models.ts"
Task: "Add US4-specific logo preview, logo form, and logo fallback styles in src/app/merchant-catalog/merchant-catalog.component.css"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup.
2. Complete Phase 2: Foundational.
3. Complete Phase 3: User Story 1.
4. Stop and validate merchant lookup, nearby lookup, read-only merchant summary, location, branch, and product display.
5. Demo the read-only Merchant Catalog workspace before adding mutation workflows.

### Incremental Delivery

1. Setup + Foundational: app shell, models, environment controls, API client, and empty workspace.
2. US1: search and read-only merchant review.
3. US2: merchant location and branch maintenance.
4. US3: product catalog and image maintenance.
5. US4: merchant logo storage-key update.
6. Polish: cross-story states, accessibility, README, build, and quickstart validation.

### Parallel Team Strategy

1. Complete T001-T010 together.
2. Assign one developer to US1 as MVP owner.
3. After selected-merchant state is stable, split US2, US3, and US4 across developers.
4. Coordinate edits to `src/app/merchant-catalog/merchant-catalog.component.ts` because all story phases touch it.
5. Run build validation after each completed story checkpoint.

---

## Notes

- Product images use multipart product create/update calls.
- Merchant logos use storage-key updates only; logo file upload is not supported by the provided API.
- Direct merchant lookup is by identifier; nearby search is the available discovery workflow.
- Keep secret branch payment-provider values masked or cleared after save.
- Existing untracked `.idea/` files are unrelated to these tasks.
