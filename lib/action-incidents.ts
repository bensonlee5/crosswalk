import type { Activity, Game, Player } from './game.ts';
import { ordinaryIncidentFamilies, incidentDrafts, contextualIncidentLines, type IncidentFamily } from './action-incident-content.ts';
import { incidentalPeople, type IncidentPersonLine } from './action-incident-people.ts';
import { canonicalCharacterById } from './character-canon.ts';
import { worldChoices, worldPlaceName } from './world-life.ts';
import { motiveScene } from './character-motives.ts';
import { getWeather } from './weather.ts';


export const actionIncidentRules = Object.freeze({ probability: .20, maxPerMonth: 2, maxCashIncidentsPerMonth: 1, cashCap: 25, rareRoundGap: 2, maxReceipts: 64 });
export type IncidentRandomState = {
    words: [
        number,
        number,
        number,
        number
    ];
};
export type IncidentPerson = IncidentPersonLine & {
    actorId: string;
    name: string;
    spot: string;
};
export type ActionIncidentReceipt = {
    id: string;
    ordinal: number;
    actionId: string;
    semanticKey: string;
    round: number;
    region: string;
    place: string;
    placeName: string;
    weather: string;
    source: 'ordinary-action';
    incidentId: string | null;
    title: string;
    body: string;
    effects: {
        cash: number;
        joy: number;
        energy: number;
    };
    person?: IncidentPerson;
};
export type ActionIncidentState = {
    version: 1;
    ordinal: number;
    month: {
        round: number;
        incidents: number;
        cashIncidents: number;
        cashGained: number;
        cashLost: number;
    };
    occurrences: Record<string, {
        count: number;
        lastRound: number;
        lastOrdinal: number;
        lastVariant: number;
    }>;
    lastIncidentId?: string;
    receipts: ActionIncidentReceipt[];
};
type IncidentGame = Game & {
    actionIncidentRng?: Record<string, IncidentRandomState>;
};
type IncidentPlayer = Player & {
    actionIncidents?: ActionIncidentState;
};
export type ActionIncidentContext = {
    actionId: string;
    semanticKey: string;
    family: IncidentFamily;
    round: number;
    region: string;
    place: string;
    placeName: string;
    weather: string;
    cost: number;
    speakers: IncidentPerson[];
};
const freshMonth = (round: number) => ({ round, incidents: 0, cashIncidents: 0, cashGained: 0, cashLost: 0 });
const zeroEffects = () => ({ cash: 0, joy: 0, energy: 0 });
const bounded = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));
const familyFor = (id: string) => Object.prototype.hasOwnProperty.call(ordinaryIncidentFamilies, id) ? ordinaryIncidentFamilies[id] : undefined;


