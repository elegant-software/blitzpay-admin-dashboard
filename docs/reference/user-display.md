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

## Other Display Values

Additional display conventions will be added here as they are standardised (currency formatting, status labels, etc.).
