# Current-only lint cleanup review

This follow-up is based on release `7630944879f7ffb65d918a0bbc0975deb20abc3d`. It does not change the published release or deploy either frontend or backend.

## Current result

Full repository lint now passes with **0 errors and 0 warnings**. The baseline
was 68 errors / 10 warnings; the mechanical checkpoint was 30 / 8. The second
stage resolves the render-time ref hazards, tightens response typing and fixes
two reproduced stale-request locks. Detailed verification and remaining browser
coverage limits follow the historical diagnostic inventory.

## Stage 1: mechanical cleanup (commit `a08fada`)

### Result and limits

The baseline was **68 errors and 10 warnings in 14 files**. That first cleanup left **30 errors and 8 warnings in 5 files**. Full-repository lint still failed at that checkpoint; the remaining rules were not disabled.

| Rule | Baseline | Remaining |
| --- | ---: | ---: |
| `@typescript-eslint/no-unused-vars` | 16 errors | 0 |
| `@typescript-eslint/no-explicit-any` | 13 errors | 4 errors |
| `no-empty` | 11 errors | 0 |
| `no-control-regex` | 1 error | 0 |
| `react-hooks/refs` | 18 errors | 18 errors |
| `react-hooks/set-state-in-effect` | 8 errors | 8 errors |
| `react-hooks/immutability` | 1 error | 0 |
| `react-hooks/exhaustive-deps` | 10 warnings | 8 warnings |

Baseline file totals (errors / warnings): `app/game-screen.tsx` 23 / 6; `app/game-tutorial.tsx` 4 / 0; `app/life-story.tsx` 4 / 0; `app/page.tsx` 13 / 3; `app/story-choices.tsx` 2 / 0; `app/turn-clock.tsx` 0 / 1; `lib/place-invitations.ts` 2 / 0; `lib/save-session.ts` 5 / 0; service `game-service.ts` 5 / 0; tests `action-artwork` 2 / 0, `cast-ui` 2 / 0, `point-presentation` 3 / 0, `world-actor-regressions` 1 / 0, `world-ui` 2 / 0.

Remaining file totals: `app/game-screen.tsx` 20 / 5; `app/game-tutorial.tsx` 1 / 0; `app/life-story.tsx` 2 / 0; `app/page.tsx` 5 / 3; `app/story-choices.tsx` 2 / 0.

### Changes separated from lifecycle redesign

- Removed unused imports, test module bindings and unobserved byte counters without removing assertions.
- Replaced nine explicit `any` annotations with the existing game/optional-result contract, a minimal owned-room summary input, `Partial<SaveRequest>` and the narrow optional browser-tool registration shape. The action-result guards now explicitly reject an absent result, which was already rejected through the derived absent-player condition.
- Documented all eleven intentionally ignored storage/integration exceptions. Fallback behavior is unchanged.
- Moved the life-journal reset effect after the state setters it uses. React still executes the effect after render; the compiler no longer reports a before-declaration reference.
- Included the clock's `period` dependency. Its supported value remains `month`.
- Captured the screen's lifecycle timer array in the renderer setup effect and cleared that same array in cleanup. The ref is never reassigned; callbacks append to the captured array. This preserves teardown ownership without a rule exception.
- Corrected the cast documentation's stale WebGL wording to illustrated SVG browser/mobile touch coverage.

The only new lint exceptions are single-line, unchanged-runtime service operations:

1. `no-control-regex` for the explicit C0-control rejection in request IDs. Changing the regex to satisfy the rule would obscure or change intentional input validation. `tests/game-service-validation.test.mjs` checks rejection of every U+0000–U+001F character, input immutability, length/type boundaries and retention of valid identifiers.
2. `no-unused-vars` for rest destructuring that removes private seeds, schedules, incident RNG and creation identifiers from the member response. Deleting these apparently unused names would leak server-private fields. The same new test asserts property absence for all six private keys, intact ownership/version fields, rejection of nonmembers and unchanged saved state. The PostgreSQL backend suite independently checks owner masking and private incident RNG.

