import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { sendBookingConfirmedEmail } from '@/lib/email';
import { parsePgTstzRange } from '@/lib/postgres-ranges';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const signature = headers().get('stripe-signature');
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    return NextResponse.json({ message: 'Configuração ausente' }, { status: 400 });
  }

  const payload = await request.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (err) {
    return NextResponse.json({ message: `Assinatura inválida: ${(err as Error).message}` }, { status: 400 });
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      try {
        await handleCheckoutSession(session);
      } catch (err) {
        console.error('Erro ao processar webhook Stripe', err);
        return NextResponse.json({ message: 'Erro interno' }, { status: 500 });
      }
      break;
    }
    default:
      break;
  }

  return NextResponse.json({ received: true });
}

async function handleCheckoutSession(session: Stripe.Checkout.Session) {
  const bookingId = session.metadata?.booking_id;
  if (!bookingId) {
    return;
  }

  const paymentIntentId = typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id;

  if (paymentIntentId) {
    const { error: paymentError } = await supabaseAdmin
      .from('payments')
      .upsert(
        {
          booking_id: bookingId,
          provider: 'stripe',
          provider_intent_id: paymentIntentId,
          amount_cents: session.amount_total ?? 0,
          currency: (session.currency ?? 'brl').toUpperCase(),
          status: session.payment_status ?? 'succeeded',
          raw: session as unknown as Record<string, unknown>
        },
        { onConflict: 'provider_intent_id' }
      );

    if (paymentError) {
      console.error('Erro ao registrar pagamento', paymentError);
    }
  }

  const { error: bookingError } = await supabaseAdmin
    .from('bookings')
    .update({ status: 'confirmed' })
    .eq('id', bookingId);

  if (bookingError) {
    console.error('Erro ao confirmar reserva', bookingError);
  }

  const { data: booking } = await supabaseAdmin
    .from('bookings')
    .select('id,time_range,price_cents,user_id,rooms(name)')
    .eq('id', bookingId)
    .single();

  if (!booking) {
    return;
  }

  const user = await supabaseAdmin.auth.admin.getUserById(booking.user_id);
  const recipient = user.data?.user?.email;

  const range = parsePgTstzRange(booking.time_range as unknown as string);
  if (!recipient || !range) {
    return;
  }

  try {
    await sendBookingConfirmedEmail({
      to: recipient,
      roomName: booking.rooms?.name ?? 'Sala',
      startIsoUtc: range.start,
      endIsoUtc: range.end,
      bookingCode: booking.id,
      priceCents: booking.price_cents
    });
  } catch (err) {
    console.error('Erro ao enviar e-mail de confirmação', err);
  }
}
