# meta-client-reports

Painel fullstack (multi-tenant) para relatórios de conteúdo e anúncios da Meta (MVP).

## Stack

- Next.js 14 (App Router) + TypeScript
- TailwindCSS
- PostgreSQL + Prisma
- JWT (access + refresh) com cookies HttpOnly
- BullMQ + Redis (jobs de sync)

## Como subir com Docker

```bash
docker compose up --build
```

Em outro terminal, rode as migrations e seed:

```bash
npm install
npm run db:migrate
npm run db:seed
```

## Como rodar local (sem Docker)

1. Copie `.env.example` para `.env` e ajuste as variáveis.
2. Suba Postgres e Redis localmente.

```bash
npm install
npm run db:migrate
npm run db:seed
npm run dev
```

## Worker (sync)

```bash
npm run worker:dev
```

## Usuários de teste

- ADMIN: `admin@local` / `admin123`
- CLIENTE 1: `cliente1@local` / `client123`
- CLIENTE 2: `cliente2@local` / `client123`

## Como enfileirar sync

```bash
curl -X POST http://localhost:3000/api/admin/companies/<companyId>/sync
```

## Páginas

- `/login`
- `/dashboard`
- `/company/[companyId]` (tabs: Conteúdo, Anúncios, Conexões)
- `/admin`

## API

- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `GET /api/auth/me`

Admin:
- `GET /api/admin/companies`
- `POST /api/admin/companies`
- `GET /api/admin/users`
- `POST /api/admin/users`
- `POST /api/admin/companies/:id/users`
- `POST /api/admin/companies/:id/sync`

Empresas:
- `GET /api/companies/:id/connections`
- `POST /api/companies/:id/connections`
- `GET /api/companies/:id/reports/content?from=YYYY-MM-DD&to=YYYY-MM-DD&source=instagram|facebook&profile=...`
- `GET /api/companies/:id/reports/ads?from=YYYY-MM-DD&to=YYYY-MM-DD`
- `GET /api/companies/:id/reports/last-update`

## Integração futura com Meta APIs

- `meta/instagram.ts`: stubs para Instagram Graph API.
- `meta/marketing.ts`: stub para Marketing API.
- `worker/index.ts`: TODO para substituir mocks pela sincronização real.

