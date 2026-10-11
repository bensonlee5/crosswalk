# Contextual action incidents: implementation contract

This separate layer follows the shared-opportunities/familiarity release. The implementation covers 61 ordinary activities and 12 incident types. It does not retroactively change the frozen release or upgrade existing rooms.

## Scope and compatibility

Only a new create command with explicit `actionIncidents: true` opts the room in with server-authored `actionIncidentsVersion: 1`. Omitted or false input preserves prior rules; invalid supplied types reject before creation. This is independent of the venue-career opt-in. Old cached clients cannot activate incidents simply by creating a room after a backend update. Existing rooms keep their prior mechanical rules; reads and reconnects never initialize incident randomness. Start with the ordinary activity catalog only, excluding named story activities, promotion/housing changes, special shared projects, all direct character/story/life/shared-world choices, navigation, and end-turn. Future career work can opt in through a confirmed work-receipt adapter; this module never mutates jobs or employment contracts.

A successful eligible activity retains its normal effect, response and familiarity. It then has an occasional contextual incident: a coffee spill, a briefly shared observation, a small tip or price correction, a frustrating snag, or an unexpectedly lovely moment. A chance meeting can contain a person's actual words and small action. It never fabricates a friendship, grants another person's labor, advances a plot, or adds a second random roll to a later direct conversation.

## Authoritative state

- Game-private RNG state is generated from server crypto entropy on creation/join, separately from the monthly-life-event schedule. It is absent from every member view, including the owner view.
- Each player's private incident state stores an eligible-action ordinal, monthly caps, last occurrence by incident, and bounded receipts. No outcome depends on caller-controlled request IDs.
- Before mutation, capture the actual action, semantic family, place/region/weather and eligible incidental speakers. Only after the underlying action succeeds is a fixed set of three draws consumed (incidence, incident selection, incidental speaker selection), even when no incident occurs. No-event attempts advance the authoritative ordinal too.
- The base action, consumed draw, incident receipt, exact clamped deltas and familiarity are committed in one existing authenticated clone/validate/CAS transaction. Failed commands and lost CAS races persist none of them; durable retries return the already committed state.
- Receipt: `{id, ordinal, actionId, semanticKey, round, region, place, placeName, weather, source:'ordinary-action', incidentId|null, title, body, effects:{cash,joy,energy}, person?}`. Person data contains the confirmed actor ID, canonical name, speech, activity, emotion and gesture. Receipt IDs are unique to the seat/ordinal, rather than a repeatable activity ID.
- The UI receives a pure `acceptedActionIncident(beforePlayer, afterPlayer, actionId)` helper. Only actual ordinal advancement with a matching action returns a new incident; polls, retries, stale completions and another seat's response cannot replay it. The ordinary success UI appends this result after its normal response.

## Grounded encounters

An incidental speaker must be an actual local adult at the performed venue, eligible before the action. Use existing physical location and conversation availability, then reject remote, strained or currently bounded/unresolved contact. Begin with the original regional residents whose physical venue is authoritative; do not invent visits by secondary cast or relocate remote characters. If no eligible speaker exists, that incident is unavailable. Freeze the speaker and scene in the receipt. Brief speech advances person familiarity once alongside the ordinary action count, with no relationship/resource promise.

## Initial balance

- Default incidence 20%, selected after comparing 12%, 20% and 28% in simulation.
- At most two incidents per player/month, with at most one cash-changing incident.
- Cash changes no larger than $25 in either direction per month; automatic losses cannot make cash negative. Refunds cannot exceed the completed purchase price; tips require an actual eligible casual paid shift. No paid-hour inflation or rewards for free movement.
- Joy changes at most four internally; energy changes at most two internally. Presentation remains qualitative for these states and exact for dollars. No surprise additional priority-block spending.
- Do not select the same incident on consecutive eligible actions; rare cash incidents have a multi-month cooldown. Persist occurrence history across saves so reloads cannot erase the cooldown.
- Context uses existing regional venue names and actual weather for the scene, without applying a second weather penalty. Existing scheduled work cuts/repair bills remain the major-shock system. No dismissal in this layer: future career consequences need a visible warning and a causal work decision through the career owner's API.

