# Presentation and interaction

[Design and development index](README.md) · [Player-facing README](../README.md)

Preserved design and implementation notes for sound, the modeled town, paintings, weather, tutorial, and activity previews. These sections describe the updates when introduced in the earlier weekly editions. Historical activity counts, weekly bills, calendars, and verification limits are not current monthly-life rules. The turn-based principle still applies: browsing does not spend time; confirming a conversation response or another activity may spend its displayed cost.

## Sound, architecture, and action-time clock

- Original procedural 16-bar neighborhood music and distinct cues for confirmed travel, work, learning, socializing, spending, craft, milestones, and the end of a week. Sound unlocks after a pointer/keyboard gesture; use Sound on the title screen or Sound & music in the game menu. Music/effects have independent volume and mute settings saved locally. Hidden tabs stop audio; returning resumes without replaying missed music. No external music files or borrowed recordings.
- All 15 locations now have distinct modeled silhouettes and purposeful details, from stepped apartment balconies to the campus clock tower, library pediment, industrial sawtooth roofs, cinema marquee, greenhouse, and transit shelter. Shared materials/static batching remain in place; compatibility mode omits finer decoration. Software-renderer labels follow actual building sign heights.
- A six-segment brass clock drains and sweeps as actions consume time. Low-time color/ticking cues and zero-time shutters make the limit tangible. Activity previews show their cost on the dial. This remains turn-based: reading, talking and waiting do not consume time. A fresh week/player resets cleanly.

New checks: `node --test tests/audio.test.mjs`, `node tests/action-sounds.test.mjs`, `node tests/turn-clock.test.mjs`. Existing gameplay, API, tutorial, seasonal, balance, artwork, and town-renderer checks remain applicable. Type checking and static/software-rendered visual inspection are available; actual mobile/WebGL playback, listening quality, and animation timing remain unverified in this environment.

## Painted seasons redesign

New games include a shared, authored eight-week weather calendar: two representative weeks each in spring, summer, autumn and winter. Seasonal time skips never add bills. The Chronicle displays the current city event, forecast and full calendar. Weather changes only explicitly listed activities, with small per-player weekly caps; every effect is included in the action preview before it is committed.

- Existing saved rooms keep their original mechanics. The additive `environmentVersion: 1` flag enables weather only for new rooms while retaining the v2 path, story, opportunity and garden rules.
- Illustrated location scenes, neighbor chapters and weekly news use the oil-painted assets in `public/paintings`. Their manifest records asset provenance, dimensions and descriptions.
- The live 3D town changes foliage, roof snow, lighting, windows and ground details by season. Rain and snow particles are disabled in battery-saver mode, reduced motion and the software renderer.
- `node tests/weather.test.mjs` checks weather preview parity, caps, clamping, heat gates, round resets, save compatibility and unchanged progression.
- `node tests/balance-check.mjs --seasonal` runs the same representative strategies through the seasonal calendar.

The UI retains semantic dialogs, keyboard controls and text-based forecasts. Weather never closes a destination, removes a story chapter or destroys shared garden progress.
- `node tests/artwork.test.mjs` verifies the complete optimized art inventory, manifest and contextual filename mappings.
- `node tests/town-renderer.test.mjs` checks seasonal Three geometry and software rendering without a browser; it is not a GPU benchmark.

### Illustrated activity choices

All 74 gameplay actions now have their own explicitly mapped oil-painted scene and optimized selectable thumbnail, including all neighbor chapters, the shared garden and weekly opportunity variants. The update adds 57 individually generated paintings and 84 small thumbnails. Costs, outcomes and lock reasons remain accessible live text. The public art catalogue contains 102 full paintings plus the thumbnails, loaded on demand.

Run `node tests/action-artwork.test.mjs` for complete action-to-asset coverage, seasonal and pre-weather opportunity subjects, distinct scene bytes and thumbnail budgets. See [action-art verification](../docs/ACTION-ART-VERIFICATION.md).

### Learn-as-you-play tutorial

New players are offered a short, optional field guide after the first Chronicle. It teaches resources, free travel, previewing and trying an activity, life paths, neighbors, seasonal news and the end-week bill review. The suggested first stop is The Shift; players may choose any legal activity or continue without acting.

- Skip at any point and replay from the game menu or How to play. Replaying never resets or recreates a game, buys anything or pays bills.
- Tutorial progress is versioned, device-local and separate from saved rooms. Interrupted guidance resumes after reload; existing saves do not receive a new automatic invitation.
- Instructions live inside the active Places/activity menu rather than covering its controls. News, handoff and bill dialogs temporarily hide the guide. Keyboard controls, visible focus, reduced motion and small-screen scrolling are supported.
- Classic and pre-weather saves receive rules-appropriate copy. The tutorial changes no game rules, balance, assets or server data.
- `node tests/tutorial.test.mjs` checks progression, event guards, skip/replay, interruption handling, save isolation and the suggested first activity. `node tests/tutorial-ui.test.mjs` checks rendered lessons and hook persistence, replay, repeated clicks and blocked browser storage.

### Places as invitations

Each of the 15 destinations now has its own promise, short arrival scene and material accent. Arriving selects a legal, relevant activity without reordering or hiding the full catalogue. A newcomer starts at home with a free reset, and at The Workshop with craft practice; explicit activity links still allow inspection of locked choices.

- Up to three optional invitations use current eligibility, resources, weather allowances, skill/craft unlocks and neighbor chapters. They take the player to a preview, never spend resources automatically, and yield to the tutorial.
- Choice previews lead with the benefit, then show time, upfront cost, gross income and net gain where relevant, energy/skill/social requirements, and remaining cash. A studio move explicitly shows its $705 ongoing weekly bills.
- Neighbor presence and small post-action links suggest a next chapter or newly unlocked role. They never promise a ninth week or fabricate opening hours, scarcity or weather closures.
- Existing rules, saves, all 74 actions, artwork, turn order and tutorial behavior are unchanged. The selected action appears first on small screens while the full activity list keeps its stable order.
- `node tests/place-invitations.test.mjs` checks 1,000 classic/weather/resource states and all action previews. `node tests/place-invitations-ui.test.mjs` checks rendered copy, guards, preview ordering and non-mutating rendering.
