# Admin multilingual interface (#83)

Admin branch: `feat/83-admin-multilanguage`. No backend dependency: the dashboard ships its own interface languages and text.

## Localization

Interface text is system text, so it ships with the dashboard as files, never in the database (CONSTITUTION, "System text and translations"). `src/app/i18n/languages.json` lists the interface languages (code, names, flag, direction). `src/app/i18n/messages/<code>.json` holds the text, keyed by the English source. `src/app/i18n/primeng/<code>.json` holds PrimeNG component text. To add a language, add one entry to `languages.json`, a messages file and a PrimeNG file. Merchant menu languages still come from `GET /v1/merchants/menu-languages`; that list is unrelated to the interface language.

English, German and Arabic dashboard translations are shipped. The compact selector shows flag/code; its menu shows native names. Preference: `blitzpay.admin-language`. A missing translation falls back to the English source text. Merchant original/supported languages remain independent saved settings; changing the UI never rewrites them.

`AdminLanguageService` coordinates the shipped languages, document language/direction and PrimeNG filter/paginator/calendar text. `AdminLocaleService` translates UI text for pipes and notifications. `AdminOptionsPipe` translates option labels without changing values or mutating backend objects.

Use `{{ 'Save' | adminTranslate }}` or `{{ 'Translations — {0}' | adminTranslate: [category.name] }}`, then add the English source as a key to every file in `src/app/i18n/messages/`. Stored dynamic UI messages are matched against source patterns on display so changing language updates existing pages. Arabic parameters use bidirectional isolation.

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

- `node tools/i18n/check.mjs`: all 28 component templates audited for untranslated static UI; every key must have a non-empty German and Arabic entry; directional component CSS checked. 1,020 German/Arabic entries.
- `npm test -- --watch=false --browsers=ChromeHeadlessNoSandbox`: 306 tests pass, including shipped language list, individual Arabic rendering, switching back to German/English without route reload, notifications, option values, RTL geometry, coordinate preservation, product language requests/fallback and single-language merchants.
- `npm run build`: compiles every standalone template and style.

Menu text direction (RTL for Arabic and similar) is decided in `menu-language.ts`, not by the backend.
