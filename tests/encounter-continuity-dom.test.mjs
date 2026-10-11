import assert from 'node:assert/strict';
import {after, test} from 'node:test';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {buildSync} from 'esbuild';
import {JSDOM} from 'jsdom';
import {currentGame} from './current-fixture.mjs';
import {move} from '../lib/game.ts';
import {getEnsembleView} from '../lib/ensemble-story.ts';

// Real DOM events and React Strict Mode at a narrow viewport. JSDOM does not
// establish visual browser layout, touch, clipping or pixel-level acceptance.
const dom = new JSDOM('<!doctype html><html><body></body></html>', {url:'https://test.invalid/'});
Object.defineProperty(dom.window,'innerWidth',{value:320});
dom.window.matchMedia=()=>({matches:true,addEventListener(){},removeEventListener(){}});
const scrolled=[];
dom.window.HTMLElement.prototype.scrollIntoView=function(options){scrolled.push({element:this,options});};
const previous=new Map();
for(const [key,value] of Object.entries({window:dom.window,document:dom.window.document,navigator:dom.window.navigator,HTMLElement:dom.window.HTMLElement,Node:dom.window.Node,MutationObserver:dom.window.MutationObserver,IS_REACT_ACT_ENVIRONMENT:true})){
 previous.set(key,Object.getOwnPropertyDescriptor(globalThis,key));Object.defineProperty(globalThis,key,{configurable:true,writable:true,value});
}
after(()=>{dom.window.close();for(const [key,value] of previous){if(value)Object.defineProperty(globalThis,key,value);else delete globalThis[key];}});
const React=await import('react'),{createRoot}=await import('react-dom/client'),{act,createElement:h,StrictMode}=React;
const compiled=buildSync({stdin:{contents:"export {EnsembleStories} from './app/ensemble-story.tsx'; export {PersonResponseStage} from './app/person-response.tsx'; export {StoryChoiceDeck,useEncounterCommit} from './app/story-choices.tsx';",resolveDir:fileURLToPath(new URL('../',import.meta.url)),sourcefile:'encounter-dom-entry.ts'},bundle:true,write:false,platform:'node',format:'cjs',packages:'external',logLevel:'silent',define:{'import.meta.env.BASE_URL':'"/"'},loader:{'.css':'empty'}}).outputFiles[0].text;
const module={exports:{}};new Function('require','module','exports',compiled)(createRequire(import.meta.url),module,module.exports);
const {EnsembleStories,PersonResponseStage,useEncounterCommit}=module.exports;
async function mounted(t,Component,props){const element=document.createElement('div');document.body.append(element);const root=createRoot(element);let closed=false;const render=async next=>act(async()=>root.render(h(StrictMode,null,h(Component,next))));await render(props);const unmount=async()=>{if(!closed){closed=true;await act(async()=>root.unmount());element.remove();}};t.after(unmount);return{element,render,unmount};}
const click=async button=>{assert.ok(button,'the requested control is visible');button.focus();await act(async()=>button.click());};
const button=(root,text)=>[...root.querySelectorAll('button')].find(b=>b.textContent.includes(text));
function fixture(){const g=currentGame(),p=g.players[0];p.place='APARTMENTS';return{g,p};}

test('Nell’s exact choice and confirmed reply stay together until a free explicit continuation',async t=>{
 const {g,p}=fixture();let resolve,calls=0;
 const props={g,p,disabled:false,storyId:'bracken',selectedVenue:p.place,onVisit(){throw Error('Unexpected travel');},onAction:()=>{calls++;return new Promise(done=>resolve=done);}};
 const ui=await mounted(t,EnsembleStories,props),choice=getEnsembleView(g,p,'bracken',p.place).scenes.find(s=>s.id==='bracken').choices[0];
 const opening=getEnsembleView(g,p,'bracken',p.place).scenes.find(s=>s.id==='bracken');
 assert.ok(opening.opening.speech.length>100,'the actual authored opening is a full paragraph');
 const narrative=ui.element.querySelector('.person-narrative');assert.ok(narrative.textContent.includes(opening.body));assert.equal(narrative.closest('details'),null,'essential situation is visible before any choice');
 assert.ok(ui.element.querySelector('.person-speech').textContent.includes(opening.opening.speech));
 const question=ui.element.querySelector('.person-clarification summary');assert.ok(question.textContent.includes(opening.clarification.question));await click(question);assert.equal(calls,0,'a local follow-up question does not spend a turn or call the server');
 assert.ok(ui.element.querySelector('.person-clarification').textContent.includes(opening.clarification.answer));
 assert.equal(ui.element.querySelectorAll('.person-scene').length,1);
 assert.ok(ui.element.querySelector('.person-scene .story-choice-deck'),'the choices belong to the scene');
 assert.equal(ui.element.querySelector('.person-action-echo'),null);
 await click(button(ui.element,'Choose: '+choice.title));
 await click(button(ui.element,'Saving your response'));
 assert.equal(calls,1);assert.equal(ui.element.querySelector('.person-action-echo'),null);
 const next=structuredClone(g);move(next,choice.actionId);
 await act(async()=>resolve(next));await ui.render({...props,g:next,p:next.players[0]});
 const scene=ui.element.querySelector('.person-scene'),echo=scene.querySelector('.person-action-echo');
 assert.ok(echo.textContent.includes(choice.title));
 assert.ok(scene.textContent.includes(next.players[0].ensemble.receipts.at(-1).response.speech));
 assert.ok(scene.textContent.includes(next.players[0].ensemble.receipts.at(-1).outcome));
 assert.equal(scene.querySelector('.story-choice-deck'),null,'new choices cannot replace the result while reading');
 assert.equal(document.activeElement,scene,'confirmed scene receives focus');
 const scrollCount=scrolled.length;assert.ok(scrollCount>0);assert.equal(scrolled.at(-1).options.behavior,'auto');
 await ui.render({...props,g:structuredClone(next),p:structuredClone(next.players[0])});
 assert.equal(scrolled.length,scrollCount,'polling does not replay focus or scroll');
 const hours=next.players[0].hours,continueButton=button(ui.element,'Continue conversation');continueButton.focus();await act(async()=>{continueButton.click();continueButton.click();});
 assert.equal(calls,1);assert.equal(next.players[0].hours,hours,'reading the next scene costs no time');
 assert.ok(ui.element.querySelector('.person-scene .story-choice-deck'));
 assert.ok(ui.element.textContent.includes('The drum has three invitations'));
 assert.equal(ui.element.querySelector('.person-action-echo'),null);
 await ui.unmount();
 const resumed=await mounted(t,EnsembleStories,{...props,g:next,p:next.players[0]});
 assert.equal(resumed.element.querySelector('.person-action-echo'),null,'stored history does not impersonate a fresh confirmation');
});

