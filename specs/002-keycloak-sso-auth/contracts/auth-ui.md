# UI Contract: Authentication Entry and Access Control

## Purpose

Define the user-visible contract for sign-in, registration, social login entry, and protected route access in the admin dashboard.

## Routes

| Route | Audience | Expected behavior |
|---|---|---|
| `/auth/login` | Unauthenticated users | Shows the dashboard-branded auth entry page with `Sign in` and `Register` actions. |
| `/auth/access-denied` | Authenticated but unauthorized users | Explains that sign-in succeeded but dashboard access is not yet permitted, and offers sign-out plus support guidance. |
| `/* protected app routes` | Authenticated, authorized users | Render the existing admin shell and feature pages only after auth state resolves. |

## Auth Entry Page

| Element | Requirement |
|---|---|
| Brand header | Must identify the page as the BlitzPay admin dashboard. |
| `Sign in` action | Starts the hosted Keycloak login flow and preserves the intended return URL. |
| `Register` action | Starts the hosted registration flow for first-time users. |
| Social login note | Must indicate that approved identity providers are available during the hosted sign-in experience. |
| Error banner | Must display recoverable auth failures in plain language and allow retry. |

## Access Rules

| Scenario | Result |
|---|---|
| Anonymous user opens a protected route | User is redirected to `/auth/login` or directly into the hosted login flow before protected content renders. |
| User completes sign-in with required role | User returns to the originally requested route. |
| User authenticates but lacks required role | User is sent to `/auth/access-denied`. |
| User returns with an existing active session | Protected content loads without showing the sign-in entry page again. |
| Identity provider is unavailable | User sees a failure state with retry guidance and no protected content leaks. |

## Session Controls

| Control | Requirement |
|---|---|
| Profile-menu `Logout` action | Ends the local session and initiates hosted logout from the authenticated user menu. |
| Session restore on refresh | The app re-evaluates auth state before rendering protected sections. |
| In-flight API requests after sign-out | Must no longer carry bearer credentials. |
