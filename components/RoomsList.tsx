'use client';

import { SimpleGrid, Text } from '@mantine/core';
import { RoomCard } from '@/components/RoomCard';
import type { Database } from '@/types/database';

interface RoomsListProps {
  rooms: Database['public']['Tables']['rooms']['Row'][];
}

export function RoomsList({ rooms }: RoomsListProps) {
  if (!rooms.length) {
    return <Text c="dimmed">Nenhuma sala disponível no momento.</Text>;
  }

  return (
    <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg">
      {rooms.map((room) => (
        <RoomCard
          key={room.id}
          id={room.id}
          name={room.name}
          description={room.description}
          capacity={room.capacity}
          amenities={Array.isArray(room.amenities) ? (room.amenities as string[]) : []}
          priceCents={room.price_cents}
        />
      ))}
    </SimpleGrid>
  );
}
