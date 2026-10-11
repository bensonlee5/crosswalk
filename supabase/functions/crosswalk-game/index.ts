import { createClient } from '@supabase/supabase-js';
import { createHandler } from './handler.ts';
import { postgresStore } from './postgres-store.ts';

const required = (name: string) => {
  const value = Deno.env.get(name);
  if (!value) throw new Error(`Missing ${name}`);
  return value;
};
const url = required('SUPABASE_URL');
// Supabase supplies the two server-only environment values below. They stay
// inside Edge Functions; the site bundle gets ONLY its publishable key.
const options = { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } };
const authClient = createClient(url, required('SUPABASE_ANON_KEY'), options);
const admin = createClient(url, required('SUPABASE_SERVICE_ROLE_KEY'), options);
const allowedOrigins = required('CROSSWALK_ALLOWED_ORIGINS').split(',').map(v => v.trim()).filter(Boolean);

Deno.serve(createHandler({
  allowedOrigins,
  store: postgresStore(admin),
  authenticate: async token => {
    const { data, error } = await authClient.auth.getUser(token);
    if (error || !data.user) {
      // Auth outage/rate-limit is uncertain, not evidence that identity was lost.
      if (error && (error.status === undefined || error.status === 429 || error.status >= 500)) throw new Error('Authentication temporarily unavailable');
      return null;
    }
    return { id: data.user.id, role: data.user.role ?? '', is_anonymous: data.user.is_anonymous === true };
  },
  // Never log request bodies, Authorization, emails, tokens or raw provider errors.
  reportError: () => console.error('Crosswalk saved-game request unavailable'),
}));
