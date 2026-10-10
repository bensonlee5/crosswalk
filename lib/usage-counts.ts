/**
 * Reuse the room-access guest hash to count participating browsers, not people.
 * Never send the hash to clients or attach names, timestamps, or activity to it.
 * Clearing/expiring cw_guest, a new browser, or a new device can count again;
 * multiple people sharing one browser still count once.
 */
export function participantCountStatement(
  database: D1Database,
  guestHash: string,
  roomCode: string,
): D1PreparedStatement {
  if (!/^[a-f0-9]{64}$/.test(guestHash) || !/^[A-Z0-9]{6}$/.test(roomCode)) {
    throw new Error('Invalid participant count identity');
  }

  // Append to the SAME D1 batch as the create/join room write. Querying persisted
  // membership, rather than SQLite changes(), also works when other save-related
  // statements sit between the room write and this statement. A lost CAS race
  // cannot count a guest whose membership was not committed. The primary key
  // makes repeated create/join calls and concurrent retries count only once.
  return database.prepare(`
    INSERT INTO usage_browsers (guest_hash)
    SELECT ? FROM rooms
    WHERE code = ? AND json_type(state, ?) = 'array'
    ON CONFLICT (guest_hash) DO NOTHING
  `).bind(guestHash, roomCode, `$.members."${guestHash}"`);
}

/** Server/owner use only. The application exposes no public count or ID list. */
export async function readParticipantCount(database: D1Database): Promise<number> {
  const row = await database.prepare(
    'SELECT COUNT(*) AS participating_browsers FROM usage_browsers',
  ).first<{ participating_browsers: number }>();
  if (!row || !Number.isSafeInteger(row.participating_browsers) || row.participating_browsers < 0) {
    throw new Error('The participant count is unavailable');
  }
  return row.participating_browsers;
}
