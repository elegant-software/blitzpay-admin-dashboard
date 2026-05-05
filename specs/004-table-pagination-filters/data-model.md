# Data Model: Branch and Product Table Controls

## Branch Table View

Represents the merchant-scoped branch result set as the admin experiences it on the page.

**Fields**:

- `rows`: full branch list returned for the selected merchant
- `visibleRows`: branch rows remaining after branch filters are applied
- `selectedBranchId`: currently selected branch identifier
- `totalRows`: number of loaded branch rows before filtering
- `visibleRowCount`: number of rows after filtering
- `sortField`: current branch sort key, limited to branch name
- `sortDirection`: ascending or descending
- `emptyStateKind`: `no-data` or `no-filter-results`

**Validation**:

- `selectedBranchId` may refer only to a loaded branch row.
- `visibleRowCount` must match the filtered result set.
- `sortField` may only target the branch name column.

**State transitions**:

- `idle` -> `loaded`: merchant load succeeds and branches are available.
- `loaded` -> `filtered`: admin applies branch filter criteria.
- `loaded|filtered` -> `sorted`: admin changes branch-name sort direction.
- `filtered` -> `loaded`: admin clears branch filters.
- `loaded|filtered` -> `reloaded`: branch data refreshes after edit or delete.

## Product Table View

Represents the product result set scoped to the currently selected branch.

**Fields**:

- `branchId`: selected branch that owns the current product list
- `rows`: full product list returned for the selected branch
- `visibleRows`: product rows remaining after product filters are applied
- `totalRows`: number of loaded product rows before filtering
- `visibleRowCount`: number of rows after filtering
- `sortField`: current product sort key, limited to product name, product code, or category
- `sortDirection`: ascending or descending
- `emptyStateKind`: `no-branch-selected`, `no-data`, or `no-filter-results`

**Validation**:

- Product rows must belong to the currently selected branch context.
- When `branchId` changes, prior visible rows must not remain rendered.
- `sortField` may only target product name, product code, or category.

**State transitions**:

- `empty` -> `loading`: a branch is selected and product fetch begins.
- `loading` -> `loaded`: product fetch succeeds.
- `loaded` -> `filtered`: admin applies product filter criteria.
- `loaded|filtered` -> `sorted`: admin changes product sort field or direction.
- `filtered` -> `loaded`: admin clears product filters.
- `loaded|filtered` -> `loading`: selected branch changes or product data refreshes.

## Branch Filter State

Represents the active search criteria for the branches table.

**Fields**:

- `query`: free-text filter entered by the admin
- `matchFields`: branch fields included in matching, such as name, city, and address text
- `hasActiveFilters`: whether the branch table is currently narrowed

**Validation**:

- Filtering should ignore case-only differences.
- Leading and trailing whitespace should not change matching intent.

## Product Filter State

Represents the active search criteria for the products table.

**Fields**:

- `query`: free-text filter entered by the admin
- `matchFields`: product fields included in matching, such as name, code, category, and description
- `hasActiveFilters`: whether the product table is currently narrowed

**Validation**:

- Filtering must stay inside the currently selected branch scope.
- Query normalization should treat case and incidental spacing consistently.

## Pagination State

Represents the paging controls for either table.

**Fields**:

- `pageIndex`: zero-based or one-based current page representation chosen by implementation
- `pageSize`: active number of rows shown per page
- `pageSizeOptions`: allowed rows-per-page choices
- `totalVisibleRows`: rows remaining after filters
- `pageStartRow`: first visible row number in the current page
- `pageEndRow`: last visible row number in the current page

**Validation**:

- `pageIndex` must remain within the valid range for `totalVisibleRows`.
- `pageEndRow` must not exceed `totalVisibleRows`.
- Changing filters, data, or page size must normalize invalid page positions automatically.

## Sorting State

Represents the active sort applied to either table.

**Fields**:

- `field`: current sortable column key
- `direction`: ascending or descending

**Validation**:

- Sorting must be applied after filtering and before pagination.
- Changing sorting must keep the table on a valid page.

## Table Interaction Summary

Defines the relationship between the branch and product table states.

**Rules**:

- Branch selection is authoritative for product loading.
- Branch filtering must not break edit actions or row selection.
- Product filtering and pagination are reset or normalized whenever branch context changes.
- Sorting must compose with active filters and pagination without stale or contradictory row order.
- Both tables keep independent control state so one table's filter and paging actions do not mutate the other table's controls.
