import {initializeEnsemble,initializeEnsemblePlayer,ensembleMemberState,ensembleMemberPlayers} from '../_shared/engine/ensemble-story.ts';
import {CURRENT_GAME_PROTOCOL,CURRENT_GAME_SCHEMA,REFRESH_GAME_MESSAGE,NEW_LIFE_MESSAGE,isCurrentGameState} from '../_shared/engine/current-game.ts';
import {initializeActionIncidents,actionIncidentMemberPlayers} from '../_shared/engine/action-incidents.ts';
import {initializeCareerPlayer,careerMemberPlayers} from '../_shared/engine/careers.ts';
import {initializeFinancialRecovery,financeMemberPlayers} from '../_shared/engine/financial-recovery.ts';
import {familiarityMemberPlayers} from '../_shared/engine/action-familiarity.ts';
import {initializeSharedOpportunities,initializeSharedOpportunityPlayer,sharedMemberPlayers} from '../_shared/engine/shared-opportunities.ts';
import {initializeMotivesPlayer} from '../_shared/engine/character-motives.ts';
import { initializeCast, initializeCastPlayer, castMemberFields } from '../_shared/engine/character-cast.ts';
import { initializeEconomyPlayer } from '../_shared/engine/economy.ts';
import { initializeStory, initializeStoryPlayer } from '../_shared/engine/story-arcs.ts';
import { player, move, createEnvironment } from '../_shared/engine/game.ts';
import type { Game } from '../_shared/engine/game.ts';
import { initializeWorldPlayer, initializeSharedWorld, initializeStoryWorldPlayer } from '../_shared/engine/world-life.ts';
import { initializeLife, initializeLifePlayer } from '../_shared/engine/life-events.ts';

export type SavedGame = Game & { creationRequestId?: string };
export type RoomRow = { code: string; state: SavedGame; version: number; updated_at: number };
export type Mutation = {
  op: 'create' | 'join' | 'start' | 'move'; requestId: string; ownerSession: string; protocolVersion: typeof CURRENT_GAME_PROTOCOL;
  code?: string; version?: number; mode?: 'online' | 'hotseat'; names?: string[];
  name?: string; action?: string; destination?: string;
};
export type Commit = {
  actor: string; requestId: string; fingerprint: string; op: Mutation['op'];
  code: string; expectedVersion: number | null; state: SavedGame;
};
export type SavedRoom = {
  code: string; mode: string; status: string; round: number; maxRounds: number;
  version: number; updatedAt: number; names: string[];
};
export type HistoryCursor = { updatedAt: number; code: string };
export type StoreResult = { kind: 'ok'; room: RoomRow; replayed?: boolean; appliedVersion?: number }
  | { kind: 'missing' | 'stale' | 'code_taken' | 'request_mismatch' | 'forbidden' };
export interface GameStore {
  read(actor: string, code: string): Promise<RoomRow | null>;
  history(actor: string, cursor?: HistoryCursor): Promise<SavedRoom[]>;
  receipt(actor: string, requestId: string, fingerprint: string): Promise<StoreResult>;
  commit(command: Commit): Promise<StoreResult>;
}
export class GameError extends Error {
  readonly status: number;
  readonly identityChanged: boolean;
  readonly refreshRequired: boolean;
  readonly newLifeRequired: boolean;
  constructor(status: number, message: string, identityChanged = false, refreshRequired = false, newLifeRequired = false) { super(message); this.status = status; this.identityChanged = identityChanged; this.refreshRequired = refreshRequired; this.newLifeRequired = newLifeRequired; }
}
export const validActor = (s: unknown): s is string => typeof s === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);
export const validCode = (s: unknown): s is string => typeof s === 'string' && /^[A-Z0-9]{6}$/.test(s);
// eslint-disable-next-line no-control-regex -- Rejecting all C0 control characters in request IDs is intentional input validation.
const validRequestId = (s: unknown): s is string => typeof s === 'string' && s.length > 0 && s.length <= 80 && !/[\u0000-\u001f]/.test(s);
const cleanName = (s: unknown) => typeof s === 'string' ? s.trim().slice(0, 20) : '';

