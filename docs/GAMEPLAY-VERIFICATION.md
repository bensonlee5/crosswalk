# Neighborhood gameplay verification

## Automated checks

- Original rules: 60 action previews, 24 bill previews, all affordability/time/energy/skill/social gates, free travel, location enforcement, overdraft recovery, save compatibility and eight-week completion.
- New rules: 74 effect previews; 1–4-player rotating start order and eight-week finish; single shared opportunity claim and weekly reset; project size and contributor-only rewards; every neighbor chapter, weekly story gate and JSON persistence; strongest-path score caps.
- API route integration, using an in-memory D1 test double: create/join, outsider privacy, seat ownership, duplicate request IDs, stale-version rejection, shared opportunity contention, rotated turn restoration and classic-lobby joining. This does not replace a live multi-browser network test.
- Typecheck and production build are required before publication.

## Reproducible balance pass

Run `node tests/balance-check.mjs ./lib/game.ts /tmp/crosswalk-balance.json` for the full schedules, source hash and assertions.

After changing craft practice to two time blocks, representative eight-week runs finished:

| Route | Points | Cash | Notes |
|---|---:|---:|---|
| Career | 87 | $6,094 | Top role, six skills |
| Community | 89 | $6,185 | 26 connections |
| Creative | 91 | $6,045 | Eight craft, Mina's story |
| Mixed | 87 | $3,640 | Career start, community work, three stories |
| Community + legacy | 99 | $5,555 | All stories and completed garden |
| Creative + stories | 91 | $4,290 | All stories, garden unfinished |

These are hand-designed legal schedules with a passive benchmark opponent, without claiming the weekly opportunity. They are not an optimal-strategy search or evidence of perfectly equal multiplayer outcomes. The community-and-legacy route remains especially effective and is worth watching in broader playtests.

Repeated unskilled work, rest-only, tending-only, a courier/rest loop and a referral rush scored 15, 22, 62, 28 and 67 respectively. Resource gates blocked some repeated attempts; no blocked action was applied.

The eight-week calendar has inherent seat asymmetry with three players. Opportunity reward order was adjusted so both seats in a two-player room have two craft openings, and all four seats in a four-player room have one. Players may decline an opening; it is never auto-awarded.

The final weekly happiness deduction still applies, so even a fully maxed life normally ends at 99 rather than 100. This matches the existing end-week rule and is not a claimed perfect-score benchmark.

## Browser verification

The local cloud-browser preview is blocked by the environment (`ERR_BLOCKED_BY_CLIENT`), and the local development-server preview also encountered restricted interface enumeration. Public-URL selfplay then verified a fresh solo room, the weekly opportunity reward and claim lock, two deliberate repeated activities without reopening the menu, all six time blocks and bill review, the project completion payout, Eli's three chapters across three weeks, the promotion preview/celebration and saved-room reload. The restored room retained IT support, the completed garden, Eli's leaf charm and six legacy points.

The browser exercised the software 3D compatibility renderer. Visual inspection caught a contrast issue on the new board/journal cards; explicit dark text colors were added before the final publication. Mobile-device and multi-browser online UI coverage remain separate from the automated API checks.
