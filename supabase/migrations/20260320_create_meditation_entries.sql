create table if not exists public.meditation_entries (
  user_id uuid not null references auth.users(id) on delete cascade,
  id text not null,
  pre_mood text not null,
  post_mood text,
  timestamp bigint not null,
  note text,
  session_minutes integer,
  sound text,
  saved_quote jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  primary key (user_id, id)
);

create index if not exists meditation_entries_user_timestamp_idx
  on public.meditation_entries (user_id, timestamp desc);

alter table public.meditation_entries enable row level security;

create policy "users_can_select_their_own_entries"
  on public.meditation_entries
  for select
  using (auth.uid() = user_id);

create policy "users_can_insert_their_own_entries"
  on public.meditation_entries
  for insert
  with check (auth.uid() = user_id);

create policy "users_can_update_their_own_entries"
  on public.meditation_entries
  for update
  using (auth.uid() = user_id);

create or replace function public.handle_meditation_entries_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists meditation_entries_set_updated_at on public.meditation_entries;

create trigger meditation_entries_set_updated_at
before update on public.meditation_entries
for each row
execute function public.handle_meditation_entries_updated_at();
