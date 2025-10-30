import { NextResponse } from 'next/server';
import { DateTime, Interval } from 'luxon';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { USER_TIMEZONE, minutesToTime } from '@/lib/datetime';
import { parsePgTstzRange } from '@/lib/postgres-ranges';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const roomId = searchParams.get('roomId');
  const dateIso = searchParams.get('date');
  const durationMin = Number.parseInt(searchParams.get('durationMin') ?? '50', 10);

  if (!roomId || !dateIso || Number.isNaN(durationMin)) {
    return NextResponse.json({ message: 'Parâmetros inválidos' }, { status: 400 });
  }

  const day = DateTime.fromISO(dateIso, { zone: USER_TIMEZONE });
  if (!day.isValid) {
    return NextResponse.json({ message: 'Data inválida' }, { status: 400 });
  }

  const weekday = day.weekday % 7; // luxon: 1=segunda ... 7=domingo
  const dayStartUtc = day.startOf('day').setZone('utc');
  const dayEndUtc = dayStartUtc.plus({ days: 1 });

  const [openingsRes, bookingsRes, blackoutsRes] = await Promise.all([
    supabaseAdmin
      .from('room_openings')
      .select('start_minute,end_minute')
      .eq('room_id', roomId)
      .eq('weekday', weekday),
    supabaseAdmin
      .from('bookings')
      .select('time_range')
      .eq('room_id', roomId)
      .in('status', ['pending', 'confirmed'])
      .overlaps('time_range', `[${dayStartUtc.toISO()},${dayEndUtc.toISO()})`),
    supabaseAdmin
      .from('room_blackouts')
      .select('starts_at,ends_at')
      .eq('room_id', roomId)
      .lt('starts_at', dayEndUtc.toISO())
      .gt('ends_at', dayStartUtc.toISO())
  ]);

  if (openingsRes.error || bookingsRes.error || blackoutsRes.error) {
    return NextResponse.json({ message: 'Erro ao carregar disponibilidade' }, { status: 500 });
  }

  const bookingsIntervals = (bookingsRes.data ?? [])
    .map((booking) => parsePgTstzRange(booking.time_range as unknown as string))
    .filter(Boolean)
    .map((range) =>
      Interval.fromDateTimes(
        DateTime.fromISO(range!.start, { zone: 'utc' }),
        DateTime.fromISO(range!.end, { zone: 'utc' })
      )
    );

  const blackoutIntervals = (blackoutsRes.data ?? []).map((blackout) =>
    Interval.fromDateTimes(
      DateTime.fromISO(blackout.starts_at, { zone: 'utc' }),
      DateTime.fromISO(blackout.ends_at, { zone: 'utc' })
    )
  );

  const slots: { start: string; end: string }[] = [];
  const step = 10;

  for (const opening of openingsRes.data ?? []) {
    let current = minutesToTime(day, opening.start_minute);
    const openingEnd = minutesToTime(day, opening.end_minute);

    while (current.plus({ minutes: durationMin }) <= openingEnd) {
      const slotStartLocal = current;
      const slotEndLocal = current.plus({ minutes: durationMin });

      const slotIntervalUtc = Interval.fromDateTimes(
        slotStartLocal.setZone('utc'),
        slotEndLocal.setZone('utc')
      );

      const hasConflict =
        bookingsIntervals.some((booking) => booking.overlaps(slotIntervalUtc)) ||
        blackoutIntervals.some((blackout) => blackout.overlaps(slotIntervalUtc));

      if (!hasConflict && slotIntervalUtc.start >= dayStartUtc && slotIntervalUtc.end <= dayEndUtc) {
        slots.push({
          start: slotStartLocal.toISO({ suppressMilliseconds: true }),
          end: slotEndLocal.toISO({ suppressMilliseconds: true })
        });
      }

      current = current.plus({ minutes: step });
    }
  }

  return NextResponse.json({ slots });
}
