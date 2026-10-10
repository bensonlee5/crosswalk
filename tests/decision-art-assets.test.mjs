import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const root=new URL('../public',import.meta.url).pathname;
test('six individually reviewed decision paintings have canonical paths and verified delivery bytes',()=>{
 const rows=JSON.parse(readFileSync(root+'/paintings/decisions/manifest.json','utf8'));
 assert.deepEqual(rows.map(p=>p.key).sort(),['disagree','listen','make_promise','renegotiate','say_goodbye','set_boundary']);
 const hashes=new Set();for(const row of rows){assert.equal(row.publicPath,'/paintings/decisions/'+row.key+'.webp');const bytes=readFileSync(root+row.publicPath);assert.equal(bytes.toString('ascii',0,4),'RIFF');assert.equal(bytes.toString('ascii',8,12),'WEBP');assert.equal(bytes.length,row.bytes);assert.ok(bytes.length<150000);assert.equal(createHash('sha256').update(bytes).digest('hex'),row.sha256);assert.equal(row.width,768);assert.equal(row.height,512);assert.match(row.visualQA,/Passed individual source inspection/);assert.ok(!hashes.has(row.sha256));hashes.add(row.sha256);}
});
