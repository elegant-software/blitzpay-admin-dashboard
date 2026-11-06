# Preparation stations

Task: https://github.com/elegant-software/zack-pay/issues/199

Each Branch can configure preparation stations such as Food Kitchen and Drinks Bar.
Category defaults and product overrides are scoped to the selected Branch. The backend
validates category, product and station ownership before saving the configuration.

The Branch edit page opens a fresh-data overlay for station configuration and routing.
Station names must be unique. Removing a station clears its assignments in the draft.
Closing or navigating away with unsaved changes requires confirmation. Failed saves
keep the draft and show the backend error beside the action buttons.

Each Electron display selects a station using the existing Branch Kitchen Login.
Mixed orders create separate station tickets with the same customer order number and
Table reference. Completing drinks never completes food. Customer readiness is emitted
only after all remaining required items are ready. Submitted items retain their routing
when later catalog edits change station assignments.

Unmapped products and pre-existing work remain visible in Unassigned / General kitchen.
Cancellation and removal events clear stale cards; repeated completion is a no-op.
The Electron app supports isolated food/drinks profiles for two windows on one computer.

## Deployment order

1. Deploy/restart the backend to apply the configuration and order-item migrations.
2. Deploy the admin dashboard and configure Branch stations and routing.
3. Update the Electron app and select the station on each display.

No extra Keycloak client or account is needed per station. Real and mock connections
use separate settings; the mock seeds order #42 at Table 7 with two burgers and two colas.
Do not commit local connection settings or credentials.

## Validation

- Backend: gradlew check, 396 unit tests and 169 contract tests passed.
- Admin: 227 tests passed; production build passed.
- Electron: 18 tests passed; two hidden renderers verified independent station tickets
  and drinks completion leaving food visible.

Backend contract details: reference/preparation-stations.md in elegant-software/zack-pay.
Electron run commands: README.md in elegant-software/blitzpay-kitchen.
