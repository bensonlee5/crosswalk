import test from 'node:test';
import assert from 'node:assert/strict';
import {aspirations, selectAspiration, recordLifeProgress, getLifeProgress} from '../lib/life-progress.ts';
import type {Game, Player} from '../lib/game.ts';

import {currentGame} from './current-fixture.mjs';
import {careerTracks} from '../lib/career-content.ts';
import {monthlyBills} from '../lib/economy.ts';
type FixturePlayer = Player & {life:NonNullable<Player['life']>;career:NonNullable<Player['career']>};
type FixtureGame = Game;
function setup():{g:FixtureGame;p:FixturePlayer}{const g=currentGame({names:['One']}) as Game,p=g.players[0] as FixturePlayer;p.cash=6000;return{g,p};}
function careerRank(p:FixturePlayer,rank:number){const role=careerTracks.find(t=>t.id==='technical')!.roles[rank];p.career.experience.technical={paidHours:400,commitments:3,months:[1,2,3]};p.career.contracts.push({id:`contract-${rank}`,target:`t.technical.${role.id}`,field:'technical',kind:'main',active:true} as never);p.career.receipts.push({verb:'work',target:`contract-${rank}.regular`} as never);}
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
 assert.throws(()=>selectAspiration(g,p,'creative'),/next month/);assert.deepEqual(g,before);
 g.round=2;selectAspiration(g,p,'creative');assert.equal(p.aspiration,'creative');
 assert.equal(p.cash,6000);assert.equal(p.hours,6);assert.equal(p.legacy,0);assert.deepEqual(p.milestones??[],[]);
 assert.equal(getLifeProgress(p,g).canSelectAspiration,false);
});
test('invalid choices, nonturn actors and finished games cannot mutate selection',()=>{
 const {p,g}=setup();const before=structuredClone(g);
 assert.throws(()=>selectAspiration(g,p,'winner'),/Choose career/);assert.deepEqual(g,before);
 assert.throws(()=>selectAspiration(g,{...p},'career'),/another player/);assert.deepEqual(g,before);
 g.status='finished';assert.throws(()=>selectAspiration(g,p,'career'),/not running/);
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
 g.project.contributions[p.id]=1;recordLifeProgress(g,p);
 assert.equal(earned(p,'community_steward'),true);assert.equal(earned(p,'a_garden_left_behind'),true);
 assert.equal(p.legacy,0);assert.equal(p.cash,6000);
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

test('specific next steps progress from skills to real action, not a percentage score',()=>{
 const {p,g}=setup();selectAspiration(g,p,'creative');p.craft=3;recordLifeProgress(g,p);
 assert.match(getLifeProgress(p,g).nextStep,/Deliver a creative commission/);
 p.life.activityCounts.creative_commission=1;recordLifeProgress(g,p);assert.match(getLifeProgress(p,g).nextStep,/3 more craft levels/);
 p.craft=6;recordLifeProgress(g,p);assert.match(getLifeProgress(p,g).nextStep,/second paid commission/);
 p.life.activityCounts.creative_commission=2;recordLifeProgress(g,p);assert.match(getLifeProgress(p,g).nextStep,/Mina or Jo/);
});

test('Rooted requires living through two bill cycles, not only spending starting cash',()=>{
 const {p,g}=setup();selectAspiration(g,p,'home');p.life.activityCounts.home_reset=2;p.life.activityCounts.home_host=1;p.life.relationships.mina.support=true;
 recordLifeProgress(g,p);assert.equal(earned(p,'home_rooted'),false);assert.match(getLifeProgress(p,g).nextStep,/month 3/);
 g.round=2;recordLifeProgress(g,p);assert.equal(earned(p,'home_rooted'),false);
 g.round=3;recordLifeProgress(g,p);assert.equal(earned(p,'home_rooted'),true);
});

function addWorld(p:FixturePlayer){return p.world!;}
function homeReady(p: FixturePlayer,g:FixtureGame) {
 g.round=3;p.life.activityCounts.home_reset=2;p.life.activityCounts.home_host=1;
}
test('a familiar regional friend satisfies home and community belonging without original-neighbor trust',()=>{
 const {p,g}=setup();homeReady(p,g);addWorld(p).localBonds={saffron_leila:2};
 p.social=6;p.life.activityCounts.community_lead=1;g.project={contributions:{[p.id]:2},lastWeek:{[p.id]:3},completed:true};
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
 p.craft=6;p.life.activityCounts.creative_commission=2;p.skill=6;careerRank(p,2);recordLifeProgress(g,p);
 assert.equal(earned(p,'creative_artist'),true);assert.equal(earned(p,'creative_established'),false);
 assert.equal(earned(p,'career_leader'),true);assert.equal(earned(p,'career_mentor'),false);
 p.life.relationships.jo.trust=1;p.life.activityCounts.campus_tutor=1;recordLifeProgress(g,p);
 assert.equal(earned(p,'creative_established'),true);assert.equal(earned(p,'career_mentor'),true);
});

test('a regional-rooted chapter survives losing current financial footing',()=>{
 const {p,g}=setup();homeReady(p,g);addWorld(p).localBonds={mesa_inez:3};selectAspiration(g,p,'home');recordLifeProgress(g,p);
 p.cash=-200;recordLifeProgress(g,p);const view=getLifeProgress(p,g);
 assert.equal(earned(p,'home_rooted'),true);assert.equal(view.currentTier,'Good host');assert.equal(view.foundations[2].secure,true);
 assert.equal(view.foundations[0].secure,false);assert.match(view.epilogue.paragraphs[3],/overdraft/);
});

test('career progression requires actual field work and tutoring, never generic skill',()=>{
 const {p,g}=setup();selectAspiration(g,p,'career');p.skill=6;assert.deepEqual(recordLifeProgress(g,p),[]);
 careerRank(p,0);assert.deepEqual(recordLifeProgress(g,p).map(m=>m.id),['career_apprentice']);careerRank(p,1);assert.deepEqual(recordLifeProgress(g,p).map(m=>m.id),['career_practitioner']);careerRank(p,2);assert.deepEqual(recordLifeProgress(g,p).map(m=>m.id),['career_leader']);
 p.life.activityCounts!.campus_tutor=1;assert.deepEqual(recordLifeProgress(g,p).map(m=>m.id),['career_mentor']);const history=[...p.milestones!];p.cash=-300;assert.deepEqual(recordLifeProgress(g,p),[]);assert.deepEqual(p.milestones,history);assert.match(getLifeProgress(p,g).epilogue.paragraphs.join(' '),/overdraft/);
});
test('projections are pure on frozen current states, including privacy-redacted cast state',()=>{const {p,g}=setup();p.world!.localBonds={saffron_leila:2};p.castRedacted=true;delete p.cast;const before=structuredClone(g);immutable(g);assert.deepEqual(getLifeProgress(p,g),getLifeProgress(p,g));assert.deepEqual(g,before);});
test('awards are idempotent and ignore outsiders or lobby state',()=>{const {p,g}=setup();careerRank(p,0);assert.deepEqual(recordLifeProgress(g,p).map(m=>m.id),['career_apprentice']);assert.deepEqual(recordLifeProgress(g,p),[]);const other={...p,milestones:[]};assert.deepEqual(recordLifeProgress(g,other),[]);g.status='lobby';p.craft=8;assert.deepEqual(recordLifeProgress(g,p),[]);});
test('household reserve uses current monthly bills exactly',()=>{const {p,g}=setup();g.round=3;p.life.activityCounts={home_reset:2,home_host:1};p.life.relationships.mina.trust=2;p.cash=monthlyBills(p).total*2-1;recordLifeProgress(g,p);assert.ok(!earned(p,'home_rooted'));p.cash++;recordLifeProgress(g,p);assert.ok(earned(p,'home_rooted'));});
