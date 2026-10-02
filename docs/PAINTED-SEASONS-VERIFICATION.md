# Painted seasons verification

## Scope

The visual redesign replaces the main card-based game overlays with enamel signage, paper notices, a personal journal and an illustrated weekly newspaper. Production paintings cover location interactions, all nine neighbor chapters, all eight city events and four seasonal establishing scenes. Dynamic text and controls remain real accessible UI.

New rooms retain rulesVersion 2 and add environmentVersion 1 plus the persisted authored weather schedule. Existing rooms do not acquire weather effects. Action previews, energy eligibility and committed results share the same weather calculation. Weekly allowances reset only at the shared round boundary.

## Automated evidence

- Original action previews, economy gates, 15 destinations and classic-save compatibility
- All v2 paths, opportunity claims, rotating turn order, shared garden and nine story chapters
- 592 seasonal action preview/result comparisons across eight weather conditions
- Happiness, heat and recovery caps; clamped resource accounting; final energy eligibility
- 1–4 player round boundaries, eight-week completion, save/reload determinism
- API room ownership, race handling, request replay idempotency, old-lobby joins, server-owned forecasts and weather persistence
- Representative eight-week path simulations, with unchanged cash outcomes

## Build and asset results

TypeScript checking and the final production build pass. All 45 context-mapped WebP assets decode and match their manifest; total art payload is 4.37 MiB, loaded by scene rather than upfront. Every individual painting is under 190 KB. The built Cloudflare Worker was exercised against a disposable real local D1 database: title response, new seasonal room creation, actions, week transition, rain bonus, persisted resume and image responses passed.

The offline Three renderer test covers all 15 destinations and eight weather states, seasonal geometry visibility, matte materials and disposal. It validates a simplified software-rendered scene, not GPU performance. The new isolated UI components lint clean; the game screen and root page retain 33 pre-existing lint errors, with no increase from the baseline.

## Verification boundaries

Real browser self-play, mobile layout screenshots and measured runtime performance remain unverified and must be recorded separately; automated rule checks do not establish those results. The current design keeps all production publication behind the user's approval.
