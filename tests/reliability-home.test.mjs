import {createD1Double} from './d1-double.mjs';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createRequire} from 'node:module';
import {fileURLToPath,pathToFileURL} from 'node:url';
const root=process.env.CROSSWALK_TEST_ROOT||fileURLToPath(new URL('../',import.meta.url)).replace(/\/$/,'');
const require=createRequire(root+'/package.json');
const ts=require('typescript');
const rows=new Map();
const {db}=createD1Double(rows);
globalThis.crosswalkPlaytestDb=db;
const apiSource=fs.readFileSync(root+'/app/api/game/route.ts','utf8').replace("import {db} from '@/lib/db';",'const db=()=>globalThis.crosswalkPlaytestDb;').replaceAll("'@/lib/game'",JSON.stringify(pathToFileURL(root+'/lib/game.ts').href)).replaceAll("'@/lib/life-events'",JSON.stringify(pathToFileURL(root+'/lib/life-events.ts').href)).replaceAll("'@/lib/world-life'",JSON.stringify(pathToFileURL(root+'/lib/world-life.ts').href)).replace(/(['\"])@\/([^'\"]+)\1/g,(_,quote,name)=>quote+pathToFileURL(root+'/'+name+'.ts').href+quote);
const apiJs=ts.transpileModule(apiSource,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ESNext}}).outputText;
const api=await import('data:text/javascript;base64,'+Buffer.from(apiJs).toString('base64'));
const pageJs=ts.transpileModule(fs.readFileSync(root+'/app/page.tsx','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ESNext,jsx:ts.JsxEmit.ReactJSX}}).outputText;
function storage(start={}){const m=new Map(Object.entries(start));return{get length(){return m.size;},key:i=>[...m.keys()][i]??null,getItem:k=>m.get(k)||null,setItem:(k,v)=>m.set(k,v),removeItem:k=>m.delete(k)};}
function harness({cookie='',saved='',query='',local=null,legacyRules=true,storageBlocked=false,initialGame=null,initialRules=false,initialReview=false}={}){
 const slots=[],deps=[],cleanups=[];let cursor=0,effects=[],tree,dirty=false,now=1000,id=0;const timeouts=new Map(),intervals=new Map();
 const calls=[],sounds=[];const record={cookie,holdPost:null,holdGet:null,held:null,pending:new Set(),failPost:null,failGet:false,unauthorized:false,identityListener:null};
 const react={useState(initial){const i=cursor++;if(!(i in slots))slots[i]=initialGame&&i===0?initialGame:initialGame&&i===1?'game':i===10&&initialRules?true:i===15&&initialReview?true:typeof initial==='function'?initial():initial;return[slots[i],v=>{const n=typeof v==='function'?v(slots[i]):v;if(n!==slots[i]){slots[i]=n;dirty=true;}}];},useRef(initial){const i=cursor++;return slots[i]??(slots[i]={current:initial});},useEffect(fn,next){const i=cursor++;if(!deps[i]||next.some((v,j)=>!Object.is(v,deps[i][j]))){deps[i]=next;effects.push(()=>{cleanups[i]?.();cleanups[i]=fn();});}}};
 const locals=storageBlocked?new Proxy({},{get(){throw Error('Storage blocked')}}):local||storage(saved?{cw_room:saved}:{}),sessions=storage();
 const window={scrollTo(){},addEventListener(){},removeEventListener(){}};
 const document={visibilityState:'visible',addEventListener(){},removeEventListener(){}};
 // The transport/auth seam simulates the new UID contract. Existing campaign cases explicitly model older-rule rooms.
 // Their create transport strips only new-room opt-ins; the original Home request remains recorded and persisted.
 // The dedicated legacyRules:false case below exercises the actual current new-room request unchanged.
 const owner=()=>record.cookie?'guest-'+record.cookie.slice(-16):null;
 async function getOwnerSession(){if(!record.cookie)record.cookie='cw_guest='+Array.from(crypto.getRandomValues(new Uint8Array(32))).map(x=>x.toString(16).padStart(2,'0')).join('');return owner();}
 function fetcher(url,opts={}){const held=opts.method==='POST'?record.holdPost:record.holdGet;const task=(async()=>{calls.push({url,opts});
  if(record.refreshRequired&&((opts.method==='POST')||!url.includes('history=1')))return Response.json({error:'Open the latest Crosswalk page. Your saved seat is unchanged.',refreshRequired:true},{status:409});
  if(opts.method==='POST'&&record.unauthorized)return Response.json({error:'Sign in again to recover this saved request.'},{status:401});
  if((opts.method==='POST'&&record.failPost==='before')||(opts.method!=='POST'&&record.failGet))throw new TypeError('Connection interrupted');
  let response;
  if(url.startsWith('/api/game?history=1')){
   const key=record.cookie?Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(record.cookie.split('=')[1])))).map(x=>x.toString(16).padStart(2,'0')).join(''):'';
   const rooms=[...rows.values()].map(row=>({...JSON.parse(row.state),version:row.version})).filter(g=>g.members[key]).map(g=>({code:g.code,mode:g.mode,status:g.status,round:g.round,maxRounds:g.maxRounds,version:g.version,updatedAt:now,names:g.players.filter(p=>g.members[key].includes(p.id)).map(p=>p.name)})).reverse();
   const cursor=new URL(url,'https://test.invalid').searchParams.get('cursor');const offset=cursor?Number(cursor):0;const page=rooms.slice(offset,offset+20);response=Response.json({rooms:page,nextCursor:offset+20<rooms.length?String(offset+20):null});
  }else if(opts.method==='POST'&&JSON.parse(opts.body).ownerSession&&JSON.parse(opts.body).ownerSession!==owner())response=Response.json({error:'The saved seat belongs to a different session.',identityMismatch:true},{status:403});
  else{let apiOpts=opts;if(legacyRules&&opts.method==='POST'){const body=JSON.parse(opts.body);if(body.op==='create'){delete body.careerMode;delete body.actionIncidents;apiOpts={...opts,body:JSON.stringify(body)};}}const req=new Request('https://test.invalid'+url,{...apiOpts,headers:{...opts.headers,Origin:'https://test.invalid',...(record.cookie?{Cookie:record.cookie}:{})}});response=await api[opts.method==='POST'?'POST':'GET'](req);}
  const c=response.headers.get('set-cookie');if(c)record.cookie=c.split(';')[0];
  if(opts.method==='POST'&&record.failPost==='after')throw new TypeError('Saved response was lost');
  if(opts.method!=='POST'&&record.malformedGet&&!url.includes('history=1'))response=Response.json({});
  if(opts.method==='POST'&&record.malformedPost){const snapshot=await response.json();delete snapshot.players;response=Response.json(snapshot);}
  if(held){record.held={response};await held;}return response;
 })();if(!held){record.pending.add(task);task.then(()=>record.pending.delete(task),()=>record.pending.delete(task));}return task;}


 const exports={};const mod={exports};
 vm.runInNewContext(pageJs,{exports,module:mod,require:id=>id==='react'?react:id==='@/lib/game-api'?{gameFetch:fetcher,getOwnerSession,subscribeOwnerSession:listener=>{record.identityListener=listener;listener(owner());return()=>{record.identityListener=null;};}}:id==='@/lib/asset-url'?{assetUrl:path=>path}:id==='./life-story'?{LifeEnding:'LifeEnding'}:id==='./sound-controls'?{useGameSound:()=>({unlock:async()=>true,play:s=>sounds.push(s),capture:()=>0,stopEffects:()=>{}}),SoundSettings:'SoundSettings'}:id.startsWith('@/lib/')?require(root+'/'+id.slice(2)+'.ts'):id==='react/jsx-runtime'?require(id):id.startsWith('./')?{default:id.slice(2).replace(/(^|-)(.)/g,(_,a,b)=>b.toUpperCase())}:new Proxy({},{get:(_,p)=>String(p)}),fetch:fetcher,localStorage:locals,sessionStorage:sessions,window,document,location:{search:query,pathname:'/',origin:'https://test.invalid'},history:{replaceState(){}},requestAnimationFrame:fn=>fn(),setTimeout:(fn,delay=0)=>{const key=++id;timeouts.set(key,{fn,at:now+delay});return key;},clearTimeout:key=>timeouts.delete(key),setInterval:fn=>{const key=++id;intervals.set(key,fn);return key;},clearInterval:key=>intervals.delete(key),Date:{now:()=>now},URLSearchParams,Intl,crypto,AbortController,TypeError,console});
 function render(){for(let n=0;n<15;n++){dirty=false;cursor=0;effects=[];tree=mod.exports.default();effects.splice(0).forEach(f=>f());if(!dirty)return tree;}throw Error('render loop');}
 async function settle(){await Promise.allSettled([...record.pending]);for(let n=0;n<10;n++){await new Promise(r=>setImmediate(r));if(dirty)render();}return tree;}
 function tick(ms=500){now+=ms;for(const [key,t]of timeouts)if(t.at<=now){timeouts.delete(key);t.fn();}if(dirty)render();}
 function walk(node,predicate,out=[]){if(!node||typeof node!=='object')return out;if(Array.isArray(node)){node.forEach(n=>walk(n,predicate,out));return out;}if(predicate(node))out.push(node);if(['Dialog','AlertDialog','WeeklyNews'].includes(node.type)&&node.props.open===false)return out;walk(node.props?.children,predicate,out);return out;}
 const find=predicate=>walk(tree,predicate);
 const text=n=>!n?'':Array.isArray(n)?n.map(text).join(''):typeof n==='string'||typeof n==='number'?String(n):text(n.props?.children);
 const button=label=>{const b=find(n=>n.type==='button'&&text(n)===label)[0];assert.ok(b,'button '+label);return b;};
 const component=name=>find(n=>n.type===name)[0];
 async function click(label){const b=button(label);assert.ok(!b.props.disabled,'enabled '+label);await b.props.onClick();await settle();tick();await settle();}
 render();return{render,settle,tick,find,text,button,component,click,calls,sounds,record,locals,sessions,poll(){for(const fn of intervals.values())fn();},dispose(){cleanups.forEach(f=>f?.());},hold(method='POST'){let release;const key=method==='POST'?'holdPost':'holdGet';record[key]=new Promise(r=>release=r);record.held=null;return()=>{release();record[key]=null;};}};
}
const results=[];
for(const count of [1,2,3,4]){
 const h=harness();h.find(n=>n.props?.['aria-label']==='Number of players')[0].props.onValueChange(String(count));h.render();
 await h.click(count===1?'Start a solo life':'Start our game');let s=h.component('GameScreen');assert.equal(s.props.g.players.length,count);assert.equal(h.component('WeeklyNews').props.open,true);h.component('WeeklyNews').props.onClose();h.render();
 const code=s.props.g.code;const order=[],allNames=s.props.g.players.map(p=>p.name);let totalActions=0;
 // Use each actual Home callback, real route handler, in-memory D1 CAS and real engine.
 while((s=h.component('GameScreen'))){
  if(h.component('WeeklyNews')?.props.open){h.component('WeeklyNews').props.onClose();h.render();s=h.component('GameScreen');}
  const ready=h.find(n=>n.type==='button'&&h.text(n)==='I’m ready')[0];if(ready){await h.click('I’m ready');s=h.component('GameScreen');}
  const g=s.props.g;order.push(`${g.round}:${g.players[g.turn].name}`);
  await s.props.onVisit('WORK');await h.settle();h.tick();s=h.component('GameScreen');const p=s.props.g.players[s.props.g.turn];assert.equal(p.hours,6,'free travel retains hours');
  for(let i=0;i<3;i++){if(i===2){await h.component('GameScreen').props.onVisit('THE PARK');await h.settle();h.tick();}await h.component('GameScreen').props.onAction(i===2?'rest':'work_short');await h.settle();h.tick();totalActions++;}
  s=h.component('GameScreen');assert.equal(s.props.g.players[s.props.g.turn].hours,3);s.props.onEnd();h.render();await h.click('Pay bills & end month');
 }
 assert.equal(order.length,count*8);for(let w=1;w<=8;w++){const offset=(w-1)%count;assert.deepEqual(order.slice((w-1)*count,w*count).map(x=>x.split(':')[1]),Array.from({length:count},(_,j)=>allNames[(offset+j)%count]));}
 assert.ok(h.find(n=>n.props?.className==='results'||n.type==='LifeEnding').length);assert.equal(h.calls.filter(c=>c.opts.method==='POST'&&JSON.parse(c.opts.body).action==='end').length,8*count);
 const saved=JSON.parse(rows.get(code).state);assert.equal(saved.status,'finished');const reload=harness({cookie:h.record.cookie,saved:code,query:'?room='+code});await reload.settle();assert.ok(reload.find(n=>n.props?.className==='results'||n.type==='LifeEnding').length,'finished reload shows results');
 results.push({case:'full '+count+'-seat hotseat campaign',turns:order.length,actions:totalActions,finishReload:true,order});h.dispose();reload.dispose();
}
// Free exploration to all destinations, repeat, zero-time backend protection and clock cues.
{
 const h=harness();h.find(n=>n.props?.['aria-label']==='Number of players')[0].props.onValueChange('1');h.render();await h.click('Start a solo life');h.component('WeeklyNews').props.onClose();h.render();
 const {actions}=require(root+'/lib/game.ts');
 // This travel test covers every known venue; discovery gates are exercised separately.
 const roomCode=h.component('GameScreen').props.g.code,explored=JSON.parse(rows.get(roomCode).state);explored.players[0].world.discoveredPlacesByRegion.alder=[...new Set(actions.map(a=>a.place))];rows.get(roomCode).state=JSON.stringify(explored);h.poll();await h.settle();h.tick();
 for(const place of new Set(actions.map(a=>a.place))){await h.component('GameScreen').props.onVisit(place);await h.settle();h.tick();assert.equal(h.component('GameScreen').props.g.players[0].place,place,'known venue visit succeeds');assert.equal(h.component('GameScreen').props.g.players[0].hours,6);}
 await h.component('GameScreen').props.onVisit('WORK');await h.settle();h.tick();const one=h.component('GameScreen').props.onAction('work_short');const rapid=h.component('GameScreen').props.onAction('work_short');await Promise.all([one,rapid]);await h.settle();h.tick();assert.equal(h.component('GameScreen').props.g.players[0].hours,5,'rapid duplicate prevented');
 for(let i=0;i<4;i++){await h.component('GameScreen').props.onAction('work_short');await h.settle();h.tick();}
 const capped=structuredClone(h.component('GameScreen').props.g);assert.equal(capped.players[0].hours,1);assert.equal(capped.players[0].economyWork.paidHours,200);await h.component('GameScreen').props.onAction('work_short');await h.settle();h.tick();assert.deepEqual(h.component('GameScreen').props.g,capped,'monthly paid-hour cap blocks sixth short shift without mutation');await h.component('GameScreen').props.onVisit('THE PARK');await h.settle();h.tick();await h.component('GameScreen').props.onAction('rest');await h.settle();h.tick();
 const before=structuredClone(h.component('GameScreen').props.g);assert.equal(before.players[0].hours,0);assert.ok(h.sounds.includes('tick'));assert.equal(h.sounds.at(-1),'footsteps','clock does not cover the last-block walking recording');
 await h.component('GameScreen').props.onAction('rest');await h.settle();h.tick();assert.deepEqual(h.component('GameScreen').props.g,before);assert.ok(h.find(n=>n.props?.role==='alert').length);
 results.push({case:'all 15 destinations, free travel, repeat and zero time',passed:true});h.dispose();
}
// Restore and mutation must be mutually exclusive, even with directly repeated handlers.
async function waitUntilHeld(h){for(let n=0;!h.record.held&&n<100;n++)await new Promise(r=>setTimeout(r,1));assert.ok(h.record.held,'response is deliberately delayed');}
for(const route of ['create','join']){
 const h=harness();await h.click('Start our game');const original=h.component('GameScreen').props.g.code;await h.component('GameScreen').props.onHome();h.render();
 if(route==='join'){await h.click('Have a room code? Join friends');h.find(n=>n.type==='input'&&n.props.placeholder==='ABC234')[0].props.onChange({target:{value:original}});h.render();}
 const release=h.hold();const starting=h.button(route==='create'?'Start our game':'Join the room').props.onClick();await h.settle();await waitUntilHeld(h);
 const resume=h.button(route==='create'?'Resume my last game':'Resume on this browser');assert.equal(resume.props.disabled,true,'resume is visibly disabled during mutation');
 const calls=h.calls.length;await resume.props.onClick();await h.settle();assert.equal(h.calls.length,calls,'direct resume callback does not race the pending mutation');
 release();await starting;await h.settle();h.tick(60000);await h.settle();
 const screen=h.component('GameScreen');assert.equal(screen.props.busy,false,'mutation releases Saving after completion');assert.equal(screen.props.g.code===original,route==='join');
 const before=h.calls.length;await screen.props.onAction('home_reset');await h.settle();h.tick();assert.equal(h.calls.length,before+1,'later activity reaches the API');assert.equal(h.component('GameScreen').props.g.players[0].hours,5);
 results.push({case:'pending '+route+' excludes resume',passed:true,busyAfterCompletion:false,subsequentActionSaved:true});h.dispose();
}
{
 const h=harness();await h.click('Start our game');const saved=h.component('GameScreen').props.g.code;h.component('GameScreen').props.onHome();h.render();
 const release=h.hold('GET');const restoring=h.button('Resume my last game').props.onClick();h.render();await waitUntilHeld(h);
 assert.equal(h.button('Start our game').props.disabled,true);let calls=h.calls.length;await h.button('Start our game').props.onClick();assert.equal(h.calls.length,calls,'create cannot overtake restore');
 await h.click('Have a room code? Join friends');assert.equal(h.button('Join the room').props.disabled,true);assert.equal(h.button('Resume on this browser').props.disabled,true);calls=h.calls.length;await h.button('Join the room').props.onClick();await h.button('Resume on this browser').props.onClick();assert.equal(h.calls.length,calls,'join and a second restore cannot overtake restore');
 release();await restoring;await h.settle();assert.equal(h.component('GameScreen').props.g.code,saved);assert.equal(h.component('GameScreen').props.busy,false);await h.component('GameScreen').props.onAction('home_reset');await h.settle();h.tick();assert.equal(h.component('GameScreen').props.g.players[0].hours,5);
 results.push({case:'pending restore excludes create, join and duplicate restore',passed:true});h.dispose();
}
for(const staleFailure of [false,true]){
 const h=harness();await h.click('Start our game');h.component('GameScreen').props.onHome();h.render();
 if(staleFailure){await h.click('Have a room code? Join friends');h.find(n=>n.type==='input'&&n.props.placeholder==='ABC234')[0].props.onChange({target:{value:'BAD123'}});h.render();}
 const releaseRestore=h.hold('GET');const restoring=h.button(staleFailure?'Resume on this browser':'Resume my last game').props.onClick();h.render();await waitUntilHeld(h);
 h.find(n=>n.props?.['aria-label']==='Crosswalk home')[0].props.onClick();h.render();
 const releaseCreate=h.hold();const starting=h.button('Start our game').props.onClick();await waitUntilHeld(h);
 releaseRestore();await restoring;await h.settle();assert.equal(h.component('GameScreen'),undefined,'cancelled restore cannot reopen the old game');assert.equal(h.find(n=>n.props?.role==='alert').length,0,'cancelled restore error is ignored');
 assert.equal(h.button('Setting the table…').props.disabled,true);const calls=h.calls.length;await h.button('Resume my last game').props.onClick();assert.equal(h.calls.length,calls,'late restore cleanup cannot unlock newer create');
 releaseCreate();await starting;await h.settle();h.tick();assert.equal(h.component('GameScreen').props.busy,false);
 results.push({case:'cancelled restore '+(staleFailure?'failure':'success')+' does not overwrite or unlock newer create',passed:true});h.dispose();
}
{
 const h=harness({saved:'BAD123'});await h.click('Resume my last game');assert.ok(h.find(n=>n.props?.role==='alert').length);assert.equal(h.button('Start our game').props.disabled,false);await h.click('Start our game');assert.ok(h.component('GameScreen'));assert.equal(h.component('GameScreen').props.busy,false);
 results.push({case:'failed restore releases transition lock for retry/create',passed:true});h.dispose();
}
{
 const h=harness();await h.click('Start our game');const before=h.component('GameScreen').props.g;const releasePoll=h.hold('GET');h.poll();await waitUntilHeld(h);
 await h.component('GameScreen').props.onAction('home_reset');await h.settle();h.tick();const saved=h.component('GameScreen').props.g;assert.equal(saved.version,before.version+1);assert.equal(saved.players[0].hours,5);
 releasePoll();await h.settle();assert.deepEqual(h.component('GameScreen').props.g,saved,'older poll snapshot cannot roll back acknowledged activity');assert.equal(h.component('GameScreen').props.busy,false);
 results.push({case:'stale lower-version poll cannot roll back newer action',passed:true});h.dispose();
}
// Save recovery UI: interruption before/after commit, reload, and multiple saved seats.
for(const interruption of ['before','after']){
 const h=harness();h.find(n=>n.props?.['aria-label']==='Number of players')[0].props.onValueChange('1');h.render();await h.click('Start a solo life');
 const code=h.component('GameScreen').props.g.code;
 h.record.failPost=interruption;
 await h.component('GameScreen').props.onAction('home_reset');await h.settle();h.tick();h.render();
 assert.equal(h.component('GameScreen').props.g.players[0].hours,6,'an uncertain action is never optimistically committed');
 assert.equal(h.component('GameScreen').props.busy,true,'unconfirmed action pauses controls');
 assert.deepEqual(h.sounds,['start'],'uncertain save does not emit action or error effects');
 const original=h.calls.filter(c=>c.opts.method==='POST').at(-1).opts.body;
 assert.equal(h.locals.length,2,'room pointer plus exact pending request are persisted');
 const callCount=h.calls.length;await h.component('GameScreen').props.onAction('home_reset');h.poll();await h.settle();assert.equal(h.calls.length,callCount,'new actions and polls do not overtake unresolved intent');
 h.dispose();
 const reload=harness({cookie:h.record.cookie,local:h.locals,query:'?room='+code});await reload.settle();reload.tick();await reload.settle();
 assert.equal(reload.component('GameScreen').props.g.players[0].hours,5,'reloading checks/applies original move exactly once');
 assert.equal(reload.component('GameScreen').props.g.version,1);
 assert.deepEqual(JSON.parse(reload.calls.find(c=>c.opts.method==='POST').opts.body),JSON.parse(original),'same owner, request ID and version survive reload');
 assert.equal(reload.locals.length,1,'only confirmed intent is removed');
 assert.deepEqual(reload.sounds,[],'recovered actions never replay sound');
 assert.equal(reload.component('GameScreen').props.busy,false);
 results.push({case:'POST lost '+interruption+' commit resumes exact request after reload',passed:true});reload.dispose();
}
{
 const h=harness();await h.click('Start our game');const code=h.component('GameScreen').props.g.code;
 h.record.failPost='before';await h.component('GameScreen').props.onAction('home_reset');await h.settle();h.tick();
 const request={op:'move',code,version:0,requestId:'other-tab-won',action:'home_reset'};
 const other=await api.POST(new Request('https://test.invalid/api/game',{method:'POST',headers:{Cookie:h.record.cookie,Origin:'https://test.invalid','Content-Type':'application/json'},body:JSON.stringify(request)}));assert.equal(other.status,200);
 h.record.failPost=null;await h.click('Check saved action');
 assert.equal(h.component('GameScreen').props.g.version,1);assert.equal(h.component('GameScreen').props.g.players[0].hours,5,'stale pending action does not spend a second block');
 assert.equal(h.component('GameScreen').props.busy,false);assert.equal(h.locals.length,1);assert.ok(h.text(h.find(n=>n.props?.role==='alert')[0]).includes('room changed'));
 results.push({case:'stale pending version is rejected and current server state restored',passed:true});h.dispose();
}
{
 const h=harness({storageBlocked:true});await h.click('Start our game');const code=h.component('GameScreen').props.g.code;
 h.record.failPost='after';await h.component('GameScreen').props.onAction('home_reset');await h.settle();h.tick();h.record.failPost=null;await h.click('Check saved action');assert.equal(h.component('GameScreen').props.g.players[0].hours,5);
 const reload=harness({cookie:h.record.cookie,storageBlocked:true,query:'?room='+code});await reload.settle();assert.equal(reload.component('GameScreen').props.g.players[0].hours,5);
 results.push({case:'blocked local storage keeps in-tab recovery and server resume available',passed:true});h.dispose();reload.dispose();
}
{
 const h=harness();await h.click('Start our game');const first=h.component('GameScreen').props.g.code;h.component('GameScreen').props.onHome();h.render();await h.settle();await h.click('Start our game');const second=h.component('GameScreen').props.g.code;assert.notEqual(first,second);h.dispose();
 const reopen=harness({cookie:h.record.cookie});await reopen.settle();const saved=reopen.find(n=>n.props?.className==='saved-room');assert.equal(saved.length,2,'history is recovered from owner, without local room pointer');
 const original=saved.find(n=>reopen.text(n).includes(first));assert.ok(original);await original.props.onClick();await reopen.settle();assert.equal(reopen.component('GameScreen').props.g.code,first);
 const stranger=harness();await stranger.settle();assert.equal(stranger.find(n=>n.props?.className==='saved-room').length,0);
 results.push({case:'multiple rooms survive reopening without local history and remain private',passed:true});reopen.dispose();stranger.dispose();
}
{
 const h=harness();await h.click('Start our game');const code=h.component('GameScreen').props.g.code,originalCookie=h.record.cookie;
 h.record.failPost='before';await h.component('GameScreen').props.onAction('home_reset');await h.settle();h.tick();
 h.record.failPost=null;h.record.cookie='cw_guest'+'='+'b'.repeat(64);await h.click('Check saved action');
 assert.equal(h.locals.length,2,'wrong owner does not discard the pending request');
 h.find(n=>n.props?.['aria-label']==='Crosswalk home')[0].props.onClick();h.render();await h.settle();
 const account=h.find(n=>n.type==='default'&&n.props?.disabled!==undefined)[0];assert.equal(account.props.disabled,false,'sign-in remains available to recover original identity');
 await h.click('Check later');assert.equal(h.button('Start our game').props.disabled,false);
 const reopened=harness({cookie:h.record.cookie,local:h.locals});await reopened.settle();assert.equal(reopened.calls.filter(c=>c.opts.method==='POST').length,0,'deferred actions never auto-replay');
 assert.ok(reopened.button('Check '+code+' action'));
 reopened.record.cookie=originalCookie;await reopened.click('Check '+code+' action');assert.equal(reopened.component('GameScreen').props.g.players[0].hours,5);assert.equal(reopened.component('GameScreen').props.g.version,1);assert.equal(reopened.locals.length,1);
 results.push({case:'wrong identity retains intent, allows sign-in, and deferred recovery requires a click',passed:true});h.dispose();reopened.dispose();
}
{
 const h=harness();const codes=[];
 for(let i=0;i<22;i++){await h.click('Start our game');codes.push(h.component('GameScreen').props.g.code);h.component('GameScreen').props.onHome();h.render();await h.settle();}
 assert.equal(h.find(n=>n.props?.className==='saved-room').length,20);
 await h.click('Load older saved games');const all=h.find(n=>n.props?.className==='saved-room');assert.equal(all.length,22);assert.ok(all.some(n=>h.text(n).includes(codes[0])),'oldest room remains discoverable beyond page one');
 assert.equal(h.find(n=>n.type==='button'&&h.text(n)==='Load older saved games').length,0);
 results.push({case:'paginated history keeps older saved rooms reachable',passed:true});h.dispose();
}
{
 const h=harness();await h.click('Start our game');h.record.failPost='after';await h.component('GameScreen').props.onAction('home_reset');await h.settle();h.tick();
 const original=JSON.parse(h.calls.filter(c=>c.opts.method==='POST').at(-1).opts.body);
 h.record.failPost=null;h.record.unauthorized=true;await h.click('Check saved action');assert.equal(h.locals.length,2,'401 retains original request after lost committed response');
 h.find(n=>n.props?.['aria-label']==='Crosswalk home')[0].props.onClick();h.render();await h.settle();assert.equal(h.find(n=>n.type==='default'&&n.props?.disabled!==undefined)[0].props.disabled,false,'401 unlocks account recovery');
 h.record.unauthorized=false;await h.click('Check saved action');const retried=JSON.parse(h.calls.filter(c=>c.opts.method==='POST').at(-1).opts.body);assert.equal(retried.requestId,original.requestId);assert.equal(retried.ownerSession,original.ownerSession);assert.equal(retried.version,original.version);assert.equal(h.component('GameScreen').props.g.players[0].hours,5);assert.equal(h.component('GameScreen').props.g.version,1);assert.equal(h.locals.length,1);
 results.push({case:'401 preserves committed-but-unacknowledged request for same-identity replay',passed:true});h.dispose();
}
for(const finished of [false,true]){
 const h=harness();await h.click('Start our game');const code=h.component('GameScreen').props.g.code;
 if(finished){const row=rows.get(code),saved=JSON.parse(row.state);saved.status='finished';row.state=JSON.stringify(saved);row.version++;h.poll();await h.settle();assert.ok(h.component('LifeEnding'));}
 const oldCookie=h.record.cookie;
 h.record.cookie='cw_guest='+'c'.repeat(64);h.record.identityListener('guest-'+h.record.cookie.slice(-16));h.render();await h.settle();
 assert.equal(h.component('GameScreen'),undefined);assert.equal(h.component('LifeEnding'),undefined);assert.equal(h.find(n=>n.props?.className==='saved-room').length,0);assert.equal(h.find(n=>n.type==='button'&&h.text(n)==='Resume my last game').length,0);
 assert.notEqual(h.record.cookie,oldCookie);
 results.push({case:'cross-tab identity change clears '+(finished?'ending':'playing')+' view and previous-owner history',passed:true});h.dispose();
}
{
 const h=harness();await h.click('Start our game');const release=h.hold();const moving=h.component('GameScreen').props.onAction('home_reset');await waitUntilHeld(h);
 h.record.cookie='cw_guest='+'d'.repeat(64);h.record.identityListener('guest-'+h.record.cookie.slice(-16));h.render();await h.settle();release();await moving;await h.settle();h.tick();
 assert.equal(h.component('GameScreen'),undefined,'late previous-owner response cannot reopen game');assert.equal(h.find(n=>n.props?.className==='saved-room').length,0,'late previous-owner response cannot repopulate history');
 assert.deepEqual(h.sounds,['start'],'late other-owner response is silent');
 results.push({case:'identity transition invalidates in-flight previous-owner save response',passed:true});h.dispose();
}
{
 const h=harness();await h.click('Start our game');const release=h.hold();const moving=h.component('GameScreen').props.onAction('home_reset');await waitUntilHeld(h);
 h.record.cookie='';h.record.identityListener(null);h.render();await h.settle();release();await moving;await h.settle();h.tick();
 assert.equal(h.component('GameScreen'),undefined,'late signed-out response cannot reopen game');assert.equal(h.find(n=>n.props?.className==='saved-room').length,0,'late signed-out response cannot reveal previous history');
 assert.deepEqual(h.sounds,['start'],'late signed-out response is silent');
 results.push({case:'signout invalidates in-flight previous-owner save response',passed:true});h.dispose();
}
{
 const h=harness();await h.click('Start our game');const old=h.component('GameScreen');old.props.onHome();h.render();await h.settle();h.tick();await h.click('Start our game');const next=h.component('GameScreen').props.g;
 assert.notEqual(next.code,old.props.g.code);const calls=h.calls.length;await old.props.onAction('home_reset');await h.settle();h.tick();
 assert.equal(h.calls.length,calls,'an old room handler cannot submit an action in the new room');assert.equal(h.component('GameScreen').props.g.players[0].hours,6);
 results.push({case:'stale room callback cannot spend the new room’s time',passed:true});h.dispose();
}
{
 const h=harness();await h.click('Start our game');const old=h.component('GameScreen');await old.props.onAction('home_reset');await h.settle();h.tick();const calls=h.calls.length;
 await old.props.onAction('home_reset');await h.settle();h.tick();assert.equal(h.calls.length,calls,'a repeated old callback cannot spend another block');assert.equal(h.component('GameScreen').props.g.players[0].hours,5);
 await h.component('GameScreen').props.onAction('home_reset');await h.settle();h.tick();assert.equal(h.component('GameScreen').props.g.players[0].hours,4,'a newly rendered valid action remains usable');
 results.push({case:'repeated stale save is ignored while a new deliberate action works',passed:true});h.dispose();
}
{
 const h=harness();await h.click('Start our game');const before=h.component('GameScreen').props.g;h.record.malformedPost=true;await h.component('GameScreen').props.onAction('home_reset');await h.settle();h.tick();
 assert.equal(h.find(n=>n.props?.className==='reconnect-banner').length,1,'malformed success keeps original save intent pending');assert.equal(h.component('GameScreen').props.g.players[0].hours,before.players[0].hours,'malformed snapshot must not replace confirmed game');
 const original=JSON.parse(h.calls.filter(c=>c.opts.method==='POST').at(-1).opts.body);h.record.malformedPost=false;await h.click('Check saved action');const retried=JSON.parse(h.calls.filter(c=>c.opts.method==='POST').at(-1).opts.body);
 assert.equal(retried.requestId,original.requestId);assert.equal(h.component('GameScreen').props.g.players[0].hours,5,'retry recovers one committed action without double-spending');results.push({case:'malformed success retains confirmed snapshot and exact recoverable save',passed:true});h.dispose();
}
{
 const h=harness();await h.click('Start our game');const before=h.component('GameScreen').props.g;h.record.malformedGet=true;h.poll();await h.settle();
 assert.equal(h.component('GameScreen').props.g.code,before.code,'malformed lookup cannot dismiss the owned game');assert.equal(h.component('GameScreen').props.g.players[0].hours,before.players[0].hours);assert.equal(h.find(n=>n.props?.className==='reconnect-banner').length,1);
 h.record.malformedGet=false;await h.click('Reconnect');assert.equal(h.component('GameScreen').props.offline,false);results.push({case:'malformed room lookup preserves confirmed state until valid reconnection',passed:true});h.dispose();
}

