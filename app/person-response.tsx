'use client';
import {useEffect,useRef} from 'react';
import type {GameView as Game,Player} from '@/lib/game';
import {worldPlaceName,regionDefinitions} from '@/lib/world-life';
import {personProfile,personReply,personCareerNotices,type PersonSceneInput,type PersonReply} from '@/lib/person-response';
import {motivePortrait} from '@/lib/motive-portraits';
import type {MotiveReceipt} from '@/lib/character-motives';
import CharacterPortrait from './character-portrait';
import GamePainting from './game-painting';

/** The portrait is a portrait, not a claim that its painted background is the
 * present venue. The separate setting strip always follows the current room. */
export function PersonResponseStage({name,spot,companionName,...input}:PersonSceneInput&{name:string;spot:string;companionName?:string}){
 const notices=personCareerNotices(input),reply=personReply(input),profile=personProfile(input.actorId),region=regionDefinitions[input.p.world?.region||'alder'];
 const currentReceipt=!input.pending&&!input.error&&!input.p.castRedacted?input.receipt:null;
 const confirmedId=currentReceipt?[input.g.code,input.p.id,currentReceipt.id??currentReceipt.actionId??currentReceipt.title,currentReceipt.week??input.g.round,currentReceipt.familiarity?.count??''].join('|'):'',animated=useRef(new Set<string>()),stage=useRef<HTMLDivElement>(null);
 useEffect(()=>{
  if(!confirmedId||animated.current.has(confirmedId))return;
  animated.current.add(confirmedId);
  if(typeof document!=='undefined'&&(document.activeElement===document.body||stage.current?.closest('.encounter-panel')?.contains(document.activeElement)))stage.current?.focus();
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  const target=stage.current?.querySelector('.person-action-object');
  if(!target||!('animate' in target))return;
  // One meaningful object/hand action per confirmed choice. Polling and unrelated
  // rerenders cannot replay it. No visual completion before the server receipt.
  const frames=reply.gesture==='withdraw'?[{transform:'translateX(0)'},{transform:'translateX(-14px)'}]:reply.gesture==='offer'?[{transform:'translateX(-12px)'},{transform:'translateX(0)'}]:reply.gesture==='point'?[{transform:'translateY(-6px)'},{transform:'translateY(0)'}]:[{opacity:.6},{opacity:1}];
  const animation=target.animate(frames,{duration:380,easing:'ease-out'});return()=>animation.cancel();
 },[confirmedId,reply.gesture]);
 const moodImage=currentReceipt&&typeof currentReceipt.emotion==='string'?motivePortrait({actorId:input.actorId,emotion:currentReceipt.emotion} as MotiveReceipt):null;
 return <section className="person-scene" data-person-phase={input.p.castRedacted?'private':input.pending?'pending':input.error?'paused':currentReceipt?'confirmed':input.settled?'settled':input.preview?'considering':'greeting'} data-emotion={reply.emotion} data-remote={input.remote||undefined} aria-label={input.remote?`${name} via correspondence; you are at ${worldPlaceName(input.p,spot,input.g)}`:`${name} at ${worldPlaceName(input.p,spot,input.g)}`} ref={stage} tabIndex={-1}>
  <div className="person-setting"><GamePainting src={`/paintings/world/${region.id}.webp`} alt=""/><div><span>{input.remote?'YOUR END OF THE CONVERSATION':'HERE TOGETHER'}</span><strong>{worldPlaceName(input.p,spot,input.g)}</strong><small>{region.name}{input.remote?' · Correspondence; their location is not shown':''}</small></div></div>
  <div className="person-exchange">
   <div className="person-face">{moodImage?<GamePainting className="person-scene-portrait" src={moodImage.src} alt={moodImage.alt} fallback={`/paintings/character-portraits/${input.actorId}.webp`} priority/>:<CharacterPortrait id={input.actorId} name={name} className="person-scene-portrait" expression={reply.expression} priority/>}<span className="person-face-name">{name}</span></div>
   <div className="person-response" role="status" aria-live="polite" aria-atomic="true"><small>{input.remote?`${name}’s message`:name}</small>{reply.speech?<p className="person-speech">“{reply.speech}”</p>:<p className="person-speech person-silent" aria-label={input.pending?'Awaiting confirmation':input.error?'Conversation paused':'Listening while you decide'}><span aria-hidden="true">···</span></p>}<p className="person-acting">{reply.activity}</p>{reply.continuation&&<p className={'person-continuation'+(notices.length?' person-career-notice':'')} data-career-notice={notices.length?notices.map(n=>n.kind).join(' '):undefined}>{notices.length>0&&<small>{notices.some(n=>n.kind==='reference')?'Workplace reference':'Work lead'} · {[...new Set(notices.map(n=>n.employer+', '+n.regionName))].join(' · ')}</small>}“{reply.continuation}”</p>}</div>
  </div>
  <div className="person-scene-floor"><PersonAction reply={reply} remote={!!input.remote}/><p><span>{profile.appearance}</span>{companionName&&<span className="person-companion">With {companionName} nearby.</span>}<span className="person-emotion">{emotionDescription[reply.emotion]}</span></p></div>
 </section>;
}
const emotionDescription:Record<PersonReply['emotion'],string>={attentive:'Attentive, leaving room to answer.',warm:'Warmth in the response.',concerned:'Concern makes the response careful.',hurt:'Hurt, keeping a little distance.',relieved:'The tension eases a little.',firm:'Firm about the stopping point.',sad:'Quiet with disappointment.',proud:'A little pride in the small result.',tired:'A quiet, seated pace.',shy:'A hesitant, self-conscious pause.'};

