# Qualitative personal states

Presentation update based on checkpoint `24fdfa2ab0c0a59e7c1e764b10a76ccd50116db4`.

## Player-facing policy

- Personal states are descriptive: ten energy states, ten mood states, ten social states, seven learning states, nine craft states and eleven legacy states. Discrete capabilities keep their genuine engine steps.
- The HUD shows energy and mood as words. Other dimensions remain in the life journal; there is no dominant score dashboard, total, winner table, numerical path meter or garden fraction.
- Prices, cash, wages, paid hours, priority blocks, dates, people and actual activity counts stay explicit. Action eligibility still uses the authoritative engine reason before its wording is translated.
- Optional choice details, screen-reader labels, locked-action copy, legacy log entries, conversation receipts, world travel, bill review, tutorial and endings follow the same policy.
- A shared presentation helper supports boundary values and fractional inputs without changing, rounding or writing back any game state. No fractional reward layer was added.
- The browser's visible-game reader exposes a presentation summary rather than returning raw personal point fields.

## Audit coverage

Reviewed the map HUD and garden shortcut, activity selection and confirmation, climate and local participation descriptions, normal and regional recovery gates, all story choice families, cast/motive/world journals, public observer views, shared Chronicle/calendar, bill confirmation and overdraft notices, classic and monthly rules/tutorials, legacy and current endings, and the canonical player guide. No numerical point progress bars remain. Time-clock and practical economy quantities remain accurate.

The canonical player guide's authored introductory/rules sections were edited in `public/guide/index.html`. The generated character and location sections continue to come from `docs/guide-content.json`; rebuilding and checking the guide preserves them exactly. The separate author manual and personality notes were not changed.

## Verification

- Complete test command: `node --experimental-strip-types --test --test-concurrency=2 tests/*.test.mjs tests/*.test.ts`.
- New leak tests cover all action terms, hundreds of regional choices, optional details, ARIA, life journals/endings, observer summaries, genuine state boundaries, fractional values and preserved prices/time.
- Actual GameScreen handlers cover classic, legacy and current rooms, resource floors/band boundaries, disabled action rejection, the garden shortcut/board and legacy history.
- Actual Home handlers cover both rules editions, bill previews/overdrafts and legacy endings, alongside the existing full campaigns and save-recovery scenarios.
- Frontend and backend TypeScript checks, production build, guide generation/check and authoritative engine parity pass. No authoritative engine file or calculation was edited.
- Focused lint on the presentation policy, decision helper and new regression tests passes. A full-repository ESLint attempt was killed by the execution environment before diagnostics completed.

## Visual verification limit

Actual React SSR and deterministic handler tests passed. Native browser layout, real focus trapping and screenshots were not validated: the installed Chromium process aborted on a denied Unix socket operation, including an approved escalation attempt. Responsive label wrapping and contrast were reviewed in CSS; a browser pass should confirm the longest labels at narrow widths during final release integration. No publication or external service changes were made.
