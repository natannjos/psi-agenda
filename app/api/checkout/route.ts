import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { stripe } from '@/lib/stripe';
import type { Database } from '@/types/database';

interface CheckoutPayload {
  bookingId: string;
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as CheckoutPayload | null;
  if (!body?.bookingId) {
    return NextResponse.json({ message: 'Reserva não informada' }, { status: 400 });
  }

  const supabase = createRouteHandlerClient<Database>({ cookies });
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ message: 'Não autenticado' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('bookings')
    .select('id,status,price_cents,room_id,rooms(name)')
    .eq('id', body.bookingId)
    .eq('user_id', user.id)
    .single();

  if (error || !data) {
    return NextResponse.json({ message: 'Reserva não encontrada' }, { status: 404 });
  }

  if (data.status !== 'pending') {
    return NextResponse.json({ message: 'Reserva já processada' }, { status: 409 });
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000';

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    success_url: `${baseUrl}/bookings/success`,
    cancel_url: `${baseUrl}/bookings/cancel`,
    metadata: {
      booking_id: data.id,
      room_id: data.room_id
    },
    line_items: [
      {
        price_data: {
          currency: 'brl',
          unit_amount: data.price_cents,
          product_data: {
            name: `Reserva ${data.rooms?.name ?? 'Sala'}`
          }
        },
        quantity: 1
      }
    ]
  });

  if (!session.url) {
    return NextResponse.json({ message: 'Não foi possível iniciar o checkout' }, { status: 500 });
  }

  return NextResponse.json({ checkoutUrl: session.url });
}
