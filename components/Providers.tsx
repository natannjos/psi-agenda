'use client';

import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import type { Session } from '@supabase/supabase-js';
import { ReactNode } from 'react';
import { theme } from '@/lib/theme';
import { AppHeader } from '@/components/AppHeader';

interface ProvidersProps {
  session: Session | null;
  children: ReactNode;
}

export function Providers({ session, children }: ProvidersProps) {
  return (
    <MantineProvider theme={theme} defaultColorScheme="light">
      <Notifications position="top-right" />
      <AppHeader session={session} />
      <main>{children}</main>
    </MantineProvider>
  );
}
