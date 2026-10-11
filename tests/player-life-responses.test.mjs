import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url)).replace(/\/$/,''),require=createRequire(root+'/package.json'),React=require('react'),ts=require('typescript');
const G=require(root+'/lib/game.ts'),L=require(root+'/lib/life-events.ts');
const source=ts.transpileModule(fs.readFileSync(root+'/app/life-story.tsx','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ESNext,jsx:ts.JsxEmit.ReactJSX}}).outputText;
const fake=name=>Object.assign(()=>null,{displayName:name});
function nodes(n,fn,out=[]){if(Array.isArray(n)){n.forEach(v=>nodes(v,fn,out));return out;}if(!n||typeof n!=='object')return out;if(fn(n))out.push(n);nodes(n.props?.children,fn,out);return out;}
function text(n){return Array.isArray(n)?n.map(text).join(''):n&&typeof n==='object'?text(n.props?.children):n==null||typeof n==='boolean'?'':String(n);}
function room(seed=15){const p=G.player('Alex'),g={code:'LIFERE',mode:'hotseat',host:'owner',members:{owner:[p.id]},players:[p],status:'playing',round:1,turn:0,maxRounds:8,log:[],seen:[],event:0,rulesVersion:2,lifeVersion:1};L.initializeLife(g,seed);return g;}
function harness(onAction){let g=room(),slots=[],deps=[],cleanups=[],cursor=0,dirty=true,effects=[],tree,alive=true;
 const hooks={...React,useRef(v){const i=cursor++;return slots[i]??(slots[i]={current:v});},useState(v){const i=cursor++;if(!(i in slots))slots[i]=typeof v==='function'?v():v;return[slots[i],next=>{slots[i]=typeof next==='function'?next(slots[i]):next;dirty=true;}];},useEffect(fn,d){const i=cursor++;if(!deps[i]||d?.some((v,j)=>v!==deps[i][j])){deps[i]=d;effects.push(()=>{cleanups[i]?.();cleanups[i]=fn();});}}};
 const mod={exports:{}},stage=fake('PersonResponseStage'),stubs={'./person-response':{PersonResponseStage:stage},'./cast-story':{CastJournal:fake('CastJournal')},'./story-timeline':{StoryTimeline:fake('StoryTimeline')},'./game-painting':{__esModule:true,default:fake('GamePainting')}};
 vm.runInNewContext(source,{module:mod,exports:mod.exports,structuredClone,require:id=>id==='react'?hooks:stubs[id]??(id.startsWith('@/')?require(root+'/'+id.slice(2)+'.ts'):id==='./game-art'?require(root+'/app/game-art.ts'):require(id))});
 const props=()=>({g,p:g.players[0],disabled:false,onAction:async id=>{if(onAction)return onAction(id,g);const next=structuredClone(g);G.move(next,id);g=next;dirty=true;return next;}});
 function render(){let n=0;while(dirty&&alive){assert.ok(++n<20);dirty=false;cursor=0;effects=[];const outer=mod.exports.LifeJournal(props());tree=outer.type(outer.props);for(const effect of effects)effect();}return tree;}
 async function settle(){for(let i=0;i<8;i++){render();await Promise.resolve();}}
 const h={async click(label){render();const b=nodes(tree,n=>n.type==='button'&&text(n).includes(label))[0];assert.ok(b,label);assert.ok(!b.props.disabled);b.props.onClick();await settle();},get g(){return g;},get text(){render();return text(tree);},get stage(){render();return nodes(tree,n=>n.type===stage)[0];},update(next){g=next;dirty=true;render();},settle,unmount(){alive=false;cleanups.forEach(fn=>fn?.());}};render();return h;
}
test('life aspirations show a grounded player response only after persisted confirmation',async()=>{const h=harness();await h.click('Work that matters');assert.match(h.text,/chosen direction|put.*direction|name the direction/);assert.ok(h.g.players[0].familiarity);assert.equal(h.stage,undefined);});
test('legacy check-in shows a direct named response with confirmed receipt and explicit remote context',async()=>{const h=harness();await h.click('Check in with Mina');assert.ok(h.stage);assert.equal(h.stage.props.actorId,'mina');assert.equal(h.stage.props.remote,true);assert.equal(h.stage.props.receipt.actionId,'repair:mina');assert.equal(h.g.players[0].familiarity.people.mina.count,1);assert.doesNotMatch(h.text,/Your choice is part of your story/);});
test('unchanged, missing, failed and stale-life responses cannot claim success',async()=>{for(const action of [async()=>undefined,async(id,g)=>structuredClone(g),async()=>{throw Error('offline');}]){const h=harness(action);await h.click('Check in with Mina');assert.equal(h.stage,undefined);assert.match(h.text,/wasn’t confirmed/);}let resolve;const h=harness(()=>new Promise(r=>resolve=r));const old=structuredClone(h.g);const pending=h.click('Check in with Mina');await h.settle();const other=structuredClone(old);other.code='OTHER';h.update(other);G.move(old,'repair:mina');resolve(old);await pending;assert.equal(h.stage,undefined);assert.doesNotMatch(h.text,/Your choice is part of your story/);});

test('authored life-event counterpart gives an explicit private follow-up reply',async()=>{
 const {lifeEventPersonActor}=require(root+'/lib/person-event-responses.ts');let selected;
 for(let seed=1;seed<=100&&!selected;seed++){const g=room(seed),p=g.players[0];g.round=2;L.beginLifeWeek(g);p.cash=10000;p.skill=6;p.social=12;p.craft=8;const c=L.lifeChoices(p,g).find(c=>c.available&&lifeEventPersonActor('event:'+c.id,p));if(c)selected={g,c,actor:lifeEventPersonActor('event:'+c.id,p)};}
 assert.ok(selected);const h=harness();h.update(selected.g);await h.click(selected.c.title);assert.ok(h.stage);assert.equal(h.stage.props.actorId,selected.actor);assert.equal(h.stage.props.remote,true);assert.equal(h.stage.props.receipt.response.speakerId,selected.actor);assert.equal(h.stage.props.receipt.familiarity.count,1);
});
