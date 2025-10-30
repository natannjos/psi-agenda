import { Container, Grid, Group, Paper, Stack, Text, Title } from '@mantine/core';
import { notFound } from 'next/navigation';
import { RoomScheduler } from '@/components/RoomScheduler';
import { getServerSupabase } from '@/lib/supabase-server';
import { formatCurrencyBRL } from '@/lib/format';
import type { Metadata } from 'next';

interface RoomPageParams {
  params: {
    id: string;
  };
}

async function fetchRoom(id: string) {
  const supabase = getServerSupabase();
  const { data, error } = await supabase
    .from('rooms')
    .select('*')
    .eq('id', id)
    .eq('active', true)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

export async function generateMetadata({ params }: RoomPageParams): Promise<Metadata> {
  const room = await fetchRoom(params.id);

  if (!room) {
    return { title: 'Sala não encontrada' };
  }

  return {
    title: `${room.name} — PSI Agenda`,
    description: room.description ?? 'Sala de atendimento psicológico disponível para agendamento.'
  };
}

export default async function RoomPage({ params }: RoomPageParams) {
  const room = await fetchRoom(params.id);

  if (!room) {
    notFound();
  }

  return (
    <Container size="lg" py="xl">
      <Grid gutter="xl">
        <Grid.Col span={{ base: 12, md: 7 }}>
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
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 5 }}>
          <RoomScheduler roomId={room.id} priceCents={room.price_cents} />
        </Grid.Col>
      </Grid>
    </Container>
  );
}
