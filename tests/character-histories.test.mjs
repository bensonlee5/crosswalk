import test from 'node:test';
import assert from 'node:assert/strict';
import {move} from '../lib/game.ts';
import {canonicalCharacterById} from '../lib/character-canon.ts';
const neighbors=['mina','eli','jo'].map(id=>canonicalCharacterById[id]);
import {regionDefinitions,worldChoices} from '../lib/world-life.ts';
import {castCharacters} from '../lib/cast-characters.ts';
import {castPeople,castMemberFields,castEnding} from '../lib/character-cast.ts';
import {characterHistories,characterConnections,characterHistoryView,historyFamiliarity} from '../lib/character-histories.ts';
import {historyScenes,availableHistoryScene} from '../lib/character-history-scenes.ts';
import {currentGame} from './current-fixture.mjs';
import {careerChoices} from '../lib/careers.ts';
function fixture(){return currentGame({names:['History reader'],seed:0});}
function close(g,id){g.players[0].cast.bonds[id]={phase:'close',approach:'listen',lastWeek:5,conflict:false,repaired:false,memories:[{week:5,text:'An actual earlier shared moment.'}]};}
function act(g,id,key){const p=g.players[0],npc=castPeople(g,p).find(c=>c.id===id);assert.ok(npc,id);move(g,'visit',npc.spot);const choice=castPeople(g,p).find(c=>c.id===id).choices.find(c=>c.key===key);assert.ok(choice?.available,key);move(g,choice.id);return choice;}
function advance(g){const p=g.players[0];move(g,'visit','WORK');const use=(verb,target)=>{const c=careerChoices(g,p).find(c=>c.verb===verb&&(!target||c.target===target));assert.ok(c?.available,c?.reason);move(g,c.id);};if(!p.career.contracts.some(c=>c.active&&c.kind==='main')){use('apply','t.technical.assistant');use('accept');}const shift=careerChoices(g,p).find(c=>c.verb==='work'&&c.target.endsWith('.regular'));if(shift?.available)move(g,shift.id);move(g,'end');}

test('all 26 retained identities have distinct layered histories and reciprocal concrete connections',()=>{
 const ids=[...neighbors.map(c=>c.id),'neri',...Object.values(regionDefinitions).flatMap(r=>r.residents.map(c=>c.id)),...castCharacters.map(c=>c.id)];
 assert.equal(ids.length,26);assert.deepEqual(characterHistories.map(c=>c.id).sort(),ids.sort());assert.equal(new Set(characterHistories.map(c=>c.before)).size,26);
 for(const c of characterHistories){assert.ok(c.before.length>120);assert.ok(c.closer.length>120);assert.notEqual(c.before,c.closer);}
 const pairs=new Set(),degree=new Map(ids.map(id=>[id,0]));
 for(const c of characterConnections){assert.notEqual(c.ids[0],c.ids[1]);for(const id of c.ids){assert.ok(degree.has(id));degree.set(id,degree.get(id)+1);}const key=[...c.ids].sort().join('|');assert.ok(!pairs.has(key));pairs.add(key);assert.ok(c.event.length>60);assert.ok(c.perspectives.every(s=>s.length>30));assert.notEqual(...c.perspectives);}
 assert.equal(characterConnections.length,28);assert.ok([...degree.values()].every(n=>n>0&&n<8));assert.ok(pairs.size<ids.length*(ids.length-1)/4,'A selective network rather than all-to-all acquaintances');
 for(const c of castCharacters)assert.ok(characterConnections.some(link=>link.ids.includes(c.id)&&link.ids.includes(c.tie.id)),`${c.id}: established tie preserved`);
});

test('disclosures are pure, perspective-specific and require actual personal familiarity',()=>{
 const g=fixture(),p=g.players[0];const before=JSON.stringify(g);const initial=characterHistoryView(g,p,'oren');assert.equal(initial.closer,null);assert.ok(!initial.connections.some(c=>c.otherId==='miro'));assert.equal(JSON.stringify(g),before);
 close(g,'oren');const oneSide=characterHistoryView(g,p,'oren');assert.ok(oneSide.closer);const edge=oneSide.connections.find(c=>c.otherId==='miro');assert.ok(edge);assert.equal(edge.otherPerspective,null);
 close(g,'miro');const reverse=characterHistoryView(g,p,'miro').connections.find(c=>c.otherId==='oren');const both=characterHistoryView(g,p,'oren').connections.find(c=>c.otherId==='miro');assert.equal(reverse.event,both.event);assert.equal(reverse.perspective,both.otherPerspective);assert.equal(reverse.otherPerspective,both.perspective);
 const saved=JSON.stringify(g);characterHistories.forEach(c=>characterHistoryView(g,p,c.id));assert.equal(JSON.stringify(g),saved);
 assert.equal(characterHistoryView(g,p,'unknown'),null);
});


