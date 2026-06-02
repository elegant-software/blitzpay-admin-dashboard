# ADR 0005: Universal Order URL as the Merchant Order QR Scheme

## Status

Accepted

## Date

2026-05-27

## Context

The existing `blitz-pay-merchant` app has two QR concerns: its Create Order flow generates a **Merchant Order QR** that encodes `blitzpay://order/{orderId}`, while its generic merchant QR surface currently emits `blitzpay://pay/{merchantId}` without Branch catalog scope. Custom deep links fail for customers without the native app, and a merchant-only QR cannot identify the Branch whose products and fulfillment context should be shown.

The `blitz-pay-web` Web Storefront at `pay.blitzpay.com` is being introduced as the web fallback for customers without the native app. The QR encoding scheme must change so that both paths — native app and web browser — are served by a single QR code.

## Decision

Use distinct HTTPS public URLs for the two QR purposes:

- **Branch Catalog QR** from the merchant QR surface: `https://pay.blitzpay.com/m/{merchantId}/b/{branchId}`. It is stable reusable Branch signage, contains no amount or payment label, and opens the merchant-branded, Branch-scoped product catalog before any Order exists, where current selected Products determine the Web Cart amount.
- **Merchant Order QR** from Create Order: `https://pay.blitzpay.com/order/{orderId}`. It opens one already-created Order for review and payment.

- For a **Merchant Order QR**, on iOS/Android devices **with** the BlitzPay app installed, the operating system may intercept the URL as a Universal Link (iOS) / App Link (Android) and open the native app's `OrderDetail` screen directly.
- For a **Merchant Order QR** on devices **without** the app, the browser opens and the **QR Order Landing** page at `/order/{orderId}` is served.
- A **Branch Catalog QR** is a browser-first entry to the Web Storefront catalog for customers who want to choose Products themselves, regardless of whether the native app is installed.

The QR purpose determines the URL: catalog browsing is not represented as an Order, and an already-created Order is not represented as a new Web Cart.

## Consequences

- **Merchant app changes required**: `MerchantQRCodeScreen` must emit a Branch Catalog URL containing Merchant and Branch identifiers; Create Order must emit the HTTPS Universal Order URL instead of the `blitzpay://` order scheme.
- **Universal Link / App Link configuration required**: The native BlitzPay iOS app must register an `apple-app-site-association` file at `pay.blitzpay.com/.well-known/apple-app-site-association`, and the Android app must register a Digital Asset Links file, both declaring `/order/*` as handled routes.
- **Existing printed or cached QR codes** encoding the old `blitzpay://` scheme will stop working on devices without the app. Migration is a one-time merchant-app release.
- The merchant UI exposes two purposeful QR actions: let a customer browse this Branch, or let a customer pay this already-created Order.
