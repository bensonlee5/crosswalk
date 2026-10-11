import {CURRENT_GAME_PROTOCOL} from '../_shared/engine/current-game.ts';
import { GameError, mutate, roomView, validActor, validCode, requireCurrentProtocol } from './game-service.ts';
import type { GameStore } from './game-service.ts';
export type Identity = { id: string; role: string; is_anonymous: boolean };
type Dependencies = {
  store: GameStore;
  authenticate: (accessToken: string) => Promise<Identity | null>;
  allowedOrigins: string[];
  reportError?: (error: unknown) => void;
};
export function createHandler(deps: Dependencies) {
  const origins = new Set(deps.allowedOrigins);
  if (!origins.size || origins.has('*')) throw new Error('Explicit allowed origins are required');
  return async (request: Request): Promise<Response> => {
    const origin = request.headers.get('origin');
    const headers: Record<string, string> = {
      'Cache-Control': 'no-store', Vary: 'Origin, Authorization',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info',
      'Access-Control-Max-Age': '600', 'X-Content-Type-Options': 'nosniff',
    };
    if (origin && origins.has(origin)) headers['Access-Control-Allow-Origin'] = origin;
    const reply = (data: unknown, status = 200) => Response.json(data, { status, headers });
    if (origin && !origins.has(origin)) return reply({ error: 'Invalid request origin' }, 403);
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers });
    if (!['GET', 'POST'].includes(request.method)) return reply({ error: 'Method not allowed' }, 405);
    const authorization = request.headers.get('authorization') ?? '';
    if (!/^Bearer [A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(authorization)) return reply({ error: 'Your saved-seat session is required', sessionRequired: true }, 401);
    try {
      // getUser(token) checks this specific user with Auth; never trust the body,
      // getSession() cache, unverified JWT claims or editable user_metadata here.
      const user = await deps.authenticate(authorization.slice(7));
      if (!user || !validActor(user.id) || user.role !== 'authenticated' || typeof user.is_anonymous !== 'boolean') return reply({ error: 'Your saved-seat session expired. Reconnect without discarding pending actions.', sessionRequired: true }, 401);
      if (request.method === 'GET') {
        const url = new URL(request.url);
        const protocol = url.searchParams.getAll('protocolVersion');
        requireCurrentProtocol(protocol.length === 1 && protocol[0] === String(CURRENT_GAME_PROTOCOL) ? CURRENT_GAME_PROTOCOL : undefined);
        if (url.searchParams.get('session') === '1') return reply({ session: user.id });
        if (url.searchParams.get('history') === '1') {
          const rawCursor = url.searchParams.get('cursor');
          const parsed = rawCursor?.match(/^(\d{1,16}):([A-Z0-9]{6})$/);
          if (rawCursor && (!parsed || !Number.isSafeInteger(Number(parsed[1])))) throw new GameError(400, 'Invalid saved-games cursor');
          const cursor = parsed ? { updatedAt: Number(parsed[1]), code: parsed[2] } : undefined;
          const found = await deps.store.history(user.id, cursor), rooms = found.slice(0, 20), last = rooms.at(-1);
          return reply({ rooms, nextCursor: found.length > 20 && last ? `${last.updatedAt}:${last.code}` : null });
        }
        const code = url.searchParams.get('code');
        if (!validCode(code)) throw new GameError(400, 'Enter a six-character room code');
        const row = await deps.store.read(user.id, code);
        if (!row) throw new GameError(404, 'Room not found. Check the code.');
        return reply(roomView(row, user.id));
      }
      if (!request.headers.get('content-type')?.toLowerCase().startsWith('application/json')) throw new GameError(415, 'Use application/json');
      if (Number(request.headers.get('content-length') ?? '0') > 4096) throw new GameError(413, 'Request too large');
      // Bound bytes while reading, not just Content-Length (which callers control).
      const reader = request.body?.getReader();
      if (!reader) throw new GameError(400, 'Invalid request');
      const chunks: Uint8Array[] = []; let length = 0;
      for (;;) {
        const { value, done } = await reader.read(); if (done) break;
        length += value.length;
        if (length > 4096) { await reader.cancel(); throw new GameError(413, 'Request too large'); }
        chunks.push(value);
      }
      const bytes = new Uint8Array(length); let offset = 0;
      for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
      let input: unknown;
      try { input = JSON.parse(new TextDecoder().decode(bytes)); } catch { throw new GameError(400, 'Invalid request'); }
      return reply(await mutate(deps.store, user.id, input));
    } catch (error) {
      if (error instanceof GameError) return reply({ error: error.message, ...(error.identityChanged ? { identityMismatch: true } : {}), ...(error.refreshRequired ? { refreshRequired: true } : {}), ...(error.newLifeRequired ? { newLifeRequired: true } : {}) }, error.status);
      deps.reportError?.(error);
      return reply({ error: 'The connection to saved games was interrupted. Keep this action and check the last confirmed save before trying a different move.' }, 503);
    }
  };
}
