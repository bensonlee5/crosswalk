import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
import {pathToFileURL} from 'node:url';
// Runs beside the prepared asset or after copying into tests/; an explicit override is optional.
const integrated=new URL('../lib/weather.ts',import.meta.url);
const moduleUrl=process.env.CROSSWALK_WEATHER_MODULE?pathToFileURL(process.env.CROSSWALK_WEATHER_MODULE):existsSync(integrated)?integrated:new URL('./weather.ts',import.meta.url);
const {weatherSchedule,createEnvironment,getWeather,nextWeather,campaignWeather,weatherEffect,consumeWeather,currentWeatherUsage,seasonalStoryText,seasonalOpportunity}=await import(moduleUrl);
const regions=['alder','saffron','glasssteppe','pelagia','embermesa'];
const names={alder:'Alder Quay',saffron:'Saffron Reach',glasssteppe:'Glasssteppe',pelagia:'Pelagia',embermesa:'Ember Mesa'};
const player=(region)=>({joy:40,energy:70,...(region?{world:{version:1,region}}:{})});
const game=(round=1,seed=42)=>({code:`LOCALW${seed}`,round,lifeVersion:1,lifeSeed:seed,rulesVersion:2,...createEnvironment(),players:regions.map(player),turn:0});
const baseTypes=['sun','rain','sun','heat','sun','rain','snow','cold'];
const baseLabels=['Mild spring sun','Steady spring rain','Clear summer warmth','Summer hot spell','Crisp autumn sun','Windy autumn showers','Light winter snow','Clear winter cold'];
const actions={walk:{id:'rest',joy:5,energy:22},run:{id:'park_run',joy:12,energy:-8},cafe:{id:'cafe_break',joy:8,energy:8},cozy:{id:'home_reset',joy:2,energy:10}};
let conditionsChecked=0;

// A marker is required. Classic, v2 and pre-world life rooms retain the frozen schedule.
for(const lifeVersion of [undefined,1]){
 const g=game();g.lifeVersion=lifeVersion;g.players=g.players.map(()=>player());
 const before=JSON.stringify(g);
 assert.deepEqual(campaignWeather(g).map(w=>w.type),baseTypes);
 assert.deepEqual(campaignWeather(g).map(w=>w.label),baseLabels);
 assert.deepEqual(campaignWeather(g).map(w=>w.id),weatherSchedule);
 assert.ok(campaignWeather(g).every(w=>!('region' in w)&&!('atmosphere' in w)));
 assert.equal(JSON.stringify(g),before,'Forecast reads cannot mutate old rooms');
}
for(const badMarker of [{version:2,region:'alder'},{version:1,region:'unknown'},undefined]){
 const g=game(),p={...player(),world:badMarker};
 assert.equal(getWeather(g,p).label,baseLabels[0]);
}
for(const patch of [{environmentVersion:undefined},{rulesVersion:undefined},{rulesVersion:1}]){
 const g={...game(),...patch};assert.equal(getWeather(g),null);assert.equal(nextWeather(g),null);assert.deepEqual(campaignWeather(g),[]);
}
assert.equal(getWeather(null),null);assert.equal(nextWeather(undefined),null);
const custom={...game(),players:[player()],weatherSchedule:['winter-cold',...weatherSchedule.slice(1)]};
assert.equal(getWeather(custom).id,'winter-cold','Old rooms still honor saved custom schedule');

