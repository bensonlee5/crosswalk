import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {qualitativeStat,qualitativeText,effortLabel,gardenStage,visibleGameSummary} from '../lib/point-presentation.ts';
import {isQuietEffect} from '../lib/decision-presentation.ts';
import {currentGame} from './current-fixture.mjs';
import {worldChoiceEffects} from '../lib/world-choice-presentation.ts';
const root=fileURLToPath(new URL('../',import.meta.url)).replace(/\/$/,''),require=createRequire(root+'/package.json'),React=require('react'),ts=require('typescript'),{renderToStaticMarkup}=require('react-dom/server');
const G=require(root+'/lib/game.ts'),W=require(root+'/lib/world-life.ts'),L=require(root+'/lib/life-events.ts');
const leak=/(?:[+−-]?\d+(?:\.\d+)?(?:\/\d+)?\s*(?:%\s*)?(?:(?:local participation|weather|career|extra)\s+)?(?:energy|happiness|joy|skills?|craft(?: levels?)?|connections?|legacy|life points?|bond|trust)\b|\b(?:energy|happiness|joy|skills?|craft|connections?|legacy|score|trust)\s*[:(+−-]?\s*\d+(?:\.\d+)?|\b(?:one|two|three|four|five|six|seven|eight)\s+(?:(?:practical|career|earned)\s+)*(?:skills?|craft levels?|connections?)\b)/i;
const plain=html=>html.replace(/<[^>]*>/g,' ').replace(/&(?:#x27|apos);/g,"'");
function noPoints(html){assert.doesNotMatch(plain(html),leak);assert.doesNotMatch(html,/aria-value(?:now|max|min)=/);for(const [,value]of html.matchAll(/(?:aria-label|title)="([^"]*)"/g))assert.doesNotMatch(value,leak);}
const loaded=new Map();
function load(file){if(loaded.has(file))return loaded.get(file).exports;const module={exports:{}};loaded.set(file,module);const source=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ESNext,jsx:ts.JsxEmit.ReactJSX}}).outputText;vm.runInNewContext(source,{exports:module.exports,module,require:id=>id.endsWith('.css')?{}:id==='./game-painting'?{__esModule:true,default:props=>React.createElement('img',{src:props.src,alt:props.alt})}:id==='./game-art'?require(root+'/app/game-art.ts'):id.startsWith('@/')?require(root+'/'+id.slice(2)+'.ts'):id.startsWith('./')?load(root+'/app/'+id.slice(2)+'.tsx'):require(id)});return module.exports;}
const {StoryChoiceDeck,EncounterOutcome}=load(root+'/app/story-choices.tsx'),{ChoiceTerms}=load(root+'/app/place-invitations.tsx'),{LifeJournal,LifeEnding,PublicLifeSummary}=load(root+'/app/life-story.tsx'),WorldStory=load(root+'/app/world-story.tsx').default,{worldEncounterChoice}=load(root+'/app/encounter-panel.tsx');
const render=(Component,props)=>renderToStaticMarkup(React.createElement(Component,props));
function room(region='alder'){const g=currentGame({names:['Alex'],seed:15}),p=g.players[0];g.round=2;p.world.region=region;p.world.discoveredRegions=Object.keys(W.regionDefinitions);p.world.discoveredPlacesByRegion[region]=[...W.worldPlaceIds];return{p,g};}

test('coarse neutral bands accept every boundary, fractional step and malformed numeric input',()=>{
 const cuts={energy:[10,20,30,40,50,60,70,80,90],joy:[10,20,30,40,50,60,70,80,90],skill:[1,2,3,4,5,6],social:[1,2,4,6,8,11,14,18,24],craft:[1,2,3,4,5,6,7,8],legacy:[1,2,3,4,5,6,7,8,9,10]};
 for(const [stat,bounds]of Object.entries(cuts)){assert.equal(new Set([0,...bounds].map(value=>qualitativeStat(stat,value))).size,bounds.length+1);for(let n=0;n<=100;n+=.25)assert.doesNotMatch(qualitativeStat(stat,n),/\d|NaN|undefined/);for(const c of bounds){assert.notEqual(qualitativeStat(stat,c-.001),qualitativeStat(stat,c));assert.equal(qualitativeStat(stat,c),qualitativeStat(stat,c+.001));}for(const bad of [NaN,Infinity,-Infinity,-1])assert.doesNotMatch(qualitativeStat(stat,bad),/\d|undefined/);}
 assert.equal(qualitativeStat('energy',46.01),qualitativeStat('energy',46.99));assert.equal(qualitativeStat('skill',3.01),qualitativeStat('skill',3.99));
 for(const cost of [0,.1,1,7.5,8,19.9,20,100])assert.doesNotMatch(effortLabel(cost),/\d/);
 for(let done=0;done<=8;done+=.25)assert.doesNotMatch(gardenStage(done,8),/\d|%/);
});
test('numeric and fractional authored stat text never leaks; cash, time and real commitments survive',()=>{
 const cases=['Needs 3.5 skills (you have 1.25)','Needs 4 connections (you have 2)','Needs 2.5 energy including weather; rest at home first','Rest first: this work needs 8 energy','Craft 3 opens creative commissions','All six skills earned','All eight craft levels earned','Earn 2 more career skills, then apply.','Built six skills and reached the project-lead role.','Put three earned skills to useful work','+0.25 bond with Neri','Jo trust -0.5','-0.25 energy','+2 local participation happiness, included in the total.'];
 for(const text of cases){assert.doesNotMatch(qualitativeText(text),leak,text);assert.doesNotMatch(qualitativeText(text),/\d/,text);}
 for(const label of ['energy','happiness','skill','craft','connections','language','Neri bond','legacy'])for(const delta of [-.25,0,.25,12]){const text=`${delta>0?'+':''}${delta} ${label}`;assert.equal(isQuietEffect(text),true);assert.doesNotMatch(qualitativeText(text),leak);}
 const practical='Pay $144 upfront. Earn $3,072 take-home for 160 paid hours. 2 priority blocks. A promise for month 3; one block then. Permanently close here: CINEMA.';assert.equal(qualitativeText(practical),practical);
 assert.match(qualitativeText('−8 energy'),/Tiring/);assert.match(qualitativeText('+8 energy'),/Renewed energy/);assert.match(qualitativeText('4 energy'),/effort/);
});
test('all ordinary action terms preserve price/gates but never present point requirements',()=>{
 for(const value of [0,.25,2,4,6,8,30,100]){const {p,g}=room();Object.assign(p,{energy:value,joy:value,skill:Math.min(value,6),social:value,craft:Math.min(value,8),cash:6000});const before=JSON.stringify(g);for(const a of G.availableActions(p,undefined,g).length?G.availableActions(p,undefined,g):G.actions){const html=render(ChoiceTerms,{p,g,a});noPoints(html);assert.match(html,/\$/);assert.doesNotMatch(qualitativeText(G.reason(p,a.id,g)),leak);assert.doesNotMatch(qualitativeText(a.desc),leak);}assert.equal(JSON.stringify(g),before);}
});
test('all regional choice bodies, optional details and ARIA stay qualitative at resource floors and ceilings',()=>{
 let choices=0;
 for(const region of Object.keys(W.regionDefinitions))for(const value of [0,.25,19.9,45,99.75,100]){const {p,g}=room(region);p.energy=p.joy=value;p.cash=10000;const before=JSON.stringify(g);for(const c of W.worldChoices(p,g)){const choice=worldEncounterChoice(c,p,g);const html=render(StoryChoiceDeck,{g,choices:[choice],disabled:false,busy:false,onCommit:()=>assert.fail('Render cannot commit')});noPoints(html);assert.match(html,/\$/);assert.equal(/class="encounter-commit" disabled/.test(html),!c.available);choices++;}noPoints(render(WorldStory,{g,p,disabled:false,onAction:()=>assert.fail()}));assert.equal(JSON.stringify(g),before);}
 assert.ok(choices>250);
});
test('life journal, epilogue, observer, receipts and visible-game reader cannot expose raw points',()=>{
 for(const aspiration of ['career','community','creative','home'])for(const value of [0,.25,6,100]){const {p,g}=room();Object.assign(p,{aspiration,energy:value,joy:value,skill:Math.min(value,6),social:value,craft:Math.min(value,8),legacy:Math.min(value,10)});L.beginLifeWeek(g);const before=JSON.stringify(g);for(const Component of [LifeJournal,PublicLifeSummary])noPoints(render(Component,{p,g,disabled:false,onAction:()=>assert.fail()}));noPoints(render(LifeEnding,{g,onAgain:()=>{}}));assert.equal(JSON.stringify(g),before);const summary=visibleGameSummary(g);assert.equal(summary.players[0].cash,p.cash);assert.equal(summary.players[0].hours,p.hours);for(const key of ['energy','mood','learning','connections','creativeLife','legacy'])assert.equal(typeof summary.players[0][key],'string');assert.equal(summary.players[0].score,undefined);}
 noPoints(render(EncounterOutcome,{receipt:{title:'Done',body:'−2.5 energy. +0.5 connections.',outcome:'Paid $180 and +4 legacy.'},error:''}));
});
test('public guide and component source have no scoring dashboard or hidden numeric accessibility meter',()=>{
 const guide=fs.readFileSync(root+'/public/guide/index.html','utf8');noPoints(guide);assert.match(guide,/\$3,072/);assert.match(guide,/160 paid|160-hour/);
 const screen=fs.readFileSync(root+'/app/game-screen.tsx','utf8'),page=fs.readFileSync(root+'/app/page.tsx','utf8');assert.doesNotMatch(screen+page,/<progress|score\(|scoreParts\(|pathPoints\(|className="big-score"|aria-valuenow/);assert.match(screen,/personalEffects\(preview\)/);assert.match(screen,/qualitativeStat\('energy',\s*p.energy\)/);
});

const escapeHtml=text=>text.replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll("'",'&#x27;');
function choiceHtml(c,p,g){return render(StoryChoiceDeck,{g,choices:[worldEncounterChoice(c,p,g)],disabled:false,busy:false,onCommit:()=>assert.fail('Render cannot commit')});}
test('world discovery and closure consequences render regional names without changing engine choices',()=>{
 for(const region of Object.keys(W.regionDefinitions)){
  const {p,g}=room(region);p.cash=10000;p.world.discoveredPlacesByRegion[region]=['APARTMENTS','WORK','THE PARK','CORNER CAFÉ','COMMUNITY','CINEMA'];
  const snapshot=JSON.stringify(g),choices=W.worldChoices(p,g),raw=JSON.stringify(choices);
  for(const c of choices){
   const html=choiceHtml(c,p,g),effects=worldChoiceEffects(c,p,g),target=c.preview.region?{...p,world:{...p.world,region:c.preview.region}}:p;
   for(const [prefix,places,player]of [['Discover: ',c.preview.revealPlaces,target],['Permanently close here: ',c.preview.closePlaces,p]])if(places.length){
    const expected=prefix+places.map(place=>W.worldPlaceName(player,place,g)).join(', ');
    assert.ok(effects.includes(expected),region+'/'+c.key+': '+expected);assert.ok(html.includes(escapeHtml(expected)));
    for(const id of places)assert.ok(!effects.some(text=>text.startsWith(prefix)&&new RegExp('\\b'+id+'\\b').test(text)),id+' must not leak');
   }
   noPoints(html);
  }
  assert.equal(JSON.stringify(choices),raw);assert.equal(JSON.stringify(g),snapshot);
 }
 const {p,g}=room();p.world.discoveredPlacesByRegion.alder=['APARTMENTS','WORK','THE PARK','CORNER CAFÉ','COMMUNITY'];
 const explore=W.worldChoices(p,g).find(c=>c.key==='explore');assert.equal(explore.title,'Follow the covered service lanes');
 assert.ok(explore.previewText.includes('Discover: MARKET, TRANSIT'),'engine IDs are deliberately unchanged');
 assert.ok(choiceHtml(explore,p,g).includes('Discover: Ferry Bell Market, Alder Ferry &amp; Rail'));
 assert.ok(render(WorldStory,{g,p,disabled:false,onAction:()=>assert.fail()}).includes('Discover: Ferry Bell Market, Alder Ferry &amp; Rail'));
});
test('world discoveries use evolved shared venues and destination names before travel',()=>{
 const {p,g}=room();p.world.discoveredPlacesByRegion.alder=['APARTMENTS','WORK','THE PARK','CORNER CAFÉ','COMMUNITY'];
 W.applySharedVenueChange(g,{id:'renamed-market',region:'alder',place:'MARKET',status:'repurposed',name:'Ferry Day Food Hall',description:'A shared counter',reason:'A new chapter',source:'story'});
 W.applySharedVenueChange(g,{id:'renamed-destination',region:'saffron',place:'CORNER CAFÉ',status:'repurposed',name:'Canal Neighbors Café',description:'A shared table',reason:'A new chapter',source:'story'});
 const snapshot=JSON.stringify(g),explore=W.worldChoices(p,g).find(c=>c.key==='explore'),travel=W.worldChoices(p,g).find(c=>c.key==='travel:saffron');
 assert.ok(choiceHtml(explore,p,g).includes('Discover: Ferry Day Food Hall, Alder Ferry &amp; Rail'));
 assert.ok(choiceHtml(travel,p,g).includes('Canal Neighbors Café'));assert.doesNotMatch(choiceHtml(travel,p,g),/Discover: [^<]*Quay Corner Café/);
 assert.equal(JSON.stringify(g),snapshot);noPoints(choiceHtml(explore,p,g));noPoints(choiceHtml(travel,p,g));
});
test('shared evolved venue names survive reload and later public closure',()=>{
 const {g}=room();
 W.applySharedVenueChange(g,{id:'cinema-renamed',region:'alder',place:'CINEMA',status:'repurposed',name:'Quay Film House',description:'A shared screening room',reason:'A new chapter',source:'story'});
 const saved=JSON.parse(JSON.stringify(g)),q=saved.players[0],before=JSON.stringify(saved);
 assert.equal(W.worldPlaceName(q,'CINEMA',saved),'Quay Film House');
 assert.equal(JSON.stringify(saved),before);
 W.applySharedVenueChange(saved,{id:'cinema-closed',region:'alder',place:'CINEMA',status:'closed',name:'Quay Film House',description:'A shared venue transition',reason:'A public decision',source:'story'});
 assert.equal(W.visiblePlaces(q,saved).includes('CINEMA'),false);
 const html=render(WorldStory,{g:saved,p:q,disabled:false,onAction:()=>assert.fail()});assert.ok(html.includes('Quay Film House'));noPoints(html);
});
