import type {GameView as Game,Player} from './game.ts';
/** Story work uses the same preparation and paid practice as venue careers. */
export function careerStoryGig(_g:Game,p:Player,id:string){
 if(id!=='independent_service'||!p.career)return null;
 const prepared=!!p.career.training['technical:foundation'],hours=p.career.experience.technical?.paidHours??0;
 const reason=!prepared?'Complete technical foundation preparation at Campus or the Library first.':hours<160?'Complete relevant technical entry work first; a regular paid month is enough.':'';
 return{available:!reason,reason,body:'Use technical foundation preparation and a regular month of relevant paid experience for a small independent booking. Your main venue contract stays in place.'};
}
