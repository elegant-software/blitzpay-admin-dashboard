# Research: Keycloak SSO Authentication

## Decision 1: Use Keycloak's official JavaScript adapter in the Angular app

- **Decision**: Integrate authentication with the official `keycloak-js` adapter instead of introducing a separate community Angular wrapper.
- **Rationale**: The project is already using Angular standalone bootstrap APIs and has no existing auth abstraction. The official adapter keeps the integration surface smaller, avoids wrapper-specific lifecycle constraints, and aligns directly with Keycloak's documented browser flow.
- **Alternatives considered**:
  - `keycloak-angular`: rejected for the plan baseline because it adds another abstraction layer that is not required for this app's current size.
  - Custom OAuth/OIDC flow implementation: rejected because it would duplicate behavior that Keycloak already provides and increase security risk.

## Decision 2: Use Authorization Code flow with PKCE for browser sign-in

- **Decision**: Configure the dashboard as a browser-based public client that uses the standard authorization code flow with PKCE.
- **Rationale**: This is the current secure default for modern browser apps and supports Keycloak-hosted login, registration, and identity brokering without embedding credentials in the dashboard.
- **Alternatives considered**:
  - Implicit flow: rejected because it is not the preferred modern browser flow.
  - Resource owner password credentials: rejected because it conflicts with hosted SSO and social login goals.

## Decision 3: Resolve authentication state during app bootstrap and guard protected routes

- **Decision**: Initialize Keycloak before protected navigation proceeds, then use Angular route guards to enforce access to dashboard sections.
- **Rationale**: This prevents protected content from flashing before auth state is known and maps cleanly onto Angular's documented route protection model for standalone applications.
- **Alternatives considered**:
  - Defer all auth checks until after the app shell renders: rejected because it risks protected-content flicker and inconsistent redirect behavior.
  - Protect individual components without routing: rejected because the app currently lacks routes and auth would become harder to scale as new sections are added.

## Decision 4: Let Keycloak-hosted pages handle registration and social identity choices

- **Decision**: The dashboard will offer `Sign in` and `Register` entry points, but the actual username/password, registration, and approved social provider choices will be rendered by the hosted Keycloak experience.
- **Rationale**: This keeps credential handling out of the admin app, centralizes social provider configuration, and satisfies the requirement for both self-registration and social login without building provider-specific UI inside the dashboard.
- **Alternatives considered**:
  - Build custom provider buttons and registration forms in the dashboard: rejected because it would duplicate identity-provider UX and complicate security ownership.
  - Disable self-registration in-app and rely on manual user creation: rejected because it fails the feature scope.

## Decision 5: Attach bearer tokens through an HTTP interceptor and refresh proactively

- **Decision**: Add an HTTP interceptor that acquires a fresh token before protected API calls and attaches the bearer token only to backend API requests.
- **Rationale**: This preserves the existing service-only HTTP pattern, centralizes token handling, and avoids leaking auth logic into every API method.
- **Alternatives considered**:
  - Add tokens manually in each service method: rejected because it is repetitive and error-prone.
  - Refresh only after 401 responses: rejected because it creates avoidable user-facing failures.

## Decision 6: Keep authorization layered between frontend UX and backend enforcement

- **Decision**: Use frontend role checks only to control navigation and messaging, while backend APIs continue to enforce the actual authorization boundary.
- **Rationale**: Client-side checks improve UX but are not a security boundary. This separation matches Angular guidance on route guards and reduces the risk of over-trusting the browser.
- **Alternatives considered**:
  - Rely only on frontend route guards for access control: rejected because browser code can be bypassed.
  - Ignore role state in the frontend entirely: rejected because users would receive poorer feedback after sign-in.

## Decision 7: Extend environment configuration with explicit auth settings

- **Decision**: Add environment-driven auth configuration for Keycloak base URL, realm, client ID, redirect URI base, and silent SSO callback path.
- **Rationale**: The repo already separates `local` and `staging` behavior through environment files and environment services. Auth configuration should follow the same operational pattern and avoid hard-coded tenant details in components.
- **Alternatives considered**:
  - Hard-code Keycloak settings in auth services: rejected because it prevents safe environment promotion.
  - Fetch auth config from a runtime endpoint before bootstrap: rejected for v1 because there is no existing runtime-config pattern in this app.

## References

- Keycloak documentation: JavaScript adapter, browser login flows, and identity brokering
- Angular documentation: standalone bootstrap, routing, and route guards
