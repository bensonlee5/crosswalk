import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import vm from 'node:vm';
import {createGame} from '../supabase/functions/crosswalk-game/game-service.ts';
import {castPeople} from '../lib/character-cast.ts';
import {motiveScene} from '../lib/character-motives.ts';
import {getStoryView} from '../lib/story-arcs.ts';
import {regionDefinitions,worldPlaceIds,worldView,worldPlaceName} from '../lib/world-life.ts';
import {personSceneProfiles} from '../lib/person-scene-profiles.ts';
import {canonicalCharacterById} from '../lib/character-canon.ts';
import {capturePersonReceipt} from '../lib/person-response.ts';

// Exercise the actual TSX modules with the same small SSR loader as cast-ui.
// No browser, network, real animation clock, build or full-suite invocation.
const root = new URL('..',import.meta.url).pathname.replace(/\/$/, '');
const require = createRequire(root+'/package.json'), ts = require('typescript'), React = require('react');
const {renderToStaticMarkup} = require('react-dom/server');
function uiModules(react = React, globals = {}) {
  const loaded = new Map();
  function load(file) {
    if (loaded.has(file)) return loaded.get(file).exports;
    const module = {exports:{}};
    loaded.set(file,module);
    const js = ts.transpileModule(readFileSync(file,'utf8'), {compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ESNext,jsx:ts.JsxEmit.ReactJSX}}).outputText;
    vm.runInNewContext(js, {module,exports:module.exports,...globals,require:id =>
      id === 'react' ? react :
      id === './game-painting' ? {__esModule:true,default:({src,alt,className})=>React.createElement('img',{src,alt,className})} :
      id === './game-art' ? require(root+'/app/game-art.ts') :
      id.startsWith('@/') ? require(root+'/'+id.slice(2)+'.ts') :
      id.startsWith('./') ? load(root+'/app/'+id.slice(2)+'.tsx') : require(id)});
    return module.exports;
  }
  return name => load(root+'/app/'+name+'.tsx');
}
const modules = uiModules(), {PersonResponseStage,PersonReturn} = modules('person-response');
const Panel = modules('encounter-panel').default;
const render = (Component,props) => renderToStaticMarkup(React.createElement(Component,props));
const escape = value => value.replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll("'",'&#x27;').replaceAll('<','&lt;').replaceAll('>','&gt;');
function fixture(round = 1) {
  const g = createGame({mode:'hotseat',names:['Reader'],ownerSession:'owner',requestId:'responsive-ui'},'PEOPLE');
  const p = g.players[0];
  g.round = round;
  for (const region of Object.keys(regionDefinitions)) p.world.discoveredPlacesByRegion[region] = [...worldPlaceIds];
  return {g,p};
}
const noAction = () => {throw Error('Rendering submitted an action');};
const find = (node,predicate,result=[]) => {
  if (Array.isArray(node)) {for (const child of node) find(child,predicate,result);return result;}
  if (!node || typeof node !== 'object') return result;
  if (predicate(node)) result.push(node);
  find(node.props?.children,predicate,result);
  return result;
};
const byClass = (tree,name) => find(tree,n=>n.props?.className?.split(' ').includes(name));

function harness(select,initialProps,globals={}) {
  const slots=[],dependencies=[],cleanups=[];
  let cursor=0,effects=[],props=initialProps,result,dirty=true,unmounted=false;
  const react = {...React,
    useRef(value) {const i=cursor++;return slots[i]??(slots[i]={current:value});},
    useState(initial) {const i=cursor++;if (!(i in slots)) slots[i]=typeof initial==='function'?initial():initial;
      return [slots[i],value=>{const next=typeof value==='function'?value(slots[i]):value;if(!Object.is(slots[i],next)){slots[i]=next;dirty=true;}}];},
    useEffect(fn,next) {const i=cursor++;if(!dependencies[i]||!next||next.some((v,j)=>!Object.is(v,dependencies[i][j]))){dependencies[i]=next;effects.push(()=>{cleanups[i]?.();cleanups[i]=fn();});}},
  };
  const Component = select(uiModules(react,globals));
  function renderNow(extra={}) {
    assert.equal(unmounted,false);
    props={...props,...extra};dirty=true;
    let attempts=0;
    while(dirty) {assert.ok(++attempts<12,'hook updates settle');dirty=false;cursor=0;effects=[];result=Component(props);globals.attach?.(result);for(const run of effects)run();}
    return result;
  }
  return {render:renderNow,get result(){return result;},unmount(){unmounted=true;for(const cleanup of cleanups)cleanup?.();}};
}

