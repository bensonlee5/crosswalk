import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import vm from 'node:vm';
import ts from 'typescript';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {player,actions,move,reason,activityForPlayer} from '../lib/game.ts';
import {choiceTerms,choiceBenefit,mapInvitations} from '../lib/place-invitations.ts';
import {monthlyBills,initializeEconomyPlayer,economyQuote} from '../lib/economy.ts';
const require=createRequire(import.meta.url),compiled={exports:{}};
const source=readFileSync(new URL('../app/place-invitations.tsx',import.meta.url),'utf8');
const js=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ESNext,jsx:ts.JsxEmit.ReactJSX}}).outputText;
vm.runInNewContext(js,{module:compiled,exports:compiled.exports,require:id=>id==='./game-painting'?{default:props=>React.createElement('img',props),__esModule:true}:id==='./game-art'?require('../app/game-art.ts'):id.startsWith('@/')?require('../'+id.slice(2)+'.ts'):require(id)});
const {Invitations,ChoiceTerms}=compiled.exports;
const render=(C,props)=>renderToStaticMarkup(React.createElement(C,props));
function setup(modern=true){const p=player('Money',1),g={code:'MONEY',mode:'hotseat',host:'x',members:{x:[p.id]},players:[p],status:'lobby',round:1,turn:0,maxRounds:8,log:[],seen:[],event:0,rulesVersion:2,balanceVersion:1,...(modern?{storyVersion:1,economyVersion:1}:{})};if(modern)initializeEconomyPlayer(p,g);g.status='playing';return{p,g};}
const byId=id=>actions.find(a=>a.id===id);
test('modern work terms and actual cash agree from a raw catalog activity',()=>{
 const{p,g}=setup();p.place='WORK';const a=byId('work'),terms=choiceTerms(p,a,g);
 assert.match(terms.cash,/\$3,840 gross · \$3,072 take-home/);assert.match(terms.time,/2 priority blocks · 160 paid hours · 4 left after/);assert.equal(terms.afterCash,'$9,072 left after');
 assert.equal(choiceBenefit(p,a,g),'$3,072 take-home toward the life you want');const before=p.cash;move(g,'work');assert.equal(p.cash-before,3072);assert.equal(p.economyWork.paidHours,160);
 assert.match(choiceTerms(p,a,g).requirements,/Only 40 paid hours remain this month/);
});
test('major expenses and monthly habits display the resolved quote, not legacy catalog amounts',()=>{
 const{p,g}=setup();assert.equal(choiceTerms(p,byId('study'),g).cash,'$600 upfront');assert.equal(choiceTerms(p,byId('cafe_break'),g).cash,'$140 upfront');
 const terms=choiceTerms(p,byId('move'),g);assert.equal(terms.cash,'$2,800 upfront');assert.match(terms.bills,/\$3,050 monthly bills \(\$2,450 rent \+ \$380 food \+ \$220 essentials\), \$1,200 more each month/);
 p.craft=3;const q=economyQuote(p,byId('creative_commission'),g);assert.equal(q.cash,2340);assert.match(choiceTerms(p,byId('creative_commission'),g).cash,/\$3,200 gross · \$2,560 take-home · \$220 upfront · \+\$2,340 after costs/);
});
test('modern invitation rendering has correct up-front cost and no legacy tuition literal',()=>{
 const{p,g}=setup();const html=render(Invitations,{invitations:[{id:'study',place:'CAMPUS',action:'study',title:'Study',reason:'A useful course'}],p,g,disabled:false,onVisit:()=>{}});
 assert.match(html,/2 priority blocks/);assert.match(html,/\$600 upfront/);assert.doesNotMatch(html,/\$180/);
 const terms=render(ChoiceTerms,{p,a:byId('work'),g});assert.match(terms,/3,840 gross/);assert.match(terms,/3,072 take-home/);assert.match(terms,/160 paid hours/);
});
test('modern income and housing invitations follow the home contract and bill',()=>{
 const{p,g}=setup();p.skill=2;assert.ok(mapInvitations(p,g).some(i=>i.action==='apply'&&i.reason.includes('$34/hour')));
 p.cash=100;p.world={region:'pelagia',story:{homeRegion:'alder'}};assert.equal(monthlyBills(p).total,1850);
 const terms=choiceTerms(p,byId('move'),g);assert.match(terms.bills,/\$3,050 monthly/);assert.doesNotMatch(terms.bills,/3,550/);
});
test('old invitation outputs keep original amounts and weekly labels',()=>{
 const{p,g}=setup(false);assert.equal(p.cash,1100);assert.equal(choiceTerms(p,byId('study'),g).cash,'$180 upfront');assert.match(choiceTerms(p,byId('move'),g).bills,/\$705 weekly bills/);assert.match(choiceTerms(p,byId('work'),g).time,/2 time/);assert.match(choiceBenefit({...p,skill:2},byId('apply'),g),/\$29\/hour/);
});
test('startup defaults modern, while restored legacy room uses conditional original help',()=>{
 const page=readFileSync(new URL('../app/page.tsx',import.meta.url),'utf8');assert.match(page,/modernRules=!g\|\|modernEconomy/);assert.match(page,/8 months/);assert.match(page,/\$6,000 in savings/);assert.match(page,/modernRules\?<><p>/);assert.match(page,/Start with \$1,100 and a \$20\/hour/);assert.match(page,/weekPreview\(p,g\)/);assert.match(page,/Rent \+ groceries \+ essentials/);assert.match(page,/Pay bills &amp; end \{period\}/);
});

