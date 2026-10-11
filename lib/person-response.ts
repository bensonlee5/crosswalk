import type {Game,Player} from './game.ts';
import type {CareerNotice} from './careers.ts';
import type {PortraitExpression} from './portrait-expression.ts';
import {scenePortraitExpression} from './portrait-expression.ts';
import {characterVoices} from './character-voice.ts';
import {canonicalCharacterById} from './character-canon.ts';
import {orenNeedsShortVisit} from './character-cast-canon.ts';
import {familiarityView,type FamiliarityView} from './action-familiarity.ts';
import {personFamiliarityLines,personSceneProfiles,type PersonSceneProfile} from './person-scene-profiles.ts';

/** Presentation only. Nothing here grants time, trust, a meeting or a reward. */
export type PersonEmotion='attentive'|'warm'|'concerned'|'hurt'|'relieved'|'firm'|'sad'|'proud'|'tired'|'shy';
export type PersonGesture='listen'|'offer'|'pause'|'point'|'withdraw'|'wave';
export type PersonReply={speech:string;activity:string;emotion:PersonEmotion;gesture:PersonGesture;expression:PortraitExpression;continuation?:string;prop:PersonSceneProfile['prop']|'crate'|'poster'|'keys'|'motor'};
export type CapturedCareerNotice=CareerNotice&{playerId:string};
export type ResponseReceipt={careerNotices?:CapturedCareerNotice[];title:string;body:string;outcome?:string;actionId?:string;emotion?:string;familiarity?:FamiliarityView;response?:string|{speakerId:string;speech:string;activity:string;emotion:PersonEmotion;gesture:PersonGesture};id?:string;week?:number};
export type ResponseChoice={id:string;actionId:string;title:string;available:boolean;reason:string};
export type PersonSceneInput={g:Game;p:Player;actorId:string;remote?:boolean;sceneId?:string;known?:boolean;settled?:boolean;available?:boolean;preview?:ResponseChoice|null;pending?:boolean;error?:string;receipt?:ResponseReceipt|null};
const fallback:PersonSceneProfile={appearance:'A familiar face in everyday clothes.',activity:'Pauses to hear you.',greeting:'Hello. What did you want to talk about?',familiar:'Good to see you again.',farewell:'Take care.',prop:'none'};
export const personProfile=(id:string)=>personSceneProfiles[id]??fallback;
function receiptActionId(receipt:ResponseReceipt){const source=receipt as ResponseReceipt&{sceneId?:string;choiceId?:string};return source.actionId||(source.sceneId&&source.choiceId?`story:${source.sceneId}:${source.choiceId}`:source.choiceId?`world:${source.choiceId}`:source.id);}
function careerNoticeAllowed(p:Player,actorId:string,receipt:ResponseReceipt){return !p.castRedacted&&p.career?.version===1&&!p.cast?.bonds[actorId]?.conflict&&!p.motives?.bonds[actorId]?.strained&&receipt.response!=='refusal'&&receipt.response!=='boundary'&&!(typeof receipt.response==='object'&&['firm','hurt'].includes(receipt.response.emotion));}
/** Freeze the successful encounter count and exact work notices, not a later poll. */
export function capturePersonReceipt<T extends ResponseReceipt>(receipt:T,p:Player,actorId:string):T&{familiarity:FamiliarityView;careerNotices?:CapturedCareerNotice[]}{
 const actionId=receiptActionId(receipt),notices=careerNoticeAllowed(p,actorId,receipt)?p.career?.notices?.filter(n=>n.actionId===actionId&&n.actorId===actorId&&n.round===receipt.week)??[]:[];
 return{...receipt,familiarity:familiarityView(p,{actorId}),careerNotices:notices.length?notices.map(notice=>({...notice,playerId:p.id})):undefined};
}
/** Only the notice frozen with this confirmed speaker/action may continue the reply. */
export function personCareerNotices(input:PersonSceneInput){
 const {g,p,actorId,receipt,pending,error}=input;
 if(!receipt||pending||error||!careerNoticeAllowed(p,actorId,receipt))return [];
 return (receipt.careerNotices??[]).filter(notice=>notice.playerId===p.id&&notice.actorId===actorId&&notice.round===g.round&&notice.round===receipt.week&&notice.actionId===receiptActionId(receipt));
}
export function personFamiliarityLine(actorId:string,history:FamiliarityView){
 const profile=personProfile(actorId),lines=personFamiliarityLines[actorId];
 if(!history.tracked||history.count<2||!lines)return '';
 if(history.stage==='familiar')return history.lastVariant%2===1?profile.familiar:lines.routine[1];
 return history.stage==='routine'?lines.routine[(history.lastVariant+1)%2]:lines.habit[history.lastVariant%2];
}

