import { eligibleCareerConversation, careerNoticeSpeech } from './career-evidence.ts';
import type { Game, Player } from './game.ts';
import { weatherEffect, consumeWeather } from './weather.ts';
import { careerTracks, careerCourses, careerPostings, careerLeads, type CareerField, type CareerRoleDefinition, type CareerPostingDefinition } from './career-content.ts';
import { economyProfile, economyQuote, economyRegionalWorkQuote, economyWorkReason, recordEconomyPaidHours, formatEconomyMoney, monthlyBills } from './economy.ts';
import { regionDefinitions, visiblePlaces, worldPlaceName, worldView, worldChoices, afterCareerWorldWork, afterWorldAction, type RegionId } from './world-life.ts';
import { financialPayQuote, recordFinancialPay, financialRestriction } from './financial-recovery.ts';
import { acknowledgeCareerReceipt } from './career-acknowledgments.ts';
import { venuePeople } from './venue-scene.ts';
import { canonicalCharacterById } from './character-canon.ts';


export type CareerExperience = {
    paidHours: number;
    commitments: number;
    months: number[];
};
export type CareerLead = {
    id: string;
    receivedRound: number;
    referenceRound?: number;
    routePinnedRound?: number;
};
export type CareerContract = {
    id: string;
    target: string;
    region: RegionId;
    place: string;
    field: CareerField;
    title: string;
    kind: 'main' | 'fixed';
    acceptedRound: number;
    active: boolean;
    completedRound?: number;
    endedRound?: number;
};
export type CareerOffer = {
    id: string;
    target: string;
    region: RegionId;
    place: string;
    field: CareerField;
    title: string;
    kind: 'main' | 'fixed';
    round: number;
    accepted?: boolean;
    declined?: boolean;
};
export type CareerReceipt = {
    id: string;
    verb: string;
    target: string;
    round: number;
    region: RegionId;
    place: string;
    title: string;
    outcome: string;
    cash: number;
    time: number;
    paidHours: number;
    gross?: number;
    takeHome?: number;
    cost?: number;
    repayment?: number;
    actorId?: string;
    speech?: string;
    offerId?: string;
    activity?: string;
    familiarity?: {
        key: string;
        count: number;
        stage: 'first' | 'familiar' | 'routine' | 'custom';
        lastVariant: number;
    };
    milestones: string[];
};
export type CareerNotice = {
    id: string;
    actionId: string;
    actorId: string;
    round: number;
    kind: 'lead' | 'reference';
    leadId: string;
    region: RegionId;
    place: string;
    employer: string;
    regionName: string;
    speech: string;
};
export type CareerState = {
    version: 1;
    revision: number;
    experience: Partial<Record<CareerField, CareerExperience>>;
    training: Record<string, {
        round: number;
        courseId: string;
    }>;
    leads: Record<string, CareerLead>;
    offers: Record<string, CareerOffer>;
    contracts: CareerContract[];
    receipts: CareerReceipt[];
    colleagues: Record<string, {
        field: CareerField;
        months: number[];
        fields?: Partial<Record<CareerField, number[]>>;
    }>;
    notices?: CareerNotice[];
    milestones: string[];
};
export type CareerPlayer = Player & {
    career?: CareerState;
    careerPublic?: {
        role: string;
        place: string;
        region: RegionId;
    }[];
};
export type CareerGame = Game;
export type CareerChoice = {
    id: string;
    verb: string;
    target: string;
    title: string;
    body: string;
    place: string;
    region: RegionId;
    field?: CareerField;
    time: number;
    cost: number;
    cash: number;
    gross?: number;
    takeHome?: number;
    repayment?: number;
    paidHours: number;
    energy: number;
    weatherActivity?: {
        id: string;
        energy: number;
    };
    weatherJoy?: number;
    weatherSummary?: string;
    commute?: CareerCommute;
    jobPay?: {
        gross: number;
        takeHome: number;
        cash: number;
        cost: number;
        repayment: number;
        paidHours: number;
        time: number;
    };
    available: boolean;
    reason: string;
    requirements: string[];
    qualification: 'ready' | 'not-yet';
    actorId?: string;
    replaces?: string;
};
export type CareerCommute = {
    home: RegionId;
    employer: RegionId;
    fares: number;
    travelBlocks: number;
    regularCash: number;
    bills: number;
    remainingAfterBills: number;
    restBlocks: number;
    totalBlocks: number;
    warning: string;
};
type Job = {
    target: string;
    title: string;
    place: string;
    field: CareerField;
    kind: 'main' | 'fixed' | 'independent';
    experience: number;
    training: 'none' | 'foundation' | 'advanced';
    description: string;
    role?: CareerRoleDefinition;
    posting?: CareerPostingDefinition;
    regional?: boolean;
    actorId?: string;
};
const money = (n: number) => formatEconomyMoney(n);
const region = (p: Player): RegionId => p.world?.region ?? 'alder';
const venue = (p: Player, g: Game, place: string) => worldPlaceName(p, place, g);
const state = (p: Player) => (p as CareerPlayer).career;


