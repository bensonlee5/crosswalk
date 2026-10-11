import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {memberView} from '../supabase/functions/crosswalk-game/game-service.ts';
import {move} from '../lib/game.ts';
import {move as serverMove} from '../supabase/functions/_shared/engine/game.ts';
import {castPeople,initializeCast,resolveCastChoice} from '../lib/character-cast.ts';
import {characterCameos,cameoPeople} from '../lib/character-cameos.ts';
import {canonicalCharacters,canonicalCharacterById,canonicalIdentity} from '../lib/character-canon.ts';
import {characterVoices,familyConversation} from '../lib/character-voice.ts';
import {characterMotiveProfiles} from '../lib/character-motive-profiles.ts';
import {motiveScene} from '../lib/character-motives.ts';
import {worldView,worldPlaceIds,regionDefinitions} from '../lib/world-life.ts';
import {characterVisualIdentity} from '../lib/character-visuals.ts';
import {characterHistoryView} from '../lib/character-histories.ts';
const root=new URL('../docs/character-canon/',import.meta.url);
const guide=JSON.parse(readFileSync(new URL('../guide-content.json',root),'utf8'));
const families=JSON.parse(readFileSync(new URL('families.json',root),'utf8'));
const personalities=JSON.parse(readFileSync(new URL('personalities.json',root),'utf8'));
import {currentGame} from './current-fixture.mjs';
function fixture(names=['Ari']){const g=currentGame({names}),p=g.players[0];for(const region of Object.keys(regionDefinitions))p.world.discoveredPlacesByRegion[region]=[...worldPlaceIds];return{g,p};}
function cameo(g,p,id){const c=canonicalCharacterById[id];p.world.region=c.region;return castPeople(g,p).find(c=>c.id===id);}

test('68 immutable canonical IDs, ages, places and voices reproduce approved manual facts',()=>{
 assert.equal(canonicalCharacters.length,68);assert.equal(new Set(canonicalCharacters.map(c=>c.id)).size,68);
 assert.deepEqual(canonicalCharacters.map(c=>c.id).sort(),guide.characters.map(c=>c.id).sort());
 assert.deepEqual(canonicalCharacters.map(c=>c.id).sort(),personalities.profiles.map(c=>c.id).sort());
 for(const c of guide.characters){const actual=canonicalCharacterById[c.id];for(const field of ['name','age','region','role','intro','family','culturalBackground'])assert.deepEqual(actual[field],c[field],`${c.id} ${field}`);}
 const count={adult:0,adolescent:0,child:0,toddler:0};for(const c of canonicalCharacters)count[c.age<3?'toddler':c.age<13?'child':c.age<18?'adolescent':'adult']++;
 assert.deepEqual(count,{adult:57,adolescent:5,child:5,toddler:1});assert.equal(canonicalCharacterById.bea.age,2);assert.equal(canonicalCharacterById.oren.age,57);
 const manifest=JSON.parse(readFileSync(new URL('source-manifest.json',root),'utf8'));for(const [name,hash] of Object.entries(manifest.sha256)){assert.match(hash,/^[a-f0-9]{64}$/);if(name!=='guide.json')assert.equal(createHash('sha256').update(readFileSync(new URL(name,root))).digest('hex'),hash,name);}
});

test('all families are reciprocal, typed from the authored graph, and never inferred from resemblance',()=>{
 for(const c of canonicalCharacters)for(const f of c.family){assert.ok(canonicalCharacterById[f.id],`${c.id} unknown relative`);assert.ok(canonicalCharacterById[f.id].family.some(other=>other.id===c.id),`${c.id}/${f.id} missing reciprocal`);assert.ok(families.edges.some(e=>[e.fromId,e.toId].includes(c.id)&&[e.fromId,e.toId].includes(f.id)),`${c.id}/${f.id} lacks authored edge`);}
 for(const e of families.edges){for(const [id,other] of [[e.fromId,e.toId],[e.toId,e.fromId]])assert.ok(canonicalIdentity(id).family.some(f=>f.otherId===other));}
 assert.ok(families.edges.some(e=>e.fromId==='glass_sora'&&e.toId==='natsumi_mori'&&e.type.includes('adoptive')));
 assert.ok(families.edges.some(e=>[e.fromId,e.toId].includes('ravi_desai')&&[e.fromId,e.toId].includes('lin')&&e.type.includes('step')));
 assert.ok(families.edges.some(e=>[e.fromId,e.toId].includes('hugo')&&[e.fromId,e.toId].includes('jonah_bell')&&e.type.includes('chosen')));
});

