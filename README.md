# Dariten

A polished, **demo-only** personal finance web app in the spirit of a simplified Quicken: accounts, a transaction register, categories, a dashboard, and a monthly budget vs actual view. The in-app product name is **Quicken Demo**.

This is **not** production software. There is **no login** and **no remote database**. Each browser keeps its own copy of the sample household in IndexedDB. Do not enter real bank credentials or real personal transactions.

Live URL: [https://dariten.vercel.app](https://dariten.vercel.app)

## What is in the demo

- **Dashboard** — net worth, this month’s income and spending, savings rate, account balances, a spending snapshot, recent activity
- **Accounts** — checking, savings, credit card, and cash; create/edit; live balances
- **Transactions** — list, filters (account, category, date range), add/edit/delete, CSV export
- **Categories** — seeded chart of accounts plus basic management
- **Budgets** — monthly budget vs actual by expense category

Out of scope: bank sync, investments, multi-user auth, native mobile apps, a shared server-side household.

## Where the data lives

The ledger is stored in the browser with [Dexie](https://dexie.org/) (IndexedDB), database name **`dariten`**. Object stores mirror the old account, category, transaction, and budget models. Amounts are integer cents.

- The first visit in a browser writes the sample household when the store is empty (about 4 accounts, 17 categories, 59 transactions, and September 2026 budgets).
- Later edits stay in that browser and survive reloads. Another visitor, another browser, or a private window gets its own copy.
- **Reset sample data** in the green banner replaces this browser’s ledger with the original sample. It does not affect anyone else.
- You can also delete the `dariten` database under DevTools → Application → IndexedDB. The next load seeds it again.

The seed records live in `lib/seed-data.ts` (ported from the old Prisma seed). Pages read a client snapshot and write through `lib/db.ts`. The happy path does not call a server database.

## Stack

| Piece | Choice |
| --- | --- |
| App | Next.js 16 App Router, React 19, TypeScript |
| UI | Tailwind CSS 4 |
| Data | IndexedDB via Dexie 4, seeded per browser |
| Tests | Vitest + Testing Library (finance helpers, seed views, IndexedDB mutations) |
| Deploy | Vercel (no database env vars) |
| CI | GitHub Actions (`lint` → `typecheck` → unit tests → mabl on production / PR preview) |

## Environment variables

None are required to run or deploy the demo. Copy `.env.example` to `.env` only if you want the optional Mabl identifiers locally.

| Variable | Required | Purpose |
| --- | --- | --- |
| `MABL_API_KEY` | CI only | Mabl **CI/CD Integration** API key — store as a GitHub Actions secret, never commit it |
| `VERCEL_AUTOMATION_BYPASS_SECRET` | CI only | Vercel **Protection Bypass for Automation** — store as a GitHub Actions secret; must match the value in the Vercel project |
| `MABL_WORKSPACE_ID` | Optional | Defaults in CI to the Dario Kondratiuk workspace (see below) |
| `MABL_APPLICATION_ID` | Optional | Defaults in CI to the Dariten mabl application |
| `MABL_ENVIRONMENT_ID` | Optional | Defaults in CI to the Vercel mabl environment |

`MABL_API_KEY` and `VERCEL_AUTOMATION_BYPASS_SECRET` are secrets. The three Mabl IDs are public identifiers and are hardcoded as workflow defaults.

`DATABASE_URL` is no longer read. Remove it from the Vercel project (Production, Preview, and Development) when you next tidy env vars. The old Neon project can be paused or deleted; this app will not connect to it.

## Local setup

You need Node.js 22+. Postgres, Docker, and Neon are not used.

```bash
git clone https://github.com/kblok/dariten.git
cd dariten
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The dashboard heading appears without a remote database. The sample household loads from IndexedDB on first visit.

## Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Next.js dev server |
| `npm run build` | Production build (no database step) |
| `npm start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Vitest once (used by CI) |
| `npm run test:watch` | Vitest watch mode |

## Vercel

1. Sign in at [https://vercel.com](https://vercel.com) and import **`kblok/dariten`** if it is not already connected.
2. Framework preset should be **Next.js**. Build command is `npm run build`. No output directory override.
3. Do **not** set `DATABASE_URL`. The site renders without Neon.
4. Production is [https://dariten.vercel.app](https://dariten.vercel.app).

Vercel rebuilds on every push to the connected Git branch. Preview deployments are the same app; each reviewer’s browser still has its own ledger. `next build` does not open IndexedDB and does not need any database URL at build or runtime.

If this project still has a Neon `DATABASE_URL` from the previous Postgres demo, delete that variable in the Vercel dashboard so a future build does not look like it depends on it. Nothing in the app reads it.

## Tests

```bash
npm test
```

Coverage is unit / component level: money math, filters, validators, CSV export, seed views, IndexedDB create/reset, and the demo banner. There is no Playwright suite in this repo. Cloud browser coverage is intended to come from mabl after `MABL_API_KEY` is set.

## GitHub Actions

[`.github/workflows/ci.yml`](.github/workflows/ci.yml) on push to `main` and on pull requests:

1. `npm ci`
2. `npm run lint`
3. `npm run typecheck`
4. `npm test`

After those tests, mabl jobs start on the matching event (same Dariten application + Vercel environment IDs):

| GitHub event | Job | URL |
| --- | --- | --- |
| Push to `main` | **Mabl production** | [https://dariten.vercel.app](https://dariten.vercel.app) |
| Pull request | **Mabl preview** | That PR’s Vercel Preview URL (`app-url` override) |

Both jobs call the [official mabl GitHub Action](https://github.com/mablhq/github-run-tests-action) (`mablhq/github-run-tests-action@v1`), which creates a [deployment event](https://api.help.mabl.com/reference/ondeploy) (`POST https://api.mabl.com/events/deployment`) and waits for the triggered plans. Job-level `if:` only filters the GitHub event (`push` to `main` vs `pull_request`). Do **not** put `secrets.MABL_API_KEY` in a job `if:` — that makes GitHub schedule **zero jobs** and fail instantly. After mapping the secret to `env.MABL_API_KEY`, later steps check `env.MABL_API_KEY != ''`. If the secret is unset, those steps are skipped and the job exits 0.

Vercel Deployment Protection would otherwise block unattended mabl browsers. Both mabl steps send `http-headers: x-vercel-protection-bypass:${{ secrets.VERCEL_AUTOMATION_BYPASS_SECRET }}`. That GitHub secret must match the project’s **Protection Bypass for Automation** value in Vercel (Project → Settings → Deployment Protection). Do not commit the secret.

The preview job waits for Vercel with the official [`vercel/wait-for-deployment-action`](https://github.com/vercel/wait-for-deployment-action) (pinned commit). It polls GitHub’s Deployments API — no Vercel token. The job needs:

```yaml
permissions:
  contents: read
  deployments: read
  statuses: read
```

Those scopes are declared on the preview job so the default `GITHUB_TOKEN` can read Vercel’s GitHub Deployment and commit status. The Vercel GitHub integration must stay installed on this repo so preview deployments appear as GitHub Deployments.

Mabl trigger steps no-op until you add the API key:

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

Mabl runs in a real browser, so it will seed IndexedDB in that browser profile. A plan that assumes one shared server household will see only the data in the mabl browser. Use **Reset sample data** if a scenario needs the starter ledger again.

## Product notes

- Credit-card opening balances can be negative (amount owed). Net worth is the sum of every account balance.
- Transfers in the seed appear as two register lines (out of checking, into savings or cash) so the demo stays simple — there is no linked-transfer engine.
- “This month” on the dashboard follows the calendar month in UTC. The sample activity is July–September 2026, so later months show balances and recent transactions with little or no new cash flow until you add some.
- Resetting the banner (or deleting the `dariten` IndexedDB database) restores the starter household in this browser only.

## License

Demo source for evaluation and Mabl walkthroughs. Not an official Quicken product.
