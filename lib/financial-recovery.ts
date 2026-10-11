import type { GameView as Game, Player } from './game.ts';
import { monthlyBills, formatEconomyMoney } from './economy.ts';


export type FinanceSettlement = {
    round: number;
    bill: number;
    paid: number;
    unpaid: number;
    arrears: number;
    restructured: number;
    cash: number;
    triggered: boolean;
    recovered: boolean;
    housingChanged: boolean;
    administrationBlocks: number;
    summary: string;
};
export type FinanceState = {
    version: 1;
    arrears: number;
    missedSettlements: number;
    onTimeSettlements: number;
    recovering: boolean;
    ceiling?: number;
    administrationRound?: number;
    settlements: FinanceSettlement[];
    payReceipts: {
        id: string;
        round: number;
        repayment: number;
    }[];
    restructuredTotal: number;
};
export type FinancePlayer = Player & {
    finance?: FinanceState;
};
export type FinanceGame = Game;
const state = (p: Player) => (p as FinancePlayer).finance;
const money = (n: number) => formatEconomyMoney(n);


export function initializeFinancialRecovery(g: Game, p: Player) { if (g.status !== 'lobby' || state(p))
    return; (p as FinancePlayer).finance = { version: 1, arrears: 0, missedSettlements: 0, onTimeSettlements: 0, recovering: false, settlements: [], payReceipts: [], restructuredTotal: 0 }; }