{
 const G=require(root+'/lib/game.ts');
 for(const edition of ['classic','legacy','modern']){
  const p=G.player('Alex'),g={code:'QASTATE',mode:'hotseat',host:'owner',members:{owner:[p.id]},mine:[p.id],players:[p],status:'playing',round:2,turn:0,maxRounds:8,log:[],seen:[],event:0,version:1,...(edition==='classic'?{}:{rulesVersion:2}),...(edition==='modern'?{economyVersion:1,storyVersion:1,lifeVersion:1}:{})};
  if(edition==='classic')delete p.rulesVersion;if(edition==='modern')require(root+'/lib/economy.ts').initializeEconomyPlayer(p,g);p.cash=-100;p.energy=29.75;p.joy=39.75;
  const check=({status='playing',rules=false,review=false}={})=>{const state=structuredClone(g);state.status=status;const h=harness({initialGame:state,initialRules:rules,initialReview:review});const nodes=h.find(n=>n.type==='section'||n.type==='DialogContent'||n.type==='AlertDialogContent');const text=nodes.map(h.text).join(' ');assert.doesNotMatch(text,/(?:(?<![$\d.,])\b\d+(?:\.\d+)?\s*(?:energy|happiness|skills?|craft|connections?|legacy|points)\b|\d+\/100|\d+\/6|Solo target|most life points)/i);h.dispose();return text;};
  assert.match(check({rules:true}),/Rest|rest|Weather/);const bills=check({review:true});assert.match(bills,/\$/);assert.match(bills,/weigh on your spirits/);if(edition!=='modern'){const ending=check({status:'finished'});assert.match(ending,/lives we made/);assert.match(ending,/Savings/);}
 }
 results.push({case:'actual Home rules, bill-review, overdraft and legacy endings keep qualitative stats with exact money',editions:3,passed:true});
}

