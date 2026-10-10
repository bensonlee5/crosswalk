import type { Session, SupabaseClient } from '@supabase/supabase-js';

type Slot = 'guest' | 'account';
type Upgrade = { owner: string; email: string; stage: 'verify' | 'password' };
type StoragePort = Pick<Storage, 'getItem' | 'setItem' | 'removeItem' | 'key' | 'length'>;
export type AuthSnapshot = {
  ready: boolean; session: Session | null; slot: Slot; guestAvailable: boolean;
  upgrade: Upgrade | null; recoveryOwner: string | null; message: string; lostGuestOwner: string | null;
};
const activeKey = 'cw_auth_active_v1';
const upgradeKey = 'cw_auth_upgrade_v1';

/** Separate SDK storage slots keep a guest's seat recoverable after an explicit account switch. */
export function createAuthManager(options: {
  client: (slot: Slot) => SupabaseClient;
  storage: StoragePort;
  callbackUrl: () => URL;
  cleanCallback: () => void;
  emailEnabled: boolean;
  guestOwnerKey?: string;
  withGuestCreationLock?: (task: () => Promise<Session>) => Promise<Session>;
}) {
  const { storage } = options;
  const read = (key: string) => { try { return storage.getItem(key); } catch { return null; } };
  const write = (key: string, value: string) => storage.setItem(key, value);
  const guestOwnerKey = options.guestOwnerKey || 'cw_auth_guest_owner_v1';
  let priorGuestOwner = read(guestOwnerKey);
  let active: Slot = read(activeKey) === 'account' ? 'account' : 'guest';
  let upgrade: Upgrade | null = null;
  try { const data = JSON.parse(read(upgradeKey) || 'null'); if (data?.owner && data?.email && ['verify', 'password'].includes(data.stage)) upgrade = data; } catch { /* Ignore a damaged non-secret UI marker. */ }
  const sessions: Record<Slot, Session | null> = { guest: null, account: null };
  const clients = { guest: options.client('guest'), account: options.client('account') };
  let ready = false, message = '', recoveryOwner: string | null = null;
  let initialization: Promise<void> | undefined;
  let creatingGuest: Promise<Session> | undefined;
  const listeners = new Set<() => void>();
  let snapshot: AuthSnapshot;
  function emit() {
    snapshot = { ready, session: sessions[active], slot: active, guestAvailable: !!sessions.guest,
      upgrade: upgrade?.owner === sessions[active]?.user.id ? upgrade : null, recoveryOwner, message,
      lostGuestOwner: ready && active === 'guest' && !sessions.guest ? priorGuestOwner : null };
    for (const listener of listeners) listener();
  }
  function observeSession(slot: Slot, session: Session | null) {
    sessions[slot] = session;
    if (slot === 'guest' && session) {
      priorGuestOwner = session.user.id;
      try { write(guestOwnerKey, priorGuestOwner); }
      catch { message = 'Browser storage could not remember this guest identity. Keep this tab open and save an email account before leaving.'; }
    }
  }
  function missingGuestMessage() {
    return 'Your previous guest session is missing. Sign in to its saved email account, use the original browser, or explicitly start a separate guest history. No replacement guest has been created.';
  }
  function select(slot: Slot) { write(activeKey, slot); active = slot; emit(); }
  function saveUpgrade(value: Upgrade | null) {
    if (value) write(upgradeKey, JSON.stringify(value)); else storage.removeItem(upgradeKey);
    upgrade = value; emit();
  }
  function emailRequired() { if (!options.emailEnabled) throw new Error('Email accounts are not enabled yet. You can keep playing as a guest.'); }
  function noPending() {
    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i); if (!key?.startsWith('cw_pending_save_')) continue;
      let owner: string | undefined;
      try { const pending = JSON.parse(storage.getItem(key) || 'null'); if (pending?.deferred === true) continue; owner = pending?.request?.ownerSession; } catch { /* Keep uncertain saves protected. */ }
      // A mismatch must allow returning to the original identity to recover that intent.
      if (!owner || owner === sessions[active]?.user.id) throw new Error('Resolve your pending save before switching accounts. Your guest game is still preserved.');
    }
  }
  for (const slot of ['guest', 'account'] as const) {
    clients[slot].auth.onAuthStateChange((event, session) => {
      observeSession(slot, session);
      // A URL flag alone never enables password reset. Only the SDK's verified recovery event does.
      if (event === 'PASSWORD_RECOVERY' && session && !session.user.is_anonymous) recoveryOwner = session.user.id;
      if (recoveryOwner && slot === active && (!session || session.user.id !== recoveryOwner)) recoveryOwner = null;
      emit();
    });
  }
  emit();
  async function initialize() {
    if (!initialization) initialization = (async () => {
      try {
        for (const slot of ['guest', 'account'] as const) {
          const { data, error } = await clients[slot].auth.getSession();
          if (error) throw error;
          observeSession(slot, data.session);
        }
        const url = options.callbackUrl();
        if (url.searchParams.has('error') || url.hash.includes('error=')) {
          throw new Error('That email link could not be verified. Request a new link and open it in this browser.');
        }
        const code = url.searchParams.get('code');
        const action = url.searchParams.get('auth');
        if (code) {
          if (action !== 'upgrade' && action !== 'recovery') throw new Error('This sign-in link has no recognized purpose.');
          const slot: Slot = action === 'upgrade' ? 'guest' : 'account';
          if (action === 'upgrade' && (!upgrade || upgrade.owner !== sessions.guest?.user.id)) {
            throw new Error('Open the verification email in the browser where you started your guest account.');
          }
          if (action === 'recovery') recoveryOwner = null;
          const { data, error } = await clients[slot].auth.exchangeCodeForSession(code);
          if (error) throw new Error('That email link expired or belongs to another browser. Request a new link here.');
          if (!data.session) throw new Error('The email link did not establish a verified session.');
          if (action === 'upgrade' && data.session.user.id !== upgrade?.owner) {
            throw new Error('This link does not match the guest account being saved.');
          }
          observeSession(slot, data.session);
          if (action === 'recovery') {
            if (recoveryOwner !== data.session.user.id || data.session.user.is_anonymous) {
              throw new Error('Use a fresh password-reset email to change your password.');
            }
            recoveryOwner = data.session.user.id;
          }
          select(slot);
          if (action === 'upgrade') await checkVerification();
        }
      } catch (error) { message = error instanceof Error ? error.message : 'Account recovery could not finish.'; }
      finally { options.cleanCallback(); ready = true; emit(); }
    })();
    await initialization;
  }
  async function currentSession(create = false): Promise<Session | null> {
    await initialize();
    const { data, error } = await clients[active].auth.getSession();
    if (error) throw error; // Never replace a session merely because token refresh/network failed.
    observeSession(active, data.session);
    if (data.session) {
      if (active === 'guest') {
        try { write(guestOwnerKey, data.session.user.id); }
        catch { throw new Error('Browser storage cannot protect your guest identity. Keep this tab open and allow site storage before continuing.'); }
      }
      emit(); return data.session;
    }
    emit();
    if (!create) return null;
    if (active !== 'guest') throw new Error('Sign in again to recover this account. Your guest game is available separately.');
    if (creatingGuest) return creatingGuest;
    priorGuestOwner = read(guestOwnerKey) || priorGuestOwner;
    if (priorGuestOwner) { message = missingGuestMessage(); emit(); throw new Error(message); }
    return createGuest(false);
  }
  async function createGuest(explicitReplacement: boolean): Promise<Session> {
    if (!creatingGuest) {
      const task = async () => {
        // Recheck inside a cross-tab lock; a second tab may have finished the first guest signup.
        const existing = await clients.guest.auth.getSession();
        if (existing.error) throw existing.error;
        if (existing.data.session) { observeSession('guest', existing.data.session); emit(); return existing.data.session; }
        priorGuestOwner = read(guestOwnerKey) || priorGuestOwner;
        if (priorGuestOwner && !explicitReplacement) { message = missingGuestMessage(); emit(); throw new Error(message); }
        const { data: guest, error: failure } = await clients.guest.auth.signInAnonymously();
        if (failure) throw failure;
        if (!guest.session) throw new Error('Guest sign-in did not complete. Try again when connected.');
        observeSession('guest', guest.session);
        // Verify the SDK actually persisted the same identity before allowing the first game write.
        const stored = await clients.guest.auth.getSession();
        if (stored.error) throw stored.error;
        if (stored.data.session?.user.id !== guest.session.user.id) {
          observeSession('guest', stored.data.session);
          message = 'The browser session changed before your guest was saved. No game action was sent; try again.';
          emit(); throw new Error(message);
        }
        write(guestOwnerKey, guest.session.user.id);
        observeSession('guest', stored.data.session); emit(); return stored.data.session;
      };
      creatingGuest = (options.withGuestCreationLock ? options.withGuestCreationLock(task) : task())
        .finally(() => { creatingGuest = undefined; });
    }
    return creatingGuest;
  }
  async function checkVerification() {
    const marker = upgrade;
    if (!marker) return false;
    const { data, error } = await clients.guest.auth.getUser();
    if (error) throw error;
    if (data.user.id !== marker.owner) throw new Error('The guest account changed. Your pending account setup was not applied.');
    if (data.user.email?.toLowerCase() !== marker.email.toLowerCase() || !data.user.email_confirmed_at) return false;
    const refreshed = await clients.guest.auth.refreshSession();
    if (refreshed.error) throw refreshed.error;
    sessions.guest = refreshed.data.session;
    saveUpgrade({ ...marker, stage: 'password' });
    return true;
  }
  return {
    initialize,
    getSnapshot: () => snapshot,
    subscribe(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener); }; },
    currentSession,
    async startFreshGuest() {
      await initialize();
      if (active !== 'guest' || sessions.guest || !priorGuestOwner) throw new Error('A fresh start is only available after a missing guest session has been identified.');
      // This explicit choice never deletes prior pending intentions, upgrade metadata, or the separate account session.
      const session = await createGuest(true);
      recoveryOwner = null; message = 'A separate guest history is ready. Any old unconfirmed actions are still kept for checking with their original owner.'; emit();
      return session;
    },
    async beginUpgrade(email: string) {
      emailRequired();
      const session = await currentSession(true);
      if (!session?.user.is_anonymous || active !== 'guest') throw new Error('This session already has an account.');
      const marker: Upgrade = { owner: session.user.id, email: email.trim(), stage: 'verify' };
      // Persist the intended owner before sending, but never persist a password.
      saveUpgrade(marker);
      const redirect = options.callbackUrl(); redirect.search = '?auth=upgrade'; redirect.hash = '';
      const { data, error } = await clients.guest.auth.updateUser({ email: marker.email }, { emailRedirectTo: redirect.href });
      if (error) { saveUpgrade(null); throw error; }
      if (data.user.id !== marker.owner) throw new Error('The account changed unexpectedly.');
      message = 'Check your email, verify the address in this browser, then choose a password. Your guest progress stays with this account.'; emit();
    },
    checkVerification,
    async finishUpgrade(password: string) {
      emailRequired();
      if (!await checkVerification() || !upgrade || upgrade.owner !== sessions[active]?.user.id) {
        throw new Error('Verify your email before choosing a password.');
      }
      const { data, error } = await clients.guest.auth.updateUser({ password });
      if (error) throw error;
      if (data.user.id !== upgrade.owner) throw new Error('The account changed unexpectedly.');
      saveUpgrade(null); message = 'Account saved. Your existing guest progress is still yours.'; emit();
    },
    async signIn(email: string, password: string) {
      emailRequired(); await initialize(); noPending();
      const { data, error } = await clients.account.auth.signInWithPassword({ email: email.trim(), password });
      if (error) throw error;
      if (!data.session) throw new Error('Sign-in did not create a session.');
      sessions.account = data.session; recoveryOwner = null; select('account');
      message = sessions.guest ? 'Signed in. Your guest game is still available in this browser.' : 'Signed in to your saved account. Any missing guest session has not been replaced.'; emit();
    },
    async useGuest() {
      await initialize(); noPending(); recoveryOwner = null; select('guest');
      await currentSession(true); message = ''; emit();
    },
    async signOut() {
      await initialize(); noPending();
      const slot = active;
      if (sessions[slot]?.user.is_anonymous) throw new Error('Save your guest account before signing out.');
      const { error } = await clients[slot].auth.signOut({ scope: 'local' });
      if (error) throw error;
      sessions[slot] = null; recoveryOwner = null; select('guest'); message = 'Signed out on this device.'; emit();
    },
    async sendReset(email: string) {
      emailRequired(); await initialize();
      const redirect = options.callbackUrl(); redirect.search = '?auth=recovery'; redirect.hash = '';
      const { error } = await clients.account.auth.resetPasswordForEmail(email.trim(), { redirectTo: redirect.href });
      if (error) throw error;
      message = 'If that address has an account, a password-reset email is on its way. Open it in this browser.'; emit();
    },
    async finishReset(password: string) {
      emailRequired();
      const session = await currentSession(false);
      if (!recoveryOwner || session?.user.id !== recoveryOwner || session.user.is_anonymous) {
        throw new Error('Open a fresh password-reset email before setting a password.');
      }
      // Ask Auth to validate this exact session immediately before the sensitive update.
      const { data: verified, error: verificationError } = await clients[active].auth.getUser();
      if (verificationError) throw verificationError;
      if (verified.user.id !== recoveryOwner) throw new Error('Your recovery session changed. Request a new link.');
      const { error } = await clients[active].auth.updateUser({ password });
      if (error) throw error;
      recoveryOwner = null; message = 'Password updated. You are signed in.'; emit();
    },
  };
}
export type AuthManager = ReturnType<typeof createAuthManager>;
