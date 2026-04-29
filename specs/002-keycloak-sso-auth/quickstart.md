# Quickstart: Keycloak SSO Authentication

## 1. Prerequisites

- Node.js and npm installed for the Angular 20 workspace
- Access to the Keycloak host at `https://keycloak.elegantsoftware.de/`
- A Keycloak realm and public client configured for this dashboard
- Valid redirect URIs for local development and staging
- At least one approved social identity provider configured in Keycloak

## 2. Frontend configuration

Add auth configuration to the environment files:

- `src/environments/environment.ts`
- `src/environments/environment.prod.ts`

Planned config shape:

```ts
export const environment = {
  defaultEnvironmentKey: 'local',
  auth: {
    authorityUrl: 'https://keycloak.elegantsoftware.de',
    realm: 'blitzpay',
    clientId: 'blitzpay-admin-dashboard',
    redirectPath: '/',
    postLogoutRedirectPath: '/auth/login',
    silentCheckSsoPath: '/silent-check-sso.html',
    scopes: ['openid', 'profile', 'email']
  }
};
```

Confirm the actual `realm`, `clientId`, redirect URIs, and required admin role values with the Keycloak tenant before release. The current implementation uses `blitzpay` and `blitzpay-admin-dashboard` as the default realm/client assumptions.

## 3. Implementation steps

1. Add Angular router setup in `src/main.ts` and create `src/app/app.routes.ts`.
2. Create an `src/app/auth/` feature area with auth models, services, guards, interceptors, and auth-facing standalone components.
3. Initialize the Keycloak adapter during bootstrap before protected routes render.
4. Add an HTTP interceptor that refreshes and attaches bearer tokens to backend API traffic only.
5. Add login, registration-entry, access-denied, and sign-out flows to the app shell and topbar.
6. Preserve existing merchant API service boundaries and display conventions while making the dashboard route tree protected by default.

## 4. Verification flow

1. Run `npm install`.
2. Start the app with `npm start`.
3. Open a protected dashboard URL while signed out and confirm the auth entry flow appears before dashboard content.
4. Use `Sign in` and confirm a successful login returns to the intended dashboard page.
5. Use `Register` and confirm the hosted registration flow is reachable.
6. Confirm approved social providers appear in the hosted Keycloak experience.
7. After sign-in, verify merchant API requests include a bearer token.
8. Remove or downgrade the required role and verify the user lands on the access-denied screen instead of the dashboard.
9. Sign out and verify protected routes require authentication again.

## 5. Test coverage targets

- Auth service initialization and state transitions
- Route guard handling for anonymous, authenticated, and unauthorized users
- HTTP interceptor token attachment and refresh behavior
- Login/access-denied component rendering for success and failure states

## 6. Validation notes

- `tsc -p tsconfig.app.json --noEmit`: passed
- `ngc -p tsconfig.app.json`: passed
- `ng test --watch=false --browsers=ChromeHeadless`: blocked in this sandbox because Karma could not bind to port `9876`
- `ng build --no-progress`: aborted under local Node `v25.8.0`; Angular 20 reports that this odd-numbered Node release is unsupported, so full build validation still needs to be rerun on a supported Node LTS version
