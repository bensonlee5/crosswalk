import {deepenEnsembleOption,ensembleDialogue,preventedWhaleskinDialogue} from './ensemble-dialogue.ts';
import type { Game, GameView, Player } from './game.ts';
import { canonicalCharacterById } from './character-canon.ts';
import { economyPaidQuote, economyProfile, recordEconomyPaidHours } from './economy.ts';
import { recordFinancialPay } from './financial-recovery.ts';
import { regionDefinitions, visiblePlaces } from './world-life.ts';
import { ensembleAftermath, aftermathByStory } from './ensemble-aftermath-content.ts';
import { ensembleById, ensembleStories, ensembleRules, ensembleContinuations } from './ensemble-story-content.ts';
import type { EnsembleActor, EnsembleChoiceView, EnsembleCrossing, EnsembleDefinition, EnsembleEvent, EnsembleOption, EnsemblePlayerState, EnsembleState, EnsembleThread, EnsembleView } from './ensemble-story-types.ts';
export type { EnsembleState, EnsemblePlayerState } from './ensemble-story-types.ts';

type StoryGame = GameView & { ensemble?: EnsembleState };
type StoryPlayer = Player & { ensemble?: EnsemblePlayerState };
type Candidate = { option: EnsembleOption; kind: 'main' | 'response' | 'continuation' | 'personal' | 'refund' | 'aftermath'; actionId: string; crossing?: EnsembleCrossing; orderId?: string; aftermathIndex?: number };
const state = (g: GameView) => (g as StoryGame).ensemble;
const personal = (p: Player) => (p as StoryPlayer).ensemble;
const money = (n: number) => `$${n.toLocaleString('en-US')}`;
const npcActors: Record<string, string> = { 'laundry.invitation': 'qiao_chen', 'six_chairs.tea': 'saffron_ada', 'dalloway.breakfast': 'kit' };
const npcBuyers: Record<string, string> = { broth: 'sefu', late_loaf: 'alder_tess', route_green: 'mesa_june', laundry: 'akira_mori', first_shift: 'saffron_ada', extra_run: 'pelagia_tavi' };
const unique = (values: string[]) => [...new Set(values)];
const rules = [...ensembleRules, ...ensembleContinuations];
const ruleById = Object.fromEntries(rules.map(rule => [rule.id, rule]));

