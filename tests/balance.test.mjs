import assert from 'node:assert/strict';
import {actions,activityForPlayer,availableActions,communityDaysThisWeek,currentBalanceVersion,effects,player,move,reason,score,createEnvironment} from '../lib/game.ts';
import {actionPreview} from '../lib/game-view.ts';
import {choiceBenefit,choiceTerms} from '../lib/place-invitations.ts';

const game=(n=1,balanceVersion=1)=>({code:'BALNCE',rulesVersion:2,balanceVersion,mode:'hotseat',players:Array.from({length:n},(_,i)=>({...player(`Seat ${i+1}`,balanceVersion),id:`seat${i}`})),turn:0,turnsTaken:0,round:1,maxRounds:8,status:'playing',log:[],seen:[],event:0,members:{},host:'test',...createEnvironment()});
const action=id=>actions.find(a=>a.id===id);
const act=(g,id)=>{const p=g.players[g.turn];assert.equal(reason(p,id,g),'',`${id} in week ${g.round}`);move(g,'visit',action(id).place);move(g,id);};
const stats=p=>Object.fromEntries(['cash','energy','joy','hours','skill','job','social','craft','legacy'].map(k=>[k,p[k]]));
assert.equal(currentBalanceVersion,1);
assert.equal(player('Unmarked save').balanceVersion,undefined);
assert.equal(player('New room',currentBalanceVersion).balanceVersion,1);
assert.equal(player('Unknown version',999).balanceVersion,undefined);

// Every changed activity keeps its time and upfront price; new values are opt-in.
const changed=['home_meal','cafe_barista','park_read','market_cook','market_resell','gym_sauna','garden_rest','arcade_shift','community_organize'];
for(const id of changed){
 const a=action(id),old=player('Old'),p=player('New',1),modern=activityForPlayer(p,a);
 assert.strictEqual(activityForPlayer(old,a),a);
 delete p.rulesVersion;assert.strictEqual(activityForPlayer(p,a),a,'Classic ignores the additive marker');
 assert.equal(modern.time,a.time);assert.equal(modern.cost,a.cost);
}

// Exhaustively exercise the eight formerly dominated pairs over the original playtest grid.
let comparisons=0;const tradeoffs=[];
for(const [id,alternatives] of [
 ['cafe_barista',['work_short']],['arcade_shift',['market_shift']],['market_resell',['gym_desk']],
 ['park_read',['rest','rest']],['garden_rest',['rest','rest']],['gym_sauna',['gym_yoga','gym_yoga']],
 ['home_meal',['gym_yoga']],['market_cook',['cafe_break','cafe_break']]
]){
 let advantages=0,alternativeAdvantages=0;
 for(let round=1;round<=8;round++)for(const energy of [0,12,26,50,80,100])for(const joy of [0,50,90,99,100])for(const job of [0,3]){
  const a=game();a.round=round;Object.assign(a.players[0],{cash:2000,social:4,skill:6,job,energy,joy});
  const b=structuredClone(a);if(reason(a.players[0],id,a))continue;
  act(a,id);let legal=true;for(const alternative of alternatives){if(reason(b.players[0],alternative,b)){legal=false;break;}act(b,alternative);}if(!legal)continue;
  const x=stats(a.players[0]),y=stats(b.players[0]);if(Object.keys(x).some(k=>x[k]>y[k]))advantages++;if(Object.keys(x).some(k=>y[k]>x[k]))alternativeAdvantages++;comparisons++;
 }
 assert.ok(advantages>0,`${id} needs a situational advantage over ${alternatives}`);
 if(id!=='market_resell')assert.ok(alternativeAdvantages>0,`${id} must retain a tradeoff`);
 tradeoffs.push({id,advantages,alternativeAdvantages});
}
// The resale advantage requires contacts and working capital; front-desk work does not.
for(const initial of [{social:1,cash:100},{social:2,cash:29}]){const g=game(),p=Object.assign(g.players[0],initial);assert.ok(reason(p,'market_resell',g));assert.equal(reason(p,'gym_desk',g),'');}

