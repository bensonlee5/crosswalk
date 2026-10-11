'use client';
import { canonicalCharacterById } from '@/lib/character-canon';
import { castPeople,type CastPersonView } from '@/lib/character-cast';
import { economyMonthLabel } from '@/lib/economy';
import type { Game,Player } from '@/lib/game';
import { capturePersonReceipt } from '@/lib/person-response';
import { qualitativeText } from '@/lib/point-presentation';
import { worldPlaceName } from '@/lib/world-life';
import { useState } from 'react';
import { CharacterHistory } from './character-history';
import { CharacterMotives,MotiveJournal } from './character-motives';
import CharacterPortrait from './character-portrait';
import { PersonResponseStage,PersonReturn,PersonSceneDetails } from './person-response';
import { EncounterOutcome,StoryChoiceDeck,useEncounterCommit,type EncounterChoice } from './story-choices';

type EncounterProps={g:Game;p:Player;person:CastPersonView;spot:string;disabled:boolean;onAction:(id:string)=>Promise<unknown>;onClose:()=>void};

/** Cast choices keep the same single-commit and authoritative-receipt path as the original arcs. */
export function CastEncounterPanel({g,p,person,spot,disabled,onAction,onClose}:EncounterProps){
 const context=[g.code,p.id,g.round,p.world?.region||'alder',person.id,spot].join('|');
 const choices=person.spot===spot?person.choices:[];
 const commit=useEncounterCommit({g,p,disabled,context,choices,onAction,findReceipt:(_result,updated,choice)=>{
  const receipt=updated.cast?.receipts.find(r=>r.id===choice.id);
  return receipt?capturePersonReceipt(receipt,updated,person.id):null;
 }});
 const [previewState,setPreview]=useState<{context:string;choice:EncounterChoice}|null>(null);
 const preview=previewState?.context===context?choices.find(c=>c.actionId===previewState.choice.actionId)??null:null;
 const memories=[...person.memories].sort((a,b)=>b.week-a.week);
 return <div className="encounter-panel cast-encounter" data-actor={person.id}>
  <header className="encounter-heading person-heading"><div><small className="encounter-eyebrow">{economyMonthLabel(g,g.round).toUpperCase()} · {person.status}</small><h2 id="encounter-title">{person.name}</h2><p>{person.role}</p></div></header>
  <PersonResponseStage g={g} p={p} actorId={person.id} name={person.name} spot={spot} remote={person.remote} known={person.memories.length>0} settled={!choices.length} available={choices.some(c=>c.available)} preview={preview} pending={commit.busy} error={commit.error} receipt={commit.receipt} companionName={person.companionId?canonicalCharacterById[person.companionId]?.name:undefined}/>
  <EncounterOutcome g={g} receipt={commit.receipt||(!choices.some(choice=>choice.available)?person.lastReceipt||null:null)} error={commit.error} compact/>
  {!commit.receipt&&<StoryChoiceDeck g={g} place={spot} choices={choices} disabled={disabled} busy={commit.busy} onSelect={choice=>setPreview({context,choice})} conversational onCommit={choice=>void commit.commit(choice)} isSubmitted={commit.isSubmitted} emptyText={p.castRedacted?'This player’s conversations and relationship history are private.':person.spot!==spot?`You can reach ${person.name} through ${worldPlaceName(p,person.spot,g)}.`:'No new commitment. You can leave whenever you like.'}/>}
  <PersonSceneDetails>
  <section className="encounter-scene"><h3>{person.remote?'Keeping in touch':'A life of their own'}</h3>{person.remote&&<p className="encounter-callback">{person.name} is not at a public meetup here this {'month'}. The community room gives you a way to stay in touch.</p>}<p>{person.bio}</p>{person.body.map((text,i)=><p key={i}>{qualitativeText(text)}</p>)}</section>
  <CharacterHistory g={g} p={p} actorId={person.id}/>
  {person.goal&&<p className="encounter-promise"><strong>{person.interactionKind==='family'?'What fits today':person.interactionKind==='local'?`What matters to ${person.name}`:`What ${person.name} is working toward`}</strong>{person.goal}</p>}
  {person.tie&&<p className="encounter-tie"><strong>A connection between lives</strong>{person.tie}</p>}
  {person.invitation&&<p className="encounter-callback">{person.invitation}</p>}
  {memories.length>0&&<details className="encounter-memory cast-memory"><summary>{person.interactionKind?'Moments you remember':`What ${person.name} remembers`}</summary><ol>{memories.map((memory,i)=><li key={memory.week+':'+i}><small>{economyMonthLabel(g,memory.week).toUpperCase()}</small><p>{qualitativeText(memory.text)}</p></li>)}</ol></details>}
  </PersonSceneDetails>
  <CharacterMotives g={g} p={p} actorId={person.id} spot={spot} disabled={disabled||commit.busy} onAction={onAction}/>
  <PersonReturn g={g} p={p} spot={spot} onClose={onClose}/>
 </div>;
}

