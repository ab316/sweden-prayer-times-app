# 0003. Generate prayer data from Awqat Salah and Nominatim

- **Status:** Accepted
- **Date:** 2026-05-02
- **Deciders:** project maintainers

## Context

The app needs accurate Sweden prayer times, offline-ready generated data, and a compact city catalog with coordinates. Awqat Salah is the prayer-time authority and defines the supported Sweden city list, but its city records only include provider ids and uppercase/ascii-ish names.

We need a free enrichment source for display names, coordinates, and a simple location type. GeoNames has free-plan restrictions, and Overpass bulk data made matching more complex than this Awqat-defined catalog needs. Nominatim can resolve each Awqat city name directly against OpenStreetMap search results.

## Decision

Generate prayer data with a storage-neutral pipeline:

- Awqat Salah provides supported city ids and yearly prayer times.
- Nominatim/OpenStreetMap resolves each Awqat city into the app-owned `Location` shape.
- `cities.json` is emitted as `Location[]` with `{ awqatCityId, awqatName, displayName, type, lat, lng, source }`.
- Unresolved Nominatim lookups are logged and omitted from `cities.json` and schedule generation.
- Source API responses are cached under `.cache/prayer-data/source-api/` by default.
- Uncached Nominatim calls are throttled to respect the public usage policy.
- Output contracts are written under `features/schedule/data/prayer-data/` by default.

## Alternatives considered

- GeoNames enrichment: rejected because of free-plan limits and credential requirements.
- Overpass bulk data: rejected because local matching was more complex than needed.
- Manual location catalog: rejected because generated data is easier to refresh and audit.
- Choosing the final backend now: rejected because these JSON contracts can later be served by multiple zero-cost options.

## Consequences

- **Positive:** the app gets a compact location catalog in its exact runtime shape.
- **Positive:** refreshes do not require GeoNames credentials or Overpass query tuning.
- **Negative / costs:** full uncached refreshes are intentionally slow because Nominatim is limited to about one request per second.
- **Negative / costs:** unresolved or questionable search results need review, and unresolved cities will not appear in generated output.