test('the engine commits a monthly habit once, records it across reload and leaves next month optional',()=>{
 const{p,g}=setup();p.place='CORNER CAFÉ';const before=p.cash;move(g,'cafe_break');assert.equal(p.cash,before-140);assert.deepEqual(p.economyHabits.ids,['cafe_break']);
 const snapshot=structuredClone(g);assert.throws(()=>move(g,'cafe_break'),/already chosen/);assert.deepEqual(g,snapshot);
 const restored=JSON.parse(JSON.stringify(g)),q=restored.players[0];assert.match(reason(q,'cafe_break',restored),/already chosen/);
 restored.round=2;q.hours=6;const nextCash=q.cash;assert.equal(reason(q,'cafe_break',restored),'');assert.equal(q.cash,nextCash,'availability never charges renewal');
 q.place='THE PARK';move(restored,'rest');move(restored,'rest');assert.equal(q.cash,nextCash,'free rest stays repeatable');
 q.place='CORNER CAFÉ';move(restored,'cafe_break');assert.equal(q.cash,nextCash-140);assert.deepEqual(q.economyHabits,{round:2,ids:['cafe_break']});
});
test('habit description states quantity, normal unit price and the exact prepaid monthly total',()=>{
 const{p,g}=setup();const a=activityForPlayer(p,byId('market_taste'),g),terms=choiceTerms(p,a,g);
 assert.match(a.title,/market lunches/);assert.match(a.desc,/20 weekday lunches × \$18 = \$360/);assert.match(a.desc,/less \$100/);assert.match(a.desc,/\$260 extra/);assert.equal(terms.cash,'$260 upfront');assert.equal(terms.afterCash,'$5,740 left after');
});

test('monthly prices render alongside the exact total in choice terms and invitations',()=>{
 const{p,g}=setup();
 for(const [id,unit,total] of [['cafe_break','20 weekday coffees this month · $7 per coffee','$140'],['friends','8 café meetups this month · $18 per meetup','$144'],['home_meal','20 dinners this month · $5 extra per dinner','$100'],['market_taste','20 weekday lunches this month · $18 per lunch · $13 extra per lunch after grocery credit','$260'],['work_mentor','4 guided sessions this month · $45 per session','$180']]){
  const a=byId(id),terms=render(ChoiceTerms,{p,a,g});
  assert.ok(terms.includes(unit));assert.ok(terms.includes(total+' upfront'));
  const invitation=render(Invitations,{invitations:[{id,place:a.place,action:id,title:a.title,reason:'A monthly routine'}],p,g,disabled:true,onVisit:()=>{throw Error('render must not act');}});
  assert.ok(invitation.includes(unit));assert.ok(invitation.includes(total+' upfront'));assert.ok(invitation.includes('disabled=""'));
 }
 const legacy=setup(false);assert.doesNotMatch(render(ChoiceTerms,{...legacy,a:byId('cafe_break')}),/per coffee|weekday coffees/);
 const screen=readFileSync(new URL('../app/game-screen.tsx',import.meta.url),'utf8');
 assert.match(screen,/unitPrice=monthlyPriceBreakdown\(p,option,g\)/);
 assert.match(screen,/unitPrice&&<small>\{unitPrice\}<\/small>/);
});
