import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import * as client from '../lib/world-life.ts';
import * as server from '../supabase/functions/_shared/engine/world-life.ts';
import {initializeStory,arriveStoryWeek,getStoryView} from '../lib/story-arcs.ts';
import {actions,availableActions,player} from '../lib/game.ts';
import {initializeLife} from '../lib/life-events.ts';

const contract=JSON.parse(readFileSync(new URL('./fixtures/venue-names-v2.json',import.meta.url),'utf8'));
const ids=['APARTMENTS','WORK','CAMPUS','CAREER HUB','CORNER CAFÉ','COMMUNITY','THE PARK','LIBRARY','MARKET','FITNESS','MAKERSPACE','CINEMA','TRANSIT','GARDEN','ARCADE'];
function room(engine=client,{modern=true,region='alder'}={}){
 const p=player('Traveler');
 const g={code:'NAMES',mode:'hotseat',players:[p],status:'playing',round:1,turn:0,maxRounds:8,log:[],seen:[],rulesVersion:2,lifeVersion:1,...(modern?{storyVersion:1,economyVersion:1}:{})};
 if(modern){p.storyVersion=1;p.economyVersion=1;}
 initializeLife(g,15);engine.initializeWorldPlayer(p);if(modern)engine.initializeSharedWorld(g);
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

test('client and server give identical base names, evolved venues, choices and serialized state in all five regions',()=>{
 for(const region of Object.keys(client.regionDefinitions)){
  const {p,g}=room(client,{region}),other=JSON.parse(JSON.stringify(g)),q=other.players[0];
  for(const month of [1,3,5,7]){
   g.round=other.round=month;client.beginWorldWeek(g);server.beginWorldWeek(other);
   assert.deepEqual(other,g);
   assert.deepEqual(server.worldView(q,other),client.worldView(p,g));
   assert.deepEqual(server.worldChoices(q,other),client.worldChoices(p,g));
   for(const place of ids)assert.equal(server.worldPlaceName(q,place,other),client.worldPlaceName(p,place,g));
  }
  for(const venue of Object.values(g.sharedWorld.regions[region].venues)){
   const expected=contract.venues.find(v=>v.regionId===region&&v.placeId===venue.place);
   assert.ok(venue.name.startsWith(expected.name+' · '),venue.name+' retains its local identity');
   assert.ok(expected.evolvedNames.includes(venue.name),venue.name+' matches the guide');
  }
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

test('previously saved regional names, journals, story receipts and retry identities remain historical',()=>{
 const {p,g}=room(client,{region:'saffron'});g.round=7;client.beginWorldWeek(g);
 const old='Arcade Food Market · shared oven mornings',saved=g.sharedWorld.regions.saffron;
 saved.venues.MARKET.name=old;saved.changes.find(c=>c.place==='MARKET').venueName=old;
 p.world.journal.push({week:3,region:'saffron',title:old,text:'You worked at Arcade Food Market.',choiceId:'historical-choice'});
 initializeStory(g);p.story.receipts.push({id:'old-receipt',week:5,title:'Foundry Listening Room',body:'An evening at Foundry Listening Room.',sceneId:'historical-scene',characterIds:['mina'],choiceId:'historical-choice',outcome:'Recorded at Foundry Listening Room.',effects:{cash:0,hours:0,energy:0,joy:0,social:0,craft:0,skill:0,trust:{mina:0,eli:0,jo:0}}});
 const restored=JSON.parse(JSON.stringify(g)),q=restored.players[0],before=JSON.stringify(restored);
 const current='Three Arches Market · shared oven mornings';
 assert.equal(client.worldPlaceName(q,'MARKET',restored),current);
 assert.equal(client.worldView(q,restored).region.placeNames.MARKET,current);
 assert.equal(client.worldView(q,restored).venueStates.MARKET.name,current);
 assert.ok(client.worldView(q,restored).localChanges.some(change=>change.venueName===old));
 assert.ok(client.worldView(q,restored).journal.some(entry=>entry.title===old));
 assert.ok(getStoryView(restored,q).recap.some(receipt=>receipt.title==='Foundry Listening Room'));
 const prior=saved.venues.MARKET;
 assert.equal(client.applySharedVenueChange(restored,{...prior,region:'saffron',name:'Should never replace a saved receipt'}),false);
 client.worldChoices(q,restored);assert.equal(JSON.stringify(restored),before);
});

test('legacy return receipts stay historical while current labels use the new name and non-world rooms remain unchanged',()=>{
 const {p,g}=room(client,{modern:false});
 for(const region of ['saffron','alder','saffron']){p.hours=6;const c=client.worldChoices(p,g).find(c=>c.key==='travel:'+region);client.resolveWorldChoice(g,p,c.id);}
 const history=p.world.localeHistory.saffron,change=history.changes.at(-1),base=client.regionDefinitions.saffron.placeNames[change.place],prior=contract.authorizedRenames.find(v=>v.current===base)?.previous??base,old=prior+' · '+change.venueName.split(' · ')[1];change.venueName=old;
 const before=JSON.stringify(g);const current=base+' · '+change.venueName.split(' · ')[1];assert.equal(client.worldPlaceName(p,change.place,g),current);assert.equal(client.worldView(p,g).region.placeNames[change.place],current);assert.equal(client.worldView(p,g).venueStates[change.place].name,current);assert.equal(client.worldView(p,g).localChanges[0].venueName,old);assert.equal(JSON.stringify(g),before);
 delete p.world;const legacy=JSON.stringify(g);for(const place of ids)assert.equal(client.worldPlaceName(p,place,g),place);assert.equal(client.worldView(p,g),null);assert.equal(JSON.stringify(g),legacy);
});

test('legacy snapshot allowance cannot mask mechanics, stable identifiers, key changes or unapproved prose',async()=>{
 const {historicalVenueLabels}=await import('./support/venue-name-snapshot.mjs');
 const base={name:'Rainwell Court',cash:150,place:'APARTMENTS',id:'fixed-id',title:'Rainwell Court welcomes you.',log:['Rainwell Court opened.']};
 const expected={...base,name:'Quayside Apartments',title:'Quayside Apartments welcomes you.',log:['Quayside Apartments opened.']};
 assert.deepEqual(JSON.parse(historicalVenueLabels(JSON.stringify(base))),expected);
 for(const change of [{cash:151},{place:'Rainwell Court'},{id:'Rainwell Court'},{title:'Rainwell Court charges you.'},{'Rainwell Court':'a new key'}]){
  assert.notDeepEqual(JSON.parse(historicalVenueLabels(JSON.stringify({...base,...change}))),expected);
 }
});

test('exact historical name aliases agree across current views, server and destination previews without changing stored text',async()=>{
 const {worldChoiceEffects}=await import('../lib/world-choice-presentation.ts');
 for(const {regionId,placeId,previous,current}of contract.historicalEvolvedNames){
  const {p,g}=room(client,{region:regionId});client.applySharedVenueChange(g,{id:'historical-alias',region:regionId,place:placeId,status:'repurposed',name:previous,description:'Saved description',reason:'Saved reason',source:'story'});
  const before=JSON.stringify(g),view=client.worldView(p,g);
  assert.equal(client.worldVenueDisplayName(regionId,placeId,previous),current);
  assert.equal(server.worldVenueDisplayName(regionId,placeId,previous),current);
  assert.equal(client.worldPlaceName(p,placeId,g),current);
  assert.equal(view.region.placeNames[placeId],current);assert.equal(view.venueStates[placeId].name,current);
  assert.equal(client.getSharedVenueState(g,regionId,placeId).name,current);
  assert.equal(g.sharedWorld.regions[regionId].venues[placeId].name,previous);
  const choice={preview:{region:regionId,revealPlaces:[placeId],returnChange:{region:regionId,place:placeId,venueName:previous}},previewText:['Discover: '+placeId]};
  const previewBefore=JSON.stringify(choice);
  assert.deepEqual(worldChoiceEffects(choice,p,g),['Discover: '+current]);
  assert.equal(JSON.stringify(choice),previewBefore);assert.equal(JSON.stringify(g),before);
 }
 for(const venue of contract.venues){
  const {regionId,placeId,previousName,name}=venue;
  assert.equal(client.worldVenueDisplayName(regionId,placeId,previousName),name);
  for(const custom of [previousName+' · my own program',name+' annex','toString','constructor','__proto__']){
   assert.equal(client.worldVenueDisplayName(regionId,placeId,custom),custom);
   assert.equal(server.worldVenueDisplayName(regionId,placeId,custom),custom);
  }
 }
 assert.equal(client.worldVenueDisplayName('pelagia','GARDEN','Canal Supper Garden'),'Canal Supper Garden','wrong region stays untouched');
 assert.equal(client.worldVenueDisplayName('alder','LIBRARY','Canal Supper Garden'),'Canal Supper Garden','wrong venue stays untouched');
});
