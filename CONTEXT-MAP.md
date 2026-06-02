# Context Map

## Contexts

- [Admin Dashboard](./CONTEXT.md) — merchant onboarding, catalog management, branch/product admin, and PSP configuration performed by internal operators
- [Web Storefront](./projects/blitz-pay-web/CONTEXT.md) — public customer-facing product catalog, self-service cart, and QR-initiated order checkout at `pay.blitzpay.com`

## Relationships

- **Admin Dashboard → Web Storefront**: A **Merchant** and its **Branches** and **Products** managed in the Admin Dashboard are the source of truth for what the Web Storefront displays. Activation/deactivation of a **Product** in the Admin Dashboard controls its visibility in the **Web Catalog**.
- **Web Storefront ↔ Order Payment** (prototype context): The Web Storefront shares **Order**, **OrderId**, **Merchant Order QR**, and **Checkout Intent** language with the `blitz-pay` native app. A **Web Cart** checkout and a native-app checkout both result in the same **Order** entity.
