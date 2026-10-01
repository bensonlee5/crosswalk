# Crosswalk: a neighborhood worth coming back to

## Goal and evidence

Keep the tactile, serious-cartoon 3D neighborhood and eight-week, six-block game. Make choices feel like different worthwhile lives, and make sharing a town matter. The initial illustrative playtest finished at 99 points for career versus 40 for community. This is evidence of an incentive problem, not proof of an optimal strategy: jobs and learning each scored directly, connections did not, and a $300 referral paid less than a $464 IT shift.

## 1. Three credible paths

- Replace career-only progression with a 40-point **strongest life path**: career (job + learning), community (connections), or creative (craft). Savings and happiness each contribute 25 points; neighborhood legacy contributes 10. Cap every component and show the complete calculation.
- Keep career progression valuable. Give community a social-scaled referral income and growing/organizing work; give creatives a craft progression and scalable commissions. Display prerequisites and exact payouts before committing.
- No irreversible class selection. Players can change direction, combine income sources, or keep a second interest without being forced to master everything.
- Retain the $505/$705 bills, energy constraints, free travel and eight-week structure. Recheck representative eight-week strategies and obvious repeat-action exploits, then tune from evidence.

## 2. A reason to notice the other players

- Add a rotating weekly opportunity with one claim shared by the whole room. Show the reward, eligibility, availability and who took it. Existing optimistic concurrency and request-id protection remain authoritative.
- Rotate first player each week so the same seat does not always have first refusal. Clearly announce the new week's starting player.
- Add one shared neighborhood garden project. Each player can contribute at most once per week. Its goal scales with player count; contributors receive a completion reward and legacy points. Solo retains a reachable version.

## 3. Three neighbors who remember you

- Introduce recurring neighbors at the café, garden and makerspace, each with three authored chapters: meeting, helping with a problem, and a concrete payoff.
- Stages persist with the player, require a later week to continue, and cannot be replayed for rewards. Show the next chapter and the completed story in the journal.
- Reward the final chapter with legacy and a visible keepsake. Stories are small optional decisions competing for the same scarce weekly time.

## 4. Make the town reflect the life

- Show the shared garden moving through early, growing and completed states in the 3D world.
- Add modest 3D apartment embellishments when a player moves into a studio, and earned marble accessories for story milestones. Reuse procedural geometry so the existing visual direction stays coherent and asset loading stays light.
- Mirror visual changes in readable journal/progress text for accessibility and the compatibility renderer.

## 5. Remove friction and celebrate progress

- Keep the location menu open after an action. Keep the selected activity available for deliberate repeat clicks; recalculate affordability/energy/time after every authoritative response.
- Disable the action during a request and short anti-double-click interval. Close activity panels on turn changes; never replay automatically.
- Promotions announce the exact new role and wage, with a small celebration. Show activity results inside the menu where the player is looking.
- Add a compact neighborhood board for opportunity/project status and a life journal with path progress and neighbor chapters.

## Compatibility and guardrails

- Existing JSON room saves gain additive optional fields with safe defaults; no destructive database migration. Keep room codes, seats, authentication cookies, idempotent requests, concurrency checks and public sharing intact.
- Do not silently rescore existing games. New games use the new rules; saves without a rules version retain the original scoring/economy and turn order, with clear labeling.
- Respect reduced motion, keyboard operation, mobile-sized dialogs, waiting-player read-only state and renderer fallback.
- Scope excludes real-time movement, chat, trading, procedural quests, a bigger map and a visual-engine rewrite.

## Verification and publication

1. Extend engine tests for all previews, spending gates, path score caps, old saves, chapter sequencing, repeated claims, shared project rewards, rotating turns and eight-week completion.
2. Run representative eight-week career, community, creative and mixed simulations, recording actions, scores and remaining cash. Describe limits honestly; this is a tuning pass rather than a solved optimal-balance claim.
3. Self-play the actual UI: create/resume, perform and repeat activities, complete a promotion, inspect stories/board, advance turns, and exercise online ownership/version guards where supported. Check small-screen layout and reduced-motion behavior.
4. Run the project's type/build checks. Publish the same Site, preserve its current public audience, update the authorized repository, and verify the exact published revision and terminal deployment result.

## Completion criteria

Each path can fund a viable eight-week life and earn progression points; another player's actions can alter the shared opportunity/project; three neighbor arcs and world changes persist; repeat actions are easier without accidental duplicates; old rooms remain playable. Publish only after addressing identified correctness failures, and list any browser or balance verification limits explicitly.
