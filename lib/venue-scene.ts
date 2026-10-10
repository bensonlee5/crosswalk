import type {Activity,Game,Player} from './game.ts';
import {castPeople} from './character-cast.ts';
import {getStoryView} from './story-arcs.ts';
import {visiblePlaces,worldView} from './world-life.ts';

/** Small, public presence labels. Detailed lives stay inside the chosen conversation. */
export type VenuePerson={id:string;name:string;role:string;status:string;remote?:boolean;canTalk:boolean};
export type VenueChoice={kind:'activity';activity:Activity}|{kind:'person';person:VenuePerson};
export type VenueInvitation={actorId:string;name:string;spot:string};

/** Use the same current views as encounter routing; never guess from a character's home region. */
export function venuePeople(g:Game,p:Player,spot:string):VenuePerson[]{
 if(!visiblePlaces(p,g).includes(spot))return [];
 const world=worldView(p,g),people:VenuePerson[]=[];
 for(const resident of world?.residents||[]){
  const choices=world!.choices.filter(c=>c.actorId===resident.id||c.key==='talk:'+resident.id);
  const conversation=choices.find(c=>c.kind==='conversation');
  const here=conversation?.spot?choices.some(c=>c.spot===spot):resident.places.includes(spot);
  if(here)people.push({id:resident.id,name:resident.name,role:resident.roles.join(' · '),status:resident.status,canTalk:choices.some(c=>(!c.spot||c.spot===spot)&&c.available)});
 }
 if(g.storyVersion===1&&(p.world?.region||'alder')==='alder')for(const scene of getStoryView(g,p).scenes.filter(scene=>scene.spot===spot))for(const person of scene.people){
  if(!people.some(q=>q.id===person.id))people.push({id:person.id,name:person.name,role:person.role,status:'Here in the neighborhood',canTalk:scene.choices.some(c=>c.available)});
 }
 if(world&&(world.companion.dedicatedScene?.spot===spot||(g.storyVersion!==1&&spot==='CORNER CAFÉ'&&world.companion.status!=='unmet'))){
  const remote=p.world?.story?.neri.posting==='accepted'&&p.world.region!=='pelagia';
  people.push({id:'neri',name:'Neri',role:'Map restorer',status:world.companion.status,remote,canTalk:world.choices.some(c=>(c.actorId==='neri'||c.kind==='relationship')&&(!c.spot||c.spot===spot)&&c.available)});
 }
 for(const person of castPeople(g,p).filter(person=>person.spot===spot))if(!people.some(known=>known.id===person.id))people.push({id:person.id,name:person.name,role:person.role,status:person.status,remote:person.remote,canTalk:person.choices.some(c=>c.available)});
 return people;
}

/** Preserve activity order while placing people alongside activities, rather than above them. */
export function venueChoices(activities:Activity[],people:VenuePerson[]):VenueChoice[]{
 const present=people.filter(person=>!person.remote),choices:VenueChoice[]=[];
 for(let i=0;i<Math.max(activities.length,present.length);i++){
  if(activities[i])choices.push({kind:'activity',activity:activities[i]});
  if(present[i])choices.push({kind:'person',person:present[i]});
 }
 return choices;
}

/** Optional continuation of a coffee break, grounded only in someone actually here now. */
export function afterVenueActivity(g:Game,p:Player,activityId:string,spot:string):VenueInvitation|null{
 if(activityId!=='cafe_break'||spot!=='CORNER CAFÉ'||p.place!==spot)return null;
 const present=venuePeople(g,p,spot).filter(person=>!person.remote&&person.canTalk);
 const person=present.find(person=>/café|cafe|barista|diner|baker/i.test(person.role))??present[0];
 return person?{actorId:person.id,name:person.name,spot}:null;
}
