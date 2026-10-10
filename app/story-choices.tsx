'use client';
import {useEffect,useRef,useState} from 'react';
import {qualitativeText,effortLabel} from '@/lib/point-presentation';
import type {Game,Player} from '@/lib/game';
import {economyMonthLabel,economyTimeLabel} from '@/lib/economy';
import GamePainting from './game-painting';
import {decisionIllustration,isQuietEffect,narrativeExpectation} from '@/lib/decision-presentation';

export type EncounterChoice={id:string;actionId:string;title:string;body:string;available:boolean;reason:string;previewText:string[];cost:{time:number;cash:number;energy:number};primary?:boolean};
export type EncounterReceipt={title:string;body:string;outcome?:string;week?:number};
export type ConfirmedReceipt=(result:Game,player:Player,choice:EncounterChoice)=>EncounterReceipt|null;
const dollars=(n:number)=>'$'+Math.max(0,n).toLocaleString('en-US');

/** A stale rendered button cannot submit a newer choice. A response is success only
 * when the authoritative room contains a receipt for this exact submitted ID. */
export function useEncounterCommit({g,p,disabled,context,choices,onAction,findReceipt}:{g:Game;p:Player;disabled:boolean;context:string;choices:EncounterChoice[];onAction:(id:string)=>Promise<unknown>;findReceipt:ConfirmedReceipt}){
 const alive=useRef(true),request=useRef<{context:string;id:string}|null>(null),submitted=useRef(new Set<string>());
 const latest=useRef({g,p,disabled,context,choices,onAction,findReceipt});latest.current={g,p,disabled,context,choices,onAction,findReceipt};
 const [busy,setBusy]=useState(false),[receipt,setReceipt]=useState<EncounterReceipt|null>(null),[error,setError]=useState('');
 useEffect(()=>{alive.current=true;return()=>{alive.current=false}},[]);
 useEffect(()=>{setReceipt(null);setError('');setBusy(false);submitted.current.clear();},[context]);
 async function commit(choice:EncounterChoice){
  const state=latest.current,current=state.choices.find(c=>c.actionId===choice.actionId);
  if(state.disabled||request.current||submitted.current.has(choice.actionId)||!current?.available)return;
  const token={context:state.context,id:choice.actionId};request.current=token;setBusy(true);setError('');setReceipt(null);
  try{
   const result=await state.onAction(choice.actionId);
   if(!alive.current||latest.current.context!==token.context)return;
   const confirmed=result as Game|undefined,updated=confirmed?.code===state.g.code?confirmed.players?.find(q=>q.id===state.p.id):undefined;
   const found=updated&&confirmed?state.findReceipt(confirmed,updated,choice):null;
   if(found){submitted.current.add(choice.actionId);setReceipt(found);}
   else setError('This choice wasn’t confirmed. Check your connection before trying again.');
  }catch{if(alive.current&&latest.current.context===token.context)setError('This choice wasn’t confirmed. Reconnect and check the latest scene before trying again.');}
  finally{if(request.current===token)request.current=null;if(alive.current&&latest.current.context===token.context)setBusy(false);}
 }
 return{busy,receipt,error,commit,isSubmitted:(id:string)=>submitted.current.has(id)};
}

/** Choice cards only select a response. The single dark button is the only commit. */
export function StoryChoiceDeck({g,choices,disabled,busy,onCommit,place='COMMUNITY',isSubmitted=()=>false,emptyText='There is nothing new to catch up on just now.'}:{g?:Game;place?:string;choices:EncounterChoice[];disabled:boolean;busy:boolean;onCommit:(choice:EncounterChoice)=>void;isSubmitted?:(id:string)=>boolean;emptyText?:string}){
 const [selected,setSelected]=useState('');
 const choice=choices.find(c=>c.id===selected)??choices.find(c=>c.available&&c.primary)??choices.find(c=>c.available)??choices[0];
 if(!choice)return <p className="encounter-quiet">{emptyText}</p>;
 const blocked=disabled||busy||!choice.available||isSubmitted(choice.actionId);
 return <section className="story-choice-deck" aria-label="Choose your response" aria-busy={busy}>
  <div className="encounter-options image-choice-options" role="group" aria-label="Possible responses">{choices.map(c=>{const art=decisionIllustration(c,place);return <button type="button" key={c.id} className="encounter-option" aria-pressed={c.id===choice.id} disabled={busy||disabled} onClick={()=>setSelected(c.id)}><GamePainting src={art.thumb} fallback={art.fallback} alt=""/><span className="encounter-option-copy"><small className="choice-selection">{c.id===choice.id?'Selected response':'Explore response'}</small><strong>{c.title}</strong><small>{economyTimeLabel(g??{},c.cost.time)} · {dollars(c.cost.cash)}{!c.available?' · Not yet available':''}</small></span></button>})}</div>
  <div className="encounter-choice-preview" data-choice-id={choice.id} aria-live="polite">
   <small className="encounter-eyebrow">YOUR RESPONSE</small><h3>{choice.title}</h3><p>{narrativeExpectation(choice.body)}</p>
   <div className="encounter-costs" aria-label="Exact cost"><span>{economyTimeLabel(g??{},choice.cost.time)}</span><span>{dollars(choice.cost.cash)} upfront</span>{choice.cost.energy>0&&<span>{effortLabel(choice.cost.energy)}</span>}</div>
   {choice.previewText.some(text=>!isQuietEffect(text))&&<ul className="encounter-effects" aria-label="Commitments and consequences">{choice.previewText.filter(text=>!isQuietEffect(text)).map((text,i)=><li key={i}>{qualitativeText(text)}</li>)}</ul>}
   {choice.previewText.some(isQuietEffect)&&<details className="choice-effect-details" key={choice.id}><summary>How this may feel</summary><ul>{choice.previewText.filter(isQuietEffect).map((text,i)=><li key={i}>{qualitativeText(text)}</li>)}</ul></details>}
   {!choice.available&&<p className="encounter-lock" role="note">{qualitativeText(choice.reason)||'This response is not available yet.'}</p>}
   <button type="button" className="encounter-commit" disabled={blocked} onClick={()=>{if(!blocked)onCommit(choice);}}>{busy?'Saving your response…':isSubmitted(choice.actionId)?'Response recorded':`Choose: ${choice.title}`}<span aria-hidden="true">→</span></button>
  </div>
 </section>;
}

export function EncounterOutcome({g,receipt,error}:{g?:Game;receipt:EncounterReceipt|null;error:string}){
 if(error)return <p className="encounter-error" role="alert">{qualitativeText(error)}</p>;
 if(!receipt)return null;
 return <section className="encounter-outcome" role="status" aria-live="polite"><small className="encounter-eyebrow">WHAT CHANGED{receipt.week?' · '+economyMonthLabel(g??{},receipt.week).toUpperCase():''}</small><h3>{receipt.title}</h3><p>{qualitativeText(receipt.outcome||receipt.body)}</p>{receipt.outcome&&receipt.body&&receipt.body!==receipt.outcome&&<p className="encounter-callback">{qualitativeText(receipt.body)}</p>}</section>;
}
