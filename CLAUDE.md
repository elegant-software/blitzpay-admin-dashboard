# BlitzPay Admin Dashboard — Claude Guidance

This file is read by Claude Code at the start of every session. It contains project-specific rules and pointers that must be respected throughout all AI-assisted development.

## Constitution

[`CONSTITUTION.md`](CONSTITUTION.md) is the **primary authority** for this project. It defines the search UI, all update dialog flows, API environment config, status display rules, Angular component constraints, and the TDD convention. Read it first before making any changes to the merchant catalog or display layer.

## Reference Documents

All conventions referenced below live in `docs/reference/`. Read the relevant file before making changes in that area.

| Topic | File |
|---|---|
| User-facing display formats (dates, nulls) | [`docs/reference/user-display.md`](docs/reference/user-display.md) |

## Key Rules

### Dates
Every raw date value (ISO 8601 string, `Date` object) shown to a user **must** go through `DisplayDatePipe`.  
See → [`docs/reference/user-display.md`](docs/reference/user-display.md)

### Angular Components
All components are standalone. Import pipes, directives, and modules explicitly in each component's `imports` array — no shared NgModule.

### TDD
All production code follows Red → Green → Refactor. Write the failing test first, then the minimum implementation.  
See → [CONSTITUTION.md §IX](CONSTITUTION.md#ix-test-driven-development)

- Unit/integration specs: `src/app/**/*.spec.ts` — `TestBed` + `HttpTestingController`.
- Contract specs: `src/contract-tests/**/*.spec.ts` — live HTTP, separate CI step.
- Never use `HttpClient` directly in tests; never stub it manually.

### API Layer
- Product activation/deactivation uses `DELETE /products/{id}` (soft-delete), not the PUT payload.
- Never assume an API field updates via FormData unless confirmed; prefer typed JSON request bodies where possible.

## Project Layout

```
src/app/
├── pipes/          ← shared standalone pipes (DisplayDatePipe, etc.)
├── models/         ← TypeScript interfaces for API responses
├── services/       ← HttpClient wrappers
└── merchant-catalog/
docs/
└── reference/      ← canonical display and behaviour conventions
specs/              ← per-feature plans and research
```
