# Feature Specification: Merchant Catalog Page

**Feature Branch**: `main`  
**Created**: 2026-04-23  
**Status**: Draft  
**Input**: User description: "I need you to design and craete a page to search/view and update merchants/branches and product info along with geo location and product images and mecrhant logos pick the required APIs from /Users/mehdi/MyProject/blitz-pay/api-docs/api-doc.yml and for local servr adress will be localhost:8080 and for server it will be https://api-blitzpay-staging.elegantsoftware.de/"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Find and Review Merchant Details (Priority: P1)

An admin user searches for a merchant, opens the merchant record, and reviews the merchant profile, lifecycle status, logo state, location details, branches, and product catalog from one page.

**Why this priority**: This is the core workflow that makes all update actions safe and practical because the admin must first identify the correct merchant and understand its current setup.

**Independent Test**: Can be fully tested by searching for an existing merchant, opening its details, and confirming the page presents merchant summary, logo information, location, branches, and product list without requiring edits.

**Acceptance Scenarios**:

1. **Given** an admin knows a merchant identifier, **When** they search for that merchant, **Then** the page shows the matching merchant profile and related catalog information.
2. **Given** a merchant has no location, branches, products, or logo, **When** the admin opens the merchant record, **Then** the page clearly shows empty states for the missing information and keeps available merchant details visible.
3. **Given** the admin searches near a latitude and longitude, **When** nearby merchants exist within the selected radius, **Then** the page lists matching merchants ordered by proximity and allows opening one result.

---

### User Story 2 - Maintain Merchant and Branch Location Data (Priority: P2)

An admin user updates the merchant's location and geofence information, then creates or reviews branches associated with the merchant using clear address and coordinate fields.

**Why this priority**: Accurate location and branch data determine whether customers and payment flows can associate activity with the right merchant presence.

**Independent Test**: Can be fully tested by opening a merchant, saving valid coordinates and geofence radius, creating a branch, and verifying the refreshed page displays the saved details.

**Acceptance Scenarios**:

1. **Given** an admin is viewing a merchant, **When** they enter valid latitude, longitude, geofence radius, and optional address/place details, **Then** the merchant location is saved and the updated values are displayed.
2. **Given** a merchant has an outdated location, **When** the admin removes the location, **Then** the page returns to the no-location state and no stale coordinate or geofence values remain visible.
3. **Given** an admin creates a branch with a name and optional address, location, payment-provider, and geofence details, **When** the save succeeds, **Then** the branch appears in the merchant's active branch list.

---

### User Story 3 - Manage Product Catalog and Images (Priority: P3)

An admin user creates, views, updates, filters, and removes active products for a merchant, including product name, description, price, branch assignment, and product image.

**Why this priority**: Product details and images are customer-facing catalog data, but they depend on the correct merchant and branch context being available first.

**Independent Test**: Can be fully tested by creating a product for a merchant, editing its details and image, filtering by branch, and soft-removing it from the active catalog.

**Acceptance Scenarios**:

1. **Given** an admin is viewing a merchant, **When** they create a product with required name and unit price plus optional branch, description, and image, **Then** the product appears in the active product list.
2. **Given** an existing product, **When** the admin updates its name, unit price, description, branch assignment, or image, **Then** the refreshed product details show the new values.
3. **Given** an active product should no longer be sold, **When** the admin removes it, **Then** it no longer appears in the active product list.

---

### User Story 4 - Update Merchant Logo (Priority: P4)

An admin user sets or replaces the merchant logo reference and sees whether the merchant has a logo configured.

**Why this priority**: Merchant branding improves catalog quality, but logo maintenance can be delivered after the core search, location, branch, and product workflows.

**Independent Test**: Can be fully tested by opening a merchant, saving a valid logo reference, and confirming the merchant summary reflects the updated logo state.

**Acceptance Scenarios**:

1. **Given** an admin has a valid uploaded logo reference for a merchant, **When** they save it on the merchant page, **Then** the merchant record displays the updated logo state.
2. **Given** an admin attempts to save an empty or invalid logo reference, **When** validation runs, **Then** the page prevents the update and explains what must be corrected.

### Edge Cases

