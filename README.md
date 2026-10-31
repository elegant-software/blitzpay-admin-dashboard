# BlitzPay Admin Dashboard (Angular + CoreUI)

This repository contains an **Angular admin dashboard** built with CoreUI styles/components, including merchant onboarding and a merchant catalog workspace.

## Related Repositories

| Repository | Description |
|---|---|
| blitz-pay (backend) | Spring Boot / Kotlin backend — payments, merchants, orders |
| blitzpay-admin-dashboard | Angular admin dashboard |
| blitz-pay-merchant | React Native merchant app |
| blitz-pay (shopper app) | React Native shopper app |

## What is implemented

- CoreUI-styled sidebar navigation for onboarding operations, compliance, risk management, and merchant catalog management.
- Merchant Catalog workspace with:
  - environment selection (`local` / `staging`) and API version controls
  - direct merchant lookup and nearby merchant search
  - merchant summary and logo storage-key update
  - merchant location save/remove controls
  - branch list/create and branch detail loading
  - product list/filter/create/update/soft-remove with optional image file input

- Merchant onboarding workspace with:
  - step summary cards
  - tabbed onboarding sections
- verification checklist and progress bar
- Data-capture sections for:
  - Business Profile
  - Legal & Ownership (including UBO)
  - Settlement & Banking
  - Risk Controls

## Start the app

### 1) Open terminal in the correct folder

Make sure you are in the project root (the folder that contains `package.json`):

```bash
cd /path/to/blitzpay-admin-dashboard
```

Optional check:

```bash
ls package.json
```

### 2) Install dependencies

```bash
npm install
```

### 3) Run the Angular dev server

```bash
npm start
```

Then open:

- `http://localhost:4200`

## Build for production

```bash
npm run build
```

Build output is generated in:

- `dist/blitzpay-admin-dashboard`

## Web Storefront

This repository also contains the public customer-facing storefront, `projects/blitz-pay-web/` (branch catalog, cart, and guest checkout).

```bash
npm run start:storefront -- --port 4201   # http://localhost:4201
npm run test:storefront
npm run build:storefront                  # output: dist/blitz-pay-web
```

## Deployment

| App | Staging URL | Image | Manifests |
|---|---|---|---|
| Admin dashboard | https://admin.zackpay.de | `Dockerfile` | `k8s/` |
| Web Storefront | https://storefront.zackpay.de | `Dockerfile.storefront` | `k8s/storefront/` |

Both apps are released together: publishing a GitHub Release `vX.Y.Z` runs `cd-release.yml`, which builds both images and deploys them to the `blitzpay-staging` namespace. Pushing to `main` only runs CI. To redeploy a single app with an existing tag, run the **CD · Deploy to Kubernetes** workflow manually.

## Troubleshooting

### `npm ERR! enoent Could not read package.json`

This error means npm is running in the wrong directory.

1. Go to the project root:

```bash
cd /path/to/blitzpay-admin-dashboard
```

2. Confirm `package.json` exists:

```bash
ls -la package.json
```

3. Re-run install/start:

```bash
npm install
npm start
```

If you still see ENOENT, verify the repository was fully copied/cloned and that `package.json` is present in the root.

## Project structure

- `src/app/app.component.ts` / `src/app/app.component.html`: onboarding UI and menu workflow.
- `src/styles.css`: shared styles and layout tweaks.
- `angular.json`: Angular workspace/build configuration with CoreUI stylesheet.


## Merchant Catalog notes

- APIs are expected at `http://localhost:8080/{version}` (local) or `https://api-blitzpay-staging.zackpay.de/{version}` (staging).
- Product create/update requests are sent as multipart form data.
- Branch secret fields are entered for creation but are cleared from UI form state after save.
