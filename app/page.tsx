import { Container, Grid, Skeleton, Stack, Text, Title } from '@mantine/core';
import { Suspense } from 'react';
import { RoomCard } from '@/components/RoomCard';
import { getServerSupabase } from '@/lib/supabase-server';
import type { Database } from '@/types/database';

async function fetchRooms() {
  const supabase = getServerSupabase();
  const { data, error } = await supabase
    .from('rooms')
    .select('*')
    .eq('active', true)
    .order('price_cents', { ascending: true });

  if (error) {
    throw error;
  }

  return data satisfies Database['public']['Tables']['rooms']['Row'][];
}

async function RoomsList() {
  const rooms = await fetchRooms();

  if (!rooms.length) {
    return <Text c="dimmed">Nenhuma sala disponível no momento.</Text>;
  }

  return (
    <Grid gutter="lg">
      {rooms.map((room) => (
        <Grid.Col key={room.id} span={{ base: 12, sm: 6, md: 4 }}>
          <RoomCard
            id={room.id}
            name={room.name}
            description={room.description}
            capacity={room.capacity}
            amenities={Array.isArray(room.amenities) ? (room.amenities as string[]) : []}
            priceCents={room.price_cents}
          />
        </Grid.Col>
      ))}
    </Grid>
  );
}

export default function HomePage() {
  return (
    <Container size="lg" py="xl">
      <Stack gap="md">
        <Stack gap={4}>
          <Title order={1}>Salas disponíveis</Title>
          <Text c="dimmed">Escolha a sala ideal e agende em poucos cliques.</Text>
        </Stack>
        <Suspense fallback={<RoomsFallback />}>
          {/* @ts-expect-error Async Server Component */}
          <RoomsList />
        </Suspense>
      </Stack>
    </Container>
  );
}

function RoomsFallback() {
  return (
    <Grid gutter="lg">
      {[1, 2, 3].map((key) => (
        <Grid.Col key={key} span={{ base: 12, sm: 6, md: 4 }}>
          <Skeleton height={220} radius="lg" />
        </Grid.Col>
      ))}
    </Grid>
  );
}
