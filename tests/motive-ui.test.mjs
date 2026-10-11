import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import vm from 'node:vm';
import {motivePortrait} from '../lib/motive-portraits.ts';
import {motiveScene} from '../lib/character-motives.ts';
import {createGame} from '../supabase/functions/crosswalk-game/game-service.ts';
import {move} from '../lib/game.ts';
import {getStoryView} from '../lib/story-arcs.ts';
const root=new URL('..',import.meta.url).pathname.replace(/\/$/,''),require=createRequire(root+'/package.json'),ts=require('typescript'),React=require('react'),{renderToStaticMarkup}=require('react-dom/server');
const loaded=new Map();
function load(file){if(loaded.has(file))return loaded.get(file).exports;const module={exports:{}};loaded.set(file,module);const js=ts.transpileModule(readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ESNext,jsx:ts.JsxEmit.ReactJSX}}).outputText;vm.runInNewContext(js,{exports:module.exports,module,require:id=>id==='./game-painting'?{__esModule:true,default:props=>React.createElement('img',{src:props.src,alt:props.alt})}:id==='./game-art'?require(root+'/app/game-art.ts'):id.startsWith('@/')?require(root+'/'+id.slice(2)+'.ts'):id.startsWith('./')?load(root+'/app/'+id.slice(2)+'.tsx'):require(id)});return module.exports;}
const UI=load(root+'/app/character-motives.tsx'),History=load(root+'/app/character-history.tsx').CharacterHistory;
const render=(Component,props)=>renderToStaticMarkup(React.createElement(Component,props));
function fixture(){const g=createGame({mode:'hotseat',names:['Tester'],ownerSession:'owner',requestId:'motive-ui'},'MOTIVE');g.round=2;const p=g.players[0];p.life.relationships.mina.history=['An earlier conversation.'];p.place=getStoryView(g,p).scenes[0].spot;p.world.discoveredPlacesByRegion.alder.push(p.place);return{g,p};}

test('motives render only current context, never counters or facial emotion forecasts',()=>{
 const {g,p}=fixture(),base={g,p,actorId:'mina',spot:p.place,disabled:false,onAction(){throw Error('Rendering sent a move')}};
 let before=JSON.stringify(g),html=render(UI.CharacterMotives,base);assert.equal(JSON.stringify(g),before);
 assert.match(html,/What Mina has room for/);assert.match(html,/one bounded exchange|one bounded/i);
 assert.doesNotMatch(html,/mina-(?:sadness|envy|love|anger)\.webp|earnedWeeks|contributions|trust[: +−]|commitment[: ](?:steady|bounded|tentative)|NaN|undefined/);
 const choice=motiveScene(g,p,'mina').choices.find(c=>c.key==='help');move(g,choice.id);
 before=JSON.stringify(g);html=render(UI.CharacterMotives,base);assert.equal(JSON.stringify(g),before);
 assert.match(html,/mina-envy\.webp/);assert.match(html,/envying people/);assert.doesNotMatch(html,/Choose: /);assert.match(html,/Let it settle/);
 const reloaded=JSON.parse(JSON.stringify(g));assert.equal(render(UI.CharacterMotives,{...base,g:reloaded,p:reloaded.players[0]}),html);
 const journal=render(UI.MotiveJournal,{g,p});assert.match(journal,/Mina/);assert.match(journal,/envying people/);
 assert.equal(render(UI.CharacterMotives,{...base,p:{...p,castRedacted:true}}),'');assert.equal(render(UI.MotiveJournal,{g,p:{...p,castRedacted:true}}),'');
assert.equal(render(UI.CharacterMotives,{...base,spot:'APARTMENTS'}),'');
 const ages=render(History,{g,p,actorId:'jo'});assert.match(ages,/Age 54/);assert.match(ages,/Kit’s parent/);assert.doesNotMatch(ages,/thank-you notice omitted/,'The public family fact does not disclose gated incidents');
});

test('direct-expression failure falls back to the same person; absent receipt shows no expression',()=>{
 let failed='';const module={exports:{}},Neutral=()=>null;
 const js=ts.transpileModule(readFileSync(root+'/app/character-motives.tsx','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ESNext,jsx:ts.JsxEmit.ReactJSX}}).outputText;
 vm.runInNewContext(js,{exports:module.exports,module,require:id=>id==='react'?{useState:()=>[failed,value=>{failed=value;}]}:id==='./character-portrait'?{__esModule:true,default:Neutral}:id==='@/lib/asset-url'?{assetUrl:path=>'/crosswalk/'+path.replace(/^\//,'')}:id==='@/lib/motive-portraits'?{motivePortrait}:id==='./story-choices'||id==='./person-response'?{}:id.startsWith('@/')?require(root+'/'+id.slice(2)+'.ts'):require(id)});
 const Portrait=module.exports.MotiveOutcomePortrait;assert.equal(Portrait({name:'Mina'}),null);
 const receipt={actorId:'mina',emotion:'envy'},image=Portrait({receipt,name:'Mina'});assert.equal(image.type,'img');assert.equal(image.props.src,'/crosswalk/paintings/character-expressions/mina-envy.webp');
 image.props.onError();const neutral=Portrait({receipt,name:'Mina'});assert.equal(neutral.type,Neutral);assert.equal(neutral.props.id,'mina');assert.equal(neutral.props.name,'Mina');
 assert.equal(Portrait({receipt:{actorId:'jo',emotion:'anger'},name:'Jo'}).props.id,'jo');assert.equal(Portrait({receipt:{actorId:'mina',emotion:'fear'},name:'Mina'}).type,Neutral);
 const different=Portrait({receipt:{actorId:'mina',emotion:'love'},name:'Mina'});assert.equal(different.type,'img','Failure of one emotion does not hide a different valid asset');
});

test('four reviewed direct portraits share one accurate integrity manifest',()=>{
 const manifest=JSON.parse(readFileSync(root+'/public/paintings/character-expressions/individual-manifest.json','utf8'));
 assert.deepEqual(manifest.map(v=>v.expression).sort(),['anger','envy','love','sadness']);
 for(const item of manifest){const bytes=readFileSync(root+'/public'+item.src);assert.equal(item.characterId,'mina');assert.equal(item.width,640);assert.equal(item.height,640);assert.equal(item.bytes,bytes.length);assert.equal(createHash('sha256').update(bytes).digest('hex'),item.sha256);assert.equal(bytes.toString('ascii',0,4),'RIFF');assert.equal(bytes.toString('ascii',8,12),'WEBP');}
});
