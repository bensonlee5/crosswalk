import test from 'node:test';
import assert from 'node:assert/strict';
import {currentGame} from './current-fixture.mjs';
import {move} from '../lib/game.ts';
import {getStoryView} from '../lib/story-arcs.ts';
import {careerNoticesForAction} from '../lib/careers.ts';
import {capturePersonReceipt,personReply,personCareerNotices,type ResponseReceipt} from '../lib/person-response.ts';
function fixture(){const g=currentGame({names:['Worker']}),p=g.players[0],scene=getStoryView(g,p).scenes[0];p.place=scene.spot;const choice=scene.choices.find(c=>c.id.startsWith('show_up~'))!;assert.ok(choice);const actionId=`story:${scene.id}:${choice.id}`;move(g,actionId);const source=p.story!.receipts.find(r=>r.sceneId===scene.id)!;return{g,p,actionId,source};}
test('actual confirmed story receipt captures only this speaker’s earned work lead with its authored destination',()=>{
 const {g,p,actionId,source}=fixture(),before=JSON.stringify(g),notice=careerNoticesForAction(g,p,actionId).find(n=>n.actorId==='jo');assert.ok(notice);const receipt=capturePersonReceipt(source,p,'jo'),input={g,p,actorId:'jo',receipt};assert.equal(receipt.careerNotices?.length,1);assert.equal(receipt.careerNotices[0].speech,notice.speech);assert.equal(receipt.careerNotices[0].employer,notice.employer);assert.equal(personReply(input).continuation,notice.speech);assert.equal(JSON.stringify(g),before);assert.equal(capturePersonReceipt(source,p,'mina').careerNotices,undefined);
 // A later poll cannot rewrite the reply that was actually confirmed.
 p.career!.notices!.find(n=>n.id===notice.id)!.speech='Changed by a later poll';assert.equal(personReply(input).continuation,notice.speech);
});
test('same-action lead and reference are combined once without repeating the original reply',()=>{
 const {g,p,actionId,source}=fixture(),notice=careerNoticesForAction(g,p,actionId).find(n=>n.actorId==='jo')!;p.career!.notices!.push({...notice,id:notice.id+':reference',kind:'reference',speech:'I can describe the handover we finished together.'});const receipt=capturePersonReceipt(source,p,'jo'),reply=personReply({g,p,actorId:'jo',receipt});assert.equal(receipt.careerNotices?.length,2);assert.ok(reply.continuation?.includes(notice.speech));assert.ok(reply.continuation?.includes('describe the handover'));assert.notEqual(reply.speech,reply.continuation);assert.equal(reply.continuation?.split(notice.speech).length,2);
});
test('wrong actor, stale action or month, other owner, private, pending, error and strained states cannot surface a captured lead',()=>{
 const {g,p,source}=fixture(),receipt=capturePersonReceipt(source,p,'jo'),base={g,p,actorId:'jo',receipt};assert.ok(personCareerNotices(base).length);
 for(const input of [{...base,actorId:'eli'},{...base,receipt:{...receipt,actionId:'another-action'}},{...base,g:{...g,round:g.round+1}},{...base,p:{...p,id:'another-owner'}},{...base,p:{...p,castRedacted:true}},{...base,pending:true},{...base,error:'Not confirmed'},{...base,p:{...p,motives:{...p.motives!,bonds:{...p.motives!.bonds,jo:{...p.motives!.bonds.jo,strained:true}}}}}])assert.equal(personCareerNotices(input).length,0);
 assert.equal(capturePersonReceipt({...source,week:g.round+1},p,'jo').careerNotices,undefined);
 assert.equal(capturePersonReceipt({...source,actionId:'stale'},p,'jo').careerNotices,undefined);
 for(const response of ['refusal','boundary']){const refused=capturePersonReceipt({...source,response},p,'jo');assert.equal(refused.careerNotices,undefined);assert.equal(personCareerNotices({...base,receipt:{...receipt,response}}).length,0);}
});
test('no notice leaves the ordinary authored and familiarity continuation unchanged',()=>{
 const {g,p}=fixture();const source:ResponseReceipt={title:'A normal reply',body:'A smaller exchange.',week:g.round,actionId:'repair:jo',response:{speakerId:'jo',speech:'One edge is enough.',activity:'Sets down the ruler.',emotion:'warm',gesture:'offer'}};const receipt=capturePersonReceipt(source,p,'jo');assert.equal(receipt.careerNotices,undefined);const withPlans=personReply({g,p,actorId:'jo',receipt}),withoutNotices=personReply({g,p:{...p,career:{...p.career!,notices:[]}},actorId:'jo',receipt});assert.deepEqual(withPlans,withoutNotices);
});