test('current rooms contain 13 bounded rotating cameos and retain their seeded schedules',()=>{
 const {g,p}=fixture();assert.equal(g.schemaVersion,1);assert.equal(characterCameos.length,13);const schedule=JSON.stringify(g.cast.schedule);g.lifeSeed=999;initializeCast(g);assert.equal(JSON.stringify(g.cast.schedule),schedule);
 const visible=new Set();for(let month=1;month<=8;month++){g.round=month;for(const region of Object.keys(regionDefinitions)){p.world.region=region;for(const c of cameoPeople(g,p))visible.add(c.id);}}
 for(const id of ['celia_baptiste','farah_hussain','liang_chen','ravi_desai','esperanza_vega','mei_chen','hana_mori','yuna_park','asha','nico','lin','jian_wu'])assert.ok(visible.has(id),`${id} never appears`);assert.ok(visible.size<68);
});

test('minors only have age-appropriate local choices, no favor, promise, bond or reward track',()=>{
 const {g,p}=fixture();const seen=new Set();
 for(let week=1;week<=8;week++){
  g.round=week;p.hours=6;
  // Ensure the family fixture represents Kit physically present in a safe venue.
  g.cast.schedule[week]=g.cast.schedule[week].filter(a=>a.id!=='kit');g.cast.schedule[week].push({id:'kit',region:'embermesa',spot:'COMMUNITY',kind:'local'});
  for(const c of characterCameos.filter(c=>canonicalCharacterById[c.id].age<18)){
   let view=cameo(g,p,c.id);if(!view)continue;seen.add(c.id);p.place=view.spot;view=cameo(g,p,c.id);
   assert.equal(view.remote,false);assert.equal(motiveScene(g,p,c.id),null);assert.deepEqual(view.choices.map(c=>c.key),['cameo_listen','cameo_choice']);
   for(const choice of view.choices){assert.deepEqual(choice.cost,{time:0,cash:0,energy:0});assert.equal(choice.joy,0);assert.equal(choice.energy,0);}
   for(const forged of ['promise','ask','press','accept','repair','family']){const before=JSON.stringify(g);assert.throws(()=>resolveCastChoice(g,p,`cast:${week}:${c.id}:${forged}`));assert.equal(JSON.stringify(g),before);}
   const before={cash:p.cash,energy:p.energy,joy:p.joy,hours:p.hours,bonds:structuredClone(p.cast.bonds)};const id=view.choices[0].id;resolveCastChoice(g,p,id);
   assert.deepEqual({cash:p.cash,energy:p.energy,joy:p.joy,hours:p.hours,bonds:p.cast.bonds},before);const done=JSON.stringify(g);resolveCastChoice(g,p,id);assert.equal(JSON.stringify(g),done);
   assert.equal(cameo(g,p,c.id).choices.length,0);
  }
 }
 assert.deepEqual([...seen].sort(),['asha','bea','jian_wu','lin','nico']);
});

test('Bea cannot appear alone, travel independently or speak beyond toddler language',()=>{
 const {g,p}=fixture();g.round=2;p.world.region='embermesa';g.cast.schedule[2]=g.cast.schedule[2].filter(a=>a.id!=='kit');assert.equal(cameo(g,p,'bea'),undefined);
 g.cast.schedule[2].push({id:'kit',region:'alder',spot:'COMMUNITY',kind:'visitor'});assert.equal(cameo(g,p,'bea'),undefined);
 g.cast.schedule[2].push({id:'kit',region:'embermesa',spot:'COMMUNITY',kind:'local'});const view=cameo(g,p,'bea');assert.equal(view.companionId,'kit');assert.equal(view.spot,cameo(g,p,'kit').spot);
 assert.match(view.body.join(' '),/beside Kit/);assert.match(view.choices[0].outcome,/“Cup!”/);assert.match(view.choices[1].outcome,/“Up\.”/);assert.doesNotMatch(JSON.stringify(view),/support contract|teaches you|romantic/i);
});

test('family cameo placement matches the responsible adult, away from working water and machinery',()=>{
 const {g,p}=fixture();for(const [id,guardian,week] of [['nico','alder_tess',2],['lin','pelagia_mara',3]]){g.round=week;const view=cameo(g,p,id);assert.ok(view);assert.equal(view.companionId,guardian);assert.equal(view.spot,worldView(p,g).choices.find(c=>c.actorId===guardian&&c.kind==='conversation').spot);assert.ok(['CORNER CAFÉ','COMMUNITY'].includes(view.spot));}
});

