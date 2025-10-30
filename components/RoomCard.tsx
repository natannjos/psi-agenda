'use client';

import { Card, Group, Text, Badge, Button, Stack } from '@mantine/core';
import { formatCurrencyBRL } from '@/lib/format';
import Link from 'next/link';

interface RoomCardProps {
  id: string;
  name: string;
  description?: string | null;
  capacity?: number | null;
  amenities?: string[];
  priceCents: number;
}

export function RoomCard({ id, name, description, capacity, amenities, priceCents }: RoomCardProps) {
  return (
    <Card withBorder shadow="sm" radius="lg" padding="lg" tabIndex={0}>
      <Stack gap="xs">
        <Group justify="space-between" align="flex-start">
          <div>
            <Text fw={600} fz="lg">
              {name}
            </Text>
            {description ? (
              <Text c="dimmed" fz="sm">
                {description}
              </Text>
            ) : null}
          </div>
          <Badge variant="light" color="teal">
            {formatCurrencyBRL(priceCents)}/h
          </Badge>
        </Group>
        <Group gap="sm">
          {capacity ? <Badge color="blue">Até {capacity} pessoas</Badge> : null}
          {amenities?.map((amenity) => (
            <Badge key={amenity} variant="outline" color="gray">
              {amenity}
            </Badge>
          ))}
        </Group>
        <Button component={Link} href={`/rooms/${id}`} variant="filled" color="teal" size="md">
          Agendar
        </Button>
      </Stack>
    </Card>
  );
}
