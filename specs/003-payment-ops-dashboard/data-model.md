# Data Model: Payment Operations Dashboard

## Dashboard Snapshot

Represents the full mock dataset and derived overview used by the redesigned operations dashboard.

**Fields**:

- `generatedAt`: required date-time indicating when the snapshot was produced
- `dataMode`: required value, expected to be `mock`
- `portfolioSummary`: required `PortfolioSummary`
- `merchants`: required list of `MerchantOverview`
- `transactions`: required list of `TransactionRecord`
- `channelSnapshots`: required list of `ChannelSnapshot`

**Validation**:

- Snapshot must always expose a complete portfolio summary even when individual lists are empty.
- Snapshot must be clearly marked as mock data in this phase.

## Portfolio Summary

Represents top-level operational indicators shown in the hero/summary area.

**Fields**:

- `merchantCount`: required integer
- `branchCount`: required integer
- `productCount`: required integer
- `transactionCount`: required integer
- `onlineUserCount`: required integer
- `mobileUserCount`: required integer
- `activeMerchantCount`: required integer
- `inactiveMerchantCount`: required integer
- `paymentVolume`: required monetary amount
- `approvalRate`: required percentage

**Validation**:

- Count values must be zero or greater.
- Approval rate must be between 0 and 100.

## Merchant Overview

Represents a merchant surfaced in the dashboard with roll-up operational context.

**Fields**:

- `merchantId`: required UUID/string
- `reference`: required display reference
- `name`: required display name
- `status`: required business-readable lifecycle status
- `country`: optional string
- `branchCount`: required integer
- `productCount`: required integer
- `transactionCount`: required integer
- `onlineUserCount`: required integer
- `mobileUserCount`: required integer
- `paymentVolume`: required monetary amount
- `lastActivityAt`: optional date-time
- `riskFlag`: optional label
- `branches`: required list of `BranchOverview`

**Relationships**:

- Belongs to one `DashboardSnapshot`
- Owns zero or more `BranchOverview`
- Is referenced by zero or more `TransactionRecord`
- Is referenced by zero or more `ChannelSnapshot`

**Validation**:

- Merchant must remain visible regardless of status.
- `branchCount` and `productCount` must reflect all linked records, not only active ones.

## Branch Overview

Represents a merchant branch with operational and payment context.

**Fields**:

- `branchId`: required UUID/string
- `merchantId`: required parent merchant ID
- `name`: required display name
- `status`: required branch status
- `city`: optional string
- `address`: optional string
- `productCount`: required integer
- `transactionCount`: required integer
- `paymentVolume`: required monetary amount
- `onlineUserCount`: required integer
- `mobileUserCount`: required integer
- `lastTransactionAt`: optional date-time
- `products`: required list of `ProductOverview`

**Relationships**:

- Belongs to one `MerchantOverview`
- Owns zero or more `ProductOverview`
- Is referenced by zero or more `TransactionRecord`

**Validation**:

- Branch must remain visible regardless of status.
- Branch may exist with zero linked products or zero linked transactions.

## Product Overview

Represents a merchant- or branch-level product shown in the dashboard.

**Fields**:

- `productId`: required UUID/string
- `merchantId`: required parent merchant ID
- `branchId`: optional parent branch ID
- `name`: required display name
- `status`: required product status
- `category`: optional string
- `unitPrice`: required monetary amount
- `transactionCount`: required integer
- `paymentVolume`: required monetary amount
- `lastPurchasedAt`: optional date-time

**Relationships**:

- Belongs to one `MerchantOverview`
- May belong to one `BranchOverview`
- May be referenced by zero or more `TransactionRecord`

**Validation**:

- Product must remain visible regardless of status.
- Product may exist without linked transactions.

## Transaction Record

Represents a payment record or payment summary line shown in dashboard activity sections.

**Fields**:

- `transactionId`: required UUID/string
- `merchantId`: required merchant ID
- `branchId`: optional branch ID
- `productId`: optional product ID
- `channel`: required value (`online` or `mobile`)
- `status`: required payment outcome label
- `amount`: required monetary amount
- `currency`: required currency code
- `customerRegion`: optional string
- `createdAt`: required date-time

**Relationships**:

- Belongs to one `MerchantOverview`
- May belong to one `BranchOverview`
- May reference one `ProductOverview`

**Validation**:

- Transaction status must be user-readable.
- Transaction may still be shown when the linked product or branch is missing from the current filtered context.

## Channel Snapshot

Represents comparative activity for online and mobile customer behavior.

**Fields**:

- `scopeType`: required value (`global`, `merchant`, or `branch`)
- `scopeId`: optional ID when scope is merchant or branch
- `channel`: required value (`online` or `mobile`)
- `userCount`: required integer
- `transactionCount`: required integer
- `paymentVolume`: required monetary amount
- `conversionRate`: optional percentage
- `lastActivityAt`: optional date-time

**Relationships**:

- May describe the full dashboard, a merchant, or a branch
- May be derived from linked `TransactionRecord` values in mock data preparation

**Validation**:

- Single-channel states are allowed; absence of the opposite channel must not break rendering.
- Count values must be zero or greater.

## Dashboard Selection State

Represents transient UI state used to keep drill-down context stable.

**Fields**:

- `selectedMerchantId`: optional merchant ID
- `selectedBranchId`: optional branch ID
- `selectedTransactionStatus`: optional status label
- `selectedChannel`: optional channel value

**Validation**:

- Selected branch must belong to the selected merchant when both are present.
- Clearing a merchant selection must also clear branch-specific selection.
