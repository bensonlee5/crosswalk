import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {player,move} from '../lib/game.ts';
import {initializeLife} from '../lib/life-events.ts';
import {initializeEconomyPlayer} from '../lib/economy.ts';
import {initializeWorldPlayer,initializeSharedWorld,regionDefinitions,worldPlaceIds,worldView} from '../lib/world-life.ts';
import {initializeStory,getStoryView} from '../lib/story-arcs.ts';
import {initializeCast,castPeople,castMemberFields} from '../lib/character-cast.ts';
import {characterAges,characterFamilies,publicCharacterIdentity} from '../lib/character-identities.ts';
import {motivePortrait} from '../lib/motive-portraits.ts';
import {motiveLegacyCampaign} from './support/motive-legacy-campaign.mjs';
import {historicalVenueLabels} from './support/venue-name-snapshot.mjs';
import {historicalDescriptiveCopy} from './support/descriptive-copy-snapshot.mjs';
import {characterHistories} from '../lib/character-histories.ts';
import {characterMotiveProfiles,motiveIntroductions} from '../lib/character-motive-profiles.ts';
import {initializeMotivesPlayer,motiveScene,resolveMotiveChoice,recordMotiveEvidence} from '../lib/character-motives.ts';
import {move as serverMove} from '../supabase/functions/_shared/engine/game.ts';
import {memberView,roomView} from '../supabase/functions/crosswalk-game/game-service.ts';

function room(opt=true,seed=15){
 const p=player('Ari',1);p.id='fixed-player';
 const g={code:'MOTIVE',mode:'hotseat',host:'owner',members:{owner:[p.id]},players:[p],status:'lobby',round:1,turn:0,maxRounds:8,log:[],seen:[],event:0,rulesVersion:2,lifeVersion:1,worldVersion:1,storyVersion:1,economyVersion:1,castVersion:1,historyVersion:1,balanceVersion:1,turnsTaken:0,...(opt?{motivesVersion:1}:{})};
 initializeEconomyPlayer(p,g);initializeLife(g,seed);initializeWorldPlayer(p);initializeSharedWorld(g);initializeStory(g);initializeCast(g);initializeMotivesPlayer(g,p);g.status='playing';initializeStory(g);
 return{g,p};
}
function locate(g,p,id){
 for(const region of Object.keys(regionDefinitions))p.world.discoveredPlacesByRegion[region]=[...worldPlaceIds];
 const region=Object.values(regionDefinitions).find(r=>r.residents.some(c=>c.id===id));
 if(region){p.world.region=region.id;p.world.localBonds[id]=Math.max(1,p.world.localBonds[id]??0);p.world.story.localTalks[id]??=1;p.place=worldView(p,g).choices.find(c=>c.actorId===id&&c.kind==='conversation').spot;return;}
 if(['mina','eli','jo'].includes(id)){p.world.region='alder';p.life.relationships[id].history=['A real earlier conversation.'];p.place=getStoryView(g,p).scenes[0].spot;return;}
 if(id==='neri'){p.world.region='alder';p.world.story.neri.stage='introduced';p.world.story.neri.lastSceneWeek=1;p.world.companionStatus='companion';p.place=worldView(p,g).choices.find(c=>c.actorId==='neri').spot;return;}
 const regionId=({sami:'saffron',miro:'glasssteppe',sefu:'pelagia',kit:'embermesa'})[id]??'alder';p.world.region=regionId;
 p.cast.bonds[id]??={phase:'met',approach:'listen',lastWeek:1,conflict:false,repaired:false,memories:[]};
 g.cast.schedule[g.round]=[{id,region:regionId,spot:'COMMUNITY',kind:'local'}];p.place='COMMUNITY';
}
function bond(p,id,extra={}){p.motives.bonds[id]={trust:4,earnedWeeks:[],contributions:2,strained:false,...extra};}
function choice(g,p,id,key){const found=motiveScene(g,p,id)?.choices.find(c=>c.key===key);assert.ok(found,`${id} ${key} missing`);return found;}
function act(g,p,id,key){const c=choice(g,p,id,key);assert.ok(c.available,c.reason);move(g,c.id);return c;}

