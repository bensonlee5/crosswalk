# Crosswalk 3D client

Three.js supplies a real perspective 3D scene with solid modeled buildings, doors, windows, roofs, awnings, pavement, trees, benches, fountain, sculpture and fifteen distinct destination props. No flat town painting is used as the world. Existing original location illustrations remain in activity overlays. The buildings and props are original code-authored game meshes, not copied assets.

OrbitControls supplies single-finger orbit, two-finger zoom/pan, mouse orbit/right-pan/wheel. Accessible React controls provide rotation, zoom, focus and keyboard panning; Places supplies every destination without raycasting. Tapping a building or its prop animates that destination and requests the same server-authoritative visit. Activity success triggers a marble celebration and destination prop animation. Animation never writes game state.

The existing D1 API, sixty activities, eight-week rules, guest seats, idempotency and saves are unchanged. Marbles animate only after confirmed snapshots. Destroy cancels RAF, disposes renderer, geometries/materials/textures, controls, resize observer and input/visibility listeners. Backgrounding snaps travel to saved destinations. Pointer gesture thresholds and multi-pointer suppression prevent orbit/pinch from making accidental moves. Busy, movement and overlays disable world picking. Failure to initialize WebGL uses the official Three.js SVGRenderer on the same 3D meshes. Its software rasterization has simplified shading and no texture/shadow support; a 15fps ceiling and idle rendering reduce CPU use. Functional projected HTML destination labels replace texture sprites. Large ground surfaces have explicit render order to avoid painter sorting overlap. Context loss or total renderer failure still keeps Places, activities and the rest of the game available.

Quality: phone widths start in battery-saver mode (pixel ratio1, 512px shadow map,30fps cap); detailed mode caps pixel ratio1.6,1024px shadows,60fps. Static architecture is merged by material to reduce draw calls. Reduced motion disables decorative movement and travel interpolation. No WebGPU requirement, downloads from external asset hosts, physics simulation or additional runtime service.

Official references checked September30,2026:
- https://threejs.org/docs/pages/WebGLRenderer.html (WebGL2 requirement)
- https://threejs.org/docs/pages/OrbitControls.html
- https://threejs.org/manual/en/how-to-dispose-of-objects.html
- https://doc.babylonjs.com/setup/support/webGPU/
- https://docs.godotengine.org/en/stable/tutorials/export/exporting_for_web.html

Three.js was selected for a focused renderer replacement that integrates directly with the existing browser state/menus. Babylon is a viable fuller engine, but its additional game systems are not needed here. Godot Web export would require a separate export/WASM integration and browser constraints without improving the preserved backend. The previous Phaser dependency remains declared for source history compatibility, but is no longer imported by the active game.

Software-renderer reference: https://threejs.org/docs/pages/SVGRenderer.html

Verification September30: TypeScript and build pass; all sixty action rule/previews and old-save tests pass; two synthetic online guests verify fifteen destination updates, idempotency, active-turn ownership, action outcome and bill/turn handoff. Live cloud browser QA covered desktop1180×757 and phone-sized400×606 CSSpx, actual mesh rendering, raycast building selection, orbit button/drag, Places travel, activity rewards and saved reload. This browser disables WebGL, so those visual/input checks used the software3D renderer. Hardware WebGL lighting/shadows, physical pinch, iPhone/Safari and measured hardware framerate remain untested.
