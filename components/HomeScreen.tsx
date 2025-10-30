'use client';

import { Container, Stack, Text, Title } from '@mantine/core';
import type { Database } from '@/types/database';
import { RoomsList } from '@/components/RoomsList';

interface HomeScreenProps {
  rooms: Database['public']['Tables']['rooms']['Row'][];
}

export function HomeScreen({ rooms }: HomeScreenProps) {
  return (
    <Container size="lg" py="xl">
      <Stack gap="md">
        <Stack gap={4}>
          <Title order={1}>Salas disponíveis</Title>
          <Text c="dimmed">Escolha a sala ideal e agende em poucos cliques.</Text>
        </Stack>
        <RoomsList rooms={rooms} />
      </Stack>
    </Container>
  );
}
