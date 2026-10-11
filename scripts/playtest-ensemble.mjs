import {currentGame} from '../tests/current-fixture.mjs';
import {move} from '../lib/game.ts';
import {initializeEnsemble,getEnsembleView} from '../lib/ensemble-story.ts';

// Eight actual months, all seats start in Alder with ordinary money, bills and recovery.
// This deliberately tests local life rather than bypassing the game's travel rules.
const results=[];
for(let seats=1;seats<=4;seats++)for(let policy=0;policy<3;policy++){
 const g=currentGame({names:Array.from({length:seats},(_,i)=>'Player '+(i+1)),seed:100+seats*3+policy});initializeEnsemble(g);
 let turns=0,maxActive=0;
 while(g.status==='playing'){
  const p=g.players[g.turn];
  for(let decision=0;decision<2;decision++){
   const scenes=getEnsembleView(g,p).scenes;
   const candidates=scenes.flatMap(scene=>scene.choices.filter(c=>c.available||c.reason.startsWith('Visit ')).map(choice=>({scene,choice})));
   candidates.sort((a,b)=>Number(!!b.choice.cause)-Number(!!a.choice.cause));
   const candidate=candidates[(policy+g.turn+decision)%Math.max(1,candidates.length)];if(!candidate)break;
   if(p.place!==candidate.scene.place)move(g,'visit',candidate.scene.place);
   const fresh=getEnsembleView(g,p,candidate.scene.id).scenes.find(s=>s.id===candidate.scene.id)?.choices.find(c=>c.id===candidate.choice.id);
   if(!fresh?.available)break;move(g,fresh.actionId);
  }
  maxActive=Math.max(maxActive,Object.values(g.ensemble.threads).filter(t=>t.status==='active').length);
  move(g,'end');turns++;
  if(turns>seats*8)throw Error('Calendar did not terminate');
 }
 results.push({seats,policy,turns,maxActive,worldEvents:g.ensemble.events.length,crossingOffers:g.ensemble.crossings.length,settled:Object.values(g.ensemble.threads).filter(t=>t.status==='settled').length,
  players:g.players.map(p=>({id:p.name,choices:p.ensemble.receipts.length,acceptedCrossings:p.ensemble.receipts.filter(r=>r.crossingId).length,fromOtherPlayer:p.ensemble.receipts.filter(r=>r.crossingId&&g.ensemble.crossings.find(c=>c.id===r.crossingId)?.originPlayers.some(id=>id!==p.id)).length,finalCash:p.cash,arrears:p.finance.arrears}))});
}
if(results.some(r=>r.maxActive>8||r.players.some(p=>p.choices===0)))throw Error('A seat had no agency or active bound failed');
console.log(JSON.stringify({scope:'Twelve automated local-life policies, 1–4 seats, real eight-month bills. Exposure and enjoyment are not inferred.',results},null,2));
