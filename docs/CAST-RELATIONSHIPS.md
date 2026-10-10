# A few people who become part of a life

## Scope and compatibility

This edition has 26 named characters: the existing 14 regional residents, Mina/Eli/Jo and Neri, plus eight authored recurring people. Four new people begin in Alder and one belongs to each other region. Existing story arcs retain their own choices and endings; they are not restarted or replaced.

Only newly created rooms get `castVersion: 1`. Both the Supabase authoritative create service and the original API initialize the same engine. Existing unmarked saves, including completed v34 lives, are inert to all cast hooks. There is no live-data migration and no database schema change. Cast state remains additive JSON within the existing room row.

## Chance, persistence, and availability

`initializeCast` generates the complete eight-month room schedule once from the room's existing server-owned life seed. It is persisted in `game.cast.schedule`, shared by all seats. Sanitized responses expose only the current month’s appearances, never the future schedule or seed. Personal cast history is returned only to the account owning that seat (all seats in pass-and-play). Other-seat views carry an explicit redaction marker so personal life summaries are labeled private rather than miscalculated as lost friendships. The shared activity log names whom a player made time for, but not their response, promise or conversation outcome. Rendering is pure and never generates randomness. Reloading, changing venues, previewing, retrying a command, or recovering a saved room cannot reroll it. The authoritative request-receipt mechanism also makes network retries idempotent.

Each region has at least one new local around each month. Local availability is seeded, with at most one month absent in a row; venues vary among accessible public meeting places. Occasional visitors add cross-region introductions. This schedule adds social opportunities only. It never closes essential work, healing, housing, progression, or the existing main story.

After meeting someone, the community room provides a clearly labeled contact route when they are not physically around. This costs the same stated attention as an in-person conversation. A trip or unlucky schedule does not by itself break a promise. Such contacts must not appear as physical 3D people.

## Bounded relationships rather than a collection score

Each new bond records a finite phase, the first approach, a real promise and due month if one was chosen, conflict/repair facts, at most eight specific memories, and an earned keepsake. The player ledger is capped at 64 receipts. Each person accepts at most one response per representative month, including zero-block boundary-setting. These are optional relationships, not milestones required to complete a life.

Introductions offer attention or practical help. A later invitation can be accepted for next month, or replaced with time together now. Keeping the promise costs one block, changes the shared project, and preserves its specific keepsake; renegotiating is honest notice, not invented participation. Ending a due month without a response records a missed promise. Repair acknowledges that history rather than deleting it. A later disagreement can be met honestly or leave friction; reciprocal care becomes available after working through it. Close friendships do not expose a repeatable reward button.

All eight newcomers share this finite arc structure; their projects, choices and remembered scenes are authored separately. Chance affects meeting timing, visitors and venues, not hidden stat rolls or eight different relationship systems. A first-return callback remembers whether the player initially listened or helped. Connections to existing people can unlock a distinct introduction. The later encounter repeats the player's actual last shared moment, and the ending distinguishes a beginning, a maintained friendship, a missed commitment, an unfinished disagreement, and a repaired bond. No romance is guaranteed or added to the existing Neri arc. Fully developed, unstrained friendships count toward belonging and the existing home/community foundations, without inventing creative or career credentials. No gift grinding, forced moves, paid work, cash rewards or new recurring expenses are introduced.

Every response supplies an authoritative exact time/cash/energy preview. Positive energy and happiness gains are clamped before display and commit. Paid monthly habits and the shared 200-paid-hour limit are untouched.

## Verification and engine parity

After reviewing engine changes, run:

1. `node scripts/sync-engine-copy.mjs`
2. `npm run check:engine`
3. `npm test`
4. `npm run typecheck`
5. `npm run typecheck:backend`
6. `npm run check:edge`
7. `npm run build`

The sync script copies the reviewed `lib` engine modules to `supabase/functions/_shared/engine` and regenerates SHA-256 entries in its manifest, including both new cast modules. It never accesses a live database or deploys anything. Client/server parity is also covered by backend tests. The cast tests cover saved-state purity, retries, exact previews, boundaries, repair, ending truthfulness, and complete multi-seed lives; the simulation report records measured outcomes separately. Browser/mobile/WebGL playtesting still needs the integration environment and is not established by these engine tests.
