# Storefront PWA release checks

## Local verification (2026-11-01)

- Production build passed with Node 20.20.2; initial bundle 311.49 kB (estimated transfer 88.69 kB). Removed the unused PrimeNG DataView wrapper/providers from the storefront and enabled nginx text compression; admin dependencies are unchanged.
- All 40 storefront specs passed in Chrome Headless 156, including update deferral, navigation into checkout, checkout URL variants, payment recovery, guest order payment and live confirmation.
- Local Lighthouse 12 mobile audit with fixture API data and gzip: **Performance 97, Accessibility 100**, FCP 1.8s, LCP 2.4s, total blocking time 80ms, CLS 0. The earlier uncompressed build scored 46/100; deployment with actual catalog images, latency and content must be measured separately.
- Chromium at a 360px mobile viewport with fixture API data: no horizontal overflow; visible tap targets and cart quantity controls meet 44px; catalog and order cold entry passed; service-worker control, changed live API prices and offline reload passed. Chromium's installability diagnostics returned no errors. This is browser emulation, not a real-device camera or hosted-provider test.
- nginx:1.27-alpine syntax validation and startup association generation passed. HTTP checks returned 200/no-cache for shell/worker metadata, 200 HTML for both QR routes, 200 application/json without redirects for both association files, and 404 for an unknown well-known path. The unavailable local API proxy returned 502/no-store; live backend behavior remains a deployment check.

## Implemented behavior

- Production builds register the Angular service worker; development builds do not.
- The app shell (including route chunks) is prefetched. Icons/assets load on demand.
- No API data groups or remote URL caches exist. `/v1/**` and `/.well-known/**` are excluded from navigation fallback. nginx sends API responses with `no-store` and shell/worker metadata with `no-cache`.
- Ready versions reload while browsing, but wait until customers leave checkout/order/confirmation routes. Updates are checked on foregrounding and every 15 minutes.
- Native App Install Prompt remains the primary promotion. A compact, dismissible Web Storefront Install Notice appears after shopping content only when the browser signals installability; the browser's install prompt opens only after the customer selects Install. Installed apps and browsers that do not emit `beforeinstallprompt` show no notice, and their browser installation menus remain available.
- The normal cart remains tab scoped. A hosted payment creates a recovery snapshot keyed by order ID, valid for two hours, read only on that order's return route. It contains cart items and scope, no payment credentials. Recovery never overwrites an existing nonempty cart. Storage restrictions do not prevent browsing or paying; the live Order remains available even without recovery.
- Opening the installed PWA at `/` explains QR entry and offers the current tab's menu when available. The optional in-app scanner is deferred pending a product decision.

## Native app coordination (required before enabling handoff)

The shopper repository is not present in this workspace. Supply a `blitzpay-shopper-links` ConfigMap in the storefront namespace:

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: blitzpay-shopper-links
data:
  SHOPPER_IOS_APP_ID: "<TEAM_ID>.<BUNDLE_ID>"
  SHOPPER_ANDROID_PACKAGE: "<ANDROID_PACKAGE>"
  SHOPPER_ANDROID_SHA256: "<COLON_SEPARATED_RELEASE_SHA256>"
