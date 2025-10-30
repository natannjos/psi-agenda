import type { Metadata } from 'next';
import { ColorSchemeScript, MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import './globals.css';
import { theme } from '@/lib/theme';
import { AppHeader } from '@/components/AppHeader';
import { getServerSupabase } from '@/lib/supabase-server';

export const metadata: Metadata = {
  title: 'PSI Agenda',
  description: 'Agendamento rápido de salas de psicologia'
};

export default async function RootLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  const supabase = getServerSupabase();
  const {
    data: { session }
  } = await supabase.auth.getSession();

  return (
    <html lang="pt-BR">
      <head>
        <ColorSchemeScript />
      </head>
      <body>
        <MantineProvider theme={theme} defaultColorScheme="light">
          <Notifications position="top-right" />
          <AppHeader session={session} />
          <main>{children}</main>
        </MantineProvider>
      </body>
    </html>
  );
}
