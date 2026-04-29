# Quickstart: Payment Operations Dashboard

## Prerequisites

- Node.js/npm compatible with the existing Angular 20 project
- Dependencies installed with `npm install`
- No backend is required for the first dashboard redesign pass because the feature uses mock data

## Run The App

```bash
npm start
```

Open:

```text
http://localhost:4200
```

## Validate The Planned Feature

1. Sign in to the admin dashboard and land in the authenticated shell.
2. Confirm the default `Dashboard` section presents an operations-focused overview rather than generic sample analytics.
3. Verify the dashboard clearly indicates that the view is powered by mock/sample data.
4. Confirm the top summary area shows merchants, branches, products, transactions, online activity, and mobile activity.
5. Select a merchant and verify the branch, product, transaction, and channel sections update in the same page context.
6. Confirm merchants, branches, and products with non-active statuses remain visible and clearly labeled.
7. Verify at least one merchant with multiple branches renders all branches in the branch context area.
8. Verify a branch with multiple products renders all products, including inactive products.
9. Confirm the transaction section shows payment outcomes and amount context tied to the selected merchant or branch.
10. Confirm the online/mobile comparison area still renders correctly when one channel has no activity.
11. Resize to a mobile-sized viewport and verify the overview, context, and activity sections remain understandable in a stacked layout.
12. Navigate to the `Merchants` section and confirm the existing merchant catalog still opens for detail operations.

## Build Check

```bash
npm run build
```

## Notes

- This plan intentionally separates the shell-level operations dashboard from the detailed merchant catalog workflow.
- Mock data should be isolated in a dedicated feature service so it can later be swapped for live data without rewriting the dashboard layout.
- All user-visible timestamps in the redesigned dashboard must be formatted with `DisplayDatePipe`.
- The implemented dashboard mounts inside the authenticated shell's default `Dashboard` section, while the `Merchants` section continues to host the existing merchant catalog workspace.
