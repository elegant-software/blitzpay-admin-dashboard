# Storefront notifications

The storefront uses the admin dashboard's PrimeNG notification pattern from
`feat/52-api-toasts`. Its implementation lives in
`projects/blitz-pay-web/src/app/notifications/`.

- Mount one `NotificationComponent` in the application shell, outside routed pages.
- Feature handlers own notifications; do not add a second HTTP-interceptor toast.
- Use `success`, `info`, `warning`, and `error` for action feedback. Use `apiError`
  for HTTP failures; it returns the same customer-facing message for any persistent
  inline context that the page also needs.
- Identical active messages and repeated reports of the same HTTP failure are
  suppressed. Dismissal allows the same message to be shown again.
- Error, warning, and success/info notifications last 12, 8, and 6 seconds
  respectively and can be dismissed. Expiry timers run outside Angular so they
  do not delay checkout stability or service-worker registration.
- Keep persistent empty, unavailable, offline, and field-validation states in
  their pages. Toasts supplement checkout errors beside the retry action.
- Backend errors are ProblemDetail bodies `{ status, detail, code }`. Pick wording by
  `code`, never by `detail` text: `MESSAGES_BY_CODE` next to `apiErrorMessage` holds the
  storefront's own wording (table-location codes, `TOO_MANY_REQUESTS`); a caller can pass
  `byCode` for page-specific wording. Otherwise a short 4xx `detail` is shown, unknown
  diagnostics use a safe fallback, and network failures explain connectivity.

The toast host supports native modal dialogs, keyboard dismissal, mobile widths,
and both storefront themes. Only Aura base and toast tokens are loaded.

## Development checks

Run `npm run test:storefront -- --watch=false --browsers=ChromeHeadless` and
`npm run build:storefront`.

Table ordering still requires a fresh location with accuracy at most 100 metres
and coordinates inside the branch geofence. Use browser geolocation emulation
for development; do not weaken backend checks. For the Bremen test branch
`d15fecee-5c5c-4d5d-9b68-12b159c55ce1`, the current branch coordinates are
latitude `53.1026709`, longitude `8.9117364`. Set emulated accuracy to `10` metres.
Recheck the branch coordinates if its configuration changes. A test order against
the deployed storefront creates an order on its configured server.
