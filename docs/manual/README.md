# Illustrated manual on GitHub Pages

The full illustrated manual is served at [crosswalk/manual/](https://bensonlee5.github.io/crosswalk/manual/). It is separate from the shorter gameplay guide at `guide/`.

## Contents and source

- 68 complete biographies, ages, cultural backgrounds, and personality profiles
- Six geography pages, including travelers
- Five illustrated location histories with climate, settlement, cultural history, and everyday life
- A family browser with reciprocal typed relationships, age-ordered families, and cross-region histories
- A searchable character directory that works as ordinary navigation without JavaScript

The builder is `scripts/build-manual.mjs`. It reads the existing game sources `docs/guide-content.json`, `docs/guide-approved-roster.json`, and `docs/character-canon/{personalities,families}.json`. This directory holds the manual's presentation assets and dispersed-family prose. Approved canon is not duplicated in a second manual data store.

The manual shares all 68 portraits and five location paintings already in `public/paintings/`. Image URLs include their content-hash revision. No image bytes are duplicated under `public/manual/`. Every manual link and asset path is relative, so nested pages work beneath `/crosswalk/manual/` and when the game is served from a custom-domain root.

## Build and verify

```
npm run manual:build
npm run manual:check
node --test tests/manual.test.mjs tests/manual-search.test.mjs
VITE_BASE_PATH=/crosswalk/ npm run build
```

`manual:build` writes the tracked static export into `public/manual/`. The ordinary game build runs it before Vite copies public assets into `dist/`, so the existing GitHub Pages workflow publishes the game and full manual together. `manual:check` rebuilds in a temporary directory and compares every generated file byte-for-byte. No network, authentication, database, hosting credentials, or extra runtime dependencies are needed.

The generated manual contains 82 content pages, one manual-local 404 page, and three presentation assets. It includes only public-facing HTML, CSS, JavaScript, and an SVG favicon. Authoring/review manifests, source JSON, recovery notes, credentials, and private hosting metadata are not copied to the deployment.

Automated coverage checks the entire page inventory, 68-person canon, verbatim biographies and personality details, histories and regional fields, family reciprocity, cross-region prose, artwork hashes, every HTML link/fragment/asset under the GitHub Pages prefix, and 630 repeated search/filter cases including Reset and Back/page-show restoration. These are static and DOM-fixture checks; no new browser/mobile layout verification is claimed for this export.
