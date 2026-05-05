# Quickstart: Branch and Product Table Controls

## Prerequisites

- Node.js/npm compatible with the existing Angular 20 project
- Dependencies installed with `npm install`
- Access to a merchant record that has multiple branches and at least one branch with many products

## Planned Setup

1. Install `primeng@20.4.0` and its Angular-20-compatible companion dependencies if the implementation confirms PrimeNG.
2. Start the Angular app.
3. Open the merchant catalog workspace.
4. Search for a known merchant ID.

## Validate The Planned Feature

1. Confirm the page still auto-selects the first branch after merchant load.
2. Confirm the branches card shows filter and pagination controls when branch data is present.
3. Enter a branch filter that matches a known branch name, country, city, or zipcode and verify only matching branch rows remain visible.
4. Clear the branch filter and verify the full branch list returns.
5. Sort the branches table by branch name in both directions and verify filtering and page state still behave correctly.
6. Move to a later branch-results page and verify branch selection still works from that page.
7. Confirm the products card shows the selected branch name plus its own filter, sorting, and pagination controls.
8. Enter a product filter that matches a known product code, category, or name and verify only matching products for the selected branch remain visible.
9. Sort products by name, product code, and category in both directions and verify filtering and page state still behave correctly.
10. Change the selected branch and verify the products table clears stale rows, reloads, and shows the new branch scope.
11. Apply a product filter that returns no rows and verify the table explains that no products match the current filters.
12. Change page size in each table and verify page counts and visible ranges update correctly without affecting the other table.
13. Open branch and product edit actions from paged, filtered, and sorted rows to confirm action entry points remain intact.

## Build Check

```bash
npm run build
```

## Notes

- The current APIs already return the data needed for local table paging and filtering, so no backend contract changes are planned.
- PrimeNG 20.4.0 is the expected implementation path if the team proceeds with the researched open-source option because it is the latest PrimeNG release compatible with Angular 20, unlike the current PrimeNG 21.x line.
