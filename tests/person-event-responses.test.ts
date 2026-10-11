import test from 'node:test';import assert from 'node:assert/strict';
import {createGame} from '../supabase/functions/crosswalk-game/game-service.ts';
import {beginLifeWeek,getLifeEvent,lifeChoices,lifeEventIds,resolveLifeChoice} from '../lib/life-events.ts';
import {lifeEventPersonResponse} from '../lib/person-event-responses.ts';
function fixture(eventId){const g=createGame({mode:'hotseat',names:['Reader'],ownerSession:'owner',requestId:'event-person'},'EVENTR'),p=g.players[0];g.round=2;g.lifeSchedule=[{week:2,eventId}];p.cash=99999;p.hours=6;p.energy=100;p.craft=6;p.skill=6;p.social=12;p.housing=1;for(const r of Object.values(p.life.relationships)){r.trust=2;r.support=true;r.reciprocity=true;}beginLifeWeek(g);return{g,p};}
test('person replies map explicit event choices, never incidental resource effects or inferred names',()=>{
 let shown=0,quiet=0;
 for(const eventId of lifeEventIds){const sample=fixture(eventId);for(const option of lifeChoices(sample.p,sample.g)){
  const {g,p}=fixture(eventId),choice=lifeChoices(p,g).find(c=>c.id===option.id);if(!choice?.available)continue;
  const pending=getLifeEvent(p,g);assert.equal(lifeEventPersonResponse(pending),null);
  const receipt=resolveLifeChoice(g,p,choice.id),before=JSON.stringify(receipt),response=lifeEventPersonResponse(receipt);assert.equal(JSON.stringify(receipt),before);
  if(response){shown++;assert.ok(['mina','eli','jo'].includes(response.speakerId));assert.ok(response.speech.length<230);assert.ok(response.activity);assert.deepEqual(lifeEventPersonResponse(JSON.parse(JSON.stringify(receipt))),response);assert.equal(lifeEventPersonResponse({...receipt,resolved:{...receipt.resolved,deferred:true}}),null);}
  else quiet++;
 }}
 assert.ok(shown>=25);assert.ok(quiet>=10,'ordinary bills, personal career and home decisions do not acquire an invented NPC');
});
test('dynamic support reads the stored selected counterpart; solo sale keeps Jo’s hurt credible',()=>{
 const {g,p}=fixture('crossroads');p.life.relationships.mina.support=false;p.life.relationships.mina.trust=0;p.life.relationships.mina.reciprocity=false;
 const choice=lifeChoices(p,g).find(c=>c.id.endsWith(':accept_support'));const before=structuredClone(p),receipt=resolveLifeChoice(g,p,choice.id);assert.equal(lifeEventPersonResponse(receipt,before).speakerId,'eli');
 const sale=fixture('commission_dispute'),option=lifeChoices(sale.p,sale.g).find(c=>c.id.endsWith(':solo_sale')),result=lifeEventPersonResponse(resolveLifeChoice(sale.g,sale.p,option.id));assert.equal(result.speakerId,'jo');assert.equal(result.emotion,'hurt');assert.equal(result.gesture,'withdraw');assert.match(result.speech,/hurt/);
});
