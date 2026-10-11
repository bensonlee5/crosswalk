import test from 'node:test';
import assert from 'node:assert/strict';
import {ActionAudioReceipts} from '../lib/action-audio-receipts.ts';
const before={code:'ABC234',version:8,turn:0,mine:['p'],players:[{id:'p'},{id:'q'}]};
const after={...before,version:9};
const confirmation=(patch={})=>({request:{op:'move',requestId:'request-one',ownerSession:'owner',code:'ABC234',version:8},epoch:2,currentEpoch:2,currentOwner:'owner',recovery:false,accepted:true,before,after,...patch});

test('a local authoritative action is consumed once; a new deliberate action can sound',()=>{
 const gate=new ActionAudioReceipts();
 assert.equal(gate.consume(confirmation()),true);
 assert.equal(gate.consume(confirmation()),false);
 assert.equal(gate.consume(confirmation({request:{...confirmation().request,requestId:'request-two',version:9},before:after,after:{...after,version:10}})),true);
});
test('reload, recovery/retry, polling, rejected/stale snapshots and nonlocal seats are silent',()=>{
 for(const patch of [{recovery:true},{accepted:false},{epoch:1},{currentOwner:null},{currentOwner:'another'},
  {after:{...after,code:'OTHER1'}},{after:before},{after:{...after,version:10}},{before:null},
  {before:{...before,mine:['q']}},{after:{...after,mine:['q']}},
  {request:{...confirmation().request,op:'poll'}},{request:{...confirmation().request,requestId:''}},
  {request:{...confirmation().request,ownerSession:undefined}},{request:{...confirmation().request,version:7}}]){
  assert.equal(new ActionAudioReceipts().consume(confirmation(patch)),false,JSON.stringify(patch));
 }
});
test('hotseat handoff accepts only the actor that actually committed; online remote turns are quiet',()=>{
 const gate=new ActionAudioReceipts();
 const seats={...before,mine:['p','q']};
 assert.equal(gate.consume(confirmation({before:seats,after:{...seats,version:9,turn:1}})),true);
 assert.equal(new ActionAudioReceipts().consume(confirmation({before:{...before,turn:1},after:{...after,turn:1}})),false);
});
test('receipt identity includes owner, room and current session epoch',()=>{
 const gate=new ActionAudioReceipts();
 assert.equal(gate.consume(confirmation()),true);
 assert.equal(gate.consume(confirmation({currentOwner:'other',request:{...confirmation().request,ownerSession:'other'}})),true);
 assert.equal(gate.consume(confirmation({epoch:3,currentEpoch:3})),true);
 assert.equal(gate.consume(confirmation({request:{...confirmation().request,code:'XYZ123'},before:{...before,code:'XYZ123'},after:{...after,code:'XYZ123'}})),true);
 assert.equal(gate.consume(confirmation({epoch:2,currentEpoch:3})),false,'a delayed prior session is stale');
});
