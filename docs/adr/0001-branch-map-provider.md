# ADR 0001: Branch Map Rendering In Merchant Catalog

## Status

Accepted

## Date

2026-04-23

## Context

The merchant catalog branch edit dialog needs to show branch location data visually so operators can verify:

- branch latitude and longitude
- geofence radius
- general placement before saving branch changes

The team evaluated three practical options:

1. Google Maps embed or JavaScript API
2. OpenStreetMap iframe embed
3. Leaflet with OpenStreetMap-based tiles

Google Maps provides a polished experience but requires a Google Maps Platform key and billing-enabled account. For this internal dashboard work, that adds unnecessary setup and cost.

The plain OpenStreetMap iframe is simple, but it is limited:

- weak integration with the dialog UI
- no geofence overlay support in our app
- minimal control over marker and viewport behavior

Leaflet with OpenStreetMap-based tiles provides an interactive in-app map without introducing Google billing for this phase.

## Decision

Use `Leaflet` in the branch edit dialog with OpenStreetMap-based tiles for the current implementation.

The dialog will render:

- a branch marker from latitude and longitude
- a geofence circle when `geofenceRadiusMeters` is available and greater than zero
- a viewport fitted to the circle when a geofence exists

We will keep an external map link available for full-map navigation.

## Consequences

### Positive

- better operator experience than a static iframe
- visual geofence overlay directly in the app
- no Google Maps billing or API key required for the current phase
- flexible base for future map enhancements

### Negative

- adds a frontend dependency on `leaflet`
- still depends on a tile provider for map tiles
- public OpenStreetMap tile endpoints are not the right long-term choice for production traffic

## Production Guidance

The current implementation is acceptable for development and limited internal use, but **the tile provider must be changed for live production environments**.

Reason:

- the public OpenStreetMap tile service is not intended for unrestricted production/commercial traffic
- production usage needs a provider with clear operational limits, reliability expectations, and support

For live deployment, replace the current public tile URL with one of:

- a managed commercial tile provider
- a self-hosted tile service
- another approved OSM-based production map provider

This change should be made through configuration, not by hardcoding a provider directly in the component logic.

## Notes

- If future requirements demand Google-specific features, place search, or a standardized enterprise map provider, the map layer can be replaced later without changing the branch data model.
- Product and merchant dialogs are unaffected by this ADR; it applies only to branch geolocation rendering in the merchant catalog UI.
