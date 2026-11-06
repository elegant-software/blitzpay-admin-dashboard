# Merchant brand themes

Open **Operations → Merchants**, select a merchant, then choose **Shopper app branding → Manage themes** or **Merchant app branding → Manage themes**. The two mobile apps have independent theme libraries, each supporting multiple named palettes. Changes in one section do not alter the other app's colors.

Select **Add a new theme** or an existing named theme. Enter a name, choose primary and accent colors with the pickers or six-digit hex fields, and review the preview before selecting **Save theme**. A merchant can have multiple saved themes. Cancel and navigation prompt before discarding edits.

The editor uses the selected API environment and version through `MerchantApiService`:

- `GET /v1/merchants/{merchantId}/themes`
- `POST /v1/merchants/{merchantId}/themes`
- `PUT /v1/merchants/{merchantId}/themes/{themeId}`

The backend must include the merchant themes migration and endpoints. Requests require the `blitzpay-admin` realm role. Load and save errors stay inside the editor; failed loads offer Retry.

All theme requests select the app with the `app` query parameter: `SHOPPER` (the default for compatibility) or `MERCHANT`. The API stores this scope and refuses updates through the wrong app. Existing saved themes remain shopper app themes. Both sections participate in navigation and unsaved-change guards, and form/control IDs are distinct for each section.

This release stores palettes only. It does not apply a theme to the dashboard, storefront, or either mobile app. Integration in both mobile apps is deferred. The backend's scheduled `/appearances` describe location events and are unrelated to visual themes.
