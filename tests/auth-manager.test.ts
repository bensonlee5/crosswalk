import assert from 'node:assert/strict';
import test from 'node:test';
import type { SupabaseClient } from '@supabase/supabase-js';
type FakeSession = { user: { id: string; is_anonymous: boolean; email?: string; email_confirmed_at?: string }; access_token: string };
type FakeAuthListener = (event: string, session: FakeSession | null) => void;
import { createAuthManager } from '../lib/auth-manager.ts';

function fixture({ existing = true, enabled = true, url = 'https://test.invalid/crosswalk/', callbackType = 'recovery', priorOwner = '', persistAnonymous = true } = {}) {
  const items = new Map<string, string>();
  if (priorOwner) items.set('cw_auth_guest_owner_v1', priorOwner);
  const storage = { get length() { return items.size; }, getItem: (key: string) => items.get(key) || null,
    setItem: (key: string, value: string) => { items.set(key, value); }, removeItem: (key: string) => { items.delete(key); },
    key: (n: number) => [...items.keys()][n] || null };
  const guest = { user: { id: 'guest-owner', is_anonymous: true, email: undefined as string | undefined, email_confirmed_at: undefined as string | undefined }, access_token: 'guest-token' };
  const account = { user: { id: 'account-owner', is_anonymous: false, email: 'saved@example.com', email_confirmed_at: 'today' }, access_token: 'account-token' };
  const sessions: Record<string, FakeSession | null> = { guest: existing ? guest : null, account: null };
  const callbacks: Record<string, FakeAuthListener> = {};
  const calls: [string, string, Record<string, string>?][] = [];
  let error: Error | null = null, signInError: Error | null = null;
  const clients: Record<string, unknown> = {};
  for (const slot of ['guest', 'account']) {
    const publish = (event: string) => callbacks[slot]?.(event, sessions[slot]);
    clients[slot] = { auth: {
      onAuthStateChange: (fn: FakeAuthListener) => { callbacks[slot] = fn; return { data: { subscription: { unsubscribe() {} } } }; },
      getSession: async () => ({ data: { session: sessions[slot] }, error }),
      getUser: async () => ({ data: { user: sessions[slot]?.user }, error }),
      signInAnonymously: async () => { calls.push(['anonymous', slot]); sessions[slot] = persistAnonymous ? guest : null; publish('SIGNED_IN'); return { data: { session: guest }, error: null }; },
      refreshSession: async () => ({ data: { session: sessions[slot] }, error }),
      updateUser: async (attrs: Record<string, string>) => { calls.push(['update', slot, attrs]); if (attrs.email === 'existing@example.com') return { data: {}, error: new Error('Email already exists') }; if (attrs.email) guest.user.email = attrs.email; if (attrs.password && sessions[slot]) sessions[slot].user.is_anonymous = false; publish('USER_UPDATED'); return { data: { user: sessions[slot]?.user }, error: null }; },
      signInWithPassword: async () => { calls.push(['signin', slot]); if (signInError) return { data: {}, error: signInError }; sessions[slot] = account; publish('SIGNED_IN'); return { data: { session: account }, error: null }; },
      signOut: async () => { calls.push(['signout', slot]); sessions[slot] = null; publish('SIGNED_OUT'); return { error: null }; },
      resetPasswordForEmail: async () => { calls.push(['reset', slot]); return { error: null }; },
      exchangeCodeForSession: async () => { calls.push(['exchange', slot]); sessions[slot] = account; publish(callbackType === 'recovery' ? 'PASSWORD_RECOVERY' : 'SIGNED_IN'); return { data: { session: account, redirectType: callbackType }, error: null }; },
    } };
  }
  let gate: Promise<unknown> = Promise.resolve();
  const withGuestCreationLock = (task: () => Promise<import('@supabase/supabase-js').Session>) => {
    const result = gate.then(task); gate = result.then(() => {}, () => {}); return result;
  };
  const newManager = () => createAuthManager({ client: (slot) => clients[slot] as SupabaseClient, storage,
    emailEnabled: enabled, withGuestCreationLock, callbackUrl: () => new URL(url), cleanCallback: () => {} });
  const manager = newManager();
  return { manager, newManager, items, calls, guest, sessions, callbacks, fail: (e: Error | null) => { error = e; }, failSignIn: (e: Error | null) => { signInError = e; } };
}

