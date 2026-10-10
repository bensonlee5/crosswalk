import {characterVoiceResponse,familyConversation} from './character-voice.ts';
import {orenNeedsShortVisit,currentMotiveProfile} from './character-cast-canon.ts';
import type {Game,Player} from './game.ts';
import {castPeople} from './character-cast.ts';
import {historyFamiliarity} from './character-histories.ts';
import {getStoryView} from './story-arcs.ts';
import {visiblePlaces,worldView} from './world-life.ts';
import {characterMotiveProfiles,motiveIntroductions,type CharacterMotiveProfile} from './character-motive-profiles.ts';

export type MotiveEmotion='sadness'|'envy'|'love'|'anger'|'shame'|'pride'|'fear'|'relief';
export type MotiveBond={trust:number;earnedWeeks:number[];lastExchangeWeek?:number;contributions:number;strained:boolean};
export type MotiveReceipt={id:string;actorId:string;week:number;title:string;body:string;outcome:string;emotion?:MotiveEmotion;response:'follow-through'|'support'|'smaller-offer'|'refusal'|'repair'|'boundary';energy:number;joy:number};
export type MotivePlayerState={version:1;revision:number;bonds:Record<string,MotiveBond>;introductions:Record<string,{from:string;to:string;requestedWeek:number;acceptedWeek?:number}>;observed:string[];receipts:MotiveReceipt[]};
export type MotiveChoice={id:string;actionId:string;key:'help'|'ask'|'press'|'repair'|'introduce'|'family';title:string;body:string;outcome:string;emotion?:MotiveEmotion;response:MotiveReceipt['response'];available:boolean;reason:string;previewText:string[];cost:{time:number;cash:number;energy:number};energy:number;joy:number};
export type MotiveScene={actorId:string;name:string;goal:string;priority:string;obligation:string;capacity:string;spot:string;remote:boolean;choices:MotiveChoice[];lastReceipt?:MotiveReceipt};
const enabled=(g:Game,p:Player)=>g.motivesVersion===1&&p.motives?.version===1&&!p.castRedacted;
const freshBond=():MotiveBond=>({trust:0,earnedWeeks:[],contributions:0,strained:false});
const profile=(id:string)=>characterMotiveProfiles.find(c=>c.id===id);
const clamp=(n:number)=>Math.max(-3,Math.min(4,n));
/** Creation/join only; a read or ordinary move never opts an existing save in. */
export function initializeMotivesPlayer(g:Game,p:Player){if(g.motivesVersion===1)p.motives??={version:1,revision:0,bonds:{},introductions:{},observed:[],receipts:[]};}

/** Positive evidence is bounded to one earned step/person/month, regardless of how
 * many different menus the player visits. Harm and repair retain their own history. */
function evidence(p:Player,id:string,week:number,delta:number,strain=false){
 const s=p.motives!,b=s.bonds[id]??=freshBond();
 if(delta<0){b.trust=clamp(b.trust+delta);b.strained=true;}
 else if(delta>0&&!b.earnedWeeks.includes(week)){b.trust=clamp(b.trust+1);b.earnedWeeks.push(week);}
 if(strain)b.strained=true;
}
/** Consume only persisted, successful receipts. No guessed intentions, background
 * friendship decay, missed-visit punishment, or awards for merely opening a view. */
