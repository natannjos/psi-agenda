import { Button, Container, Stack, Text, Title } from '@mantine/core';
import Link from 'next/link';

export default function BookingCancelPage() {
  return (
    <Container size="sm" py="xl">
      <Stack gap="md" align="center" ta="center">
        <Title order={1}>Pagamento não concluído</Title>
        <Text c="dimmed">Sua reserva permanece pendente por alguns minutos. Você pode tentar novamente quando quiser.</Text>
        <Button component={Link} href="/" variant="light" color="teal">
          Escolher outro horário
        </Button>
      </Stack>
    </Container>
  );
}
