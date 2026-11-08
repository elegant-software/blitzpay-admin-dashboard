# Storefront themes

Storefront part of
[blitz-pay-mobile#46](https://github.com/elegant-software/blitz-pay-mobile/issues/46).

A theme is a row in the backend `storefront_themes` table, not code:

| Field | Meaning |
|---|---|
| `code` | e.g. `HERITAGE`; merchants store this in `storefrontTheme` |
| `displayName` | shown in the admin dropdown |
| `style` | layout built into the storefront CSS: `STANDARD` or `CLASSIC` (serif headings, square corners) |
| `tokens` | colours per mode, `{"light": {"primary": "#926b1d", …}, "dark": {…}}`, keys = `--storefront-<key>` variables |
| `status` | `DRAFT` (preview only) or `PUBLISHED` (merchants can pick it) |

`DEFAULT` is the neutral look. Platform admins save drafts with
`PUT /v1/storefront/themes/{code}`; the backend accepts only known colour keys with
`#rrggbb` values and returns contrast warnings below 4.5:1. Published themes can't be
changed: save the new look under a new code, review it, publish it, then move merchants.

## Who maintains what

- **Platform admins / ops**: theme rows (colours, names, publishing), and which theme each merchant uses.
- **Developers**: the `style` layouts in `projects/blitz-pay-web/src/styles.css`
  (`:root[data-storefront-style="classic"]`) and the list of colour keys. A new layout needs a
  value in the backend `StorefrontThemeStyle` enum and a CSS block here.

## How the storefront applies it

`StorefrontBrandService` loads the merchant of the open menu or order, then
`GET /v1/storefront/themes/{code}`. It writes the colours into a
`<style id="storefront-theme-tokens">` (dark colours only in dark mode) and sets
`data-storefront-style` on `<html>`. The header and menu show the merchant's own logo.

## Reviewing a theme

On the admin merchant edit page, pick any theme (drafts included) under
"Preview a theme on this storefront" and click **Open preview**. It opens the merchant's
first branch with `?previewTheme=CODE`, which overrides the merchant's theme for that tab only.

Validate with `npm run test:storefront -- --watch=false --browsers=ChromeHeadless`
and `npm run build:storefront`.