/** Only commands are accepted. A supplied snapshot, version flag or player balance is never applied. */
export function parseMutation(value: unknown, actor: string): Mutation {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new GameError(400, 'Invalid request');
  const b = value as Record<string, unknown>;
  requireCurrentProtocol(b.protocolVersion);
  if (!['create', 'join', 'start', 'move'].includes(String(b.op))) throw new GameError(400, 'Unknown request');
  if (!validActor(b.ownerSession) || b.ownerSession !== actor) {
    throw new GameError(403, 'Your saved-seat identity changed. Keep this pending action and reopen the account or browser that created it. A room code cannot recover another seat.', true);
  }
  if (!validRequestId(b.requestId)) throw new GameError(400, 'A stable request ID is required');
  const command: Mutation = { op: b.op as Mutation['op'], ownerSession: actor, requestId: b.requestId, protocolVersion: CURRENT_GAME_PROTOCOL };
  if (b.op === 'create') {
    if (b.mode !== 'online' && b.mode !== 'hotseat') throw new GameError(400, 'Choose a game mode');
    const names = b.mode === 'hotseat' ? b.names : [b.name];
    if (!Array.isArray(names) || names.length < 1 || names.length > 4 || names.some(n => !cleanName(n))) throw new GameError(400, 'Add a name for every player');
    command.mode = b.mode;
    if (b.mode === 'hotseat') command.names = names.map(cleanName); else command.name = cleanName(b.name);
  } else {
    if (!validCode(b.code)) throw new GameError(400, 'Enter a six-character room code');
    command.code = b.code;
    if (b.op === 'join') {
      if (!cleanName(b.name)) throw new GameError(400, 'Enter your name');
      command.name = cleanName(b.name);
    } else {
      if (!Number.isSafeInteger(b.version) || Number(b.version) < 0) throw new GameError(400, 'Invalid saved-game version');
      command.version = Number(b.version);
      if (b.op === 'move') {
        if (typeof b.action !== 'string' || !b.action || b.action.length > 160) throw new GameError(400, 'Invalid action');
        if (b.destination !== undefined && (typeof b.destination !== 'string' || b.destination.length > 80)) throw new GameError(400, 'Invalid destination');
        command.action = b.action;
        if (b.destination !== undefined) command.destination = b.destination as string;
      }
    }
  }
  return command;
}
export async function digest(value: string): Promise<string> {
  return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value))), n => n.toString(16).padStart(2, '0')).join('');
}
/** Includes the intended version and normalized command, not attacker-supplied extra fields. */
export const fingerprint = (command: Mutation) => digest(JSON.stringify(command));
export function requireCurrentProtocol(value: unknown): void {
  if (value !== CURRENT_GAME_PROTOCOL) throw new GameError(409, REFRESH_GAME_MESSAGE, false, true);
}
export function requireCurrentGame(value: unknown): void {
  if (!isCurrentGameState(value)) throw new GameError(409, NEW_LIFE_MESSAGE, false, false, true);
}
export function memberView(room: RoomRow, actor: string) {
  requireCurrentGame(room.state);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- Rest destructuring deliberately strips private RNG, schedules, and creation identifiers from the member response.
  const { members, host, lifeSeed, lifeSchedule, actionIncidentRng, creationRequestId, ...safe } = room.state;
  if (!members[actor]?.length) throw new GameError(403, 'This identity does not own a seat in this room');
  const castSafe=castMemberFields(room.state,members[actor]);
  const mine = members[actor];
  const projectedPlayers = financeMemberPlayers(careerMemberPlayers(actionIncidentMemberPlayers(familiarityMemberPlayers(sharedMemberPlayers(room.state,mine,(castSafe as {players?:Game['players']}).players??safe.players),mine),mine),mine),mine);
  return { ...safe, ...castSafe, ensemble: ensembleMemberState(room.state, mine), players: ensembleMemberPlayers(projectedPlayers, mine), mine, isHost: host === actor, version: room.version };
}
export function roomView(room: RoomRow, actor: string) {
  requireCurrentGame(room.state);
  if (room.state.members[actor]?.length) return memberView(room, actor);
  const g = room.state;
  return { code: g.code, schemaVersion: CURRENT_GAME_SCHEMA, status: g.status, players: g.players.map(p => ({ name: p.name })), joinable: g.status === 'lobby' && g.mode === 'online' && g.players.length < 4 };
}
export function createGame(command: Mutation, code: string): SavedGame {
  const actor = command.ownerSession;
  const players = (command.mode === 'hotseat' ? command.names! : [command.name!]).map(n => player(n));
  const g: SavedGame = {
    schemaVersion: CURRENT_GAME_SCHEMA, code, creationRequestId: command.requestId, mode: command.mode!, host: actor,
    members: { [actor]: players.map(p => p.id) }, players,
    status: 'lobby', round: 1, turn: 0,
    maxRounds: 8, log: ['Welcome to Crosswalk. Make room for a good life.'],
    turnsTaken: 0, ...createEnvironment(),
  };
  for (const p of g.players) initializeEconomyPlayer(p, g);
  initializeLife(g, crypto.getRandomValues(new Uint32Array(1))[0]);
  for (const p of g.players) initializeWorldPlayer(p);
  initializeSharedWorld(g);
  initializeSharedOpportunities(g);
  initializeStory(g);
  initializeCast(g);for(const p of g.players){initializeMotivesPlayer(g,p);initializeCareerPlayer(g,p);initializeFinancialRecovery(g,p);}
  initializeActionIncidents(g);
  initializeEnsemble(g);
  if (command.mode === 'hotseat') { g.status = 'playing'; initializeStory(g); initializeEnsemble(g); }
  requireCurrentGame(g);
  return g;
}
function applyCommand(room: RoomRow, command: Mutation): SavedGame {
  requireCurrentGame(room.state);
  const g = structuredClone(room.state), actor = command.ownerSession;
  if (command.op === 'join') {
    if (g.members[actor]?.length) return g;
    if (g.status !== 'lobby' || g.mode !== 'online' || g.players.length >= 4) throw new GameError(400, 'This room is no longer accepting players');
    const p = player(command.name!);
    initializeLifePlayer(p); initializeWorldPlayer(p); initializeEnsemblePlayer(p);
    initializeEconomyPlayer(p, g); initializeStoryPlayer(p);
    initializeCastPlayer(g,p);initializeMotivesPlayer(g,p);initializeCareerPlayer(g,p);initializeFinancialRecovery(g,p);
    g.players.push(p);initializeSharedOpportunityPlayer(g,p);initializeActionIncidents(g);
    initializeStoryWorldPlayer(g, p);
    g.members[actor] = [p.id];
  } else {
    if (!g.members[actor]?.length) throw new GameError(403, 'Reopen the account or browser where you entered this game');
    if (command.version !== room.version) throw new GameError(409, 'The room changed. Refresh the saved game; this action was not applied.');
    if (command.op === 'start') {
      if (g.host !== actor || g.status !== 'lobby' || g.players.length < 1) throw new GameError(400, 'The host can start once everyone has joined');
      g.status = 'playing'; initializeStory(g); initializeEnsemble(g);
    } else {
      if (!g.members[actor].includes(g.players[g.turn]?.id)) throw new GameError(403, 'It is another player’s turn');
      try { move(g, command.action!, command.destination); }
      catch (error) { throw new GameError(400, error instanceof Error ? error.message : 'That action is unavailable'); }
    }
  }
  return g;
}
function resultView(result: StoreResult, actor: string) {
  if (result.kind === 'ok') return roomView(result.room, actor);
  if (result.kind === 'request_mismatch') throw new GameError(409, 'That request ID was already used for a different action. Check your saved game before continuing.');
  if (result.kind === 'forbidden') throw new GameError(403, 'This identity does not own this saved action');
  if (result.kind === 'missing') throw new GameError(404, 'Room not found');
  throw new GameError(409, result.kind === 'code_taken' ? 'That room code was just taken. Start a new room again.' : 'Someone just updated the room. Refresh and try again.');
}
export async function mutate(store: GameStore, actor: string, input: unknown) {
  const command = parseMutation(input, actor), hash = await fingerprint(command);
  const saved = await store.receipt(actor, command.requestId, hash);
  // Replay must precede changed turn/version/lobby predicates; mutation will still
  // validate authentication and exact UID before this lookup.
  if (saved.kind !== 'missing') return resultView(saved, actor);
  if (command.op === 'create') {
    const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    const creationHash = await digest(`${actor}:create:${command.requestId}`);
    const code = Array.from({ length: 6 }, (_, i) => alphabet[parseInt(creationHash.slice(i * 2, i * 2 + 2), 16) % alphabet.length]).join('');
    return resultView(await store.commit({ actor, requestId: command.requestId, fingerprint: hash, op: command.op, code, expectedVersion: null, state: createGame(command, code) }), actor);
  }
  const room = await store.read(actor, command.code!);
  if (!room) throw new GameError(404, 'Room not found. Check the code.');
  let state: SavedGame;
  try { state = applyCommand(room, command); }
  catch (error) {
    // A duplicate may have committed after our first receipt lookup but before
    // the room read. Recheck before returning a now-stale validation error.
    const raced = await store.receipt(actor, command.requestId, hash);
    if (raced.kind !== 'missing') return resultView(raced, actor);
    throw error;
  }
  return resultView(await store.commit({ actor, requestId: command.requestId, fingerprint: hash, op: command.op, code: room.code, expectedVersion: room.version, state }), actor);
}