test('26 distinct authored motives cover the full canon, with varied goal commitment',()=>{
 assert.deepEqual(characterMotiveProfiles.map(c=>c.id).sort(),characterHistories.map(c=>c.id).sort());
 assert.equal(new Set(characterMotiveProfiles.map(c=>c.goal)).size,26);
 assert.deepEqual(new Set(characterMotiveProfiles.map(c=>c.commitment)),new Set(['steady','bounded','tentative']));
 for(const c of characterMotiveProfiles)for(const field of ['priority','obligation','task','followThrough','support','smallerSupport','boundary','repair'])assert.ok(c[field].length>30,`${c.id} ${field}`);
});

test('every character has real help, support, refusal and repair consequences, with exact resource previews',()=>{
 for(const c of characterMotiveProfiles){
  const {g,p}=room();g.round=2;locate(g,p,c.id);
  const existing=JSON.stringify([p.cast,p.world,p.story,g.cast.schedule]);
  const first=choice(g,p,c.id,'ask');assert.equal(first.response,'smaller-offer',c.id);
  assert.equal(first.energy,3);assert.equal(first.joy,2);
  const before={hours:p.hours,energy:p.energy,joy:p.joy},help=act(g,p,c.id,'help');
  assert.equal(p.hours,before.hours-help.cost.time);assert.equal(p.energy,before.energy+help.energy);assert.equal(p.joy,before.joy+help.joy);
  assert.equal(p.motives.bonds[c.id].contributions,1);assert.match(help.outcome,new RegExp(c.name));
  assert.equal(JSON.stringify([p.cast,p.world,p.story,g.cast.schedule]),existing,'Exchanges do not complete native stories or reroll schedules');
  assert.equal(motiveScene(g,p,c.id).choices.length,0);const saved=JSON.stringify(g);move(g,help.id);assert.equal(JSON.stringify(g),saved);

  const full=room();full.g.round=2;locate(full.g,full.p,c.id);bond(full.p,c.id);
  const support=act(full.g,full.p,c.id,'ask');assert.equal(support.response,'support',c.id);assert.equal(support.energy,8);assert.equal(support.joy,5);

  const pressured=room();pressured.g.round=2;locate(pressured.g,pressured.p,c.id);bond(pressured.p,c.id);
  act(pressured.g,pressured.p,c.id,'press');assert.equal(pressured.p.motives.bonds[c.id].trust,2);assert.equal(pressured.p.motives.bonds[c.id].strained,true);
  pressured.g.round=3;locate(pressured.g,pressured.p,c.id);
  const refusal=choice(pressured.g,pressured.p,c.id,'ask');assert.equal(refusal.response,'refusal');assert.deepEqual([refusal.cost.time,refusal.energy,refusal.joy],[0,0,0]);
  const repair=act(pressured.g,pressured.p,c.id,'repair');assert.equal(repair.response,'repair');assert.equal(pressured.p.motives.bonds[c.id].strained,false);assert.equal(pressured.p.motives.bonds[c.id].trust,3);
  assert.ok(pressured.p.motives.receipts.some(r=>r.response==='boundary'),'Repair preserves earlier pressure');
 }
});

test('tentative means a smaller reliable commitment, and repeated concrete work widens it',()=>{
 const {g,p}=room();g.round=2;locate(g,p,'oren');bond(p,'oren',{contributions:0});
 assert.equal(choice(g,p,'oren','ask').response,'smaller-offer');act(g,p,'oren','help');
 g.round=3;p.hours=6;locate(g,p,'oren');assert.equal(choice(g,p,'oren','ask').response,'smaller-offer');act(g,p,'oren','help');
 g.round=4;p.hours=6;locate(g,p,'oren');assert.equal(choice(g,p,'oren','ask').response,'support');
});

