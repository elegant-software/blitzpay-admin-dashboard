# Research: Payment Operations Dashboard

## Decision: Redesign the existing authenticated dashboard section instead of replacing the merchant catalog

**Rationale**: The current application already has an authenticated shell with a generic `dashboard` section and a separate `merchantCatalog` section. The feature request is to redesign the dashboard around merchant, branch, product, transaction, and channel activity, not to remove detailed merchant maintenance. Using the shell's existing dashboard section for the new overview preserves detailed merchant workflows while improving the default landing experience.

**Alternatives considered**:

- Replace the merchant catalog entirely: rejected because the merchant catalog already handles detailed merchant, branch, and product editing flows that are still needed.
- Create a separate top-level app route just for the operations dashboard: rejected because the current shell already supports section switching and should remain the user’s primary workspace.

## Decision: Use a dedicated mock-data service with typed dashboard models

**Rationale**: The feature explicitly calls for mock data in the initial phase. Keeping that data in a feature service preserves the existing service boundary rules, avoids hard-coding large datasets directly into the shell component, and makes the eventual live-data swap straightforward.

**Alternatives considered**:

- Inline mock arrays inside `auth-shell.component.ts`: rejected because it would overgrow the shell component and blur the boundary between layout and data preparation.
- Introduce persistent local storage for sample data editing: rejected because the feature only requires static representative data for now.

## Decision: Model the dashboard around aggregate operational summaries plus contextual drill-down panels

**Rationale**: The feature’s primary user value is rapid operational understanding. A structure with overview metrics, merchant leaderboard/portfolio cards, branch and product context, transaction summaries, and online/mobile usage snapshots aligns directly with the specified outcomes without forcing users through the maintenance-first merchant catalog workflow.

**Alternatives considered**:

- Single giant flat table: rejected because it weakens scanability and makes cross-entity relationships harder to interpret.
- Charts-only dashboard: rejected because operations users still need record-level context, statuses, and linked business entities.

## Decision: Keep mixed-status visibility as a first-class dashboard rule

**Rationale**: The feature specification explicitly requires visibility of non-active merchant, branch, and product records. The dashboard should therefore summarize and list records across statuses, then label status clearly instead of hiding records or treating inactive states as exceptional.

**Alternatives considered**:

- Show only active items in overview cards: rejected because it would contradict the feature requirement and hide operational risk signals.
- Split each section into separate active/inactive screens: rejected because it increases navigation cost and undermines at-a-glance understanding.

## Decision: Use business-readable transaction and channel summaries rather than raw payment event feeds

**Rationale**: This phase uses mock data and aims at operational clarity, not payments forensics. Aggregated transaction outcomes, recent movements, and online/mobile usage comparisons are sufficient to validate the user experience and support the planned success criteria.

**Alternatives considered**:

- Full event timeline with payment processor detail: deferred because it adds complexity without being necessary to validate the dashboard redesign.
- Merchant-only financial summary with no channel dimension: rejected because online/mobile comparison is a core requirement.

## Decision: Treat the dashboard as mobile-aware but desktop-prioritized

**Rationale**: The specification requires the layout to remain understandable on desktop and mobile-sized screens, while the primary audience is internal operations staff. The design should therefore optimize information density for desktop but stack and simplify panels appropriately on narrower viewports.

**Alternatives considered**:

- Desktop-only dense grid: rejected because it fails the explicit mobile-size usability requirement.
- Fully separate mobile dashboard design: rejected for this phase because it increases scope unnecessarily.
