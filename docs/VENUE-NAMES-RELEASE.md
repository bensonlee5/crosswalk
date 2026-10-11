# Proper local venue names

Prepared 2026-10-10 from runtime baseline `8c41c33`.

## Naming contract

All 75 visitable venues use the frozen guide/game naming map: 53 generic labels were replaced and 22 established names retained. The 15 scheduled regional programs and two Alder story uses retain their base venue identity. New return-driven programs also derive their labels from that base. `tests/fixtures/venue-names-v2.json` captures the reviewed contract.

The frozen authoring-map SHA-256 is `30ff1cadef6ffaec712fa682a642fffa5de26a4fd957f5fa479186580b87b0c3`.

Current labels in existing saves resolve through one exact region/place/name alias table. It recognizes only the prior authored base labels, their known return-program suffixes, scheduled programs and the two authored Alder story names. Current map labels, place-name views, current venue views and discovery previews agree. Unknown/custom names and wrong-region/place matches remain unchanged.

Stored names, journal entries, past local-change narratives, receipt text and retry identities remain byte-for-byte historical. No save migration or backfill occurs. Stable region/place/action IDs, rules, resource effects, save-version markers and database schemas are unchanged.

## Presentation

Map labels remain dynamic; no map painting was regenerated. All 75 base names and 17 evolved names were exercised at 320px, 390px and desktop widths: 276 combinations. Full names remain in SVG titles, visible text fits the capped label rectangle, selected labels stay inside the viewport and taps retain the stable place ID. The Places list can wrap long names, and the clipped current-place HUD exposes its full title.

## Verification

Run sequentially with Node 24 and `NODE_OPTIONS=--max-old-space-size=768` in this shared workspace.

- Complete suite with `--test-concurrency=1`: **405/405 passed**.
- Frontend and backend TypeScript checks: passed.
- Client/server engine hash parity: passed.
- Cached Deno Edge entrypoint check: passed.
- Vite production build: passed. Its existing large-chunk warning remains.
- Actual generated Edge bundle against the real-Postgres backend suite: **24/24 passed**.
- Changed-file ESLint comparison against `8c41c33`: 50 existing diagnostics in each tree, **zero new diagnostics**. This is not a clean repository-wide lint claim.
- `git diff --check`: passed.

The 81 original frozen gameplay-state hashes are retained. A test-only allowlist reverses the reviewed labels in prose fields before comparison, while rejecting changes to mechanics, stable IDs, object keys or unapproved prose. Separate save tests verify historical fields and serialization are never modified by current-name views.

Automated renderer geometry and source checks do not establish real-device touch, visual-font rendering or browser playtesting. Those remain part of the integrated release check.

## Coordinated release and bundle

Release the frontend and matching authoritative engine together after merging the guide expansion. No SQL migration, auth change, CORS change, JWT setting change or other security-setting change is included. This checkout did not publish anything.

The independently generated `crosswalk-game.bundle.js` is 595,903 bytes, SHA-256 `a24fa09a55257a2d1f3147df848165230b9b5eea4126c257e781fb06e08dbdd0`. It was generated with `scripts/build-edge-bundle.mjs` and tested through the registered handler using isolated test-only auth/transport stubs and real SQL. Regenerate final release artifacts from the merged source; the local Vite build here is a compile smoke check, not a published configuration.
