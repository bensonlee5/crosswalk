import {currentGame} from './current-fixture.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';

import {move,type Game,type Player} from '../lib/game.ts';
import {economyPaidHours} from '../lib/economy.ts';

import {worldPlaceIds,regionDefinitions,worldChoices} from '../lib/world-life.ts';
import {careerTracks} from '../lib/career-content.ts';
import {careerChoices,resolveCareerChoice,careerView,recordCareerEvidence,careerMemberPlayers,type CareerPlayer} from '../lib/careers.ts';

function fixture(){const g=currentGame({names:['Worker']}),p=g.players[0];for(const region of Object.keys(regionDefinitions))p.world.discoveredPlacesByRegion[region]=[...worldPlaceIds];return{g,p};}

function actualFixture(){return fixture();}

function choose(g:Game,p:Player,verb:string,target:string){const c=careerChoices(g,p).find(c=>c.verb===verb&&c.target===target);assert.ok(c,verb+':'+target);assert.equal(c.available,true,c.reason);return resolveCareerChoice(g,p,c.id);}
function acceptEntry(g:Game,p:CareerPlayer,field='technical'){
 const track=careerTracks.find(t=>t.id===field)!;p.place=track.place;const applied=choose(g,p,'apply',`t.${field}.${track.roles[0].id}`);assert.ok(applied.offerId);choose(g,p,'accept',applied.offerId);return p.career!.contracts.at(-1)!;
}
function month(g:Game,p:Player){g.round++;p.hours=6;p.energy=100;}

