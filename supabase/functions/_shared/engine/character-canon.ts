/** The current Travel Guide is authoritative for public character facts.
 * Scene rules below only choose where an authored encounter can happen. */
import {canonicalCharacters,type CanonicalCharacter} from './character-canon-data.ts';
export {canonicalCharacters,type CanonicalCharacter} from './character-canon-data.ts';
export {canonicalRegionSetting} from './guide-world-data.ts';
export const canonicalCharacterById:Readonly<Record<string,CanonicalCharacter>>=Object.fromEntries(canonicalCharacters.map(c=>[c.id,c]));
const residenceNames:Record<string,string>={alder:'Alder Quay',saffron:'Saffron Reach',glasssteppe:'Glasssteppe',pelagia:'Pelagia',embermesa:'Ember Mesa'};
function familyResidenceFact(person:CanonicalCharacter,other:CanonicalCharacter){
 if(person.region===other.region)return '';
 const home=(c:CanonicalCharacter)=>c.region==='traveler'?`${c.name} travels between regions`:`${c.name} lives in ${residenceNames[c.region]}`;
 return ` ${home(person)}; ${home(other)}.`;
}
export function canonicalIdentity(id:string){
 const c=canonicalCharacterById[id];if(!c)return null;
 return{age:c.age,family:c.family.map(link=>({otherId:link.id,relationship:link.label.replace(/ of$/,''),otherRelationship:canonicalCharacterById[link.id]?.family.find(f=>f.id===id)?.label.replace(/ of$/,'')??'',fact:`${c.name} is ${canonicalCharacterById[link.id]?.name??link.id}’s ${link.label.replace(/ of$/,'').toLowerCase()}.${familyResidenceFact(c,canonicalCharacterById[link.id])}`}))};
}
/** Family time changes only the current public meeting, never a stored receipt. */
export function canonicalFamilyVenue(round:number,id:string):string|null{
 if(id==='alder_tess'&&round%2===0)return 'CORNER CAFÉ';
 if(id==='pelagia_mara'&&round%2===1)return 'COMMUNITY';
 return null;
}

