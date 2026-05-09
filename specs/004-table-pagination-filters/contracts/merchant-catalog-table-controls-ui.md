# UI Contract: Merchant Catalog Table Controls

This contract defines the admin-facing behavior for pagination, filtering, and sorting in the merchant catalog's branches, product categories, and products tables.

## Entry Conditions

- The admin has already loaded a merchant in the merchant catalog.
- The first available branch is still auto-selected after merchant load.
- The product categories table remains scoped to the selected merchant.
- The products table remains scoped to the selected branch.

## Branches Table

Display:

- The table remains in the left-side branch card of the merchant catalog layout.
- The card shows the total branch count and the visible branch count when filters are active.
- The table continues to show branch name, city, address, status, and branch actions.

Controls:

- A branch filter input is available within the branches card.
- A branch-name sort control is available from the branch name column header.
- Pagination controls are available when branch rows exceed the active page size.
- The admin can change page size from predefined options.
- A clear-filters action resets the branch table to its default view.

Behavior:

- Filtering matches branch name, country, city, and zipcode values shown in the table.
- Sorting applies only to branch name and supports ascending and descending order.
- Filtered results update the visible count and current page report immediately after the local branch list is loaded.
- Clicking a visible branch row still selects that branch and drives product loading.
- If the selected branch is filtered out of view, the selection remains valid in data state until the admin chooses another visible branch or clears filters.
- Editing or deleting a branch from a paged or filtered result keeps the action available from that row context.

Empty states:

- No branch data: `No branches for this merchant.`
- Filtered to zero rows: message explains that no branches match the current filters.

## Product Categories Table

Display:

- The table remains in the right-side merchant-catalog column above the products card.
- The card shows the total category count and the visible category count when filters are active.
- The table continues to show category name, updated timestamp, and row actions.

Controls:

- A category filter input is available within the product categories card.
- A category-name sort control is available from the category name column header.
- Pagination controls are available when category rows exceed the active page size.
- The admin can change page size from the same predefined options used by the branches and products tables.
- A clear-filters action resets the categories table to its default merchant-scoped view.

Behavior:

- Filtering matches category name values shown in the table.
- Sorting applies only to category name and supports ascending and descending order.
- Category filtering, sorting, and pagination apply only to the currently loaded merchant-scoped category list.
- Category table state is independent from the branch-driven products table state.
- When merchant selection changes, the categories table resets to its default state for the newly loaded merchant.
- After create, rename, or delete, active category filtering and sorting remain in place, while pagination is normalized only if the current page becomes invalid.
- If a renamed category no longer matches the active filter, it disappears from the current filtered result immediately after save.
- Editing or deleting a category from a paged or filtered result keeps the action available from that row context.

Empty states:

- No category data: `No product categories for this merchant.`
- Filtered to zero rows: message explains that no product categories match the current filters.

## Products Table

Display:

- The table remains in the right-side products card of the merchant catalog layout.
- The card shows the current branch scope and the visible product count.
- The table continues to show image, name/description, product code, category, status, and row actions.

Controls:

- A product filter input is available within the products card.
- Product sort controls are available from the product name, product code, and category column headers.
- Pagination controls are available when product rows exceed the active page size.
- The admin can change page size from predefined options independent of the branches table.
- A clear-filters action resets the products table to its default view for the selected branch.

Behavior:

- Filtering matches product code, category, and product name values shown in the table.
- Sorting applies only to product name, product code, and category and supports ascending and descending order.
- Product filtering only applies to the currently selected branch's loaded products.
- When branch selection changes, the products table enters a loading state and must not show stale rows from the prior branch.
- When the new branch data arrives, the products table shows the new branch scope, normalizes page state, and applies the default product-table view.
- Editing a product from a paged or filtered result keeps the existing product dialog entry point.

Empty states:

- No branch selected: `Select a branch to load products.`
- Selected branch has no products: `No products for the selected branch.`
- Filtered to zero rows: message explains that no products match the current filters.

## Page-State Rules

- Changing filters resets the affected table to a valid page if the current page is out of range.
- Changing sorting keeps the affected table on a valid page and reorders only the currently relevant result set.
- Changing page size recalculates the current page for the affected table only.
- Table refresh after create, update, or delete keeps the admin on a valid page and updates counts accordingly.

## Loading And Error Rules

- Existing loading feedback for merchant, branch, and product fetches remains in place.
- Filtering itself works on already-loaded rows and should not require extra backend requests.
- Service failures still surface through the page's existing error messaging pattern.

## Non-Goals

- No change to merchant search behavior.
- No change to backend API contracts for merchant-scoped category browsing.
- No change to backend API contracts for branch or product search.
- No merged cross-table search across branches, product categories, and products.
