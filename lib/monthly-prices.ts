/** Display-only monthly routine breakdowns. Never changes the charged quote. */
import { economyHabit, economyQuote } from './economy.ts';
import type { EconomyActivity, EconomyGame, EconomyPlayer } from './economy.ts';
const routineLabels: Record<string, {
    plural: string;
    unit: string;
}> = {
    cafe_break: { plural: 'weekday coffees', unit: 'coffee' },
    friends: { plural: 'café meetups', unit: 'meetup' },
    home_meal: { plural: 'dinners', unit: 'dinner' },
    market_taste: { plural: 'weekday lunches', unit: 'lunch' },
};
/** Cents are display precision only; the engine still charges its exact total. */
export function perEventPrice(total: number, quantity: number): string {
    if (!Number.isFinite(total) || total < 0 || !Number.isFinite(quantity) || quantity <= 0)
        return '';
    const unit = total / quantity, rounded = Math.round(unit * 100) / 100;
    const approximate = Math.abs(unit - rounded) > 0.00000001 || !Number.isInteger(quantity);
    return `${approximate ? 'about ' : ''}$${rounded.toLocaleString('en-US', { maximumFractionDigits: 2, minimumFractionDigits: Number.isInteger(rounded) ? 0 : 2 })}${approximate ? ' on average (rounded to cents)' : ''}`;
}
export function monthlyPriceBreakdown(p: EconomyPlayer, a: EconomyActivity, g?: Pick<EconomyGame, 'round'>): string {
    ;
    const labels = routineLabels[a.id];
    if (!labels)
        return '';
    const habit = economyHabit(p, a), quantity = habit?.quantity ?? 4;
    // Resolve through the same quote as payment, including any applicable adjustments.
    const cost = economyQuote(p, a, g).cost, credit = habit?.groceryCredit ?? 0;
    const net = perEventPrice(cost, quantity);
    if (!net)
        return '';
    const frequency = `${quantity} ${labels.plural} this month`;
    if (credit)
        return `${frequency} · ${perEventPrice(cost + credit, quantity)} per ${labels.unit} · ${net} extra per ${labels.unit} after grocery credit`;
    return `${frequency} · ${net}${a.id === 'home_meal' ? ' extra' : ''} per ${labels.unit}`;
}