/** Initialize the current career record when creating or joining a lobby. */
export function initializeCareerPlayer(g: Game, p: Player) { if (g.status !== 'lobby' || state(p))
    return; (p as CareerPlayer).career = { version: 1, revision: 0, experience: {}, training: {}, leads: {}, offers: {}, contracts: [], receipts: [], colleagues: {}, notices: [], milestones: [] }; }
const fieldExperience = (p: Player, field: CareerField) => state(p)?.experience[field]?.paidHours ?? 0;
const prepared = (p: Player, field: CareerField, level: string) => !!state(p)?.training[`${field}:${level}`];
const references = (p: Player, field: CareerField) => careerLeads.filter(l => l.field === field && state(p)?.leads[l.id]?.referenceRound !== undefined);
export function careerExperienceLabel(p: Player, field: CareerField) { const hours = fieldExperience(p, field); return hours === 0 ? 'New to the field' : hours < 120 ? 'A first paid foothold' : hours < 360 ? 'Practiced in the work' : hours < 480 ? 'Trusted with responsibility' : 'Extensive practical experience'; }
function contact(p: Player, g: Game, id?: string, present?: Set<string>) { if (!id)
    return undefined; return (present ?? new Set(venuePeople(g, p, p.place).filter(person => !person.remote && person.canTalk).map(person => person.id))).has(id) ? id : undefined; }
function regionalJob(p: Player, g: Game): Job | undefined {
    const view = worldView(p, g), op = view?.regionalOpportunity;
    if (!op)
        return;
    const mapping: Record<RegionId, {
        place: string;
        field: CareerField;
        actorId: string;
    }> = { alder: { place: 'TRANSIT', field: 'service', actorId: 'alder_tess' }, saffron: { place: 'MARKET', field: 'service', actorId: 'saffron_leila' }, glasssteppe: { place: 'MAKERSPACE', field: 'practical', actorId: 'glass_sora' }, pelagia: { place: 'TRANSIT', field: 'civic', actorId: 'pelagia_mara' }, embermesa: { place: 'CORNER CAFÉ', field: 'service', actorId: 'mesa_june' } };
    return { target: 'r.local', title: op.workTitle, description: op.workBody, kind: 'fixed', experience: 0, training: 'none', regional: true, ...mapping[region(p)] };
}
function job(p: Player, g: Game, target: string): Job | undefined {
    const [kind, field, roleId] = target.split('.');
    if (kind === 't') {
        const track = careerTracks.find(t => t.id === field), role = track?.roles.find(r => r.id === roleId);
        return track && role ? { target, title: role.title, place: track.place, field: track.id, kind: 'main', experience: role.experience, training: role.training, description: role.description, role, actorId: track.contacts[region(p)] } : undefined;
    }
    if (kind === 'p') {
        const posting = careerPostings.find(v => v.id === field), contacts: Record<string, Partial<Record<RegionId, string>>> = { 'archive-assistant': { pelagia: 'pelagia_esme', embermesa: 'mesa_inez' }, 'market-stall': { saffron: 'saffron_leila' }, courier: { alder: 'alder_tess' }, 'bicycle-repair': { glasssteppe: 'glass_sora', pelagia: 'pelagia_mara' } };
        return posting ? { target, title: posting.title, place: posting.place, field: posting.field, kind: posting.kind, experience: posting.experience, training: posting.training, description: posting.description, posting, actorId: contacts[posting.id]?.[region(p)] } : undefined;
    }
    if (target === 'r.local')
        return regionalJob(p, g);
    return undefined;
}
function qualification(p: Player, j: Job): string[] {
    const missing: string[] = [], hours = fieldExperience(p, j.field), ref = references(p, j.field).length > 0;
    if (hours < j.experience)
        missing.push(j.experience <= 120 ? 'Complete relevant entry work first; a regular paid month is enough.' : 'Build sustained experience in this field: two regular months plus a short commitment is one route.');
    if (j.training === 'foundation' && !prepared(p, j.field, 'foundation') && !(j.field !== 'practical' && ref && hours >= 160))
        missing.push(j.field === 'practical' ? 'Complete practical foundations at Campus or the Library; supervised work is also required.' : 'Complete this field’s foundation class or free library study. An earned reference plus a regular month of relevant work is another route.');
    if (j.role && j.training === 'advanced') {
        const track = careerTracks.find(t => t.id === j.field)!, skilled = track.roles[1].id, contracts = state(p)?.contracts.filter(c => c.field === j.field && c.target === `t.${j.field}.${skilled}`) ?? [];
        if (!state(p)?.receipts.some(r => r.verb === 'work' && r.paidHours > 0 && contracts.some(c => r.target.startsWith(c.id + '.'))))
            missing.push('First complete paid work in the skilled role; leading is a responsibility to practice, not only a course to finish.');
    }
    if (j.training === 'advanced' && !prepared(p, j.field, 'advanced') && !(ref && hours >= 480))
        missing.push('Complete this field’s advanced preparation, or build extensive relevant experience and earn a professional reference.');
    if (j.posting?.id === 'referral-project' && !ref)
        missing.push('Earn a professional reference from someone who has actually worked with you.');
    return missing;
}
function requirementLabels(j: Job): string[] { return j.experience === 0 && j.training === 'none' ? ['Open entry role · no earlier job or contact required'] : [...(j.experience ? [j.experience <= 120 ? 'Relevant paid-work experience' : 'Sustained relevant experience'] : []), ...(j.training !== 'none' ? [`${j.training === 'foundation' ? 'Foundation' : 'Advanced'} preparation or the stated workplace route`] : [])]; }
function baseReason(g: Game, p: Player, place: string, time: number, cost: number, energy: number, regionId = region(p)) {
    if (!state(p))
        return 'Missing career state.';
    if (p.castRedacted)
        return 'This player’s work plans are private.';
    if (g.status !== 'playing')
        return 'The game is not running.';
    if (g.players[g.turn] !== p)
        return 'Wait for your turn.';
    if (region(p) !== regionId)
        return `Visit ${regionDefinitions[regionId].name} first.`;
    if (!visiblePlaces(p, g).includes(place))
        return `Discover ${venue(p, g, place)} before applying or working there.`;
    if (p.place !== place)
        return `Visit ${venue(p, g, place)} first.`;
    if (p.hours < time)
        return `Needs ${time} priority block${time === 1 ? '' : 's'}; you have ${p.hours} left.`;
    if (cost > 0 && p.cash < cost)
        return `Needs ${money(cost)} upfront; you have ${money(Math.max(0, p.cash))}.`;
    if (p.energy < energy)
        return 'Rest before taking this commitment on.';
    return '';
}
function id(g: Game, p: Player, verb: string, target: string) { return `career:${g.round}:${state(p)!.revision}:${verb}:${target}`; }
function makeChoice(g: Game, p: Player, options: Omit<CareerChoice, 'id' | 'available' | 'reason' | 'region' | 'requirements' | 'qualification'> & {
    reason?: string;
    requirements?: string[];
    qualification?: CareerChoice['qualification'];
    region?: RegionId;
}): CareerChoice {
    const regionId = options.region ?? region(p), why = options.reason || (options.verb === 'train' ? financialRestriction(g, p, 'tuition', options.cost) : '') || baseReason(g, p, options.place, options.time, options.cost, options.energy, regionId);
    return { ...options, id: id(g, p, options.verb, options.target), region: regionId, available: !why, reason: why, requirements: options.requirements ?? [], qualification: options.qualification ?? 'ready' };
}
/** A real round trip, using the same travel proposals as the map. It is a
 * budget comparison, never an automatic journey or relocation commitment. */