The first checkpoint added no React exception, file-wide disabling or ignored source directory. Auth/session epochs, request IDs, pending-intent recovery, CAS/version checks, turn guards and receipt comparisons are retained.

### Baseline React diagnostic inventory

Locations below refer to the baseline commit, so they remain comparable with its lint log. Current `app/page.tsx` locations are one line later; the life-journal reset effect moved from line 45 to line 46. Repeated diagnostics at one location are counted explicitly.

Classification meanings:

- **Genuine risk**: a structural render/concurrency or stale-display risk exists. This does not claim a reproduced production failure.
- **Tested intentional pattern**: current sequential lifecycle behavior is deliberate and has regression coverage. This is not a claim that the compiler rule should be suppressed or that concurrent rendering is proven safe.
- **Uncertain**: the exact dependency/transition is not established by the existing regression tests; review it before modifying behavior.

| File and baseline location | Rule / count | Classification | Evidence and next step |
| --- | --- | --- | --- |
| `game-screen.tsx:83` (`latest.current`) | refs / 1 | Genuine risk | Exposes rendered game/active/busy/offline state to callbacks before commit. Screen tests cover stale and disabled actions, but do not simulate discarded concurrent renders. Review commit-phase publication while preserving immediate action/turn guards. |
| `game-screen.tsx:88` (`encounterRef.current`) | refs / 1 | Genuine risk | Same render-time publication concern for encounter-close guards. Screen regressions cover old close callbacks after room/month/player/region changes. |
| `game-screen.tsx:127` (`movingRef.current`) | refs / 1 | Genuine risk | Render-time movement flag can diverge from the committed UI under interrupted rendering. Duplicate and failed-travel regressions prove the current serialized behavior only. |
| `game-screen.tsx:130` (`onVisitRef.current`) | refs / 1 | Genuine risk | Render-time callback replacement could publish an uncommitted handler. Preserve confirmed arrival and current-context rejection when redesigning. |
| `game-screen.tsx:203` (`openRef.current`) | refs / 1 | Genuine risk | Imperative renderer arrivals use this render-published opener. Screen tests cover early callbacks, rejected moves and superseded career arrivals. |
| `game-screen.tsx:223` (`arrivalRef.current`) | refs / 1 | Genuine risk | Render-published arrival handler is shared by renderer callbacks and fallback timers. The same tests protect intended ordering; abandoned-render interleavings remain untested. |
| `game-screen.tsx:287` (`visitRef.current`) | refs / 1 | Genuine risk | Long-lived renderer dispatch reads the newest render's callback rather than an explicit committed value. Preserve request deduplication and disabled-state guards. |
| `game-screen.tsx:303` (`interfaceLocked.current`) | refs / 1 | Genuine risk | Render-time publication controls initial renderer interactivity. Work-preview tests assert that open UI disables map actions; commit timing still needs a concurrent test. |
| `game-screen.tsx:316`, `:317` (six diagnostics), `:320:180` | refs / 8 | Genuine risk | `lastPlace` is written and read during render, then flows into venue/action selection. Replace with explicit open/last-place state only after verifying close animations, replacement dialogs, Back/Escape and turn changes. Current screen tests cover returning to the same venue and dismiss/focus behavior, not real Radix exit animation or abandoned renders. |
| `life-story.tsx:44:117` | refs / 1 | Genuine risk | `latestContext` is updated during render. `player-life-responses` covers delayed stale-life replies; commit-vs-abandoned-render publication is not tested. |
| `story-choices.tsx:18:75` | refs / 1 | Genuine risk | `latest` publishes context, choices and action/receipt callbacks during render. `person-response-ui` tests exact receipts, deduplication, stale contexts and unmount; concurrent render safety is unresolved. |
| `game-screen.tsx:288:91` | set-state-in-effect / 1 | Tested intentional pattern | Initializes browser-width weather quality while creating an external renderer. Screen tests verify mobile/desktop quality precedes the first weather update. A lazy state initializer or separate browser subscription needs hydration/first-render review. |
| `game-screen.tsx:305:23` | set-state-in-effect / 1 | Tested intentional pattern | Resets transient UI and invalidates work/venue/navigation sessions on context change. Screen regressions cover room/month/player/region changes, late travel and superseded work previews. Do not remove or defer these invalidations merely to satisfy lint. |
| `game-screen.tsx:312:9` | set-state-in-effect / 1 | Uncertain | Closes an encounter when the player's place or visibility no longer permits it. Context/close regressions exist, but loss of visibility within the same context is not directly established. Add that transition before consolidating this effect with render-derived focus. |
| `game-screen.tsx:313:23` | set-state-in-effect / 1 | Genuine risk | Mirroring player place into the district selector creates an additional render and a transient old selection. The selector also has user-driven state, so deriving it unconditionally would change behavior. Separate navigation reset from manual district selection before changing it. |
| `game-tutorial.tsx:19:5` | set-state-in-effect / 1 | Tested intentional pattern | Restores optional localStorage state on room/offer changes. `tutorial-ui` covers invitation reload, replay, rapid clicks, skip and blocked storage. Preserve all those transitions in any initializer/store refactor. |
| `life-story.tsx:45:32` | set-state-in-effect / 1 | Tested intentional pattern | Clears prior private reply/message on a different life context. `player-life-responses` checks stale-life replies cannot claim success. The effect remains after the safe declaration-order correction. |
| `page.tsx:202:9` | set-state-in-effect / 1 | Tested intentional pattern | Mount bootstrap reads browser state and restores history/pending intents/rooms. `reliability-home` covers blocked storage, exact-ID recovery and restoring all campaign endings. Do not change bootstrap timing without these tests plus remount coverage. |
| `story-choices.tsx:21:17` | set-state-in-effect / 1 | Tested intentional pattern | Clears previous context's receipt, error, busy marker and submitted set. `person-response-ui` exercises changed context, failed/missing receipts and unmount. Guard and reset ordering must remain consistent. |
| `game-screen.tsx:120:10`, `:125:10` | exhaustive-deps / 2 | Uncertain | Chronicle/bills completion effects omit the tutorial object. Tutorial send internally uses refs, but no targeted test proves the open/close gates across room/replay/step changes. Adding the recreated object blindly reruns the effects on every render. |
| `game-screen.tsx:302:145` | exhaustive-deps / 1 | Tested intentional pattern; fixed | The timer array is stable and only appended to. Capture it inside setup so cleanup explicitly owns the same array. Screen unmount/in-flight regressions remain passing. |
| `game-screen.tsx:310:10` | exhaustive-deps / 1 | Uncertain | Life auto-open is intentionally once per context (`shownLife`) but reads `g`/`p` without depending on them. Same-context authoritative updates need a focused test before choosing exact semantic dependencies. |
| `game-screen.tsx:312:32`, `:312:60` | exhaustive-deps / 2 | Uncertain | Joined visibility IDs are a content signature for the array, but the rule cannot establish equivalence. Add same-context visibility-loss coverage, then represent the explicit permitted-encounter condition as a dependency. Do not switch to an unstable array just to silence the warning. |
| `page.tsx:200:60` | exhaustive-deps / 1 | Tested intentional pattern | App-lifetime owner subscription deliberately uses the first callback. `game-api` tests subscription/unsubscription; `reliability-home` covers owner switches, sign-out and delayed prior-owner saves/history. Stabilize the handler and its dependencies without resubscribing or weakening epoch invalidation. |
| `page.tsx:214:10` | exhaustive-deps / 1 | Tested intentional pattern | One-time mount restore uses initial `send`/`refresh`. Home regressions cover exact request recovery, wrong-owner deferred recovery and pending restore exclusion. Adding recreated functions would repeat initialization. Review an explicit stable bootstrap contract. |
| `page.tsx:220:381` | exhaustive-deps / 1 | Uncertain | Poll/reconnect intentionally keys on room/status/new-life flag while callbacks capture more values, including `g` and `send`'s flags. Many lower-version/protocol/reconnect cases are tested, but all retained callback-state combinations are not established. Do not naively restart polling on every snapshot or discard stale-request guards. |
| `turn-clock.tsx:90:6` | exhaustive-deps / 1 | Tested intentional pattern; fixed | `period` supports only `month`; including it makes the dependency contract explicit. Clock geometry/SSR tests verify monthly text and unchanged time semantics. |
| `life-story.tsx:45:17` | immutability / 1 | Tested intentional pattern; fixed | The effect executes after declarations, but source order confused compiler analysis. Move registration below the setters; retain context reset timing. Life-response tests pass. |