// Semantic audio exercises the actual Home send/receive path, not a preview helper.
{
 const h=harness();await h.click('Start our game');h.sounds.length=0;
 const first=h.component('GameScreen'),release=h.hold();
 const saving=first.props.onAction('home_meal');await waitUntilHeld(h);
 assert.deepEqual(h.sounds,[],'no optimistic cue while save is pending');
 await first.props.onAction('home_meal');assert.deepEqual(h.sounds,[],'duplicate pending click is silent');
 release();await saving;await h.settle();h.tick();
 assert.deepEqual(h.sounds,['cook'],'one accepted physical action, one recorded cue');
 await first.props.onAction('home_meal');await h.settle();h.tick();
 assert.deepEqual(h.sounds,['cook'],'retained old callback cannot replay a cue');
 h.poll();await h.settle();assert.deepEqual(h.sounds,['cook'],'polls do not replay actions');
 await h.component('GameScreen').props.onVisit('CORNER CAFÉ');await h.settle();h.tick();h.sounds.length=0;
 await h.component('GameScreen').props.onAction('cafe_break');await h.settle();h.tick();
 assert.deepEqual(h.sounds,['sip'],'twenty-coffee monthly habit gets a single real sip');
 await h.component('GameScreen').props.onAction('cafe_break');await h.settle();h.tick();
 assert.deepEqual(h.sounds,['sip'],'denied repeat habit does not sound');
 h.component('GameScreen').props.onEnd();h.render();
 assert.deepEqual(h.sounds,['sip'],'opening an end-month preview is silent');
 const review=h.find(n=>n.type==='AlertDialog'&&n.props.open===true)[0];review.props.onOpenChange(false);h.render();
 assert.deepEqual(h.sounds,['sip'],'cancelling a preview is silent');
 results.push({case:'semantic coffee/cooking only after authoritative confirmation; repeat, polling, preview and cancel stay quiet',passed:true});h.dispose();
}
for(const failure of ['before','after']){
 const h=harness();await h.click('Start our game');h.sounds.length=0;h.record.failPost=failure;
 await h.component('GameScreen').props.onAction('home_meal');await h.settle();h.tick();
 assert.deepEqual(h.sounds,[]);h.record.failPost=null;await h.click('Check saved action');
 assert.deepEqual(h.sounds,[],'explicit retry does not replay a recovered meal');
 results.push({case:'recorded sound remains quiet for a save interrupted '+failure+' commit and recovered',passed:true});h.dispose();
}
{
 const h=harness();await h.click('Start our game');h.sounds.length=0;
 const release=h.hold(),saving=h.component('GameScreen').props.onAction('home_meal');await waitUntilHeld(h);
 h.component('GameScreen').props.onHome();h.render();release();await saving;await h.settle();h.tick();
 assert.deepEqual(h.sounds,[],'leaving a room invalidates its in-flight sound');
 results.push({case:'late accepted meal after leaving room is silent',passed:true});h.dispose();
}
// Different devices: only the sending device sounds, even after the other polls.
{
 const host=harness();host.find(n=>n.props?.['aria-label']==='Play mode')[0].props.onValueChange('online');host.render();
 host.find(n=>n.type==='input'&&n.props.placeholder==='Your first name or nickname')[0].props.onChange({target:{value:'Host'}});host.render();
 await host.click('Create a room');const room=host.find(n=>n.props?.className==='room-code')[0];const code=host.text(room).trim();
 const guest=harness({query:'?room='+code});await guest.settle();
 guest.find(n=>n.type==='input'&&n.props.maxLength===20)[0].props.onChange({target:{value:'Guest'}});guest.render();
 await guest.click('Join the room');host.poll();await host.settle();
 await host.click('Start with 2 players');await host.click('Start the game');guest.poll();await guest.settle();
 host.sounds.length=0;guest.sounds.length=0;
 await host.component('GameScreen').props.onAction('home_meal');await host.settle();host.tick();guest.poll();await guest.settle();
 assert.deepEqual(host.sounds,['cook']);assert.deepEqual(guest.sounds,[],'other-player polling stays silent');
 await guest.component('GameScreen').props.onAction('home_meal');await guest.settle();guest.tick();
 assert.deepEqual(guest.sounds,[],'out-of-turn denied action remains silent');
 results.push({case:'online sender-only semantic audio; remote polling and denied turn are silent',passed:true});host.dispose();guest.dispose();
}
console.log(JSON.stringify(results.map(r=>Object.fromEntries(Object.entries(r).filter(([key])=>key!=='order'))),null,2));
console.log('PASS: actual Home handlers, real API and memory D1; full 1–4-player campaigns, saved-game reload, free travel, clock cues, create/join/restore exclusion and interrupted transition recovery. Auth/history transport is a contract stub; mutations use the real API/SQLite double. No browser or production state.');

