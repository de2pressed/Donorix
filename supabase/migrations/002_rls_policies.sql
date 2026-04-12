alter table public.profiles enable row level security;
alter table public.posts enable row level security;
alter table public.donor_applications enable row level security;
alter table public.upvotes enable row level security;
alter table public.donations enable row level security;
alter table public.notifications enable row level security;
alter table public.admin_actions enable row level security;
alter table public.sms_log enable row level security;

create policy "Profiles are public readable" on public.profiles
for select using (status = 'active');

create policy "Users manage own profile" on public.profiles
for all using (auth.uid() = id) with check (auth.uid() = id);

create policy "Posts are public readable when active" on public.posts
for select using (status in ('active', 'fulfilled'));

create policy "Users create own posts" on public.posts
for insert with check (auth.uid() = created_by);

create policy "Users update own posts" on public.posts
for update using (auth.uid() = created_by);

create policy "Donors manage own applications" on public.donor_applications
for all using (auth.uid() = donor_id) with check (auth.uid() = donor_id);

create policy "Users manage own votes" on public.upvotes
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users view own donations" on public.donations
for select using (auth.uid() = donor_id or auth.uid() = recipient_id);

create policy "Users view own notifications" on public.notifications
for select using (auth.uid() = user_id);

create policy "Users update own notifications" on public.notifications
for update using (auth.uid() = user_id);
