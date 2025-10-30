import { Container } from '@mantine/core';
import { notFound } from 'next/navigation';
import { getServerSupabase } from '@/lib/supabase-server';
import type { Metadata } from 'next';
import { RoomDetails } from '@/components/RoomDetails';

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
      <RoomDetails room={room} />
    </Container>
  );
}