/** Creation/join only. Absence in a saved room is rejected by the current-schema boundary. */
export function initializeEnsemblePlayer(p: Player): void {
  if (!personal(p)) (p as StoryPlayer).ensemble = { version: 1, receipts: [], personal: [] };
}
export function initializeEnsemble(g: Game): void {
  if (!state(g)) (g as StoryGame).ensemble = {
    version: 1, revision: 0, arrivedMonth: 0,
    threads: Object.fromEntries(ensembleStories.map(s => [s.id, { id: s.id, status: 'queued', beat: 0, openedMonth: 0, readyMonth: 1, dueMonth: 2, flags: {}, history: [], ending: '' }])),
    events: [], crossings: [], orders: [],
  };
  for (const p of g.players) initializeEnsemblePlayer(p);
  if (g.status === 'playing') { activate(g); beginEnsembleMonth(g); }
}
function activate(g: Game): void {
  const room = state(g)!;
  const local = new Set(g.players.map(p => p.world?.region ?? 'alder'));
  const priority = (s: EnsembleDefinition) => (['whaleskin', 'dalloway', 'bracken'].includes(s.id) ? 20 : 0) + (local.has(s.region) ? 10 : 0) + Math.min(5, room.crossings.filter(x => x.storyId === s.id && !x.withdrawn).length);
  const visited = new Set(g.players.flatMap(p => Object.entries(p.world?.localeHistory ?? {}).filter(([, history]) => history.arrivals > 0).map(([id]) => id)));
  const queued = ensembleStories.filter(s => visited.has(s.region) && room.threads[s.id].status === 'queued').sort((a, b) => priority(b) - priority(a));
  let capacity = 8 - Object.values(room.threads).filter(t => t.status === 'active').length;
  // New setups start only after an actual arrival, never behind an unopened route.
  const represented = new Set(ensembleStories.filter(s => room.threads[s.id].status === 'active').map(s => s.region));
  const regional = queued.filter(s => { if (represented.has(s.region)) return false; represented.add(s.region); return true; });
  const ordered = [...regional, ...queued.filter(s => !regional.includes(s))];
  for (const s of ordered) {
    if (capacity-- <= 0) break;
    Object.assign(room.threads[s.id], { status: 'active', openedMonth: g.round, readyMonth: g.round, dueMonth: g.round + 1 });
    if (s.id === 'whaleskin') room.threads[s.id].flags.coverOwnedByTavi = true;
    if (s.id === 'dalloway') Object.assign(room.threads[s.id].flags, { juneOwnsBell: true, juneRemainsCook: true });
    if (s.id === 'bracken') Object.assign(room.threads[s.id].flags, { nellOwnsDrumAndDuvet: true, jonahPaidOccupancy: true, ruthOwnsRoom: true });
  }
  // Story destinations are known places, not a second travel/discovery charge.
  for (const p of g.players) {
    if (!p.world) continue;
    for (const s of ensembleStories.filter(s => room.threads[s.id].status === 'active' && s.region === p.world!.region)) {
      const known = p.world.discoveredPlacesByRegion[s.region];
      if (!known.includes(s.place)) { known.push(s.place); p.world.revision++; }
    }
  }
}
function candidates(g: GameView, p: Player | null, s: EnsembleDefinition): Candidate[] {
  const room = state(g)!, t = room.threads[s.id];
  if (!t || t.status === 'queued') return [];
  const result: Candidate[] = [];
  const beat = s.beats[t.beat];
  if (t.status === 'active' && beat && t.readyMonth <= g.round) {
    for (const raw of beat.choices) {
      if ((raw.unless && t.flags[raw.unless]) || (raw.when && !t.flags[raw.when])) continue;
      if (raw.id === 'refund') continue; // Each payer’s ticket is handled separately below.
      const option = preventionCopy(s, t, deepenEnsembleOption(s.id, beat.id, raw));
      result.push({ option, kind: 'main', actionId: `ensemble:${s.id}:main:${option.id}:${t.beat}` });
    }
  }
  for (const crossing of room.crossings.filter(x => x.storyId === s.id && !x.withdrawn && x.expiresMonth >= g.round)) {
    const rule = ruleById[crossing.ruleId];
    if (!rule || (rule.beforeBeat !== undefined && t.beat >= rule.beforeBeat)) continue;
    if (crossing.continuation ? !p || crossing.claimedBy.includes(p.id) : crossing.claimedBy.length > 0) continue;
    if (!crossing.continuation && t.status === 'settled') continue;
    if (crossing.sourceOrderId && !room.orders.some(o => o.id === crossing.sourceOrderId && o.status === 'paid')) continue;
    const option = { ...rule, signals: rule.emit ?? [], set: rule.setTarget };
    result.push({ option, kind: crossing.continuation ? 'continuation' : 'response', crossing, actionId: `ensemble:${s.id}:${crossing.continuation ? 'continuation' : 'response'}:${rule.id}:${t.beat}` });
  }
  if (p && s.id === 'dalloway' && t.beat >= 3) {
    for (const order of room.orders.filter(o => o.storyId === s.id && o.payerId === p.id && o.status === 'paid')) {
      const raw = deepenEnsembleOption(s.id, s.beats[3].id, s.beats[3].choices.find(o => o.id === 'refund')!);
      const actionId = `ensemble:${s.id}:refund:${order.id.replace(':', '_')}:${t.beat}`;
      result.push({ option: { ...raw, label: `Ask for your ${money(order.amount)} unserved supper money back` }, kind: 'refund', actionId, orderId: order.id });
    }
  }
  if (p && t.history.length && !personal(p)?.personal.includes(s.id)) {
    result.push({ option: s.personal, kind: 'personal', actionId: `ensemble:${s.id}:personal:own_part:${t.beat}` });
  }
  if (p && t.status === 'settled') result.push(...aftermathCandidates(g, p, s));
  return result;
}
function aftermathStage(g: GameView, p: Player, s: EnsembleDefinition) {
  const definition = aftermathByStory[s.id], room = state(g)!;
  if (!definition || room.threads[s.id].status !== 'settled') return null;
  const receipts = personal(p)?.receipts.filter(r => r.storyId === s.id && r.actionId.includes(':aftermath:')) ?? [];
  const index = receipts.length, stage = definition.stages[index];
  if (!stage) return null;
  const ending = [...room.events].reverse().find(e => e.storyId === s.id && e.actionId.includes(':main:'));
  if (!ending) return null;
  const opens = Math.min(g.maxRounds, ending.month + [1, 3, 5][index]);
  return { definition, stage, index, opens, previous: receipts.map(r => r.actionId.split(':')[3]) };
}
function aftermathCandidates(g: GameView, p: Player, s: EnsembleDefinition): Candidate[] {
  const phase = aftermathStage(g, p, s);
  if (!phase || phase.opens > g.round) return [];
  // The actual latest relevant public consequence is fixed into the action ID.
  // A changed source requires rereading, rather than silently confirming a new cause.
  const crossing = [...state(g)!.crossings].reverse().find(x => x.storyId === s.id && x.kind === 'aftermath' && !x.withdrawn);
  const source = crossing && state(g)!.events.find(e => e.id === crossing.sourceEventId);
  if (!crossing || !source) return [];
  return phase.stage.choices.filter(option =>
    (!option.afterChoices || option.afterChoices.some(id => phase.previous.includes(id))) &&
    (!option.sourceSignalsAny || option.sourceSignalsAny.some(signal => source.signals.includes(signal))) &&
    (!option.sourceSignalsNone || !option.sourceSignalsNone.some(signal => source.signals.includes(signal)))
  ).map(option => ({ option, kind: 'aftermath' as const, crossing, aftermathIndex: phase.index, actionId: `ensemble:${s.id}:aftermath:${option.id}:${phase.index}.${crossing.id}` }));
}
function preventionCopy(s: EnsembleDefinition, t: EnsembleThread, raw: EnsembleOption): EnsembleOption {
  if (s.id !== 'whaleskin' || !t.flags.prevented || ![1, 2].includes(t.beat)) return raw;
  const option = structuredClone(raw);
  if (t.beat === 1 && raw.id === 'accurate') {
    option.label = 'Read Mara’s routine road check';
    option.outcome = 'Mara signs the routine check. The van keeps moving and Tavi’s vegetables leave on time. Lata says the cover was always useful.';
  }
  if (t.beat === 2) {
    option.label = raw.id === 'context' ? 'Keep the clearance check with Tavi’s notes' : 'Let Mara finish the routine inspection';
    option.outcome = raw.id === 'context' ? 'Tavi files the successful clearance check. Lata points again to the beautifully fitting mirror sleeves. There is no rescue photograph to take.' : 'Mara finishes her ordinary inspection. The cover remains above the drain, exactly where it was checked.';
  }
  option.narration = { personal: option.outcome, public: option.outcome, npc: option.outcome };
  option.response = { ...option.response, speech: 'It was useful all along. I was saying that before the rain. Mara can sign the routine check, Tavi can keep the successful installation note, and I can finish the deliveries without becoming the subject of a rescue photograph.' };
  return option;
}
function mainPacingReason(g: GameView, p: Player, storyId: string): string {
  const limit = g.players.length > 1 ? 2 : 4;
  const used = state(g)!.events.filter(e => e.month === g.round && e.storyId === storyId && e.actor.id === p.id && e.actionId.includes(':main:')).length;
  if (used < limit) return '';
  return g.round < g.maxRounds
    ? `You have played ${limit === 2 ? 'two' : 'four'} main parts in this story this month. Other players can still respond; your next main choice is next month. Personal and crossing choices remain separate.`
    : `You have played ${limit === 2 ? 'two' : 'four'} main parts here in the final month. Other players can still respond before the life ends; your own personal choices remain separate.`;
}
function terms(g: GameView, p: Player, s: EnsembleDefinition, c: Candidate) {
  const hours = c.option.paidHours ?? 0, cost = c.option.cost ?? 0;
  const pay = hours ? economyPaidQuote(p, g, hours * economyProfile(p, s.region).entryRate, hours, cost) : null;
  let reason = g.status !== 'playing' ? 'This life has finished.' : g.players[g.turn]?.id !== p.id ? 'It is another player’s turn.' : p.world?.region !== s.region ? 'Travel to this town first.' : !visiblePlaces(p, g).includes(s.place) ? 'That story venue is not currently open to visit.' : p.place !== s.place ? `Visit ${regionDefinitions[s.region].placeNames[s.place]} first.` : p.hours < c.option.time ? 'There is not enough time this month.' : p.cash < cost ? 'There is not enough cash for this purchase.' : pay?.reason ?? '';
  if (!reason && c.kind === 'main') reason = mainPacingReason(g, p, s.id);
  if (hours && !p.finance) reason = 'This player’s pay account is unavailable.';
  if (!personal(p) || p.castRedacted) reason = 'This player’s private choices are unavailable.';
  return { pay, cost, time: c.option.time, cash: pay?.cash ?? -cost, reason };
}
function choiceView(g: GameView, p: Player, s: EnsembleDefinition, c: Candidate): EnsembleChoiceView {
  const quote = terms(g, p, s, c);
  const event = c.crossing && state(g)!.events.find(e => e.id === c.crossing!.sourceEventId);
  const refund = c.option.id === 'refund' ? state(g)!.orders.find(o => o.id === c.orderId && o.payerId === p.id && o.status === 'paid')?.amount ?? 0 : 0;
  const preview = quote.pay
    ? [`${quote.pay.paidHours} paid hours at ${money(economyProfile(p, s.region).entryRate)}/hour; ${money(quote.pay.gross)} gross, ${money(quote.pay.withholding)} ordinary withholding, ${money(quote.pay.takeHome)} take-home.`, `${money(quote.pay.repayment ?? 0)} recovery repayment; ${money(quote.pay.cost)} materials; ${money(quote.pay.cash)} added to your cash.`]
    : refund ? [`Refund ${money(refund)} to the original payer. Completed workers keep their wages; unaccepted extra offers close.`]
    : [quote.cost ? `${money(quote.cost)} one-time purchase; no renewal or standing order.` : 'No cash cost.'];
  if (c.kind === 'response' || c.kind === 'continuation' || c.kind === 'aftermath') preview.push('This option exists because of the earlier choice shown here.');
  if (c.kind === 'aftermath') preview.push('Your personal account stays private. If you confirm, the public effect below may change another person’s choices; it does not give them your money or permission.', c.option.narration.public.replaceAll('{{actor}}', p.name));
  if (c.kind === 'personal') preview.push('This is your own separate choice. Other players keep their money and time.');
  return { id: c.actionId, actionId: c.actionId, title: c.option.label, body: c.option.paidHours ? 'Take this one paid commitment at the terms below. Future work is a separate decision.' : c.kind === 'personal' ? 'Choose your own part in the day, under the arrangements already made.' : c.option.label, available: !quote.reason, reason: quote.reason, previewText: preview, cost: { time: quote.time, cash: quote.cost, energy: 0 }, primary: c.kind === 'response' || c.kind === 'aftermath', ...(event ? { cause: { crossingId: c.crossing!.id, text: event.text, storyTitle: ensembleById[event.storyId].title, actor: event.actor.name, month: event.month, remote: ensembleById[event.storyId].region !== s.region, regionName: regionDefinitions[ensembleById[event.storyId].region].name } } : {}) };
}
/** Pure reads never mark a player as having seen, understood or accepted a crossing. */
export function getEnsembleView(g: GameView, p: Player, focusId?: string, selectedVenue?: string): EnsembleView {
  if (!state(g) || !personal(p) || p.castRedacted) return { scenes: [], recap: [], elsewhere: 0 };
  const room = state(g)!;
  const eligible = ensembleStories.filter(s => room.threads[s.id].status !== 'queued' && (room.threads[s.id].status === 'active' || candidates(g, p, s).length || s.id === focusId));
  const local = eligible.filter(s => s.region === p.world?.region && (!selectedVenue || s.place === selectedVenue)).sort((a, b) => Number(b.id === focusId) - Number(a.id === focusId) || Number(b.place === p.place) - Number(a.place === p.place) || Number(candidates(g, p, b).some(c => c.crossing)) - Number(candidates(g, p, a).some(c => c.crossing)) || Number(room.threads[b.id].status === 'active') - Number(room.threads[a.id].status === 'active'));
  return { scenes: local.slice(0, 3).map(s => {
    const t = room.threads[s.id], beat = s.beats[t.beat], recent = t.history.slice(-3).map(id => room.events.find(e => e.id === id)!).filter(Boolean);
    const phase = aftermathStage(g, p, s), following = phase && phase.opens <= g.round && aftermathCandidates(g, p, s).length > 0;
    const waiting = t.readyMonth > g.round;
    const dialogue = !waiting && !following && beat ? (s.id === 'whaleskin' && t.flags.prevented ? preventedWhaleskinDialogue[beat.id] : undefined) ?? ensembleDialogue[`${s.id}:${beat.id}`] : undefined;
    let body = waiting ? recent.at(-1)?.text ?? s.trigger : dialogue?.body ?? beat?.prompt ?? t.ending;
    let heading = waiting ? 'The next part takes a little time' : beat?.title ?? 'The next ordinary day';
    if (s.id === 'whaleskin' && t.flags.prevented && !waiting) {
      if (t.beat === 1) { heading = 'The working road'; body = dialogue?.body ?? 'The rain arrives. Water passes the checked outlet and Lata’s van keeps moving. Mara has an ordinary inspection to sign.'; }
      if (t.beat === 2) { heading = 'The sleeve above the drain'; body = dialogue?.body ?? 'The silver sleeve sits above the clear outlet. Tavi has a successful installation note. Lata has a cover that is useful somewhere other than her van.'; }
    }
    if (following) { heading = phase.stage.title; body = phase.stage.prompt; }
    const next = t.status === 'settled' ? following ? 'There is another part for you to decide. Your earlier choices still matter.' : phase && phase.opens > g.round ? `Your next consequence can be picked up in month ${phase.opens}; the public outcome stays in place.` : phase ? `There may be more to say after the day at ${regionDefinitions[s.region].placeNames[ensembleById[phase.definition.sourceStoryId].place]}. Your earlier choices still stand.` : 'That part of your day is settled. Other people still have their own decisions.' : mainPacingReason(g, p, s.id) || (waiting ? `The story continues in month ${t.readyMonth}. Other choices here remain yours.` : g.round === g.maxRounds ? 'This is the final month. Any remaining choices must fit before everyone finishes; the story will not restart.' : 'The next scene takes another part of this representative month. When everyone ends the month, the neighbors choose any unanswered next step.');
    return { id: s.id, title: s.title, heading, body, ...(dialogue ? {opening:dialogue.opening,clarification:dialogue.clarification} : {}), region: s.region, place: s.place, placeName: regionDefinitions[s.region].placeNames[s.place], people: s.cast.map(id => ({ id, name: canonicalCharacterById[id]?.name ?? id })), speaker: { id: s.cast[0], name: canonicalCharacterById[s.cast[0]]?.name ?? s.cast[0], mode: 'local' as const, reason: s.id === 'bracken' ? 'Nell is visiting Ruth’s Alder room for this story. Other named participants may be elsewhere.' : 'The lead counterpart is at this authored local scene. The cast list is context, not a list of people present.' }, objectId: s.object, choices: candidates(g, p, s).map(c => choiceView(g, p, s, c)), status: t.status as 'active' | 'settled', next, events: recent };
  }), recap: [...personal(p)!.receipts].reverse(), elsewhere: eligible.length - local.length };
}

