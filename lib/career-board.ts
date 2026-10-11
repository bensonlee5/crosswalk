import {actions,activityForPlayer,effects,jobs,opportunity,reason,type Activity,type Game,type Player} from './game.ts';
import {economyHourlyRate,economyHomeRegion,economyPaidHours,economyPaidHoursLimit,economyQuote,economyRegionalWorkQuote,economyTimeLabel,formatEconomyMoney,hasModernEconomy} from './economy.ts';
import {qualitativeStat,qualitativeText} from './point-presentation.ts';
import {locationFor} from './locations.ts';
import {regionDefinitions,visiblePlaces,worldChoices,worldPlaceName,type RegionId} from './world-life.ts';

/** Pure presentation: reading/filtering never changes a role, qualifies a player or pays a wage. */
export type WorkCategory='career'|'creative'|'community'|'casual'|'regional'|'shared';
export type WorkDestination={kind:'activity';place:string;actionId:string}|{kind:'world';choiceId:string;place:string;actorId?:string}|{kind:'shared';actionId:string;place:string;actorId:string};
export type WorkCard={id:string;title:string;category:WorkCategory;categoryLabel:string;venue:string;place:string;region:RegionId;regionName:string;summary:string;cash:number;gross?:number;takeHome:number;cost:number;paidHours:number;time:number;timeLabel:string;requirements:string[];ready:boolean;reason:string;onMap:boolean;destination:WorkDestination;host?:string;repeat:string};
/** Structural public subset of sharedOpportunityView; no private order/relationship state. */
export type SharedWorkChoice={id:string;actionId:string;key:string;kind:string;title:string;body:string;place:string;actorId:string;time:number;cost:number;earn?:number;paidHours?:number;available:boolean;reason:string};
export type SharedWorkView={choices:SharedWorkChoice[]};
export type CareerStep={id:string;title:string;stage:string;transition:string;rate:number;status:'current'|'earlier'|'next'|'later';requirement:string;qualified:boolean};
const categoryLabels:Record<WorkCategory,string>={career:'Your main role',creative:'Creative work',community:'Community work',casual:'Casual work',regional:'Local livelihood',shared:'Shared one-off gig'};
const regularIds=['work','work_short','work_overtime'];
const summaries:Record<string,string>={work:'A regular commitment in your current role.',work_short:'A smaller commitment alongside other priorities.',work_overtime:'A demanding commitment with less room to recover.',cafe_barista:'Serve the regulars at the espresso bar.',campus_tutor:'Help another learner use what they know.',library_digitize:'Make the local archive easier to find and use.',market_shift:'Cover a stall and meet the market regulars.',market_resell:'Run your own secondhand stall; pay the fee upfront.',gym_desk:'Welcome visitors and keep the front desk running.',maker_commission:'Finish a practical custom order with paid materials.',cinema_usher:'Welcome the audience and look after the screening.',transit_courier:'Deliver parcels along a bicycle route.',transit_repair:'Adjust brakes and replace worn bicycle cables.',garden_harvest:'Help bring in a seasonal crop.',arcade_shift:'Look after the games and welcome players.',career_contract:'Take paid work through a local referral.',creative_commission:'Deliver a commission; developing your craft improves the fee.',community_organize:'Coordinate funded work for the neighborhood.'};
const stages=['Entry role','Retraining','Specialist','Leadership'];
const transitions=['Your starting job; no application needed','Change field through learning','Move into design work','Take on project leadership'];
const skillLabel=(n:number)=>qualitativeStat('skill',n),money=formatEconomyMoney;
const regionOf=(p:Player):RegionId=>p.world?.region??'alder';
export function careerVenueName(p:Player,g:Game,place:string):string{return p.world?worldPlaceName(p,place,g):locationFor(place).name;}
function actionRequirements(p:Player,a:Activity):string[]{
 const result:string[]=[];
 if(a.needSkill&&!(p.rulesVersion===2&&a.id==='career_contract'))result.push(`Learning: ${skillLabel(a.needSkill)}`);
 if(a.needSocial)result.push(`Connections: ${qualitativeStat('social',a.needSocial)}`);
 if(a.needCraft)result.push(`Craft: ${qualitativeStat('craft',a.needCraft)}`);
 return result.length?result:['No training prerequisite'];
}
function specificReason(p:Player,g:Game,a:Activity,raw:string):string {
 if(!raw)return'';
 if(raw==='Not enough cash for the upfront cost')return `${money(a.cost)} upfront; you have ${money(p.cash)}.`;
 if(raw==='Not enough priority blocks this month'||raw==='Not enough time this week')return `Needs ${economyTimeLabel(p,a.time)}; you have ${p.hours} left.`;
 if(/Needs \d+ skills/.test(raw))return `Learning needs to be ${skillLabel(a.promote?jobs[p.job+1]?.need??6:a.needSkill??0)}. Keep learning first.`;
 if(/Needs \d+ connections/.test(raw))return `Connections need to be ${qualitativeStat('social',a.needSocial??0)}. Get to know more neighbors first.`;
 if(/Needs \d+ craft/.test(raw))return `Craft needs to be ${qualitativeStat('craft',a.needCraft??0)}. Practice at ${careerVenueName(p,g,'MAKERSPACE')}.`;
 if(raw==='This place is not on your current map')return `Find ${careerVenueName(p,g,a.place)} by exploring or meeting local people.`;
 return qualitativeText(raw);
}
function ordinaryCard(p:Player,g:Game,original:Activity):WorkCard {
 const a=activityForPlayer(p,original,g),e=effects(p,a,g),quote=economyQuote(p,a,g,e.cash+a.cost),region=regionOf(p),raw=reason(p,a.id,g);
 const category:WorkCategory=regularIds.includes(a.id)?'career':['creative_commission','maker_commission'].includes(a.id)?'creative':a.id==='community_organize'||a.special==='opportunity'?'community':'casual';
 const ready=!raw&&g.status==='playing'&&g.players[g.turn]?.id===p.id;
 return{id:a.id,title:a.special==='opportunity'?opportunity(g).title:a.title,category,categoryLabel:categoryLabels[category],venue:careerVenueName(p,g,a.place),place:a.place,region,regionName:regionDefinitions[region].name,summary:summaries[a.id]??(a.special==='opportunity'?opportunity(g).text:qualitativeText(a.desc)),cash:e.cash,gross:hasModernEconomy(p)?quote.gross:undefined,takeHome:quote.takeHome,cost:a.cost,paidHours:hasModernEconomy(p)?quote.paidHours:a.workHours??0,time:a.time,timeLabel:economyTimeLabel(p,a.time),requirements:actionRequirements(p,a),ready,reason:specificReason(p,g,a,raw)||(!ready?'Wait for your turn.':''),onMap:visiblePlaces(p,g).includes(a.place),destination:{kind:'activity',place:a.place,actionId:a.id},repeat:a.special==='opportunity'?`One opening shared by the whole table this ${hasModernEconomy(p)?'month':'week'}`:hasModernEconomy(p)?'Uses the shared 200-paid-hour monthly limit':'Repeat while time and energy allow'};
}
function trainingStep(p:Player,g:Game){
 const options=['library_learn','study','community_skill','campus_group','career_portfolio','work_mentor'].map(id=>{const a=activityForPlayer(p,actions.find(a=>a.id===id)!,g);return{id,place:a.place,title:a.title,cost:a.cost,time:a.time,timeLabel:economyTimeLabel(p,a.time),venue:careerVenueName(p,g,a.place),onMap:visiblePlaces(p,g).includes(a.place),ready:!reason(p,id,g),reason:specificReason(p,g,a,reason(p,id,g))};});
 return options.find(a=>a.ready)??options.find(a=>a.onMap)??options[0];
}
export function careerBoardView(p:Player,g:Game,shared?:SharedWorkView|null){
 if(p.castRedacted)return null;
 const region=regionOf(p),modern=hasModernEconomy(p),onMap=visiblePlaces(p,g),allWorld=worldChoices(p,g);
 const paid=actions.filter(a=>(!a.modernOnly||p.rulesVersion===2)&&!a.story&&(a.workHours||a.earn||['creative_commission','community_organize','weekly_opportunity'].includes(a.id)));
 const cards=paid.map(a=>ordinaryCard(p,g,a));
 for(const c of allWorld.filter(c=>c.kind==='work'||c.key.startsWith('local:')&&c.preview.cash>0)){
  const place=c.spot??'WORK',ready=c.available||c.reason.startsWith('Visit ')&&onMap.includes(place),regular=c.key==='regional_work',short=c.key==='region_shift';
  const quote=regular||short?economyRegionalWorkQuote(p,g,{region,kind:regular?'regular':'short',residentBonus:regular&&p.world?.story?.homeRegion===region}):null;
  const host=c.actorId?regionDefinitions[region].residents.find(r=>r.id===c.actorId)?.name:undefined;
  cards.push({id:c.key,title:c.title,category:regular||short?'regional':'shared',categoryLabel:regular||short?'Local livelihood':'One-time local opening',venue:careerVenueName(p,g,place),place,region,regionName:regionDefinitions[region].name,summary:regular?'Work with a local host on the town’s ongoing practical needs. Your main career stays yours.':short?'Supervised local work is open to visitors and residents. Your main career stays yours.':'A bounded task for a venue’s new chapter; its stipend is separate from a salaried career.',cash:c.preview.cash,gross:modern?quote?.gross:undefined,takeHome:quote?.takeHome??c.preview.cash,cost:c.cost,paidHours:modern?quote?.paidHours??0:0,time:c.time,timeLabel:economyTimeLabel(p,c.time),requirements:['No training prerequisite'],ready,reason:ready?'':qualitativeText(c.reason),onMap:onMap.includes(place),destination:{kind:'world',choiceId:c.id,place,...(c.actorId?{actorId:c.actorId}:{})},host,repeat:regular?`Once in this town per ${modern?'month':'week'}${p.world?.story?.homeRegion===region?`; includes ${money(modern?200:60)} resident-rota bonus`:''}`:short?'Repeat while the paid-work limit and your energy allow':'Complete this opening once'});
 }
 for(const c of shared?.choices.filter(c=>c.kind==='prepare')??[]){
  const host=regionDefinitions[region].residents.find(r=>r.id===c.actorId)?.name;
  cards.push({id:c.id,title:c.title,category:'shared',categoryLabel:categoryLabels.shared,venue:careerVenueName(p,g,c.place),place:c.place,region,regionName:regionDefinitions[region].name,summary:qualitativeText(c.body),cash:(c.earn??0)-c.cost,takeHome:c.earn??0,cost:c.cost,paidHours:c.paidHours??0,time:c.time,timeLabel:economyTimeLabel(p,c.time),requirements:['No training prerequisite'],ready:c.available,reason:qualitativeText(c.reason),onMap:onMap.includes(c.place),destination:{kind:'shared',actionId:c.actionId,place:c.place,actorId:c.actorId},host,repeat:'One preparation shift per person per month across all towns'});
 }
 const steps:CareerStep[]=jobs.map((j,index)=>({id:`career-${index}`,title:j.name,stage:stages[index],transition:transitions[index],rate:economyHourlyRate(p,index),status:index===p.job?'current':index<p.job?'earlier':index===p.job+1?'next':'later',requirement:index===0?'No training prerequisite':`Learning: ${skillLabel(j.need)}`,qualified:p.skill>=j.need}));
 const application=activityForPlayer(p,actions.find(a=>a.id==='apply')!,g),learning=trainingStep(p,g),needsTraining=p.job<jobs.length-1&&p.skill<jobs[p.job+1].need;
 const next=p.job===jobs.length-1?{title:'Pass on what you know',label:'Review tutoring',place:'CAMPUS',actionId:'campus_tutor',venue:careerVenueName(p,g,'CAMPUS'),reason:specificReason(p,g,actions.find(a=>a.id==='campus_tutor')!,reason(p,'campus_tutor',g)),onMap:onMap.includes('CAMPUS'),timeLabel:economyTimeLabel(p,2),cost:0}:needsTraining?{title:`Build toward ${jobs[p.job+1].name}`,label:'Review learning',place:learning.place,actionId:learning.id,venue:learning.venue,reason:learning.reason,onMap:learning.onMap,timeLabel:learning.timeLabel,cost:learning.cost}:{title:`Apply for ${jobs[p.job+1].name}`,label:'Review application',place:'CAREER HUB',actionId:'apply',venue:careerVenueName(p,g,'CAREER HUB'),reason:specificReason(p,g,application,reason(p,'apply',g)),onMap:onMap.includes('CAREER HUB'),timeLabel:economyTimeLabel(p,application.time),cost:application.cost};
 const towns=Object.values(regionDefinitions).map(r=>{
  const travel=allWorld.find(c=>c.key===`travel:${r.id}`),quote=economyRegionalWorkQuote(p,g,{region:r.id,kind:'regular',residentBonus:p.world?.story?.homeRegion===r.id});
  return{id:r.id,name:r.name,description:r.description,workplace:r.placeNames.WORK,current:r.id===region,known:r.id===region||!!p.world?.discoveredRegions.includes(r.id),takeHome:quote.takeHome,paidHours:quote.paidHours,timeLabel:economyTimeLabel(p,2),travel:travel?{id:travel.id,place:travel.spot??'TRANSIT',cost:travel.cost,time:travel.time,available:travel.available,reason:qualitativeText(travel.reason)}:undefined};
 });
 return{region,regionName:regionDefinitions[region].name,modern,role:jobs[p.job].name,rate:economyHourlyRate(p),workplace:careerVenueName(p,g,'WORK'),applicationVenue:careerVenueName(p,g,'CAREER HUB'),homeRegionName:regionDefinitions[economyHomeRegion(p)].name,paidHoursLeft:modern?Math.max(0,economyPaidHoursLimit-economyPaidHours(p,g)):null,blocksLeft:p.hours,steps,next,cards,towns,learningStatus:qualitativeStat('skill',p.skill),creativeStatus:qualitativeStat('craft',p.craft??0),communityStatus:qualitativeStat('social',p.social),explore:allWorld.find(c=>c.key==='explore'&&c.available),creativePractice:{place:'MAKERSPACE',actionId:'creative_practice',venue:careerVenueName(p,g,'MAKERSPACE'),onMap:onMap.includes('MAKERSPACE')},communityPractice:{place:'COMMUNITY',actionId:'community_setup',venue:careerVenueName(p,g,'COMMUNITY'),onMap:onMap.includes('COMMUNITY')}};
}