test('first role needs no contacts or earlier job, acceptance is separate, and real work pays only once',()=>{
 const{p,g}=fixture();p.place='WORK';const opening=careerChoices(g,p).find(c=>c.target==='t.technical.assistant')!;assert.equal(opening.cash,0);assert.equal(opening.jobPay!.cash,3072);assert.match(opening.body,/it pays nothing/);const cash=p.cash,hours=p.hours,offer=choose(g,p,'apply','t.technical.assistant');assert.equal(p.cash,cash);assert.equal(p.hours,hours-1);assert.equal(p.career!.contracts.length,0);assert.equal(careerView(g,p)!.current,null);
 choose(g,p,'accept',offer.offerId!);const c=p.career!.contracts[0];assert.equal(p.cash,cash);const choice=careerChoices(g,p).find(x=>x.verb==='work'&&x.target===c.id+'.regular')!;assert.equal(choice.cash,3072);assert.equal(choice.paidHours,160);assert.equal(choice.time,2);
 const receipt=resolveCareerChoice(g,p,choice.id);assert.equal(p.cash,cash+3072);assert.equal(p.hours,3);assert.equal(p.career!.experience.technical!.paidHours,160);assert.equal(economyPaidHours(p,g),160);assert.ok(receipt.milestones.includes('technical:first-work'));const after=structuredClone(g);resolveCareerChoice(g,p,choice.id);assert.deepEqual(g,after);
 const repeat=careerChoices(g,p).find(x=>x.target===c.id+'.regular')!;assert.equal(repeat.available,false);assert.match(repeat.reason,/Only 40 paid hours/);
});
test('applications, work and training require their actual venues and reject stale concurrent choices without mutation',()=>{
 const{p,g}=fixture();const a=careerChoices(g,p).find(c=>c.target==='t.technical.assistant')!;assert.equal(a.available,false);assert.match(a.reason,/Visit Clockhouse/);const before=structuredClone(g);assert.throws(()=>resolveCareerChoice(g,p,a.id),/Visit/);assert.deepEqual(g,before);
 p.place='WORK';const original=careerChoices(g,p).find(c=>c.target==='t.technical.assistant')!;choose(g,p,'apply','t.technical.assistant');const changed=structuredClone(g);const stale=original.id.replace('t.technical.assistant','t.technical.specialist');assert.throws(()=>resolveCareerChoice(g,p,stale),/stale/);assert.deepEqual(g,changed);
});
test('a not-yet-qualified application gives a precise response and never changes current work',()=>{
 const{p,g}=fixture();const entry=acceptEntry(g,p);const response=choose(g,p,'apply','t.technical.specialist');assert.match(response.outcome,/cannot offer/);assert.match(response.outcome,/relevant entry work/);assert.equal(response.offerId,undefined);assert.equal(p.career!.contracts.find(c=>c.active)?.id,entry.id);
});
test('classes and free preparation compete for actual time and cannot award the same qualification twice',()=>{
 const{p,g}=fixture();p.place='LIBRARY';const cash=p.cash;choose(g,p,'train','technical-foundation-study');assert.equal(p.hours,3);assert.equal(p.cash,cash);assert.ok(p.career!.training['technical:foundation']);p.place='CAMPUS';const repeat=careerChoices(g,p).find(c=>c.target==='technical-foundation-class')!;assert.equal(repeat.available,false);assert.match(repeat.reason,/already completed/);assert.equal(careerChoices(g,p).find(c=>c.target==='technical-advanced-class')!.available,false);
});
test('skilled and lead roles require actual relevant work, preparation and practiced responsibility',()=>{
 const{p,g}=fixture();let contract=acceptEntry(g,p);choose(g,p,'work',contract.id+'.regular');month(g,p);p.place='CAMPUS';choose(g,p,'train','technical-foundation-class');p.place='WORK';const offer=choose(g,p,'apply','t.technical.specialist');assert.ok(offer.offerId);const old=contract.id;choose(g,p,'accept',offer.offerId!);assert.equal(p.career!.contracts.find(c=>c.id===old)!.active,false);contract=p.career!.contracts.at(-1)!;choose(g,p,'work',contract.id+'.regular');
 month(g,p);p.place='CAMPUS';choose(g,p,'train','technical-advanced-class');p.place='WORK';choose(g,p,'work',contract.id+'.short');const leader=choose(g,p,'apply','t.technical.lead');assert.ok(leader.offerId);choose(g,p,'accept',leader.offerId!);assert.equal(careerView(g,p)!.current!.title,'Technical project lead');assert.equal(p.career!.experience.technical!.paidHours,360);assert.equal(p.career!.experience.service,undefined,'technical work is not service experience');
});
test('actual interactions create cross-town leads, not automatic offers or references; a route needs its own choice',()=>{
 const{p,g}=fixture(),cash=p.cash;g.round=2;const introduction=worldChoices(p,g).find(c=>c.key==='neri_accept')!;if(introduction.spot)p.place=introduction.spot;move(g,'world:'+introduction.id);const lead=careerView(g,p)!.leads.find(l=>l.id==='neri-esme-archive')!;assert.equal(lead.reference,false);assert.equal(lead.region,'pelagia');assert.equal(Object.keys(p.career!.offers).length,0);assert.equal(p.world!.discoveredRegions.includes('pelagia'),false);
 choose(g,p,'route',lead.id);assert.equal(p.world!.discoveredRegions.includes('pelagia'),true);assert.equal(p.world!.discoveredPlacesByRegion.pelagia.includes('LIBRARY'),true);assert.equal(p.world!.region,'alder');assert.equal(p.cash,cash);const before=structuredClone(g);recordCareerEvidence(g,p,{actionKey:'world:alder:neri_accept',actorIds:['neri'],round:1,replay:true});assert.deepEqual(g,before);
});
test('only an actual work colleague can provide reference evidence; repeat chatter cannot farm experience',()=>{
 const{p,g}=fixture();const c=acceptEntry(g,p,'service');choose(g,p,'work',c.id+'.regular');assert.ok(p.career!.colleagues.alder_tess);const exp=p.career!.experience.service!.paidHours;
 const talk=worldChoices(p,g).find(c=>c.key==='talk:alder_tess')!;move(g,'world:'+talk.id);assert.equal(careerView(g,p)!.leads.find(l=>l.id==='tess-ferry')!.reference,true);const before=structuredClone(p.career);for(let i=0;i<3;i++)recordCareerEvidence(g,p,{actionKey:'world:alder:talk:alder_tess',actorIds:['alder_tess'],round:1,replay:false});assert.deepEqual(p.career,before);assert.equal(p.career!.experience.service!.paidHours,exp);
});
test('contracts preserve employer identity on travel; observers cannot read references or training',()=>{
 const{p,g}=fixture();acceptEntry(g,p);p.world!.region='pelagia';p.place='WORK';const choice=careerChoices(g,p).find(c=>c.verb==='work'&&c.target.endsWith('.regular'))!;assert.equal(choice.cash,3072);assert.equal(choice.region,'alder');assert.match(choice.reason,/Return to Alder/);
 const publicPlayer=careerMemberPlayers([p],[])[0] as CareerPlayer;assert.equal(publicPlayer.career,undefined);assert.equal(publicPlayer.careerPublic![0].role,'Support assistant');assert.equal(publicPlayer.careerPublic![0].region,'alder');
});
test('recovery quotes the same exact repayment that actual career work commits and free training stays accessible',()=>{
 const{p,g}=fixture();p.finance!.recovering=true;p.finance!.arrears=2000;const c=acceptEntry(g,p);const choice=careerChoices(g,p).find(x=>x.target===c.id+'.regular')!;assert.equal(choice.repayment,614);assert.equal(choice.cash,2458);assert.match(choice.body,/\$614 repays arrears/);const cash=p.cash;resolveCareerChoice(g,p,choice.id);assert.equal(p.cash-cash,2458);assert.equal(p.finance!.arrears,1386);p.place='CAMPUS';assert.match(careerChoices(g,p).find(x=>x.target==='technical-foundation-class')!.reason,/Tuition/);p.place='LIBRARY';assert.equal(careerChoices(g,p).find(x=>x.target==='technical-foundation-study')!.available,true);
});
test('actual engine dispatch keeps career commands idempotent and records semantic familiarity',async()=>{
 const {move}=await import('../lib/game.ts');const{g,p}=fixture();p.place='WORK';const apply=careerChoices(g,p).find(c=>c.target==='t.technical.assistant')!;move(g,apply.id);assert.ok(p.career!.receipts[0].offerId);assert.equal(p.familiarity!.actions['career:apply:t.technical.assistant'].count,1);const done=structuredClone(g);move(g,apply.id);assert.deepEqual(g,done);const bad=careerChoices(g,p).find(c=>c.target==='technical-foundation-class')!;const unchanged=structuredClone(g);assert.throws(()=>move(g,bad.id),/Visit/);assert.deepEqual(g,unchanged);
});
test('paid posting work keeps actual outdoor effort and monthly climate exposure',async()=>{
 const {createEnvironment}=await import('../lib/game.ts');const{g,p}=fixture();Object.assign(g,createEnvironment());g.round=3;p.world!.region='embermesa';p.place='TRANSIT';p.energy=100;const apply=choose(g,p,'apply','p.courier');choose(g,p,'accept',apply.offerId!);const c=careerChoices(g,p).find(c=>c.verb==='work')!;assert.ok(c.energy>14,'hot outdoor route includes exposure');const before=p.energy;resolveCareerChoice(g,p,c.id);assert.equal(before-p.energy,c.energy);assert.ok((p.weatherUsage?.exposure??0)>0);
});
test('work receipt presenter and foley require confirmed new work and actual present speaker',async()=>{
 const {careerConfirmedReceipt}=await import('../lib/career-presentation.ts'),{actionSound}=await import('../lib/action-sounds.ts');const{g,p}=fixture();const c=acceptEntry(g,p,'service'),work=careerChoices(g,p).find(v=>v.target===c.id+'.regular')!;assert.equal(careerConfirmedReceipt(g,p,work.id),null);const before=structuredClone(p);resolveCareerChoice(g,p,work.id);const receipt=careerConfirmedReceipt(g,p,work.id)!;assert.equal(typeof receipt.response,'object');assert.equal(typeof receipt.response==='object'&&receipt.response.speakerId,'alder_tess');assert.equal(actionSound('move',work.id,before,p),null,'no generic unfaithful café noise');assert.equal(actionSound('move',work.id,p,p),null);
 const tech=fixture();const contract=acceptEntry(tech.g,tech.p),shift=careerChoices(tech.g,tech.p).find(v=>v.target===contract.id+'.regular')!,old=structuredClone(tech.p);resolveCareerChoice(tech.g,tech.p,shift.id);assert.equal(careerConfirmedReceipt(tech.g,tech.p,shift.id)!.response,undefined,'an absent interviewer is not invented');assert.equal(actionSound('move',shift.id,old,tech.p),'write');
});
test('same employer role keeps familiarity across confirmed commitments, while fixed agreements expire at month end',async()=>{
 const {move}=await import('../lib/game.ts');const{g,p}=fixture();const c=acceptEntry(g,p),short=careerChoices(g,p).find(v=>v.target===c.id+'.short')!;move(g,short.id);month(g,p);move(g,careerChoices(g,p).find(v=>v.target===c.id+'.short')!.id);assert.equal(p.familiarity!.actions['career:work:alder:t.technical.assistant:short'].count,2);
 p.place='MARKET';const offer=choose(g,p,'apply','p.market-stall');choose(g,p,'accept',offer.offerId!);const fixed=p.career!.contracts.find(c=>c.kind==='fixed')!;move(g,'end');assert.equal(fixed.active,false);assert.equal(fixed.endedRound,2);
});
test('foreign-employer applications and acceptance disclose the full round-trip deficit',()=>{
 const{g,p}=fixture();p.world!.story!.homeRegion='pelagia';p.world!.region='embermesa';p.world!.discoveredRegions=['alder','pelagia','embermesa'];p.place='WORK';p.finance!.recovering=true;p.finance!.arrears=5000;const c=careerChoices(g,p).find(c=>c.target==='t.technical.assistant')!;assert.equal(c.commute!.fares,1200);assert.equal(c.commute!.remainingAfterBills,-1197);assert.match(c.body,/falls short by \$1,197/);const receipt=resolveCareerChoice(g,p,c.id),offer=careerChoices(g,p).find(c=>c.verb==='accept'&&c.target===receipt.offerId)!;assert.match(offer.body,/Home-town entry roles/);assert.equal(offer.commute!.totalBlocks,6);
});
test('career handovers rotate through familiarity stages without immediate repetition and survive reload',async()=>{
 const {move}=await import('../lib/game.ts');for(const field of ['service','technical']){const{g,p}=fixture();const c=acceptEntry(g,p,field),stages=new Set<string>();let priorSpeech='',priorOutcome='';for(let i=0;i<8;i++){if(i)month(g,p);const choice=careerChoices(g,p).find(v=>v.target===c.id+'.short')!,restored=JSON.parse(JSON.stringify(g)) as Game;move(g,choice.id);move(restored,choice.id);const r=p.career!.receipts.at(-1)!;assert.deepEqual(restored.players[0].career!.receipts.at(-1),r,'reload chooses the same recorded variant');assert.notEqual(r.outcome,priorOutcome);priorOutcome=r.outcome;stages.add(r.familiarity!.stage);if(r.speech){assert.notEqual(r.speech,priorSpeech);assert.match(r.speech,/Café crew/);priorSpeech=r.speech;}else assert.equal(field,'technical');const done=structuredClone(g);move(g,choice.id);assert.deepEqual(g,done,'replay cannot rotate a receipt');}assert.deepEqual([...stages],['first','familiar','routine','custom']);}
});
test('repeat applications and declined offers recognize earlier visits without changing qualification or consent',()=>{
 const{g,p}=fixture();p.place='CORNER CAFÉ';let previous='',declined='';for(let i=0;i<5;i++){if(i)month(g,p);const denied=choose(g,p,'apply','t.service.barista');assert.equal(denied.offerId,undefined);assert.match(denied.outcome,/cannot offer/);assert.match(denied.outcome,/relevant entry work/);assert.notEqual(denied.outcome,previous);if(i)assert.match(denied.speech!,/looked at this role before|returned about this role|earlier application/);previous=denied.outcome;const offered=choose(g,p,'apply','t.service.crew');const refused=choose(g,p,'decline',offered.offerId!);assert.notEqual(refused.outcome,declined);declined=refused.outcome;assert.equal(p.career!.contracts.length,0);assert.deepEqual(p.career!.experience,{});}
});
test('venue work-cut fallback never invents an entry-level job',async()=>{const{beginLifeWeek,lifeChoices}=await import('../lib/life-events.ts');const{g,p}=fixture();g.lifeSchedule=[{week:1,eventId:'work_reset'}];beginLifeWeek(g);const fallback=lifeChoices(p,g).find(c=>c.id.endsWith(':take_stock'))!;assert.doesNotMatch(fallback.outcome,/entry-level role|old job is still gone/);assert.match(fallback.outcome,/earned experience/);});
test('a paid public gig earns its field foothold in the same confirmed action',async()=>{const{move}=await import('../lib/game.ts');const{g,p}=fixture();p.place='COMMUNITY';move(g,'weekly_opportunity');assert.ok(p.career!.experience.civic!.paidHours>0);assert.ok(p.milestones?.includes('career_apprentice'));assert.equal(p.career!.contracts.length,0);});
test('a refused or strained exchange cannot award a reference; repair alone cannot disguise it',async()=>{
 const {initializeMotivesPlayer,motiveScene}=await import('../lib/character-motives.ts');const{g,p}=actualFixture();initializeMotivesPlayer(g,p);p.place='CORNER CAFÉ';
 const talk=()=>{const c=worldChoices(p,g).find(c=>c.key==='talk:alder_tess')!;assert.equal(c.available,true,c.reason);move(g,'world:'+c.id);return 'world:'+c.id;};talk();const c=acceptEntry(g,p,'service');choose(g,p,'work',c.id+'.regular');assert.equal(p.career!.leads['tess-ferry'].referenceRound,undefined);
 const press=motiveScene(g,p,'alder_tess')!.choices.find(c=>c.key==='press')!;move(g,press.id);assert.equal(p.motives!.receipts.at(-1)!.response,'boundary');assert.equal(p.career!.leads['tess-ferry'].referenceRound,undefined);assert.equal(p.career!.notices!.some(n=>n.actionId===press.id),false);const after=structuredClone(g);move(g,press.id);assert.deepEqual(g,after);
 month(g,p);const strainedTalk=talk();assert.equal(p.career!.notices!.some(n=>n.actionId===strainedTalk),false);const repair=motiveScene(g,p,'alder_tess')!.choices.find(c=>c.key==='repair')!;move(g,repair.id);assert.equal(p.motives!.bonds.alder_tess.strained,false);assert.equal(p.career!.leads['tess-ferry'].referenceRound,undefined);assert.equal(p.career!.notices!.some(n=>n.actionId===repair.id),false);
 month(g,p);const friendly=talk();assert.equal(p.career!.leads['tess-ferry'].referenceRound,g.round);const notice=p.career!.notices!.find(n=>n.actionId===friendly&&n.kind==='reference')!;assert.equal(notice.actorId,'alder_tess');assert.equal(notice.employer,'Alder Ferry & Rail');assert.match(notice.speech,/finished handover/);const pressure=motiveScene(g,p,'alder_tess')!.choices.find(c=>c.key==='press')!;move(g,pressure.id);assert.equal(p.career!.leads['tess-ferry'].referenceRound,g.round,'a historical reference is not silently revoked');
});
test('working with one colleague in two fields preserves both records and earns the matching later reference',async()=>{
 const{g,p}=actualFixture();p.world!.region='pelagia';p.world!.story!.homeRegion='pelagia';p.place='COMMUNITY';const civic=acceptEntry(g,p,'civic');choose(g,p,'work',civic.id+'.short');assert.deepEqual(p.career!.colleagues.pelagia_esme.fields?.civic,[1]);
 month(g,p);p.place='CAMPUS';choose(g,p,'train','technical-foundation-class');p.place='LIBRARY';const offer=choose(g,p,'apply','p.archive-assistant');choose(g,p,'accept',offer.offerId!);const archive=p.career!.contracts.at(-1)!;choose(g,p,'work',archive.id+'.regular');assert.deepEqual(p.career!.colleagues.pelagia_esme.fields,{civic:[1],technical:[2]});
 month(g,p);p.place='LIBRARY';const talk=worldChoices(p,g).find(c=>c.key==='talk:pelagia_esme')!;assert.equal(talk.available,true,talk.reason);const actionId='world:'+talk.id;move(g,actionId);assert.equal(p.career!.leads['esme-records'].referenceRound,3);assert.equal(p.career!.notices!.filter(n=>n.actionId===actionId).length,2);assert.deepEqual(p.career!.colleagues.pelagia_esme.fields,{civic:[1],technical:[2]});
});
test('career notices are exact-action, owner-private, stable on reload and never inferred from an action label',async()=>{
 const{careerNoticesForAction}=await import('../lib/careers.ts');const{g,p}=fixture();p.place='CORNER CAFÉ';const c=worldChoices(p,g).find(c=>c.key==='talk:alder_tess')!,id='world:'+c.id;move(g,id);const notices=careerNoticesForAction(g,p,id);assert.equal(notices.length,1);assert.equal(notices[0].kind,'lead');assert.equal(notices[0].region,'alder');assert.match(notices[0].speech,/transit desk/);const reload=JSON.parse(JSON.stringify(g)) as Game;assert.deepEqual(careerNoticesForAction(reload,reload.players[0],id),notices);const prior=structuredClone(p.career);recordCareerEvidence(g,p,{actionKey:'motive:alder_tess:help',actionId:'motive:fake:alder_tess:help',actorIds:['alder_tess'],round:g.round,replay:false});assert.deepEqual(p.career,prior);assert.deepEqual(careerNoticesForAction(g,{...p,castRedacted:true},id),[]);assert.equal((careerMemberPlayers([p],[])[0] as CareerPlayer).career,undefined);assert.deepEqual(careerNoticesForAction({...g,round:g.round+1},p,id),[]);
});
test('receipt-level reference eligibility excludes refused favors and negative per-person story consequences',async()=>{
 const{eligibleCareerConversation}=await import('../lib/career-evidence.ts');const{g,p}=actualFixture();const id='motive:1:eli:ask';p.motives!.receipts.push({id,actorId:'eli',week:g.round,title:'Ask',body:'Ask',outcome:'No',response:'refusal',energy:0,joy:0});assert.equal(eligibleCareerConversation(g,p,id,'eli'),false);assert.equal(eligibleCareerConversation(g,p,id+':different','eli'),false);
 p.cast!.receipts.push({id:'cast:1:eli:rush',week:1,title:'Rush',body:'Pressure',outcome:'No'});assert.equal(eligibleCareerConversation(g,p,'cast:1:eli:rush','eli'),false);
 p.story!.receipts.push({id:'mixed',week:1,title:'Mixed answer',body:'Three people',sceneId:'mixed',characterIds:['mina','eli','jo'],careerContactIds:['mina'],choiceId:'decision',outcome:'Different answers',effects:{cash:0,hours:0,energy:0,joy:0,social:0,craft:0,trust:{mina:1,eli:-1,jo:0}} as never});assert.equal(eligibleCareerConversation(g,p,'story:mixed:decision','mina'),true);assert.equal(eligibleCareerConversation(g,p,'story:mixed:decision','eli'),false);assert.equal(eligibleCareerConversation(g,p,'story:mixed:decision','jo'),false);
});
test('friendly capped relationships still support an earned reference without minting extra bond points',()=>{
 const{g,p}=actualFixture();p.place='CORNER CAFÉ';const talk=()=>{const c=worldChoices(p,g).find(c=>c.key==='talk:alder_tess')!;move(g,'world:'+c.id);return 'world:'+c.id;};talk();month(g,p);talk();month(g,p);talk();assert.equal(p.world!.localBonds!.alder_tess,3);month(g,p);const c=acceptEntry(g,p,'service');choose(g,p,'work',c.id+'.regular');assert.equal(p.career!.leads['tess-ferry'].referenceRound,undefined);month(g,p);const id=talk();assert.equal(p.world!.journal.at(-1)!.effects!.localBonds.alder_tess,0);assert.equal(p.career!.leads['tess-ferry'].referenceRound,5);assert.equal(p.career!.notices!.find(n=>n.actionId===id)!.kind,'reference');
});
test('capped story trust preserves the actual choice’s per-person positive intent on its exact receipt',async()=>{
 const{getStoryView}=await import('../lib/story-arcs.ts'),{eligibleCareerConversation}=await import('../lib/career-evidence.ts');const{g,p}=actualFixture();for(const r of Object.values(p.life!.relationships))r.trust=3;const scene=getStoryView(g,p).scenes[0];p.place=scene.spot;const choice=getStoryView(g,p).scenes[0].choices.find(c=>c.id.startsWith('listen~'))!,id='story:'+scene.id+':'+choice.id;move(g,id);const r=p.story!.receipts.at(-1)!;assert.deepEqual(r.effects.trust,{mina:0,eli:0,jo:0});assert.deepEqual(r.careerContactIds,['mina','jo']);assert.equal(eligibleCareerConversation(g,p,id,'jo'),true);assert.equal(eligibleCareerConversation(g,p,id,'eli'),false);
});
test('every named posting and commission pays exactly its advertised terms',async()=>{
 const{careerPostings}=await import('../lib/career-content.ts');
 for(const posting of careerPostings){
  const{g,p}=fixture();p.cash=10000;p.energy=100;p.craft=3;p.social=5;p.place=posting.place;
  p.career.experience[posting.field]={paidHours:160,commitments:1,months:[1]};
  p.career.training[posting.field+':foundation']={round:1,courseId:posting.field+'-foundation-study'};
  p.career.leads['esme-records']={id:'esme-records',receivedRound:1,referenceRound:1};
  let work,advertised;
  if(posting.kind==='fixed'){
   const application=careerChoices(g,p).find(c=>c.target==='p.'+posting.id&&c.verb==='apply');assert.ok(application,posting.id);assert.equal(application.available,true,application.reason);advertised=application.jobPay;
   const offer=resolveCareerChoice(g,p,application.id);assert.ok(offer.offerId,offer.outcome);choose(g,p,'accept',offer.offerId);
   work=careerChoices(g,p).find(c=>c.verb==='work');
  }else{work=careerChoices(g,p).find(c=>c.target==='p.'+posting.id&&c.verb==='commission');advertised=work;}
  assert.ok(work,posting.id);assert.equal(work.available,true,work.reason);
  for(const key of ['gross','takeHome','cost','cash','paidHours'])assert.equal(work[key],advertised[key],posting.id+' '+key);
  const cash=p.cash,receipt=resolveCareerChoice(g,p,work.id);assert.equal(p.cash-cash,advertised.cash,posting.id);
  for(const key of ['gross','takeHome','cost','cash','paidHours'])assert.equal(receipt[key],advertised[key],posting.id+' receipt '+key);
  const saved=JSON.stringify(g);resolveCareerChoice(g,p,work.id);assert.equal(JSON.stringify(g),saved);
 }
});
