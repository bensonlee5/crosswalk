# Architecture, development, and deployment

[Design and development index](README.md) · [Player-facing README](../README.md)

## Framework and deployment

The current frontend is a static [Vite](https://vite.dev/) and React application. GitHub Pages serves the built `dist/` files; Supabase provides authenticated guest/email sessions, saved-game storage and the `crosswalk-game` Edge Function. The server validates commands and owns game state. The frontend does not run Next.js, Vinext, a Cloudflare Worker or D1. Legacy D1 route code remains only for regression fixtures and migration reference.

### Deployment status and existing games

The public GitHub Pages release is available at [Play Crosswalk](https://bensonlee5.github.io/crosswalk/) with its Supabase backend. Guest play is enabled; email/password accounts remain disabled pending provider and recovery checks. Keep the same browser’s site data to retain access to guest-owned saves.

The [original Crosswalk site](https://crosswalk-life-game.bensonlee5.chatgpt.site) remains the place to continue games created there. Its cookie-owned D1 saves cannot be claimed with a room code or automatically inherited by another origin. Keep it available until a separately verified migration path exists. Source control is not a backup of live saved games.

### Local setup and checks

Use Node.js 24 for the tested development workflow and install from the committed lockfile. Copy `.env.example` to `.env.local` and provide the public project configuration before testing online play.

```sh
npm ci
npm test
npm run typecheck
npm run build
npm run dev
```

For a production build under GitHub project Pages, set `VITE_BASE_PATH=/crosswalk/` in `.env.local` or the build environment, then run:

```sh
npm run build
npm run preview -- --port 4173
```

For a custom-domain root, use `VITE_BASE_PATH=/` and update Auth redirects and the backend origin allowlist to match. Artwork, styles and room links respect the configured path. `npm run lint` is also available; remaining repository-wide legacy lint issues are not part of the build/typecheck pass.

Automated checks cover game rules, versioned saves, exact request retries, owner changes, history pagination, guest/account preservation, email-verification gates and password-recovery guards. Mock-client and in-memory API tests do not prove real SMTP delivery, deployed database permissions, cross-device recovery or browser/mobile/WebGL behavior. Those require checks against the configured deployment.

### Public frontend configuration

Set these GitHub repository variables for the Pages workflow, or the matching values in `.env.local` for local development:

- `VITE_SUPABASE_URL`: the hosted Supabase project URL
- `VITE_SUPABASE_PUBLISHABLE_KEY`: the public `sb_publishable_...` key
- `VITE_BASE_PATH`: `/crosswalk/` for project Pages, `/` for a custom-domain root
- `VITE_EMAIL_AUTH_ENABLED`: keep `false` until email delivery, verification and recovery have been tested

Never place a service-role key, secret key, SMTP password or database credential in a `VITE_` variable. These variables are included in the browser bundle.

See [the frontend setup guide](../docs/github-pages-frontend.md) and [save/recovery contract](../docs/SAVE-RECOVERY.md) for the exact transport, storage and verification requirements.

### GitHub Pages and Supabase setup

1. Prepare the Supabase schema and authenticated `crosswalk-game` Edge Function. Configure the exact frontend origin in the backend allowlist. Verify row-level security, server-side ownership and permanent request receipts before enabling public play.
2. Enable anonymous sign-in for guests and manual identity linking for same-UID email conversion. Keep email confirmation enabled. Configure the exact Site URL and verification/recovery redirect URLs, including the project path when applicable.
3. Configure and test production SMTP. New guest accounts verify their email before setting a password; signing into an existing account preserves the browser’s separate guest session. Password recovery requires a verified recovery session. No Google sign-in is included.
4. Add the public GitHub repository variables, select GitHub Actions as the Pages source, and review `.github/workflows/pages.yml`. It tests, typechecks, builds and publishes the static artifact after a configured main-branch run.
5. Verify the deployed revision, artwork paths, guest create/join/resume, interrupted-save recovery, email conversion, existing-account sign-in and password reset before marking hosting complete or enabling email accounts.

Official setup references:

- [Vite deployment to GitHub Pages](https://vite.dev/guide/static-deploy.html#github-pages)
- [GitHub Pages publishing sources](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)
- [Supabase anonymous sign-ins and conversion](https://supabase.com/docs/guides/auth/auth-anonymous)
- [Supabase Auth redirect URLs](https://supabase.com/docs/guides/auth/redirect-urls)
- [Supabase production SMTP](https://supabase.com/docs/guides/auth/auth-smtp)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)

## Additional backend and release checks

Run `npm run test:backend`, `npm run typecheck:backend`, `npm run check:engine`, and `npm run check:edge` for the backend, shared-engine parity, and Edge entrypoint checks. The Edge command requires the configured Deno dependency cache. See the [release handoff](../docs/NEXT-RELEASE.md) for coordinated frontend/Edge packaging and verification limits, and [cast integration](../docs/CAST-INTEGRATION.md) for additive-save and rollback details.

The [verification index](verification.md) separates current checks from historical reports. A historical pass is not evidence that a later revision or deployment passed.
