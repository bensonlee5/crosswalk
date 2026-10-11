# Concrete descriptive copy

Base: `7187336` (the separately frozen Travel Guide / venue-name release).

## Scope

107 reviewed prose substitutions across ten runtime modules. This is a focused language pass, not a new inventory, story system or catalog expansion. All 75 venue names, 30 catalog objects and seven recurring makers remain unchanged. Source paths and every exact before/after fragment are recorded in `tests/fixtures/descriptive-copy-replacements.json`.

- `lib/place-invitations.ts`: all 15 venue welcomes, using concrete furniture, utensils, food and workbench objects.
- `lib/game.ts`: 23 activity, opportunity and neighbor-story fragments, including the balanced cooking preview.
- `lib/economy.ts`: five monthly-habit and activity descriptions. Exact quantities, prices, grocery credits and opt-in/no-renewal terms remain intact.
- `lib/regional-life.ts`: ten exploration and civic-life passages. Alder retains close brick port streets; Saffron has pale paving and shaded ochre arcades; Glasssteppe has stone galleries and copper repair benches; Pelagia has raised beds and tide-marked landings; Ember Mesa has timber porches, mulch and cottonwood shade.
- `lib/world-life.ts`: 29 resident, regional-program and food passages, including both current monthly conversations and earlier conversation editions.
- `lib/cast-characters.ts`: seven named-object and clothing details. Nine Locks uses the current blue-and-cream board and rounded counters; Tomas's historical crate-lid gift is explicitly the first board.
- `lib/character-cast-canon.ts`: two mentions of Oren's Kestrel tin. His existing capacity, illness and rest boundaries are unchanged.
- `lib/character-history-scenes.ts`: two object details; existing consent and friendship choices are unchanged.
- `lib/life-events.ts`: six event and receipt fragments naming damaged materials, replacement food and repair equipment.
- `lib/story-arcs.ts`: eight soup-supper, tomato, onion and stage-frame details within the existing arc.

All nine shared engine modules are mirrored by `scripts/sync-engine-copy.mjs` and the engine manifest is refreshed. `place-invitations.ts` is presentation-only.

The tutorial, practical action labels, image alt text and numeric/qualitative presentation code were audited and left unchanged. Their job is instruction or accessibility; added sensory detail would obscure the task. The public/private guide source JSON and templates need no paired update: runtime references reuse the existing catalog facts and do not redefine those objects. Whaleskin, Dalloway and the Bracken Redbank proposal are not inserted into runtime history.

## Before / after samples

- Home reset: “Tidy up, put on music and recharge” → “Fold the knitted throw, dust the monstera leaves and put on a record.”
- Earlier Rowan conversation: “a cutting for your windowsill” → “a pothos cutting … Pale roots curl in its jam jar.” The current monthly conversation also places a rooting pothos beside Rowan's seed list.
- Monthly café dates: “Coffee, snacks and familiar faces” → “Coffee, lemon biscuits and familiar faces.”
- Hobby activity: “A small project with no deadline” → “Paint a ceramic bird, one blue feather at a time.”
- Repair receipt: “Jo lends the equipment” → “Jo lends a hand plane, clamps and a screwdriver.”
- Ada's current conversation: “You tell Ada which part of the discussion you lost” → “Over Kestrel No. 2 tea, you tell Ada which part of the discussion you lost.”
- Tomas's current conversation starts with his blue Gullwing lunch tin, keeping its ownership explicit.
- Regional food receipts now name the existing regional dish, such as smoked mushroom dumplings in pepper broth, instead of “the meal.”
- Nine Locks: “three tile boats across a crate lid” → “a rounded teal counter across the blue-and-cream Nine Locks board.”

## Art and canon review

Actual pixels reviewed: the `home_reset`, `maker_hobby`, `market_cook` and `arcade_play` action paintings; apartment, arcade, makerspace, transit, garden, market, community and fitness location paintings; the current Bram, Tess and Leila portraits; and the Nine Locks object painting.

The monstera's split leaves, knitted throws, record player, ceramic bird, pinball and rounded Nine Locks counters are supported by the reviewed paintings. Bram's blue knitted scarf and Tess's charcoal apron were checked directly against their current portraits. Region histories and object descriptions in `docs/manual/{venues,items}.json` ground local materials, shared products and ownership.

The pothos cutting, crocus bulbs, water spinach and diner jade plant are authored scene details suited to their settings. They are not claims that an indistinct painted plant has been botanically identified. No alternate image or plant identity is substituted into alt text. No unresolved item-art contradiction remains from this pass.

## Preservation and verification

A source reconstruction check applies the 107 listed substitutions to `7187336` and reproduces every edited runtime source byte-for-byte: no additional code, condition, identifier or arithmetic edits are hidden in the pass.

`tests/descriptive-copy.test.mjs` adds seven focused tests covering:

1. All 74 action IDs, titles, order and mechanical data; resident identities, region definitions and participation effects match the frozen base contract.
2. Concrete welcome/activity examples stay brief and practical labels stay intact.
3. Monthly quantities, charges, grocery credits and once-per-month terms remain exact.
4. Recurring products match the unchanged 30-object/seven-brand catalog and proposed plots remain absent from runtime.
5. All five food previews stay pure, commit their exact quoted effects and remain idempotent; previously stored receipt text is untouched.
6. Plant details and current monthly dialogue are actually reachable through runtime views; repair receipts preserve effects.
7. Test-only prose normalization cannot change machine identifiers, flags, cash, hours or unreviewed prose.

The original 81 frozen campaign hashes remain unchanged. Their test reverses only exact reviewed substitutions in known narrative fields before comparing those original hashes. This helper never runs in production and never migrates stored receipts.

Final verification on 2026-10-10:

- Full suite: **414/414 passed**, no skips, using `NODE_OPTIONS=--max-old-space-size=768 node --experimental-strip-types --test --test-concurrency=1 tests/*.test.mjs tests/*.test.ts`.
- Frontend and backend TypeScript checks: passed.
- Shared engine hash parity and cached Deno Edge typecheck: passed.
- ESLint for every changed runtime/test source: passed. Repository-wide lint is not claimed.
- Production `/crosswalk/` build: passed. The existing large-chunk advisory remains; no build error.
- `manual:check`: passed for 197 pages plus 404, 68 people, five towns, 75 venues, 30 objects and seven brands.
- Public/private item and venue source JSON: independently byte-compared and identical.
- Exact source reconstruction from the reviewed replacement manifest: passed. `git diff --check`: passed.

The unrestricted parallel test run had four process-level failures and also exposed the expected frozen-prose mismatch before its exact reversal helper was added. All process-level failures passed in a serial rerun, and the finalized full suite passed with the bounded command above. The original frozen hashes were never regenerated.

This pass has not been published. Live browser/deployment verification belongs to the coordinated integration release; no new browser-layout claim is made for prose-only changes.
