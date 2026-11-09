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
- Catalog reads (products, product categories) always pass an explicit `language`. Edit forms pin it to the merchant's `originalMenuLanguage`; otherwise the browser's `Accept-Language` can return a translation, and saving would overwrite the original text with it. Views use the chosen **Catalog Language**. Translations are edited only through the `/translations` endpoints.

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

Catalog browsing uses the backend #224 paginated APIs: `/catalog/categories` for branch counts and
`/catalog/products` for 24-item pages with opaque cursors. These reads must remain anonymous; inactive
products and thumbnail backfill stay protected. Lists prefer `thumbnailUrl`, while Product Overview
keeps `imageUrl`. Cache entries include merchant, branch, language, category and cursor. Catalog-wide
text search loads complete metadata only on demand; guest checkout keeps its existing full-catalog
revalidation. Backend PR #225 and its anonymous-read follow-up are required before deployment.

### Releases & Deploys
- Both apps share one release. Publishing a GitHub Release `vX.Y.Z` triggers `.github/workflows/cd-release.yml`, which verifies CI passed for the tagged commit, builds both images with that tag, and deploys both to `blitzpay-staging`.
- Pushing to `main` only runs CI; it does not deploy.
- To redeploy one app with an existing tag, run `cd-deploy-k8s.yml` manually. Pick `app` = `admin` or `storefront`.

### Changing Domains / URLs
No hostname is hardcoded here. In Kubernetes they all derive from `global.baseDomain` in the `blitz-pay` repo's `helm/blitz-pay/values-<env>.yaml`; that chart publishes them in the `blitzpay-domains` ConfigMap, and this repo only reads it:
- **Ingresses** (`k8s/ingress.yaml`, `k8s/storefront/ingress.yaml`) use `${ADMIN_HOST}` / `${STOREFRONT_HOST}`, filled in by `cd-deploy-k8s.yml` at deploy time.
- **Admin app** reads `window.__BLITZPAY_CONFIG__` (`apiHost`, `authHost`, `storefrontHost`) via `src/environments/runtime-config.ts`. `docker/write-config.sh` rewrites `config.js` at container start from the ConfigMap; `public/config.js` is only the local-dev/test default.
- **Storefront** nginx proxies `/v1/` to `${API_HOST}` (`nginx/storefront.conf` is an nginx template).

Never put a hostname back into `src/`, `nginx/` or `k8s/`. To change the domain, follow `reference/domain-configuration.md` in the `blitz-pay` repo: DNS and the Keycloak client's redirect URIs/web origins are manual, then deploy the backend first and this repo second. The AWS build keeps its own `api.zackpay.de` in `environment.aws-staging.ts`.

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