test('existing guest UID survives sign-in and explicit return', async () => {
  const f = fixture(); await f.manager.initialize();
  assert.equal((await f.manager.currentSession())?.user.id, 'guest-owner');
  await f.manager.signIn('saved@example.com', 'secret');
  assert.equal((await f.manager.currentSession())?.user.id, 'account-owner');
  assert.equal(f.sessions.guest.user.id, 'guest-owner');
  await f.manager.useGuest(); assert.equal((await f.manager.currentSession())?.user.id, 'guest-owner');
  assert.equal(f.calls.filter(c => c[0] === 'anonymous').length, 0);
});
test('failed sign-in and existing-email upgrade conflict do not replace guest', async () => {
  const f = fixture(); await f.manager.initialize(); f.failSignIn(new Error('Invalid login'));
  await assert.rejects(f.manager.signIn('saved@example.com', 'wrong'), /Invalid login/);
  await assert.rejects(f.manager.beginUpgrade('existing@example.com'), /already exists/);
  assert.equal(f.manager.getSnapshot().session?.user.id, 'guest-owner');
  assert.equal(f.manager.getSnapshot().upgrade, null);
  assert.equal(f.items.has('cw_auth_upgrade_v1'), false);
});
test('upgrade verifies email before accepting password and preserves same UID', async () => {
  const f = fixture(); await f.manager.initialize(); await f.manager.beginUpgrade('new@example.com');
  assert.equal(f.manager.getSnapshot().upgrade?.stage, 'verify');
  await assert.rejects(f.manager.finishUpgrade('a-good-password'), /Verify your email/);
  assert.equal(f.calls.filter(c => c[2]?.password).length, 0);
  f.guest.user.email_confirmed_at = 'today';
  assert.equal(await f.manager.checkVerification(), true);
  await f.manager.finishUpgrade('a-good-password');
  assert.equal(f.manager.getSnapshot().upgrade, null);
  assert.equal(f.manager.getSnapshot().session?.user.id, 'guest-owner');
  assert.equal(f.calls.filter(c => c[2]?.password).length, 1);
  assert(![...f.items.values()].some(v => v.includes('a-good-password')));
});
test('concurrent first game requests create one persisted guest', async () => {
  const f = fixture({ existing: false });
  const sessions = await Promise.all([f.manager.currentSession(true), f.manager.currentSession(true), f.manager.currentSession(true)]);
  assert(sessions.every(s => s?.user.id === 'guest-owner'));
  assert.equal(f.calls.filter(c => c[0] === 'anonymous').length, 1);
});
test('missing replay session and transient auth failures do not create replacement guests', async () => {
  const f = fixture({ existing: false }); await f.manager.initialize();
  assert.equal(await f.manager.currentSession(false), null);
  f.fail(new Error('Network unavailable')); await assert.rejects(f.manager.currentSession(true), /Network/);
  assert.equal(f.calls.filter(c => c[0] === 'anonymous').length, 0);
});
test('unconfigured email provider blocks auth writes while guest still works', async () => {
  const f = fixture({ enabled: false }); await f.manager.initialize();
  await assert.rejects(f.manager.beginUpgrade('a@example.com'), /not enabled/);
  await assert.rejects(f.manager.signIn('a@example.com', 'password'), /not enabled/);
  assert.equal((await f.manager.currentSession())?.user.id, 'guest-owner'); assert.equal(f.calls.length, 0);
});
test('URL query alone cannot authorize reset, verified recovery callback can', async () => {
  const forged = fixture({ url: 'https://test.invalid/crosswalk/?auth=recovery' }); await forged.manager.initialize();
  await assert.rejects(forged.manager.finishReset('new-password'), /fresh password-reset/);
  const valid = fixture({ url: 'https://test.invalid/crosswalk/?auth=recovery&code=verified-code' }); await valid.manager.initialize();
  assert.equal(valid.manager.getSnapshot().recoveryOwner, 'account-owner');
  await valid.manager.finishReset('new-password');
  assert.equal(valid.manager.getSnapshot().recoveryOwner, null);
  assert.equal(valid.sessions.guest.user.id, 'guest-owner');
});
test('ordinary auth exchange and changed identity cannot authorize reset', async () => {
  const wrong = fixture({ url: 'https://test.invalid/crosswalk/?auth=recovery&code=other-code', callbackType: 'signup' }); await wrong.manager.initialize();
  await assert.rejects(wrong.manager.finishReset('new-password'), /fresh password-reset/);
  const f = fixture({ url: 'https://test.invalid/crosswalk/?auth=recovery&code=verified-code' }); await f.manager.initialize();
  await f.manager.useGuest(); await assert.rejects(f.manager.finishReset('new-password'), /fresh password-reset/);
});
test('pending save blocks switching away, without deleting journal', async () => {
  const f = fixture(); await f.manager.initialize(); f.items.set('cw_pending_save_id', '{"request":{}}');
  await assert.rejects(f.manager.signIn('a@example.com', 'password'), /pending save/);
  assert(f.items.has('cw_pending_save_id')); assert.equal(f.sessions.guest.user.id, 'guest-owner');
});
test('deferred intentions allow switching and mismatched intentions allow restoring original guest', async () => {
  const f = fixture(); await f.manager.initialize();
  f.items.set('cw_pending_save_deferred', JSON.stringify({ deferred: true, request: { ownerSession: 'guest-owner' } }));
  await f.manager.signIn('saved@example.com', 'password');
  f.items.set('cw_pending_save_recover', JSON.stringify({ request: { ownerSession: 'guest-owner' } }));
  await f.manager.useGuest();
  assert.equal(f.manager.getSnapshot().session?.user.id, 'guest-owner');
  assert(f.items.has('cw_pending_save_recover'));
  await assert.rejects(f.manager.signIn('saved@example.com', 'password'), /pending save/);
});

