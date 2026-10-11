import {writeFile} from 'node:fs/promises';
import {commitActionIncident,initializeActionIncidents,actionIncidentRules} from '../lib/action-incidents.ts';
import {ordinaryIncidentFamilies} from '../lib/action-incident-content.ts';
const sampleCount=Number(process.env.INCIDENT_SAMPLES||500);
const representatives={home:'home_reset',coffee:'cafe_break',food:'market_taste',work:'cafe_barista',study:'study',social:'volunteer',outdoors:'rest',reading:'library_read',creative:'creative_practice',fitness:'gym_yoga',cinema:'cinema_matinee',transit:'transit_scenic',games:'arcade_play'};
const speakers={coffee:{actorId:'alder_tess',name:'Tess',spot:'CORNER CAFÉ',speech:'A brief fixture exchange.',activity:'Pauses at the actual café counter.',emotion:'warm',gesture:'pause'},reading:{actorId:'alder_rowan',name:'Rowan',spot:'LIBRARY',speech:'A brief fixture exchange.',activity:'Sets a return on the trolley.',emotion:'warm',gesture:'pause'}};
function entropy(seed){let n=seed>>>0;return new Uint32Array(Array.from({length:4},()=>{n=(n+0x9e3779b9)>>>0;let t=n;t=Math.imul(t^(t>>>16),0x21f0aaad);t=Math.imul(t^(t>>>15),0x735a2d97);return(t^(t>>>15))>>>0;}));}
function trial(family,probability,actionsPerMonth,seed){
 const p={id:'sim',cash:1000,joy:50,energy:50,hours:6,place:speakers[family]?.spot??'FIXTURE'},g={players:[p],round:1,actionIncidentsVersion:1};initializeActionIncidents(g,()=>entropy(seed));
 let incidents=0,cash=0,positive=0,negative=0,encounters=0,maxMonthly=0,maxCashMonthly=0,last=null,repeatViolation=0,rareViolation=0;const rareRounds={};
 for(let month=1;month<=8;month++){g.round=month;for(let i=0;i<actionsPerMonth;i++){
  p.joy=50;p.energy=50;const context={actionId:representatives[family],semanticKey:representatives[family],family,round:month,region:'alder',place:p.place,placeName:'Simulation venue',weather:'Fixed context',cost:10,speakers:speakers[family]?[speakers[family]]:[]};
  const r=commitActionIncident(g,p,context,probability);if(!r.incidentId)continue;incidents++;cash+=r.effects.cash;positive+=Math.max(0,r.effects.cash);negative+=Math.max(0,-r.effects.cash);if(r.person)encounters++;
  if(last===r.incidentId)repeatViolation++;last=r.incidentId;if(['customer_tip','price_corrected','loose_change'].includes(r.incidentId)){if(rareRounds[r.incidentId]&&month-rareRounds[r.incidentId]<actionIncidentRules.rareRoundGap)rareViolation++;rareRounds[r.incidentId]=month;}
  maxMonthly=Math.max(maxMonthly,p.actionIncidents.month.incidents);maxCashMonthly=Math.max(maxCashMonthly,p.actionIncidents.month.cashIncidents);
 }}
 return{incidents,cash,positive,negative,encounters,maxMonthly,maxCashMonthly,repeatViolation,rareViolation};
}
const rows=[];
for(const probability of [.12,.20,.28])for(const actionsPerMonth of [3,6])for(const family of Object.keys(representatives)){
 const values=Array.from({length:sampleCount},(_,i)=>trial(family,probability,actionsPerMonth,10001+i));
 const sum=key=>values.reduce((n,v)=>n+v[key],0);const attempts=sampleCount*8*actionsPerMonth;
 rows.push({probability,actionsPerMonth,family,campaigns:sampleCount,attempts,incidents:sum('incidents'),realizedRate:sum('incidents')/attempts,meanPerCampaign:sum('incidents')/sampleCount,meanCash:sum('cash')/sampleCount,maxCash:Math.max(...values.map(v=>v.cash)),minCash:Math.min(...values.map(v=>v.cash)),meanEncounters:sum('encounters')/sampleCount,maxMonthly:Math.max(...values.map(v=>v.maxMonthly)),maxCashMonthly:Math.max(...values.map(v=>v.maxCashMonthly)),repeatViolations:sum('repeatViolation'),rareViolations:sum('rareViolation')});
}
const result={scope:'Incident-domain Monte Carlo; fixed repeated family and context, excluding base wages/costs. Real move campaigns are separate tests.',samplesPerCell:sampleCount,ruleVersion:1,rates:[.12,.20,.28],rows};
const destination=process.argv[2];if(destination)await writeFile(destination,JSON.stringify(result,null,2)+'\n');
for(const probability of [.12,.20,.28])for(const actionsPerMonth of [3,6]){const subset=rows.filter(r=>r.probability===probability&&r.actionsPerMonth===actionsPerMonth);console.log(JSON.stringify({probability,actionsPerMonth,realizedMin:Math.min(...subset.map(r=>r.realizedRate)),realizedMax:Math.max(...subset.map(r=>r.realizedRate)),meanIncidents:subset.reduce((n,r)=>n+r.meanPerCampaign,0)/subset.length,maxMeanCash:Math.max(...subset.map(r=>r.meanCash)),minMeanCash:Math.min(...subset.map(r=>r.meanCash)),repeatViolations:subset.reduce((n,r)=>n+r.repeatViolations+r.rareViolations,0)}));}
if(rows.some(r=>r.maxMonthly>2||r.maxCashMonthly>1||r.repeatViolations||r.rareViolations))throw Error('An incident safety cap was violated');
if(Object.keys(ordinaryIncidentFamilies).length!==61)throw Error('Update campaign coverage after changing the activity set');