export function careerTravelTerms(g: Game, p: Player, employer: RegionId) { const home = p.world?.story?.homeRegion ?? 'alder'; if (home === employer)
    return { home, employer, fares: 0, travelBlocks: 0 }; let fares = 0, travelBlocks = 0; for (const [from, to] of [[home, employer], [employer, home]] as const) {
    const traveller = { ...p, world: p.world ? { ...p.world, region: from } : undefined }, c = worldChoices(traveller, g).find(c => c.key === `travel:${to}`);
    if (!c)
        return null;
    fares += c.cost;
    travelBlocks += c.time;
} return { home, employer, fares, travelBlocks }; }
export function careerCommuteQuote(g: Game, p: Player, employer: RegionId, regularCash: number, travel = careerTravelTerms(g, p, employer)): CareerCommute | undefined { if (!travel || travel.home === employer)
    return; const bills = monthlyBills(p).total, remainingAfterBills = regularCash - bills - travel.fares, restBlocks = 1, totalBlocks = 2 + travel.travelBlocks + restBlocks + (p.finance?.recovering ? 1 : 0); return { ...travel, regularCash, bills, remainingAfterBills, restBlocks, totalBlocks, warning: `Your home is in ${regionDefinitions[travel.home].name}. A regular work month with an outbound and return trip costs ${money(travel.fares)} in fares and ${travel.travelBlocks} travel blocks, in addition to 2 work blocks. With one free rest block${p.finance?.recovering ? ' and recovery administration' : ''}, that is ${totalBlocks} of 6 blocks. ${money(regularCash)} net pay minus ${money(bills)} home bills and fares ${remainingAfterBills < 0 ? `falls short by ${money(remainingAfterBills)}` : `leaves ${money(remainingAfterBills)}`}. Applications take an additional block and may need a separate month. Home-town entry roles avoid the round-trip fares; travel and relocation are always separate choices.` }; }
