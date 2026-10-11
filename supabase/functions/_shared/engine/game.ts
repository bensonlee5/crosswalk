import { actionIncidentContext, commitActionIncident, type ActionIncidentState, type IncidentRandomState } from './action-incidents.ts';
import { resolveCareerChoice, recordCareerEvidence, endCareerMonth, type CareerState } from './careers.ts';
import { financialRestriction, settleFinancialMonth, reserveRecoveryAdministration, type FinanceState } from './financial-recovery.ts';
import { actionFamiliarityContext, recordActionFamiliarity, type ActionFamiliarityState } from './action-familiarity.ts';
import { resolveSharedChoice, beginSharedOpportunityRound, endSharedOpportunityTurn, type SharedPersonalState, type SharedOpportunitiesState } from './shared-opportunities.ts';
import { recordMotiveEvidence, resolveMotiveChoice, type MotivePlayerState } from './character-motives.ts';
import { resolveCastChoice, endCastMonth } from './character-cast.ts';
import type { CastState, CastPlayerState } from './character-cast.ts';
import { storyActionReason, storyAfterAction, resolveStoryChoice, arriveStoryWeek } from './story-arcs.ts';
import type { StoryState, StoryPlayerState } from './story-arcs.ts';
import { economyActivity, economyQuote, economyDisabled, recordEconomyWork, recordEconomyHabit, economyGardenReward, economyPaidHours } from './economy.ts';
import type { EconomyWorkState, EconomyHabitState } from './economy.ts';
import { visiblePlaces, resolveWorldChoice, beginWorldWeek, afterWorldAction } from './world-life.ts';
import type { WorldState, SharedWorldState } from './world-life.ts';
import { beginLifeWeek, deferLifeChoice, resolveLifeChoice, repairRelationship, repairHome } from './life-events.ts';
import type { LifePlayerState, LifeScheduleEntry, LifeNpc } from './life-events.ts';
import { selectAspiration, recordLifeProgress } from './life-progress.ts';
import { regionalParticipation, consumeRegionalParticipation } from './regional-life.ts';
import type { RegionalLifeUsage } from './regional-life.ts';
import { weatherEffect, consumeClimateEffect, getWeather, seasonalOpportunity } from './weather.ts';
import type { WeatherId, WeatherUsage } from './weather.ts';
export { createEnvironment } from './weather.ts';
export type Player = {
    schemaVersion: 1;
    career?: CareerState;
    finance?: FinanceState;
    actionIncidents?: ActionIncidentState;
    familiarity?: ActionFamiliarityState;
    sharedPersonal?: SharedPersonalState;
    regionalLifeUsage?: RegionalLifeUsage;
    motives?: MotivePlayerState;
    castRedacted?: boolean;
    cast?: CastPlayerState;
    economyWork?: EconomyWorkState;
    economyHabits?: EconomyHabitState;
    story?: StoryPlayerState;
    id: string;
    name: string;
    cash: number;
    skill: number;
    joy: number;
    energy: number;
    hours: number;
    social: number;
    housing: number;
    place: string;
    life?: LifePlayerState;
    world?: WorldState;
    aspiration?: string;
    aspirationWeek?: number;
    milestones?: string[];
    craft?: number;
    legacy?: number;
    weatherUsage?: WeatherUsage;
};
export type Game = {
    schemaVersion: 1;
    actionIncidentRng?: Record<string, IncidentRandomState>;
    sharedOpportunities?: SharedOpportunitiesState;
    cast?: CastState;
    story?: StoryState;
    sharedWorld?: SharedWorldState;
    code: string;
    mode: 'hotseat' | 'online';
    host: string;
    members: Record<string, string[]>;
    players: Player[];
    status: 'lobby' | 'playing' | 'finished';
    round: number;
    turn: number;
    maxRounds: number;
    log: string[];
    lifeSeed?: number;
    lifeSchedule?: LifeScheduleEntry[];
    weatherSchedule?: WeatherId[];
    turnsTaken?: number;
    opportunityClaim?: {
        round: number;
        playerId: string;
        name: string;
    };
    project?: {
        contributions: Record<string, number>;
        lastWeek: Record<string, number>;
        completed: boolean;
    };
};
export type Activity = {
    id: string;
    title: string;
    place: string;
    icon: string;
    time: number;
    cost: number;
    desc: string;
    color: string;
    energy?: number;
    joy?: number;
    skill?: number;
    social?: number;
    earn?: number;
    needSkill?: number;
    needSocial?: number;
    housing?: number;
    craft?: number;
    needCraft?: number;
    special?: 'opportunity' | 'project';
};
const activity = (place: string, color: string, rows: Omit<Activity, 'place' | 'color' | 'icon'>[]): Activity[] => rows.map(a => ({ ...a, place, color, icon: 'spark' }));
export const actions: Activity[] = [
    ...activity('APARTMENTS', 'mint', [
        { id: 'move', title: 'Get your own place', time: 1, cost: 2800, housing: 1, desc: 'Studio deposit, moving costs and monthly bills depend on your home region.' },
        { id: 'home_reset', title: 'Reset your space', time: 1, cost: 0, energy: 12, joy: 7, desc: 'Fold the knitted throw, dust the monstera leaves and put on a record' },
        { id: 'home_meal', title: 'Make good home cooking a monthly habit', time: 1, cost: 100, joy: 4, energy: 34, desc: "Upgrade 20 home-cooked dinners with $100 of better ingredients this month; ordinary groceries are already in your bills." },
        { id: 'home_host', title: 'Host a potluck', time: 2, cost: 65, joy: 20, social: 2, desc: 'Host a potluck: $65 for bread, lentils and your share of the table. Leave room for everyone’s dish.' }
    ]),
    ...activity('WORK', 'blue', []),
    ...activity('CAMPUS', 'purple', []),
    ...activity('CAREER HUB', 'orange', [
        { id: 'career_network', title: 'Go to a networking meetup', time: 1, cost: 25, social: 2, joy: 4, energy: -4, desc: 'Meet people who open up new opportunities' }
    ]),
    ...activity('CORNER CAFÉ', 'pink', [
        { id: 'friends', title: 'Keep a twice-weekly café date with friends', time: 1, cost: 144, joy: 12, social: 1, desc: 'Coffee, lemon biscuits and a conversation that can wander' },
        { id: 'cafe_break', title: 'Make weekday coffee your quiet ritual', time: 1, cost: 140, energy: 14, joy: 8, desc: 'An espresso at the window, with a moment to yourself' },
        { id: 'cafe_openmic', title: 'Try the open mic', time: 2, cost: 15, joy: 18, social: 2, energy: -6, desc: 'Trade a few nerves for a good story' }
    ]),
    ...activity('COMMUNITY', 'yellow', [
        { id: 'volunteer', title: 'Lend a hand', time: 2, cost: 0, joy: 15, social: 2, desc: 'Sort tins of beans and bags of rice with the pantry crew' },
        { id: 'community_setup', title: 'Set up the food pantry', time: 1, cost: 0, joy: 7, social: 1, energy: -5, desc: 'Stack the rice sacks and check the dates on the bean tins' },
        { id: 'community_lead', title: 'Lead a neighborhood event', time: 2, cost: 30, joy: 22, social: 3, energy: -10, needSocial: 3, desc: 'Bring three connections into something bigger' }
    ]),
    ...activity('THE PARK', 'green', [
        { id: 'rest', title: 'Take the slow route', time: 1, cost: 0, energy: 22, joy: 5, desc: 'A restorative walk under the trees' },
        { id: 'park_picnic', title: 'Pack a picnic with friends', time: 2, cost: 30, energy: 10, joy: 20, social: 1, desc: 'Unwrap cheese sandwiches and pass the apple slices' },
        { id: 'park_run', title: 'Go for a morning run', time: 1, cost: 0, energy: -8, joy: 12, desc: 'Trade physical effort for a clearer head' },
        { id: 'park_read', title: 'Read under a tree', time: 2, cost: 0, energy: 28, joy: 20, desc: "A deeper happiness boost than two walks, with less energy recovery." }
    ]),
    ...activity('LIBRARY', 'purple', [
        { id: 'library_read', title: 'Get lost in a good book', time: 1, cost: 0, energy: 10, joy: 9, desc: 'A dog-eared paperback and a seat beneath the reading lamp' },
        { id: 'library_club', title: 'Join the book club', time: 2, cost: 0, joy: 14, social: 2, desc: 'Turn a shared story into new connections' }
    ]),
    ...activity('MARKET', 'orange', [
        { id: 'market_cook', title: 'Take a cooking class', time: 2, cost: 55, energy: 20, joy: 24, desc: "Chop peppers and parsley for a shared supper: +24 happiness and +20 energy for $55." },
        { id: 'market_taste', title: 'Make market lunches part of your month', time: 1, cost: 260, energy: 9, joy: 12, desc: 'Taste a spoonful of relish and a wedge of warm flatbread' }
    ]),
    ...activity('FITNESS', 'green', [
        { id: 'gym_yoga', title: 'Join a gentle yoga class', time: 1, cost: 20, energy: 28, joy: 6, desc: 'A paid reset with a little extra recovery' },
        { id: 'gym_train', title: 'Train with a friend', time: 1, cost: 15, energy: -10, joy: 15, social: 1, desc: 'An energizing social habit, with physical effort' },
        { id: 'gym_sauna', title: 'Take a recovery session', time: 2, cost: 45, joy: 10, energy: 64, desc: "More recovery than two yoga classes: +64 energy, +10 happiness for $45." }
    ]),
    ...activity('MAKERSPACE', 'blue', [
        { id: 'maker_hobby', title: 'Make something just for fun', time: 1, cost: 30, joy: 16, energy: -5, desc: 'Paint a ceramic bird, one blue feather at a time' },
        { id: 'maker_repair', title: 'Help at the repair café', time: 2, cost: 0, joy: 13, social: 2, energy: -7, needSkill: 1, desc: 'Tighten a loose hinge and help a neighbor keep their cupboard' }
    ]),
    ...activity('CINEMA', 'pink', [
        { id: 'cinema_matinee', title: 'Catch a matinee', time: 1, cost: 18, joy: 15, energy: 5, desc: 'A little escape for the price of a ticket' },
        { id: 'cinema_friends', title: 'Make it a movie night', time: 2, cost: 50, joy: 26, social: 1, energy: 4, desc: 'A bigger night out with your people' },
        { id: 'cinema_club', title: 'Stay for the film discussion', time: 2, cost: 12, joy: 16, social: 2, desc: 'Meet other people who love a good story' }
    ]),
    ...activity('TRANSIT', 'blue', [
        { id: 'transit_scenic', title: 'Ride somewhere new', time: 1, cost: 12, joy: 13, energy: 6, desc: 'A small change of scenery' },
        { id: 'transit_cleanup', title: 'Join the car-free street crew', time: 2, cost: 0, joy: 14, social: 3, energy: -12, desc: 'Help make the neighborhood easier to explore' }
    ]),
    ...activity('GARDEN', 'mint', [
        { id: 'garden_tend', title: 'Tend a shared plot', time: 1, cost: 0, joy: 10, energy: -4, social: 1, desc: 'Loosen the soil with a hand fork and label the seed trays' },
        { id: 'garden_workshop', title: 'Learn urban growing', time: 3, cost: 50, skill: 1, joy: 5, energy: -10, desc: 'Practice seed spacing and learn when the soil needs water' },
        { id: 'garden_rest', title: 'Spend a slow afternoon here', time: 2, cost: 0, joy: 7, energy: 54, desc: "A long, free rest: more energy than two walks, a little less happiness." }
    ]),
    ...activity('ARCADE', 'yellow', [
        { id: 'arcade_play', title: 'Play a few favorites', time: 1, cost: 20, joy: 17, energy: -3, desc: 'Chase the silver ball around a pinball table' },
        { id: 'arcade_tabletop', title: 'Join a tabletop night', time: 2, cost: 15, joy: 20, social: 2, energy: -5, desc: 'Pass the cards and wooden counters around one table' },
        { id: 'arcade_host', title: 'Host a game meetup', time: 2, cost: 25, joy: 24, social: 3, energy: -8, needSocial: 4, desc: 'Four connections help fill the seats' }
    ]),
    { id: 'creative_practice', title: 'Practice your craft', place: 'MAKERSPACE', icon: 'spark', color: 'blue', time: 2, cost: 90, energy: -7, craft: 1, joy: 4, desc: 'A month of regular practice: $90 in materials and 2 priority blocks. One craft level.' },
    { id: 'weekly_opportunity', title: 'Take the monthly project opening', place: 'COMMUNITY', icon: 'spark', color: 'yellow', time: 2, cost: 0, energy: -12, special: 'opportunity', desc: 'One opening for the whole table. Check the neighborhood board for this month’s exact reward.' },
    { id: 'garden_project', title: 'Build the neighborhood garden', place: 'GARDEN', icon: 'spark', color: 'mint', time: 1, cost: 0, energy: -6, joy: 5, special: 'project', desc: 'One contribution each month. When the shared garden opens, every contributor receives $600 and 4 legacy points.' }
];
/** One current activity definition shared by previews and action commits. */
export function activityForPlayer(p:Player,a:Activity,g?:Pick<Game,'round'>):Activity{return economyActivity(p,a,g);}

