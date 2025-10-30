import { Anchor, Button, Container, Group, Header, Text } from '@mantine/core';
import Link from 'next/link';
import { getServerSupabase } from '@/lib/supabase-server';
import { SignOutButton } from '@/components/SignOutButton';

export async function AppHeader() {
  const supabase = getServerSupabase();
  const {
    data: { session }
  } = await supabase.auth.getSession();

  return (
    <Header height={72} px="md">
      <Container size="lg" h="100%">
        <Group justify="space-between" align="center" h="100%">
          <Anchor component={Link} href="/" fw={700} fz="lg" c="teal.6">
            PSI Agenda
          </Anchor>
          {session?.user ? (
            <Group gap="sm" align="center">
              <Text fz="sm" c="dimmed">
                {session.user.email}
              </Text>
              <SignOutButton />
            </Group>
          ) : (
            <Button component={Link} href="/sign-in" variant="light" color="teal">
              Entrar
            </Button>
          )}
        </Group>
      </Container>
    </Header>
  );
}
