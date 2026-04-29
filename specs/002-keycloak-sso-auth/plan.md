# Implementation Plan: Keycloak SSO Authentication

**Branch**: `[002-keycloak-sso-auth]` | **Date**: 2026-04-27 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-keycloak-sso-auth/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Add Keycloak-backed authentication to the existing standalone Angular admin dashboard so protected routes require sign-in, new users can register, and approved social identities can be used through the hosted identity experience. The implementation will introduce Angular routing, an authentication bootstrap flow based on the official Keycloak JavaScript adapter, route guards, an HTTP interceptor for bearer token propagation, and lightweight auth-focused UI states that preserve existing dashboard conventions.

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: TypeScript 5.8  
**Primary Dependencies**: Angular 20 standalone APIs, Angular Router, Angular Forms, Angular HttpClient, RxJS 7.8, CoreUI 5 CSS, `keycloak-js`  
**Storage**: Browser memory for access and refresh tokens managed by the Keycloak adapter; environment files for non-secret identity configuration  
**Testing**: Angular TestBed, Jasmine, Karma  
**Target Platform**: Browser-based admin dashboard for local and staging environments
**Project Type**: Single-project web application (standalone Angular SPA)  
**Performance Goals**: Restore an existing authenticated session during bootstrap without exposing protected content while unauthenticated; support the spec target of sign-in completion within 60 seconds for eligible users  
**Constraints**: All components remain standalone; HTTP stays inside services/interceptors; protected content must not render before auth state resolves; Keycloak settings must be environment-driven; user-facing dates must continue using `DisplayDatePipe` where applicable  
**Scale/Scope**: One Angular application, current merchant catalog plus future protected sections, two runtime environments (`local`, `staging`), one Keycloak tenant entry point with realm/client configuration per environment

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- `PASS`: Use standalone Angular components only; no NgModule-based auth feature will be introduced.
- `PASS`: API calls remain outside components. Authenticated API propagation will be handled through an interceptor and existing services, preserving the `MerchantApiService` boundary.
- `PASS`: Environment-specific configuration will stay in `src/environments/` and service-level config helpers, consistent with the repository's API environment pattern.
- `PASS`: Display rules remain enforceable. Any dates surfaced in auth or audit-related UI must use `DisplayDatePipe`; relative strings remain unpiped.
- `PASS`: No merchant-catalog search or edit workflow rule is violated by the auth feature because authentication wraps page access rather than changing catalog behavior.
- `NOTE`: `.specify/memory/constitution.md` is still template content in this repo. The authoritative constitution used for this plan is [CONSTITUTION.md](../../CONSTITUTION.md) as required by [AGENTS.md](../../AGENTS.md).

## Project Structure

### Documentation (this feature)

```text
specs/002-keycloak-sso-auth/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)
<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```text
src/
├── app/
│   ├── app.component.html
│   ├── app.component.ts
│   ├── app.routes.ts                         # new
│   ├── auth/                                 # new
│   │   ├── components/
│   │   │   ├── auth-shell.component.ts
│   │   │   ├── login-page.component.ts
│   │   │   └── access-denied.component.ts
│   │   ├── guards/
│   │   │   └── auth.guard.ts
│   │   ├── models/
│   │   │   └── auth.models.ts
│   │   ├── services/
│   │   │   ├── auth.service.ts
│   │   │   ├── auth-config.service.ts
│   │   │   └── auth-state.service.ts
│   │   └── interceptors/
│   │       └── auth.interceptor.ts
│   ├── merchant-catalog/
│   ├── models/
│   ├── pipes/
│   └── services/
├── environments/
│   ├── environment.ts
│   └── environment.prod.ts
└── main.ts

specs/
└── 002-keycloak-sso-auth/
    ├── plan.md
    ├── research.md
    ├── data-model.md
    ├── quickstart.md
    └── contracts/
```

**Structure Decision**: Keep the repository as a single Angular application and add a dedicated `src/app/auth/` feature area for routing, auth state, guards, and Keycloak integration. This preserves the existing flat app layout while containing authentication concerns away from merchant catalog domain code.

## Complexity Tracking

No constitution violations require justification.
