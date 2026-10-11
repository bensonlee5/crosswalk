'use client';
import { actionFamiliarityKey,familiarityView } from '@/lib/action-familiarity';
import { actionReaction } from '@/lib/action-reactions';
import { canonicalCharacterById } from '@/lib/character-canon';
import { economyMonthLabel } from '@/lib/economy';
import type { Game,Player } from '@/lib/game';
import { capturePersonReceipt,type ResponseReceipt } from '@/lib/person-response';
import { qualitativeText } from '@/lib/point-presentation';
import { sharedOpportunityView } from '@/lib/shared-opportunities';
import { worldPlaceName,worldView } from '@/lib/world-life';
import { worldEncounterChoice } from './encounter-panel';
import GamePainting from './game-painting';
import { PersonResponseStage } from './person-response';
import { EncounterOutcome,StoryChoiceDeck,useEncounterCommit,type EncounterReceipt } from './story-choices';

type WorldOutcome=EncounterReceipt&{reaction?:string;sharedPerson?:{actorId:string;name:string;spot:string;receipt:ResponseReceipt}};

/** Put this below nearby places. People open their own encounter; travel stays optional. */
export default function WorldStory({g,p,disabled,onAction,onEncounter,focusChoiceId}:{g:Game;p:Player;disabled:boolean;onAction:(id:string)=>Promise<unknown>;onEncounter?:(actorId:string,spot:string)=>void;focusChoiceId?:string}){
 const shared=sharedOpportunityView(g,p),view=worldView(p,g),all=(view?.choices||[]).map(c=>worldEncounterChoice(c,p,g));
 const context=[g.code,p.id,g.round,p.world?.region||''].join('|');
 const commit=useEncounterCommit({g,p,disabled,context,choices:all,onAction,findReceipt:(result,updated,c)=>{const crossing=sharedOpportunityView(result,updated)?.receipts.find(r=>r.actionId===c.actionId);if(crossing){const actorId=crossing.response.speakerId,spot=view?.choices.find(v=>v.id===c.id)?.spot??p.place;return{...crossing,sharedPerson:{actorId,name:canonicalCharacterById[actorId]?.name??view?.residents.find(r=>r.id===actorId)?.name??'Your host',spot,receipt:capturePersonReceipt(crossing,updated,actorId)}};}const r=updated.world?.journal.find(r=>r.choiceId===c.id);if(!r)return null;const source=view?.choices.find(v=>v.id===c.id),history=familiarityView(updated,{actionKey:actionFamiliarityKey(c.actionId,p,g)});return {title:r.title,body:r.text,week:r.week,reaction:actionReaction({actionId:c.actionId,title:c.title,kind:source?.kind,placeName:worldPlaceName(p,source?.spot??p.place,g),count:history.count,lastVariant:history.lastVariant,actorId:source?.actorId})??undefined}}});
 const outcome=commit.receipt as WorldOutcome|null;
 if(!view)return null;
 const choices=(kinds:string[])=>view.choices.filter(c=>kinds.includes(c.kind)).map(c=>worldEncounterChoice(c,p,g));
 const sharedIds=new Set(shared?.choices.map(c=>c.id)??[]);
 const crossingChoices=(place:string)=>all.filter(c=>sharedIds.has(c.id)&&view.choices.find(v=>v.id===c.id)?.spot===place);
 const practical=choices(['work','relocate']).filter(c=>!sharedIds.has(c.id)),exploration=choices(['explore','food','language']).filter(c=>!view.choices.find(v=>v.id===c.id)?.actorId),tradeoffs=choices(['tradeoff']).filter(c=>!sharedIds.has(c.id));
 const destinations=choices(['travel']).filter(c=>view.choices.find(v=>v.id===c.id)?.preview.region&&view.discoveredRegions.includes(view.choices.find(v=>v.id===c.id)!.preview.region!));
 const focused=all.find(c=>c.id===focusChoiceId);
 const deck=(list:ReturnType<typeof choices>)=><StoryChoiceDeck g={g} place={view.choices.find(c=>c.id===list[0]?.id)?.spot||p.place} choices={list} disabled={disabled} busy={commit.busy} onCommit={c=>void commit.commit(c)} isSubmitted={commit.isSubmitted}/>;
 return <section className="world-story world-story-compact" aria-label={'Life in '+view.region.name}>
  <div className="world-postcard"><GamePainting src={'/paintings/world/'+view.regionId+'.webp'} alt={view.region.description}/><div><small>{view.region.country}</small><h2>{view.region.name}</h2><p>{view.region.subtitle}</p></div></div>
  <div className="world-map-facts"><span>{view.visiblePlaces.length} familiar places</span><span>{view.unexploredCount} still to find</span><span>{view.language.name}</span></div>
  <>{outcome?.sharedPerson&&<PersonResponseStage g={g} p={p} actorId={outcome.sharedPerson.actorId} name={outcome.sharedPerson.name} spot={outcome.sharedPerson.spot} receipt={outcome.sharedPerson.receipt} known available/>}<EncounterOutcome {...{g,receipt:commit.receipt,error:commit.error,reaction:outcome?.reaction,compact:!!outcome?.sharedPerson}}/></>
  {focusChoiceId&&<section className="world-focused-choice" aria-label="Requested opportunity" data-focus-choice-id={focused?.id}><h3>Review this opportunity</h3>{focused?deck([focused]):<p>{commit.receipt?'Decision recorded. Return to Work & learning when you are ready.':'This opportunity has changed. Return to Work & learning for current choices.'}</p>}</section>}
  {!focusChoiceId&&<>{view.returnNarrative&&<section className="world-return"><small>BACK, BUT NOT BACK IN TIME · VISIT {view.visitCount}</small><h3>The place kept living.</h3><p>{qualitativeText(view.returnNarrative)}</p><details><summary>See what changed</summary><div className="world-changes">{Object.values(view.venueStates).map(v=><article key={v.place}><strong>{v.name}</strong><p>{qualitativeText(v.description)}</p></article>)}</div></details></section>}
  <details className="world-disclosure"><summary>People and promises <span>{view.residents.length} local faces</span></summary><div className="world-local-cast">{view.residents.map(r=><article key={r.id}><span className="world-person" aria-hidden="true">{r.name[0]}</span><div><strong>{r.name}</strong><small>{r.roles.join(' · ')} · {r.status}</small><p>{qualitativeText(r.currentBio)}</p>{r.welcome&&<p className="encounter-callback">{qualitativeText(r.welcome)}</p>}{onEncounter?<button type="button" disabled={disabled||commit.busy} onClick={()=>onEncounter(r.id,r.places.find(place=>view.visiblePlaces.some(known=>known===place))||r.places[0])}>Meet {r.name} <span aria-hidden="true">→</span></button>:<small>Find {r.name} at {r.places.map(place=>worldPlaceName(p,place,g)).join(' or ')}</small>}</div></article>)}</div>{view.companion.status!=='unmet'&&<div className="world-companion"><strong>Neri · {view.companion.status}</strong><p>{qualitativeText(view.companion.dedicatedScene?.body||'A map restorer with plans of their own. Your shared decisions take time.')}</p>{view.companion.commitment&&<p>{view.companion.commitment}</p>}{onEncounter&&<button type="button" disabled={disabled||commit.busy} onClick={()=>onEncounter('neri',view.companion.dedicatedScene?.spot||'CORNER CAFÉ')}>Talk with Neri <span aria-hidden="true">→</span></button>}</div>}</details>
  {shared&&<details className="world-disclosure" open><summary>Orders and shared rooms <span>Your plans change other lives</span></summary><div className="world-changes">{shared.facts.slice(0,2).map(f=><article key={f.id}><strong>{f.title}</strong><p>{f.body}</p><p>{f.cause}</p></article>)}</div>{shared.facts.length>2&&<details><summary>What changed and why</summary>{shared.facts.slice(2).reverse().map(f=><p key={f.id}><strong>{f.cause}:</strong> {f.body}</p>)}</details>}{['CORNER CAFÉ','COMMUNITY'].map(place=>{const actor=view.choices.find(c=>c.id.startsWith('shared:')&&c.spot===place)?.actorId,name=view.residents.find(r=>r.id===actor)?.name;return <section key={place}><h3>{worldPlaceName(p,place,g)}</h3>{actor&&name&&onEncounter&&<button type="button" disabled={disabled||commit.busy} onClick={()=>onEncounter(actor,place)}>Talk with {name}</button>}{deck(crossingChoices(place))}</section>;})}</details>}
  {practical.length>0&&<details className="world-disclosure"><summary>Work and put down roots <span>A life in this place</span></summary>{view.regionalOpportunity&&<p>{qualitativeText(view.regionalOpportunity.description)}</p>}{deck(practical)}</details>}
  {exploration.length>0&&<details className="world-disclosure"><summary>Find your way around <span>Food, language and new streets</span></summary><p className="world-context-note">{view.language.description}. The local table serves {view.region.food}.</p>{deck(exploration)}</details>}
  {tradeoffs.length>0&&<details className="world-disclosure"><summary>A decision for the neighborhood <span>Some changes will last</span></summary>{deck(tradeoffs)}</details>}
  <details className="world-disclosure world-travel-disclosure"><summary>Beyond {view.region.name} <span>{destinations.length} known route{destinations.length===1?'':'s'}</span></summary><p className="world-context-note">A visit and a move are different decisions. Check what you keep, what you leave, and the exact fare before you go.</p>{destinations.length>0?deck(destinations):<p>No other routes are on your map yet.</p>}{view.destinations.some(d=>!d.discovered)&&<p className="world-route-hint">A route not yet known may open through a conversation or a later {'month'}.</p>}</details>
  {view.closedPlaces.length>0&&<details className="world-disclosure"><summary>Places with a new purpose</summary><p>{view.closedPlaces.map(place=>worldPlaceName(p,place,g)).join(', ')}. Your memories remain as the neighborhood changes.</p></details>}
  <details className="world-disclosure world-journal"><summary>Your travel journal <span>{view.journal.length} memories</span></summary>{view.journal.map((entry,i)=><article key={entry.choiceId||i}><small>{economyMonthLabel(g,entry.week).toUpperCase()}</small><strong>{entry.title}</strong><p>{qualitativeText(entry.text)}</p></article>)}</details>
  </>}
 </section>;
}
