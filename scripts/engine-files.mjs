import {readFile,readdir} from 'node:fs/promises';
import {resolve,dirname,relative} from 'node:path';
const root=resolve(new URL('../',import.meta.url).pathname);
/** The service imports define the engine boundary; imports in lib define its closure. */
export async function engineFiles(source=resolve(root,'lib')){
 const service=resolve(root,'supabase/functions/crosswalk-game'),pending=[];
 for(const entry of await readdir(service,{withFileTypes:true})){
  if(!entry.isFile()||!entry.name.endsWith('.ts'))continue;
  const text=await readFile(resolve(service,entry.name),'utf8');
  for(const match of text.matchAll(/(?:from\s*|import\s*\()\s*['"]\.\.\/_shared\/engine\/([^'"]+)['"]/g))pending.push(match[1]);
 }
 if(!pending.length)throw Error('The game service has no engine imports');
 const files=new Set();
 while(pending.length){const name=pending.pop();if(files.has(name))continue;if(!name.endsWith('.ts')||name.startsWith('..')||name.startsWith('/'))throw Error(`Unsupported engine import: ${name}`);files.add(name);
  const text=await readFile(resolve(source,name),'utf8');
  for(const match of text.matchAll(/(?:from\s*|import\s*\()\s*['"](\.[^'"]+\.ts)['"]/g))pending.push(relative(source,resolve(dirname(resolve(source,name)),match[1])));
 }
 return [...files].sort();
}
