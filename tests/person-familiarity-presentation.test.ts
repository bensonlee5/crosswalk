import test from 'node:test';import assert from 'node:assert/strict';
import {createGame} from '../supabase/functions/crosswalk-game/game-service.ts';
import {personReply,capturePersonReceipt,personFamiliarityLine} from '../lib/person-response.ts';
import {personSceneProfiles} from '../lib/person-scene-profiles.ts';
import {familiarityView} from '../lib/action-familiarity.ts';
function fixture(){const g=createGame({mode:'hotseat',names:['Reader'],ownerSession:'owner',requestId:'familiar-presentation'},'FAMILI');return{g,p:g.players[0]};}
function history(p,actorId,count){p.familiarity={version:1,startedRound:1,actions:{},people:{[actorId]:{count,lastRound:1,lastVariant:(count-1)%12}}};}
test('all presented people change confirmed responses through familiar, routine and custom stages without immediate repeats',()=>{
 for(const actorId of Object.keys(personSceneProfiles)){
  const {g,p}=fixture();let prior='';
  for(let count=1;count<=40;count++){
   history(p,actorId,count);const receipt=capturePersonReceipt({actionId:`cast:1:${actorId}:listen`,title:'A real saved exchange',body:'A small conversation was recorded.'},p,actorId);
   const before=JSON.stringify(p),reply=personReply({g,p,actorId,receipt}),text=reply.speech+'|'+(reply.continuation??'');
   assert.notEqual(text,prior,`${actorId} count ${count} should differ from its preceding confirmed exchange`);prior=text;
   assert.equal(JSON.stringify(p),before);assert.ok(!reply.continuation||reply.continuation.split(/\s+/).length<=18);
   assert.doesNotMatch(text,/trust\s*[:+]|reward points|you have earned my friendship|we are best friends/i);
   const reloaded=JSON.parse(JSON.stringify({g,p,receipt}));assert.deepEqual(personReply({...reloaded,actorId}),reply);
  }
 }
});
test('a frozen receipt does not change its reply after later polls or unrelated encounters',()=>{
 const {g,p}=fixture();history(p,'bram',4);const receipt=capturePersonReceipt({actionId:'cast:1:bram:help',title:'Recorded',body:'A checked route.'},p,'bram');
 const first=personReply({g,p,actorId:'bram',receipt});history(p,'bram',14);assert.deepEqual(personReply({g,p,actorId:'bram',receipt}),first);
});
test('familiarity never weakens a refusal and unavailable or untracked history cannot manufacture friendship',()=>{
 const {g,p}=fixture();assert.equal(personFamiliarityLine('mina',familiarityView(p,{actorId:'mina'})),'');
 for(const actorId of ['mina','jo','oren','bram'])for(let count=2;count<=20;count++){
  history(p,actorId,count);const response={speakerId:actorId,speech:'No. That is more than I agreed to.',activity:'Sets the plan aside.',emotion:'firm' as const,gesture:'withdraw' as const};
  const receipt=capturePersonReceipt({actionId:`motive:1:${actorId}:revision:press`,title:'The limit stands',body:'No added work.',response},p,actorId);
  const reply=personReply({g,p,actorId,receipt});assert.equal(reply.speech,response.speech);assert.equal(reply.emotion,'firm');assert.equal(reply.gesture,'withdraw');assert.match(reply.continuation??'',/limit|not changed|not mean available|say no/);
  assert.equal(personReply({g,p,actorId,available:false}).gesture,'pause');
 }
 const old={...p};delete old.familiarity;assert.equal(familiarityView(old,{actorId:'mina'}).tracked,false);
 assert.equal(personReply({g,p:{...p,castRedacted:true},actorId:'mina',receipt:{title:'Private',body:'Hidden'}}).speech,'');
});

test('saturated counts still vary using the persisted lastVariant',()=>{
 const {p}=fixture();history(p,'bram',Number.MAX_SAFE_INTEGER);
 p.familiarity.people.bram.lastVariant=0;const a=personFamiliarityLine('bram',familiarityView(p,{actorId:'bram'}));
 p.familiarity.people.bram.lastVariant=1;const b=personFamiliarityLine('bram',familiarityView(p,{actorId:'bram'}));
 assert.notEqual(a,b);
});

test('pending and failed exchanges suppress a retained earlier receipt',()=>{
 const {g,p}=fixture();history(p,'mina',8);const receipt=capturePersonReceipt({actionId:'motive:1:mina:old:help',title:'Old confirmed reply',body:'Earlier work.',emotion:'envy'},p,'mina');
 for(const extra of [{pending:true},{error:'The newer action was not confirmed'}]){const reply=personReply({g,p,actorId:'mina',receipt,...extra});assert.equal(reply.speech,'');assert.equal(reply.continuation,undefined);assert.equal(reply.gesture,'pause');}
});
