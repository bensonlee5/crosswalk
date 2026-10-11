import test from 'node:test';
import assert from 'node:assert/strict';
import {proveAllNaturalRoutes,proveNaturalRoute} from '../scripts/prove-ensemble-routes.mjs';

test('all twenty stories open and finish through normal new-life travel, wages and bills',()=>{
 const results=proveAllNaturalRoutes();assert.equal(results.length,20);
 for(const r of results){assert.ok(r.ending.month<=8);assert.ok(r.ending.blocks>=0);assert.ok(r.afterBillCash>=0);}
 const whale=results.find(r=>r.storyId==='whaleskin');assert.equal(whale.arrival.month,6);assert.equal(whale.ending.flags.prevented,true);assert.equal(whale.ending.flags.blockedRunoff,false);assert.equal(whale.arrival.blocks-whale.ending.blocks,4);
 const bell=results.find(r=>r.storyId==='dalloway');assert.equal(bell.arrival.month,3);assert.equal(bell.ending.flags.fullCredit,true);
 const drum=results.find(r=>r.storyId==='bracken');assert.equal(drum.arrival.month,1);assert.equal(drum.ending.flags.jonahPaidOccupancy,true);
});
test('a first Pelagia visit in the final month can still prevent and finish the finite story',()=>{
 const r=proveNaturalRoute('whaleskin',{arrivalMonth:8,choices:['inspect','accurate','context','separate']});assert.equal(r.arrival.month,8);assert.equal(r.ending.month,8);assert.equal(r.ending.flags.prevented,true);assert.ok(r.afterBillCash>=0);
});
