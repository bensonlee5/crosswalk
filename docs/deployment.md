# Deployment

Crosswalk requires a Cloudflare-compatible Worker and D1 database bound as `DB`.

## Sites

Associate the checkout with your own destination Site using the supported Sites workflow, preserving the logical `d1: "DB"` declaration. The export intentionally omits the original project's identity. Build the Worker, apply the committed migrations through that workflow, and publish the Worker and client assets. Never copy real room data or guest cookies into a new project.

## Your own Cloudflare account

1. Install dependencies, run the tests/typecheck, and build.
2. Create a fresh D1 database and choose a Worker name in your own account. Review provider limits and charges before provisioning. Authenticate using Cloudflare's supported flow; do not commit tokens.
3. Inspect `dist/server/wrangler.json`. Set your Worker `name`; replace the D1 entry's `database_name` and all-zero placeholder `database_id` with your own database, keeping `binding: "DB"`. Preserve the generated entrypoint, assets and compatibility settings. Build regenerates this file, so repeat or automate your local configuration for later releases.
4. Apply the initial schema once to the fresh remote database:

```sh
npx wrangler d1 execute DB --remote --config dist/server/wrangler.json --file drizzle/0000_premium_next_avengers.sql
```

5. After reviewing the destination account, Worker and database, deploy:

```sh
npx wrangler deploy --config dist/server/wrangler.json
```

6. Verify page loading and room create/join/turn/reload flows from separate browsers before sharing.

No external API key is required by the game. Authentication and connector scaffold files are inherited from the starter and are not required for guest-room gameplay. No paid resource, new integration or automatic deployment was configured during this export. A separate Cloudflare production deployment was not executed.

Before scaling, plan rate limiting, room retention/cleanup, monitoring, backup/restore, guest-seat support, device/accessibility testing and a security review. Keep live D1 records, guest tokens, credentials, environment files, caches and dependencies out of source control.
