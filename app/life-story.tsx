'use client';
import {qualitativeText} from '@/lib/point-presentation';
import {useEffect,useRef,useState} from 'react';
import type {Game,Player} from '@/lib/game';
import {lifeChoices,relationshipViews,getLifeEvent,repairChoice,repairHomeChoice,lifeEffectText} from '@/lib/life-events';
import {worldView,regionDefinitions} from '@/lib/world-life';
import {aspirations,getLifeProgress} from '@/lib/life-progress';
import GamePainting from './game-painting';
import {portraitPainting} from './game-art';
import {StoryTimeline} from './story-timeline';
import {storyEnding} from '@/lib/story-arcs';
import {economyMonthLabel,hasModernEconomy} from '@/lib/economy';
import {castEnding} from '@/lib/character-cast';
import {CastJournal} from './cast-story';

// Display-only labels for the already-public earned IDs. Never evaluate current
// qualifications against an observer's deliberately incomplete player view.
const publicMilestoneTitles:Record<string,string>={career_apprentice:'Apprentice',career_practitioner:'Practitioner',career_leader:'Leader',career_mentor:'Mentor',community_neighbor:'Neighbor',community_connector:'Connector',community_steward:'Steward',community_common_ground:'Common Ground',creative_maker:'Maker',creative_artist:'Artist',creative_established:'Established creator',home_maker:'Home-maker',home_host:'Good host',home_rooted:'Rooted',own_front_door:'Your own front door',a_story_shared:'A story shared',a_garden_left_behind:'Something the block can keep',career_rebuilt:'Experience travels with you',shared_credit:'Everyone’s name on the work',reciprocal_next_chapter:'The favor came back around',different_beginning:'A different beginning',a_smaller_first_set:'A song with a room'};

export function PublicLifeSummary({g,p}:{g:Game;p:Player}){
 const earned=[...new Set(p.milestones||[])].filter(id=>publicMilestoneTitles[id]);
 return <section className="life-story life-public-summary"><small>{p.name.toUpperCase()} · SHARED HISTORY</small><h2>Personal life is private</h2><p>Personal relationships and the life summary are visible only to {p.name}.</p>{earned.length>0&&<section><h3>Earned chapters</h3><p>These achievements remain part of the shared record.</p><ul>{earned.map(id=><li key={id}>{publicMilestoneTitles[id]}</li>)}</ul></section>}{g.storyVersion===1&&<StoryTimeline g={g} p={p}/>}</section>;
}

export function LifeHeadingLabel({g,p}:{g:Game;p:Player}){
 return <>{p.castRedacted?'Personal life is private':getLifeProgress(p,g).title}</>;
}

type LifeJournalProps={g:Game;p:Player;disabled:boolean;onAction:(id:string)=>Promise<any>};
export function LifeJournal(props:LifeJournalProps){
 return props.p.castRedacted?<PublicLifeSummary g={props.g} p={props.p}/>:<PersonalLifeJournal {...props}/>;
}