function application(g: Game, p: Player, j: Job, present: Set<string>, travel = careerTravelTerms(g, p, region(p))): CareerChoice {
    const q = workQuote(p, g, j), jobPay = { gross: q.gross, takeHome: q.takeHome, cash: q.cash, cost: q.cost, repayment: q.repayment, paidHours: q.paidHours, time: q.time }, commute = j.role ? careerCommuteQuote(g, p, region(p), q.cash, travel) : undefined, s = state(p)!, requirements = qualification(p, j), existing = s.contracts.some(c => c.active && c.target === j.target && c.region === region(p) && (!c.completedRound || c.kind === 'main'));
    const applied = s.receipts.some(r => r.verb === 'apply' && r.target === j.target && r.region === region(p) && r.round === g.round);
    const actorId = contact(p, g, j.actorId, present), reason = existing ? 'You already hold this role here. Open your employee shifts.' : applied ? 'You already applied for this role this month. Review the response or prepare for another month.' : '';
    return makeChoice(g, p, { verb: 'apply', target: j.target, title: `Apply: ${j.title}`, body: `Apply at ${venue(p, g, j.place)}. ${j.description} The application takes 1 priority block and costs $0; it pays nothing. The proposed commitment is ${q.paidHours} paid hours over ${q.time} blocks: ${money(q.gross)} gross, ${money(q.takeHome)} take-home${q.repayment ? `, ${money(q.repayment)} repays arrears` : ""}${q.cost ? `, ${money(q.cost)} upfront materials` : ""}, ${money(q.cash)} added to cash only after you separately choose the work. ${requirements.length ? 'Expected response: not yet qualified. Review the listed next steps before spending time.' : 'You meet the stated requirements. An offer still needs your separate acceptance.'}${commute ? ' ' + commute.warning : ''}`, commute, jobPay, place: j.place, field: j.field, time: 1, cost: 0, cash: 0, paidHours: 0, energy: 0, reason, requirements: [...requirementLabels(j), ...requirements], qualification: requirements.length ? 'not-yet' : 'ready', ...(actorId ? { actorId } : {}) });
}
function workQuote(p: Player, g: Game, j: Job, kind: 'regular' | 'short' | 'demanding' = 'regular', workRegion = region(p)) {
    if (j.role) {
        const paidHours = { regular: 160, short: 40, demanding: 200 }[kind], time = { regular: 2, short: 1, demanding: 3 }[kind], rate = j.role.rate + economyProfile(p, workRegion).entryRate - 24, gross = rate * paidHours, takeHome = Math.round(gross * .8);
        return { gross, ...financialPayQuote(g, p, takeHome), paidHours, time, energy: { regular: 12, short: 8, demanding: 26 }[kind], weatherActivity: undefined, weatherJoy: 0, weatherSummary: '' };
    }
    if (j.regional) {
        const q = economyRegionalWorkQuote(p, g, { region: workRegion, kind: 'regular', residentBonus: p.world?.story?.homeRegion === workRegion });
        return { ...q, ...financialPayQuote(g, p, q.takeHome, q.cost), time: 2, energy: 12, weatherActivity: undefined, weatherJoy: 0, weatherSummary: '' };
    }
    const a = j.posting!, q = economyQuote(p, { id: a.activityId, time: a.time, cost: 0 }, g), weatherActivity = { id: a.activityId, energy: a.energy }, weather = weatherEffect(p, weatherActivity, g);
    return { ...q, ...financialPayQuote(g, p, q.takeHome, q.cost), time: a.time, energy: weather.requiredEnergy, weatherActivity, weatherJoy: weather.joy, weatherSummary: weather.storySummary };
}
function workChoice(g: Game, p: Player, c: CareerContract, kind: 'regular' | 'short' | 'demanding', present: Set<string>): CareerChoice | undefined {
    if (!c.active)
        return;
    const employerPlayer = c.region === region(p) ? p : { ...p, world: p.world ? { ...p.world, region: c.region } : undefined };
    const j = job(employerPlayer, g, c.target);
    if (!j)
        return;
    const q = workQuote(p, g, j, kind, c.region), name = j.kind === 'main' ? ({ regular: 'Regular month', short: 'Short commitment', demanding: 'Demanding month' }[kind]) : 'Complete the agreed work';
    const reason = c.region !== region(p) ? `Return to ${regionDefinitions[c.region].name} to work this contract.` : c.kind === 'fixed' && (c.completedRound || c.acceptedRound !== g.round) ? 'This short-term agreement is complete or has expired.' : economyWorkReason(p, g, q.paidHours);
    return makeChoice(g, p, { verb: 'work', target: `${c.id}.${kind}`, title: `${name}: ${c.title}`, body: `Work at ${venue(employerPlayer, g, c.place)}. ${q.paidHours} paid hours, ${q.time} priority blocks. ${money(q.gross)} gross; ${money(q.takeHome)} take-home${q.repayment ? `; ${money(q.repayment)} repays arrears` : ''}${q.cost ? `; ${money(q.cost)} upfront materials` : ''}; ${money(q.cash)} reaches your cash balance. The commitment builds ${careerTracks.find(t => t.id === c.field)!.name.toLowerCase()} experience. ${q.weatherSummary}`, place: c.place, region: c.region, field: c.field, time: q.time, cost: q.cost, cash: q.cash, gross: q.gross, takeHome: q.takeHome, repayment: q.repayment, paidHours: q.paidHours, energy: q.energy, weatherActivity: q.weatherActivity, weatherJoy: q.weatherJoy, weatherSummary: q.weatherSummary, reason, ...(c.region === region(p) && contact(p, g, j.actorId, present) ? { actorId: contact(p, g, j.actorId, present) } : {}) });
}
export function careerChoices(g: Game, p: Player): CareerChoice[] {
    if (!state(p) || p.castRedacted)
        return [];
    const s = state(p)!, choices: CareerChoice[] = [], present = new Set(venuePeople(g, p, p.place).filter(person => !person.remote && person.canTalk).map(person => person.id)), travel = careerTravelTerms(g, p, region(p));
    for (const track of careerTracks)
        for (const role of track.roles)
            choices.push(application(g, p, job(p, g, `t.${track.id}.${role.id}`)!, present, travel));
    for (const posting of careerPostings) {
        const j = job(p, g, `p.${posting.id}`)!;
        if (posting.kind === 'fixed')
            choices.push(application(g, p, j, present, travel));
        else {
            const q = workQuote(p, g, j), missing = qualification(p, j);
            choices.push(makeChoice(g, p, { verb: 'commission', target: j.target, title: `Accept: ${j.title}`, body: `${j.description} ${q.paidHours} paid hours and ${q.time} priority blocks. ${money(q.takeHome)} take-home; ${money(q.cost)} upfront${q.repayment ? `; ${money(q.repayment)} repays arrears` : ''}; ${money(q.cash)} reaches your cash balance. This single commitment is independent work. ${q.weatherSummary}`, place: j.place, field: j.field, time: q.time, cost: q.cost, cash: q.cash, gross: q.gross, takeHome: q.takeHome, repayment: q.repayment, paidHours: q.paidHours, energy: q.energy, weatherActivity: q.weatherActivity, weatherJoy: q.weatherJoy, weatherSummary: q.weatherSummary, reason: missing[0] || economyWorkReason(p, g, q.paidHours), requirements: [...requirementLabels(j), ...missing], qualification: missing.length ? 'not-yet' : 'ready' }));
        }
    }
    const local = regionalJob(p, g);
    if (local)
        choices.push(application(g, p, local, present, travel));
    for (const offer of Object.values(s.offers).filter(o => !o.accepted && !o.declined)) {
        const old = s.contracts.find(c => c.active && c.kind === 'main'), j = job(p, g, offer.target), missing = j ? qualification(p, j) : ['This opening is no longer available.'];
        const q = j ? workQuote(p, g, j, 'regular', offer.region) : undefined, jobPay = q ? { gross: q.gross, takeHome: q.takeHome, cash: q.cash, cost: q.cost, repayment: q.repayment, paidHours: q.paidHours, time: q.time } : undefined, commute = j?.role && q ? careerCommuteQuote(g, p, offer.region, q.cash) : undefined;
        const reason = offer.round + 1 < g.round ? 'This offer has expired. Apply again for a current opening.' : missing[0] ?? '';
        choices.push(makeChoice(g, p, { verb: 'accept', target: offer.id, title: `Accept ${offer.title}`, body: `Accept the offer at ${regionDefinitions[offer.region].placeNames[offer.place]}. ${offer.kind === 'main' && old ? `This replaces your ${old.title} contract; its experience stays with you.` : 'Your work starts only when you separately choose a paid commitment.'}${q ? ` Proposed work: ${q.paidHours} paid hours, ${q.time} blocks, ${money(q.gross)} gross and ${money(q.takeHome)} take-home${q.repayment ? `; ${money(q.repayment)} repays arrears` : ''}${q.cost ? `; ${money(q.cost)} materials` : ''}; ${money(q.cash)} to cash. Acceptance itself is unpaid.` : ''}${commute ? ' ' + commute.warning : ''}`, commute, jobPay, place: offer.place, region: offer.region, field: offer.field, time: 0, cost: 0, cash: 0, paidHours: 0, energy: 0, reason, ...(old && offer.kind === 'main' ? { replaces: old.title } : {}), ...(j && offer.region === region(p) && contact(p, g, j.actorId, present) ? { actorId: contact(p, g, j.actorId, present) } : {}) }));
        choices.push(makeChoice(g, p, { verb: 'decline', target: offer.id, title: `Decline ${offer.title}`, body: 'Decline this offer without losing your current job, experience or friendships.', place: p.place, time: 0, cost: 0, cash: 0, paidHours: 0, energy: 0 }));
    }
    for (const contract of s.contracts.filter(c => c.active))
        for (const kind of contract.kind === 'main' ? (['regular', 'short', 'demanding'] as const) : (['regular'] as const)) {
            const choice = workChoice(g, p, contract, kind, present);
            if (choice)
                choices.push(choice);
        }
    for (const course of careerCourses) {
        const done = prepared(p, course.field, course.level), hours = fieldExperience(p, course.field), reason = done ? 'You already completed this preparation. It cannot be earned twice.' : course.experience > hours ? 'Complete relevant entry work before advanced preparation.' : course.level === 'advanced' && !prepared(p, course.field, 'foundation') ? 'Complete the foundation preparation first.' : '';
        choices.push(makeChoice(g, p, { verb: 'train', target: course.id, title: course.title, body: `${course.description} ${course.time} priority blocks; ${money(course.cost)} tuition. This is preparation for ${careerTracks.find(t => t.id === course.field)!.name.toLowerCase()}, not a job offer.`, place: course.place, field: course.field, time: course.time, cost: course.cost, cash: -course.cost, paidHours: 0, energy: 8, reason, requirements: course.experience ? ['Relevant entry experience', 'Foundation preparation'] : ['No earlier job required'] }));
    }
    for (const lead of careerLeads.filter(l => s.leads[l.id] && !s.leads[l.id].routePinnedRound))
        choices.push(makeChoice(g, p, { verb: 'route', target: lead.id, title: `Mark the route: ${lead.title}`, body: `Use the address ${canonicalCharacterById[lead.from]?.name ?? 'your contact'} gave you. Mark ${regionDefinitions[lead.region].placeNames[lead.place]} and its travel route. No travel, application or employment is committed.`, place: p.place, field: lead.field, time: 0, cost: 0, cash: 0, paidHours: 0, energy: 0 }));
    if ((p.finance?.arrears??0) > 0) {
        const amount = Math.min(p.finance!.arrears, Math.max(0, p.cash - monthlyBills(p).total));
        choices.push(makeChoice(g, p, { verb: 'repay', target: String(amount), title: 'Pay arrears from your bill-safe surplus', body: `Pay ${money(amount)} toward arrears, leaving this month’s ${money(monthlyBills(p).total)} household bill protected. 0 priority blocks. This is your explicit choice; it does not spend another player’s money.${p.finance!.recovering ? ' Recovery also requires two household bills settled on time.' : ''}`, place: p.place, time: 0, cost: amount, cash: -amount, paidHours: 0, energy: 0, reason: amount > 0 ? '' : 'Earn a surplus above this month’s household bill before making this extra payment.' }));
    }
    return choices;
}
function gainExperience(p: Player, g: Game, field: CareerField, hours: number, actorId?: string) {
    const s = state(p)!;
    if (!hours)
        return [];
    const e = s.experience[field] ??= { paidHours: 0, commitments: 0, months: [] };
    e.paidHours += hours;
    e.commitments++;
    if (!e.months.includes(g.round))
        e.months.push(g.round);
    if (actorId) {
        const c = s.colleagues[actorId] ??= { field, months: [] };
        c.fields ??= { [c.field]: [...c.months] };
        const months = c.fields[field] ??= [];
        if (!months.includes(g.round))
            months.push(g.round);
        if (!c.months.includes(g.round))
            c.months.push(g.round);
    }
    const earned = [`${field}:first-work`, ...(e.paidHours >= 120 ? [`${field}:practiced`] : []), ...(e.paidHours >= 360 ? [`${field}:responsibility`] : [])].filter(m => !s.milestones.includes(m));
    s.milestones.push(...earned);
    return earned;
}
export function resolveCareerChoice(g: Game, p: Player, choiceId: string): CareerReceipt {
    if (!state(p) || p.castRedacted)
        throw Error('Your private career record is unavailable.');
    if (g.status !== 'playing' || g.players[g.turn] !== p)
        throw Error('Wait for your active turn.');
    const s = state(p)!, prior = s.receipts.find(r => r.id === choiceId);
    if (prior)
        return prior;
    const choice = careerChoices(g, p).find(c => c.id === choiceId);
    if (!choice)
        throw Error('This career choice is stale or unknown. Refresh the work desk.');
    if (!choice.available)
        throw Error(choice.reason);
    const receipt: CareerReceipt = { id: choice.id, verb: choice.verb, target: choice.target, round: g.round, region: region(p), place: choice.place, title: choice.title, outcome: '', cash: choice.cash, time: choice.time, paidHours: choice.paidHours, ...(choice.paidHours ? { gross: choice.gross, takeHome: choice.takeHome, cost: choice.cost, repayment: choice.repayment ?? 0 } : {}), milestones: [], ...(choice.actorId ? { actorId: choice.actorId } : {}) };
    // Validate paid-hour capacity before any money, time, offer or experience changes.
    if (choice.paidHours) {
        recordEconomyPaidHours(p, g, choice.paidHours);
        recordFinancialPay(g, p, choice.id, choice.takeHome ?? choice.cash + choice.cost, choice.cost);
    }
    if (choice.weatherActivity)
        consumeWeather(p, choice.weatherActivity, g);
    p.hours -= choice.time;
    p.cash += choice.cash;
    p.energy -= choice.energy;
    p.joy = Math.min(100, p.joy + (choice.weatherJoy ?? 0));
    if (choice.verb === 'apply') {
        const j = job(p, g, choice.target)!, missing = qualification(p, j);
        if (missing.length) {
            receipt.outcome = `The work desk cannot offer ${j.title} yet. ${missing.join(' ')} Your current contract stays in place.`;
            receipt.speech = `“I cannot offer this role yet. ${missing[0]}”`;
        }
        else {
            const offerId = `o${s.receipts.length}-${g.round}`;
            s.offers[offerId] = { id: offerId, target: j.target, region: region(p), place: j.place, field: j.field, title: j.title, kind: j.kind === 'main' ? 'main' : 'fixed', round: g.round };
            receipt.offerId = offerId;
            receipt.outcome = `${venue(p, g, j.place)} offers you the ${j.title} role. The offer stays open through the next month. Accepting is your choice; no shift has been worked or paid.`;
            receipt.speech = '“The role is available to you. Take a moment to decide; accepting and doing the work are separate choices.”';
        }
    }
    else if (choice.verb === 'accept') {
        const offer = s.offers[choice.target];
        if (offer.kind === 'main')
            for (const c of s.contracts)
                if (c.active && c.kind === 'main') {
                    c.active = false;
                    c.endedRound = g.round;
                }
        const contract: CareerContract = { id: `c${s.contracts.length}`, target: offer.target, region: offer.region, place: offer.place, field: offer.field, title: offer.title, kind: offer.kind, acceptedRound: g.round, active: true };
        s.contracts.push(contract);
        offer.accepted = true;
        receipt.outcome = `You accept ${offer.title} at ${regionDefinitions[offer.region].placeNames[offer.place]}. You can still visit and talk here; paid employee shifts are now another choice.${choice.replaces ? ` Your ${choice.replaces} contract has ended, while its experience remains.` : ''}`;
        receipt.speech = '“We have agreed the role. Your first shift will have a clear task and a handover.”';
    }
    else if (choice.verb === 'decline') {
        s.offers[choice.target].declined = true;
        receipt.outcome = 'You decline the offer clearly. Your current work, experience and friendships remain yours.';
        receipt.speech = '“Thank you for saying clearly. The decision was yours to make.”';
    }
    else if (choice.verb === 'repay') {
        p.finance!.arrears = Math.max(0, p.finance!.arrears - choice.cost);
        receipt.outcome = `You pay ${money(choice.cost)} toward arrears and keep this month’s household bill protected.`;
    }
    else if (choice.verb === 'route') {
        const lead = careerLeads.find(l => l.id === choice.target)!;
        s.leads[lead.id].routePinnedRound = g.round;
        if (p.world) {
            if (!p.world.discoveredRegions.includes(lead.region))
                p.world.discoveredRegions.push(lead.region);
            const places = p.world.discoveredPlacesByRegion[lead.region];
            if (!places.includes(lead.place))
                places.push(lead.place);
        }
        receipt.outcome = `You mark ${regionDefinitions[lead.region].placeNames[lead.place]} in ${regionDefinitions[lead.region].name}. Travel still has its own fare and time; no application has been made.`;
    }
    else if (choice.verb === 'train') {
        const course = careerCourses.find(c => c.id === choice.target)!;
        s.training[`${course.field}:${course.level}`] = { round: g.round, courseId: course.id };
        afterWorldAction(g, p, course.place === 'LIBRARY' ? 'library_learn' : 'study');
        receipt.outcome = `You finish ${course.title}. The ${course.level} preparation stays on your work record. The tuition and time are spent; employment still needs its own application and acceptance.`;
    }
    else {
        const contract = choice.verb === 'work' ? s.contracts.find(c => c.id === choice.target.split('.')[0]) : undefined;
        if (contract?.kind === 'fixed') {
            contract.completedRound = g.round;
            contract.active = false;
        }
        receipt.milestones = gainExperience(p, g, choice.field!, choice.paidHours, choice.actorId);
        afterCareerWorldWork(g, p, contract?.target ?? choice.target);
        const performed = job(p, g, contract?.target ?? choice.target)?.posting?.activityId;
        if (performed && p.life) {
            p.life.activityCounts ??= {};
            p.life.activityCounts[performed] = (p.life.activityCounts[performed] ?? 0) + 1;
        }
        p.joy = Math.min(100, p.joy + (receipt.milestones.length ? 4 : 1));
        receipt.outcome = `You complete the agreed ${choice.paidHours} paid hours at ${venue(p, g, choice.place)} and receive ${money(choice.cash)}${choice.cost ? ' after materials' : ''}.${choice.repayment ? ` ${money(choice.repayment)} of take-home repays arrears.` : ''} ${careerExperienceLabel(p, choice.field!)}: this work now counts toward future roles.${choice.actorId ? ` ${canonicalCharacterById[choice.actorId]?.name ?? 'Your colleague'} has worked alongside you and can remember that contribution.` : ''}${receipt.milestones.some(m => m.endsWith(':practiced')) ? ' You can now build toward a skilled role with the right preparation.' : ''}`;
        receipt.speech = receipt.milestones.some(m => m.endsWith(':first-work')) ? '“That is a useful first handover. The work has your name on it.”' : '“I can use this handover. Thank you for finishing the part we agreed.”';
    }
    acknowledgeCareerReceipt(p, choice, receipt);
    if (!receipt.actorId)
        delete receipt.speech;
    s.receipts.push(receipt);
    s.revision++;
    g.log.unshift(`${p.name}: ${choice.verb === 'repay' ? 'updated their household account' : choice.title}.`);
    g.log = g.log.slice(0, 32);
    return receipt;
}
/** Called only after the existing transaction has confirmed an actual change. */
export function recordCareerEvidence(g: Game, p: Player, context: {
    actionKey: string;
    actorIds: string[];
    round: number;
    replay: boolean;
    actionId?: string;
}, paidHoursGained = 0) {
    if (!state(p) || context.replay || context.round !== g.round || context.actionKey.startsWith('career:'))
        return;
    const s = state(p)!;
    let changed = false;
    const field = context.actionKey==='weekly_opportunity'?'civic':(/^shared:[^:]+:prepare/.test(context.actionKey) ? 'service' : /^story:.*:(setup|coordinate|take_shift)$/.test(context.actionKey) ? 'civic' : /independent_service/.test(context.actionKey) ? 'technical' : /jo_referral/.test(context.actionKey) ? 'practical' : /community_pivot/.test(context.actionKey) ? 'civic' : undefined);
    if (paidHoursGained > 0 && field) {
        gainExperience(p, g, field, paidHoursGained, context.actorIds[0]);
        changed = true;
    }
    for (const lead of careerLeads.filter(l => context.actorIds.includes(l.from) && eligibleCareerConversation(g, p, context.actionId, l.from))) {
        const notice = (kind: 'lead' | 'reference') => { const actionId = context.actionId!, id = actionId + ':' + lead.id + ':' + kind; s.notices ??= []; if (!s.notices.some(n => n.id === id))
            s.notices.push({ id, actionId, actorId: lead.from, round: g.round, kind, leadId: lead.id, region: lead.region, place: lead.place, employer: regionDefinitions[lead.region].placeNames[lead.place], regionName: regionDefinitions[lead.region].name, speech: careerNoticeSpeech(lead, kind) }); };
        if (!s.leads[lead.id]) {
            s.leads[lead.id] = { id: lead.id, receivedRound: g.round };
            notice('lead');
            changed = true;
        }
        const colleague = s.colleagues[lead.from], worked = colleague?.fields?.[lead.field] ?? [];
        if (worked.length && s.leads[lead.id].referenceRound === undefined) {
            s.leads[lead.id].referenceRound = g.round;
            notice('reference');
            changed = true;
        }
    }
    if (changed)
        s.revision++;
}


