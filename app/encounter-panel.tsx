'use client';
import {qualitativeText} from '@/lib/point-presentation';
import {CharacterMotives} from './character-motives';
import CharacterPortrait from './character-portrait';
import {scenePortraitExpression} from '@/lib/portrait-expression';
import {CharacterHistory} from './character-history';
import type {Game,Player} from '@/lib/game';
import {economyMonthLabel} from '@/lib/economy';
import {getStoryView} from '@/lib/story-arcs';
import {relationshipViews} from '@/lib/life-events';
import {worldView,worldPlaceName,type WorldChoiceView} from '@/lib/world-life';
import {ArcBeatStrip,StoryTimeline} from './story-timeline';
import {StoryChoiceDeck,EncounterOutcome,useEncounterCommit,type EncounterChoice,type EncounterReceipt} from './story-choices';
import {castPeople} from '@/lib/character-cast';
import {CastEncounterPanel} from './cast-story';

type Props={g:Game;p:Player;actorId:string;spot?:string;disabled:boolean;onAction:(id:string)=>Promise<unknown>;onClose:()=>void};
export function worldEncounterChoice(c:WorldChoiceView):EncounterChoice{return{id:c.id,actionId:'world:'+c.id,title:c.title,body:c.body,available:c.available,reason:c.reason,previewText:c.previewText,cost:{time:c.time,cash:c.cost,energy:Math.max(0,-c.preview.energy)}}}

/** Focused content for a parent-owned dialog. Closing restores the original venue. */
export default function EncounterPanel(props:Props){
 const person=castPeople(props.g,props.p).find(person=>person.id===props.actorId);
 return person?<CastEncounterPanel {...props} person={person} spot={props.spot??props.p.place}/>:<OriginalEncounterPanel {...props}/>;
}

