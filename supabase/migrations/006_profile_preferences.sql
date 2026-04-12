alter table public.profiles
  add column if not exists allow_sms_alerts boolean not null default false,
  add column if not exists allow_email_alerts boolean not null default true,
  add column if not exists is_discoverable boolean not null default true,
  add column if not exists allow_emergency_direct_contact boolean not null default false,
  add column if not exists hide_from_leaderboard boolean not null default false,
  add column if not exists notification_radius_km integer not null default 25;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'profiles_notification_radius_km_check'
  ) then
    alter table public.profiles
      add constraint profiles_notification_radius_km_check
      check (notification_radius_km between 5 and 50);
  end if;
end $$;
