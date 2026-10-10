# Regional architecture and street geometry

This spatial layer follows painterly checkpoint `a051e501` and settlement checkpoint `71f377fe`. It supersedes their shared-coordinate constraint. The original 15 venue IDs, game rules and save identities remain; regional presentation coordinates now differ.

## Authored spaces

`app/region-layouts.ts` is the single source for venue positions, rotations, footprints, elevations, streets, cross-district connections, camera hubs and bounds. Both the visible decks and player journeys consume this graph.

- Alder: a compact quay grid, denser brick frontage, cargo hoists and loading shutters.
- Saffron: spacious low-rise courtyard lots, restrained basins, canal promenades and a three-arch crowned crossing. Minimalist gouache remains deliberately sparse.
- Glasssteppe: upper and middle stone terraces at 2.4 and 1.2 world units, connected by gentle ramps, with glazed academic bays and the existing copper railway.
- Pelagia: branching raised boardwalks at 0.6 units, supported arrival platforms, rainwater storage, floodgates and the rural outer shore.
- Ember: a wider, irregular dirt-track loop, smaller timber footprints, tool racks, water barrels, field edges and open space. Dusk paths and warm occupied windows remain readable.

| Region | Apartment-to-cinema route | Venue-center horizontal extent | Apartment footprint scale |
|---|---:|---:|---|
| Alder | 98.74 | 78.72 | 1.05 × 1.00 |
| Saffron | 119.02 | 105.84 | 1.00 × 1.05 |
| Glasssteppe | 114.01 | 91.18 | 1.00 × 1.00 |
| Pelagia | 108.78 | 96.96 | 0.90 × 0.90 |
| Ember | 164.19 | 134.64 | 0.82 × 0.78 |

These are renderer world units, not fares, activity costs or game clock time. Movement duration varies modestly with path length and remains immediate under reduced motion.

## Navigation and lifecycle

All 225 origin/destination pairs in each region are reachable. Sampled route segments clear rotated building shells and potential conversion annexes by at least a marble radius. Opposing district-edge buildings reserve separate footprints. Every water crossing uses an authored bridge or boardwalk, and height transitions have supported ramps/crowned bridges below a 13% grade.

Broad arrival pads accommodate four players along the facade. Their route first converges to the pad center before entering a narrow public path. Door heights also drive selection rings, player labels, arrival snapping, camera focus, and saved home/garden/greenhouse scenery. Region transitions and context-loss reconstruction settle the old journey before restoring the new region. Hidden and closed targets retain their existing interaction guards.

Modern climate roof snow requires an actual snow forecast. A cold clear desert night does not create snow. The legacy seasonal fallback remains for weather without a temperature field. Cold/cool light tint is separate from precipitation.

## Resource evidence

| Region | Full-quality base triangles | All 15 evolved + seven actors | Base vertex-pigment bytes |
|---|---:|---:|---:|
| Alder | 20,288 | 29,476 | 516,240 |
| Saffron | 24,920 | 34,108 | 705,888 |
| Glasssteppe | 26,640 | 35,828 | 715,248 |
| Pelagia | 35,746 | 45,254 | 1,045,512 |
| Ember | 22,896 | 32,484 | 643,536 |

No added paint image textures are allocated. These are geometry/allocation limits, not mobile timing benchmarks.

## Evidence and limits

Final source verification: 331/331 tests pass with serial execution, including 24 backend tests. Frontend typecheck, Vite production build, focused lint and client/server engine parity pass. All 22 GLSL ES 3 variants compile and link; all five native scenes render at full and low paint detail. Build retains the existing large-chunk warning. No browser or hardware-mobile result is claimed.

All 150 focused-view cases (five regions, fifteen places, portrait 375 × 720 and landscape 1000 × 800) keep the projected venue center inside normalized |x|, |y| < 0.6 and a conservative upper label anchor inside |x| < 0.6, |y| < 0.8. Regional focus favors the selected building; the separate district view retains its wider overview. The legacy camera remains unchanged.


The verification commands and native renderer described in `REGION-PAINT-VERIFICATION.md` remain applicable. The new pure graph tests are `tests/region-layouts.test.mjs`; engine lifecycle tests now cover elevated arrivals, region swaps, context loss and shared facade slots. Model tests cover all 15 evolved venues plus seven additional local actors within 50,000 triangles and 2 MiB of vertex pigment per region. Pelagia's repetitive circular details use fewer segments to leave budget headroom without changing character anatomy.

Native previews are offline Mesa EGL renders of the actual Three scene geometry and shader hooks. They do not show the browser UI, sign sprites, rendered shadow maps, touch behavior or hardware-mobile frame rates. No new bitmap texture, postprocessing pass, save schema or backend change is introduced by this layer. Integration/browser review and publication remain separate.
