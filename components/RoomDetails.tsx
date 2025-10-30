'use client';

import { Group, Paper, SimpleGrid, Stack, Text, Title } from '@mantine/core';
import { RoomScheduler } from '@/components/RoomScheduler';
import { formatCurrencyBRL } from '@/lib/format';
import type { Database } from '@/types/database';

interface RoomDetailsProps {
  room: NonNullable<Database['public']['Tables']['rooms']['Row']>;
}

export function RoomDetails({ room }: RoomDetailsProps) {
  return (
    <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl">
      <Stack gap="md">
        <div>
          <Title order={1}>{room.name}</Title>
          <Group gap="xs">
            <Text c="dimmed">{formatCurrencyBRL(room.price_cents)} / hora</Text>
            {room.capacity ? <Text c="dimmed">• Até {room.capacity} pessoas</Text> : null}
          </Group>
        </div>
        {room.description ? <Text>{room.description}</Text> : null}
        {Array.isArray(room.amenities) && (room.amenities as string[]).length ? (
          <Paper withBorder p="md" radius="md">
            <Text fw={600}>Amenidades</Text>
            <Text c="dimmed">{(room.amenities as string[]).join(', ')}</Text>
          </Paper>
        ) : null}
      </Stack>
      <RoomScheduler roomId={room.id} priceCents={room.price_cents} />
    </SimpleGrid>
  );
}
