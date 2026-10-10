import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {scenePortraitExpression,expressionSheets,expressionPosition} from '../lib/portrait-expression.ts';
const scene=(id:string)=>({id,characters:['mina','eli','jo']});
test('expressions reflect only the current visible story scene',()=>{
 assert.equal(scenePortraitExpression('mina',scene('quay-replan')),'hurt');
 assert.equal(scenePortraitExpression('jo',scene('quay-credit')),'hurt');
 assert.equal(scenePortraitExpression('eli',scene('quay-first-set')),'relieved');
 assert.equal(scenePortraitExpression('mina',undefined),'neutral');
 assert.equal(scenePortraitExpression('mina',scene('unknown')),'neutral');
 assert.equal(scenePortraitExpression('neri',scene('quay-promise')),'neutral');
 assert.equal(scenePortraitExpression('mina',{id:'quay-promise',characters:[] }),'neutral');
});
test('confirmed current-scene choices can change acting but stale and missed receipts cannot',()=>{
 const current=scene('quay-friction');
 assert.equal(scenePortraitExpression('eli',current,{sceneId:current.id,choiceId:'repair_first~8'}),'relieved');
 assert.equal(scenePortraitExpression('eli',current,{sceneId:current.id,choiceId:'protect_set~8'}),'hurt');
 assert.equal(scenePortraitExpression('eli',current,{sceneId:'quay-credit',choiceId:'shared_credit~2'}),'hurt');
 assert.equal(scenePortraitExpression('eli',current,{sceneId:current.id,choiceId:'repair_first~8',automatic:true}),'hurt');
});
test('only the three supplied expression sets are advertised and labels preserve Jo’s boundary',()=>{
 assert.deepEqual(Object.keys(expressionSheets).sort(),['eli','jo','mina']);
 assert.match(expressionSheets.jo.labels.hurt,/boundary/);
 assert.equal(Object.keys(expressionPosition).length,4);
});

test('original expression-sheet provenance is complete and optional recovery sources match',()=>{
 const manifest=JSON.parse(readFileSync(new URL('../docs/character-canon/expression-source-manifest.json',import.meta.url),'utf8'));
 assert.deepEqual(manifest.map((x:{id:string})=>x.id).sort(),Object.keys(expressionSheets).sort());
 for(const item of manifest){assert.match(item.sha256,/^[a-f0-9]{64}$/);assert.equal(item.file,item.id+'.png');assert.equal(item.width,1254);assert.equal(item.height,1254);assert.deepEqual(item.layout,['warm','concerned','hurt','relieved']);if(process.env.EXPRESSION_SOURCES_ROOT){const bytes=readFileSync(process.env.EXPRESSION_SOURCES_ROOT+'/'+item.file);assert.equal(createHash('sha256').update(bytes).digest('hex'),item.sha256);assert.equal(bytes.length,item.bytes);assert.equal(bytes.readUInt32BE(16),item.width);assert.equal(bytes.readUInt32BE(20),item.height);}}
});


test('optimized expression sheets are face-aligned, hash-verified WebPs within their size budget',()=>{
 const manifest=JSON.parse(readFileSync(new URL('../public/paintings/character-expressions/runtime-manifest.json',import.meta.url),'utf8'));
 assert.deepEqual(manifest.map((x:{id:string})=>x.id).sort(),Object.keys(expressionSheets).sort());
 for(const item of manifest){const bytes=readFileSync(new URL('../public'+item.src,import.meta.url));assert.equal(expressionSheets[item.id].src,item.src);assert.equal(createHash('sha256').update(bytes).digest('hex'),item.sha256);assert.equal(bytes.length,item.bytes);assert.ok(bytes.length<550000);assert.equal(bytes.toString('ascii',0,4),'RIFF');assert.equal(bytes.toString('ascii',8,12),'WEBP');assert.equal(item.width,1254);assert.equal(item.height,1254);const anchor=readFileSync(new URL('../public/paintings/character-portraits/'+item.id+'.webp',import.meta.url));assert.equal(createHash('sha256').update(anchor).digest('hex'),item.canonicalPortraitSha256);}
});
