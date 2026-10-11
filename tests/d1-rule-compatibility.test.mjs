import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import ts from 'typescript';
import {createD1Double} from './d1-double.mjs';
import {clientSupportedRules} from '../lib/rule-compatibility.ts';

// Execute the actual fallback route and real SQLite CAS, replacing only the D1 binding.
const rows=new Map(),database=createD1Double(rows),caps=[...clientSupportedRules];
globalThis.crosswalkRulesD1=database.db;
const source=readFileSync(new URL('../app/api/game/route.ts',import.meta.url),'utf8')
 .replace("import {db} from '@/lib/db';",'const db=()=>globalThis.crosswalkRulesD1;')
 .replaceAll(/'@\/lib\/([^']+)'/g,(_,name)=>JSON.stringify(new URL('../lib/'+name+'.ts',import.meta.url).href));
const js=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ESNext}}).outputText;
const {GET,POST}=await import('data:text/javascript;base64,'+Buffer.from(js).toString('base64'));
async function post(body,cookie){
 const response=await POST(new Request('https://test.invalid/api/game',{method:'POST',headers:{'Content-Type':'application/json',Origin:'https://test.invalid',...(cookie?{Cookie:cookie}:{})},body:JSON.stringify(body)}));
 return{status:response.status,body:await response.json(),cookie:response.headers.get('set-cookie')?.split(';')[0]||cookie};
}
async function get(code,cookie,supported,extra=''){
 const query=supported===undefined?'':'&supportedRules='+encodeURIComponent(supported.join(','));
 const response=await GET(new Request('https://test.invalid/api/game?code='+code+query+extra,{headers:cookie?{Cookie:cookie}:{}}));
 return{status:response.status,body:await response.json()};
}
const bytes=code=>JSON.stringify(rows.get(code));
const saved=code=>JSON.parse(rows.get(code).state);
const replace=g=>{rows.get(g.code).state=JSON.stringify(g);};
function blocked(result,status=409){assert.equal(result.status,status,JSON.stringify(result.body));assert.equal(result.body.refreshRequired,true);assert.match(result.body.error,/refresh|latest|newer/i);assert.equal(result.body.players,undefined);assert.equal(result.body.mine,undefined);}
function noRng(body){assert.equal(body.actionIncidentRng,undefined);assert.equal(body.lifeSeed,undefined);assert.equal(body.lifeSchedule,undefined);assert.equal(body.members,undefined);assert.equal(body.host,undefined);assert.equal(body.seen,undefined);}
const create=(extra={})=>post({op:'create',mode:'online',name:'Owner',supportedRules:caps,...extra});

test('D1 create gates independently opt into incidents and careers, without legacy migration',async()=>{
 for(const actionIncidents of [undefined,false,true])for(const careerMode of [undefined,'venue']){
  const room=await create({actionIncidents,careerMode});assert.equal(room.status,200,JSON.stringify(room.body));
  const incidents=actionIncidents===true,careers=careerMode==='venue';
  assert.equal(room.body.actionIncidentsVersion,incidents?1:undefined);assert.equal(room.body.careerVersion,careers?1:undefined);assert.equal(room.body.financialRecoveryVersion,careers?1:undefined);
  assert.equal(!!room.body.players[0].actionIncidents,incidents);assert.equal(!!room.body.players[0].career,careers);assert.equal(!!room.body.players[0].finance,careers);noRng(room.body);
  assert.deepEqual(room.body.requiredRules,[...(incidents?['action-incidents-v1']:[]),...(careers?['venue-careers-v1']:[])]);
  const persisted=saved(room.body.code);assert.equal(!!persisted.actionIncidentRng,incidents);
  if(incidents){assert.equal(persisted.actionIncidentRng[persisted.players[0].id].words.length,4);assert.equal(persisted.players[0].actionIncidents.ordinal,0);}
  const before=bytes(room.body.code),read=await get(room.body.code,room.cookie,caps);assert.equal(read.status,200);assert.equal(bytes(room.body.code),before);
  const oldRead=await get(room.body.code,room.cookie);if(incidents||careers)blocked(oldRead);else assert.equal(oldRead.status,200);
 }
 for(const count of [1,2,3,4]){
  const hotseat=await create({mode:'hotseat',names:Array.from({length:count},(_,i)=>`Seat ${i+1}`),careerMode:'venue',actionIncidents:true});
  assert.equal(hotseat.status,200);assert.equal(hotseat.body.mine.length,count);noRng(hotseat.body);
  const state=saved(hotseat.body.code);assert.equal(Object.keys(state.actionIncidentRng).length,count);
  for(const p of hotseat.body.players){assert.equal(p.actionIncidents.ordinal,0);assert.equal(p.career.version,1);assert.equal(p.finance.version,1);}
 }
 for(const actionIncidents of [null,1,'true',{},[]]){const size=rows.size,r=await create({actionIncidents});assert.equal(r.status,400);assert.equal(rows.size,size);}
 for(const careerMode of [null,false,'legacy',{},[]]){const size=rows.size,r=await create({careerMode});assert.equal(r.status,400);assert.equal(rows.size,size);}
 for(const extra of [{actionIncidents:true},{careerMode:'venue'},{careerMode:'venue',actionIncidents:true}]){
  const size=rows.size;blocked(await create({...extra,supportedRules:undefined}));assert.equal(rows.size,size);
 }
 blocked(await create({actionIncidents:true,supportedRules:['venue-careers-v1']}));
 blocked(await create({careerMode:'venue',supportedRules:['action-incidents-v1']}));
 const old=await create({supportedRules:undefined,actionIncidentsVersion:1,careerVersion:1,actionIncidentRng:{forged:true}});assert.equal(old.status,200);assert.equal(old.body.actionIncidentsVersion,undefined);assert.equal(old.body.careerVersion,undefined);assert.equal(saved(old.body.code).actionIncidentRng,undefined);
 const guest=await post({op:'join',code:old.body.code,name:'Old guest'});assert.equal(guest.status,200);assert.equal(guest.body.players[1].actionIncidents,undefined);assert.equal(saved(old.body.code).actionIncidentRng,undefined);
});

