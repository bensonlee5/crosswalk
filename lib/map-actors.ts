import type {Game,Player} from './game.ts';
import {castPeople} from './character-cast.ts';
import {venuePeople} from './venue-scene.ts';
import {visiblePlaces} from './world-life.ts';
import {getStoryView} from './story-arcs.ts';
export type MapActor={id:string;name:string;spot:string;companionId?:string};
/** One physical instance per person, from the same live venue views as encounters.
 * Cast schedules and authored story scenes take precedence over fallback resident places. */
export function mapActors(g:Game,p:Player):MapActor[]{
 const candidates=new Map<string,MapActor[]>(),scheduled=castPeople(g,p).filter(person=>!person.remote),preferred=new Map<string,string>(),companions=new Map<string,string>();
 for(const spot of visiblePlaces(p,g))for(const person of venuePeople(g,p,spot).filter(person=>!person.remote)){
  const list=candidates.get(person.id)||[];list.push({id:person.id,name:person.name,spot});candidates.set(person.id,list);
 }
 if(g.storyVersion===1)for(const scene of [...getStoryView(g,p).scenes].sort((a,b)=>Number(b.choices.some(c=>c.available))-Number(a.choices.some(c=>c.available))))for(const person of scene.people)if(!preferred.has(person.id))preferred.set(person.id,scene.spot);
 for(const person of scheduled){preferred.set(person.id,person.spot);if('companionId' in person&&typeof person.companionId==='string')companions.set(person.id,person.companionId);}
 const result=new Map<string,MapActor>();for(const [id,list]of candidates)result.set(id,list.find(person=>person.spot===preferred.get(id))||list[0]);
 for(const [id,companionId]of companions){const child=result.get(id);if(!child)continue;const companion=candidates.get(companionId)?.find(person=>person.spot===child.spot);if(!companion){result.delete(id);continue;}result.set(companionId,companion);child.companionId=companionId;}
 return [...result.values()].sort((a,b)=>Number(!!a.companionId)-Number(!!b.companionId)||a.id.localeCompare(b.id));
}
