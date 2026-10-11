import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import * as client from '../lib/world-life.ts';
import {initializeStory,arriveStoryWeek,getStoryView} from '../lib/story-arcs.ts';
import {actions,availableActions} from '../lib/game.ts';
import {currentGame} from './current-fixture.mjs';

const contract=JSON.parse(readFileSync(new URL('./fixtures/venue-names-v2.json',import.meta.url),'utf8'));
const ids=['APARTMENTS','WORK','CAMPUS','CAREER HUB','CORNER CAFÉ','COMMUNITY','THE PARK','LIBRARY','MARKET','FITNESS','MAKERSPACE','CINEMA','TRANSIT','GARDEN','ARCADE'];
function room(engine=client,{region='alder'}={}){
 const g=currentGame({names:['Traveler'],seed:15}),p=g.players[0];
 p.world.region=region;p.world.discoveredRegions=Object.keys(engine.regionDefinitions);p.world.discoveredPlacesByRegion[region]=[...ids];p.cash=10000;
 return {p,g};
}

test('all 75 canonical local names match the frozen guide contract without changing place or action IDs',()=>{
 assert.deepEqual([...client.worldPlaceIds].sort(),[...ids].sort());
 assert.equal(contract.venues.length,75);
 assert.equal(new Set(contract.venues.map(v=>`${v.regionId}/${v.placeId}`)).size,75);
 const allNames=[];
 for(const region of Object.keys(client.regionDefinitions)){
  assert.deepEqual(Object.keys(client.regionDefinitions[region].placeNames).sort(),[...ids].sort());
  const {p,g}=room(client,{region}),before=JSON.stringify(g);
  for(const venue of contract.venues.filter(v=>v.regionId===region)){
   const {placeId,name}=venue;allNames.push(name);
   assert.notEqual(name,placeId);assert.ok(name.trim()===name&&name.length>5);
   assert.equal(client.regionDefinitions[region].placeNames[placeId],name);
   assert.equal(client.worldPlaceName(p,placeId,g),name);
   assert.equal(client.worldView(p,g).region.placeNames[placeId],name);
   for(const action of availableActions(p,placeId,g))assert.equal(action.place,placeId);
  }
  assert.equal(JSON.stringify(g),before,'name and activity reads do not migrate a save');
 }
 assert.equal(new Set(allNames).size,75,'each local venue has its own unambiguous name');
 assert.ok(actions.every(action=>ids.includes(action.place)),'action targets remain stable IDs');
});

test('all regions develop distinct current venue programs and serialize without read-time mutation',()=>{
 for(const region of Object.keys(client.regionDefinitions)){
  const {p,g}=room(client,{region});for(const month of [1,3,5,7]){g.round=month;client.beginWorldWeek(g);const saved=JSON.stringify(g),restored=JSON.parse(saved);assert.deepEqual(client.worldView(restored.players[0],restored),client.worldView(p,g));assert.equal(JSON.stringify(g),saved);}
  for(const venue of Object.values(g.sharedWorld.regions[region].venues)){const expected=contract.venues.find(v=>v.regionId===region&&v.placeId===venue.place);assert.ok(venue.name.startsWith(expected.name+' · '));assert.ok(expected.evolvedNames.includes(venue.name));}
 }
});

test('new story programs retain the named garden and makerspace identity',()=>{
 for(const plan of ['garden','workshop']){
  const {p,g}=room();initializeStory(g);
  g.story.decisions['quay-replan']={key:plan,by:p.name,week:3};g.round=5;arriveStoryWeek(g);
  const place=plan==='garden'?'GARDEN':'MAKERSPACE',venue=client.getSharedVenueState(g,'alder',place),expected=contract.venues.find(v=>v.regionId==='alder'&&v.placeId===place);
  assert.ok(venue.name.startsWith(expected.name+' · '));assert.ok(expected.evolvedNames.includes(venue.name));
  assert.ok(getStoryView(g,p).scenes.some(scene=>scene.spot===place));
 }
});

test('custom current venue titles and journal receipts are returned exactly as stored',()=>{
 const {p,g}=room(client,{region:'saffron'});const name='Leila’s shared oven evening';
 const change={id:'custom-program',region:'saffron',place:'MARKET',status:'repurposed',name,description:'A bounded community meal.',reason:'The cooks agreed a new program.',source:'story'};
 assert.equal(client.applySharedVenueChange(g,change),true);p.world.journal.push({week:1,region:'saffron',title:name,text:'You joined the opening.',choiceId:'opening-choice'});
 const snapshot=JSON.stringify(g),restored=JSON.parse(snapshot),q=restored.players[0];
 assert.equal(client.worldPlaceName(q,'MARKET',restored),name);assert.equal(client.worldView(q,restored).venueStates.MARKET.name,name);assert.equal(client.getSharedVenueState(restored,'saffron','MARKET').name,name);
 assert.equal(client.applySharedVenueChange(restored,{...change,name:'Cannot replay'}),false);assert.equal(JSON.stringify(restored),snapshot);
});
