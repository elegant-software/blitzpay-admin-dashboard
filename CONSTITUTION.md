# BlitzPay Admin Dashboard — Constitution

**Version**: 1.0.0 | **Ratified**: 2026-04-25 | **Scope**: Entire admin dashboard

This document is the authoritative description of how the admin UI is structured, how search works, and how update flows must behave. All AI agents, human developers, and code reviewers must comply with the rules here. Where a rule conflicts with a spec or task file, this Constitution takes precedence.

---

## I. Reference Documents

| Convention | Canonical file |
|---|---|
| User-facing display formats (dates, nulls, status labels) | [`docs/reference/user-display.md`](docs/reference/user-display.md) |
| Architecture decision records | `docs/adr/` |
| Feature specs | `specs/001-merchant-catalog-page/` |

---

## II. Merchant Catalog — Search UI

### Entry point

The merchant catalog lives at `src/app/merchant-catalog/`. The page is reached from the sidebar under **Operations → Merchants**.

### Search interaction

1. Admin types a **merchant ID** (`applicationId`) into the search field and presses **Search** (or Enter).
2. The component calls `GET /merchants/{merchantId}` via `MerchantApiService`.
3. On success, three data loads happen in parallel via `forkJoin`:
   - `GET /merchants/{merchantId}/location` — optional, 404 is silently swallowed.
   - `GET /merchants/{merchantId}/branches` — list of branches.
4. The first branch in the list is automatically selected, triggering a product load for that branch.
5. A summary line ("Showing N branches and M products for REF") is rendered below the search bar.

### Search result layout

```
┌──────────────────────────────────────────────────────────────┐
│ Merchant card (1 row)                                        │
│  Merchant Name │ City │ Status tag │ Logo thumb │ Edit icon  │
└──────────────────────────────────────────────────────────────┘

┌─────────────────────────────┐  ┌──────────────────────────────┐
│ Branches (N rows)            │  │ Products (scoped to branch)  │
│  Name │ City │ Address │ St │  │  [img] │ Name+Desc │ St │ ⚡ │
│  …    │ …    │ …       │    │  │  …     │ …         │    │   │
└─────────────────────────────┘  └──────────────────────────────┘
```

- **Branches** occupies `col-lg-5`, **Products** occupies `col-lg-7`.
- Clicking a branch row reloads the products table for that branch.
- Status tags use colored CSS classes — see §V.
- Logo / product thumbnails are 40 × 40 px rounded images; a dashed empty box is shown as fallback.

### Empty / error states

| Condition | Behaviour |
|---|---|
| Search field empty | Error alert: "Enter a search value before searching." |
| Merchant not found | Error alert with API message or generic fallback. |
| No branches for merchant | Branches table shows "No branches for this merchant." |
| No products for selected branch | Products table shows "No products for the selected branch." |
| No branch selected | Products table shows "Select a branch to load products." |
| **Clear** pressed | All state reset; search term, tables, and forms cleared. |

---

## III. Merchant Catalog — Update UI

All edits happen in **overlay dialogs** (`.product-dialog-backdrop` + `.product-dialog.card`). No inline editing. Each dialog opens with freshly loaded data, not stale list state.

### Dirty-form guard

Every dialog tracks a `dirtyForms` flag per entity. If the user navigates away or opens a new search with unsaved changes, a `confirm()` prompt blocks the action.

---

### 3a. Merchant Dialog

**Opened by**: edit icon (pencil SVG) in the Merchant card row.

**API on open**: form is populated from the already-loaded `selectedMerchant`; no extra GET.

**Fields**

| Field | Type | Required | Notes |
|---|---|---|---|
| Merchant Name | text input | Yes | `legalBusinessName` |
| Status | toggle switch | — | Maps to `status` enum. Toggle ON = `ACTIVE`; toggle OFF sets status to `SETUP` (unless it was already non-ACTIVE). |
| Primary Business Address | text input | Yes | |
| Contact Name | text input | Yes | |
| Contact Email | text input | Yes | |
| Contact Phone | text input | Yes | |
| Active Payment Channels | checkboxes | — | Multi-select: PAYPAL, STRIPE, TRUELAYER |
| Logo File | file picker | — | Triggers upload flow on save; auto-populates storage key. |
| Logo Storage Key | text input | — | Manual fallback; format `merchants/{id}/logo.<ext>` |
| Logo Preview | image (40 × 40 px) | — | Shows current or file-picker preview; dashed box if none. |

**Save sequence**

1. `PUT /merchants/{merchantId}` with JSON body (`UpdateMerchantRequest`).
2. If logo file or storage key changed: upload file → `PUT /merchants/{merchantId}/logo` with `{ storageKey }`.
3. Dialog closes; merchant card row updates in place.

---

### 3b. Branch Dialog

