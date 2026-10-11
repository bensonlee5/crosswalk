import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';

test('current painted renderer uses illustrated 2D maps and records their authored medium',()=>{
 const engine=fs.readFileSync(new URL('../app/game-engine.ts',import.meta.url),'utf8');
 assert.match(engine,/parent.dataset.paintStyle=art.medium/);
 assert.match(engine,/illustrated-isometric/);
 assert.doesNotMatch(engine,/WebGLRenderer|OrbitControls/);
});
