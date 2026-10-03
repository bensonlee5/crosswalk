import assert from 'node:assert/strict';
import {actions,player,reason,availableActions,move,createEnvironment} from '../lib/game.ts';
import {actionPreview} from '../lib/game-view.ts';
import {locations} from '../lib/locations.ts';
import {placeStories,firstPlaceAction,mapInvitations,choiceBenefit,choiceTerms,neighborAtPlace,afterChoiceInvitation} from '../lib/place-invitations.ts';
const game=(p,extra={})=>({code:'INVITE',mode:'hotseat',host:'x',members:{x:[p.id]},players:[p],status:'playing',round:1,turn:0,maxRounds:8,log:[],seen:[],event:0,rulesVersion:2,project:{contributions:{},lastWeek:{},completed:false},...createEnvironment(),...extra});
const p=player('Invited'),g=game(p),before=JSON.stringify(g);
assert.equal(Object.keys(placeStories).length,15);
assert.equal(new Set(Object.values(placeStories).map(s=>s.promise)).size,15);
assert.equal(new Set(Object.values(placeStories).map(s=>s.scene)).size,15);
for(const l of locations){assert.ok(placeStories[l.place]);const id=firstPlaceAction(p,l.place,g);assert.ok(availableActions(p,l.place).some(a=>a.id===id));assert.equal(reason(p,id,g),'',`${l.place} welcomes with a legal action`);}
assert.equal(firstPlaceAction(p,'APARTMENTS',g),'home_reset');
assert.equal(firstPlaceAction(p,'MAKERSPACE',g),'creative_practice');
assert.equal(firstPlaceAction({...p,rulesVersion:undefined},'MAKERSPACE',g),'maker_hobby');
assert.equal(firstPlaceAction(p,'MAKERSPACE',g,'maker_intro'),'maker_intro','explicit locked deep links remain inspectable');
assert.equal(firstPlaceAction(p,'MAKERSPACE',g,'no-such-id'),'creative_practice');
assert.equal(firstPlaceAction({...p,hours:1},'MAKERSPACE',g),'maker_hobby');
assert.equal(firstPlaceAction({...p,cash:0},'MAKERSPACE',g),'story_jo_1');
assert.equal(firstPlaceAction({...p,craft:3},'MAKERSPACE',g),'creative_commission');
assert.equal(JSON.stringify(g),before,'presentation does not change room data');
let tested=0;
for(const modern of [false,true])for(const round of [1,2,4,7,8])for(const hours of [0,1,2,3,6])for(const cash of [-5,0,29,505,1100])for(const energy of [0,12,30,100]){
 const q={...p,rulesVersion:modern?2:undefined,hours,cash,energy,skill:round%7,craft:round%9,social:round,joy:round===8?100:40},h=game(q,{round,rulesVersion:modern?2:undefined});
 const saved=JSON.stringify(h);const invites=mapInvitations(q,h);
 assert.ok(invites.length<=3);assert.equal(new Set(invites.map(i=>i.place)).size,invites.length);
 for(const i of invites){assert.equal(reason(q,i.action,h),'',i.action);assert.ok(availableActions(q,i.place).some(a=>a.id===i.action));assert.ok(!/NaN|undefined/.test(i.title+i.reason));}
 for(const l of locations){const options=availableActions(q,l.place),id=firstPlaceAction(q,l.place,h);assert.ok(options.some(a=>a.id===id));if(options.some(a=>!reason(q,a.id,h)))assert.equal(reason(q,id,h),'',l.place);}
 assert.equal(JSON.stringify(h),saved);tested++;
}
const byId=id=>actions.find(a=>a.id===id);
assert.match(choiceTerms(p,byId('move'),g).bills,/\$705 weekly bills \(\$620 rent \+ \$85 food\), \$200 more/);
assert.match(choiceTerms(p,byId('move'),g).cash,/\$200 upfront/);
assert.match(choiceTerms(p,byId('library_learn'),g).cash,/\$0/);assert.match(choiceTerms(p,byId('library_learn'),g).time,/3 time/);
assert.match(choiceTerms(p,byId('study'),g).cash,/\$180 upfront/);assert.match(choiceTerms(p,byId('study'),g).time,/2 time/);
assert.match(choiceBenefit(p,byId('creative_practice'),g),/\+1 craft/);
assert.match(choiceTerms(p,byId('creative_commission'),g).requirements,/3 craft/);
const skilled={...p,skill:2};assert.match(choiceBenefit(skilled,byId('apply'),g),/IT support.*\$29\/hour/);
assert.ok(mapInvitations(skilled,g).some(i=>i.action==='apply'));
assert.ok(mapInvitations({...p,craft:2},g).some(i=>i.action==='creative_practice'));
assert.ok(!choiceTerms(p,byId('career_contract'),g).requirements.includes('skills'));
assert.match(choiceTerms({...p,rulesVersion:undefined},byId('career_contract'),g).requirements,/2 skills/);
for(const a of actions){const q={...p,cash:5000,skill:4,craft:4,social:10,joy:95,energy:95,place:a.place,stories:a.story?{[a.story]:a.stage-1}:{}};const h=game(q),v=actionPreview(q,a.id,h);assert.ok(!/NaN|undefined/.test(choiceBenefit(q,a,h)+JSON.stringify(choiceTerms(q,a,h))));if(reason(q,a.id,h))continue;const old=structuredClone(q);move(h,a.id);assert.equal(q.cash-old.cash,v.cash);assert.equal(q.hours-old.hours,v.hours);}
const rich={...p,cash:5000,skill:3,social:2};assert.match(choiceTerms(rich,byId('maker_commission'),game(rich)).cash,/\$40 upfront.*\$370 received.*\+\$330 net/);
let h=game(p,{round:2});assert.ok(mapInvitations(p,h).some(i=>i.reason.includes('weather happiness')));
let capped={...p,weatherUsage:{round:2,joy:4,heat:0,recovery:0}};assert.ok(!mapInvitations(capped,game(capped,{round:2})).some(i=>i.reason.includes('weather happiness')));
let full={...p,energy:100};assert.ok(!mapInvitations(full,game(full,{round:7})).some(i=>i.reason.includes('winter recovery')));
let hot=game(p,{round:4});assert.match(choiceTerms(p,byId('transit_courier'),hot).requirements,/18 energy/);
assert.equal(neighborAtPlace({...p,rulesVersion:undefined},'CORNER CAFÉ',g),null);
assert.equal(neighborAtPlace(p,'CORNER CAFÉ',g).action,'story_mina_1');
const progressed={...p,stories:{mina:1},storyWeeks:{mina:1}};assert.equal(neighborAtPlace(progressed,'CORNER CAFÉ',g).action,null);assert.match(neighborAtPlace(progressed,'CORNER CAFÉ',g).text,/next week/);assert.ok(!mapInvitations(progressed,g).some(i=>i.action==='story_mina_2'));
assert.equal(neighborAtPlace({...p,stories:{mina:3}},'CORNER CAFÉ',g).action,null);
assert.equal(afterChoiceInvitation({...p,skill:1},{...p,skill:2},g).action,'apply');
assert.equal(afterChoiceInvitation({...p,craft:2},{...p,craft:3},g).action,'creative_commission');
assert.match(afterChoiceInvitation(p,progressed,g).reason,/next week/);
assert.equal(afterChoiceInvitation({...p,skill:1},{...p,skill:2,hours:0},g),null);
assert.ok(!neighborAtPlace({...progressed,storyWeeks:{mina:8}},'CORNER CAFÉ',game(p,{round:8})).text.includes('next week'));
assert.equal(afterChoiceInvitation(p,progressed,game(p,{round:8})),null);
assert.equal(actions.length,74);
console.log(`PASS: ${tested} resource/weather/classic states, 15 distinct place welcomes, all 74 preview outcomes, honest upfront/net/bills, capped weather, legal invitations and story/unlock nudges`);