- Merchant search by identifier returns no record or the merchant is inaccessible.
- Nearby merchant search has invalid coordinates, an invalid radius, or no merchants in range.
- Merchant location is missing, has partial optional address data, or place enrichment has not completed.
- Branch list or product list is empty for an otherwise valid merchant.
- Product image upload is missing, too large, unsupported, or fails while the rest of the product data is valid.
- Product price is missing, negative, zero when not allowed by business rules, or entered in an invalid format.
- Merchant logo reference points to an unavailable or incorrectly named stored asset.
- A save operation fails after the admin has edited multiple fields.
- Another user changes the same merchant, branch, product, or location while the admin is viewing stale data.
- The selected environment is unavailable or returns an unexpected error.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The page MUST allow admin users to choose the target backend environment between local service at `localhost:8080` and staging service at `https://api-blitzpay-staging.elegantsoftware.de/`.
- **FR-002**: The page MUST support the API version path segment required by the merchant service and use it consistently for all merchant, branch, product, location, and logo operations.
- **FR-003**: Admin users MUST be able to search for and open a merchant by merchant/application identifier.
- **FR-004**: Admin users MUST be able to search for nearby merchants by latitude, longitude, and optional radius, then open a returned merchant.
- **FR-005**: The page MUST display merchant summary details including identifier, reference, registration number, lifecycle status, submitted date when present, last updated date, and logo state.
- **FR-006**: The page MUST display the merchant's current location, including coordinates, geofence radius, optional Google place identifier, address fields, formatted place address, rating, review count, enrichment status, and enrichment timestamp when available.
- **FR-007**: Admin users MUST be able to set, update, and remove the merchant's location and geofence details.
- **FR-008**: The page MUST validate required location values before saving: latitude, longitude, and a geofence radius greater than zero.
- **FR-009**: The page MUST list active branches for the selected merchant.
- **FR-010**: Admin users MUST be able to create a branch with a required name and optional address, coordinates, geofence, Google place identifier, and payment-provider configuration fields.
- **FR-011**: Admin users MUST be able to open a single branch from the selected merchant's branch list and review its details.
- **FR-012**: The page MUST list active products for the selected merchant and allow filtering by branch when a branch is selected.
- **FR-013**: Admin users MUST be able to create a product with required name and unit price plus optional branch assignment, description, and image.
- **FR-014**: Admin users MUST be able to open a single active product and review its details including identifier, merchant, branch, name, description, unit price, image URL, active state, created date, and updated date.
- **FR-015**: Admin users MUST be able to update an existing product's name, unit price, description, branch assignment, and image.
- **FR-016**: Admin users MUST be able to soft-remove an active product after confirming the action.
- **FR-017**: The page MUST allow admin users to set or replace the merchant logo reference and show whether the merchant record has a logo configured.
- **FR-018**: The page MUST show image previews when a product image URL or merchant logo reference can be rendered, and MUST show a clear fallback when preview is unavailable.
- **FR-019**: The page MUST preserve unsaved user input when an operation fails and display a clear, field-specific or action-specific error message.
- **FR-020**: The page MUST refresh the affected merchant, location, branch, or product information after successful changes so the admin can verify the saved result.
- **FR-021**: The page MUST prevent accidental loss of unsaved changes when switching merchants, changing environment, or leaving an edit form.
- **FR-022**: The page MUST distinguish read-only displayed values from editable values and clearly communicate required fields.
- **FR-023**: The page MUST avoid exposing secret payment-provider values after branch creation unless the backend explicitly returns them for display.
- **FR-024**: The page MUST provide loading, empty, validation, success, and failure states for every search, view, create, update, and remove workflow.

### Key Entities

- **Merchant**: A business application record with identifier, reference, registration number, lifecycle status, dates, and logo reference.
- **Merchant Location**: The merchant's geospatial and address data, including coordinates, geofence radius, optional Google place identifier, address fields, and enrichment metadata.
- **Nearby Merchant Result**: A merchant search result containing business name, coordinates, geofence radius, optional place identifier, and distance from the searched point.
- **Branch**: A merchant sub-location with a required name, optional address, coordinates, geofence, Google place identifier, and payment-provider configuration data.
- **Product**: An active catalog item associated with a merchant and optionally a branch, including name, description, unit price, image URL, active state, and audit dates.
- **Image Asset Reference**: A product image file or merchant logo storage reference used to present merchant and catalog branding.
- **Backend Environment**: The selected service target used by the admin page for all merchant catalog operations.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Admin users can find and open a known merchant record in under 30 seconds when the merchant exists.
- **SC-002**: 95% of merchant detail views show merchant summary, location state, branch state, and product state within 3 seconds on a healthy backend connection.
- **SC-003**: Admin users can update merchant location data and verify the saved result in under 2 minutes.
- **SC-004**: Admin users can create or update a product, including image selection when needed, in under 3 minutes.
- **SC-005**: At least 90% of validation errors identify the exact field or action that must be corrected.
- **SC-006**: Admin users can complete the primary workflows for merchant lookup, branch creation, product update, and logo update without consulting backend API documentation.
- **SC-007**: Failed save operations preserve the admin's entered data in 100% of tested validation and service-error scenarios.

## Assumptions

- The target users are authenticated internal admin users who already have permission to manage merchant catalog data.
- The first implementation can require a merchant/application identifier for direct merchant lookup because the available merchant API exposes lookup by identifier and nearby search, not general text search.
- The API version path segment will default to the service's current public version and remain configurable during planning.
- Local and staging environments use the same merchant API contract, differing only by base address.
- Merchant logo setting uses an already uploaded storage reference; uploading logo files is outside this feature unless a compatible upload service is identified during planning.
- Product image create and update use direct image file submission through the merchant product workflows.
- Product removal means removal from the active catalog, not permanent deletion.
- Secret branch payment-provider values may be entered for setup but should be masked and not redisplayed unless required for operational support.
- Mobile-specific layout is not required for the first version, but the page should remain usable on common admin laptop and desktop screen sizes.
