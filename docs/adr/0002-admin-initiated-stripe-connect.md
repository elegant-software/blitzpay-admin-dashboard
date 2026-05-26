# ADR 0002: Admin-Initiated Stripe Connect Onboarding

## Status

Accepted

## Date

2026-05-26

## Context

BlitzPay previously exposed Stripe Connect onboarding to merchants via a dedicated screen in the merchant mobile app (`StripeConnectScreen`). A merchant user authenticated with their branch-scoped token and initiated the hosted Stripe Express account flow themselves.

This arrangement had two problems:

1. **Trust boundary**: the merchant app token is branch-scoped. Stripe Connect operates at the merchant level. Allowing merchant users to initiate merchant-level payment account changes from a branch-scoped session is a privilege mismatch.
2. **Operational control**: the operations team needs visibility and control over which merchants are connected to Stripe before they can accept payments. Merchant self-service bypasses that gate.

The decision was made to move Stripe Connect onboarding entirely into the admin dashboard, where an admin can trigger it for any searched merchant.

## Decision

**Stripe Connect Onboarding is admin-initiated only.** The merchant app screen and navigation entry are removed entirely.

The admin flow works as follows:

1. Admin searches for a merchant in the merchant catalog.
2. A **Payment Account** section below the merchant card shows the current Payment Account Status (`not_connected / verifying / connected / error`) fetched from `GET /merchants/{id}/stripe-connect/status`.
3. Admin clicks the CTA ("Connect Stripe" / "Continue Setup"). The admin POSTs to `POST /merchants/{id}/stripe-connect` with `return_url` and `refresh_url` in the body pointing to the admin dashboard's `/stripe-connect/return` route. The backend passes these through to Stripe.
4. The onboarding link opens in a **new browser tab**. The original catalog tab stays open.
5. When Stripe redirects back, the return route calls `GET /merchants/{id}/stripe-connect/status` and displays the result. If `refresh=true` (link expired), it fetches a new link from `GET /merchants/{id}/stripe-connect/refresh` and redirects immediately to Stripe.

The backend must be updated to accept admin tokens on the Stripe Connect endpoints (currently merchant-auth-only). This is a hard dependency for production.

## Consequences

### Positive

- Operations team controls when a merchant's Stripe account is activated.
- Admin token is the correct authorization level for a merchant-level payment account operation.
- Merchant app is simplified — one less screen and navigation route.

### Negative

- Merchants can no longer self-serve their Stripe Connect setup; they depend on an admin action.
- Adds a new admin dashboard route (`/stripe-connect/return`) that must remain stable — Stripe embeds this URL in account links which have a short TTL but the URL pattern must not change.
- Backend work (admin token authorization on Stripe Connect endpoints) is a prerequisite for production use.

## Alternatives Considered

**Keep merchant self-service, add admin view only**: rejected because it leaves the privilege mismatch in place and gives the operations team read-only visibility without control.

**Admin generates a shareable link, merchant completes it**: rejected because it adds an out-of-band step (sending the link) and still bypasses the admin's ability to observe completion in real time.
