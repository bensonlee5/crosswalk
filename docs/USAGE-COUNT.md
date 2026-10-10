# Private participating-browser count

Crosswalk counts a browser after a successful room create or join. A page view,
poll, resume, game move, invalid request, or failed join does not add a browser.
Four people playing pass-and-play on one browser still contribute one count.
The same browser creating or joining multiple rooms also contributes one count.

## What is retained

`usage_browsers` has one column: `guest_hash`, the same SHA-256 hash already used
by the room's essential, HttpOnly `cw_guest` cookie for access. The count feature
does not issue a cookie, retain its raw value, collect an IP address, user agent,
name, email, timestamp, location, or activity history, or use an external
analytics service. A hash is pseudonymous and still linkable to this browser's
room membership; it is not a claim that the database contains no identifiers.

The hash is retained to deduplicate the lifetime count. Deleting old game rooms
does not erase the count, and revisiting another room with the same guest cookie
does not add another browser. No individual browsing history is recorded.

This is a count of distinct participating browser identities, not verified
people. Clearing or expiring the essential cookie, using another browser or
device, or automated requests can add another identity. Several people sharing
one browser count once. Exact people, cross-device deduplication, passive
visitors and bot-free audience measurement are outside this feature's scope.

## Reading the count

No public counter, public analytics route, administrative password, or new
sign-in is added. In an authorized owner/server database query context, retrieve
only the aggregate; no hash rows need to be retrieved:

```sql
SELECT COUNT(*) AS participating_browsers FROM usage_browsers;
```

Server-side `readParticipantCount(database)` returns only that number. It is
not exposed through the game response or a browser API. The Sites database
overview connector only lists table names, so it does not provide this total;
owner-facing retrieval needs an authorized aggregate query path in the final
backend. Do not enumerate hashes just to count them.

## Write consistency and deployment

Create and join append `participantCountStatement(database, guestHash,
roomCode)` to the same atomic D1 batch that saves the room. The insert checks
persisted membership, so losing a version race cannot count an unaccepted join.
The unique primary key makes repeats and retries safe. A database failure rolls
back both changes; the client must not show a successful save before commit.

The additive Drizzle migration creates the hash table without changing any old
room or performing a historical backfill. Counting starts only when the new
code and migration are deployed. Existing saves are not retroactively counted
by ordinary loading or playing. No production migration is needed for local
tests, and preparing this change does not publish it.

Tests use in-memory SQLite behind the D1 prepared-statement/batch interface, run
all schema migrations, and check deduplication, rejected joins, transaction
rollback, retention and aggregate-only reads:

```sh
node --test tests/usage-counts.test.mjs tests/api.test.mjs tests/balance-api.test.mjs tests/world-api.test.mjs tests/reliability-home.test.mjs
npx tsc --noEmit --incremental false
```
