import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import vm from 'node:vm';
import ts from 'typescript';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {player,createEnvironment} from '../lib/game.ts';
import {startTutorial,tutorialSteps,TUTORIAL_STORAGE_KEY} from '../lib/tutorial.ts';
const require=createRequire(import.meta.url);
const source=readFileSync(new URL('../app/game-tutorial.tsx',import.meta.url),'utf8');
const js=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ESNext,jsx:ts.JsxEmit.ReactJSX}}).outputText;
function load(react=React,storage={getItem:()=>null,setItem:()=>{}},clock=Date){const module={exports:{}};vm.runInNewContext(js,{exports:module.exports,module,require:id=>id==='react'?react:id.startsWith('@/')?require('../'+id.slice(2)+'.ts'):require(id),localStorage:storage,Date:clock});return module.exports;}
const Component=load().default;
const p=player('Learner');const game={code:'DEMO',mode:'hotseat',host:'x',members:{x:[p.id]},players:[p],status:'playing',round:1,turn:0,maxRounds:8,log:[],seen:[],event:0,rulesVersion:2,...createEnvironment()};
let calls=0;const no=()=>calls++;const props={g:game,p,active:true,busy:false,place:null,menu:null,send:no,onPlaces:no,onWork:no,onLife:no,onBoard:no,onNews:no,onBills:no,onFocusAction:no};
for(const step of tutorialSteps){const html=renderToStaticMarkup(React.createElement(Component,{...props,state:{...startTutorial('DEMO'),step}}));assert.ok(html.includes('aria-label="Guided tutorial"'));assert.ok(html.includes('aria-label="Skip tutorial"'));assert.ok(html.includes('tabindex="-1"'));assert.ok(!html.includes('NaN'));}
assert.equal(calls,0,'rendering or restoring a lesson never invokes a gameplay action');
const html=(step,extra={})=>renderToStaticMarkup(React.createElement(Component,{...props,...extra,state:{...startTutorial('DEMO'),step}}));
assert.match(html('week'),/\$505/);assert.match(html('week',{p:{...p,housing:1}}),/\$705/);
assert.match(html('activity',{active:false}),/disabled=""/);assert.match(html('activity',{active:false,g:{...game,mode:'online'}}),/Actions are available on your turn/);
assert.match(html('paths'),/strongest path/);assert.match(html('paths',{p:{...p,rulesVersion:undefined}}),/classic save/);
assert.match(html('weather'),/Two weeks each/);assert.match(html('weather',{g:{...game,environmentVersion:undefined}}),/no seasonal weather/);
assert.match(html('travel',{menu:'places'}),/Visit The Shift/);

// A deterministic hook harness exercises real initialization/replay/storage effects, without a browser.
const records=new Map();let now=1000;const clock={now:()=>now};
function harness(storage={getItem:k=>records.get(k)||null,setItem:(k,v)=>records.set(k,v)}){
 const slots=[],deps=[];let cursor=0,effects=[],rendered;
 const hooks={useRef(value){const i=cursor++;return slots[i]??(slots[i]={current:value});},useState(value){const i=cursor++;if(!(i in slots))slots[i]=value;return[slots[i],v=>{slots[i]=typeof v==='function'?v(slots[i]):v;}];},useEffect(fn,next){const i=cursor++;if(!deps[i]||next.some((v,j)=>v!==deps[i][j])){deps[i]=next;effects.push(fn);}}};
 const {useGameTutorial}=load(hooks,storage,clock);
 return {render(room,replay,offer){for(let loop=0;loop<3;loop++){cursor=0;effects=[];rendered=useGameTutorial(room,replay,offer);for(const effect of effects)effect();}return rendered;}};
}
let h=harness(),result=h.render('FIRST',0,true);assert.equal(result.state.step,'welcome');assert.equal(JSON.parse(records.get(TUTORIAL_STORAGE_KEY)).step,'welcome','offered invitation persists before first click');
h=harness();result=h.render('FIRST',0,false);assert.equal(result.visible,true,'reload during initial Chronicle preserves invitation');
result.send('next');result=h.render('FIRST',0,false);assert.equal(result.state.step,'resources');result.send('next');result=h.render('FIRST',0,false);assert.equal(result.state.step,'resources','rapid repeated clicks do not skip lessons');
now+=400;result.send('next');result=h.render('FIRST',0,false);assert.equal(result.state.step,'travel');result.send('arrived');result=h.render('FIRST',0,false);assert.equal(result.state.step,'activity');
h=harness();result=h.render('FIRST',0,false);assert.equal(result.state.step,'travel','unpersisted dialog is recoverable after reload');
result.send('skip');result=h.render('FIRST',0,false);assert.equal(result.visible,false);result=h.render('FIRST',1,false);assert.equal(result.state.step,'resources');assert.equal(result.visible,true);
const broken={getItem(){throw Error('blocked storage')},setItem(){throw Error('quota exceeded')}};h=harness(broken);result=h.render('PRIVATE',0,true);result.send('skip');assert.equal(h.render('PRIVATE',0,true).visible,false);
records.clear();h=harness();assert.equal(h.render('EXISTING',0,false).visible,false);assert.equal(records.size,0,'existing saves never write a synthetic skip preference');
console.log('PASS: every tutorial panel server-renders, classic/weather/weekly-bill/online copy and disabled actions; real hook invitation-before-click reload, duplicate clicks, dialog recovery, skip/replay and blocked storage');
