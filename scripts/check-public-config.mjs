const url = process.env.VITE_SUPABASE_URL || '';
const key = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';
if (!/^https:\/\/[^/]+\.supabase\.co\/?$/.test(url) || !key.startsWith('sb_publishable_')) {
  throw new Error('Set the GitHub repository variables VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY before deployment. Only a public publishable key is allowed.');
}
console.log('Public Supabase deployment configuration is present.');