test('all 39 portraits keep actual venue, activity, visible gesture and emotion across every month', () => {
  const ids = Object.keys(personSceneProfiles);
  assert.equal(ids.length,39);
  for(let round=1;round<=8;round++) {
    const {g,p}=fixture(round);
    for(const actorId of ids) {
      const person=canonicalCharacterById[actorId];
      p.world.region=regionDefinitions[person.region]?person.region:'alder';
      // A venue supplied by the encounter is authoritative, never the portrait background.
      p.place='THE PARK';
      const before=JSON.stringify(g), html=render(PersonResponseStage,{g,p,actorId,name:person.name,spot:p.place});
      assert.equal(JSON.stringify(g),before);
      assert.match(html,/class="person-scene"/);
      assert.ok(html.includes(`/character-portraits/${actorId}.webp`),actorId);
      assert.ok(html.includes(escape(worldPlaceName(p,p.place,g))));
      assert.ok(html.includes(`/paintings/world/${p.world.region}.webp`));
      assert.match(html,/class="person-acting"/);
      assert.match(html,/class="person-emotion"/);
      assert.match(html,/class="person-action"[^>]*role="img"/);
      assert.match(html,/role="status" aria-live="polite" aria-atomic="true"/);
      assert.doesNotMatch(html,/NaN|undefined/);
    }
  }
});

test('real encounter panels render all currently accessible actor routes through all eight rounds', t => {
  const seen=new Set(), rounds=new Set();
  let rendered=0;
  for(let round=1;round<=8;round++) {
    const {g,p}=fixture(round);
    // This fixture represents Kit physically present, so Bea’s family route is testable.
    g.cast.schedule[round]=g.cast.schedule[round].filter(a=>a.id!=='kit');
    g.cast.schedule[round].push({id:'kit',region:'embermesa',spot:'COMMUNITY',kind:'local'});
    for(const region of Object.keys(regionDefinitions)) {
      p.world.region=region;
      p.world.story.neri.stage='introduced';
      p.world.companionStatus='companion';
      const routes=castPeople(g,p).map(c=>({actorId:c.id,spot:c.spot}));
      const world=worldView(p,g);
      for(const choice of world?.choices??[]) if(choice.actorId&&personSceneProfiles[choice.actorId])routes.push({actorId:choice.actorId,spot:choice.spot});
      if(region==='alder')for(const scene of getStoryView(g,p).scenes)for(const actorId of scene.characters)routes.push({actorId,spot:scene.spot});
      const unique=[...new Map(routes.filter(r=>r.spot).map(r=>[r.actorId+'@'+r.spot,r])).values()];
      for(const route of unique) {
        p.place=route.spot;
        const before=JSON.stringify(g);
        const html=render(Panel,{g,p,...route,disabled:false,onAction:noAction,onClose:noAction});
        assert.equal(JSON.stringify(g),before);
        assert.match(html,/class="person-scene"/);
        assert.match(html,/class="person-acting"/);
        assert.match(html,/class="person-emotion"/);
        assert.ok(html.includes('Back to '+escape(worldPlaceName(p,route.spot,g))));
        assert.doesNotMatch(html,/NaN|undefined/);
        seen.add(route.actorId);rounds.add(round);rendered++;
      }
    }
  }
  assert.deepEqual([...seen].sort(),Object.keys(personSceneProfiles).sort());
  assert.equal(rounds.size,8);
  assert.ok(rendered>200,`${rendered} actual encounter routes rendered`);
  t.diagnostic(`${rendered} actual encounter routes, ${seen.size} people, ${rounds.size} months`);
});

