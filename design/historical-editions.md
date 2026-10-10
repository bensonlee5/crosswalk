# Historical editions and compatibility

[Design and development index](README.md) · [Player-facing README](../README.md)

These are preserved implementation notes for earlier weekly editions, not the rules for newly created monthly-life rooms. Phrases such as “new games” and “now” refer to each update at the time it was written. Weekly prices, scoring, story structures, and test-environment limits are historical. Read [monthly life](monthly-life.md) for the later design and [development](development.md) for the current frontend/backend workflow.

## Earlier reliability and balance update

Creating, joining and resuming a room now share one operation guard, preventing interrupted requests from leaving the interface stuck on Saving. Cancelled or stale responses cannot unlock or replace a newer operation. Activity feedback clears on each attempt and shows success only after a confirmed response; uncertain network outcomes are explicitly labeled.

Time previews never show negative remaining blocks, and final-week story messages no longer promise another week. New rooms use balance version 1: eight underpowered activities have distinct recovery, happiness or income benefits. The first paid community day each week retains its full reward; additional days offer lighter $280 setup work with less energy cost and no new social/happiness reward. Existing rooms keep their exact original economy and scoring.

Regression coverage includes interrupted create/join/resume flows, repeated callbacks, old-save comparisons, preview/server parity, and full one-to-four-player campaigns. Run `node --test tests/*.test.mjs`, `node tests/balance-check.mjs --seasonal --current-balance`, and TypeScript checking. Browser/device rendering and audio listening remain unverified because Chromium cannot start in this environment.

## Earlier neighborhood gameplay update

- New games score the strongest of career, community or creative life paths (40), plus savings (25), happiness (25) and legacy (10).
- One shared opportunity each week; first player rotates. A shared garden rewards contributors when it opens.
- Mina, Eli and Jo each have three persistent story chapters and an earned 3D keepsake.
- Location menus stay open for deliberate repeat actions; promotions show the new role and wage.
- Older saved rooms retain their original scoring, income and turn order. The room schema remains additive JSON, with no database migration.

See [the implementation plan](../docs/GAMEPLAY-IMPROVEMENT-PLAN.md) and [verification and balance notes](../docs/GAMEPLAY-VERIFICATION.md).

### Gameplay checks (Node 24+)

- `node tests/game.test.mjs`: classic compatibility and original action previews
- `node tests/neighborhood.test.mjs`: new mechanics, score caps, stories and shared world state
- `node tests/api.test.mjs`: route integration using an in-memory D1 test double
- `node tests/balance-check.mjs`: reproducible illustrative eight-week strategies
- `npx tsc --noEmit --incremental false`: type checking
