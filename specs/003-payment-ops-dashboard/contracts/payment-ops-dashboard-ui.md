# UI Contract: Payment Operations Dashboard

This contract defines the admin-facing behavior for the redesigned operations dashboard. It complements the feature specification and assumes mock data is the source for this phase.

## Entry Point

- The authenticated shell keeps `Dashboard` as the default active section.
- Opening `Dashboard` shows the redesigned payment operations workspace.
- The existing `Merchants` section remains available as the detail maintenance workspace.

## Data Mode

- The dashboard uses mock data for this phase.
- A visible indicator must clarify that the displayed overview is sample/mock operational data.
- Users must not confuse dashboard values with live payment production data.

## Overview Area

Displayed summary indicators:

- Total merchants
- Total branches
- Total products
- Total transactions
- Online user activity
- Mobile user activity
- Aggregate payment volume
- Approval/success trend summary

Behavior:

- All summary values include mixed-status records.
- The overview remains readable without needing to open detail panels first.

## Merchant Portfolio Area

Displayed merchant fields:

- Merchant name
- Merchant reference or identifier
- Merchant status
- Merchant country or market context when available
- Branch count
- Product count
- Transaction count
- Online/mobile activity context
- Payment volume
- Last activity timestamp when available

Behavior:

- Users can select a merchant from the portfolio area.
- Selecting a merchant updates branch, product, transaction, and channel context in the rest of the dashboard.
- Merchants remain visible regardless of status.

## Branch Context Area

Displayed branch fields:

- Branch name
- Branch status
- City or address context
- Product count
- Transaction count
- Payment volume
- Last transaction timestamp when available

Behavior:

- Selecting a merchant reveals all associated branches.
- Branches remain visible regardless of status.
- Branches with no products or no transactions show explicit empty-value states instead of disappearing.

## Product Context Area

Displayed product fields:

- Product name
- Product status
- Category when available
- Unit price
- Transaction count
- Payment volume
- Last purchased timestamp when available

Behavior:

- Products can be shown in merchant context or narrowed by selected branch.
- Products remain visible regardless of status.
- Products with no recent purchases still appear with zero-value indicators.

## Transaction Activity Area

Displayed transaction fields or aggregates:

- Transaction status/outcome
- Amount and currency
- Related merchant
- Related branch or product when available
- Channel (`online` or `mobile`)
- Transaction timestamp

Behavior:

- Transaction activity reflects the currently selected merchant or branch context when one is active.
- Users can understand payment movement without leaving the dashboard.
- Missing branch or product linkage is displayed as an explicit fallback label rather than omitted.

## Channel Comparison Area

Displayed channel fields:

- Channel name (`online` or `mobile`)
- User count
- Transaction count
- Payment volume
- Conversion/engagement indicator when available
- Last activity timestamp when available

Behavior:

- Users can compare online and mobile contribution at the global view and within selected merchant or branch context.
- Single-channel cases render cleanly even if only one channel has activity.

## Empty And Error States

- If no merchants exist in the mock dataset, the dashboard shows a clear portfolio empty state.
- If a merchant has no branches, the branch area states that no branches are available for that merchant.
- If a branch or merchant has no products, the product area states that no products are available in the current context.
- If no transactions exist in the current context, the transaction area states that payment activity is not available yet.
- If one channel has no activity, the channel comparison area still shows the available channel and a zero/empty state for the other.

## Responsiveness

- On desktop, overview and contextual panels can appear in a multi-column layout.
- On smaller screens, panels stack in priority order while preserving overview first, context second, and activity third.
- No section should rely on hover-only behavior to reveal critical information.

## Cross-Cutting Display Rules

- All raw timestamps displayed in the dashboard must use `DisplayDatePipe`.
- Status values must be presented as user-readable labels with visual status treatment.
- Mock data must preserve relationship context between merchants, branches, products, transactions, and channels in the UI.
