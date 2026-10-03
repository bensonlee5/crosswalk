import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import ts from 'typescript';
import {actions,player,move,reason,effects,opportunity,neighbors,projectProgress,createEnvironment} from '../lib/game.ts';
import {weatherSchedule,getWeather,nextWeather,campaignWeather,weatherEffect,weatherTags,currentWeatherUsage,seasonalStoryText} from '../lib/weather.ts';
const viewSource=readFileSync(new URL('../lib/game-view.ts',import.meta.url),'utf8').replaceAll("'./game.ts'",JSON.stringify(new URL('../lib/game.ts',import.meta.url).href));
const viewCode=ts.transpileModule(viewSource,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ESNext}}).outputText;
const {actionPreview}=await import('data:text/javascript;base64,'+Buffer.from(viewCode).toString('base64'));
const game=(n=2,round=1)=>({code:'WEATHR',rulesVersion:2,...createEnvironment(),mode:'hotseat',players:Array.from({length:n},(_,i)=>player('Seat '+i)),turn:0,turnsTaken:0,round,maxRounds:8,status:'playing',log:[],seen:[],event:0,members:{},host:'test'});
const action=id=>actions.find(a=>a.id===id);
const act=(g,id)=>{move(g,'visit',action(id).place);move(g,id);};
assert.equal(weatherSchedule.length,8);assert.deepEqual(campaignWeather(game()).map(w=>w.season),['spring','spring','summer','summer','autumn','autumn','winter','winter']);
assert.deepEqual(campaignWeather(game()).map(w=>w.type),['sun','rain','sun','heat','sun','rain','snow','cold']);
assert.equal(getWeather(game()).label,'Mild spring sun');assert.equal(nextWeather(game()).label,'Steady spring rain');assert.equal(nextWeather(game(1,8)),null);
assert.deepEqual(campaignWeather(JSON.parse(JSON.stringify(game()))),campaignWeather(game()));
assert.equal(campaignWeather(game()).filter(w=>w.timeSkip).length,4);
for(const round of [1,3,5,7])assert.equal(getWeather(game(1,round)).chapterWeek,1);
for(const round of [2,4,6,8])assert.equal(getWeather(game(1,round)).timeSkip,'');
for(const group of Object.values(weatherTags))for(const id of group)assert.ok(action(id),`Missing weather-tagged action ${id}`);
const fresh=createEnvironment();fresh.weatherSchedule[0]='winter-cold';assert.equal(createEnvironment().weatherSchedule[0],'spring-sun','Schedule copies must not mutate the campaign default');
{
 const g=game(1),p=g.players[0];for(let i=0;i<3;i++)act(g,'garden_tend');assert.equal(p.joy,74);assert.equal(p.weatherUsage.joy,4);assert.equal(weatherEffect(p,action('garden_tend'),g).capReached,true);assert.match(actionPreview(p,'garden_tend',g).weather.summary,/cap reached/);
 const before=p.weatherUsage.joy;act(g,'rest');assert.equal(p.weatherUsage.joy,before);
}
for(const round of [2,6]){
 const g=game(1,round),p=g.players[0];for(let i=0;i<3;i++)act(g,'cafe_break');assert.equal(p.joy,68);assert.equal(p.weatherUsage.joy,4);assert.equal(p.cash,1070);assert.equal(p.hours,3);assert.equal(effects(p,action('garden_tend'),g).weather.applies,false);
}
{
 const g=game(1,4),p=g.players[0];p.energy=100;const first=actionPreview(p,'transit_courier',g);assert.equal(first.energy,-18);assert.equal(first.weather.energy,-4);assert.equal(first.cash,150);assert.equal(first.hours,-1);
 act(g,'transit_courier');act(g,'transit_courier');assert.equal(p.energy,64);assert.equal(p.weatherUsage.heat,8);assert.equal(actionPreview(p,'transit_courier',g).energy,-14);act(g,'transit_courier');assert.equal(p.energy,50);
 assert.equal(reason(Object.assign(player('Exhausted'),{energy:17}),'transit_courier',g),'Needs 18 energy including the heat adjustment; rest first');
 const blocked=game(1,4);blocked.players[0].energy=17;move(blocked,'visit','TRANSIT');const before=JSON.stringify(blocked);assert.throws(()=>move(blocked,'transit_courier'),/18 energy/);assert.equal(JSON.stringify(blocked),before,'Denied heat action must not spend cash/time/cap');
 p.energy=14;assert.equal(reason(p,'transit_courier',g),'');
}
for(const round of [7,8]){
 const g=game(1,round),p=g.players[0];p.energy=0;for(let i=0;i<3;i++)act(g,'home_reset');assert.equal(p.energy,44);assert.equal(p.weatherUsage.recovery,8);assert.match(weatherEffect(p,action('home_reset'),g).summary,/cap reached/);
}
{
 const g=game(1,2),p=g.players[0];p.joy=99;act(g,'library_learn');assert.equal(p.joy,100);assert.equal(p.weatherUsage.joy,1,'Only granted weather joy consumes the cap');
 const capped=game(1,1);capped.players[0].joy=99;act(capped,'garden_tend');assert.equal(capped.players[0].joy,100);assert.equal(capped.players[0].weatherUsage.joy,0);
 const cozy=game(1,7);cozy.players[0].energy=85;act(cozy,'home_reset');assert.equal(cozy.players[0].energy,100);assert.equal(cozy.players[0].weatherUsage.recovery,3);
 const partial=game(1,4);partial.players[0].weatherUsage={round:4,joy:0,heat:7,recovery:0};assert.equal(effects(partial.players[0],action('transit_courier'),partial).requiredEnergy,15);act(partial,'transit_courier');assert.equal(partial.players[0].weatherUsage.heat,8);
}
{
 const g=game(2),p=g.players[0];act(g,'garden_tend');act(g,'garden_tend');const saved=JSON.parse(JSON.stringify(g));assert.equal(weatherEffect(saved.players[0],action('garden_tend'),saved).joy,0);move(g,'end');assert.equal(p.weatherUsage.joy,4);assert.equal(g.round,1);assert.equal(weatherEffect(g.players[1],action('garden_tend'),g).joy,2);move(g,'end');assert.equal(g.round,2);for(const q of g.players)assert.deepEqual(q.weatherUsage,{round:2,joy:0,heat:0,recovery:0});assert.equal(g.turn,1);assert.equal(getWeather(g).type,'rain');
}
for(const version of [undefined,2]){
 const g=game();g.rulesVersion=version;delete g.environmentVersion;delete g.weatherSchedule;if(!version)for(const p of g.players)delete p.rulesVersion;
 assert.equal(getWeather(g),null);assert.deepEqual(campaignWeather(g),[]);assert.equal(nextWeather(g),null);const p=g.players[0],before=p.joy;act(g,'garden_tend');assert.equal(p.joy-before,10);assert.equal(p.weatherUsage,undefined);
}
let previewChecks=0;
for(let round=1;round<=8;round++)for(const a of actions){
 const g=game(2,round),p=g.players[0];Object.assign(p,{cash:3000,skill:4,craft:4,social:12,job:1,joy:85,energy:70,place:a.place});if(a.story)p.stories[a.story]=a.stage-1;
 if(reason(p,a.id,g))continue;const before=structuredClone(p),preview=actionPreview(p,a.id,g);move(g,a.id);
 for(const key of ['cash','energy','joy','skill','social','craft'])assert.equal(p[key],before[key]+preview[key],`${round}/${a.id}/${key}`);
 assert.equal(p.hours,before.hours+preview.hours);assert.equal(p.legacy,before.legacy+preview.legacy);assert.ok(p.energy>=0&&p.energy<=100);assert.ok(p.joy>=0&&p.joy<=100);previewChecks++;
}
for(const count of [1,2,3,4]){
 const g=game(count);let turns=0;while(g.status==='playing'){const round=g.round;const p=g.players[g.turn];if(p.hours>=1)act(g,'garden_tend');move(g,'end');turns++;if(g.status==='playing'&&g.round!==round)assert.equal(g.turn,(g.round-1)%count);}assert.equal(turns,count*8);assert.equal(g.round,8);assert.equal(getWeather(g).id,'winter-cold');
}
for(let round=1;round<=8;round++){
 const g=game(1,round),base={...g};delete base.environmentVersion;delete base.weatherSchedule;
 const seasonal=opportunity(g),original=opportunity(base);for(const key of ['earn','joy','social','craft'])assert.equal(seasonal[key],original[key]);
}
{
 const g=game(1,7),p=g.players[0],eli=neighbors.find(n=>n.id==='eli');assert.match(seasonalStoryText(g,eli,3),/greenhouse/);assert.equal(reason(p,'story_eli_1',g),'');act(g,'story_eli_1');move(g,'end');act(g,'story_eli_2');assert.equal(p.stories.eli,2);
 const project=game(1,7);act(project,'garden_project');move(project,'end');const cash=project.players[0].cash;const v=actionPreview(project.players[0],'garden_project',project);act(project,'garden_project');assert.equal(projectProgress(project),2);assert.equal(project.project.completed,true);assert.equal(project.players[0].cash,cash+v.cash);assert.equal(project.players[0].legacy,4);
}
console.log(`PASS: ${previewChecks} seasonal action-preview outcomes; all8 authored conditions; explicit tags; joy/heat/recovery caps and clamp accounting; final energy gates; server-wide resets;1–4player order/finish; reload determinism; classic/v2 saves; unchanged opportunity rewards; winter story/project completion`);
