import test from 'node:test';
import assert from 'node:assert/strict';
import {aspirations, selectAspiration, recordLifeProgress, getLifeProgress} from '../lib/life-progress.ts';
import type {Game, Player} from '../lib/game.ts';

type FixturePlayer = Player & {aspiration?:string;aspirationWeek?:number;milestones?:string[];life:{version:1;relationships:Record<string,{trust:number;support:boolean;rivalry:boolean;reciprocity:boolean}>;flags:string[];activityCounts:Record<string,number>;receipts:{eventId:string;context?:Record<string,unknown>}[]}};
type FixtureGame = Game & {lifeVersion?:number};
function setup():{g:FixtureGame;p:FixturePlayer}{
 const relationship=()=>({trust:0,support:false,rivalry:false,reciprocity:false,history:[]});
 const p:FixturePlayer={id:'one',name:'One',cash:1100,skill:0,job:0,joy:40,energy:70,hours:6,social:0,housing:0,place:'APARTMENTS',rulesVersion:2,craft:0,legacy:0,stories:{},life:{version:1,relationships:{mina:relationship(),eli:relationship(),jo:relationship()},flags:[],storyChapters:{},activityCounts:{},receipts:[]}};
 const g:FixtureGame={code:'TEST',mode:'hotseat',host:'host',members:{host:['one']},players:[p],status:'playing',round:1,turn:0,maxRounds:8,log:[],seen:[],event:0,rulesVersion:2,lifeVersion:1};
 return{p,g};
}
function immutable<T>(value:T):T {if(value&&typeof value==='object'){Object.freeze(value);for(const v of Object.values(value))immutable(v);}return value;}
function earned(p:FixturePlayer,id:string){return p.milestones?.includes(id)??false;}

