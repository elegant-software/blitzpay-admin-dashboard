# Storefront guest experience (#85)

Branch: `fix/85-storefront-guest-experience`, based on main.

## Languages and navigation

The header owns the only language control. English, German and Arabic interface
bundles translate the shell, home, table-code/check-in, catalogue, product details,
cart, checkout, payment return and notifications. The selector retains LTR ordering
inside RTL pages, supports keyboard navigation and preserves the session preference.
Arabic uses the self-hosted Cairo font; font and flag licenses accompany the assets.

`GET /v1/storefront/languages` is a public read-only system catalogue. Following
current backend main's system-text policy, definitions ship in resource JSON and
names/native names use Spring MessageSource bundles. No database metadata columns
or migrations are required. Clients offer only shipped interface bundles.
Authenticated language-management endpoints remain private. Failure falls back to
English and supports retry.

Security follows the existing storefront Stripe integration: the browser uses the
same-origin `/v1/` nginx proxy. Stripe capability discovery and safe language
metadata are public bootstrap reads. Starting or inspecting a guest payment/order
requires the existing order-scoped HttpOnly `guest_token`; a language selector
must work before such an order/token exists. No Stripe credentials, order data or
admin capabilities are included in the public language response. Language writes
and `/v1/merchants/menu-languages` still require authentication. Backend subtask:
[zack-pay#220](https://github.com/elegant-software/zack-pay/issues/220).

Product reads retain the existing backend language headers and translation fallback.
Only merchant-supported menu languages are requested; single-language merchants keep
their original content. Changing the UI does not edit merchant language settings.
Catalogue, product and checkout views react to the header selection. Text updates
preserve cart quantities, reviewed prices and an ongoing payment. Obsolete reads
are cancelled. Category IDs survive translated names; legacy name-only filters reset.

Categories are horizontal, scrollable, touch-sized buttons with counts, active and
pressed states. The All products choice and search remain available. Search and
category browsing never empty the cart. Currency/IDs and externally supplied product
names remain data, rather than being passed through interface translation tables.

## App-download placement

The global sticky native-app download banner and its ResizeObserver/spacing logic
are removed. The existing browser PWA installation notice remains separate.
App Store/Google Play links are a reusable, non-sticky secondary invitation after
the backend confirms `PAID`. URL query parameters never unlock the invitation.
Pending, failed and cash-awaiting-confirmation payments do not show it.

The current table journey only resolves a QR/code and opens the menu; it has no
reservation-confirmation page. Placement after table completion is pending the
product decision: after table check-in, or after a separate confirmed reservation.
No new reservation state or extra guest step has been invented.

## Verification and dependencies

- `npm run test:storefront -- --watch=false --browsers=ChromeHeadlessNoSandbox --reporters=dots`
- Full storefront regression suite: 132 tests pass after reconciliation with main's merchant themes and terminal-payment changes.
- `npm run build:storefront` passes; initial bundle 512.62 kB exceeds the 500 kB warning threshold by 12.62 kB.
- `node tools/check-storefront-i18n.mjs` (15 component templates, 227 German/Arabic message pairs)
- Headless browser review of English desktop and Arabic 390px mobile layouts using
  isolated fixture data: document width equals viewport width, category scrolling
  stays local, header ordering remains readable and no sticky app promotion exists.
- Backend branch `fix/85-storefront-languages` is based directly on current main.
  Deploy its resource-backed endpoint before this UI. Backend checks include
  fixture-backed resource/native-name unit tests and public-read/protected-write
  HTTP contracts; existing product language behavior is unchanged.

The backend was not restarted and no deployment was performed.
