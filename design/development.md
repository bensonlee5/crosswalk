# Development

Use Node 22.22.0 (see `.nvmrc` and CI). Install the committed lockfile with `npm ci`. The app is Vite + React; GitHub Pages serves `dist/`, and the Supabase `crosswalk-game` Edge Function validates and persists commands.

## Commands

```sh
npm ci
npm run dev
npm run typecheck
npm run typecheck:backend
npm test
npm run test:backend
npm run check:engine
npm run check:edge
npm run guide:check
npm run manual:check
npm run build
```

`npm run lint` reports repository-wide lint findings. A focused lint pass is not a full lint pass. For memory-constrained environments, run test files serially with `node --experimental-strip-types --test --test-concurrency=1 tests/*.test.mjs tests/*.test.ts`. Do not overlap aggregate tests, compilation and rendering.

The Edge check uses pinned Deno and the installed dependency cache. A missing cache is a verification blocker, not permission to skip the check silently.

## Public configuration

Copy `.env.example` to `.env.local` for development. Only public values belong in `VITE_` variables:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_BASE_PATH`, `/crosswalk/` for project Pages
- `VITE_EMAIL_AUTH_ENABLED`, false until hosted email flows are verified

Never put service-role credentials, database passwords or access tokens in browser configuration. Changing hosted auth, redirects, origins or security settings requires appropriate authorization.

The public game is https://bensonlee5.github.io/crosswalk/ . The Travel Guide is `/manual/`; gameplay instructions are `/guide/`. The guides are generated from tracked canonical sources, so edit sources and rebuild instead of editing generated HTML.

See the [module map](../docs/game-client-architecture.md) before assigning overlapping changes, and the [release procedure](../docs/NEXT-RELEASE.md) before publishing.
