# Expanded cast: regression and life simulation

## Scope

The world now has 26 named people: eight new authored contacts plus 18 established identities (Mina, Eli, Jo, Neri, and the 14 regional residents). The new `castCharacters` array contains the eight newcomers. Existing characters retain their existing story and relationship systems; their connections can unlock an acquaintance-specific introduction to a newcomer.

These are deterministic engine simulations and regression tests. They establish reachable relationship arcs, truthful state transitions, resource behavior, and replay safety. They do **not** establish that human players find the game enjoyable, or replace browser usability testing.

## Reproduce

Run the focused regression suite:

```sh
node --experimental-strip-types --test tests/cast-relationships.test.mjs
```

Run the standalone simulation, including month-by-month examples from seed 0:

```sh
node --experimental-strip-types tests/cast-simulation.mjs --seeds=64 --examples
```

Both use local engine modules only. No production service, browser, database, or live save is touched. The standalone script emits a machine-readable JSON summary. An assertion failure fails the run rather than silently counting the life as successful.

## Full-life methodology

Seeds 0–63 each run five profiles, for **320 complete lives and 2,560 settled months**. Normal profiles begin with the actual $6,000 modern-economy starting balance, retain seeded life events, take one regular work commitment and one free rest when possible, and finish every month through `move(game, 'end')`. Work uses the existing 160 paid hours; travel uses actual unlocked world choices and fares. No friendship action adds cash or paid work hours.

Each profile follows Bram and Oren. If either is absent in the first month, the profile waits for the persisted encounter schedule; both remain discoverable by the second month. Once met, a missing local appearance becomes a community-room contact rather than erasing the relationship. The simulation reloads serialized state every month and separately checks that the cast view is identical after removing the server's hidden life seed.

The profiles are:

- **Purposeful:** Maintain two friendships through introduction, an explicit next-month promise, keeping it, honest disagreement, and reciprocal support. Stay in Alder.
- **Nomad:** Make the same two commitments while following Alder → Alder → Saffron → Ember Mesa → Glasssteppe → Pelagia → Saffron → Alder. Every run visits all five regions. Remote correspondence must preserve the actual relationship history.
- **Unlucky/skipping:** Make both promises, miss both due months, repair the first friendship, and acknowledge limits without repairing the second. Seeded setbacks remain active. The ending must preserve both missed promises and the unresolved second relationship.
- **Shallow:** Meet the same two people and never return to their arcs. The ending must describe beginnings, with no invented friendship or kept promise.
- **Exhausted:** An adversarial availability fixture resets cash, energy, and remaining priority blocks to zero at the start of every month. It verifies no free introduction, accidental relationship gain, or blocked month settlement. This is deliberately synthetic and is not a sustainable-budget strategy.

Every accepted cast action is checked against its visible time, energy, and happiness preview. Cash, paid-hour tracking, and chosen monthly habits must remain unchanged. The exact request is immediately replayed and must be byte-identical. A second interaction with that person in the same month is not available. No final life can retain an open promise.

## Measured results

Recorded with 64 seeds:

- **320/320 lives completed**, with no failed assertions
- **64 distinct persisted encounter calendars**
- **2,088 accepted cast interactions**, including **741 remote interactions**
- **15 distinct exact ending-text sets** across the profiles
- Every non-exhausted profile exhibited four distinct relationship timelines, reflecting whether the two contacts were first encountered in month one or month two

| Profile | Lives | Close bonds | Kept promises | Missed promises | Unresolved bonds | Stored memories | Final cash range |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Purposeful | 64 | 128 | 128 | 0 | 0 | 640 | $15,056–$15,766 |
| Nomad | 64 | 128 | 128 | 0 | 0 | 640 | $12,496–$13,206 |
| Unlucky/skipping | 64 | 64 | 0 | 128 | 64 | 808 | $15,056–$15,766 |
| Shallow | 64 | 0 | 0 | 0 | 0 | 128 | $15,056–$15,766 |
| Exhausted stress | 64 | 0 | 0 | 0 | 0 | 0 | −$1,850 |

