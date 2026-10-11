import test from 'node:test';
import assert from 'node:assert/strict';
import {createGame} from '../supabase/functions/crosswalk-game/game-service.ts';
import {move} from '../lib/game.ts';
import {castPeople} from '../lib/character-cast.ts';
import {castCharacters} from '../lib/cast-characters.ts';
import {canonicalCharacterById} from '../lib/character-canon.ts';
import {characterCameos} from '../lib/character-cameos.ts';
import {getStoryView, resolveStoryChoice} from '../lib/story-arcs.ts';
import {regionDefinitions, worldPlaceIds, worldView} from '../lib/world-life.ts';
import {motiveScene,resolveMotiveChoice} from '../lib/character-motives.ts';
import {characterMotiveProfiles} from '../lib/character-motive-profiles.ts';
import {personSceneProfiles} from '../lib/person-scene-profiles.ts';
import {attributedSpeech, personReply, type PersonSceneInput, type ResponseReceipt} from '../lib/person-response.ts';

function fixture(round = 1) {
  const g = createGame({mode:'hotseat', names:['Reader'], ownerSession:'owner', requestId:'person-response'}, 'PERSON');
  const p = g.players[0];
  g.round = round;
  for (const region of Object.keys(regionDefinitions)) p.world!.discoveredPlacesByRegion[region] = [...worldPlaceIds];
  return {g, p};
}
const emotions = new Set(['attentive','warm','concerned','hurt','relieved','firm','sad','proud','tired','shy']);
const gestures = new Set(['listen','offer','pause','point','withdraw','wave']);
function validReply(input: PersonSceneInput) {
  const before = JSON.stringify(input);
  const reply = personReply(input);
  assert.equal(JSON.stringify(input), before, 'presentation must not change an authoritative receipt or any player state');
  assert.ok(reply.activity.trim());
  assert.ok(emotions.has(reply.emotion));
  assert.ok(gestures.has(reply.gesture));
  assert.ok(reply.speech.trim() || reply.gesture, 'silence retains an explicit visible gesture');
  assert.ok(reply.speech.length <= 240, `${input.actorId}: spoken response remains brief`);
  assert.doesNotMatch(reply.speech, /\b(?:undefined|NaN|earnedWeeks|contributions|trust\s*[:+]|reward points)\b/i);
  return reply;
}

test('all 39 onstage people have pure first, repeat, paused, unavailable and private responses in all eight months', () => {
  const ids = Object.keys(personSceneProfiles);
  assert.equal(ids.length, 39);
  for (let round = 1; round <= 8; round++) {
    const {g, p} = fixture(round);
    for (const actorId of ids) {
      const input = {g, p, actorId};
      validReply(input);
      validReply({...input, known:true});
      validReply({...input, settled:true});
      const unavailable = validReply({...input, available:false});
      assert.equal(unavailable.gesture, 'pause');
      for (const preview of [true, false]) {
        const reply = validReply({...input, preview:{id:'choice', actionId:'choice', title:'A possible choice', available:preview, reason:preview?'':'Needs one priority block'}});
        if (preview) assert.equal(reply.speech, '', 'exploring an available choice must not perform its outcome');
      }
      assert.equal(validReply({...input, pending:true}).speech, '');
      assert.equal(validReply({...input, error:'No server confirmation'}).speech, '');
      const privateReply = validReply({...input, p:{...p,castRedacted:true}, known:true});
      assert.equal(privateReply.speech, '');
      assert.match(privateReply.activity, /private/i);
      assert.equal(privateReply.emotion, 'attentive');
      if (canonicalCharacterById[actorId].age >= 18) {
        const remote = validReply({...input, remote:true});
        assert.match(remote.activity, /correspondence|message|reply/i);
        assert.doesNotMatch(remote.activity, /here together|sits beside you|hands you/i);
      }
    }
  }
});

test('speech extraction requires an explicit attribution to the actual speaker', () => {
  assert.equal(attributedSpeech('Mina says “My song.” Jo says “My bench.”', 'Mina'), 'My song.');
  assert.equal(attributedSpeech('“My bench,” Jo says. “My song,” Mina says.', 'Jo'), 'My bench.');
  assert.equal(attributedSpeech('Jo says “My bench.”', 'Mina'), '');
  assert.equal(attributedSpeech('Mina hears Jo. “My bench.”', 'Mina'), '');
  assert.equal(attributedSpeech('Mina says nothing. Jo says “My bench.”', 'Mina'), '', 'a sentence boundary cannot turn Jo’s speech into Mina’s');
  assert.equal(attributedSpeech('“Earlier,” Mina says. Later Mina says “Latest.”', 'Mina'), 'Latest.', 'mixed attribution styles preserve chronological order');
  assert.equal(attributedSpeech('You receive $500 and a skill bonus.', 'Mina'), '', 'third-person rewards are never dialogue');
  assert.equal(attributedSpeech('Jo says “' + 'x'.repeat(221) + '”', 'Jo'), '', 'an entire long outcome is not a speech bubble');
});

