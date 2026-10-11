'use client';
import { Dialog,DialogContent,DialogDescription,DialogTitle } from '@/components/ui/dialog';
import type { Game } from '@/lib/game';
import { getLifeEvent } from '@/lib/life-events';
import { campaignWeather,getWeather,nextWeather } from '@/lib/weather';
import { weatherStory } from '@/lib/weather-presentation';
import { ArrowRight,CalendarDays,Leaf } from 'lucide-react';
import { newsPainting,seasonPainting } from './game-art';
import GamePainting from './game-painting';
import WeatherIcon from './weather-icon';
/** The shared paper reports public facts, never another player's private responses. */
type ClosingReaction={name:string;line:string}|null;
export default function MonthlyNews({g,open,onClose,reaction}:{g:Game;open:boolean;onClose:()=>void;reaction?:ClosingReaction}){
 const p=g.players[g.turn],period='month',periodTitle='Month';
 const weather=getWeather(g,p),next=nextWeather(g,p),lifeEvent=p?getLifeEvent(p,g):null;
 const notices=g.story?.notices.filter(n=>n.week<=g.round)??[],currentNotices=notices.filter(n=>n.week===g.round),reportedNotices=currentNotices.length?currentNotices:notices.slice(-1);
 const localNews=p?.world?g.sharedWorld?.regions[p.world.region]?.changes.filter(n=>n.week===g.round)??[]:[];
 const headline=g.round===1?'A new beginning on your block':lifeEvent?.title||`This ${period} around the neighborhood`;
 const publicText=(text:string)=>text.replace(/\bWeeks\b/g,'Months').replace(/\bweeks\b/g,'months').replace(/\bWeek\b/g,'Month').replace(/\bweek\b/g,'month');
 return <Dialog open={open} onOpenChange={v=>{if(!v)onClose();}}><DialogContent className="chronicle-dialog">{reaction&&<p className="player-closing-reaction" role="status"><strong>{reaction.name}</strong> · {reaction.line}</p>}
  <div className="chronicle-clip" aria-hidden="true"/>
  <header className="chronicle-masthead"><span><Leaf size={18}/> NEIGHBORHOOD EDITION <Leaf size={18}/></span><DialogTitle>The Crosswalk Chronicle</DialogTitle><DialogDescription>{weather?`${weather.season} · Chapter ${weather.chapter}`:'Around the neighborhood'} · {periodTitle} {g.round} of {g.maxRounds}</DialogDescription></header>
  <button className="game-do-action chronicle-continue" onClick={onClose}>Explore the {period} <ArrowRight size={20}/></button>
  <div className="chronicle-headline"><small>{weather?.timeSkip||'A little news from around the block'}</small><h2>{headline}</h2></div>
  <GamePainting className="chronicle-art" src={newsPainting(g.round)} fallback="/neighborhood.webp" alt={`Oil painted illustration for ${headline.toLowerCase()}`} priority/>
  <div className="chronicle-city-news"><span className="news-stamp">{g.round===1?'WELCOME HOME':'SHARED PLANS · LOCAL NEWS'}</span><p>{g.round===1?`Eight months, familiar faces and a few new possibilities. Six priority blocks each ${period} leave room for the life you choose.`:lifeEvent?'The same news can land differently at each doorstep. Open Your little life on your turn to review your own event and available responses.':reportedNotices.length||localNews.length?'The neighborhood’s plans keep moving. Here are the shared updates.':`A quieter ${period} for city news. Visit your neighbors and explore the open conversations at your own pace.`}</p></div>
  {(reportedNotices.length>0||localNews.length>0)&&<div className="life-chronicle-people">
   {reportedNotices.map(n=><article key={n.id}><strong>{n.week===g.round?`Shared story · ${periodTitle.toLowerCase()} ${n.week}`:`Earlier in the story · ${periodTitle.toLowerCase()} ${n.week}`}</strong><p>{publicText(n.text)}</p></article>)}
   {localNews.map(n=><article key={`${n.region}-${n.sequence}`}><strong>{n.venueName}</strong><p>{publicText(n.narrative)}</p></article>)}
  </div>}
  {weather?<div className="chronicle-weather-columns"><section><small>THIS {period.toUpperCase()}</small><div className="forecast-title"><WeatherIcon type={weather.type} size={34}/><h3>{weather.label}</h3></div><p>{weatherStory(weather)}</p><span>Consider the weather when planning your day</span></section><section><small>{next?'LOOKING AHEAD':`ONE LAST ${period.toUpperCase()}`}</small>{next?<><div className="forecast-title"><WeatherIcon type={next.type} size={30}/><h3>{next.label}</h3></div><GamePainting className="forecast-painting" src={seasonPainting(next.season)} alt={'The neighborhood in '+next.season}/><p>{periodTitle} {next.week} · {next.season}</p><span>{next.timeSkip||weatherStory(next)}</span></>:<><h3>{'Eight months of little moments'}</h3><p>Make room for the people and unfinished plans you want to carry forward.</p></>}</section></div>:null}
  {weather&&<details className="season-calendar"><summary><CalendarDays size={16}/> Your seasonal calendar</summary><p>{'Eight representative months, two in each season. Six priority blocks and one set of bills per played month. The campaign contains only these eight months.'}</p><div>{campaignWeather(g,p).map(w=><span key={w.week} className={w.week===g.round?'current':''}><WeatherIcon type={w.type} size={19}/><b>{w.week}</b><small>{w.season}</small><span>{w.label}</span></span>)}</div></details>}

 </DialogContent></Dialog>;
}
