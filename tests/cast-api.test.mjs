import test from 'node:test';
import {motiveScene} from '../lib/character-motives.ts';
import {castPeople} from '../lib/character-cast.ts';
import {createD1Double} from './d1-double.mjs';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import ts from 'typescript';
const rows=new Map();
globalThis.crosswalkTestDb=createD1Double(rows).db;
const source=readFileSync(new URL('../app/api/game/route.ts',import.meta.url),'utf8').replace("import {db} from '@/lib/db';",'const db=()=>globalThis.crosswalkTestDb;').replaceAll(/'@\/lib\/([^']+)'/g,(_,name)=>JSON.stringify(new URL('../lib/'+name+'.ts',import.meta.url).href));
const js=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ESNext}}).outputText;
const {GET,POST}=await import('data:text/javascript;base64,'+Buffer.from(js).toString('base64'));
const post=async(body,cookie)=>{const r=await POST(new Request('https://test.invalid/api/game',{method:'POST',headers:{'Content-Type':'application/json',Origin:'https://test.invalid',...(cookie?{Cookie:cookie}:{})},body:JSON.stringify(body)}));const data=await r.json(),nextCookie=r.headers.get('set-cookie')?.split(';')[0]||cookie;if(r.status===428&&data.sessionRequired&&nextCookie!==cookie)return post(body,nextCookie);return{status:r.status,body:data,cookie:nextCookie};};
const get=async(code,cookie)=>{const r=await GET(new Request('https://test.invalid/api/game?code='+code,{headers:cookie?{Cookie:cookie}:{}}));return{status:r.status,body:await r.json()};};

test('original D1 backend preserves cast schedules, seat privacy and exact action retries', async()=>{
 const host=await post({op:'create',mode:'online',name:'Host',castVersion:999,historyVersion:999,motivesVersion:999,motives:{bonds:{forged:{trust:4}}},cast:{schedule:{}}});
 assert.equal(host.status,200);const code=host.body.code;
 assert.equal(host.body.motivesVersion,1);assert.deepEqual(host.body.players[0].motives.bonds,{});assert.equal(host.body.castVersion,1);assert.equal(host.body.historyVersion,1);assert.deepEqual(Object.keys(host.body.cast.schedule),['1']);assert.equal(host.body.lifeSeed,undefined);
 const saved=JSON.parse(rows.get(code).state);assert.equal(Object.keys(saved.cast.schedule).length,8);
 const guest=await post({op:'join',code,name:'Guest'});assert.equal(guest.status,200);
 let room=(await post({op:'start',code,version:guest.body.version,requestId:'start-cast'},host.cookie)).body;
 const npc=castPeople(room,room.players[0])[0];assert.ok(npc);
 room=(await post({op:'move',code,version:room.version,requestId:'cast-visit',action:'visit',destination:npc.spot},host.cookie)).body;
 const choice=castPeople(room,room.players[0]).find(p=>p.id===npc.id).choices.find(c=>c.available);assert.ok(choice);
 const request={op:'move',code,version:room.version,requestId:'cast-choice',action:choice.id};
 const applied=await post(request,host.cookie);assert.equal(applied.status,200);assert.equal(applied.body.players[0].cast.receipts.length,1);
 const retry=await post(request,host.cookie);assert.equal(retry.status,200);assert.deepEqual(retry.body,applied.body);
 const other=(await get(code,guest.cookie)).body;assert.equal(other.players[0].cast,undefined);assert.equal(other.players[0].castRedacted,true);assert.ok(other.players[1].cast);
 assert.ok(!JSON.stringify(other).includes(applied.body.players[0].cast.receipts[0].outcome));assert.deepEqual(other.cast,applied.body.cast);
 const stranger=(await get(code)).body;assert.equal(stranger.cast,undefined);assert.equal(stranger.players[0].cast,undefined);
 room=(await post({op:'move',code,version:applied.body.version,requestId:'host-end',action:'end'},host.cookie)).body;
 room=(await post({op:'move',code,version:room.version,requestId:'guest-end',action:'end'},guest.cookie)).body;
 assert.equal(room.round,2);assert.deepEqual(Object.keys(room.cast.schedule),['2']);assert.deepEqual(room.cast.schedule[2],saved.cast.schedule[2]);
 assert.deepEqual(JSON.parse(rows.get(code).state).cast.schedule,saved.cast.schedule);
});