**Opened by**: edit icon in the Branches table row (stops row-click propagation).

**API on open**: `GET /merchants/{merchantId}/branches/{branchId}` for fresh data.

**Fields**

| Field | Type | Notes |
|---|---|---|
| Name | text input | Required |
| Status | toggle switch | `active: boolean` — two-way bound directly. |
| Address Line 1 / 2 | text inputs | Optional |
| Post Code / City / Country | text inputs | Optional |
| Google Place ID | text input | Optional |
| Contact Name / Email / Phone | text inputs | Optional |
| Latitude / Longitude | text inputs | Trigger live Leaflet map preview on change. |
| Geofence Radius (metres) | text input | Renders geofence circle on map when > 0. |
| Active Payment Channels | checkboxes | Same options as merchant. |
| Map Preview | Leaflet embed | OpenStreetMap tiles; shown only when lat/lon are valid. |

**Save sequence**: `PUT /merchants/{merchantId}/branches/{branchId}` with `UpdateBranchRequest`.

**Deactivate**: Delete icon in branch row (outside dialog) → `DELETE /merchants/{merchantId}/branches/{branchId}` (soft-deactivate). Requires `confirm()`.

---

### 3c. Product Dialog

**Opened by**: **Edit** button in the Products table row.

**API on open**: `GET /merchants/{merchantId}/products/{productId}?branchId=…` for fresh data.

**Fields**

| Field | Type | Notes |
|---|---|---|
| Name | text input | Required |
| Status | toggle switch | Active / Inactive. See save sequence below. |
| Unit Price | text input | Required; stored as number. |
| Branch | select | Options from loaded branches; empty = merchant-level. |
| Image | file picker | Upload replaces existing image. |
| Image Preview | image (80 px wide) | Shows current or file-picker preview; dashed box if none. |
| Description | textarea | Optional. |

**Save sequence**

1. `PUT /merchants/{merchantId}/products/{productId}` with FormData (name, unitPrice, active, branchId?, description?, image?).
2. If the active toggle changed from **on → off**: additionally call `DELETE /merchants/{merchantId}/products/{productId}` (soft-deactivate) after the PUT succeeds.
3. Local product list updated in-place; dialog closes.

**Delete from table**: **Delete** button → `DELETE /merchants/{merchantId}/products/{productId}` + `confirm()`. Product removed from visible list immediately.

> **Note**: Product deactivation is a server-side soft-delete (the DELETE endpoint). The `active` field in the PUT payload is also sent for potential re-activation, but deactivation is guaranteed only via DELETE. There is no dedicated re-activate endpoint — setting `active=true` in the PUT is the current mechanism for re-activation.

---

## IV. API Environments

| Key | Base URL |
|---|---|
| `local` | `http://localhost:8080` |
| `staging` | `https://api-blitzpay-staging.elegantsoftware.de/` |

The environment selector lives in the merchant catalog toolbar. The `apiVersion` defaults to `v1`. All API calls go through `MerchantApiService`.

---

## V. Status Display Rules

Status values must never appear as raw enum strings. They are always wrapped in a `<span class="status-tag">` with a semantic tone class.

### Merchant status tones

| Condition | Class |
|---|---|
| `ACTIVE` | `status-tag-success` (green) |
| Contains `review`, `pending`, or `screening` | `status-tag-warning` (yellow) |
| `REJECTED` or `ACTION_REQUIRED` | `status-tag-danger` (red) |
| All others | `status-tag-neutral` (grey) |

### Branch / product status tones

| Value | Class |
|---|---|
| `active: true` | `status-tag-success` |
| `active: false` | `status-tag-neutral` |

---

## VI. Display Format Rules

All raw date / timestamp values must be formatted through `DisplayDatePipe` before appearing in any template.

See full rules → [`docs/reference/user-display.md`](docs/reference/user-display.md)

**Quick reference**

```html
{{ product.updatedAt | displayDate }}   →  24 Apr 2026, 21:55
{{ merchant.lastUpdatedAt | displayDate }}
```

- Null / undefined / empty → `—`
- Relative strings ("Just now", "10 sec ago") must **not** be piped.

---

## VII. Angular Component Rules

- All components are **standalone**. Import pipes, directives, and child components explicitly in each `@Component({ imports: [] })`.
- `DisplayDatePipe` (`src/app/pipes/display-date.pipe.ts`) must be included in `imports` of any component that renders a date.
- No shared NgModule.
- HTTP calls belong exclusively in `MerchantApiService`. Components must not use `HttpClient` directly.

---

## VIII. Governance

- This Constitution supersedes all spec, task, and plan files where there is a conflict.
- Amendments require updating this file and notifying AGENTS.md / CLAUDE.md of the change.
- Do not silently remove or rename rules — add a deprecation note if a rule is being replaced.
