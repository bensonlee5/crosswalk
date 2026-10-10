import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import {transform} from 'esbuild';
export async function bundledHandler(path,{rpc,users,tokens,origin}) {
 const source=await readFile(path,'utf8');
 const {code}=await transform(source,{format:'cjs',target:'es2022'});
 let handler;
 const createClient=()=>({rpc,auth:{getUser:async token=>{const i=tokens.indexOf(token);return {data:{user:i<0?null:{id:users[i],role:'authenticated',is_anonymous:true}},error:null};}}});
 const env={SUPABASE_URL:'https://test.invalid',SUPABASE_ANON_KEY:'test-only',SUPABASE_SERVICE_ROLE_KEY:'test-only',CROSSWALK_ALLOWED_ORIGINS:origin};
 vm.runInNewContext(code,{require:id=>{if(id!=='npm:@supabase/supabase-js@2.117.3')throw Error('Unexpected bundle dependency '+id);return{createClient}},Deno:{env:{get:key=>env[key]},serve:fn=>{handler=fn}},Request,Response,Headers,URL,crypto,TextEncoder,TextDecoder,console,setTimeout,clearTimeout,structuredClone},{filename:path});
 if(!handler)throw Error('Bundle did not register the actual Edge entrypoint');
 return handler;
}
