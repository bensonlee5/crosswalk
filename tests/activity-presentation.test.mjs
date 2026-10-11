import {CURRENT_GAME_PROTOCOL} from '../lib/current-game.ts';
import assert from 'node:assert/strict';
import test from 'node:test';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import vm from 'node:vm';
import ts from 'typescript';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {actions,availableActions,activityForPlayer} from '../lib/game.ts';
import {actionPreview} from '../lib/game-view.ts';
import {choiceTerms,firstPlaceAction,placeStories,regionalInvitation} from '../lib/place-invitations.ts';
import {worldPlaceIds,regionDefinitions} from '../lib/world-life.ts';
import {createGame} from '../supabase/functions/crosswalk-game/game-service.ts';
const require=createRequire(import.meta.url);
function setup(){const g=createGame({op:'create',mode:'hotseat',names:['Planner'],ownerSession:'00000000-0000-4000-8000-000000000001',requestId:crypto.randomUUID(),protocolVersion:CURRENT_GAME_PROTOCOL},'PLAN01'),p=g.players[0];for(const region of Object.keys(regionDefinitions))p.world.discoveredPlacesByRegion[region]=[...worldPlaceIds];return{g,p};}
function load(file){const module={exports:{}},source=readFileSync(new URL(file,import.meta.url),'utf8'),js=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ESNext,jsx:ts.JsxEmit.ReactJSX}}).outputText;vm.runInNewContext(js,{module,exports:module.exports,require:id=>id.startsWith('@/')?require('../'+id.slice(2)+'.ts'):require(id)});return module.exports;}
const {ChoiceTerms,ChoiceBenefit}=load('../app/place-invitations.tsx');
const render=(C,props)=>renderToStaticMarkup(React.createElement(C,props));
test('all current activity previews show the exact remaining and missing priority blocks without mutation',()=>{
 const {g,p}=setup();let cases=0;
 for(const round of [1,2,4,7,8])for(const hours of [0,1,2,3,6])for(const raw of actions){
  g.round=round;p.hours=hours;p.place=raw.place;const a=activityForPlayer(p,raw,g),before=JSON.stringify(g),preview=actionPreview(p,a.id,g),terms=choiceTerms(p,a,g),cost=-preview.hours;
  assert.equal(preview.afterHours,Math.max(0,hours-cost));assert.equal(preview.missingHours,Math.max(0,cost-hours));
  assert.doesNotMatch(terms.time,/-\d.*left|time blocks|week/);
  if(cost>hours)assert.match(terms.time,new RegExp(`Needs ${cost-hours} more priority block`));else assert.match(terms.time,new RegExp(`${hours-cost} left after`));
  assert.equal(JSON.stringify(g),before,'presentation is read-only');cases++;
 }
 assert.ok(cases>800);
});
test('each venue selects an available preview and honors an explicit current action without reordering',()=>{
 const {g,p}=setup();for(const place of worldPlaceIds){assert.ok(placeStories[place]);const before=JSON.stringify(g),options=availableActions(p,place,g),initial=firstPlaceAction(p,place,g);if(options.length){assert.ok(options.some(a=>a.id===initial));const requested=options.at(-1).id;assert.equal(firstPlaceAction(p,place,g,requested),requested);}else assert.equal(initial,'');assert.equal(JSON.stringify(g),before);}
});
test('monthly habits show unit prices, exact extra costs and qualitative benefits',()=>{
 const {g,p}=setup();for(const [id,unit,total] of [['cafe_break','20 weekday coffees this month · $7 per coffee','$140'],['friends','8 café meetups this month · $18 per meetup','$144'],['home_meal','20 dinners this month · $5 extra per dinner','$100'],['market_taste','20 weekday lunches this month · $18 per lunch · $13 extra per lunch after grocery credit','$260']]){
  const a=actions.find(a=>a.id===id),html=render(ChoiceTerms,{p,g,a});assert.ok(html.includes(unit));assert.ok(html.includes(total+' upfront'));assert.doesNotMatch(html,/\b\d+ (energy|skills|connections|craft)\b/);assert.match(render(ChoiceBenefit,{p,g,a}),/choice-benefit/);
 }
});
test('studio terms use the home lease even when visiting another region',()=>{
 const {g,p}=setup();p.world.region='pelagia';const a=actions.find(a=>a.id==='move'),terms=choiceTerms(p,a,g);assert.equal(terms.cash,'$2,800 upfront');assert.match(terms.bills,/\$3,050 monthly bills/);assert.match(terms.bills,/\$1,200 more each month/);assert.doesNotMatch(terms.bills,/3,550/);
});
test('local invitations are legal, region-specific, and do not change state',()=>{
 const {g,p}=setup();for(const region of Object.keys(regionDefinitions)){p.world.region=region;p.energy=100;p.hours=6;const before=JSON.stringify(g),invitation=regionalInvitation(p,g);if(invitation)assert.ok(availableActions(p,invitation.place,g).some(a=>a.id===invitation.action));assert.equal(JSON.stringify(g),before);}
});
