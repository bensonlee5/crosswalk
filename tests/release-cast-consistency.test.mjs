import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {canonicalCharacters} from '../lib/character-canon.ts';
import {characterHistories} from '../lib/character-histories.ts';
const guide=JSON.parse(readFileSync(new URL('../docs/guide-content.json',import.meta.url),'utf8'));
test('public manual and canonical cast share every authored age and reciprocal family identity',()=>{
 const byId=Object.fromEntries(guide.characters.map(p=>[p.id,p]));
 assert.deepEqual(Object.keys(byId).sort(),canonicalCharacters.map(p=>p.id).sort());
 assert.equal(canonicalCharacters.length,68);
 assert.ok(characterHistories.every(p=>byId[p.id]));
 for(const person of canonicalCharacters){assert.equal(byId[person.id].age,person.age);assert.deepEqual(byId[person.id].family,person.family);for(const tie of person.family)assert.ok(byId[tie.id].family.some(r=>r.id===person.id));}
 const graph=JSON.parse(readFileSync(new URL('../docs/character-canon/families.json',import.meta.url),'utf8'));
 assert.equal(guide.characters.reduce((sum,p)=>sum+p.family.length,0),graph.edges.length*2);
});
