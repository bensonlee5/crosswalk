import {createHash} from 'node:crypto';
import {readFile,readdir} from 'node:fs/promises';
import {resolve} from 'node:path';
import {engineFiles} from './engine-files.mjs';
const root=new URL('../',import.meta.url),manifest=JSON.parse(await readFile(new URL('supabase/functions/_shared/engine-manifest.json',root),'utf8')),source=resolve(process.argv[2]||new URL('lib/',root).pathname),names=await engineFiles(source),destination=new URL('supabase/functions/_shared/engine/',root);
const same=(a,b)=>JSON.stringify([...a].sort())===JSON.stringify([...b].sort());
if(!same(names,Object.keys(manifest.sha256)))throw Error('Engine manifest does not match the service dependency graph');
const copies=(await readdir(destination,{withFileTypes:true})).filter(e=>e.isFile()).map(e=>e.name);
if(!same(names,copies))throw Error('Engine mirror has missing or orphan files');
for(const name of names){const hash=manifest.sha256[name],actual=createHash('sha256').update(await readFile(resolve(source,name))).digest('hex'),server=createHash('sha256').update(await readFile(new URL(name,destination))).digest('hex');if(actual!==hash||server!==hash)throw Error(`Engine copy drift: ${name}. Review both client and server before deployment.`);}
console.log(`All ${names.length} client/server engine files match the exact current dependency graph.`);
