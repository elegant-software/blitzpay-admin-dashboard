# Integration Contract: API Authentication Behavior

## Purpose

Define how the frontend attaches authenticated context to existing backend API traffic after Keycloak integration is enabled.

## Outbound Request Rules

| Request type | Requirement |
|---|---|
| Requests to configured backend API base URLs | Must include `Authorization: Bearer <access-token>` when the user is authenticated. |
| Requests to static assets or unrelated hosts | Must not receive bearer headers. |
| Requests made while auth state is unresolved | Must wait for auth resolution or fail fast with a controlled error rather than leaking anonymous calls to protected APIs. |

## Token Lifecycle Rules

| Event | Requirement |
|---|---|
| Access token near expiry | Frontend attempts token refresh before sending the protected request. |
| Refresh succeeds | Original request proceeds with the new token. |
| Refresh fails | Session transitions to signed-out or error state and the user is redirected to re-authenticate. |
| User signs out | Cached auth state is cleared and subsequent API calls are unauthenticated until sign-in completes again. |

## Authorization Outcome Rules

| Backend response | Frontend behavior |
|---|---|
| `401 Unauthorized` | Clear invalid auth state and re-enter sign-in flow. |
| `403 Forbidden` | Keep the authenticated session, show an access-denied experience, and avoid infinite retry loops. |
| Network or identity-host outage | Show a retryable error message and preserve the current route intent when possible. |
