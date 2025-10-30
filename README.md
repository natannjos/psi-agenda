# PSI Agenda

MVP de agendamento de salas de psicologia com foco em simplicidade, rapidez e evolução.

## Stack

- Next.js 14 (App Router) + TypeScript (ESM)
- Mantine.dev (UI) + @mantine/dates
- Supabase (Postgres + Auth + RLS)
- Stripe Checkout + webhook
- Resend + React Email
- Luxon para manipulação de datas (UTC no banco, America/Sao_Paulo na UI)

## Pré-requisitos

- Node.js 20 LTS
- pnpm >= 8
- Conta no Supabase com banco Postgres e Auth habilitados
- Chaves Stripe (modo test ou live)
- Chave Resend (produção ou sandbox)

## Configuração

1. Clone o repositório e instale dependências:

   ```bash
   pnpm install
   ```

2. Configure variáveis de ambiente copiando `.env.example` para `.env` e preenchendo os valores:

   ```bash
   cp .env.example .env
   ```

   | Variável | Descrição |
   | --- | --- |
   | `NEXT_PUBLIC_SUPABASE_URL` | URL do projeto Supabase |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Chave anônima do Supabase |
   | `SUPABASE_SERVICE_ROLE_KEY` | Chave Service Role (usada apenas em rotas seguras e webhooks) |
   | `NEXT_PUBLIC_BASE_URL` | URL base do app (ex.: `http://localhost:3000`) |
   | `STRIPE_SECRET_KEY` | Chave secreta Stripe |
   | `STRIPE_WEBHOOK_SECRET` | Secret do webhook Stripe (Checkout) |
   | `RESEND_API_KEY` | Chave API Resend |
   | `RESERVATIONS_EMAIL_FROM` | Remetente padrão dos e-mails |

3. Execute o schema e policies no banco Supabase:

   ```bash
   psql "$SUPABASE_DB_URL" -f supabase.sql
   ```

4. Popular dados de exemplo (ajuste `user_id` no topo do arquivo conforme necessário):

   ```bash
   psql "$SUPABASE_DB_URL" -f seed.sql
   ```

5. Inicie o projeto em desenvolvimento:

   ```bash
   pnpm dev
   ```

   A aplicação ficará disponível em `http://localhost:3000`.

## Fluxo principal

1. Usuário autentica com e-mail/senha ou magic link via Supabase Auth (`/sign-in`).
2. Home `/` lista salas ativas com preço, capacidade e amenidades.
3. Página de sala `/rooms/[id]` exibe calendário + slots disponíveis (50 minutos, passo de 10 min) calculados com base em aberturas, reservas e bloqueios.
4. Ao escolher um horário, o sistema cria uma reserva pendente e redireciona para o Stripe Checkout.
5. Webhook Stripe confirma o pagamento, marca a reserva como `confirmed`, registra pagamento e envia e-mail via Resend (`emails/booking-confirmed.tsx`).

## Rotas de API

- `GET /api/availability` — calcula disponibilidade diária considerando aberturas (`room_openings`), reservas (`bookings`) e bloqueios (`room_blackouts`).
- `POST /api/bookings` — cria reserva pendente, aplica constraint anti-overbooking e inicia sessão de checkout Stripe.
- `POST /api/checkout` — recria sessão Stripe para uma reserva pendente existente (idempotente).
- `POST /api/webhooks/stripe` — valida assinatura, grava pagamento, confirma reserva e dispara e-mail.

## Banco de Dados

- Schema completo + RLS em `supabase.sql`.
- Seeds com 3 salas, aberturas, blackout, reservas de exemplo e pagamento em `seed.sql`.
- Constraints anti-overbooking garantidas via `bookings_no_overlap` (`exclude using gist`).

## E-mails

- Template React Email em `emails/booking-confirmed.tsx`.
- Envio via Resend configurado em `lib/email.ts`.

## Scripts

- `pnpm dev` — inicia ambiente de desenvolvimento.
- `pnpm build` — build de produção.
- `pnpm start` — roda build.
- `pnpm lint` — lint usando `next lint`.

## Observações

- Todas as datas são armazenadas em UTC; a UI usa `America/Sao_Paulo`.
- Webhook Stripe exige endpoint público (use ngrok ou similar em desenvolvimento) e configure `STRIPE_WEBHOOK_SECRET` conforme o CLI do Stripe.
- Ajuste `RESERVATIONS_EMAIL_FROM` para um domínio verificado no Resend.
- Cron job opcional para expirar reservas pendentes pode ser criado via Supabase Scheduler (`status = 'expired'` quando `expires_at < now()`).

## Estrutura de pastas

```
app/
  api/         # Rotas (availability, bookings, checkout, webhook)
  rooms/       # Página por sala com calendário/slots
  bookings/    # Páginas de sucesso/cancelamento
  sign-in/     # Autenticação Supabase Auth UI
components/    # RoomCard, RoomScheduler, AppHeader, etc.
emails/        # Templates React Email
lib/           # Stripe, Resend, Supabase, utilitários de data/formatação
types/         # Tipagem do schema Supabase
```

## Próximos passos sugeridos

- Implementar painel `/admin` com CRUD das salas e horários.
- Gerar arquivo `.ics` no e-mail de confirmação.
- Criar job para expirar reservas pendentes automaticamente.
