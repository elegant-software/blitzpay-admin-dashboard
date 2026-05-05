# Research: Branch and Product Table Controls

## Decision: Use PrimeNG 20.4.0 table components for pagination, filtering, and page reporting

**Rationale**: The current merchant catalog renders hand-built HTML tables with custom styling but no reusable table-state behavior. PrimeNG's official table and paginator documentation already cover built-in pagination, per-column or global filtering, current-page reporting, and accessible sortable headers. Current npm metadata shows the latest PrimeNG overall release is 21.1.6, but that line targets Angular 21 peer dependencies. The latest Angular-20-compatible PrimeNG line is 20.4.0, which matches this repository's Angular 20 dependency range. That makes PrimeNG 20.4.0 the lowest-friction popular open-source choice for this codebase if the team wants a maintained component instead of building table controls from scratch.

**Alternatives considered**:

- Keep the current plain tables and build custom pagination/filter controls: rejected because it creates avoidable UI state, accessibility, and interaction work for a common solved problem.
- Angular Material table stack: rejected for this feature because it would introduce a second visual/component system into a CoreUI-based admin and still require more custom filtering wiring than the PrimeNG table provides out of the box.
- PrimeNG 21.x: rejected because its published peer dependency range targets Angular 21, while this project is on Angular 20.

## Decision: Apply filtering and pagination client-side on already-fetched branch and product lists

**Rationale**: The existing `MerchantApiService` already fetches all branches for a merchant and all products for the selected branch, and the current requirements do not add backend endpoints for server-side pagination or search. Client-side filtering and paging keeps the feature self-contained, avoids backend contract changes, and matches the expected row volumes in the spec's success criteria.

**Alternatives considered**:

- Add server-side pagination and filtering parameters to branch and product APIs: rejected because the current scope is UI-only and would create backend dependency and coordination work.
- Fetch all products for all branches and filter globally: rejected because the constitution and current UX both scope products to the selected branch.

## Decision: Keep independent table state for branches and products

**Rationale**: The branches table drives branch selection, while the products table depends on the selected branch and has different search fields and row counts. Independent filter text, page size, current page, and empty-state messaging prevent one table's controls from resetting or confusing the other table's workflow.

**Alternatives considered**:

- One shared search box for both tables: rejected because branch discovery and product discovery are separate tasks with different matching fields.
- One shared page-size setting across both tables: rejected because branch lists and product lists can have very different useful densities.

## Decision: Use client-side sorting on a constrained set of columns

**Rationale**: The clarified specification only requires sorting for branch name and for product name, product code, and category. Those values are already present in the loaded branch/product lists, so client-side sorting keeps behavior predictable, avoids backend changes, and integrates cleanly with local filtering and pagination state.

**Alternatives considered**:

- Server-side sorting parameters: rejected because the current scope is UI-only and the required columns are already available locally.
- Sorting every visible column: rejected because the clarified requirement is narrower and limiting sort controls avoids extra UI noise.

## Decision: Reset product-table state on branch changes and keep branch selection behavior intact

**Rationale**: The constitution explicitly states that clicking a branch row reloads branch-scoped products and that the first branch is auto-selected after merchant load. Product filtering and pagination therefore must not outlive a branch change in a way that shows stale rows or leaves the user on an invalid page. Resetting or normalizing product-table state on branch change preserves current mental models and avoids false empty states.

**Alternatives considered**:

- Persist the prior product filter and page across branch changes: rejected because it can easily produce misleading empty results when the new branch has different products.
- Remove automatic first-branch selection: rejected because it would change established merchant catalog behavior beyond this feature's scope.

## Decision: Preserve the existing two-card layout and layer controls into each card header/body

**Rationale**: The current constitution fixes the merchant catalog's overall layout, with branches in `col-lg-5` and products in `col-lg-7`. Adding compact controls inside each table card preserves that layout while improving discoverability. This also limits the implementation footprint to the merchant-catalog feature instead of forcing shell or page-level redesign.

**Alternatives considered**:

- Move filtering into a global page toolbar: rejected because the controls are table-specific and would weaken the connection between the filter and the affected data set.
- Replace the two-card layout with a single merged data grid: rejected because the existing branch-to-product drill-down is a core workflow and should remain visible.
