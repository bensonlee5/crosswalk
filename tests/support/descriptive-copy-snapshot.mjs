import {readFileSync} from 'node:fs';
// Test-only, exact reviewed prose substitutions. Original frozen hashes stay intact.
// This never runs on production saves or receipts, and never rewrites IDs or flags.
const contract=JSON.parse(readFileSync(new URL('../fixtures/descriptive-copy-replacements.json',import.meta.url),'utf8'));
const substitutions=[...contract.substitutions].sort((a,b)=>b.current.length-a.current.length);
const proseFields=new Set(['description','venueDescription','residentCircumstance','body','title','outcome','text','narrative','welcome','log']);
export function historicalDescriptiveCopy(serialized){
 function visit(value,key){
  if(Array.isArray(value))return value.map(item=>visit(item,key));
  if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).map(([child,item])=>[child,visit(item,child)]));
  if(typeof value==='string'&&proseFields.has(key))for(const {current,previous}of substitutions)value=value.replaceAll(current,previous);
  return value;
 }
 return JSON.stringify(visit(JSON.parse(serialized),''));
}
