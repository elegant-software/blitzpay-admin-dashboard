# Quickstart: Merchant Catalog Page

## Prerequisites

- Node.js/npm compatible with the existing Angular 20 project
- Dependencies installed with `npm install`
- Optional local BlitzPay API running at `http://localhost:8080`
- Staging API access to `https://api-blitzpay-staging.elegantsoftware.de`

## Run The App

```bash
npm start
```

Open:

```text
http://localhost:4200
```

## Validate The Planned Feature

1. Open the admin dashboard.
2. Select the planned `Merchant Catalog` workspace from the sidebar.
3. Choose `Local` or `Staging`.
4. Set the API version path segment expected by the merchant service.
5. Search by a known merchant/application ID.
6. Verify merchant summary, location, branches, and products load into distinct sections.
7. Test nearby search with latitude, longitude, and optional radius.
8. Save a valid merchant location and verify the refreshed values.
9. Create a branch with a required name and optional address/location values.
10. Create or update a product with name, unit price, optional branch, description, and image file.
11. Save a merchant logo storage key and verify the logo state refreshes.
12. Confirm validation messages preserve entered form values after failed saves.

## Build Check

```bash
npm run build
```

## Notes

- Product images are submitted directly through product create/update operations.
- Merchant logos use storage keys for already-uploaded assets; logo file upload is not part of this plan because no supporting endpoint was identified in the provided API document.
- Direct merchant lookup is by identifier. Nearby merchant search is the available discovery workflow when an identifier is unknown.
