import {readFileSync} from 'node:fs';
// Test-only reverse mapping: retain the original frozen hashes, and permit exactly
// the reviewed display-name substitutions in newly generated narrative fields.
// Production saves and stored receipts never pass through this helper.
const contract=JSON.parse(readFileSync(new URL('../fixtures/venue-names-v2.json',import.meta.url),'utf8'));
const renames=[...contract.authorizedRenames].sort((a,b)=>b.current.length-a.current.length);
const proseFields=new Set(['name','venueName','description','reason','body','title','outcome','text','narrative','welcome','log']);
export function historicalVenueLabels(serialized){
 function visit(value,key){
  if(Array.isArray(value))return value.map(item=>visit(item,key));
  if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).map(([child,item])=>[child,visit(item,child)]));
  if(typeof value==='string'&&proseFields.has(key))for(const {current,previous}of renames)value=value.replaceAll(current,previous);
  return value;
 }
 return JSON.stringify(visit(JSON.parse(serialized),''));
}
