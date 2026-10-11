import type {Game,Player} from './game.ts';
/** Only the two old generic-skill employment scenes need this bridge. Field
 * records remain authoritative; it never grants a generic skill or a job. */
export function careerStoryGig(g:Game,p:Player,id:string){
 if(g.careerVersion!==1||p.career?.version!==1||!['first_workshop','independent_service'].includes(id))return null;
 const preparation=!!p.career.training['technical:foundation'],hours=p.career.experience.technical?.paidHours??0,required=id==='first_workshop'?120:160;
 const reason=!preparation?'Complete technical foundation preparation at Campus or the Library first.':hours<required?'Complete relevant technical entry work first; a regular paid month is enough.':'';
 return{available:!reason,reason,body:id==='first_workshop'?'Use technical foundation preparation and relevant paid practice to teach a beginner workshop. This is a one-off paid teaching commitment, not a new employee contract.':'Use technical foundation preparation and a regular month of relevant paid experience for a small independent booking. Your main venue contract stays in place.'};
}
