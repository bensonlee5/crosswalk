# Crosswalk

**[Play Crosswalk](https://bensonlee5.github.io/crosswalk/)**

A turn-based neighborhood life game for 1–4 players, solo, pass-and-play or online. New rooms span eight representative months, with six priority blocks each month. Existing saved rooms retain their original rules.

This release adds server-backed saved-game history and optional email/password accounts to the new GitHub Pages/Supabase build. Guests can keep playing in the same browser; verifying an email and setting a password preserves that guest’s ownership for returning on other devices. Hosting and email-account setup remain pending until deployment and provider checks are verified.

[Continue an old game on the original site](https://crosswalk-life-game.bensonlee5.chatgpt.site). Games started there remain there; their existing browser seats do not automatically transfer to the new backend.

## Monthly life stories edition

Mina, Eli and Jo share a seven-beat story: a promise, competing aims, a lost venue, a difficult compromise, preparation, a performance and the responsibility that follows. Their public decisions and physical venues are shared across players. Personal promises, witnessed moments and missed opportunities remain individual. Becoming Steward opens a later coordinator role and a Common Ground chapter; it does not end the community story.

Conversations happen with a named person at a real venue. Choose a response, review its cost and confirm it once. The journal remembers the result, and endings refer to the player's actual actions, journey, home and relationships. Two to four seeded side events vary the campaign without inventing commitments the player never made. Recovery remains possible, and no player is eliminated by an overdraft.

Five regions have distinct architecture, paintings, weather, local work and residents. They grow while players stay or leave. Return welcomes remember time away and local history; instant round trips cannot manufacture a new building. Moving home costs money and two priority blocks, changes monthly bills, and leaves a real history behind. Neri's optional relationship unfolds through five different months, with independent plans and honest friendship or partnership choices.

The modern economy uses recognizable dollar amounts and compressed attention. Entry-level regular work pays $3,072 take-home under a simplified 80% game assumption; an Alder shared home costs $1,850 per month including food and essentials. Regular work takes two priority blocks and 160 paid hours. Jobs, local work and paid story tasks share a 200-hour monthly limit.

Some lifestyle choices represent a month of habits: 20 weekday coffees cost $140; eight café meetups cost $144; home-cooking ingredient upgrades cost $100; market lunches add $260 after crediting displaced groceries. Each habit can be selected once per month and never renews automatically. One-off events remain one-off, and free walks, reading and community activities remain available. Housing, habits, study, travel and relationships compete for the same money and priority blocks.

Named achievements and present foundations replace the points contest in new rooms. Earned milestones survive setbacks, while the ending distinguishes a past achievement from what is secure now. Start a new room for this edition; unmarked saves are never rebased to new prices or story rules.

### Verification

Run `node --test tests/*.test.mjs tests/*.test.ts` and `npx tsc --noEmit --incremental false`. Coverage includes legacy parity, exact previews and bills, payroll and habit limits, shared-world consistency, request retries, focused encounters, honest endings and complete campaign simulations. Automated engine/API playthroughs and rendered-interface checks do not establish human enjoyment. Browser/mobile gestures, WebGL performance and audio listening remain unverified in this environment.

The earlier [life-story research notes](docs/LIFE-STORIES-DESIGN.md) describe the previous edition. Historical implementation notes below apply to their versioned saves where later rules differ.

## Earlier reliability and balance update

Creating, joining and resuming a room now share one operation guard, preventing interrupted requests from leaving the interface stuck on Saving. Cancelled or stale responses cannot unlock or replace a newer operation. Activity feedback clears on each attempt and shows success only after a confirmed response; uncertain network outcomes are explicitly labeled.

Time previews never show negative remaining blocks, and final-week story messages no longer promise another week. New rooms use balance version 1: eight underpowered activities have distinct recovery, happiness or income benefits. The first paid community day each week retains its full reward; additional days offer lighter $280 setup work with less energy cost and no new social/happiness reward. Existing rooms keep their exact original economy and scoring.

Regression coverage includes interrupted create/join/resume flows, repeated callbacks, old-save comparisons, preview/server parity, and full one-to-four-player campaigns. Run `node --test tests/*.test.mjs`, `node tests/balance-check.mjs --seasonal --current-balance`, and TypeScript checking. Browser/device rendering and audio listening remain unverified because Chromium cannot start in this environment.

## Sound, architecture, and action-time clock

- Original procedural 16-bar neighborhood music and distinct cues for confirmed travel, work, learning, socializing, spending, craft, milestones, and the end of a week. Sound unlocks after a pointer/keyboard gesture; use Sound on the title screen or Sound & music in the game menu. Music/effects have independent volume and mute settings saved locally. Hidden tabs stop audio; returning resumes without replaying missed music. No external music files or borrowed recordings.
- All 15 locations now have distinct modeled silhouettes and purposeful details, from stepped apartment balconies to the campus clock tower, library pediment, industrial sawtooth roofs, cinema marquee, greenhouse, and transit shelter. Shared materials/static batching remain in place; compatibility mode omits finer decoration. Software-renderer labels follow actual building sign heights.
- A six-segment brass clock drains and sweeps as actions consume time. Low-time color/ticking cues and zero-time shutters make the limit tangible. Activity previews show their cost on the dial. This remains turn-based: reading, talking and waiting do not consume time. A fresh week/player resets cleanly.

New checks: `node --test tests/audio.test.mjs`, `node tests/action-sounds.test.mjs`, `node tests/turn-clock.test.mjs`. Existing gameplay, API, tutorial, seasonal, balance, artwork, and town-renderer checks remain applicable. Type checking and static/software-rendered visual inspection are available; actual mobile/WebGL playback, listening quality, and animation timing remain unverified in this environment.

## Earlier neighborhood gameplay update

- New games score the strongest of career, community or creative life paths (40), plus savings (25), happiness (25) and legacy (10).
- One shared opportunity each week; first player rotates. A shared garden rewards contributors when it opens.
- Mina, Eli and Jo each have three persistent story chapters and an earned 3D keepsake.
- Location menus stay open for deliberate repeat actions; promotions show the new role and wage.
- Older saved rooms retain their original scoring, income and turn order. The room schema remains additive JSON, with no database migration.

See [the implementation plan](docs/GAMEPLAY-IMPROVEMENT-PLAN.md) and [verification and balance notes](docs/GAMEPLAY-VERIFICATION.md).

### Gameplay checks (Node 24+)

- `node tests/game.test.mjs`: classic compatibility and original action previews
- `node tests/neighborhood.test.mjs`: new mechanics, score caps, stories and shared world state
- `node tests/api.test.mjs`: route integration using an in-memory D1 test double
- `node tests/balance-check.mjs`: reproducible illustrative eight-week strategies
- `npx tsc --noEmit --incremental false`: type checking

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

Run `node tests/action-artwork.test.mjs` for complete action-to-asset coverage, seasonal and pre-weather opportunity subjects, distinct scene bytes and thumbnail budgets. See [action-art verification](docs/ACTION-ART-VERIFICATION.md).

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

## Framework and deployment

The current frontend is a static [Vite](https://vite.dev/) and React application. GitHub Pages serves the built `dist/` files; Supabase provides authenticated guest/email sessions, saved-game storage and the `crosswalk-game` Edge Function. The server validates commands and owns game state. The frontend does not run Next.js, Vinext, a Cloudflare Worker or D1. Legacy D1 route code remains only for regression fixtures and migration reference.

### Deployment status and existing games

GitHub Pages/Supabase hosting setup is **pending verification**. Source code, a successful local build or a workflow file do not establish a working public deployment. No new live URL is claimed here.

The [original Crosswalk site](https://crosswalk-life-game.bensonlee5.chatgpt.site) remains the place to continue games created there. Its cookie-owned D1 saves cannot be claimed with a room code or automatically inherited by another origin. Keep it available until a separately verified migration path exists. Source control is not a backup of live saved games.

### Local setup and checks

Use Node.js 24 for the tested development workflow and install from the committed lockfile. Copy `.env.example` to `.env.local` and provide the public project configuration before testing online play.

```sh
npm ci
npm test
npm run typecheck
npm run build
npm run dev
```

For a production build under GitHub project Pages, set `VITE_BASE_PATH=/crosswalk/` in `.env.local` or the build environment, then run:

```sh
npm run build
npm run preview -- --port 4173
```

For a custom-domain root, use `VITE_BASE_PATH=/` and update Auth redirects and the backend origin allowlist to match. Artwork, styles and room links respect the configured path. `npm run lint` is also available; remaining repository-wide legacy lint issues are not part of the build/typecheck pass.

Automated checks cover game rules, versioned saves, exact request retries, owner changes, history pagination, guest/account preservation, email-verification gates and password-recovery guards. Mock-client and in-memory API tests do not prove real SMTP delivery, deployed database permissions, cross-device recovery or browser/mobile/WebGL behavior. Those require checks against the configured deployment.

### Public frontend configuration

Set these GitHub repository variables for the Pages workflow, or the matching values in `.env.local` for local development:

- `VITE_SUPABASE_URL`: the hosted Supabase project URL
- `VITE_SUPABASE_PUBLISHABLE_KEY`: the public `sb_publishable_...` key
- `VITE_BASE_PATH`: `/crosswalk/` for project Pages, `/` for a custom-domain root
- `VITE_EMAIL_AUTH_ENABLED`: keep `false` until email delivery, verification and recovery have been tested

Never place a service-role key, secret key, SMTP password or database credential in a `VITE_` variable. These variables are included in the browser bundle.

See [the frontend setup guide](docs/github-pages-frontend.md) and [save/recovery contract](docs/SAVE-RECOVERY.md) for the exact transport, storage and verification requirements.

### GitHub Pages and Supabase setup

1. Prepare the Supabase schema and authenticated `crosswalk-game` Edge Function. Configure the exact frontend origin in the backend allowlist. Verify row-level security, server-side ownership and permanent request receipts before enabling public play.
2. Enable anonymous sign-in for guests and manual identity linking for same-UID email conversion. Keep email confirmation enabled. Configure the exact Site URL and verification/recovery redirect URLs, including the project path when applicable.
3. Configure and test production SMTP. New guest accounts verify their email before setting a password; signing into an existing account preserves the browser’s separate guest session. Password recovery requires a verified recovery session. No Google sign-in is included.
4. Add the public GitHub repository variables, select GitHub Actions as the Pages source, and review `.github/workflows/pages.yml`. It tests, typechecks, builds and publishes the static artifact after a configured main-branch run.
5. Verify the deployed revision, artwork paths, guest create/join/resume, interrupted-save recovery, email conversion, existing-account sign-in and password reset before marking hosting complete or enabling email accounts.

Official setup references:

- [Vite deployment to GitHub Pages](https://vite.dev/guide/static-deploy.html#github-pages)
- [GitHub Pages publishing sources](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)
- [Supabase anonymous sign-ins and conversion](https://supabase.com/docs/guides/auth/auth-anonymous)
- [Supabase Auth redirect URLs](https://supabase.com/docs/guides/auth/redirect-urls)
- [Supabase production SMTP](https://supabase.com/docs/guides/auth/auth-smtp)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
