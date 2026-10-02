/** Authored, shared weather. Version 1 is frozen for persisted campaign compatibility. */
export type Season='spring'|'summer'|'autumn'|'winter';
export type WeatherType='sun'|'rain'|'heat'|'snow'|'cold';
export type WeatherId='spring-sun'|'spring-rain'|'summer-sun'|'summer-heat'|'autumn-sun'|'autumn-rain'|'winter-snow'|'winter-cold';
export type Weather={id:WeatherId;week:number;season:Season;type:WeatherType;label:string;description:string;effectSummary:string;chapter:number;chapterWeek:number;timeSkip:string};
export type WeatherUsage={round:number;joy:number;heat:number;recovery:number};
type WeatherGame={round:number;rulesVersion?:number;environmentVersion?:number;weatherSchedule?:readonly WeatherId[]};
type WeatherPlayer={joy:number;energy:number;weatherUsage?:WeatherUsage};
type WeatherActivity={id:string;joy?:number;energy?:number};
const sunRule='Walks, picnics and garden leisure gain +2 happiness, up to +4 weather happiness per player this week.';
const rainRule='Sheltered café, library, repair and creative activities gain +2 happiness, up to +4 per player this week.';
const heatRule='Runs, courier routes, harvests and outdoor setup cost 4 extra energy, up to 8 extra energy per player this week.';
const winterRule='Cozy indoor rest, reading and cooking restore 4 extra energy, up to 8 weather recovery per player this week.';
export const weatherSchedule:readonly WeatherId[]=Object.freeze(['spring-sun','spring-rain','summer-sun','summer-heat','autumn-sun','autumn-rain','winter-snow','winter-cold']);
const conditions:Record<WeatherId,Omit<Weather,'week'|'chapter'|'chapterWeek'|'timeSkip'>>={
 'spring-sun':{id:'spring-sun',season:'spring',type:'sun',label:'Mild spring sun',description:'Blossoms open and the first garden beds wake up.',effectSummary:sunRule},
 'spring-rain':{id:'spring-rain',season:'spring',type:'rain',label:'Steady spring rain',description:'Umbrellas, wet streets and a welcoming window seat.',effectSummary:rainRule},
 'summer-sun':{id:'summer-sun',season:'summer',type:'sun',label:'Clear summer warmth',description:'Leafy shade and long light invite the neighborhood outside.',effectSummary:sunRule},
 'summer-heat':{id:'summer-heat',season:'summer',type:'heat',label:'Summer hot spell',description:'Warm haze settles over the block. Strenuous outdoor work takes more energy.',effectSummary:heatRule},
 'autumn-sun':{id:'autumn-sun',season:'autumn',type:'sun',label:'Crisp autumn sun',description:'Amber leaves and clear air make a slow walk especially pleasant.',effectSummary:sunRule},
 'autumn-rain':{id:'autumn-rain',season:'autumn',type:'rain',label:'Windy autumn showers',description:'Leaves tumble past the warm café and workshop windows.',effectSummary:rainRule},
 'winter-snow':{id:'winter-snow',season:'winter',type:'snow',label:'Light winter snow',description:'Soft snow, lit windows and greenhouse growing keep the block alive.',effectSummary:winterRule},
 'winter-cold':{id:'winter-cold',season:'winter',type:'cold',label:'Clear winter cold',description:'Frost and bright winter sunshine frame a warm neighborhood finale.',effectSummary:winterRule}
};
const chapterSkips=['Spring begins.','Later that summer…','As autumn arrives…','Later that winter…'];
export function createEnvironment(){return{environmentVersion:1 as const,weatherSchedule:[...weatherSchedule]};}
export function campaignWeather(g:WeatherGame):Weather[]{
 if(g.environmentVersion!==1||g.rulesVersion!==2)return[];
 return weatherSchedule.map((fallback,i)=>{const id=g.weatherSchedule?.[i];const c=id&&weatherSchedule.includes(id)?conditions[id]:conditions[fallback];return{...c,week:i+1,chapter:Math.floor(i/2)+1,chapterWeek:i%2+1,timeSkip:i%2===0?chapterSkips[Math.floor(i/2)]:''};});
}
export function getWeather(g?:WeatherGame|null):Weather|null{return g?campaignWeather(g)[g.round-1]||null:null;}
export function nextWeather(g?:WeatherGame|null):Weather|null{return g?campaignWeather(g)[g.round]||null:null;}
/** Explicit tags prevent a location's appearance from silently changing all of its actions. */
export const weatherTags={
 outdoorLeisure:['rest','park_picnic','park_read','garden_tend','garden_rest'],
 sheltered:['friends','cafe_break','cafe_openmic','library_learn','library_read','library_club','library_digitize','maker_intro','maker_commission','maker_hobby','maker_repair','creative_practice','creative_commission','transit_repair','story_mina_1','story_mina_2','story_mina_3','story_jo_1','story_jo_2','story_jo_3'],
 strenuousOutdoor:['park_run','transit_courier','garden_harvest','garden_project','community_lead','transit_cleanup'],
 cozy:['home_reset','home_meal','library_read','cafe_break','market_cook']
} as const;
const includes=(ids:readonly string[],id:string)=>ids.includes(id);
export function currentWeatherUsage(p:WeatherPlayer,g?:WeatherGame):WeatherUsage{
 const u=p.weatherUsage?.round===g?.round?p.weatherUsage:undefined;
 return{round:g?.round||0,joy:Math.max(0,Math.min(4,u?.joy||0)),heat:Math.max(0,Math.min(8,u?.heat||0)),recovery:Math.max(0,Math.min(8,u?.recovery||0))};
}
const clamp=(n:number)=>Math.max(0,Math.min(100,n));
export function weatherEffect(p:WeatherPlayer,a:WeatherActivity,g?:WeatherGame,base={joy:a.joy||0,energy:a.energy||0}){
 const weather=getWeather(g),usage=currentWeatherUsage(p,g),remaining={joy:4-usage.joy,heat:8-usage.heat,recovery:8-usage.recovery};
 let joy=0,energy=0,heat=0,recovery=0,applies=false,capReached=false,summary='';
 if(weather?.type==='sun'&&includes(weatherTags.outdoorLeisure,a.id)||weather?.type==='rain'&&includes(weatherTags.sheltered,a.id)){
  applies=true;capReached=remaining.joy===0;joy=Math.min(2,remaining.joy,100-clamp(p.joy+base.joy));
  summary=capReached?'Weekly weather happiness cap reached (+4); no extra happiness.':joy?`${weather!.label}: +${joy} weather happiness (${remaining.joy-joy} of 4 remains this week).`:'Happiness is already capped at 100; no extra weather happiness.';
 }else if(weather?.type==='heat'&&includes(weatherTags.strenuousOutdoor,a.id)){
  applies=true;capReached=remaining.heat===0;heat=Math.min(4,remaining.heat);energy=clamp(p.energy+base.energy-heat)-clamp(p.energy+base.energy);
  summary=capReached?'Weekly extra heat cost reached (8 energy); no additional weather cost.':`Hot spell: ${heat} extra energy required (${remaining.heat-heat} of 8 remains this week). Indoor alternative: read at the library.`;
 }else if((weather?.type==='snow'||weather?.type==='cold')&&includes(weatherTags.cozy,a.id)){
  applies=true;capReached=remaining.recovery===0;recovery=Math.min(4,remaining.recovery,100-clamp(p.energy+base.energy));energy=recovery;
  summary=capReached?'Weekly weather recovery cap reached (+8); no extra recovery.':recovery?`Cozy winter recovery: +${recovery} energy (${remaining.recovery-recovery} of 8 remains this week).`:'Energy is already capped at 100; no extra weather recovery.';
 }
 return{joy,energy,remaining,summary,applies,capReached,joyUsed:joy,heatUsed:heat,recoveryUsed:recovery,requiredEnergy:Math.max(0,-base.energy+heat)};
}
export function weatherSummary(p:WeatherPlayer,a:WeatherActivity,g?:WeatherGame){return weatherEffect(p,a,g).summary;}
export function consumeWeather(p:WeatherPlayer,a:WeatherActivity,g:WeatherGame,base?:{joy:number;energy:number}){
 if(!getWeather(g))return;const e=weatherEffect(p,a,g,base);if(!e.applies)return;const u=currentWeatherUsage(p,g);p.weatherUsage={round:g.round,joy:u.joy+e.joyUsed,heat:u.heat+e.heatUsed,recovery:u.recovery+e.recoveryUsed};
}
export function seasonalStoryText(g:WeatherGame,n:{id:string;chapters:readonly {text:string}[]},stage:number):string{
 const original=n.chapters[stage-1]?.text||'';const w=getWeather(g);if(!w)return original;
 if(n.id==='eli'&&w.season==='winter')return[
  'Eli is keeping the shared beds alive inside the greenhouse. Help check the soil and plan the next tray of seedlings.',
  'The greenhouse seedlings are up. Help Eli insulate their trays before the cold night; there is room to work in the warm aisle.',
  'A crate of greenhouse tomatoes goes to the pantry. Eli gives you a carved leaf charm: a reminder that you helped this grow.'
 ][stage-1]||original;
 if(n.id==='mina'&&w.type==='rain'&&stage===3)return 'Rain taps the café windows as Mina spots you in the indoor front row. After the applause, she gives you the sunrise pin from her guitar case.';
 return original;
}
export function seasonalOpportunity<T extends {title:string;text:string}>(g:WeatherGame,base:T):T{
 if(!getWeather(g))return base;
 const variants=[
  ['Spring festival poster','Design a welcoming spring poster for the block.'],
  ['Rainy-day indoor market','Host the pop-up stalls inside the community hall, out of the rain.'],
  ['Summer craft showcase','Take the last table at the neighborhood’s summer makers’ fair.'],
  ['Cool-room neighborhood research','Listen to your neighbors from a shaded indoor meeting room.'],
  ['Autumn shop welcome','Help a new shop welcome the street beneath the autumn leaves.'],
  ['Rainy-day sign workshop','Bring the mural crew indoors to paint a sign for the block.'],
  ['Greenhouse harvest supper','Host a warm indoor supper with produce from the greenhouse.'],
  ['Winter lantern finale','Bring the block together for a warm final evening under lantern light.']
 ];const [title,text]=variants[g.round-1]||[base.title,base.text];return{...base,title,text};
}
