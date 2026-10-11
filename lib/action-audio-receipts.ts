/** Client-only audio acknowledgement. It never changes or persists game state. */
type Snapshot = {
  code: string; version: number; turn: number;
  players: { id: string }[]; mine: string[];
};
type AudioReceipt = {
  requestId: string; ownerSession?: string; code?: string; version?: number;
  op: string;
};
type Confirmation = {
  request: AudioReceipt;
  epoch: number; currentEpoch: number; currentOwner: string | null;
  recovery: boolean; accepted: boolean;
  before?: Snapshot | null; after: Snapshot;
};

export class ActionAudioReceipts {
  private consumed = new Set<string>();

  /** Only a fresh, locally initiated, owned, authoritative acknowledgement can sound. */
  consume({ request, epoch, currentEpoch, currentOwner, recovery, accepted, before, after }: Confirmation): boolean {
    if (!accepted || recovery || epoch !== currentEpoch || !request.requestId
      || !request.ownerSession || request.ownerSession !== currentOwner) return false;
    if (!['create', 'start', 'move'].includes(request.op)) return false;
    if (request.op !== 'create' && request.code !== after.code) return false;
    if (request.op === 'move' || request.op === 'start') {
      if (!before || before.code !== after.code || before.version !== request.version
        || after.version !== before.version + 1) return false;
      const actor = before.players[before.turn]?.id;
      if (!actor || !before.mine.includes(actor) || !after.mine.includes(actor)
        || !after.players.some(player => player.id === actor)) return false;
    }
    const key = JSON.stringify([epoch, request.ownerSession, after.code, request.requestId]);
    if (this.consumed.has(key)) return false;
    this.consumed.add(key);
    // One room has only a short campaign; bound memory even in a very long session.
    if (this.consumed.size > 256) this.consumed.delete(this.consumed.values().next().value!);
    return true;
  }
}
