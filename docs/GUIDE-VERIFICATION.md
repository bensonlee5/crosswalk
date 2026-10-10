# Crosswalk field guide: expanded character and location edition

## Scope and integration

This follow-up is based on local release commit `4216605a69c95ce18048e6fc1fc7d105fc174a60` in an isolated checkout. It changes the static guide, its authored source, documentation, build helper, and guide tests. No gameplay, backend, canonical character-history module, artwork, save, dependency, or hosting change is included.

`public/guide/` remains a standalone, progressively enhanced HTML guide. Vite copies it to `dist/guide/`. Preserve canonical portrait filenames so a separate portrait-art revision can merge without changing any biography. Nothing in this follow-up has been published.

## Deliverable

- All 26 existing portraits remain visible with a name, authored age, role, short introduction, and place. Ages span 24–72 across young, middle-aged, and older adults. All nine previously explicit ages, including Neri at 29, are preserved.
- Reciprocal public family links appear on six profiles and in their backstories: Leila/Tomas are older-sister/younger-brother; Miro/Oren are older-brother/younger-brother; Jo (54) is the parent of Kit (28), who has an independent adult life in Ember Mesa. Family links navigate across geography filters. No specific family incident or future outcome is exposed.
- Six real geography sections group the cast: Alder Quay (9), Saffron Reach (4), Glasssteppe (4), Pelagia (5), Ember Mesa (3), and On the road (1). Native anchor links work without JavaScript; enhanced jumps clear conflicting filters, reveal the destination, and update group counts.
- An “Across the map” panel and reciprocal backstory references suggest Bram/Ren and Priya/Tavi as potential cross-regional introductions. These explicitly describe shared interests, without claiming a prior meeting or a future result. This matches the parallel motives/introduction work while keeping existing gated cross-region histories private.
- Every character has a separate 250–500-word backstory, contained in static HTML. Each disclosure displays its exact word count.
- Native `details` and `summary` expose the stories without JavaScript. Exclusive grouping keeps one full story open in supporting browsers; older browsers can still open the independent native disclosures.
- Search includes full backstory text and combines with the place filter. Reset clears both fields and returns focus to search. Controls stay hidden when JavaScript is unavailable.
- An expanded story uses the full grid width with readable prose, while the initial portrait grid stays compact. Phone styles keep the reading column full width.
- Five world paintings introduce Alder Quay, Saffron Reach, Glasssteppe, Pelagia, and Ember Mesa. Each has a two-paragraph, 100–200-word history.
- Print handling opens all backstories, temporarily removes exclusive grouping, and restores the original disclosure state afterward. Filtered profiles are included by print CSS.
- Existing instructions, economy values, guest-save cautions, and verified external links are preserved.

## Source and regeneration

`docs/guide-content.json` is the sole authored source for the character and location sections. It contains only the public guide copy. It is not a dump of game histories, conversations, or future events.

```sh
npm run guide:build
npm run guide:check
```

The helper replaces two marked sections in the HTML, escaping prose and enforcing the backstory word range. Other manual chapters are untouched. `docs/GUIDE-WORD-COUNTS.json` records every count. Counts use whitespace-delimited words in the full paragraphs only; they exclude the role, short introduction, hometown, and disclosure label. Hyphenated words count as one.

## Content-risk review

The accounts are anchored in existing public guide profiles and `characterHistories.before`. Location architecture, country labels, and landmarks use public `regionDefinitions` metadata in `lib/world-life.ts`. Everyday formative details elaborate those foundations without inventing founding dates, political events, major personal crises, credentials, or future achievements. The user-requested age and family additions use the authoritative `lib/character-identities.ts` from the parallel motives work; no identity fact is inferred from a portrait. Jo/Kit is the explicitly authorized new family; the two sibling pairs preserve existing kinship.

Existing first-meeting facts are allowed, including earlier collaborations already present in the public-background fields. No deeper `closer` recollection, gated connection event, later conversation, promised outcome, solution, reward, availability condition, or future plan is copied into the guide. No ethnicity, nationality, or demographic identity is inferred from a portrait; any separate art-direction work remains separate from biography.

An independent prose review covered all 13 second-half profiles. Geography flags were checked against the canonical public region descriptions. An unspecified career duration for Sefu was removed, and a paragraph about Mara explaining equipment was replaced with a more directly grounded account of inspection handovers. The other 13 accounts and all five location histories were reviewed against the same source boundaries. These are authored narrative expansions, not newly added gameplay canon or discovery gates.

## Verified locally

- 17 guide tests pass, including all 26 canonical identities, exact 250–500-word counts in source and deployed HTML, all five histories, deterministic regeneration, HTML escaping, rejection of undersized stories, canonical portrait paths, real geography grouping, filter-aware jumps, reciprocal potential cross-region affinities, spoiler guards, accessible metadata and chapter anchors, current mechanics/save caveats, combined/full-text/empty/repeated filtering, reset focus, failed-image fallback, and repeated print-state restoration.
- All 26 ages and all six reciprocal family labels were compared directly with the authoritative identity module and match. Tests pin the agreed age map, generation range, six family labels, reciprocal links, age ordering, and the 26-year parent/adult-child gap.
- Every referenced local asset exists, including all 26 portraits and all five paintings.
- Focused ESLint passes for the changed JavaScript helper, guide behavior, and both guide-test files.
- `node --check public/guide/guide.js` and `npm run guide:check` pass.
- Python's HTML parser confirms balanced and correctly nested tags.
- The production build with `/crosswalk/` base passes. Its existing large-chunk warning remains; this change adds no app bundle code. Built guide HTML/CSS/JS match the source byte for byte, and all 17 guide tests also pass with the built asset root.

## Verification limits

Aggregate whole-game tests and TypeScript checks were attempted while other release work was running. A typecheck was killed by resource contention; the concurrent and serial suite attempts were stopped to let the combined release own aggregate verification. No aggregate pass is claimed for this follow-up.

Headless Chromium could not start because the execution sandbox rejected its process-singleton socket, including the supported escalation attempt. No browser screenshot, viewport overflow measurement, real keyboard interaction, or visual/mobile/no-JavaScript browser pass is claimed. Semantic/CSS inspection and mocked interaction tests are not substitutes for browser QA. The parent release task will handle the supported public-browser check after integration.

## Combined-release checks

```sh
npm run guide:check
GUIDE_ASSETS_ROOT="$PWD/public" node --test tests/guide.test.mjs tests/guide-expanded.test.mjs
npm test
npm run typecheck
npm run typecheck:backend
npm run check:engine
VITE_BASE_PATH=/crosswalk/ npm run build
GUIDE_ASSETS_ROOT="$PWD/dist" node --test tests/guide.test.mjs tests/guide-expanded.test.mjs
```

After merging the motives work, compare `docs/guide-content.json` ages and family labels with `lib/character-identities.ts`; the latter remains the gameplay source of truth. Do not copy either gated family event into the public guide.

Inspect collapsed and expanded cards, age and family labels, cross-region family jumps, locations, full-text and place searches, zero results, reset focus, image fallbacks, keyboard operation, print restoration, and native disclosures without JavaScript. Cover narrow phones, tablet, and desktop widths. Verify all changed source files against their built copies and the deployed guide only after authorized publication.