/** A small stage action changes the held object/hand pose, not a random portrait
 * wiggle. The same final pose remains under reduced motion and for screen readers. */
export function PersonAction({reply,remote}:{reply:PersonReply;remote:boolean}){
 const prop=remote?'letter':reply.prop;
 return <svg className="person-action" data-gesture={remote?'letter':reply.gesture} viewBox="0 0 180 88" role="img" aria-label={remote?'A letter beside the portrait':reply.activity}>
  <path className="person-table" d="M4 74 Q88 67 176 74 L174 82 L7 82Z"/>
  <g className="person-action-object" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none">
   {prop==='letter'?<><path fill="#fffaf0" d="M44 23h89v44H44z"/><path d="m44 23 45 29 44-29M44 67l32-23m57 23-32-23"/></>:
    prop==='cup'||prop==='cups'?<><path fill="#e6caa5" d="M64 37h38l-5 31H70z"/><path d="M102 42h7c14 0 10 17-10 15M56 70h59"/>{prop==='cups'?<path fill="#a8bfa9" d="m75 35 3-22h20l4 22z"/>:<path className="person-steam" d="M76 27c-7-9 7-9 0-18m15 18c-7-9 7-9 0-18"/>}</>:
    prop==='leaf'||prop==='plant'?<><path d="M83 71V34m0 15 19-14m-20 7L65 26"/><path fill="#a6b391" d="M83 34c-17-2-25-11-22-22 15 1 23 10 22 22Zm6 12c1-17 12-24 23-21-1 14-10 23-23 21Z"/>{prop==='plant'&&<path fill="#c39270" d="M64 54h40l-6 17H70z"/>}</>:
    prop==='tools'?<><path fill="#c4a380" d="m51 67 43-43 10 9-43 43z"/><path fill="#d5d9cc" d="m91 21 9-10 20 8-3 13-11 7z"/><path d="m105 65 23-32m-11 43 20-31"/></>:
    prop==='map'?<><path fill="#eee4c7" d="m42 29 31-7 32 10 31-9v43l-31 9-32-10-31 6z"/><path d="M73 23v42m32-32v42m-54-24 19-7 22 9 21-10 14 4" strokeDasharray="3 4"/></>:
    prop==='crate'?<><path fill="#c5a783" d="M46 35h87v36H46z"/><path d="M47 46h85M47 59h85M62 35v36m53-36v36"/></>:
    prop==='motor'?<><rect fill="#8fa4a0" x="60" y="35" width="55" height="28" rx="5"/><circle cx="88" cy="49" r="10"/><path d="M115 48h17M66 65v7m42-7v7M55 34v25"/></>:
    prop==='keys'?<><circle cx="81" cy="34" r="13"/><path d="m81 47 16 23h10v-7h-7v-7"/></>:
    prop==='food'?<><ellipse fill="#d2d8c4" cx="89" cy="64" rx="48" ry="10"/><path fill="#d6ac70" d="M56 59c-2-34 53-35 61 1z"/><path d="m70 43 6 12m12-17 7 16m11-10 3 10"/></>:
    prop==='page'||prop==='drawing'||prop==='poster'?<><path className="person-paper" fill="#fff6dc" d="m51 19 71 7-6 49-71-7z"/>{prop==='drawing'?<><path d="m57 61 12-19 10 11 12-15 16 22"/><circle cx="101" cy="36" r="4"/></>:<path d="m62 34 46 5M61 44l30 3m-31 7 42 4"/>}</>:
    <path d="M57 61h70m-58-5 6-14m36 14-6-14"/>}
  </g>
  {!remote&&<g className="person-action-hand" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">{reply.gesture==='withdraw'||reply.gesture==='pause'?<path d="m15 72 9-18c3-7 7-3 8 0l7-8c3-3 7 0 5 4l-5 9 14-3c7-1 9 6 1 9l-17 8Z"/>:reply.gesture==='point'?<path d="m14 72 7-17 35-22c6-3 9 2 4 6L44 51l12-2c10-2 10 7 2 10L37 73Z"/>:reply.gesture==='wave'?<path d="m17 73 3-37c0-5 6-6 7 0l2 14 2-30c1-6 7-6 8 0l1 28 5-22c1-5 7-4 6 1l-1 27 5-9c4-6 10-2 6 5L46 73Z"/>:<path d="m15 72 5-17 9-8c4-4 8 0 5 4l-5 6 27 0c10 0 10 7 2 9l-21 7Z"/>}</g>}
 </svg>;
}

export function PersonSceneDetails({children}:{children:import('react').ReactNode}){return <details className="encounter-memory person-scene-details"><summary>Scene, commitments & history</summary>{children}</details>}
export function PersonReturn({g,p,spot,onClose}:{g:Game;p:Player;spot:string;onClose:()=>void}){return <button type="button" className="encounter-return" onClick={onClose}><span aria-hidden="true">←</span> Back to {worldPlaceName(p,spot,g)}</button>}