test('later events need a developed friendship, a known other person and a later month',()=>{
 for(const scene of historyScenes){const g=fixture(),p=g.players[0];g.round=6;assert.equal(availableHistoryScene(g,p,scene.person),null);close(g,scene.person);assert.equal(availableHistoryScene(g,p,scene.person),null);if(['mina','eli','jo'].includes(scene.other))p.life.relationships[scene.other].history.push('A conversation we actually had.');else {p.world.localBonds[scene.other]=1;p.world.story.localTalks[scene.other]=1;}assert.equal(availableHistoryScene(g,p,scene.person)?.id,scene.id);
  p.cast.bonds[scene.person].lastWeek=6;assert.equal(availableHistoryScene(g,p,scene.person),null);p.cast.bonds[scene.person].lastWeek=4;g.round=5;assert.equal(availableHistoryScene(g,p,scene.person),null);g.round=6;p.cast.bonds[scene.person].conflict=true;assert.equal(availableHistoryScene(g,p,scene.person),null);
 }
});

test('all four later conversations have real persisted consequences without inventing consent or broadcasting private news',()=>{
 for(const scene of historyScenes)for(const key of ['history_share','history_boundary'])for(const remote of [false,true]){
  const g=fixture(),p=g.players[0];g.round=6;close(g,scene.person);if(scene.other==='jo')p.life.relationships.jo.history.push('PRIVATE JO MEMORY');else {p.world.localBonds[scene.other]=1;p.world.story.localTalks[scene.other]=1;}
  const c=castCharacters.find(c=>c.id===scene.person);p.world.region=c.region;g.cast.schedule[6]=remote?[]:[{id:c.id,region:c.region,spot:'COMMUNITY',kind:'local'}];
  p.hours=key==='history_boundary'?0:1;const old={cash:p.cash,energy:p.energy,joy:p.joy,world:structuredClone(p.world),life:structuredClone(p.life)};
  const choice=act(g,c.id,key);assert.equal(choice.cost.time,key==='history_share'?1:0);assert.equal(p.hours,0);assert.equal(p.cash,old.cash);assert.equal(p.energy,old.energy);assert.equal(p.joy,old.joy);assert.deepEqual(p.world,old.world);assert.deepEqual(p.life,old.life);
  assert.equal(p.cast.bonds[c.id].historyScene.id,scene.id);assert.ok(castEnding(g,p).some(t=>t.includes(choice.outcome)));assert.ok(!choice.outcome.includes('PRIVATE JO MEMORY'));
  const saved=JSON.stringify(g);move(g,choice.id);assert.equal(JSON.stringify(g),saved);assert.equal(availableHistoryScene(g,p,c.id),null);g.round=7;assert.equal(availableHistoryScene(g,p,c.id),null);assert.deepEqual(castPeople(g,p).find(v=>v.id===c.id).choices,[]);
  const other={...g,...castMemberFields(g,[])};assert.equal(other.players[0].cast,undefined);assert.equal(characterHistoryView(other,other.players[0],c.id),null);assert.ok(!JSON.stringify(other).includes(scene.shareOutcome));assert.ok(!JSON.stringify(other).includes(scene.boundaryOutcome));
 }
});

test('a forged later conversation is rejected atomically when its other acquaintance is unknown',()=>{
 const g=fixture(),p=g.players[0];g.round=6;close(g,'bram');p.place='COMMUNITY';const before=JSON.stringify(g);assert.throws(()=>move(g,'cast:6:bram:history_share'));assert.equal(JSON.stringify(g),before);
});

test('an eight-month legal-action life can revisit a completed friendship and keep the changed boundary in its ending',()=>{
 const g=fixture(),p=g.players[0];const tess=worldChoices(p,g).find(c=>c.actorId==='alder_tess'&&c.key==='talk:alder_tess');assert.ok(tess);move(g,'visit',tess.spot);const ready=worldChoices(p,g).find(c=>c.key===tess.key);assert.ok(ready.available);move(g,'world:'+ready.id);assert.ok(historyFamiliarity(p,'alder_tess')>=1);
 act(g,'bram','listen');advance(g);act(g,'bram','promise');advance(g);act(g,'bram','keep');advance(g);act(g,'bram','honest');advance(g);act(g,'bram','accept');advance(g);
 assert.equal(g.round,6);assert.equal(availableHistoryScene(g,p,'bram')?.id,'bram-closing-light');const choice=act(g,'bram','history_share');advance(g);advance(g);advance(g);
 assert.equal(g.status,'finished');assert.equal(g.round,8);assert.equal(p.cast.bonds.bram.promise.status,'kept');assert.ok(castEnding(g,p).join(' ').includes(choice.outcome));assert.ok(!castPeople(g,p).some(v=>v.choices.some(c=>c.available)));assert.ok(p.cash>0);
});
