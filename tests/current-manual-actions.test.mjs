import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {actions} from '../lib/game.ts';
import {worldChoices,worldPlaceIds,regionDefinitions,beginWorldWeek} from '../lib/world-life.ts';
import {currentGame} from './current-fixture.mjs';
const venues=JSON.parse(readFileSync(new URL('../docs/manual/venues.json',import.meta.url),'utf8')).venues;
test('venue catalog represents every current ordinary action and no retired ordinary IDs',()=>{
 const ordinary=new Set(actions.map(a=>a.id)),documented=new Set();
 for(const venue of venues)for(const action of venue.activities){if(action.id.startsWith('world:'))continue;assert.ok(ordinary.has(action.id),`${venue.id}: retired ordinary action ${action.id}`);documented.add(action.id);}
 assert.deepEqual([...documented].sort(),[...ordinary].sort());
});
test('manual world routes correspond to current choices, with career work explained separately',()=>{
 const current=new Set();for(const region of Object.keys(regionDefinitions)){
  const g=currentGame(),p=g.players[0];p.world.region=region;p.world.discoveredRegions=Object.keys(regionDefinitions);p.world.discoveredPlacesByRegion[region]=[...worldPlaceIds];p.world.story.homeRegion=region==='alder'?'saffron':'alder';
  for(let month=1;month<=8;month++){g.round=month;beginWorldWeek(g);for(const choice of worldChoices(p,g))current.add(choice.key);}
 }
 for(const venue of venues)for(const action of venue.activities)if(action.id.startsWith('world:'))assert.ok(current.has(action.id.slice(6)),`${venue.id}: unsupported world route ${action.id}`);
 for(const venue of venues.filter(v=>['WORK','CAMPUS','LIBRARY','CORNER CAFÉ','MAKERSPACE','COMMUNITY','CAREER HUB'].includes(v.placeId)))assert.ok(venue.gameplayNotes.some(note=>note.includes('Work & learning')),`${venue.id}: current career route needs a guide pointer`);
});
