# ADR 0003: Merchant Search Query (`q`) Is Optional

## Status

Accepted

## Date

2026-05-26

## Context

The Merchant Search endpoint (`GET /merchants`) accepts a free-text query `q` plus optional enum filters (`businessType`, `merchantMobility`). A design question arose: should `q` be required (forcing admins to always type something) or optional (allowing filter-only searches)?

A filter-only request — e.g. `GET /merchants?merchantMobility=MOBILE` — is a full-table scan on the `merchant_applications` table joined to branches and products, with no text predicate to limit the scan. This was flagged as a potential performance concern.

## Decision

`q` is **optional**. Filter-only searches are valid and will execute without a text query.

The rationale:

1. **Legitimate ops use case.** "Show me all MOBILE merchants" or "show me all merchants in FOOD_BEVERAGE" are genuine admin queries. Blocking them forces admins to type a meaningless wildcard query just to satisfy a requirement.
2. **Results are paginated at 50.** Even a full-table scan returns at most 50 rows to the client. The DB work is bounded by the result set size and available indexes.
3. **Indexes will be added on the filter columns.** `merchant_mobility` and `business_type` are low-cardinality columns that index cheaply. A filter-only query with a good index is fast regardless of table size.

## Consequences

### Positive

- Admins can browse merchants by type without knowing any name or code.
- The API is consistent — no special-casing required for "empty query" vs "no query".

### Negative

- A request with no `q` and no filters (completely empty search) would return the 50 most recently updated merchants. This is allowed but should be documented as a "list recent merchants" behaviour rather than a search.
- Backend must ensure indexes exist on `merchant_mobility` and `business_type` before this goes to production to avoid full sequential scans.
