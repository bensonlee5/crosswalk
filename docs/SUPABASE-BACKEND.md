# Crosswalk Supabase backend

Prepared 2026-10-10. This is staging code, not proof of a live deployment. It creates no Supabase project, account, credential or external state when tested locally.

## Architecture and trust boundary

The GitHub Pages client calls one authenticated Edge Function, `crosswalk-game`. Guest play uses a persisted Supabase anonymous Auth session. The Edge Function verifies the bearer token with `auth.getUser(token)` and derives the actor UID from that response, never from editable metadata. Both guests and registered users have the authenticated role; neither gets direct game-database permissions.

The unchanged seven-file v34 game engine runs on the server. The client sends a small command. Only the server constructs and validates the next game state. `crosswalk_private` tables are not exposed through the Data API; all have RLS enabled with no browser policies. No public or authenticated role can execute game RPCs. The server's separate service-role client calls explicitly restricted SECURITY INVOKER functions in `public`, with empty search paths. There is no SECURITY DEFINER function, custom JWT ownership claim, public state-write API or client service key.

The RPC locks owner/request and room, then atomically commits the room version, membership, permanent receipt and deduplicated participant. A stale compare-and-swap writes none of these. Exact duplicate requests return the current authoritative room after checking their durable receipt. Receipts are scoped to `(user_id, request_id)` and fingerprint a fixed-order normalized command, including its expected version. A different payload with a used ID returns 409. Receipts do not expire after the game's legacy 100-ID display ring.

The SQL additionally rejects changed room owner, game-mode, engine version flags, membership or player IDs outside the authorized operation. Its state argument is a trusted Edge-to-database argument; it is not exposed to browser roles. Engine rules still run in TypeScript, so do not grant browser access to these functions later.

## Browser API contract

Endpoint: `${VITE_SUPABASE_URL}/functions/v1/crosswalk-game`.

Every request sends `Authorization: Bearer <current Supabase access_token>` and `apikey: <publishable key>`. Every POST also uses `Content-Type: application/json`. OPTIONS preflight is allowed only for configured origins. Responses are `Cache-Control: no-store` and vary on Origin and Authorization.

- GET `?session=1` returns `{session: "authenticated UID"}`. It does not create an Auth session.
- GET `?history=1` returns `{rooms, nextCursor}`. Summaries keep the existing `code, mode, status, round, maxRounds, version, updatedAt, names` shape. Names are only this identity's seats. At most 20 rooms per page; append `&cursor=<updatedAt>:<code>` to reach older rooms. Cursor null ends the list.
- GET `?code=ABC123` returns the unchanged sanitized game shape for members. A stranger receives only the lobby preview: code, status, player names and joinability. A code cannot restore ownership.
- POST create: `{op:"create", ownerSession:uid, requestId, mode:"online", name}` or mode hotseat with names.
- POST join: `{op:"join", ownerSession:uid, requestId, code, name}`.
- POST start: `{op:"start", ownerSession:uid, requestId, code, version}`.
- POST move: `{op:"move", ownerSession:uid, requestId, code, version, action, destination?}`.

All four mutation types require a stable request ID persisted before transmission and the original UID. Extra fields cannot override state, cash or rule versions. Payloads over 4096 bytes are rejected. Successful create/join/start/move return the current member game view with `mine`, `isHost` and `version`; internal ownership maps, seeds, receipts and creation request ID are removed.

An expired/invalid token returns 401 with `sessionRequired:true`. A different or missing ownerSession returns 403 with `identityMismatch:true`. Keep those pending commands and show recovery; do not silently create a new guest identity or rewrite their UID. Authentication outages, database failures, timeouts and malformed success responses are uncertain and must retain the exact command. 409 is a definite conflict/request-ID mismatch: refresh the room without replaying the action under a new version. Ordinary 400/403/404 command rejection is definite. Identity-mismatch 403 is the exception.

## Optional email/password accounts

Use Supabase's supported anonymous-to-permanent flow on the same user:

1. Enable Anonymous Sign-ins and Manual Identity Linking in the dedicated project.
2. While the current guest session is still active, call `updateUser({email}, {emailRedirectTo: <exact app root>})`.
3. The player verifies the email. Keep their guest game usable while confirmation is pending.
4. After verified email is established, call `updateUser({password})` on that same UID. Do not collect/store the password before it can be submitted. Passwords must never enter Crosswalk game API requests, game state, logs or local pending-intent storage.
5. Check that the user ID before/after upgrade is identical and refresh the session. Existing game membership requires no reassignment and the counter remains one.

Do not use signUp to replace a guest account. Do not offer Google/OAuth. If the email already belongs to an existing account, retain the guest session and explain that the accounts are separate. A future merge requires proof of both identities and explicit conflict handling; there is no merge/claim endpoint in this build. Do not switch accounts or sign out a guest with unlinked progress without a clear warning and explicit user choice.

Set `VITE_EMAIL_AUTH_ENABLED=false` until the project's sender/SMTP, confirmation, password update, recovery email and exact redirect path have actually been tested. Leave email confirmation enabled. Supabase's default mail service is not a production sender for arbitrary players. Custom SMTP/sender setup and any costs need approval. Manual-linking/email settings in local config do not automatically update the hosted project's dashboard.

## Counts and retention

`select public.crosswalk_usage_counts();` is owner/server only. No game HTTP route exposes it.

- `participating_identities`: unique Auth UIDs that successfully created or joined a room. Hotseat seats count once, repeated play counts once, anonymous-to-email upgrade on the same UID counts once.
- `registered_participants`: counted UIDs whose Auth user is non-anonymous and has confirmed email. This is not proof they have completed password setup.
- `guest_participants`: counted UIDs still marked anonymous.