// A compatibility refresh must retain both the last confirmed room and exact pending intent.
{
 const h=harness();await h.click('Start our game');h.component('WeeklyNews').props.onClose();h.render();
 const before=structuredClone(h.component('GameScreen').props.g);h.record.refreshRequired=true;
 await h.component('GameScreen').props.onAction('home_reset');await h.settle();h.tick();
 assert.deepEqual(h.component('GameScreen').props.g,before);
 const {pendingSaves}=require(root+'/lib/save-session.ts'),pending=pendingSaves(h.locals)[0];
 assert.ok(pending);assert.equal(pending.request.action,'home_reset');assert.equal(pending.request.version,before.version);
 assert.ok(h.button('Reload latest page'));assert.equal(h.component('GameScreen').props.active,false);
 const cookie=h.record.cookie,local=h.locals;h.dispose();
 const refreshed=harness({cookie,local,query:'?room='+before.code});await refreshed.settle();refreshed.tick();await refreshed.settle();
 assert.equal(pendingSaves(local).length,0);assert.equal(refreshed.component('GameScreen').props.g.players[0].hours,before.players[0].hours-1);
 const retry=JSON.parse(refreshed.calls.find(c=>c.opts.method==='POST').opts.body);assert.equal(retry.requestId,pending.request.requestId);assert.equal(retry.version,pending.request.version);assert.equal(retry.action,pending.request.action);assert.deepEqual(retry.supportedRules,['action-incidents-v1','venue-careers-v1']);
 refreshed.dispose();
}
{
 const h=harness();await h.click('Start our game');const before=structuredClone(h.component('GameScreen').props.g);
 h.record.refreshRequired=true;h.poll();await h.settle();assert.deepEqual(h.component('GameScreen').props.g,before);assert.ok(h.button('Reload latest page'));assert.equal(h.component('GameScreen').props.active,false);
 const roomGet=h.calls.find(c=>c.url.startsWith('/api/game?code='));assert.ok(new URL(roomGet.url,'https://test.invalid').searchParams.get('supportedRules').includes('venue-careers-v1'));h.record.refreshRequired=false;h.poll();await h.settle();assert.equal(h.component('GameScreen').props.active,false,'An older compatible-looking poll cannot clear the refresh lock');assert.ok(h.button('Reload latest page'));h.dispose();
}

