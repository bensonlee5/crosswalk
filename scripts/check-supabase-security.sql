-- Read-only checks for the NEW Crosswalk project after applying the migration.
-- Run as a project owner. Do not paste credentials or query individual users.
select n.nspname as schema_name, c.relname as table_name, c.relrowsecurity as rls_enabled,
  has_table_privilege('anon', c.oid, 'SELECT,INSERT,UPDATE,DELETE') as anon_access,
  has_table_privilege('authenticated', c.oid, 'SELECT,INSERT,UPDATE,DELETE') as authenticated_access
from pg_class c join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'crosswalk_private' and c.relkind = 'r'
order by c.relname;

select n.nspname as schema_name, p.proname, p.prosecdef as security_definer,
  has_function_privilege('anon', p.oid, 'EXECUTE') as anon_execute,
  has_function_privilege('authenticated', p.oid, 'EXECUTE') as authenticated_execute,
  has_function_privilege('service_role', p.oid, 'EXECUTE') as service_execute,
  p.proconfig
from pg_proc p join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'crosswalk_private' or (n.nspname = 'public' and p.proname like 'crosswalk_%')
order by n.nspname, p.proname;

-- Desired: RLS true; client accesses false; no security-definer functions;
-- client execute false; service execute true; every search_path empty.
select public.crosswalk_usage_counts();
