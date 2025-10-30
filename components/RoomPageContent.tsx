'use client';

import { Container } from '@mantine/core';
import { RoomDetails } from '@/components/RoomDetails';
import type { Database } from '@/types/database';

interface RoomPageContentProps {
  room: NonNullable<Database['public']['Tables']['rooms']['Row']>;
}

export function RoomPageContent({ room }: RoomPageContentProps) {
  return (
    <Container size="lg" py="xl">
      <RoomDetails room={room} />
    </Container>
  );
}
