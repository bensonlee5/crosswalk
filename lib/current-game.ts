import { ensembleStories } from './ensemble-story-content.ts';

/** One supported game format. This is an integrity boundary, not feature negotiation. */
export const CURRENT_GAME_SCHEMA = 2 as const;
export const CURRENT_GAME_PROTOCOL = 2 as const;
export const REFRESH_GAME_MESSAGE = 'Refresh Crosswalk to continue.';
export const NEW_LIFE_MESSAGE = 'This saved life uses an older game format. Start a new life to continue.';

export function currentGameQuery(params: Record<string, string | number> = {}): string {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) query.set(key, String(value));
  query.set('protocolVersion', String(CURRENT_GAME_PROTOCOL));
  return `/api/game?${query}`;
}

const object = (value: unknown): value is Record<string, unknown> => !!value && typeof value === 'object' && !Array.isArray(value);
const state = (value: unknown): boolean => object(value) && value.version === 1;

const strings = (value: unknown): value is string[] => Array.isArray(value) && value.every(item => typeof item === 'string');
const natural = (value: unknown): value is number => Number.isSafeInteger(value) && Number(value) >= 0;
const finite = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value);
const fields = (value: Record<string, unknown>, keys: string[]): boolean => keys.every(key => typeof value[key] === 'string');

/** Every authored thread is persisted at creation, including those still queued.
 * Views and rejected requests must never fill in a partially stored story. */
function ensembleState(value: unknown): boolean {
  if (!object(value) || !state(value) || !natural(value.revision) || !natural(value.arrivedMonth) || !object(value.threads)) return false;
  const threads = value.threads;
  if (Object.keys(threads).length !== ensembleStories.length || !ensembleStories.every(story => {
    const thread = threads[story.id];
    return object(thread) && thread.id === story.id && ['queued', 'active', 'settled'].includes(String(thread.status))
      && natural(thread.beat) && thread.beat <= story.beats.length
      && ['openedMonth', 'readyMonth', 'dueMonth'].every(key => natural(thread[key]))
      && object(thread.flags) && Object.values(thread.flags).every(flag => typeof flag === 'boolean')
      && strings(thread.history) && typeof thread.ending === 'string';
  })) return false;
  if (!Array.isArray(value.events) || !value.events.every(event => object(event)
    && fields(event, ['id', 'storyId', 'actionId', 'title', 'text']) && natural(event.month) && natural(event.beat)
    && object(event.actor) && ['player', 'npc'].includes(String(event.actor.kind)) && fields(event.actor, ['id', 'name'])
    && strings(event.signals) && strings(event.originPlayers) && strings(event.parentCrossingIds))) return false;
  if (!Array.isArray(value.crossings) || !value.crossings.every(crossing => object(crossing)
    && fields(crossing, ['id', 'ruleId', 'sourceEventId', 'sourceStoryId', 'storyId', 'kind'])
    && natural(crossing.month) && natural(crossing.expiresMonth) && strings(crossing.originPlayers)
    && strings(crossing.claimedBy) && typeof crossing.continuation === 'boolean')) return false;
  return Array.isArray(value.orders) && value.orders.every(order => object(order)
    && fields(order, ['id', 'storyId', 'payerId']) && ['paid', 'served', 'refunded'].includes(String(order.status))
    && finite(order.amount) && order.amount >= 0 && finite(order.absorbedWages) && order.absorbedWages >= 0);
}
function ensemblePlayerState(value: unknown): boolean {
  return object(value) && state(value) && strings(value.personal) && Array.isArray(value.receipts)
    && value.receipts.every(receipt => object(receipt)
      && fields(receipt, ['id', 'actionId', 'eventId', 'storyId', 'title', 'body', 'outcome'])
      && natural(receipt.week) && ['cash', 'hours', 'paidHours', 'repayment'].every(key => finite(receipt[key]))
      && object(receipt.response) && fields(receipt.response, ['speakerId', 'speech', 'activity', 'emotion', 'gesture']));
}

/** Reject unsupported or incomplete persisted records before any initializer can run.
 * This checks authoritative state, never a redacted member or public response. */
export function isCurrentGameState(value: unknown): boolean {
  if (!object(value) || value.schemaVersion !== CURRENT_GAME_SCHEMA) return false;
  if (!['cast','story','sharedWorld','sharedOpportunities'].every(key => state(value[key])) || !ensembleState(value.ensemble)) return false;
  if (!Array.isArray(value.lifeSchedule) || !Array.isArray(value.weatherSchedule) || !Number.isSafeInteger(value.lifeSeed) || !object(value.actionIncidentRng)) return false;
  if (!Array.isArray(value.players) || value.players.length < 1 || value.players.length > 4) return false;
  const rng = value.actionIncidentRng;
  return value.players.every(player => {
    if (!object(player) || player.schemaVersion !== CURRENT_GAME_SCHEMA || player.castRedacted !== undefined || typeof player.id !== 'string') return false;
    if (!['life','world','story','cast','motives','career','finance','familiarity','sharedPersonal','actionIncidents'].every(key => state(player[key]))) return false;
    if (!ensemblePlayerState(player.ensemble)) return false;
    if (!object(player.economyWork) || !object(player.economyHabits)) return false;
    const random = rng[player.id];
    return object(random) && Array.isArray(random.words) && random.words.length === 4
      && random.words.every(word => Number.isSafeInteger(word) && word >= 0 && word <= 0xffffffff);
  });
}
