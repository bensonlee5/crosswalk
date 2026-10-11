# Illustrated isometric renderer


## Art and navigation

Each region has its own 1536 × 1024 painting in `public/paintings/isometric/`, shown in an 1800 × 1200 logical scene. The maps were composed against that region's existing distinct route topology and approved manual landscape. Saffron was simplified toward matte minimal gouache; Glasssteppe was revised toward cold, angular highland civic architecture and conifers; Pelagia was revised toward tropical timber/stilt buildings and engineered monsoon waterways.

`app/isometric-authored.ts` supplies manually calibrated painted doorsteps, venue hit/occlusion polygons, road nodes and doorway approach points. `app/isometric-scene.ts` finds shortest routes over the existing authored regional graph using screen-space distances. Routes are never interpolated straight from one venue button to another. Entering a venue follows its calibrated approach in reverse. Saffron's maker studio uses its northwest stair; the café steps, community approach, inter-district bridges and Pelagia's public-waterworks paths have explicit calibration.

The base image is followed by the dotted walking route, depth-sorted painted building masks and grounded full-body figures, then readable labels and climate overlays. Building masks reuse the same image URL, clipped by SVG polygons. Figure depth follows feet, with each building's threshold derived from its painted doorstep. The player has a numbered badge and active ground halo. NPC figures use age-scaled bodies; children are grouped beside the actual visible guardian, and canonical portrait detail appears in encounters.

`lib/map-actors.ts` derives physical people from actual local venue encounters, prioritizes authored story scenes/cast schedules, deduplicates fallback resident locations and retains child companion IDs. This includes the original Mina, Eli and Jo, rather than only the newer friendship cast. A child is omitted if the corresponding adult cannot be rendered at the same location.

## Controls and semantics

- Tap/click a painted venue or person to walk there and preview the venue/encounter.
- Drag to pan; pinch or +/− to zoom. Arrow keys pan when the map is focused.
- Find my character recenters; Entire map fits the town; district buttons frame the respective neighborhood.
- L opens Places. The keyboard-accessible Places interface is an equivalent navigation path and remains usable if art loading fails.
- Local walking still uses the existing visit confirmation, action locks, travel callbacks and stale-context guards. Movement itself adds no time or cost. Regional fares, practical money/time, qualitative states, save formats and backend rules are unchanged by this renderer.
- During long trips the camera follows the walker rather than jumping ahead to the destination. Reduced motion and hidden tabs settle immediately. Drag/pinch gestures cannot become visits; context changes, captured-pointer cancellation and teardown discard stale gestures.

## Resource lifetime and small screens

Only the current region's SVG scene is retained. Rebuild removes prior masks, labels and figures; animation paths are transferred only when the same player's in-flight trip remains current. The completed-image cache is a bounded set of five URL strings, not a cache of decoded Image objects. Temporary Image objects are not retained by the renderer after completion. Asynchronous image callbacks carry request generations, so a previous region or disposed renderer cannot signal readiness/failure for a later scene. SVG masks share a URL and rely on browser image caching; actual decoding/cache eviction remains browser-managed.

SVG has no DPR-sized canvas allocation. Zoom is clamped to 0.15–2, and pan is clamped to the current image bounds; a smaller scene centers instead of exposing unbounded blank margins. Labels have constant screen-size text and hide overlapping secondary copies. Mobile HUD offsets reserve a separate map area, and full Places access remains available. The runtime atlas totals approximately 3.4 MiB compressed, with one region requested at a time.

## Verification scope

Native tests exercise all 1,125 origin/destination routes; endpoints, bounded coordinates, interpolation, depth order, actor IDs, guardian adjacency, repeated syncs, interrupted movement, selected-turn halos, stale gestures, phone/desktop viewport transforms, live walking-camera containment, failed/stale images and disposal. Hand-reviewed inset polygons for clearly open water in Saffron and Pelagia catch route segments crossing those areas. These are calibration guardrails, not complete pixel collision masks for every roof, tree or decorative surface.

Actual GameScreen component tests exercise the live map-actor adapter, including an eligible Asha + Eli pair. Native SVG renders provide scene, phone-focus and annotated route composites. This does not establish browser layout, native touch behavior, focus trapping, actual browser memory use or online multi-device behavior. Public browser QA is still required before release.

### Reproduce native previews

From the repository root, run `node scripts/render-isometric-review.mjs /tmp/crosswalk-isometric-review --png`. This uses the deterministic SVG renderer harness, the shipped WebP assets, Pillow for lossless decoding to PNG and an installed Inkscape for rasterization. It produces a whole-map scene, phone-focus scene and five-route annotation for every region. These are native static review images, not browser screenshots; the harness uses raw venue IDs as labels and example Kit/Bea figures.

### Validation checkpoint (10 October 2026)

- Full serial Node suite: **376 passed, 0 failed**.
- Final renderer suite after camera-follow/capture hardening: **21 passed, 0 failed**.
- TypeScript typecheck, client/server engine-copy verification and targeted new-renderer lint: passed.
- Vite production build: passed. Selected renderer chunk: 27.40 kB (11.58 kB gzip); no Three/WebGL imports. The existing shared application chunk still triggers Vite's large-chunk advisory.
- `git diff --check`: passed. Public browser QA and real online multi-device checks remain release-owner gates.

### Independent input-review corrections

The follow-up patch aligns picking with the actual painted layer order: visible label rectangles consume input before people/buildings, and clipped secondary labels are hidden. The selected label is clamped inside the viewport. Text is measured once on creation, shortened with an ellipsis where necessary, constrained inside its padded rectangle and paired with a full-name title; a real evolved venue name after travel and JSON save/reload is covered.

Guardian/child input uses age-scaled body bounds before nearest expanded touch targets. Hidden-tab transitions cancel captured gestures. Returning to a cached region clears old art failure status, and initial mobile quiet-weather state is applied before the first weather update. Focused renderer/component checks and the separate actual-world long-name regression pass; the release owner performs the final combined suite.
