import type {Game,Player} from './game.ts';
import type {CareerLeadDefinition} from './career-content.ts';
import {regionDefinitions} from './world-life.ts';

/** A successful command is not necessarily a welcome conversation. Only its
 * exact persisted receipt can authorize a new professional introduction. */
export function eligibleCareerConversation(g:Game,p:Player,actionId:string|undefined,actorId:string){
 if(!actionId||p.motives?.bonds[actorId]?.strained||p.cast?.bonds[actorId]?.conflict)return false;
 if(actionId.startsWith('motive:')){const r=p.motives?.receipts.find(r=>r.id===actionId&&r.actorId===actorId&&r.week===g.round);return !!r&&['follow-through','support','smaller-offer'].includes(r.response);}
 if(actionId.startsWith('cast:')){const r=p.cast?.receipts.find(r=>r.id===actionId&&r.week===g.round),parts=actionId.split(':');return !!r&&parts[2]===actorId&&['listen','help','introduction','share','keep','honest','history_share'].includes(parts[3]);}
 if(actionId.startsWith('world:')){const r=p.world?.journal.find(r=>r.choiceId===actionId.slice(6)&&r.week===g.round);if(!r?.effects)return false;return ((actionId.endsWith(':talk:'+actorId)||actionId.endsWith(':local_help:'+actorId))&&Object.hasOwn(r.effects.localBonds,actorId)&&r.effects.localBonds[actorId]>=0)||(actorId==='neri'&&['neri_accept','neri_pelagia','neri_partner','neri_plan_coast','neri_plan_home','neri_distance','neri_visit','neri_payoff'].includes(actionId.split(':').at(-1)??'')&&r.effects.companionBond>=0);}
 if(actionId.startsWith('story:')){const [,scene,choice]=actionId.split(':'),r=p.story?.receipts.find(r=>r.sceneId===scene&&r.choiceId===choice&&r.week===g.round);return !!r&&(r.careerContactIds?r.careerContactIds.includes(actorId as 'mina'|'eli'|'jo'):(r.effects.trust[actorId as 'mina'|'eli'|'jo']??0)>0);}
 const chapter=/^story_(mina|eli|jo)_([123])$/.exec(actionId);return !!chapter&&chapter[1]===actorId&&p.life?.storyChapters[`${actorId}:${chapter[2]}`]===g.round;
}
const introductions:Record<string,string>={
 'tess-ferry':'I do the evening ferry rota too. There is parcel work at the transit desk; ask there about the actual slot.',
 'neri-esme-archive':'Esme and I worked together in the archive. The digitization desk in Pelagia is worth asking about once you have the preparation. Esme makes her own decision.',
 'tomas-leila-market':'My sister Leila knows the market circle. I can point you to the stall opening, but do check the agreement with them.',
 'leila-tomas-workshop':'Tomas, my brother, can explain the supervised assistant work at Kiln & Current. Ask him what the actual job needs.',
 'june-inez-library':'Inez and I have put local projects together. Ask at Seed & Story about the digitization work; a familiar name does not replace the preparation.',
 'esme-records':'The archive has digitization work. The opening asks for preparation, and any account of your work should stay beside your name.',
 'inez-records':'There is digitization work at the library. Start with the named task and what it needs, rather than a heroic promise.',
 'eli-pantry':'The pantry has paid roles with named handovers. Ask about the entry job; the rota is not a promise until you choose an agreement.',
 'jo-practical':'Foundry has a supervised assistant opening. One job, a clear scope, and an end. You can ask without having done another job first.',
};
export function careerNoticeSpeech(lead:CareerLeadDefinition,kind:'lead'|'reference'){
 if(kind==='lead')return introductions[lead.id]??`You can ask at ${regionDefinitions[lead.region].placeNames[lead.place]} about the listed work. The employer makes its own decision.`;
 const line:Record<string,string>={alder_tess:'I have seen your finished handover. I can put my name beside that work, without promising you another job.',pelagia_esme:'I can describe the archive work we actually completed together. Keep that account beside your name; an employer still makes its own decision.',mesa_inez:'We have a finished task to point to. I can describe that work in a reference. The next agreement remains yours to choose.',eli:'We have worked the same handover. I can say what you finished, without adding your name to another rota.',jo:'I can put the work and its credit together in a reference. That is not an agreement for the next job.'};
 return line[lead.from]??'We have completed work in this field together. I can describe that contribution in a reference; it does not promise another employer’s offer.';
}