// Every climate stays seasonal, authored, deterministic, serialized and read-only.
for(const seed of [0,1,2,42,918273,-9,4294967295])for(const region of regions){
 const g=game(1,seed),p=player(region),before=JSON.stringify([g,p]);
 const forecast=campaignWeather(g,p);
 assert.equal(forecast.length,8);
 assert.deepEqual(forecast.map(w=>w.season),['spring','spring','summer','summer','autumn','autumn','winter','winter']);
 assert.deepEqual(forecast,campaignWeather(JSON.parse(JSON.stringify(g)),JSON.parse(JSON.stringify(p))));
 for(let week=1;week<=8;week++){
  g.round=week;
  const w=getWeather(g,p);assert.deepEqual(w,forecast[week-1]);assert.deepEqual(nextWeather(g,p),forecast[week]??null);
  assert.equal(w.region,region);assert.ok(weatherSchedule.includes(w.id));assert.ok(w.label.startsWith(names[region]));assert.ok(w.effectSummary.includes(names[region]));
  assert.ok(w.description.length>35);assert.ok(w.atmosphere);assert.equal(w.chapter,Math.ceil(week/2));assert.equal(w.chapterWeek,(week-1)%2+1);
  if(['saffron','pelagia','embermesa'].includes(region))assert.notEqual(w.type,'snow');
  if(region==='glasssteppe')assert.notEqual(w.type,'heat');
  conditionsChecked++;
 }
 g.round=1;assert.equal(JSON.stringify([g,p]),before);
 // Only region changes; returning cannot reroll the local forecast or consume a cap.
 p.world.region=regions[(regions.indexOf(region)+1)%regions.length];getWeather(g,p);p.world.region=region;
 assert.deepEqual(campaignWeather(g,p),forecast);assert.equal(p.weatherUsage,undefined);
}
assert.ok(new Set(Array.from({length:12},(_,seed)=>JSON.stringify(campaignWeather(game(1,seed),player('glasssteppe'))))).size>1,'Public room code influences the authored forecast');
// The API removes lifeSeed and lifeSchedule. Forecasts and gameplay must remain identical.
for(const code of ['LOCALW','OTHER1','ROOM42','123456'])for(const lifeSeed of [0,1,42,918273])for(let week=1;week<=8;week++)for(const region of regions){
 const server={...game(week),code,lifeSeed,lifeSchedule:[{private:true}]};
 server.players=[player(region)];server.turn=0;
 const client=JSON.parse(JSON.stringify(server));delete client.lifeSeed;delete client.lifeSchedule;
 const p=server.players[0],q=client.players[0];
 assert.deepEqual(getWeather(client),getWeather(server),'Public client forecast must match authoritative server weather');
 assert.deepEqual(nextWeather(client,q),nextWeather(server,p));
 assert.deepEqual(campaignWeather(client,q),campaignWeather(server,p));
 for(const a of Object.values(actions))assert.deepEqual(weatherEffect(q,a,client),weatherEffect(p,a,server),'Private life fields cannot affect an action preview');
 assert.deepEqual(campaignWeather({...server,lifeSeed:lifeSeed+1},p),campaignWeather(server,p),'Changing a secret seed does not change public weather');
}
for(const week of [3,4]){
 const g=game(week);assert.equal(getWeather(g,player('embermesa')).type,'heat');assert.notEqual(getWeather(g,player('glasssteppe')).type,'heat');
}

// Explicit affected player takes precedence over the turn player, including an unmarked one.
{
 const g=game(4);g.turn=4;
 const q=g.players[2],legacy=player();
 assert.equal(getWeather(g).region,'embermesa');assert.equal(getWeather(g,q).region,'glasssteppe');
 assert.equal(getWeather(g,legacy).region,undefined);assert.equal(getWeather(g,null).region,undefined);
 assert.equal(weatherEffect(q,actions.run,g).heatUsed,0);
 assert.equal(weatherEffect(g.players[4],actions.run,g).heatUsed,4);
 assert.equal(weatherEffect(legacy,actions.run,g).heatUsed,4,'Explicit old player uses old schedule');
 g.turn=2;assert.equal(weatherEffect(g.players[4],actions.run,g).heatUsed,4,'Heat is local even off turn');
 consumeWeather(g.players[4],actions.run,g);assert.equal(g.players[4].weatherUsage.heat,4);assert.equal(q.weatherUsage,undefined);
}

