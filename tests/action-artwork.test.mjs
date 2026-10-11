import assert from 'node:assert/strict';
import {readFileSync,statSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {actions,availableActions,opportunity} from '../lib/game.ts';
import {locations} from '../lib/locations.ts';
import {currentGame} from './current-fixture.mjs';
import {getWeather} from '../lib/weather.ts';
import {worldPlaceIds} from '../lib/world-life.ts';
import {ACTION_ILLUSTRATIONS,OPPORTUNITY_ILLUSTRATIONS,DECISION_ILLUSTRATIONS,RAINY_COFFEE_ILLUSTRATION,COMPLETED_GARDEN_ILLUSTRATION,actionIllustration} from '../lib/action-art.ts';
const root=fileURLToPath(new URL('../public',import.meta.url));
const manifest=JSON.parse(readFileSync(root+'/paintings/manifest.json','utf8'));
const byPath=new Map(manifest.map(m=>[m.path,m]));
assert.equal(byPath.size,manifest.length,'No duplicate asset records');
const expectedIds=actions.filter(a=>a.id!=='weekly_opportunity').map(a=>a.id).sort();
assert.deepEqual(Object.keys(ACTION_ILLUSTRATIONS).sort(),expectedIds,'Every static action is explicitly mapped, with no orphan keys');
assert.ok(actions.length>30);assert.equal(OPPORTUNITY_ILLUSTRATIONS.length,8);
assert.throws(()=>actionIllustration({id:'unmapped_test_action'}),/Missing activity illustration/,'Unknown actions must not silently use a generic location fallback');
const game=currentGame();
const art=new Map();
for(const a of actions){const illustration=actionIllustration(a,game);assert(illustration.src&&illustration.thumb&&illustration.alt.length>12,a.id);art.set(illustration.src,illustration);}
assert.equal(art.size,actions.length,'Every current action has its own distinct scene');
for(const illustration of [...OPPORTUNITY_ILLUSTRATIONS,...Object.values(DECISION_ILLUSTRATIONS),RAINY_COFFEE_ILLUSTRATION,COMPLETED_GARDEN_ILLUSTRATION])art.set(illustration.src,illustration);
const expectedWeekly=['poster','market','showcase','research','shop','sign','supper','finale'];
for(let round=1;round<=8;round++){
 const seasonal={...game,round};
 const scene=actionIllustration({id:'weekly_opportunity'},seasonal);
 assert.match(opportunity(seasonal).title,/Alder Quay/);
 assert.equal(scene.src,`/paintings/actions/opportunity_${expectedWeekly[round-1]}.webp`,'Correct weekly seasonal opportunity art');
 for(const action of actions)assert(actionIllustration(action,seasonal).src,`${round}/${action.id}`);
}
for(let round=1;round<=8;round++){const seasonal={...game,round};assert.equal(actionIllustration({id:'cafe_break'},seasonal),getWeather(seasonal)?.type==='rain'?RAINY_COFFEE_ILLUSTRATION:ACTION_ILLUSTRATIONS.cafe_break);}
assert.equal(actionIllustration({id:'garden_project'},{...game,project:{completed:true,contributions:{},lastWeek:{}}}),COMPLETED_GARDEN_ILLUSTRATION);
let menuChecks=0;
const p=game.players[0];p.world.discoveredPlacesByRegion.alder=[...worldPlaceIds];
for(const location of locations)for(const option of availableActions(p,location.place,game)){assert(actionIllustration(option,game));menuChecks++;}
const hashes=new Set();
for(const illustration of art.values()){
 for(const [path,thumb] of [[illustration.src,false],[illustration.thumb,true]]){
  const b=readFileSync(root+path),m=byPath.get(path);assert(m,`Manifest missing ${path}`);assert.equal(b.toString('ascii',0,4),'RIFF');assert.equal(b.toString('ascii',8,12),'WEBP');assert.equal(statSync(root+path).size,m.bytes);assert(m.alt.length>10&&m.generation==='OpenAI imagegen');assert(!m.source.startsWith('/'));
  if(thumb){assert.equal(m.width,240);assert.equal(m.height,160);assert(m.bytes<22_000,`Thumbnail budget ${path}`);}
  else{assert(m.width>=760&&m.width<=768);assert(m.height>=508&&m.height<=512);assert(m.bytes<190_000,`Scene budget ${path}`);const hash=createHash('sha256').update(b).digest('hex');assert(!hashes.has(hash),'Duplicate scene bytes '+path);hashes.add(hash);}
 }
}
const screen=readFileSync(new URL('../app/game-screen.tsx',import.meta.url),'utf8');
assert.match(screen,/src=\{art.thumb\}\s+alt=""/,'Selectable cards use decorative optimized thumbnails');
assert.match(screen,/src=\{selectedArt\?\.src \?\? locationPainting\(selected.art\)\}/,'Activity scenes preserve the selected action painting; story-only venues have a location fallback');
assert.match(screen,/alt=\{selectedArt\?\.alt \?\? worldPlaceName\(p, selected.place, g\)\}/,'Selected scene retains meaningful alt text');
assert.match(screen,/aria-pressed=\{a\?\.id\s*===\s*option.id\}/);assert.match(screen,/aria-describedby=\{lock\s*\?/);assert.match(screen,/disabled=\{!active\s*\|\|\s*busy\s*\|\|\s*moving\s*\|\|\s*offline\s*\|\|\s*cooldown\s*\|\|\s*!!why\}/,'Execution stays disabled when ineligible');
const image=readFileSync(new URL('../app/game-painting.tsx',import.meta.url),'utf8');assert.match(image,/loading=\{priority\?'eager':'lazy'\}/);assert.match(image,/decoding="async"/);
console.log(`PASS: ${actions.length} current activity scenes, ${art.size} variants and authored decision scenes, ${menuChecks} menu choices, asset budgets, manifests and accessible previews.`);