This accounts for all 37 baseline React diagnostics, including three safely resolved diagnostics and 34 remaining ones at the first checkpoint.

### Type debt identified at the first checkpoint

At this checkpoint, `app/page.tsx` still had four explicit `any` uses: confirmed room state, its latest-value ref, `receive`'s room-lookup envelope and parsed GET data (current lines 38, 53, 56 and 110). A sound fix needs distinct validated owned-member snapshots, public lobby envelopes and error envelopes. The server deliberately omits required internal `Game.host`/`Game.members` fields and private histories; blindly asserting raw JSON to `Game` would hide that distinction. Keep the existing runtime guards until typed envelopes and view/helper boundaries can be reviewed together. Merely removing the JSON annotation would silently retain implicit `any` and is not a fix.

### First-checkpoint verification

- Client and backend TypeScript checks pass.
- The serial 17-file focused batch passes **142 test results**, covering backend PostgreSQL ownership/CAS, Home recovery, renderer/preview guards, life replies, tutorial/storage, clock, view privacy and new validation/redaction contracts.
- The final timer-array/summary-syntax adjustment is rechecked with the screen and save-session suites.
- `check:engine` confirms all 32 client/server engine modules still match their exact dependency graph.
- Full repository lint was rerun and remains nonzero with the counts above.
- No new browser QA, production build, full aggregate test run, deployment or live database action is claimed for this follow-up.

