-- ════════════════════════════════════════════════════════════════
--  Fawtara — Modular Document & Invoice SaaS
--  Multi-tenant schema with Row-Level Security (RLS)
--  Tenancy model: auth.users --< memberships >-- organizations
-- ════════════════════════════════════════════════════════════════

-- ── Enums ──────────────────────────────────────────────────────
do $$ begin
  create type doc_type as enum
    ('TENDER','OFFER_LETTER','NOC','POLICY_LETTER','INVOICE','CUSTOM');
exception when duplicate_object then null; end $$;

do $$ begin
  create type doc_status as enum ('DRAFT','ISSUED','PAID','VOID');
exception when duplicate_object then null; end $$;

do $$ begin
  create type member_role as enum ('OWNER','ADMIN','MEMBER');
exception when duplicate_object then null; end $$;

-- ── updated_at helper ──────────────────────────────────────────
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

-- ── Organizations (tenants) ────────────────────────────────────
create table if not exists public.organizations (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  logo_url    text,
  vat_number  text,
  currency    text not null default 'SAR',
  language    text not null default 'ar',      -- 'ar' | 'en'
  is_rtl      boolean not null default true,
  tax_rate    numeric not null default 15.0,   -- default VAT %
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ── Memberships (user ↔ org) ───────────────────────────────────
create table if not exists public.memberships (
  id        uuid primary key default gen_random_uuid(),
  org_id    uuid not null references public.organizations(id) on delete cascade,
  user_id   uuid not null references auth.users(id) on delete cascade,
  role      member_role not null default 'OWNER',
  created_at timestamptz not null default now(),
  unique (org_id, user_id)
);
create index if not exists memberships_user_idx on public.memberships(user_id);
create index if not exists memberships_org_idx  on public.memberships(org_id);

-- Membership check used by every tenant policy.
-- SECURITY DEFINER so it bypasses RLS on memberships (prevents recursion).
create or replace function public.is_org_member(p_org uuid)
returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.memberships m
    where m.org_id = p_org and m.user_id = auth.uid()
  );
$$;

-- ── Clients (of a tenant) ──────────────────────────────────────
create table if not exists public.clients (
  id           uuid primary key default gen_random_uuid(),
  org_id       uuid not null references public.organizations(id) on delete cascade,
  name         text not null,
  company_name text,
  email        text,
  phone        text,
  logo_url     text,
  vat_number   text,
  address      text,
  created_at   timestamptz not null default now()
);
create index if not exists clients_org_idx on public.clients(org_id);

-- ── Product catalog (optional line-item source) ────────────────
create table if not exists public.product_categories (
  id      uuid primary key default gen_random_uuid(),
  org_id  uuid not null references public.organizations(id) on delete cascade,
  name    text not null
);
create index if not exists product_categories_org_idx on public.product_categories(org_id);

create table if not exists public.products (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null references public.organizations(id) on delete cascade,
  category_id uuid references public.product_categories(id) on delete set null,
  name        text not null,
  description text,
  unit_price  numeric not null default 0
);
create index if not exists products_org_idx on public.products(org_id);

-- ── Templates (global defaults have org_id = null) ─────────────
create table if not exists public.templates (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid references public.organizations(id) on delete cascade,
  title       text not null,
  doc_type    doc_type not null,
  html_content text,
  css_content  text,
  is_default  boolean not null default false,
  is_rtl      boolean not null default true
);
create index if not exists templates_org_idx on public.templates(org_id);

