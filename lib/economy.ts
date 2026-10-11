import { financialPayQuote, recordFinancialPay } from './financial-recovery.ts';
import type { Game, Player } from './game.ts';


export const economyStartingCash = 6000;
export const economyPaidHoursLimit = 200;
export const economyTakeHomeRatio = 0.8;
export const economyAssumption = 'Take-home uses a simplified game assumption: 80% of gross pay. It is not a personal tax estimate.';
export const economyTimeExplanation = 'Eight months, six priority blocks each month. Blocks represent attention; paid work hours are shown separately. Each month settles one set of bills.';


export type EconomyWorkState = {
    round: number;
    paidHours: number;
};
export type EconomyHabitState = {
    round: number;
    ids: string[];
};
export type EconomyPlayer = {
    cash: number;
    housing: number;
    social?: number;
    craft?: number;
    economyWork?: EconomyWorkState;
    economyHabits?: EconomyHabitState;
    world?: {
        region?: string;
        story?: {
            homeRegion?: string;
        };
    };
};
export type EconomyGame = {
    round: number;
};
export type EconomyActivity = {
    id: string;
    cost: number;
    time: number;
    title?: string;
    desc?: string;
    earn?: number;
    energy?: number;
};
export type EconomyRegion = 'alder' | 'saffron' | 'glasssteppe' | 'pelagia' | 'embermesa';
export type EconomyProfile = {
    region: EconomyRegion;
    rentShared: number;
    rentStudio: number;
    food: number;
    essentials: number;
    entryRate: number;
    travel: number;
};
export type EconomyBill = {
    rent: number;
    food: number;
    essentials: number;
    total: number;
    period: 'month';
    homeRegion: EconomyRegion;
};
export type EconomyQuote = {
    gross: number;
    withholding: number;
    takeHome: number;
    cost: number;
    cash: number;
    repayment?: number;
    paidHours: number;
    available: boolean;
    reason: string;
};
const profiles: Record<EconomyRegion, EconomyProfile> = {
    alder: { region: 'alder', rentShared: 1250, rentStudio: 2450, food: 380, essentials: 220, entryRate: 24, travel: 180 },
    saffron: { region: 'saffron', rentShared: 1150, rentStudio: 2200, food: 360, essentials: 190, entryRate: 23, travel: 320 },
    glasssteppe: { region: 'glasssteppe', rentShared: 1050, rentStudio: 2000, food: 380, essentials: 240, entryRate: 25, travel: 540 },
    pelagia: { region: 'pelagia', rentShared: 1550, rentStudio: 2850, food: 430, essentials: 270, entryRate: 27, travel: 780 },
    embermesa: { region: 'embermesa', rentShared: 950, rentStudio: 1750, food: 350, essentials: 200, entryRate: 22, travel: 420 },
};
const finite = (n: number | undefined) => Number.isFinite(n) ? n! : 0;
const money = (n: number) => Math.round(n);
export const formatEconomyMoney = (n: number) => `$${Math.abs(money(n)).toLocaleString('en-US')}`;


const regionId = (id: string | undefined): EconomyRegion => id && Object.prototype.hasOwnProperty.call(profiles, id) ? id as EconomyRegion : 'alder';
export const economyHomeRegion = (p: EconomyPlayer) => regionId(p.world?.story?.homeRegion);
/** An explicit region is a quote; otherwise use the lease, never the visited map. */
export function economyProfile(p: EconomyPlayer, region?: string): EconomyProfile { return { ...profiles[regionId(region ?? economyHomeRegion(p))] }; }
export function monthlyBills(p: EconomyPlayer): EconomyBill {
    const homeRegion = economyHomeRegion(p);
    const profile = economyProfile(p);
    const rent = p.housing ? profile.rentStudio : profile.rentShared;
    return { rent, food: profile.food, essentials: profile.essentials, total: rent + profile.food + profile.essentials, period: 'month', homeRegion };
}
export const economyMonthLabel=(value:{round?:number},round=value.round??1)=>`Month ${round}`;

export const economyTimeLabel=(_value:unknown,blocks:number)=>`${blocks} priority block${blocks===1?'':'s'}`;



