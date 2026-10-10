import type { Commit, GameStore, RoomRow, SavedRoom, StoreResult } from './game-service.ts';

/** This interface is intentionally satisfied only by the server's isolated admin client. */
type RpcClient = { rpc(name: string, args: Record<string, unknown>): PromiseLike<{ data: unknown; error: { message: string; code?: string } | null }> };
export function postgresStore(admin: RpcClient): GameStore {
  async function rpc<T>(name: string, args: Record<string, unknown>): Promise<T> {
    const { data, error } = await admin.rpc(name, args);
    // Do not serialize provider errors, tokens or database internals into replies.
    if (error) throw new Error(`Saved-game database unavailable (${error.code ?? 'unknown'})`);
    return data as T;
  }
  return {
    read: (actor, code) => rpc<RoomRow | null>('crosswalk_read_room', { p_actor: actor, p_code: code }),
    history: (actor, cursor) => rpc<SavedRoom[]>('crosswalk_history', { p_actor: actor, p_before_updated_at: cursor?.updatedAt ?? null, p_before_code: cursor?.code ?? null }),
    receipt: (actor, id, hash) => rpc<StoreResult>('crosswalk_receipt', { p_actor: actor, p_request_id: id, p_fingerprint: hash }),
    commit: (c: Commit) => rpc<StoreResult>('crosswalk_commit', {
      p_actor: c.actor, p_request_id: c.requestId, p_fingerprint: c.fingerprint,
      p_op: c.op, p_code: c.code, p_expected_version: c.expectedVersion, p_next_state: c.state,
    }),
  };
}