/** A few timely openings, never a collection checklist or an undiscovered-person directory. */
export function CastMeetups({g,p,disabled,onEncounter}:{g:Game;p:Player;disabled:boolean;onEncounter:(actorId:string,spot:string)=>void}){
 const people=castPeople(g,p);
 if(!people.length)return null;
 const openings=people.filter(person=>person.choices.length>0).sort((a,b)=>Number(!!b.invitation)-Number(!!a.invitation)||Number(a.remote)-Number(b.remote)||Number(b.memories.length===0)-Number(a.memories.length===0)||a.name.localeCompare(b.name)).slice(0,3);
 if(!openings.length)return null;
 return <section className="cast-meetups" aria-label="People to make time for">
  <div className="cast-meetups-heading"><small className="encounter-eyebrow">THIS {'MONTH'}, A LITTLE TIME TOGETHER</small><h3>Paths that cross yours</h3><p>Follow a conversation that matters to you. People have routines and plans of their own.</p></div>
  <div className="cast-meetup-list">{openings.map(person=><button type="button" key={person.id} disabled={disabled} onClick={()=>onEncounter(person.id,person.spot)}><CharacterPortrait id={person.id} name={person.name} className="cast-meetup-token"/><span><strong>{person.remote?'Keep in touch with ':'Meet '}{person.name}</strong><small>{person.remote?'Contact through ':'At '}{worldPlaceName(p,person.spot,g)} · {person.role}</small><span>{person.invitation||person.goal}</span></span><span aria-hidden="true">→</span></button>)}</div>
  <p className="cast-contact-note"><>Established adult friendships can continue through {worldPlaceName(p,'COMMUNITY',g)} when your paths are apart. Family moments and local drop-ins take place when people are here.</></p>
 </section>;
}

/** Only actual receipts are journal entries. No unearned relationships or speculative endings. */
export function CastJournal({g,p}:{g:Game;p:Player}){
 const receipts=[...(p.cast?.receipts||[])].sort((a,b)=>b.week-a.week);
 if(!receipts.length)return <MotiveJournal g={g} p={p}/>;
 return <section className="cast-journal"><small className="encounter-eyebrow">PEOPLE & THE MOMENTS BETWEEN</small><h2>The things you remember</h2><p>Small choices become a shared history.</p><details className="story-timeline" open={receipts.length<=3}><summary>Your conversations and commitments <span>{receipts.length} remembered moment{receipts.length===1?'':'s'}</span></summary><ol>{receipts.map(receipt=><li key={receipt.id}><small>{economyMonthLabel(g,receipt.week).toUpperCase()}</small><strong>{receipt.title}</strong><p>{qualitativeText(receipt.outcome||receipt.body)}</p>{receipt.outcome&&receipt.body&&receipt.body!==receipt.outcome&&<p className="encounter-callback">{qualitativeText(receipt.body)}</p>}</li>)}</ol></details><MotiveJournal g={g} p={p}/></section>;
}

export function CastPromiseNotice({g,p}:{g:Game;p:Player}){

 const names=castPeople(g,p).filter(person=>{
  const promise=p.cast?.bonds[person.id]?.promise;
  return promise?.status==='open'&&promise.due<=g.round;
 }).map(person=>person.name);
 if(!names.length)return null;
 return <p className="overdraft-warning cast-promise-notice" role="note">You promised time to {names.join(', ')} this {'month'}. Ending now records {names.length===1?'that promise':'those promises'} as missed. You can still find them through Places or contact them through the community room before you finish. {g.round>=g.maxRounds?'The unfinished promise stays part of your ending.':'An honest repair remains possible in a later chapter.'}</p>;
}
