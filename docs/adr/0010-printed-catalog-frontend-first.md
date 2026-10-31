# ADR-0010: Printed Catalog composed in the admin front end, backend move planned

**Status:** Accepted

**Date:** 2026-10-31

## Context

A **Printed Catalog** (see `CONTEXT.md`) is a paper version of one Branch's Web Catalog in two layouts: **Full Catalog** and **Category Showcase**. Building it takes three things: the Branch's active Products, the selection rules (grouping by Product Category, picking each **Category Representative**, the six-category limit on the Category Showcase) and A4 PDF output.

We had two options:

1. **Front end only.** The admin dashboard loads Merchant, Branch and Products through existing endpoints, applies the rules in the browser and uses browser print / "Save as PDF".
2. **Backend API.** `blitz-pay` exposes a printed-catalog endpoint, or renders the PDF on the server, and the dashboard displays what it returns.

## Decision

Build the Printed Catalog **in the admin front end only** for now (option 1). All the data is already available (`GET /merchants/{id}/products?branchId=…`, merchant, branch), the QR is already generated in the browser, and browser print produces good A4 PDFs. A backend endpoint would mean coordinated releases across two repos without any current benefit.

The selection rules live in **one pure, separately tested function** (Products → catalog sections and Category Representatives) that knows nothing about the page that renders it. This keeps the planned move cheap.

## Planned move to the backend

We intend to move the selection rules to `blitz-pay` as a branch-scoped printed-catalog endpoint (for example `GET /merchants/{merchantId}/branches/{branchId}/printed-catalog?layout=full|showcase`) when any of these happens:

- The merchant app (or any second client) needs to produce Printed Catalogs, so the rules would otherwise be written twice.
- We need PDFs that look the same in every browser, or PDFs delivered without a person printing them (email, scheduled jobs).
- A Branch catalog grows larger than one product list request returns.

When we move, the backend becomes the single source of the rules. The front-end function and its specs serve as the reference behaviour to port, and are deleted afterwards. The page only changes its data source.

## Consequences

- Until the move, any other client that wants a Printed Catalog has to copy the rules from `src/app`. That is the trigger to move, not a reason to copy them.
- Output depends on the operator's browser print engine (Chrome is the reference).
