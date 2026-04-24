# blitzpay-admin-dashboard Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-04-23

## Active Technologies

- TypeScript 5.8, Angular 20 + Angular standalone components, Angular forms, Angular HttpClient, RxJS 7.8, CoreUI 5 CSS (001-merchant-catalog-page)

## Project Structure

```text
src/
├── app/
├── main.ts
└── styles.css

specs/
```

## Commands

npm run build
npm test

## Code Style

TypeScript 5.8, Angular 20: Follow standard conventions

## Recent Changes

- 001-merchant-catalog-page: Added TypeScript 5.8, Angular 20 + Angular standalone components, Angular forms, Angular HttpClient, RxJS 7.8, CoreUI 5 CSS

<!-- MANUAL ADDITIONS START -->

## Constitution

[`CONSTITUTION.md`](CONSTITUTION.md) is the authoritative source for search UI behaviour, update dialog flows, API environment config, status display rules, and Angular component rules. Read it before modifying any merchant-catalog feature.

## Reference Documents

Canonical conventions are in `docs/reference/`. Always consult these before generating or modifying display-layer code.

| Topic | File |
|---|---|
| User-facing display formats (dates, nulls) | [`docs/reference/user-display.md`](docs/reference/user-display.md) |

## Display Rules

- **Dates**: All ISO 8601 / `Date` values shown in the UI must use `DisplayDatePipe` (`src/app/pipes/display-date.pipe.ts`). Format: `d MMM y, HH:mm` (e.g. `24 Apr 2026, 21:55`). Null/undefined renders as `—`.
- **Relative time strings** (e.g. "10 sec ago", "Just now") are already user-friendly — do not pipe them through `DisplayDatePipe`.

<!-- MANUAL ADDITIONS END -->