test('D1 capability checks precede join, start, move and replay; refreshing retries the same request',async()=>{
 const host=await create({careerMode:'venue',actionIncidents:true}),code=host.body.code;
 let before=bytes(code);
 for(const cookie of [host.cookie,undefined]){blocked(await get(code,cookie));assert.equal(bytes(code),before);}
 const join={op:'join',code,name:'Guest'};blocked(await post(join));assert.equal(bytes(code),before);
 const guest=await post({...join,supportedRules:caps});assert.equal(guest.status,200);assert.ok(guest.body.players[1].actionIncidents);
 assert.equal(Object.keys(saved(code).actionIncidentRng).length,2);const hostId=host.body.mine[0],guestId=guest.body.mine[0];
 assert.notDeepEqual(saved(code).actionIncidentRng[hostId],saved(code).actionIncidentRng[guestId]);
 before=bytes(code);blocked(await post(join,guest.cookie));assert.equal(bytes(code),before);
 const rejoin=await post({...join,supportedRules:caps},guest.cookie);assert.equal(rejoin.status,200);assert.equal(bytes(code),before);
 const start={op:'start',code,version:guest.body.version,requestId:'same-start'};blocked(await post(start,host.cookie));assert.equal(bytes(code),before);
 const started=await post({...start,supportedRules:caps},host.cookie);assert.equal(started.status,200);before=bytes(code);
 blocked(await post(start,host.cookie));assert.equal(bytes(code),before);
 const action={op:'move',code,version:started.body.version,requestId:'same-action',action:'home_reset'};blocked(await post(action,host.cookie));assert.equal(bytes(code),before);
 const otherRng=structuredClone(saved(code).actionIncidentRng[guestId]);
 const applied=await post({...action,supportedRules:caps},host.cookie);assert.equal(applied.status,200);assert.equal(applied.body.players[0].actionIncidents.ordinal,1);noRng(applied.body);
 before=bytes(code);blocked(await post(action,host.cookie));assert.equal(bytes(code),before);
 const replay=await post({...action,supportedRules:caps},host.cookie);assert.equal(replay.status,200);assert.deepEqual(replay.body,applied.body);assert.equal(bytes(code),before);assert.deepEqual(saved(code).actionIncidentRng[guestId],otherRng);
 const restored=await get(code,host.cookie,caps);assert.equal(restored.status,200);assert.deepEqual(restored.body,applied.body);assert.equal(bytes(code),before);
});

