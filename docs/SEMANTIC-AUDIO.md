# Semantic action audio

Implementation on the deployed-source baseline `752218ce86b8648fa8f79a9a612a69ba75267eb7`.

## What changes

The original 16-bar instrumental score is retained. Confirmed physical actions now use short, locally hosted CC0 recordings rather than selecting a melody from their stat changes:

- Coffee break, café meetup and the old-save closing-time-coffee chapter: one sip
- Home meal and cooking class: a short pan sizzle
- Reading, library resources and book club: one page turn
- Workbench/bicycle repairs and explicit completed repair choices: a short ratchet-tool recording
- Local navigation, a slow walk and newly confirmed walking exploration: footsteps
- Actually writing the shared story credits or coordinator rota: pencil on paper

All 74 ordinary activity IDs were reviewed explicitly in `lib/action-sounds.ts`. Sixty-one are intentionally quiet until an appropriate recording exists. Generic work, conversation, relationship repair, promotions, intercity travel and regional meals are not inferred from positive stats, price, profession or keywords. A regional meal can contain solid food or broth; neither a sip nor a cooking recording is substituted for eating it. Watering and coin recordings are included with provenance but are not mapped to actions that do not explicitly perform them.

Monthly habits get one representative cue per confirmed choice, not twenty sips for twenty implied coffees. Start/end-of-chapter cues remain musical. Clock warnings remain available for otherwise quiet actions; they do not cover short foley. Visual time and confirmation feedback remain unchanged.

## Authoritative playback and interruption

`ActionAudioReceipts` only admits locally initiated, successfully accepted snapshots for the same current owner, room, session epoch and acting seat, with the exact expected version increment. Each request is consumed once. Polling, restoration, saved-request recovery, denied moves, errors and stale callbacks are quiet. Both online sender-only and same-screen hotseat paths use the same gate.

Playback captures an audio generation before awaiting the server. Mute, zero effects volume, leaving the game, closing the sound test, hiding the tab, Web Audio interruption and disposal invalidate it. A stale confirmation cannot start a recording after the tab becomes visible or effects become unmuted again.

AudioContext creation/resume remains synchronous inside the initial gesture, including the WebKit constructor fallback. Recordings preload after that gesture, are decoded once, and use deployment-base-aware same-origin URLs. A missing or late recording is skipped without a synthesized substitute. Finishing download or decode never starts playback. Loads time out, fail quietly and can retry after a cooldown. Disposal aborts downloads and releases decoded buffers, audio nodes and event listeners.

At most two foley voices overlap; the oldest is stopped when replaced. Recordings use the persistent effects volume and mute controls. While a recording is live, music is gently reduced to 30% of its current selected gain. Completion recalculates the current music preference instead of restoring a captured old volume. Mute, hide and dispose cannot restore a stale audible gain.

The Sound settings panel includes “Test coffee sip.” If it is still loading, the panel asks for another tap. It does not automatically play later. Existing `cw_audio_v1` device preferences are preserved.

## Assets and listening limits

Eight mono 44.1 kHz PCM16 WAV files total 892,426 bytes. Each is shorter than three seconds, with approximately −12 dBFS sample peaks and no clipped samples. See [the complete source credits](../public/audio/foley/CREDITS.txt) and [asset manifest](../public/audio/foley/manifest.json) for primary source URLs, licenses, hashes, durations, transformations and objective measurements.

**No audible audition was performed in this execution environment.** Source descriptions and objective decoding/clipping checks support the intended mapping, but do not establish perceived sound quality, balance against the score, device volume, iPhone silent-mode behavior or real iOS gesture playback. The sip and cooking sources have relatively low integrated loudness despite their peaks; gentle music ducking is an objective safeguard, not a verified listening result. Use the in-game sip test and review on real desktop and mobile speakers before claiming auditory balance is confirmed.

## Regression coverage

- `tests/action-sounds.test.mjs`: complete ordinary-action audit, exact physical mappings, new narrative receipts, no-op/replay checks and intentional silence
- `tests/action-audio-receipts.test.mjs`: owner/room/epoch/seat/version scope, duplicate suppression, recovery, stale and remote receipts
- `tests/audio.test.mjs`: gesture creation/resume, WebKit fallback, no-WebAudio, load/decode failure, late loading, mute/visibility/interruption, bounded sources, disposal and current-gain ducking restoration
- `tests/audio-preferences.test.mjs`: existing preference format, blocked storage, actual control hook, explicit sip test, loading, mute/cancel and unmount
- `tests/reliability-home.test.mjs`: actual Home callbacks with the real game engine/legacy route fixture, 1–4-seat campaigns, online sender-only audio, authoritative coffee/cooking, preview/cancel, duplicate callbacks, save interruption/recovery, leaving and identity transitions

The Home harness stubs authentication/history transport and browser APIs. It does not verify the deployed backend, browser audio hardware or production account permissions. No game mechanics, server contract, schema, authentication or security settings are changed by this audio work.

Validation on 2026-10-11: the complete existing suite plus the new code/control tests passed 435/435 with Node 24 and concurrency 1. The subsequently added foley-file integrity test passed separately (1/1). `npm run typecheck` and `VITE_BASE_PATH=/crosswalk/ npm run build` passed. The build retains the existing large-chunk warning. Focused lint passes for the audio engine, mappings, gate, preferences, controls and their dedicated tests; the legacy Home file and its pre-existing fixture regex still have unrelated lint violations. `git diff --check` is clean. These results establish automated behavior and packaging, not audible audition or real-device playback.
