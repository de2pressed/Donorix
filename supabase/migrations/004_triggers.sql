drop trigger if exists profiles_touch_updated_at on public.profiles;
create trigger profiles_touch_updated_at
before update on public.profiles
for each row execute function public.touch_updated_at();

drop trigger if exists posts_touch_updated_at on public.posts;
create trigger posts_touch_updated_at
before update on public.posts
for each row execute function public.touch_updated_at();

drop trigger if exists donor_applications_touch_updated_at on public.donor_applications;
create trigger donor_applications_touch_updated_at
before update on public.donor_applications
for each row execute function public.touch_updated_at();