/** Gross withholding remains separate. Repayment is 20% of take-home before materials. */
export function financialPayQuote(g: Game, p: Player, takeHome: number, cost = 0) { const s = state(p), repayment = s?.recovering ? Math.min(Math.max(0, s!.arrears), Math.round(Math.max(0, takeHome) * .2)) : 0; return { takeHome, cost, repayment, cash: takeHome - cost - repayment }; }
/** Commit the previously displayed deduction only after all action validation. */
export function recordFinancialPay(g: Game, p: Player, id: string, takeHome: number, cost = 0) {
    const quote = financialPayQuote(g, p, takeHome, cost);
    if (!state(p))
        throw Error('Missing household finance state.');
    if (g.status !== 'playing' || g.players[g.turn] !== p || !id)
        throw Error('A paycheck must belong to the active player’s confirmed action.');
    const s = state(p)!, prior = s.payReceipts.find(r => r.id === id);
    if (prior)
        return { takeHome, cost, repayment: prior.repayment, cash: takeHome - cost - prior.repayment };
    s.arrears = Math.max(0, s.arrears - quote.repayment);
    s.payReceipts.push({ id, round: g.round, repayment: quote.repayment });
    return quote;
}
export function financialRestriction(g: Game | undefined, p: Player, kind: 'tuition' | 'studio', cost = 0) {
    if (!g || !state(p) || !state(p)!.recovering)
        return '';
    if (kind === 'tuition' && cost <= 0)
        return '';
    return kind === 'studio' ? 'Studio upgrades pause during financial recovery. Clear the arrears and settle two bills on time first.' : 'Tuition-funded classes pause during financial recovery. The free Library preparation remains open.';
}
export function financialSettlementQuote(g: Game, p: Player): FinanceSettlement | null {
    if (!state(p) || p.castRedacted)
        return null;
    const s = state(p)!, prior = s.settlements.find(r => r.round === g.round);
    if (prior)
        return { ...prior };
    const bill = monthlyBills(p).total, available = Math.max(0, p.cash), paid = Math.min(available, bill), unpaid = bill - paid, missed = unpaid > 0 ? s.missedSettlements + 1 : 0, onTime = unpaid === 0 ? s.onTimeSettlements + 1 : 0, triggered = !s.recovering && missed >= 2;
    let arrears = s.arrears + unpaid + Math.max(0, -p.cash);
    const recovering = s.recovering || triggered, ceiling = s.ceiling ?? monthlyBills({ ...p, housing: 0 }).total * 2, restructured = recovering ? Math.max(0, arrears - ceiling) : 0;
    arrears -= restructured;
    const recovered = recovering && arrears === 0 && onTime >= 2, housingChanged = recovering && p.housing > 0, administrationBlocks = recovering && !recovered ? 1 : 0, cash = available - paid;
    const details = [`${money(paid)} of ${money(bill)} household bills paid.`, unpaid ? `${money(unpaid)} unpaid; total arrears ${money(arrears)}.` : 'This month’s bill is settled on time.', triggered ? 'A second unpaid settlement starts financial recovery.' : '', housingChanged ? 'Your studio is surrendered for shared housing; no deposit refund or cash windfall is awarded.' : '', administrationBlocks ? 'Next month reserves 1 priority block for recovery administration. Studio upgrades and tuition-funded classes pause; work, applications and free learning remain available.' : '', recovering && !recovered ? '20% of future take-home pay goes to the arrears.' : '', restructured ? `${money(restructured)} of arrears is explicitly restructured under the fictional recovery arrangement. The recorded arrears ceiling stays fixed through this recovery; missed settlements and restrictions remain.` : '', recovered ? 'Your arrears are paid and two bills were settled on time. The recovery restrictions are lifted.' : ''].filter(Boolean);
    return { round: g.round, bill, paid, unpaid, arrears, restructured, cash, triggered, recovered, housingChanged, administrationBlocks, summary: details.join(' ') };
}
/** Settles current household bills, once per player/month. */
export function settleFinancialMonth(g: Game, p: Player): FinanceSettlement {
    if (!state(p))
        throw Error('Missing household finance state.');
    if (g.status !== 'playing' || g.players[g.turn] !== p)
        throw Error('Only the active player can settle their household bills.');
    const s = state(p)!, prior = s.settlements.find(r => r.round === g.round);
    if (prior)
        return prior;
    const quote = financialSettlementQuote(g, p)!;
    if (p.castRedacted)
        throw Error('Cannot settle another player’s private finances.');
    if (quote.triggered) {
        s.recovering = true;
        s.ceiling = monthlyBills({ ...p, housing: 0 }).total * 2;
    }
    p.cash = quote.cash;
    if (quote.housingChanged)
        p.housing = 0;
    s.arrears = quote.arrears;
    s.missedSettlements = quote.unpaid > 0 ? s.missedSettlements + 1 : 0;
    s.onTimeSettlements = quote.unpaid === 0 ? s.onTimeSettlements + 1 : 0;
    s.restructuredTotal += quote.restructured;
    if (quote.recovered) {
        s.recovering = false;
        delete s.ceiling;
    }
    s.settlements.push({ ...quote });
    return quote;
}
/** Call just after the engine refreshes this player's turn to six blocks. */
export function reserveRecoveryAdministration(g: Game, p: Player) {
    if (!state(p))
        return 0;
    const s = state(p)!;
    if (!s.recovering || s.administrationRound === g.round)
        return 0;
    s.administrationRound = g.round;
    p.hours = Math.max(0, p.hours - 1);
    return 1;
}
export function financialRecoveryView(g: Game, p: Player) {
    if (!state(p) || p.castRedacted)
        return null;
    const s = state(p)!, settlement = financialSettlementQuote(g, p)!;
    return { arrears: s.arrears, recovering: s.recovering, status: s.recovering ? 'Financial recovery' : s.arrears > 0 ? 'Behind on bills' : 'Bills up to date', administrationBlocks: s.recovering ? 1 : 0, onTime: s.onTimeSettlements, settlement, warning: settlement.triggered ? `Ending this month starts financial recovery. ${settlement.summary}` : settlement.unpaid ? `Ending this month leaves ${money(settlement.unpaid)} unpaid. Another consecutive unpaid settlement will start financial recovery, with shared housing, one reserved priority block and a pause on tuition-funded classes.` : '', restructuredTotal: s.restructuredTotal };
}
export function financeMemberPlayers(players: Player[], ownedIds: string[]): Player[] { return players.map(p => { if (ownedIds.includes(p.id))
    return p; const { finance, ...safe } = p as FinancePlayer; void finance; return safe; }); }
