# Monthly life design

[Design and development index](README.md) · [Player-facing README](../README.md)

Contains story spoilers and detailed rules. This is the monthly-life foundation; the additive cast and character-history work is documented in [cast relationships](../docs/CAST-RELATIONSHIPS.md), [character histories](../docs/CHARACTER-HISTORIES.md), and [cast integration](../docs/CAST-INTEGRATION.md). Saved rooms remain on their versioned rules.

## Monthly life stories edition

Mina, Eli and Jo share a seven-beat story: a promise, competing aims, a lost venue, a difficult compromise, preparation, a performance and the responsibility that follows. Their public decisions and physical venues are shared across players. Personal promises, witnessed moments and missed opportunities remain individual. Becoming Steward opens a later coordinator role and a Common Ground chapter; it does not end the community story.

Conversations happen with a named person at a real venue. Choose a response, review its cost and confirm it once. The journal remembers the result, and endings refer to the player's actual actions, journey, home and relationships. Two to four seeded side events vary the campaign without inventing commitments the player never made. Recovery remains possible, and no player is eliminated by an overdraft.

Five regions have distinct architecture, paintings, weather, local work and residents. They grow while players stay or leave. Return welcomes remember time away and local history; instant round trips cannot manufacture a new building. Moving home costs money and two priority blocks, changes monthly bills, and leaves a real history behind. Neri's optional relationship unfolds through five different months, with independent plans and honest friendship or partnership choices.

The modern economy uses recognizable dollar amounts and compressed attention. Entry-level regular work pays $3,072 take-home under a simplified 80% game assumption; an Alder shared home costs $1,850 per month including food and essentials. Regular work takes two priority blocks and 160 paid hours. Jobs, local work and paid story tasks share a 200-hour monthly limit.

Some lifestyle choices represent a month of habits: 20 weekday coffees cost $140; eight café meetups cost $144; home-cooking ingredient upgrades cost $100; market lunches add $260 after crediting displaced groceries. Each habit can be selected once per month and never renews automatically. One-off events remain one-off, and free walks, reading and community activities remain available. Housing, habits, study, travel and relationships compete for the same money and priority blocks.

Named achievements and present foundations replace the points contest in new rooms. Earned milestones survive setbacks, while the ending distinguishes a past achievement from what is secure now. Start a new room for this edition; unmarked saves are never rebased to new prices or story rules.

### Verification

Run `node --test tests/*.test.mjs tests/*.test.ts` and `npx tsc --noEmit --incremental false`. Coverage includes legacy parity, exact previews and bills, payroll and habit limits, shared-world consistency, request retries, focused encounters, honest endings and complete campaign simulations. Automated engine/API playthroughs and rendered-interface checks do not establish human enjoyment. Browser/mobile gestures, WebGL performance and audio listening remain unverified in this environment.

The earlier [life-story research notes](../docs/LIFE-STORIES-DESIGN.md) describe the previous edition. The [historical edition notes](historical-editions.md) and [presentation notes](presentation-and-interaction.md) apply to their versioned saves where later rules differ.