function PersonalLifeJournal({g,p,disabled,onAction}:LifeJournalProps){
 const progress=getLifeProgress(p,g),event=getLifeEvent(p,g),choices=lifeChoices(p,g),period=hasModernEconomy(g)?'month':'week';
 const mounted=useRef(true);useEffect(()=>{mounted.current=true;return()=>{mounted.current=false}},[]);
 const lock=useRef(false),[pending,setPending]=useState(false),[message,setMessage]=useState('');
 async function choose(id:string){if(disabled||lock.current)return;lock.current=true;setPending(true);setMessage('');try{const result=await onAction(id);if(!mounted.current)return;setMessage(result?.code===g.code&&result.players?.some((q:Player)=>q.id===p.id)?'Your choice is part of your story.':'That choice wasn’t confirmed. Check your connection before trying again.');}catch{if(mounted.current)setMessage('That choice wasn’t confirmed. Please reconnect before trying again.');}finally{lock.current=false;if(mounted.current)setPending(false);}}
 return <div className="life-story">
 <section className="life-ambition"><small>THE LIFE YOU ARE BUILDING</small><h2>{progress.title}</h2><p className="life-caption">Current footing: {progress.currentTier}</p><p>{qualitativeText(progress.nextStep)}</p><div className="aspiration-grid">{aspirations.map(a=><button key={a.id} aria-pressed={progress.aspiration?.id===a.id} disabled={disabled||pending||!progress.canSelectAspiration} onClick={()=>void choose('aspire:'+a.id)}><strong>{a.title}</strong><span>{a.description}</span></button>)}</div><p className="life-caption">Choose a direction, not a guarantee. You can change direction once each {period}. {progress.selectionReason}</p></section>
 {message&&<p role="status" className="life-response">{message}</p>}
 {event&&<section className="life-incident"><small>{economyMonthLabel(g).toUpperCase()} · A TURN IN YOUR STORY</small><h2>{event.title}</h2><p>{qualitativeText(event.body)}</p><div className="life-impact">{qualitativeText(event.impact)}<small>{qualitativeText(lifeEffectText(event.effects).join(" · "))}</small></div>{event.pending&&choices.length>0?<><h3>What will you do?</h3><div className="life-options">{choices.map(c=><button key={c.id} disabled={disabled||pending||!c.available} onClick={()=>void choose('event:'+c.id)}><strong>{c.title}</strong><p>{qualitativeText(c.body)}</p><span>{qualitativeText(c.previewText.join(' · '))}</span>{!c.available&&<em>{qualitativeText(c.reason)}</em>}</button>)}</div><p className="life-caption">You can act elsewhere first. Ending the {period} without choosing uses the free, cautious response.</p></>:<p className="life-response">{qualitativeText(event.resolved?.outcome||'You have responded to this turn of events.')}</p>}</section>}
 {g.storyVersion===1&&<StoryTimeline g={g} p={p}/>}
 <CastJournal g={g} p={p}/>
 <section><small>PEOPLE WHO REMEMBER</small><h2>A life has witnesses.</h2><div className="life-relationships">{relationshipViews(p).map(r=>{const repair=repairChoice(p,g,r.id);return <article key={r.id}><GamePainting src={portraitPainting(r.id)} alt={r.name}/><div><h3>{r.name}</h3><strong>{r.status}</strong><p>{qualitativeText(r.history[r.history.length-1]||r.role)}</p><button disabled={disabled||pending||!repair.available} onClick={()=>void choose('repair:'+r.id)}>{repair.title||'Make time for this friendship'}</button><small>{qualitativeText(repair.available?repair.previewText.join(' · '):repair.reason)}</small></div></article>})}</div></section>
 <section><small>CHAPTERS OF ACHIEVEMENT</small><h2>What you leave behind</h2><div className="life-ladders">{progress.ladders.map(l=><article key={l.id}><h3>{l.title}</h3><ol>{l.tiers.map(t=><li key={t.id} className={t.earned?'earned':t.current?'next':''}><i aria-hidden="true">{t.earned?'✦':'○'}</i><div><strong>{t.title}</strong><p>{qualitativeText(t.description)}</p><small>{t.earned?'Part of your legacy':t.current?'Your current chapter':'Still possible'}</small></div></li>)}</ol></article>)}</div></section>
 <section><small>A PLACE TO STAND</small><h2>Settled does not mean finished.</h2>{p.life?.flags.includes('repairs_unfinished')&&<div className="life-options">{(['paid','diy'] as const).map(method=>{const c=repairHomeChoice(p,g,method);return <button key={method} disabled={disabled||pending||!c.available} onClick={()=>void choose(c.id)}><strong>{c.title}</strong><p>{qualitativeText(c.body)}</p><span>{qualitativeText(c.previewText.join(' · '))}</span>{!c.available&&<em>{qualitativeText(c.reason)}</em>}</button>})}</div>}<div className="life-foundations">{progress.foundations.map(f=><article key={f.title} className={f.secure?'secure':''}><strong>{f.title}</strong><p>{qualitativeText(f.detail)}</p></article>)}</div></section>
 {p.life&&p.life.receipts.length>0&&<details className="life-history"><summary>The turns your life has taken</summary>{[...p.life.receipts].reverse().map(r=><article key={r.week}><small>{economyMonthLabel(g,r.week).toUpperCase()}</small><h3>{r.title}</h3><p>{qualitativeText(r.resolved?.outcome||'This chapter is still unfolding.')}</p></article>)}</details>}
 </div>;
}

