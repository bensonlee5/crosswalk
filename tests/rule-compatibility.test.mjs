import test from 'node:test';
import assert from 'node:assert/strict';
import {requiredRules,rulesSupportError,parseSupportedRules,parseSupportedRulesQuery,clientSupportedRules} from '../lib/rule-compatibility.ts';
import {parseMutation,fingerprint,createGame} from '../supabase/functions/crosswalk-game/game-service.ts';
const owner='00000000-0000-4000-8000-000000000001';
test('independent incident and career markers require only their own capabilities, with legacy reads unchanged',()=>{
 for(const incidents of [undefined,1])for(const careers of [undefined,1]){const g={actionIncidentsVersion:incidents,careerVersion:careers};const required=requiredRules(g);assert.equal(required.includes('action-incidents-v1'),incidents===1);assert.equal(required.includes('venue-careers-v1'),careers===1);assert.equal(rulesSupportError(g,clientSupportedRules),null);assert.equal(!!rulesSupportError(g,[]),!!incidents||!!careers);for(const rule of required)assert.ok(rulesSupportError(g,required.filter(r=>r!==rule)));}assert.deepEqual(requiredRules({financialRecoveryVersion:1}),['venue-careers-v1']);assert.deepEqual(requiredRules({actionIncidentsVersion:2,careerVersion:2}),[]);
});
test('malformed or forged capability names cannot satisfy the protocol',()=>{assert.deepEqual(parseSupportedRules(undefined),[]);for(const bad of [true,null,'all',{},['all'],['action-incidents-v2'],[1],['action-incidents-v1','venue-careers-v1','all']])assert.throws(()=>parseSupportedRules(bad),/Refresh Crosswalk/);assert.deepEqual(parseSupportedRules([...clientSupportedRules]),[...clientSupportedRules]);});
test('capability refresh preserves semantic action fingerprints and explicit create still requires support',async()=>{
 const original={op:'move',ownerSession:owner,requestId:'preserved-id',code:'RULES1',version:7,action:'home_reset'},old=parseMutation(original,owner),fresh=parseMutation({...original,supportedRules:[...clientSupportedRules]},owner);assert.equal(await fingerprint(old),await fingerprint(fresh));assert.equal(old.supportedRules.length,0);
 const create={op:'create',ownerSession:owner,requestId:'create',mode:'hotseat',names:['One'],actionIncidents:true};assert.throws(()=>createGame(parseMutation(create,owner),'RULES1'),/latest Crosswalk/);assert.equal(createGame(parseMutation({...create,supportedRules:[...clientSupportedRules]},owner),'RULES1').actionIncidentsVersion,1);
});

test('GET capability uses one bounded non-secret query value and never guesses a client version',()=>{assert.deepEqual(parseSupportedRulesQuery([]),[]);assert.deepEqual(parseSupportedRulesQuery(['action-incidents-v1,venue-careers-v1']),[...clientSupportedRules]);assert.throws(()=>parseSupportedRulesQuery(['all']),/Refresh/);assert.throws(()=>parseSupportedRulesQuery(['action-incidents-v1','venue-careers-v1']),/ambiguous/);});

test('future rule versions require refresh even when all current capabilities are advertised',()=>{
 for(const field of ['actionIncidentsVersion','careerVersion','financialRecoveryVersion'])assert.match(rulesSupportError({[field]:2},clientSupportedRules),/newer Crosswalk rules version/);
});
