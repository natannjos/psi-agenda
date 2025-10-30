import React from 'react';
import { render } from '@react-email/components';
import { resend } from '@/lib/resend';
import { BookingConfirmedEmail } from '@/emails/booking-confirmed';

interface SendBookingConfirmedArgs {
  to: string;
  roomName: string;
  startIsoUtc: string;
  endIsoUtc: string;
  bookingCode: string;
  priceCents: number;
}

const fromAddress = process.env.RESERVATIONS_EMAIL_FROM ?? 'Agendamentos <noreply@seudominio.com>';

export async function sendBookingConfirmedEmail({
  to,
  roomName,
  startIsoUtc,
  endIsoUtc,
  bookingCode,
  priceCents
}: SendBookingConfirmedArgs) {
  const emailHtml = await render(
    <BookingConfirmedEmail
      roomName={roomName}
      startIsoUtc={startIsoUtc}
      endIsoUtc={endIsoUtc}
      bookingCode={bookingCode}
      priceCents={priceCents}
    />
  );

  await resend.emails.send({
    from: fromAddress,
    to,
    subject: `Reserva confirmada — ${roomName}`,
    html: emailHtml
  });
}
