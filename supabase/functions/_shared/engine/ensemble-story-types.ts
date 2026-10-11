import type { CareerField } from './career-content.ts';
import type { RegionId } from './world-life.ts';

export type EnsembleNarration = { personal: string; public: string; npc: string };
export type EnsembleResponse = { speakerId: string; speech: string; activity: string; emotion: 'attentive' | 'warm' | 'proud'; gesture: 'pause' | 'point' };
export type EnsembleOption = {
  response: EnsembleResponse;
  id: string; label: string; outcome: string; narration: EnsembleNarration;
  signals: string[]; style?: string; cost?: number; paidHours?: number; workField?: CareerField; time: number;
  unless?: string; when?: string; set?: Record<string, boolean>;
  npcLabel?: string | null; commit?: string;
};
export type EnsembleBeat = { id: string; title: string; prompt: string; choices: EnsembleOption[]; npc: string };
export type EnsembleDefinition = {
  id: string; title: string; region: RegionId; cast: string[]; venue: string; place: string;
  object: string; desire: string; contradiction: string; trigger: string; ignored: string;
  beats: EnsembleBeat[]; personal: EnsembleOption;
};
export type EnsembleRule = Omit<EnsembleOption, 'signals'> & {
  signals: string[]; to: string; emit?: string[]; kind: string;
  correspondence?: boolean; beforeBeat?: number; setTarget?: Record<string, boolean>; from?: string;
};
export type EnsembleActor = { kind: 'player' | 'npc'; id: string; name: string };
export type EnsembleEvent = {
  id: string; month: number; storyId: string; beat: number; actionId: string;
  actor: EnsembleActor; title: string; text: string; signals: string[];
  originPlayers: string[]; parentCrossingIds: string[];
};
export type EnsembleCrossing = {
  id: string; ruleId: string; sourceEventId: string; sourceStoryId: string;
  storyId: string; kind: string; month: number; expiresMonth: number;
  originPlayers: string[]; claimedBy: string[]; continuation: boolean;
  sourceOrderId?: string; withdrawn?: boolean;
};
export type EnsembleThread = {
  id: string; status: 'queued' | 'active' | 'settled'; beat: number;
  openedMonth: number; readyMonth: number; dueMonth: number;
  flags: Record<string, boolean>; history: string[]; ending: string;
};
export type EnsembleOrder = {
  id: string; storyId: string; payerId: string; amount: number;
  status: 'paid' | 'served' | 'refunded'; absorbedWages: number;
};
export type EnsembleState = {
  version: 1; revision: number; arrivedMonth: number;
  threads: Record<string, EnsembleThread>; events: EnsembleEvent[];
  crossings: EnsembleCrossing[]; orders: EnsembleOrder[];
};
export type EnsembleReceipt = {
  id: string; actionId: string; eventId: string; week: number; storyId: string;
  title: string; body: string; outcome: string; cash: number; hours: number;
  paidHours: number; repayment: number; crossingId?: string; response: EnsembleResponse; soundCue?: 'sip';
};
export type EnsemblePlayerState = { version: 1; receipts: EnsembleReceipt[]; personal: string[] };
export type EnsembleChoiceView = {
  id: string; actionId: string; title: string; body: string;
  available: boolean; reason: string; previewText: string[];
  cost: { time: number; cash: number; energy: number }; primary?: boolean;
  cause?: { crossingId: string; text: string; storyTitle: string; actor: string; month: number; remote: boolean; regionName: string };
};
export type EnsembleSceneView = {
  id: string; title: string; heading: string; body: string; region: RegionId;
  place: string; placeName: string; people: {id: string; name: string}[];
  speaker: { id: string; name: string; mode: 'local'; reason: string };
  objectId: string; choices: EnsembleChoiceView[]; status: 'active' | 'settled';
  next: string; events: EnsembleEvent[];
};
export type EnsembleView = { scenes: EnsembleSceneView[]; recap: EnsembleReceipt[]; elsewhere: number };
