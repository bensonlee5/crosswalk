/** Local packaging only: no network calls, credentials, migrations or deployments. */
import {readFile,writeFile,mkdir,readdir} from 'node:fs/promises';
import {resolve,relative,join} from 'node:path';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {gzipSync} from 'node:zlib';
const root=resolve(new URL('..',import.meta.url).pathname),out=resolve(process.argv[2]||'../crosswalk-next-artifacts');
if(out===root||out.startsWith(root+'/'))throw Error('Keep release artifacts outside the source checkout');
await mkdir(out,{recursive:true});
const run=(cmd,args,options={})=>{const r=spawnSync(cmd,args,{cwd:root,maxBuffer:128*1024*1024,...options});if(r.status!==0)throw Error(`${cmd} failed: ${r.stderr}`);return r.stdout;};
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const engine=JSON.parse(await readFile(join(root,'supabase/functions/_shared/engine-manifest.json'),'utf8'));
for(const [name,expected] of Object.entries(engine.sha256))for(const directory of ['lib','supabase/functions/_shared/engine'])if(sha(await readFile(join(root,directory,name)))!==expected)throw Error('Engine drift: '+name);
async function walk(dir){const paths=[];for(const e of await readdir(join(root,dir),{withFileTypes:true})){if(e.isDirectory())paths.push(...await walk(join(dir,e.name)));else if(e.isFile())paths.push(join(dir,e.name));}return paths.sort();}
const edgeFiles=[...await walk('supabase/functions/crosswalk-game'),...await walk('supabase/functions/_shared/engine'),'supabase/functions/_shared/engine-manifest.json'].sort();
const contents=new Map(await Promise.all(edgeFiles.map(async name=>[name,await readFile(join(root,name),'utf8')])));
for(const [name,content] of contents)if(name.endsWith('.ts'))for(const match of content.matchAll(/(?:from\s*|import\s*)['"](\.[^'"]+)['"]/g)){
 const target=relative(root,resolve(root,name,'..',match[1]));if(!contents.has(target))throw Error(`Missing relative dependency ${target} from ${name}`);
}
const config=await readFile(join(root,'supabase/config.toml'),'utf8');if(!/\[functions\.crosswalk-game\][\s\S]*verify_jwt\s*=\s*true/.test(config))throw Error('Review function authentication configuration before packaging');
const payload={name:'crosswalk-game',entrypoint_path:'supabase/functions/crosswalk-game/index.ts',verify_jwt:true,files:[...contents].map(([name,content])=>({name,content}))};
await writeFile(join(out,'crosswalk-game.sources.json'),JSON.stringify(payload,null,2)+'\n');
const portraits=JSON.parse(await readFile(join(root,'public/paintings/character-portraits/manifest.json'),'utf8'));
if(portraits.length!==26||new Set(portraits.map(p=>p.id)).size!==26)throw Error('Release waits for all 26 verified individual portraits');
for(const p of portraits)if(sha(await readFile(join(root,'public',p.src)))!==p.sha256)throw Error('Portrait drift: '+p.id);
await readFile(join(root,'public/guide/index.html'));
const decisions=JSON.parse(await readFile(join(root,'public/paintings/decisions/manifest.json'),'utf8'));
if(decisions.length!==6||new Set(decisions.map(p=>p.key)).size!==6)throw Error('Release waits for all6 verified decision paintings');
for(const p of decisions)if(sha(await readFile(join(root,'public',p.publicPath)))!==p.sha256)throw Error('Decision art drift: '+p.key);
run(process.execPath,['scripts/build-edge-bundle.mjs',join(out,'crosswalk-game.bundle.js')]);
const tracked=run('git',['ls-files','-z']).toString().split('\0').filter(Boolean).sort();
if(!tracked.length)throw Error('Stage the reviewed source files before packaging');
if(tracked.some(p=>p.includes('node_modules/')||/(^|\/)\.env(\.|$)/.test(p)&&!p.endsWith('.env.example')))throw Error('Unexpected dependency or environment data in tracked source');
const frontend=await walk('dist');if(!frontend.includes('dist/index.html'))throw Error('Build the configured frontend before packaging');
const packageFiles=async(name,files)=>{const tar=run('tar',['--null','--files-from=-','--sort=name','--mtime=@0','--owner=0','--group=0','--numeric-owner','--format=ustar','-cf','-'],{input:Buffer.from(files.join('\0')+'\0')});const bytes=gzipSync(tar,{level:9});await writeFile(join(out,name),bytes);return {name,sha256:sha(bytes),bytes:bytes.length};};
const artifacts=[];
artifacts.push(await packageFiles('crosswalk-source.tar.gz',tracked));
artifacts.push(await packageFiles('crosswalk-frontend.tar.gz',frontend));
artifacts.push(await packageFiles('crosswalk-server.tar.gz',[...edgeFiles,'supabase/config.toml'].sort()));
const inventory=async files=>Promise.all(files.map(async path=>({path,sha256:sha(await readFile(join(root,path)))})));
const base=run('git',['rev-list','--max-parents=0','HEAD']).toString().trim();
const changed=run('git',['diff','--name-only',base,'--']).toString().trim().split('\n').filter(Boolean).sort();
await writeFile(join(out,'crosswalk-release.patch'),run('git',['diff','--binary',base,'--']));
const report={changed_files:await inventory(changed),upstream_base:'cd37af767a29cea10ae2b759a5614a0ba76018c7',source_commit:run('git',['rev-parse','HEAD']).toString().trim(),branch:run('git',['branch','--show-current']).toString().trim(),artifacts,server_payload:{path:'crosswalk-game.sources.json',sha256:sha(await readFile(join(out,'crosswalk-game.sources.json'))),files:edgeFiles.length,project_id:'Supply the independently verified target at approved deployment time'},server_bundle:{path:'crosswalk-game.bundle.js',sha256:sha(await readFile(join(out,'crosswalk-game.bundle.js')))},engine_sha256:engine.sha256,source_files:await inventory(tracked),frontend_files:await inventory(frontend),server_files:await inventory([...edgeFiles,'supabase/config.toml'].sort())};
await writeFile(join(out,'release-manifest.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({out,source_commit:report.source_commit,artifacts,server_payload:report.server_payload},null,2));