test('new adult cameos remember actual branches and preserve client/server save continuation',()=>{
 for(const id of ['celia_baptiste','farah_hussain','liang_chen','ravi_desai','esperanza_vega']){
  const {g,p}=fixture();let view;for(let n=1;n<=8;n++){g.round=n;view=cameo(g,p,id);if(view)break;}
  p.place=view.spot;view=cameo(g,p,id);const before={cash:p.cash,joy:p.joy,energy:p.energy,hours:p.hours},copy=JSON.parse(JSON.stringify(g)),choice=view.choices[1];
  move(g,choice.id);serverMove(copy,choice.id);assert.deepEqual(copy,g);assert.deepEqual({cash:p.cash,joy:p.joy,energy:p.energy,hours:p.hours},{...before,hours:before.hours-1});assert.equal(p.cast.bonds[id],undefined);
  const stored=p.cast.receipts.at(-1).outcome,done=JSON.stringify(g);move(g,choice.id);assert.equal(JSON.stringify(g),done);
  const definition=characterCameos.find(c=>c.id===id);g.round+=definition.period;p.hours=6;const later=cameo(g,p,id);assert.ok(later.body.includes(definition.choiceCallback));assert.equal(p.cast.receipts.at(-1).outcome,stored);
  const read=JSON.stringify(g);castPeople(g,p);characterHistoryView(g,p,id);assert.equal(JSON.stringify(g),read);
 }
});

test('adult voices are individually authored and family links do not overwrite remembered events',()=>{
 assert.deepEqual(Object.keys(characterVoices).sort(),characterMotiveProfiles.map(c=>c.id).sort());for(const field of ['help','boundary','repair','support','small'])assert.equal(new Set(Object.values(characterVoices).map(c=>c[field])).size,26,field);
 for(const id of Object.keys(familyConversation))assert.ok(canonicalCharacterById[id]);
 const {g,p}=fixture();g.round=2;p.world.region='alder';g.cast.schedule[2]=[{id:'oren',region:'alder',spot:'COMMUNITY',kind:'local'}];p.place='COMMUNITY';p.cast.bonds.oren={phase:'shared',approach:'listen',lastWeek:1,conflict:false,repaired:false,memories:[{week:1,text:'A historical sentence kept exactly as it was.'}]};p.motives.bonds.oren={trust:4,earnedWeeks:[1],contributions:999,strained:false};
 const scene=motiveScene(g,p,'oren');assert.match(scene.capacity,/fatigue/);assert.equal(scene.choices.find(c=>c.key==='ask').response,'smaller-offer');assert.match(scene.obligation,/Chemotherapy/);assert.match(castPeople(g,p).find(c=>c.id==='oren').bio,/lymphoma/);assert.equal(p.cast.bonds.oren.memories[0].text,'A historical sentence kept exactly as it was.');
 const support=scene.choices.find(c=>c.key==='ask');assert.doesNotMatch(support.outcome,/returns to the mending|cured|recovered from|no longer ill/);
});

test('all onstage characters have their own reviewed portraits and age-accurate renderer metadata',()=>{
 for(const id of [...Object.keys(characterVoices),...characterCameos.map(c=>c.id)]){const v=characterVisualIdentity(id);assert.ok(v?.portrait,id);assert.equal(v.age,canonicalCharacterById[id].age);assert.match(v.portrait.src,new RegExp(`/${id}\\.webp$`));}
 assert.equal(characterVisualIdentity('bea').ageStage,'toddler');assert.equal(characterVisualIdentity('nico').ageStage,'child');assert.equal(characterVisualIdentity('jian_wu').ageStage,'teen');assert.equal(characterVisualIdentity('liang_chen').ageStage,'elder');assert.equal(characterVisualIdentity('unknown'),null);
});

test('canon personalities and personal cameo outcomes never leak through another seat',()=>{
 const {g,p}=fixture(['Ari','Other']);g.round=1;let view=cameo(g,p,'celia_baptiste');p.place=view.spot;view=cameo(g,p,'celia_baptiste');move(g,view.choices[0].id);
 const other=g.players[1];g.members.owner=[p.id];g.members.different=[other.id];g.mode='online';const stranger=memberView({state:g,version:3},'different');const serialized=JSON.stringify(stranger);assert.ok(!serialized.includes(p.cast.receipts[0].outcome));assert.equal(stranger.players[0].cast,undefined);assert.equal(cameoPeople(stranger,stranger.players[0]).length,0);
 assert.doesNotMatch(serialized,/coreNeeds|communicationStyle|ocean|mbti|INFP/);
});

