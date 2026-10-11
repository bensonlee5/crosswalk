# Current module map

## Browser

- `src/main.tsx`: Vite entrypoint and global styles.
- `app/page.tsx`: account/session ownership, confirmed room, pending commands, restore/history, Home and month transitions. Keep its epoch, owner and request guards together.
- `lib/game-api.ts`, `lib/auth-manager.ts`, `lib/supabase-client.ts`, `lib/save-session.ts`: authenticated transport and durable local intent. Never infer ownership from a room code.
- `app/game-screen.tsx`: current location, preview/confirm, dialogs and navigation coordination.
- `app/game-engine.ts`, `app/isometric-scene.ts`, `app/isometric-authored.ts`, `app/region-layouts.ts`: SVG illustrated maps, authored doors/paths, avatar movement, picking, pan/zoom and lifecycle cleanup. No 3D renderer.
- `app/person-response.tsx`, encounter panels and `lib/person-*`: direct character response, staged portrait/gesture and exact confirmed receipt.
- `app/venue-career-board.tsx`, `lib/careers.ts`, `lib/career-content.ts`: real venue employment, offers, work, learning and private leads.
- `lib/ensemble-story.ts`, `lib/ensemble-story-content.ts`, `app/ensemble-story.tsx`: authoritative crossing stories, ownership-aware choices and named response scenes. Contextual cast lists never create map actors.
- `lib/financial-recovery.ts`: bills, arrears and recoverable restrictions.
- `lib/action-incidents.ts`: authoritative bounded ordinary-action incidents; `lib/action-familiarity.ts`: persisted repeat history.
- Sound modules and `app/sound-controls.tsx`: semantic cues, gesture unlock, persisted mute/volume. Completion sounds follow accepted commands.

## Authoritative state

`lib/game.ts` dispatches current commands. Domain modules own their rules and structured views. The Edge service imports an exact generated mirror under `supabase/functions/_shared/engine/`. Edit canonical `lib/` modules, regenerate the mirror and verify byte parity; never hand-edit both copies.

`supabase/functions/crosswalk-game/` owns authenticated HTTP validation, private-state masks, room ownership, durable requests and compare-and-swap storage. SQL migrations define persistent transaction behavior. The current schema is required; unsupported stored games are not migrated or reinterpreted.

## Content and guides

`docs/guide-content.json` is the single full character/location biography source. `docs/character-canon/` stores distinct personality/family data and provenance. `docs/manual/` contains venue, item and brand catalogs. `scripts/build-game-canon.mjs` generates the checked character, world, venue and object adapters. `scripts/build-guide.mjs` and `scripts/build-manual.mjs` generate public help and Travel Guide pages. `public/paintings/` contains current art and manifests; preserve exact source/license provenance.

## Change boundaries

Extract presentational panels before moving command lifecycle logic. Keep action preview separate from mutation. A repeated receipt must not replay sound, animation, money or familiarity. Test sign-out, changed ownership, stale responses, failures after commit, repeated input and interrupted navigation whenever these boundaries change.