const emotionExpression:Record<PersonEmotion,PortraitExpression>={attentive:'neutral',warm:'warm',concerned:'concerned',hurt:'hurt',relieved:'relieved',firm:'hurt',sad:'concerned',proud:'warm',tired:'neutral',shy:'concerned'};
const motiveEmotion:Record<string,PersonEmotion>={sadness:'sad',envy:'shy',love:'warm',anger:'firm',shame:'shy',pride:'proud',fear:'concerned',relief:'relieved'};
const expressionEmotion:Record<PortraitExpression,PersonEmotion>={neutral:'attentive',warm:'warm',concerned:'concerned',hurt:'hurt',relieved:'relieved'};
const activities:Record<PersonGesture,string>={listen:'Turns their attention to you.',offer:'Leaves room for your answer.',pause:'Lets the pause stand.',point:'Makes the stopping point clear.',withdraw:'Draws back from the extra request.',wave:'Acknowledges you before returning to their day.'};

/** Extract only a quote explicitly attributed to THIS speaker. Never steal another
 * participant's line from a group scene, or turn third-person prose into a quote. */
export function attributedSpeech(text:string,name:string){
 const escaped=name.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
 const before=new RegExp(`${escaped} (?:says|writes|asks|adds|replies|tells you|smiles)[, :]{0,4}“([^”]+)”`,'g');
 const after=new RegExp(`“([^”]+)”[, ]*${escaped} (?:says|writes|asks|adds|replies)`,'g');
 const lines=[...text.matchAll(before),...text.matchAll(after)].filter(match=>match[1].length<=220).sort((a,b)=>(a.index??0)-(b.index??0));
 return (lines.at(-1)?.[1]??'').replace(/,$/,'.');
}

