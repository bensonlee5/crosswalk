# Twenty crossing stories in the current game

The production system has three four-beat anchors and seventeen smaller two-beat arcs. It is part of every newly created current room. It does not upgrade earlier stored formats or offer a feature toggle.

## Story map

- Pelagia: Whaleskin (ownership, drainage inspection and misleading credit), One More Booking (Ravi's real orders), The Boring Part (Nila's film), Exactly Enough Biscuits (Lio's finite service)
- Ember Mesa: Dalloway (June's station farewell and diner handover), A Very Moving Empty Cup (Kit's actual drawing), The Convenient Extra Stop (Esperanza's van), The Quieter Radio (Rosa's match)
- Alder: Bracken (Nell's drum and duvet, Ruth's holiday, Jonah's paid room), Tomorrow's Bread, Yesterday's Hours (Hugo's reserved portions), The Last Last Crossing (Tess's two clocks), A Verse for Twelve (Mina's private lyric and Eli's actual diners)
- Glasssteppe: Ordinary Hours at a Rush Price (Qiao's diary), Two Seconds of Silence (Akira's work and theatre), The Connection Everyone Almost Made (Ren's timetable), The Informal Official Portrait (Liang's pose and Jian's optional hobby drawing)
- Saffron: Before We Begin (Inés and Ada's cinema), Never Listening Again (Farah's closing time), A Welcoming Rule (Sami's rules and Vera's voluntary game), A Hot Lunch, Eventually (Leila's food and Tomas's break)

There are 46 main beats, 72 authored conditional responses and five later-service continuations. A response is an added legal choice with its source event, actor and player provenance. A shared name or an unobserved world event is not counted as a player's experience. Pure views record nothing.

## Ownership

- `ensemble-story-content.ts`: branching natural prose, production purchase prices, exact response speakers, finite paid-hour commitments, causal signals and correspondence rules
- `ensemble-story-types.ts`: authoritative shared state, private receipts, public causal events, view contracts
- `ensemble-story.ts`: initialization, eight-active-arc bound, monthly progression, choices, pay/refund accounting, views and member projection
- `app/ensemble-story.tsx`: three nearby invitations and one expandable scene using existing confirmed-choice/character presentation; optional venue/story focus; private journal
- `game.ts`: narrow dispatch, monthly boundary and post-travel destination hooks
- `action-familiarity.ts`: success-only semantic keys and the actual response speaker
- `economy.ts`: exported existing wage quote, shared paid-hour ceiling, withholding and recovery deduction

The service owns authentication, actor selection, request identity, optimistic version checks and atomic persistence. It initializes ensemble room/player state at creation and joining, requires it at the single current-schema boundary, and uses both member projection functions. Engine copies are regenerated from the service dependency graph by the release owner.

## Pacing and agency

Eight shared arcs may be active; a regional setup starts only after an actual arrival, and remaining slots follow player locations and incoming consequences. A solo player can complete up to four finite main beats in one representative month at their individual priority-block costs. In multiplayer each player can take at most two main beats per thread/month; other seats may continue without a global waiting gate. Every seat can make a separate personal choice after the shared decision. Paid tickets remain individual, work belongs only to the accepting player, and a refund cannot end another player's supper. Unanswered beats get one named NPC action at the next monthly boundary. NPC actions never create player wages, receipts, promises or familiarity.

Travel uses existing discovered routes, costs and priority blocks. Live local story destinations are revealed only after actual travel. The UI's cast list is context, not a presence list; only the lead counterpart is staged in the authored local scene. No new map actor is inserted. Neri's Bracken participation stays on a call from their current location. Cross-town links explicitly use correspondence, separate quotes, permitted copies or separately paid local services; towns do not share a physical table or van route.

Goods have individual production prices. Small gigs use four or eight paid hours at the local entry rate and one priority block. The shared quote function supplies gross pay, ordinary withholding, take-home, recovery repayment, materials and cash delta. All checks precede mutation. A request replay cannot create a second world action or paycheck.

## Branch invariants

Early Whaleskin inspection removes the flood/accusation/rescue-crop branch without replacing it with another crisis. Tavi owns the gift, even when Lata transports it by agreement. Dalloway full-service credit changes the station-retention offer, and June remains a cook. Bracken clarification removes the incompatible-story confrontation but does not cancel Jonah's occupancy. Nell retains the drum and duvet.

A private loaf is not café stock. A quote is not an order. Refunds belong to the original ticket payer, close only unaccepted dependent offers and preserve completed wages. Later-service purchases are new orders under existing arrangements, not restored crises or old stock.

## Verification

The normal-route proof (`scripts/prove-ensemble-routes.mjs`) starts twenty independent new lives, uses ordinary employment and household bills, travels at each normal regional unlock, and completes every finite thread without state edits. The three four-beat anchors include prevention/accurate-credit/clarified-lodging paths; Pelagia is also tested as a first visit in month eight. This establishes individual reachability and time/cash budgets, not that one life can exhaust all twenty stories.

Focused tests cover all 137 non-refund main alternatives, three prevention branches, four-seat independent purchases, payer-specific refunds, provenance, pure reads, modern wages/recovery, atomic rejection, replay, privacy and NPC attribution. These automated checks establish implemented mechanics, not human enjoyment. The final integrated build also needs server/member/room lifecycle checks, UI confirmation/arrival checks and exact-revision deployment verification.

Human playtests should ask players what caused a newly offered choice, why they chose their own role, and whether the surprise felt like somebody's personality rather than a task list. Test ordinary refusal and early prevention as well as the elaborate reversals.

Reachability follow-on verification: 23 focused tests passed, including all 20 natural routes and a month-eight Pelagia arrival. The recorded anchor routes in `ensemble-route-proof.json` leave one priority block after Pelagia/Ember travel plus all four scenes, and two after Alder’s four scenes; ordinary bills are then settled without arrears. Twenty separate lives are used. Twelve eight-month local policies across 1–4 players produced 6–9 choices per seat and 1–6 accepted crossings per run. One three-player policy produced no accepted interplayer crossing, so this is not a density guarantee. The two-main-part cap leaves another seat legal current choices; it does not compel participation or guarantee a satisfying crossing for every seat.

## Finite personal aftermath

The independent 5ab2f4d matrix found that globally consumed main beats left several seats without another-player crossing and emptied later local turns. The correction adds three authored personal follow-through stages to each of the same twenty threads. These are not extra global crises: each person's own consent, account, creative involvement or bounded commitment persists in their private receipts. Public effects can create materially different available options for the next local thread. Paid source orders, job claims and stock retain their original finite guards.

The five local loops are:
- Alder: Bracken → bakery → café → song → Bracken
- Pelagia: Whaleskin → freight → broth → film → Whaleskin
- Ember: Dalloway → drawing → commentary → collection → Dalloway
- Glasssteppe: laundry → theatre → timetable → portrait → laundry
- Saffron: cinema → food → shop → game → cinema

Stages open at settlement +1/+3/+5 months, capped at the actual final month; completed earlier own stages remain prerequisites. Once open, an unchosen stage does not expire. A month-eight visitor still pays ordinary travel and scene costs. The route tests visit a real source scene as well as the target and fit at least one substantive aftermath choice. No future stage is advertised as actionable before its own time/prerequisites.

The latest relevant source event is pinned into each aftermath action ID. If somebody changes that public source before confirmation, the old action is rejected without mutation. A person cannot replay a completed stage or choose another seat's path. The private receipt carries the exact alternative, personal outcome and cost; public events/logs carry a generic stage label, the authored observable effect and stable semantic public-effect signals. These effects are visible by design and may permit inference about a public choice; inward prose, precise private paths and wallet amounts are not copied into the public record. Views expose `cause.crossingId` for exact source attribution.

The six actual paid ensemble gigs now declare their career field: Ravi's loading is practical work; the supper, preparation, canteen and food-collection work is service. Only confirmed gained paid hours add experience, through the existing career evidence path. Rejections, unpaid actions and replay add none; this does not itself award a role or referral.

Thirty focused tests pass, including all 20 normal story routes, 32 real first-visit month-seven/eight regional aftermath routes, source-dependent alternatives, changed-source rejection, separate personal progress, bounded endings, public/private projections, and reload-safe paid-hour experience. A preliminary seed-13 comparison is recorded in `ensemble-aftermath-check.json`: the four-seat local/cause-first/late-interest policies no longer have empty viewed turns, and all seats receive direct other-player consequences. One travel-circuit turn is still empty. Broader independent seeds, non-purchase consequences, actual-render checks and human enjoyment remain separate claims.

## Full response-path privacy

Independent full-envelope testing found that removing the ensemble receipt was insufficient: ordinary world action counts and departure records still retained the exact private aftermath action ID. The final member projection therefore also removes other seats' old personal-life/core-story state, aspiration choices, activity bookkeeping, world story/journal/accepted choices, exact action counts, regional last actions, completed personal opportunities and conversation/bond histories. Region, discovered routes/places, visits, earned public milestones and deliberately public status remain. The owner still receives the original complete authoritative state; projection does not rewrite it.

Redacted personal read views return no world decisions, relationship history, private life ladder or core-story receipts. The public map can still read the retained location and known venues. Authored public consequences and intentionally public resources can support inference about an observable action; this is protection of private fields, not a claim of inference-proof secrecy.

A real-handler regression covers GET, another member's POST, a replayed stored response after a later action, fresh-handler reload, paid travel/departure history, outsider lookup and saved-list serialization, with a deep absence check and unchanged owner-history assertions. It uses an in-memory store boundary; PostgreSQL storage/authorization acceptance is tested separately by the release suite. The integrated-overlay frontend typecheck, changed-file lint and 74 focused story/world/life/person-response tests pass.

## Foreground narrative pass

All sixty aftermath scenes received a character-led rewrite after the mechanical acceptance run. Foreground titles, prompts, choice labels, personal outcomes and the speaking actor’s delivery now emphasize objects, embarrassing misunderstandings, vanity, fatigue, affection and occasional sadness. The fiction can include ordinary gestures and background reactions without adding a simulation field for every cup or glance. Consequential orders, travel, jobs, money, property, public disclosures and source-dependent options still have to match their actual state.

This pass deliberately preserves every existing public summary verbatim. `ensemble-aftermath-content.ts` derives persistent semantic effect identifiers from those summaries. They are therefore part of the gameplay contract, not casual copy-editing material: changing one requires an explicit effect-identity plan and source-dependent/privacy regression checks. The formal summaries remain a concise shared history beneath the foreground scenes.

`ensemble-aftermath-copy.test.mjs` compares a pre-rewrite fingerprint of all twenty definitions, sixty stages and 169 alternatives. It includes every field except the foreground prose and response delivery; public narration, public effect IDs, source signals, costs, time, prerequisite gates, option order, flags and speaker identity must remain byte-for-byte equivalent. This proves mechanical equivalence of the bounded rewrite, not that automated checks can judge comedy or human enjoyment.