for(const legacyIntent of [false,true]){
 const h=harness();h.record.failPost='before';await h.click('Start our game');
 const {pendingSaves,rememberPending}=require(root+'/lib/save-session.ts');const saved=pendingSaves(h.locals)[0];assert.ok(saved);
 assert.equal(saved.request.careerMode,'venue');assert.equal(saved.request.actionIncidents,true);
 if(legacyIntent){delete saved.request.careerMode;delete saved.request.actionIncidents;delete saved.request.supportedRules;rememberPending(h.locals,saved);}
 const local=h.locals,cookie=h.record.cookie;h.dispose();const restored=harness({cookie,local});await restored.settle();restored.tick();await restored.settle();
 const retried=JSON.parse(restored.calls.find(c=>c.opts.method==='POST').opts.body);assert.equal(retried.requestId,saved.request.requestId);
 assert.equal(retried.careerMode,legacyIntent?undefined:'venue');assert.equal(retried.actionIncidents,legacyIntent?undefined:true);assert.deepEqual(retried.supportedRules,['action-incidents-v1','venue-careers-v1']);restored.dispose();
}

// Current new-game Home uses both explicit rule opt-ins through the actual route unchanged.
{
 const h=harness({legacyRules:false});await h.click('Start our game');const room=h.component('GameScreen').props.g;
 assert.equal(room.careerVersion,1);assert.equal(room.financialRecoveryVersion,1);assert.equal(room.actionIncidentsVersion,1);
 assert.deepEqual(room.requiredRules,['action-incidents-v1','venue-careers-v1']);assert.equal(room.players[0].career.contracts.length,0);assert.equal(room.actionIncidentRng,undefined);
 const code=room.code,cookie=h.record.cookie;h.dispose();const restored=harness({legacyRules:false,cookie,saved:code,query:'?room='+code});await restored.settle();assert.equal(restored.component('GameScreen').props.g.careerVersion,1);restored.dispose();
}