const opening:Record<string,Record<string,string>>={
 'quay-promise':{mina:'We could try. But tell us what you can actually promise.',eli:'A supper needs food and people. I can’t carry all of it.',jo:'I can build a small stage. Put the materials and my time in the plan.'},
 'quay-credit':{mina:'Show me what a fair version looks like.',eli:'The supper and its work need a name on that poster too.',jo:'I want you to have your first night. I also need this bench to pay for its materials.'},
 'quay-replan':{mina:'I wanted a whole song. What can we still make room for?',eli:'People need to eat. Could a listening break fit around supper?',jo:'I can offer a cleared bench. A smaller audience is still an audience.'},
 'quay-friction':{mina:'I don’t want the song to disappear between the jobs.',eli:'That pump keeps the pantry going. I need you to hear that part too.',jo:'One motor. Two jobs. We need to choose what actually gets done.'},
 'quay-build':{mina:'It’s smaller than the first plan. I still want to sing here.',eli:'Let’s name the jobs, then leave room for the evening.',jo:'Here’s the work. Which part can you actually take?'},
 'quay-first-set':{mina:'You’re here. I’m going to finish the song.',eli:'There’s a place to sit. The work can pause for a song.',jo:'The room is ready. Let’s let it be used.'},
 'quay-afterglow':{mina:'I want to keep writing. The next evening can have its own size.',eli:'A rota needs more than one name. What can you really take on?',jo:'Keep the budget where the next person can find it.'},
};
const storyActivities:Record<string,Record<string,[string,PersonReply['prop']]>>={
 'quay-promise':{mina:['Pauses with the last verse still on the page.','page'],eli:['Sets two empty pantry crates beside the table.','crate'],jo:['Steadies the stool they are repairing.','tools']},
 'quay-credit':{mina:['Turns the half-painted poster over.','poster'],eli:['Keeps the seed invoices beside the shared plan.','page'],jo:['Leaves the brush down beside the materials ledger.','page']},
 'quay-replan':{mina:['Folds the cancelled-show poster along its lettering.','poster'],eli:['Points to a smaller supper plan.','page'],jo:['Marks a cleared repair bench on the sketch.','drawing']},
 'quay-friction':{mina:['Looks between the spare motor and the others.','motor'],eli:['Pauses beside the wilted tomato seedlings.','plant'],jo:['Puts the one spare motor between both plans.','motor']},
 'quay-build':{mina:['Looks over the opening order.','page'],eli:['Checks the jobs still on the rota.','page'],jo:['Keeps the paid preparation rota within reach.','page']},
 'quay-first-set':{mina:['Takes a breath before beginning again.','page'],eli:['Finds a place for the pantry crate.','crate'],jo:['Keeps the names beside the finished setup.','page']},
 'quay-afterglow':{mina:['Writes a new verse on the old poster.','poster'],eli:['Counts meals beside the opening rota.','page'],jo:['Winds the borrowed cable beside the ledger.','tools']},
};
const storyReplies:Record<string,Record<string,string>>={
 show_up:{mina:'One preparation shift. Thank you for saying exactly what you can promise.',eli:'I’ll keep that one shift on the plan.',jo:'Your name goes beside one setup shift. The rest stays open.'},
 listen:{mina:'Then let me finish the last verse.',eli:'You can listen without taking on a job.',jo:'I’ll leave the future shift blank.'},
 no_promise:{mina:'Another time for the song, then. Take care.',eli:'Thanks for telling us. We’ll keep planning.',jo:'No name on the rota. That’s clear.'},
 shared_credit:{mina:'My set. Eli’s supper. Jo’s build. All three names belong here.',eli:'Now the supper’s work is on the page.',jo:'There. Names, materials, budget. I can work with that.'},
 mina_first:{mina:'I’ll keep the headline and the smaller frame.',eli:'The pantry’s work still needs its own time.',jo:'A small frame, fairly paid. That is what I can offer.'},
 small_scope:{mina:'You can leave this decision with us.',eli:'We’ll keep your part small.',jo:'I’ll keep the materials ledger clear.'},
 garden:{mina:'One unbroken song. I want to keep that in the supper plan.',eli:'Food and a listening break. Let’s make room for both.',jo:'Then we build for the garden, at that scale.'},
 workshop:{mina:'Twelve chairs. I can imagine singing to twelve people.',eli:'The supper can have its own evening.',jo:'One cleared bench, one smaller listening room.'},
 demo:{mina:'A recording. I can choose that beginning.',eli:'The pantry can share the song later.',jo:'A quiet corner, then. We’ll work with what’s here.'},
 repair_first:{mina:'I’ll work with the smaller set.',eli:'Thank you. The pantry needs that pump.',jo:'Pump first. I’ll keep the other setup small.'},
 share_evening:{mina:'A listening break that actually stays a listening break.',eli:'Both parts have a place in the evening.',jo:'A fair split. Let’s keep the work just as clear.'},
 protect_set:{mina:'I’ll keep the full set. I know the pantry still carries a cost.',eli:'The pantry still needs another way through.',jo:'Then the pantry work is still unfinished. Keep that visible.'},
 be_here:{mina:'Thank you for hearing the whole song.',eli:'It’s good to sit here together.',jo:'A room being used. That’s what I wanted to see.'},
 shared_keys:{mina:'A room that can keep going without asking for all of us, every time.',eli:'Someone else can open. I can take a night off.',jo:'Keys and a readable rota. Both need passing on.'},
};
const cameoReplies:Record<string,[string,string]>={
 asha:['This path turns into a leaf. Just this page, though.','One question about the path. I’m keeping the drawing this way.'],
 nico:['Look at this edge!','This one. The other leaves can stay.'],
 jian_wu:['I see why the other one reads faster. I still like this one.','Four pages. I can leave the next redraw for later.'],
 lin:['Cloud Street. Yesterday it was Spoon Street.','Hold this corner. I’ll do the roof.'],
 bea:['Cup!','Up.'],
};
function receiptReply(input:PersonSceneInput,profile:PersonSceneProfile):PersonReply{
 const {actorId,receipt}=input,r=receipt!;
 if(typeof r.response==='object'&&r.response.speakerId===actorId){const {speech,activity,emotion,gesture}=r.response;return{speech,activity,emotion,gesture,expression:emotionExpression[emotion],prop:profile.prop};}
 const id=r.actionId??r.id??'',key=id.startsWith('repair:')?'repair':id.split(':').at(-1)?.split('~')[0]??'',voice=characterVoices[actorId];
 let emotion:PersonEmotion=motiveEmotion[r.emotion??'']??(['rush','press'].includes(key)||r.response==='boundary'||r.response==='refusal'?'firm':['repair','honest'].includes(key)?'relieved':'warm');
 let gesture:PersonGesture=emotion==='firm'?'withdraw':emotion==='shy'||emotion==='sad'?'pause':['help','keep','history_share','cameo_choice'].includes(key)?'point':'offer';
 let speech=attributedSpeech(r.outcome||r.body,canonicalCharacterById[actorId]?.name??actorId);
 if(id.startsWith('story:')){
  speech=storyReplies[key]?.[actorId]||speech;
  const expression=scenePortraitExpression(actorId,{id:input.sceneId??id.split(':')[1],characters:[actorId]},{sceneId:input.sceneId??id.split(':')[1],choiceId:key});emotion=expressionEmotion[expression];
 }
 if(cameoReplies[actorId])speech=cameoReplies[actorId][key==='cameo_choice'?1:0];
 if(!speech){
  if(key==='promise')speech='Next month, then. One block, as we agreed.';
  else if(['renegotiate','release','history_boundary','quiet','no_promise'].includes(key)){speech='Thank you for being clear. We can leave it there.';gesture='pause';}
  else if(key==='keep')speech='You made the time we agreed on. Thank you.';
  else if(key==='introduction')speech='We have someone in common. I’m glad you said hello.';
  else if(key==='introduce')speech='Let’s keep the invitation small. The answer is theirs to give.';
  else if(['rush','press'].includes(key))speech=voice?.boundary??'That’s more than I agreed to. I’m stopping here.';
  else if(['repair','honest'].includes(key))speech=voice?.repair??'Thank you for naming it. I’m keeping that limit.';
  else if(key==='help')speech=voice?.help??'That small part is enough for today. Thank you.';
  else if(key==='accept'||r.response==='support')speech=voice?.support??'There’s a little room for you here.';
  else if(r.response==='refusal')speech=voice?.boundary??'I can’t take that on today.';
  else if(r.response==='smaller-offer')speech=voice?.small??'I can make room for this smaller exchange.';
  else speech=profile.familiar;
 }
 const activity=actorId==='bea'?(key==='cameo_choice'?'Reaches toward Kit; the cups stay on the table.':'Looks toward Kit as the cups balance.'):
 actorId==='oren'&&orenNeedsShortVisit(input.g)?'Stays seated; the project remains put aside.':activities[gesture];
 return{speech,activity,emotion,gesture,expression:emotionExpression[emotion],prop:profile.prop};
}