test('capacity respects the actual promise, original conflict, shared evening and distant posting',()=>{
 const {g,p}=room();g.round=2;locate(g,p,'bram');bond(p,'bram');
 p.cast.bonds.bram.promise={due:3,status:'open'};
 assert.equal(choice(g,p,'bram','ask').response,'smaller-offer');act(g,p,'bram','help');assert.equal(p.cast.bonds.bram.promise.status,'open');
 g.round=3;p.hours=6;locate(g,p,'bram');p.cast.bonds.bram.promise.status='missed';p.cast.bonds.bram.conflict=true;
 assert.equal(choice(g,p,'bram','ask').response,'refusal');
 for(const id of ['mina','eli','jo']){const q=room();q.g.round=5;locate(q.g,q.p,id);bond(q.p,id);assert.equal(choice(q.g,q.p,id,'ask').response,'smaller-offer');}
 const n=room();n.g.round=4;locate(n.g,n.p,'neri');n.p.world.story.neri.posting='accepted';bond(n.p,'neri');assert.equal(motiveScene(n.g,n.p,'neri').remote,true);assert.equal(choice(n.g,n.p,'neri','ask').response,'smaller-offer');
});

test('only actual native actions build trust; monthly evidence cannot be farmed or reordered for extra credit',()=>{
 const {g,p}=room();const c=castPeople(g,p)[0];p.place=c.spot;let before=JSON.stringify(g);
 motiveScene(g,p,c.id);castPeople(g,p);assert.equal(JSON.stringify(g),before);assert.equal(p.motives.bonds[c.id],undefined);
 const intro=castPeople(g,p).find(v=>v.id===c.id).choices.find(v=>v.key==='listen');move(g,intro.id);
 assert.equal(p.motives.bonds[c.id].trust,1);act(g,p,c.id,'help');assert.equal(p.motives.bonds[c.id].trust,1,'Two menus in one month are not two earned steps');
 recordMotiveEvidence(g,p);assert.equal(p.motives.bonds[c.id].trust,1);
 g.round=2;p.hours=6;locate(g,p,c.id);move(g,castPeople(g,p).find(v=>v.id===c.id).choices.find(v=>v.key==='promise').id);assert.equal(p.motives.bonds[c.id].trust,1,'A promise alone is not follow-through');
 g.round=3;p.hours=6;locate(g,p,c.id);move(g,castPeople(g,p).find(v=>v.id===c.id).choices.find(v=>v.key==='keep').id);assert.equal(p.motives.bonds[c.id].trust,2);
 // An earlier new receipt in another system cannot reset a latest-month scalar.
 p.world.journal.push({week:1,region:'alder',title:'Earlier note',text:'An already represented month.',choiceId:'old-evidence',effects:{localBonds:{[c.id]:1}}});
 recordMotiveEvidence(g,p);assert.equal(p.motives.bonds[c.id].trust,2);
 p.world.journal.push({week:3,region:'alder',title:'Another note',text:'Same earned month.',choiceId:'same-month-evidence',effects:{localBonds:{[c.id]:1}}});recordMotiveEvidence(g,p);assert.equal(p.motives.bonds[c.id].trust,2);
 before=JSON.stringify(g);recordMotiveEvidence(g,p);assert.equal(JSON.stringify(g),before);
});

test('missed cast promises erode trust, ordinary absences do not, and native repairs count',()=>{
 const {g,p}=room();g.round=2;locate(g,p,'bram');bond(p,'bram',{trust:2});p.cast.bonds.bram.promise={due:2,status:'open'};
 move(g,'end');assert.equal(p.motives.bonds.bram.trust,0);assert.equal(p.motives.bonds.bram.strained,true);
 p.hours=6;locate(g,p,'bram');const repair=castPeople(g,p).find(c=>c.id==='bram').choices.find(c=>c.key==='repair');move(g,repair.id);
 assert.equal(p.motives.bonds.bram.strained,false);assert.equal(p.motives.bonds.bram.trust,1);
 const saved=p.motives.bonds.bram.trust;move(g,'end');assert.equal(p.motives.bonds.bram.trust,saved,'No decay for not returning');
});