test('preview, pending, failure, private and remote stages convey only the verified state', () => {
  const {g,p}=fixture(), base={g,p,actorId:'jo',name:'Jo',spot:'COMMUNITY'};
  for(const [extra,phase] of [[{pending:true},'pending'],[{error:'Unconfirmed'},'paused'],[{preview:{id:'x',actionId:'x',title:'X',available:true,reason:''}},'considering']]) {
    const html=render(PersonResponseStage,{...base,...extra});
    assert.ok(html.includes(`data-person-phase="${phase}"`));
    assert.match(html,/person-silent/);
    assert.doesNotMatch(html,/Response recorded|Thank you|paid|reward/i);
  }
  const hidden=render(PersonResponseStage,{...base,p:{...p,castRedacted:true},receipt:{id:'secret',title:'Secret',body:'PRIVATE RECEIPT',response:{speakerId:'jo',speech:'PRIVATE QUOTE',activity:'PRIVATE ACTION',emotion:'hurt',gesture:'withdraw'}}});
  assert.match(hidden,/conversation is private/);
  assert.doesNotMatch(hidden,/PRIVATE RECEIPT|PRIVATE QUOTE|PRIVATE ACTION|keeping a little distance/i);
  const remote=render(PersonResponseStage,{...base,remote:true});
  const remoteLabel=remote.match(/<section[^>]*aria-label="([^"]+)"/)?.[1];
  assert.ok(remoteLabel);
  assert.match(remoteLabel,/Jo.*correspondence/i);
  assert.ok(remoteLabel.includes('you are at '+escape(worldPlaceName(p,base.spot,g))));
  assert.doesNotMatch(remoteLabel,/^Jo at /,'the accessible name must not locate Jo at the player’s venue');
  assert.match(remote,/their location is not shown/);
  assert.match(remote,/data-gesture="letter"/);
  assert.doesNotMatch(remote,/HERE TOGETHER|person-action-hand/);
  const settled=render(PersonResponseStage,{...base,settled:true,available:false});
  assert.match(settled,/data-person-phase="settled"/);
  assert.doesNotMatch(settled,/Choose:|will be here|always available/i);
  const elsewhere={...p,world:{...p.world,region:'pelagia'}};
  const distant=render(PersonResponseStage,{...base,p:elsewhere,spot:'THE PARK',remote:true});
  const distantLabel=distant.match(/<section[^>]*aria-label="([^"]+)"/)?.[1];
  assert.ok(distantLabel?.includes('you are at '+escape(worldPlaceName(elsewhere,'THE PARK',g))),'remote accessibility follows the player’s current region and venue');
});

test('response choices can be explored without committing, while blocked and pending choices cannot submit', () => {
  const {g}=fixture(), selected=[],commits=[];
  const choices=[
    {id:'one',actionId:'one',title:'One small question',body:'A bounded question.',available:true,reason:'',previewText:[],cost:{time:1,cash:0,energy:0}},
    {id:'two',actionId:'two',title:'Unavailable work',body:'This needs more time.',available:false,reason:'Needs one priority block',previewText:[],cost:{time:1,cash:0,energy:0}},
  ];
  const h=harness(m=>m('story-choices').StoryChoiceDeck,{g,choices,disabled:false,busy:false,conversational:true,onSelect:c=>selected.push(c.id),onCommit:c=>commits.push(c.id)});
  let tree=h.render();
  byClass(tree,'encounter-option')[1].props.onClick();tree=h.render();
  assert.deepEqual(selected,['two']);assert.deepEqual(commits,[]);
  assert.equal(byClass(tree,'encounter-commit')[0].props.disabled,true);
  byClass(tree,'encounter-commit')[0].props.onClick();assert.deepEqual(commits,[]);
  byClass(tree,'encounter-option')[0].props.onClick();tree=h.render();
  assert.deepEqual(commits,[]);
  byClass(tree,'encounter-commit')[0].props.onClick();assert.deepEqual(commits,['one']);
  tree=h.render({busy:true});byClass(tree,'encounter-option')[1].props.onClick();byClass(tree,'encounter-commit')[0].props.onClick();
  assert.deepEqual(selected,['two','one']);assert.deepEqual(commits,['one']);
});

