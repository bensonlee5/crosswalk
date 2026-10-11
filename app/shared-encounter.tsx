import type {Game,Player} from '@/lib/game';
import {sharedWorldChoices,sharedOpportunityView} from '@/lib/shared-opportunities';
import {worldChoiceEffects} from '@/lib/world-choice-presentation';
import {capturePersonReceipt} from '@/lib/person-response';
import type {EncounterChoice} from './story-choices';

/** Public work/booking exchanges coexist with the host's personal scene. */
export function sharedActorChoices(g:Game,p:Player,actorId:string,spot:string):EncounterChoice[]{
 return sharedWorldChoices(p,g).filter(c=>c.actorId===actorId&&c.spot===spot).map(c=>({id:c.id,actionId:'world:'+c.id,title:c.title,body:c.body,available:c.available,reason:c.reason,previewText:worldChoiceEffects(c,p,g),cost:{time:c.time,cash:c.cost,energy:Math.max(0,-c.preview.energy)}}));
}
export function sharedActorReceipt(g:Game,p:Player,choice:EncounterChoice,actorId:string){
 const receipt=sharedOpportunityView(g,p)?.receipts.find(r=>r.actionId===choice.actionId&&r.response.speakerId===actorId);
 return receipt?capturePersonReceipt(receipt,p,actorId):null;
}
