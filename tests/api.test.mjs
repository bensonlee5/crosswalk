import {createD1Double} from './d1-double.mjs';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import ts from 'typescript';
import {preStoryRoomFixture} from './legacy-fixtures.mjs';
const rows=new Map();
// Convert synthetic saved-room fixtures to their original pre-life/pre-world rules.
function originalSave(g){preStoryRoomFixture(g);for(const key of ['lifeVersion','lifeSeed','lifeSchedule','worldVersion'])delete g[key];for(const p of g.players){delete p.life;delete p.world;}}
globalThis.crosswalkTestDb=createD1Double(rows).db;
const source=readFileSync(new URL('../app/api/game/route.ts',import.meta.url),'utf8').replace("import {db} from '@/lib/db';",'const db=()=>globalThis.crosswalkTestDb;').replaceAll(/'@\/lib\/([^']+)'/g,(_,name)=>JSON.stringify(new URL('../lib/'+name+'.ts',import.meta.url).href));
const js=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ESNext}}).outputText;
const {GET,POST}=await import('data:text/javascript;base64,'+Buffer.from(js).toString('base64'));
const post=async(body,cookie)=>{const r=await POST(new Request('https://test.invalid/api/game',{method:'POST',headers:{'Content-Type':'application/json',Origin:'https://test.invalid',...(cookie?{Cookie:cookie}:{})},body:JSON.stringify(body)}));const data=await r.json(),nextCookie=r.headers.get('set-cookie')?.split(';')[0]||cookie;if(r.status===428&&data.sessionRequired&&nextCookie!==cookie)return post(body,nextCookie);return{status:r.status,body:data,cookie:nextCookie};};
const get=async(code,cookie)=>{const r=await GET(new Request('https://test.invalid/api/game?code='+code,{headers:cookie?{Cookie:cookie}:{}}));return{status:r.status,body:await r.json()};};
const host=await post({op:'create',mode:'online',name:'Host QA',storyVersion:999,economyVersion:0,cash:1});assert.equal(host.status,200);assert.equal(host.body.rulesVersion,2);const code=host.body.code;
assert.equal(host.body.storyVersion,1);assert.equal(host.body.economyVersion,1);assert.equal(host.body.story.version,1);assert.equal(host.body.sharedWorld.version,1);assert.equal(host.body.players[0].cash,6000);assert.equal(host.body.players[0].storyVersion,1);assert.equal(host.body.players[0].economyVersion,1);assert.equal(host.body.players[0].economyInitialized,true);assert.deepEqual(host.body.players[0].economyWork,{round:1,paidHours:0});
const publicView=await get(code);assert.equal(publicView.body.players[0].name,'Host QA');assert.equal(publicView.body.players[0].cash,undefined);assert.equal(publicView.body.members,undefined);
const guest=await post({op:'join',code,name:'Guest QA'});assert.equal(guest.status,200);assert.equal(guest.body.players.length,2);assert.equal(guest.body.isHost,false);assert.equal(guest.body.players[1].cash,6000);assert.equal(guest.body.players[1].storyVersion,1);assert.equal(guest.body.players[1].economyVersion,1);
let state=(await get(code,host.cookie)).body;
let started=await post({op:'start',code,version:state.version,requestId:'start'},host.cookie);assert.equal(started.status,200);state=started.body;
const move=async(cookie,action,destination,requestId=crypto.randomUUID(),version=state.version)=>{const r=await post({op:'move',code,version,requestId,action,destination},cookie);if(r.status===200)state=r.body;return r;};
assert.equal((await move(guest.cookie,'work')).status,403);
assert.equal((await move(host.cookie,'visit','COMMUNITY','go')).status,200);
const claimed=await move(host.cookie,'weekly_opportunity',undefined,'claim');assert.equal(claimed.status,200);const cash=state.players[0].cash,version=state.version;
assert.equal((await move(host.cookie,'weekly_opportunity',undefined,'claim',version-1)).status,200);assert.equal(state.players[0].cash,cash);assert.equal(state.version,version);
assert.equal((await move(host.cookie,'work',undefined,'stale',version-1)).status,409);
assert.equal((await move(host.cookie,'end')).status,200);assert.equal(state.turn,1);
assert.equal((await move(guest.cookie,'visit','COMMUNITY')).status,200);
assert.equal((await move(guest.cookie,'weekly_opportunity')).status,400);
assert.equal((await move(guest.cookie,'end')).status,200);assert.equal(state.round,2);assert.equal(state.turn,1);
const restored=await get(code,guest.cookie);assert.equal(restored.body.opportunityClaim.round,1);assert.equal(restored.body.mine[0],state.players[1].id);
const legacy=await post({op:'create',mode:'online',name:'Old host'});const old=JSON.parse(rows.get(legacy.body.code).state);originalSave(old);delete old.rulesVersion;for(const p of old.players)delete p.rulesVersion;rows.get(old.code).state=JSON.stringify(old);
const oldJoin=await post({op:'join',code:old.code,name:'Old guest'});assert.equal(oldJoin.body.players[1].rulesVersion,undefined);for(const p of oldJoin.body.players){assert.equal(p.cash,1100);assert.equal(p.storyVersion,undefined);assert.equal(p.economyVersion,undefined);assert.equal(p.story,undefined);assert.equal(p.economyWork,undefined);}
console.log('PASS: route integration with in-memory D1 double: create/join/privacy; seat ownership; duplicate-id no double reward; stale version409; shared opportunity race; rotated week/resume; old-lobby join compatibility');

