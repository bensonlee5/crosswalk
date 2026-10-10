import {castCharacters} from './cast-characters.ts';
import type {Game, Player} from './game.ts';
import {monthlyBills,hasModernEconomy,economyLifeCash} from './economy.ts';

/** Earned chapters are a history, not a second score. Reads never award anything.
 * game.ts may import this module: all imports here are type-only.
 */
export type AspirationId = 'career' | 'community' | 'creative' | 'home';
export type LifeProgressPlayerFields = {
 aspiration?: string;
 aspirationWeek?: number;
 milestones?: string[];
};
export type Aspiration = {id: AspirationId; title: string; description: string};
export const aspirations: readonly Aspiration[] = [
 {id:'career',title:'Work that matters',description:'Learn a trade, earn responsibility and pass what you know to someone else.'},
 {id:'community',title:'A neighborhood that lasts',description:'Show up, bring people together and help build something the block can keep.'},
 {id:'creative',title:'A life of making',description:'Develop your craft, finish real work and find people who help it reach the world.'},
 {id:'home',title:'A place to belong',description:'Care for a home, welcome people in and build enough breathing room to stay rooted.'}
];
export type LifeMilestone = {id: string; title: string; description: string};
export type LifeTierView = LifeMilestone & {earned: boolean; current: boolean};
export type LifeLadderView = {id: AspirationId; title: string; tiers: LifeTierView[]};
export type LifeFoundation = {title: string; detail: string; secure: boolean};
export type LifeEpilogue = {title: string; paragraphs: string[]};
export type LifeProgress = {
 enabled: boolean;
 aspiration: Aspiration | null;
 title: string;
 currentTier: string;
 nextStep: string;
 canSelectAspiration: boolean;
 selectionReason: string;
 ladders: LifeLadderView[];
 foundations: LifeFoundation[];
 milestones: LifeMilestone[];
 epilogue: LifeEpilogue;
};
type Relationship = {trust: number; support: boolean; rivalry: boolean; reciprocity: boolean};
type LifeState = {
 version: number;
 relationships: Partial<Record<string, Relationship>>;
 flags: string[];
 activityCounts?: Record<string, number>;
 receipts?: {eventId: string; resolved?: unknown; context?: Record<string, unknown>}[];
};
type ProgressPlayer = Player & LifeProgressPlayerFields & {life?: LifeState;story?:{version:1;flags:string[];receipts:{sceneId:string;automatic?:boolean;choiceId:string}[]}};
type ProgressGame = Game & {lifeVersion?: number};
type Tier = LifeMilestone & {met: (p: ProgressPlayer, g: Game) => boolean; next: (p: ProgressPlayer, g: Game) => string};
const namedNeighbors = [{id:'mina',name:'Mina'},{id:'eli',name:'Eli'},{id:'jo',name:'Jo'}] as const;
const finite = (n: number | undefined) => Number.isFinite(n) ? n! : 0;
const amount = (n: number) => Math.ceil(Math.abs(n)).toLocaleString('en-US');
const active = (g: Game, p: Player) => (g as ProgressGame).lifeVersion === 1 && (p as ProgressPlayer).life?.version === 1;
const count = (p: ProgressPlayer, ...ids: string[]) => ids.reduce((n, id) => n + Math.max(0, finite(p.life?.activityCounts?.[id])), 0);
const flag = (p: ProgressPlayer, id: string) => p.life?.flags.includes(id) ?? false;
const stories = (p: Player) => Object.values(p.stories ?? {}).filter(n => n >= 3).length;
const bills = (p: Player) => monthlyBills(p).total;
const trusted = (p: ProgressPlayer) => namedNeighbors.filter(n => {
 const r = p.life?.relationships[n.id];
 return !!r && !r.rivalry && (r.support || r.trust >= 1);
});
const close = (p: ProgressPlayer) => namedNeighbors.filter(n => {
 const r = p.life?.relationships[n.id];
 return !!r && !r.rivalry && (r.support || r.trust >= 2);
});
// Belonging can grow across the map. Creative-ally checks deliberately keep using
// the original named-neighbor `trusted` helper rather than this broader measure.
const localFriendCount = (p: ProgressPlayer) => p.world?.version === 1
 ? Object.values(p.world.localBonds ?? {}).filter(value => finite(value) >= 2).length : 0;
