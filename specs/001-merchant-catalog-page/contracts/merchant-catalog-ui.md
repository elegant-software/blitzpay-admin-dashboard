# UI Contract: Merchant Catalog Page

This contract defines the admin-facing behavior and backend interactions for the merchant catalog workspace. It complements the stakeholder spec and API mapping.

## Entry Point

- The app shell adds a navigation item named `Merchant Catalog`.
- Selecting it shows the merchant catalog workspace without leaving the admin dashboard shell.
- The page preserves the existing sidebar, topbar, and CoreUI visual language.

## Environment Controls

Inputs:

- Environment selector: `Local` or `Staging`
- API version text input or selector

Behavior:

- Local resolves to `http://localhost:8080`.
- Staging resolves to `https://api-blitzpay-staging.elegantsoftware.de`.
- Changing environment or API version with unsaved edits prompts before discarding edits.

## Merchant Search

Direct lookup:

- Input: merchant/application UUID
- Action: Search
- Backend interaction: `GET /{version}/merchants/{id}`
- Success state: merchant summary displayed and related location, branch, and product loading begins.
- Empty/error state: message stays in the search area and previous unsaved form data is not silently discarded.

Nearby lookup:

- Inputs: latitude, longitude, optional radius
- Action: Find nearby
- Backend interaction: `GET /{version}/merchants/nearby`
- Success state: result list ordered by distance; each result can open the merchant detail view.
- Validation state: invalid coordinate or radius fields are marked before request.

## Merchant Summary And Logo

Displayed merchant fields:

- Application ID
- Application reference
- Registration number
- Status
- Submitted date when present
- Last updated date
- Logo storage key state

Logo update:

- Input: storage key
- Action: Save logo
- Backend interaction: `PUT /{version}/merchants/{id}/logo`
- Success state: merchant summary refreshes with updated logo key.
- Failure state: entered storage key remains available for correction.

## Merchant Location

Displayed fields:

- Coordinates
- Geofence radius
- Google place ID
- Address fields
- Place enrichment details when present

Actions:

- Save location: `PUT /{version}/merchants/{merchantId}/location`
- Remove location: `DELETE /{version}/merchants/{merchantId}/location`
- Refresh location: `GET /{version}/merchants/{merchantId}/location`

Validation:

- Latitude required.
- Longitude required.
- Geofence radius required and greater than zero.

States:

- Missing location displays a clear empty state.
- Save failure preserves entered values.
- Remove requires confirmation.

## Branches

List:

- Backend interaction: `GET /{version}/merchants/{merchantId}/branches`
- Empty state: show that no active branches exist.

Create:

- Required input: name
- Optional inputs: address, coordinates, geofence, Google place ID, Stripe and Braintree setup fields
- Backend interaction: `POST /{version}/merchants/{merchantId}/branches`
- Success state: branch list refreshes.
- Secret handling: secret inputs are cleared or masked after save and are not redisplayed from local state.

View:

- Backend interaction: `GET /{version}/merchants/{merchantId}/branches/{branchId}`
- Success state: selected branch detail panel opens.

## Products

List:

- Backend interaction: `GET /{version}/merchants/{merchantId}/products`
- Optional branch filter: `branchId`
- Empty state: show that no active products exist for the selected merchant/filter.

Create:

- Required inputs: name, unit price
- Optional inputs: branch ID, description, image file
- Backend interaction: `POST /{version}/merchants/{merchantId}/products`
- Request format: multipart form data
- Success state: product list refreshes.

View:

- Backend interaction: `GET /{version}/merchants/{merchantId}/products/{productId}`
- Optional branch scope: `branchId`

Update:

- Editable inputs: name, unit price, branch ID, description, image file
- Backend interaction: `PUT /{version}/merchants/{merchantId}/products/{productId}`
- Request format: multipart form data
- Success state: product detail and list refresh.

Soft-remove:

- Backend interaction: `DELETE /{version}/merchants/{merchantId}/products/{productId}`
- Optional branch scope: `branchId`
- Confirmation required before request.
- Success state: product no longer appears in active list.

## Cross-Cutting States

- Every request has loading, success, empty, validation failure, and service failure states.
- Field-level validation appears before service requests when possible.
- Failed requests preserve admin-entered data.
- Switching merchant, environment, API version, or selected branch with dirty forms requires confirmation.
