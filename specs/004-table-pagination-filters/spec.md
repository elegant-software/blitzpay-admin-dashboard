# Feature Specification: Branch and Product Table Controls

**Feature Branch**: `[004-table-pagination-filters]`  
**Created**: 2026-05-05  
**Status**: Draft  
**Input**: User description: "I need pagination and filter for product and branches table do your own reasearch and make use of exiting open surce and popular components like PrimeNG for this purpose"

## Clarifications

### Session 2026-05-05

- Q: Which table columns require sorting and which fields must filters use? → A: Sort by branch name and by product name, product code, and category; filter branches by name, country, city, or zipcode, and products by product code, category, or name.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Find the Right Branch Faster (Priority: P1)

An admin reviewing a merchant can narrow the branches table with filters and move through branch results in pages so they can find the right branch without scanning a long unstructured list.

**Why this priority**: Branch selection drives the product table, so faster branch discovery improves the main merchant-catalog workflow immediately.

**Independent Test**: Can be fully tested by loading a merchant with many branches, applying filters, moving between pages, and selecting a matching branch from the filtered results.

**Acceptance Scenarios**:

1. **Given** a merchant has more branches than fit comfortably in one view, **When** the admin opens the merchant record, **Then** the branches area shows paged results instead of one long list.
2. **Given** the admin enters a branch filter value, **When** matching branches exist, **Then** the branches table shows only matching rows and updates the visible result count.
3. **Given** the admin is viewing filtered branch results, **When** they clear the filters, **Then** the full branch list returns and the current selection remains valid if it is still available.
4. **Given** the admin clicks the branch name column header, **When** branch rows are visible, **Then** the table sorts rows by branch name and lets the admin reverse the sort direction.

---

### User Story 2 - Find the Right Product Within the Selected Branch (Priority: P2)

An admin working within a selected branch can filter and page through products so they can quickly find a specific product to review or edit.

**Why this priority**: Product tables can grow quickly and are used for edit workflows, so filtering and paging reduce operational effort and misclick risk.

**Independent Test**: Can be fully tested by selecting a branch with many products, applying product filters, moving between pages, and opening the expected product from the filtered result set.

**Acceptance Scenarios**:

1. **Given** a branch has many products, **When** the admin views the products table, **Then** the table presents paged results with clear page navigation and current-range feedback.
2. **Given** the admin enters one or more product filter values, **When** products match those criteria, **Then** the table shows only matching products for the currently selected branch.
3. **Given** the admin changes the selected branch, **When** the new branch loads, **Then** the product table refreshes for that branch and does not keep stale results from the previously selected branch.
4. **Given** the admin clicks the product name, product code, or category column header, **When** product rows are visible, **Then** the table sorts rows by that column and lets the admin reverse the sort direction.

---

### User Story 3 - Recover Quickly From Empty or Narrowed Results (Priority: P3)

An admin who filters too narrowly can understand why no rows are shown and can recover quickly by changing or clearing filters without losing context.

**Why this priority**: Empty states and recovery actions prevent the new controls from making the catalog harder to use when data is sparse or filters are too restrictive.

**Independent Test**: Can be fully tested by applying filters that return no rows, confirming the table explains the empty result, and using a clear action to return to normal results.

**Acceptance Scenarios**:

1. **Given** filters remove all rows from the branches or products table, **When** the empty state is shown, **Then** the table explains that no results match the current filters.
2. **Given** the admin is on a later page and changes a filter, **When** the filtered result set becomes smaller, **Then** the table returns the admin to a valid page automatically.
3. **Given** the admin clears all filters, **When** data exists for the current merchant and branch context, **Then** the table restores the default result view without requiring a new merchant search.

### Edge Cases

