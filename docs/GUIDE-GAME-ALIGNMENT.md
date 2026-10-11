# Travel Guide and game alignment

The Travel Guide authoring files are the canonical source of public world facts. The game projects them into small typed adapters; it does not maintain a separate editable copy.

## Verified baseline and changes

Audit baseline: `7630944879f7ffb65d918a0bbc0975deb20abc3d`.

- All 68 IDs, names, ages, residences, roles, family links and selected personality cues already matched the guide. The core encounter roster remains 39. Ensemble scenes add seven distinct lead counterparts, making 46 directly interactive identities; 53 people have scene presentation coverage. Contextual mentions are not map schedules, and a guide entry is not an instruction to spawn an NPC.
- All 75 venue names already matched, but their copies were independently maintained. `guidePlaceNames` now supplies those names directly from the guide.
- Destination choices and first-arrival receipts used older regional descriptions while the world panel used more recent climate/settlement wording. All three now use the same generated setting. Return visits retain their actual remembered welcome and current local changes.
- Venue-specific history, architecture and climate context was absent from the activity panel. `VenueGuide` provides a short introduction with optional details and links to the corresponding guide entry.
- The 30 objects and seven brands lacked a shared runtime catalog. The generated catalog preserves individual ownership, borrowing, care, use and venue associations. Reading it does not grant possession, place an object in the world, advance a story or locate a person.
- Character portraits, renderer diversity, authored voices, family residence distinctions, minor interaction safeguards and Oren's illness/capacity boundaries remain unchanged. Focused regression tests cover them.

## Authoritative files and adapters

| Source | Runtime use |
| --- | --- |
| `docs/guide-content.json` | Character facts, regional climate and settlement |
| `docs/guide-approved-roster.json` | Approved ID/name/age/residence cross-check |
| `docs/character-canon/personalities.json` | Individual communication, needs, stress and home-fit cues |
| `docs/character-canon/families.json` | Family roster and relationship verification |
| `docs/manual/venues.json` | 75 local names and venue context |
| `docs/manual/items.json` | 30 objects and seven embedded brands |
| `docs/manual/dispersed-families.json` | Cross-region family context |

Run `npm run canon:build` after a reviewed guide edit, then `node scripts/sync-engine-copy.mjs`. Review the resulting diff. `npm run canon:check` checks exact regeneration and source hashes. Both ordinary builds and the test suite reject drift. `docs/game-canon-manifest.json` covers all current authoring inputs, including the guide itself.

`lib/character-canon.ts` preserves the public API and contains encounter-placement helpers; its data is generated in `character-canon-data.ts`. `guide-world-data.ts` contains only the compact setting and venue-name maps needed by the shared engine. `guide-item-facts.ts` contains small static facts for story rules. Full object descriptions and venue prose live in browser-only `guide-catalog.ts`; they must not be imported by server rules.

Personality profiles remain writing aids, not behavior scores. This adapter does not choose a line or reward from MBTI, OCEAN, ethnicity or age. Current scene writing remains individually authored.

## Presentation integration

`app/venue-guide.tsx` exports `VenueGuide({regionId, placeId})`. The integration owner should import it in `app/game-screen.tsx` and replace the generic `place-welcome` paragraph with:

```tsx
<VenueGuide regionId={p.world?.region ?? 'alder'} placeId={selected.place}/>
```

The component owns its stylesheet. Place it after the tutorial panel and before the activity heading. The existing illustration, activity preview, real presence labels and live venue title stay controlled by the game. The component is descriptive, not a simulated building interior. Native `details` starts closed and resets when the selected venue changes; full guide links respect the Vite deployment base and open separately.

## Story-release coordination

The base alignment commit retained proposal labels. The separate story-status follow-on labels Whaleskin, Dalloway and Bracken as `playable_story_object` / `implemented` and displays “Story object.” Apply that follow-on only with the verified production story release. It does not make their transfers, bell placement, storage solutions or departures completed biography; each life records its actual outcomes. The public and private guides must receive the same renderer, validator and item-source update.

## Checks at this checkpoint

- 31 focused tests passed: guide projection, venue identity/presentation, character canon, family/child/illness boundaries, travel, current shared venue state and serialization.
- Frontend and backend type checks passed.
- ESLint passed for added/changed adapter, presentation, generator and test files.
- Canon regeneration and exact 34-file shared engine mirror passed.
- Real browser layout, the final aggregate, deployment and integrated venue-panel insertion belong to the combined release validation; they were not claimed by the isolated check.

## Held story-status follow-on validation

The isolated status/conditional-copy follow-on passed 12 focused tests, including 843 repeated catalog search/filter/history cases. All 197 static guide pages plus the 404 page built and matched regeneration; focused ESLint and canon drift checks passed. The story implementation itself was not tested in this checkout. The integration owner must hold this commit until the production story tests pass, then synchronize the private guide with the same `items.json`, `manual-expansion.mjs` and `check-catalog.mjs`.