// All legal, marked preview outcomes agree with authoritative mutations, including weather and caps.
let previews=0;
for(let round=1;round<=8;round++)for(const a of actions)for(const energy of [0,35,97])for(const joy of [0,93,100])for(const repeat of [false,true]){
 const g=game(2),p=g.players[0];g.round=round;Object.assign(p,{cash:3000,skill:4,craft:4,social:12,job:1,joy,energy,place:a.place});
 if(a.story)p.stories[a.story]=a.stage-1;
 if(repeat)p.communityWork={round,count:1};
 if(reason(p,a.id,g))continue;
 const before=structuredClone(p),preview=actionPreview(p,a.id,g);move(g,a.id);
 for(const key of ['cash','energy','joy','skill','social','craft','legacy'])assert.equal(p[key],before[key]+preview[key],`${round}/${a.id}/${repeat}/${key}`);
 assert.equal(p.hours,before.hours+preview.hours);assert.ok(p.energy>=0&&p.energy<=100);assert.ok(p.joy>=0&&p.joy<=100);previews++;
}
// Stronger winter meals consume only the recovery actually granted, preserving subsequent previews.
{
 const g=game();g.round=7;const p=g.players[0];p.energy=64;act(g,'home_meal');assert.equal(p.energy,100);assert.equal(p.weatherUsage.recovery,2);
 const restored=JSON.parse(JSON.stringify(g));assert.deepEqual(actionPreview(restored.players[0],'cafe_break',restored),actionPreview(p,'cafe_break',g));
}

// Final-week story gates never promise a ninth week, including original v2 saves.
for(const balanceVersion of [undefined,1])for(const round of [7,8]){
 const g=game(1,balanceVersion);if(balanceVersion===undefined)delete g.players[0].balanceVersion;g.round=round;
 act(g,'story_eli_1');assert.equal(reason(g.players[0],'story_eli_2',g),'This neighbor has other plans just now');
}
// First funded day and later lighter setup work remain transparent before acting.
{
 const g=game(),p=g.players[0];p.social=6;
 const first=actionPreview(p,'community_organize',g);assert.deepEqual([first.cash,first.energy,first.joy,first.social],[510,-14,5,1]);
 act(g,'community_organize');assert.equal(communityDaysThisWeek(p,g),1);
 const repeated=actionPreview(p,'community_organize',g);assert.deepEqual([repeated.cash,repeated.energy,repeated.joy,repeated.social],[280,-8,0,0]);
 const a=availableActions(p,'COMMUNITY').find(a=>a.id==='community_organize');assert.match(a.desc,/One funded day per week/);assert.match(a.desc,/\$280, 8 energy, no extra happiness or connections/);
 assert.equal(choiceBenefit(p,a,g),'$280 income');assert.equal(choiceTerms(p,a,g).cash,'+$280 income');assert.match(choiceTerms(p,a,g).requirements,/8 energy/);
 const restored=JSON.parse(JSON.stringify(g));assert.deepEqual(actionPreview(restored.players[0],a.id,restored),repeated);
 const blocked=structuredClone(g);blocked.players[0].energy=7;const before=JSON.stringify(blocked);assert.throws(()=>move(blocked,a.id),/Rest/);assert.equal(JSON.stringify(blocked),before);
 act(g,'community_organize');act(g,'community_organize');assert.equal(communityDaysThisWeek(p,g),3);move(g,'end');assert.equal(communityDaysThisWeek(p,g),0);
 assert.equal(actionPreview(p,'community_organize',g).cash,525);assert.equal(actionPreview(p,'community_organize',g).social,1);
}
// Usage belongs to each player, follows the week, survives reloads, and does not depend on weather.
for(const n of [1,2,3,4])for(const seasonal of [false,true]){
 const g=game(n);if(!seasonal){delete g.environmentVersion;delete g.weatherSchedule;}for(const p of g.players)p.social=6;
 let turns=0;
 while(g.status==='playing'){
  const p=g.players[g.turn];assert.equal(communityDaysThisWeek(p,g),0);assert.equal(actionPreview(p,'community_organize',g).cash,420+15*p.social);
  act(g,'community_organize');assert.equal(actionPreview(p,'community_organize',g).cash,280);act(g,'community_organize');act(g,'rest');act(g,'rest');
  Object.assign(g,JSON.parse(JSON.stringify(g)));move(g,'end');turns++;
 }
 assert.equal(turns,n*8);assert.equal(g.round,8);
}
// Existing unmarked v2 and classic saves retain every original activity value and no usage tracking.
for(const version of [undefined,2])for(const seasonal of [false,true]){
 const g=game(1,undefined),p=g.players[0];delete g.balanceVersion;delete p.balanceVersion;g.rulesVersion=version;p.rulesVersion=version;
 if(!seasonal){delete g.environmentVersion;delete g.weatherSchedule;}
 Object.assign(p,{social:12,cash:3000,energy:70,joy:40});
 assert.equal(effects(p,action('gym_sauna'),g).energy,30);assert.equal(effects({...p,energy:0},action('gym_sauna'),g).energy,48);
 assert.equal(effects(p,action('market_resell'),g).cash,220);
 if(version===2){act(g,'community_organize');assert.equal(actionPreview(p,'community_organize',g).cash,615);assert.equal(p.communityWork,undefined);}
}

