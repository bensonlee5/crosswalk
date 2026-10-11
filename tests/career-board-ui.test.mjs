import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {createRequire} from 'node:module';
import vm from 'node:vm';
import ts from 'typescript';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {player} from '../lib/game.ts';
import {initializeEconomyPlayer} from '../lib/economy.ts';
import {initializeLifePlayer} from '../lib/life-events.ts';
import {initializeWorldPlayer,initializeSharedWorld,worldPlaceIds,regionDefinitions} from '../lib/world-life.ts';
const require=createRequire(import.meta.url),source=readFileSync(new URL('../app/career-board.tsx',import.meta.url),'utf8');
function load(states=[]){let hook=0;const compiled={exports:{}},js=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ESNext,jsx:ts.JsxEmit.ReactJSX}}).outputText;
 vm.runInNewContext(js,{module:compiled,exports:compiled.exports,require:id=>id==='react'?{...React,useState:initial=>[states[hook++]??initial,()=>{}]}:id.endsWith('.css')?{}:id==='./game-painting'?{default:props=>React.createElement('img',{src:props.src,alt:props.alt}),__esModule:true}:id.startsWith('@/')?require('../'+id.slice(2)+'.ts'):require(id)});return compiled.exports.default;
}
function setup(){const p=player('Worker',1),g={code:'JOBS',host:'owner',members:{owner:[p.id]},mode:'hotseat',status:'lobby',round:1,turn:0,maxRounds:8,players:[p],log:[],seen:[],event:0,rulesVersion:2,balanceVersion:1,storyVersion:1,economyVersion:1,lifeVersion:1,worldVersion:1};initializeEconomyPlayer(p,g);initializeLifePlayer(p);initializeWorldPlayer(p);initializeSharedWorld(g);for(const r of Object.keys(regionDefinitions))p.world.discoveredPlacesByRegion[r]=[...worldPlaceIds];g.status='playing';return{p,g};}
const elements=node=>!node||typeof node!=='object'?[]:[node,...React.Children.toArray(node.props?.children).flatMap(elements)];
const render=(props,states)=>renderToStaticMarkup(React.createElement(load(states),{disabled:false,onVisit:()=>{},...props}));
test('visual ladder names real career changes and exposes pay, time and qualitative requirements without points',()=>{
 const html=render(setup());assert.match(html,/Career changes/);assert.match(html,/Retraining/);assert.match(html,/one fixed route/);assert.match(html,/Clockhouse Workrooms/);assert.match(html,/The Next Landing/);assert.match(html,/Finding your footing/);assert.match(html,/\$3,072/);assert.match(html,/160 paid hours/);assert.match(html,/2 priority blocks/);assert.match(html,/200 paid hours left/);assert.doesNotMatch(html,/\b\d+ (skills|connections|energy|craft levels|XP)\b/);assert.match(html,/aria-current="step"/);assert.match(html,/data-career-step="career-3"/);
});
test('filters have accessible labels, preserve locked cards, and available filter uses true requirements',()=>{
 const props=setup(),all=render(props,['creative','all','here',true]),ready=render(props,['creative','ready','here',true]);assert.match(all,/<label>Availability<select/);assert.match(all,/<label>Work path<select/);assert.match(all,/<label>Town<select/);assert.match(all,/data-career-id="creative_commission"/);assert.match(all,/Craft needs to be Finding your style/);assert.doesNotMatch(ready,/data-career-id="creative_commission"/);assert.match(ready,/No work matches these filters/);
});
test('opening an ordinary card navigates to the exact job preview and never commits it',()=>{
 const props=setup(),calls=[],Board=load(['all','all','here',true]),tree=Board({...props,disabled:false,onVisit:(...args)=>calls.push(args)}),article=elements(tree).find(n=>n.props?.['data-career-id']==='work'),button=elements(article).find(n=>n.props?.className==='career-card-action');assert.equal(button.props.disabled,false);button.props.onClick();assert.deepEqual(calls,[['WORK','work']]);
 const before=structuredClone(props.g);assert.equal(props.p.cash,6000);assert.deepEqual(props.g,before);
});
test('regional and shared jobs pass exact preview identifiers through separate callbacks',()=>{
 const props=setup(),calls=[],choice={id:'prep',actionId:'world:shared:1:0:alder:prepare:o1',key:'prepare:o1',kind:'prepare',title:'Prepare the supper order',body:'Tess pays the order preparation fee.',place:'CORNER CAFÉ',actorId:'alder_tess',time:1,cost:0,earn:77,paidHours:4,available:true,reason:''},tree=load(['all','all','here',true])({...props,disabled:false,onVisit:()=>{},onWorldChoice:id=>calls.push(['world',id]),onSharedOpportunity:id=>calls.push(['shared',id]),sharedOpportunities:{choices:[choice]}});
 const all=elements(tree);for(const id of ['regional_work','prep']){const article=all.find(n=>n.props?.['data-career-id']===id);elements(article).find(n=>n.props?.className==='career-card-action').props.onClick();}
 assert.match(calls[0][1],/:regional_work$/);assert.deepEqual(calls[1],['shared',choice.actionId]);assert.equal(props.p.cash,6000);
});
test('busy/offline/other-turn navigation guards hold even if a disabled click is invoked',()=>{
 const props=setup(),calls=[],tree=load(['all','all','here',true])({...props,disabled:true,onVisit:(...args)=>calls.push(args),onWorldChoice:id=>calls.push(id)});
 for(const button of elements(tree).filter(n=>n.type==='button'&&n.props.disabled)){button.props.onClick?.();}assert.deepEqual(calls,[]);
 const other=structuredClone(props.p);other.id='other';props.g.players.push(other);props.g.turn=1;const html=render(props);assert.match(html,/disabled=""/);assert.match(html,/Wait for your turn/);
});
test('other towns show travel costs and route review, never phantom job offers',()=>{
 const props=setup(),html=render({...props,onWorldChoice:()=>{}},['all','all','pelagia',false]);assert.match(html,/Tide Ledger Workrooms/);assert.match(html,/Review live openings after arriving/);assert.match(html,/\$780 fare/);assert.match(html,/route through conversations/);assert.doesNotMatch(html,/data-career-id=/);assert.match(html,/Review route to Pelagia/);
});
test('board protects privacy, preserves legacy wording and has mobile layout and keyboard focus rules',()=>{
 const props=setup();props.p.castRedacted=true;const privateHtml=render(props);assert.match(privateHtml,/work plans are private/);assert.doesNotMatch(privateHtml,/Café crew|\$|Finding your footing/);
 const p=player('Legacy'),g={...props.g,players:[p],lifeVersion:undefined,storyVersion:undefined,economyVersion:undefined};const old=render({p,g});assert.match(old,/\$320/);assert.match(old,/16 paid hours/);assert.doesNotMatch(old,/200-hour monthly limit|paid hours left this month/);
 const css=readFileSync(new URL('../app/career-board.css',import.meta.url),'utf8');assert.match(css,/@media\(max-width:440px\)/);assert.match(css,/\.career-job-grid\{grid-template-columns:1fr\}/);assert.match(css,/min-height:44px/);assert.match(css,/:focus-visible/);assert.match(css,/repeat\(2,minmax\(0,1fr\)\)/);
 for(const art of ['work','careers','campus','cafe','community','library','makers'])assert.ok(existsSync(new URL('../public/paintings/locations/'+art+'.webp',import.meta.url)),art);
});
