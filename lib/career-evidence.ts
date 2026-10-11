import type {GameView as Game,Player} from './game.ts';
import type {CareerLeadDefinition} from './career-content.ts';
import {regionDefinitions} from './world-life.ts';

/** A successful command is not necessarily a welcome conversation. Only its
 * exact persisted receipt can authorize a new professional introduction. */
export function eligibleCareerConversation(g:Game,p:Player,actionId:string|undefined,actorId:string){
 if(!actionId||p.motives?.bonds[actorId]?.strained||p.cast?.bonds[actorId]?.conflict)return false;
 if(actionId.startsWith('motive:')){const r=p.motives?.receipts.find(r=>r.id===actionId&&r.actorId===actorId&&r.week===g.round);return !!r&&['follow-through','support','smaller-offer'].includes(r.response);}
 if(actionId.startsWith('cast:')){const r=p.cast?.receipts.find(r=>r.id===actionId&&r.week===g.round),parts=actionId.split(':');return !!r&&parts[2]===actorId&&['listen','help','introduction','share','keep','honest','history_share'].includes(parts[3]);}
 if(actionId.startsWith('world:')){const r=p.world?.journal.find(r=>r.choiceId===actionId.slice(6)&&r.week===g.round);if(!r?.effects)return false;return ((actionId.endsWith(':talk:'+actorId)||actionId.endsWith(':local_help:'+actorId))&&Object.hasOwn(r.effects.localBonds,actorId)&&r.effects.localBonds[actorId]>=0)||(actorId==='neri'&&['neri_accept','neri_pelagia','neri_partner','neri_plan_coast','neri_plan_home','neri_distance','neri_visit','neri_payoff'].includes(actionId.split(':').at(-1)??'')&&r.effects.companionBond>=0);}
 if(actionId.startsWith('story:')){const [,scene,choice]=actionId.split(':'),r=p.story?.receipts.find(r=>r.sceneId===scene&&r.choiceId===choice&&r.week===g.round);return !!r&&(r.careerContactIds??[]).includes(actorId as 'mina'|'eli'|'jo');}
 return false;

}
const introductions:Record<string,string>={
 'tess-ferry':'There’s parcel work at Alder Ferry & Rail, if you’re looking. Ask at the courier desk; they’ll give you the current terms. A route has a last delivery. I find that an attractive feature in a job.',
 'neri-esme-archive':'Esme and I worked together in the archive. There is digitization work in Pelagia for someone with the preparation. Ask her about the actual desk and the application. I would like you to meet as two people interested in the work, rather than as the conclusion of a conversation I had elsewhere.',
 'tomas-leila-market':'My sister Leila knows the market circle. There is a stall opening you could ask about. I can show you where, then they can explain the work and the agreement. I had better let them do that part; being related to Leila has never made me an expert on her kitchen.',
 'leila-tomas-workshop':'Tomas, my brother, can explain the supervised assistant work at Kiln & Current. Ask him about the opening and what you would do first. Tell him you are asking about a job; otherwise he may show you a diagram before remembering to answer the question.',
 'june-inez-library':'Inez and I have put local projects together. Seed & Story has digitization work if you have the preparation. Ask at the desk. She will want to know what you can do with the records, which is a much better question than how well you know me.',
 'esme-records':'The archive has digitization work for a prepared applicant. There is a great deal of careful, ordinary attention in making a record searchable. If that interests you, ask about the opening. Your work would have your name beside it; I would rather you knew that before you applied.',
 'inez-records':'There is digitization work at the library. Ask about the preparation and the task before promising to rescue the whole collection. We need someone who can finish a careful piece of work and leave the next person able to find it.',
 'eli-pantry':'The pantry has paid entry work. You could ask about the job and the handover, if it interests you. I like seeing a name beside a task because someone has chosen the work, rather than because they happened to be standing nearby when I looked tired.',
 'jo-practical':'Foundry has a supervised assistant opening. You begin with materials and safe bench work; there is someone there to teach you. Ask for the current terms. You don’t have to arrive knowing every tool. You do have to leave the next person able to find them.',
};
export function careerNoticeSpeech(lead:CareerLeadDefinition,kind:'lead'|'reference'){
 if(kind==='lead')return introductions[lead.id]??`You can ask at ${regionDefinitions[lead.region].placeNames[lead.place]} about the listed work. The employer makes its own decision.`;
 const line:Record<string,string>={alder_tess:'I have seen your finished handover. I can put my name beside that work, without promising you another job.',pelagia_esme:'I can describe the archive work we actually completed together. Keep that account beside your name; an employer still makes its own decision.',mesa_inez:'We have a finished task to point to. I can describe that work in a reference. The next agreement remains yours to choose.',eli:'We have worked the same handover. I can say what you finished, without adding your name to another rota.',jo:'I can put the work and its credit together in a reference. That is not an agreement for the next job.'};
 return line[lead.from]??'We have completed work in this field together. I can describe that contribution in a reference; it does not promise another employer’s offer.';
}