function validRandom(r?: IncidentRandomState): r is IncidentRandomState { return !!r && r.words.length === 4 && r.words.every(n => Number.isInteger(n) && n >= 0 && n <= 0xffffffff); }
/** Only room creation/join may call this. Never initialize from a member view or load. */
export function initializeActionIncidents(g: IncidentGame, entropy: () => Uint32Array = () => crypto.getRandomValues(new Uint32Array(4))) {
    g.actionIncidentRng ??= {};
    for (const p of g.players as IncidentPlayer[]) {
        if (p.actionIncidents || g.actionIncidentRng[p.id])
            continue;
        const seed = entropy();
        if (seed.length !== 4)
            throw Error('Incident entropy requires four words');
        const words = Array.from(seed, n => n >>> 0) as IncidentRandomState['words'];
        if (!words.some(Boolean))
            words[3] = 1;
        g.actionIncidentRng[p.id] = { words };
        p.actionIncidents = { version: 1, ordinal: 0, month: freshMonth(g.round), occurrences: {}, receipts: [] };
    }
}
/** SFC32 with private persisted state; no seed or generator position enters a view. */
function draw(r: IncidentRandomState) { let [a, b, c, d] = r.words; let t = (a + b) | 0; a = b ^ (b >>> 9); b = (c + (c << 3)) | 0; c = (c << 21) | (c >>> 11); d = (d + 1) | 0; t = (t + d) | 0; c = (c + t) | 0; r.words = [a >>> 0, b >>> 0, c >>> 0, d >>> 0]; return (t >>> 0) / 4294967296; }
function eligibleSpeakers(g: Game, p: IncidentPlayer): IncidentPerson[] {
    if (p.castRedacted)
        return [];
    const result: IncidentPerson[] = [];
    for (const c of worldChoices(p, g)) {
        const id = c.actorId, canonical = id ? canonicalCharacterById[id] : null, lines = id ? incidentalPeople[id]?.[p.place] : undefined;
        if (!id || !canonical || canonical.age < 18 || canonical.region !== (p.world?.region ?? 'alder') || !lines || !c.available || c.kind !== 'conversation' || c.spot !== p.place || result.some(s => s.actorId === id))
            continue;
        const bond = p.motives?.bonds[id], motive = motiveScene(g, p, id);
        if (bond?.strained || (bond?.trust ?? 0) < 0 || bond?.lastExchangeWeek === g.round || motive?.remote || motive?.choices.some(c => c.key === 'ask' && c.response === 'refusal'))
            continue;
        const occurrence = p.actionIncidents?.occurrences[`person:${id}`], variant = occurrence ? ((occurrence.lastVariant + 1) % 12) : 0, index = variant % lines.speech.length;
        result.push({ actorId: id, name: canonical.name, spot: p.place, speech: lines.speech[index], activity: lines.activity[index], emotion: 'warm', gesture: 'pause' });
    }
    return result;
}
/** Capture from authoritative pre-action state, but do not consume anything. */
export function actionIncidentContext(g: IncidentGame, p: IncidentPlayer, a: Activity | undefined): ActionIncidentContext | null {
    const family = a ? familyFor(a.id) : undefined;
    if (!a || !family || a.special || a.housing !== undefined || a.time <= 0 || p.actionIncidents?.version !== 1 || p.actionIncidents.ordinal >= Number.MAX_SAFE_INTEGER || !validRandom(g.actionIncidentRng?.[p.id]))
        return null;
    return { actionId: a.id, semanticKey: a.id, family, round: g.round, region: p.world?.region ?? 'alder', place: p.place, placeName: worldPlaceName(p, p.place, g), weather: getWeather(g, p)?.label ?? '', cost: Math.max(0, a.cost), speakers: eligibleSpeakers(g, p) };
}
/** Only invoke after a real successful ordinary action. All incident changes are
 * calculated and validated on clones before any incident field/resource is assigned. */
