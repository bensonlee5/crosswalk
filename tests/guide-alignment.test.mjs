import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,mkdtempSync,mkdirSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {dirname,join} from 'node:path';
import {createRequire} from 'node:module';
import vm from 'node:vm';
import {buildGameCanon,gameCanonOutputs} from '../scripts/build-game-canon.mjs';
import {canonicalCharacters} from '../lib/character-canon.ts';
import {canonicalRegionSetting,guidePlaceNames} from '../lib/guide-world-data.ts';
import {guideItems,guideVenues,guideBrands,guideItemById,guideDispersedFamilies} from '../lib/guide-catalog.ts';
import {guideItemFactsById} from '../lib/guide-item-facts.ts';
import * as presentation from '../lib/guide-presentation.ts';
import {worldView,regionDefinitions,worldPlaceName,resolveWorldChoice,worldPlaceIds} from '../lib/world-life.ts';
import {currentGame} from './current-fixture.mjs';
const read=path=>JSON.parse(readFileSync(new URL('../'+path,import.meta.url),'utf8'));
const guide=read('docs/guide-content.json'),venues=read('docs/manual/venues.json').venues,items=read('docs/manual/items.json'),profiles=read('docs/character-canon/personalities.json').profiles;
const require=createRequire(import.meta.url);

test('current guide alone deterministically produces every runtime canon adapter',()=>{
 assert.equal(buildGameCanon({check:true}).length,5);
 assert.deepEqual(gameCanonOutputs(),gameCanonOutputs());
 for(const actual of canonicalCharacters){
  const person=guide.characters.find(p=>p.id===actual.id),profile=profiles.find(p=>p.id===actual.id);
  for(const field of ['name','age','region','hometown','role','intro','family','culturalBackground'])assert.deepEqual(actual[field],person[field],`${actual.id}.${field}`);
  for(const [runtime,source] of Object.entries({voice:'communicationStyle',needs:'coreNeeds',stress:'stressResponse',homeFit:'homeFit',profileKind:'profileKind'}))assert.deepEqual(actual[runtime],profile[source],`${actual.id}.${runtime}`);
 }
 assert.equal(canonicalCharacters.length,68);
 assert.deepEqual(guideDispersedFamilies,read('docs/manual/dispersed-families.json'));
});

test('75 places use guide names, individual architecture, history and local climate',()=>{
 assert.equal(guideVenues.length,75);
 for(const venue of venues){
  const actual=presentation.venueGuide(venue.regionId,venue.placeId);
  for(const field of ['id','name','summary','history','architecture','climateNotes','civicLife','people'])assert.deepEqual(actual[field],venue[field]);
  assert.equal(guidePlaceNames[venue.regionId][venue.placeId],venue.name);
  assert.equal(regionDefinitions[venue.regionId].placeNames[venue.placeId],venue.name);
  assert.ok(actual.objects.every(item=>item.storyStatus==='established_object'&&item.venueIds.includes(venue.id)));
 }
 assert.equal(presentation.venueGuide('unknown','CORNER CAFÉ'),null);
 assert.equal(presentation.venueGuide('alder','unknown'),null);
});

test('30 objects and seven makers preserve ownership, named users and proposal status',()=>{
 assert.equal(guideItems.length,30);assert.equal(guideBrands.length,7);
 for(const item of items.items){
  const actual=guideItemById[item.id],fact=guideItemFactsById[item.id];
  for(const field of Object.keys(actual))assert.deepEqual(actual[field],item[field],`${item.id}.${field}`);
  for(const field of Object.keys(fact))assert.deepEqual(fact[field],item[field],`${item.id} lightweight ${field}`);
  assert.equal(fact.description,undefined);assert.equal(fact.history,undefined);
 }
 for(const id of ['whaleskin','dalloway','bracken']){assert.equal(guideItemById[id].storyStatus,'playable_story_object');assert.equal(guideItemById[id].gameStatus,'implemented');}
 assert.deepEqual(guideItemById.copperleaf_fox.ownership.ownerIds,['natsumi_mori']);
 assert.deepEqual(guideItemById.copperleaf_fox.ownership.adultCareIds,['glass_sora']);
 assert.match(presentation.guideOwnershipText(guideItemById.six_chair_screen),/Unnamed original lender/);
 assert.equal(presentation.guideOwnershipText(guideItemById.three_hills_cups),'Belongs to Bea.');
 assert.match(presentation.guideOwnershipText(guideItemById.yellow_tab_survey_case),/Nell Harper/);
});

