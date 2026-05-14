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

## Relationships

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
