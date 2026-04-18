create table if not exists public.contact_queries (
  id uuid primary key default gen_random_uuid(),
  submitted_by uuid references public.profiles(id) on delete set null,
  submitted_name text not null,
  submitted_email text not null,
  submitted_phone text not null,
  submitted_account_type text not null,
  subject text not null,
  query text not null,
  reply text,
  status text not null default 'unresolved',
  replied_by uuid references public.profiles(id) on delete set null,
  replied_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint contact_queries_status_check check (status in ('unresolved', 'solved'))
);

create index if not exists contact_queries_submitted_by_created_at_idx
  on public.contact_queries (submitted_by, created_at desc);

create index if not exists contact_queries_status_created_at_idx
  on public.contact_queries (status, created_at desc);

alter table public.contact_queries enable row level security;

drop policy if exists "Users create own contact queries" on public.contact_queries;
create policy "Users create own contact queries" on public.contact_queries
for insert
with check (auth.uid() = submitted_by);

drop policy if exists "Users view own contact queries" on public.contact_queries;
create policy "Users view own contact queries" on public.contact_queries
for select
using (auth.uid() = submitted_by);

drop trigger if exists contact_queries_touch_updated_at on public.contact_queries;
create trigger contact_queries_touch_updated_at
before update on public.contact_queries
for each row execute function public.touch_updated_at();
