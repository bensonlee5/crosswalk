import { financialSettlementQuote } from './financial-recovery.ts';
import { monthlyBills, economyGardenReward } from './economy.ts';
import { getLifeEvent, lifeChoices } from './life-events.ts';
import type { Player, Game } from './game.ts';
import { actions, effects, activityForPlayer, projectProgress, projectGoal } from './game.ts';
export function snapshotIsCurrent(current: {
    code: string;
    version: number;
} | null, next: {
    code: string;
    version: number;
}) { return !current || current.code !== next.code || next.version >= current.version; }
/** Includes the shared weather breakdown and heat-aware requiredEnergy from effects. */
export function actionPreview(p: Player, id: string, g?: Game) { const a = activityForPlayer(p, actions.find(x => x.id === id)!, g); const e = effects(p, a, g); const completesProject = a.special === 'project' && g && !g.project?.completed && projectProgress(g) + 1 >= projectGoal(g); if (completesProject)
    e.cash += economyGardenReward(p); const legacy = Math.min(10 - (p.legacy || 0), completesProject ? 4 : 0); const headline = a.title; return { ...e, legacy, hours: -a.time, headline, afterCash: p.cash + e.cash, afterHours: Math.max(0, p.hours - a.time), missingHours: Math.max(0, a.time - p.hours) }; }
export function weekPreview(p: Player, g: Game) { if (getLifeEvent(p, g)?.pending) {
    const fallback = lifeChoices(p, g).find(c => c.safe && c.available);
    if (fallback) {
        const projected = { ...p };
        for (const key of ['cash', 'energy', 'joy', 'housing'] as const)
            projected[key] += fallback.preview[key];
        p = projected;
    }
} const bills = monthlyBills(p).total; const settlement = financialSettlementQuote(g,p); if(!settlement)throw Error('Private household finance is unavailable'); const cash=settlement.cash; let joy = Math.min(100, p.joy + (p.housing && !settlement?.housingChanged ? 6 : 0)); joy = Math.max(0, joy - 4); if (cash < 0 || settlement?.unpaid)
    joy = Math.max(0, joy - 8); return { bills, cash, joy, ...(settlement ? { settlement } : {}), energy: Math.min(100, p.energy + 16) }; }
