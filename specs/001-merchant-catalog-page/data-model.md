# Data Model: Merchant Catalog Page

## Backend Environment

Represents the selected BlitzPay service target.

**Fields**:

- `key`: `local` or `staging`
- `label`: Human-readable environment name
- `baseUrl`: `http://localhost:8080` or `https://api-blitzpay-staging.elegantsoftware.de`
- `apiVersion`: Path segment used for merchant API calls

**Validation**:

- Environment must be one of the supported fixed choices.
- API version must be present before requests are made.

## Merchant

Represents a merchant application/business record.

**Fields**:

- `applicationId`: required UUID
- `applicationReference`: required display reference
- `registrationNumber`: required business registration number
- `status`: lifecycle status (`DRAFT`, `SUBMITTED`, `VERIFICATION`, `SCREENING`, `RISK_REVIEW`, `DECISION_PENDING`, `SETUP`, `ACTIVE`, `MONITORING`, `ACTION_REQUIRED`, `REJECTED`)
- `submittedAt`: optional date-time
- `lastUpdatedAt`: required date-time
- `logoStorageKey`: optional storage reference

**Relationships**:

- Has zero or one `MerchantLocation`
- Has zero or many `Branch` records
- Has zero or many active `Product` records

## Merchant Location

Represents the merchant-level store location and geofence.

**Fields**:

- `merchantId`: required UUID
- `latitude`: required number
- `longitude`: required number
- `geofenceRadiusMeters`: required positive integer
- `googlePlaceId`: optional string
- `addressLine1`: optional string
- `addressLine2`: optional string
- `city`: optional string
- `postalCode`: optional string
- `country`: optional string
- `placeFormattedAddress`: optional string
- `placeRating`: optional number
- `placeReviewCount`: optional integer
- `placeEnrichmentStatus`: optional string
- `placeEnrichedAt`: optional date-time

**Validation**:

- Latitude is required and must be a valid coordinate.
- Longitude is required and must be a valid coordinate.
- Geofence radius is required and must be greater than zero.

**State transitions**:

- `missing` -> `present`: Admin saves valid location details.
- `present` -> `present`: Admin updates location details.
- `present` -> `missing`: Admin removes merchant location.

## Nearby Merchant Result

Represents a merchant discovered by geospatial search.

**Fields**:

- `merchantId`: required UUID
- `legalBusinessName`: required display name
- `latitude`: required number
- `longitude`: required number
- `geofenceRadiusMeters`: required positive integer
- `googlePlaceId`: optional string
- `distanceMeters`: required number

**Validation**:

- Search input must include valid latitude and longitude.
- Radius is optional; when present it must be greater than zero.

## Branch

Represents a merchant sub-location.

**Fields**:

- `branchId`: optional UUID in create responses depending on backend response shape
- `merchantId`: parent merchant UUID
- `name`: required string
- `addressLine1`: optional string
- `addressLine2`: optional string
- `city`: optional string
- `postalCode`: optional string
- `country`: optional string
- `latitude`: optional number
- `longitude`: optional number
- `geofenceRadiusMeters`: optional positive integer
- `googlePlaceId`: optional string
- `stripeSecretKey`: optional write-only string
- `stripePublishableKey`: optional string
- `braintreeMerchantId`: optional string
- `braintreePublicKey`: optional string
- `braintreePrivateKey`: optional write-only string
- `braintreeEnvironment`: optional string

**Validation**:

- Name is required.
- If geofence radius is provided, it must be greater than zero.
- Coordinates should be provided as a latitude/longitude pair.
- Secret fields must be masked and not redisplayed from local state after save.

**Relationships**:

- Belongs to one `Merchant`
- May be associated with zero or many `Product` records

## Product

Represents an active catalog item.

**Fields**:

- `productId`: required UUID
- `merchantId`: required UUID
- `branchId`: optional UUID
- `name`: required string
- `description`: optional string
- `unitPrice`: required number
- `imageUrl`: optional URL/string
- `active`: required boolean
- `createdAt`: required date-time
- `updatedAt`: required date-time

**Validation**:

- Name is required.
- Unit price is required and must be a valid non-negative monetary value.
- Image file is optional; when supplied, unsupported or failed image submissions must be surfaced to the admin.

**State transitions**:

- `not created` -> `active`: Admin creates product.
- `active` -> `active`: Admin updates product details or image.
- `active` -> `inactive`: Admin confirms soft-remove.

## Image Asset Reference

Represents image information surfaced by the UI.

**Fields**:

- `kind`: `merchant-logo` or `product-image`
- `storageKey`: optional string for merchant logo
- `file`: optional selected browser file for product create/update
- `imageUrl`: optional renderable product image URL
- `previewState`: `available`, `unavailable`, `loading`, or `failed`

**Validation**:

- Merchant logo storage key is required when updating the logo.
- Product image file is optional and sent only when selected.
