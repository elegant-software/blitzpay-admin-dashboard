# Merchant and branch branding

Open **Merchants**, select a merchant, and choose **Manage branding** in the Shopper branding panel on its profile.

## Editing

The dialog opens with a fresh backend request. Choose **Merchant defaults** or a branch in the Editing selector. Merchant settings apply to every branch unless a branch overrides an individual field. Reset buttons clear an override rather than copying its current inherited value.

Set the presentation name, a separate brand logo, primary color, and accent color. Branding does not change legal business details, branch photography, installed app identity, or business offerings. Simpleio is the platform fallback. Turning branding off retains custom values and uses the ordinary merchant identity with platform styling; branches cannot enable custom branding when the merchant has disabled it.

The responsive preview shows illustrative menu, cart, and checkout content. Foreground colors are selected for readable contrast. Previewing does not publish. **Save and publish** replaces the current scope's complete settings immediately; **Cancel** discards edits after confirmation. Scope changes, navigation, and browser unload protect unsaved work. Publishing and uploads block duplicate actions.

Logos accept PNG, JPG, and WebP up to 5 MB. Uploads use the scope-specific presigned upload endpoint, then the existing direct file-upload helper. The resulting key remains a draft until Save and publish. Object URLs used for local previews are released on replacement, discard, and component destruction. Existing saved logos use the backend's temporary `logoPreviewUrl`, including while branding is disabled.

Failures remain inside the dialog next to its action buttons. Backend field errors appear beside the corresponding fields. A failed load never permits saving a blank configuration. A failed save preserves the draft.

## API and permissions

All HTTP requests go through `MerchantApiService` and the existing environment and bearer-token handling. Branding writes use local handling of 403 responses so permission failures do not eject the admin from the editor. The backend requires the Keycloak realm role `blitzpay-admin`.

- GET/PUT `/v1/merchants/{merchantId}/branding`
- GET/PUT `/v1/merchants/{merchantId}/branches/{branchId}/branding`
- POST either scope's `/branding/logo/upload-url`

PUT sends every setting, including null resets. The response provides saved `settings`, resolved `effective` branding, and optional `logoPreviewUrl`.

Deploy or restart the backend branding branch before using this panel. For local development, the selected API must point to the backend on port 8080 and both applications must use the same Keycloak issuer. A dashboard configured for Keycloak at localhost:8084 cannot authenticate to a backend expecting auth.zackpay.de. Existing environment files are intentionally preserved by this feature.

This change provides administration. The mobile shopper still needs to consume effective branding; changing settings here does not by itself theme the mobile app.

## Validation

`npm test -- --watch=false --browsers=ChromeHeadlessNoSandbox`

`npm run build`

Branding tests cover API methods and payloads, live draft previews, branch ID variants, inheritance and resets, disabled branding, validation, upload/discard behavior, publication guards, and recoverable errors.

Visual checks used the actual component with mock data at desktop (1440 px) and mobile (390 px) widths. Mobile form and preview sections fit without horizontal overflow, with publishing actions kept visible.