export function LifeEnding({g,onAgain}:{g:Game;onAgain:()=>void}){
 return <section className="results life-endings">
  <GamePainting className="results-painting" src="/paintings/seasons/winter.webp" alt="A quiet winter evening in the neighborhood"/>
  <div className="eyebrow">THE LAST PAGE IS NOT THE END</div><h1>There is more life ahead.</h1>
  <p>You arrived with an idea of who you might become. Here is what happened along the way.</p>
  <div className="life-ending-grid">{g.players.map(p=>{
   if(p.castRedacted)return <article key={p.id}><PublicLifeSummary g={g} p={p}/></article>;
   const view=getLifeProgress(p,g),world=worldView(p,g),ending=storyEnding(g,p),cast=castEnding(g,p);
   const friends=world?Object.values(regionDefinitions).flatMap(r=>r.residents).filter(r=>(p.world?.localBonds?.[r.id]||0)>=2):[];
   const journey=p.world?.story?.journey||[],home=p.world?.story?.homeRegion;
   const history=p.world?.localeHistory?.[world?.regionId||'alder'];
   const hasTraveled=journey.length>1||Object.values(p.world?.localeHistory||{}).some(locale=>locale.departures.length>0)||!!p.world?.journal.some(entry=>entry.effects?.region);
   const returnedHere=world?journey.filter(region=>region===world.regionId).length>1||!!(history&&history.departures.length>0&&history.arrivals>1):false;
   const homeMoves=p.world?.journal.filter(entry=>entry.choiceId?.endsWith(':relocate:'+entry.region))||[];
   return <article key={p.id}>
    {world&&<GamePainting className="ending-region-art" src={'/paintings/world/'+world.regionId+'.webp'} alt={world.region.description}/>}
    <small>{p.name.toUpperCase()} · {view.aspiration?.title||'A life taking shape'}</small><h2>{view.epilogue.title}</h2>
    {view.epilogue.paragraphs.map((text,i)=><p key={i}>{qualitativeText(text)}</p>)}
    {ending.length>0&&<section className="life-shared-ending"><h3>The story you shared</h3>{ending.map((text,i)=><p key={i}>{qualitativeText(text)}</p>)}</section>}
    {cast.length>0&&<section className="life-shared-ending cast-shared-ending"><h3>The lives that touched yours</h3>{cast.map((text,i)=><p key={i}>{qualitativeText(text)}</p>)}</section>}
    {world&&<>
     <h3>Where life led you</h3>
     <p>You finish this chapter in {world.region.name}, {world.region.country}. {world.language.description}.</p>
     {journey.length>1?<p className="ending-journey">Your route, in order: {journey.map(region=>regionDefinitions[region].name).join(' → ')}.</p>:!hasTraveled?<p>You spent this chapter in {world.region.name}. A life can grow deep roots without crossing a border.</p>:null}
     {homeMoves.length>0?<p className="ending-home">{homeMoves.map(entry=>`You made a home in ${regionDefinitions[entry.region].name} in ${economyMonthLabel(g,entry.week)}.`).join(' ')}{home?' Your home is now in '+regionDefinitions[home].name+'.':''}</p>:home&&<p className="ending-home">{p.world?.story?.relocatedWeek?`You made your home in ${regionDefinitions[home].name} in ${economyMonthLabel(g,p.world.story.relocatedWeek)}.`:`Your home remains in ${regionDefinitions[home].name}.`}</p>}
     {friends.length>0&&<p>{friends.map(r=>r.name).join(', ')} {friends.length===1?'has':'have'} come to know you through repeated conversations. Those are familiar faces waiting beyond this final page.</p>}
     {world.localChanges.length>0&&<p className="ending-local-change">{returnedHere?'Returning did not turn back time.':!hasTraveled?'The neighborhood changed while you stayed.':'The neighborhood kept living.'} {world.localChanges[0].venueDescription} {returnedHere?'Your earlier life here remains part of the welcome.':'This place is still writing its next chapter.'}</p>}
     {world.companion.status==='partner'&&<p>You and Neri chose a partnership. {world.companion.posting} Your homes, work and next direction remain decisions to make honestly.</p>}
     {world.companion.commitment==='friendship'&&<p>You and Neri chose friendship. {world.companion.posting} Keeping that connection does not require sharing an address.</p>}
     {world.companion.status==='declined'&&<p>You chose an independent route when Neri invited you along. The places you discovered still became your own.</p>}
     {world.closedPlaces.length>0&&<p>{g.storyVersion===1?'Some doors closed while the neighborhood made room for new uses. The town carries those changes into its next chapter.':'Some old doors closed because you made room for something else. Those choices remain visible in the towns you leave behind.'}</p>}
    </>}
    <h3>What remains</h3><ul>{view.milestones.length?view.milestones.map(m=><li key={m.id}><strong>{m.title}</strong><span>{qualitativeText(m.description)}</span></li>):<li>You kept making choices. The next chapter can start from here.</li>}</ul>
   </article>;
  })}</div>
  <p className="conversation">What did you give up, who stood beside you, and what would you try next?</p><button className="primary" onClick={onAgain}>Begin another life</button>
 </section>;
}