test('travel previews, arrival receipts and region panels use the same current geographic source',()=>{
 const g=currentGame({names:['Traveler'],seed:15}),p=g.players[0];p.cash=10000;
 p.world.discoveredRegions=Object.keys(regionDefinitions);g.round=6;
 for(const region of guide.locations){
  const setting=canonicalRegionSetting[region.id];
  assert.equal(setting.description,presentation.guideSentence(region.settlementDescription)+' '+presentation.guideSentence(region.climateDescription));
  assert.equal(regionDefinitions[region.id].description,setting.description);
  p.world.region=region.id==='alder'?'saffron':'alder';p.place='TRANSIT';p.hours=6;
  p.world.discoveredPlacesByRegion[p.world.region]=[...worldPlaceIds];
  const before=JSON.stringify(g),view=worldView(p,g),travel=view.choices.find(c=>c.key===`travel:${region.id}`);
  assert.ok(travel,region.id);assert.ok(travel.available,travel.reason);
  const firstArrival=p.world.localeHistory[region.id].arrivals===0;
  if(firstArrival){assert.ok(travel.body.includes(setting.description));assert.ok(travel.outcome.includes(setting.description));}
  else assert.match(travel.outcome,/notices you are back|remembers|return|back/i);
  assert.equal(JSON.stringify(g),before,'Reading a destination does not change a life');
  resolveWorldChoice(g,p,travel.id);
  assert.equal(worldView(p,g).region.description,setting.description);
  if(firstArrival)assert.ok(p.world.journal.at(-1).text.includes(setting.description));
 }
});

test('guide context cannot rewrite live venue programs, receipts, belongings or people',()=>{
 const g=currentGame({names:['Ari'],seed:15}),p=g.players[0],before=JSON.stringify(g);
 for(const venue of guideVenues)presentation.venueGuide(venue.regionId,venue.placeId);
 assert.equal(JSON.stringify(g),before);
 const place='GARDEN',shared=g.sharedWorld.regions.alder.venues;
 shared[place]={place,status:'repurposed',name:'Willowbank Allotments · agreed supper',description:'A new arrangement chosen in this life.',reason:'Neighbors agreed.',week:1,source:'story'};
 const snapshot=JSON.stringify(g);presentation.venueGuide('alder',place);
 assert.equal(worldPlaceName(p,place,g),'Willowbank Allotments · agreed supper');assert.equal(JSON.stringify(g),snapshot);
});

test('generator rejects canonical drift and unknown ownership instead of inventing a match',()=>{
 const manifest=read('docs/game-canon-manifest.json'),temp=mkdtempSync(join(tmpdir(),'crosswalk-canon-source-'));
 try{
  for(const path of Object.keys(manifest.sha256)){const dest=join(temp,path);mkdirSync(dirname(dest),{recursive:true});writeFileSync(dest,readFileSync(new URL('../'+path,import.meta.url)));}
  const source=structuredClone(guide);source.characters[0].age++;writeFileSync(join(temp,'docs/guide-content.json'),JSON.stringify(source));
  assert.throws(()=>gameCanonOutputs(temp),/mina: approved age/);
  writeFileSync(join(temp,'docs/guide-content.json'),JSON.stringify(guide));
  const objects=structuredClone(items);objects.items[0].ownership.ownerIds=['nonexistent'];writeFileSync(join(temp,'docs/manual/items.json'),JSON.stringify(objects));
  assert.throws(()=>gameCanonOutputs(temp),/unknown ownerIds nonexistent/);
 }finally{rmSync(temp,{recursive:true,force:true});}
});

test('venue component keeps detail optional, uses project-relative guide links and protects personal objects',()=>{
 const ts=require('typescript'),{renderToStaticMarkup}=require('react-dom/server'),{createElement}=require('react');
 const text=readFileSync(new URL('../app/venue-guide.tsx',import.meta.url),'utf8');
 const js=ts.transpileModule(text,{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX}}).outputText,module={exports:{}};
 const customRequire=id=>id.endsWith('.css')?{}:id==='@/lib/asset-url'?{assetUrl:path=>'/crosswalk/'+path.replace(/^\//,'')}:id==='@/lib/guide-presentation'?presentation:require(id);
 vm.runInNewContext(js,{module,exports:module.exports,require:customRequire});
 const Component=module.exports.VenueGuide;
 for(const venue of guideVenues){
  const html=renderToStaticMarkup(createElement(Component,{regionId:venue.regionId,placeId:venue.placeId}));
  assert.match(html,new RegExp(`data-guide-venue="${venue.id}"`));assert.ok(html.includes(`/crosswalk/manual/venues/${venue.id}/`));
  assert.match(html,/<details>/);assert.doesNotMatch(html,/<details[^>]*\bopen\b/);
  assert.match(html,/History, surroundings/);assert.match(html,/Weather &amp; shelter/);
  if(presentation.venueGuide(venue.regionId,venue.placeId).objects.length)assert.match(html,/does not mean an item is here to take/);
 }
 assert.equal(renderToStaticMarkup(createElement(Component,{regionId:'unknown',placeId:'MARKET'})),'');
});

test('browser catalog prose stays outside the mirrored service dependency graph',()=>{
 const manifest=read('supabase/functions/_shared/engine-manifest.json');
 assert.ok(manifest.sha256['guide-world-data.ts']);assert.ok(manifest.sha256['character-canon-data.ts']);
 assert.equal(manifest.sha256['guide-catalog.ts'],undefined);assert.equal(manifest.sha256['guide-presentation.ts'],undefined);
});
