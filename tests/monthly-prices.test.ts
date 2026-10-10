import test from 'node:test';
import assert from 'node:assert/strict';
import {monthlyPriceBreakdown,perEventPrice} from '../lib/monthly-prices.ts';
import {economyQuote} from '../lib/economy.ts';
import {actions,player,activityForPlayer} from '../lib/game.ts';

const p={...player('Price reader',1),storyVersion:1,economyVersion:1};
const g={round:1};
const expected:Record<string,string>={
 cafe_break:'20 weekday coffees this month · $7 per coffee',
 friends:'8 café meetups this month · $18 per meetup',
 home_meal:'20 dinners this month · $5 extra per dinner',
 market_taste:'20 weekday lunches this month · $18 per lunch · $13 extra per lunch after grocery credit',
 work_mentor:'4 guided sessions this month · $45 per session',
};
test('all counted monthly routines show frequency and unit price from the resolved quote',()=>{
 for(const region of ['alder','saffron','glasssteppe','pelagia','embermesa']){
  const local={...p,world:{region,story:{homeRegion:region}}} as typeof p;
  for(const [id,text] of Object.entries(expected)){
   const raw=actions.find(a=>a.id===id)!;
   assert.equal(monthlyPriceBreakdown(local,raw,g),text);
   assert.equal(monthlyPriceBreakdown(local,activityForPlayer(local,raw,g),g),text);
  }
 }
});
test('display does not change any total, state, or repeated-month availability',()=>{
 const snapshot=structuredClone(p);
 for(const id of Object.keys(expected)){
  const a=actions.find(a=>a.id===id)!,before=economyQuote(p,a,g);
  monthlyPriceBreakdown(p,a,g);
  assert.deepEqual(economyQuote(p,a,g),before);
  const chosen={...p,economyHabits:{round:1,ids:[id]}};
  assert.equal(monthlyPriceBreakdown(chosen,a,g),expected[id]);
  assert.equal(monthlyPriceBreakdown(chosen,a,{round:2}),expected[id]);
 }
 assert.deepEqual(p,snapshot);
});
test('legacy and uncounted activities gain no invented unit price',()=>{
 for(const a of actions){
  assert.equal(monthlyPriceBreakdown({...p,economyVersion:undefined},a,g),'');
  if(!expected[a.id])assert.equal(monthlyPriceBreakdown(p,a,g),'');
 }
});
test('fractional prices retain cents and uneven divisions are labeled as rounded averages',()=>{
 assert.equal(perEventPrice(141,20),'$7.05');
 assert.equal(perEventPrice(100,3),'about $33.33 on average (rounded to cents)');
 assert.equal(perEventPrice(10,2.5),'about $4 on average (rounded to cents)');
 assert.equal(perEventPrice(0,20),'$0');
 for(const [total,quantity] of [[10,0],[10,-2],[NaN,20],[10,Infinity],[-1,20]])assert.equal(perEventPrice(total,quantity),'');
});
