import assert from 'node:assert/strict';
import {readFileSync,statSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {actions,neighbors,availableActions,player,opportunity,createEnvironment} from '../lib/game.ts';
import {locations} from '../lib/locations.ts';
import {ACTION_ILLUSTRATIONS,OPPORTUNITY_ILLUSTRATIONS,CLASSIC_MURAL_ILLUSTRATION,RAINY_COFFEE_ILLUSTRATION,COMPLETED_GARDEN_ILLUSTRATION,actionIllustration} from '../lib/action-art.ts';
const root=fileURLToPath(new URL('../public',import.meta.url));
const manifest=JSON.parse(readFileSync(root+'/paintings/manifest.json','utf8'));
const byPath=new Map(manifest.map(m=>[m.path,m]));
assert.equal(byPath.size,manifest.length,'No duplicate asset records');
const expectedIds=actions.filter(a=>a.id!=='weekly_opportunity').map(a=>a.id).sort();
assert.deepEqual(Object.keys(ACTION_ILLUSTRATIONS).sort(),expectedIds,'Every static action is explicitly mapped, with no orphan keys');
assert.equal(actions.length,74);assert.equal(OPPORTUNITY_ILLUSTRATIONS.length,8);
assert.throws(()=>actionIllustration({id:'unmapped_test_action'}),/Missing activity illustration/,'Unknown actions must not silently use a generic location fallback');
const game={round:1,rulesVersion:2,...createEnvironment()};
const art=new Map();
for(const a of actions){const illustration=actionIllustration(a,game);assert(illustration.src&&illustration.thumb&&illustration.alt.length>12,a.id);art.set(illustration.src,illustration);}
assert.equal(art.size,74,'Every one of the 74 action IDs has its own distinct scene, not a shared generic background');
for(const illustration of [...OPPORTUNITY_ILLUSTRATIONS,CLASSIC_MURAL_ILLUSTRATION,RAINY_COFFEE_ILLUSTRATION,COMPLETED_GARDEN_ILLUSTRATION])art.set(illustration.src,illustration);
const expectedWeekly=['poster','market','showcase','research','shop','sign','supper','finale'];
const expectedTitles=['Spring festival poster','Rainy-day indoor market','Summer craft showcase','Cool-room neighborhood research','Autumn shop welcome','Rainy-day sign workshop','Greenhouse harvest supper','Winter lantern finale'];
for(let round=1;round<=8;round++){
 const seasonal={...game,round},legacy={round,rulesVersion:2};
 const scene=actionIllustration({id:'weekly_opportunity'},seasonal);
 assert.equal(opportunity(seasonal).title,expectedTitles[round-1]);
 assert.equal(scene.src,`/paintings/actions/opportunity_${expectedWeekly[round-1]}.webp`,'Correct weekly seasonal opportunity art');
 assert.equal(actionIllustration({id:'weekly_opportunity'},legacy).src,round===6?'/paintings/actions/opportunity_mural.webp':scene.src,'Pre-weather v2 saves retain the outdoor mural subject');
 for(const action of actions)assert(actionIllustration(action,seasonal).src,`${round}/${action.id}`);
}
assert.equal(actionIllustration({id:'cafe_break'},{...game,round:2}),RAINY_COFFEE_ILLUSTRATION);
assert.equal(actionIllustration({id:'cafe_break'},{...game,round:6}),RAINY_COFFEE_ILLUSTRATION);
assert.equal(actionIllustration({id:'cafe_break'},{round:2,rulesVersion:2}),ACTION_ILLUSTRATIONS.cafe_break);
assert.equal(actionIllustration({id:'garden_project'},{...game,project:{completed:true,contributions:{},lastWeek:{}}}),COMPLETED_GARDEN_ILLUSTRATION);
for(const n of neighbors)for(let stage=1;stage<=3;stage++)assert.equal(actionIllustration({id:`story_${n.id}_${stage}`},game).src,`/paintings/stories/${n.id}-${stage}.webp`);
let menuChecks=0;
for(const rulesVersion of [undefined,2])for(let chapter=0;chapter<=3;chapter++){
 const p=player('Art coverage');p.rulesVersion=rulesVersion;p.stories=Object.fromEntries(neighbors.map(n=>[n.id,chapter]));
 for(const location of locations)for(const option of availableActions(p,location.place)){assert(actionIllustration(option,game));menuChecks++;}
}
let fullBytes=0,thumbBytes=0;const hashes=new Set();
for(const illustration of art.values()){
 for(const [path,thumb] of [[illustration.src,false],[illustration.thumb,true]]){
  const b=readFileSync(root+path),m=byPath.get(path);assert(m,`Manifest missing ${path}`);assert.equal(b.toString('ascii',0,4),'RIFF');assert.equal(b.toString('ascii',8,12),'WEBP');assert.equal(statSync(root+path).size,m.bytes);assert(m.alt.length>10&&m.generation==='OpenAI imagegen');assert(!m.source.startsWith('/'));
  if(thumb){assert.equal(m.width,240);assert.equal(m.height,160);assert(m.bytes<22_000,`Thumbnail budget ${path}`);thumbBytes+=m.bytes;}
  else{assert(m.width>=760&&m.width<=768);assert(m.height>=508&&m.height<=512);assert(m.bytes<190_000,`Scene budget ${path}`);fullBytes+=m.bytes;const hash=createHash('sha256').update(b).digest('hex');assert(!hashes.has(hash),'Duplicate scene bytes '+path);hashes.add(hash);}
 }
}
const screen=readFileSync(new URL('../app/game-screen.tsx',import.meta.url),'utf8');
assert.match(screen,/src=\{art.thumb\} alt=""/,'Selectable cards use decorative optimized thumbnails');
assert.match(screen,/src=\{selectedArt!.src\} alt=\{selectedArt!.alt\}/,'Selected scene is the specific action image');
assert.match(screen,/aria-pressed=\{a.id===option.id\}/);assert.match(screen,/aria-describedby=\{lock\?/);assert.match(screen,/disabled=\{!active\|\|busy\|\|moving\|\|cooldown\|\|!!why\}/,'Execution stays disabled when ineligible');
const image=readFileSync(new URL('../app/game-painting.tsx',import.meta.url),'utf8');assert.match(image,/loading=\{priority\?'eager':'lazy'\}/);assert.match(image,/decoding="async"/);
console.log(`PASS: 74/74 action IDs, ${art.size} exact scene variants, all 16 seasonal/legacy weekly opportunity mappings, ${menuChecks} classic/new/story-stage menu choices, thumbnails/scene budgets, distinct image bytes, manifests, disabled execution and accessibility hooks. ${(fullBytes/1048576).toFixed(2)} MiB full scenes, ${(thumbBytes/1048576).toFixed(2)} MiB thumbnails.`);