export function personReply(input:PersonSceneInput):PersonReply{
 const {g,p,actorId,remote,sceneId,settled,available=true,preview,pending,error,receipt}=input,profile=personProfile(actorId),child=(canonicalCharacterById[actorId]?.age??99)<18;
 const familiarity=receipt?.familiarity??familiarityView(p,{actorId});
 if(receipt&&!pending&&!error&&!p.castRedacted){const result=receiptReply(input,profile);let continuation=personFamiliarityLine(actorId,familiarity);
  if(continuation&&['firm','hurt'].includes(result.emotion)&&!child)continuation=['I am keeping that limit.','That answer has not changed.','Familiar does not mean available.','I can still say no.'][familiarity.lastVariant%4];
  if(continuation===result.speech)continuation=profile.greeting!==result.speech?profile.greeting:personFamiliarityLines[actorId]?.habit[0]??'';
  const notices=personCareerNotices(input);if(notices.length)continuation=[...new Set(notices.map(notice=>notice.speech))].join(' ');
  if(continuation)result.continuation=continuation;
  return remote?{...result,activity:'A reply arrives through your existing correspondence.'}:result;
 }

 const expression=scenePortraitExpression(actorId,sceneId?{id:sceneId,characters:[actorId]}:null);
 let result:PersonReply={speech:(personFamiliarityLine(actorId,familiarity)||(input.known?profile.familiar:profile.greeting)),activity:profile.activity,emotion:expressionEmotion[expression],gesture:'listen',expression,prop:profile.prop};
 if(sceneId&&opening[sceneId]?.[actorId]){result.speech=opening[sceneId][actorId];const act=storyActivities[sceneId]?.[actorId];if(act){result.activity=act[0];result.prop=act[1];}}
 if(!p.castRedacted&&(p.cast?.bonds[actorId]?.conflict||p.motives?.bonds[actorId]?.strained))result={...result,speech:characterVoices[actorId]?.boundary??'I need that limit to stay in place.',emotion:'firm',expression:'hurt',gesture:'withdraw',activity:'Keeps a little distance; the earlier limit still stands.'};
 if(actorId==='oren'&&orenNeedsShortVisit(g))result={...result,speech:'Company, yes. A building session, no.',activity:'Stays seated beside his blue tea tin.',emotion:'tired',expression:'neutral',gesture:'pause',prop:'cup'};
 if(settled||!available)result={...result,speech:child?actorId==='bea'?'Up.':'I’m doing my own thing now.':profile.farewell,activity:child?'Returns their attention to the family moment.':'Returns to their own plans.',gesture:'pause'};
 if(preview)result={...result,speech:preview.available?'':child?actorId==='bea'?'Up.':'Another time.':'We can leave this for now.',activity:preview.available?'Waits while you decide.':'Leaves the choice for another time.',gesture:preview.available?'listen':'pause'};
 if(pending||error)result={...result,speech:'',activity:pending?'Waits while your choice is confirmed.':'The exchange pauses; your choice is not confirmed.',gesture:'pause'};
 if(p.castRedacted)result={...result,speech:'',activity:'This player’s conversation is private.',emotion:'attentive',expression:'neutral',gesture:'pause'};
 const familiarLine=personFamiliarityLine(actorId,familiarity);
 if(familiarLine&&!p.castRedacted&&!pending&&!error&&!preview&&!settled&&available&&familiarLine!==result.speech){
  result.continuation=['firm','hurt'].includes(result.emotion)&&!child?['I am keeping that limit.','That answer has not changed.','Familiar does not mean available.','I can still say no.'][familiarity.lastVariant%4]:familiarLine;
 }
 if(remote&&!p.castRedacted)result={...result,activity:pending?'Your message is awaiting confirmation.':error?'No new reply is confirmed.':'In touch through your existing correspondence.'};
 return result;
}
