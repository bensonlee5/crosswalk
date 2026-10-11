import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {locations} from '../lib/locations.ts';
import {relationshipViews} from '../lib/life-events.ts';
import {DECISION_ILLUSTRATIONS} from '../lib/action-art.ts';
import {characterPortraits} from '../lib/character-portraits.ts';
import {gardenPainting,locationPainting,newsPainting,portraitPainting,seasonPainting} from '../app/game-art.ts';
import {currentGame} from './current-fixture.mjs';

const root=fileURLToPath(new URL('../public',import.meta.url));
const manifest=JSON.parse(readFileSync(root+'/paintings/manifest.json','utf8'));
const byPath=new Map(manifest.map(item=>[item.path,item]));
assert.equal(byPath.size,manifest.length,'Duplicate asset paths');
const expected=new Set([
 ...locations.map(location=>locationPainting(location.art)),
 '/paintings/locations/cafe-rain.webp',
 ...Array.from({length:8},(_,month)=>newsPainting(month+1)),
 ...['spring','summer','autumn','winter'].map(seasonPainting),
 ...relationshipViews(currentGame().players[0]).map(person=>portraitPainting(person.id)),
 gardenPainting(false),gardenPainting(true),
 ...Object.values(DECISION_ILLUSTRATIONS).flatMap(art=>[art.src,art.thumb]),
]);
let totalBytes=0;
function verifyWebp(path,item,budget){
 const bytes=readFileSync(root+path);
 assert.equal(bytes.toString('ascii',0,4),'RIFF',path);
 assert.equal(bytes.toString('ascii',8,12),'WEBP',path);
 assert.equal(bytes.length,item.bytes,path);
 assert.ok(item.width>0&&item.height>0,path+' dimensions');
 assert.ok(bytes.length<budget,path+' optimized delivery budget');
 if(item.sha256)assert.equal(createHash('sha256').update(bytes).digest('hex'),item.sha256,path+' content hash');
 totalBytes+=bytes.length;
}
for(const path of expected){
 const item=byPath.get(path);assert.ok(item,'Missing current artwork manifest entry '+path);
 assert.ok(item.alt?.length>10,path+' alternative text');
 assert.ok(!item.source.startsWith('/'),'Internal filesystem path in public manifest');
 verifyWebp(path,item,350_000);
}

const decisions=JSON.parse(readFileSync(root+'/paintings/decisions/manifest.json','utf8'));
assert.deepEqual(decisions.map(item=>item.key).sort(),['disagree','listen','make_promise','renegotiate','say_goodbye','set_boundary']);
for(const item of decisions){
 assert.equal(item.publicPath,`/paintings/decisions/${item.key}.webp`);
 assert.match(item.sha256,/^[a-f0-9]{64}$/);
 verifyWebp(item.publicPath,item,150_000);
}
const portraits=JSON.parse(readFileSync(root+'/paintings/character-portraits/manifest.json','utf8'));
assert.deepEqual(portraits.map(item=>item.id).sort(),Object.keys(characterPortraits).sort());
for(const item of portraits){
 assert.deepEqual(characterPortraits[item.id],{src:item.src,alt:item.alt,revision:item.sha256.slice(0,12)});
 assert.match(item.sha256,/^[a-f0-9]{64}$/);
 verifyWebp(item.src,item,160_000);
}
console.log(`PASS: ${expected.size} current contextual paintings, ${decisions.length} decision paintings and ${portraits.length} canonical portraits; location/monthly news/season/garden/relationship/choice coverage, manifest sizes, hashes and optimized budgets; ${(totalBytes/1048576).toFixed(2)} MiB total.`);
