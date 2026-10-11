import { getAuthManager, backendConfigured, supabasePublishableKey, supabaseUrl } from './supabase-client';

export async function getOwnerSession(): Promise<string> {
  const session = await getAuthManager().currentSession(true);
  if (!session) throw new Error('A saved guest or account session is required.');
  return session.user.id;
}

/** Authenticated commands go only to the authoritative game service. */
export const gameFetch: typeof fetch = async (input, init) => {
  const requestPath = input instanceof Request ? input.url : String(input);
  const parsed = new URL(requestPath, window.location.origin);
  if (parsed.origin !== window.location.origin || parsed.pathname !== '/api/game') throw new Error('Unsupported game endpoint.');
  const method = (init?.method || (input instanceof Request ? input.method : 'GET')).toUpperCase();
  const manager = getAuthManager();
  // Pending replays may use only an already-existing identity. Never sign in a replacement guest here.
  const session = await manager.currentSession(method === 'GET');
  if (!session) return Response.json({ error: 'Your saved session is missing. Sign in to the original account before retrying.', identityMismatch: true }, { status: 403 });
  if (method !== 'GET') {
    const body = init?.body ?? (input instanceof Request ? await input.clone().text() : undefined);
    if (typeof body !== 'string') throw new Error('Game writes must contain a JSON save request.');
    const save = JSON.parse(body);
    if (!save.ownerSession || save.ownerSession !== session.user.id) {
      return Response.json({ error: 'This pending save belongs to a different account. Switch back to its original guest or account before retrying.', identityMismatch: true }, { status: 403 });
    }
  }
  const headers = new Headers(input instanceof Request ? input.headers : undefined);
  new Headers(init?.headers).forEach((value, name) => headers.set(name, value));
  headers.set('Authorization', `Bearer ${session.access_token}`);
  headers.set('apikey', supabasePublishableKey);
  return fetch(`${supabaseUrl}/functions/v1/crosswalk-game${parsed.search}`, {
    ...init, method, headers, credentials: 'omit', cache: 'no-store',
    ...(input instanceof Request && !init?.body && method !== 'GET' ? { body: await input.clone().text() } : {}),
  });
};

/** Mount once for the whole game, not only while the optional account panel is visible. */
export function subscribeOwnerSession(listener: (owner: string | null) => void): () => void {
  if (!backendConfigured) return () => {};
  let stopped = false, previous: string | null | undefined;
  try {
    const manager = getAuthManager();
    const receive = () => {
      const state = manager.getSnapshot();
      if (stopped || !state.ready) return;
      const owner = state.session?.user.id || null;
      if (owner !== previous) { previous = owner; listener(owner); }
    };
    const unsubscribe = manager.subscribe(receive);
    receive();
    void manager.initialize().then(receive).catch(() => { /* Reads/writes surface any storage/auth error. */ });
    return () => { stopped = true; unsubscribe(); };
  } catch { return () => {}; }
}
