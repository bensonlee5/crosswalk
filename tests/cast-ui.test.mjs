import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import vm from 'node:vm';
const root=new URL('..',import.meta.url).pathname.replace(/\/$/,''),require=createRequire(root+'/package.json'),ts=require('typescript'),React=require('react'),{renderToStaticMarkup}=require('react-dom/server');
const G=require(root+'/lib/game.ts'),L=require(root+'/lib/life-events.ts'),W=require(root+'/lib/world-life.ts'),C=require(root+'/lib/character-cast.ts'),Progress=require(root+'/lib/life-progress.ts'),E=require(root+'/lib/economy.ts');
const guardedProgress={...Progress,getLifeProgress:(p,g)=>{assert.notEqual(p.castRedacted,true,'Never recompute personal life from redacted relationship data');return Progress.getLifeProgress(p,g);}};
const loaded=new Map();
function load(file){if(loaded.has(file))return loaded.get(file).exports;const module={exports:{}};loaded.set(file,module);const js=ts.transpileModule(readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ESNext,jsx:ts.JsxEmit.ReactJSX}}).outputText;vm.runInNewContext(js,{exports:module.exports,module,require:id=>id==='./game-painting'?{__esModule:true,default:props=>React.createElement('img',{src:props.src,alt:props.alt})}:id==='./game-art'?require(root+'/app/game-art.ts'):id==='@/lib/life-progress'?guardedProgress:id.startsWith('@/')?require(root+'/'+id.slice(2)+'.ts'):id.startsWith('./')?load(root+'/app/'+id.slice(2)+'.tsx'):require(id)});return module.exports;}
const UI=load(root+'/app/cast-story.tsx'),Panel=load(root+'/app/encounter-panel.tsx').default,Ending=load(root+'/app/life-story.tsx').LifeEnding,Journal=load(root+'/app/life-story.tsx').LifeJournal,Heading=load(root+'/app/life-story.tsx').LifeHeadingLabel;
const render=(Component,props)=>renderToStaticMarkup(React.createElement(Component,props));
function room(){const p=G.player('Traveler');const g={code:'CASTUI',mode:'hotseat',host:'x',members:{},players:[p],status:'playing',round:1,turn:0,maxRounds:8,log:[],seen:[],event:0,rulesVersion:2,lifeVersion:1,storyVersion:1,economyVersion:1,castVersion:1};L.initializeLife(g,15);W.initializeWorldPlayer(p);C.initializeCast(g);return{p,g};}
const {p,g}=room(),base={g,p,disabled:false,onAction:()=>{throw Error('render invoked action')},onClose:()=>{},onEncounter:()=>{throw Error('render navigated')}};
let checked=0;
for(const region of Object.keys(W.regionDefinitions)){p.world.region=region;p.world.discoveredPlacesByRegion[region]=['APARTMENTS','WORK','THE PARK','CORNER CAFÉ','COMMUNITY'];const people=C.castPeople(g,p);assert.ok(people.length);for(const person of people){p.place=person.spot;const before=JSON.stringify(g);const html=render(Panel,{...base,actorId:person.id,spot:person.spot});assert.equal(JSON.stringify(g),before);assert.ok(html.includes(person.name));assert.ok(html.includes('A life of their own'));assert.ok(html.includes('What '+person.name+' is working toward'));assert.ok(html.includes('A connection between lives'));assert.ok(html.includes('Commitments and consequences'));assert.ok(!/NaN|undefined/.test(html));assert.ok(html.includes('Choose: '));checked++;}const html=render(UI.CastMeetups,base);assert.ok((html.match(/class="cast-meetup-token"/g)||[]).length<=3);assert.ok(!/collect all|complete your cast/i.test(html));}
p.world.region='alder';const person=C.castPeople(g,p)[0];p.place=person.spot;C.resolveCastChoice(g,p,C.castPeople(g,p).find(x=>x.id===person.id).choices[0].id);assert.ok(render(UI.CastJournal,base).includes(person.name));assert.ok(render(Panel,{...base,actorId:person.id,spot:person.spot}).includes('What '+person.name+' remembers'));
g.round=2;g.cast.schedule[2]=g.cast.schedule[2].filter(x=>x.id!==person.id);const remote=C.castPeople(g,p).find(x=>x.id===person.id);assert.equal(remote.remote,true);assert.equal(remote.spot,'COMMUNITY');p.place='COMMUNITY';assert.ok(render(Panel,{...base,actorId:remote.id,spot:remote.spot}).includes('Keeping in touch'));assert.ok(render(UI.CastMeetups,base).includes('Keep in touch with '+person.name));const promise=C.castPeople(g,p).find(x=>x.id===person.id).choices.find(x=>x.key==='promise');C.resolveCastChoice(g,p,promise.id);assert.equal(render(UI.CastPromiseNotice,base),'');g.round=3;assert.ok(render(UI.CastPromiseNotice,base).includes('Ending now records that promise as missed'));C.endCastMonth(g,p);assert.equal(render(UI.CastPromiseNotice,base),'');assert.ok(render(Ending,{g,onAgain(){}}).includes('The lives that touched yours'));
const legacy=structuredClone(g);delete legacy.castVersion;delete legacy.cast;delete legacy.players[0].cast;assert.equal(render(UI.CastMeetups,{...base,g:legacy,p:legacy.players[0]}),'');assert.equal(render(UI.CastJournal,{g:legacy,p:legacy.players[0]}),'');assert.equal(render(UI.CastPromiseNotice,{g:legacy,p:legacy.players[0]}),'');
console.log(`PASS: ${checked} rendered cast encounters across all regions; maximum three timely invitations; pure rendering; exact choice controls; receipt journal; remote labels and return route; due-promise review warning; truthful endings; legacy guards.`);

