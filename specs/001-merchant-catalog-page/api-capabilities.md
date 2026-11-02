# API Capability Mapping: Merchant Catalog Page

**Source**: `/Users/mehdi/MyProject/blitz-pay/api-docs/api-doc.yml`  
**Local base address**: `http://localhost:8080`  
**Staging base address**: `https://api-blitzpay-staging.elegantsoftware.de/`  
**Version placeholder**: `{version}`

## Merchant

- `GET /{version}/merchants/{id}`: Get merchant application details.
- `POST /{version}/merchants`: Create a merchant using the shared merchant profile fields.
- `POST /{version}/merchants/{id}/activate`: Activate a merchant if lifecycle activation is included in a later scope decision.

## Merchant Logo

- `PUT /{version}/merchants/{id}/logo`: Set merchant logo storage key.

## Merchant Location

- `GET /{version}/merchants/{merchantId}/location`: Get current merchant location.
- `PUT /{version}/merchants/{merchantId}/location`: Set or update merchant location and geofence radius.
- `DELETE /{version}/merchants/{merchantId}/location`: Remove merchant location.
- `GET /{version}/merchants/nearby`: Find merchants by latitude, longitude, and optional radius.

## Branches

- `GET /{version}/merchants/{merchantId}/branches`: List active branches for a merchant.
- `POST /{version}/merchants/{merchantId}/branches`: Create a branch under a merchant.
- `GET /{version}/merchants/{merchantId}/branches/{branchId}`: Get a branch by ID.

## Products

- `GET /{version}/merchants/{merchantId}/products`: List active merchant products, optionally filtered by branch.
- `POST /{version}/merchants/{merchantId}/products`: Create a product with name, unit price, optional branch, description, and image.
- `GET /{version}/merchants/{merchantId}/products/{productId}`: Get a single active product, optionally scoped by branch.
- `PUT /{version}/merchants/{merchantId}/products/{productId}`: Update product name, unit price, description, branch, and image.
- `DELETE /{version}/merchants/{merchantId}/products/{productId}`: Soft-delete an active product, optionally scoped by branch.

## Notes For Planning

- The OpenAPI source lists a generated server URL that should be overridden by the requested local and staging base addresses.
- Merchant logo update records a storage key for an already uploaded logo; no logo upload endpoint was identified in the provided API document.
- Product create and update accept image files directly with product form data.
- Direct merchant lookup is available by identifier. General free-text merchant search was not identified in the provided API document.
