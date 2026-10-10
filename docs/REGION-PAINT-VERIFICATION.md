# Regional 3D painting styles

This is the historical painterly checkpoint. See `REGIONAL-SPACE-VERIFICATION.md` for the later architecture/layout layer, current geometry budgets, and climate snow correction.

Visual-only update based on the approved location paintings, 10 October 2026.
Base: `6257332c5fb14d2af5a3b666975e090d3686b3cc`.

## What changed

The actual Three.js town materials and Saffron meshes are updated. This is not a replacement background image.

- **Alder Quay:** broken oil dabs, warm/cool pigment, warm sun and cool reflected light.
- **Saffron Reach:** minimalist matte gouache, plain ivory/sandstone courtyard walls, fewer façade arches and rooftop ornaments, fewer palms, restrained teal shade planes and water. Original full-quality geometry falls from 29,828 to 22,376 triangles.
- **Glasssteppe:** geometric modernist oil, cool/warm angular pigment planes and blue roofs. Existing mountain, rail, tower and terrace geometry is retained. The briefly proposed minimalist direction was not applied here.
- **Pelagia:** irregular watercolor pools, quiet paper reserves and granulation, plus fine grazing-angle ink darkening. Existing domes, walkways and tidal gates remain.
- **Ember Mesa:** muted timber/clay with indigo/umber dusk shadows, warm occupied windows and relief-shaded impasto brush ridges. Paths remain lighter than the terrain. Dusk is an art direction; it does not set game temperature or add a day/night mechanic.

The shader uses world-space surface coordinates, so batched buildings and roofs without UVs are supported. Protected figure materials, text, labels, snow and selection markers do not receive procedural paint. Vertex pigment provides a deterministic fallback for SVG rendering. No new bitmap texture or postprocessing pass is required. Existing textures, including Three's standard DFG lighting lookup and label canvases, remain.

Rain/fog/dust rendering remains connected to the existing weather fields. Winter cooling, autumn warmth, seasonal foliage/snow, weather particles and reduced-motion rules remain. No engine, rules, saved-game, backend, cast/story or publication changes are included.

## Resource limits

For a fully discovered, unevolved region at full geometry quality:

| Region | Triangles | Added vertex-color bytes |
|---|---:|---:|
| Alder | 17,236 | 458,208 |
| Saffron | 22,376 | 620,928 |
| Glasssteppe | 21,928 | 579,312 |
| Pelagia | 35,968 | 1,025,568 |
| Ember Mesa | 24,028 | 684,288 |

All fifteen evolved venues stay below 50,000 triangles and 2 MiB of added vertex-color buffers in every region. Added paint texture memory is zero. Geometry tint adds no vertices or draw calls. Only one region is retained by the existing renderer lifecycle. Quality changes update a shared uniform and disable fine granulation/impasto relief without rebuilding or adding resources. Marks fade below a pixel footprint and do not depend on time.

These are allocation and geometry budgets, not mobile frame-rate measurements.

## Verification

- TypeScript frontend/backend checks, Vite production build, client/server engine parity and cached Deno Edge check pass.
- 319 tests pass with Node's test concurrency set to one. This includes 24 backend tests, four new material tests, all existing 15-place raycast/arrival, hidden/closed venue, cast-actor, camera, reduced-motion, weather and complete-disposal checks.
- The default parallel baseline test run reported a backend test-process failure without useful diagnostics in this environment. The unchanged backend tests pass alone and in the serial aggregate run.
- New material/geometry/test/export files are ESLint clean. Repository-wide lint retains the baseline 135 errors and 12 warnings; four pre-existing errors remain in `app/game-engine.ts`.
- All 22 GLSL ES 3 variants compile and link in native Mesa EGL: eleven style/vertex-color/protected-material combinations, each unshadowed and with shadow/fog defines.
- All five actual scenes render successfully at full and low paint detail. The renderer is Mesa llvmpipe, an independent software graphics driver.

Native render evidence uses the actual scene meshes and material hooks with Three's standard physical-lighting shader, standard DFG lookup, ACES tone mapping and regional lights. The picture is not a browser screenshot. It omits UI/sign sprites, fog and shadow-map rendering; shadow/fog shader variants are compiled separately. Browser context recovery, touch interactions, screen-reader behavior, actual mobile GPU performance and the integrated game's final appearance still need browser/device QA. No publication was attempted.

## Reproduce

```sh
npm run typecheck
node --experimental-strip-types --test --test-concurrency=1 tests/*.test.mjs tests/*.test.ts
npm run typecheck:backend
npm run check:engine
npm run check:edge
npm run build
node --experimental-strip-types scripts/validate-region-paint.mjs
python3 scripts/validate-region-paint-egl.py
python3 scripts/validate-region-paint-egl.py --low
```

The offline evidence scripts need system EGL/Mesa and Pillow. They perform no network, browser, or game-state operations. Evidence is generated under ignored `outputs/region-paint/`. No environment secrets are needed.