// A hidden cast is unknown, not absent: observer UI must never infer lost belonging.
{
 const {p:owner,g:roomState}=room();roomState.mode='online';roomState.round=5;
 E.initializeEconomyPlayer(owner,{...roomState,status:'lobby'});owner.aspiration='home';owner.cash=10000;owner.energy=70;owner.joy=70;owner.life.activityCounts={home_reset:2,home_host:1};
 const bram=require(root+'/lib/cast-characters.ts').castCharacters.find(person=>person.name==='Bram');
 owner.cast.bonds[bram.id]={phase:'close',approach:'listen',lastWeek:4,conflict:false,repaired:false,memories:[{week:4,text:bram.farewell}]};
 Progress.recordLifeProgress(roomState,owner);assert.ok(owner.milestones.includes('home_rooted'));assert.equal(Progress.getLifeProgress(owner,roomState).currentTier,'Rooted');
 const ownerRoom={...roomState,...C.castMemberFields(roomState,[owner.id])},observerRoom={...roomState,...C.castMemberFields(roomState,[])};
 const own=ownerRoom.players[0],observed=observerRoom.players[0];assert.equal(own.castRedacted,undefined);assert.equal(observed.castRedacted,true);assert.equal(observed.cast,undefined);
 const ownerJournal=render(Journal,{g:ownerRoom,p:own,disabled:false,onAction(){throw Error('SSR submitted a move')}});assert.match(ownerJournal,/Current footing: Rooted/);assert.match(ownerJournal,/Bram/);
 const ownerEnding=render(Ending,{g:ownerRoom,onAgain(){}});assert.match(ownerEnding,/You earned the Rooted chapter/);assert.doesNotMatch(ownerEnding,/present footing has changed|A lasting bond is still growing/);
 for(const html of [render(Journal,{g:observerRoom,p:observed,disabled:true,onAction(){throw Error('Observer submitted a move')}}),render(Ending,{g:observerRoom,onAgain(){}})]){
  assert.match(html,/Personal life is private/);assert.match(html,/Earned chapters/);assert.match(html,/<li>Rooted<\/li>/,'Stored earned history stays public without recalculating current footing');
  assert.doesNotMatch(html,/Current footing:|A lasting bond is still growing|present footing has changed|To strengthen your footing|<h2>Home-maker<\/h2>|life-foundations|life-ladders|Bram/);
 }
 assert.equal(render(Heading,{g:observerRoom,p:observed}),'Personal life is private');assert.equal(render(Heading,{g:ownerRoom,p:own}),'A place to belong');
 assert.equal(owner.castRedacted,undefined,'Redaction never marks the persisted owner');assert.ok(owner.cast.bonds[bram.id]);
 const screenSource=readFileSync(root+'/app/game-screen.tsx','utf8');assert.ok(screenSource.includes('<LifeHeadingLabel g={g} p={p}/>'));assert.ok(screenSource.includes('p.castRedacted?<PublicLifeSummary'));
 console.log('PASS: owner keeps cast-only Rooted; observers see privacy notices and stored earned history, never recomputed titles, false lost footing, foundations, personal epilogues or private cast names.');
}

// Layered histories are discoverable for every established identity without rendering another seat's knowledge.
{
 const H=require(root+'/lib/character-histories.ts'),Profile=load(root+'/app/character-history.tsx').CharacterHistory;
 const {p,g}=room();g.historyVersion=1;
 for(const character of H.characterHistories){const before=JSON.stringify(g),html=render(Profile,{g,p,actorId:character.id});assert.ok(html.includes('Before your paths crossed'));assert.ok(html.includes(character.name));assert.ok(!html.includes(character.closer));assert.equal(JSON.stringify(g),before);}
 p.cast.bonds.oren={phase:'close',approach:'listen',lastWeek:5,conflict:false,repaired:false,memories:[]};
 const familiar=render(Profile,{g,p,actorId:'oren'});assert.match(familiar,/Brothers/);assert.match(familiar,/Miro/);assert.match(familiar,/own perspective to share/);
 const legacy={...g};delete legacy.historyVersion;assert.equal(render(Profile,{g:legacy,p,actorId:'oren'}),'');
 assert.equal(render(Profile,{g,p:{...p,castRedacted:true},actorId:'oren'}),'');
 console.log('PASS: all 26 discoverable history profiles; deeper biographies gated; selective connections and unearned perspectives hidden; legacy and observer profiles absent.');
}