// Preview and application consume the same weekly budget, never a new budget on travel.
for(const type of ['sun','rain','heat','cold','snow']){
 const action=type==='sun'?actions.walk:type==='rain'?actions.cafe:type==='heat'?actions.run:actions.cozy;
 const slot=regions.flatMap(region=>campaignWeather(game(),player(region)).map(w=>({region,w}))).find(x=>x.w.type===type);
 const g=game(slot.w.week),p=player(slot.region);g.players=[p];g.turn=0;
 const key=type==='sun'||type==='rain'?'joy':type==='heat'?'heat':'recovery',limit=key==='joy'?4:8;
 for(let n=0;n<3;n++){
  p.joy=40;p.energy=70;
  const before=JSON.stringify(p),e=weatherEffect(p,action,g);
  assert.equal(JSON.stringify(p),before,'Preview is pure');
  const u=currentWeatherUsage(p,g);consumeWeather(p,action,g);
  assert.equal(p.weatherUsage.joy,u.joy+e.joyUsed);assert.equal(p.weatherUsage.heat,u.heat+e.heatUsed);assert.equal(p.weatherUsage.recovery,u.recovery+e.recoveryUsed);
 }
 assert.equal(p.weatherUsage[key],limit);assert.equal(weatherEffect(p,action,g).capReached,true);
 const usage=structuredClone(p.weatherUsage);
 p.world.region=regions.find(region=>region!==slot.region);getWeather(g,p);p.world.region=slot.region;
 assert.deepEqual(p.weatherUsage,usage);assert.equal(weatherEffect(p,action,g).capReached,true);
 const restored=JSON.parse(JSON.stringify({g,p}));assert.equal(weatherEffect(restored.p,action,restored.g).capReached,true);
 g.round++;assert.equal(currentWeatherUsage(p,g)[key],0,'Only a new week refreshes the budget');
}
{
 const g=game(1),p=g.players[0];p.joy=99;
 assert.equal(weatherEffect(p,{id:'rest',joy:0},g).joy,1);consumeWeather(p,{id:'rest',joy:0},g);assert.equal(p.weatherUsage.joy,1);
 p.joy=100;consumeWeather(p,{id:'rest',joy:0},g);assert.equal(p.weatherUsage.joy,1,'Unreceived bonuses consume no budget');
 const hot=player('embermesa');g.round=3;hot.weatherUsage={round:3,joy:0,heat:7,recovery:0};
 assert.equal(weatherEffect(hot,actions.run,g).requiredEnergy,9);consumeWeather(hot,actions.run,g);assert.equal(hot.weatherUsage.heat,8);
 hot.weatherUsage={round:3,joy:99,heat:99,recovery:99};assert.deepEqual(currentWeatherUsage(hot,g),{round:3,joy:4,heat:8,recovery:8});
}

// The frozen legacy text/effects are exact, including partial caps and out-of-turn effects.
for(let week=1;week<=8;week++){
 const g={...game(week),players:[player()]},p=g.players[0],w=getWeather(g);
 assert.equal(w.type,baseTypes[week-1]);assert.equal(w.label,baseLabels[week-1]);
 const e=weatherEffect(p,actions.run,g);
 assert.equal(e.energy,week===4?-4:0);assert.equal(e.requiredEnergy,week===4?12:8);
 if(week===4)assert.equal(e.summary,'Hot spell: 4 extra energy required (4 of 8 remains this week). Indoor alternative: read at the library.');
 if(week>=7)assert.equal(weatherEffect(p,actions.cozy,g).summary,'Cozy winter recovery: +4 energy (4 of 8 remains this week).');
}
const old=game(7);old.players=[player()];
assert.match(seasonalStoryText(old,{id:'eli',chapters:[{text:'Original'}]},1),/greenhouse/);
assert.equal(seasonalOpportunity(old,{title:'Old',text:'Old'}).title,'Greenhouse harvest supper');

console.log(`PASS: ${conditionsChecked} regional forecast conditions; explicit-player authority; legacy schedule/text; local action costs/recovery; caps survive travel/reload; no mutations during reads.`);
