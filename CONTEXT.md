# BlitzPay Admin Dashboard

This context covers the admin-facing management workflows for merchant onboarding data and the digital merchant catalog. It defines the business terms the UI exposes so product and engineering discussions use the same language.

## Language

**Merchant**:
The business entity whose profile, branches, products, and product categories are managed in the dashboard.
_Avoid_: Seller account, store account
``
**Branch**:
A merchant-operated location that can own a branch-scoped set of products.
_Avoid_: Outlet, shop

**Product**:
A catalog item managed for a merchant and optionally scoped to a single branch.
_Avoid_: SKU, menu item

**Product Category**:
A merchant-defined grouping used to classify products in the digital merchant catalog.
_Avoid_: Tag, label, type

**Printed Catalog**:
A printable, paper representation of one Branch's current Web Catalog, prepared by an internal operator on a Merchant's behalf, carrying the Branch Catalog QR so readers can reach the live Web Catalog.
_Avoid_: Menu, menu card, flyer, brochure

**Full Catalog**:
The Printed Catalog layout that lists every active Product of the Branch, grouped by Product Category.
_Avoid_: Menu, price list

**Category Showcase**:
The single-page Printed Catalog layout for advertising that presents one Category Representative per Product Category alongside the Branch Catalog QR.
_Avoid_: Flyer, poster, ad

**Category Representative**:
The Product chosen to stand for its Product Category on a Category Showcase: the alphabetically first active Product with an image in that category, or the alphabetically first active Product when none has an image.
_Avoid_: Featured product, highlight

**Catalog Language**:
The language an operator chooses to view a Merchant's Products and Product Categories in, or to render a Printed Catalog in. It is either the Merchant's Original Menu Language or one of its Supported Menu Languages. Items with no translation in that language appear in the Original Menu Language.
_Avoid_: Locale, display language, UI language

**Translation Coverage**:
For one Supported Menu Language, how many of a Merchant's Products and Product Categories have a current, non-stale translation, out of the total.
_Avoid_: Translation progress, completion rate

**Kitchen Screen**:
The low-interaction display where kitchen staff of one Branch see incoming Orders. Managed from the Branch page with a single switch.
_Avoid_: KDS, kitchen app, order board

**Kitchen Login**:
The one shared login per Branch that its Kitchen Screens sign in with. A Merchant Manager enables, resets or disables it; enabling or resetting shows a new password once, and the password is never stored or shown again. The dashboard keeps the password only in the Branch page's component state.
_Avoid_: kitchen account, kitchen user, device login

**Kiosk**:
A restaurant-owned device, fixed to one Merchant and one Branch, on which any customer shops as a guest without registering, logging in or scanning a QR code with their own phone. Its Orders are the same Order entity as the Web Storefront's. Managed from the Branch page.
_Avoid_: Storefront, shopper app, POS, kitchen screen

**Kiosk Login**:
The one shared login per Branch that a Kiosk signs in with once during setup, modelled on the Kitchen Login. A Merchant Manager enables, resets or disables it; enabling or resetting shows a new password once, and the password is never stored or shown again. The dashboard keeps the password only in the Branch page's component state.
_Avoid_: Kiosk account, device key, API key

**Kiosk Settings**:
What a Merchant Manager configures for one Branch's Kiosk in the dashboard: which payment choices (card, cash at counter, Scan to Pay) are enabled, how long the confirmation screen shows before the Kiosk resets, which of the Merchant's Supported Menu Languages the Kiosk offers, and which Products are Advertised Products.
_Avoid_: Kiosk config, device settings

**Advertised Product**:
A Product a Merchant Manager has chosen, in Kiosk Settings, to show on the Kiosk's Standby screen. When none are chosen, the Standby screen shows the Branch's active Products that have a picture.
_Avoid_: Featured product, promoted product, Category Representative (that is the printed-catalog term)

