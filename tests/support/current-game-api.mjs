import {createHandler} from '../../supabase/functions/crosswalk-game/handler.ts';

/** Real HTTP handler + command engine with a deterministic in-memory store seam.
 * PostgreSQL transactions, permissions and RLS are separately covered by supabase-backend.
 * Rows use serialized state so UI tests can inspect/replace fixture snapshots explicitly. */
export function createTestGameApi() {
  const rows = new Map(), receipts = new Map();
  const record = row => row ? {...row, state:JSON.parse(row.state)} : null;
  const receiptResult = (actor, requestId, fingerprint) => {
    const receipt = receipts.get(`${actor}:${requestId}`);
    if (!receipt) return {kind:'missing'};
    if (receipt.fingerprint !== fingerprint) return {kind:'request_mismatch'};
    const room = record(rows.get(receipt.code));
    if (!room?.state.members[actor]?.length) return {kind:'forbidden'};
    return {kind:'ok', room, replayed:true, appliedVersion:receipt.appliedVersion};
  };
  const store = {
    async read(actor, code) { return record(rows.get(code)); },
    async history(actor, cursor) {
      return [...rows.values()].sort((a,b)=>b.updated_at-a.updated_at||a.code.localeCompare(b.code))
        .filter(row=>!cursor||row.updated_at<cursor.updatedAt||row.updated_at===cursor.updatedAt&&row.code>cursor.code)
        .map(record).filter(row=>row.state.members[actor]?.length).slice(0,21).map(row=>{
          const g=row.state;
          return {code:row.code,mode:g.mode,status:g.status,round:g.round,maxRounds:g.maxRounds,version:row.version,updatedAt:row.updated_at,names:g.players.filter(p=>g.members[actor].includes(p.id)).map(p=>p.name)};
        });
    },
    async receipt(actor, requestId, fingerprint) { return receiptResult(actor,requestId,fingerprint); },
    async commit(command) {
      // No await between receipt/CAS checks and the atomic write in this test seam.
      const saved=receiptResult(command.actor,command.requestId,command.fingerprint);
      if(saved.kind!=='missing')return saved;
      const old=record(rows.get(command.code));
      if(command.op==='create'&&old)return{kind:'code_taken'};
      if(command.op!=='create'&&!old)return{kind:'missing'};
      if(old&&old.version!==command.expectedVersion)return{kind:'stale'};
      if(!command.state.members[command.actor]?.length)return{kind:'forbidden'};
      const rejoin=command.op==='join'&&old.state.members[command.actor]?.length;
      const version=old?old.version+(rejoin?0:1):0;
      const row={code:command.code,state:JSON.stringify(command.state),version,updated_at:Date.now()};
      rows.set(command.code,row);
      receipts.set(`${command.actor}:${command.requestId}`,{fingerprint:command.fingerprint,code:command.code,appliedVersion:version});
      return{kind:'ok',room:record(row),replayed:false,appliedVersion:version};
    },
  };
  const handler=createHandler({store,allowedOrigins:['https://test.invalid'],authenticate:async token=>{
    const id=token.match(/^test\.([0-9a-f-]{36})\.signature$/i)?.[1];
    return id?{id,role:'authenticated',is_anonymous:true}:null;
  }});
  const request=(input,actor)=>{
    const headers=new Headers(input.headers);
    if(actor)headers.set('Authorization',`Bearer test.${actor}.signature`);
    return handler(new Request(input,{headers}));
  };
  return {rows,receipts,store,handler,request};
}