/** The active server player is the only wallet or work schedule an action may change. */
export function resolveEnsembleChoice(g: Game, p: Player, actionId: string): void {
  if (!state(g) || !personal(p)) throw Error('Missing current story state.');
  if (g.status !== 'playing' || g.players[g.turn] !== p || p.castRedacted) throw Error('Only the active player can make this choice.');
  if (personal(p)!.receipts.some(r => r.actionId === actionId)) return;
  const parts = actionId.split(':');
  if (parts.length !== 5 || parts[0] !== 'ensemble') throw Error('Unknown story choice.');
  const s = ensembleById[parts[1]], t = s && state(g)!.threads[s.id];
  if (!s || !t || (parts[2] !== 'aftermath' && String(t.beat) !== parts[4])) throw Error('That moment has passed. Read the current situation.');
  const candidate = candidates(g, p, s).find(c => c.actionId === actionId);
  if (!candidate) throw Error('That choice is no longer available.');
  const quote = terms(g, p, s, candidate);
  if (quote.reason) throw Error(quote.reason);
  // Everything above is read-only. All ownership, timing, funds and workload checks precede mutation.
  const room = state(g)!, id = `ensemble-${room.events.length + 1}`;
  if (quote.pay) {
    recordEconomyPaidHours(p, g, quote.pay.paidHours);
    recordFinancialPay(g, p, `${p.id}:${actionId}`, quote.pay.takeHome, quote.cost);
  }
  p.cash += quote.cash; p.hours -= quote.time;
  if (quote.time) p.joy = Math.min(100, p.joy + 4);
  const actor: EnsembleActor = { kind: 'player', id: p.id, name: p.name };
  const event = applyChoice(g, s, candidate, actor, id);
  personal(p)!.receipts.push({ id: `${p.id}:${actionId}`, actionId, eventId: id, week: g.round, storyId: s.id, title: candidate.option.label, body: event.personal, outcome: event.personal, cash: quote.cash + event.refund, hours: -quote.time, paidHours: quote.pay?.paidHours ?? 0, repayment: quote.pay?.repayment ?? 0, response: { ...candidate.option.response }, ...(s.id === 'last_crossing' && candidate.kind === 'personal' ? { soundCue: 'sip' as const } : {}), ...(candidate.crossing ? { crossingId: candidate.crossing.id } : {}) });
  if (candidate.kind === 'personal') personal(p)!.personal.push(s.id);
  g.log.unshift(`${p.name}: ${candidate.kind === 'aftermath' ? aftermathByStory[s.id].stages[candidate.aftermathIndex!].title : candidate.option.label}.`); g.log = g.log.slice(0, 32);
  activate(g);
}
function applyChoice(g: Game, s: EnsembleDefinition, c: Candidate, actor: EnsembleActor, id: string): { personal: string; refund: number } {
  const room = state(g)!, t = room.threads[s.id], option = c.option;
  const provenance = unique([...(actor.kind === 'player' ? [actor.id] : []), ...(c.crossing?.originPlayers ?? [])]);
  if (c.kind !== 'personal' && c.kind !== 'refund' && c.kind !== 'aftermath') Object.assign(t.flags, option.set ?? {});
  if (s.id === 'whaleskin' && c.kind === 'main' && t.beat === 1) { t.flags.blockedRunoff = !t.flags.prevented; t.flags.inspectionConfirmed = true; }
  if (s.id === 'whaleskin' && c.kind === 'main' && t.beat >= 2) t.flags.roadSafe = true;
  if (s.id === 'bracken' && c.kind === 'main' && t.beat === 1) { t.flags.drumAtRehearsal = option.id === 'rehearse'; t.flags.drumOnwardTravel = option.id === 'travel'; t.flags.separateLodging = true; }
  if (s.id === 'dalloway' && option.signals.includes('diner_cover')) t.flags.juneTwoStationEvenings = true;
  let text = (actor.kind === 'npc' ? option.narration.npc : option.narration.public).replaceAll('{{actor}}', actor.name);
  let personalText = option.narration.personal, refund = 0;
  const supper = s.id === 'dalloway' && (c.kind === 'main' && option.id === 'book' || c.kind === 'personal' || c.kind === 'continuation');
  if (supper && option.cost) room.orders.push({ id: `supper:${id}`, storyId: s.id, payerId: actor.id, amount: option.cost, status: t.status === 'settled' || t.beat >= 4 ? 'served' : 'paid', absorbedWages: 0 });
  if (supper && (t.status === 'settled' || t.beat >= 4)) { personalText += ' The kitchen serves this new meal at the agreed collection.'; text += ' The kitchen serves this new meal at the agreed collection.'; }
  if (s.id === 'dalloway' && option.id === 'refund' && actor.kind === 'player') {
    const order = room.orders.find(o => o.id === c.orderId && o.payerId === actor.id && o.status === 'paid');
    if (!order) throw Error('There is no unserved supper payment to refund.');
    refund = order.amount; order.status = 'refunded';
    const owner = g.players.find(p => p.id === actor.id)!; owner.cash += refund;
    for (const x of room.crossings.filter(x => x.sourceOrderId === order.id && !x.claimedBy.length)) x.withdrawn = true;
    text = `June returns ${actor.name}’s supper payment. The bell rings for somebody else’s eggs.`;
    personalText = `June slides ${money(refund)} back across the counter. The bell rings for somebody else’s eggs.`;
  }
  if (s.id === 'dalloway' && c.kind === 'main' && ['cover', 'smaller'].includes(option.id)) {
    for (const order of room.orders.filter(o => o.storyId === s.id && o.status === 'paid')) order.status = 'served';
  }
  if (option.paidHours && c.crossing?.sourceOrderId) {
    const order = room.orders.find(o => o.id === c.crossing!.sourceOrderId);
    if (order) order.absorbedWages += option.paidHours * economyProfile(g.players[0], s.region).entryRate;
  }
  const publicActionId = c.kind === 'aftermath' ? `ensemble:${s.id}:aftermath:public:${c.aftermathIndex}` : c.actionId;
  const publicTitle = c.kind === 'aftermath' ? aftermathByStory[s.id].stages[c.aftermathIndex!].title : actor.kind === 'npc' ? option.npcLabel ?? option.label : option.label;
  const event: EnsembleEvent = { id, month: g.round, storyId: s.id, beat: t.beat, actionId: publicActionId, actor, title: publicTitle, text, signals: option.signals, originPlayers: provenance, parentCrossingIds: c.crossing ? [c.crossing.id] : [] };
  room.events.push(event); t.history.push(id);
  if (c.crossing && !c.crossing.claimedBy.includes(actor.id)) c.crossing.claimedBy.push(actor.id);
  if (c.kind === 'main') {
    t.beat++; t.readyMonth = g.round; t.dueMonth = g.round + 1;
    if (t.beat >= s.beats.length) { t.status = 'settled'; t.ending = text; }
  }
  for (const rule of rules) {
    if (rule.to === s.id || rule.from && rule.from !== s.id || !rule.signals.some(signal => option.signals.includes(signal))) continue;
    const target = room.threads[rule.to], continuation = ensembleContinuations.includes(rule);
    if (!continuation && (target.status === 'settled' || rule.beforeBeat !== undefined && target.beat >= rule.beforeBeat)) continue;
    if (room.crossings.some(x => x.ruleId === rule.id)) continue;
    const sourceOrder = ['supper_jobs', 'supper_crate'].includes(rule.id) ? room.orders.find(o => o.id === `supper:${id}`) : undefined;
    if (['supper_jobs', 'supper_crate'].includes(rule.id) && !sourceOrder) continue;
    room.crossings.push({ id: `crossing-${room.crossings.length + 1}`, ruleId: rule.id, sourceEventId: id, sourceStoryId: s.id, storyId: rule.to, kind: rule.kind, month: g.round, expiresMonth: continuation ? g.maxRounds : Math.min(g.maxRounds, g.round + 2), originPlayers: provenance, claimedBy: [], continuation, ...(sourceOrder ? { sourceOrderId: sourceOrder.id } : {}) });
  }
  // Finite per-seat aftermath has its own personal decisions, not extra claims
  // on a paid source order, a job or an already-consumed object.
  if (c.kind !== 'personal' && c.kind !== 'refund') for (const definition of ensembleAftermath) {
    if (definition.sourceStoryId !== s.id || !option.signals.some(signal => definition.sourceSignals.includes(signal))) continue;
    room.crossings.push({ id: `crossing-${room.crossings.length + 1}`, ruleId: `aftermath_${definition.storyId}`, sourceEventId: id, sourceStoryId: s.id, storyId: definition.storyId, kind: 'aftermath', month: g.round, expiresMonth: g.maxRounds, originPlayers: provenance, claimedBy: [], continuation: true });
  }
  room.revision++;
  return { personal: personalText, refund };
}
/** One motivated NPC choice per unanswered active thread/month, never a player receipt.
 * A finite response may be taken first; it cannot start an unbounded chain of replies. */
