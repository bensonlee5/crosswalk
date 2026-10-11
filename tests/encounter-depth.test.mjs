import test from 'node:test';
import assert from 'node:assert/strict';
import {currentGame} from './current-fixture.mjs';
import {move} from '../lib/game.ts';
import {getEnsembleView,afterEnsembleAction,ensembleMemberPlayers} from '../lib/ensemble-story.ts';
import {ensembleStories,ensembleById} from '../lib/ensemble-story-content.ts';
import {ensembleDialogue,ensembleReplySpeech,deepenEnsembleOption} from '../lib/ensemble-dialogue.ts';
import {personReply,capturePersonReceipt} from '../lib/person-response.ts';
import {canonicalCharacterById} from '../lib/character-canon.ts';
import {personSceneProfiles} from '../lib/person-scene-profiles.ts';
import {familiarityView} from '../lib/action-familiarity.ts';
const words=text=>text.trim().split(/\s+/).length;
function at(g,id,beat=0){const p=g.players[g.turn],s=ensembleById[id];p.world.region=s.region;p.place=s.place;p.cash=10000;p.hours=6;p.world.localeHistory[s.region].arrivals=1;afterEnsembleAction(g);Object.assign(g.ensemble.threads[id],{status:'active',beat,readyMonth:g.round,dueMonth:g.round+1,openedMonth:g.round});return p;}
function view(g,p,id){return getEnsembleView(g,p,id).scenes.find(s=>s.id===id);}

test('every one of 46 main moments leads with its own complete, canonical exchange',()=>{
 assert.equal(Object.keys(ensembleDialogue).length,46);
 for(const s of ensembleStories)for(const beat of s.beats){
  const d=ensembleDialogue[`${s.id}:${beat.id}`];assert.ok(d,`${s.id}:${beat.id}`);
  assert.equal(d.opening.speakerId,s.cast[0]);assert.ok(canonicalCharacterById[d.opening.speakerId]);
  assert.ok(words(d.body)>=50,`${s.id}:${beat.id} explains the stakes before a decision`);
  assert.ok(words(d.opening.speech)>=25,`${s.id}:${beat.id} has a complete spoken thought`);
  assert.doesNotMatch(d.body+d.opening.speech,/\b(?:MBTI|OCEAN|ESTJ|ESTP|permission-based|bounded interaction)\b/);
  if(d.clarification){assert.ok(d.clarification.question.endsWith('?'));assert.ok(words(d.clarification.answer)>15);}
 }
});

test('all 138 main alternatives deepen only foreground copy, preserving exact economics, gates, signals and public effect identities',()=>{
 const ids=[];
 for(const s of ensembleStories)for(const b of s.beats)for(const raw of b.choices){
  const id=`${s.id}:${b.id}:${raw.id}`;ids.push(id);
  const before=JSON.stringify(raw),rich=deepenEnsembleOption(s.id,b.id,raw);
  assert.equal(JSON.stringify(raw),before);assert.equal(rich.response.speech,ensembleReplySpeech[id]);
  assert.ok(words(rich.response.speech)>=25,id);
  assert.equal(rich.response.speakerId,raw.response.speakerId);
  const mechanics=option=>({...option,outcome:'',narration:{...option.narration,personal:''},response:{...option.response,speech:''}});
  assert.deepEqual(mechanics(rich),mechanics(raw),id);
 }
 assert.equal(ids.length,138);assert.deepEqual(Object.keys(ensembleReplySpeech).sort(),ids.sort());
});

test('reading, rereading, clarification and available-choice inspection consume no time or rewards',()=>{
 const g=currentGame(),p=at(g,'bracken'),before=JSON.stringify(g);
 for(let i=0;i<50;i++){
  const s=view(g,p,'bracken');assert.match(s.body,/Jonah.*receipt/);assert.match(s.clarification.question,/duvet/);
  assert.match(s.clarification.answer,/paid|rented/);assert.equal(s.opening.speakerId,'nell_harper');
  const choice=s.choices.find(c=>c.available);const preview=personReply({g,p,actorId:'nell_harper',preview:choice});
  assert.equal(preview.speech,personReply({g,p,actorId:'nell_harper'}).speech);
 }
 assert.equal(JSON.stringify(g),before);
 assert.equal(familiarityView(p,{actorId:'nell_harper'}).count,0);
});