test('exports four distinct aspirations; choosing changes no resources or achievements',()=>{
 const {p,g}=setup();const before=structuredClone(p);
 assert.deepEqual(aspirations.map(a=>a.id),['career','community','creative','home']);
 selectAspiration(g,p,'career');
 assert.equal(p.aspiration,'career');assert.equal(p.aspirationWeek,1);
 assert.deepEqual({...p,aspiration:undefined,aspirationWeek:undefined},{...before,aspiration:undefined,aspirationWeek:undefined});
 assert.equal(recordLifeProgress(g,p).length,0);
 assert.equal(getLifeProgress(p,g).currentTier,'Finding your footing');
});
test('same choice is idempotent; switching is once per week and cannot farm rewards',()=>{
 const {p,g}=setup();selectAspiration(g,p,'career');const before=structuredClone(g);
 selectAspiration(g,p,'career');assert.deepEqual(g,before);
 assert.throws(()=>selectAspiration(g,p,'creative'),/next week/);assert.deepEqual(g,before);
 g.round=2;selectAspiration(g,p,'creative');assert.equal(p.aspiration,'creative');
 assert.equal(p.cash,1100);assert.equal(p.hours,6);assert.equal(p.legacy,0);assert.equal(p.milestones,undefined);
 assert.equal(getLifeProgress(p,g).canSelectAspiration,false);
});
test('invalid choices, nonturn actors and finished games cannot mutate selection',()=>{
 const {p,g}=setup();const before=structuredClone(g);
 assert.throws(()=>selectAspiration(g,p,'winner'),/Choose career/);assert.deepEqual(g,before);
 assert.throws(()=>selectAspiration(g,{...p},'career'),/another player/);assert.deepEqual(g,before);
 g.status='finished';assert.throws(()=>selectAspiration(g,p,'career'),/not running/);
});
test('legacy and uninitialized saves remain entirely untouched',()=>{
 const {p,g}=setup();delete g.lifeVersion;p.skill=6;p.job=3;const before=structuredClone(g);
 assert.equal(recordLifeProgress(g,p).length,0);assert.deepEqual(g,before);
 assert.equal(getLifeProgress(p,g).enabled,false);assert.deepEqual(g,before);
 assert.throws(()=>selectAspiration(g,p,'career'),/new life/);assert.deepEqual(g,before);
 g.lifeVersion=1;delete (p as Partial<FixturePlayer>).life;const old=structuredClone(g);
 assert.equal(recordLifeProgress(g,p).length,0);assert.equal(getLifeProgress(p,g).enabled,false);assert.deepEqual(g,old);
});
test('read-only projections can render frozen states repeatedly without awards',()=>{
 const {p,g}=setup();p.skill=6;p.job=3;selectAspiration(g,p,'career');immutable(g);
 const one=getLifeProgress(p,g),two=getLifeProgress(p,g);
 assert.deepEqual(one,two);assert.equal(one.currentTier,'Leader');assert.equal(one.milestones.length,0);
});
test('career hierarchy requires real tutoring; a later lost role does not erase earned history',()=>{
 const {p,g}=setup();selectAspiration(g,p,'career');p.skill=6;p.job=3;
 const first=recordLifeProgress(g,p);assert.equal(first.length,3);assert.equal(earned(p,'career_mentor'),false);
 p.life.activityCounts.campus_tutor=1;assert.deepEqual(recordLifeProgress(g,p).map(m=>m.id),['career_mentor']);
 const history=[...p.milestones!];p.job=1;p.cash=-300;recordLifeProgress(g,p);
 assert.deepEqual(p.milestones,history);const view=getLifeProgress(p,g);
 assert.equal(view.currentTier,'Practitioner');assert.equal(view.ladders[0].tiers.at(-1)?.earned,true);
 assert.equal(view.ladders[0].tiers.at(-1)?.current,false);assert.equal(view.foundations[0].secure,false);
 assert.match(view.epilogue.paragraphs.join(' '),/overdraft/);assert.match(view.epilogue.paragraphs[0],/earned chapter remains/);
});
test('money and social totals alone cannot grant community or creative legacy',()=>{
 const {p,g}=setup();p.cash=100000;p.social=99;p.craft=8;recordLifeProgress(g,p);
 assert.equal(earned(p,'community_neighbor'),false);assert.equal(earned(p,'community_steward'),false);
 assert.equal(earned(p,'creative_artist'),false);assert.equal(earned(p,'creative_established'),false);
 assert.equal(earned(p,'home_rooted'),false);
});
test('community stewardship needs real leadership, shared project contribution and a close bond',()=>{
 const {p,g}=setup();p.social=6;p.life.activityCounts.community_lead=1;p.life.relationships.eli.trust=2;
 g.project={contributions:{other:2},lastWeek:{},completed:true};recordLifeProgress(g,p);
 assert.equal(earned(p,'community_steward'),false);assert.equal(earned(p,'a_garden_left_behind'),false);
 g.project.contributions.one=1;recordLifeProgress(g,p);
 assert.equal(earned(p,'community_steward'),true);assert.equal(earned(p,'a_garden_left_behind'),true);
 assert.equal(p.legacy,0);assert.equal(p.cash,1100);
});
test('creative establishment needs completed commissions and a non-rival creative ally',()=>{
 const {p,g}=setup();p.craft=6;p.life.activityCounts.creative_commission=2;p.life.relationships.jo.trust=2;p.life.relationships.jo.rivalry=true;
 recordLifeProgress(g,p);assert.equal(earned(p,'creative_artist'),true);assert.equal(earned(p,'creative_established'),false);
 p.life.relationships.jo.rivalry=false;recordLifeProgress(g,p);assert.equal(earned(p,'creative_established'),true);
});
test('a shared home can become rooted; debt changes footing without revoking the chapter',()=>{
 const {p,g}=setup();selectAspiration(g,p,'home');g.round=3;p.life.activityCounts.home_reset=2;p.life.activityCounts.home_host=1;p.life.relationships.mina.trust=2;
 recordLifeProgress(g,p);assert.equal(p.housing,0);assert.equal(earned(p,'home_rooted'),true);
 p.cash=-1;recordLifeProgress(g,p);const view=getLifeProgress(p,g);
 assert.equal(earned(p,'home_rooted'),true);assert.equal(view.currentTier,'Good host');
 assert.equal(view.foundations[0].secure,false);assert.equal(view.foundations[1].secure,false);
 assert.doesNotMatch(view.epilogue.paragraphs[3],/steadier starting point|buffer give/);
});
test('cash cannot conceal unfinished repairs, and ending never falsely denies an existing buffer',()=>{
 const {p,g}=setup();p.cash=5000;p.life.flags.push('repairs_unfinished');const view=getLifeProgress(p,g);
 assert.equal(view.foundations[0].secure,true);assert.equal(view.foundations[1].secure,false);
 assert.match(view.epilogue.paragraphs[3],/buffer is in place/);assert.doesNotMatch(view.epilogue.paragraphs[3],/buffer is not in place/);
});
test('a stronger alternative never silently changes the chosen aspiration',()=>{
 const {p,g}=setup();selectAspiration(g,p,'career');p.craft=6;p.life.activityCounts.creative_commission=2;p.life.relationships.jo.trust=2;recordLifeProgress(g,p);
 const view=getLifeProgress(p,g);assert.equal(view.aspiration?.id,'career');assert.equal(p.aspiration,'career');
 assert.match(view.epilogue.paragraphs[0],/has not taken shape/);assert.match(view.epilogue.paragraphs[0],/Established creator/);
});
test('epilogue recognizes an actual failed residency and outstanding relationship obligations',()=>{
 const {p,g}=setup();selectAspiration(g,p,'creative');p.life.receipts.push({eventId:'crossroads'});p.life.flags.push('supported_next_chapter');
 p.life.relationships.mina.support=true;p.life.relationships.mina.reciprocity=true;p.life.relationships.eli.rivalry=true;recordLifeProgress(g,p);
 const view=getLifeProgress(p,g),text=view.epilogue.paragraphs.join(' ');
 assert.match(text,/residency went to someone else/);assert.match(text,/favor to return to Mina/);assert.match(text,/Eli has a strained bond/);
 assert.equal(earned(p,'different_beginning'),true);assert.equal(earned(p,'creative_artist'),false);
});
test('specific next steps progress from skills to real action, not a percentage score',()=>{
 const {p,g}=setup();selectAspiration(g,p,'creative');p.craft=3;recordLifeProgress(g,p);
 assert.match(getLifeProgress(p,g).nextStep,/Deliver a creative commission/);
 p.life.activityCounts.creative_commission=1;recordLifeProgress(g,p);assert.match(getLifeProgress(p,g).nextStep,/3 more craft levels/);
 p.craft=6;recordLifeProgress(g,p);assert.match(getLifeProgress(p,g).nextStep,/second paid commission/);
 p.life.activityCounts.creative_commission=2;recordLifeProgress(g,p);assert.match(getLifeProgress(p,g).nextStep,/Mina or Jo/);
});
test('awards are idempotent, return only new awards, preserve unknown saved milestones, and ignore nonmembers',()=>{
 const {p,g}=setup();p.milestones=['future_saved_chapter'];p.skill=2;p.job=1;
 assert.equal(recordLifeProgress(g,p).length,2);assert.equal(recordLifeProgress(g,p).length,0);
 assert.equal(p.milestones.filter(id=>id==='career_apprentice').length,1);assert.equal(p.milestones[0],'future_saved_chapter');
 const outsider={...p,milestones:[]};assert.deepEqual(recordLifeProgress(g,outsider),[]);assert.deepEqual(outsider.milestones,[]);
 g.status='lobby';p.craft=8;assert.deepEqual(recordLifeProgress(g,p),[]);
});

