import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { ColorSchemeScript } from '@mantine/core';
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import './globals.css';
import { getServerSupabase } from '@/lib/supabase-server';
import { Providers } from '@/components/Providers';

export const metadata: Metadata = {
  title: 'PSI Agenda',
  description: 'Agendamento rápido de salas de psicologia'
};

export default async function RootLayout({
  children
}: Readonly<{ children: ReactNode }>) {
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
        <Providers session={session}>{children}</Providers>
      </body>
    </html>
  );
}
