# Cast and history integration plan

## Source and ordering

`docs/CAST-HANDOFF.json` records the standalone cast/history snapshot before later presentation integration. Its subset hashes intentionally describe that original handoff. Use the final combined `release-manifest.json` for the coordinated release and verify its source-file SHA-256 values before copying or committing. Do not copy `node_modules`, `dist`, local QA fixtures or runtime data. The original cast baseline is separately preserved at `/workspace/shared/crosswalk-cast-baseline` with its own unchanged manifest and archive.

This feature needs a coordinated frontend and authoritative-server release. Merge the manifest-listed `lib` source modules, all matching `supabase/functions/_shared/engine` copies and `engine-manifest.json`, the Supabase `game-service.ts`, and the original `app/api/game/route.ts` together with the UI files. The new history and cast imports must exist on both server and client before either creation path enables the edition. `scripts/sync-engine-copy.mjs` maintains the mirror after review; `npm run check:engine` rejects drift.

No package-lock changes, account changes, SQL migration, save backfill, schema migration or private-data transfer is required. Both new-room creation paths author `castVersion: 1` and `historyVersion: 1`. Client-supplied markers are ignored. Joining an existing unmarked room does not upgrade it. Rooms from the cast baseline without a history marker retain their baseline arcs and receive no new history scenes.

## Integration checks

1. Apply the manifest-listed source and tests on the approved integration branch, resolving any concurrent frontend/backend edits deliberately.
2. Run engine parity, the complete test suite, frontend/backend types, Deno Edge check and the production build against the integrated tree.
3. Compare lint against existing debt; do not label the whole repository lint-clean.
4. Prefer a staging frontend and authoritative service review together. This environment could not provide browser access to its local preview, so report that limitation explicitly. At the approved coordinated rollout, confirm create, join, private histories, accepted retries, month transition, old-save resume and account/guest ownership.
5. Publish only after the parent/user's deployment approval. Coordinate frontend and backend versions; do not deploy only the frontend or only the new-room server marker. This task did not deploy or modify the release checkout.

A rollback after new history rooms exist must preserve the schema-additive engine support for their persisted data; do not blindly restore a server that no longer understands already-issued cast choices. Existing older rooms need no migration either direction.

## Local browser review handoff

`/workspace/shared/crosswalk-cast-qa` is a separate local-only harness importing the real UI and engine. Its scenarios include introductions, promises, missed promises/repair, correspondence, a later history scene, pre-cast legacy saves, and cast-baseline saves. It intentionally makes no live game/auth calls and uses a QA-only storage key. Keep it out of publication. A supported preview bridge or a browser on the same network namespace is required; the current cloud browser could not reach executor loopback.
