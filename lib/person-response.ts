import type {GameView as Game,Player} from './game.ts';
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
export type ResponseReceipt={careerNotices?:CapturedCareerNotice[];title:string;actionTitle?:string;body:string;outcome?:string;actionId?:string;emotion?:string;familiarity?:FamiliarityView;response?:string|{speakerId:string;speech:string;activity:string;emotion:PersonEmotion;gesture:PersonGesture};id?:string;week?:number};
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
 const lines=[...text.matchAll(before),...text.matchAll(after)].filter(match=>match[1].length<=800).sort((a,b)=>(a.index??0)-(b.index??0));
 return (lines.at(-1)?.[1]??'').replace(/,$/,'.');
}

const opening:Record<string,Record<string,string>>={
  "quay-promise": {
    "mina": "I have a song nearly ready and an evening that is mostly an idea. Eli needs the supper planned; Jo needs to know what we are building. Tell us which part you actually want to take.",
    "eli": "A supper needs food and people. I can count the food once I know the people. The song is Mina’s; I would like the meal to stop becoming whatever is left after we discuss it.",
    "jo": "I can build a small stage. Put the materials and my time in the plan. A sketch looks wonderfully finished before anybody has had to carry the wood into the room."
  },
  "quay-credit": {
    "mina": "My name is on the poster, and I like seeing it there. I also know Eli’s supper and Jo’s build will be in the room. Show me a version where the work stays visible without making the song disappear.",
    "eli": "The supper and its work need a name on that poster too. People notice the food when it arrives, and then the empty plates seem to find their own way back to me.",
    "jo": "I want you to have your first night, Mina. I need the materials paid for as well. The lettering can be generous; the ledger needs to add up."
  },
  "quay-replan": {
    "mina": "I wanted a whole song. Now the original evening has gone, and everyone is being so sensible that I feel foolish for missing it. What can we make room for without pretending it is the same beginning?",
    "eli": "People still need to eat. Could a listening break fit around supper? I do not want Mina playing against the sound of bowls simply because the garden happens to have room for us.",
    "jo": "I can offer a cleared repair bench and a smaller room. Twelve people would still be an audience. Let us choose the space before the next version grows beyond the materials again."
  },
  "quay-friction": {
    "mina": "I don’t want the song to disappear between the jobs. I can hear how that sounds beside a broken pump. I would still like somebody to tell me what part of the evening remains mine.",
    "eli": "That pump keeps the pantry going. I need you to hear that part too. There are meals depending on it, which is a less attractive sentence than the one on the concert poster.",
    "jo": "One motor. Two jobs. We need to choose what gets done with the part we have, rather than admire a plan requiring another one. I can keep the smaller setup clear."
  },
  "quay-build": {
    "mina": "It’s smaller than the first plan. I still want to sing here. I have rewritten the beginning enough times; today I would like to get the room ready and let the song keep its own shape.",
    "eli": "Let’s name the jobs, then leave room for the evening. I keep looking for the next thing to do when someone else is already doing it. A clear rota might save us all that performance.",
    "jo": "Here’s the work. Which part can you take? The paid preparation has its terms on the page; looking at the plan does not put your name beside a shift."
  },
  "quay-first-set": {
    "mina": "You’re here. I’m going to finish the song. There is a line near the end I have been avoiding, and I would rather sing it badly once than apologize for it again.",
    "eli": "There’s a place to sit. The work can pause for a song. I have been counting the room all evening; now I would like to hear what we made room for.",
    "jo": "The room is ready. Let’s let it be used. I can leave the tools down while somebody does the thing the bench was cleared for in the first place."
  },
  "quay-afterglow": {
    "mina": "I want to keep writing. The next evening can have its own size. I am still hearing the room go quiet before the last line; I don’t want to turn that into a bigger promise while it is fresh.",
    "eli": "A rota needs more than one name. I enjoyed sitting down with you. I would like the next person to be able to open without discovering that the room still depends on my being here.",
    "jo": "Keep the budget where the next person can find it. The cables are wound, the costs are written down, and the room can belong to another evening without beginning the work from nothing."
  }
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
  "show_up": {
    "mina": "One preparation shift. Thank you for saying exactly what you can promise. That is enough to put on the page. I can look forward to the evening without imagining a larger promise behind your name.",
    "eli": "I’ll keep that one shift on the plan. I know where your part begins and ends. The rest of the rota can stay open for someone else.",
    "jo": "Your name goes beside one setup shift. The rest stays open. I can count that time while I plan the build. It is a relief to work with a promise that has a size."
  },
  "listen": {
    "mina": "Then let me finish the last verse. There is a word I keep changing when somebody looks up. I want to hear what it does if I leave it alone.",
    "eli": "You can listen without taking on a job. Sit where you can hear her. I will stop turning every spare chair into a place for another helper.",
    "jo": "I’ll leave the future shift blank. The room can hold a listener as well as somebody working. I am learning to leave that space in the plan."
  },
  "no_promise": {
    "mina": "Another time for the song, then. Take care. I would have liked you to hear it. I can say that and still let you go without trying to improve your answer.",
    "eli": "Thanks for telling us. We’ll keep planning. I will leave your name off the shift. The evening still needs planning, and we can get on with the part that is ours.",
    "jo": "No name on the rota. That’s clear. The blank space is useful information. I would rather see it now than discover it while carrying the last piece of wood."
  },
  "shared_credit": {
    "mina": "My set. Eli’s supper. Jo’s build. All three names belong here. I was afraid the song would shrink if I shared the page. It looks more like an evening now, with the other work named.",
    "eli": "Now the supper’s work is on the page. People can see what the supper takes before the bowls arrive. I do not have to explain it halfway through serving.",
    "jo": "There. Names, materials, budget. I can work with that. The work has its names and the materials have their budget. We can finish the poster without quietly taking something off the ledger."
  },
  "mina_first": {
    "mina": "I’ll keep the headline and the smaller frame. I wanted the headline more than I enjoyed admitting. I can keep it without pretending it pays for a larger frame.",
    "eli": "The pantry’s work still needs its own time. We will plan the pantry work in its own time. The song can have the headline without swallowing the meal.",
    "jo": "A small frame, fairly paid. That is what I can offer. The smaller frame is what the budget buys. I can make that one sound, and leave the larger sketch for another job."
  },
  "small_scope": {
    "mina": "You can leave this decision with us. I can decide this with Eli and Jo. You do not have to remain in the conversation just because you helped it begin.",
    "eli": "We’ll keep your part small. That is your part settled. We can keep talking about ours without carrying your name into the next job.",
    "jo": "I’ll keep the materials ledger clear. I have marked where your share stops. It will still be there when somebody is tempted to describe the whole thing as our plan."
  },
  "garden": {
    "mina": "One unbroken song. I want to keep that in the supper plan. I can wait until the bowls are still. I would rather have one quiet beginning than a longer set nobody has time to hear.",
    "eli": "Food and a listening break. Let’s make room for both. I have put the listening break inside the supper plan. For those few minutes the bowls can wait where they are.",
    "jo": "Then we build for the garden, at that scale. We need the things this space asks for. I can leave the more elaborate stage in the sketchbook rather than make the garden imitate it."
  },
  "workshop": {
    "mina": "Twelve chairs. I can imagine singing to twelve people. It is fewer people than I imagined, and I am trying not to count that as failure. Twelve can still hear every word.",
    "eli": "The supper can have its own evening. The meal needn’t compete with the rehearsal. I can give each one the attention it needs on its own evening.",
    "jo": "One cleared bench, one smaller listening room. The bench is clear. I would rather make this room work well than keep apologizing for the larger room we haven’t got."
  },
  "demo": {
    "mina": "A recording. I can choose that beginning. A recording gives me room to try the line again. I will have to stop eventually and choose the version that actually exists.",
    "eli": "The pantry can share the song later. We can listen when the pantry work is finished. The song needn’t become background simply because the day is busy.",
    "jo": "A quiet corner, then. We’ll work with what’s here. The corner is ready for the recording. We can use the quiet that is here rather than build a room we cannot afford."
  },
  "repair_first": {
    "mina": "I’ll work with the smaller set. I know why the pump comes first. I am still disappointed. Give me a moment to find the smaller beginning without pretending I wanted it all along.",
    "eli": "Thank you. The pantry needs that pump. I can see the next meal more clearly now. I know that has made Mina’s evening smaller; I am grateful without asking her to enjoy it.",
    "jo": "Pump first. I’ll keep the other setup small. The pump gets the motor. The smaller setup is what I can make from what remains. I will keep both jobs clear on the page."
  },
  "share_evening": {
    "mina": "A listening break that actually stays a listening break. I have put the song in that space. Please let the quiet last long enough for it to feel like listening rather than an interruption.",
    "eli": "Both parts have a place in the evening. I can serve before it and return afterward. The meal has its time; Mina will not have to sing over the clearing away.",
    "jo": "A fair split. Let’s keep the work just as clear. The split is on the plan. We can build for that arrangement instead of leaving everyone to improvise it during the first song."
  },
  "protect_set": {
    "mina": "I’ll keep the full set. I know the pantry still carries a cost. I wanted this badly enough to choose it. I can keep the full set without asking Eli to say the pantry’s remaining problem has vanished.",
    "eli": "The pantry still needs another way through. I have kept the unfinished pantry work on the page. I would rather we could all enjoy the song, but the next meal still needs an answer.",
    "jo": "Then the pantry work is still unfinished. Keep that visible. The setup gets the motor. That leaves another job to solve, and I will not erase it to make the finished stage look simpler."
  },
  "be_here": {
    "mina": "Thank you for hearing the whole song. You let the last line finish before the room moved again. I had forgotten what it felt like to hear a song end without rehearsing an apology.",
    "eli": "It’s good to sit here together. For once I was listening instead of counting. There is something I would like to remember about that, before I get up for the bowls.",
    "jo": "A room being used. That’s what I wanted to see. I can see what the clearing and carrying made possible. That is enough to keep me in this chair for another minute."
  },
  "shared_keys": {
    "mina": "A room that can keep going without asking for all of us, every time. I can write the next song without asking the room to become bigger every time. Someone else can choose a different kind of evening here.",
    "eli": "Someone else can open. I can take a night off. I can see a night off on that rota. I keep checking the name, as though it might become mine if I look away.",
    "jo": "Keys and a readable rota. Both need passing on. The keys and the costs are together. The next person can open without needing me to stand beside them and explain the whole history of the room."
  }
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
  // A receipt gets a short callback, never another first/familiar opening.
  // Choose only this person's authored lines from the frozen receipt variant.
  if(continuation&&(continuation===result.speech||continuation===profile.familiar)){
   const lines=personFamiliarityLines[actorId],variant=(familiarity.lastVariant+1)%2;
   continuation=[lines?.routine[variant],lines?.habit[variant],lines?.routine[1-variant],lines?.habit[1-variant]].find(line=>line&&line!==result.speech)??'';
  }
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
 if(preview)result={...result,speech:preview.available?result.speech:child?actorId==='bea'?'Up.':'Another time.':'We can leave this for now.',activity:preview.available?result.activity:'Leaves the choice for another time.',gesture:preview.available?'listen':'pause'};
 if(pending||error)result={...result,speech:'',activity:pending?'Waits while your choice is confirmed.':'The exchange pauses; your choice is not confirmed.',gesture:'pause'};
 if(p.castRedacted)result={...result,speech:'',activity:'This player’s conversation is private.',emotion:'attentive',expression:'neutral',gesture:'pause'};
 const familiarLine=personFamiliarityLine(actorId,familiarity);
 if(familiarLine&&!p.castRedacted&&!pending&&!error&&!preview&&!settled&&available&&familiarLine!==result.speech){
  result.continuation=['firm','hurt'].includes(result.emotion)&&!child?['I am keeping that limit.','That answer has not changed.','Familiar does not mean available.','I can still say no.'][familiarity.lastVariant%4]:familiarLine;
 }
 if(remote&&!p.castRedacted)result={...result,activity:pending?'Your message is awaiting confirmation.':error?'No new reply is confirmed.':'In touch through your existing correspondence.'};
 return result;
}
