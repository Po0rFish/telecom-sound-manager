-- Run in the Supabase SQL Editor. Read-only: no grants, policies or data are changed.
-- Inspect all result sets before deciding which project permissions to change.

-- Table RLS settings, including Storage metadata.
select n.nspname as schema_name, c.relname as table_name,
       c.relrowsecurity as rls_enabled, c.relforcerowsecurity as rls_forced
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where (n.nspname = 'public' and c.relname in ('owners', 'sounds'))
   or (n.nspname = 'storage' and c.relname in ('objects', 'buckets'));

-- Effective privileges include inherited grants and grants to PUBLIC.
select r.role_name, t.table_name, p.privilege,
       has_table_privilege(r.role_name, t.table_name, p.privilege) as allowed
from (values ('anon'), ('authenticated')) as r(role_name)
cross join (values ('public.owners'), ('public.sounds'),
                   ('storage.objects'), ('storage.buckets')) as t(table_name)
cross join (values ('SELECT'), ('INSERT'), ('UPDATE'), ('DELETE'),
                   ('TRUNCATE'), ('REFERENCES'), ('TRIGGER')) as p(privilege)
order by r.role_name, t.table_name, p.privilege;

-- Broad policies can combine with narrower policies; review every matching policy.
select schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
from pg_policies
where (schemaname = 'public' and tablename in ('owners', 'sounds'))
   or (schemaname = 'storage' and tablename in ('objects', 'buckets'))
order by schemaname, tablename, policyname;

-- Callable public functions may provide another write path, especially SECURITY DEFINER.
select p.oid::regprocedure::text as function_name,
       p.prosecdef as security_definer, p.provolatile as volatility,
       has_function_privilege('anon', p.oid, 'EXECUTE') as anon_execute,
       has_function_privilege('authenticated', p.oid, 'EXECUTE') as authenticated_execute
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
order by function_name;

select id, name, public, file_size_limit, allowed_mime_types
from storage.buckets
where id = 'sounds';