const hasPartner = (p: ProgressPlayer) => p.world?.version === 1 && p.world.companionStatus === 'partner';
const castFriends = (p: ProgressPlayer) => p.cast?.version===1 ? castCharacters.filter(c=>p.cast?.bonds[c.id]?.phase==='close'&&!p.cast.bonds[c.id].conflict) : [];
const closeBondCount = (p: ProgressPlayer) => close(p).length + localFriendCount(p) + castFriends(p).length + (hasPartner(p) ? 1 : 0);
const hasBelongingBond = (p: ProgressPlayer) => trusted(p).length > 0 || localFriendCount(p) > 0 || castFriends(p).length > 0 || hasPartner(p);
const contributed = (p: Player, g: Game) => finite(g.project?.contributions[p.id]) > 0;
const gardenBuilt = (p: Player, g: Game) => !!g.project?.completed && contributed(p, g);
const communityHelp = (p: ProgressPlayer, g: Game) => contributed(p, g) || count(p, 'volunteer', 'community_setup', 'garden_tend', 'transit_cleanup', 'maker_repair') > 0;
const hosting = (p: ProgressPlayer) => count(p, 'community_lead', 'community_organize', 'home_host', 'arcade_host') > 0;
const leadership = (p: ProgressPlayer) => count(p, 'community_lead', 'community_organize') > 0;
const commissions = (p: ProgressPlayer) => count(p, 'creative_commission', 'maker_commission') + (flag(p, 'solo_commission') ? 1 : 0);
const madeHomeByMoving = (p: ProgressPlayer) => p.story?.version===1&&p.world?.story?.version===1&&Number.isFinite(p.world.story.relocatedWeek)&&Number(p.world.story.relocatedWeek)>0;
const tendingHome = (p: ProgressPlayer) => p.housing > 0 || count(p, 'home_reset', 'home_meal') >= 2 || madeHomeByMoving(p);
const rooted = (p: ProgressPlayer, g: Game) => g.round >= 3 && tendingHome(p) && count(p, 'home_host') >= 1 && p.cash >= bills(p) * 2 && p.energy >= 30 && p.joy >= 40 && closeBondCount(p) > 0 && !flag(p, 'repairs_unfinished');
const towardBond = (p: ProgressPlayer) => p.cast?.version===1 ? 'Follow a friendship over several months, keep or honestly renegotiate your promises, and make room for each other’s lives.' : p.world?.version === 1 ? 'Spend time with a local resident in different weeks to build a friendship, or keep showing up for a neighbor’s story.' : 'Meet Mina at the café, Eli at the garden or Jo at the makerspace, then keep showing up for their story.';

