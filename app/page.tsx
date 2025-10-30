import { getServerSupabase } from '@/lib/supabase-server';
import type { Database } from '@/types/database';
import { HomeScreen } from '@/components/HomeScreen';

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

  return <HomeScreen rooms={rooms} />;
}
