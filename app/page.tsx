import { Container, Stack, Text, Title } from '@mantine/core';
import { getServerSupabase } from '@/lib/supabase-server';
import type { Database } from '@/types/database';
import { RoomsList } from '@/components/RoomsList';

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

export default async function HomePage() {
  const rooms = await fetchRooms();

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