export function beginEnsembleMonth(g: Game): void {
  const room = state(g);
  if (!room || g.status !== 'playing' || room.arrivedMonth >= g.round) return;
  activate(g);
  const due = ensembleStories.filter(s => room.threads[s.id].status === 'active' && room.threads[s.id].dueMonth <= g.round && room.threads[s.id].openedMonth < g.round);
  for (const s of due) {
    const t = room.threads[s.id];
    const options = candidates(g, null, s), b = s.beats[t.beat];
    const chosen = options.find(c => c.kind === 'main' && c.option.style === b?.npc) ?? options.find(c => c.kind === 'main');
    if (!chosen) continue;
    const actorId = npcActors[`${s.id}.${b.id}`] ?? npcBuyers[s.id] ?? s.cast[0];
    applyChoice(g, s, chosen, { kind: 'npc', id: actorId, name: canonicalCharacterById[actorId]?.name ?? actorId }, `ensemble-${room.events.length + 1}`);
    // NPC action has used last month's unanswered scene; this month's next choice is now available.
    if (t.status === 'active') { t.readyMonth = g.round; t.dueMonth = g.round + 1; }
  }
  room.arrivedMonth = g.round; room.revision++; activate(g);
}
export function ensembleMemberPlayers(players: Player[], ownedIds: string[]): Player[] {
  return players.map(p => {
    if (ownedIds.includes(p.id)) return p;
    const { ensemble, world, life, story: personalStory, aspiration, aspirationWeek, economyWork, economyHabits, regionalLifeUsage, weatherUsage, ...safe } = p as StoryPlayer;
    void ensemble; void life; void personalStory; void aspiration; void aspirationWeek; void economyWork; void economyHabits; void regionalLifeUsage; void weatherUsage;
    if (!world) return { ...safe, castRedacted: true };
    const { story, ...publicWorld } = world; void story;
    const localeHistory = structuredClone(world.localeHistory);
    for (const history of Object.values(localeHistory)) {
      delete history.lastAction;
      history.actions = 0;
      history.completedOpportunities = [];
      history.departures = history.departures.map(departure => {
        const { lastAction, ...visit } = departure; void lastAction;
        return { ...visit, actions: 0, bonds: {} };
      });
    }
    // World bookkeeping is actor-private too: it must not provide a second
    // serialized path to a removed choice, receipt or personal progression.
    return { ...safe, castRedacted: true, world: { ...publicWorld,
      actionCounts: {}, acceptedChoices: [], journal: [], localeHistory,
      localBonds: {}, localTalkWeeks: {}, companionBond: 0, companionStatus: 'unmet' as const,
    } };
  });
}
/** The room exposes only public actions. Other players’ payment amounts stay private. */
export function ensembleMemberState(g: GameView, ownedIds: string[]): EnsembleState | undefined {
  const room = state(g); if (!room) return undefined;
  return { ...room, orders: room.orders.map(o => ownedIds.includes(o.payerId) ? o : { ...o, amount: 0, absorbedWages: 0 }) };
}

/** Captured before mutation for shared familiarity and faithful confirmed audio. */
export function ensembleActionMetadata(g: GameView, p: Player, actionId: string) {
  if (!state(g) || !personal(p)) return null;
  const id = actionId.split(':')[1], story = ensembleById[id];
  if (!story) return null;
  const option = candidates(g, p, story).find(c => c.actionId === actionId);
  if (!option) return null;
  return { actorId: option.option.response.speakerId, storyId: id, place: story.place, region: story.region, objectId: story.object, kind: option.kind, paidHours: option.option.paidHours ?? 0, ...(option.option.workField ? { workField: option.option.workField } : {}), ...(id === 'last_crossing' && option.kind === 'personal' ? { soundCue: 'sip' as const } : {}) };
}

/** Reveals only live local destinations after ordinary travel has really completed. */
export function afterEnsembleAction(g: Game): void { if (state(g) && g.status === 'playing') activate(g); }
