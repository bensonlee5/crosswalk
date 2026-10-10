import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
test('venue arrival motion is short, reduced-motion safe, and loaded after presentation styles',()=>{
 const css=readFileSync(new URL('../app/navigation-motion.css',import.meta.url),'utf8');
 for(const name of ['game-location-dialog','game-encounter-dialog','game-menu-dialog'])assert.ok(css.includes(name));
 assert.match(css,/venue-arrive 240ms/);assert.match(css,/venue-depart 140ms/);
 assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);assert.match(css,/animation:none!important/);
 const entry=readFileSync(new URL('../src/main.tsx',import.meta.url),'utf8');assert.ok(entry.indexOf('navigation-motion.css')>entry.indexOf('image-choices.css'));
 const screen=readFileSync(new URL('../app/game-screen.tsx',import.meta.url),'utf8');assert.equal((screen.match(/behavior:window\.matchMedia\?\.\('\(prefers-reduced-motion: reduce\)'\)\.matches\?'instant':'smooth'/g)||[]).length,2);
});
test('neighborhood preview keeps payment and energy requirement clear without foregrounding gains',()=>{
 const source=readFileSync(new URL('../app/game-screen.tsx',import.meta.url),'utf8');
 assert.ok(source.includes('<p>{economyTimeLabel(g,2)} · +{money(opportunity(g).earn)} · Takes some effort</p>'));
});
