/** One supported game format. This is an integrity boundary, not feature negotiation. */
export const CURRENT_GAME_SCHEMA = 1 as const;
export const CURRENT_GAME_PROTOCOL = 1 as const;
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

/** Reject unsupported or incomplete persisted records before any initializer can run.
 * This checks authoritative state, never a redacted member or public response. */
export function isCurrentGameState(value: unknown): boolean {
  if (!object(value) || value.schemaVersion !== CURRENT_GAME_SCHEMA) return false;
  if (!['cast','story','sharedWorld','sharedOpportunities'].every(key => state(value[key]))) return false;
  if (!Array.isArray(value.lifeSchedule) || !Array.isArray(value.weatherSchedule) || !Number.isSafeInteger(value.lifeSeed) || !object(value.actionIncidentRng)) return false;
  if (!Array.isArray(value.players) || value.players.length < 1 || value.players.length > 4) return false;
  const rng = value.actionIncidentRng;
  return value.players.every(player => {
    if (!object(player) || player.schemaVersion !== CURRENT_GAME_SCHEMA || player.castRedacted !== undefined || typeof player.id !== 'string') return false;
    if (!['life','world','story','cast','motives','career','finance','familiarity','sharedPersonal','actionIncidents'].every(key => state(player[key]))) return false;
    if (!object(player.economyWork) || !object(player.economyHabits)) return false;
    const random = rng[player.id];
    return object(random) && Array.isArray(random.words) && random.words.length === 4
      && random.words.every(word => Number.isSafeInteger(word) && word >= 0 && word <= 0xffffffff);
  });
}