export function careerCurrentRole(p: Player) { const c = state(p)?.contracts.find(c => c.active && c.kind === 'main'); return c ? { title: c.title, region: c.region, place: c.place } : null; }
export function careerMemberPlayers(players: Player[], ownedIds: string[]): Player[] { return players.map(p => { if (ownedIds.includes(p.id))
    return p; const { career, ...safe } = p as CareerPlayer; return { ...safe, ...(career ? { careerPublic: career.contracts.filter(c => c.active).map(c => ({ role: c.title, region: c.region, place: c.place })) } : {}) }; }); }
export function careerView(g: Game, p: Player) {
    if (!state(p) || p.castRedacted)
        return null;
    const s = state(p)!, choices = careerChoices(g, p), current = careerCurrentRole(p);
    return { current, region: region(p), venue: venue(p, g, p.place), choices, contracts: s.contracts.filter(c => c.active).map(c => ({ ...c })), offers: Object.values(s.offers).filter(o => !o.accepted && !o.declined).map(o => ({ ...o })), tracks: careerTracks.map(t => ({ ...t, experience: careerExperienceLabel(p, t.id), foundation: prepared(p, t.id, 'foundation'), advanced: prepared(p, t.id, 'advanced'), roles: t.roles.map(r => ({ ...r, rate: r.rate + economyProfile(p, region(p)).entryRate - 24, choice: choices.find(c => c.verb === 'apply' && c.target === `t.${t.id}.${r.id}`)! })) })), leads: careerLeads.filter(l => s.leads[l.id]).map(l => ({ ...l, ...s.leads[l.id], reference: s.leads[l.id].referenceRound !== undefined, venue: regionDefinitions[l.region].placeNames[l.place], regionName: regionDefinitions[l.region].name, knownRoute: region(p) === l.region || !!p.world?.discoveredRegions.includes(l.region) })), colleagues: Object.entries(s.colleagues).map(([id, c]) => ({ id, name: canonicalCharacterById[id]?.name ?? id, field: c.field, status: c.months.length >= 2 ? 'A colleague across different months' : 'Worked together' })), receipts: s.receipts.slice(-10).reverse(), milestones: [...s.milestones] };
}
export function endCareerMonth(g: Game, p: Player) { if (!state(p))
    return; for (const c of p.career!.contracts)
    if (c.active && c.kind === 'fixed') {
        c.active = false;
        c.endedRound = g.round;
    } }
export function careerNoticesForAction(g: Game, p: Player, actionId: string) { return !p.castRedacted ? (p.career?.notices ?? []).filter(n => n.actionId === actionId && n.round === g.round).map(n => ({ ...n })) : []; }
