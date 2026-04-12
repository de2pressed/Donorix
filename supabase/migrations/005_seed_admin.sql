update public.profiles
set is_admin = true
where id in (
  coalesce(nullif(current_setting('app.settings.admin_user_id_1', true), ''), '00000000-0000-0000-0000-000000000001')::uuid,
  coalesce(nullif(current_setting('app.settings.admin_user_id_2', true), ''), '00000000-0000-0000-0000-000000000002')::uuid
);
