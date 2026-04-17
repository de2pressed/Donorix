create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  message text not null,
  created_at timestamptz not null default now()
);

create index if not exists chat_messages_post_id_created_at_idx
  on public.chat_messages (post_id, created_at desc);

alter table public.chat_messages enable row level security;

drop policy if exists "Chat participants can read messages" on public.chat_messages;
create policy "Chat participants can read messages" on public.chat_messages
for select
using (
  exists (
    select 1
    from public.posts post
    where post.id = chat_messages.post_id
      and (post.created_by = auth.uid() or post.approved_donor_id = auth.uid())
  )
);

drop policy if exists "Chat participants can insert messages" on public.chat_messages;
create policy "Chat participants can insert messages" on public.chat_messages
for insert
with check (
  auth.uid() = sender_id
  and exists (
    select 1
    from public.posts post
    where post.id = chat_messages.post_id
      and post.approved_donor_id is not null
      and (
        (post.created_by = auth.uid() and post.approved_donor_id = recipient_id)
        or (post.approved_donor_id = auth.uid() and post.created_by = recipient_id)
      )
  )
);
