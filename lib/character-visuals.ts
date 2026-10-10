import {canonicalCharacterById} from './character-canon.ts';
import {characterPortraits} from './character-portraits.ts';
export type CharacterAgeStage='toddler'|'child'|'teen'|'adult'|'elder';
/** Stable authored facts only. No appearance, role or personality is inferred from
 * ancestry. Unreviewed/offstage art stays absent instead of borrowing another face. */
export function characterVisualIdentity(id:string):{age:number;ageStage:CharacterAgeStage;portrait:{src:string;alt:string}|null;role:string;homeRegion:string}|null{
 const c=canonicalCharacterById[id];if(!c)return null;
 const ageStage=c.age<3?'toddler':c.age<13?'child':c.age<18?'teen':c.age>=65?'elder':'adult';
 return{age:c.age,ageStage,portrait:characterPortraits[id]??null,role:c.role,homeRegion:c.region};
}
