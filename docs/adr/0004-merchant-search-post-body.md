# ADR 0004: Merchant Search Uses POST with a JSON Body

## Status

Accepted

## Date

2026-05-26

## Context

The Merchant Search endpoint needs to accept a free-text query, multi-value enum filters (business types, merchant mobilities, statuses), and pagination params. The conventional REST approach is `GET /merchants?q=...&businessType=FOOD_BEVERAGE` with query parameters.

Two problems arise with GET query params as the filter set grows:

1. **Multi-value filters become noisy.** Filtering by multiple business types requires repeated params: `businessType=FOOD_BEVERAGE&businessType=RETAIL&businessType=PHARMACY`. This is legal HTTP but ugly and error-prone to construct and parse.
2. **URL length limits.** While not an immediate concern, adding more filter dimensions (status, operating country, date ranges) in future iterations pushes towards URL length limits in some browsers and proxies (practical limit ~2 KB).

The alternative is `POST /merchants/search` with a structured JSON body.

## Decision

Merchant Search uses **`POST /merchants/search`** with a JSON request body:

```json
{
  "q": "berlin",
  "businessTypes": ["FOOD_BEVERAGE", "RETAIL"],
  "merchantMobilities": ["MOBILE"],
  "statuses": ["ACTIVE", "MONITORING"],
  "page": 0,
  "size": 50
}
```

All fields are optional. An empty body `{}` returns the 50 most recently updated merchants.

## Consequences

### Positive

- Multi-value filters are expressed cleanly as arrays.
- Adding new filter dimensions in future requires no URL redesign — just a new field in the body.
- No practical length constraint on the query.

### Negative

- POST is not idempotent by HTTP convention, so the response cannot be HTTP-cached by intermediaries. For an internal admin tool this is acceptable — the results change as merchant data changes, so caching would need short TTLs anyway.
- Search URLs cannot be bookmarked or shared. Accepted — this is an internal ops tool, not a public search page.

## Alternatives Considered

**GET with repeated query params**: rejected because multi-value filters accumulate quickly and hit URL length limits when more filter dimensions are added.

**GET with a single JSON-encoded `filter` param** (e.g. `?filter={"businessTypes":["FOOD_BEVERAGE"]}`): rejected — URL-encoding nested JSON is unreadable and fragile across HTTP clients.