test('the actual commit hook waits for exact receipts, deduplicates clicks and ignores stale or closed scenes', async () => {
  const {g,p}=fixture(), choice={id:'one',actionId:'cast:1:jo:help',available:true};
  let resolve,calls=0;
  const props={g,p,context:'jo|1',disabled:false,choices:[choice],onAction:()=>{calls++;return new Promise(r=>resolve=r);},findReceipt:(_g,updated,c)=>updated.cast.receipts.find(r=>r.id===c.id)??null};
  const h=harness(m=>m('story-choices').useEncounterCommit,props);
  let state=h.render(),task=state.commit(choice);state.commit(choice);state=h.render();
  assert.equal(calls,1);assert.equal(state.busy,true);assert.equal(state.receipt,null);
  const response={speakerId:'jo',speech:'That is the edge.',activity:'Puts down the ruler.',emotion:'warm',gesture:'offer'};
  const confirmed=structuredClone(g);confirmed.players[0].cast.receipts.push({id:'one',title:'Confirmed',body:'Recorded.',response});
  resolve(confirmed);await task;state=h.render();
  assert.deepEqual(JSON.parse(JSON.stringify(state.receipt.response)),response);
  assert.equal(state.receipt.actionId,choice.actionId);
  await state.commit(choice);assert.equal(calls,1);

  state=h.render({context:'jo|2'});task=state.commit(choice);resolve(undefined);await task;state=h.render();
  assert.equal(state.receipt,null);assert.match(state.error,/wasn’t confirmed/);
  task=state.commit(choice);assert.equal(calls,3,'failed work can be explicitly retried');
  state=h.render({context:'mina|2'});resolve(confirmed);await task;state=h.render();assert.equal(state.receipt,null);
  task=state.commit(choice);h.unmount();resolve(confirmed);await task;
});

