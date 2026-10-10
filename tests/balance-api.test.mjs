import {createD1Double} from './d1-double.mjs';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import ts from 'typescript';
import {preStoryRoomFixture} from './legacy-fixtures.mjs';
const rows=new Map();
globalThis.crosswalkBalanceTestDb=createD1Double(rows).db;
const source=readFileSync(new URL('../app/api/game/route.ts',import.meta.url),'utf8').replace("import {db} from '@/lib/db';",'const db=()=>globalThis.crosswalkBalanceTestDb;').replaceAll(/'@\/lib\/([^']+)'/g,(_,name)=>JSON.stringify(new URL('../lib/'+name+'.ts',import.meta.url).href));
const js=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ESNext}}).outputText;
const {GET,POST}=await import('data:text/javascript;base64,'+Buffer.from(js).toString('base64'));
const post=async(body,cookie)=>{const r=await POST(new Request('https://test.invalid/api/game',{method:'POST',headers:{'Content-Type':'application/json',Origin:'https://test.invalid',...(cookie?{Cookie:cookie}:{})},body:JSON.stringify(body)}));const data=await r.json(),nextCookie=r.headers.get('set-cookie')?.split(';')[0]||cookie;if(r.status===428&&data.sessionRequired&&nextCookie!==cookie)return post(body,nextCookie);return{status:r.status,body:data,cookie:nextCookie};};
const get=async(code,cookie)=>{const r=await GET(new Request('https://test.invalid/api/game?code='+code,{headers:cookie?{Cookie:cookie}:{}}));return{status:r.status,body:await r.json()};};
const read=code=>JSON.parse(rows.get(code).state);
const write=g=>{rows.get(g.code).state=JSON.stringify(g);};

// New room marker is server-owned, irrespective of caller-provided flags/counters.
for(const requested of [undefined,0,2,999]){
 const r=await post({op:'create',mode:'hotseat',names:['A','B'],balanceVersion:requested,communityWork:{round:1,count:999},players:[{balanceVersion:0}]});assert.equal(r.status,200);assert.equal(r.body.balanceVersion,1);
 for(const p of r.body.players){assert.equal(p.balanceVersion,1);assert.equal(p.communityWork,undefined);}
}
// Both host and later guest use the room's balance, including old classic/modern/seasonal lobbies.
for(const type of ['new','classic','v2','seasonal-v2']){
 const host=await post({op:'create',mode:'online',name:'Host'});let g=read(host.body.code);
 if(type!=='new'){preStoryRoomFixture(g);delete g.worldVersion;for(const p of g.players)delete p.world;delete g.lifeVersion;delete g.lifeSeed;delete g.lifeSchedule;for(const p of g.players)delete p.life;delete g.balanceVersion;for(const p of g.players)delete p.balanceVersion;}
 if(type==='classic'){delete g.rulesVersion;for(const p of g.players)delete p.rulesVersion;}
 if(type==='classic'||type==='v2'){delete g.environmentVersion;delete g.weatherSchedule;}
 write(g);const guest=await post({op:'join',code:g.code,name:'Guest',balanceVersion:999,communityWork:{round:1,count:999}});assert.equal(guest.status,200);
 assert.equal(guest.body.balanceVersion,type==='new'?1:undefined);
 for(const p of guest.body.players){assert.equal(p.balanceVersion,type==='new'?1:undefined);assert.equal(p.rulesVersion,type==='classic'?undefined:2);assert.equal(p.communityWork,undefined);assert.equal(p.cash,type==='new'?6000:1100);assert.equal(p.storyVersion,type==='new'?1:undefined);assert.equal(p.economyVersion,type==='new'?1:undefined);}
 assert.equal(guest.body.environmentVersion,type==='new'||type==='seasonal-v2'?1:undefined);
 assert.equal((await get(g.code,guest.cookie)).body.players[1].balanceVersion,type==='new'?1:undefined);
}
// Duplicate/stale requests cannot consume a second funded day or reset the counter.
const room=await post({op:'create',mode:'hotseat',names:['Host']});let g=read(room.body.code);preStoryRoomFixture(g);delete g.worldVersion;for(const p of g.players)delete p.world;delete g.lifeVersion;delete g.lifeSeed;delete g.lifeSchedule;for(const p of g.players)delete p.life;Object.assign(g.players[0],{social:6,place:'COMMUNITY'});write(g);
let state=(await get(g.code,room.cookie)).body;
const move=async(action,id,version=state.version)=>{const r=await post({op:'move',code:g.code,version,requestId:id,action,balanceVersion:0,communityWork:{round:1,count:0}},room.cookie);if(r.status===200)state=r.body;return r;};
assert.equal((await move('community_organize','first')).status,200);
assert.deepEqual(state.players[0].communityWork,{round:1,count:1});assert.equal(state.players[0].cash,1610);assert.equal(state.players[0].social,7);const first=structuredClone(state);
assert.equal((await move('community_organize','first',0)).status,200);assert.deepEqual(state,first);
assert.equal((await move('community_organize','stale',0)).status,409);assert.deepEqual((await get(g.code,room.cookie)).body,first);
assert.equal((await move('community_organize','setup')).status,200);assert.deepEqual(state.players[0].communityWork,{round:1,count:2});assert.equal(state.players[0].cash,1890);assert.equal(state.players[0].energy,48);assert.equal(state.players[0].joy,45);assert.equal(state.players[0].social,7);
assert.equal((await move('community_organize','setup-again')).status,200);assert.equal(state.players[0].cash,2170);assert.equal(state.players[0].communityWork.count,3);const exhausted=structuredClone(state);
assert.equal((await move('community_organize','no-time')).status,400);assert.deepEqual((await get(g.code,room.cookie)).body,exhausted);
assert.equal((await move('end','next-week')).status,200);assert.equal(state.round,2);const before=state.players[0].cash;
assert.equal((await move('community_organize','new-first')).status,200);assert.equal(state.players[0].cash-before,525);assert.equal(state.players[0].social,8);assert.deepEqual(state.players[0].communityWork,{round:2,count:1});
assert.deepEqual((await get(g.code,room.cookie)).body,state);
console.log('PASS: server-authored balance marker; new/classic/pre-weather/seasonal lobby joins; forged flags ignored; funded/setup payouts; counter persistence; duplicate/stale/blocked move idempotency; next-week funded booking.');