/** New-player initialization only. Existing state is never rebased. */
export function initializeEconomyPlayer(p:EconomyPlayer,g?:EconomyGame&{status?:string}):void { if(p.economyWork||g&&g.status!=='lobby')return; p.cash=economyStartingCash;p.economyWork={round:g?.round??1,paidHours:0};p.economyHabits={round:g?.round??1,ids:[]}; }

export const economyPaidHours = (p: EconomyPlayer, g: Pick<EconomyGame, 'round'>) => p.economyWork?.round === g.round ? Math.max(0, finite(p.economyWork.paidHours)) : 0;
export function economyWorkReason(p: EconomyPlayer, g: Pick<EconomyGame, 'round'>, hours: number): string {
    if (hours <= 0)
        return '';
    if (!Number.isFinite(hours))
        return 'Invalid paid workload';
    const left = Math.max(0, economyPaidHoursLimit - economyPaidHours(p, g));
    return hours > left ? `Only ${left} paid hours remain this month; this commitment needs ${hours}. Choose a shorter shift or make room for something else.` : '';
}
/** Call after successful availability checks and before any pay/state mutation. */
export function recordEconomyPaidHours(p: EconomyPlayer, g: Pick<EconomyGame, 'round'>, hours: number): void {
    if (hours <= 0)
        return;
    const reason = economyWorkReason(p, g, hours);
    if (reason)
        throw Error(reason);
    p.economyWork = { round: g.round, paidHours: economyPaidHours(p, g) + hours };
}
function paidQuote(p: EconomyPlayer, g: Pick<EconomyGame, 'round'>, gross: number, paidHours: number, cost = 0): EconomyQuote {
    gross = money(gross);
    cost = money(cost);
    const takeHome = money(gross * economyTakeHomeRatio), reason = economyWorkReason(p, g, paidHours);
    const pay = financialPayQuote(g as Game, p as Player, takeHome, cost);
    return { gross, withholding: gross - takeHome, takeHome, cost, cash: pay.cash, ...(pay.repayment ? { repayment: pay.repayment } : {}), paidHours, available: !reason, reason };
}
export function economyRegionalWorkQuote(p: EconomyPlayer, g: Pick<EconomyGame, 'round'>, options: {
    region: string;
    kind: 'regular' | 'short';
    residentBonus?: boolean;
}): EconomyQuote {
    const hours = options.kind === 'regular' ? 160 : 40, profile = economyProfile(p, options.region);
    return paidQuote(p, g, hours * profile.entryRate + (options.kind === 'regular' && options.residentBonus ? 250 : 0), hours);
}
export const economyTravelCost=(_p:EconomyPlayer,to:string)=>profiles[regionId(to)].travel;

export function economyRelocationCost(p:EconomyPlayer,to:string):number {const from=economyProfile(p),dest=economyProfile(p,to),key=p.housing?'rentStudio':'rentShared';return 600+Math.max(0,dest[key]-from[key]);}

