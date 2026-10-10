'use client';
import CharacterPortrait from './character-portrait';
import type {Game,Player} from '@/lib/game';
import {characterHistoryView} from '@/lib/character-histories';

export function CharacterHistory({g,p,actorId}:{g:Game;p:Player;actorId:string}){
 const view=characterHistoryView(g,p,actorId);if(!view)return null;
 return <details className="encounter-memory character-history"><summary>Before your paths crossed · {view.name}</summary>
  <div className="character-history-intro"><CharacterPortrait id={view.id} name={view.name}/><div>{view.age&&<p className="fine-print">Age {view.age}</p>}<p>{view.before}</p>{view.family?.map(f=><p key={f.otherId} className="encounter-tie">{f.fact}</p>)}</div></div>
  {view.closer?<p className="encounter-callback">{view.closer}</p>:view.hasDeeperHistory?<p className="fine-print">A first meeting is only part of a life. More of this history can emerge as you get to know {view.name}.</p>:null}
  {view.connections.length>0&&<section aria-label={`${view.name}’s connections`}><h3>People in this life</h3>{view.connections.map(connection=><article key={connection.otherId} className="character-connection"><div className="character-connection-heading"><CharacterPortrait id={connection.otherId} name={connection.name} className="character-connection-portrait"/><h4>{view.name} &amp; {connection.name}</h4></div><small>{connection.kind}</small><p>{connection.event}</p><p><strong>{view.name}’s perspective</strong> {connection.perspective}</p>{connection.otherPerspective?<p><strong>{connection.name}’s perspective</strong> {connection.otherPerspective}</p>:<p className="fine-print">This is the part of the history you know through {view.name}. {connection.name} has their own perspective to share.</p>}</article>)}</section>}
 </details>;
}
