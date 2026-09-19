# Dariten

A polished, **demo-only** personal finance web app in the spirit of a simplified Quicken: accounts, a transaction register, categories, a dashboard, and a monthly budget vs actual view. The in-app product name is **Quicken Demo**.

This is **not** production software. There is **no login**. Every visitor of a given deploy shares one household dataset. Do not enter real bank credentials or real personal transactions.

Placeholder production URL (update after the first Vercel deploy if the hostname differs): [https://dariten.vercel.app](https://dariten.vercel.app)

## What is in the demo

- **Dashboard** — net worth, this month’s income and spending, account balances, a spending snapshot, recent activity
- **Accounts** — checking, savings, credit card, and cash; create/edit; live balances
- **Transactions** — list, filters (account, category, date range), add/edit/delete, CSV export
- **Categories** — seeded chart of accounts plus basic management
- **Budgets** — monthly budget vs actual by expense category

Out of scope: bank sync, investments, multi-user auth, native mobile apps.

## Stack

| Piece | Choice |
| --- | --- |
| App | Next.js 16 App Router, React 19, TypeScript |
| UI | Tailwind CSS 4 |
| Database | PostgreSQL via Prisma 6 |
| Hosted DB | [Neon](https://neon.tech) free tier (recommended for Vercel) |
| Local DB | Docker Compose Postgres 16, or any local Postgres |
| Tests | Vitest + Testing Library |
| Deploy | Vercel |
| CI | GitHub Actions (`lint` → `typecheck` → unit tests). Mabl job is a commented placeholder |

Amounts are stored as integer cents.

## Environment variables

Copy `.env.example` to `.env` and fill in values.

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | Yes | Postgres connection string used by Prisma and the app |
| `MABL_API_KEY` | CI only | Mabl API key — store as a GitHub Actions secret, never commit it |
| `MABL_WORKSPACE_ID` | CI only | Mabl workspace id |
| `MABL_APPLICATION_ID` | CI only | Mabl application id |
| `MABL_ENVIRONMENT_ID` | CI only | Mabl environment id |

The Mabl variables are placeholders so CI can be wired later. This repo does not invent or ship Mabl secrets.

## Local setup

You need Node.js 22+ and a Postgres database.

### 1. Clone and install

```bash
git clone https://github.com/kblok/dariten.git
cd dariten
cp .env.example .env
npm install
```

`npm install` runs `prisma generate`.

### 2. Start Postgres

**Option A — Docker Compose (recommended)**

```bash
docker compose up -d
```

This matches the default `.env.example` URL:

```text
DATABASE_URL=postgresql://quicken:quicken@localhost:5432/quicken_demo
```

**Option B — local Postgres**

Create a database and user, then point `DATABASE_URL` at them.

**Option C — Neon even for local work**

Create a free project at [https://console.neon.tech](https://console.neon.tech), copy the connection string (SSL required), and put it in `.env` as `DATABASE_URL`.

### 3. Migrate and seed

```bash
npx prisma migrate deploy
npm run db:seed
```

The seed replaces accounts, categories, transactions, and September 2026 sample budgets so the UI looks alive (~4 accounts, ~50 transactions).

To start over:

```bash
npm run db:reset
```

### 4. Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Next.js dev server |
| `npm run build` | `prisma generate` + production build |
| `npm start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Vitest once (used by CI) |
| `npm run test:watch` | Vitest watch mode |
| `npm run db:seed` | Re-seed the shared demo dataset |
| `npm run db:migrate` | Create / apply a migration in development |
| `npm run db:deploy` | Apply committed migrations (`prisma migrate deploy`) |
| `npm run db:reset` | Drop, migrate, and seed |

## Neon + Vercel + GitHub

### Create the Neon database

1. Sign in at [https://console.neon.tech](https://console.neon.tech) and create a project (for example `dariten`).
2. Open **Dashboard → Connection details**.
3. Copy the **pooled** connection string for the Next.js app. It looks like:

   ```text
   postgresql://USER:PASSWORD@ep-xxx-pooler.REGION.aws.neon.tech/neondb?sslmode=require
   ```

4. For the first migration you can use that same URL, or the **direct / unpooled** URL if Neon asks you to. Prisma in this repo uses a single `DATABASE_URL` (no `directUrl`) so the simplest path is: run migrate against the unpooled URL once, then set the pooled URL on Vercel.

Apply schema and seed from your laptop (or any machine with the URL):

```bash
DATABASE_URL="postgresql://USER:PASSWORD@ep-xxx.REGION.aws.neon.tech/neondb?sslmode=require" npx prisma migrate deploy
DATABASE_URL="postgresql://USER:PASSWORD@ep-xxx.REGION.aws.neon.tech/neondb?sslmode=require" npm run db:seed
```

### Connect this GitHub repo to Vercel

1. Sign in at [https://vercel.com](https://vercel.com) and click **Add New… → Project**.
2. Import **`kblok/dariten`** from GitHub. If the repo is not listed, install the Vercel GitHub app and grant access to it.
3. Framework preset should be **Next.js**. Build command can stay `npm run build` (or Vercel’s default). Output directory is not needed.
4. Under **Environment Variables**, add:
   - `DATABASE_URL` = Neon pooled connection string (Production, Preview, and Development if you use `vercel dev`)
5. Deploy. The production hostname should be [https://dariten.vercel.app](https://dariten.vercel.app) if the Vercel project is named `dariten`; otherwise use the hostname Vercel assigns.
6. After the first successful deploy, update the Mabl environment URL in the Mabl dashboard (and this README) to the real Vercel URL.

Vercel rebuilds on every push to the connected Git branch. Preview deployments get their own URLs; they will share the same Neon database unless you create a separate Neon branch and a different `DATABASE_URL` for Preview.

### Vercel build note

`next build` does not query the database (pages are dynamically rendered). You still need `DATABASE_URL` at runtime on Vercel. Run `prisma migrate deploy` yourself whenever you add a new migration — it is not part of `npm run build`, so CI can stay green without a live database.

## Tests

```bash
npm test
```

Coverage is unit / component level: money math, filters, validators, CSV export, and the demo banner. That is enough for GitHub Actions to stay green before Mabl is connected. There is no Playwright suite in this repo.

## GitHub Actions

[`.github/workflows/ci.yml`](.github/workflows/ci.yml) on push to `main` and on pull requests:

1. `npm ci`
2. `npx prisma generate`
3. `npm run lint`
4. `npm run typecheck`
5. `npm test`

A second job, **Mabl cloud run**, is present but commented out. When you are ready:

1. In the GitHub repo: **Settings → Secrets and variables → Actions**.
2. Add secrets named exactly:
   - `MABL_API_KEY`
   - `MABL_WORKSPACE_ID`
   - `MABL_APPLICATION_ID`
   - `MABL_ENVIRONMENT_ID`
3. Uncomment the `mabl-cloud-run` job in `.github/workflows/ci.yml`.
4. Replace the placeholder step with the [official mabl GitHub Action](https://help.mabl.com/docs/github-actions) or a `curl` call to the mabl deployment / plan-run API. Use the secret names above — do not hardcode keys.

## Connecting Mabl after a Vercel deploy

Mabl project already created for this demo:

| Field | Value |
| --- | --- |
| Workspace | Dario Kondratiuk (`Tyl0bVDkrVJ7yJn9DF6Elg-w`) |
| Application | Quicken Demo (`PWctd71sv3gI1VluEdvuoQ-a`) |
| Environment | Vercel (`NmGUfHqpSgZFF0DInEGpDg-e`) |
| Environment URL (placeholder) | `https://dariten.vercel.app` |

Suggested wiring:

1. Deploy to Vercel and confirm the live URL.
2. In Mabl, set the **Vercel** environment URL to that hostname.
3. Author a smoke plan that hits Dashboard, Accounts, and Transactions (filters + add/edit if you want).
4. After deploy, trigger that plan with the GitHub Action job (or a Vercel deploy hook). Typical inputs are the four `MABL_*` env vars and the plan id from the Mabl UI.
5. Keep `MABL_API_KEY` only in GitHub / Vercel secrets.

## Product notes

- Credit-card opening balances can be negative (amount owed). Net worth is the sum of every account balance.
- Transfers in the seed appear as two register lines (out of checking, into savings or cash) so the demo stays simple — there is no linked-transfer engine.
- Re-running `npm run db:seed` wipes and recreates the shared demo data.

## License

Demo source for evaluation and Mabl walkthroughs. Not an official Quicken product.
