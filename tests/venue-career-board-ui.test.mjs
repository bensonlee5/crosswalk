import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import vm from 'node:vm';
import ts from 'typescript';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {createGame} from '../supabase/functions/crosswalk-game/game-service.ts';
import {worldPlaceIds,regionDefinitions} from '../lib/world-life.ts';
import {careerChoices} from '../lib/careers.ts';
const require=createRequire(import.meta.url),source=readFileSync(new URL('../app/venue-career-board.tsx',import.meta.url),'utf8');
function load(states=[]){let hook=0;const compiled={exports:{}},js=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ESNext,jsx:ts.JsxEmit.ReactJSX}}).outputText;
 vm.runInNewContext(js,{module:compiled,exports:compiled.exports,require:id=>id==='react'?{...React,useState:initial=>[states[hook++]??initial,()=>{}],useRef:()=>({current:null}),useEffect:()=>{}}:id.endsWith('.css')?{}:id==='./game-painting'?{default:props=>React.createElement('img',{src:props.src,alt:props.alt}),__esModule:true}:id==='./story-choices'?{useEncounterCommit:()=>({busy:false,receipt:null,error:'',commit:()=>{},isSubmitted:()=>false}),StoryChoiceDeck:props=>React.createElement('div',{'data-confirm-choice':props.choices[0]?.id},props.choices[0]?.body),EncounterOutcome:()=>null}:id==='./person-response'?{PersonResponseStage:()=>null}:id.startsWith('@/')?require('../'+id.slice(2)+'.ts'):require(id)});return compiled.exports.default;
}
function setup(){const g=createGame({op:'create',mode:'hotseat',names:['Worker'],ownerSession:'00000000-0000-4000-8000-000000000001',requestId:crypto.randomUUID(),careerMode:'venue',supportedRules:['venue-careers-v1']},'CAREER'),p=g.players[0];for(const r of Object.keys(regionDefinitions))p.world.discoveredPlacesByRegion[r]=[...worldPlaceIds];return{g,p};}
const elements=node=>!node||typeof node!=='object'?[]:[node,...React.Children.toArray(node.props?.children).flatMap(elements)];
const props=()=>({disabled:false,onAction:async()=>{},onVisit:()=>{},...setup()});
const render=(p,states)=>renderToStaticMarkup(React.createElement(load(states),p));
test('four actual ladders show venue, gross rate and qualitative requirements without hidden point scores',()=>{
 const html=render(props());for(const title of ['Café crew','Barista','Café shift lead','Support assistant','Technical specialist','Technical project lead','Workshop assistant','Repair maker','Workshop lead','Pantry assistant','Community coordinator','Community programme lead'])assert.ok(html.includes(title),title);assert.match(html,/Your first workplace is a choice/);assert.match(html,/entry|Entry/);assert.match(html,/\$24\/hour gross/);assert.match(html,/priority blocks left/);assert.match(html,/data-career-role=/);assert.doesNotMatch(html,/\b\d+ (XP|skills|connections|energy|craft levels)\b/);assert.doesNotMatch(html,/You already have this role|Become IT support/);
});
test('learning gives actual tuition and time alternatives, with accessible filters and selected section',()=>{
 const html=render(props(),['learning']);assert.match(html,/Free Library study/);assert.match(html,/\$600 upfront/);assert.match(html,/2 priority blocks/);assert.match(html,/3 priority blocks/);assert.match(html,/<label>Field<select/);assert.match(html,/<label>Town<select/);assert.match(html,/aria-label="Work board sections"/);assert.match(html,/aria-pressed="true">Learning/);assert.match(html,/Qualifications met/);assert.match(html,/Complete relevant entry work before advanced preparation/);assert.doesNotMatch(html,/You meet the stated qualifications/);
});
test('review links navigate to the real workplace but cannot apply, train or accept as a side effect',()=>{
 const p=props(),visits=[],actions=[];p.onVisit=(...args)=>visits.push(args);p.onAction=async(...args)=>actions.push(args);const application=careerChoices(p.g,p.p).find(c=>c.target==='t.technical.assistant');const tree=load(['openings','all',false,{context:[p.g.code,p.p.id,p.g.round,p.p.world?.region,p.p.place].join(':'),id:application.id}])(p),link=elements(tree).find(n=>n.type==='button'&&String(React.Children.toArray(n.props.children)[0]).startsWith('Visit '));assert.ok(link);link.props.onClick();assert.equal(visits[0][0],'WORK');assert.equal(visits[0][1],application.id);assert.deepEqual(actions,[]);
 const locked=load(['openings','all',false,{context:[p.g.code,p.p.id,p.g.round,p.p.world?.region,p.p.place].join(':'),id:application.id}])({...p,disabled:true}),button=elements(locked).find(n=>n.type==='button'&&String(React.Children.toArray(n.props.children)[0]).startsWith('Visit '));assert.equal(button.props.disabled,true);button.props.onClick();assert.equal(visits.length,1);
});
test('private plans do not render training, finance or player receipts',()=>{
 const p=props();p.p.castRedacted=true;const html=render(p);assert.match(html,/work plans are private/);assert.doesNotMatch(html,/arrears|Café crew|Library study|600/);
});
test('recovery gives an explicit warning before the second missed bill and a bill-safe voluntary repayment',()=>{
 const p=props();Object.assign(p.p.finance,{arrears:1850,missedSettlements:1});p.p.cash=0;const html=render(p);assert.match(html,/starts financial recovery/);assert.match(html,/one|1 priority block/);assert.match(html,/tuition/);assert.match(html,/Review an extra arrears payment/);assert.match(html,/Preview this month’s settlement/);
});
test('same confirmed-receipt controller handles pending/errors/context; mobile styles keep one-column readable cards',()=>{
 assert.match(source,/useEncounterCommit/);assert.match(source,/findReceipt:.*careerConfirmedReceipt/);assert.match(source,/pending=\{commit.busy\}/);assert.match(source,/error=\{commit.error\}/);assert.match(source,/g.code,p.id,g.round,p.world\?\.region,p.place/);assert.match(source,/scrollIntoView/);assert.match(source,/tabIndex=\{-1\}/);
 const css=readFileSync(new URL('../app/venue-career-board.css',import.meta.url),'utf8');assert.match(css,/@media\(max-width:480px\)/);assert.match(css,/grid-template-columns:1fr/);assert.match(css,/min-height:44px/);assert.match(css,/:focus-visible/);
});
