# Tasks: Keycloak SSO Authentication

**Input**: Design documents from `/specs/002-keycloak-sso-auth/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: No story-specific test-first tasks were generated because the specification does not require a TDD workflow. Validation tasks are included in the polish phase.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- Single Angular application at repository root
- Source files under `src/`
- Feature planning artifacts under `specs/002-keycloak-sso-auth/`

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Add the base dependency and configuration surfaces required for Keycloak-backed authentication.

- [X] T001 Add the `keycloak-js` dependency in /Users/mehdi/MyProject/blitzpay-admin-dashboard/package.json
- [X] T002 Extend auth-capable environment configuration in /Users/mehdi/MyProject/blitzpay-admin-dashboard/src/environments/environment.ts and /Users/mehdi/MyProject/blitzpay-admin-dashboard/src/environments/environment.prod.ts
- [X] T003 [P] Add the silent SSO callback asset in /Users/mehdi/MyProject/blitzpay-admin-dashboard/public/silent-check-sso.html

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Create the routing, auth state, and request infrastructure that all user stories depend on.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T004 Create shared auth domain types in /Users/mehdi/MyProject/blitzpay-admin-dashboard/src/app/auth/models/auth.models.ts
- [X] T005 [P] Implement environment-to-runtime auth configuration mapping in /Users/mehdi/MyProject/blitzpay-admin-dashboard/src/app/auth/services/auth-config.service.ts
- [X] T006 [P] Implement auth session state management in /Users/mehdi/MyProject/blitzpay-admin-dashboard/src/app/auth/services/auth-state.service.ts
- [X] T007 Implement Keycloak adapter bootstrap, login/logout helpers, token refresh, and role mapping in /Users/mehdi/MyProject/blitzpay-admin-dashboard/src/app/auth/services/auth.service.ts
- [X] T008 [P] Implement protected-route gating in /Users/mehdi/MyProject/blitzpay-admin-dashboard/src/app/auth/guards/auth.guard.ts
- [X] T009 [P] Implement bearer-token attachment and 401/403 handling in /Users/mehdi/MyProject/blitzpay-admin-dashboard/src/app/auth/interceptors/auth.interceptor.ts
- [X] T010 Create application routes for auth and protected dashboard sections in /Users/mehdi/MyProject/blitzpay-admin-dashboard/src/app/app.routes.ts
- [X] T011 Wire router, auth initialization, and HTTP interceptor providers in /Users/mehdi/MyProject/blitzpay-admin-dashboard/src/main.ts

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Secure admin sign-in (Priority: P1) 🎯 MVP

**Goal**: Require authentication before dashboard access and return eligible users to the protected admin experience after successful sign-in.

**Independent Test**: Open a protected dashboard URL while signed out, complete hosted sign-in successfully, and confirm the user lands back in the dashboard with protected API calls carrying an access token.

### Implementation for User Story 1

- [X] T012 [P] [US1] Create the auth entry page component in /Users/mehdi/MyProject/blitzpay-admin-dashboard/src/app/auth/components/login-page.component.ts
- [X] T013 [P] [US1] Create the auth entry page template and styling in /Users/mehdi/MyProject/blitzpay-admin-dashboard/src/app/auth/components/login-page.component.html and /Users/mehdi/MyProject/blitzpay-admin-dashboard/src/app/auth/components/login-page.component.css
- [X] T014 [P] [US1] Create the protected auth shell component in /Users/mehdi/MyProject/blitzpay-admin-dashboard/src/app/auth/components/auth-shell.component.ts
- [X] T015 [P] [US1] Create the protected auth shell template and styling in /Users/mehdi/MyProject/blitzpay-admin-dashboard/src/app/auth/components/auth-shell.component.html and /Users/mehdi/MyProject/blitzpay-admin-dashboard/src/app/auth/components/auth-shell.component.css
- [X] T016 [US1] Refactor /Users/mehdi/MyProject/blitzpay-admin-dashboard/src/app/app.component.ts and /Users/mehdi/MyProject/blitzpay-admin-dashboard/src/app/app.component.html to render through the routed auth shell and preserve dashboard section navigation
- [X] T017 [US1] Update /Users/mehdi/MyProject/blitzpay-admin-dashboard/src/app/services/merchant-api.service.ts to rely on the auth interceptor flow without manual token handling regressions
- [X] T018 [US1] Add profile-menu `Logout` and auth-aware header state in /Users/mehdi/MyProject/blitzpay-admin-dashboard/src/app/app.component.ts and /Users/mehdi/MyProject/blitzpay-admin-dashboard/src/app/app.component.html

**Checkpoint**: User Story 1 should now block anonymous access, support hosted sign-in, and restore protected dashboard usage for authorized admins.

---

## Phase 4: User Story 2 - Self-registration for new admin access (Priority: P2)

**Goal**: Give first-time users a clear registration entry path and show useful outcome messaging when access is still pending or denied.

**Independent Test**: Start from the auth entry page, choose registration, complete the hosted registration flow, and confirm the app shows the correct pending-access or next-step state instead of protected content.

### Implementation for User Story 2

- [X] T019 [US2] Add registration-entry behavior and pending-registration messaging in /Users/mehdi/MyProject/blitzpay-admin-dashboard/src/app/auth/services/auth.service.ts
- [X] T020 [US2] Extend the auth entry page with registration-specific content and failure guidance in /Users/mehdi/MyProject/blitzpay-admin-dashboard/src/app/auth/components/login-page.component.html and /Users/mehdi/MyProject/blitzpay-admin-dashboard/src/app/auth/components/login-page.component.ts
- [X] T021 [P] [US2] Create the access-denied and pending-access page component in /Users/mehdi/MyProject/blitzpay-admin-dashboard/src/app/auth/components/access-denied.component.ts
- [X] T022 [P] [US2] Create the access-denied and pending-access template and styling in /Users/mehdi/MyProject/blitzpay-admin-dashboard/src/app/auth/components/access-denied.component.html and /Users/mehdi/MyProject/blitzpay-admin-dashboard/src/app/auth/components/access-denied.component.css
- [X] T023 [US2] Update /Users/mehdi/MyProject/blitzpay-admin-dashboard/src/app/app.routes.ts and /Users/mehdi/MyProject/blitzpay-admin-dashboard/src/app/auth/guards/auth.guard.ts to route unauthorized or pending users to the access-denied experience

**Checkpoint**: User Story 2 should allow new users to start registration and receive a clear non-dashboard state when approval is still required.

---

## Phase 5: User Story 3 - Social sign-in and account reuse (Priority: P3)

**Goal**: Support approved social identity sign-in through the hosted Keycloak experience and prevent duplicate-account confusion in the frontend flow.

**Independent Test**: Use an approved social provider from the hosted auth experience and confirm the app either enters the existing authorized account, resumes a pending registration, or shows a clear access-resolution message.

### Implementation for User Story 3

- [X] T024 [US3] Extend identity-provider and account-linking state handling in /Users/mehdi/MyProject/blitzpay-admin-dashboard/src/app/auth/models/auth.models.ts and /Users/mehdi/MyProject/blitzpay-admin-dashboard/src/app/auth/services/auth-state.service.ts
- [X] T025 [US3] Implement social-provider detection, account-match outcomes, and duplicate-account prevention messaging in /Users/mehdi/MyProject/blitzpay-admin-dashboard/src/app/auth/services/auth.service.ts
- [X] T026 [US3] Update social sign-in guidance and account-reuse messaging in /Users/mehdi/MyProject/blitzpay-admin-dashboard/src/app/auth/components/login-page.component.html and /Users/mehdi/MyProject/blitzpay-admin-dashboard/src/app/auth/components/access-denied.component.html
- [X] T027 [US3] Ensure role-denial, multi-match, and provider-outage outcomes surface consistently through /Users/mehdi/MyProject/blitzpay-admin-dashboard/src/app/auth/guards/auth.guard.ts and /Users/mehdi/MyProject/blitzpay-admin-dashboard/src/app/auth/interceptors/auth.interceptor.ts

**Checkpoint**: All three user stories should now work independently, including direct sign-in, self-registration entry, and social sign-in/account reuse outcomes.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Finalize documentation, validation, and repo-wide consistency for the completed auth feature.

- [X] T028 [P] Document required Keycloak realm, client, and provider setup details in /Users/mehdi/MyProject/blitzpay-admin-dashboard/specs/002-keycloak-sso-auth/quickstart.md
- [X] T029 Update generated repo guidance to reflect the new auth architecture in /Users/mehdi/MyProject/blitzpay-admin-dashboard/AGENTS.md
- [ ] T030 Run end-to-end feature validation from /Users/mehdi/MyProject/blitzpay-admin-dashboard/specs/002-keycloak-sso-auth/quickstart.md and record any follow-up notes in /Users/mehdi/MyProject/blitzpay-admin-dashboard/specs/002-keycloak-sso-auth/quickstart.md
- [ ] T031 Run `npm test` and `npm run build` from /Users/mehdi/MyProject/blitzpay-admin-dashboard and fix any auth-related regressions in /Users/mehdi/MyProject/blitzpay-admin-dashboard/src/

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational completion
- **User Story 2 (Phase 4)**: Depends on Foundational completion and reuses the auth entry flow from US1 for registration messaging
- **User Story 3 (Phase 5)**: Depends on Foundational completion and builds on the login and denial states introduced in US1 and US2
- **Polish (Phase 6)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - MVP and first deployable increment
- **User Story 2 (P2)**: Can start after Foundational (Phase 2), but benefits from US1 auth entry UI already existing
- **User Story 3 (P3)**: Can start after Foundational (Phase 2), but depends on US1/US2 auth UI states for coherent account-reuse messaging

### Within Each User Story

- Shared models and auth state updates before story-specific UI wiring
- Service behavior before route or component integration
- UI messaging before final validation
- Story checkpoint validation before moving to the next priority

### Parallel Opportunities

- `T003` can run in parallel with `T001-T002`
- `T005`, `T006`, `T008`, and `T009` can run in parallel after `T004`
- `T012-T015` can run in parallel within US1
- `T021-T022` can run in parallel within US2
- `T028` and `T029` can run in parallel during polish

---

## Parallel Example: User Story 1

```bash
Task: "Create the auth entry page component in /Users/mehdi/MyProject/blitzpay-admin-dashboard/src/app/auth/components/login-page.component.ts"
Task: "Create the auth entry page template and styling in /Users/mehdi/MyProject/blitzpay-admin-dashboard/src/app/auth/components/login-page.component.html and /Users/mehdi/MyProject/blitzpay-admin-dashboard/src/app/auth/components/login-page.component.css"
Task: "Create the protected auth shell component in /Users/mehdi/MyProject/blitzpay-admin-dashboard/src/app/auth/components/auth-shell.component.ts"
Task: "Create the protected auth shell template and styling in /Users/mehdi/MyProject/blitzpay-admin-dashboard/src/app/auth/components/auth-shell.component.html and /Users/mehdi/MyProject/blitzpay-admin-dashboard/src/app/auth/components/auth-shell.component.css"
```

---

## Parallel Example: User Story 2

```bash
Task: "Create the access-denied and pending-access page component in /Users/mehdi/MyProject/blitzpay-admin-dashboard/src/app/auth/components/access-denied.component.ts"
Task: "Create the access-denied and pending-access template and styling in /Users/mehdi/MyProject/blitzpay-admin-dashboard/src/app/auth/components/access-denied.component.html and /Users/mehdi/MyProject/blitzpay-admin-dashboard/src/app/auth/components/access-denied.component.css"
```

---

## Parallel Example: User Story 3

```bash
Task: "Extend identity-provider and account-linking state handling in /Users/mehdi/MyProject/blitzpay-admin-dashboard/src/app/auth/models/auth.models.ts and /Users/mehdi/MyProject/blitzpay-admin-dashboard/src/app/auth/services/auth-state.service.ts"
Task: "Implement social-provider detection, account-match outcomes, and duplicate-account prevention messaging in /Users/mehdi/MyProject/blitzpay-admin-dashboard/src/app/auth/services/auth.service.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. Validate the protected-route sign-in flow independently
5. Demo or deploy the authenticated dashboard MVP

### Incremental Delivery

1. Complete Setup + Foundational to establish reusable auth infrastructure
2. Deliver User Story 1 for protected sign-in and sign-out
3. Deliver User Story 2 for first-time registration entry and pending-access handling
4. Deliver User Story 3 for social sign-in and account-reuse outcomes
5. Finish with documentation and validation tasks

### Parallel Team Strategy

1. One developer completes Setup + Foundational
2. After foundation is stable:
   - Developer A: User Story 1 routed auth shell and sign-in flow
   - Developer B: User Story 2 access-denied and registration messaging
   - Developer C: User Story 3 social identity and account-reuse handling
3. Finish with shared validation and documentation

---

## Notes

- All tasks follow the required checklist format with IDs, optional `[P]` markers, story labels where applicable, and exact file paths
- User Story 1 is the recommended MVP scope
- User Story phases are structured so each can be validated independently against the spec acceptance scenarios
