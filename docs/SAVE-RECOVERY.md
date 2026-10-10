# Save and resume contract

These changes prepare the GitHub Pages / Supabase frontend. They do not deploy it or move any live Sites/D1 saves.

## What the frontend guarantees

- Every mutation gets one request ID and the authenticated owner's UID before sending. A pending journal stores only the intent, never an authoritative game snapshot or an access token.
- An interrupted request retains its original owner, room, version and request ID. Reloading checks that same request; it does not invent a replacement move.
- The game displays confirmed server state. While an action is uncertain, new moves are paused. `Check saved action` safely retries the existing intent.
- A definitive version conflict refreshes the current server state without applying the old intent to a newer version.
- An expired-session 401, session-required response or identity mismatch retains the pending intent and permits returning to the original account or preserved guest session.
- The owner subscription lives throughout the app, including active play and endings. A cross-tab identity change clears the previous owner’s screen and room list and invalidates old in-flight responses.
- `Check later` keeps the intent, marks it deferred, and returns home. Deferred intents require an explicit click and are not replayed automatically after reopening.
- Saved-game discovery is server-owned and paginated, so older rooms remain reachable even without the local last-room shortcut.
- Replies from abandoned navigation cannot reopen an older room or overwrite a newer version. A late reply from a previous owner cannot enter the current owner's visible room history.

## Backend requirements

The Edge Function validates the authenticated owner, accepts only game commands, and retains permanent `(owner, requestId)` receipts. Ownership, game rules, compare-and-swap updates, accepted-participant counts and receipt persistence are server concerns. Client snapshots must never be imported as trusted state. A room code is an invitation, not a seat-recovery credential.

History uses `GET ?history=1&cursor=...` and returns `{ rooms, nextCursor }`. Summaries contain code, mode, status, round, maxRounds, version, updatedAt and the names of the owner's seats. The transport must return `403 { identityMismatch: true }` rather than replacing the owner of a pending write.

## Limits

Guest recovery depends on preserving the guest authentication session in the same browser. Optional verified email/password account conversion can retain that UID across devices. Clearing a guest session can remove access even when the room still exists. The old Sites origin's HttpOnly cookie cannot be inherited by GitHub Pages; migration needs a separately authorized, server-verified transfer path. Do not claim room codes or local files can establish old-seat ownership.

If local storage is blocked, an in-tab retry can still work with an existing authenticated session, but the pending intention may not survive a closed tab. The interface warns about this. Database backups and provider availability are separate operational requirements; source control is not a live-save backup.

## Verification

- `node --test tests/save-session.test.mjs`: exact replay journal, malformed entries, multiple tabs, blocked storage, identity marker, bounded handshake retries, uncertainty and deferred checks.
- `node tests/reliability-home.test.mjs`: actual Home handlers with real game/API mutations and SQLite CAS. Includes full 1–4-seat campaigns, lost POST before/after commit, reload, stale version, unavailable local storage, private multi-room discovery, identity mismatch, expired sessions, cross-tab identity changes, late prior-owner replies and paginated older-room recovery.
- In that Home harness, new Supabase auth/history transport is a contract stub. Its passing result does not establish a deployed Supabase integration, real-browser rendering or provider configuration. The backend and auth suites cover their separate implementations.
