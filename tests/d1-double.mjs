import {DatabaseSync} from 'node:sqlite';
import {readFileSync} from 'node:fs';

/**
 * D1's prepared-statement shape backed by real in-memory SQLite. Batches run in
 * one transaction, so the tests exercise actual SQL, uniqueness and rollback.
 * The optional rooms Map preserves the older suites' saved-room fixture API.
 */
export function createD1Double(rows = new Map()) {
  const sqlite = new DatabaseSync(':memory:');
  const journal = JSON.parse(readFileSync(new URL('../drizzle/meta/_journal.json', import.meta.url), 'utf8'));
  for (const migration of journal.entries) {
    sqlite.exec(readFileSync(new URL(`../drizzle/${migration.tag}.sql`, import.meta.url), 'utf8'));
  }

  function syncRoomFixtures() {
    const existing = sqlite.prepare('SELECT code, state, version, updated_at FROM rooms').all();
    const byCode = new Map(existing.map(row => [row.code, row]));
    for (const row of existing) {
      if (!rows.has(row.code)) sqlite.prepare('DELETE FROM rooms WHERE code = ?').run(row.code);
    }
    for (const [code, row] of rows) {
      const current = byCode.get(code);
      if (current?.state === row.state && current?.version === row.version) continue;
      sqlite.prepare(`INSERT INTO rooms (code, state, version, updated_at) VALUES (?, ?, ?, ?)
        ON CONFLICT (code) DO UPDATE SET state = excluded.state, version = excluded.version,
          updated_at = excluded.updated_at`).run(code, row.state, row.version, row.updated_at ?? current?.updated_at ?? 0);
    }
  }

  function refreshRoomFixtures() {
    rows.clear();
    for (const row of sqlite.prepare('SELECT code, state, version FROM rooms').all()) {
      rows.set(row.code, {state: row.state, version: row.version});
    }
  }

  function execute(sql, values) {
    const statement = sqlite.prepare(sql);
    if (statement.columns().length) {
      return {success: true, results: statement.all(...values).map(row => ({...row})), meta: {changes: 0}};
    }
    const result = statement.run(...values);
    return {success: true, results: [], meta: {changes: Number(result.changes), last_row_id: Number(result.lastInsertRowid)}};
  }

  function prepared(sql, values = []) {
    return {
      sql, values,
      bind(...bindings) { return prepared(sql, bindings); },
      async first(column) {
        syncRoomFixtures();
        const row = execute(sql, values).results[0] ?? null;
        return column && row ? row[column] : row;
      },
      async all() {
        syncRoomFixtures();
        const result = execute(sql, values);
        refreshRoomFixtures();
        return result;
      },
      async run() {
        syncRoomFixtures();
        const result = execute(sql, values);
        refreshRoomFixtures();
        return result;
      },
    };
  }

  const db = {
    prepare: prepared,
    async batch(statements) {
      syncRoomFixtures();
      sqlite.exec('BEGIN');
      try {
        const results = statements.map(statement => execute(statement.sql, statement.values));
        sqlite.exec('COMMIT');
        refreshRoomFixtures();
        return results;
      } catch (error) {
        sqlite.exec('ROLLBACK');
        throw error;
      }
    },
  };
  return {db, rows, sqlite, close: () => sqlite.close()};
}