test('confirmed speaker metadata survives exactly and cannot be borrowed by a different person or a private seat', () => {
  const {g, p} = fixture();
  const receipt:ResponseReceipt = {
    id:'cast:1:jo:help', actionId:'cast:1:jo:help', title:'A confirmed exchange',
    body:'The player helped one small part. Mina says “A song later.”',
    response:{speakerId:'jo', speech:'This edge is enough.', activity:'Puts down the ruler.', emotion:'firm', gesture:'pause'},
  };
  const jo = validReply({g,p,actorId:'jo',receipt});
  assert.deepEqual({speech:jo.speech, activity:jo.activity, emotion:jo.emotion, gesture:jo.gesture}, {
    speech:'This edge is enough.', activity:'Puts down the ruler.', emotion:'firm', gesture:'pause',
  });
  const mina = validReply({g,p,actorId:'mina',receipt});
  assert.notEqual(mina.speech, jo.speech);
  assert.notEqual(mina.activity, jo.activity);
  const hidden = validReply({g,p:{...p,castRedacted:true},actorId:'jo',receipt});
  assert.equal(hidden.speech, '');
  assert.match(hidden.activity, /private/i);
  const remote = validReply({g,p,actorId:'jo',receipt,remote:true});
  assert.equal(remote.speech, jo.speech);
  assert.match(remote.activity, /correspondence/i);
  assert.doesNotMatch(remote.activity, /ruler/);
});

test('Oren’s three short-visit months retain his stopping point independently of trust or contribution totals', () => {
  for (const round of [2,5,7]) {
    const {g,p} = fixture(round);
    for (const contributions of [0,99]) {
      p.motives!.bonds.oren = {trust:99, contributions, earnedWeeks:[1], strained:false};
      const reply = validReply({g,p,actorId:'oren',known:true});
      assert.match(reply.speech, /company/i);
      assert.match(reply.speech, /building session, no/i);
      assert.match(reply.activity, /seated/i);
      assert.equal(reply.emotion, 'tired');
      assert.doesNotMatch(reply.speech + ' ' + reply.activity, /cured|recover(?:ed|ing)|completed the stage|full energy/i);
      assert.equal(validReply({g,p,actorId:'oren',pending:true}).speech, '');
    }
  }
});

test('both real choices for all five minors remain local, bounded, unrewarded and age-appropriate', () => {
  const seen = new Set<string>();
  for (const cameo of characterCameos.filter(c => canonicalCharacterById[c.id].age < 18)) {
    for (const key of ['cameo_listen','cameo_choice']) {
      const {g,p} = fixture();
      p.world!.region = canonicalCharacterById[cameo.id].region as typeof p.world.region;
      let view;
      for (let round = 1; round <= 8; round++) {
        g.round = round;
        if (cameo.id === 'bea') {
          g.cast!.schedule[round] = g.cast!.schedule[round].filter(a => a.id !== 'kit');
          g.cast!.schedule[round].push({id:'kit',region:'embermesa',spot:'COMMUNITY',kind:'local'});
        }
        view = castPeople(g,p).find(c => c.id === cameo.id);
        if (view) break;
      }
      assert.ok(view, cameo.id);
      p.place = view.spot;
      view = castPeople(g,p).find(c => c.id === cameo.id)!;
      assert.equal(view.remote, false);
      const choice = view.choices.find(c => c.key === key)!;
      const before = JSON.stringify([p.cash,p.hours,p.energy,p.joy,p.cast!.bonds]);
      move(g,choice.id);
      assert.equal(JSON.stringify([p.cash,p.hours,p.energy,p.joy,p.cast!.bonds]), before);
      const receipt = p.cast!.receipts.find(r => r.id === choice.id)!;
      const reply = validReply({g,p,actorId:cameo.id,receipt});
      assert.doesNotMatch(reply.speech + ' ' + reply.activity, /promise|next month|romantic|shift|earn|reward|owe me|trust/i);
      if (cameo.id === 'bea') {
        assert.ok(reply.speech.split(/\s+/).length <= 2);
        assert.match(reply.activity, /Kit/);
      }
      const after = JSON.stringify(g);
      move(g,choice.id);
      assert.equal(JSON.stringify(g), after, 'repeating a confirmed child moment is idempotent');
      seen.add(cameo.id);
    }
  }
  assert.deepEqual([...seen].sort(), ['asha','bea','jian_wu','lin','nico']);
});

