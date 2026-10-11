import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import {isOwnedGameSnapshot,isRoomLookupSnapshot} from './fixtures/released-save-session.ts';
import {createGame,memberView} from '../supabase/functions/crosswalk-game/game-service.ts';
import {move} from '../supabase/functions/_shared/engine/game.ts';
const owner='00000000-0000-4000-8000-000000000001';
test('backend-first response envelope is accepted by the exact previously deployed client validator',()=>{
 // Immutable compatibility fixture copied byte-for-byte from 5b3c992.
 // Hash pinned to released 1e869cd / equivalent source 752218ce. Changing this
 // validator requires a fresh explicit compatibility fixture, not a silent update.
 assert.equal(crypto.createHash('sha256').update(fs.readFileSync(new URL('./fixtures/released-save-session.ts',import.meta.url))).digest('hex'),'92da597356d8931d3ca4c50af0c18d55033867bea467151daca1115c56856272');
 for(const n of [1,2,3,4]){
  const g=createGame({ownerSession:owner,mode:'hotseat',names:Array.from({length:n},(_,i)=>'Player '+i),requestId:'roll'},'ROLLUP');let version=1;
  for(const [action,destination]of [['home_reset'],['visit','CORNER CAFÉ'],['cafe_break'],['end']]){
   const actor=g.players[g.turn];move(g,action,destination);version++;
   const snapshot=memberView({code:g.code,state:g,version,updated_at:0},owner);
   assert.equal(isOwnedGameSnapshot(snapshot),true,action);assert.equal(isRoomLookupSnapshot(snapshot,g.code),true);
   assert.ok(snapshot.players.find(p=>p.id===actor.id).familiarity);
   assert.equal(snapshot.version,version);assert.equal(snapshot.players.length,n);
  }
 }
});
test('resumed rooms receive additive familiarity without shared-mechanic migration or missing legacy fields',()=>{
 const g=createGame({ownerSession:owner,mode:'hotseat',names:['Returning'],requestId:'roll-old'},'OLDLIF');
 delete g.sharedOpportunitiesVersion;delete g.sharedOpportunities;for(const p of g.players)delete p.sharedPersonal;
 const p=g.players[0],cash=p.cash,hours=p.hours;move(g,'home_reset');
 assert.equal(p.cash,cash);assert.equal(p.hours,hours-1);assert.equal(g.sharedOpportunitiesVersion,undefined);assert.equal(p.familiarity.actions.home_reset.count,1);
 const snapshot=memberView({code:g.code,state:g,version:2,updated_at:0},owner);assert.equal(isOwnedGameSnapshot(snapshot),true);assert.equal(snapshot.players[0].job,p.job);
});
