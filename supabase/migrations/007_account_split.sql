alter table public.profiles
  add column if not exists account_type text not null default 'donor',
  add column if not exists is_demo boolean not null default false;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'profiles_account_type_check'
  ) then
    alter table public.profiles
      add constraint profiles_account_type_check
      check (account_type in ('donor', 'hospital'));
  end if;
end
$$;

alter table public.profiles
  alter column blood_type drop not null,
  alter column date_of_birth drop not null,
  alter column weight_kg drop not null;

create table if not exists public.hospital_accounts (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  hospital_name text not null,
  hospital_type text not null,
  registration_number text not null unique,
  address text not null,
  city text not null,
  state text not null,
  pincode text not null,
  official_contact_email text not null,
  official_contact_phone text not null,
  contact_person_name text not null,
  verification_status text not null default 'unverified',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'hospital_accounts_hospital_type_check'
  ) then
    alter table public.hospital_accounts
      add constraint hospital_accounts_hospital_type_check
      check (
        hospital_type in (
          'government_hospital',
          'private_hospital',
          'clinic',
          'blood_bank',
          'nursing_home',
          'other'
        )
      );
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'hospital_accounts_verification_status_check'
  ) then
    alter table public.hospital_accounts
      add constraint hospital_accounts_verification_status_check
      check (verification_status in ('unverified', 'verified', 'rejected'));
  end if;
end
$$;

alter table public.hospital_accounts enable row level security;

drop policy if exists "Hospitals manage own hospital account" on public.hospital_accounts;
create policy "Hospitals manage own hospital account" on public.hospital_accounts
for all
using (auth.uid() = profile_id)
with check (auth.uid() = profile_id);

drop trigger if exists hospital_accounts_touch_updated_at on public.hospital_accounts;
create trigger hospital_accounts_touch_updated_at
before update on public.hospital_accounts
for each row execute function public.touch_updated_at();

alter table public.posts
  add column if not exists patient_id text,
  add column if not exists is_legacy boolean not null default false,
  add column if not exists is_demo boolean not null default false;

update public.posts
set patient_id = coalesce(patient_id, concat('LEGACY-', upper(left(id::text, 8))))
where patient_id is null;

update public.posts
set is_legacy = true
where exists (
  select 1
  from public.profiles
  where profiles.id = posts.created_by
    and profiles.account_type <> 'hospital'
);

drop policy if exists "Users create own posts" on public.posts;
drop policy if exists "Users update own posts" on public.posts;
drop policy if exists "Donors manage own applications" on public.donor_applications;

create policy "Hospitals create own posts" on public.posts
for insert
with check (
  auth.uid() = created_by
  and exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.account_type = 'hospital'
      and profiles.deleted_at is null
      and profiles.status = 'active'
  )
);

create policy "Hospitals update own posts" on public.posts
for update
using (
  auth.uid() = created_by
  and exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.account_type = 'hospital'
      and profiles.deleted_at is null
      and profiles.status = 'active'
  )
);

create policy "Hospitals view own posts" on public.posts
for select
using (auth.uid() = created_by);

create policy "Donors create own applications" on public.donor_applications
for insert
with check (
  auth.uid() = donor_id
  and exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.account_type = 'donor'
      and profiles.deleted_at is null
      and profiles.status = 'active'
  )
);

create policy "Donors view own applications" on public.donor_applications
for select
using (auth.uid() = donor_id);

create policy "Donors update own applications" on public.donor_applications
for update
using (auth.uid() = donor_id)
with check (auth.uid() = donor_id);

create policy "Hospitals view applications on own posts" on public.donor_applications
for select
using (
  exists (
    select 1
    from public.posts
    where posts.id = donor_applications.post_id
      and posts.created_by = auth.uid()
  )
);

create policy "Hospitals update applications on own posts" on public.donor_applications
for update
using (
  exists (
    select 1
    from public.posts
    where posts.id = donor_applications.post_id
      and posts.created_by = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.posts
    where posts.id = donor_applications.post_id
      and posts.created_by = auth.uid()
  )
);
