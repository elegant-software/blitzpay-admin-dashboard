# Admin multilingual interface (#83)

Admin branch: `feat/83-admin-multilanguage`. Backend dependency: [zack-pay#218](https://github.com/elegant-software/zack-pay/issues/218), branch `feat/admin-ui-languages`.

## Localization

The dashboard header and merchant menu settings share authenticated `GET /v1/merchants/menu-languages`, backed by the existing language table. `MerchantApiService` caches the catalogue per backend/API version; failures and empty catalogues can retry. `adminUiEnabled` plus a shipped interface bundle/flag determines dashboard choices; `menuEnabled` determines merchant dropdown options. Direction and representative flags come from the same backend metadata. The duplicate `/admin/ui-languages` endpoint is removed.

English, German and Arabic dashboard translations are shipped. The compact selector shows flag/code; its menu shows native names. Preference: `blitzpay.admin-language`. Missing languages/translations and API failures fall back to English. Merchant original/supported languages remain independent saved settings; changing the UI never rewrites them.

`AdminLanguageService` coordinates backend metadata, document language/direction and PrimeNG filter/paginator/calendar text. `AdminLocaleService` has no HTTP dependencies and translates UI text for pipes and notifications. `AdminOptionsPipe` translates option labels without changing values or mutating backend objects.

Use `{{ 'Save' | adminTranslate }}` or `{{ 'Translations — {0}' | adminTranslate: [category.name] }}`. Each row in `src/app/i18n/page-translations.ts` contains source, German and Arabic. Stored dynamic UI messages are matched against source patterns on display so changing language updates existing pages. Arabic parameters use bidirectional isolation.

## Component review

| Component | Reviewed UI |
|---|---|
| Platform KPI dashboard | Headings, filters, cards, payment table, loading states |
| Merchant catalog | Search, filters/options, cards, empty states, pagination |
| Merchant detail | All tabs, branches/products/categories, dialogs, payments, appearance history |
| Merchant edit | Create/edit forms, validation, offerings, VAT, menu languages, logo/location |
| Branch edit | Contact/location/payment fields, actions, validation |
| Product edit | Original-language fields, pricing, images, translation rows |
| Category translations dialog | Status, validation, save/delete/close actions |
| Branch kitchen routing | Station choices, help text, feedback |
| Branch kitchen screen | Confirmations, credentials, copy controls, feedback |
| Branch preparation | Station editor, validation, confirmations, feedback |
| Branch catalog QR | Alternative text; link/QR payload preserved |
| Orders | Search/filters, counters, list/detail/create dialogs, invoices, validation, feedback |
| Appointments shell | Navigation tabs |
| Appointment management | Filters, list/detail/create/reschedule/override/contact dialogs, confirmations |
| Branch calendar | Scope, table, status, dialogs, confirmations |
| Appointment policy | Rules, help text, edit dialog, validation |
| Settlement reporting | Filters, summary/method cards, transactions, refresh, empty states |
| User management | Search, results, empty states |
| User detail | Assignments, roles, assignment dialog, feedback |
| Branch tables | Tables/floor plans, seats/name dialogs, QR/NFC actions, confirmations |
| Floor-plan editor | Modes, placement actions, areas, help text |
| Live floor | Legend, occupancy summary, order details, relative durations |
| Table QR card | Labels/alternative text; names/codes/QR payload preserved |
| Shared merchant search | Labels, placeholders, results, location fallback |
| Printed catalog | Admin toolbar/loading/empty states; guest sheets retain Catalog Language |
| Stripe Connect return | Progress/results/errors, authenticated locale initialization |
| Notifications | Localized headings, feedback, dynamic messages |
| App root / dashboard layout | Shared state, navigation, accessibility, direction lifecycle |

## RTL and content boundaries

- Spacing, borders, corners, icons and text alignment use logical CSS. Search controls follow UI direction; data fields use automatic direction. Email, URLs, numbers, dates, credentials and code stay LTR. Navigation arrows mirror where appropriate.
- Floor-plan coordinates, placements, maps and QR drawings remain physical. Arabic uses self-hosted Cairo, including controls; font and flag licenses are included.
- The language switcher always keeps LTR ordering, including its open menu, within an RTL dashboard.
- Product displays, the order product picker and the printed catalog follow the dashboard language when supported by the merchant; otherwise they request the original menu language. Single-language merchants keep their original language without reloading on UI language changes. Missing individual translations retain the backend's original-language fallback.
- Product/category edit forms remain in the original menu language. Language changes preserve order quantities/prices and historical order content. Printed sheets use the selected product language and direction; an explicit catalog URL selection is respected until the next dashboard language change.
- Dates and confirmation timestamps use `DisplayDatePipe`, preserving canonical `d MMM y, HH:mm` / `en-GB` formatting.
- The login page has no selector or language request. Leaving the authenticated UI restores English/LTR, including late request completion. Public storefront is outside scope.

## Verification

- `node tools/i18n/check.mjs`: all 28 component templates audited for untranslated static UI/missing entries; directional component CSS checked. 1,002 German/Arabic entries.
- `npm test -- --watch=false --browsers=ChromeHeadlessNoSandbox`: 311 tests pass, including shared catalogue/capability filtering, backend direction metadata, individual Arabic rendering, switching back to German/English without route reload, notifications, option values, RTL geometry, coordinate preservation, product language requests/fallback and single-language merchants. HTTP regression coverage verifies fresh requests even when consecutive UI languages share the original-language fallback.
- `npm run build`: compiles every standalone template and style.

The backend catalogue must run from its feature branch or be deployed before choices load. The endpoint remains authenticated.
