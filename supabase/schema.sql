create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.crystal_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  entry_date date not null,
  balance integer not null check (balance >= 0),
  memo text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  transaction_date date not null,
  kind text not null check (kind in ('gain', 'spend')),
  amount integer not null check (amount > 0),
  reason text not null default '',
  memo text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  card_name text not null,
  image_url text,
  target_amount integer not null default 60000 check (target_amount > 0),
  deadline date,
  priority integer not null default 1,
  memo text not null default '',
  achieved boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  theme text not null default 'sekai',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists crystal_entries_user_date_idx on public.crystal_entries(user_id, entry_date desc);
create index if not exists transactions_user_date_idx on public.transactions(user_id, transaction_date desc);
create index if not exists goals_user_priority_idx on public.goals(user_id, priority);

alter table public.profiles enable row level security;
alter table public.crystal_entries enable row level security;
alter table public.transactions enable row level security;
alter table public.goals enable row level security;
alter table public.user_settings enable row level security;

create policy "Users manage own profile" on public.profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);
create policy "Users manage own crystal entries" on public.crystal_entries
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users manage own transactions" on public.transactions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users manage own goals" on public.goals
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users manage own settings" on public.user_settings
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)));
  insert into public.user_settings (user_id) values (new.id);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();