test('every shared-story choice renders an actual speaker response, including locked choices and the quiet eighth month', () => {
  const seen = new Set<string>();
  for (let round = 1; round <= 8; round++) {
    const base = fixture(round);
    base.p.cash = 100000;
    base.p.hours = 6;
    base.p.energy = 100;
    const first = getStoryView(base.g,base.p).scenes[0];
    if (!first) {
      assert.equal(round, 8);
      for (const actorId of ['mina','eli','jo']) validReply({...base,actorId,settled:true,available:false});
      continue;
    }
    base.p.place = first.spot;
    const scene = getStoryView(base.g,base.p).scenes[0];
    for (const choice of scene.choices) {
      seen.add(`${round}:${choice.id.split('~')[0]}`);
      for (const actorId of scene.characters) {
        const preview = {...choice,actionId:`story:${scene.id}:${choice.id}`};
        validReply({...base,actorId,sceneId:scene.id,preview});
      }
      if (!choice.available) continue;
      const g = structuredClone(base.g), p = g.players[0];
      const receipt = resolveStoryChoice(g,p,scene.id,choice.id);
      for (const actorId of scene.characters) {
        validReply({g,p,actorId,sceneId:scene.id,receipt:{...receipt,actionId:`story:${scene.id}:${choice.id}`}});
      }
    }
  }
  assert.ok(seen.size >= 23, `covered ${seen.size} story choices across seven authored chapters`);
});

test('all adult cast branches keep receipts and availability authoritative across eight rounds', t => {
  const keys = new Set<string>();
  let checked = 0;
  for (let round = 1; round <= 8; round++) {
    for (const actor of castCharacters) {
      for (const state of ['new','met','shared','tested','close','conflict','due','future','missed']) {
        const {g,p} = fixture(round);
        p.place = 'COMMUNITY';
        p.world!.region = actor.region;
        p.world!.localBonds[actor.tie.id] = 2;
        if (actor.tie.id in p.life!.relationships) p.life!.relationships[actor.tie.id].history = ['An established earlier conversation.'];
        g.cast!.schedule[round] = [{id:actor.id,region:actor.region,spot:p.place,kind:'local'}];
        if (state !== 'new') {
          p.cast!.bonds[actor.id] = {
            phase:['shared','tested','close'].includes(state)?state:'met',
            approach:'listen', lastWeek:0, conflict:['conflict','missed'].includes(state), repaired:false, memories:[],
            ...(['due','future','missed'].includes(state)?{promise:{due:round+(state==='future'?1:0),status:state==='missed'?'missed':'open'}}:{}),
          } as NonNullable<typeof p.cast>['bonds'][string];
        }
        const view = castPeople(g,p).find(c => c.id === actor.id)!;
        assert.ok(view, actor.id);
        validReply({g,p,actorId:actor.id,known:state!=='new',settled:!view.choices.length,available:view.choices.some(c=>c.available)});
        for (const choice of view.choices) {
          keys.add(choice.key);
          const preview = validReply({g,p,actorId:actor.id,preview:choice});
          if (!choice.available) {
            assert.ok(choice.reason);
            assert.equal(preview.gesture,'pause');
            continue;
          }
          const confirmed = structuredClone(g), updated = confirmed.players[0];
          move(confirmed,choice.id);
          const receipt = updated.cast!.receipts.find(r=>r.id===choice.id)!;
          assert.ok(receipt,choice.id);
          const reply = validReply({g:confirmed,p:updated,actorId:actor.id,receipt});
          const metadata = (receipt as ResponseReceipt).response;
          if (metadata && typeof metadata === 'object' && metadata.speakerId === actor.id) assert.equal(reply.speech,metadata.speech);
          assert.equal(updated.hours,p.hours-choice.cost.time,'presentation adds no extra cost or reward');
          assert.equal(updated.cash,p.cash);
          if (state === 'future') assert.notEqual(choice.key,'keep','an upcoming promise cannot be portrayed as kept');
          if (actor.id === 'oren' && [2,5,7].includes(round)) assert.doesNotMatch(reply.speech+' '+reply.activity,/ready for a full build|energy is back|treatment worked|cured/i);
          checked++;
        }
      }
    }
  }
  for (const key of ['listen','help','introduction','promise','share','honest','rush','accept','quiet','repair','release','keep','renegotiate']) assert.ok(keys.has(key),key);
  assert.ok(checked>=600,`checked ${checked} confirmed cast choices`);
  t.diagnostic(`${checked} confirmed choices; ${keys.size} distinct adult-cast branches`);
});