export function commitActionIncident(g: IncidentGame, p: IncidentPlayer, context: ActionIncidentContext | null, probability = actionIncidentRules.probability): ActionIncidentReceipt | null {
    if (!context || p.actionIncidents?.version !== 1 || !validRandom(g.actionIncidentRng?.[p.id]))
        return null;
    const state = structuredClone(p.actionIncidents), rng = structuredClone(g.actionIncidentRng![p.id]);
    if (!Number.isSafeInteger(state.ordinal) || state.ordinal < 0 || state.ordinal >= Number.MAX_SAFE_INTEGER)
        throw Error('Invalid incident history');
    if (context.round !== g.round || context.place !== p.place || context.region !== (p.world?.region ?? 'alder'))
        throw Error('The activity context changed before its incident settled');
    const ordinal = state.ordinal + 1, trigger = draw(rng), selection = draw(rng), personSelection = draw(rng);
    state.ordinal = ordinal;
    if (state.month.round !== g.round)
        state.month = freshMonth(g.round);
    const receipt: ActionIncidentReceipt = { id: `incident:${p.id}:${ordinal}`, ordinal, actionId: context.actionId, semanticKey: context.semanticKey, round: g.round, region: context.region, place: context.place, placeName: context.placeName, weather: context.weather, source: 'ordinary-action', incidentId: null, title: '', body: '', effects: zeroEffects() };
    const pool = incidentDrafts.filter(d => {
        const old = state.occurrences[d.id];
        return d.families.includes(context.family) && (!d.actions || d.actions.includes(context.actionId)) && (!d.needsPerson || context.speakers.length > 0) && d.id !== state.lastIncidentId && (!old || ordinal - old.lastOrdinal > 1) && (!d.rare || !old || g.round - old.lastRound >= actionIncidentRules.rareRoundGap) && (!d.cash || state.month.cashIncidents < actionIncidentRules.maxCashIncidentsPerMonth) && (!d.purchaseRefund || context.cost > 0);
    });
    if (trigger < bounded(probability, 0, 1) && state.month.incidents < actionIncidentRules.maxPerMonth && pool.length) {
        const selected = pool[Math.floor(selection * pool.length)], old = state.occurrences[selected.id], variant = old ? (old.lastVariant + 1) % 12 : 0;
        let cash = selected.cash ?? 0;
        if (selected.purchaseRefund)
            cash = Math.min(cash, context.cost);
        if (cash > 0)
            cash = Math.min(cash, actionIncidentRules.cashCap - state.month.cashGained);
        else if (cash < 0)
            cash = -Math.min(-cash, actionIncidentRules.cashCap - state.month.cashLost, Math.max(0, p.cash));
        cash = cash || 0;
        const joy = bounded(p.joy + (selected.joy ?? 0), 0, 100) - p.joy, energy = bounded(p.energy + (selected.energy ?? 0), 0, 100) - p.energy;
        receipt.incidentId = selected.id;
        receipt.title = selected.title;
        receipt.effects = { cash, joy, energy };
        const lines = contextualIncidentLines[selected.id]?.[context.family] ?? selected.lines;
        receipt.body = lines[variant % lines.length];
        if (selected.id === 'loose_change' && cash === 0)
            receipt.body = 'You notice an open pocket before anything valuable is lost. You close it and take a moment to settle.';
        if (selected.needsPerson) {
            const person = context.speakers[Math.floor(personSelection * context.speakers.length)];
            receipt.person = { ...person };
            const previous = state.occurrences[`person:${person.actorId}`];
            state.occurrences[`person:${person.actorId}`] = { count: Math.min(Number.MAX_SAFE_INTEGER, (previous?.count ?? 0) + 1), lastRound: g.round, lastOrdinal: ordinal, lastVariant: previous ? (previous.lastVariant + 1) % 12 : 0 };
        }
        state.occurrences[selected.id] = { count: Math.min(Number.MAX_SAFE_INTEGER, (old?.count ?? 0) + 1), lastRound: g.round, lastOrdinal: ordinal, lastVariant: variant };
        state.lastIncidentId = selected.id;
        state.month.incidents++;
        if (cash !== 0) {
            state.month.cashIncidents++;
            state.month.cashGained += Math.max(0, cash);
            state.month.cashLost += Math.max(0, -cash);
        }
    }
    state.receipts.push(receipt);
    state.receipts = state.receipts.slice(-actionIncidentRules.maxReceipts);
    if (!Object.values(receipt.effects).every(Number.isFinite) || !Number.isFinite(p.cash + receipt.effects.cash))
        throw Error('Invalid incident effects');
    p.cash += receipt.effects.cash;
    p.joy += receipt.effects.joy;
    p.energy += receipt.effects.energy;
    p.actionIncidents = state;
    g.actionIncidentRng![p.id] = rng;
    return receipt;
}
/** Pure preview: no future roll or hidden seed is exposed. */
export function actionIncidentPreview(g: IncidentGame, p: IncidentPlayer, actionId: string) {
    const family = familyFor(actionId);
    if (!family || p.castRedacted)
        return null;
    const month = p.actionIncidents?.month, remaining = month?.round === g.round ? actionIncidentRules.maxPerMonth - month.incidents : actionIncidentRules.maxPerMonth;
    if (remaining <= 0)
        return null;
    const cashAllowed = month?.round !== g.round || month.cashIncidents < actionIncidentRules.maxCashIncidentsPerMonth;
    const drafts = incidentDrafts.filter(d => (!d.actions || d.actions.includes(actionId)) && d.families.includes(family));
    const loss = cashAllowed ? Math.max(0, ...drafts.map(d => -(d.cash ?? 0))) : 0, gain = cashAllowed ? Math.max(0, ...drafts.map(d => d.cash ?? 0)) : 0;
    return { cashLossMax: loss, cashGainMax: gain, notice: `Occasionally, a small surprise can change how this activity feels.${loss ? ` A mishap can also cost up to $${loss}, never taking cash below $0.` : ''}${gain ? ` A small extra or correction may return up to $${gain}.` : ''} It never uses an extra priority block.` };
}
/** Compare the exact acknowledged before/after pair, not the latest polled state. */
export function acceptedActionIncident(before: IncidentPlayer, after: IncidentPlayer, actionId: string): ActionIncidentReceipt | null {
    if (before.id !== after.id || before.castRedacted || after.castRedacted || after.actionIncidents?.version !== 1)
        return null;
    const old = before.actionIncidents?.ordinal ?? 0, state = after.actionIncidents;
    if (state.ordinal !== old + 1)
        return null;
    const receipt = state.receipts.at(-1);
    return receipt && receipt.ordinal === state.ordinal && receipt.actionId === actionId && receipt.incidentId ? structuredClone(receipt) : null;
}
export function actionIncidentMemberPlayers(players: IncidentPlayer[], ownedIds: string[]): Player[] { return players.map(p => { if (ownedIds.includes(p.id))
    return p; const { actionIncidents, ...safe } = p; void actionIncidents; return safe; }); }
