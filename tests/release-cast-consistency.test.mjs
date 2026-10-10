import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {characterAges,characterFamilies} from '../lib/character-identities.ts';
import {canonicalCharacters} from '../lib/character-canon.ts';
import {characterHistories} from '../lib/character-histories.ts';
const guide=JSON.parse(readFileSync(new URL('../docs/guide-content.json',import.meta.url),'utf8'));
test('public manual and canonical cast share every authored age and reciprocal family identity',()=>{
 const byId=Object.fromEntries(guide.characters.map(p=>[p.id,p]));
 assert.deepEqual(Object.keys(byId).sort(),canonicalCharacters.map(p=>p.id).sort());
 assert.equal(canonicalCharacters.length,68);
 assert.deepEqual(characterHistories.map(p=>p.id).sort(),Object.keys(characterAges).sort());
 for(const person of canonicalCharacters){assert.equal(byId[person.id].age,person.age);assert.deepEqual(byId[person.id].family,person.family);for(const tie of person.family)assert.ok(byId[tie.id].family.some(r=>r.id===person.id));}
 for(const [id,age] of Object.entries(characterAges))assert.equal(byId[id].age,age,id);
 for(const family of characterFamilies)for(let index=0;index<2;index++){
  const person=byId[family.ids[index]],other=family.ids[1-index];
  assert.ok(person.family.some(f=>f.id===other&&f.label===family.relationship[index]+' of'),person.id);
 }
 const graph=JSON.parse(readFileSync(new URL('../docs/character-canon/families.json',import.meta.url),'utf8'));
 assert.equal(guide.characters.reduce((sum,p)=>sum+p.family.length,0),graph.edges.length*2);
});
