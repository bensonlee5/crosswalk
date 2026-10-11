/** Local storage holds only retry intentions, never authoritative game snapshots or seat secrets. */
export type SaveRequest={op:'create'|'join'|'start'|'move';requestId:string;ownerSession?:string;code?:string;version?:number;mode?:string;names?:string[];name?:string;action?:string;destination?:string};
export type PendingSave={request:SaveRequest;createdAt:number;deferred?:boolean};
export type SavedRoom={code:string;mode:string;status:string;round:number;maxRounds:number;version:number;updatedAt:number;names:string[]};
type StorageLike=Pick<Storage,'getItem'|'setItem'|'removeItem'|'key'|'length'>;
const prefix='cw_pending_save_';
export function rememberPending(storage:StorageLike,pending:PendingSave){try{storage.setItem(prefix+pending.request.requestId,JSON.stringify(pending));return true;}catch{return false;}}
export function forgetPending(storage:StorageLike,id:string){try{storage.removeItem(prefix+id);}catch{}}
export function pendingSaves(storage:StorageLike):PendingSave[]{
 try{
  const result:PendingSave[]=[];
  for(let i=0;i<storage.length;i++){
   const key=storage.key(i);if(!key?.startsWith(prefix))continue;
   try{
    const value=JSON.parse(storage.getItem(key)||'null') as PendingSave;
    const r=value?.request;
    if(!r||!['create','join','start','move'].includes(r.op)||typeof r.requestId!=='string'||!r.requestId.length||r.requestId.length>80||key!==prefix+r.requestId||!Number.isFinite(value.createdAt))continue;
    if(r.op!=='create'&&(typeof r.code!=='string'||!/^[A-Z0-9]{6}$/.test(r.code)))continue;
    // Only known request fields are used. The server still validates every field.
    result.push({createdAt:value.createdAt,...(value.deferred===true?{deferred:true}:{}),request:{op:r.op,requestId:r.requestId,ownerSession:r.ownerSession,code:r.code,version:r.version,mode:r.mode,names:r.names,name:r.name,action:r.action,destination:r.destination}});
   }catch{}
  }
  return result.sort((a,b)=>b.createdAt-a.createdAt).slice(0,20);
 }catch{return [];}
}
export function roomSummary(g:any,now=Date.now()):SavedRoom{return{code:g.code,mode:g.mode,status:g.status,round:g.round,maxRounds:g.maxRounds,version:g.version,updatedAt:now,names:g.players.filter((p:any)=>g.mine.includes(p.id)).map((p:any)=>p.name)};}
export function mergeSavedRoom(rooms:SavedRoom[],room:SavedRoom){return[room,...rooms.filter(r=>r.code!==room.code)];}

/** A timed-out or malformed success response is uncertain: keep the original ID for retry. */
export async function postSavedRequest(request:SaveRequest,fetcher:typeof fetch=fetch){
 let response:Response|undefined,data:any;
 for(let attempt=0;attempt<2;attempt++){
  const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),15000);
  try{response=await fetcher('/api/game',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(request),signal:controller.signal});data=await response.json();}
  finally{clearTimeout(timeout);}
  if(response.status!==428||!data.sessionRequired)break;
 }
 return{response:response!,data};
}

/** Check the usable envelope before acknowledging an uncertain save or replacing a
 * confirmed room. Partial JSON can be valid JSON without being a game snapshot. */
export function isOwnedGameSnapshot(value:unknown):boolean{
 if(!value||typeof value!=='object')return false;
 const g=value as Record<string,unknown>;
 if(typeof g.code!=='string'||!/^[A-Z0-9]{6}$/.test(g.code)||!Number.isInteger(g.version)||Number(g.version)<0||!['hotseat','online'].includes(String(g.mode))||!['lobby','playing','finished'].includes(String(g.status)))return false;
 if(!Array.isArray(g.players)||g.players.length<1||g.players.length>4||!Array.isArray(g.mine)||!g.mine.length||!Array.isArray(g.log)||!g.log.every(line=>typeof line==='string'))return false;
 if(!Number.isInteger(g.turn)||Number(g.turn)<0||Number(g.turn)>=g.players.length||!Number.isInteger(g.round)||Number(g.round)<1||!Number.isInteger(g.maxRounds)||Number(g.maxRounds)<1)return false;
 const ids=new Set<string>();
 for(const value of g.players){
  if(!value||typeof value!=='object')return false;
  const p=value as Record<string,unknown>;
  if(typeof p.id!=='string'||!p.id||ids.has(p.id)||typeof p.name!=='string'||typeof p.place!=='string'||!['cash','hours','energy','joy','job','skill','social'].every(key=>typeof p[key]==='number'&&Number.isFinite(p[key])))return false;
  ids.add(p.id);
 }
 return g.mine.every(id=>typeof id==='string'&&ids.has(id));
}

/** Room lookup also legitimately returns a small public lobby envelope to a
 * nonmember. Missing ownership fields alone are not proof that envelope is valid. */
export function isRoomLookupSnapshot(value:unknown,expectedCode:string):boolean{
 if(!value||typeof value!=='object')return false;
 const g=value as Record<string,unknown>;
 if(g.code!==expectedCode)return false;
 if(Object.prototype.hasOwnProperty.call(g,'mine'))return isOwnedGameSnapshot(g);
 if(!/^[A-Z0-9]{6}$/.test(expectedCode)||!['lobby','playing','finished'].includes(String(g.status))||typeof g.joinable!=='boolean'||!Array.isArray(g.players)||g.players.length<1||g.players.length>4)return false;
 if(g.joinable&&(g.status!=='lobby'||g.players.length>=4))return false;
 return g.players.every(p=>!!p&&typeof p==='object'&&typeof p.name==='string');
}
