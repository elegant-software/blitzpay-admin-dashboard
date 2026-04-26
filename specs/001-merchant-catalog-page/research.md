# Research: Merchant Catalog Page

## Decision: Build as a feature workspace inside the existing Angular app

**Rationale**: The repository is a single Angular 20 admin dashboard with CoreUI styling and no backend code. The requested feature is an internal admin page that consumes already available BlitzPay merchant APIs, so keeping it inside `src/app/` matches the current architecture and avoids unnecessary project expansion.

**Alternatives considered**:

- Separate frontend app: rejected because the current dashboard shell already provides navigation, layout, and styling for admin workflows.
- Backend-for-frontend: rejected because the provided API already exposes the required merchant, branch, location, product, and logo operations.

## Decision: Use Angular HttpClient and typed feature models for API access

**Rationale**: Angular HttpClient is the standard HTTP integration point for Angular applications and is already compatible with the app's dependency set. Typed request/response models make the OpenAPI-derived contract explicit in the frontend without generating a large client for a narrow feature.

**Alternatives considered**:

- Generated OpenAPI client: deferred because this feature needs a focused subset of endpoints and the repo has no existing generation workflow.
- Raw `fetch`: rejected because it would bypass Angular's standard testing and dependency-injection patterns.

## Decision: Direct merchant lookup is by identifier, with nearby search as the broader search mode

**Rationale**: The provided API document includes `GET /{version}/merchants/{id}` and `GET /{version}/merchants/nearby`, but no general text search endpoint. The UI should support exactly what the backend contract exposes: direct ID lookup and location-based discovery.

**Alternatives considered**:

- Free-text merchant search: rejected for the initial implementation because no supporting endpoint was identified.
- Client-side text filtering over all merchants: rejected because no list-all-merchants endpoint was identified and it would not scale.

## Decision: Environment selection uses fixed local and staging base addresses

**Rationale**: The feature request explicitly names local `localhost:8080` and staging `https://api-blitzpay-staging.elegantsoftware.de/`. The OpenAPI source contains a generated server URL that should not drive this UI. Keeping the selection explicit supports development and staging validation.

**Alternatives considered**:

- Build-time-only environment files: rejected because admins and testers need to switch target environment from the page per the feature spec.
- Free-form base URL entry: rejected for v1 because it increases error risk and is not requested.

## Decision: Logo update accepts a storage key, not a logo file

**Rationale**: The provided merchant logo API records an already-uploaded storage key and expects a key like `merchant/{applicationId}/logo.{ext}`. No compatible logo file upload endpoint was found in the API document. The UI can validate and submit the storage key while showing logo state and preview fallback.

**Alternatives considered**:

- Implement logo file upload from the page: rejected because no upload API is available in the provided contract.
- Hide logo management entirely: rejected because setting/replacing logo reference is explicitly supported by the API and requested by the feature.

## Decision: Product create/update supports direct image file submission

**Rationale**: Product create and update operations accept multipart form data with `image` as an optional binary field. This directly supports the product image requirement without a separate asset service.

**Alternatives considered**:

- Image URL input only: rejected because it does not match the provided product API.
- Shared upload service before product update: rejected because no separate product image upload endpoint is needed.

## Decision: Branch payment-provider fields are write-only unless returned by backend

**Rationale**: Branch creation accepts sensitive provider values. The UI should allow entry for setup but avoid rendering secrets after submission unless the backend explicitly returns a safe value. This matches the specification's security assumption.

**Alternatives considered**:

- Display submitted secret values from local form state after save: rejected because it increases accidental disclosure risk.
- Remove payment-provider fields: rejected because the branch creation API includes them and operations may need setup support.
