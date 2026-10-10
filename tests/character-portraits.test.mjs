import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import vm from 'node:vm';
import {characterPortraits} from '../lib/character-portraits.ts';
import {canonicalCharacters as characterHistories} from '../lib/character-canon.ts';
import * as expressionModule from '../lib/portrait-expression.ts';
const root=new URL('..',import.meta.url).pathname.replace(/\/$/,''),require=createRequire(root+'/package.json');
const manifest=JSON.parse(readFileSync(root+'/public/paintings/character-portraits/manifest.json','utf8'));

test('portrait mappings reference only completed unique assets with valid dimensions, budgets and accessible descriptions',()=>{
 assert.ok(manifest.length>0);assert.equal(new Set(manifest.map(p=>p.id)).size,manifest.length);assert.deepEqual(Object.keys(characterPortraits).sort(),manifest.map(p=>p.id).sort());
 const hashes=new Set();for(const item of manifest){const person=characterHistories.find(p=>p.id===item.id);assert.ok(person);assert.equal(item.name,person.name);assert.ok(item.alt.includes(person.name));assert.ok(item.alt.length>20);assert.deepEqual(characterPortraits[item.id],{src:item.src,alt:item.alt,revision:item.sha256.slice(0,12)});
  const bytes=readFileSync(root+'/public'+item.src);assert.equal(bytes.toString('ascii',0,4),'RIFF');assert.equal(bytes.toString('ascii',8,12),'WEBP');assert.equal(bytes.length,item.bytes);assert.equal(createHash('sha256').update(bytes).digest('hex'),item.sha256);assert.ok(!hashes.has(item.sha256));hashes.add(item.sha256);assert.equal(item.width,640);assert.equal(item.height,640);assert.ok(item.bytes<160000,'Portrait byte budget');
 }
});

test('portrait loading preserves Pages subpaths and falls back to the same person’s initial after failure',()=>{
 const ts=require('typescript'),module={exports:{}};let failed='';
 const source=readFileSync(root+'/app/character-portrait.tsx','utf8');const js=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ESNext,jsx:ts.JsxEmit.ReactJSX}}).outputText;
 vm.runInNewContext(js,{exports:module.exports,module,require:id=>id==='react'?{useState:()=>[failed,value=>{failed=value;}]}:id==='@/lib/asset-url'?{assetUrl:path=>'/crosswalk/'+path.replace(/^\//,'')}:id==='@/lib/character-portraits'?{characterPortraits}:id==='@/lib/portrait-expression'?expressionModule:require(id)});
 const Portrait=module.exports.default,[id,asset]=Object.entries(characterPortraits)[0],name=characterHistories.find(p=>p.id===id).name;
 const good=Portrait({id,name});assert.equal(good.type,'img');assert.equal(good.props.src,'/crosswalk'+asset.src+'?v='+asset.revision);assert.equal(good.props.alt,asset.alt);assert.equal(good.props.loading,'lazy');assert.equal(good.props.decoding,'async');
 good.props.onError();const fallback=Portrait({id,name});assert.equal(fallback.type,'span');assert.equal(fallback.props.role,'img');assert.equal(fallback.props['aria-label'],name+', portrait unavailable');assert.equal(fallback.props.children.props.children,name.slice(0,1));
 failed='';const expression=Portrait({id:'mina',name:'Mina',expression:'concerned'});assert.equal(expression.type,'span');assert.match(expression.props['aria-label'],/sympathetic concern/);assert.match(expression.props.style.backgroundImage,/\/crosswalk\/paintings\/character-expressions\/mina.webp/);assert.equal(expression.props.style.backgroundPosition,'100% 0%');expression.props.children.props.onError();const neutral=Portrait({id:'mina',name:'Mina',expression:'concerned'});assert.equal(neutral.type,'img');assert.equal(neutral.props.src,'/crosswalk'+characterPortraits.mina.src+'?v='+characterPortraits.mina.revision);neutral.props.onError();const exhausted=Portrait({id:'mina',name:'Mina',expression:'concerned'});assert.match(exhausted.props['aria-label'],/portrait unavailable/);
 const unknown=Portrait({id:'unmapped',name:'A known name'});assert.equal(unknown.type,'span');assert.ok(unknown.props['aria-label'].startsWith('A known name'));
});
