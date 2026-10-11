import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import vm from 'node:vm';
import {activityIntent,decisionIllustration,isQuietEffect,narrativeExpectation} from '../lib/decision-presentation.ts';
import {actions} from '../lib/game.ts';
const root=fileURLToPath(new URL('..',import.meta.url)).replace(/\/$/,''),require=createRequire(root+'/package.json'),ts=require('typescript'),React=require('react'),{renderToStaticMarkup}=require('react-dom/server');
const loaded=new Map();
function load(file){if(loaded.has(file))return loaded.get(file).exports;const module={exports:{}};loaded.set(file,module);const js=ts.transpileModule(readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ESNext,jsx:ts.JsxEmit.ReactJSX}}).outputText;vm.runInNewContext(js,{exports:module.exports,module,require:id=>id.endsWith('.css')?{}:id==='./game-painting'?{__esModule:true,default:props=>React.createElement('img',{src:props.src,alt:props.alt})}:id.startsWith('@/')?require(root+'/'+id.slice(2)+'.ts'):id.startsWith('./')?load(root+'/app/'+id.slice(2)+'.tsx'):require(id)});return module.exports;}
for(const line of ['+5 happiness','−3 energy','+2 connections','Jo trust -1','+1 bond with Neri'])assert.equal(isQuietEffect(line),true,line);
for(const line of ['+$180 cash','−$85 cash','1 priority block','Permanently close here: CINEMA','A promise for month 3; one block then.','A disagreement to repair; no lost money.','Needs 8 energy','Unlocks work at 3 craft'])assert.equal(isQuietEffect(line),false,line);
assert.equal(narrativeExpectation('Pay $85. +12 energy, +8 happiness. Cinema closes permanently.'),'Pay $85. Renewed energy, a lift in spirits. Cinema closes permanently.');
assert.equal(narrativeExpectation('−8 energy. $144 for eight meetups. +5 happiness.'),'Tiring. $144 for eight meetups. A lift in spirits.');
assert.equal(narrativeExpectation('Give up the $120 conversion fee; later chapters stay open.'),'Give up the $120 conversion fee; later chapters stay open.');
for(const a of actions){assert.ok(activityIntent(a).length>10);assert.ok(!/\+\d/.test(activityIntent(a)));}
for(const region of ['alder','embermesa','glasssteppe','saffron','pelagia'])for(const kind of ['travel','relocate']){const art=decisionIllustration({id:'x',actionId:`world:3:4:${kind}:${region}`,title:'Visit',body:''});assert.equal(art.src,`/paintings/world/${region}.webp`);assert.ok(existsSync(root+'/public'+art.src));}
for(const key of ['listen','promise','release','renegotiate','rush','quiet']){const art=decisionIllustration({id:'x',actionId:'cast:1:mina:'+key,title:key,body:''},'CORNER CAFÉ');assert.ok(art.src.startsWith('/paintings/decisions/'));assert.ok(existsSync(root+'/public'+art.fallback));}
const {StoryChoiceDeck}=load(root+'/app/story-choices.tsx');
const choice={id:'one',actionId:'cast:1:mina:promise',title:'Say yes to next month',body:'A month of shared preparation. +5 happiness.',available:true,reason:'',cost:{time:1,cash:144,energy:4},previewText:['+5 happiness','+2 connections','A promise for month 3; one block then.','Permanently close here: CINEMA','+$180 cash']};
const render=props=>renderToStaticMarkup(React.createElement(StoryChoiceDeck,{choices:[choice,{...choice,id:'two',actionId:'cast:1:mina:release',title:'Be honest about your limits'}],disabled:false,busy:false,onCommit:()=>{throw Error('Rendering must never commit')},...props}));
const html=render({});
assert.match(html,/aria-pressed="true"/);assert.match(html,/role="group" aria-label="Possible responses"/);assert.ok(html.indexOf('<img')<html.indexOf('<strong>Say yes'));
assert.match(html,/<details class="choice-effect-details"><summary>How this may feel<\/summary>/);
const visible=html.replace(/<details class="choice-effect-details">[\s\S]*?<\/details>/g,'');
assert.ok(!visible.includes('+5 happiness'));assert.ok(!visible.includes('+2 connections'));assert.ok(visible.includes('$144 upfront'));assert.ok(visible.includes('A little effort'));assert.ok(visible.includes('Permanently close here: CINEMA'));assert.ok(visible.includes('A promise for month 3'));assert.ok(visible.includes('+$180 cash'));
for(const props of [{busy:true},{disabled:true},{isSubmitted:()=>true},{choices:[{...choice,available:false,reason:'Needs more time'}]}])assert.match(render(props),/class="encounter-commit" disabled=""/);
assert.ok(!html.includes('class="choice-effect-details" open'));
const screen=readFileSync(root+'/app/game-screen.tsx','utf8');assert.ok(screen.indexOf('<div className="game-activity-grid"')<screen.indexOf('<div className="game-action-detail"'),'DOM selection order matches visual and keyboard order');assert.match(screen,/monthlyPriceBreakdown\(p,option,g\)/);assert.match(screen,/<ChoiceTerms p=\{p\} a=\{a\} g=\{g\}\/>/);assert.match(screen,/summary>How this may feel/);
const css=readFileSync(root+'/app/image-choices.css','utf8');assert.match(css,/@media\(max-width:380px\)/);assert.match(css,/focus-visible/);assert.match(css,/prefers-reduced-motion/);assert.match(css,/min-height:44px/);
console.log('PASS: image-led response rendering, native closed effect disclosure, labelled selection, disabled commits, money/time/energy/commitment visibility, all region artwork, relationship fallback, mobile/focus CSS and unchanged monthly pricing hooks. Pointer/keyboard interaction and visual layout require browser QA.');
// Controlled hooks exercise selection separately from submission without a DOM.
let selected='',committed=[];
const hooks={...React,useState:()=>[selected,value=>{selected=value}]};
const module={exports:{}},code=ts.transpileModule(readFileSync(root+'/app/story-choices.tsx','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ESNext,jsx:ts.JsxEmit.ReactJSX}}).outputText;
vm.runInNewContext(code,{module,exports:module.exports,require:id=>id==='react'?hooks:id==='./game-painting'?{__esModule:true,default:'img'}:id.startsWith('@/')?require(root+'/'+id.slice(2)+'.ts'):require(id)});
const alternatives=[choice,{...choice,id:'two',actionId:'cast:1:mina:release',title:'Be honest about your limits'}];
const tree=()=>module.exports.StoryChoiceDeck({choices:alternatives,disabled:false,busy:false,onCommit:c=>committed.push(c.id)});
const elements=node=>!node||typeof node!=='object'?[]:Array.isArray(node)?node.flatMap(elements):[node,...elements(node.props?.children)];
let nodes=elements(tree());nodes.find(n=>n.type==='button'&&n.key==='two').props.onClick();assert.deepEqual(committed,[],'Selecting a picture never submits');
nodes=elements(tree());assert.equal(nodes.find(n=>n.props?.['data-choice-id']).props['data-choice-id'],'two');assert.equal(nodes.find(n=>n.props?.className==='choice-effect-details').key,'two','Switching intent resets effect disclosure');nodes.find(n=>n.props?.className==='encounter-commit').props.onClick();assert.deepEqual(committed,['two'],'Only the separate confirmation submits the selected intent');
console.log('PASS: controlled-hook selection switches pictured intent, resets disclosure, and submits only through the separate confirmation.');

const sharedBody='Pay $45 now. Collect the supper after preparation, or cancel before preparation for a full refund.';
for(const conversational of [false,true]){
 const shared={...choice,id:'shared:1:0:alder:order',actionId:'world:shared:1:0:alder:order',body:sharedBody,previewText:['$45 upfront',sharedBody,'The host keeps your order.']};
 const markup=render({choices:[shared],conversational});
 assert.equal(markup.split(sharedBody).length-1,1,'Shared terms appear once in both the Places and person view');
 assert.ok(markup.includes('$45 upfront'));assert.ok(markup.includes('The host keeps your order.'));
}
