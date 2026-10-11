# Authoritative backend

The only production backend is the `crosswalk-game` Supabase Edge Function. GitHub Pages is a static client. The function verifies the authenticated user, validates the current protocol and persisted schema, executes canonical game commands and returns a privacy-filtered view.

## Storage and security

SQL migrations under `supabase/migrations/` define room storage, membership, compare-and-swap transactions and permanent owner/request receipts. Keep private tables and functions inaccessible to public clients; RLS, explicit grants/revokes and server ownership checks remain essential. A room code never grants another player's seat.

The deployed function keeps `verify_jwt=true` and also validates the actual user token. Service credentials stay server-side. Public browser configuration contains only the project URL and publishable key. Preserve the exact origin allowlist, auth settings and existing secrets during routine code deployment.

## Command lifecycle

A request carries the current protocol, authenticated owner, durable request ID, expected room version and semantic command. The service checks schema/protocol before exposing state or applying commands. The same accepted request replays its receipt without repeating actions, effects, incidents or familiarity. Conflicts, invalid ownership and malformed commands do not mutate the room.

There is one current ruleset. Unsupported stored games return a fresh-start response and remain stored; there is no automatic financial migration or alternate engine. The current client protocol is an integrity check, not feature negotiation.

## Tests and operations

`npm run test:backend` executes service and transaction regressions against PGlite's real PostgreSQL engine. This establishes SQL behavior and queued races, not simultaneous hosted independent connections. `scripts/check-supabase-security.sql` is the read-only deployed privilege audit. `npm run typecheck:backend`, `npm run check:edge` and `npm run check:engine` verify code boundaries and the exact mirrored engine.

Hosted Auth, email delivery, origin/gateway configuration and actual browser sessions need deployment checks. Do not enable email sign-in or alter security settings merely because local tests pass. Source archives are not database backups.
