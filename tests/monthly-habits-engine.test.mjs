import {currentGame} from './current-fixture.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import {move,reason,activityForPlayer,actions} from '../lib/game.ts';
import {monthlyBills} from '../lib/economy.ts';



import {actionPreview} from '../lib/game-view.ts';
function fixture(){const g=currentGame({names:['Habit QA'],seed:31});g.lifeSchedule=[];return{g,p:g.players[0]};}
test('monthly habit exact preview, repeated new request rejection and save/reload preservation',()=>{let {g,p}=fixture();move(g,'visit','CORNER CAFÉ');const a=activityForPlayer(p,actions.find(a=>a.id==='cafe_break'),g),preview=actionPreview(p,a.id,g),before=p.cash;assert.equal(a.cost,140);move(g,a.id);assert.equal(p.cash,before-140);assert.equal(p.cash,preview.afterCash);const saved=JSON.stringify(g);assert.throws(()=>move(g,a.id),/already chosen/);assert.equal(JSON.stringify(g),saved);g=JSON.parse(saved);p=g.players[0];assert.match(reason(p,a.id,g),/already chosen/);});
test('habit does not automatically renew or charge twice at month end',()=>{const{g,p}=fixture();move(g,'visit','CORNER CAFÉ');move(g,'friends');assert.equal(p.cash,6000-144);const bills=monthlyBills(p).total,before=p.cash;move(g,'end');const arrival=p.life.receipts.find(r=>r.week===2)?.effects.cash??0;assert.equal(p.cash,before-bills+arrival);assert.equal(reason(p,'friends',g),'');const current=p.cash;move(g,'friends');assert.equal(p.cash,current-144);});
test('free restorative alternatives can still be repeated',()=>{const{g,p}=fixture();move(g,'visit','THE PARK');move(g,'rest');move(g,'rest');assert.equal(p.cash,6000);assert.equal(p.hours,4);});
