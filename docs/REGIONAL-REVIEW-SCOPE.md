# Regional world review scope

This isolated working branch combines the validated 26-adult game baseline with the new regional climate, settlement, civic-participation, and location-rendering work. It is not a published release.

## Validated release candidate

- Geographic climates and weather-aware activities/journeys: reviewed checkpoint `a68a9d37`.
- Settlement exploration and optional local participation: independently reviewed checkpoint `3da77f1`.
- Painterly 3D location materials: checkpoint `a051e501`, integrated as `e68c6b9`.
- Region-specific spatial layouts and climate-aware rendering: reviewed checkpoint `4225b31`, integrated as `24fdfa2`.
- Combined world checkpoint: 345/345 serial tests, frontend/backend types, engine parity, Edge check, production build, and 24/24 bundled backend tests passed.
- Qualitative player-state presentation: reviewed checkpoint `fffc6b0`, integrated as `06a7824`. The final combined release passes 351/351 serial tests, frontend/backend types, engine parity, Edge check, production build and guide verification. Existing numerical scoring remains unchanged; the finer presentation uses ten energy, mood and social states, seven genuine skill stages, nine craft stages and eleven legacy states.

Existing saved games retain their earlier climate and regional-life rules. The new rules apply to newly created rooms after an eventual release. Basic local navigation remains free. No rent or wage redesign is included.

## Character scope

The private illustrated manual currently has 34 characters, with an authorized expansion to 68 in progress, revised portraits, family/cultural histories, and Oren's authored illness. This game branch retains the validated 26-adult cast and its existing character assets. It does not silently import the four children, four newer East Asian characters, later wardrobe edits, or all manual biography revisions. Manual and playable character scope must be stated clearly with any future playable preview or publication decision.

## Verification boundary

Native graphics and automated tests are distinct from live browser/device QA. Cloud local-preview navigation was restricted; the private manual's live browser review stopped at owner sign-in consent. Neither restriction has been bypassed. Mobile touch, integrated browser rendering and actual mobile GPU performance remain unverified unless separately reported after a supported test.

Game GitHub Pages/backend publication is authorized after final checks. This source is the validated publication candidate; remote deployment and live browser verification are separate steps and are not implied by this document. The owner-private manual is published separately; its link is shared in the owner’s review conversation.