test('Rooted requires living through two bill cycles, not only spending starting cash',()=>{
 const {p,g}=setup();selectAspiration(g,p,'home');p.life.activityCounts.home_reset=2;p.life.activityCounts.home_host=1;p.life.relationships.mina.support=true;
 recordLifeProgress(g,p);assert.equal(earned(p,'home_rooted'),false);assert.match(getLifeProgress(p,g).nextStep,/week 3/);
 g.round=2;recordLifeProgress(g,p);assert.equal(earned(p,'home_rooted'),false);
 g.round=3;recordLifeProgress(g,p);assert.equal(earned(p,'home_rooted'),true);
});

function addWorld(p: FixturePlayer) {
 const places=()=>({alder:[],saffron:[],glasssteppe:[],pelagia:[],embermesa:[]});
 p.world={version:1,region:'alder',discoveredRegions:['alder'],discoveredPlacesByRegion:places(),closedPlacesByRegion:places(),languageFamiliarity:{alder:3,saffron:0,glasssteppe:0,pelagia:0,embermesa:2},companionBond:0,companionStatus:'unmet',journal:[],revision:0,lastWeek:1,actionCounts:{},venueDecisions:{},acceptedChoices:[],localBonds:{},localTalkWeeks:{}};
 return p.world;
}
function homeReady(p: FixturePlayer,g:FixtureGame) {
 g.round=3;p.life.activityCounts.home_reset=2;p.life.activityCounts.home_host=1;
}
test('a familiar regional friend satisfies home and community belonging without original-neighbor trust',()=>{
 const {p,g}=setup();homeReady(p,g);addWorld(p).localBonds={saffron_leila:2};
 p.social=6;p.life.activityCounts.community_lead=1;g.project={contributions:{one:2},lastWeek:{one:3},completed:true};
 recordLifeProgress(g,p);const view=getLifeProgress(p,g);
 for(const id of ['home_host','home_rooted','community_connector','community_steward'])assert.equal(earned(p,id),true,id);
 assert.equal(view.foundations[2].secure,true);assert.match(view.foundations[2].detail,/1 close local friendship\./);
 assert.doesNotMatch(view.epilogue.paragraphs[2],/lasting bond is still growing/);
});
test('an explicit Neri partnership counts as a close bond and is named in the ending',()=>{
 const {p,g}=setup();homeReady(p,g);addWorld(p).companionStatus='partner';recordLifeProgress(g,p);
 const view=getLifeProgress(p,g);assert.equal(earned(p,'home_rooted'),true);assert.equal(view.foundations[2].secure,true);
 assert.match(view.foundations[2].detail,/Neri is your partner/);assert.match(view.epilogue.paragraphs[2],/Neri is your partner/);
 assert.doesNotMatch(view.foundations[2].detail,/local friendship|lasting bond is still growing/);
});
test('local acquaintances and an unchosen partnership never manufacture a close bond',()=>{
 for(const status of ['unmet','invited','companion','declined'] as const){
  const {p,g}=setup();homeReady(p,g);const w=addWorld(p);w.companionStatus=status;w.companionBond=5;w.localBonds={alder_tess:1,saffron_ada:0};
  recordLifeProgress(g,p);const view=getLifeProgress(p,g);
  assert.equal(earned(p,'home_rooted'),false,status);assert.equal(earned(p,'home_host'),false,status);
  assert.equal(view.foundations[2].secure,false,status);assert.doesNotMatch(view.foundations[2].detail,/Neri is your partner/);
 }
});
test('all actual local friendships are counted alongside named old bonds and a partner',()=>{
 const {p,g}=setup();const w=addWorld(p);w.companionStatus='partner';w.localBonds={alder_tess:2,glass_sora:3,pelagia_mara:1};p.life.relationships.mina.trust=2;
 const detail=getLifeProgress(p,g).foundations[2].detail;
 assert.match(detail,/Mina is a close connection/);assert.match(detail,/Neri is your partner/);assert.match(detail,/2 close local friendships/);
});
test('regional bonds and a partner do not replace creative allies or actual career mentoring',()=>{
 const {p,g}=setup();const w=addWorld(p);w.companionStatus='partner';w.localBonds={glass_sora:3,pelagia_mara:3};
 p.craft=6;p.life.activityCounts.creative_commission=2;p.skill=6;p.job=3;recordLifeProgress(g,p);
 assert.equal(earned(p,'creative_artist'),true);assert.equal(earned(p,'creative_established'),false);
 assert.equal(earned(p,'career_leader'),true);assert.equal(earned(p,'career_mentor'),false);
 p.life.relationships.jo.trust=1;p.life.activityCounts.campus_tutor=1;recordLifeProgress(g,p);
 assert.equal(earned(p,'creative_established'),true);assert.equal(earned(p,'career_mentor'),true);
});
test('regional reads are pure and old unmarked games ignore world bonds without migration',()=>{
 const {p,g}=setup();const w=addWorld(p);w.companionStatus='partner';w.localBonds={saffron_leila:2};homeReady(p,g);
 const before=structuredClone(g);immutable(g);assert.deepEqual(getLifeProgress(p,g),getLifeProgress(p,g));assert.deepEqual(g,before);
 const old=structuredClone(before);delete old.lifeVersion;const oldBefore=structuredClone(old);
 assert.equal(getLifeProgress(old.players[0],old).enabled,false);assert.deepEqual(recordLifeProgress(old,old.players[0]),[]);assert.deepEqual(old,oldBefore);
});
test('a regional-rooted chapter survives losing current financial footing',()=>{
 const {p,g}=setup();homeReady(p,g);addWorld(p).localBonds={mesa_inez:3};selectAspiration(g,p,'home');recordLifeProgress(g,p);
 p.cash=-200;recordLifeProgress(g,p);const view=getLifeProgress(p,g);
 assert.equal(earned(p,'home_rooted'),true);assert.equal(view.currentTier,'Good host');assert.equal(view.foundations[2].secure,true);
 assert.equal(view.foundations[0].secure,false);assert.match(view.epilogue.paragraphs[3],/overdraft/);
});
