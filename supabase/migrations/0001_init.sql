-- Profiles (1:1 with auth.users)
create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  name text,
  avatar_url text,
  streak_count int not null default 0,
  onboarding_done boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  accent_color text not null
);

create table public.tracks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subtitle text,
  category_id uuid references public.categories on delete set null,
  duration_sec int not null,
  audio_path text not null,
  image_url text
);

create table public.favorites (
  user_id uuid references auth.users on delete cascade,
  track_id uuid references public.tracks on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, track_id)
);

create table public.sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade,
  track_id uuid references public.tracks on delete cascade,
  played_sec int not null default 0,
  completed boolean not null default false,
  created_at timestamptz not null default now()
);

-- Auto-create a profile row when a user signs up.
create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, name) values (new.id, new.raw_user_meta_data->>'name');
  return new;
end; $$;

create trigger on_auth_user_created
  after insert on auth.users for each row execute function public.handle_new_user();

-- RLS
alter table public.profiles  enable row level security;
alter table public.favorites enable row level security;
alter table public.sessions  enable row level security;
alter table public.categories enable row level security;
alter table public.tracks    enable row level security;

-- Catalog is world-readable to authenticated users.
create policy "read categories" on public.categories for select to authenticated using (true);
create policy "read tracks"     on public.tracks     for select to authenticated using (true);

-- Users manage only their own rows.
create policy "own profile read"   on public.profiles  for select using (auth.uid() = id);
create policy "own profile update" on public.profiles  for update using (auth.uid() = id);
create policy "own favorites"      on public.favorites for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own sessions"       on public.sessions  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
