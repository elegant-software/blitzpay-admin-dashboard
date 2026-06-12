# ADR 0009: URL-based Routing and Page-level Edit Flows

## Status

Accepted

## Date

2026-06-12

## Context

The admin dashboard was built as a single Angular route (`/`) with `AuthShellComponent` toggling
content via an `activeSection` string property. All edit workflows used modal dialog overlays
rendered inside the same component. As the feature surface grew, this approach accumulated
several problems:

- No URL for any section or entity — the address bar always shows `/` regardless of what the
  admin is viewing. Pages are not bookmarkable, shareable, or reachable via browser history.
- The browser back button does nothing useful anywhere in the app.
- Cross-section navigation (e.g., merchant catalog → settlements pre-filtered for a merchant)
  requires passing state through the shell component, adding hidden coupling.
- Edit dialogs grow large as form complexity increases (merchant edit, branch edit with map,
  product edit with image upload) and compete for screen space with the detail view underneath.
- Dead UI sections (Onboarding, Verification Queue, Settlement Setup) existed in the template
  with no sidebar nav items pointing to them, accruing confusion.

The alternatives considered were:

1. Keep the `activeSection` shell, add edit routes only
2. Move all major sections and edit flows to proper Angular child routes

Option 1 creates a split architecture where half the app has URLs and half does not. The
inconsistency is harder to reason about than either extreme.

## Decision

Adopt full URL-based routing via Angular child routes inside the shell layout. The sidebar
remains rendered in the layout shell; content renders in a `<router-outlet>`. Sidebar nav
links become `routerLink` bindings.

Route map:

| Path | Component |
|------|-----------|
| `/` | redirect → `/dashboard` |
| `/dashboard` | `PlatformKpiDashboardComponent` |
| `/merchants` | `MerchantCatalogComponent` (search + results) |
| `/merchants/:id` | `MerchantDetailComponent` (new) |
| `/merchants/:id/edit` | `MerchantEditComponent` (new) |
| `/merchants/:id/branches/:branchId/edit` | `BranchEditComponent` (new) |
| `/merchants/:id/products/:productId/edit` | `ProductEditComponent` (new) |
| `/settlements` | `SettlementReportingComponent` |
| `/appointments` | `AppointmentManagementComponent` |
| `/appointments/calendar` | `BranchCalendarComponent` |
| `/appointments/policy` | `AppointmentPolicyComponent` |
| `/user-management` | `UserManagementComponent` |

Edit flows replace dialog overlays. On save or cancel, the router navigates back to the
Merchant Detail View (`/merchants/:id`). Category editing is the exception — category names
are a single field and use an inline form row rather than a dedicated route.

Cross-section navigation (Merchant Cross-link) passes `merchantId` as a query parameter
(`/settlements?merchantId=xxx`). The target component reads `ActivatedRoute.queryParams`
on init and auto-loads data if `merchantId` is present.

Dead shell sections (Onboarding, Verification Queue, Settlement Setup) are removed from
the template entirely.

## Consequences

### Positive

- Every view in the app has a stable, bookmarkable URL.
- Browser back/forward works naturally for all navigation.
- Cross-section merchant links are URL-addressable and can be opened in a new tab.
- Edit forms have full vertical space without a dialog overlay constraining them.
- The shell component shrinks dramatically — it owns layout only, not content state.

### Negative

- Larger refactor surface than option 1; all existing section toggles must be migrated.
- New route components must receive merchant context via the router rather than through
  shared component state, which requires reading `ActivatedRoute.params` in each component.
- Deep-linking to `/merchants/:id` requires the merchant ID to be known upfront, which
  is already the case (the API uses `applicationId` as the identifier).
