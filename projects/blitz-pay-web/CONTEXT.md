# Web Storefront

This context covers the public-facing web application at `pay.blitzpay.com`. It serves end-customers who either scan a merchant QR code or browse a merchant's branch catalog directly — without needing the native BlitzPay app installed.

Cross-context terms such as **Order**, **OrderId**, **Merchant Order QR**, **Editable Unpaid Order**, **Checkout Intent**, **Merchant Branch**, and **Product** are defined in the [Order Payment context](../../blitz-pay-prototype/CONTEXT.md) and the [Admin Dashboard context](../../CONTEXT.md). Do not redefine them here.

## Language

**Web Storefront**:
The standalone Angular web application served at `pay.blitzpay.com`. It is the web-native fallback for customers who do not have the BlitzPay native app installed, and a direct catalog-browsing surface for any customer.
_Avoid_: Admin dashboard, shopper app, web checkout, web app (too generic)

**Web Catalog**:
The merchant-branded, branch-scoped public storefront reached via `/m/{merchantId}/b/{branchId}`. It lets customers browse and search active products through a curated product-card presentation for exactly one selected Branch under the Merchant's customer-facing identity.
_Avoid_: Merchant page, product page, store page

**Storefront Identity**:
The customer-facing Merchant identity presented on a **Web Catalog**, consisting of Merchant name and logo, with the selected Branch represented secondarily as the fulfillment location.
_Avoid_: Custom theme, marketing profile, brand microsite

**Web Cart**:
The customer's tab-session-scoped in-progress item selection for one Branch-scoped shopping journey, continuously accessible beside the product catalog on wider screens or from a compact mobile cart summary, and available through its related **Product Overview** and **Guest Checkout** surfaces before an Order exists.
_Avoid_: Basket, draft order, pending order

**Product Overview**:
A focused customer-facing view of one active Product selected from a **Web Catalog**, presenting its merchandising details and customer-selected quantity before adding it to the **Web Cart**, while preserving the same Storefront Identity and Branch fulfillment context.
_Avoid_: Product editor, product administration, item modal

**Branch Catalog QR**:
A stable, reusable, browser-first QR code provided by a Merchant for one selected Branch that contains only Merchant and Branch identity through `https://pay.blitzpay.com/m/{merchantId}/b/{branchId}`. Any customer scans it to open the current branch-scoped **Web Catalog**, browse Products, and build a **Web Cart** before an Order exists.
_Avoid_: Merchant Info QR, Merchant Payment QR, Merchant Order QR

**Unavailable Product Notice**:
A Storefront Identity-preserving message shown when a directly opened **Product Overview** no longer represents an orderable Product at its Branch, with a path back to available Branch products.
_Avoid_: Not found redirect, inactive product sale, silent catalog fallback

**Shopper Catalog Language**:
The language a customer chooses for a **Web Catalog**, offered only when the Merchant has the International Menu offering and at least one Supported Menu Language. It is kept for the browsing session. Without a choice, the browser's language applies, and items without a translation appear in the Merchant's Original Menu Language.
_Avoid_: Site language, UI language, locale

**Unavailable Catalog Notice**:
A Storefront Identity-preserving message shown when a Branch currently has no active Products available for ordering.
_Avoid_: Empty shop redirect, inactive product display, checkout without products

**Unavailable Branch Notice**:
A Storefront Identity-preserving message shown when the Branch identified by a reusable **Branch Catalog QR** is not currently available for online ordering.
_Avoid_: Branch substitution, hidden fulfillment change, ordering from an inactive Branch

**QR Order Landing**:
The page a customer reaches at `/order/{orderId}` when they scan a **Merchant Order QR** on a device without the BlitzPay app. It fetches the live Order and presents it for review, optional pre-payment edit, and payment — identical in behaviour to the native app's `OrderDetail` screen.
_Avoid_: Payment page, checkout page, QR landing page

**Universal Order URL**:
The HTTPS URL `https://pay.blitzpay.com/order/{orderId}` embedded in a **Merchant Order QR**. On a device with the app installed, iOS/Android intercepts it as a Universal Link / App Link and opens the native BlitzPay app. On a device without the app, the browser opens the **QR Order Landing** page. There is one QR code per order — not separate native and web QR codes.
_Avoid_: Web QR, fallback URL, deep link URL

**App Install Prompt**:
A visible secondary promotional element after the primary shopping content on every screen of the Web Storefront — including the **Web Catalog**, **QR Order Landing**, and post-payment confirmation — that presents an app preview and App Store / Google Play paths without overtaking the Merchant's shopping content.
_Avoid_: App banner, install popup, download modal

