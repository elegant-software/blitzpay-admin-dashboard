# ADR-0008: Backend `/user-management` API is the sole write path for Merchant User Assignments

**Date**: 2026-06-06  
**Status**: Accepted

## Context

The admin dashboard needs to assign Platform Users (Keycloak users) to Merchants and Branches. Each assignment involves two side effects: placing the user in a Keycloak group (`/merchants/merchant_<uuid>` or a branch sub-group) and creating a BlitzPay `Merchant User Assignment` record that carries the Merchant Operations Role and optional Employee link.

The dashboard could have called the Keycloak Admin API directly from the browser (using a privileged token), or could have called separate endpoints for group membership and role management.

## Decision

All user assignment logic lives in a new `/user-management` backend API group. The dashboard calls only this API — never Keycloak directly. The backend writes Keycloak group membership and the BlitzPay domain record atomically in a single operation.

## Reasons

- Keycloak Admin API requires service-account credentials that must not be exposed in the browser
- Splitting group and role writes across two calls creates the risk of orphaned group memberships with no role, or roles with no group access
- The backend already owns Keycloak group sync (spec 014); user assignment is a natural extension of the same `merchant.iam` module
- Keeping all logic in the backend means the dashboard stays thin and the contract is testable independently

## Alternatives rejected

- **Dashboard calls Keycloak Admin API directly**: Exposes service-account credentials in the browser; violates the established backend-proxy pattern
- **Separate endpoints for group and role**: Increases coordination burden; partial failure leaves inconsistent state