At that checkpoint, the existing hook harnesses ran effects synchronously. They cannot establish real concurrent React rendering, Strict Mode mount replay, Radix exit animation or native mobile behavior. Those were specific remaining validation needs, not proof of a new regression. The second stage below adds actual ReactDOM concurrency coverage.


## Stage 2: committed lifecycle boundaries and response types

This stage replaces all identified render-time ref publication. `useCommittedRef`
publishes a value in a layout effect; `useCommittedEvent` keeps a subscription's
identity while publishing only committed callbacks. Immediate request, epoch,
turn, navigation and CAS locks stay in the event/transport code.

### Resolutions of the baseline React inventory

- All 18 `refs` findings: the screen's renderer/arrival/action callbacks, life
  journal and encounter hook now read committed values. Retained venue content
  is ordinary `{open, last}` state, so rendering no longer reads or writes a ref.
  Home's authoritative snapshot ref changes only when a reply is accepted or the
  session is left; a speculative render cannot roll it back.
- Screen quality initializes lazily from the current browser width, before the
  external renderer's first weather update. It no longer sets state in setup.
- Invalid encounter selection is derived from current context, place and venue
  visibility, then discarded with a guarded render-owned state adjustment. A
  same-context closure test proves it cannot reappear when the venue reopens.
- Manual district selection is keyed to player location. A location change
  derives the new district before paint and discards the previous local choice.
- Tutorial `send` is stable. Chronicle and bills subscriptions depend on the
  explicit tutorial step and stable sender. Life auto-open depends on its actual
  pending-event boolean rather than omitting the game/player objects. Matching
  open/close completion and same-context event-arrival/dismissal tests cover these
  dependencies directly.
- Owner subscription, bootstrap, room polling and reconnect use committed stable
  callbacks with complete dependencies. Rendered action handlers keep their own
  captured snapshot so retained old buttons cannot target a newer room or turn.
- The first stage's declaration-order, clock dependency and timer-array ownership
  fixes remain in place.

### Intentional effects retained with exact exceptions

Five single-line `react-hooks/set-state-in-effect` exceptions remain. Each has a
source comment and relevant regression evidence. This stage adds no file-wide
React exception or rule configuration change.

