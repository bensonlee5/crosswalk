/** Public authored identity facts. No age, family or commitment is inferred from art.
 * Public kinship is separate from the private incidents gated in character-histories. */
export const characterAges:Record<string,number>={
 mina:27,eli:46,jo:54,neri:29,alder_tess:52,alder_rowan:39,
 saffron_leila:44,saffron_tomas:39,saffron_ada:35,
 glass_ren:26,glass_sora:30,glass_pavel:70,
 pelagia_mara:45,pelagia_lio:41,pelagia_esme:72,pelagia_tavi:24,
 mesa_june:60,mesa_inez:65,
 bram:43,oren:57,hugo:36,priya:68,sami:31,miro:62,sefu:49,kit:28,
};
export const characterFamilies:{ids:[string,string];relationship:[string,string];publicFact:string}[]=[
 {ids:['saffron_leila','saffron_tomas'],relationship:['Older sister','Younger brother'],publicFact:'Leila is Tomas’s older sister; they each keep their own working life in Saffron Reach.'},
 {ids:['miro','oren'],relationship:['Older brother','Younger brother'],publicFact:'Miro is Oren’s older brother. They live in Glasssteppe and Alder Quay respectively.'},
 {ids:['jo','kit'],relationship:['Parent','Adult child'],publicFact:'Jo is Kit’s parent. Kit has an independent adult life and drawing practice in Ember Mesa; Jo lives and works in Alder Quay.'},
];
export function publicCharacterIdentity(id:string){
 return{age:characterAges[id],family:characterFamilies.filter(f=>f.ids.includes(id)).map(f=>{const index=f.ids.indexOf(id);return{otherId:f.ids[1-index],relationship:f.relationship[index],otherRelationship:f.relationship[1-index],fact:f.publicFact};})};
}
