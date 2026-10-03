import type {Game,Player,Activity} from '@/lib/game';
import {actions} from '@/lib/game';
import {placeStory,neighborAtPlace,choiceBenefit,choiceTerms,PlaceInvitation} from '@/lib/place-invitations';
import {locationFor} from '@/lib/locations';
import {actionPreview} from '@/lib/game-view';
import GamePainting from './game-painting';
import {portraitPainting} from './game-art';
import {ArrowRight} from 'lucide-react';
export function PlaceWelcome({place,p,g,onChoose}:{place:string;p:Player;g:Game;onChoose:(id:string)=>void}){
 const story=placeStory(place),presence=neighborAtPlace(p,place,g);
 return <div className="place-welcome"><p>{story.scene}</p>{presence&&<div className="place-neighbor"><GamePainting src={portraitPainting(presence.neighbor.id)} alt={'Portrait of '+presence.neighbor.name}/><span><strong>{presence.neighbor.name} · around the neighborhood</strong><small>{presence.text}</small></span>{presence.action&&<button onClick={()=>onChoose(presence.action!)}>{(p.stories?.[presence.neighbor.id]||0)>0?'See chapter':'Say hello'} <ArrowRight size={14}/></button>}</div>}</div>;
}
export function ChoiceTerms({p,a,g}:{p:Player;a:Activity;g:Game}){const t=choiceTerms(p,a,g);return <div className="choice-terms" aria-label="Before you choose"><span>{t.time}</span><span>{t.cash}</span>{t.requirements&&<span>{t.requirements}</span>}<span>{t.afterCash}</span>{t.bills&&<strong>{t.bills}</strong>}</div>;}
export function Invitations({invitations,p,g,disabled,onVisit,compact=false}:{invitations:PlaceInvitation[];p:Player;g:Game;disabled:boolean;onVisit:(place:string,action:string)=>void;compact?:boolean}){
 if(!invitations.length)return null;
 return <section className={compact?'place-invitations map-invitations':'place-invitations'} aria-label="A few invitations"><div className="invitation-heading"><span>A few invitations</span><small>Explore at your own pace</small></div><div className="invitation-list">{invitations.map(i=>{const a=actions.find(a=>a.id===i.action)!,v=actionPreview(p,a.id,g);return <button key={i.id} data-material={placeStory(i.place).material} disabled={disabled} onClick={()=>onVisit(i.place,i.action)}><small>{locationFor(i.place).name}</small><strong>{i.title}</strong><span>{i.reason}</span><em>{a.time} time · {a.cost?'$'+a.cost+' upfront':v.cash>0?'+$'+v.cash:'$0'} <ArrowRight size={14}/></em></button>;})}</div></section>;
}
export function ChoiceBenefit({p,a,g}:{p:Player;a:Activity;g:Game}){return <strong className="choice-benefit">{choiceBenefit(p,a,g)}</strong>;}
