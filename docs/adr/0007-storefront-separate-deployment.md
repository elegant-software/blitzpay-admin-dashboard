# ADR-0007: Web Storefront deployed as a separate image and k8s Deployment

**Status:** Accepted

## Context

The `blitz-pay-web` Angular project lives in the same monorepo as the admin dashboard and is built from the same CI pipeline. When adding CD support for the Web Storefront, we had two options: bundle both apps into a single nginx image (admin at `/`, storefront at a sub-path or the same root with nginx routing), or produce a separate Docker image with its own k8s Deployment and Ingress.

## Decision

Deploy the Web Storefront as a **separate Docker image** with its own k8s Deployment, Service, and Ingress — triggered from the same CD pipeline that builds the admin dashboard image.

The Web Storefront is served at `blitz-pay-web.elegantsoftware.de` (staging). The admin dashboard remains at `blitzpay-admin-dashboard.elegantsoftware.de`.

## Consequences

- The two apps can be scaled, secured, and updated independently.
- The admin (internal tool) and the storefront (public customer-facing app) are separated at the network boundary — different domains, different TLS certificates, different resource quotas.
- Admin environment config (`storefrontUrl`) points to the storefront domain for that environment, so the admin's branch-row Web Catalog Link and Branch edit dialog QR always open the paired storefront.
- A bundled image would have forced the storefront onto the admin domain, conflating two audiences with different security and availability requirements, and made the public storefront dependent on the admin's release cadence.
