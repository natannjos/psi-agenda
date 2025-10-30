-- Seed data for PSI Agenda
\set user_id '00000000-0000-0000-0000-000000000001'

insert into public.profiles (user_id, full_name, phone)
values (:'user_id', 'Usuário Demo', '+55 11 99999-0000')
on conflict (user_id) do update set
  full_name = excluded.full_name,
  phone = excluded.phone;

insert into public.rooms (id, name, description, capacity, amenities, price_cents, active)
values
  ('11111111-1111-1111-1111-111111111111', 'Sala Azul', 'Espaço acolhedor com vista para o jardim.', 3, '["Poltrona", "Ar-condicionado", "Wi-Fi"]', 6500, true),
  ('22222222-2222-2222-2222-222222222222', 'Sala Verde', 'Ideal para terapias em grupo reduzido.', 5, '["Cadeira ergonômica", "Projetor", "Som ambiente"]', 7500, true),
  ('33333333-3333-3333-3333-333333333333', 'Sala Rosa', 'Ambiente iluminado e silencioso.', 2, '["Mesa redonda", "Isolamento acústico", "Wi-Fi"]', 5500, true)
on conflict (id) do update set
  name = excluded.name,
  description = excluded.description,
  capacity = excluded.capacity,
  amenities = excluded.amenities,
  price_cents = excluded.price_cents,
  active = excluded.active;

-- Weekly openings Monday(1) to Friday(5) 08:00-20:00
insert into public.room_openings (room_id, weekday, start_minute, end_minute)
select room_id, weekday, 8 * 60, 20 * 60
from (
  select '11111111-1111-1111-1111-111111111111'::uuid as room_id union all
  select '22222222-2222-2222-2222-222222222222'::uuid union all
  select '33333333-3333-3333-3333-333333333333'::uuid
) rooms
cross join unnest(array[1,2,3,4,5]) as weekdays(weekday)
on conflict (room_id, weekday, start_minute, end_minute) do nothing;

-- Blackout Sala Azul 1-2 Nov 2025 (UTC)
insert into public.room_blackouts (id, room_id, starts_at, ends_at, reason)
values (
  '44444444-4444-4444-4444-444444444444',
  '11111111-1111-1111-1111-111111111111',
  '2025-11-01 00:00:00+00',
  '2025-11-03 00:00:00+00',
  'Feriado de Finados'
)
on conflict (id) do update set
  starts_at = excluded.starts_at,
  ends_at = excluded.ends_at,
  reason = excluded.reason;

-- Bookings in Sala Azul
insert into public.bookings (id, room_id, user_id, time_range, status, price_cents, currency)
values
  (
    '55555555-5555-5555-5555-555555555555',
    '11111111-1111-1111-1111-111111111111',
    :'user_id',
    tstzrange('2025-10-30 13:00:00+00', '2025-10-30 14:00:00+00', '[)'),
    'confirmed',
    6500,
    'BRL'
  ),
  (
    '66666666-6666-6666-6666-666666666666',
    '11111111-1111-1111-1111-111111111111',
    :'user_id',
    tstzrange('2025-10-30 14:00:00+00', '2025-10-30 15:00:00+00', '[)'),
    'pending',
    6500,
    'BRL'
  )
on conflict (id) do update set
  time_range = excluded.time_range,
  status = excluded.status,
  price_cents = excluded.price_cents,
  currency = excluded.currency;

update public.bookings
set expires_at = now() + interval '20 minutes'
where id = '66666666-6666-6666-6666-666666666666';

insert into public.payments (id, booking_id, provider, provider_intent_id, amount_cents, currency, status, raw)
values (
  '77777777-7777-7777-7777-777777777777',
  '55555555-5555-5555-5555-555555555555',
  'stripe',
  'pi_demo_confirmed',
  6500,
  'BRL',
  'succeeded',
  jsonb_build_object('demo', true)
)
on conflict (id) do update set
  provider_intent_id = excluded.provider_intent_id,
  amount_cents = excluded.amount_cents,
  currency = excluded.currency,
  status = excluded.status,
  raw = excluded.raw;
