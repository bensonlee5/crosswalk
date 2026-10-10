import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {createGame} from '../supabase/functions/crosswalk-game/game-service.ts';
import {castPeople,resolveCastChoice} from '../lib/character-cast.ts';
import {characterCameos} from '../lib/character-cameos.ts';
import {canonicalCharacterById} from '../lib/character-canon.ts';
import {worldPlaceIds} from '../lib/world-life.ts';
const root=new URL('..',import.meta.url).pathname.replace(/\/$/,''),require=createRequire(root+'/package.json'),ts=require('typescript'),React=require('react'),{renderToStaticMarkup}=require('react-dom/server'),loaded=new Map();
function load(file){if(loaded.has(file))return loaded.get(file).exports;const module={exports:{}};loaded.set(file,module);const js=ts.transpileModule(readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ESNext,jsx:ts.JsxEmit.ReactJSX}}).outputText;vm.runInNewContext(js,{exports:module.exports,module,require:id=>id==='./game-painting'?{__esModule:true,default:props=>React.createElement('img',{src:props.src,alt:props.alt})}:id==='./game-art'?require(root+'/app/game-art.ts'):id.startsWith('@/')?require(root+'/'+id.slice(2)+'.ts'):id.startsWith('./')?load(root+'/app/'+id.slice(2)+'.tsx'):require(id)});return module.exports;}
const Panel=load(root+'/app/encounter-panel.tsx').default;
test('all13 cameo dialogs show canonical art and bounded choices; child labels never imply adult work or favors',()=>{
 for(const c of characterCameos){
  const g=createGame({mode:'hotseat',names:['Tester'],ownerSession:'owner',requestId:'canon-ui'},'CANON2'),p=g.players[0],canon=canonicalCharacterById[c.id];p.world.region=canon.region;p.world.discoveredPlacesByRegion[canon.region]=[...worldPlaceIds];
  let view;for(let week=1;week<=8;week++){g.round=week;if(c.id==='bea'){g.cast.schedule[week]=g.cast.schedule[week].filter(a=>a.id!=='kit');g.cast.schedule[week].push({id:'kit',region:'embermesa',spot:'COMMUNITY',kind:'local'});}view=castPeople(g,p).find(v=>v.id===c.id);if(view)break;}
  assert.ok(view,c.id);p.place=view.spot;const props={g,p,actorId:c.id,spot:view.spot,disabled:false,onAction(){throw Error('Render submitted a move');},onClose(){}};
  const before=JSON.stringify(g),html=renderToStaticMarkup(React.createElement(Panel,props));assert.equal(JSON.stringify(g),before);assert.match(html,new RegExp(`/character-portraits/${c.id}\\.webp`));assert.ok(html.includes(c.listenTitle));assert.ok(html.includes(c.choiceTitle));
  assert.doesNotMatch(html,/NaN|undefined|ocean|mbti|earnedWeeks|contributions|trust[: +−]|Say yes to next month|What .* has room for|More of this history can emerge/i);
  if(canon.age<18){assert.match(html,/What fits today/);assert.doesNotMatch(html,/is working toward|Ask for a little room for you|Push past the limit/);}
  const choice=castPeople(g,p).find(v=>v.id===c.id).choices[0];resolveCastChoice(g,p,choice.id);const after=renderToStaticMarkup(React.createElement(Panel,props));assert.match(after,/Moments you remember/);assert.doesNotMatch(after,new RegExp(`What ${canon.name} remembers`));assert.ok(after.includes(c.listen.replaceAll('“','“')));
 }
});
