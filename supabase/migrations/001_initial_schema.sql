create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key,
  email text not null unique,
  phone text not null unique,
  full_name text not null,
  username text not null unique,
  avatar_url text,
  blood_type text not null,
  gender text not null,
  date_of_birth date not null,
  city text not null,
  state text not null,
  pincode text not null,
  weight_kg numeric(5,2) not null,
  last_donated_at timestamptz,
  total_donations integer not null default 0,
  karma integer not null default 0,
  is_admin boolean not null default false,
  is_available boolean not null default true,
  is_verified boolean not null default false,
  has_chronic_disease boolean not null default false,
  is_smoker boolean not null default false,
  is_on_medication boolean not null default false,
  preferred_language text not null default 'en',
  consent_terms boolean not null,
  consent_privacy boolean not null,
  consent_notifications boolean not null default true,
  status text not null default 'active',
  timeout_until timestamptz,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null references public.profiles(id) on delete cascade,
  patient_name text not null,
  blood_type_needed text not null,
  units_needed numeric(4,1) not null,
  hospital_name text not null,
  hospital_address text not null,
  city text not null,
  state text not null,
  latitude double precision,
  longitude double precision,
  contact_name text not null,
  contact_phone text not null,
  contact_email text,
  medical_condition text,
  additional_notes text,
  is_emergency boolean not null default false,
  required_by timestamptz not null,
  initial_radius_km integer not null default 7,
  current_radius_km integer not null default 7,
  expires_at timestamptz not null,
  status text not null default 'active',
  priority_score integer not null default 0,
  upvote_count integer not null default 0,
  donor_count integer not null default 0,
  approved_donor_id uuid references public.profiles(id),
  sms_sent_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.donor_applications (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  donor_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'pending',
  eligibility_score integer not null default 0,
  distance_km numeric(6,2),
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(post_id, donor_id)
);

create table if not exists public.upvotes (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  value smallint not null check (value in (-1, 1)),
  created_at timestamptz not null default now(),
  unique(post_id, user_id)
);

create table if not exists public.donations (
  id uuid primary key default gen_random_uuid(),
  donor_id uuid not null references public.profiles(id) on delete cascade,
  recipient_id uuid references public.profiles(id) on delete set null,
  post_id uuid references public.posts(id) on delete set null,
  donated_at timestamptz not null,
  units numeric(4,1) not null,
  hospital_name text not null,
  city text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null,
  title text not null,
  body text not null,
  data jsonb,
  post_id uuid references public.posts(id) on delete set null,
  read_at timestamptz,
  sms_sent boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.admin_actions (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid not null references public.profiles(id) on delete cascade,
  action text not null,
  target_type text not null,
  target_id text not null,
  reason text not null,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.sms_log (
  id uuid primary key default gen_random_uuid(),
  to_phone text not null,
  message text not null,
  post_id uuid references public.posts(id) on delete set null,
  user_id uuid references public.profiles(id) on delete set null,
  status text not null,
  twilio_sid text,
  created_at timestamptz not null default now()
);
