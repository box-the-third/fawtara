-- ════════════════════════════════════════════════════════════════
--  Fawtara — security hardening (from Supabase advisors)
-- ════════════════════════════════════════════════════════════════

-- 1. Pin the trigger function's search_path.
alter function public.touch_updated_at() set search_path = public;

-- 2. Organizations may only be created through the create_organization RPC
--    (SECURITY DEFINER), which also creates the owner membership. Removing
--    the direct always-true INSERT policy prevents orphan orgs.
drop policy if exists "auth can create org" on public.organizations;

-- 3. Restrict SECURITY DEFINER functions to the roles that need them.
--    is_org_member is referenced inside RLS policies → authenticated needs EXECUTE.
revoke execute on function public.create_organization(text, text, text, text, boolean, numeric, text) from public, anon;
grant  execute on function public.create_organization(text, text, text, text, boolean, numeric, text) to authenticated;

revoke execute on function public.next_document_number(uuid, public.doc_type) from public, anon;
grant  execute on function public.next_document_number(uuid, public.doc_type) to authenticated;

revoke execute on function public.is_org_member(uuid) from anon;
grant  execute on function public.is_org_member(uuid) to authenticated;

-- 4. Public bucket object URLs resolve without a SELECT policy; drop the
--    broad listing policy so clients cannot enumerate every uploaded file.
drop policy if exists "assets public read" on storage.objects;

-- NOTE (manual, dashboard only): enable "Leaked password protection"
-- under Authentication → Providers → Email for HaveIBeenPwned checks.
