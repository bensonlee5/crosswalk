import type {LifeNpc,LifeReceipt} from './life-events.ts';
import type {Player} from './game.ts';
type PersonEmotion='attentive'|'warm'|'concerned'|'hurt'|'relieved'|'sad'|'proud';
type PersonGesture='offer'|'point'|'pause'|'withdraw';

export type PersonEventResponse={speakerId:LifeNpc;speech:string;activity:string;emotion:PersonEmotion;gesture:PersonGesture};
const reply=(speakerId:LifeNpc,speech:string,activity:string,emotion:PersonEmotion='warm',gesture:PersonGesture='offer'):PersonEventResponse=>({speakerId,speech,activity,emotion,gesture});
/** Explicit cast in the authored event/choice. A cash/trust delta or a name found
 * in prose is never used to invent a speaker. Bills and solo decisions stay solo.
 * These are brief follow-up replies, not evidence of physical co-location. */
const replies:Record<string,PersonEventResponse>={
 'unexpected_patron:back_calling':reply('jo','There’s a first piece you can keep working on. It doesn’t have to be the whole plan.','Points out one useful part of the work.'),
 'unexpected_patron:repay_eli':reply('eli','That leaves something for the next person. You’re welcome at the co-op.','Makes room beside the shared supplies.','relieved'),
 'unexpected_patron:seed_evening':reply('mina','Thank you for making a little room for the work. I want to choose its shape.','Keeps the rehearsal notes close.','relieved'),
 'invitation:honest_debut':reply('mina','You brought the unfinished thing. That gave us something real to hear.','Leaves the last note on the page.'),
 'invitation:first_workshop':reply('mina','You already knew something worth sharing. I’m glad you brought it.','Turns toward the work you offered.','proud'),
 'invitation:shared_evening':reply('mina','There was room for more than one person’s work. I liked hearing the room change.','Looks along the shared program.'),
 'invitation:take_stock':reply('mina','Thank you for telling me. You can leave this invitation here.','Lets the unanswered part stay open.','attentive','pause'),
 'work_reset:jo_referral':reply('jo','A small client, a real job. We can keep the favor between us clear.','Points to the agreed work.','attentive','point'),
 'venue_lost:home_show':reply('mina','A living room that listened. It was smaller, and I got to finish.','Closes the songbook slowly.','relieved'),
 'venue_lost:find_audience':reply('mina','A borrowed corner still held an audience. Thank you for bringing them.','Lets the last note settle.','relieved'),
 'venue_lost:record_demo':reply('mina','The recording is real. I can send the song somewhere now.','Keeps the recording beside the notes.','proud'),
 'venue_lost:take_stock':reply('mina','You don’t have to pretend you can fix the venue. I’m glad you told me.','Leaves the cancelled-show page folded.','sad','pause'),
 'garden_setback:repair_pump':reply('jo','The pump works. The lost harvest stays lost; the next planting has a chance.','Puts the repair tools down.','relieved','point'),
 'garden_setback:organize_groceries':reply('eli','Bought tomatoes still feed people. Thank you for helping us keep the pantry open.','Sets the replacement groceries beside the pantry list.','relieved'),
 'garden_setback:eli_coop':reply('eli','We can share the backup supplies. I’m keeping your later turn on the plan.','Marks the agreed later turn.','attentive','point'),
 'garden_setback:take_stock':reply('eli','Let’s keep what failed on the page. The next planting can be smaller.','Leaves the failed harvest in the record.','concerned','pause'),
 'repair_bill:jo_toolkit':reply('jo','The plane, clamps and screwdriver are useful again. Keep the favor in mind.','Lays out the borrowed tools.','attentive','offer'),
 'festival_split:choose_mina':reply('mina','You kept the seat I saved. I know Eli is still carrying the other evening.','Leaves space beside the song list.','warm'),
 'festival_split:choose_eli':reply('eli','Those tables and bowls made the fundraiser work. Mina’s missed seat still matters.','Puts the last soup bowl down.','relieved'),
 'festival_split:share_stage':reply('mina','A shorter set, with room for the fundraiser. We both changed the plan.','Marks the shorter set on the program.','relieved','point'),
 'festival_split:take_stock':reply('mina','Thank you for giving a clear answer. We’ll have to adapt the plans.','Lets the limit stand.','attentive','pause'),
 'commission_dispute:stand_with_jo':reply('jo','The buyer didn’t restore the job. You kept everyone’s name with the work. That matters.','Points to the names beside the work.','relieved','point'),
 'commission_dispute:solo_sale':reply('jo','That shared work wasn’t just a step toward your separate sale. I’m hurt by this.','Pulls the shared ledger closer.','hurt','withdraw'),
 'commission_dispute:mina_benefit':reply('mina','A smaller fee, from people who came to hear us. Let’s keep the makers named.','Keeps the makers’ list beside the door takings.','warm','point'),
};
/** The two dynamic choices select a specific first eligible person in the
 * authored rules. Capture this before mutation: an already-true relationship
 * field need not survive as a changed field in the receipt. */
export function lifeEventPersonActor(actionId:string,before:Player):LifeNpc|null{
 const match=actionId.match(/^event:\d+:([^:]+):([^:]+)$/);if(!match)return null;
 const [,eventId,key]=match,authored=replies[eventId+':'+key];if(authored)return authored.speakerId;
 if(eventId!=='crossroads')return null;const people:LifeNpc[]=['mina','eli','jo'];
 if(key==='accept_support')return people.find(id=>{const r=before.life?.relationships[id];return !!r&&!r.rivalry&&(r.trust>=1||r.support);})??null;
 if(key==='return_favor')return people.find(id=>before.life?.relationships[id].reciprocity)??null;
 return null;
}
export function lifeEventPersonResponse(receipt:LifeReceipt,before?:Player):PersonEventResponse|null{
 const resolution=receipt.resolved;if(!resolution||resolution.deferred)return null;
 const prefix=`${receipt.week}:${receipt.eventId}:`;if(!resolution.choiceId.startsWith(prefix))return null;
 const key=resolution.choiceId.slice(prefix.length),authored=replies[receipt.eventId+':'+key];if(authored)return{...authored};
 if(receipt.eventId!=='crossroads'||!['accept_support','return_favor'].includes(key))return null;
 // These two choices explicitly select their counterpart in the engine and store
 // that person in relationshipChanges. Read that selected target (or the captured pre-action selection), not trust deltas.
 const person=before?lifeEventPersonActor('event:'+resolution.choiceId,before):resolution.effects.relationshipChanges[0]?.npc;if(!person)return null;
 return key==='accept_support'?reply(person,'The rejection still happened. We can make this smaller next step together.','Makes room for the agreed experiment.','attentive'):
 reply(person,'Thank you for coming back to the small part I needed.','Acknowledges the favor you actually returned.','relieved');
}