test('D1 masks RNG and private histories for owner, other seat and public reads',async()=>{
 const host=await create({careerMode:'venue',actionIncidents:true}),code=host.body.code;
 const guest=await post({op:'join',code,name:'Guest',supportedRules:caps});assert.equal(guest.status,200);
 const fixture=saved(code),owned=fixture.players[0];
 owned.sharedPersonal={privateSentinel:'shared-only-owner'};owned.familiarity={privateSentinel:'familiarity-only-owner'};
 owned.career.privateSentinel='career-only-owner';owned.finance.privateSentinel='finance-only-owner';owned.actionIncidents.privateSentinel='incidents-only-owner';
 // An older partial save may retain history without every root marker.
 delete fixture.sharedOpportunitiesVersion;replace(fixture);const before=bytes(code);
 const owner=(await get(code,host.cookie,caps)).body;noRng(owner);assert.equal(owner.players[0].sharedPersonal.privateSentinel,'shared-only-owner');assert.equal(owner.players[0].career.privateSentinel,'career-only-owner');assert.ok(owner.players[0].actionIncidents);
 const observer=(await get(code,guest.cookie,caps)).body;noRng(observer);
 for(const field of ['sharedPersonal','familiarity','career','finance','actionIncidents','cast','motives'])assert.equal(observer.players[0][field],undefined,field);
 assert.ok(observer.players[1].career);assert.ok(observer.players[1].finance);assert.ok(observer.players[1].actionIncidents);
 assert.ok(!JSON.stringify(observer).includes('only-owner'));
 const publicView=await get(code,undefined,caps);assert.equal(publicView.status,200);noRng(publicView.body);assert.deepEqual(publicView.body.players,[{name:'Owner'},{name:'Guest'}]);assert.equal(bytes(code),before);
 for(const p of fixture.players){assert.ok(p.actionIncidents);assert.ok(p.career);assert.ok(p.finance);}
 delete fixture.actionIncidentsVersion;delete fixture.careerVersion;delete fixture.financialRecoveryVersion;replace(fixture);
 const oldObserver=(await get(code,guest.cookie)).body;noRng(oldObserver);for(const field of ['sharedPersonal','familiarity','career','finance','actionIncidents'])assert.equal(oldObserver.players[0][field],undefined,field+' with absent root marker');
});

test('D1 malformed capabilities and newer saved versions return refresh errors without mutation',async()=>{
 const host=await create({actionIncidents:true}),code=host.body.code,before=bytes(code);
 for(const supportedRules of [null,false,'action-incidents-v1',{},['unknown'],['action-incidents-v1','venue-careers-v1','unknown']]){
  blocked(await post({op:'join',code,name:'Invalid',supportedRules}),400);assert.equal(bytes(code),before);
 }
 for(const query of ['&supportedRules=unknown','&supportedRules=action-incidents-v1&supportedRules=venue-careers-v1']){
  blocked(await get(code,host.cookie,undefined,query),400);assert.equal(bytes(code),before);
 }
 for(const marker of ['actionIncidentsVersion','careerVersion','financialRecoveryVersion']){
  const g=saved(code);g[marker]=2;replace(g);const snapshot=bytes(code);
  blocked(await get(code,host.cookie,caps));blocked(await get(code,undefined,caps));blocked(await post({op:'join',code,name:'Guest',supportedRules:caps}));assert.equal(bytes(code),snapshot);
  g[marker]=marker==='actionIncidentsVersion'?1:undefined;replace(g);
 }
});

test('D1 failed, stale, concurrent and repeated actions never persist extra incident draws',async()=>{
 const host=await create({mode:'hotseat',names:['Solo'],actionIncidents:true}),code=host.body.code;
 assert.equal(host.status,200);const initial=saved(code),id=initial.players[0].id;
 // The first draw is above incidence: a no-event success still has one persisted ordinal.
 initial.actionIncidentRng[id].words=[0x80000000,0,0,0];replace(initial);
 const attempt=(action,requestId,version=0)=>post({op:'move',code,version,requestId,action,supportedRules:caps},host.cookie);
 let before=bytes(code);assert.equal((await attempt('no-such-action','invalid')).status,400);assert.equal(bytes(code),before);
 const first=await attempt('home_reset','first');assert.equal(first.status,200);assert.equal(first.body.players[0].actionIncidents.ordinal,1);assert.equal(first.body.players[0].actionIncidents.receipts[0].incidentId,null);
 assert.notDeepEqual(saved(code).actionIncidentRng[id].words,initial.actionIncidentRng[id].words);
 before=bytes(code);assert.equal((await attempt('home_reset','stale',0)).status,409);assert.equal(bytes(code),before);
 const replay=await attempt('home_reset','first',0);assert.equal(replay.status,200);assert.deepEqual(replay.body,first.body);assert.equal(bytes(code),before);
 const results=await Promise.all([attempt('home_reset','race-a',first.body.version),attempt('home_reset','race-b',first.body.version)]);
 assert.deepEqual(results.map(r=>r.status).sort(),[200,409]);assert.equal(saved(code).players[0].actionIncidents.ordinal,2);
 const winning=results.find(r=>r.status===200),winnerId=results[0].status===200?'race-a':'race-b';before=bytes(code);
 assert.equal((await attempt('home_reset',winnerId,first.body.version)).status,200);assert.equal(bytes(code),before);
 const visit=await post({op:'move',code,version:winning.body.version,requestId:'same-place',action:'visit',destination:'APARTMENTS',supportedRules:caps},host.cookie);
 assert.equal(visit.status,200);assert.equal(saved(code).players[0].actionIncidents.ordinal,2);
 assert.deepEqual(saved(code).actionIncidentRng,JSON.parse(JSON.parse(before).state).actionIncidentRng);
});

test.after(()=>{database.close();delete globalThis.crosswalkRulesD1;});
