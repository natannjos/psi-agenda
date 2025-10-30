-- Schema and policies for PSI Agenda
create extension if not exists btree_gist;

create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  created_at timestamptz default now()
);

create table if not exists public.rooms (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  capacity int,
  amenities jsonb default '[]'::jsonb,
  price_cents int not null default 5000,
  active boolean not null default true,
  created_at timestamptz default now()
);

create table if not exists public.room_openings (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms(id) on delete cascade,
  weekday smallint not null check (weekday between 0 and 6),
  start_minute int not null check (start_minute between 0 and 1439),
  end_minute int not null check (end_minute between 1 and 1440),
  unique (room_id, weekday, start_minute, end_minute)
);

create table if not exists public.room_blackouts (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms(id) on delete cascade,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  reason text
);

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms(id) on delete restrict,
  user_id uuid not null references auth.users(id) on delete restrict,
  time_range tsrange not null,
  status text not null default 'pending',
  price_cents int not null,
  currency text not null default 'BRL',
  created_at timestamptz default now(),
  expires_at timestamptz,
  notes text
);

alter table public.bookings
  add constraint bookings_no_overlap
  exclude using gist (room_id with =, time_range with &&)
  where (status in ('pending','confirmed'));

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  provider text not null default 'stripe',
  provider_intent_id text unique,
  amount_cents int not null,
  currency text not null default 'BRL',
  status text not null,
  raw jsonb,
  created_at timestamptz default now()
);

-- RLS configuration
alter table public.rooms enable row level security;
alter table public.room_openings enable row level security;
alter table public.room_blackouts enable row level security;
alter table public.profiles enable row level security;
alter table public.bookings enable row level security;
alter table public.payments enable row level security;

drop policy if exists "Public read rooms" on public.rooms;
create policy "Public read rooms" on public.rooms for select using (true);

drop policy if exists "Public read openings" on public.room_openings;
create policy "Public read openings" on public.room_openings for select using (true);

drop policy if exists "Public read blackouts" on public.room_blackouts;
create policy "Public read blackouts" on public.room_blackouts for select using (true);

drop policy if exists "Users manage own profile" on public.profiles;
create policy "Users manage own profile" on public.profiles
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users read own bookings" on public.bookings;
create policy "Users read own bookings" on public.bookings
  for select using (auth.uid() = user_id);

drop policy if exists "Users insert bookings" on public.bookings;
create policy "Users insert bookings" on public.bookings
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users update bookings" on public.bookings;
create policy "Users update bookings" on public.bookings
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users read own payments" on public.payments;
create policy "Users read own payments" on public.payments
  for select using (
    exists (
      select 1
      from public.bookings b
      where b.id = payments.booking_id
        and b.user_id = auth.uid()
    )
  );

