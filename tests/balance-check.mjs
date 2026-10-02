#!/usr/bin/env node
// Reproducible engine-only balance smoke checks. Not an optimizer or proof of optimal balance.
// Usage: node balance-check.mjs /absolute/path/to/lib/game.ts [output.json]
import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const argumentsWithoutFlags=process.argv.slice(2).filter(arg=>arg!=='--seasonal');
const source=path.resolve(argumentsWithoutFlags[0]||new URL('../lib/game.ts',import.meta.url).pathname);
const {player,move,actions,score,reason,pathPoints,projectGoal,projectProgress,opportunity,createEnvironment}=await import(pathToFileURL(source));
const seasonal=process.argv.includes('--seasonal');
const sourceHash=createHash('sha256').update(fs.readFileSync(source)).digest('hex');
const action=id=>actions.find(a=>a.id===id);
function game(n=2){const ps=Array.from({length:n},(_,i)=>player(`Seat ${i+1}`));return{code:'TEST01',mode:'hotseat',host:'test',members:{},players:ps,status:'playing',round:1,turn:0,maxRounds:8,log:[],seen:[],event:0,rulesVersion:2,turnsTaken:0,...(seasonal?createEnvironment():{})};}
function act(g,id){const p=g.players[g.turn];const why=reason(p,id,g);if(why)return why;move(g,'visit',action(id).place);move(g,id);return'';}
function summary(p){return{score:score(p),cash:p.cash,joy:p.joy,energy:p.energy,skill:p.skill,job:p.job,social:p.social,craft:p.craft,legacy:p.legacy,paths:pathPoints(p)};}
function simulate(name,weeks,{n=2,allowBlocked=false}={}){
 const g=game(n),p=g.players[0],history=[];let minimumCash=p.cash;
 while(g.status==='playing'){
  const q=g.players[g.turn];if(q!==p){move(g,'end');continue;}
  const entry={week:g.round,start:summary(p),actions:[]};
  for(const id of weeks[g.round-1]){const why=act(g,id);entry.actions.push(why?`${id}: BLOCKED (${why})`:id);if(why&&!allowBlocked)throw Error(`${name}, week ${g.round}, ${id}: ${why}`);minimumCash=Math.min(minimumCash,p.cash);}
  entry.unusedHours=p.hours;move(g,'end');entry.end=summary(p);minimumCash=Math.min(minimumCash,p.cash);history.push(entry);
 }
 return{name,players:n,...summary(p),minimumCash,history};
}
const career=[['study','study','work'],['apply','work_mentor','work','library_read'],['work_mentor','apply','work','library_read'],['work_mentor','work_mentor','work'],['apply','work','work','rest'],['work','work','rest','library_read'],['work','work','rest','library_read'],['work','work','rest','library_read']];
const community=[['garden_tend','garden_tend','garden_tend','garden_tend','garden_tend','garden_tend'],['community_organize','community_organize','volunteer'],['community_organize','community_organize','rest','garden_tend'],['community_organize','community_organize','rest','garden_tend'],['community_organize','community_organize','garden_project','garden_tend'],['community_organize','rest','community_organize','garden_tend'],['community_organize','community_organize','rest','garden_project'],['community_organize','community_organize','rest','library_read']];
const creative1=[['creative_practice','creative_practice','creative_practice','creative_commission','rest'],['creative_practice','creative_practice','creative_practice','creative_commission','rest'],['creative_practice','creative_practice','creative_commission','rest','library_read'],...Array.from({length:5},()=>['creative_commission','creative_commission','rest','library_read'])];
const creative2=[['creative_practice','creative_practice','creative_practice'],['creative_practice','creative_practice','creative_commission'],['creative_practice','creative_practice','creative_commission'],['creative_practice','creative_commission','rest','story_mina_1'],['creative_commission','creative_commission','rest','story_mina_2'],['creative_commission','creative_commission','rest','story_mina_3'],['creative_commission','creative_commission','rest','library_read'],['creative_commission','creative_commission','rest','library_read']];
const mixed=[['study','work','story_mina_1','garden_tend'],['study','work','story_mina_2','garden_project'],['apply','work','story_mina_3','story_eli_1','rest'],['work','work','story_eli_2','garden_project'],['work','work','story_eli_3','story_jo_1'],['community_organize','community_organize','story_jo_2','rest'],['community_organize','community_organize','story_jo_3','rest'],['community_organize','community_organize','rest','garden_tend']];
const communityLegacy=[['story_mina_1','story_eli_1','story_jo_1','garden_tend','garden_tend','garden_tend'],['community_organize','story_mina_2','story_eli_2','story_jo_2','garden_project'],['community_organize','story_mina_3','story_eli_3','story_jo_3','garden_project'],['community_organize','community_organize','rest','garden_project'],['community_organize','community_organize','rest','garden_project'],['community_organize','community_organize','rest','garden_tend'],['community_organize','community_organize','rest','garden_tend'],['community_organize','community_organize','library_read','garden_tend']];
const creativeLegacy2=[['creative_practice','creative_practice','creative_practice'],['creative_practice','creative_practice','creative_commission'],['creative_practice','creative_practice','creative_commission'],['creative_practice','creative_commission','story_mina_1','story_eli_1'],['creative_commission','rest','story_mina_2','story_eli_2','story_jo_1'],['creative_commission','story_mina_3','story_eli_3','story_jo_2','garden_project'],['creative_commission','creative_commission','story_jo_3','garden_project'],['rest','creative_commission','creative_commission','garden_project']];
const repeats={
 workRepeat:Array.from({length:8},()=>['work','work','work']),
 restRepeat:Array.from({length:8},()=>Array(6).fill('rest')),
 tendRepeat:Array.from({length:8},()=>Array(6).fill('garden_tend')),
 courierRepeat:Array.from({length:8},()=>['transit_courier','transit_courier','rest','transit_courier','rest','library_read']),
 contractRush:[['career_network','career_network','career_contract','career_contract'],...Array.from({length:7},()=>['career_contract','career_contract','rest','garden_tend'])],
};
const candidates={career,community,creative:action('creative_practice').time===2?creative2:creative1,mixed,communityLegacy};
if(action('creative_practice').time===2)candidates.creativeLegacy=creativeLegacy2;
const benchmarks=Object.entries(candidates).map(([name,schedule])=>simulate(name,schedule));
const degenerateRepeats=Object.entries(repeats).map(([name,schedule])=>simulate(name,schedule,{allowBlocked:true}));
const projectTests=[];
for(let n=1;n<=4;n++)for(const help of ['everyone','one-player']){
 const g=game(n);let completeWeek,completionCash,participants,duplicateBlocked=0;
 while(g.status==='playing'){
  const p=g.players[g.turn];if(!g.project?.completed&&(help==='everyone'||p===g.players[0])){
   const before=g.players.map(q=>q.cash);assert.equal(act(g,'garden_project'),'');
   const repeatReason=reason(p,'garden_project',g);assert.ok(repeatReason);duplicateBlocked++;
   if(g.project.completed){completeWeek=g.round;completionCash=g.players.map((q,i)=>q.cash-before[i]);participants=g.players.map(q=>g.project.contributions[q.id]||0);}
  }
  move(g,'end');
 }
 assert.equal(completeWeek,help==='everyone'?2:2*n);assert.equal(projectProgress(g),projectGoal(g));
 for(let i=0;i<n;i++){assert.equal(g.players[i].legacy,participants[i]?4:0);assert.equal(completionCash[i],participants[i]?180:0);}
 projectTests.push({players:n,help,goal:projectGoal(g),completeWeek,contributions:participants,payouts:completionCash,legacy:g.players.map(q=>q.legacy),repeatBlockedChecks:duplicateBlocked});
}
const opportunityTests=[];
for(let n=1;n<=4;n++){
 const g=game(n),claims=Array.from({length:n},()=>({weeks:[],cash:0,social:0,craft:0}));let doubleClaimChecks=0;
 while(g.status==='playing'){
  if(g.turnsTaken===0){const q=claims[g.turn],o=opportunity(g);q.weeks.push(g.round);q.cash+=o.earn;q.social+=o.social;q.craft+=o.craft;assert.equal(act(g,'weekly_opportunity'),'');assert.match(reason(g.players[g.turn],'weekly_opportunity',g),/Claimed/);doubleClaimChecks++;}
  move(g,'end');
 }
 assert.equal(doubleClaimChecks,8);assert.equal(claims.flatMap(q=>q.weeks).length,8);opportunityTests.push({players:n,claims,doubleClaimChecks});
}
const report={seasonal,engineSource:source,engineSHA256:sourceHash,generatedAt:new Date().toISOString(),practiceTime:action('creative_practice').time,method:'Hand-designed deterministic 8-week schedules, real engine reason + visit + move + end. Benchmark opponent passes, no opportunities. Not an optimizer or proof of optimal balance. Project/opportunity tests cover supported 1–4 players.',benchmarks,degenerateRepeats,projectTests,opportunityTests};
if(argumentsWithoutFlags[1])fs.writeFileSync(argumentsWithoutFlags[1],JSON.stringify(report,null,2)+'\n');
console.log(`Engine ${sourceHash}, practice time ${report.practiceTime}`);
for(const r of benchmarks)console.log(`${r.name}: ${r.score} points, $${r.cash}, joy ${r.joy}, legacy ${r.legacy}; min observed cash $${r.minimumCash}`);
for(const r of degenerateRepeats)console.log(`${r.name}: ${r.score} points, $${r.cash}, blocked actions ${r.history.flatMap(w=>w.actions).filter(x=>x.includes('BLOCKED')).length}`);
console.log('Project cases:',JSON.stringify(projectTests));
console.log('Opportunity cases:',JSON.stringify(opportunityTests));
console.log('PASS: all representative schedules legal; 8 project completion/reward cases and 32 opportunity/double-claim cases verified.');
