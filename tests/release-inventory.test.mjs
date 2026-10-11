import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,writeFile,rm,readFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {execFileSync} from 'node:child_process';
import {changeInventory,validatePortraitRoster} from '../scripts/release-inventory.mjs';

test('release inventory preserves deletions and hashes changed files with whitespace in names',async()=>{
  const root=await mkdtemp(join(tmpdir(),'crosswalk-inventory-'));
  const git=(...args)=>execFileSync('git',args,{cwd:root,stdio:'pipe'}).toString().trim();
  try {
    git('init');git('config','user.name','Release test');git('config','user.email','release@example.invalid');
    await writeFile(join(root,'removed.txt'),'old');await writeFile(join(root,'space and\ttab.txt'),'before');
    git('add','.');git('commit','-m','fixture');const base=git('rev-parse','HEAD');
    await rm(join(root,'removed.txt'));await writeFile(join(root,'space and\ttab.txt'),'after');
    await writeFile(join(root,'new.txt'),'new');git('add','-A');
    const result=await changeInventory(root,base);
    assert.deepEqual(result.deleted_files,['removed.txt']);
    assert.deepEqual(result.changed_files.map(f=>f.path),['new.txt','space and\ttab.txt']);
    assert.ok(result.changed_files.every(f=>/^[a-f0-9]{64}$/.test(f.sha256)));
  } finally {await rm(root,{recursive:true,force:true});}
});

test('portrait packaging derives every required identity from the actual approved roster',async()=>{
 const roster=JSON.parse(await readFile(new URL('../docs/guide-approved-roster.json',import.meta.url)));
 const portraits=JSON.parse(await readFile(new URL('../public/paintings/character-portraits/manifest.json',import.meta.url)));
 assert.equal(roster.length,68);assert.doesNotThrow(()=>validatePortraitRoster(portraits,roster));
 assert.throws(()=>validatePortraitRoster(portraits.slice(0,26),roster),/approved roster/);
 assert.throws(()=>validatePortraitRoster([...portraits,portraits[0]],roster),/approved roster/);
});
