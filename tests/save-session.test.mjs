import assert from 'node:assert/strict';
import {test} from 'node:test';
import {isCurrentSaveRequest,isRoomLookupSnapshot,isOwnedGameSnapshot,rememberPending,forgetPending,pendingSaves,mergeSavedRoom,postSavedRequest} from '../lib/save-session.ts';
function storage(){const rows=new Map();return{get length(){return rows.size},key:i=>[...rows.keys()][i]??null,getItem:k=>rows.get(k)??null,setItem:(k,v)=>rows.set(k,v),removeItem:k=>rows.delete(k)};}
const intent=(id='request-1')=>({createdAt:123,request:{protocolVersion:1,op:'move',code:'ABC234',version:7,requestId:id,action:'work_short'}});
test('an interrupted turn survives reload as the exact request, not a client game snapshot',()=>{const local=storage(),pending=intent();assert.equal(rememberPending(local,pending),true);assert.deepEqual(JSON.parse(JSON.stringify(pendingSaves(local)[0])),pending);assert.equal(pendingSaves(local)[0].request.requestId,'request-1');assert.equal(pendingSaves(local)[0].request.version,7);forgetPending(local,'request-1');assert.deepEqual(pendingSaves(local),[]);});
test('multiple tabs keep separate request records; settling one does not erase another',()=>{const local=storage();rememberPending(local,intent('tab-one'));rememberPending(local,{...intent('tab-two'),createdAt:124});forgetPending(local,'tab-one');assert.deepEqual(pendingSaves(local).map(x=>x.request.requestId),['tab-two']);});
test('unavailable browser storage never replaces or blocks authoritative server saves',()=>{const denied=new Proxy({},{get(){throw Error('storage blocked')}});assert.equal(rememberPending(denied,intent()),false);assert.deepEqual(pendingSaves(denied),[]);assert.doesNotThrow(()=>forgetPending(denied,'request-1'));});
test('malformed local entries cannot inject full game state or arbitrary request operations',()=>{const local=storage();local.setItem('cw_pending_save_bad','{');local.setItem('cw_pending_save_evil',JSON.stringify({createdAt:1,request:{op:'overwrite',requestId:'evil'}}));rememberPending(local,{...intent(),request:{...intent().request,state:{cash:999999},members:{attacker:['seat']}}});const records=pendingSaves(local);assert.equal(records.length,1);assert.equal(records[0].request.state,undefined);assert.equal(records[0].request.members,undefined);});
test('owner-session marker survives reload for safe first-create recovery',()=>{const local=storage();const pending={createdAt:1,request:{op:'create',requestId:'create-one',ownerSession:'server-issued-nonsecret-marker',mode:'hotseat',names:['A']}};rememberPending(local,pending);assert.equal(pendingSaves(local)[0].request.ownerSession,pending.request.ownerSession);});
test('room history deduplicates by room and retains older seats after creating another',()=>{let rooms=[];for(let i=0;i<25;i++)rooms=mergeSavedRoom(rooms,{code:String(i),version:i});assert.equal(rooms.length,25);rooms=mergeSavedRoom(rooms,{code:'23',version:99});assert.equal(rooms[0].code,'23');assert.equal(rooms.filter(r=>r.code==='23').length,1);assert.equal(rooms[0].version,99);});
test('transport sends one exact current intention without a cookie handshake',async()=>{const calls=[];const pending=intent();const result=await postSavedRequest(pending.request,async(url,options)=>{calls.push({url,body:options.body});return Response.json({version:8,mine:['seat']});});assert.equal(result.response.status,200);assert.equal(calls.length,1);assert.equal(calls[0].body,JSON.stringify(pending.request));});
test('interrupted POST and unreadable success remain uncertain, never become new requests',async()=>{for(const fetcher of [async()=>{throw new TypeError('offline')},async()=>new Response('gateway interrupted',{status:200})]){const local=storage(),pending=intent();rememberPending(local,pending);await assert.rejects(()=>postSavedRequest(pending.request,fetcher));assert.equal(pendingSaves(local)[0].request.requestId,pending.request.requestId);assert.equal(pendingSaves(local)[0].request.version,7);}});

test('check-later preserves the request while marking it for explicit recovery',()=>{const local=storage();rememberPending(local,{...intent(),deferred:true});const saved=pendingSaves(local)[0];assert.equal(saved.deferred,true);assert.equal(saved.request.requestId,'request-1');assert.equal(saved.request.version,7);});