// Regression: the former three-button policy still clears the cozy target, with less progress
// than purposeful career/creative/story paths. This is a deterministic example, not an optimizer.
const policy=g=>{const p=g.players[g.turn],ids=[];if(p.energy<18)ids.push('rest');if(p.social<6)ids.push('garden_tend');ids.push('community_organize');if(p.hours===1&&p.social<24)ids.push('garden_tend');ids.push('rest','library_read');return ids.find(id=>!reason(p,id,g));};
for(const n of [1,2,3,4]){
 const g=game(n);while(g.status==='playing'){const p=g.players[g.turn];while(p.hours)act(g,policy(g));move(g,'end');}
 for(const p of g.players){assert.equal(score(p),71);assert.equal(p.cash,4165);assert.equal(p.social,16);assert.equal(p.joy,96);}
}
// Legal random campaigns guard against energy locks and resource-bound regressions.
let seed=694201;const rnd=()=>{seed=(Math.imul(1664525,seed)+1013904223)>>>0;return seed/4294967296;};let randomActions=0;
for(let n=1;n<=4;n++)for(let sample=0;sample<100;sample++){
 const g=game(n);let turns=0;const seen=new Set();
 while(g.status==='playing'){
  const p=g.players[g.turn],key=`${g.round}/${p.id}`;assert.ok(!seen.has(key));seen.add(key);
  while(p.hours&&rnd()>.06){const legal=actions.filter(a=>!reason(p,a.id,g));assert.ok(legal.length);const a=legal[Math.floor(rnd()*legal.length)];act(g,a.id);randomActions++;assert.ok(p.energy>=0&&p.energy<=100);assert.ok(p.joy>=0&&p.joy<=100);assert.ok(score(p)>=0&&score(p)<=100);}
  if(p.hours===0)for(const a of actions)assert.ok(reason(p,a.id,g));move(g,'end');turns++;
 }
 assert.equal(turns,n*8);assert.equal(g.round,8);
}
console.log(`PASS: balance opt-in; ${comparisons} tradeoff comparisons; ${previews} authoritative preview outcomes; weekly/reload/player-isolated setup work; original save behavior; 1–4 seat routine now 71; 400 seeded campaigns/${randomActions} activities.`);
console.log(JSON.stringify(tradeoffs));