test('unmet people, absent locals, declined Neri, wrong places, redacted seats and stale choices cannot grant exchanges',()=>{
 const {g,p}=room();for(const c of characterMotiveProfiles)assert.equal(motiveScene(g,p,c.id),null,c.id);
 g.round=2;locate(g,p,'alder_tess');const c=choice(g,p,'alder_tess','help');
 p.place='APARTMENTS';const before=JSON.stringify(g);assert.throws(()=>move(g,c.id));assert.equal(JSON.stringify(g),before);
 p.world.region='pelagia';assert.equal(motiveScene(g,p,'alder_tess'),null);
 locate(g,p,'neri');p.world.story.neri.stage='declined';assert.equal(motiveScene(g,p,'neri'),null);
 locate(g,p,'bram');const stale=choice(g,p,'bram','help');p.energy--;const snapshot=JSON.stringify(g);assert.throws(()=>move(g,stale.id),/changed|available/);assert.equal(JSON.stringify(g),snapshot);
 assert.equal(motiveScene(g,{...p,castRedacted:true},'bram'),null);
 const fake={...p,id:'other'};assert.throws(()=>resolveMotiveChoice(g,fake,choice(g,p,'bram','help').id),/turn/);
 g.status='finished';assert.ok(motiveScene(g,p,'bram').choices.every(c=>!c.available));assert.throws(()=>resolveMotiveChoice(g,p,stale.id),/not running/);
});

test('known cast friends use existing correspondence, without claiming physical presence or a kept promise',()=>{
 const {g,p}=room();g.round=2;locate(g,p,'bram');g.cast.schedule[2]=[];p.world.region='pelagia';p.place='COMMUNITY';
 const scene=motiveScene(g,p,'bram');assert.equal(scene.remote,true);assert.equal(scene.spot,'COMMUNITY');
 const c=act(g,p,'bram','help');assert.match(c.outcome,/correspondence/);assert.equal(p.cast.bonds.bram.phase,'met');assert.equal(p.cast.bonds.bram.promise,undefined);
});

test('new introductions require both known people, each person’s actual meeting, and two separate explicit exchanges',()=>{
 for(const link of motiveIntroductions){
  const {g,p}=room();g.round=2;locate(g,p,link.ids[0]);assert.equal(motiveScene(g,p,link.ids[0]).choices.some(c=>c.key==='introduce'),false);
  locate(g,p,link.ids[1]);locate(g,p,link.ids[0]);act(g,p,link.ids[0],'introduce');
  assert.equal(p.motives.introductions[link.id].acceptedWeek,undefined);
  const pending=structuredClone(g);assert.equal(pending.players[0].motives.introductions[link.id].to,link.ids[1]);
  locate(g,p,link.ids[1]);const incoming=act(g,p,link.ids[1],'introduce');assert.match(incoming.outcome,/correspondence/);assert.equal(p.motives.introductions[link.id].acceptedWeek,2);
  g.round=3;p.hours=6;locate(g,p,link.ids[0]);assert.equal(motiveScene(g,p,link.ids[0]).choices.some(c=>c.key==='introduce'),false);
 }
});

test('authored cases span sadness, envy, love, anger, shame, pride, fear and relief through behavior',()=>{
 const found=new Set();
 for(const character of characterMotiveProfiles){
  const {g,p}=room();g.round=2;locate(g,p,character.id);bond(p,character.id);
  for(const c of motiveScene(g,p,character.id).choices){if(c.emotion){found.add(c.emotion);assert.ok(c.outcome.length>140);}}
  p.motives.bonds[character.id].strained=true;
  for(const c of motiveScene(g,p,character.id).choices)if(c.emotion)found.add(c.emotion);
 }
 assert.deepEqual(found,new Set(['sadness','envy','love','anger','shame','pride','fear','relief']));
});