test('all 26 motive-bearing adults respond to actual support, smaller offers, boundaries and repairs', t => {
  const seen = new Set<string>(), responses = new Set<string>();
  let checked = 0;
  for (let round = 1; round <= 8; round++) {
    for (const actor of characterMotiveProfiles) {
      const base = fixture(round), {g,p} = base;
      const local = Object.values(regionDefinitions).find(region=>region.residents.some(c=>c.id===actor.id));
      if (local) {
        p.world!.region=local.id;
        p.world!.localBonds[actor.id]=1;
        p.world!.story!.localTalks[actor.id]=1;
        p.place=worldView(p,g)!.choices.find(c=>c.actorId===actor.id&&c.kind==='conversation')!.spot!;
      } else if (['mina','eli','jo'].includes(actor.id)) {
        p.world!.region='alder';
        p.life!.relationships[actor.id].history=['An earlier conversation.'];
        const scene=getStoryView(g,p).scenes[0];
        if (!scene) {assert.equal(round,8);assert.equal(motiveScene(g,p,actor.id),null);continue;}
        p.place=scene.spot;
      } else if (actor.id==='neri') {
        p.world!.region='alder';p.world!.story!.neri.stage='introduced';p.world!.story!.neri.lastSceneWeek=round-1;p.world!.companionStatus='companion';
        const choice=worldView(p,g)!.choices.find(c=>c.actorId==='neri');
        assert.ok(choice,`Neri has a current route in month ${round}`);p.place=choice.spot!;
      } else {
        const cast=castCharacters.find(c=>c.id===actor.id)!;
        p.world!.region=cast.region;p.place='COMMUNITY';
        p.cast!.bonds[actor.id]={phase:'met',approach:'listen',lastWeek:0,conflict:false,repaired:false,memories:[]};
        g.cast!.schedule[round]=[{id:actor.id,region:cast.region,spot:p.place,kind:'local'}];
      }
      for (const state of ['new','trusted','strained']) {
        const current=structuredClone(g), player=current.players[0];
        player.motives!.bonds[actor.id]={trust:state==='new'?0:4,earnedWeeks:[],contributions:state==='new'?0:3,strained:state==='strained'};
        const scene=motiveScene(current,player,actor.id);
        assert.ok(scene,`${actor.id}, month ${round}, ${state}`);seen.add(actor.id);
        assert.equal(motiveScene(current,{...player,castRedacted:true},actor.id),null);
        for (const choice of scene.choices) {
          if (!choice.available) {assert.ok(choice.reason);continue;}
          const next=structuredClone(current), updated=next.players[0];
          resolveMotiveChoice(next,updated,choice.id);
          const receipt=updated.motives!.receipts.find(r=>r.id===choice.id)!;
          assert.ok(receipt);responses.add(choice.response);
          const reply=validReply({g:next,p:updated,actorId:actor.id,remote:scene.remote,receipt});
          if (choice.response==='refusal'||choice.response==='boundary') {
            assert.equal(updated.energy,player.energy);
            assert.equal(updated.joy,player.joy);
            assert.doesNotMatch(reply.speech,/always here|anything you need|I'll take that on|I’ll take that on/i);
          }
          assert.equal(updated.hours,player.hours-choice.cost.time);
          assert.equal(updated.energy,player.energy+choice.energy);
          assert.equal(updated.joy,player.joy+choice.joy);
          assert.equal(motiveScene(next,updated,actor.id)!.choices.length,0,'a receipt cannot unlock another same-month favor');
          const saved=JSON.stringify(next);resolveMotiveChoice(next,updated,choice.id);assert.equal(JSON.stringify(next),saved);
          checked++;
        }
      }
    }
  }
  assert.deepEqual([...seen].sort(),characterMotiveProfiles.map(c=>c.id).sort());
  assert.deepEqual([...responses].sort(),['boundary','follow-through','refusal','repair','smaller-offer','support'].sort());
  t.diagnostic(`${checked} confirmed motive choices across ${seen.size} adults and all eight months`);
});