These are identities, not verified unique people. Clearing browser data or another browser can create a new anonymous UID; an email account reused across devices counts once. Landing visits, session refreshes, previews, history reads, failed creates, invalid moves and losing joins do not count. The count set contains only an existing Auth UID, no analytics-specific timestamp, name, email, IP or browsing history. Application save state, membership and operation receipts necessarily retain their functional data separately.

There is no automatic room/receipt/guest cleanup. Auth-user foreign keys use RESTRICT so a routine anonymous cleanup cannot silently erase progress. Before any future deletion, define a user-facing retention/recovery policy and back up the records; do not copy an anonymous-user cleanup query from a generic guide.

## Migration continuity

The existing Site/D1 origin and its HttpOnly `cw_guest` cookie remain the source of old seats. GitHub Pages cannot read that origin's cookie. This migration performs no D1 export, no old-room overwrite and no room-code claim. Leave the old site available at its verified URL and label the two sets of saves accurately: the new host starts new Supabase rooms until a secure transfer is built.

A later transfer must verify the old cookie on the old backend, bind an expiring one-time ticket to that seat and the intended new Auth UID, then transfer authoritative server-read data with both stores coordinated. Multiplayer rooms need a single active authority or an explicit snapshot/fork policy. Other seats cannot be seized by the first claimant. Do not trust a player-uploaded game JSON, local-storage snapshot or room code as proof of ownership. No untested transfer endpoint is included here.

## Hosted configuration and deployment gate

Browser public build variables: `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` (`sb_publishable_...`). Keep frontend `VITE_BASE_PATH`/email-readiness flags as configured by the Pages build. Never use a service-role or secret key in a VITE_ variable, GitHub variable, source file or browser bundle.

Edge runtime: Supabase supplies `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`. The code uses the supplied legacy server values; no new secret needs to be created or copied out. Set the non-secret `CROSSWALK_ALLOWED_ORIGINS` to the exact Pages origin, e.g. `https://OWNER.github.io` (no `/crosswalk/`, wildcard or trailing slash). Add localhost only for development.

Hosted Auth: enable anonymous sign-ins and manual linking; keep email confirmation enabled; set minimum password length at least 8; keep Google/OAuth disabled; set Site URL and allowed redirect URL to the exact HTTPS app root including `/crosswalk/`. Preserve default anonymous-sign-in rate limits. Before a public launch, decide/test CAPTCHA or equivalent abuse prevention for anonymous registrations; do not disable rate limits for tests. Be aware a valid user can still issue many game commands, so monitor quotas and introduce a bounded operational per-user limit if abuse appears.

Hosted database: apply the migration only to the verified new Crosswalk project, with project identity checked first. Keep `crosswalk_private` out of exposed schemas. Run the read-only `scripts/check-supabase-security.sql`; desired access booleans are documented there. Run Supabase's security/performance advisors and fix relevant findings. The SQL explicitly enables RLS/revokes access regardless of the dashboard's automatic-RLS setting.

Function: deploy the `crosswalk-game` directory with its `_shared` imports, leaving `verify_jwt=true`. The handler still verifies the actual user token because the platform check can accept an API key for migration compatibility. No deployment was performed by this package.

Before advertising it as ready, exercise hosted guest creation, refresh/reopen, multiplayer join/turn race, lost-response retry, history pagination, token refresh/expiry, UID mismatch, direct RPC/table denial, exact-origin CORS, and email/password upgrade with same-UID save recovery. Preserve the old Site link throughout. Do not interpret local mock Auth tests as live email delivery or hosted credential verification.

## Verification completed in staging

- 21 tests against PGlite's real Postgres engine, including actual migration execution, SQL permissions, RLS flags, CAS conflict/rollback, permanent request receipts, a duplicate completion race, 45-room pagination, identity counters, stale-turn protection and legacy game flags.
- Strict TypeScript check for backend modules.
- Deno 2.9.6 check of the full Edge entrypoint against the exact npm-installed dependency tree (`npm ci`/package-lock). Direct Deno registry fetching was unavailable here; cached/manual node_modules mode worked.
- Byte hashes confirm all seven engine files equal the existing v34 source. The existing checkout's complete test suite passed 163/163 when run from its root.

PGlite executes one connection, so the tests verify the SQL logic/transaction semantics and queued conflicting operations, not simultaneous independent database connections. Run a multi-client race smoke on hosted or local full Supabase before launch. Hosted Auth, email, Edge gateway/CORS and advisors remain deployment-time checks.

## Current sources checked

- [Supabase changelog](https://supabase.com/changelog): reviewed 2026-10-10. The framework-adapter deprecation does not apply because this implementation uses no framework adapter. The Postgres minor-release affected features (ltree, legacy pgcrypto ciphers, btree_gist/custom operators) are absent here.
- [Anonymous sign-ins and conversion](https://supabase.com/docs/guides/auth/auth-anonymous): same-user email linking, verification before password, anonymous role semantics and abuse considerations.
- [Authorization headers](https://supabase.com/docs/guides/functions/auth-headers): bearer JWT plus publishable apikey and platform verification behavior.
- [Securing Edge Functions](https://supabase.com/docs/guides/functions/auth), [environment variables](https://supabase.com/docs/guides/functions/secrets), [securing the Data API](https://supabase.com/docs/guides/api/securing-your-api).

No behavior relies on client-editable user metadata or an assumed private browser credential.
