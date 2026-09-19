# Dariten

A polished, **demo-only** personal finance web app in the spirit of a simplified Quicken: accounts, a transaction register, categories, a dashboard, and a monthly budget vs actual view. The in-app product name is **Quicken Demo**.

This is **not** production software. There is **no login**. Every visitor of a given deploy shares one household dataset. Do not enter real bank credentials or real personal transactions.

Live URL: [https://dariten.vercel.app](https://dariten.vercel.app)

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
| CI | GitHub Actions (`lint` → `typecheck` → unit tests → mabl on production / PR preview) |

Amounts are stored as integer cents.

## Environment variables

Copy `.env.example` to `.env` and fill in values.

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | Yes | Postgres connection string used by Prisma and the app |
| `MABL_API_KEY` | CI only | Mabl **CI/CD Integration** API key — store as a GitHub Actions secret, never commit it |
| `MABL_WORKSPACE_ID` | Optional | Defaults in CI to the Dario Kondratiuk workspace (see below) |
| `MABL_APPLICATION_ID` | Optional | Defaults in CI to the Dariten mabl application |
| `MABL_ENVIRONMENT_ID` | Optional | Defaults in CI to the Vercel mabl environment |

Only `MABL_API_KEY` is a secret. The three IDs are public identifiers and are hardcoded as workflow defaults.

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
5. Deploy. Production is [https://dariten.vercel.app](https://dariten.vercel.app).
6. The mabl **Vercel** environment should already point at that hostname. If you change the Vercel project name, update the mabl environment URL to match.

Vercel rebuilds on every push to the connected Git branch. Preview deployments get their own URLs. This project already sets the same Neon `DATABASE_URL` on **Preview** as on Production, so previews use the shared demo database (anyone can edit the same household). A separate Neon branch is optional if you later want isolated preview data.

### Vercel build note

`next build` does not query the database (pages are dynamically rendered). You still need `DATABASE_URL` at runtime on Vercel. Run `prisma migrate deploy` yourself whenever you add a new migration — it is not part of `npm run build`, so CI can stay green without a live database.

## Tests

```bash
npm test
```

Coverage is unit / component level: money math, filters, validators, CSV export, and the demo banner. There is no Playwright suite in this repo. Cloud browser coverage is intended to come from mabl after `MABL_API_KEY` is set.

## GitHub Actions

[`.github/workflows/ci.yml`](.github/workflows/ci.yml) on push to `main` and on pull requests:

1. `npm ci`
2. `npx prisma generate`
3. `npm run lint`
4. `npm run typecheck`
5. `npm test`

After those tests, mabl runs (same Dariten application + Vercel environment IDs) when `MABL_API_KEY` is set:

| GitHub event | Job | URL |
| --- | --- | --- |
| Push to `main` | **Mabl production** | [https://dariten.vercel.app](https://dariten.vercel.app) |
| Pull request | **Mabl preview** | That PR’s Vercel Preview URL (`app-url` override) |

Both jobs call the [official mabl GitHub Action](https://github.com/mablhq/github-run-tests-action) (`mablhq/github-run-tests-action@v1`), which creates a [deployment event](https://api.help.mabl.com/reference/ondeploy) (`POST https://api.mabl.com/events/deployment`) and waits for the triggered plans. If `MABL_API_KEY` is empty, the mabl jobs are skipped.

The preview job waits for Vercel with the official [`vercel/wait-for-deployment-action`](https://github.com/vercel/wait-for-deployment-action) (pinned commit). It polls GitHub’s Deployments API — no Vercel token. The job needs:

```yaml
permissions:
  contents: read
  deployments: read
  statuses: read
```

Those scopes are declared on the preview job so the default `GITHUB_TOKEN` can read Vercel’s GitHub Deployment and commit status. The Vercel GitHub integration must stay installed on this repo so preview deployments appear as GitHub Deployments.

The job is skipped until you add the API key:

1. In mabl, create a **CI/CD Integration** API key (workspace owner). Other key types will not authenticate the Action.
2. In GitHub: **Settings → Secrets and variables → Actions → New repository secret**.
3. Name it exactly `MABL_API_KEY` and paste the key. Do not commit it.
4. Pushes to `main` run mabl against production. Pull requests run mabl against the Vercel Preview URL after that deploy is ready.

`MABL_WORKSPACE_ID`, `MABL_APPLICATION_ID`, and `MABL_ENVIRONMENT_ID` are workflow `env` defaults (see table below). They are not secrets.

Equivalent manual trigger (same deployment API the Action wraps):

```bash
curl --request POST \
  --url https://api.mabl.com/events/deployment \
  --user "key:${MABL_API_KEY}" \
  --header "Content-Type: application/json" \
  --data "{
    \"application_id\": \"${MABL_APPLICATION_ID}\",
    \"environment_id\": \"${MABL_ENVIRONMENT_ID}\",
    \"plan_overrides\": { \"web_url\": \"https://dariten.vercel.app\" }
  }"
```

## Connecting Mabl after a Vercel deploy

Live app: [https://dariten.vercel.app](https://dariten.vercel.app)

| Field | Value |
| --- | --- |
| Workspace | Dario Kondratiuk (`Tyl0bVDkrVJ7yJn9DF6Elg-w`) |
| Application | **Dariten** (`IzDXT4hknwruhKOu7DOyaA-a`) — preferred |
| Environment | Vercel (`NmGUfHqpSgZFF0DInEGpDg-e`) |
| Deployment binding | `Pp8wEhwH772zbLBXMxBZ5w-d` |
| Environment URL | `https://dariten.vercel.app` |
| Legacy application | Quicken Demo (`PWctd71sv3gI1VluEdvuoQ-a`) — kept for history; do not target this from CI |

Suggested wiring:

1. Confirm the Vercel environment in mabl uses `https://dariten.vercel.app`.
2. Author a smoke plan on the **Dariten** application (Dashboard, Accounts, Transactions).
3. Bind that plan to the Vercel environment / deployment binding above so the GitHub Action deployment event picks it up.
4. Add `MABL_API_KEY` as a GitHub Actions secret. Pushes to `main` test production; pull requests test the Vercel Preview URL.
5. Keep the API key only in GitHub (or Vercel) secrets.

## Product notes

- Credit-card opening balances can be negative (amount owed). Net worth is the sum of every account balance.
- Transfers in the seed appear as two register lines (out of checking, into savings or cash) so the demo stays simple — there is no linked-transfer engine.
- Re-running `npm run db:seed` wipes and recreates the shared demo data.

## License

Demo source for evaluation and Mabl walkthroughs. Not an official Quicken product.
