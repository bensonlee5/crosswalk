import test from 'node:test';
import assert from 'node:assert/strict';
import {CURRENT_GAME_PROTOCOL,CURRENT_GAME_SCHEMA,currentGameQuery,isCurrentGameState} from '../lib/current-game.ts';
import {GameError,parseMutation,fingerprint,mutate,roomView,requireCurrentGame} from '../supabase/functions/crosswalk-game/game-service.ts';
const actor='00000000-0000-4000-8000-000000000001';
const command={op:'move',ownerSession:actor,requestId:'original-id',protocolVersion:CURRENT_GAME_PROTOCOL,code:'ABC234',version:2,action:'home_reset'};
const versioned=()=>({version:1});
const current=()=>({schemaVersion:CURRENT_GAME_SCHEMA,cast:versioned(),story:versioned(),sharedWorld:versioned(),sharedOpportunities:versioned(),lifeSchedule:[],weatherSchedule:[],lifeSeed:123,actionIncidentRng:{seat:{words:[1,2,3,4]}},players:[{schemaVersion:CURRENT_GAME_SCHEMA,id:'seat',life:versioned(),world:versioned(),story:versioned(),cast:versioned(),motives:versioned(),career:versioned(),finance:versioned(),familiarity:versioned(),sharedPersonal:versioned(),actionIncidents:versioned(),economyWork:{round:1,paidHours:0},economyHabits:{round:1,ids:[]}}]});

test('current query helper encodes caller parameters and cannot override the current protocol',()=>{
 assert.equal(currentGameQuery(),'/api/game?protocolVersion=1');
 assert.equal(currentGameQuery({code:'ABC234'}),'/api/game?code=ABC234&protocolVersion=1');
 const parsed=new URL(currentGameQuery({history:1,cursor:'123:ABC234',protocolVersion:99}),'https://test.invalid');
 assert.equal(parsed.searchParams.get('history'),'1');assert.equal(parsed.searchParams.get('cursor'),'123:ABC234');assert.deepEqual(parsed.searchParams.getAll('protocolVersion'),['1']);
});
test('normalized current commands include one protocol and no feature negotiation',async()=>{
 const parsed=parseMutation({...command,supportedRules:['old'],careerMode:'venue',actionIncidents:false,state:{cash:99999}},actor);
 assert.deepEqual(parsed,command);
 assert.equal(await fingerprint(parsed),await fingerprint(parseMutation(Object.fromEntries(Object.entries(command).reverse()),actor)));
 assert.notEqual(await fingerprint(parsed),await fingerprint({...parsed,protocolVersion:2}));
});
test('missing and unsupported protocols are rejected before receipt access or mutation',async()=>{
 const store=new Proxy({},{get(){throw Error('must not access storage');}});
 for(const protocolVersion of [undefined,null,0,2,'1',{},[]])await assert.rejects(mutate(store,actor,{...command,protocolVersion}),error=>error instanceof GameError&&error.status===409&&error.refreshRequired);
});
test('current protocol does not weaken pending owner identity or stable request validation',()=>{
 assert.throws(()=>parseMutation({...command,ownerSession:'00000000-0000-4000-8000-000000000002'},actor),error=>error.status===403&&error.identityChanged);
 for(const requestId of ['',undefined,'x'.repeat(81),'control\nchar'])assert.throws(()=>parseMutation({...command,requestId},actor),error=>error.status===400);
});
test('one authoritative schema requires all current state and never repairs unsupported records',()=>{
 const good=current();assert.equal(isCurrentGameState(good),true);
 for(const key of ['schemaVersion','cast','story','sharedWorld','sharedOpportunities','lifeSchedule','weatherSchedule','lifeSeed','actionIncidentRng']){const old=current();delete old[key];const before=JSON.stringify(old);assert.equal(isCurrentGameState(old),false,key);assert.throws(()=>requireCurrentGame(old),error=>error.status===409&&error.newLifeRequired);assert.equal(JSON.stringify(old),before);}
 for(const key of Object.keys(good.players[0])){const old=current();delete old.players[0][key];assert.equal(isCurrentGameState(old),false,key);}
 for(const field of ['career','finance','actionIncidents','life','world','story','cast','motives','sharedPersonal','familiarity']){const old=current();old.players[0][field].version=2;assert.equal(isCurrentGameState(old),false,field);}
 const redacted=current();redacted.players[0].castRedacted=true;assert.equal(isCurrentGameState(redacted),false);
});
test('matching old-room receipts return new-life-required without applying the intent',async()=>{
 const state={schemaVersion:0,players:[],members:{[actor]:['seat']}},before=JSON.stringify(state);
 const store={receipt:async()=>({kind:'ok',room:{code:'ABC234',state,version:9,updated_at:1},replayed:true}),read:async()=>{throw Error('no read');},commit:async()=>{throw Error('no commit');}};
 await assert.rejects(mutate(store,actor,command),error=>error.status===409&&error.newLifeRequired);
 assert.equal(JSON.stringify(state),before);
 for(const owner of [actor,'00000000-0000-4000-8000-000000000002'])assert.throws(()=>roomView({state},owner),error=>error.newLifeRequired);
});
test('request-ID mismatch remains a conflict and never creates a replacement action',async()=>{
 const store={receipt:async()=>({kind:'request_mismatch'}),commit:async()=>{throw Error('no commit');}};
 await assert.rejects(mutate(store,actor,command),error=>error.status===409&&/different action/.test(error.message));
});