const tiers: Record<AspirationId, Tier[]> = {
 career: [
  {id:'career_apprentice',title:'Apprentice',description:'Earned your first practical skill.',met:p=>p.skill>=1,next:()=> 'Take a short course at Campus, or use the free learning resources at the Library.'},
  {id:'career_practitioner',title:'Practitioner',description:'Used two skills to move into a skilled role.',met:p=>p.skill>=2&&p.job>=1,next:p=>p.skill<2?'Build a second career skill, then apply for IT support at the Career Hub.':'Apply for IT support at the Career Hub using the skills you have earned.'},
  {id:'career_leader',title:'Leader',description:'Built six skills and reached the project-lead role.',met:p=>p.skill>=6&&p.job>=3,next:p=>p.skill<6?`Earn ${6-p.skill} more career skill${6-p.skill===1?'':'s'}, then apply for the remaining roles at the Career Hub.`:'Make your remaining career moves at the Career Hub to become a project lead.'},
  {id:'career_mentor',title:'Mentor',description:'Reached project lead and tutored another learner with your experience.',met:p=>p.skill>=6&&p.job>=3&&count(p,'campus_tutor')>=1,next:()=> 'Tutor another learner at Campus. Passing on your experience completes this chapter.'}
 ],
 community: [
  {id:'community_neighbor',title:'Neighbor',description:'Made two connections and gave practical help to the neighborhood.',met:(p,g)=>p.social>=2&&communityHelp(p,g),next:(p,g)=>!communityHelp(p,g)?'Lend a hand at Community, help at the repair café or contribute to the shared garden.':'Make a second connection by volunteering or joining a neighborhood activity.'},
  {id:'community_connector',title:'Connector',description:'Brought people together, made six connections and built a trusted bond.',met:p=>p.social>=6&&hosting(p)&&hasBelongingBond(p),next:p=>p.social<6?`Make ${6-p.social} more connections through clubs, volunteering or stories.`:!hosting(p)?'Lead a neighborhood event, host a potluck or organize a game meetup.':towardBond(p)},
  {id:'community_steward',title:'Steward',description:'Led a community event, helped finish the shared garden and built a lasting bond.',met:(p,g)=>p.social>=6&&leadership(p)&&gardenBuilt(p,g)&&closeBondCount(p)>0,next:(p,g)=>p.social<6?'Build six connections so you can bring a wider circle together.':!leadership(p)?'Lead a neighborhood event at Community, or coordinate a paid community day.':!gardenBuilt(p,g)?'Contribute to the shared garden in different weeks and help the group finish it.':towardBond(p)}
 ],
 creative: [
  {id:'creative_maker',title:'Maker',description:'Developed your first level of craft.',met:p=>(p.craft??0)>=1,next:()=> 'Practice your craft at the Makerspace to make a first deliberate start.'},
  {id:'creative_artist',title:'Artist',description:'Developed three craft levels and delivered a paid commission.',met:p=>(p.craft??0)>=3&&commissions(p)>=1,next:p=>(p.craft??0)<3?'Practice at the Makerspace until you have three craft levels.':'Deliver a creative commission at the Makerspace. Finished work makes this step real.'},
  {id:'creative_established',title:'Established creator',description:'Built six craft levels, completed two paid commissions and found a trusted creative ally.',met:p=>(p.craft??0)>=6&&commissions(p)>=2&&trusted(p).some(n=>n.id==='mina'||n.id==='jo'),next:p=>(p.craft??0)<6?`Build ${6-(p.craft??0)} more craft level${6-(p.craft??0)===1?'':'s'} through practice and creative opportunities.`:commissions(p)<2?'Finish a second paid commission at the Makerspace.':'Spend time with Mina or Jo and build trust through their story or an honest check-in.'}
 ],
 home: [
  {id:'home_maker',title:'Home-maker',description:'Cared for your space twice, or made a place of your own.',met:p=>tendingHome(p),next:()=> 'Reset your space or cook a proper meal at Apartments twice. A shared home counts too.'},
  {id:'home_host',title:'Good host',description:'Made a home, hosted a potluck and built a trusted bond.',met:p=>tendingHome(p)&&count(p,'home_host')>=1&&hasBelongingBond(p),next:p=>!tendingHome(p)?'Make time to care for your home at Apartments.':count(p,'home_host')<1?'Host a potluck at Apartments and make room for other people.':towardBond(p)},
  {id:'home_rooted',title:'Rooted',description:'Reached the third week with a cared-for home, a close bond and two weeks of bills in reserve.',met:rooted,next:(p,g)=>p.cash<bills(p)*2?`Build a $${amount(bills(p)*2)} rent-and-food buffer for your current home.`:p.energy<30?'Take time to rest until you have at least 30 energy.':p.joy<40?'Make room for something you enjoy until happiness reaches 40.':flag(p,'repairs_unfinished')?'Finish the postponed repairs: 1 time + $120 for paid help, or 2 time with no cash for DIY.':closeBondCount(p)===0?towardBond(p):!tendingHome(p)?'Care for your space at Apartments.':count(p,'home_host')<1?'Host a potluck at Apartments.':g.round<3?'Keep caring for your home through the first two weekly bills. Rooted becomes possible from week 3.':'Keep your home, buffer and relationships supported.'}
 ]
};
const extraMilestones: Tier[] = [
 {id:'own_front_door',title:'Your own front door',description:'Moved into a place of your own. The memory survives a later setback.',met:p=>p.housing>=1,next:()=>''},
 {id:'a_story_shared',title:'A story shared',description:'Finished all three chapters of a neighbor’s story.',met:p=>stories(p)>=1,next:()=>''},
 {id:'a_garden_left_behind',title:'Something the block can keep',description:'Helped complete the neighborhood garden.',met:gardenBuilt,next:()=>''},
 {id:'career_rebuilt',title:'Experience travels with you',description:'Rebuilt your career after a lost role.',met:p=>flag(p,'career_rebuilt')&&(p.life?.receipts?.some(r=>r.eventId==='work_reset'&&Number(r.context?.jobBefore)>0)??false),next:()=>''},
 {id:'shared_credit',title:'Everyone’s name on the work',description:'Stood with the makers for shared credit after a lost commission.',met:p=>flag(p,'shared_credit'),next:()=>''},
 {id:'reciprocal_next_chapter',title:'The favor came back around',description:'Returned a neighbor’s favor while beginning a different next chapter.',met:p=>flag(p,'reciprocal_next_chapter'),next:()=>''},
 {id:'different_beginning',title:'A different beginning',description:'Made a concrete next step after the residency went to someone else.',met:p=>flag(p,'independent_next_chapter')||flag(p,'supported_next_chapter')||flag(p,'reciprocal_next_chapter'),next:()=>''}
];
const communityContinuation:Tier={id:'community_common_ground',title:'Common Ground',description:'Turned Steward into shared responsibility: took the coordinator role and handed a usable rota and key to the next person.',met:p=>p.story?.version===1&&!!p.story.flags.includes('steward_payoff'),next:(p,g)=>p.story?.flags.includes('steward_responsibility')?'Keep the rota manageable, with room for other people to share the work.':g.round<5?'Keep listening to what the neighborhood needs, and leave room for others to help.':g.round===5?'Take the Steward coordinator shift at the marked story venue. It funds a usable rota, not an endless unpaid obligation.':'The coordinator opening has passed. You can still care for the neighborhood in your own way.'};
const sharedEvening:Tier={id:'a_smaller_first_set',title:'A song with a room',description:'Helped make the replacement beginning and stayed to hear Mina’s first set or recording.',met:p=>!!p.story?.flags.includes('witnessed_payoff')&&['shared_credit','pump_help','setup_done','shared_stage'].some(f=>p.story?.flags.includes(f)),next:()=>''};
const storyMode=(g:Game)=>(g as Game&{storyVersion?:number}).storyVersion===1;
const definitionsFor=(id:AspirationId,g:Game)=>id==='community'&&storyMode(g)?[...tiers[id],communityContinuation]:tiers[id];
const allMilestones = [...Object.values(tiers).flat(), ...extraMilestones, communityContinuation, sharedEvening];
function milestoneView(p:ProgressPlayer,g:Game,m:LifeMilestone):LifeMilestone{return{id:m.id,title:m.title,description:m.id==='shared_credit'&&storyMode(g)&&p.story?.flags.includes('shared_credit')?'Put Mina, Eli and Jo’s names on the shared poster and wrote a budget that makes everyone’s work visible.':m.id==='home_maker'&&storyMode(g)&&madeHomeByMoving(p)?'Made a home through an explicit relocation, carrying your everyday life into a new region.':m.description};}
function selectionReason(g: Game, p: ProgressPlayer): string {
 if (!active(g,p)) return 'Aspirations are available in new life games.';
 if (g.status !== 'playing') return 'Choose a direction while the game is running.';
 if (g.players[g.turn] !== p) return 'Choose a direction on your own turn.';
 if (p.aspiration && p.aspirationWeek === g.round) return 'You can change direction next week.';
 return '';
}