test('new regional setting descriptions follow climate and settlement canon without changing climate rules',()=>{
 const {g,p}=fixture();const expected={alder:/cool, wet urban/i,saffron:/Mediterranean low-rise suburb/i,glasssteppe:/cold highland rail city/i,pelagia:/warm monsoon harbor.*rural/i,embermesa:/arid rural mesa/i};
 const saved=JSON.stringify(g);for(const [region,pattern] of Object.entries(expected)){p.world.region=region;assert.match(worldView(p,g).region.description,pattern);assert.match(worldView(p,g).destinations.find(d=>d.id===region).description,pattern);}
 p.world.region='alder';assert.equal(JSON.stringify(g),saved);
});


test('Oren short-visit callbacks and farewell remember the actual encounter, not superseded ferry acting',()=>{
 const {g,p}=fixture();p.world.region='alder';
 const at=(week)=>{g.round=week;p.hours=6;g.cast.schedule[week]=[{id:'oren',region:'alder',spot:'COMMUNITY',kind:'local'}];p.place='COMMUNITY';return castPeople(g,p).find(c=>c.id==='oren');};
 const choose=(key)=>{const c=castPeople(g,p).find(c=>c.id==='oren').choices.find(c=>c.key===key);assert.ok(c,key);resolveCastChoice(g,p,c.id);return c;};
 const first=at(2);assert.match(first.body.join(' '),/No building today|building session, no/i);const helped=choose('help');assert.doesNotMatch(helped.outcome,/upside.down|read the ferry captain|hold the little boat|mend.*hinge/);
 const historical=p.cast.receipts[0].outcome,next=at(3);assert.match(next.body.join(' '),/small piece you helped with/);assert.doesNotMatch(next.body.join(' '),/upside.down captain|from your read.through|handing you a ferry/);
 choose('share');at(4);choose('honest');at(5);const farewell=choose('accept');assert.match(farewell.outcome,/short hearing|short|stopping point/);assert.doesNotMatch(farewell.outcome,/handing you a ferry|blue pencil|upside.down|teaches you.*stitch/);assert.equal(p.cast.receipts[0].outcome,historical);
});

test('Oren short capacity survives shared, conflicted and promise branches without a new physical repair',()=>{
 for(const state of [{phase:'shared'},{phase:'shared',conflict:true},{phase:'met',promise:{due:5,status:'open'}},{phase:'met',promise:{due:4,status:'missed'},conflict:true}]){
  const {g,p}=fixture();g.round=5;p.world.region='alder';p.place='COMMUNITY';g.cast.schedule[5]=[{id:'oren',region:'alder',spot:'COMMUNITY',kind:'local'}];p.cast.bonds.oren={phase:'met',approach:'help',lastWeek:4,conflict:false,repaired:false,memories:[{week:4,text:'An earlier encounter.'}],...state};
  const view=castPeople(g,p).find(c=>c.id==='oren');for(const c of view.choices){assert.doesNotMatch(c.body+' '+c.outcome,/chooses one loose hinge to mend|help Oren pack the finished scenery|rebuilding the stage before another performance|teaches you the little stitch|reads.*upside.down/i);}
  const honest=view.choices.find(c=>c.key==='honest');if(honest)assert.match(honest.outcome,/leave the usable stage as it is today/);
  const repair=view.choices.find(c=>c.key==='repair');if(repair)assert.match(repair.outcome,/materials left aside|no building or packing session/);
 }
});

test('dispersed families retain distinct homes and visits never become invented relocations',()=>{
 for(const [id,relative,homes] of [['jo','kit',['Alder Quay','Ember Mesa']],['oren','miro',['Alder Quay','Glasssteppe']],['priya','kamala_arul',['Alder Quay','Pelagia']],['yuna_park','eun_park',['Pelagia','Glasssteppe']]]){const fact=canonicalIdentity(id).family.find(f=>f.otherId===relative).fact;for(const home of homes)assert.ok(fact.includes(home),fact);}
 const traveler=canonicalIdentity('alder_tess').family.find(f=>f.otherId==='nell_harper').fact;assert.match(traveler,/Alder Quay/);assert.match(traveler,/Nell Harper travels between regions/);assert.doesNotMatch(traveler,/Nell Harper lives in Alder/);
 assert.match(familyConversation.jo.body,/Alder Quay.*Ember Mesa/);assert.match(familyConversation.kit.outcome,/Ember Mesa.*Alder Quay/);assert.match(familyConversation.oren.outcome,/Glasssteppe/);
});