test('unconfirmed and abandoned requests cannot show an action echo or a private success',async t=>{
 const {g,p}=fixture();let resolve,calls=0;
 const props={g,p,disabled:false,storyId:'bracken',selectedVenue:p.place,onVisit(){},onAction:()=>{calls++;return new Promise(done=>resolve=done);}};
 const ui=await mounted(t,EnsembleStories,props);await click(button(ui.element,'Choose:'));
 await act(async()=>resolve(undefined));assert.equal(ui.element.querySelector('.person-action-echo'),null);assert.match(ui.element.textContent,/wasn’t confirmed/);
 await click(button(ui.element,'Choose:'));assert.equal(calls,2);
 const next=structuredClone(g),choice=getEnsembleView(g,p,'bracken',p.place).scenes.find(s=>s.id==='bracken').choices[0];move(next,choice.actionId);
 await ui.unmount();const count=scrolled.length;await act(async()=>resolve(next));assert.equal(scrolled.length,count);
 const hidden=await mounted(t,PersonResponseStage,{g,p:{...p,castRedacted:true},actorId:'nell_harper',name:'Nell',spot:p.place,receipt:{actionTitle:'SECRET CHOICE',title:'SECRET TITLE',body:'SECRET BODY',response:{speakerId:'nell_harper',speech:'SECRET SPEECH',activity:'SECRET ACTIVITY',emotion:'warm',gesture:'point'}}});
 assert.doesNotMatch(hidden.element.textContent,/SECRET/);assert.equal(hidden.element.querySelector('.person-action-echo'),null);
});


test('late results after a room, seat, person or venue switch never speak or focus the replacement',async t=>{
 for(const boundary of ['room','seat','person','venue']){
  const {g,p}=fixture();let resolve,calls=0;
  const choice={id:'question',actionId:'cast:1:nell_harper:listen',title:'Ask about the room',body:'Listen to her answer.',available:true,reason:'',previewText:[],cost:{time:1,cash:0,energy:0}};
  const receipt={id:'accepted',actionId:choice.actionId,title:'The answer',body:'PRIVATE RESULT',response:{speakerId:'nell_harper',speech:'PRIVATE REPLY',activity:'PRIVATE GESTURE',emotion:'warm',gesture:'point'}};
  function Probe({game,player,actorId='nell_harper'}){
   const context=[game.code,player.id,game.round,player.place,actorId].join('|');
   const commit=useEncounterCommit({g:game,p:player,disabled:false,context,choices:[choice],onAction:()=>{calls++;return new Promise(done=>resolve=done);},findReceipt:()=>receipt});
   return h('div',{className:'encounter-panel'},h(PersonResponseStage,{g:game,p:player,actorId,name:actorId,spot:player.place,pending:commit.busy,receipt:commit.receipt,error:commit.error},h('button',{onClick:()=>commit.commit(choice)},'Choose question')));
  }
  const ui=await mounted(t,Probe,{game:g,player:p});await click(button(ui.element,'Choose question'));assert.equal(calls,1);
  const next=structuredClone(g);if(boundary==='room')next.code='OTHER';if(boundary==='seat')next.players[0].id='other-seat';if(boundary==='venue')next.players[0].place='THE PARK';
  await ui.render({game:next,player:next.players[0],actorId:boundary==='person'?'jo':'nell_harper'});
  const before=scrolled.length;await act(async()=>resolve(g));
  assert.doesNotMatch(ui.element.textContent,/PRIVATE/);assert.equal(ui.element.querySelector('.person-action-echo'),null);assert.equal(scrolled.length,before,boundary+' does not receive the old focus');
  await ui.unmount();
 }
});