export function recordMotiveEvidence(g:Game,p:Player,actionId?:string){
 if(!enabled(g,p))return;const s=p.motives!;
 const observe=(key:string,entries:{id:string;delta:number;repair?:boolean}[],week:number)=>{
  if(s.observed.includes(key))return;s.observed.push(key);s.revision++;
  for(const e of entries)if(profile(e.id)){evidence(p,e.id,week,e.delta);if(e.repair)s.bonds[e.id].strained=false;}
 };
 for(const r of p.cast?.receipts??[]){const [, ,id,key]=r.id.split(':');
  const delta=['missed','rush'].includes(key)?-2:['listen','help','introduction','share','keep','honest','history_share','history_boundary','repair','renegotiate'].includes(key)?1:0;
  observe(`cast:${r.id}`,[{id,delta,repair:key==='repair'}],r.week);
 }
 for(const r of p.world?.journal??[]){if(!r.choiceId)continue;
  const entries=Object.entries(r.effects?.localBonds??{}).map(([id,delta])=>({id,delta}));
  const key=r.choiceId.split(':').at(-1)??'';
  if(key.startsWith('neri_')&&!['neri_decline','neri_end'].includes(key))entries.push({id:'neri',delta:1});
  observe(`world:${r.choiceId}`,entries,r.week);
 }
 for(const r of p.story?.receipts??[]){
  const entries=Object.entries(r.effects.trust).map(([id,delta])=>({id,delta}));
  // A public scene is not a personal slight by default. Only its authored trust
  // consequences, including a missed promised shift, count as relationship evidence.
  observe(`story:${r.id}:${r.choiceId}`,entries,r.week);
 }
 for(const r of p.life?.receipts??[]){if(!r.resolved)continue;
  observe(`life:${r.week}:${r.resolved.choiceId}`,Object.entries(r.resolved.effects.trust).map(([id,delta])=>({id,delta})),r.week);
 }
 if(actionId?.startsWith('repair:'))observe(`repair:${g.round}:${actionId}`,[{id:actionId.slice(7),delta:1,repair:true}],g.round);
 // The eight-month campaign bounds this list naturally; do not trim deduplication
 // evidence while old receipts can still be replayed from a persisted save.
}

/** A route exists only where the original character view places the person today.
 * Met cast friends retain their established community-correspondence route. Neri's
 * original scene can explicitly be a call; declined/ended routes are never reopened. */
function meeting(g:Game,p:Player,id:string):{spot:string;remote:boolean}|null{
 if(!visiblePlaces(p,g).includes(p.place))return null;
 const cast=castPeople(g,p).find(c=>c.id===id);
 if(cast)return{spot:cast.spot,remote:cast.remote};
 const world=worldView(p,g),resident=world?.residents.find(r=>r.id===id);
 if(resident){const conversation=world!.choices.find(c=>c.actorId===id&&c.kind==='conversation');return conversation?.spot?{spot:conversation.spot,remote:false}:null;}
 if(id==='neri'){
  const scene=world?.companion.dedicatedScene;
  if(!scene?.spot||!world?.choices.some(c=>c.actorId==='neri'))return null;
  return{spot:scene.spot,remote:p.world?.story?.neri.posting==='accepted'&&p.world?.region!=='pelagia'};
 }
 if((p.world?.region??'alder')==='alder'){
  const scene=getStoryView(g,p).scenes.find(s=>s.characters.some(n=>n===id));
  if(scene)return{spot:scene.spot,remote:false};
 }
 return null;
}
function circumstance(g:Game,p:Player,c:CharacterMotiveProfile,b:MotiveBond,remote:boolean){
 const cast=p.cast?.bonds[c.id];
 if(cast?.conflict||cast?.promise?.status==='missed'&&!cast.repaired)return{limited:true,unresolved:true,text:'The earlier unfinished conversation needs its own repair. A new favor cannot settle it.'};
 if(cast?.promise?.status==='open')return{limited:true,unresolved:false,text:`The meeting already agreed for month ${cast.promise.due} comes first. A smaller exchange today does not keep or replace that promise.`};
 if(['mina','eli','jo'].includes(c.id)&&[5,6].includes(g.round))return{limited:true,unresolved:false,text:'The shared evening is using their time this month. They can offer a small pause, without abandoning its preparation or performance.'};
 if(c.id==='neri'&&remote)return{limited:true,unresolved:false,text:'This is a check-in around the restoration posting. Distance allows a short conversation, not an extra afternoon together.'};
 if(b.strained)return{limited:true,unresolved:true,text:'The pressure you put on them is still between you. Name it before asking for more.'};
 if(b.trust<0)return{limited:true,unresolved:true,text:'The repair was heard, but willingness to offer a favor will need more patient follow-through.'};
 if(c.id==='oren'&&orenNeedsShortVisit(g))return{limited:true,unresolved:false,text:'Oren asks for a shorter visit today because treatment fatigue is limiting his energy. He chooses company without a project and will say when he needs to stop.'};
 if(c.commitment==='tentative'&&b.contributions<2)return{limited:true,unresolved:false,text:'They are trying a small piece at a time. They will finish the piece they agree to, but are not offering a larger exchange yet.'};
 return{limited:false,unresolved:false,text:'There is room for one bounded exchange. Their other work still has a stopping point.'};
}

