# supabase Project

Use this repository to run and edit the app locally, then publish changes back through supabase.

Any change pushed to the repo will also be reflected  inn the supbase builder.

## Prerequisites

1. Clone the repository using the project's Git URL.
2. Navigate to the project directory.
3. Install dependencies: `npm install`.
4. Install the supabase CLI: `npm install -g supabase@latest`.
5. Install [Deno](https://docs.deno.com/runtime/getting_started/installation/) — the local supabase backend runs on it.

Run `supabase --help` (or see the [CLI reference](https://docs.supabase.com/developers/references/cli/commands/introduction)) for the full command surface.

## Run Locally

Three commands, from the project root:

```bash
supabase login   # one-time per machine
supabase link    # one-time per clone
supabase dev     # local backend + frontend together
```

Open the frontend URL that `supabase dev` prints (typically `http://localhost:5173`).

Notes:

- **Every fresh clone needs `supabase link`.** It writes `supabase/.app.jsonc` (the app-id pointer), which is deliberately gitignored. Your app id is in the Builder URL (`app.supabase.com/apps/<id>/...`); `supabase link --help` shows the non-interactive flags.
- **`supabase dev` runs the frontend for you** (via `site.serveCommand` in this repo's `supabase/config.jsonc`) — never run `npm run dev` yourself: alone it serves a UI with no backend behind it (`[supabase] Proxy not enabled`, every `/api` call fails), and alongside `supabase dev` the second Vite silently takes the next port and you end up looking at the wrong one.
- **The app must be published at least once for the UI to load under `supabase dev`.** The frontend boots by fetching app settings from the hosted app; before the first publish that fails and every page redirects to login. The local API works regardless.
- Entities, functions, and auth run locally — entity data is **in-memory only**, wiped when `supabase dev` restarts. Everything else (Core integrations, OAuth login) is forwarded to your deployed app. Full breakdown: [Local development overview](https://docs.supabase.com/developers/backend/overview/local-dev/local-development-overview).

## Frontend Only, Hosted Backend

To work on just the frontend against your app's live hosted backend:

```bash
supabase dev --remote
```

⚠️ In this mode writes go to your app's **production data** — plain `supabase dev` keeps everything local.

## Publish Your Changes

After pushing your changes to git, open the supabase dashboard and publish the app:

```bash
supabase dashboard open
```

This repo syncs to supabase through git, so publish from the dashboard rather than `supabase deploy` — a CLI deploy ships your local tree directly, bypassing the sync, and the deployed state silently diverges from the repo.

## Docs & Support

GitHub integration: [https://docs.supabase.com/developers/app-code/local-development/github](https://docs.supabase.com/developers/app-code/local-development/github)

Local development: [https://docs.supabase.com/developers/backend/overview/local-dev/local-development-overview](https://docs.supabase.com/developers/backend/overview/local-dev/local-development-overview)

Support: [https://app.supabase.com/support](https://app.supabase.com/support)

video link how the system works: https://www.loom.com/share/d4282635f4f64de3b3d18de57e690cab

full documentation link: https://docs.google.com/document/d/177ouMsuv3LfAqExwkKZNx-5ObpWdC7YtzmfVVs6kKa0/edit?usp=sharing