- A merchant has fewer rows than the default page size, so pagination controls should not create confusion or wasted space.
- A filter returns zero results for branches or products.
- The selected branch is not present in the currently filtered branch rows, but still exists in the merchant data.
- A branch change occurs while a product filter is active.
- A merchant has no branches, or a selected branch has no products, before any filters are applied.
- The admin changes page size after already navigating to a later page.
- Data reloads after an edit, delete, or refresh and changes the total number of available rows.
- Filter values contain mixed case, extra spaces, or partial text.
- Sorting is changed while filters are active or while the admin is on a later page of results.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The merchant catalog MUST provide pagination controls for the branches table when branch results are available.
- **FR-002**: The merchant catalog MUST provide pagination controls for the products table when product results are available for the selected branch.
- **FR-003**: Admin users MUST be able to filter branches by branch name, country, city, and zipcode values shown in the table.
- **FR-004**: Admin users MUST be able to filter products by product code, category, and product name values shown in the table.
- **FR-005**: The branches table MUST update its visible row count, current page, and empty state based on the active filters.
- **FR-006**: The products table MUST update its visible row count, current page, and empty state based on the active filters and the currently selected branch.
- **FR-007**: The products table MUST remain scoped to the currently selected branch and MUST refresh when branch selection changes.
- **FR-008**: The system MUST reset each table to a valid page whenever filtering, page-size changes, or data refreshes would otherwise leave the user on an out-of-range page.
- **FR-009**: The system MUST provide a clear way to remove active filters independently for the branches table and the products table.
- **FR-010**: The system MUST distinguish between "no data exists" and "no results match the current filters" in both tables.
- **FR-011**: The branches table MUST preserve row selection behavior so that selecting a visible branch still drives product loading exactly as it does today.
- **FR-012**: The system MUST keep branch and product edit actions available from paged and filtered results without changing existing edit permissions or confirmation behavior.
- **FR-013**: The system MUST preserve the current merchant search context while admins page, filter, clear filters, and switch between branch-result pages and product-result pages.
- **FR-014**: The system MUST show loading feedback when branch or product data is being refreshed and MUST not display stale product rows from a previously selected branch after the new branch load starts.
- **FR-015**: The system MUST make the pagination and filtering controls usable on common admin laptop and desktop widths without hiding essential table actions.
- **FR-016**: Admin users MUST be able to sort the branches table by branch name in ascending or descending order.
- **FR-017**: Admin users MUST be able to sort the products table by product name, product code, and category in ascending or descending order.
- **FR-018**: Sorting MUST work together with active filters and pagination without leaving the user on an invalid page.

### Key Entities

- **Branch Table View**: The merchant-scoped branch result set as presented to the admin, including the full result list, visible filtered rows, current page, and current selection.
- **Product Table View**: The selected-branch product result set as presented to the admin, including the full result list, visible filtered rows, and current page.
- **Table Filter State**: The active criteria applied to a table to narrow visible rows and the clear/reset behavior associated with those criteria.
- **Pagination State**: The current page, page size, total visible row count, and navigation state for a table.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Admin users can locate a target branch in a merchant with 25 or more branches in under 20 seconds during moderated testing.
- **SC-002**: Admin users can locate a target product in a branch with 50 or more products in under 30 seconds during moderated testing.
- **SC-003**: 90% of tested users can recover from an over-restrictive filter and return to a valid result set on their first attempt.
- **SC-004**: 100% of tested branch changes replace the product result set with data from the newly selected branch without showing stale rows from the prior branch.
- **SC-005**: 95% of tested filter and page changes update the visible table state within 1 second after data is already loaded in the browser.

## Assumptions

- The current merchant lookup flow, automatic first-branch selection, and branch-driven product loading remain in scope and should not be redesigned by this feature.
- Pagination and filtering apply only to the branches and products tables on the merchant catalog page; merchant search behavior itself is unchanged.
- Filtering uses the data already shown in each table and does not require new backend search endpoints for the first release.
- Default page sizes can be chosen during planning as long as they support efficient scanning and can be changed by the admin.
- Existing edit, delete, loading, and empty-state behaviors remain in place and are enhanced rather than replaced.
- The implementation approach may reuse an established admin table pattern or open-source component library during planning, provided the user-facing behavior in this specification is met.