test('Nell’s exact confirmed answer costs one quoted block, has no storage grant, and cannot be farmed or read from another seat',()=>{
 const g=currentGame({names:['Reader','Other']}),p=at(g,'bracken'),before={cash:p.cash,hours:p.hours},choice=view(g,p,'bracken').choices.find(c=>c.actionId.includes(':clarify:'));
 assert.equal(choice.cost.time,1);move(g,choice.actionId);const receipt=p.ensemble.receipts.at(-1);
 assert.equal(p.hours,before.hours-1);assert.equal(p.cash,before.cash);
 assert.equal(receipt.response.speech,ensembleReplySpeech['bracken:room:clarify']);
 assert.match(receipt.outcome,/You ask where Nell will sleep/);assert.doesNotMatch(receipt.outcome,/collection date|gives.*storage|grants|book.*room/);
 const captured=capturePersonReceipt({...receipt,actionTitle:choice.title},p,'nell_harper');assert.equal(captured.actionTitle,choice.title);
 const after=JSON.stringify(g);move(g,choice.actionId);assert.equal(JSON.stringify(g),after);assert.equal(familiarityView(p,{actorId:'nell_harper'}).count,1);
 const safe=ensembleMemberPlayers(g.players,[g.players[1].id]);assert.equal(safe[0].ensemble,undefined);assert.deepEqual(getEnsembleView({...g,players:safe},safe[0]).scenes,[]);
 assert.equal(personReply({g,p:{...p,castRedacted:true},actorId:'nell_harper',receipt:captured}).speech,'');
});

test('prevented Whaleskin stays an ordinary working road; later route replies do not become a fictitious rescue',()=>{
 const g=currentGame(),p=at(g,'whaleskin');move(g,'ensemble:whaleskin:main:inspect:0');
 let s=view(g,p,'whaleskin');assert.match(s.body,/without the interruption/);assert.doesNotMatch(s.body,/road is closed|silver.*emerges/);
 assert.equal(s.opening.speakerId,'lata_rao');assert.equal(s.clarification,undefined);
 move(g,'ensemble:whaleskin:main:accurate:1');s=view(g,p,'whaleskin');assert.match(s.body,/no rescue to photograph/);assert.ok(!s.choices.some(c=>c.actionId.includes(':hero:')));
 move(g,'ensemble:whaleskin:main:context:2');move(g,'ensemble:whaleskin:main:separate:3');
 assert.equal(p.ensemble.receipts.at(-1).response.speech,ensembleReplySpeech['whaleskin:next:separate']);
 assert.equal(g.ensemble.threads.whaleskin.flags.coverOwnedByTavi,true);
});

test('adult voice depth does not age up children or flatten fatigue into a work invitation',()=>{
 let adults=0;
 for(const [id,profile] of Object.entries(personSceneProfiles)){
  if(canonicalCharacterById[id].age>=18){adults++;assert.ok(words(profile.greeting)>=25);assert.ok(words(profile.familiar)>=25);}
 }
 assert.equal(adults,47);assert.equal(words(personSceneProfiles.bea.greeting),1);
 const g=currentGame(),p=g.players[0];for(const round of [2,5,7]){g.round=round;const reply=personReply({g,p,actorId:'oren'});assert.match(reply.speech,/Company, yes.*building session, no/);assert.equal(reply.emotion,'tired');}
 assert.match(ensembleDialogue['bracken:room'].body,/Gran/);assert.doesNotMatch(ensembleDialogue['bracken:room'].body,/Mum/);
});

test('all 130 adult response variants preserve complete attributed speech, including longer paragraphs',async()=>{
 const {characterVoices,characterVoiceResponse}=await import('../lib/character-voice.ts');
 const {attributedSpeech}=await import('../lib/person-response.ts');
 let count=0;const distinct=new Set();
 for(const [id,voice] of Object.entries(characterVoices))for(const [kind,speech] of Object.entries(voice)){
  const key={help:'help',boundary:'press',repair:'repair',support:'ask',small:'ask'}[kind];
  const outcome=characterVoiceResponse(id,key,kind==='support'?'support':'');
  assert.equal(attributedSpeech(outcome,canonicalCharacterById[id].name),speech,`${id}:${kind}`);
  assert.ok(speech.length>=100);assert.ok(speech.length<=800);distinct.add(speech);count++;
 }
 assert.equal(count,130);assert.equal(distinct.size,130);
});
