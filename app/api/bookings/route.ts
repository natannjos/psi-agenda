import { NextResponse } from 'next/server';
import { DateTime } from 'luxon';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { z } from 'zod';
import { stripe } from '@/lib/stripe';
import { USER_TIMEZONE } from '@/lib/datetime';
import { supabaseAdmin } from '@/lib/supabase-admin';
import type { Database } from '@/types/database';

const payloadSchema = z.object({
  roomId: z.string().uuid(),
  start: z.string(),
  end: z.string(),
  priceCents: z.number().optional(),
  durationMin: z.number().optional()
});

export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  const parsed = payloadSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ message: 'Dados incompletos' }, { status: 400 });
  }

  const body = parsed.data;

  const supabase = createRouteHandlerClient<Database>({ cookies });
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ message: 'É necessário estar autenticado' }, { status: 401 });
  }

  const room = await supabase
    .from('rooms')
    .select('id,name,price_cents')
    .eq('id', body.roomId)
    .eq('active', true)
    .single()
    .then((res) => {
      if (res.error) throw res.error;
      return res.data;
    })
    .catch(() => null);

  if (!room) {
    return NextResponse.json({ message: 'Sala indisponível' }, { status: 404 });
  }

  const startLocal = DateTime.fromISO(body.start, { zone: USER_TIMEZONE });
  const endLocal = DateTime.fromISO(body.end, { zone: USER_TIMEZONE });

  if (!startLocal.isValid || !endLocal.isValid || endLocal <= startLocal) {
    return NextResponse.json({ message: 'Horário inválido' }, { status: 400 });
  }

  const startUtc = startLocal.setZone('utc');
  const endUtc = endLocal.setZone('utc');
  const rangeLiteral = `[${startUtc.toISO()},${endUtc.toISO()})`;

  const expiresAt = DateTime.utc().plus({ minutes: 20 }).toISO();

  const { data: booking, error } = await supabase
    .from('bookings')
    .insert({
      room_id: room.id,
      user_id: user.id,
      time_range: rangeLiteral,
      status: 'pending',
      price_cents: room.price_cents,
      currency: 'BRL',
      expires_at: expiresAt
    })
    .select('id');

  if (error || !booking?.[0]) {
    if (error?.code === '23505' || error?.code === 'P0001' || error?.message?.includes('bookings_no_overlap')) {
      return NextResponse.json({ message: 'Horário indisponível' }, { status: 409 });
    }
    return NextResponse.json({ message: 'Erro ao criar reserva' }, { status: 500 });
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000';

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      success_url: `${baseUrl}/bookings/success`,
      cancel_url: `${baseUrl}/bookings/cancel`,
      metadata: {
        booking_id: booking[0].id,
        room_id: room.id
      },
      line_items: [
        {
          price_data: {
            currency: 'brl',
            unit_amount: room.price_cents,
            product_data: {
              name: `Reserva ${room.name}`
            }
          },
          quantity: 1
        }
      ]
    });

    if (!session.url) {
      throw new Error('Stripe não retornou URL');
    }

    return NextResponse.json({ checkoutUrl: session.url });
  } catch (err) {
    await supabaseAdmin
      .from('bookings')
      .delete()
      .eq('id', booking[0].id);
    return NextResponse.json({ message: 'Erro ao iniciar pagamento' }, { status: 502 });
  }
}