test('actual cast and shared-story adapters retain authoritative response metadata', async () => {
  const response={speakerId:'bram',speech:'One checked line.',activity:'Folds the map.',emotion:'relieved',gesture:'pause'};
  const {g,p}=fixture();
  p.world.region='alder';g.cast.schedule[1]=[{id:'bram',region:'alder',spot:'COMMUNITY',kind:'local'}];p.place='COMMUNITY';
  const person=castPeople(g,p).find(c=>c.id==='bram'),choice=person.choices[0];
  assert.equal(choice.available,true,choice.reason);
  const confirmed=structuredClone(g);confirmed.players[0].cast.receipts.push({id:choice.id,title:'Confirmed',body:'Recorded.',outcome:'The map remains Bram’s.',response});
  let calls=0;
  const h=harness(m=>m('cast-story').CastEncounterPanel,{g,p,person,spot:p.place,disabled:false,onAction:async()=>{calls++;return confirmed;},onClose:noAction});
  let tree=h.render();const deck=find(tree,n=>n.type?.name==='StoryChoiceDeck')[0];deck.props.onCommit(choice);
  for(let tick=0;tick<5;tick++)await Promise.resolve();
  tree=h.render();assert.equal(calls,1);
  const stage=find(tree,n=>n.type?.name==='PersonResponseStage')[0];
  assert.equal(stage.props.error,'');assert.equal(stage.props.pending,false);
  assert.deepEqual(JSON.parse(JSON.stringify(stage.props.receipt?.response??null)),response);

  const original=fixture(),scene=getStoryView(original.g,original.p).scenes[0];original.p.place=scene.spot;
  const selected=scene.choices.find(c=>c.available)??getStoryView(original.g,original.p).scenes[0].choices.find(c=>c.available);
  assert.ok(selected);
  const storyResponse={...response,speakerId:'mina',speech:'One shift, as agreed.'};
  const result=structuredClone(original.g);result.players[0].story.receipts.push({sceneId:scene.id,choiceId:selected.id,characterIds:['mina','eli','jo'],week:1,title:'Confirmed',body:'Recorded.',outcome:'One preparation shift.',response:storyResponse});
  const storyProps={...original,actorId:'mina',spot:scene.spot,disabled:false,onAction:async()=>result,onClose:noAction};
  const s=harness(m=>m('encounter-panel').default(storyProps).type,storyProps);
  tree=s.render();const storyDeck=find(tree,n=>n.type?.name==='StoryChoiceDeck')[0];storyDeck.props.onCommit(storyDeck.props.choices.find(c=>c.id===selected.id));
  for(let tick=0;tick<5;tick++)await Promise.resolve();
  tree=s.render();
  assert.deepEqual(JSON.parse(JSON.stringify(find(tree,n=>n.type?.name==='PersonResponseStage')[0].props.receipt?.response??null)),storyResponse);
});

test('confirmed gestures animate once per receipt and reduced motion preserves a readable final pose', () => {
  const {g,p}=fixture(),props={g,p,actorId:'jo',name:'Jo',spot:'COMMUNITY'};
  let animations=0,cancelled=0;
  const target={animate(_frames,options){animations++;assert.ok(options.duration<1000);return{cancel(){cancelled++;}};}};
  const globals={window:{matchMedia:()=>({matches:false})},attach:tree=>{tree.props.ref.current={querySelector:()=>target};}};
  const h=harness(m=>m('person-response').PersonResponseStage,props,globals);
  h.render();h.render({preview:{id:'one',actionId:'one',title:'One',available:true,reason:''}});
  assert.equal(animations,0,'selecting a response is not a completed action');
  const receipt={id:'confirmed-one',title:'Confirmed',body:'Recorded.',response:{speakerId:'jo',speech:'One edge.',activity:'Sets down the ruler.',emotion:'warm',gesture:'offer'}};
  h.render({receipt,preview:null});assert.equal(animations,1);
  h.render({receipt:{...receipt}});h.render({name:'Jo'});assert.equal(animations,1,'polling cannot replay the receipt');
  h.render({receipt:{...receipt,id:'confirmed-two'}});assert.equal(animations,2);
  h.unmount();assert.ok(cancelled>=1);
  const reduced=harness(m=>m('person-response').PersonResponseStage,{...props,receipt},{...globals,window:{matchMedia:()=>({matches:true})}});
  const tree=reduced.render();assert.equal(animations,2);
  const action=find(tree,n=>n.type?.name==='PersonAction')[0];
  assert.equal(action.props.reply.gesture,'offer');assert.equal(action.props.reply.activity,'Sets down the ruler.');
  reduced.unmount();
});

