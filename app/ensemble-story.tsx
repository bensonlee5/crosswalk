'use client';

import { useState } from 'react';
import type { GameView, Player } from '@/lib/game';
import { getEnsembleView } from '@/lib/ensemble-story';
import type { EnsembleSceneView } from '@/lib/ensemble-story-types';
import { capturePersonReceipt } from '@/lib/person-response';
import { guideItemFactsById } from '@/lib/guide-item-facts';
import { StoryChoiceDeck, EncounterOutcome, useEncounterCommit } from './story-choices';
import { PersonResponseStage } from './person-response';
import CharacterPortrait from './character-portrait';
import GamePainting from './game-painting';

type Props = {
  g: GameView; p: Player; disabled: boolean;
  onAction: (id: string) => Promise<unknown>;
  onVisit: (place: string, storyId?: string) => void;
  selectedVenue?: string; storyId?: string;
};

/** Three nearby situations, one open scene. Travel and decisions use the ordinary
 * server action path; opening, closing and inspecting this panel cost nothing. */
export function EnsembleStories({ g, p, disabled, onAction, onVisit, selectedVenue, storyId }: Props) {
  const [selection, setSelection] = useState<{ playerId: string; storyId?: string; requestedId?: string } | null>(null);
  const selected = selection?.playerId === p.id && selection.requestedId === storyId ? selection.storyId : storyId;
  const view = getEnsembleView(g, p, selected, selectedVenue);
  const scene = view.scenes.find(s => s.id === selected);
  if (!view.scenes.length) return null;
  return <section className="cast-meetups ensemble-stories" aria-label="Stories crossing your day">
    <div className="cast-meetups-heading">
      <small className="encounter-eyebrow">HERE IN THE NEIGHBORHOOD</small>
      <h3>Other people have plans, too</h3>
      <p>A borrowed bit of space, an actual order, the wrong picture. Choose a part that matters to you.</p>
    </div>
    <div className="cast-meetup-list">{view.scenes.map(s => <button type="button" key={s.id}
      aria-expanded={s.id === selected} disabled={disabled}
      onClick={() => setSelection({ playerId: p.id, storyId: s.id === selected ? undefined : s.id, requestedId: storyId })}>
      <CharacterPortrait id={s.people[0].id} name={s.people[0].name} className="cast-meetup-token" />
      <span><strong>{s.title}</strong><small>{s.placeName}</small><span>{s.heading}</span></span>
      <span aria-hidden="true">{s.id === selected ? '−' : '→'}</span>
    </button>)}</div>
    {scene && <EnsembleScene key={[g.code, p.id, scene.id].join(':')} {...{ g, p, disabled, onAction, onVisit, scene }} />}
  </section>;
}

function EnsembleScene({ g, p, disabled, onAction, onVisit, scene }: Props & { scene: EnsembleSceneView }) {
  const actor = scene.speaker, atPlace = p.place === scene.place && p.world?.region === scene.region;
  const context = [g.code, p.id, g.round, scene.id].join('|');
  const commit = useEncounterCommit({ g, p, disabled, context, choices: scene.choices, onAction,
    findReceipt: (_result, updated, choice) => {
      const receipt = updated.ensemble?.receipts.find(r => r.actionId === choice.actionId);
      return receipt ? capturePersonReceipt(receipt, updated, receipt.response.speakerId) : null;
    },
  });
  const [preview, setPreview] = useState<{ context: string; id: string } | null>(null);
  const previewChoice = scene.choices.find(c => preview?.context === context && c.id === preview.id);
  const selectedChoice = previewChoice ?? scene.choices.find(c => c.available && c.primary) ?? scene.choices.find(c => c.available);
  const cause = selectedChoice?.cause;
  const item = guideItemFactsById[scene.objectId];
  return <div className="encounter-panel ensemble-scene">
    <header className="encounter-heading"><small className="encounter-eyebrow">{scene.people.map(person => person.name).join(' · ')}</small>
      <h3>{scene.heading}</h3><p>{scene.body}</p>
    </header>
    {!atPlace ? <button type="button" className="encounter-return" disabled={disabled} onClick={() => onVisit(scene.place, scene.id)}>
      Visit {scene.placeName} <span aria-hidden="true">→</span>
    </button> : <>
      <PersonResponseStage g={g} p={p} actorId={actor.id} name={actor.name} spot={scene.place}
        known={!!p.ensemble?.receipts.some(r => r.storyId === scene.id)}
        settled={scene.status === 'settled'} available={scene.choices.some(c => c.available)}
        preview={previewChoice ?? null} pending={commit.busy} error={commit.error} receipt={commit.receipt} />
      <EncounterOutcome g={g} receipt={commit.receipt} error={commit.error} compact />
      {cause && <div className="encounter-callback"><small>{cause.remote ? 'A message from ' + cause.regionName : 'Earlier here'} · {cause.actor} · month {cause.month}</small><p>{cause.text}</p></div>}
      <StoryChoiceDeck g={g} place={scene.place} choices={scene.choices}
        disabled={disabled} busy={commit.busy} conversational onSelect={choice => setPreview({ context, id: choice.id })}
        onCommit={choice => void commit.commit(choice)} isSubmitted={commit.isSubmitted}
        emptyText={scene.next} />
    </>}
    {(!atPlace || scene.choices.length > 0) && <p className="cast-contact-note">{scene.next}</p>}
    <details className="encounter-memory">
      <summary>{item?.name ?? 'The object'} &amp; what happened</summary>
      {item?.image && <GamePainting src={'/paintings/' + item.image.src} alt={item.image.alt} />}
      {item && <p>{item.name}. {item.ownership?.ownerLabel}</p>}
      <ol>{scene.events.map(event => <li key={event.id}><small>Month {event.month} · {event.actor.name}</small><p>{event.text}</p></li>)}</ol>
    </details>
  </div>;
}

export function EnsembleJournal({ g, p }: { g: GameView; p: Player }) {
  const { recap } = getEnsembleView(g, p);
  if (!recap.length) return null;
  return <details className="story-timeline">
    <summary>The parts you played</summary>
    <ol>{recap.map(receipt => <li key={receipt.id}>
      <small>Month {receipt.week}</small><strong>{receipt.title}</strong><p>{receipt.outcome}</p>
      {receipt.cash !== 0 && <p>{receipt.cash > 0 ? '+' : '−'}$ {Math.abs(receipt.cash).toLocaleString('en-US')} cash</p>}
    </li>)}</ol>
  </details>;
}
