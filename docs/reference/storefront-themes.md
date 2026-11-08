# Storefront themes

Storefront part of
[blitz-pay-mobile#46](https://github.com/elegant-software/blitz-pay-mobile/issues/46).

Each merchant has a `storefrontTheme` (`DEFAULT` or `HERITAGE`), set on the
merchant edit page in the admin dashboard and returned by `GET /v1/merchants/{id}`.
No merchant is named in the storefront code.

`StorefrontBrandService` loads the merchant of the open menu (`/m/{merchantId}/…`)
or order, and sets `data-storefront-theme="<theme in lower case>"` on `<html>`.
`DEFAULT`, the entry page, an unresolved order, or a failed lookup all use the
neutral storefront look. The header and menu show the merchant's own uploaded
logo, with a text fallback if it fails to load.

## Presets

Presets are CSS blocks in `projects/blitz-pay-web/src/styles.css` scoped by
`:root[data-storefront-theme="…"]`; merchants choose a preset, never raw colours,
so contrast and dark mode stay under our control.

- **HERITAGE**: cream, brown and gold with serif headings (first used by bona’me).
  Gold `#926B1D`, brown `#634A23`, cream `#FFF9EF`, dark text `#29231B`. Normal
  text and primary actions have at least 4.5:1 contrast. A cream backing keeps
  dark logos legible in dark mode.

To add a preset: add the value to the backend `StorefrontTheme` enum, a CSS block
here, and an option in the admin merchant form.

Validate with `npm run test:storefront -- --watch=false --browsers=ChromeHeadless`
and `npm run build:storefront`.