**Web Storefront Install Notice**:
A compact, dismissible notice after the primary shopping content that offers the browser's PWA installation flow only after the browser signals that the Web Storefront is installable. It appears only when the app is not installed and does not automatically open the browser prompt or replace the native **App Install Prompt**.
_Avoid_: Native app install prompt, automatic install popup

**Table Check-in**:
What happens when a guest opens a Table Link (`/t/{tableCode}`, from the Table's QR code or NFC tag, or by typing the Table Code under "Enter table code"): the Web Storefront resolves the Table and opens its Branch's **Web Catalog** with that Table set for this browser tab. Orders then go to that Table as Walk-In orders and need the browser's location. A deactivated Table opens the Branch's Web Catalog without a Table, with a note to collect the order at the counter. Table, Table Code, Table Link and Cash Payment are defined in the backend glossary (zack-pay `CONTEXT.md`).
_Avoid_: table login, table session, scan-in

**Guest Checkout**:
The dedicated branch-scoped payment surface on the Web Storefront that requires no account registration or login. It converts a current, reviewed **Web Cart** into an **Order** only when the customer confirms their payment action.
_Avoid_: Anonymous checkout, unauthenticated payment

**Storefront Currency**:
The monetary currency in which Product prices and a **Web Cart** are presented to the customer during one Branch-scoped shopping journey. The initial Web Storefront supports EUR only until Merchant or Branch catalog context owns currency explicitly.
_Avoid_: Inferred country currency, post-order currency guess

## Routes

| Route | Surface |
|---|---|
| `/m/{merchantId}/b/{branchId}` | **Web Catalog** for a specific Branch |
| `/m/{merchantId}/b/{branchId}/p/{productId}` | **Product Overview** for a Product in the selected Branch |
| `/m/{merchantId}/b/{branchId}/checkout` | **Guest Checkout** for the current Web Cart |
| `/t/{tableCode}` | **Table Link**: resolves the Table and opens its Branch's **Web Catalog** at that Table |
| `/order/{orderId}` | **QR Order Landing** for a Merchant Order QR scan |
| `/order/{orderId}/confirmation` | Post-payment confirmation screen |

## Relationships

- A **Web Catalog** is scoped to exactly one **Branch** of one **Merchant**
- A **Web Catalog** presents exactly one **Storefront Identity**
- A **Web Cart** belongs to exactly one Merchant and Branch scope and one browser-tab session; it survives refresh and movement across that scope's **Web Catalog**, **Product Overview**, and **Guest Checkout** surfaces only
- Within the same Merchant and Branch browser-tab journey, returning from **Product Overview** to **Web Catalog** preserves the customer's product-search and category-browsing context
- When a customer with a non-empty **Web Cart** enters a different Branch scope, the Web Storefront must disclose that the cart contains items from another location before the customer may replace it
- A **Product Overview** belongs to the same Branch-scoped browsing journey as the **Web Catalog** from which its Product was selected
- A **Product Overview** is directly shareable and usable by any customer without prior QR entry, while preserving its Merchant and Branch scope
- A **Branch Catalog QR** identifies exactly one Merchant and exactly one Branch and resolves to that Branch's **Web Catalog**
- A **Branch Catalog QR** remains reusable as Product availability changes because its **Web Catalog** presents the Branch's current active Products
- A **Branch Catalog QR** is distributed primarily by the merchant app for the operator's selected Branch; the admin dashboard may render the QR inside the Branch edit dialog for scanning and testing the storefront journey, and may place it on a **Printed Catalog** that internal operators prepare on a Merchant's behalf
- A Branch edit dialog testing QR targets the Web Storefront environment paired with the admin-selected Branch data environment
- Each Branch row in the admin dashboard provides a direct **Web Catalog Link** — a browser link that opens the Branch's **Web Catalog** in a new tab using the same environment-paired storefront domain; this is a navigation convenience for admins distinct from the scannable **Branch Catalog QR**
- The Web Storefront and admin testing QR may be delivered before the separate merchant app adopts **Branch Catalog QR** and HTTPS **Merchant Order QR** generation
- A **Branch Catalog QR** resolves to the **Web Catalog** regardless of whether the customer has installed the native BlitzPay app
- A customer entering through a **Branch Catalog QR** remains scoped to its encoded Branch for browsing, cart, and checkout; the Web Storefront does not offer Branch switching in that journey
- An unavailable shared **Product Overview** resolves to an **Unavailable Product Notice**, not an orderable Product
- A **Web Catalog** with no active Products resolves to an **Unavailable Catalog Notice**, not a different Merchant or Branch scope
- A **Branch Catalog QR** for a non-orderable Branch resolves to an **Unavailable Branch Notice**, not another Branch's catalog
- Confirming payment in **Guest Checkout** converts exactly one reviewed **Web Cart** into exactly one **Order** (same entity as the native app)
- A **Web Cart** whose Product availability or price changed must be reviewed again before **Guest Checkout** may create an **Order**
- A **Web Catalog**, its **Web Cart**, and its **Guest Checkout** use one **Storefront Currency**; initially that currency is EUR
- The **Web Cart** hands customers into **Guest Checkout** before they select or begin a payment method
- A **QR Order Landing** fetches exactly one **Order** by **OrderId**
- A cancelled hosted payment returns to the existing Order surface so payment can be retried without creating another Order
- A **Universal Order URL** resolves to exactly one **QR Order Landing** when the native app is absent
- A **Universal Order URL** resolves to the native `OrderDetail` screen when the BlitzPay app intercepts it
- A **Guest Checkout** at a Table sends the Table Code and a fresh browser location; a guest who denies location access cannot order at the Table
- A guest at a Table pays now online or chooses **Cash Payment**; guests never get Deferred Payment
- **Guest Checkout** applies to both the **Web Cart** checkout path and the **QR Order Landing** payment path
- The **Branch Catalog QR** journey remains public from browsing through **Guest Checkout**; no BlitzPay account sign-in is required
- An **App Install Prompt** appears on every screen of the **Web Storefront** — it is never absent
- The **Web Storefront Install Notice** appears only when a supported browser signals installability, remains separate from the native **App Install Prompt**, and invokes installation only after a customer action
- The **Web Storefront** does not manage or modify Merchant, Branch, or Product data — all catalog data is read-only from the customer's perspective

## Flagged ambiguities

- "merchant or branch catalog" was ambiguous about scope — resolved: the **Web Catalog** is always branch-scoped; the URL carries both `merchantId` and `branchId`
- "e-commerce website for the merchant" was ambiguous about whether products aggregate across Branches — resolved: the **Web Catalog** uses Merchant branding but remains scoped to the Branch identified by its link
- "merchant-branded" was ambiguous about custom marketing configuration — resolved: initial **Storefront Identity** is derived from Merchant name/logo and selected Branch identity only
- "branch-scoped but merchant-branded" was ambiguous about headline hierarchy — resolved: Merchant identity leads the Web Catalog and Branch identity appears as a small fulfillment label
- "branch information" was ambiguous about customer identity versus operational metadata — resolved: the storefront exposes fulfillment location context only, not internal statuses, provider setup, or administrative details
- "shows the products" was ambiguous about whether browsing is an unstructured list — resolved: the **Web Catalog** supports finding Branch products by product text and existing product category
- "DataView layout" was ambiguous about customer-switchable presentation — resolved: the **Web Catalog** presents products in a consistent storefront card layout rather than exposing list/grid view controls
- "e-commerce presentation" was ambiguous about promoted inventory — resolved: the initial **Web Catalog** does not infer featured or promoted Products without an explicit merchandising concept
- "product price currency" was ambiguous because catalog Products carry amounts without currency context — resolved: the initial Web Storefront is EUR-only until currency is owned by Merchant or Branch catalog context
- "branch with no active products" was ambiguous about redirect versus empty store — resolved: retain Storefront Identity and show an **Unavailable Catalog Notice** without an ordering action
- "printed QR after branch deactivation" was ambiguous about fallback fulfillment — resolved: retain Storefront Identity and show an **Unavailable Branch Notice** without substituting another Branch
- "who handles branch catalog signage" was ambiguous between internal admin and merchant operator workflows — resolved: the merchant app distributes the **Branch Catalog QR**, while the admin dashboard may expose each Branch QR only to test the storefront journey
- "admin testing affordance for branch QR" was ambiguous about a full sharing workflow — resolved: the existing Branch edit dialog only displays a scannable **Branch Catalog QR** for testing
- "test QR deployment target" was ambiguous across local and staging data — resolved: the Branch edit dialog QR follows the selected admin environment so storefront and Branch data correspond
- "QR shopper authentication" was ambiguous after adding a Branch Catalog entry route — resolved: browsing, cart, and Guest Checkout remain public and do not require BlitzPay sign-in
- "implementation boundary" was ambiguous across repositories — resolved: implement the Web Storefront redesign and admin test QR here first; change merchant-app QR generation in a subsequent task
- "merchant QR actions" was ambiguous between storefront discovery and prepared payment — resolved: the merchant app presents **Branch Catalog QR** and **Merchant Order QR** as clearly distinct actions
- "checkout and pay via web or scan and pay via web" was ambiguous about whether both entry points were in scope — resolved: both **Web Cart** self-service checkout and **QR Order Landing** are first-class flows
- "payment is separate and initiated by QR code only" was initially ambiguous — resolved: QR-initiated payment is one entry point; the catalog also supports self-service **Web Cart** checkout; both paths converge on the same payment screen
- "promote our BlitzPay app" was ambiguous about placement — resolved: **App Install Prompt** is a persistent element on every screen, not just post-payment
- "app install prompt" was ambiguous about a plain callout versus product preview — resolved: it remains visible as a secondary promotional module that may show an app screenshot within its content
- "app preview" was ambiguous about whether it belongs in the Storefront Identity area — resolved: the **App Install Prompt** follows the primary shopping content and does not occupy the Merchant hero
- "e-commerce website" was ambiguous about a separate cart journey — resolved: the **Web Cart** remains visibly available beside the branch product catalog for quick ordering
- "continue to payment" was ambiguous about selecting payment inside the product catalog — resolved: the **Web Cart** provides one checkout action and payment-method choice belongs to **Guest Checkout**
- "when an order exists" was ambiguous around abandoned checkout review — resolved: opening **Guest Checkout** does not create an **Order**; final payment confirmation does
- "checkout step" was ambiguous about an overlay versus a storefront surface — resolved: **Guest Checkout** is a dedicated Branch-scoped route
- "cart navigation" was ambiguous about whether opening product or checkout loses selection — resolved: a **Web Cart** continues across surfaces in the same Merchant and Branch scope, but never across Branches
- "cart persistence" was ambiguous about refresh and future visits — resolved: a **Web Cart** survives refresh within its browser-tab session, but is not a durable customer cart
- "visible side cart on mobile" was ambiguous about layout versus accessibility — resolved: the **Web Cart** remains accessible through a sticky compact summary that expands on small screens
- "stale cart at checkout" was ambiguous about captured versus current availability and pricing — resolved: **Guest Checkout** blocks Order creation until Product changes are shown and the updated **Web Cart** is reviewed
- "return from hosted payment" was ambiguous about cart restart versus order continuation — resolved: successful payment reaches confirmation; cancelled payment returns to the existing Order for retry
- "Diamond product overview style" was ambiguous about resizing product cards versus focused browsing — resolved: a customer can open a dedicated **Product Overview** from the branch-scoped Web Catalog
- "product detail navigation" was ambiguous about transient overlays versus direct linking — resolved: each **Product Overview** has a shareable URL within the selected Merchant and Branch context
- "merchant info QR code" was ambiguous because the Web Catalog requires fulfillment scope — resolved: the merchant app exposes a **Branch Catalog QR** carrying both Merchant and Branch context
- "catalog QR link scheme" was ambiguous between native deep-link and browser entry — resolved: a **Branch Catalog QR** encodes the public HTTPS Web Catalog URL
- "branch QR amount and label" was ambiguous because the replaced merchant payment QR carried payment inputs — resolved: a **Branch Catalog QR** contains Merchant and Branch identity only; selected Products determine the Web Cart amount
- "QR lifecycle" was ambiguous between branch display and prepared order payment — resolved: a **Branch Catalog QR** is reusable Branch signage; a **Merchant Order QR** identifies one already-created Order
- "shopper scans merchant QR without the app" was ambiguous about an Order flow — resolved: this is a **Branch Catalog QR** journey into the browser-based **Web Catalog**, not a **Merchant Order QR** journey
- "shopper app already installed" was ambiguous for catalog QR interception — resolved: a **Branch Catalog QR** remains a Web Storefront entry; native app handoff is reserved for a **Merchant Order QR**
- "change branch after scanning catalog QR" was ambiguous about Merchant-wide browsing — resolved: the **Branch Catalog QR** fixes the fulfillment Branch and exposes no customer Branch switcher
- "direct link into another branch with an existing cart" was ambiguous about silent replacement — resolved: tell the customer "Your cart contains items from another location." and require confirmation before starting the new Branch-scoped cart
- "shared product link after unavailability" was ambiguous about redirection versus explanation — resolved: preserve Storefront Identity, explain unavailability, and offer return to available Branch products
- "shared product link without scanning QR" was ambiguous about entry prerequisites — resolved: a **Product Overview** URL independently establishes its Merchant and Branch browsing scope
- "adding products from catalog versus detail" was ambiguous about quantity selection — resolved: product cards provide quick-add of one item; a **Product Overview** allows the customer to select quantity before adding
- "product card tap behavior" was ambiguous about inspection versus cart mutation — resolved: image/name leads to **Product Overview**, while a separate Add action adds one Product to the **Web Cart**
- "product availability labels" was ambiguous because the catalog already filters to orderable Products — resolved: active product cards omit status badges; unavailability is communicated only through an unavailable notice or checkout revalidation
- "return from product overview" was ambiguous about catalog reset — resolved: same-Branch catalog search and category context continues through Product Overview navigation within the tab session