function OriginalEncounterPanel({g,p,actorId,spot=p.place,disabled,onAction,onClose}:Props){
 const story=getStoryView(g,p),world=worldView(p,g),resident=world?.residents.find(r=>r.id===actorId),relationship=relationshipViews(p).find(r=>r.id===actorId);
 const scenes=story.scenes.filter(s=>(p.world?.region||'alder')==='alder'&&s.spot===spot&&s.characters.some(id=>id===actorId));
 const scene=scenes.find(s=>s.status==='available')??scenes.find(s=>s.week===g.round)??scenes.at(-1);
 const person=scene?.people.find(r=>r.id===actorId),isNeri=actorId==='neri',neri=world?.companion;
 const name=resident?.name||person?.name||relationship?.name||(isNeri?'Neri':'A neighbor');
 const role=resident?.roles.join(' · ')||person?.role||relationship?.role||(isNeri?'Map restorer':'');
 const worldChoices=(world?.choices||[]).filter(c=>(!c.spot||c.spot===spot)&&(c.actorId===actorId||(!c.actorId&&(c.key==='talk:'+actorId||(isNeri&&c.kind==='relationship')))));
 const choices:EncounterChoice[]=scene?.status==='available'?scene.choices.map(c=>({...c,actionId:`story:${scene.id}:${c.id}`})):worldChoices.map(worldEncounterChoice);
 const context=[g.code,p.id,g.round,p.world?.region||'alder',actorId,spot].join('|');
 const commit=useEncounterCommit({g,p,disabled,context,choices,onAction,findReceipt:(result,updated,choice)=>{
  if(choice.actionId.startsWith('story:')){const r=getStoryView(result,updated).recap.find(r=>r.sceneId===scene?.id&&r.choiceId===choice.id);return r?{title:r.title,body:r.body,outcome:r.outcome,week:r.week}:null;}
  const r=updated.world?.journal.find(r=>r.choiceId===choice.id);return r?{title:r.title,body:r.text,week:r.week}:null;
 }});
 const remembered=story.recap.filter(r=>r.characterIds.some(id=>id===actorId)).sort((a,b)=>b.week-a.week)[0];
 const lastReceipt:EncounterReceipt|null=remembered?{title:remembered.title,body:remembered.body,outcome:remembered.outcome,week:remembered.week}:null;
 const currentBio=resident?.currentBio||(isNeri?neri?.dedicatedScene?.body:'')||'';
 const actorJournal=world?.journal.filter(r=>r.choiceId&&(isNeri?r.choiceId.split(':').at(-1)?.startsWith('neri_'):r.choiceId.endsWith('talk:'+actorId)||r.choiceId.endsWith('local_help:'+actorId)))||[];
 const history=resident?.latestHistory||relationship?.history.at(-1)||actorJournal[0]?.text||'';
 const worldReceipt=actorJournal[0]?{title:actorJournal[0].title,body:actorJournal[0].text,week:actorJournal[0].week}:null;
 const promise=resident?.promise||(isNeri?(neri?.commitment==='partner'?'You chose a partnership while keeping room for both lives.':neri?.commitment==='friendship'?'You chose friendship and an honest shared route.':''):'')||'';
 const ties=(story.relationships||[]).filter(r=>r.id.split('-').includes(actorId)),tie=ties.find(r=>r.history.length>0)||ties[0];
 const tieNames=tie?.id.split('-').map(id=>scene?.people.find(person=>person.id===id)?.name||id).join(' & ');
 const hasLiveScene=scene?.status==='available';
 return <div className="encounter-panel" data-actor={actorId}>
  <header className="encounter-heading"><CharacterPortrait id={actorId} name={name} expression={scenePortraitExpression(actorId,scene,story.recap.find(r=>r.sceneId===scene?.id&&!r.automatic))}/><div><small className="encounter-eyebrow">{worldPlaceName(p,spot,g)} · {economyMonthLabel(g,g.round).toUpperCase()}</small><h2 id="encounter-title">{name}</h2><p>{role}</p>{(resident?.status||relationship?.status||isNeri)&&<span className="encounter-relationship">{resident?.status||relationship?.status||(isNeri?neri?.status:'')}</span>}</div></header>
  {hasLiveScene&&scene?<section className="encounter-scene"><ArcBeatStrip beat={scene.beat}/><small className="encounter-eyebrow">{scene.people.map(r=>r.name).join(' · ')}</small><h3>{scene.title}</h3>{scene.body.map((text,i)=><p key={i}>{qualitativeText(text)}</p>)}</section>:<section className="encounter-scene"><h3>{isNeri?neri?.dedicatedScene?.title||'A little room for each other':resident?.talkedThisWeek?'A familiar face':'Pull up a chair'}</h3>{currentBio&&<p>{qualitativeText(currentBio)}</p>}{resident?.welcome&&<p className="encounter-callback">{qualitativeText(resident.welcome)}</p>}{!resident&&!isNeri&&!lastReceipt&&<p>{story.nextBeat||'There is no new conversation here just now. You can return to the venue whenever you like.'}</p>}</section>}
  <CharacterHistory g={g} p={p} actorId={actorId}/>
  {tie&&<p className="encounter-tie"><strong>{tieNames}</strong>{tie.status}</p>}
  {promise&&<p className="encounter-promise"><strong>What you promised</strong>{promise}</p>}
  <EncounterOutcome g={g} receipt={commit.receipt||(!hasLiveScene&&!choices.some(c=>c.available)?lastReceipt||worldReceipt:null)} error={commit.error}/>
  {!commit.receipt&&<StoryChoiceDeck g={g} place={spot} choices={choices} disabled={disabled} busy={commit.busy} onCommit={choice=>void commit.commit(choice)} isSubmitted={commit.isSubmitted} emptyText={story.nextBeat||'You have shared this chapter. Your history stays with you.'}/>}
  {history&&<details className="encounter-memory"><summary>What {name} remembers</summary><p>{qualitativeText(history)}</p>{resident?.independentPlan&&<p>{resident.independentPlan}</p>}</details>}
  <StoryTimeline g={g} p={p} actorId={actorId}/>
  <CharacterMotives g={g} p={p} actorId={actorId} spot={spot} disabled={disabled||commit.busy} onAction={onAction}/>
  <button type="button" className="encounter-return" onClick={onClose}><span aria-hidden="true">←</span> Back to {worldPlaceName(p,spot,g)}</button>
 </div>;
}