**Table**, **Table Code**, **Table Name**, **Table Link**, **Branch Link**, **Floor Plan**, **Table Placement**, **Table Status**, **Occupied Table**, **Guest Count**, **Branch Capacity**:
Defined in the backend glossary (zack-pay `CONTEXT.md`, zack-pay#195). The dashboard manages them on the Branch's **Tables** page (`/merchants/:id/branches/:branchId/tables`): Tables with seats and printable QR codes, Floor Plans with Tables dragged onto the picture (positions stored as fractions 0..1 of the picture), and a read-only **Live floor**. Table pins always show seats ("5 · 4 seats"; live: "5 · 3/4 seats" for Guest Count over seats; "?" when seats are not set). A Platform Admin never clears Tables, sets Guest Counts or takes or confirms payments here. Branch Capacity is edited on the Branch page; seats above it only warn.
_Avoid_: seat, map, layout, seating chart

## Relationships

- A **Printed Catalog** is scoped to exactly one **Branch** of one **Merchant** and presents the same active **Products** as that Branch's Web Catalog
- A **Printed Catalog** is rendered in one of two layouts: **Full Catalog** or **Category Showcase**
- A **Printed Catalog** is rendered in exactly one **Catalog Language**
- An operator may choose any of the Merchant's languages as the **Catalog Language**, whether or not the International Menu offering is enabled; that offering controls only what shoppers see
- A **Category Showcase** presents at most six **Product Categories**, in alphabetical order; **Products** without a **Product Category** appear only in the **Full Catalog**
- A **Merchant** owns zero or many **Branches**
- A **Merchant** owns zero or many **Products**
- A **Merchant** owns zero or many **Product Categories**
- A **Product** belongs to exactly one **Merchant**
- A **Product** may belong to zero or one **Branch**
- A **Product** may reference zero or one **Product Category**
- A **Product Category** is referenced by products through its stable identifier, not by its display name

## Example dialogue

> **Dev:** "If an admin adds a new **Product Category**, is it available across the whole merchant catalog or only one **Branch**?"
> **Domain expert:** "Across the whole **Merchant**. Products from any branch can use that **Product Category**."
>
> **Dev:** "Where do admins manage a **Product Category**?"
> **Domain expert:** "From a merchant-scoped **Product Categories** section in the catalog page, using the same explicit dialog style as other edits."

## Key field distinctions

**`merchantName` vs `legalBusinessName`**: A Merchant carries both. `merchantName` is the trading name shown in the dashboard and editable via the merchant dialog. `legalBusinessName` is the registered legal entity name, also editable. They are independent fields.

**`merchantCode`**: A system-assigned read-only code on Merchant. Display-only — never sent in create or update requests.

**`branchCode`**: A system-assigned read-only code on Branch. Display-only — never sent in create or update requests.

**`status` (Merchant)**: The onboarding lifecycle status (`DRAFT | SUBMITTED | VERIFICATION | SCREENING | RISK_REVIEW | DECISION_PENDING | SETUP | ACTIVE | MONITORING | ACTION_REQUIRED | REJECTED`). This is the field the merchant dialog toggle controls. `merchantStatus` (`ACTIVE | INACTIVE`) is a separate operational flag returned by the API but not surfaced in the dashboard UI.

**`offerings`**: A set of free-text strings on Merchant describing what the merchant offers. Editable via the merchant dialog and sent in `UpdateMerchantRequest`.

**Contact info shape**: The API returns both flat fields (`contactFullName`, `contactEmail`, `contactPhoneNumber`) and a nested `contactInfo` object on `MerchantDetailsResponse`. The dashboard binds exclusively to the flat fields — the nested object is ignored.

## Search

**Merchant Search**:
The admin-facing capability to discover Merchants by submitting a text query and/or enum filters. Returns a paginated list of Merchant Search Results. Replaces the previous exact-ID lookup as the sole entry point to the merchant detail view.
_Avoid_: Merchant lookup, ID search, merchant filter

**Merchant Search Result**:
The summary representation of a Merchant returned in a search result list. Contains enough fields to identify and disambiguate a merchant at a glance (`merchantName`/`legalBusinessName`, `merchantCode`, `city`, `country`, `businessType`, `merchantMobility`, `status`). Distinct from the full Merchant detail loaded when an admin clicks through.
_Avoid_: Merchant row, search hit, merchant preview

**Search Query (`q`)**:
The optional free-text term submitted with a Merchant Search. Applied as a case-insensitive substring match across name, reference, code, email, and address fields on Merchants, their Branches, and their Products. Optional — a Merchant Search may be submitted with filters only and no `q`. When `q` is present and fewer than 3 characters, it is matched only against code and reference fields (not name or address text fields).
_Avoid_: Search string, keyword, full-text query

**Search Filters**:
The optional multi-value filter sets submitted in the Merchant Search body alongside the Search Query. Each filter accepts one or more values (`businessTypes`, `merchantMobilities`, `statuses`). Applied as exact-match IN conditions independently of the Search Query. Any combination of filters and query is valid — including filter-only with no `q`.
_Avoid_: Search facets, dropdowns, type filters, query params

## Search relationships

- A **Merchant Search** is submitted as a POST request with a JSON body carrying the Search Query and Search Filters
- A **Merchant Search** produces zero or more **Merchant Search Results**, paginated (50 per page, sorted by `lastUpdatedAt` descending)
- A **Merchant** surfaces in results if its own fields, any of its **Branch** names/addresses, or any of its **Product** names match the Search Query — but the result row always represents the Merchant, never the Branch or Product
- Clicking a **Merchant Search Result** loads the full **Merchant** detail view; a "Back to results" action returns to the same result page without re-running the search

## Payment

**Payment Service Provider (PSP)**:
An external company that processes payments on behalf of Merchants (Stripe, TrueLayer, Adyen, Braintree, PayPal). Maintained as a seeded reference list — new PSPs require a code change and migration, not runtime configuration.
_Avoid_: Payment Channel, Payment Gateway

**Merchant Provider Account**:
A Merchant's connection record for a specific PSP. One record exists per (Merchant, PSP) pair. A Merchant Provider Account with `enabled = true` is the single source of truth for which PSPs a Merchant has active. The record is never deleted — disabling sets `enabled = false`, preserving credentials for re-activation.
_Avoid_: Payment Channel, activePaymentChannels, Merchant Payment Account (Stripe-specific legacy term)

**Stripe Provider Account**:
The Stripe-specific extension of a Merchant Provider Account. Holds the Stripe Express Connected Account ID, charges-enabled flag, details-submitted flag, and pay-by-bank flag. Created when an admin initiates Stripe Connect Onboarding for a Merchant.
_Avoid_: MerchantStripeConnect, Merchant Payment Account

**Stripe Connect Onboarding**:
The admin-initiated flow that opens a Stripe-hosted Express account setup page in a new browser tab, allowing an admin to connect or complete a Stripe Provider Account on behalf of a searched Merchant. The admin supplies `return_url` and `refresh_url` in the initiation request; the backend passes them through to Stripe.
_Avoid_: Merchant self-service onboarding, native in-app onboarding form, express checkout

**Provider Account Status**:
The four observable states of a Stripe Provider Account as reported by `GET /merchants/{id}/provider-accounts/STRIPE/status`: `not_connected`, `verifying`, `connected`, `error`. Derived from `connected`, `chargesEnabled`, and `detailsSubmitted` flags returned by the backend.
_Avoid_: Payment Account Status, Raw Stripe status, payment channel flag

**Stripe Connect Return Route**:
The dedicated admin dashboard route (e.g. `/stripe-connect/return`) that Stripe redirects to after a merchant completes or abandons onboarding. It reads `merchantId` and an optional `refresh` query param. When `refresh=true`, it automatically fetches a new onboarding link and redirects the tab back to Stripe. Otherwise it displays the current Provider Account Status and a link back to the merchant catalog.
_Avoid_: Callback page, webhook handler

## Relationships (payment)

- A **Merchant** has zero or more **Merchant Provider Accounts**, one per **Payment Service Provider**
- An admin initiates **Stripe Connect Onboarding** for a **Merchant** from the Provider Accounts section of the merchant catalog page
- **Stripe Connect Onboarding** resolves to exactly one **Provider Account Status** on return
- The **Stripe Connect Return Route** is the sole entry point for Stripe's redirect back into the admin dashboard
- Branches do not have Provider Accounts — payment processing capability is always determined at the Merchant level

## User Management

**Platform User**:
A Keycloak user fetched from the identity provider and represented in the admin dashboard by their Keycloak UUID plus display data (name, email). The dashboard stores no profile data — only the UUID is retained as a foreign key.
_Avoid_: Admin user, system user, dashboard user (those refer to the internal operator, not a merchant-side user)

**User Search**:
The admin-facing capability to discover Platform Users by submitting a name or email query, proxied through the backend to Keycloak. Returns a paginated list of User Search Results.
_Avoid_: User lookup, Keycloak search, user filter

**User Search Result**:
The summary representation of a Platform User returned in a search result list. Contains enough fields to identify the user at a glance (display name, email, Keycloak UUID).
_Avoid_: User row, search hit

**Merchant User Assignment**:
The combined act of placing a Platform User into a Merchant's Keycloak group (and optionally a branch sub-group) and recording their Merchant Operations Role in BlitzPay. Written atomically by the `/user-management` backend API. The BlitzPay record is merchant-scoped even when Keycloak placement is at branch level.
_Avoid_: Group assignment only, role assignment only, raw Keycloak group membership

**Merchant Operations Role**:
The appointment and calendar permission role a Platform User holds within a Merchant: **Merchant Manager** (merchant-wide) or **Merchant Employee** (branch-scoped, linked to one Employee).
_Avoid_: Keycloak role, realm role, onboarding role

**Merchant Manager**:
A Platform User with a Merchant Operations Role that grants merchant-wide appointment and calendar permissions. Placed in the Keycloak merchant group (`/merchants/merchant_<uuid>`).
_Avoid_: Merchant admin, owner, manager role only

**Merchant Employee**:
A Platform User with a Merchant Operations Role scoped to one Employee record. Placed in a Keycloak branch sub-group (`/merchants/merchant_<uuid>/branch_<uuid>`) and linked to an existing Employee within that merchant.
_Avoid_: Branch user, staff login, employee account

## User Management Relationships

- A **Platform User** is identified by their Keycloak UUID; the dashboard stores only this UUID
- A **User Search** produces zero or more **User Search Results**
- A **Platform User** may have zero or more **Merchant User Assignments**
- A **Merchant User Assignment** belongs to exactly one **Merchant** and one **Platform User**
- A **Merchant User Assignment** carries exactly one **Merchant Operations Role** (Merchant Manager or Merchant Employee)
- A **Merchant Employee** assignment is linked to exactly one existing **Employee** within that **Merchant**
- A **Merchant Manager** assignment is placed in the Keycloak merchant group; a **Merchant Employee** assignment is placed in a Keycloak branch sub-group
- The `/user-management` backend API is the sole write path for **Merchant User Assignment** — it writes Keycloak group membership and the BlitzPay domain record atomically
- The admin dashboard calls the `/user-management` API only; it never calls Keycloak directly

## Navigation

**Merchant Detail View**:
The route-level page at `/merchants/:id` that displays a single Merchant's complete data: info, location, payment accounts, branches, products, product categories, and (for mobile merchants) appearances. Rendered inside the shell layout with the sidebar visible. Replaced the previous inline section inside `AuthShellComponent`.
_Avoid_: Merchant page, catalog detail, merchant tab

**Merchant Cross-link**:
A pair of navigation actions ("View Settlements", "View Appointments") available in the Merchant Detail View header that open the respective section pre-filtered for that Merchant. The selected Merchant's `applicationId` is passed as a `merchantId` query parameter; the target page auto-loads data without requiring the admin to search again.
_Avoid_: Merchant link, catalog shortcut, context switch

**Edit Route**:
A dedicated route that renders an edit form for a single entity (Merchant, Branch, or Product) in a full page instead of a dialog overlay. Accessed from the Merchant Detail View. The sidebar remains visible. On save or cancel, the admin is returned to the Merchant Detail View.
_Avoid_: Edit dialog, modal edit, inline edit

## Flagged ambiguities

- "category list on the catalog page" could have implied branch-level categories; resolved: **Product Categories** belong to the **Merchant** and are reusable across all **Branches**.
- "update and add new category" could have implied full lifecycle management; resolved: admins can create, rename, and delete **Product Categories**.
- "same category" was ambiguous for matching; resolved: **Product Category** names must be unique within a **Merchant**, using trimmed case-insensitive comparison.
- "where uniqueness is enforced" was ambiguous between UI and service; resolved: uniqueness is enforced authoritatively by the backend, and the UI surfaces the returned validation error.
- "renaming a category" could have implied creating a new category and reassigning products; resolved: a rename updates the existing **Product Category** entity, whose stable identifier remains the link from **Products**.
- "show category list on the page" was ambiguous for interaction style; resolved: category management lives in a merchant-scoped **Product Categories** section and uses explicit add/edit dialogs rather than inline editing.
- "where the category section should sit" was ambiguous in the layout; resolved: the page uses a two-column structure with **Merchant** and **Branches** on the left, and **Product Categories** above **Products** on the right.
- "show category usage count" was requested as useful context; resolved: defer it until there is merchant-wide API support, because branch-scoped client-side counts would misrepresent a merchant-wide **Product Category**.
- "create category while editing a product" was a possible shortcut; resolved: **Product Category** creation is managed only from the merchant-scoped **Product Categories** section, not from the **Product** dialog.
