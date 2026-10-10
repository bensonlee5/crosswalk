import { createClient } from '@supabase/supabase-js';
import { createAuthManager } from './auth-manager';
import { homeUrl } from './asset-url';

const url = import.meta.env.VITE_SUPABASE_URL?.replace(/\/$/, '') || '';
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';
export const backendConfigured = /^https:\/\/[^/]+\.supabase\.co$/.test(url) && key.startsWith('sb_publishable_');
export const emailAuthEnabled = backendConfigured && import.meta.env.VITE_EMAIL_AUTH_ENABLED === 'true';
export const supabaseUrl = url;
export const supabasePublishableKey = key;
let manager: ReturnType<typeof createAuthManager> | undefined;
export function getAuthManager() {
  if (!backendConfigured) throw new Error('Online saving is not connected yet. Please try again after Crosswalk setup is complete.');
  if (!manager) {
    // Refuse an ephemeral guest session: losing browser storage would make its progress unrecoverable.
    const probe = 'cw_storage_probe'; window.localStorage.setItem(probe, '1'); window.localStorage.removeItem(probe);
    const project = new URL(url).hostname.split('.')[0];
    manager = createAuthManager({
      client: (slot) => createClient(url, key, { auth: { storageKey: `cw_${project}_${slot}_v1`,
        persistSession: true, autoRefreshToken: true, detectSessionInUrl: false, flowType: 'pkce' } }),
      storage: window.localStorage,
      guestOwnerKey: `cw_${project}_guest_owner_v1`,
      withGuestCreationLock: async task => {
        if (!navigator.locks) throw new Error('This browser cannot safely create a recoverable guest across tabs. Use an up-to-date browser, or sign in to an existing account.');
        return navigator.locks.request(`cw_${project}_guest_creation_v1`, task);
      },
      emailEnabled: emailAuthEnabled,
      callbackUrl: () => new URL(window.location.href),
      cleanCallback: () => {
        const current = new URL(window.location.href);
        if (current.searchParams.has('code') || current.searchParams.has('auth') || current.searchParams.has('error') || /(?:access_token|error)=/.test(current.hash)) {
          const clean = new URL(homeUrl());
          const room = current.searchParams.get('room'); if (room) clean.searchParams.set('room', room);
          window.history.replaceState(null, '', clean.pathname + clean.search);
        }
      },
    });
  }
  return manager;
}