/** Choosing costs no time or cash and never pays rewards. Initial choice consumes this
 * week’s choice, so changing direction cannot become a same-turn reward loop.
 */
export function selectAspiration(g: Game, p: Player, id: string): void {
 const q = p as ProgressPlayer;
 const selected = aspirations.find(a=>a.id===id);
 if (!selected) throw Error('Choose career, community, creative or home.');
 if (!active(g,p)) throw Error('Aspirations are available in new life games.');
 if (g.status !== 'playing') throw Error('The game is not running.');
 if (g.players[g.turn] !== p) throw Error('It is another player’s turn.');
 if (q.aspiration === id) return;
 const blocked = selectionReason(g,q);
 if (blocked) throw Error(blocked);
 q.aspiration = selected.id;
 q.aspirationWeek = g.round;
 g.log.unshift(`${p.name} is making room for ${selected.title.toLowerCase()}.`);
 g.log = g.log.slice(0,32);
}

/** Call after a successful move/event choice and after weekly bills, for every affected
 * player. Actual action counts come from afterLifeAction, called before this function.
 * Idempotent: grants no money, resources or numerical legacy, and never revokes history.
 */
export function recordLifeProgress(g: Game, p: Player): LifeMilestone[] {
 if (!active(g,p) || g.status === 'lobby' || !g.players.includes(p)) return [];
 const q = p as ProgressPlayer;
 const earned = new Set(q.milestones ?? []);
 const newly = allMilestones.filter(m=>!earned.has(m.id)&&m.met(q,g));
 if (!newly.length) return [];
 q.milestones = [...earned, ...newly.map(m=>m.id)];
 return newly.map(m=>milestoneView(q,g,m));
}
function foundations(p: ProgressPlayer): LifeFoundation[] {
 const due = bills(p), people = close(p), strain = namedNeighbors.filter(n=>p.life?.relationships[n.id]?.rivalry);
 const owed = namedNeighbors.filter(n=>p.life?.relationships[n.id]?.reciprocity);
 const cashDetail = p.cash < 0
  ? `An overdraft of $${amount(p.cash)} remains. Your finances are not settled.`
  : p.cash >= due*2
   ? `$${amount(p.cash)} covers at least two representative weeks of rent and food at $${due} a week.`
   : `$${amount(p.cash)} on hand; aim for $${due*2} to cover two representative weeks of rent and food.`;
 const localFriends = localFriendCount(p);
 const bonds: string[] = [];
 if (people.length) bonds.push(`${people.map(n=>n.name).join(' and ')} ${people.length===1?'is a close connection':'are close connections'}.`);
 if (hasPartner(p)) bonds.push('Neri is your partner.');
 if (castFriends(p).length) bonds.push(`${castFriends(p).map(c=>c.name).join(' and ')} ${castFriends(p).length===1?'is':'are'} part of your life through shared time, honesty and reciprocal care.`);
 if (localFriends) bonds.push(`You have formed ${localFriends} close local friendship${localFriends===1?'':'s'}.`);
 let peopleDetail = bonds.length ? bonds.join(' ') : 'A lasting bond is still growing. A wider circle alone does not establish one.';
 if (strain.length) peopleDetail += ` ${strain.map(n=>n.name).join(' and ')} ${strain.length===1?'has':'have'} a strained bond with you.`;
 if (owed.length) peopleDetail += ` You still have a favor to return to ${owed.map(n=>n.name).join(' and ')}.`;
 return [
  {title:'A financial buffer',detail:cashDetail,secure:p.cash>=due*2},
  {title:p.housing?'A place of your own':'A shared place to return to',detail:flag(p,'repairs_unfinished')?'Repairs are unfinished; the smaller setup is still temporary.':p.cash<due?'Your home matters, but the next rent-and-food payment is not yet covered.':`Your current ${p.housing?'studio':'shared home'} has at least the next rent-and-food payment covered.`,secure:p.cash>=due&&!flag(p,'repairs_unfinished')},
  {title:'People to come back to',detail:peopleDetail,secure:closeBondCount(p)>0},
  {title:'Room to recover',detail:p.energy<30?'Energy is running low. Rest needs a place in the next chapter.':p.joy<40?'There is energy to carry on, but happiness needs some care.':'You have energy in reserve and some happiness to build on.',secure:p.energy>=30&&p.joy>=40}
 ];
}
function epilogue(p: ProgressPlayer, g: Game, aspiration: Aspiration|null, ladders: LifeLadderView[], earned: LifeMilestone[], base: LifeFoundation[], next: string): LifeEpilogue {
 const chosen = aspiration ? ladders.find(l=>l.id===aspiration.id)! : undefined;
 const highest = chosen?.tiers.filter(t=>t.earned).at(-1);
 const complete = !!chosen?.tiers.at(-1)?.earned;
 const currentTop = !!chosen?.tiers.at(-1)?.current;
 const title = p.cash<0 ? 'A life still being rebuilt' : complete&&currentTop ? 'A chapter you made real' : base.filter(f=>f.secure).length>=3 ? 'A quieter kind of arrival' : earned.length ? 'Something worth carrying forward' : 'A beginning still open';
 let ambition = aspiration
  ? complete
   ? `You earned the ${highest!.title} chapter of “${aspiration.title}.” ${currentTop?'The work, people and choices behind it are part of your story.':'Your present footing has changed, but that earned chapter remains part of your story.'}`
   : highest
    ? `“${aspiration.title}” is unfinished. You reached ${highest.title}; the final chapter still asks something of you.`
    : `You wanted “${aspiration.title},” and it has not taken shape yet. Eight weeks cannot settle every ambition.`
  : 'You kept several futures open without naming one main ambition. The things you actually did still belong to your story.';
 const unexpected = ladders.filter(l=>l.id!==aspiration?.id).map(l=>({ladder:l,tier:l.tiers.filter(t=>t.earned).at(-1)})).find(v=>v.tier&&v.ladder.tiers.indexOf(v.tier)>0);
 if (aspiration&&!complete&&unexpected?.tier) ambition += ` Alongside that ambition, you earned ${unexpected.tier.title} through “${unexpected.ladder.title}.” You can decide what that discovery means next.`;
 const missed = p.life?.receipts?.some(r=>r.eventId==='crossroads');
 const setback = p.life?.receipts?.some(r=>r.eventId==='work_reset');
 const lostRole = p.life?.receipts?.some(r=>r.eventId==='work_reset'&&Number(r.context?.jobBefore)>0);
 const shiftOnly = storyMode(g)&&setback&&!lostRole;
 const regret = missed
  ? 'The funded residency went to someone else. A different beginning can matter without pretending that disappointment never happened.'
  : setback&&flag(p,'career_interrupted')&&(!storyMode(g)||lostRole)
   ? 'The contract fell through, and your career route is still interrupted. Your earned skills remain usable.'
   : shiftOnly
    ? 'A cancelled shift reduced your buffer, but your entry-level role was not lost. Keeping that work is a real form of stability; it does not require a promotion.'
   : flag(p,'commission_lost')
    ? 'The shared commission was lost. Making more work will not restore that particular promise, but your craft remains.'
    : !complete&&aspiration
     ? 'Some plans are still beyond reach. An unfinished ambition is real, even alongside the good things you built.'
     : 'This chapter does not settle the rest of your life. There are still choices, limits and unfinished conversations ahead.';
 const relations = base[2].detail;
 const home = p.cash<0
  ? `You finish with a $${amount(p.cash)} overdraft. ${p.housing?'Having your own door':'Having a shared home'} does not make the money problem disappear; rebuilding a buffer comes first.`
  : base[0].secure&&base[1].secure
   ? `Your ${p.housing?'own place':'shared home'} and two-week rent-and-food buffer give you a steadier starting point. That is breathing room, not a guarantee against future setbacks.`
   : p.cash>=bills(p)*2
    ? `Your two-week rent-and-food buffer is in place, while the original repairs remain unfinished. Your smaller setup is still temporary.`
    : `You have ${p.housing?'a place of your own':'a shared place to return to'}, but the full two-week buffer is not in place${flag(p,'repairs_unfinished')?' and repairs remain unfinished':''}. Stability is still something to work toward.`;
 let opening: string;
 if (p.cash<0) opening = 'One practical opening is a manageable paid shift, paired with enough rest to keep going. It can begin reducing the overdraft; it cannot promise the whole recovery.';
 else if (p.energy<30) opening = 'A first opening is to rest before taking on the next obligation. Then choose one small piece of the future you still want.';
 else if (!complete&&aspiration) opening = `A concrete next opening: ${next} It offers a direction, without promising the outcome.`;
 else {
  const strained = namedNeighbors.find(n=>p.life?.relationships[n.id]?.rivalry);
  const owed = namedNeighbors.find(n=>p.life?.relationships[n.id]?.reciprocity);
  opening = strained ? `A next opening is an honest check-in with ${strained.name}. You can make the effort without assuming forgiveness.`
   : owed ? `A next opening is to return ${owed.name}’s favor. There is already a real relationship to care for.`
   : aspiration?.id==='career' ? 'A next opening is to keep tutoring learners while protecting time for your own life. Experience can be useful beyond a job title.'
   : aspiration?.id==='creative' ? 'A next opening is another small commission or a shared showing with Mina or Jo. A finished body of work gives you something real to bring.'
   : aspiration?.id==='community' ? 'A next opening is to care for the garden you helped build and bring a newer neighbor in. The work can continue beyond the ribbon-cutting.'
   : aspiration?.id==='home' ? 'A next opening is another meal around your table while protecting your buffer. Belonging can grow through ordinary, repeated care.'
   : 'A next opening is to choose one small commitment: a course, a shared project, a craft practice or time with a neighbor. You do not need the entire future decided first.';
 }
 return {title,paragraphs:[ambition,regret,relations,home,opening]};
}

