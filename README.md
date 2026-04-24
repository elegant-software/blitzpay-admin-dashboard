# BlitzPay Admin Dashboard (Angular + CoreUI)

This repository contains an **Angular admin dashboard** built with CoreUI styles/components, including merchant onboarding and a merchant catalog workspace.

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

- APIs are expected at `http://localhost:8080/{version}` (local) or `https://api-blitzpay-staging.elegantsoftware.de/{version}` (staging).
- Product create/update requests are sent as multipart form data.
- Branch secret fields are entered for creation but are cleared from UI form state after save.