```

Multiple Android signing certificates are comma separated without spaces. Use the Play App Signing certificate for Play installs, not just the upload key. Restart the storefront deployment after configuration changes. If configuration is absent, valid empty association files are served and no native association is claimed. Invalid configured IDs fail startup.

The container generates the two JSON files at startup. `/order/*` is the only allowed iOS path and Android 15+ dynamic rule. **Android 14 and earlier require `/order/` restrictions in the native manifest:** assetlinks alone cannot limit their paths. The native intent filter must use `android:autoVerify="true"`, HTTPS, the environment's storefront host and `android:pathPrefix="/order/"`. Do not include `/m/` or a catch-all host intent filter. On iOS add `applinks:<storefront-host>` to associated domains and route orders to OrderDetail.

Resolve the host from `blitzpay-domains` (`STOREFRONT_HOST`) in the native build/release configuration as specified by ADR-0018. No domain is embedded in these association files. Use the same ConfigMap-derived host in merchant QR generation. Replace existing app store search destinations with the verified direct listing URLs in a follow-up once supplied.

Platform references: [Android website associations and dynamic rules](https://developer.android.com/training/app-links/configure-assetlinks), [Apple associated domains](https://developer.apple.com/documentation/xcode/supporting-associated-domains), [Angular service-worker updates](https://angular.dev/ecosystem/service-workers/communications).

## Backend tasks / contract checks

- Confirm the public Order response exposes a merchant-readable `reference`, `merchantId`, `branchId`, payable status and item totals. Without a reference the UI displays “Your order”; it never invents a merchant order number or exposes the UUID as the heading.
- Confirm the payable status vocabulary (`CREATED`, `PENDING`, `PENDING_PAYMENT`, `AWAITING_PAYMENT`, `UNPAID` currently supported), and that capability checks and hosted payment creation support merchant-created orders. Unsupported/missing scope or terminal status does not show a pay action.
- Enforce order payment eligibility, live prices, currency and authorization on the server. A button's disabled state is not payment authorization.
- Add/confirm idempotency for order creation and checkout-session creation, including double taps, network retries and concurrent tabs. A return from cancelled payment uses the existing Order rather than creating another one.
- Confirm hosted payment return URLs and webhooks use the environment-derived storefront host. Return success must be confirmed from live Order status, not trusted from a redirect alone.
- Verify public catalog and Order responses cannot be cached by any upstream CDN/API gateway. nginx and the service worker do not cache them.

## Deployment and real-device acceptance (not satisfied by unit tests)

1. Build/test with Node 20: `npm run build:storefront`, `npm run test:storefront -- --watch=false --browsers=ChromeHeadless` from the repo root. The macOS Node path in the task is not available on Windows.
2. Deploy and inspect `https://$STOREFRONT_HOST/index.html`, `/ngsw.json`, `/ngsw-worker.js`: status 200, `Cache-Control: no-cache`. Verify `/v1/...` is live with `Cache-Control: no-store`.
3. GET both `/.well-known/apple-app-site-association` and `/.well-known/assetlinks.json`: status 200, JSON content type, no redirect, expected release identities. Unknown well-known paths return 404, never HTML. Verify with Apple's association tooling and Android `adb shell pm verify-app-links --re-verify <package>` / `adb shell pm get-app-links <package>`.
4. Verify nginx and service-worker cold navigation to `/m/<merchant>/b/<branch>` and `/order/<order>` with real records. Repeat after first service worker activation and with network disabled; offline shell must explain reconnecting without offering payment.
5. On a physical iPhone/Safari and Android/Chrome, scan both QR types from the native camera in each state: fresh browser, installed PWA, native app installed. Branch QR must always open the encoded branch in the web storefront. Order QR must open native OrderDetail only when app associations are installed/verified; otherwise show QR Order Landing. OS/browser user link preferences can affect handoff and must be recorded.
6. At 360px portrait and landscape, check long names, large text, notch safe areas, cart disclosure/scrolling, all 44px targets, keyboard focus and no horizontal overflow. Check product, checkout and QR order surfaces too.
7. Pay with mobile Safari via the real hosted provider. Check success, cancellation, back navigation, lost tab storage, blocked storage, repeated cancellation and retry. Confirm the cart remains scoped and the same Order is retried. Recovery is best-effort when the browser blocks all persistent storage; the Order is still fetched live.
8. Leave a catalog open, deploy a second build, foreground the tab and verify a ready update reloads it. Repeat during checkout/payment return: no automatic reload until navigating back to browsing. Check API changes appear immediately with service-worker control enabled.
9. Run mobile Lighthouse against a deployed Web Catalog with representative API latency/images and a cold cache. Record Performance and Accessibility (both target >=90), manifest/installability diagnostics, build and device. Browser installability and physical-device results remain release gates; do not infer them from a successful build.
10. Run the repository's CORS preflight using the actual ConfigMap-derived API/storefront hosts before shipping. The storefront normally proxies API requests same-origin.