// Seasonal data is authored by the server and survives normal persistence/idempotency.
assert.equal(host.body.environmentVersion,1);assert.equal(host.body.weatherSchedule.length,8);
assert.deepEqual(guest.body.weatherSchedule,host.body.weatherSchedule);
assert.equal(restored.body.environmentVersion,1);
const heatRoom=await post({op:'create',mode:'hotseat',names:['Heat QA'],environmentVersion:999,weatherSchedule:['winter-cold']});
assert.equal(heatRoom.body.environmentVersion,1);assert.equal(heatRoom.body.weatherSchedule[0],'spring-sun');
const heatCode=heatRoom.body.code;const heatState=JSON.parse(rows.get(heatCode).state);originalSave(heatState);heatState.round=4;heatState.players[0].place='TRANSIT';heatState.players[0].energy=100;rows.get(heatCode).state=JSON.stringify(heatState);
const weatherMove=async(action,requestId,version)=>post({op:'move',code:heatCode,version,requestId,action},heatRoom.cookie);
const heatFirst=await weatherMove('transit_courier','heat-once',0);assert.equal(heatFirst.status,200);assert.equal(heatFirst.body.players[0].energy,82);assert.equal(heatFirst.body.players[0].weatherUsage.heat,4);
const heatRepeat=await weatherMove('transit_courier','heat-once',0);assert.equal(heatRepeat.status,200);assert.equal(heatRepeat.body.players[0].energy,82);assert.equal(heatRepeat.body.players[0].weatherUsage.heat,4);
const heatStale=await weatherMove('transit_courier','heat-stale',0);assert.equal(heatStale.status,409);
const heatEnd=await weatherMove('end','heat-end',heatFirst.body.version);assert.equal(heatEnd.status,200);assert.equal(heatEnd.body.round,5);assert.equal(heatEnd.body.players[0].weatherUsage.heat,0);
const oldV2Room=await post({op:'create',mode:'hotseat',names:['V2 save']});const oldV2=JSON.parse(rows.get(oldV2Room.body.code).state);originalSave(oldV2);delete oldV2.environmentVersion;delete oldV2.weatherSchedule;oldV2.players[0].place='GARDEN';rows.get(oldV2.code).state=JSON.stringify(oldV2);
const resumedV2=await post({op:'move',code:oldV2.code,version:0,requestId:'old-v2-action',action:'garden_tend'},oldV2Room.cookie);assert.equal(resumedV2.status,200);assert.equal(resumedV2.body.players[0].joy,50);assert.equal(resumedV2.body.environmentVersion,undefined);assert.equal(resumedV2.body.players[0].weatherUsage,undefined);
console.log('PASS: seasonal API schedule persistence/server ownership; duplicate heat move spends cap once; stale move spends nothing; weekly cap reset; old v2 save retains no-weather rules');
