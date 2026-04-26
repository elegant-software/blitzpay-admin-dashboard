# User-Display Conventions

Reference for how user-facing values must be formatted across the BlitzPay admin dashboard.

---

## Dates and Timestamps

### Rule

All raw date/time values (ISO 8601 strings, `Date` objects) **must** be passed through the `DisplayDatePipe` before being shown to a user. Raw ISO strings must never appear in the UI.

### Output format

```
d MMM y, HH:mm   →   24 Apr 2026, 21:55
```

- Day first (no leading zero)
- Abbreviated month name
- 4-digit year
- 24-hour clock, `HH:mm` (no seconds)
- Locale: `en-GB`

### Null / empty

`null`, `undefined`, and empty strings render as an em-dash `—`.

### Pipe

```
src/app/pipes/display-date.pipe.ts
```

```ts
import { DisplayDatePipe } from '../pipes/display-date.pipe';
```

Usage in a standalone component:

```ts
@Component({
  imports: [DisplayDatePipe],
  ...
})
```

Usage in a template:

```html
{{ product.updatedAt | displayDate }}
{{ merchant.lastUpdatedAt | displayDate }}
```

### What NOT to pipe

Relative/human-composed time strings (e.g. `"10 sec ago"`, `"Just now"`) are already user-friendly and must **not** be passed through `DisplayDatePipe`.

---

## Dialog Field Grouping

### Rule

Edit dialogs with more than a handful of fields **must** organise fields into named groups using the `.dialog-section` separator. Flat, ungrouped forms are not permitted.

### Markup

```html
<div class="col-12"><div class="dialog-section">Group Name</div></div>
```

Place the separator `col-12` immediately before the first field of each group (except the very first group, which needs no separator). The `.dialog-section` element renders a small uppercase label with a trailing rule line.

### CSS class

```
src/app/merchant-catalog/merchant-catalog.component.css  →  .dialog-section
```

### Standard group names

| Dialog | Groups (in order) |
| --- | --- |
| Edit Merchant | *(identity)* · Address · Contact · Payment · Logo |
| Edit Branch | *(identity)* · Address · Contact · Location · Payment |
| Edit Product | *(identity)* · Pricing · Media · Details |

The first group (Name + Status) carries no separator — the form header provides sufficient context.

### What counts as a group

Fields are in the same group when they describe the same facet of the entity (e.g. all address lines belong to Address; lat, lng, geofence radius, and map preview all belong to Location). Split on facet boundaries, not on visual row count.

---

## Other Display Values

Additional display conventions will be added here as they are standardised (currency formatting, status labels, etc.).