test('a repeated semantic repair animates each accepted count and month once, independently of polling', () => {
  const {g,p}=fixture(),props={g,p,actorId:'jo',name:'Jo',spot:'COMMUNITY'};
  let animations=0;
  const target={animate(){animations++;return{cancel(){}};}};
  const globals={window:{matchMedia:()=>({matches:false})},attach:tree=>{tree.props.ref.current={querySelector:()=>target};}};
  const h=harness(m=>m('person-response').PersonResponseStage,props,globals);
  const receipt={actionId:'repair:jo',week:1,title:'A small repair',body:'A confirmed response.',familiarity:{count:1,stage:'first',lastVariant:0,tracked:true,lastRound:1},response:{speakerId:'jo',speech:'Keep the edge as it is.',activity:'Puts down the ruler.',emotion:'relieved',gesture:'pause'}};
  h.render({receipt});assert.equal(animations,1);
  h.render({receipt:structuredClone(receipt)});assert.equal(animations,1);
  const again={...receipt,familiarity:{...receipt.familiarity,count:2,stage:'familiar',lastVariant:1}};
  h.render({receipt:again});assert.equal(animations,2,'a separately accepted repair with the same action ID can animate');
  h.render({receipt:structuredClone(again)});assert.equal(animations,2);
  const laterPlayer={...p,familiarity:{version:1,startedRound:1,actions:{},people:{jo:{count:9,lastRound:2,lastVariant:8}}}};
  h.render({p:laterPlayer});assert.equal(animations,2,'later live familiarity cannot replay a frozen receipt');
  const nextMonth={...again,week:2};
  h.render({receipt:nextMonth});assert.equal(animations,3,'a new confirmed month is a new presentation occurrence');
  h.render({receipt:structuredClone(nextMonth)});assert.equal(animations,3);
  h.render({g:{...g,code:'OTHER'}});assert.equal(animations,4,'a new game cannot collide with an old receipt key');
  h.render({p:{...laterPlayer,id:'another-player'}});assert.equal(animations,5,'a different player owns an independent receipt');
  h.render();assert.equal(animations,5);
  h.unmount();
});

test('a retained receipt cannot speak, focus or animate through pending, failed or private state', () => {
  const {g,p}=fixture();let animations=0,focused=0;
  const receipt={id:'retained',title:'Earlier',body:'Earlier result.',emotion:'delighted',response:{speakerId:'mina',speech:'PRIVATE SUCCESS',activity:'PRIVATE COMPLETION',emotion:'relieved',gesture:'offer'}};
  const target={animate(){animations++;return{cancel(){}};}};
  const globals={document:{body:null,activeElement:null},window:{matchMedia:()=>({matches:false})},attach:tree=>{tree.props.ref.current={focus(){focused++;},querySelector:()=>target};}};
  const h=harness(m=>m('person-response').PersonResponseStage,{g,p,actorId:'mina',name:'Mina',spot:'COMMUNITY',receipt,pending:true},globals);
  for(const state of [{pending:true},{pending:false,error:'Not confirmed'},{error:null,p:{...p,castRedacted:true}}]){
    const tree=h.render(state),html=renderToStaticMarkup(tree);
    assert.equal(animations,0);assert.equal(focused,0);
    assert.doesNotMatch(html,/PRIVATE SUCCESS|PRIVATE COMPLETION|mina-delighted/);
    assert.notEqual(tree.props['data-person-phase'],'confirmed');
  }
  h.render({p,pending:false,error:null});assert.equal(animations,1);assert.equal(focused,1);
  h.render({receipt:structuredClone(receipt)});assert.equal(animations,1);
  h.unmount();
});

test('confirmed response focus is restored only from a lost focus or the same encounter', () => {
  const {g,p}=fixture(),body={},inside={},outside={},document={body,activeElement:body};
  let focused=0;
  const element={focus(){focused++;},closest(){return{contains:node=>node===inside};},querySelector(){return null;}};
  const h=harness(m=>m('person-response').PersonResponseStage,{g,p,actorId:'jo',name:'Jo',spot:'COMMUNITY'},
    {document,window:{matchMedia:()=>({matches:true})},attach:tree=>{tree.props.ref.current=element;}});
  h.render();h.render({pending:true});assert.equal(focused,0,'an unconfirmed choice does not move focus');
  const receipt={actionId:'repair:jo',week:1,title:'Confirmed',body:'Recorded.',familiarity:{count:1,stage:'first',lastVariant:0,tracked:true}};
  let tree=h.render({receipt,pending:false});assert.equal(focused,1);assert.equal(tree.props.tabIndex,-1);
  h.render({receipt:structuredClone(receipt)});assert.equal(focused,1,'a receipt poll does not steal focus');
  document.activeElement=inside;
  h.render({receipt:{...receipt,familiarity:{...receipt.familiarity,count:2}}});assert.equal(focused,2);
  document.activeElement=outside;
  tree=h.render({receipt:{...receipt,familiarity:{...receipt.familiarity,count:3}}});assert.equal(focused,2,'focus deliberately moved outside the encounter stays there');
  assert.equal(tree.props['data-person-phase'],'confirmed');
  h.unmount();
});

