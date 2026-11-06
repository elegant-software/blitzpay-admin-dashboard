# Storefront bona’me branding

Storefront implementation of
[blitz-pay-mobile#46](https://github.com/elegant-software/blitz-pay-mobile/issues/46).

The entry page uses bona’me branding. Merchant journeys use it only for the
approved merchant ID in `StorefrontBrandService`. Other merchants retain the
neutral storefront theme, their API-provided logo, and merchant/branch identity.
Order pages select their theme from the loaded order's merchant ID; an unresolved
order is not assumed to belong to bona’me.

The approved transparent logo is `projects/blitz-pay-web/public/bona-me-logo.png`.
Keep its original pixels and aspect ratio. The header, menu, product, and checkout
surfaces use it with a text fallback. A cream backing preserves legibility in
dark mode. Other merchant images fall back to their name's initial on load failure.

The palette follows issue #46 and the visual direction of https://bona-me.de/:
gold `#926B1D`, brown `#634A23`, cream `#FFF9EF`, and dark text `#29231B`.
Website stylesheet values were not independently verified. Additional warm
neutrals and dark-mode tokens are storefront interpretations. Normal text and
primary action colors have contrast of at least 4.5:1 against their backgrounds.

Brand tokens are scoped by `data-storefront-brand="bona-me"` in `styles.css`.
The registry is explicit rather than matching editable merchant display names.
The current API has no merchant theme configuration; a future configuration API
can replace this registry without changing ordering or payment contracts.

This change covers storefront UI branding. It does not replace PWA launcher
icons, platform identifiers, payment-provider marks, or the BlitzPay app download
links. Existing table, cart, language, geolocation, and payment flows remain.

Validate with `npm run test:storefront -- --watch=false --browsers=ChromeHeadless`
and `npm run build:storefront`. Check the home page, approved merchant menu,
product, and checkout in light/dark themes at mobile and desktop widths, then
navigate to a different merchant to verify the theme resets.
