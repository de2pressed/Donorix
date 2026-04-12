create or replace function public.increment_karma(user_id uuid, amount integer)
returns integer
language plpgsql
security definer
as $$
declare
  updated_karma integer;
begin
  update public.profiles
  set karma = karma + amount,
      updated_at = now()
  where id = user_id
  returning karma into updated_karma;

  return updated_karma;
end;
$$;

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