test('world conversations and motive exchanges also retain the confirmed speaker and response', async () => {
  const {g,p}=fixture();
  const actorId='alder_tess';
  p.place=worldView(p,g).choices.find(c=>c.actorId===actorId&&c.kind==='conversation').spot;
  const choice=worldView(p,g).choices.find(c=>c.actorId===actorId&&c.kind==='conversation');
  assert.equal(choice.available,true,choice.reason);
  const response={speakerId:actorId,speech:'The closing time stays.',activity:'Underlines the finish.',emotion:'firm',gesture:'point'};
  const result=structuredClone(g);
  result.players[0].world.journal.push({choiceId:choice.id,week:1,region:'alder',title:'Confirmed',text:'One public closing time.',response});
  const props={g,p,actorId,spot:p.place,disabled:false,onAction:async()=>result,onClose:noAction};
  const h=harness(m=>m('encounter-panel').default(props).type,props);
  let tree=h.render(),deck=find(tree,n=>n.type?.name==='StoryChoiceDeck')[0];
  const renderedChoice=deck.props.choices.find(c=>c.id===choice.id);
  assert.ok(renderedChoice);
  deck.props.onCommit(renderedChoice);
  for(let tick=0;tick<5;tick++)await Promise.resolve();
  tree=h.render();
  assert.deepEqual(JSON.parse(JSON.stringify(find(tree,n=>n.type?.name==='PersonResponseStage')[0].props.receipt?.response??null)),response);

  const motives=fixture(2);
  motives.p.place='COMMUNITY';
  motives.g.cast.schedule[2]=[{id:'bram',region:'alder',spot:'COMMUNITY',kind:'local'}];
  motives.p.cast.bonds.bram={phase:'met',approach:'listen',lastWeek:1,conflict:false,repaired:false,memories:[]};
  const scene=motiveScene(motives.g,motives.p,'bram'),motiveChoice=scene.choices[0];
  assert.equal(motiveChoice.available,true,motiveChoice.reason);
  const motiveResponse={...response,speakerId:'bram',speech:'A checked line. Leave the other blank.'};
  const confirmed=structuredClone(motives.g);
  confirmed.players[0].motives.receipts.push({id:motiveChoice.id,actorId:'bram',week:2,title:'Confirmed',body:'Recorded.',outcome:'One checked map line.',response:motiveResponse});
  const m=harness(mod=>mod('character-motives').CharacterMotives,{...motives,actorId:'bram',spot:'COMMUNITY',disabled:false,onAction:async()=>confirmed});
  tree=m.render();find(tree,n=>n.type?.name==='StoryChoiceDeck')[0].props.onCommit(motiveChoice);
  for(let tick=0;tick<5;tick++)await Promise.resolve();
  tree=m.render();
  assert.deepEqual(JSON.parse(JSON.stringify(find(tree,n=>n.type?.name==='PersonResponseStage')[0].props.receipt?.response??null)),motiveResponse);
});

test('the return control closes to the supplied venue without sending a move', () => {
  const {g,p}=fixture();let closed=0;
  const element=PersonReturn({g,p,spot:'THE PARK',onClose:()=>closed++});
  assert.equal(element.type,'button');assert.equal(element.props.type,'button');
  element.props.onClick();assert.equal(closed,1);
  assert.ok(render(PersonReturn,{g,p,spot:'THE PARK',onClose:noAction}).includes('Back to '+escape(worldPlaceName(p,'THE PARK',g))));
});

