import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import ts from 'typescript';
import {player as modernPlayer,actions as allActions,move,reason,score} from '../lib/game.ts';
const source=readFileSync(new URL('../lib/game-view.ts',import.meta.url),'utf8').replaceAll("'./game'",JSON.stringify(new URL('../lib/game.ts',import.meta.url).href));
const code=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ESNext}}).outputText;
const {actionPreview,weekPreview,snapshotIsCurrent}=await import('data:text/javascript;base64,'+Buffer.from(code).toString('base64'));
const actions=allActions.filter(a=>!a.modernOnly);
const player=name=>{const p=modernPlayer(name);delete p.rulesVersion;return p;};
let tested=0;
for(const a of actions){const p=player('Preview test');Object.assign(p,{cash:1800,skill:4,social:10,job:1,energy:65,joy:95,place:a.place});const before=structuredClone(p),v=actionPreview(p,a.id);if(reason(p,a.id))continue;const g={players:[p,player('Other')],turn:0,round:1,maxRounds:8,status:'playing',log:[]};move(g,a.id);assert.equal(p.cash,before.cash+v.cash);assert.equal(p.hours,before.hours+v.hours);assert.equal(p.energy,before.energy+v.energy);assert.equal(p.joy,before.joy+v.joy);assert.equal(p.skill,before.skill+v.skill);assert.equal(p.social,before.social+v.social);tested++;}
for(const cash of [-500,0,505,2000])for(const joy of [0,3,99])for(const housing of [0,1]){const p=player('Bills');Object.assign(p,{cash,joy,housing,energy:95});const v=weekPreview(p);const g={players:[p,player('Other')],turn:0,round:1,maxRounds:8,status:'playing',log:[]};move(g,'end');assert.equal(p.cash,v.cash);assert.equal(p.joy,v.joy);assert.equal(p.energy,v.energy);}
assert.equal(snapshotIsCurrent({code:'ABC',version:7},{code:'ABC',version:6}),false);assert.equal(snapshotIsCurrent({code:'ABC',version:7},{code:'ABC',version:8}),true);assert.equal(snapshotIsCurrent({code:'ABC',version:7},{code:'ABC',version:7}),true);assert.equal(snapshotIsCurrent(null,{code:'ABC',version:0}),true);
const p=player('Travel');let g={players:[p],turn:0,round:1,maxRounds:8,status:'playing',log:[]};assert.throws(()=>move(g,'work'),/Visit/);move(g,'visit','WORK');assert.equal(p.hours,6);move(g,'work');assert.equal(p.cash,1420);p.cash=-50;p.hours=6;move(g,'work');assert.equal(p.cash,270);for(let n=0;n<8;n++)move(g,'end');assert.equal(g.status,'finished');assert.equal(score(player('A')),score(player('B')));
console.log('PASS: '+tested+' action previews; 24 bill previews; stale-response guard; free travel; location enforcement; overdraft recovery; 8-week finish; score ties');

assert.equal(actions.length,60);assert.equal(new Set(actions.map(a=>a.id)).size,60);
const locations=[...new Set(actions.map(a=>a.place))];assert.equal(locations.length,15);
for(const place of locations)assert.equal(actions.filter(a=>a.place===place).length,4);
for(const a of actions){
 const base=()=>Object.assign(player('Gate test'),{cash:2000,skill:4,social:10,energy:100,place:a.place});
 let p=base();p.hours=a.time-1;assert.match(reason(p,a.id),/time/);
 if(a.cost){p=base();p.cash=a.cost-1;assert.match(reason(p,a.id),/cash/);}
 if(a.needSkill){p=base();p.skill=a.needSkill-1;assert.match(reason(p,a.id),/skills/);}
 if(a.needSocial){p=base();p.social=a.needSocial-1;assert.match(reason(p,a.id),/connections/);}
 if(a.energy<0){p=base();p.energy=-a.energy-1;assert.match(reason(p,a.id),/Rest/);}
 p=base();p.place='INVALID';const g={players:[p],turn:0,round:1,maxRounds:8,status:'playing',log:[]};assert.throws(()=>move(g,a.id),/Visit/);
 if(a.skill){p=base();p.skill=5;const v=actionPreview(p,a.id);assert.equal(v.skill,1);p.skill=6;assert.match(reason(p,a.id),/six skills/);}
}
const legacy=Object.assign(player('Legacy'),{place:'HOME'});const legacyGame={players:[legacy],turn:0,round:1,maxRounds:8,status:'playing',log:[]};move(legacyGame,'visit','LIBRARY');move(legacyGame,'library_learn');assert.equal(legacy.skill,1);assert.equal(legacy.cash,1100);assert.equal(legacy.hours,3);
console.log('PASS: 15 locations × 4 actions; all costs/time/energy/skill/social gates; skill cap; old HOME save migration');
for(const [id,initial,expected] of [
 ['campus_bootcamp',{cash:1100,skill:0,energy:70},{cash:680,skill:2,energy:48,hours:3}],
 ['work_short',{cash:1100,job:2,energy:70},{cash:1401,energy:62,hours:5}],
 ['maker_commission',{cash:100,skill:3,social:2,energy:70},{cash:430,energy:52,hours:4}],
 ['career_contract',{cash:100,skill:2,social:4,energy:70},{cash:400,energy:54,hours:4}],
 ['gym_sauna',{cash:1100,energy:80,joy:95},{cash:1055,energy:100,joy:100,hours:4}],
 ['work_overtime',{cash:1100,energy:70,joy:2},{cash:1600,energy:44,joy:0,hours:3}]
]){const p=Object.assign(player('Outcome'),initial,{place:actions.find(a=>a.id===id).place});const g={players:[p],turn:0,round:1,maxRounds:8,status:'playing',log:[]};move(g,id);for(const[k,v]of Object.entries(expected))assert.equal(p[k],v,id+' '+k);}
console.log('PASS: explicit bootcamp, wage-scaled short shift, commission, referral, capped recovery and overtime outcomes');