/** Pure projection, safe for repeated client and server rendering and restored saves. */
export function getLifeProgress(p: Player, g: Game): LifeProgress {
 const q = p as ProgressPlayer;
 const enabled = active(g,p);
 const aspiration = enabled ? aspirations.find(a=>a.id===q.aspiration) ?? null : null;
 const earned = new Set(enabled ? q.milestones ?? [] : []);
 const ladders = aspirations.map(a=>{
  const definitions = definitionsFor(a.id,g);
  const currentId = enabled ? definitions.filter(t=>t.met(q,g)).at(-1)?.id : undefined;
  return {id:a.id,title:a.title,tiers:definitions.map(m=>({...milestoneView(q,g,m),earned:earned.has(m.id),current:m.id===currentId}))};
 });
 const chosen = aspiration ? ladders.find(l=>l.id===aspiration.id)! : undefined;
 const currentTier = chosen?.tiers.find(t=>t.current)?.title ?? 'Finding your footing';
 const missing = aspiration ? definitionsFor(aspiration.id,g).find(t=>!earned.has(t.id)) : undefined;
 const restore = aspiration ? definitionsFor(aspiration.id,g).find(t=>earned.has(t.id)&&!t.met(q,g)) : undefined;
 const nextStep = !enabled ? 'Life chapters are available in newly created life games.'
  : !aspiration ? 'Choose an aspiration. You can change direction once per week without losing what you have earned.'
  : missing ? missing.next(q,g)
  : restore ? `Your earned chapters stay with you. To strengthen your footing: ${restore.next(q,g)}`
  : 'This chapter is complete. Keep tending the people, work and home that made it possible, or choose a new direction next week.';
 const milestones = allMilestones.filter(m=>earned.has(m.id)).map(m=>milestoneView(q,g,m));
 const base = enabled ? foundations(q) : [];
 const reason = selectionReason(g,q);
 const result:LifeProgress = {
  enabled,aspiration,title:aspiration?.title??'A life taking shape',currentTier,nextStep,
  canSelectAspiration:reason==='',selectionReason:reason,ladders,foundations:base,milestones,
  epilogue:enabled?epilogue(q,g,aspiration,ladders,milestones,base,nextStep):{title:'Your neighborhood story',paragraphs:['This saved game uses its original rules.']}
 };
 if(!hasModernEconomy(p))return result;
 const convert=(v:unknown):unknown=>typeof v==='string'?v.replace(/two-week/g,'two-month').replace(/weeks/g,'months').replace(/weekly/g,'monthly').replace(/week/g,'month').replace(/Eight months/g,'Eight months').replace(/rent-and-food/g,'rent, food and essentials').replace(/rent and food/g,'rent, food and essentials').replace(/\$120/g,`$${-economyLifeCash(p,'home_repair_paid',-120)}`).replace(/(\d+) time\b/g,(_m,n)=>`${n} priority block${n==='1'?'':'s'}`):Array.isArray(v)?v.map(convert):v&&typeof v==='object'?Object.fromEntries(Object.entries(v).map(([k,value])=>[k,convert(value)])):v;
 return convert(result) as LifeProgress;
}