export const economyStudioMoveCost = (p: EconomyPlayer) => economyProfile(p).rentStudio + 350;
export type EconomyHabit = {
    id: string;
    title: string;
    quantity: number;
    unitCost: number;
    groceryCredit: number;
    cost: number;
    desc: string;
};
const habitDefinitions: Record<string, Omit<EconomyHabit, 'id' | 'cost'>> = {
    cafe_break: { title: 'Make weekday coffee your quiet ritual', quantity: 20, unitCost: 7, groceryCredit: 0, desc: '20 weekday coffees × $7 = $140 for this month. An espresso at a familiar window seat, with time to yourself. Drinks are extras above ordinary groceries. Choose once this month; it does not renew automatically.' },
    friends: { title: 'Keep a twice-weekly café date with friends', quantity: 8, unitCost: 18, groceryCredit: 0, desc: '8 café meetups × $18 = $144 for this month. Coffee, lemon biscuits and familiar faces twice a week; these are extras, not replacement meals. Choose once this month; it does not renew automatically.' },
    home_meal: { title: 'Make good home cooking a monthly habit', quantity: 20, unitCost: 5, groceryCredit: 0, desc: '20 dinners × $5 in better ingredients = $100 extra this month. Roast vegetables, simmer lentils and vary the herbs. Basic groceries are already in your monthly bills; this pays only for upgrades. Choose once this month; it does not renew automatically.' },
    market_taste: { title: 'Make market lunches part of your month', quantity: 20, unitCost: 18, groceryCredit: 100, desc: '20 weekday lunches × $18 = $360, less $100 of groceries those lunches replace: $260 extra this month. This is already the net addition to your normal food bill; no second grocery adjustment. Choose once this month; it does not renew automatically.' },
};
/** A monthly habit is an explicit current-month choice, never a subscription. */
export function economyHabit(p: EconomyPlayer, a: string | Pick<EconomyActivity, 'id'>): EconomyHabit | undefined {
    const id = typeof a === 'string' ? a : a.id, habit = habitDefinitions[id];
    if (!habit)
        return undefined;
    return { id, ...habit, cost: habit.quantity * habit.unitCost - habit.groceryCredit };
}
export function economyHabitReason(p: EconomyPlayer, a: string | Pick<EconomyActivity, 'id'>, g?: Pick<EconomyGame, 'round'>): string {
    const habit = economyHabit(p, a);
    if (!habit || !g)
        return '';
    return p.economyHabits?.round === g.round && p.economyHabits.ids.includes(habit.id) ? 'This monthly habit is already chosen. Enjoy it through this month, or choose a different activity.' : '';
}
/** Call only after other validation and before committing ordinary activity effects. */
export function recordEconomyHabit(p: EconomyPlayer, a: string | Pick<EconomyActivity, 'id'>, g: Pick<EconomyGame, 'round'>): void {
    const habit = economyHabit(p, a);
    if (!habit)
        return;
    const reason = economyHabitReason(p, a, g);
    if (reason)
        throw Error(reason);
    p.economyHabits = { round: g.round, ids: [...(p.economyHabits?.round === g.round ? p.economyHabits.ids : []), habit.id] };
}
/** Terms used by the named career postings. The activity key also selects their
 * existing artwork and weather context; these are not ordinary action commands. */
