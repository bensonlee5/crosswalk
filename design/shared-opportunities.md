# Shared opportunities pilot

Implemented mechanics, separate from the larger story proposals:

1. A $45 advance supper order creates one real, finite preparation job for another player at the existing café. Preparing takes one priority block, six energy and eight paid hours for a customer’s newly completed batch (four for the NPC standing batch), paid at the local entry rate with the existing take-home assumption. It makes the owner’s prepaid pickup ready and creates one uniquely identified $12 spare portion. A player can order, prepare and buy a spare at most once each per month across towns. They cannot take their own order’s job. The NPC’s independently funded standing batch means solo players can still choose paid work. Solo advance orders are immediately fulfilled by the actual host, so stock and options visibly change within the turn.
2. The community venue has one bookable evening room and a second annex that someone can prepare for one block/eight energy. A room costs $30; one block using it grants the chosen rehearsal or supper benefit. One reservation per player/month, including cancelled reservations. Other players see the actual claimant and can prepare capacity, wait for an owner’s release, or spend two blocks/$10 on their own covered-courtyard gathering. The host voluntarily offers the space, moving their own non-booked circle to a remaining room or courtyard. Preparing capacity early can keep it indoors; no forced replacement conflict follows prevention.

## Commitments and recovery

Only the owner may collect/cancel an order or use/release a booking. Unprepared orders and unused bookings refund their full fee; cancellations never restore the monthly allowance. Used bookings cannot refund. After each other player has had their next actual turn, NPCs fulfill unclaimed customer orders around busy service. Standing NPC orders settle at month end; unused rooms refund then too; a paid pickup remains available even when its owner has been away. A late NPC-filled order takes two collection blocks instead of the timely order’s one, with a full-refund alternative; this is disclosed before ordering. Unsold spare portions go to the pantry. Final settlement refunds uncollected meals because there is no next pickup turn. Food, rest, ordinary work, travel and independent relationships are untouched.

## Authority and compatibility

The new `sharedOpportunitiesVersion: 1` marker is server-authored only on new Supabase rooms. Existing unmarked rooms remain unchanged. The module uses clone/validate/commit for its mutation, within the production service’s existing command authentication, durable request receipts and compare-and-swap transaction. Replayed action receipts never pay again; stale choice IDs fail before spending anything. Partial state is never committed.

Shared order ownership, stock provenance, booking commitments and public cause/effect events are visible. Personal receipts and direct-response metadata are seat-private. The view functions are pure and do not silently initialize or upgrade saves. The larger Whaleskin, Dalloway and Bracken stories are not implemented by this pilot.

## Presentation contract

`sharedOpportunityView(g, p)` returns region-local public facts, available choices with exact reasons, private confirmed receipts, and public structured events. Receipt response: `{speakerId, speech, activity, emotion, gesture}`. Event: `{id, actionId, actor: {kind, id, name}, personId, region, place, publicCause, effect, receiptId?, timing: {round, respondByRound?}}`. Actors distinguish actual NPC work from player work. The event is a fact, never a disclosure of a character’s private goal.

Existing world choices include IDs `shared:<round>:<revision>:<region>:<key>`; the existing adapter submits `world:` plus that ID. Both encounter and world-board receipt adapters must look up `sharedOpportunityView(result, updated)?.receipts.find(r => r.actionId === choice.actionId)` before their old journal fallback. The shared board shows actual stock, capacity and causal history.

## Response-window check

The customer order pays for an eight-hour consolidated batch; the existing NPC batch is four hours. This makes new demand an economically different option. Other players receive their next actual turn to respond, so ordering late in the rotating turn order does not silently remove the job before they can see it. `helperTurns` records that public window; timely player completion keeps one-block pickup. NPC fulfillment after helpers pass is explicitly marked delayed, with busy-service collection taking two blocks or a full-refund choice. Solo host fulfillment is immediate. Orders/stock/receipts are still finite and repeated request IDs cannot create another payment.

Validation: 440-test serial aggregate passed before the final direct-host presentation/event-speaker addition; a final 46-test targeted run covered familiarity, real PostgreSQL mutation/ownership/privacy/retry behavior, and all regional WorldStory rendering after that addition. Frontend/backend types, engine-copy check, focused lint and production build passed. Sixteen deterministic solo-to-four-player eight-month campaigns and before/after-helper turn placements pass. The original 81 legacy state hashes pass with only the new familiarity metadata excluded. Whole-repository lint remains non-clean due to broader existing hook/ref/unused-code findings; this change does not claim to resolve that unrelated baseline. Integration owns final combined validation and publication.
