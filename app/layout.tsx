import type { Metadata } from 'next';
import { ColorSchemeScript, MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import './globals.css';
import { theme } from '@/lib/theme';
import { AppHeader } from '@/components/AppHeader';

export const metadata: Metadata = {
  title: 'PSI Agenda',
  description: 'Agendamento rápido de salas de psicologia'
};

export default function RootLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <head>
        <ColorSchemeScript />
      </head>
      <body>
        <MantineProvider theme={theme} defaultColorScheme="light">
          <Notifications position="top-right" />
          {/* @ts-expect-error Async Server Component */}
          <AppHeader />
          <main>{children}</main>
        </MantineProvider>
      </body>
    </html>
  );
}
