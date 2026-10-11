# Responsive person scenes

This change is presentation-only. It does not change save IDs, action costs, schedules, relationships, promises or NPC availability. Deploy with the separate persisted familiarity engine change; `lib/action-familiarity.ts` is an integration dependency owned by that change.

## What changes

- Each encounter opens on a portrait, a separate current-region/current-venue setting strip, a concise inspected appearance description, current activity, emotional cue and direct speech.
- Mina, Eli and Jo use their reviewed expression sheets; confirmed Mina motive emotions retain their reviewed individual portraits. Other people keep their identity portraits and convey their response through authored speech and a small neutral-ink hand/object action. No claim of facial animation for those portraits, and no synthesized voice or gibberish audio.
- A projected choice changes the listening/pausing response but cannot play its outcome. An authoritative exact-ID receipt supplies the reply and one action beat. Failed, interrupted, stale, repeated and private requests never invent completion.
- Historical narrative, biography, connections and receipt details stay available in closed disclosures. Exact money/time, practical effort, promises and consequential choice terms remain visible.
- The existing immediate Back/Escape/outside-dismiss behavior is preserved. A successful reply can receive focus when the prior control was removed. Browser focus behavior remains a live-QA gate.
- Existing correspondence stays explicitly remote, including its accessible label; the local venue identifies the user's end, without asserting the other person's whereabouts.
- All 39 people have first/familiar profile copy plus 156 routine/custom continuation lines. These consume the server's private prospective history and alternate without immediate repetition; familiarity does not imply friendship, consent or greater availability. The confirmed history view is frozen with the receipt.
- Reduced motion preserves the final pose without animation. A later successful use of the same semantic action can animate again; a replay or poll of the same receipt cannot.

## Integration

Import `PersonResponseStage` from `app/person-response.tsx`. It accepts `g`, `p`, `actorId`, `name`, `spot` and an optional confirmed `receipt`. For receipt adapters, use `capturePersonReceipt(receipt, updatedPlayer, actorId)` from `lib/person-response.ts` to freeze the actual persisted count. Optional structured receipt response:

`{speakerId,speech,activity,emotion,gesture}`

A structured response is used only for its named speaker. The actual receipt remains the source of record and is never regenerated or rewritten. `EncounterOutcome` accepts optional `reaction` for a confirmed non-person response; person dialogs instead use the dedicated stage and collapsed transcript.

Shared-opportunity integration uses its receipt lookup before the world-journal fallback and include its actor choices alongside any active story choices. Preserve `world:shared:*` IDs and the structured response. GameScreen and journal hooks cover for person-linked actions outside the modern encounter panel.

For person-facing life-event choices, `lifeEventPersonResponse(receipt, beforePlayer)` in `lib/person-event-responses.ts` supplies explicit authored speaker metadata after a resolved, non-deferred event. Pass the captured pre-commit player: the two crossroads choices select the first eligible counterpart, whose already-true relationship fields may not appear in the effects list. `lifeEventPersonActor(actionId, beforePlayer)` supplies that same speaker for persistent person familiarity. Impersonal choices return null. Unless physical presence is established separately, show these event replies as correspondence.

Pending, failed and private views take precedence over a retained earlier receipt. Such a receipt cannot trigger success speech, an emotional outcome image, focus restoration or an action animation. Phone cost/availability and appearance details remain at least 11px rather than shrinking to fit.

## Verification

Run current response, cast, motive, shared-story and Home/Screen tests. Cover all onstage profiles, receipt metadata, repeats after reload, refused/remote/private/error/pending states, duplicate confirmations and reduced motion. Native rendered artifacts are not browser screenshots. Verify actual phone layout, touch and focus separately.
