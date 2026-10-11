# Save and resume contract

The GitHub Pages client and Supabase service retain confirmed state and exact pending commands. Only the current stored schema is supported. Unsupported games remain stored and offer a new-life action; they are not automatically migrated.

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

Guest recovery depends on preserving the guest authentication session in the same browser. Optional verified email/password account conversion can retain that UID across devices. Clearing a guest session can remove access even when the room still exists. Room codes and local files cannot establish seat ownership.

If local storage is blocked, an in-tab retry can still work with an existing authenticated session, but the pending intention may not survive a closed tab. The interface warns about this. Database backups and provider availability are separate operational requirements; source control is not a live-save backup.

## Verification

The save-session tests exercise durable current intents and malformed/blocked storage. The Home reliability harness invokes actual Home handlers and the current authoritative service with a bounded CAS storage seam. Real PostgreSQL tests separately exercise transactions, ownership, replay, conflict and privacy. Browser rendering, hosted authentication and provider availability require live checks.
