'use client';

import { Button, Container, Stack, Text, Title } from '@mantine/core';
import Link from 'next/link';

export default function BookingSuccessPage() {
  return (
    <Container size="sm" py="xl">
      <Stack gap="md" align="center" ta="center">
        <Title order={1}>Pagamento confirmado!</Title>
        <Text c="dimmed">Você receberá um e-mail com os detalhes da sua reserva em instantes.</Text>
        <Button component={Link} href="/" variant="light" color="teal">
          Voltar para as salas
        </Button>
      </Stack>
    </Container>
  );
}