-- ── Documents ──────────────────────────────────────────────────
create table if not exists public.documents (
  id              uuid primary key default gen_random_uuid(),
  org_id          uuid not null references public.organizations(id) on delete cascade,
  title           text not null,
  doc_type        doc_type not null,
  document_number text not null,
  status          doc_status not null default 'DRAFT',
  is_rtl          boolean not null default true,
  currency        text not null default 'SAR',

  -- dual-branding overrides
  user_logo_url   text,
  client_logo_url text,

  -- financials
  subtotal        numeric not null default 0,
  tax_rate        numeric not null default 15.0,
  tax_amount      numeric not null default 0,
  total_amount    numeric not null default 0,

  payload         jsonb   not null default '{}'::jsonb,
  pdf_url         text,

  client_id       uuid references public.clients(id) on delete set null,
  template_id     uuid references public.templates(id) on delete set null,

  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index if not exists documents_org_idx on public.documents(org_id);
create index if not exists documents_client_idx on public.documents(client_id);

drop trigger if exists documents_touch on public.documents;
create trigger documents_touch before update on public.documents
  for each row execute procedure public.touch_updated_at();

-- ── Document line items ────────────────────────────────────────
create table if not exists public.document_items (
  id          uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents(id) on delete cascade,
  description text not null,
  quantity    numeric not null default 1,
  unit_price  numeric not null default 0,
  total_price numeric not null default 0,
  sort_order  int not null default 0
);
create index if not exists document_items_doc_idx on public.document_items(document_id);

-- ════════════════════════════════════════════════════════════════
--  RLS — every tenant table is gated by org membership
-- ════════════════════════════════════════════════════════════════
alter table public.organizations     enable row level security;
alter table public.memberships       enable row level security;
alter table public.clients           enable row level security;
alter table public.product_categories enable row level security;
alter table public.products          enable row level security;
alter table public.templates         enable row level security;
alter table public.documents         enable row level security;
alter table public.document_items    enable row level security;

-- organizations: members can read/update; anyone authenticated can insert (bootstrap)
create policy "org members read"   on public.organizations for select using (public.is_org_member(id));
create policy "org members update" on public.organizations for update using (public.is_org_member(id));
create policy "auth can create org" on public.organizations for insert to authenticated with check (true);

-- memberships: a user sees their own rows; can insert a row for themselves
create policy "own memberships read"   on public.memberships for select using (user_id = auth.uid());
create policy "own membership insert"  on public.memberships for insert with check (user_id = auth.uid());
create policy "own membership delete"  on public.memberships for delete using (user_id = auth.uid());

-- generic tenant policies (select/insert/update/delete) keyed on org membership
create policy "clients rw" on public.clients using (public.is_org_member(org_id)) with check (public.is_org_member(org_id));
create policy "prod_cat rw" on public.product_categories using (public.is_org_member(org_id)) with check (public.is_org_member(org_id));
create policy "products rw" on public.products using (public.is_org_member(org_id)) with check (public.is_org_member(org_id));
create policy "documents rw" on public.documents using (public.is_org_member(org_id)) with check (public.is_org_member(org_id));

-- templates: global (org_id null) are readable by all; org templates gated
create policy "templates read" on public.templates for select
  using (org_id is null or public.is_org_member(org_id));
create policy "templates write" on public.templates for all
  using (org_id is not null and public.is_org_member(org_id))
  with check (org_id is not null and public.is_org_member(org_id));

-- document_items: gated via parent document's org
create policy "doc_items rw" on public.document_items
  using (exists (select 1 from public.documents d
                 where d.id = document_id and public.is_org_member(d.org_id)))
  with check (exists (select 1 from public.documents d
                 where d.id = document_id and public.is_org_member(d.org_id)));

-- ════════════════════════════════════════════════════════════════
--  RPC: create an organization + owner membership atomically
--  (SECURITY DEFINER avoids the RLS chicken-and-egg on first insert)
-- ════════════════════════════════════════════════════════════════
create or replace function public.create_organization(
  p_name text,
  p_vat_number text default null,
  p_currency text default 'SAR',
  p_language text default 'ar',
  p_is_rtl boolean default true,
  p_tax_rate numeric default 15.0,
  p_logo_url text default null
) returns uuid
language plpgsql security definer set search_path = public as $$
declare v_org uuid;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  insert into public.organizations (name, vat_number, currency, language, is_rtl, tax_rate, logo_url)
  values (p_name, p_vat_number, p_currency, p_language, p_is_rtl, p_tax_rate, p_logo_url)
  returning id into v_org;

  insert into public.memberships (org_id, user_id, role)
  values (v_org, auth.uid(), 'OWNER');

  return v_org;
end $$;

-- ════════════════════════════════════════════════════════════════
--  RPC: next sequential document number per org + type + year
--  e.g. INV-2026-0001, NOC-2026-0007
-- ════════════════════════════════════════════════════════════════
create or replace function public.next_document_number(p_org uuid, p_type doc_type)
returns text
language plpgsql security definer set search_path = public as $$
declare
  v_prefix text;
  v_year   text := to_char(now(), 'YYYY');
  v_count  int;
begin
  if not public.is_org_member(p_org) then
    raise exception 'Not a member of this organization';
  end if;

  v_prefix := case p_type
    when 'INVOICE' then 'INV'
    when 'TENDER' then 'TND'
    when 'OFFER_LETTER' then 'OFR'
    when 'NOC' then 'NOC'
    when 'POLICY_LETTER' then 'POL'
    else 'DOC' end;

  select count(*) + 1 into v_count
  from public.documents
  where org_id = p_org and doc_type = p_type
    and to_char(created_at, 'YYYY') = v_year;

  return v_prefix || '-' || v_year || '-' || lpad(v_count::text, 4, '0');
end $$;

-- ════════════════════════════════════════════════════════════════
--  Storage bucket for logos / signatures / generated PDFs
-- ════════════════════════════════════════════════════════════════
insert into storage.buckets (id, name, public)
values ('assets', 'assets', true)
on conflict (id) do nothing;

create policy "assets public read"
  on storage.objects for select using (bucket_id = 'assets');
create policy "assets auth upload"
  on storage.objects for insert to authenticated with check (bucket_id = 'assets');
create policy "assets auth update"
  on storage.objects for update to authenticated using (bucket_id = 'assets');

-- ════════════════════════════════════════════════════════════════
--  Seed: global default templates (org_id = null) — one per doc type
--  Rendering in the MVP is React-driven; these power the picker UX.
-- ════════════════════════════════════════════════════════════════
insert into public.templates (org_id, title, doc_type, is_default, is_rtl) values
  (null, 'Standard Tax Invoice',        'INVOICE',      true, true),
  (null, 'Offer Letter',                 'OFFER_LETTER', true, true),
  (null, 'No Objection Certificate',     'NOC',          true, true),
  (null, 'Policy Letter',                'POLICY_LETTER',true, true),
  (null, 'Tender Submission',            'TENDER',       true, true),
  (null, 'Custom Document',              'CUSTOM',       true, true)
on conflict do nothing;
