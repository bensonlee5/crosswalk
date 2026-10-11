import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import {FOLEY_FILES} from '../lib/foley.ts';
const root=new URL('../',import.meta.url);
const manifest=JSON.parse(fs.readFileSync(new URL('public/audio/foley/manifest.json',root),'utf8'));
test('all shipped foley matches its provenance and stays within the runtime format/size limits',()=>{
 assert.deepEqual(manifest.assets.map(asset=>asset.semanticId).sort(),Object.keys(FOLEY_FILES).sort());
 let total=0;
 for(const asset of manifest.assets){
  assert.equal(asset.url,FOLEY_FILES[asset.semanticId]);assert.equal(asset.file,'public'+asset.url);
  assert.equal(asset.license,'CC0-1.0');assert.match(asset.sourcePageUrl,/^https:\/\/(freesound\.org|opengameart\.org)\//);
  const file=fs.readFileSync(new URL(asset.file,root));total+=file.length;
  assert.equal(file.length,asset.bytes);assert.ok(file.length<600_000);
  assert.equal(crypto.createHash('sha256').update(file).digest('hex'),asset.sha256);
  assert.equal(file.toString('ascii',0,4),'RIFF');assert.equal(file.toString('ascii',8,12),'WAVE');
  let format,data;
  for(let offset=12;offset+8<=file.length;){const id=file.toString('ascii',offset,offset+4),size=file.readUInt32LE(offset+4),body=file.subarray(offset+8,offset+8+size);if(id==='fmt ')format=body;if(id==='data')data=body;offset+=8+size+(size%2);}
  assert.ok(format&&data);assert.equal(format.readUInt16LE(0),1,'PCM');assert.equal(format.readUInt16LE(2),1,'mono');assert.equal(format.readUInt32LE(4),44100);assert.equal(format.readUInt16LE(14),16);
  const duration=data.length/(44100*2);assert.ok(duration>0&&duration<3);assert.ok(Math.abs(duration-asset.durationSeconds)<.001);
  let peak=0;for(let i=0;i<data.length;i+=2)peak=Math.max(peak,Math.abs(data.readInt16LE(i)));assert.ok(peak>0&&peak<32767,'audible data without clipped samples');
 }
 assert.equal(total,manifest.totalAudioBytes);assert.ok(total<1_000_000);
});
