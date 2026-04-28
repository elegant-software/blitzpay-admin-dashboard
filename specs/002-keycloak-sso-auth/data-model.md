# Data Model: Keycloak SSO Authentication

## AuthConfig

- **Purpose**: Runtime-safe configuration required by the frontend to start the hosted authentication flow.
- **Fields**:
  - `authorityUrl`: base URL of the Keycloak host
  - `realm`: realm name used by the dashboard
  - `clientId`: public client identifier for the Angular app
  - `redirectUri`: post-login return URI
  - `postLogoutRedirectUri`: URI used after sign-out
  - `silentCheckSsoRedirectUri`: hidden callback page for session checks
  - `scopes`: requested scopes for API access and profile data
- **Validation**:
  - All URI fields must be absolute HTTPS URLs outside local development.
  - `clientId` and `realm` must be non-empty.

## AuthSession

- **Purpose**: Frontend representation of the current authenticated state.
- **Fields**:
  - `status`: `initializing`, `authenticated`, `anonymous`, `accessDenied`, `error`
  - `subjectId`: stable identity subject from the token
  - `displayName`: user-facing name when available
  - `email`: verified email when available
  - `roles`: normalized dashboard roles
  - `accessToken`: current short-lived access token
  - `accessTokenExpiresAt`: token expiry timestamp
  - `refreshEligible`: whether a silent refresh attempt is allowed
  - `returnUrl`: protected route the user originally requested
  - `lastErrorCode`: latest auth-related failure or denial code
- **Validation**:
  - `accessToken` is present only when `status` is `authenticated`.
  - `returnUrl` must resolve to an allowed in-app route.
  - `roles` are derived from trusted token claims only.
- **State transitions**:
  - `initializing -> authenticated`
  - `initializing -> anonymous`
  - `authenticated -> accessDenied`
  - `authenticated -> anonymous`
  - `any -> error`

## AdminIdentityProfile

- **Purpose**: Canonical profile facts used to match an authenticated person to an existing dashboard identity or a new registration flow.
- **Fields**:
  - `subjectId`
  - `email`
  - `emailVerified`
  - `firstName`
  - `lastName`
  - `preferredUsername`
  - `identityProvider`
  - `linkedMethods`
- **Validation**:
  - Matching against an existing account requires a verified identity signal.
  - `identityProvider` must be one of the approved providers configured by the organization.

## RegistrationRecord

- **Purpose**: Tracks the registration outcome for first-time users entering through direct or social sign-in.
- **Fields**:
  - `registrationId`
  - `source`: `direct`, `social`
  - `identityProvider`
  - `submittedAt`
  - `status`: `draft`, `submitted`, `pendingReview`, `approved`, `rejected`, `completed`
  - `requestedRole`
  - `contactEmail`
  - `displayName`
  - `decisionReason`
- **Validation**:
  - `contactEmail` must be present and valid at submission.
  - `status` may not move from `rejected` or `completed` back to `draft`.
- **State transitions**:
  - `draft -> submitted`
  - `submitted -> pendingReview`
  - `pendingReview -> approved`
  - `pendingReview -> rejected`
  - `approved -> completed`

## LinkedIdentityMethod

- **Purpose**: Represents one identity mechanism connected to a dashboard user.
- **Fields**:
  - `providerKey`
  - `providerType`: `primary`, `social`
  - `externalSubjectId`
  - `email`
  - `linkedAt`
  - `lastUsedAt`
- **Validation**:
  - One dashboard user cannot hold duplicate links for the same provider and external subject.
  - Social links should only be created after verified identity matching or registration completion.

## AccessRoleAssignment

- **Purpose**: Determines whether an authenticated user may enter the dashboard and which sections should be visible.
- **Fields**:
  - `roleKey`
  - `granted`
  - `grantedAt`
  - `source`
  - `scope`
- **Validation**:
  - At least one required admin role must be granted before protected access is allowed.
  - Unknown role values are ignored for UI visibility but logged for investigation.

## Relationships

- `AuthConfig` initializes one active `AuthSession` per browser tab.
- `AuthSession` is derived from one `AdminIdentityProfile`.
- `AdminIdentityProfile` may have zero or more `LinkedIdentityMethod` entries.
- `AdminIdentityProfile` may have zero or one active `RegistrationRecord`.
- `AdminIdentityProfile` may have one or more `AccessRoleAssignment` entries.
