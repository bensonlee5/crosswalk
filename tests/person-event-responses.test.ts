import test from 'node:test';
import assert from 'node:assert/strict';
import {currentGame} from './current-fixture.mjs';
import {beginLifeWeek,getLifeEvent,lifeChoices,lifeEventIds,resolveLifeChoice} from '../lib/life-events.ts';
import {lifeEventPersonActor,lifeEventPersonResponse} from '../lib/person-event-responses.ts';
function fixture(eventId){
 const g=currentGame({names:['Reader']}),p=g.players[0];
 g.round=2;g.lifeSchedule=[{week:2,eventId}];p.cash=99999;p.hours=6;p.energy=100;p.craft=6;p.skill=6;p.social=12;p.housing=1;
 for(const r of Object.values(p.life.relationships)){r.trust=2;r.support=true;r.reciprocity=true;}
 beginLifeWeek(g);return{g,p};
}
test('all current event choices speak only through their explicitly authored counterpart',()=>{
 const spoken=[];let quiet=0;
 for(const eventId of lifeEventIds){const sample=fixture(eventId);for(const option of lifeChoices(sample.p,sample.g)){
  const{g,p}=fixture(eventId),choice=lifeChoices(p,g).find(c=>c.id===option.id);if(!choice?.available)continue;
  assert.equal(lifeEventPersonResponse(getLifeEvent(p,g)),null);
  const receipt=resolveLifeChoice(g,p,choice.id),before=JSON.stringify(receipt),response=lifeEventPersonResponse(receipt);
  assert.equal(JSON.stringify(receipt),before);
  assert.equal(lifeEventPersonActor('event:'+choice.id),response?.speakerId??null);
  if(response){
   spoken.push(eventId+':'+choice.id.split(':').at(-1));
   assert.ok(['mina','eli','jo'].includes(response.speakerId));assert.ok(response.speech.length<230);assert.ok(response.activity);
   assert.deepEqual(lifeEventPersonResponse(JSON.parse(JSON.stringify(receipt))),response);
   assert.equal(lifeEventPersonResponse({...receipt,resolved:{...receipt.resolved,deferred:true}}),null);
   assert.equal(lifeEventPersonResponse({...receipt,resolved:{...receipt.resolved,choiceId:'9:other:invented'}}),null);
   response.speech='changed outside the receipt';assert.notEqual(lifeEventPersonResponse(receipt).speech,response.speech);
  }else quiet++;
 }}
 assert.deepEqual(spoken.sort(),['repair_bill:jo_toolkit','unexpected_patron:back_calling','unexpected_patron:repay_eli','unexpected_patron:seed_evening','work_reset:jo_referral']);
 assert.ok(quiet>=9,'ordinary bills and solo decisions do not acquire an invented speaker');
});
test('resource deltas and names in receipt prose never invent a reply',()=>{
 const{g,p}=fixture('vacancy'),choice=lifeChoices(p,g).find(c=>c.id.endsWith(':one_day_studio'));
 const receipt=resolveLifeChoice(g,p,choice.id);assert.ok(receipt.resolved.effects.trust.jo);
 receipt.resolved.outcome='Jo and Mina remember Eli.';
 assert.equal(lifeEventPersonResponse(receipt),null);
 for(const id of ['event:2:vacancy:one_day_studio','event:2:work_reset:invented','repair:jo','event:broken'])assert.equal(lifeEventPersonActor(id),null);
});