const postingTerms: Record<string, {paidHours:number;gross:number;cost?:number}> = {
    campus_tutor: { paidHours: 80, gross: 2400 },
    library_digitize: { paidHours: 80, gross: 2000 }, market_shift: { paidHours: 80, gross: 1920 },
    market_resell: { paidHours: 80, gross: 2400, cost: 120 }, gym_desk: { paidHours: 80, gross: 1920 },
    maker_commission: { paidHours: 120, gross: 4200, cost: 180 }, cinema_usher: { paidHours: 80, gross: 1840 },
    transit_courier: { paidHours: 40, gross: 1000 }, transit_repair: { paidHours: 80, gross: 2640 },
    arcade_shift: { paidHours: 80, gross: 1920 },
};
function activityPay(p: EconomyPlayer, a: EconomyActivity, g?: Pick<EconomyGame, 'round'>): {
    gross: number;
    paidHours: number;
} | null {
    const social = Math.max(0, Math.min(20, p.social ?? 0)), craft = Math.max(0, Math.min(8, p.craft ?? 0));
    if (a.id === 'creative_commission')
        return { gross: 2600 + craft * 200, paidHours: 120 };
    if (a.id === 'career_contract')
        return { gross: 2800 + social * 70, paidHours: 120 };
    if (a.id === 'garden_harvest')
        return { gross: 1840 + social * 30, paidHours: 80 };
    if (a.id === 'weekly_opportunity') {
        const n = Math.max(0, Math.min(7, (g?.round ?? 1) - 1));
        return { gross: [2300, 2400, 2500, 2600, 2700, 2800, 2900, 3100][n], paidHours: 80 };
    }
    const fixed = postingTerms[a.id];
    return fixed ? { gross: fixed.gross, paidHours: fixed.paidHours } : null;
}
/** Use this effective activity for both menu and resolver. Calling twice is safe. */
export function economyActivity<T extends EconomyActivity>(p: EconomyPlayer, a: T, g?: Pick<EconomyGame, 'round'>): T & EconomyActivity {
    const adjusted = { ...a } as T;
    if(postingTerms[a.id]?.cost)adjusted.cost=postingTerms[a.id].cost!;
    if(a.id==='creative_commission')adjusted.cost=220;
    const habit = economyHabit(p, a);
    if (habit) {
        adjusted.title = habit.title;
        adjusted.cost = habit.cost;
        adjusted.desc = habit.desc;
    }
    if (a.id === 'move') {
        adjusted.cost = economyStudioMoveCost(p);
        adjusted.desc = `${formatEconomyMoney(economyProfile(p).rentStudio)} monthly rent, plus food and essentials. ${formatEconomyMoney(adjusted.cost)} upfront: one studio deposit and $350 moving costs. Rent is charged at month-end.`;
    }
    const pay = activityPay(p, adjusted, g);
    if (pay) {
        adjusted.earn = money(pay.gross * economyTakeHomeRatio);
        adjusted.desc = `A ${pay.paidHours}-paid-hour commitment across this month. ${formatEconomyMoney(pay.gross)} gross; ${formatEconomyMoney(adjusted.earn)} take-home${adjusted.cost ? `; ${formatEconomyMoney(adjusted.cost)} upfront costs` : ''}. Uses the shared 200-hour monthly work limit.`;
    }
    return adjusted;
}
/** Quotes the current monthly activity and its actual recovery deductions. */
export function economyQuote(p: EconomyPlayer, a: EconomyActivity, g?: Pick<EconomyGame, 'round'>): EconomyQuote {
    const adjusted = economyActivity(p, a, g), pay = activityPay(p, adjusted, g);
    if (pay)
        return paidQuote(p, g ?? { round: 1 }, pay.gross, pay.paidHours, adjusted.cost);
    const earn = adjusted.earn ?? 0, reason = economyHabitReason(p, a, g);
    return { gross: earn, withholding: 0, takeHome: earn, cost: adjusted.cost, cash: earn - adjusted.cost, paidHours: 0, available: !reason, reason };
}
export const economyDisabled = (p: EconomyPlayer, a: EconomyActivity, g?: Pick<EconomyGame, 'round'>) => economyQuote(p, a, g).reason;
export function recordEconomyWork(p: EconomyPlayer, a: EconomyActivity, g: Pick<EconomyGame, 'round'>): void { const q = economyQuote(p, a, g), before = economyPaidHours(p, g); recordEconomyPaidHours(p, g, q.paidHours); if (q.paidHours)
    recordFinancialPay(g as Game, p as Player, `ordinary:${g.round}:${before}:${a.id}`, q.takeHome, q.cost); }
export const economyGardenReward=(p:EconomyPlayer)=>{void p;return 600;};





export function economyThresholds(p: EconomyPlayer) { const bill = monthlyBills(p).total; return { hardship: money(bill * .5), modest: money(bill * 1.5), comfortable: bill * 3, reserve: bill * 2, automaticLossCap: Math.min(900, money(bill * .5)) }; }
export function economyAutomaticLoss(p: EconomyPlayer, negative: number): number { return -Math.min(Math.max(0, -negative), economyThresholds(p).automaticLossCap, Math.max(0, p.cash)); }
export const economySources = [
    { title: 'BLS May 2025 San Francisco occupational wages (released July 2026)', url: 'https://www.bls.gov/regions/west/news-release/occupationalemploymentandwages_sanfrancisco.htm', note: 'Food-service group mean $22.91/hour; all occupations $48.19/hour. Broad anchors, not exact claims about fictional roles.' },
    { title: 'HUD FY2026 Fair Market Rent schedule', url: 'https://www.huduser.gov/portal/datasets/fmr/fmr2026/FY2026_FMR_Schedule.pdf', note: 'San Francisco studio $2,485; Oakland-Fremont studio $2,142. FMRs are program benchmarks, not current asking-rent listings.' },
    { title: 'USDA July 2026 food-at-home report', url: 'https://fns-prod.azureedge.us/sites/default/files/resource-files/cnpp-costfood-3levels-july2026.pdf', note: 'Adult low-cost food at home $276.10–317.40/month before household-size adjustments; USDA suggests +20% for a single person. Fictional groceries $350–430 are game anchors, not a personal nutrition budget.' },
] as const;
