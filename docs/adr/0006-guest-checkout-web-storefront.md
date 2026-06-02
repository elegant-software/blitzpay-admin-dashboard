# ADR 0006: Guest Checkout on the Web Storefront

## Status

Accepted

## Date

2026-05-27

## Context

The `blitz-pay-web` Web Storefront serves end-customers who arrive either via a scanned **Merchant Order QR** or by browsing a **Web Catalog** URL directly. These customers may have no prior relationship with BlitzPay and no account. The primary use case is a customer who scans a QR code at a merchant's location and needs to pay immediately.

A login or registration requirement at this point introduces friction that directly conflicts with the QR-scan-to-payment journey.

## Decision

The Web Storefront supports **Guest Checkout** — no account registration or login is required to browse the **Web Catalog**, review a **QR Order Landing**, or complete payment. Any customer can pay as a guest.

The **App Install Prompt** on every screen encourages account creation through the native BlitzPay app after the customer's immediate need (payment) is fulfilled.

## Consequences

- **Order history is not linked** to a customer identity on web. A guest who pays has no way to retrieve that order later from the web — they would need to install the native app and create an account.
- **No saved payment methods** on web — each guest checkout is fresh.
- **App Install Prompt is load-bearing**: it is the sole conversion mechanism from a one-time guest payer to a registered BlitzPay user. It must appear on every screen and must not be dismissible without being seen.
- An authenticated web flow (optional login for returning BlitzPay users) may be added in a later version without conflicting with this decision.
