import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const root=fileURLToPath(new URL('../',import.meta.url));
const sources=['docs/guide-content.json','docs/guide-approved-roster.json','docs/character-canon/personalities.json','docs/character-canon/families.json','docs/manual/venues.json','docs/manual/items.json','docs/manual/dispersed-families.json'];
const pick=(value,keys)=>Object.fromEntries(keys.filter(key=>value[key]!==undefined).map(key=>[key,value[key]]));
const firstSentence=value=>value.match(/^.*?[.!?](?:\s|$)/u)?.[0].trim()??value;
const json=value=>JSON.stringify(value,null,2);
const header='/** Generated from the current Travel Guide. Edit the authoring JSON and run\n * node scripts/build-game-canon.mjs. Do not edit this adapter by hand. */\n';

/** Only selected public world facts are projected. No review records, hosting
 * settings, source hashes, or authoring notes enter the runtime adapters. */
export function gameCanonOutputs(directory=root){
 const bytes=Object.fromEntries(sources.map(path=>[path,readFileSync(resolve(directory,path),'utf8')]));
 const read=path=>JSON.parse(bytes[path]);
 const guide=read(sources[0]),roster=read(sources[1]),personality=read(sources[2]),family=read(sources[3]),venues=read(sources[4]).venues,items=read(sources[5]),dispersed=read(sources[6]);
 const people=new Map(guide.characters.map(person=>[person.id,person])),profiles=new Map(personality.profiles.map(profile=>[profile.id,profile]));
 const ids=[...people.keys()].sort();
 assert.equal(people.size,guide.characters.length,'Duplicate guide person');
 assert.deepEqual(ids,roster.map(p=>p.id).sort(),'Approved roster differs');
 assert.deepEqual(ids,[...profiles.keys()].sort(),'Personality roster differs');
 assert.deepEqual(ids,family.people.map(p=>p.id).sort(),'Family roster differs');
 for(const person of guide.characters){
  const approved=roster.find(p=>p.id===person.id),member=family.people.find(p=>p.id===person.id);
  for(const field of ['name','age','region']){assert.equal(person[field],approved[field],`${person.id}: approved ${field}`);assert.equal(person[field],member[field],`${person.id}: family ${field}`);}
  for(const tie of person.family){assert.ok(people.has(tie.id),`${person.id}: unknown relative ${tie.id}`);assert.ok(people.get(tie.id).family.some(other=>other.id===person.id),`${person.id}: nonreciprocal relative ${tie.id}`);}
  assert.equal(profiles.get(person.id).profileKind,person.age<3?'toddler':person.age<13?'child':person.age<18?'adolescent':'adult');
 }
 const venueIds=new Set(venues.map(v=>v.id)),venueKeys=new Set(venues.map(v=>`${v.regionId}:${v.placeId}`)),regionIds=new Set(guide.locations.map(r=>r.id)),brands=new Set(items.brands.map(b=>b.id));
 assert.equal(venueIds.size,venues.length);assert.equal(venueKeys.size,venues.length);
 const checkPeople=(records,context)=>{for(const person of records??[])assert.ok(people.has(person.id),`${context}: unknown person ${person.id}`);};
 for(const venue of venues){assert.ok(regionIds.has(venue.regionId),`${venue.id}: unknown region`);checkPeople(venue.people,venue.id);}
 for(const item of items.items){checkPeople(item.people,item.id);for(const id of item.venueIds)assert.ok(venueIds.has(id),`${item.id}: unknown venue ${id}`);for(const id of item.brandIds??[])assert.ok(brands.has(id),`${item.id}: unknown brand ${id}`);for(const [key,value] of Object.entries(item.ownership))if(key.endsWith('Ids'))for(const id of value)assert.ok(people.has(id),`${item.id}: unknown ${key} ${id}`);}
 for(const connection of dispersed)for(const id of connection.people)assert.ok(people.has(id),`${connection.id}: unknown relative ${id}`);
 const characters=guide.characters.map(person=>{const profile=profiles.get(person.id);return{...pick(person,['id','name','age','region','hometown','role','intro','family','culturalBackground']),voice:profile.communicationStyle,needs:profile.coreNeeds,stress:profile.stressResponse,homeFit:profile.homeFit,profileKind:profile.profileKind};});
 const settings=Object.fromEntries(guide.locations.map(region=>[region.id,{subtitle:region.caption,description:`${firstSentence(region.settlementDescription)} ${firstSentence(region.climateDescription)}`}]))
 const placeNames=Object.fromEntries(guide.locations.map(region=>[region.id,Object.fromEntries(venues.filter(v=>v.regionId===region.id).map(v=>[v.placeId,v.name]))]));
 const venueData=venues.map(venue=>pick(venue,['id','regionId','regionName','placeId','name','function','summary','history','architecture','climateNotes','civicLife','people']));
 const itemData=items.items.map(item=>pick(item,['id','name','kind','summary','description','history','regionIds','people','venueIds','storyStatus','gameStatus','ownership','brandId','brandIds','brand','brandRole','image','storyNote','placeNote']));
 const brandData=items.brands.map(brand=>pick(brand,['id','name','category','summary','identity','pricePosition','quality','history','description','itemIds','regionIds','fictional']));
 return{
  'lib/character-canon-data.ts':header+`export type CanonicalCharacter={id:string;name:string;age:number;region:string;hometown:string;role:string;intro:string;family:{id:string;label:string}[];culturalBackground:string;voice:string;needs:string;stress:string;homeFit:{basis:string;fit:string;friction:string};profileKind:string};\nexport const canonicalCharacters:CanonicalCharacter[]=${json(characters)};\n`,
  'lib/guide-world-data.ts':header+`export const canonicalRegionSetting:Record<string,{subtitle:string;description:string}>=${json(settings)};\nexport const guidePlaceNames:Record<string,Record<string,string>>=${json(placeNames)};\n`,
  'lib/guide-item-facts.ts':header+`/** Static lore only. Story state must record each actual transfer separately. */\nexport type GuideItemFact={id:string;name:string;kind:string;regionIds:string[];venueIds:string[];people:{id:string;relationship:string}[];ownership:{ownerIds?:string[];ownerLabel?:string;keeperIds?:string[];borrowerIds?:string[];makerIds?:string[];makerLabel?:string;adultCareIds?:string[];currentCustody?:string;contentsOwnership?:string};storyStatus:string;gameStatus:string;brandId?:string;brandIds?:string[];brand?:string;image?:{src:string;alt:string;type:string}};\nexport const guideItemFactsById:Readonly<Record<string,GuideItemFact>>=${json(Object.fromEntries(itemData.map(item=>[item.id,pick(item,['id','name','kind','regionIds','venueIds','people','ownership','storyStatus','gameStatus','brandId','brandIds','brand','image'])])))};\n`,
  'lib/guide-catalog.ts':header+`/** Associations describe the guide's world; they do not establish current\n * presence, inventory, ownership transfers, or completed story events. */\nexport type GuideAssociation={id:string;relationship:string};\nexport type GuideVenue={id:string;regionId:string;regionName:string;placeId:string;name:string;function:string;summary:string;history:string;architecture:string;climateNotes:string;civicLife:string;people:GuideAssociation[]};\nexport type GuideOwnership={ownerIds?:string[];ownerLabel?:string;keeperIds?:string[];borrowerIds?:string[];makerIds?:string[];makerLabel?:string;adultCareIds?:string[];currentCustody?:string;contentsOwnership?:string};\nexport type GuideItem={id:string;name:string;kind:string;summary:string;description:string[];history:string[];regionIds:string[];people:GuideAssociation[];venueIds:string[];storyStatus:string;gameStatus:string;ownership:GuideOwnership;brandId?:string;brandIds?:string[];brand?:string;brandRole?:string;image?:{src:string;alt:string;type:string};storyNote?:string;placeNote?:string};\nexport type GuideBrand={id:string;name:string;category:string;summary:string;identity:string;pricePosition:string;quality:string;history:string[];description:string[];itemIds:string[];regionIds:string[];fictional:boolean};\nexport const guideVenues:GuideVenue[]=${json(venueData)};\nexport const guideItems:GuideItem[]=${json(itemData)};\nexport const guideBrands:GuideBrand[]=${json(brandData)};\nexport const guideVenueByKey:Readonly<Record<string,GuideVenue>>=Object.fromEntries(guideVenues.map(venue=>[venue.regionId+':'+venue.placeId,venue]));\nexport const guideItemById:Readonly<Record<string,GuideItem>>=Object.fromEntries(guideItems.map(item=>[item.id,item]));\nexport const guideBrandById:Readonly<Record<string,GuideBrand>>=Object.fromEntries(guideBrands.map(brand=>[brand.id,brand]));\nexport const guideDispersedFamilies:{id:string;anchor:string;title:string;people:string[];text:string}[]=${json(dispersed)};\n`,
  'docs/game-canon-manifest.json':json({source:'Current Travel Guide authoring sources; generated runtime adapters are projections, not a second canon.',sha256:Object.fromEntries(sources.map(path=>[path,createHash('sha256').update(bytes[path]).digest('hex')])),counts:{characters:characters.length,regions:regionIds.size,venues:venues.length,items:items.items.length,brands:items.brands.length}})+'\n',
 };
}
export function buildGameCanon({directory=root,check=false}={}){
 const output=gameCanonOutputs(directory);
 for(const [path,content] of Object.entries(output)){
  if(check)assert.equal(readFileSync(resolve(directory,path),'utf8'),content,`Game canon drift: ${path}. Run npm run canon:build, review, and sync the engine.`);
  else writeFileSync(resolve(directory,path),content);
 }
 return Object.keys(output);
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url))console.log(`${process.argv.includes('--check')?'Checked':'Generated'} ${buildGameCanon({check:process.argv.includes('--check')}).length} current guide adapters and manifest.`);