test('save acknowledgement requires a complete usable owned-room envelope',()=>{
 const room={schemaVersion:1,code:'ABC234',version:1,mode:'hotseat',status:'playing',turn:0,round:1,maxRounds:8,mine:['seat'],log:[],players:[{schemaVersion:1,id:'seat',name:'A',place:'APARTMENTS',cash:6000,hours:6,energy:80,joy:45,skill:0,social:0}]};
 assert.equal(isOwnedGameSnapshot(room),true);
 for(const key of ['schemaVersion','players','mine','log','turn','round','maxRounds','code','version','mode','status']){const broken=structuredClone(room);delete broken[key];assert.equal(isOwnedGameSnapshot(broken),false,key);}
 for(const patch of [{players:[]},{turn:1},{version:-1},{mine:['another-seat']},{players:[room.players[0],room.players[0]]},{players:[{...room.players[0],hours:NaN}]}])assert.equal(isOwnedGameSnapshot({...room,...patch}),false);
 assert.equal(isOwnedGameSnapshot(null),false);
});

test('public nonmember lookups stay valid while malformed or mismatched GETs are rejected',()=>{
 const publicRoom={schemaVersion:1,code:'ABC234',status:'lobby',players:[{name:'A'}],joinable:true};
 assert.equal(isRoomLookupSnapshot(publicRoom,'ABC234'),true);
 assert.equal(isRoomLookupSnapshot({...publicRoom,status:'playing',joinable:false},'ABC234'),true);
 for(const bad of [{},{code:'ABC234',version:1},{...publicRoom,mine:null},{...publicRoom,players:[]},{...publicRoom,players:[{}]},{...publicRoom,joinable:undefined},{...publicRoom,status:'playing'}])assert.equal(isRoomLookupSnapshot(bad,'ABC234'),false);
 assert.equal(isRoomLookupSnapshot(publicRoom,'DIFF34'),false);
});
test('a refresh-required response preserves the pending transport intent and confirmed room',async()=>{const local=storage(),pending=intent('rules-retry'),confirmed={code:'ROOM01',version:7,players:[{id:'original-seat',cash:120}]};rememberPending(local,pending);const before=JSON.stringify(confirmed);const result=await postSavedRequest(pending.request,async()=>Response.json({error:'Open the latest Crosswalk page. Your seat and saved progress are safe.',refreshRequired:true},{status:409}));assert.equal(result.response.status,409);assert.equal(result.data.refreshRequired,true);assert.deepEqual(JSON.parse(JSON.stringify(pendingSaves(local)[0])),pending);assert.equal(JSON.stringify(confirmed),before);});

test('old stored intentions remain untouched and cannot be upgraded or replayed',async()=>{
 for(const protocolVersion of [undefined,0,2]){
  const local=storage(),old={createdAt:123,request:{op:'create',requestId:'old-id',ownerSession:'original-owner',mode:'hotseat',names:['A'],...(protocolVersion===undefined?{}:{protocolVersion})}};
  rememberPending(local,old);const bytes=local.getItem('cw_pending_save_old-id');const restored=pendingSaves(local)[0];assert.equal(isCurrentSaveRequest(restored.request),false);
  const result=await postSavedRequest(restored.request,async()=>{throw Error('must not send an unsupported intention');});assert.equal(result.response.status,409);assert.equal(result.data.newLifeRequired,true);assert.equal(local.getItem('cw_pending_save_old-id'),bytes);assert.equal(restored.request.requestId,'old-id');
 }
 const local=storage(),current=intent();rememberPending(local,current);assert.equal(isCurrentSaveRequest(pendingSaves(local)[0].request),true);assert.deepEqual(JSON.parse(JSON.stringify(pendingSaves(local)[0])),current);
});
test('current envelope validation rejects unsupported room and player schema without modifying it',()=>{
 const room={schemaVersion:1,code:'ABC234',version:1,mode:'hotseat',status:'playing',turn:0,round:1,maxRounds:8,mine:['seat'],log:[],players:[{schemaVersion:1,id:'seat',name:'A',place:'APARTMENTS',cash:6000,hours:6,energy:80,joy:45,skill:0,social:0}]};
 for(const value of [undefined,0,2]){const old=structuredClone(room);old.schemaVersion=value;assert.equal(isOwnedGameSnapshot(old),false);const partial=structuredClone(room);partial.players[0].schemaVersion=value;assert.equal(isOwnedGameSnapshot(partial),false);}
});

test('starting a new life can retain an unsupported pending intention without offering replay',()=>{
 const local=storage(),pending={...intent('old-life-action'),deferred:true,unsupported:true};
 rememberPending(local,pending);assert.deepEqual(JSON.parse(JSON.stringify(pendingSaves(local)[0])),pending);
 assert.equal(pendingSaves(local)[0].request.requestId,'old-life-action');assert.equal(pendingSaves(local)[0].request.version,7);
});
