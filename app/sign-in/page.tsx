'use client';

import { Container, Paper, Stack, Text, Title } from '@mantine/core';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/database';

export default function SignInPage() {
  const supabase = createClientComponentClient<Database>();

  return (
    <Container size="sm" py="xl">
      <Paper radius="lg" withBorder p="xl">
        <Stack gap="md">
          <div>
            <Title order={2}>Entrar</Title>
            <Text c="dimmed">Acesse com e-mail e senha ou link mágico.</Text>
          </div>
          <Auth
            supabaseClient={supabase}
            view="sign_in"
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#12b886',
                    brandAccent: '#0ca678'
                  }
                }
              }
            }}
            localization={{
              lang: 'pt'
            }}
            providers={[]}
            magicLink
            redirectTo={`${process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'}/`}
          />
        </Stack>
      </Paper>
    </Container>
  );
}
