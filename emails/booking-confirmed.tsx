import * as React from 'react';
import { Body, Container, Head, Html, Preview, Section, Text } from '@react-email/components';
import { formatCurrencyBRL } from '@/lib/format';
import { DateTime } from 'luxon';
import { USER_TIMEZONE } from '@/lib/datetime';

interface BookingConfirmedEmailProps {
  roomName: string;
  startIsoUtc: string;
  endIsoUtc: string;
  bookingCode: string;
  priceCents: number;
}

export function BookingConfirmedEmail({
  roomName,
  startIsoUtc,
  endIsoUtc,
  bookingCode,
  priceCents
}: BookingConfirmedEmailProps) {
  const start = DateTime.fromISO(startIsoUtc, { zone: 'utc' }).setZone(USER_TIMEZONE);
  const end = DateTime.fromISO(endIsoUtc, { zone: 'utc' }).setZone(USER_TIMEZONE);

  return (
    <Html>
      <Head />
      <Preview>Reserva confirmada: {roomName}</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Section>
            <Text style={styles.heading}>Reserva confirmada 🎉</Text>
            <Text>
              Sua reserva para <strong>{roomName}</strong> está confirmada.
            </Text>
            <Text>
              <strong>Início:</strong> {start.toFormat('dd/MM/yyyy HH:mm')} ({start.zoneName})
              <br />
              <strong>Término:</strong> {end.toFormat('dd/MM/yyyy HH:mm')} ({end.zoneName})
            </Text>
            <Text>
              <strong>Valor:</strong> {formatCurrencyBRL(priceCents)}
            </Text>
            <Text>
              Código da reserva: <strong>{bookingCode}</strong>
            </Text>
            <Text>Até breve! 💙</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const styles = {
  body: {
    fontFamily: 'Inter, Arial, sans-serif',
    backgroundColor: '#f6f7f9'
  },
  container: {
    margin: '0 auto',
    padding: '32px',
    backgroundColor: '#ffffff',
    borderRadius: '16px'
  },
  heading: {
    fontSize: '24px',
    fontWeight: 600 as const,
    marginBottom: '16px'
  }
};
