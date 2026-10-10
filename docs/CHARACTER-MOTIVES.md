# Character motives, emotional range, and public identities

Implementation reference, with story details. This is separate from the spoiler-free player guide.

## Scope and compatibility

Newly created rooms receive `motivesVersion: 1` from either authoritative create path. Existing rooms without that marker do not acquire state on reads, joins, actions, or settlement. The player state is additive JSON; no SQL, account, security, or live-data migration is needed.

All 26 characters have an authored goal, commitment to that particular goal, competing obligation, small practical contribution, full support, smaller support, boundary, and repair. The layer does not reschedule the existing cast or replace original world/shared-story scenes. It never creates a player promise by implication.

One optional exchange per character per month is persisted. An exchange normally costs one priority block; hearing a refusal or pushing a boundary costs no block and gives no resources. Full support gives up to 8 energy and 5 happiness; a smaller offer gives up to 3 energy and 2 happiness. Help gives up to 3 happiness; repair gives up to 2. Every preview clamps to the actual remaining resource capacity.

A small private trust state recognizes actual persisted cast, local, Neri, shared-story, and life-event receipts. Positive evidence is limited to one earned step per character per month across all menus. Pressure and missed real promises erode willingness. A promise alone does not earn follow-through credit; simply being away does not cause decay. Existing native repairs count. An earned repair keeps its earlier incident in the record.

Commitment is contextual, not a moral ranking. Steady commitments can offer full support sooner; bounded commitments need a little more shared experience. Tentative projects stay small until two concrete contributions demonstrate a workable scale. They always finish the particular small contribution they agree to; there is no randomness or secret failure roll. Current promises, unresolved native conflicts, the shared preparation/performance months, and Neri’s distant posting can limit capacity even when a friendship is strong.

## Presence, privacy, and UI

Meetings use the original current character views. Local residents require their real meeting place; absent locals do not appear. Met cast friends can use the already established community correspondence route. Neri’s declined or finished scene is not reopened. All eight cast friends have explicit correspondence support wording, and remote help describes a working-note exchange rather than an invented shared visit.

The disclosure sits inside the existing encounter dialog. It shows current intention and capacity in ordinary words, never numerical personality meters. Only actual receipts enter the private journal. Other-seat snapshots remove the whole motives state alongside cast state, and redacted views cannot create a motive preview. Shared activity logs record only that the player made time for a person.

Exact request IDs remain persisted for idempotence. Choice revision tags change when the relevant private/world/story context or player resources change. Stale, unavailable, wrong-turn, finished-life, wrong-place, and hidden-person commands are rejected without motive mutations. Rendering and movement do not roll randomness.

## Emotional coverage

The following cases are authored, situational responses rather than mood labels assigned at random:

| Emotion | Character and context | Concrete behavior |
| --- | --- | --- |
| Sadness | Mina after the cancelled café evening, or repairing pressure; Tavi remembers a failed crop | They name the loss and keep a smaller workable next step instead of erasing the disappointment |
| Envy | Mina’s difficult passage; Kit’s unpolished view of home | They admit comparison, then continue their own work without belittling somebody else |
| Love | Mina and Eli making room for a friend; Oren discussing a known family habit; Jo and Kit’s family notes | Listening, care, asking before helping, and keeping an adult child’s independence visible |
| Anger | Mina or Jo when pushed beyond a named limit | Refuse the extra burden and name what the request would cost |
| Shame | Hugo almost taking over an explanation; Miro’s response during repair | Stop the intrusive action and ask what kind of help is welcome |
| Pride | Tomas explaining a hard tool label; June’s rota holding without her | Recognize concrete progress without claiming certainty or indispensability |
| Fear | Oren choosing a finished small play; Sefu wording an invitation | Finish a bounded step while preserving room for a different answer |
| Relief | Tess’s handover becoming usable; an acknowledged repair | Accept shared work or a named limit without rewriting the past |

Specific deeper Hugo/Miro/Oren recollections remain behind the existing familiarity gates. Early versions of the same emotional cases use present-day behavior and do not disclose the gated incident.

Only Mina has the four new direct-expression images: sadness, envy, love, anger. `motive-portraits.ts` selects an image only for a supported emotion on an actual visible Mina receipt. Other people/emotions and image failure use that person’s neutral portrait. A rendered choice preview does not forecast an expression. The four reviewed 640×640 WebPs use the existing `/paintings/character-expressions/mina-{emotion}.webp` paths and one `individual-manifest.json`; the original three four-cue sheets are unchanged.

## Geography and family

`character-identities.ts` is the canonical public age/family metadata. Ages span 24–72. All nine already explicit ages are preserved, including Neri at 29. New public family identity is distinct from private incidents:

- Leila (44) is Tomas’s (39) older sister.
- Miro (62) is Oren’s (57) older brother; they live in Glasssteppe and Alder Quay.
- Jo (54) is Kit’s (28) parent; Kit has an independent adult life in Ember Mesa while Jo works in Alder Quay.

Jo and Kit each have a small optional family-care exchange: word an offer that can be declined, or ask for encouragement without surrendering an artistic decision. No answer, delivery, or new obligation is assumed.

Existing selective connections remain intact. Two additional potential introductions are bounded, consent-based, and personal to the player’s actual choices:

1. Bram and Ren can compare practical route annotations.
2. Priya and Tavi can compare dated observations with uncertainty intact.

The player must know both. One exchange asks the first person about an invitation; a later exchange at the second person’s actual meeting handles the reply. The initial note never claims the second person agreed. Public manual wording describes only the affinity, not triggers or results.

## Verification

- `tests/character-motives.test.mjs`: all 26 authored profiles, exact effects, support/refusal/repair, repeated work, current obligations, native evidence, promises, idempotence, stale and wrong-place requests, routes, public identities, family actions, introduction consent, eight emotional categories, deeper-history gates, remote correspondence, privacy, client/server parity, and old/new serialization.
- `tests/support/motive-legacy-hashes.json`: nine campaigns captured from frozen `4216605a69c95ce18048e6fc1fc7d105fc174a60`, across three seeds and cast/pre-history/pre-cast editions. All 81 initial/settlement byte hashes must remain identical.
- `tests/motive-ui.test.mjs`: pure and redacted rendering, no counters or future facial cue, confirmed-receipt image and journal, serialized UI recovery, exact direct-image failure fallback, and asset integrity.
- `tests/cast-api.test.mjs`: D1 marker authority, motive state, retries, reloads, and other-seat/anonymous redaction.
- `tests/supabase-backend.test.mjs`: authoritative PostgreSQL-backed motive request and replay, ignored forged marker, reload, and other-seat redaction.
- Shared engine sources and their integrity manifest are synchronized. The parent release integration owns the final combined aggregate and bundle checks.

These checks do not establish player enjoyment, production deployment, or live account/recovery behavior. No publication was performed as part of this feature work.
