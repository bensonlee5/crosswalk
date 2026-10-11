import type {LifeNpc,LifeReceipt} from './life-events.ts';
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
 'work_reset:jo_referral':reply('jo','A small client, a real job. We can keep the favor between us clear.','Points to the agreed work.','attentive','point'),
 'repair_bill:jo_toolkit':reply('jo','The plane, clamps and screwdriver are useful again. Keep the favor in mind.','Lays out the borrowed tools.','attentive','offer'),
};
/** The current receipt names the only authored counterpart. */
export function lifeEventPersonActor(actionId:string):LifeNpc|null{
 const match=actionId.match(/^event:\d+:([^:]+):([^:]+)$/);return match?replies[match[1]+':'+match[2]]?.speakerId??null:null;
}
export function lifeEventPersonResponse(receipt:LifeReceipt):PersonEventResponse|null{
 const resolution=receipt.resolved;if(!resolution||resolution.deferred)return null;
 const prefix=`${receipt.week}:${receipt.eventId}:`;if(!resolution.choiceId.startsWith(prefix))return null;
 const key=resolution.choiceId.slice(prefix.length),authored=replies[receipt.eventId+':'+key];return authored?{...authored}:null;
}