Counts are totals across each profile's 64 lives, not per-life scores. The unlucky profile's additional memories include automatic missed-promise records and repeated zero-reward acknowledgments of limits. More memories therefore do not imply a better friendship.

Purposeful lives earned two close friendships and ten specific interaction memories each; shallow lives retained two introductions and no close friendship. Purposeful and shallow cash ranges are identical because relationship depth does not create income. Nomad lives finish exactly $2,560 below the matching stationary profile because of their six actual travel fares. The exhausted figure is the final $1,850 settlement after the explicit zero-cash reset, not an organic eight-month budget trajectory.

Ending-text diversity includes local versus remote support wording and contact ordering. It should not be described as 15 independently authored plotlines. The authored branches, explicit missed/kept status, and saved memories provide the substantive differences.

## Concrete seed-0 comparison

The purposeful profile meets Bram and Oren in month one, makes two promises in month two, keeps both in month three, reaches honest disagreement in month four, and accepts reciprocal support in month five. Its closing paragraphs remember Bram's route card and Oren's miniature ferry rather than granting another repeatable reward in months six through eight.

The nomad profile keeps those promises from Saffron, continues the relationships from Ember Mesa and Glasssteppe, then completes its remaining travels. Its support is worded as correspondence when the contact is not physically present.

The unlucky profile misses month three. In month four it repairs Bram's relationship and tells Oren honestly what it cannot take on. Bram can become close without erasing the missed walk; Oren remains unfinished without an invented repair. The shallow profile never advances beyond its first two conversations. The exhausted profile finishes with no cast memories and no invented cast ending.

## Regression coverage beyond the profiles

`tests/cast-relationships.test.mjs` covers:

- Eight distinct newcomer identities and goals, all ties to real known people, and 26 total identities without replacing the old 18
- Opt-in initialization only; old unmarked save bytes and ordinary settlement remain unchanged
- Identical schedules for identical seeds, immutable saved schedules, valid essential locations, and recovery after an absent month
- Pure views and hidden-seed-free serialized-client parity
- **384 resource/choice preview cases** over all eight newcomers, every normal branch, clamped resources, zero cash, zero time, and a fully used paid-hours cap
- Complete kept-promise → honest disagreement → support arcs for all eight new contacts
- All five regions' community-room repair access, including absent contacts
- Zero-time promises, timely renegotiation, and honest limits without invented completed work or automatic repair
- Acquaintance-based introductions through established local bonds and main-story support; forged introductions are rejected
- Disagreement repair distinguished from missed-promise repair
- Every newcomer's remote keeping, repair, and support prose
- Invalid, stale, future, wrong-place, and same-month alternate requests rejected atomically; exact accepted requests stay idempotent
- Per-player relationship isolation, inactive-player rejection, and stopped-life rejection
- No impossible next-month promise in month eight; actual due promises expire before final endings
- Receipts capped at 64, memories capped at eight per bond, and action logs capped at 32 under a synthetic 90-month imported timeline

The synthetic state-machine fixtures isolate branches and resource boundaries; they are separate from the legal-action full-life profiles. Backend creation, authoritative save/privacy, and UI rendering checks are covered by their own suites and are not implied by this simulation report.

## Interpretation and limits

The results demonstrate that deliberately maintaining two relationships is reachable within ordinary work, rest, travel, and monthly bills. Skipping can produce a specific, honest loss and a reachable repair; ignoring someone does not silently earn depth. Finished friendships stop yielding repeated monthly rewards. Cash scarcity alone does not block the new scenes, but meaningful scenes still require a priority block. A player with no time can reschedule or state limits once a commitment exists, and can always end the month.

The simulation deliberately leaves the established public story arcs to their normal month-end handling. It is not a test of maximizing all career, housing, romance, public-story, and friendship goals in one life. The end-to-end profiles focus on Bram and Oren; focused branch tests cover the remaining six newcomers. Human playtesting remains necessary to judge pacing, clarity, emotional impact, and whether invitations feel natural.
