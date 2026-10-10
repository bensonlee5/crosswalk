# GitHub Pages frontend

Crosswalk now builds as a static Vite/React application. `src/main.tsx` mounts the existing game UI and imports its existing styles. The browser bundle contains no Next, Vinext, Wrangler, D1 or server route runtime. Legacy D1 code stays in the repository for its existing migration/regression fixtures; it is excluded from the static application.

## Public configuration

Copy `.env.example` to `.env.local` for local development. For GitHub Actions use repository **variables**, not a service key:

- `VITE_SUPABASE_URL`: the project's `https://<reference>.supabase.co` URL
- `VITE_SUPABASE_PUBLISHABLE_KEY`: its `sb_publishable_...` browser-safe key
- `VITE_BASE_PATH`: `/crosswalk/` for project Pages; `/` for a custom-domain root
- `VITE_EMAIL_AUTH_ENABLED`: leave `false` until email configuration has been tested

The deployment workflow validates the first two before a main-branch deployment. Pull requests build without requiring a production project. None of the above grants database authority. Never add a service-role or secret key to a `VITE_` variable.

The authenticated API endpoint is `/functions/v1/crosswalk-game` at that Supabase URL. `gameFetch` maps only the old `/api/game` path and forwards the query. It attaches the session bearer token and public publishable key, omits cookies, and preserves the exact JSON mutation body. Mutation requests without the original owner return `403 identityMismatch` before any network request, so their pending records remain recoverable.

## Auth and progress

- Guest play uses a persisted anonymous Supabase user. Browser storage must work before a guest can be created.
- A separate project-scoped guest UID marker detects a missing/invalidated guest session. When that marker survives but the session does not, reads and new writes refuse to create a replacement guest. The account panel explains recovery choices. Starting a separate guest history requires an explicit acknowledgment and keeps old pending requests and any separate email-account session intact.
- Clearing all site data removes both the session and its marker, so a completely cleared browser cannot be distinguished from a first visit. An unverified anonymous guest cannot be recovered from a room code alone.
- Initial guest creation uses a project-scoped Web Lock and rechecks persisted Auth storage inside that lock. A second tab reuses the first tab's guest. Before returning an owner for a first mutation, the client verifies that the SDK persisted the same UID. Browsers without Web Locks may sign into an existing account but cannot create a new guest; the UI asks for an up-to-date browser.

- Email signup upgrades the existing anonymous UID: update email, confirm email, then set a password. It never creates a fresh replacement user for the guest's existing games.
- Email verification must be enabled. Enable manual identity linking and anonymous sign-in in Supabase. Email/password is the only account provider in this UI.
- Configure production SMTP and test delivery before setting `VITE_EMAIL_AUTH_ENABLED=true`.
- Set Supabase's Site URL to the exact public app URL, including `/crosswalk/` when applicable. Allow the app's exact verification and recovery redirects, including `?auth=upgrade` and `?auth=recovery`; do not replace these with another origin. The PKCE callback must return to the same browser that started the flow.
- Verification remains visibly pending until Auth confirms the matching user's email. Passwords are never kept in local storage.
- Signing into an existing account uses a second SDK session slot. It preserves the original guest session and exposes “Return to this browser’s guest game.” Histories are separate; there is no silent merge.
- Each project's SDK slots are `cw_<project>_guest_v1` and `cw_<project>_account_v1`. Supabase owns token refresh and storage. Do not clear either when switching identities.
- Normal active pending saves block identity switching. Mismatched-owner saves permit returning to their owner; deliberately deferred intents do not block account changes.
- Password reset requires a verified SDK `PASSWORD_RECOVERY` event from the PKCE exchange, plus an immediately validated matching non-anonymous user. Adding `?auth=recovery` to a URL is insufficient. A reload after the one-time recovery state is gone requires a fresh reset email.
- Guest sessions are origin-scoped. Moving from the former hosting origin to GitHub Pages, or later to a custom domain, does not automatically transfer browser storage or old D1 rooms. Existing host/backend migration is a separate server-side task. Keep the old deployment available until its saves are handled.

## Build and checks

```
npm ci
npm test
npm run typecheck
VITE_BASE_PATH=/crosswalk/ npm run build
VITE_BASE_PATH=/crosswalk/ npm run preview -- --port 4173
```

`dist/` is the Pages artifact. Use GitHub Pages “GitHub Actions” source, then the included workflow. Do not run the legacy framework/Wrangler scripts for this frontend. A custom domain needs a deliberate DNS/Pages change plus `VITE_BASE_PATH=/` and Auth redirect/CORS updates; no domain is configured by these files.

`GamePainting` applies `assetUrl()` to all artwork and fallback paths. The legacy direct neighborhood images and the home preview use it too. Vite rewrites CSS `url(...)` references. Artwork mapping and manifest paths remain unchanged so existing game tests and assets retain identity. Room links use the current deployment path.

## Verification limits

The automated auth suite uses fake Auth clients and tests guest/account switching, conflicts, pending verification, same-UID conversion, replay identity guards and password-recovery gates. It does not prove real SMTP delivery or a real project's Auth provider settings. Perform those checks after project setup. The static build and all local regression tests pass; no real project changes or deployment were made here.

In the current cloud executor, wildcard preview binding fails `uv_interface_addresses`. Binding Vite preview to `127.0.0.1` starts, but a separate shell cannot reach that process. Therefore a browser playtest against this preview has not been verified. Serve `dist/` from a reachable preview environment to complete visual/browser verification.

Official implementation references checked on 2026-10-10:
- https://supabase.com/changelog
- https://supabase.com/docs/guides/auth/auth-anonymous
- https://supabase.com/docs/reference/javascript/auth-resetpasswordforemail
- https://vite.dev/guide/static-deploy.html#github-pages

## Full character and place manual

The same artifact includes the complete static manual at [`/crosswalk/manual/`](https://bensonlee5.github.io/crosswalk/manual/), linked from the repository README. `npm run build` regenerates it from the approved game canon before Vite copies `public/` into `dist/`. Its 83 HTML files use relative navigation and share the game's 73 portrait/location assets. See [manual source and verification](manual/README.md) for rebuild commands and coverage. No change to the separate private manual Site or its access settings is needed.
