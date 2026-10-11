import type {GameView, Player} from './game.ts';

/** Member responses omit authority and private server entropy/schedules. */
export type OwnedGameSnapshot = Omit<GameView, 'lifeSeed' | 'lifeSchedule' | 'actionIncidentRng'> & {
  version: number;
  mine: string[];
  isHost: boolean;
  host?: never;
  members?: never;
  lifeSeed?: never;
  lifeSchedule?: never;
  actionIncidentRng?: never;
  creationRequestId?: never;
};
export type PublicRoomSnapshot = {
  schemaVersion: GameView['schemaVersion'];
  code: string;
  status: GameView['status'];
  players: Pick<Player, 'name'>[];
  joinable: boolean;
  mine?: never;
};
export type RoomLookupSnapshot = OwnedGameSnapshot | PublicRoomSnapshot;
export type GameErrorEnvelope = {
  error?: string;
  newLifeRequired?: boolean;
  refreshRequired?: boolean;
  sessionRequired?: boolean;
  identityMismatch?: boolean;
};

/** Error responses remain untrusted data; expose only the supported scalar fields. */
export function gameErrorEnvelope(value: unknown): GameErrorEnvelope {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  const data = value as Record<string, unknown>;
  return {
    ...(typeof data.error === 'string' ? {error: data.error} : {}),
    ...(data.newLifeRequired === true ? {newLifeRequired: true} : {}),
    ...(data.refreshRequired === true ? {refreshRequired: true} : {}),
    ...(data.sessionRequired === true ? {sessionRequired: true} : {}),
    ...(data.identityMismatch === true ? {identityMismatch: true} : {}),
  };
}