## Verification gates

1. Successful actual activities can yield each authored incident and no event; direct people interactions, failed/previews/cancel/retries and navigation consume no draw.
2. Identical seed plus accepted actions replays identical results across JSON save/reload. Caller request IDs and concurrent losing submissions cannot reroll; actual PostgreSQL durable-retry tests establish exactly-once cash and person familiarity.
3. Two-to-four players have independent private histories/randomness; other seats never see incident state or hidden seeds. Hotseat owner can see only its legitimately owned histories.
4. Resource clamps, zero-cash loss, refund ceilings, salary/tip eligibility, monthly caps, rare cooldown, no repeat windfall loops, saturated counters and final-month behavior.
5. Incidental adults are local, physically present and available; prior boundary/strain prevents their vignette. The encounter grants no trust, affection, plot flags, booking or commitment.
6. Seeded campaigns compare realized rate by category, each player's incidents/month, net money, repeated-action runs, variance across seeds, streaks and cooldowns. Record sample size and observed ranges, not merely the configured probability.
7. Unmarked legacy saves remain mechanically identical including old receipts; backend/frontend mirrors and version gates stay aligned.

Ownership: incident domain/content/tests and narrow engine/private-mask hooks belong to the incident worker; release owner retains root accepted-command presentation. Implementation begins in a separate checkout from the release owner's final integration SHA.

## Measured initial balance

The reproducible harness is `scripts/simulate-action-incidents.mjs`. The committed report uses `INCIDENT_SAMPLES=150`, covering 11,700 eight-month incident-domain campaigns and 421,200 eligible attempts. Thirteen repeated activity-family scenarios are tested at three or six eligible actions per month with each of 12%, 20% and 28% trigger probability. Common random seeds are intentionally reused between families for comparison. These are domain experiments, not claims about complete campaign finances: base costs, wages and monthly bills are outside this harness.

At 20%, observed incidence was 20.31% with three actions/month (4.87 incidents/run) and 18.03% with six actions/month (8.65 incidents/run), the latter reduced by the two-per-month cap. The tip-heavy casual-work scenario averaged +$30.93 and +$48 respectively across the full eight-month run; its largest sampled gain was $80. The transit scenario averaged -$9.28 and -$14.40, with a worst sampled loss of $24. Coffee and market-food scenarios were near cash-neutral. No immediate repeated incident, rare cooldown, monthly incident cap, or cash-event cap was violated. Exact per-category rows are in `action-incidents-simulation.json`.

Twelve additional actual engine campaigns cover one through four seats, three deterministic seeds, eight months, accepted home/coffee/short-work actions, free map movement, rotating turns and JSON reload after every turn. Each seat records exactly 24 eligible-action ordinals; other seats' incident state and random state remain unchanged by its actions. These complement, rather than replace, the PostgreSQL command/concurrency checks.

Tips are a separate incidental thank-you. The planned financial recovery system applies to quoted take-home from paid-hour commitments, so tips, refunds and price corrections remain outside payroll recovery; no wage is counted twice. The old D1 path masks incident secrets defensively but does not opt newly created D1 rooms into this layer.

## Validation result

The isolated incident branch passes the full 524-test serial aggregate (including all prior 81 frozen legacy hashes), frontend and backend TypeScript, Deno edge checking, client/server engine-copy parity, focused incident-module/test lint, and the production build. The PostgreSQL suite includes 26 tests and checks actual concurrent CAS commits and durable receipt retries. The build retains the existing large-chunk advisory; whole-repository legacy lint cleanup is not claimed. Final UI integration and combined release verification belong to the release owner.

### Rollout follow-up

See `rule-compatibility.md` for the explicit create opt-in and shared compatible-client protocol. The final GET/restore and write guard intentionally requires a compatible client before exposing a marked room's state, while saved ownership/history are preserved. The core 524-test aggregate preceded this small protocol follow-up; the final follow-up passed types, Deno, engine parity and 45 focused tests including 27 PostgreSQL tests. Final Home UI retention checks and the combined release remain integration responsibilities.