test('private motive state and outcomes never leave another seat’s member or anonymous snapshot',()=>{
 const {g,p}=room();g.round=2;locate(g,p,'bram');act(g,p,'bram','press');
 g.mode='online';const guest=player('Other');guest.id='guest';g.players.push(guest);g.members.other=[guest.id];initializeMotivesPlayer(g,guest);
 const own=memberView({state:g,version:3},'owner'),other=memberView({state:g,version:3},'other'),anonymous=roomView({state:g,version:3},'stranger');
 assert.ok(own.players[0].motives);assert.equal(other.players[0].motives,undefined);assert.equal(other.players[0].castRedacted,true);assert.equal(anonymous.players[0].motives,undefined);
 for(const view of [other,anonymous]){assert.ok(!JSON.stringify(view).includes(p.motives.receipts[0].outcome));assert.ok(!JSON.stringify(view).includes('earnedWeeks'));}
 assert.equal(motiveScene(other,other.players[0],'bram'),null);assert.ok(p.motives,'Redaction does not mutate saved state');
 assert.equal(castMemberFields(g,[]).players[0].motives,undefined);
});

test('old saves remain byte-equivalent through reads, joins, rejected exchanges and campaign settlement',()=>{
 const {g,p}=room(false);const before=JSON.stringify(g);initializeMotivesPlayer(g,p);recordMotiveEvidence(g,p);for(const c of characterMotiveProfiles)assert.equal(motiveScene(g,p,c.id),null);assert.equal(JSON.stringify(g),before);
 assert.throws(()=>resolveMotiveChoice(g,p,'motive:1:bram:fake:help'),/not part/);assert.equal(JSON.stringify(g),before);
 const joined=player('Joined');initializeMotivesPlayer(g,joined);assert.equal(joined.motives,undefined);
 for(let i=0;i<8;i++)move(g,'end');assert.equal(g.status,'finished');assert.equal(p.motives,undefined);assert.equal(g.motivesVersion,undefined);
});

test('client/server and serialized new-save continuations remain deterministic, including schedules',()=>{
 for(const seed of [0,1,15,42,4294967295]){
  const {g,p}=room(true,seed);g.round=2;locate(g,p,'bram');const schedule=JSON.stringify(g.cast.schedule),copy=JSON.parse(JSON.stringify(g));
  const id=choice(g,p,'bram','help').id;move(g,id);serverMove(copy,id);assert.deepEqual(copy,g);
  assert.equal(JSON.stringify(g.cast.schedule),schedule);
  const resumed=JSON.parse(JSON.stringify(g));move(g,'end');serverMove(resumed,'end');assert.deepEqual(resumed,g);assert.equal(JSON.stringify(g.cast.schedule),schedule);
  const snapshot=JSON.stringify(g);for(let n=0;n<8;n++){motiveScene(g,g.players[0],'bram');castPeople(g,g.players[0]);}assert.equal(JSON.stringify(g),snapshot);
 }
});


test('81 frozen-baseline states retain mechanics and receipts apart from reviewed labels, prose and prospective familiarity',async()=>{
 const fixtures=JSON.parse(readFileSync(new URL('./support/motive-legacy-hashes.json',import.meta.url),'utf8'));
 assert.equal(fixtures.sourceCommit,'4216605a69c95ce18048e6fc1fc7d105fc174a60');
 for(const {seed,edition,sha256}of fixtures.campaigns){
  const states=await motiveLegacyCampaign(new URL('../lib/',import.meta.url),seed,edition);
  assert.deepEqual(states.map(s=>{const state=JSON.parse(s);for(const p of state.players)delete p.familiarity;return createHash('sha256').update(historicalVenueLabels(historicalDescriptiveCopy(JSON.stringify(state)))).digest('hex');}),sha256,`${edition} seed ${seed}`);
 }
});

