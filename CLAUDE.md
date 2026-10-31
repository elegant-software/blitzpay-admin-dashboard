# BlitzPay Admin Dashboard — Claude Guidance

This file is read by Claude Code at the start of every session. It contains project-specific rules and pointers that must be respected throughout all AI-assisted development.

## Constitution

[`CONSTITUTION.md`](CONSTITUTION.md) is the **primary authority** for this project. It defines the search UI, all update dialog flows, API environment config, status display rules, Angular component constraints, and the TDD convention. Read it first before making any changes to the merchant catalog or display layer.

## Reference Documents

All conventions referenced below live in `docs/reference/`. Read the relevant file before making changes in that area.

| Topic | File |
|---|---|
| User-facing display formats (dates, nulls) | [`docs/reference/user-display.md`](docs/reference/user-display.md) |

## Key Rules

### Dates
Every raw date value (ISO 8601 string, `Date` object) shown to a user **must** go through `DisplayDatePipe`.  
See → [`docs/reference/user-display.md`](docs/reference/user-display.md)

### Angular Components
All components are standalone. Import pipes, directives, and modules explicitly in each component's `imports` array — no shared NgModule.

### TDD
All production code follows Red → Green → Refactor. Write the failing test first, then the minimum implementation.  
See → [CONSTITUTION.md §IX](CONSTITUTION.md#ix-test-driven-development)

- Unit/integration specs: `src/app/**/*.spec.ts` — `TestBed` + `HttpTestingController`.
- Contract specs: `src/contract-tests/**/*.spec.ts` — live HTTP, separate CI step.
- Never use `HttpClient` directly in tests; never stub it manually.

### API Layer
- Product activation/deactivation uses `DELETE /products/{id}` (soft-delete), not the PUT payload.
- Never assume an API field updates via FormData unless confirmed; prefer typed JSON request bodies where possible.

### Web Storefront
The public storefront is a second Angular app in this repo: `projects/blitz-pay-web/` (project name `blitz-pay-web`). Domain language lives in [`projects/blitz-pay-web/CONTEXT.md`](projects/blitz-pay-web/CONTEXT.md); see also [`CONTEXT-MAP.md`](CONTEXT-MAP.md) and [ADR-0007](docs/adr/0007-storefront-separate-deployment.md).

| | Admin dashboard | Web Storefront |
|---|---|---|
| Source | `src/` | `projects/blitz-pay-web/src/` |
| Run | `npm start` → `localhost:4200` | `npm run start:storefront -- --port 4201` → `localhost:4201` |
| Test / build | `npm test`, `npm run build` | `npm run test:storefront`, `npm run build:storefront` |
| Image | `Dockerfile` | `Dockerfile.storefront` (nginx: `nginx/storefront.conf`, proxies `/v1/` to the staging API) |
| Manifests | `k8s/` | `k8s/storefront/` |
| Staging host | `admin.zackpay.de` | `storefront.zackpay.de` |

Use port 4201 for the storefront locally — the admin's `local` environment `storefrontUrl` points there.

### Releases & Deploys
- Both apps share one release. Publishing a GitHub Release `vX.Y.Z` triggers `.github/workflows/cd-release.yml`, which verifies CI passed for the tagged commit, builds both images with that tag, and deploys both to `blitzpay-staging`.
- Pushing to `main` only runs CI; it does not deploy.
- To redeploy one app with an existing tag, run `cd-deploy-k8s.yml` manually. For the storefront pass `image_repository=ghcr.io/elegant-software/blitzpay-admin-dashboard/blitz-pay-web` and `manifests_dir=k8s/storefront`; the defaults deploy the admin.

### Changing Domains / URLs
A host change (API, auth, the dashboard's or the storefront's own domain) spans repos. Update all of these together:
- **Dashboard**: `src/environments/*.ts` (`authorityUrl`, `apiBaseUrls`), `src/app/services/merchant-environment.service.ts` (`baseUrl`, `storefrontUrl`) and its spec, `nginx/storefront.conf`, `k8s/ingress.yaml`, `k8s/storefront/ingress.yaml`.
- **DNS**: every new host needs a Cloudflare record before deploying, or cert-manager cannot issue its TLS certificate.
- **Backend CORS** (`blitz-pay` repo): `config.frontendOrigin` in `helm/blitz-pay/values-*.yaml` and `FRONTEND_ORIGIN` in `infra/lib/app-stack.ts` must equal the dashboard's public origin, or every API call fails CORS.
- **Keycloak**: the `blitzpay-admin-dashboard` client's Valid Redirect URIs and Web Origins must include the dashboard origin.

Verify CORS before shipping. Expect `200` with a matching `access-control-allow-origin`:
```bash
curl -s -o /dev/null -D - -X OPTIONS https://<api-host>/v1/merchants \
  -H "Origin: https://<dashboard-host>" -H "Access-Control-Request-Method: GET" | grep -i "^HTTP\|allow-origin"
```

## Project Layout

```
src/app/
├── pipes/          ← shared standalone pipes (DisplayDatePipe, etc.)
├── models/         ← TypeScript interfaces for API responses
├── services/       ← HttpClient wrappers
└── merchant-catalog/
projects/
└── blitz-pay-web/  ← Web Storefront app (see "Web Storefront" above)
k8s/                ← admin manifests; k8s/storefront/ for the storefront
docs/
├── adr/            ← architecture decisions
└── reference/      ← canonical display and behaviour conventions
specs/              ← per-feature plans and research
```
