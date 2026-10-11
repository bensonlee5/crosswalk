# Prospective action familiarity

Every actual successful action can acquire private observational history. This is independent of relationship affection, trust, rewards and shared opportunities. It never changes the action’s mechanical result.

`Player.familiarity = {version: 1, startedRound, actions, people}`. Both dictionaries hold `{count, lastRound, lastVariant}`. Counts are safe integers capped at `Number.MAX_SAFE_INTEGER`; the separate deterministic variant advances modulo 12 even at the cap. Views expose count, stage (first: 0–1; familiar: 2–3; routine: 4–6; custom: 7+), lastVariant, lastRound and whether that particular history is recorded. A first recorded instance is not necessarily the first occurrence in an older life.

`actionFamiliarityKey(actionId, beforePlayer, beforeGame, destination?)` is the single normalization contract for the engine and presenters. Capture it before submitting. It removes month/revision identifiers and one-off order IDs; it retains a visit’s town/venue, world food/language/work’s town, individual cast/motive actor, and a room reservation’s purpose. `actionFamiliarityContext` also resolves actual actor IDs before the action, while their scene still exists.

The move wrapper captures context, runs the existing action, verifies that state changed, then records the successful action inside the existing authoritative transaction. Known exact receipt replays and same-place arrival commands are excluded. Opening/closing a preview, failed commands, UI cancellation and polls never call the recorder. A deliberately committed refund/release is still a real decision and can acquire its own distinct history; it does not count as preparing, eating or attending.

Old saves are not rewritten on read or initialized from activity counts, memories, assumed meetings or past receipts. Their next successful action creates prospective metadata only. Existing mechanics and receipts stay intact. Both Supabase and the older D1 view remove another seat’s familiarity, even in rooms that predate cast/shared version markers. Crossings themselves remain separately new-room-gated.

Presenters must capture the authoritative response count/variant with the receipt, not recompute a playing response from a later poll. A missing history is “unrecorded”; existing relationship facts still take precedence over a generic first-meeting greeting.