test('shared host work remains visible beside resident conversations and confirms the exact reply',async()=>{
 const {g,p}=fixture();p.place='CORNER CAFÉ';
 const html=render(Panel,{g,p,actorId:'alder_tess',spot:p.place,disabled:false,onAction:noAction,onClose:noAction});
 assert.match(html,/Order leek pie in advance/);assert.match(html,/Tess/);
 const {move}=require(root+'/lib/game.ts');let calls=0;
 const h=harness(load=>{const Panel=load('encounter-panel').default;return props=>{const element=Panel(props);return element.type(element.props);};},{g,p,actorId:'alder_tess',spot:p.place,disabled:false,onAction:async id=>{calls++;const next=structuredClone(g);move(next,id);return next;},onClose:noAction});
 h.render();const deck=find(h.result,n=>Array.isArray(n.props?.choices)&&n.props?.onCommit)[0];assert.ok(deck);
 const order=deck.props.choices.find(c=>c.actionId.includes(':order'));assert.ok(order&&order.available);deck.props.onCommit(order);
 for(let i=0;i<8;i++){await Promise.resolve();h.render();}
 const stage=find(h.result,n=>n.props?.actorId==='alder_tess'&&n.props?.receipt)[0];assert.ok(stage);assert.equal(calls,1);assert.equal(stage.props.receipt.actionId,order.actionId);assert.equal(stage.props.receipt.response.speakerId,'alder_tess');assert.equal(stage.props.receipt.familiarity.count,1);assert.doesNotMatch(stage.props.receipt.response.speech,/undefined/);
 h.unmount();
});

test('a captured work lead is an immediate private continuation and never adds another animation on polls',()=>{
 const {g,p}=fixture();const actionId='cast:1:jo:help',speech='Ask about the supervised opening at Foundry. The application remains your choice.';
 g.careerVersion=1;p.career={version:1,revision:0,experience:{},training:{},leads:{},offers:{},contracts:[],receipts:[],colleagues:{},milestones:[],notices:[{id:actionId+':lead',actionId,actorId:'jo',round:g.round,kind:'lead',leadId:'jo-practical',region:'alder',place:'MAKERSPACE',employer:'Foundry',regionName:'Alder Quay',speech}]};
 const receipt=capturePersonReceipt({id:actionId,actionId,week:g.round,title:'One handover',body:'Confirmed.',response:{speakerId:'jo',speech:'One checked edge.',activity:'Puts down the ruler.',emotion:'warm',gesture:'offer'}},p,'jo');let animations=0;
 const target={animate(){animations++;return{cancel(){}};}};const props={g,p,actorId:'jo',name:'Jo',spot:'COMMUNITY',receipt};
 const h=harness(m=>m('person-response').PersonResponseStage,props,{window:{matchMedia:()=>({matches:false})},attach:tree=>{tree.props.ref.current={querySelector:()=>target};}});
 let tree=h.render(),html=renderToStaticMarkup(tree);assert.match(html,/data-career-notice="lead"/);assert.ok(html.includes(speech));assert.match(html,/Work lead.*Foundry, Alder Quay/);assert.equal(animations,1);
 h.render({receipt:structuredClone(receipt)});h.render({p:structuredClone(p)});assert.equal(animations,1);
 for(const state of [{pending:true},{pending:false,error:'Not confirmed'},{error:undefined,p:{...p,castRedacted:true}},{p,g:{...g,round:g.round+1}},{g,p,receipt:{...receipt,response:'refusal'}}]){tree=h.render(state);html=renderToStaticMarkup(tree);assert.doesNotMatch(html,/person-career-notice|Ask about the supervised opening/);}
 h.unmount();
});
