# Coordinated Crosswalk presentation and relationship release

## Included changes

- Eight new recurring relationship arcs in a 26-person world, with persisted chance schedules, remote contact, promises, missed commitments, repair and truthful endings.
- Twenty-six layered backstories and 28 selective reciprocal histories, plus four optional later friendship scenes.
- Per-event price and frequency labels for monthly routines, derived from the same effective quote as payment. No economic charge or gameplay reward changes.
- Image-first choices with human intent upfront and optional numerical personal effects; prices, time, commitments and material risks remain visible.
- Scene-dependent expression sheets for Mina, Eli and Jo, driven only by the current displayed scene and confirmed current-scene response. Other characters retain their individual neutral portraits. Expression loading falls back to the same person’s neutral portrait and then their initial.
- Activities and conversations share a venue choice grid. A confirmed coffee activity can offer an optional conversation with someone currently present; it never spends a conversation block automatically.
- Individual character portraits, six interpersonal choice paintings, an accessible spoiler-free `/guide/`, and a player-facing README with technical details preserved under `design/`.
- Smooth camera focus and navigation, brief venue arrivals, and smooth mobile detail scrolling. Direct gestures cancel camera automation; reduced-motion preferences and hidden tabs settle immediately. Existing pending-visit identity/context guards remain intact.
- Hidden story scheduling is not presented as a future-scene countdown. Agreed deadlines and explicit costs remain visible.

The only overlap between cast/history and unit-price implementations was `app/game-screen.tsx`. It was merged by applying precisely the price helper import, per-card derivation and conditional price line; an inverse-transform assertion verified that all preexisting cast changes survived.

## Local checkout provenance

This checkout is a recovered-file snapshot, not a clone with the original remote ancestry. Its local Git branch is `integrate/cast-history-unit-prices`; its root snapshot commit represents deployed source `cd37af767a29cea10ae2b759a5614a0ba76018c7`. Do not push this synthetic branch over remote history. Apply the verified release delta onto the current real branch, preserving README commit `669b8c5b0474a54ce97c155ec761bdc74746a283` and any later approved manual changes.

## Build configuration

The artifact uses the verified public GitHub build configuration:

- Base path: `/crosswalk/`
- Supabase URL: `https://ijljlvadebdpfxtuheuh.supabase.co`
- Publishable key: the existing browser-safe repository variable, supplied only at build time
- Email authentication UI: `false`

No service-role key, access token or live room data is packaged. The root assistant verified these public settings; this integration task did not change them.

## Reproduce packaging

After the complete suite, both type checks, Edge check, engine parity and configured production build pass, commit the reviewed source and run:

`node scripts/package-release.mjs /absolute/output/directory`

The helper performs no network operation. It checks the matching client/server engine hashes, verifies every relative Edge dependency, and writes deterministic source, configured frontend and server `.tar.gz` archives. Tar ownership and timestamps are normalized. `crosswalk-game.sources.json` supplies the exact source files, entrypoint and existing `verify_jwt: true` for an approved native Edge deployment; add only the independently verified project ID at deployment time. It intentionally contains no project credential. `crosswalk-game.bundle.js` is a single-file ESM bundle of the same actual Edge entrypoint with only the official `npm:@supabase/supabase-js@2.117.3` import external. Rebuild it independently with `node scripts/build-edge-bundle.mjs /absolute/output/crosswalk-game.bundle.js`.

Run the actual bundled handler through the same real-Postgres backend suite:

`CROSSWALK_TEST_BUNDLE=/absolute/output/crosswalk-game.bundle.js node --experimental-strip-types --test tests/supabase-backend.test.mjs`

This checks the bundle's registered `Deno.serve` handler using isolated test-only SDK transport/auth stubs and real SQL. It does not access production credentials or rooms. Both unbundled and bundled variants must pass. After all artwork is available, run `GUIDE_ASSETS_ROOT="$PWD/public" node --test tests/guide.test.mjs` and repeat against `"$PWD/dist"` after build.

`release-manifest.json` links every archive and source file by SHA-256 to the same local source commit and engine snapshot. Run the helper again with unchanged inputs and compare archive hashes to verify reproducibility.

## Coordinated publication

The user approved coordinated publication; the root release owner performs it after all checks pass. Apply the delta to the real upstream branch, preserve concurrent documentation, rerun integrated checks and publish the corresponding frontend and authoritative Edge source together. A frontend-first transition is safe only briefly while the old server continues creating and serving its older editions; deploy the matching backend immediately afterward, then check both new and old rooms. Neither half alone establishes completed release compatibility. Use `docs/CAST-INTEGRATION.md` for old-save and rollback considerations. There is no SQL migration or save backfill.

After deployment, verify new guest creation, resume, join, private histories, precise retries and month transitions against the hosted frontend/API. Preserve guest ownership and old Site availability. A room code cannot recover an anonymous owner after browser credentials are lost. Email delivery/upgrade remains disabled and is not established by this release.

## Verification limits

Browser gameplay could not be exercised because the cloud browser cannot reach the execution session’s local preview listener. Automated engine/API tests, full-life simulations and rendered-component tests are not human playtesting. Browser/mobile layout, gestures, WebGL and emotional pacing remain unverified. Whole-repository lint contains existing debt and must be compared against baseline rather than described as clean. Intermediate worker manifests document their original snapshots; the final release manifest, not those historical subset hashes, defines the combined release.

## Relationship experience assessment

The structure supports recurring contact through persisted monthly appearances, named messages from known contacts, remembered promises and missed commitments, explicit repair, and earned biography/history reveals. Shared history changes four later friendship situations: whether café kindness implies unlimited opening hours, precise credit for a repaired stage, an optional game-table invitation, and consent to a recognizable comic portrait. These situations ask for participation or a respectful boundary rather than offering another generic score bonus. Each preserves a hopeful smaller ending without forcing romance, agreement or reconciliation.

Evidence is mechanical and textual: deterministic full-life simulations, save/retry/privacy checks and rendered interaction tests establish reachability, persistence and the consequences of choices. They do not establish that a player feels attached. The authored arcs are finite, only four shared-history pairs have dedicated later scenes, and repeated contact can still feel familiar after all authored material is seen. Browser playtesting of reveal discoverability, reading pace, image composition and emotional rhythm remains outstanding.
