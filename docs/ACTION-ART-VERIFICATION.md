# Illustrated actions

Every selectable gameplay activity has an explicit oil-painting mapping. The catalogue covers all 60 original actions, three additional creative/community actions, nine neighbor chapters, the shared garden and the weekly opportunity. It preserves classic saves, pre-weather neighborhood saves and seasonal campaigns.

## Presentation

- Each choice shows its own optimized illustration thumbnail, title, time and cash outcome
- Selecting a choice changes the full painted scene and the real-text outcome details
- Ineligible activities remain inspectable and clearly show their exact lock reason; their execution button remains disabled
- All eight opportunities use the correct subject for the current week. Week six retains the outdoor mural for pre-weather saves and the indoor sign workshop for seasonal games
- Neighbor chapters, rainy quiet coffee and garden completion keep their contextual illustrations
- The week-ending bill review includes a household painting. Place travel and neighbor visits retain their existing illustrations
- No dynamic values, eligibility or interaction labels are baked into artwork

## Inventory and performance

57 new full paintings were generated individually with built-in image generation. 15 existing scenes meaningfully depict one specific base activity each; nine story paintings and shared-garden paintings are reused for their corresponding actions. The full catalogue uses 84 distinct action/context scenes, backed by 240×160 lazy-loaded thumbnails. Every action ID has a different primary scene. Only the selected full painting is requested eagerly; hidden locations are not preloaded.

The central artwork manifest records dimensions, actual encoded byte counts, descriptions and generation provenance. A new exhaustive test checks explicit mappings, distinct bytes, every original/new/story-stage menu choice, all seasonal and pre-weather opportunity variants, all thumbnail references and payload budgets. Missing action mappings fail instead of silently falling back to a generic location.

## Automated verification

`node tests/action-artwork.test.mjs` is the dedicated coverage test. Existing gameplay, neighborhood, weather, API, balance and renderer tests are rerun alongside TypeScript and the production build. Gameplay/economy source, API routes, save format and weather calculations are unchanged by this update.

Actual live browser verification is recorded with publication results separately. Automated tests do not establish physical-phone or GPU performance.

## Live verification

The public v24 UI was exercised in the cloud browser using an existing seasonal save. All five café thumbnails decoded, changing the selected activity changed the full painting, the espresso shift correctly applied +$125 and one time block, the rain cap persisted, and the neighbor chapter used its specific scene. Responsive layouts were checked at 500, 400 and 333 CSS pixels, with no horizontal dialog overflow. Keyboard Tab reached the primary action with a visible focus ring at 333px. Physical-phone and GPU performance were not benchmarked. A duplicate activity heading observed during QA was removed before the final publication.
