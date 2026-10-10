/** Bundle local authoritative code; the official pinned SDK remains a Deno npm import. */
import {build} from 'esbuild';
import {mkdir,writeFile} from 'node:fs/promises';
import {resolve,dirname} from 'node:path';
import {createHash} from 'node:crypto';
const output=resolve(process.argv[2]||'../crosswalk-next-artifacts/crosswalk-game.bundle.js');
await mkdir(dirname(output),{recursive:true});
const result=await build({entryPoints:['supabase/functions/crosswalk-game/index.ts'],bundle:true,write:false,format:'esm',platform:'neutral',target:'es2022',legalComments:'none',minify:false,alias:{'@supabase/supabase-js':'npm:@supabase/supabase-js@2.117.3'},external:['npm:@supabase/supabase-js@2.117.3']});
const bytes=result.outputFiles[0].contents;await writeFile(output,bytes);
console.log(JSON.stringify({path:output,bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex')}));
