import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import ts from 'typescript';
const source = readFileSync(new URL('../lib/game-api.ts', import.meta.url), 'utf8').replace(/^import .*supabase-client.*;$/m,
  "const { getAuthManager, backendConfigured, supabasePublishableKey, supabaseUrl } = globalThis.__apiDependencies;");
const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ESNext } }).outputText;
let session = { user: { id: 'owner-1' }, access_token: 'user-token' }, creates = [], calls = [];
let ready = true; const listeners = new Set();
const manager = { currentSession: async create => { creates.push(create); return session; }, getSnapshot: () => ({ready,session}), subscribe: listener => {listeners.add(listener);return () => listeners.delete(listener);}, initialize: async () => {} };
const emit = () => { for (const listener of listeners) listener(); };
globalThis.__apiDependencies = { backendConfigured: true, getAuthManager: () => manager, supabasePublishableKey: 'sb_publishable_test', supabaseUrl: 'https://project.supabase.co' };
globalThis.window = { location: { origin: 'https://player.example' } };
const oldFetch = globalThis.fetch;
globalThis.fetch = async (url, init) => { calls.push({ url, init }); return Response.json({ ok: true }); };
const { gameFetch, getOwnerSession, subscribeOwnerSession } = await import('data:text/javascript;base64,' + Buffer.from(js).toString('base64'));
test.after(() => { globalThis.fetch = oldFetch; delete globalThis.window; delete globalThis.__apiDependencies; });

test('transport forwards query, bearer and publishable key to only the Edge Function', async () => {
  await gameFetch('/api/game?code=ABC123');
  assert.equal(calls.at(-1).url, 'https://project.supabase.co/functions/v1/crosswalk-game?code=ABC123');
  assert.equal(calls.at(-1).init.headers.get('Authorization'), 'Bearer user-token');
  assert.equal(calls.at(-1).init.headers.get('apikey'), 'sb_publishable_test');
  assert.equal(calls.at(-1).init.credentials, 'omit');
  await assert.rejects(gameFetch('https://third-party.example/api/game'), /Unsupported/);
});
test('matching pending request retains byte-for-byte body, owner and request ID', async () => {
  const body = JSON.stringify({ op: 'move', requestId: 'one-exact-retry', ownerSession: 'owner-1', version: 3, action: 'end' });
  await gameFetch('/api/game', { method: 'POST', body });
  assert.equal(creates.at(-1), false); assert.equal(calls.at(-1).init.body, body);
});
test('mismatch and missing replay identities return recoverable 403 without network or new guest', async () => {
  const before = calls.length;
  const options = { method: 'POST', body: JSON.stringify({ op: 'move', requestId: 'old-retry', ownerSession: 'different-owner' }) };
  let response = await gameFetch('/api/game', options);
  assert.equal(response.status, 403); assert.equal((await response.json()).identityMismatch, true);
  session = null; response = await gameFetch('/api/game', options);
  assert.equal(response.status, 403); assert.equal((await response.json()).identityMismatch, true);
  assert.equal(creates.at(-1), false); assert.equal(calls.length, before);
  session = { user: { id: 'owner-1' }, access_token: 'user-token' };
  assert.equal(await getOwnerSession(), 'owner-1'); assert.equal(creates.at(-1), true);
});

test('app-lifetime owner subscription ignores token refresh, emits identity loss and unsubscribes', async () => {
  const owners = []; ready = false;
  const unsubscribe = subscribeOwnerSession(owner => owners.push(owner));
  emit(); assert.deepEqual(owners, []);
  ready = true; emit(); emit();
  assert.deepEqual(owners, ['owner-1']);
  session = { user: { id: 'owner-1' }, access_token: 'refreshed-token' }; emit();
  assert.deepEqual(owners, ['owner-1']);
  session = { user: { id: 'owner-2' }, access_token: 'different-token' }; emit();
  session = null; emit();
  assert.deepEqual(owners, ['owner-1', 'owner-2', null]);
  unsubscribe(); session = { user: { id: 'owner-1' }, access_token: 'user-token' }; emit();
  await Promise.resolve(); assert.deepEqual(owners, ['owner-1', 'owner-2', null]);
});
