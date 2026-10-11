'use client';
import {capturePersonReceipt} from '@/lib/person-response';
import {qualitativeText} from '@/lib/point-presentation';
import {useState} from 'react';
import {PersonResponseStage} from './person-response';
import CharacterPortrait from './character-portrait';
import {assetUrl} from '@/lib/asset-url';
import {motivePortrait} from '@/lib/motive-portraits';
import type {MotiveReceipt} from '@/lib/character-motives';
import type {GameView as Game,Player} from '@/lib/game';
import {motiveScene} from '@/lib/character-motives';
import {economyMonthLabel} from '@/lib/economy';
import {StoryChoiceDeck,EncounterOutcome,useEncounterCommit,type EncounterChoice} from './story-choices';

/** An optional, grounded exchange inside the existing person's dialog. No meters,
 * future cases or extra people are introduced by rendering this disclosure. */
export function MotiveOutcomePortrait({receipt,name}:{receipt?:MotiveReceipt|null;name:string}){
 const image=motivePortrait(receipt),[failed,setFailed]=useState('');
 if(!receipt)return null;
 return image&&failed!==image.src?<img className="encounter-portrait" src={assetUrl(image.src)} alt={image.alt} width={640} height={640} onError={()=>setFailed(image.src)}/>:<CharacterPortrait id={receipt.actorId} name={name}/>;
}
export function CharacterMotives({g,p,actorId,spot,disabled,onAction}:{g:Game;p:Player;actorId:string;spot:string;disabled:boolean;onAction:(id:string)=>Promise<unknown>}){
 const scene=motiveScene(g,p,actorId),choices=scene?.spot===spot?scene.choices:[];
 const context=[g.code,p.id,g.round,p.world?.region,actorId,spot,'motives'].join('|');
 const commit=useEncounterCommit({g,p,disabled,context,choices,onAction,findReceipt:(_game,updated,choice)=>{const r=updated.motives?.receipts.find(r=>r.id===choice.id);return r?capturePersonReceipt(r,updated,actorId):null;}});
 const [previewState,setPreview]=useState<{context:string;choice:EncounterChoice}|null>(null);
 const preview=previewState?.context===context?choices.find(c=>c.actionId===previewState.choice.actionId)??null:null;
 if(!scene||scene.spot!==spot)return null;
 return <details className="encounter-memory character-motives"><summary>What {scene.name} has room for</summary>
  <PersonResponseStage g={g} p={p} actorId={actorId} name={scene.name} spot={spot} remote={scene.remote} known settled={!choices.length} available={choices.some(c=>c.available)} preview={preview} pending={commit.busy} error={commit.error} receipt={commit.receipt}
    narrative={<><p>{scene.goal}</p><p>{scene.priority} {scene.obligation} {scene.capacity}</p></>}>
   {!commit.receipt&&<StoryChoiceDeck g={g} place={spot} choices={choices} disabled={disabled} busy={commit.busy} onSelect={choice=>setPreview({context,choice})} conversational onCommit={choice=>void commit.commit(choice)} isSubmitted={commit.isSubmitted} emptyText="Let it settle before asking for something else."/>}
  </PersonResponseStage>
  {!commit.receipt&&<EncounterOutcome g={g} receipt={choices.length?null:scene.lastReceipt??null} error="" compact>{scene.lastReceipt&&<><small>From your last exchange</small><MotiveOutcomePortrait receipt={scene.lastReceipt} name={scene.name}/></>}</EncounterOutcome>}

 </details>;
}
export function MotiveJournal({g,p}:{g:Game;p:Player}){
 if(p.castRedacted||!p.motives?.receipts.length)return null;
 return <details className="story-timeline motive-journal"><summary>What you made room for together</summary><ol>{[...p.motives.receipts].reverse().map(r=><li key={r.id}><small>{economyMonthLabel(g,r.week).toUpperCase()}</small><strong>{r.title}</strong><p>{qualitativeText(r.outcome)}</p></li>)}</ol></details>;
}