/** Authored mixed feelings have causes and behavior, rather than a random mood roll.
 * These are private encounter outcomes; no labels or future cases appear in a guide. */
function feeling(g:Game,p:Player,c:CharacterMotiveProfile,key:MotiveChoice['key'],response:MotiveReceipt['response']):{emotion?:MotiveEmotion;text:string}{
 if(key==='family'&&g.characterCanonVersion===1)return{emotion:'love',text:''};
 if(key==='family')return{emotion:'love',text:c.id==='jo'?'Jo is proud of Kit and misses the ordinary days they no longer share. Care becomes a question instead of an instruction.':'Kit smiles at Jo’s familiar handwriting, then hesitates over the advice. Affection and the wish for independence can both stay in the reply.'};
 if(c.id==='mina'){
  if(key==='press')return{emotion:'anger',text:'Mina closes the notebook sharply. She is angry that the room you asked for would come out of somebody else’s work.'};
  if(key==='repair')return{emotion:'sadness',text:'Mina says the pressure hurt because she wanted you there. Her voice is quieter; she does not take the boundary back.'};
  if(response==='support')return{emotion:'love',text:'Mina smiles with the unguarded affection of a friend who has been listened to. For this little while, your unfinished words matter to her as much as her own.'};
  if(key==='help')return{emotion:'envy',text:'Mina admits envying people who seem to finish songs easily. She is embarrassed by the comparison, then asks you to hear the difficult passage instead of agreeing that anybody else had it easy.'};
  if(p.life?.flags.includes('mina_show_delayed')||(g.round===3&&g.characterCanonVersion!==1))return{emotion:'sadness',text:'Mina is still sad about the café evening that could not happen. She lets the disappointment be real before choosing what she can manage today.'};
 }
 if(c.id==='oren'&&key==='help'&&orenNeedsShortVisit(g))return{emotion:'relief',text:'Oren is relieved that the stopping point is taken seriously. The fatigue is real; he does not need to prove enthusiasm by continuing to work.'};
 if(c.id==='oren'&&key==='help')return{emotion:'fear',text:'Oren admits that a finished play might receive no laugh at all. He is frightened, and still lets an unnecessary repair go.'};
 if(c.id==='oren'&&response==='support')return{emotion:'love',text:historyFamiliarity(p,c.id)>=2?'Oren mentions the short recordings he and Miro exchange. He loves his brother without needing every note to become another job, and tries offering you the same room.':'Oren offers an affectionate, unhurried hearing. He asks whether you want a suggestion or simply someone to listen, and follows your answer.'};
 if(c.id==='miro'&&key==='repair')return{emotion:'shame',text:historyFamiliarity(p,c.id)>=2?'Miro remembers the grand backdrop that left him and Oren without a performance. He is ashamed of how help became pressure, and asks permission before giving his next note.':'Miro admits he nearly answered your apology with a list of improvements. Embarrassed by the impulse, he sets that plan aside and asks what kind of response you want.'};
 if(c.id==='hugo'&&key==='help')return{emotion:'shame',text:historyFamiliarity(p,c.id)>=2?'Hugo describes his shame at taking the bowl away from his learner. Instead of asking you to excuse it, he lets your own question stand without rewriting it.':'Hugo starts to rewrite the instruction, then stops. Embarrassed by how quickly teaching becomes taking over, he returns the question to you.'};
 if(c.id==='alder_tess'&&key==='help')return{emotion:'relief',text:'Tess’s shoulders drop when the instruction makes sense without her. She is relieved, and a little unsettled by no longer being needed for every answer.'};
 if(c.id==='saffron_tomas'&&key==='help')return{emotion:'pride',text:'Tomas takes quiet pride in explaining one thing more clearly than last time. He leaves the part he still needs to learn marked, rather than hiding it.'};
 if(c.id==='pelagia_tavi'&&key==='help')return{emotion:'sadness',text:'Tavi still misses the crop they hoped would thrive. They name the loss, then leave the reliable greens on the meal plan instead of asking a new experiment to erase it.'};
 if(c.id==='kit'&&key==='help')return{emotion:'envy',text:'Kit admits envying polished pictures that seem to make home look effortless. They keep the ordinary stool in the panel anyway; the neighbors do not owe the drawing a prettier life.'};
 if(c.id==='sefu'&&key==='help')return{emotion:'fear',text:'Sefu is afraid an invitation will sound foolish, and also afraid of making it hard to refuse. He keeps the easy way out in the wording.'};
 if(c.id==='mesa_june'&&response==='support')return{emotion:'pride',text:'June looks pleased that the desk is still working without her. Pride and affection share the moment as she gives you her full attention.'};
 if(c.id==='eli'&&response==='support')return{emotion:'love',text:'Eli makes the pause feel like care rather than repayment. You do not have to become useful again before being welcome at the table.'};
 if(c.id==='jo'&&key==='press')return{emotion:'anger',text:'Jo is angry about the unnamed extra work. They keep the ledger open and point to the agreed stopping point instead of insulting you.'};
 if(key==='repair')return{emotion:'relief',text:`${c.name} is relieved to hear the limit named plainly. Relief leaves room to try again; it does not rewrite what happened.`};
 return{text:''};
}
const remoteSupport:Record<string,string>={
 bram:'Bram returns one annotated route by community correspondence, keeping its checked stops and uncertain details distinct. The useful note makes your next errand feel more manageable.',
 oren:'Oren returns a short response to one rough idea through the community correspondence. He points to a place where it could stop for today, without inviting you to a rehearsal you did not attend.',
 hugo:'Hugo sends a careful reading of your short explanation through community correspondence. He names the confusing step without rewriting the whole thing in his own voice.',
 priya:'Priya returns a quiet listening prompt through the community correspondence and makes clear that no account of your feelings is owed. You take the pause where you actually are.',
 sami:'Sami returns a small diagram of the idea you described and asks whether words would help more. The exchange stays in the messages; no canal walk is claimed.',
 miro:'Miro returns one short response to your rough work through the community correspondence. He checks that you wanted a note, and leaves the decision with you.',
 sefu:'Sefu returns one gentle practice suggestion through the community correspondence. You try it privately where you are; he does not claim you danced together.',
 kit:'Kit returns a small encouraging note through community correspondence about the rough idea you sent. They name one ordinary detail worth keeping, without turning the exchange into a visit to the diner.',
};
function remoteOutcome(id:string,key:MotiveChoice['key'],response:MotiveReceipt['response'],outcome:string){
 if(id==='neri')return `During your agreed call from the transit map desk: ${outcome}`;
 if(response==='support'&&remoteSupport[id])return remoteSupport[id];
 if(key==='help')return `Through community correspondence, you exchange the small working note rather than meeting in person. Their reply describes what they did with it: ${outcome}`;
 if(key==='repair')return `You send a careful acknowledgement and the small correction by community correspondence. Their reply describes the repair: ${outcome}`;
 if(key==='family')return `In the correspondence, you help with the wording of the family note: ${outcome}`;
 return `Through your existing correspondence or call: ${outcome}`;
}
function revision(g:Game,p:Player,id:string){
 // Reject a request previewed before resources, a shared scene or a personal bond
 // changed. This is a deterministic revision tag, never an RNG or a hidden seed.
 const input=JSON.stringify([p.motives?.revision,p.world?.revision,g.story?.revision,p.hours,p.energy,p.joy,p.cast?.bonds[id]]);
 let n=2166136261;for(const letter of input)n=Math.imul(n^letter.charCodeAt(0),16777619);return(n>>>0).toString(36);
}
export function motiveScene(g:Game,p:Player,id:string):MotiveScene|null{
 if(!enabled(g,p)||historyFamiliarity(p,id)<1)return null;
 const authored=profile(id),at=meeting(g,p,id);if(!authored||!at||!visiblePlaces(p,g).includes(at.spot))return null;const c=currentMotiveProfile(g,authored);
 const b=p.motives!.bonds[id]??freshBond(),situation=circumstance(g,p,c,b,at.remote);
 const threshold=c.commitment==='steady'?1:c.commitment==='bounded'?2:3;
 const response=situation.unresolved||b.trust<0?'refusal':situation.limited||b.trust<threshold?'smaller-offer':'support';
 const rows:{key:MotiveChoice['key'];title:string;body:string;outcome:string;response:MotiveReceipt['response'];time:number;energy:number;joy:number}[]=[];
 if(b.strained)rows.push({key:'repair',title:'Name the pressure and make a small repair',body:c.repair,outcome:`${c.repair} ${c.name} accepts this specific repair without claiming the earlier hurt never happened.`,response:'repair',time:1,energy:0,joy:2});
 else rows.push({key:'help',title:'Help with the piece they chose',body:c.task,outcome:c.followThrough,response:'follow-through',time:1,energy:0,joy:3});
 rows.push({key:'ask',title:response==='refusal'?'Hear the limit without bargaining':response==='smaller-offer'?'Accept a smaller offer':'Ask for a little room for you',body:response==='refusal'?c.boundary:response==='smaller-offer'?c.smallerSupport:c.support,outcome:response==='refusal'?`${c.name} declines the extra favor. ${c.boundary} You hear the answer without taking a resource or making a new promise.`:response==='smaller-offer'?c.smallerSupport:c.support,response,time:response==='refusal'?0:1,energy:response==='support'?8:response==='smaller-offer'?3:0,joy:response==='support'?5:response==='smaller-offer'?2:0});
 rows.push({key:'press',title:'Push past the limit they named',body:`Ask ${c.name} to take on more despite the limit. They can refuse; pressing damages their willingness to make room for you.`,outcome:`${c.name} refuses to enlarge the exchange. ${c.boundary} They will need a specific repair before considering another favor.`,response:'boundary',time:0,energy:0,joy:0});
 if(g.characterCanonVersion===1&&familyConversation[id]&&!b.strained&&!situation.unresolved){
  const family=familyConversation[id];rows.push({key:'family',title:family.title,body:family.body,outcome:family.outcome,response:'follow-through',time:1,energy:0,joy:3});
 }
 if(g.characterCanonVersion!==1&&(id==='jo'||id==='kit')&&!b.strained&&!situation.unresolved){
  const isParent=id==='jo';
  rows.push({key:'family',title:isParent?'Help Jo offer care without taking over':'Help Kit set a loving limit',
   body:isParent?'Jo wants to help their adult child Kit with drawing materials, but Kit’s comic and working life are Kit’s to choose. Help word an offer that can be declined.':'Kit cares about Jo and also wants the next drawing to stay their own. Help word a note that asks for one kind of support and keeps the artistic decision at home.',
   outcome:isParent?'Jo removes a suggested ending from the note to Kit and asks whether a small packet of materials would be useful. The note stays an offer; no acceptance, delivery or new family obligation is assumed.':'Kit writes a warm note to Jo, asking for encouragement rather than an edit. They keep the comic’s ending on their own page. Love does not require accepting every suggestion, and no answer on Jo’s behalf is assumed.',
   response:'follow-through',time:1,energy:0,joy:3});
 }
 const introduction=motiveIntroductions.find(link=>link.ids.some(n=>n===id)&&link.ids.every(n=>historyFamiliarity(p,n)>=1));
 if(introduction&&!b.strained&&!situation.unresolved){
  const otherId=introduction.ids.find(n=>n!==id)!,other=profile(otherId)!,prior=p.motives!.introductions[introduction.id];
  if(!prior)rows.push({key:'introduce',title:`Ask about an introduction to ${other.name}`,body:`You know both people. Ask ${c.name} whether they would welcome comparing ${introduction.subject}. ${other.name} has not agreed yet.`,outcome:`${c.name} agrees to a small invitation for ${other.name}. ${introduction.request} The introduction stays unfinished until you speak with ${other.name}; no answer is assumed.`,response:'follow-through',time:1,energy:0,joy:2});
  else if(prior.to===id&&!prior.acceptedWeek)rows.push({key:'introduce',title:`Pass on ${other.name}’s invitation`,body:`${other.name} invited a small comparison about ${introduction.subject}. ${c.name} can choose whether to take part.`,outcome:`${c.name} welcomes ${other.name}’s bounded invitation. ${introduction.accepted}`,response:'follow-through',time:1,energy:0,joy:3});
 }
 const tag=revision(g,p,id),choices=b.lastExchangeWeek===g.round?[]:rows.map(row=>{
  const blocked=g.status!=='playing'?'This life is complete':g.players[g.turn]?.id!==p.id?'It is another player’s turn':p.place!==at.spot?`Visit ${at.spot} first`:p.hours<row.time?'Needs one priority block':'';
  const emotional=feeling(g,p,c,row.key,row.response),energy=Math.min(100-p.energy,row.energy),joy=Math.min(100-p.joy,row.joy),choiceId=`motive:${g.round}:${id}:${tag}:${row.key}`;
  const outcome=at.remote?remoteOutcome(id,row.key,row.response,row.outcome):row.outcome;
  const voice=g.characterCanonVersion===1?characterVoiceResponse(id,row.key,row.response,at.remote):'';
  return{id:choiceId,actionId:choiceId,key:row.key,title:row.title,body:row.body,outcome:[emotional.text,outcome,voice].filter(Boolean).join(' '),emotion:emotional.emotion,response:row.response,available:!blocked,reason:blocked,cost:{time:row.time,cash:0,energy:0},energy,joy,previewText:[`${row.time} priority block${row.time===1?'':'s'} · $0`,...(energy?[`+${energy} energy`]:[]),...(joy?[`+${joy} happiness`]:[]),row.key==='press'?'They refuse the added work. Pressure leaves a conversation to repair.':row.response==='refusal'?'No favor or resources; their boundary stays in place.':row.response==='repair'?'A small repair reopens this exchange. Any earlier story promise still needs its own response.':'One bounded exchange today; no future commitment.']};
 });
 return{actorId:id,name:c.name,goal:c.goal,priority:c.priority,obligation:c.obligation,capacity:situation.text,spot:at.spot,remote:at.remote,choices,lastReceipt:p.motives!.receipts.filter(r=>r.actorId===id).at(-1)};
}
export function resolveMotiveChoice(g:Game,p:Player,id:string){
 if(!enabled(g,p))throw Error('These exchanges are not part of this saved life');
 if(g.status!=='playing')throw Error('The game is not running');if(g.players[g.turn]!==p)throw Error('It is another player’s turn');
 const s=p.motives!;if(s.receipts.some(r=>r.id===id))return;
 const actorId=id.split(':')[2],scene=motiveScene(g,p,actorId),choice=scene?.choices.find(c=>c.id===id);
 if(!choice)throw Error('This exchange changed or is no longer available');if(!choice.available)throw Error(choice.reason);
 const b=s.bonds[actorId]??=freshBond();
 if(choice.key==='introduce'){
  const link=motiveIntroductions.find(link=>link.ids.some(n=>n===actorId))!;
  const prior=s.introductions[link.id];
  if(prior)prior.acceptedWeek=g.round;
  else s.introductions[link.id]={from:actorId,to:link.ids.find(n=>n!==actorId)!,requestedWeek:g.round};
  evidence(p,actorId,g.round,1);
 }
 if(choice.key==='press')evidence(p,actorId,g.round,-2);
 if(choice.key==='family')evidence(p,actorId,g.round,1);
 if(choice.key==='help'){evidence(p,actorId,g.round,1);b.contributions++;}
 if(choice.key==='repair'){b.strained=false;evidence(p,actorId,g.round,1);}
 b.lastExchangeWeek=g.round;p.hours-=choice.cost.time;p.energy+=choice.energy;p.joy+=choice.joy;s.revision++;
 s.receipts.push({id,actorId,week:g.round,title:`${scene!.name}: ${choice.title}`,body:choice.body,outcome:choice.outcome,...(choice.emotion?{emotion:choice.emotion}:{}),response:choice.response,energy:choice.energy,joy:choice.joy});
 // The 26 motive-bearing adults have at most 26 * 8 receipts. Keep every exact ID so even an old retry cannot act twice.
 g.log.unshift(`${p.name} made time for ${scene!.name}.`);g.log=g.log.slice(0,32);
}
