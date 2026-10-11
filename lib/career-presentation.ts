import type {GameView as Game,Player} from './game.ts';
import type {CareerChoice,CareerReceipt} from './careers.ts';
import {capturePersonReceipt,type ResponseReceipt} from './person-response.ts';
import {formatEconomyMoney as money} from './economy.ts';
export function careerEncounterChoice(c:CareerChoice){return{id:c.id,actionId:c.id,title:c.title,body:c.body,available:c.available,reason:c.reason,previewText:[...(c.paidHours?[`${c.paidHours} paid hours`,`${money(c.takeHome??c.cash)} take-home${c.repayment?`; ${money(c.repayment)} repays arrears`:''}; ${money(c.cash)} reaches cash`]:[]),...c.requirements],cost:{time:c.time,cash:c.cost,energy:c.energy},primary:c.qualification==='ready'};}
export function careerConfirmedReceipt(g:Game,p:Player,actionId:string):ResponseReceipt|null{
 const r=p.career?.receipts.find(r=>r.id===actionId);if(!r||r.round!==g.round||p.castRedacted)return null;
 const receipt:ResponseReceipt={id:r.id,actionId:r.id,title:r.title,body:r.outcome,outcome:r.outcome,week:r.round,...(r.actorId&&r.speech?{response:{speakerId:r.actorId,speech:r.speech.replace(/^[“"]|[”"]$/g,''),activity:careerReceiptActivity(r),emotion:r.offerId?'warm' as const:r.verb==='apply'?'firm' as const:r.verb==='work'?'proud' as const:'attentive' as const,gesture:r.verb==='work'?'offer' as const:'listen' as const}}:{})};
 return r.actorId?capturePersonReceipt(receipt,p,r.actorId):receipt;
}
function careerReceiptActivity(r:CareerReceipt){if(r.activity)return r.activity;return r.verb==='work'?'Your colleague accepts the finished handover.':r.verb==='apply'?'The workplace contact checks the application and gives you a clear answer.':r.verb==='accept'?'The workplace contact confirms the agreed role.':'The workplace contact leaves the decision with you.';}
