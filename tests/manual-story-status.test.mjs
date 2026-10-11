import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createManualExpansion} from '../scripts/manual-expansion.mjs';
const read=path=>JSON.parse(readFileSync(new URL('../'+path,import.meta.url),'utf8'));
const guide=read('docs/guide-content.json'),source=read('docs/manual/items.json'),venueContent=read('docs/manual/venues.json');
const regions=[...guide.locations.map(r=>[r.id,r.name]),['traveler','On the road']];
function renderer(items){return createManualExpansion({itemContent:items,venueContent,characters:guide.characters,locations:guide.locations,regions,escape:String,link:(ctx,path,label)=>`<a href="${path}">${label}</a>`,image:()=>'',crumb:()=>'',imageExists:()=>true});}

test('playable story status is distinct from a completed biographical event',()=>{
 const content=structuredClone(source),item=content.items.find(i=>i.id==='whaleskin');item.storyStatus='playable_story_object';item.gameStatus='implemented';
 const pages=new Map();renderer(content).render((path,title,description,body)=>pages.set(path,body({url:path=>path})));
 const detail=pages.get('/items/whaleskin/');
 assert.match(detail,/data-item-status="playable_story_object"/);assert.match(detail,/<strong>Story object<\/strong>/);
 assert.match(detail,/what actually happens in each life/);assert.match(detail,/Story foundations/);assert.match(detail,/In a playable life/);
 assert.doesNotMatch(detail,/not a playable quest|This proposal is separate from/);
 const directory=pages.get('/items/');assert.match(directory,/id="item-whaleskin"[^>]*data-status="implemented"/);
});

test('status validation rejects claiming a proposal is implemented or an unimplemented story is playable',()=>{
 const content=structuredClone(source),item=content.items.find(i=>i.id==='whaleskin');item.storyStatus='proposed_story_object';item.gameStatus='implemented';
 assert.throws(()=>renderer(content),/proposal cannot be labeled implemented/);
 item.storyStatus='playable_story_object';item.gameStatus='worldbuilding';assert.throws(()=>renderer(content),/playable story object requires implemented/);
 item.gameStatus='implemented';delete item.storyNote;assert.throws(()=>renderer(content),/missing storyNote/);
});
