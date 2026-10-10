'use client';
import {qualitativeText} from '@/lib/point-presentation';
import type {Game,Player} from '@/lib/game';
import {economyMonthLabel} from '@/lib/economy';
import {getStoryView} from '@/lib/story-arcs';
import {worldPlaceName} from '@/lib/world-life';

export type ArcBeat='setup'|'promise'|'consequence'|'payoff';
const beats:{id:ArcBeat;title:string}[]=[{id:'setup',title:'A beginning'},{id:'promise',title:'A promise'},{id:'consequence',title:'What it cost'},{id:'payoff',title:'What remains'}];
export function ArcBeatStrip({beat}:{beat:ArcBeat}){const current=beats.findIndex(b=>b.id===beat);return <ol className="arc-beat-strip" aria-label="Story arc">{beats.map((b,i)=><li key={b.id} className={i<current?'past':i===current?'current':''} aria-current={i===current?'step':undefined}><span aria-hidden="true">{i<current?'✓':i+1}</span>{b.title}</li>)}</ol>}

export function StoryTimeline({g,p,actorId}:{g:Game;p:Player;actorId?:string}){
 const view=getStoryView(g,p);if(!view.enabled)return null;
 const receipts=view.recap.filter(r=>!actorId||r.characterIds.some(id=>id===actorId));
 if(!receipts.length)return null;
 return <details className="story-timeline"><summary>The story so far <span>{receipts.length} remembered choice{receipts.length===1?'':'s'}</span></summary><ol>{[...receipts].sort((a,b)=>b.week-a.week).map(r=><li key={r.id}><small>{economyMonthLabel(g,r.week).toUpperCase()}</small><strong>{r.title}</strong><p>{qualitativeText(r.outcome||r.body)}</p>{r.body&&r.outcome&&r.body!==r.outcome&&<p className="encounter-callback">{qualitativeText(r.body)}</p>}</li>)}</ol></details>;
}

/** One next chapter on the game surface, never an unrelated global action catalog. */
export function ArcSpotlight({g,p,disabled,onOpen}:{g:Game;p:Player;disabled:boolean;onOpen:(actorId:string,spot:string)=>void}){
 const view=getStoryView(g,p);if(!view.enabled||(p.world?.region||'alder')!=='alder')return null;
 const scene=view.scenes.find(s=>s.status==='available');
 if(!scene)return view.nextBeat?<div className="arc-spotlight arc-spotlight-quiet" role="note"><span aria-hidden="true">✧</span><p>{view.nextBeat}</p></div>:null;
 const person=scene.people[0],available=scene.choices.some(c=>c.available);
 return <button className="arc-spotlight" type="button" disabled={disabled} onClick={()=>onOpen(person?.id||scene.characters[0],scene.spot)} aria-label={`${scene.title}. Meet ${person?.name||'your neighbors'} at ${worldPlaceName(p,scene.spot,g)}`}><span className="arc-spotlight-mark" aria-hidden="true">{scene.beat==='payoff'?'✦':'✧'}</span><span><small>{scene.beat==='payoff'?'A CHAPTER COMES HOME':'YOUR NEXT CHAPTER'} · {economyMonthLabel(g,scene.week).toUpperCase()}</small><strong>{scene.title}</strong><span>{person?.name||'Your neighbors'} · {worldPlaceName(p,scene.spot,g)}{!available?' · See what is needed':''}</span></span><span aria-hidden="true">→</span></button>;
}
