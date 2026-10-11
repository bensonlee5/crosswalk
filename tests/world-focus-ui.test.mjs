import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import vm from 'node:vm';
import ts from 'typescript';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {createGame} from '../supabase/functions/crosswalk-game/game-service.ts';
import {move} from '../lib/game.ts';
import {worldView,worldPlaceIds} from '../lib/world-life.ts';
import {sharedOpportunityView} from '../lib/shared-opportunities.ts';
const require=createRequire(import.meta.url),root=new URL('..',import.meta.url).pathname.replace(/\/$/,'');
const component=name=>Object.assign(()=>null,{displayName:name});
const Deck=component('StoryChoiceDeck'),Outcome=component('EncounterOutcome'),Person=component('PersonResponseStage');
const find=(node,predicate)=>Array.isArray(node)?node.flatMap(n=>find(n,predicate)):!node||typeof node!=='object'?[]:[...(predicate(node)?[node]:[]),...find(node.props?.children,predicate)];
function fixture(){const g=createGame({op:'create',mode:'hotseat',names:['Worker'],ownerSession:'00000000-0000-4000-8000-000000000001',requestId:crypto.randomUUID(),careerMode:'venue',supportedRules:['venue-careers-v1']},'FOCUS'),p=g.players[0];p.world.discoveredPlacesByRegion.alder=[...worldPlaceIds];p.world.discoveredRegions.push('saffron');return{g,p};}
function harness(initial){
 const slots=[],deps=[],cleanups=[];let cursor=0,dirty=true,effects=[],tree,props=initial;
 const hooks={...React,useRef(value){const i=cursor++;return slots[i]??(slots[i]={current:value});},useState(value){const i=cursor++;if(!(i in slots))slots[i]=typeof value==='function'?value():value;return[slots[i],next=>{const value=typeof next==='function'?next(slots[i]):next;if(!Object.is(value,slots[i])){slots[i]=value;dirty=true;}}];},useEffect(fn,next){const i=cursor++;if(!deps[i]||!next||next.some((v,j)=>!Object.is(v,deps[i][j]))){deps[i]=next;effects.push(()=>{cleanups[i]?.();cleanups[i]=fn();});}}};
 const modules=new Map();function load(name){if(modules.has(name))return modules.get(name).exports;const mod={exports:{}};modules.set(name,mod);const js=ts.transpileModule(readFileSync(root+'/app/'+name+'.tsx','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ESNext,jsx:ts.JsxEmit.ReactJSX}}).outputText;vm.runInNewContext(js,{module:mod,exports:mod.exports,require:id=>id==='react'?hooks:id==='./game-painting'?{__esModule:true,default:component('GamePainting')}:id==='./person-response'?{PersonResponseStage:Person}:id==='./story-choices'&&name==='world-story'?{...load('story-choices'),StoryChoiceDeck:Deck,EncounterOutcome:Outcome}:id==='./encounter-panel'?{worldEncounterChoice:(c)=>({id:c.id,actionId:'world:'+c.id,title:c.title,body:c.body,available:c.available,reason:c.reason,previewText:c.previewText,cost:{time:c.time,cash:c.cost,energy:0}})}:id.startsWith('@/')?require(root+'/'+id.slice(2)+'.ts'):id.startsWith('./')?load(id.slice(2)):require(id)});return mod.exports;}
 const World=load('world-story').default;
 function render(){let loops=0;while(dirty){assert.ok(++loops<20);dirty=false;cursor=0;effects=[];tree=World(props);for(const fn of effects)fn();}return tree;}
 render();return{get tree(){return tree;},render,update(next){props={...props,...next};dirty=true;render();},async settle(){for(let i=0;i<5;i++){render();await Promise.resolve();}render();},unmount(){for(const cleanup of cleanups)cleanup?.();}};
}
test('requested current choice is the only rendered deck and rendering never commits',()=>{
 const {g,p}=fixture(),route=worldView(p,g).choices.find(c=>c.key==='travel:saffron'),before=JSON.stringify(g),h=harness({g,p,focusChoiceId:route.id,disabled:false,onAction(){throw Error('Navigation committed');}});
 const decks=find(h.tree,n=>n.type===Deck);assert.equal(decks.length,1);assert.equal(decks[0].props.choices.length,1);assert.equal(decks[0].props.choices[0].id,route.id);assert.equal(JSON.stringify(g),before);
 const focus=find(h.tree,n=>n.props?.['aria-label']==='Requested opportunity')[0];assert.equal(focus.props['data-focus-choice-id'],route.id);
 const html=renderToStaticMarkup(h.tree);assert.doesNotMatch(html,/People and promises|Orders and shared rooms|Beyond Alder/);h.unmount();
});
test('expired focus shows an honest changed-opportunity notice and cannot choose a different option',()=>{
 const {g,p}=fixture(),h=harness({g,p,focusChoiceId:'expired-choice',disabled:false,onAction(){throw Error('Stale focus committed');}});assert.equal(find(h.tree,n=>n.type===Deck).length,0);assert.match(renderToStaticMarkup(h.tree),/opportunity has changed/);h.unmount();
});
test('focused shared preview retains the confirmed host response and exact receipt after commit',async()=>{
 const {g,p}=fixture();p.place='CORNER CAFÉ';const shared=sharedOpportunityView(g,p).choices.find(c=>c.kind==='prepare'&&c.available);assert.ok(shared);let calls=0;const h=harness({g,p,focusChoiceId:shared.id,disabled:false,onAction:async id=>{calls++;const next=structuredClone(g);move(next,id);return next;}});
 const deck=find(h.tree,n=>n.type===Deck)[0];deck.props.onCommit(deck.props.choices[0]);deck.props.onCommit(deck.props.choices[0]);await h.settle();assert.equal(calls,1);const person=find(h.tree,n=>n.type===Person)[0];assert.ok(person);assert.equal(person.props.actorId,shared.actorId);assert.equal(person.props.receipt.actionId,shared.actionId);assert.ok(person.props.receipt.response.speech);assert.equal(person.props.spot,'CORNER CAFÉ');assert.equal(find(h.tree,n=>n.type===Outcome)[0].props.compact,true);h.unmount();
});
test('focused unavailable location and disabled callbacks cannot submit',async()=>{
 for(const disabled of [false,true]){const {g,p}=fixture();const choice=sharedOpportunityView(g,p).choices.find(c=>c.kind==='prepare');assert.ok(choice);assert.equal(choice.available,false);let calls=0;const h=harness({g,p,focusChoiceId:choice.id,disabled,onAction:async()=>{calls++;}});const deck=find(h.tree,n=>n.type===Deck)[0];assert.equal(deck.props.choices[0].available,false);deck.props.onCommit(deck.props.choices[0]);await h.settle();assert.equal(calls,0);h.unmount();}
});
test('late world response after unmount cannot revive the host reply',async()=>{
 const {g,p}=fixture();p.place='CORNER CAFÉ';const choice=sharedOpportunityView(g,p).choices.find(c=>c.kind==='prepare'&&c.available);let answer;const h=harness({g,p,focusChoiceId:choice.id,disabled:false,onAction:()=>new Promise(resolve=>answer=resolve)});const deck=find(h.tree,n=>n.type===Deck)[0];deck.props.onCommit(deck.props.choices[0]);h.render();h.unmount();const next=structuredClone(g);move(next,choice.actionId);answer(next);await h.settle();assert.equal(find(h.tree,n=>n.type===Person).length,0);
});
