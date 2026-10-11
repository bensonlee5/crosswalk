# GitHub Pages frontend

Vite builds the React client and generated Travel Guide into `dist/`. The workflow in `.github/workflows/pages.yml` runs tests, typechecks, engine checks and the build, then publishes the exact artifact from main.

Set `VITE_BASE_PATH=/crosswalk/` for project Pages. `assetUrl()` and relative guide links preserve this prefix. The public Supabase URL and publishable key are browser configuration; never use service credentials there. See [development](../design/development.md) for setup and [backend](SUPABASE-BACKEND.md) for the authoritative service.

The Travel Guide lives at `/crosswalk/manual/`, with towns, 75 local venues, 68 people and family profiles, 30 objects and recurring brands. `/crosswalk/guide/` remains gameplay help. `npm run build` rebuilds the Travel Guide from canonical sources before copying public assets; `manual:check` verifies deterministic output.

A green Pages build does not deploy the Edge Function or verify hosted authentication, actual audio, touch interaction or SMTP. Use the [release procedure](NEXT-RELEASE.md) and record live QA for the exact published revision.
