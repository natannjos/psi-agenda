'use client';

import { useEffect, useMemo, useState } from 'react';
import { Alert, Button, Card, Center, Loader, SimpleGrid, Stack, Title } from '@mantine/core';
import { DatePicker } from '@mantine/dates';
import { notifications } from '@mantine/notifications';
import { IconAlertCircle } from '@tabler/icons-react';
import { DateTime } from 'luxon';
import { useRouter } from 'next/navigation';
import { USER_TIMEZONE } from '@/lib/datetime';

interface AvailabilitySlot {
  start: string; // ISO string in local tz
  end: string;
}

interface AvailabilityResponse {
  slots: AvailabilitySlot[];
}

interface RoomSchedulerProps {
  roomId: string;
  priceCents: number;
  durationMin?: number;
}

export function RoomScheduler({ roomId, priceCents, durationMin = 50 }: RoomSchedulerProps) {
  const router = useRouter();
  const [date, setDate] = useState<Date | null>(new Date());
  const [loading, setLoading] = useState(false);
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isoDate = useMemo(() => {
    if (!date) return null;
    return DateTime.fromJSDate(date).setZone(USER_TIMEZONE).toISODate();
  }, [date]);

  useEffect(() => {
    if (!isoDate) return;

    const controller = new AbortController();
    const fetchAvailability = async () => {
      setIsFetching(true);
      setError(null);
      try {
        const params = new URLSearchParams({
          roomId,
          date: isoDate,
          durationMin: durationMin.toString()
        });
        const res = await fetch(`/api/availability?${params.toString()}`, {
          signal: controller.signal
        });
        if (!res.ok) {
          throw new Error('Não foi possível carregar a disponibilidade');
        }
        const data: AvailabilityResponse = await res.json();
        setSlots(data.slots);
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          return;
        }
        setSlots([]);
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
      } finally {
        setIsFetching(false);
      }
    };

    void fetchAvailability();
    return () => controller.abort();
  }, [isoDate, roomId, durationMin]);

  const handleSelectSlot = async (slot: AvailabilitySlot) => {
    setLoading(true);
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          roomId,
          start: slot.start,
          end: slot.end,
          priceCents,
          durationMin
        })
      });

      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        throw new Error(payload.message ?? 'Não foi possível criar a reserva');
      }

      const data: { checkoutUrl: string } = await res.json();
      router.push(data.checkoutUrl);
    } catch (err) {
      notifications.show({
        title: 'Erro ao reservar',
        message: err instanceof Error ? err.message : 'Tente novamente em instantes',
        color: 'red'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card withBorder padding="lg" radius="lg" shadow="sm">
      <Stack>
        <Title order={3}>Escolha um horário</Title>
        <DatePicker
          value={date}
          onChange={(value) => setDate(value)}
          locale="pt-BR"
          minDate={new Date()}
          aria-label="Selecionar data"
          fullWidth
        />
        {isFetching ? (
          <Center mih={120}>
            <Loader color="teal" />
          </Center>
        ) : error ? (
          <Alert color="red" icon={<IconAlertCircle size={16} />}>
            {error}
          </Alert>
        ) : slots.length === 0 ? (
          <Alert color="gray" icon={<IconAlertCircle size={16} />}>
            Nenhum horário disponível para esta data.
          </Alert>
        ) : (
          <SimpleGrid cols={{ base: 2, sm: 3, md: 4 }} spacing="sm">
            {slots.map((slot) => {
              const start = DateTime.fromISO(slot.start, { zone: USER_TIMEZONE });
              const end = DateTime.fromISO(slot.end, { zone: USER_TIMEZONE });
              return (
                <Button
                  key={slot.start}
                  fullWidth
                  variant="light"
                  color="teal"
                  onClick={() => void handleSelectSlot(slot)}
                  disabled={loading}
                >
                  {start.toFormat('HH:mm')} – {end.toFormat('HH:mm')}
                </Button>
              );
            })}
          </SimpleGrid>
        )}
      </Stack>
    </Card>
  );
}