test('original D1 backend does not add cast data to existing unmarked saves on read, join or settlement',async()=>{
 const host=await post({op:'create',mode:'online',name:'Existing host'});const code=host.body.code;
 const saved=JSON.parse(rows.get(code).state);delete saved.historyVersion;delete saved.castVersion;delete saved.cast;delete saved.motivesVersion;for(const p of saved.players){delete p.cast;delete p.motives;}
 const bytes=JSON.stringify(saved);rows.get(code).state=bytes;
 const restored=await get(code,host.cookie);assert.equal(restored.status,200);assert.equal(rows.get(code).state,bytes);assert.equal(restored.body.castVersion,undefined);assert.equal(restored.body.historyVersion,undefined);assert.equal(restored.body.motivesVersion,undefined);assert.equal(restored.body.players[0].motives,undefined);
 const guest=await post({op:'join',code,name:'Existing guest'});assert.equal(guest.status,200);assert.ok(guest.body.players.every(p=>p.cast===undefined));
 let room=(await post({op:'start',code,version:guest.body.version,requestId:'legacy-start'},host.cookie)).body;
 room=(await post({op:'move',code,version:room.version,requestId:'legacy-end',action:'end'},host.cookie)).body;
 assert.equal(room.castVersion,undefined);assert.equal(room.cast,undefined);assert.ok(room.players.every(p=>p.cast===undefined));
 const persisted=JSON.parse(rows.get(code).state);assert.equal(persisted.castVersion,undefined);assert.equal(persisted.cast,undefined);assert.ok(persisted.players.every(p=>p.cast===undefined));
});


test('original D1 backend protects versioned motive exchanges, retries and other-seat privacy',async()=>{
 const host=await post({op:'create',mode:'online',name:'Motive host',motivesVersion:999});
 const code=host.body.code;assert.equal(host.body.motivesVersion,1);
 const guest=await post({op:'join',code,name:'Motive guest'});
 let room=(await post({op:'start',code,version:guest.body.version,requestId:'motive-start'},host.cookie)).body;
 assert.ok(room.players[0].motives);assert.equal(room.players[1].motives,undefined);
 const npc=castPeople(room,room.players[0])[0];
 room=(await post({op:'move',code,version:room.version,requestId:'motive-visit',action:'visit',destination:npc.spot},host.cookie)).body;
 const intro=castPeople(room,room.players[0]).find(c=>c.id===npc.id).choices.find(c=>c.available);
 room=(await post({op:'move',code,version:room.version,requestId:'motive-intro',action:intro.id},host.cookie)).body;
 const choice=motiveScene(room,room.players[0],npc.id).choices.find(c=>c.key==='press');
 const request={op:'move',code,version:room.version,requestId:'motive-pressure',action:choice.id};
 const applied=await post(request,host.cookie),replay=await post(request,host.cookie);
 assert.equal(applied.status,200);assert.deepEqual(replay.body,applied.body);assert.equal(applied.body.players[0].motives.receipts.length,1);
 const other=(await get(code,guest.cookie)).body;
 assert.equal(other.players[0].motives,undefined);assert.equal(other.players[0].castRedacted,true);assert.ok(other.players[1].motives);
 assert.ok(!JSON.stringify(other).includes(applied.body.players[0].motives.receipts[0].outcome));
 assert.equal((await get(code)).body.players[0].motives,undefined);
 const persisted=JSON.parse(rows.get(code).state),saved=JSON.stringify(persisted.cast.schedule);
 const reload=(await get(code,host.cookie)).body;assert.deepEqual(reload.players[0].motives,applied.body.players[0].motives);
 assert.equal(JSON.stringify(JSON.parse(rows.get(code).state).cast.schedule),saved);
});
