# Crosswalk Travel Guide on GitHub Pages

The full [Crosswalk Travel Guide](https://bensonlee5.github.io/crosswalk/manual/) keeps its established `/crosswalk/manual/` address so bookmarks and character links continue to work. The separate [player guide](https://bensonlee5.github.io/crosswalk/guide/) still explains how to play.

## Town-first reading

Start with one of five town chapters. Each brings together the regional setting, climate and practical considerations, local venues, residents, histories and meaningful objects. The guide also offers:

- All 75 visitable venues, with individual histories, architecture, community life, associated people, and separately labeled current-game activities and access conditions
- An exactly 30-object searchable catalog, recurring fictional brands and maker profiles, ownership/use relationships, associated places and explicitly labeled story proposals
- 68 complete biographies, portraits, ages, cultural backgrounds and personality profiles
- Six geography pages, including travelers, and a family browser with reciprocal relationships and cross-region histories

Search by keyword and region, plus venue or object type. Items can also be filtered by owner, recurring brand or story/game status. Every entry has an ordinary static URL and remains readable without JavaScript. Query/filter state survives Back and page-show restoration.

## Sources and shared rendering

`scripts/build-manual.mjs` reads the existing canon in `docs/guide-content.json`, `docs/guide-approved-roster.json` and `docs/character-canon/{personalities,families}.json`. The new authored catalog sources are `docs/manual/items.json` and `docs/manual/venues.json`.

`scripts/manual-expansion.mjs`, `docs/manual/catalog.css`, `docs/manual/catalog.js` and `scripts/check-catalog.mjs` are shared byte-for-byte with the private guide's corresponding renderer, presentation and validation files. Do not fork the templates between destinations.

Established world objects are not presented as usable inventory unless explicitly implemented. Story proposals are labeled in cards, profiles, and backlinks. Venue histories and architecture are labeled worldbuilding; current actions and access restrictions have their own section. Associated places do not imply that an object is available to pick up there.

The guide shares artwork in `public/paintings/`; no image bytes are duplicated under `public/manual/`. Images use content-hash revisions. An object without bespoke artwork receives a text-led card. Venue illustrations are labeled regional settings rather than building-specific images. All navigation and asset paths are relative and resolve beneath `/crosswalk/manual/` or a custom-domain root.

## Build and verify

```
npm run manual:build
npm run manual:check
node --test tests/manual.test.mjs tests/manual-search.test.mjs tests/manual-catalog.test.mjs tests/manual-catalog-build.test.mjs
VITE_BASE_PATH=/crosswalk/ npm run build
```

The ordinary game build regenerates `public/manual/` before Vite copies public assets. `manual:check` rebuilds in a temporary directory and compares every generated file byte-for-byte. Source JSON, review records, hosting metadata and credentials are never copied into the deployment.

Checks cover the full page inventory, verbatim character and regional content, all venue/item text, bidirectional people/place/object links, source validation, artwork hashes, every HTML link and fragment under the GitHub Pages prefix, retired-entry cleanup, ARIA references, and repeated search, filtering, Reset and history restoration. Responsive CSS accommodates narrow screens and keyboard focus. These are static and DOM-fixture checks; browser/mobile layout verification is not claimed.
