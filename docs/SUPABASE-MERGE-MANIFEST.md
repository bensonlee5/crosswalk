# Merge into the Pages staging checkout

Do not replace the frontend package.json, package-lock.json, tsconfig.json, .env.example, README or GitHub workflow with this standalone staging package.

Copy these additive paths:

- `supabase/config.toml`
- `supabase/.gitignore`
- `supabase/migrations/20261010054417_crosswalk_authoritative_game.sql`
- `supabase/functions/crosswalk-game/{index.ts,handler.ts,game-service.ts,postgres-store.ts,deno.json}`
- `supabase/functions/_shared/engine/*.ts` and `_shared/engine-manifest.json`
- `supabase/functions/.env.example`
- `tests/supabase-backend.test.mjs`
- `scripts/verify-engine-copy.mjs` and `scripts/check-supabase-security.sql`
- `tsconfig.backend.json`
- `docs/SUPABASE-BACKEND.md` and this manifest

Ignore staging `node_modules`, `supabase/.temp`, the standalone `.env.example`, package files and `.gitignore`. No credential-bearing files are present in the copy manifest.

The Pages frontend already pins `@supabase/supabase-js: 2.117.3`, TypeScript 5.9.3 and @types/node 22.19.19. Preserve them. Add exact dev dependencies `@electric-sql/pglite: 0.5.8`, `supabase: 2.120.0`, and `deno: 2.9.6`; regenerate the frontend package lock with npm install. These come from the standard npm registry.

Add scripts without replacing existing frontend scripts:

- `test:backend`: `node --experimental-strip-types --test tests/supabase-backend.test.mjs`
- `typecheck:backend`: `tsc --noEmit -p tsconfig.backend.json`
- `check:edge`: `deno check --node-modules-dir=manual --cached-only --config supabase/functions/crosswalk-game/deno.json supabase/functions/crosswalk-game/index.ts`
- `check:engine`: `node scripts/verify-engine-copy.mjs`

The frontend's explicit tsconfig include list does not include `supabase/`, so no frontend TS change is needed. The separate backend tsconfig deliberately excludes index.ts because Deno checks its runtime/global types. The function's deno.json pins the public package import exactly; npm ci/package-lock pins the full dependency tree used in the Deno check.

The current frontend npm test glob includes `tests/*.test.mjs`, so it will also run these 21 backend tests after copying. Keeping `test:backend` allows a focused run. Add `typecheck:backend`, `check:edge` and `check:engine` to CI after npm ci, before build/deploy. Do not add service credentials to GitHub just to run these tests: all SQL is in-memory and Auth is a local fixture.

After merging, run frontend typecheck, backend typecheck, Edge check, engine equality check, all tests and a static build with `/crosswalk/`. Then complete the separate hosted checks in SUPABASE-BACKEND.md. Do not deploy or migrate the original D1 site as a side effect.
