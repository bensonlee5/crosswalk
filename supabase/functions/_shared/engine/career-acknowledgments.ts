import type {CareerChoice,CareerReceipt,CareerState} from './careers.ts';
import type {Player} from './game.ts';

/** Authored workplace voice, grounded in each contact's established priorities.
 * This is recorded presentation only: it never changes a hiring decision. */
const hostLines:Record<string,readonly string[]>={
 alder_tess:['That is a handover the next person can read.','The finishing time is on the note. I can leave this with the next person.','Your part is finished. Let us keep the closing hour intact.'],
 saffron_leila:['That is the work we agreed to. No extra batch hidden at the end.','The agreed slot is finished. The next one keeps its own time.','Your part is clear. Anything more needs another agreement.'],
 mesa_june:['That is a job I can actually hand over. Point me toward my tea.','Your name belongs beside that finished work. I need not hover.','The agreed job is done. Let us leave the next apron for its own shift.'],
 jo:['The work and its credit stay together. Keep your name on it.','That finishes this agreement. Another job needs another agreement.','The handover is clear. There is a place to put the tools down.'],
 saffron_tomas:['Keep the checked part clear, and the uncertain part marked.','That is the agreed step finished. We need not pretend it answers everything.','The next person can see what was checked. That matters.'],
 glass_sora:['That is the task we agreed. The next job keeps its own time.','Leave the steps visible. The work can stay in its maker’s hands.','Your part is finished. The next person has room to try their own.'],
 pelagia_mara:['Keep the owner named and the unchecked line visible.','The handover says what is finished. Probably and checked stay separate.','That is the agreed work. Anything needing a trained crew still needs one.'],
 eli:['One name beside the finished job. Then we can actually leave it.','That is your part handed over. An empty rota space is still not a promise.','The next person has a clear task, and this agreement has an end.'],
 saffron_ada:['The agreed work is finished. The room still deserves its finishing time.','There is room for another answer in the handover. Keep it that way.','That leaves a clear next step without borrowing somebody else’s shift.'],
 pelagia_esme:['Keep each account beside its own name. The handover can hold that.','The instructions are clear without choosing somebody else’s answer.','That part is complete. The contributor still owns what comes next.'],
 mesa_inez:['One named job, with an end. That is a useful record.','The note says what the work actually did. We can use that.','The task is finished. Leave the heroic promise off the form.'],
};
function semanticKey(s:CareerState,r:Pick<CareerReceipt,'verb'|'target'|'region'>){
 const target=r.verb==='work'?s.contracts.find(c=>c.id===r.target.split('.')[0])?.target:r.verb==='accept'||r.verb==='decline'?s.offers[r.target]?.target:r.target;
 return `career:${r.region}:${r.verb}:${target??r.target}`;
}
export function acknowledgeCareerReceipt(p:Player,choice:CareerChoice,receipt:CareerReceipt){
 const s=p.career!;const key=semanticKey(s,receipt),previous=s.receipts.filter(r=>semanticKey(s,r)===key),last=previous.at(-1)?.familiarity;
 const count=previous.length+1,stage=count<2?'first':count<4?'familiar':count<7?'routine':'custom';
 const lastVariant=last?(last.lastVariant+1)%3:previous.length%3;
 receipt.familiarity={key,count,stage,lastVariant};
 const repeated=previous.length>0;
 if(receipt.verb==='work'||receipt.verb==='commission'){
  const contract=receipt.verb==='work'?s.contracts.find(c=>c.id===receipt.target.split('.')[0]):undefined;
  const role=contract?.title??choice.title.replace(/^Accept: /,'');
  const written=[`The ${role} handover names the completed work.`,`Another ${role} commitment is entered on your work record.`,`The workplace records the agreed ${role} hours and finished handover.`][lastVariant];
  const prefix=stage==='first'?'Your first recorded commitment here.':stage==='familiar'?'You return to a now-familiar task.':stage==='routine'?'There is an established work routine here.':'This is a workplace you have returned to over time.';
  receipt.outcome=`${prefix} ${written} ${receipt.outcome}`;
  if(receipt.actorId){const line=(hostLines[receipt.actorId]??['The agreed work is finished and recorded.','The handover makes your part clear.','Your completed work has been recorded.'])[lastVariant];receipt.speech=`“${repeated?`Back on ${role} work. `:`For this ${role} handover: `}${line}”`;}
  receipt.activity=[`The finished ${role} handover is checked against the agreed task.`,`Your colleague reads the ${role} handover before setting it down.`,`Your colleague acknowledges the completed ${role} commitment.`][lastVariant];
 }else if(repeated&&['apply','accept','decline'].includes(receipt.verb)){
  const written=receipt.verb==='apply'?['The desk has your earlier application on record.','You have brought this role back for another review.','This is a return visit about the same role.']:receipt.verb==='decline'?['You have declined an offer for this role before.','Another offer, another decision that remains yours.','The desk records your answer to this new offer.']:['You have agreed a role here before.','This is a new agreement at a familiar work desk.','The desk records this acceptance separately from your earlier agreement.'];
  receipt.outcome=`${written[lastVariant]} ${receipt.outcome}`;
  if(receipt.actorId&&receipt.speech){const opening=receipt.verb==='apply'?['We have looked at this role before.','You have returned about this role. The requirements still apply.','I have your earlier application. Here is the answer to this one.']:receipt.verb==='decline'?['You have made this choice here before.','I have recorded your answer to this offer.','This offer was yours to consider.']:['This is a new agreement, even though we have worked through one before.','We have recorded a separate agreement for this role.','You have chosen this agreement for yourself.'];receipt.speech=`“${opening[lastVariant]} ${receipt.speech.replace(/^[“"]|[”"]$/g,'')}”`;}
 }
}
