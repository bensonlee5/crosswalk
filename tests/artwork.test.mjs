import assert from 'node:assert/strict';
import {readFileSync,statSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {locations} from '../lib/locations.ts';
import {neighbors} from '../lib/game.ts';
const root=fileURLToPath(new URL('../public',import.meta.url));
const expected=[...locations.map(l=>`/paintings/locations/${l.art}.webp`),'/paintings/locations/cafe-rain.webp',...Array.from({length:8},(_,i)=>`/paintings/news/week-${i+1}.webp`),...['spring','summer','autumn','winter'].map(s=>`/paintings/seasons/${s}.webp`),...neighbors.flatMap(n=>[`/paintings/portraits/${n.id}.webp`,...n.chapters.map((_,i)=>`/paintings/stories/${n.id}-${i+1}.webp`),`/paintings/keepsakes/${n.id}.webp`]),'/paintings/garden/building.webp','/paintings/garden/complete.webp'];
const manifest=JSON.parse(readFileSync(root+'/paintings/manifest.json','utf8'));let bytes=0;
for(const path of expected){const file=root+path,b=readFileSync(file),m=manifest.find(m=>m.path===path);assert(m,'Missing manifest entry '+path);assert.equal(b.toString('ascii',0,4),'RIFF');assert.equal(b.toString('ascii',8,12),'WEBP');assert.equal(statSync(file).size,m.bytes,path);assert(m.width>0&&m.height>0);assert(m.alt?.length>10);assert(!m.source.startsWith('/'),'Internal filesystem path in public manifest');assert(m.bytes<350_000,'Scene exceeds optimized budget '+path);bytes+=m.bytes;}
assert.equal(new Set(manifest.map(m=>m.path)).size,manifest.length,'Duplicate asset paths');
console.log(`PASS: ${expected.length} contextual WebP assets, exact location/news/story/portrait/season/garden/keepsake coverage, metadata sizes, optimized budgets, no internal source paths; ${(bytes/1048576).toFixed(2)} MiB total`);
