import { useEffect, useRef, useState, type FormEvent } from 'react';
import { UserRound } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from './ui/dialog';
import { backendConfigured, emailAuthEnabled, getAuthManager } from '../lib/supabase-client';
import type { AuthSnapshot } from '../lib/auth-manager';

type Props = { onSessionChange?: (owner: string | null) => void; disabled?: boolean };
export default function AccountPanel({ onSessionChange, disabled = false }: Props) {
  const [open, setOpen] = useState(false);
  const [freshConfirmed, setFreshConfirmed] = useState(false);
  const [state, setState] = useState<AuthSnapshot | null>(null);
  const [mode, setMode] = useState<'upgrade' | 'signin' | 'reset'>('upgrade');
  const [email, setEmail] = useState(''), [password, setPassword] = useState(''), [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false), [error, setError] = useState(''), [notice, setNotice] = useState('');
  const callback = useRef(onSessionChange);
  useEffect(() => { callback.current = onSessionChange; }, [onSessionChange]);
  const previous = useRef<string | null | undefined>(undefined);
  const openedFor = useRef('');
  useEffect(() => {
    if (!backendConfigured) return;
    let alive = true;
    let unsubscribe = () => {};
    void Promise.resolve().then(() => getAuthManager()).then(auth => {
      if (!alive) return;
      const receive = () => {
        if (!alive) return;
        const next = auth.getSnapshot(); setState(next);
        if (!next.ready) return;
        const id = next.session?.user.id || null;
        if (previous.current !== id) { previous.current = id; callback.current?.(id); setPassword(''); setConfirm(''); }
        const reason = next.recoveryOwner ? 'recovery:' + next.recoveryOwner : next.upgrade?.stage === 'password' ? 'upgrade:' + next.upgrade.owner : next.lostGuestOwner ? 'missing:' + next.lostGuestOwner : next.message && /link|verification/i.test(next.message) ? next.message : '';
        if (reason && openedFor.current !== reason) { openedFor.current = reason; setOpen(true); setFreshConfirmed(false); if (next.lostGuestOwner) setMode('signin'); }
      };
      receive(); unsubscribe = auth.subscribe(receive); return auth.initialize().then(receive);
    }).catch(() => { if (alive) setError('Browser storage is unavailable. Allow site storage so your guest progress can be recovered.'); });
    return () => { alive = false; unsubscribe(); };
  }, []);
  const user = state?.session?.user;
  const isGuest = !user || user.is_anonymous;
  const upgrading = state?.upgrade;
  const settingPassword = !!state?.recoveryOwner || upgrading?.stage === 'password';
  function clearFields() { setPassword(''); setConfirm(''); setError(''); setNotice(''); setFreshConfirmed(false); }
  async function run(task: () => Promise<unknown>) {
    if (busy || disabled) return;
    setBusy(true); setError(''); setNotice('');
    try { await task(); } catch (failure) { setError(failure instanceof Error ? failure.message : 'Please try again.'); }
    finally { setBusy(false); setPassword(''); setConfirm(''); }
  }
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (settingPassword && (password.length < 10 || password !== confirm)) {
      setError(password !== confirm ? 'The passwords do not match.' : 'Choose a password with at least 10 characters.'); return;
    }
    await run(async () => {
      const auth = getAuthManager();
      if (state?.recoveryOwner) await auth.finishReset(password);
      else if (upgrading?.stage === 'password') await auth.finishUpgrade(password);
      else if (mode === 'signin') await auth.signIn(email, password);
      else if (mode === 'reset') await auth.sendReset(email);
      else await auth.beginUpgrade(email);
    });
  }
  const label = state?.lostGuestOwner ? 'Recover your saved games' : user && !isGuest ? 'Your account' : 'Save your guest account';
  return <section className="cw-account">
    <button type="button" className="text-button cw-account-trigger" onClick={() => setOpen(true)}><UserRound size={16} />{label}</button>
    {state?.lostGuestOwner && <p className="cw-account-error" role="status">Your previous guest session is missing. No replacement guest has been created. Open account recovery to choose what happens next.</p>}
    <small>Guest access depends on this browser’s site data. If all site data is cleared, we cannot detect the earlier guest identity.</small>
    {!backendConfigured && <small>Online saving is waiting for setup.</small>}
    {backendConfigured && !emailAuthEnabled && <small>{state?.lostGuestOwner ? 'Email accounts are not enabled yet. Review the guest recovery options above.' : 'Guest play is available. Email accounts are not enabled yet.'}</small>}
    <Dialog open={open} onOpenChange={(value) => { if (!busy) { setOpen(value); clearFields(); } }}>
      <DialogContent className="cw-account-dialog">
        <DialogTitle>{state?.lostGuestOwner ? 'Recover your saved games' : state?.recoveryOwner ? 'Choose a new password' : settingPassword ? 'Finish saving your account' : 'Your Crosswalk account'}</DialogTitle>
        <DialogDescription>Playing as a guest is welcome. An optional email account lets you return to your saved games on another device.</DialogDescription>
        {state?.lostGuestOwner && <div className="cw-account-lost-session">
          <p role="alert">The saved identity for your previous guest is still remembered here, but its sign-in session is missing. We have paused automatic guest creation so it cannot quietly hide your old history.</p>
          <p>If you saved an email account, sign in below or reset its password. Otherwise, try the browser where that guest is still signed in. A room code cannot restore ownership.</p>
          <label className="cw-fresh-consent"><input type="checkbox" checked={freshConfirmed} onChange={event => setFreshConfirmed(event.target.checked)} disabled={busy || disabled} />I understand that starting fresh creates a separate guest history and does not recover the old games.</label>
          <button type="button" disabled={busy || disabled || !freshConfirmed} onClick={() => { if (freshConfirmed) void run(() => getAuthManager().startFreshGuest()); }}>Start a separate guest history</button>
          <small>Old unconfirmed actions stay kept with their original owner. Your separate email-account session is preserved.</small>
        </div>}
        {!backendConfigured ? <p role="status">Crosswalk’s online backend is not connected yet. Account setup and cloud saving will become available after it is configured.</p> : !emailAuthEnabled ? <p role="status">Email accounts are still being set up. Keep using the same browser for your guest progress; clearing site data can remove access to it.</p> : <>
          {disabled && <p className="cw-account-note">Finish the current save before changing accounts.</p>}
          {state && !state.ready && <p role="status">Checking your saved session…</p>}
          {state?.ready && <>
            {user && !isGuest && !settingPassword && !upgrading ? <div className="cw-account-current">
              <p>Signed in as <strong>{user.email}</strong></p>
              <p>Your saved games follow this account.</p>
              <button type="button" disabled={busy || disabled} onClick={() => void run(() => getAuthManager().signOut())}>Sign out on this device</button>
            </div> : <>
              {!settingPassword && !upgrading && <div className="cw-account-tabs" aria-label="Account options">
                <button type="button" disabled={!!state?.lostGuestOwner} aria-pressed={mode === 'upgrade'} onClick={() => { setMode('upgrade'); clearFields(); }}>Save guest</button>
                <button type="button" aria-pressed={mode === 'signin'} onClick={() => { setMode('signin'); clearFields(); }}>Sign in</button>
                <button type="button" aria-pressed={mode === 'reset'} onClick={() => { setMode('reset'); clearFields(); }}>Reset password</button>
              </div>}
              {upgrading?.stage === 'verify' ? <div className="cw-account-verification">
                <p>Verification pending for <strong>{upgrading.email}</strong>.</p>
                <p>Open the email link in this browser. Then return here to choose a password. Your guest game stays playable while you wait.</p>
                <button type="button" disabled={busy || disabled} onClick={() => void run(async () => { const done = await getAuthManager().checkVerification(); if (!done) setNotice('Your email is not verified yet. Check your inbox and spam folder.'); })}>I’ve verified my email</button>
                <button type="button" disabled={busy || disabled} onClick={() => void run(() => getAuthManager().beginUpgrade(upgrading.email))}>Resend verification email</button>
                <button type="button" disabled={busy} onClick={() => setOpen(false)}>Keep playing as a guest</button>
              </div> : <form onSubmit={submit}>
                {!settingPassword && <label>Email address<input type="email" autoComplete="email" required value={email} onChange={event => setEmail(event.target.value)} disabled={busy || disabled} /></label>}
                {(settingPassword || mode === 'signin') && <label>{settingPassword ? 'New password' : 'Password'}<input type="password" autoComplete={settingPassword ? 'new-password' : 'current-password'} minLength={settingPassword ? 10 : undefined} required value={password} onChange={event => setPassword(event.target.value)} disabled={busy || disabled} /></label>}
                {settingPassword && <label>Confirm new password<input type="password" autoComplete="new-password" required value={confirm} onChange={event => setConfirm(event.target.value)} disabled={busy || disabled} /></label>}
                {mode === 'upgrade' && !settingPassword && <p>First verify your email, then set a password. Your guest games keep the same owner.</p>}
                {mode === 'signin' && !settingPassword && <p>{state?.lostGuestOwner ? 'Sign in to the account that owns your saved games. This does not create a replacement guest or change old pending actions.' : 'Your guest game stays saved in this browser. Signing in opens that account’s games; the two histories are kept separately.'}</p>}
                <button type="submit" className="primary" disabled={busy || disabled}>{busy ? 'Please wait…' : settingPassword ? 'Save password' : mode === 'signin' ? 'Sign in' : mode === 'reset' ? 'Send reset email' : 'Verify email and keep my progress'}</button>
              </form>}
            </>}
          </>}
        </>}
        {state?.slot === 'account' && state.guestAvailable && <button type="button" disabled={busy || disabled} onClick={() => void run(() => getAuthManager().useGuest())}>Return to this browser’s guest game</button>}
        {(notice || state?.message) && <p className="cw-account-note" role="status">{notice || state?.message}</p>}
        {error && <p className="cw-account-error" role="alert">{error}</p>}
      </DialogContent>
    </Dialog>
  </section>;
}
