-- Add Commercial Registration (CR) number to clients (buyer party).
alter table public.clients add column if not exists cr_number text;