export const opportunities = [
    { title: 'Pop-up welcome market', text: 'A bread-and-preserves stall needs a friendly host.', joy: 8, social: 2, craft: 0 },
    { title: 'Design the festival poster', text: 'Letter the supper time and paint a border for the festival poster.', joy: 6, social: 0, craft: 1 },
    { title: 'Neighborhood research day', text: 'Listen to what your neighbors want next.', joy: 8, social: 2, craft: 0 },
    { title: 'Weekend craft showcase', text: 'Take the last table at the makers’ fair.', joy: 8, social: 0, craft: 1 },
    { title: 'Local business launch', text: 'Help a new shop welcome the street.', joy: 6, social: 2, craft: 0 },
    { title: 'Community mural day', text: 'Fill the chalked mural outlines with ochre and blue.', joy: 10, social: 0, craft: 1 },
    { title: 'Harvest supper host', text: 'Bring the whole block to the table.', joy: 10, social: 2, craft: 0 },
    { title: 'The neighborhood finale', text: 'Make the last month a good memory.', joy: 12, social: 1, craft: 1 }
];
export const opportunity = (g: Pick<Game, 'round' | 'weatherSchedule' | 'players' | 'turn' | 'code'>) => seasonalOpportunity(g, opportunities[[1, 0, 3, 2, 4, 5, 6, 7][(g.round - 1) % opportunities.length]]);
export const projectGoal = (g: Pick<Game, 'players'>) => g.players.length * 2;
export const projectProgress = (g: Pick<Game, 'project'>) => Object.values(g.project?.contributions || {}).reduce((a, b) => a + b, 0);
export function effects(p: Player, a: Activity, g?: Game) {
    a = activityForPlayer(p, a, g);
    let craft = a.craft || 0, social = a.social || 0, joy = a.joy || 0;
    if (a.special === 'opportunity' && g) {
        const o = opportunity(g);
        craft = o.craft;
        social = o.social;
        joy = o.joy;
    }
    const weather = weatherEffect(p, a, g, { joy, energy: a.energy || 0 }), participation = regionalParticipation(p, a.id, g, joy + weather.joy, visiblePlaces(p, g).includes(a.place));
    return { cash: economyQuote(p, a, g).cash, energy: Math.max(-p.energy, Math.min(a.energy || 0, 100 - p.energy)) + weather.energy, joy: Math.max(-p.joy, Math.min(joy, 100 - p.joy)) + weather.joy + participation.joy, participation, skill: Math.min(a.skill || 0, 6 - p.skill), social, craft: Math.min(craft, 8 - (p.craft || 0)), weather, requiredEnergy: weather.requiredEnergy };
}
export function player(name: string): Player { return { schemaVersion: 1, id: crypto.randomUUID(), name, cash: 6000, skill: 0, joy: 40, energy: 70, hours: 6, social: 0, housing: 0, place: 'APARTMENTS', craft: 0, legacy: 0, economyWork: { round: 1, paidHours: 0 }, economyHabits: { round: 1, ids: [] }, familiarity: { version: 1, startedRound: 1, actions: {}, people: {} } }; }
export function reason(p: Player, id: string, g?: Game) {
    const original = actions.find(x => x.id === id);
    if (!original)
        return 'Unknown action';
    const a = activityForPlayer(p, original, g);
    const narrativeBlock = (a.housing === 1 ? financialRestriction(g, p, 'studio', a.cost) : '') || storyActionReason(g, p, id) || economyDisabled(p, a, g);
    if (narrativeBlock)
        return narrativeBlock;
    if (p.world && !visiblePlaces(p, g).includes(a.place))
        return 'This place is not on your current map';
    if (a.special && !g)
        return 'Open the neighborhood board';
    if (a.special === 'opportunity' && g && g.opportunityClaim && g.opportunityClaim.round === g.round)
        return `Claimed by ${g.opportunityClaim.name}`;
    if (a.special === 'project' && g) {
        if (g.project?.completed)
            return 'The garden is complete';
        if (g.project?.lastWeek[p.id] === g.round)
            return 'You already helped this month';
    }
    if (p.hours < a.time)
        return 'Not enough priority blocks this month';
    if (a.cost > 0 && p.cash < a.cost)
        return 'Not enough cash for the upfront cost';
    if (a.housing === p.housing)
        return 'You already have a studio';
    if (p.energy < effects(p, a, g).requiredEnergy) {
        const e = effects(p, a, g);
        return e.weather.exposureUsed > 0 ? `Needs ${e.requiredEnergy} energy including weather; rest at home first` : 'Rest before this activity';
    }
    if (a.skill && p.skill >= 6)
        return 'All six skills earned';
    if (a.craft && (p.craft || 0) >= 8)
        return 'All eight craft levels earned';
    if (a.needSkill && p.skill < a.needSkill && !(a.id === 'career_contract'))
        return `Needs ${a.needSkill} skills (you have ${p.skill})`;
    if (a.needSocial && p.social < a.needSocial)
        return `Needs ${a.needSocial} connections (you have ${p.social})`;
    if (a.needCraft && (p.craft || 0) < a.needCraft)
        return `Needs ${a.needCraft} craft levels`;
    return '';
}
export function availableActions(p: Player, place: string, g?: Game) { return actions.map(a => activityForPlayer(p, a, g)).filter(a => a.place === place && visiblePlaces(p, g).includes(place)); }
export function move(g: Game, id: string, destination?: string) {
    const p = g.players[g.turn], paidBefore = p ? economyPaidHours(p, g) : 0, before = JSON.stringify(g), context = p ? actionFamiliarityContext(g, p, id, destination) : undefined;
    const original = actions.find(a => a.id === id), incidentContext = p ? actionIncidentContext(g, p, original ? activityForPlayer(p, original, g) : undefined) : null;
    moveCore(g, id, destination);
    const applied = JSON.stringify(g) !== before;
    if (p) {
        const updated = g.players.find(q => q.id === p.id) ?? p;
        recordMotiveEvidence(g, updated, id);
        if (applied && context) {
            recordCareerEvidence(g, updated, { ...context, actionId: id }, Math.max(0, economyPaidHours(updated, g) - paidBefore));
            recordLifeProgress(g, updated);
            const incident = commitActionIncident(g, updated, incidentContext);
            if (incident?.person)
                context.actorIds.push(incident.person.actorId);
            recordActionFamiliarity(updated, context);
            if (incident?.incidentId)
                recordLifeProgress(g, updated);
        }
    }
}
function moveCore(g: Game, id: string, destination?: string) {
    if (g.status !== 'playing')
        throw Error('The game is not running');
    const p = g.players[g.turn];
    if (id.startsWith('career:')) {
        resolveCareerChoice(g, p, id);
        recordLifeProgress(g, p);
        return;
    }
    if (id.startsWith('world:shared:')) {
        resolveSharedChoice(g, p, id.slice(6));
        recordLifeProgress(g, g.players[g.turn]);
        return;
    }
    if (id.startsWith('motive:')) {
        resolveMotiveChoice(g, p, id);
        recordLifeProgress(g, p);
        return;
    }
    if (id.startsWith('cast:')) {
        resolveCastChoice(g, p, id);
        recordLifeProgress(g, p);
        return;
    }
    if (id === 'visit') {
        if (!visiblePlaces(p, g).includes(destination || ''))
            throw Error('That place is undiscovered or closed here');
        p.place = destination!;
        g.log.unshift(`${p.name} arrived at ${destination}`);
        g.log = g.log.slice(0, 32);
        return;
    }
    if (id.startsWith('story:')) {
        const parts = id.split(':');
        if (parts.length !== 3)
            throw Error('Unknown story response');
        if (p.story?.receipts.some(r => r.sceneId === parts[1] && r.choiceId === parts[2]))
            return;
        resolveStoryChoice(g, p, parts[1], parts[2]);
        afterWorldAction(g, p, id);
        recordLifeProgress(g, p);
        return;
    }
    if (id.startsWith('world:')) {
        if (p.world?.acceptedChoices.includes(id.slice(6)))
            return;
        resolveWorldChoice(g, p, id.slice(6));
        recordLifeProgress(g, p);
        return;
    }
    if (id.startsWith('event:')) {
        if (p.life?.receipts.some(r => r.resolved?.choiceId === id.slice(6)))
            return;
        resolveLifeChoice(g, p, id.slice(6));
        afterWorldAction(g, p, id);
        recordLifeProgress(g, p);
        return;
    }
    if (id.startsWith('repair:')) {
        const npc = id.slice(7);
        if (!['mina', 'eli', 'jo'].includes(npc))
            throw Error('Unknown neighbor');
        repairRelationship(g, p, npc as LifeNpc);
        afterWorldAction(g, p, id);
        recordLifeProgress(g, p);
        return;
    }
    if (id.startsWith('home_repair:')) {
        const method = id.slice(12);
        if (method !== 'paid' && method !== 'diy')
            throw Error('Unknown repair method');
        repairHome(g, p, method);
        recordLifeProgress(g, p);
        return;
    }
    if (id.startsWith('aspire:')) {
        selectAspiration(g, p, id.slice(7));
        return;
    }
    if (id === 'end') {
        endCareerMonth(g, p);
        endSharedOpportunityTurn(g, p);
        endCastMonth(g, p);
        {
            deferLifeChoice(g, p);
            recordLifeProgress(g, p);
        }
        const settlement = settleFinancialMonth(g, p);
        p.joy = Math.min(100, p.joy + (p.housing ? 6 : 0));
        p.energy = Math.min(100, p.energy + 16);
        p.joy = Math.max(0, p.joy - 4);
        if (p.cash < 0 || settlement?.unpaid)
            p.joy = Math.max(0, p.joy - 8);
        g.log.unshift(`${p.name} settled this month’s household account.`);
        let nextWeek = false;
        {
            g.turnsTaken = (g.turnsTaken || 0) + 1;
            nextWeek = g.turnsTaken >= g.players.length;
            g.turn = (g.turn + 1) % g.players.length;
        }
        if (nextWeek) {
            g.turn = 0;
            g.round++;
            if (g.round > g.maxRounds) {
                g.status = 'finished';
                g.round = g.maxRounds;
                beginSharedOpportunityRound(g, true);
                for (const q of g.players)
                    recordLifeProgress(g, q);
                g.log.unshift(`Eight ${'months'}, a thousand little choices. There is more life ahead.`);
                return;
            }
            {
                g.turnsTaken = 0;
                g.turn = (g.round - 1) % g.players.length;
                g.log.unshift(`${g.players[g.turn].name} has first choice this ${'month'}.`);
            }
            const weather = getWeather(g);
            if (weather) {
                for (const q of g.players)
                    q.weatherUsage = { round: g.round, joy: 0, heat: 0, recovery: 0 };
                g.log.unshift(`${weather.timeSkip ? weather.timeSkip + ' ' : ''}${weather.label}. A representative ${'month'}; no bills for the time skip.`);
            }
            beginSharedOpportunityRound(g);
            {
                beginLifeWeek(g);
                beginWorldWeek(g);
                arriveStoryWeek(g);
                for (const q of g.players)
                    recordLifeProgress(g, q);
            }
        }
        g.players[g.turn].hours = 6;
        reserveRecoveryAdministration(g, g.players[g.turn]);
        g.log = g.log.slice(0, 32);
        return;
    }
    const error = reason(p, id, g);
    if (error)
        throw Error(error);
    const a = activityForPlayer(p, actions.find(x => x.id === id)!, g);
    if (p.place !== a.place)
        throw Error('Visit this place on the map first');
    const e = effects(p, a, g);
    recordEconomyWork(p, a, g);
    recordEconomyHabit(p, a, g);
    consumeClimateEffect(p, g, e.weather);
    consumeRegionalParticipation(p, g, e.participation?.joy || 0);
    p.hours -= a.time;
    p.cash += e.cash;
    p.energy += e.energy;
    p.joy += e.joy;
    p.skill += e.skill;
    p.social += e.social;
    p.craft = (p.craft || 0) + e.craft;
    if (a.housing !== undefined)
        p.housing = a.housing;
    if (p.life) {
        p.life.activityCounts ??= {};
        p.life.activityCounts[a.id] = (p.life.activityCounts[a.id] || 0) + 1;
    }
    if (a.special === 'opportunity')
        g.opportunityClaim = { round: g.round, playerId: p.id, name: p.name };
    if (a.special === 'project') {
        g.project ??= { contributions: {}, lastWeek: {}, completed: false };
        g.project.contributions[p.id] = (g.project.contributions[p.id] || 0) + 1;
        g.project.lastWeek[p.id] = g.round;
        if (projectProgress(g) >= projectGoal(g)) {
            g.project.completed = true;
            for (const q of g.players)
                if (g.project.contributions[q.id]) {
                    q.cash += economyGardenReward(q);
                    q.legacy = Math.min(10, (q.legacy || 0) + 4);
                }
            g.log.unshift(`The shared garden is open! Every contributor earned $${economyGardenReward(p)} and +4 legacy.`);
        }
    }
    {
        storyAfterAction(g, p, id);
        afterWorldAction(g, p, id);
        for (const q of g.players)
            recordLifeProgress(g, q);
    }
    g.log.unshift(`${p.name}: ${a.title}${e.cash > 0 ? ` (+$${e.cash})` : ''}`);
    g.log = g.log.slice(0, 32);
}