test('public ages and reciprocal families preserve canon and span adult generations',()=>{
 assert.deepEqual(Object.keys(characterAges).sort(),characterHistories.map(c=>c.id).sort());
 assert.equal(Math.min(...Object.values(characterAges)),24);assert.equal(Math.max(...Object.values(characterAges)),72);
 assert.deepEqual(Object.fromEntries(['bram','oren','hugo','priya','sami','miro','sefu','kit','neri'].map(id=>[id,characterAges[id]])),{bram:43,oren:57,hugo:36,priya:68,sami:31,miro:62,sefu:49,kit:28,neri:29});
 for(const family of characterFamilies)for(const id of family.ids){const a=publicCharacterIdentity(id).family.find(f=>family.ids.includes(f.otherId));const b=publicCharacterIdentity(a.otherId).family.find(f=>f.otherId===id);assert.equal(a.relationship,b.otherRelationship);assert.equal(a.fact,b.fact);}
 const {g,p}=room();g.round=2;locate(g,p,'jo');const family=act(g,p,'jo','family');assert.equal(family.emotion,'love');assert.match(family.outcome,/adult|Kit/);assert.match(family.outcome,/no acceptance, delivery/);assert.equal(p.motives.bonds.jo.trust,1);
});

test('only an actual supported Mina outcome selects its exact art; other feelings and people remain neutral',()=>{
 for(const emotion of ['sadness','envy','love','anger']){const art=motivePortrait({actorId:'mina',emotion});assert.match(art.src,new RegExp(`mina-${emotion}\\.webp$`));assert.ok(readFileSync(new URL('../public'+art.src,import.meta.url)).length>1000);}
 for(const emotion of ['fear','shame','pride','relief'])assert.equal(motivePortrait({actorId:'mina',emotion}),null);
 assert.equal(motivePortrait({actorId:'jo',emotion:'anger'}),null);assert.equal(motivePortrait(),null);
});


test('early motive feelings do not bypass deeper private-history gates',()=>{
 for(const [id,key,privateWords]of [['hugo','help',/bowl away from his learner/],['miro','repair',/grand backdrop/],['oren','ask',/short recordings he and Miro/]]){
  const {g,p}=room();g.round=2;locate(g,p,id);bond(p,id,{strained:key==='repair'});
  const early=choice(g,p,id,key);assert.doesNotMatch(early.outcome,privateWords);
  p.cast.bonds[id].phase='shared';const later=choice(g,p,id,key);assert.match(later.outcome,privateWords);
 }
});


test('remote cast exchanges use correspondence rather than invented shared physical activity',()=>{
 for(const id of ['bram','oren','hugo','priya','sami','miro','sefu','kit']){
  const {g,p}=room();g.round=2;locate(g,p,id);bond(p,id);g.cast.schedule[2]=[];p.world.region='alder';p.place='COMMUNITY';
  const scene=motiveScene(g,p,id);assert.equal(scene.remote,true);
  const support=scene.choices.find(c=>c.key==='ask');assert.match(support.outcome,/correspondence|messages/);
  const help=scene.choices.find(c=>c.key==='help');assert.match(help.outcome,/rather than meeting in person/);assert.doesNotMatch(help.outcome,/your pencil|your bowl/);
 }
});


test('remote Neri uses the established transit call rather than cast correspondence',()=>{
 const {g,p}=room();g.round=4;locate(g,p,'neri');p.world.story.neri.posting='accepted';p.world.story.neri.stage='planned';p.place='TRANSIT';bond(p,'neri');
 for(const c of motiveScene(g,p,'neri').choices){assert.match(c.outcome,/agreed call from the transit map desk/);assert.doesNotMatch(c.outcome,/community correspondence/);}
 p.motives.bonds.neri.strained=true;const repair=choice(g,p,'neri','repair');assert.match(repair.outcome,/agreed call from the transit map desk/);assert.doesNotMatch(repair.outcome,/community correspondence/);
});