1. Screen context layout effect: invalidates turn/venue/work/navigation sessions
   and clears transient private UI before paint. Screen regressions cover context
   changes, late travel, stale callbacks and superseded work previews. Actual
   ReactDOM tests exercise suspended replacements and Strict Mode teardown.
2. Life journal context layout effect: clears private receipts and invalidates
   the prior request before paint. A real React regression reproduced permanent
   pending state after replacing a life. Per-request identity now lets the new
   context proceed without allowing an old completion to unlock its new request.
3. Encounter context layout effect: clears receipt/error/submitted state and
   invalidates the old request. Suspended-render, replacement, duplicate-submit,
   stale-callback and late-unmount tests protect exact-receipt semantics.
4. Tutorial storage restoration: synchronizes optional browser storage on room
   and offer changes. Existing restoration/replay/blocked-storage tests plus real
   Strict Mode and abandoned-room tests protect the intentional behavior.
5. Home bootstrap: reconciles optional browser storage and authoritative history
   with pending-intent recovery. Strict Mode issues the exact saved POST once;
   owner-switch tests prevent a delayed prior-owner reply from resurfacing data.

### Honest response boundary

Home's four explicit `any` values are replaced by `OwnedGameSnapshot`,
`PublicRoomSnapshot`, and their lookup union. Parsed response data stays `unknown`
until a runtime envelope guard succeeds; error handling exposes only recognized
string/boolean fields. Guards now require `isHost`, numeric housing, actual
string enums, and reject authority/private server fields. They validate the
usable response envelope, not every optional nested domain record; the backend
remains authoritative for those records.

`GameView` describes the shared rule/view data without ownership authority.
Authoritative `Game` additionally requires host/membership information; `move`
and service persistence keep that type. Member snapshots explicitly exclude
server seeds, schedules and incident RNG. Helper imports change only their type
boundary; engine mirrors are regenerated from the canonical modules.

### Concurrency regression method and remaining limits

`tests/concurrent-lifecycle.test.mjs` runs actual React 19, ReactDOM `createRoot`,
Strict Mode and Suspense transitions with an in-process jsdom document. It asserts
that mount effects replay and that the speculative render really ran while the
old UI remained committed. Its negative control reproduces the original unsafe
render-ref leak. The production hook/Home/screen/journal sources are compiled
for the test; only external API, map renderer and presentational dialog seams
are replaced. Tests never launch a browser, network listener or browser socket.

This is DOM-emulated concurrency evidence. It does not establish real Radix exit
animations, rendered layout, native touch behavior, audible playback or browser
accessibility acceptance. Those still require approved deployed-page browser QA.
No deployment or live database action is part of this cleanup.

### Final verification

- Full repository lint: **0 errors, 0 warnings**.
- Full serial `npm test`: **601 passed, 0 failed**. This includes the 12 real
  ReactDOM/Strict Mode tests and the PostgreSQL backend/CAS suite.
- Final screen recheck passes with the added tutorial open/close and same-context
  life-event arrival/dismissal cases. Only those test additions and this report
  changed after the full run; production source was unchanged.
- Frontend TypeScript, backend TypeScript and cached Deno Edge checks all pass.
- `check:engine`: all **32** client/server modules match their dependency graph.
- TypeScript emission comparison against `a08fada` confirms all **60** changed
  type-only canonical/UI helper and mirrored engine files emit byte-identical
  JavaScript with comments removed. Rule behavior and authoritative mutations
  did not change through the shared type boundary.
- Player guide and 197-page Travel Guide checks pass. Production build passes
  with the existing large-bundle advisory (main bundle remains over 500 kB).
- Validation ran on Node **24.19.0** in this task environment. The project/CI
  pin remains 22.22.0. New dev-only jsdom **27.4.0** supports that pin; no runtime
  dependency or existing locked dependency version was changed.
- Frozen release `7630944879f7ffb65d918a0bbc0975deb20abc3d` remains clean and
  unchanged. No browser acceptance run, publication or live backend mutation
  is claimed for this follow-up.

No lint diagnostic remains unresolved. Deployed-page browser, animation and
native-touch coverage remain the separate limitations described above.