test('remembered guest UID prevents automatic replacement on history reads or writes', async () => {
  const f = fixture({ existing: false, priorOwner: 'original-missing-owner' }); await f.manager.initialize();
  assert.equal(f.manager.getSnapshot().lostGuestOwner, 'original-missing-owner');
  await assert.rejects(f.manager.currentSession(true), /previous guest session is missing/);
  await assert.rejects(f.manager.currentSession(true), /No replacement guest/);
  assert.equal(await f.manager.currentSession(false), null);
  assert.equal(f.calls.filter(c => c[0] === 'anonymous').length, 0);
  assert.equal(f.items.get('cw_auth_guest_owner_v1'), 'original-missing-owner');
});
test('session invalidation retains prior owner and reload continues to refuse replacement', async () => {
  const f = fixture(); await f.manager.initialize();
  assert.equal(f.items.get('cw_auth_guest_owner_v1'), 'guest-owner');
  f.sessions.guest = null; f.callbacks.guest('SIGNED_OUT', null);
  assert.equal(f.manager.getSnapshot().lostGuestOwner, 'guest-owner');
  await assert.rejects(f.manager.currentSession(true), /previous guest session/);
  const reloaded = f.newManager(); await reloaded.initialize();
  await assert.rejects(reloaded.currentSession(true), /previous guest session/);
  assert.equal(f.calls.filter(c => c[0] === 'anonymous').length, 0);
});
test('explicit fresh start preserves old pending intent and separate account session', async () => {
  const f = fixture({ existing: false, enabled: false, priorOwner: 'original-missing-owner' });
  f.sessions.account = { user: { id: 'account-owner', is_anonymous: false }, access_token: 'separate-account-token' };
  const pending = JSON.stringify({ request: { ownerSession: 'original-missing-owner', requestId: 'exact-old-retry' }, createdAt: 10 });
  f.items.set('cw_pending_save_exact-old-retry', pending);
  await f.manager.initialize();
  const created = await f.manager.startFreshGuest();
  assert.equal(created.user.id, 'guest-owner');
  assert.equal(f.manager.getSnapshot().lostGuestOwner, null);
  assert.equal(f.items.get('cw_auth_guest_owner_v1'), 'guest-owner');
  assert.equal(f.items.get('cw_pending_save_exact-old-retry'), pending);
  assert.equal(f.sessions.account.access_token, 'separate-account-token');
  assert.equal(f.calls.filter(c => c[0] === 'anonymous').length, 1);
  await assert.rejects(f.manager.startFreshGuest(), /only available/);
});
test('account recovery stays available without creating a replacement guest', async () => {
  const f = fixture({ existing: false, priorOwner: 'original-missing-owner' }); await f.manager.initialize();
  await f.manager.sendReset('saved@example.com');
  await f.manager.signIn('saved@example.com', 'password');
  assert.equal((await f.manager.currentSession())?.user.id, 'account-owner');
  assert.equal(f.calls.filter(c => c[0] === 'anonymous').length, 0);
  assert.equal(f.items.get('cw_auth_guest_owner_v1'), 'original-missing-owner');
  assert.doesNotMatch(f.manager.getSnapshot().message, /guest game is still available/);
});
test('two tabs serialize first signup and verify the same persisted owner before returning', async () => {
  const f = fixture({ existing: false }); const secondTab = f.newManager();
  const sessions = await Promise.all([f.manager.currentSession(true), secondTab.currentSession(true)]);
  assert(sessions.every(session => session?.user.id === 'guest-owner'));
  assert.equal(f.calls.filter(c => c[0] === 'anonymous').length, 1);
  assert.equal(f.items.get('cw_auth_guest_owner_v1'), 'guest-owner');
});
test('clearing every browser record is indistinguishable from a first visit', async () => {
  const f = fixture({ existing: false });
  assert.equal((await f.manager.currentSession(true))?.user.id, 'guest-owner');
  assert.equal(f.calls.filter(c => c[0] === 'anonymous').length, 1);
});

test('failed explicit fresh start retains original marker and retry intention', async () => {
  const f = fixture({ existing: false, priorOwner: 'original-missing-owner' }); await f.manager.initialize();
  const pending = JSON.stringify({ request: { ownerSession: 'original-missing-owner', requestId: 'old' } });
  f.items.set('cw_pending_save_old', pending); f.fail(new Error('Network unavailable'));
  await assert.rejects(f.manager.startFreshGuest(), /Network unavailable/);
  assert.equal(f.items.get('cw_auth_guest_owner_v1'), 'original-missing-owner');
  assert.equal(f.items.get('cw_pending_save_old'), pending);
  assert.equal(f.manager.getSnapshot().lostGuestOwner, 'original-missing-owner');
});
test('first guest cannot be used for a game until SDK storage returns the same UID', async () => {
  const f = fixture({ existing: false, persistAnonymous: false });
  await assert.rejects(f.manager.currentSession(true), /before your guest was saved/);
  assert.equal(f.calls.filter(c => c[0] === 'anonymous').length, 1);
  await assert.rejects(f.manager.currentSession(true), /previous guest session is missing/);
  assert.equal(f.calls.filter(c => c[0] === 'anonymous').length, 1);
});
