/** Authored, shared weather. Version 1 is frozen for persisted campaign compatibility. */
export type Season='spring'|'summer'|'autumn'|'winter';
export type WeatherType='sun'|'rain'|'heat'|'snow'|'cold';
export type WeatherId='spring-sun'|'spring-rain'|'summer-sun'|'summer-heat'|'autumn-sun'|'autumn-rain'|'winter-snow'|'winter-cold';
export type WeatherRegion='alder'|'saffron'|'glasssteppe'|'pelagia'|'embermesa';
export type WeatherAtmosphere='clear'|'rain'|'haze'|'fog'|'snow'|'wind'|'dust';
export type Weather={id:WeatherId;week:number;season:Season;type:WeatherType;label:string;description:string;effectSummary:string;chapter:number;chapterWeek:number;timeSkip:string;climate?:string;temperature?:'cold'|'cool'|'mild'|'warm'|'hot';moisture?:'dry'|'showers'|'wet';exposure?:{outdoor:number;strenuous:number;travel:number};region?:WeatherRegion;atmosphere?:WeatherAtmosphere};
export type WeatherUsage={round:number;joy:number;heat:number;recovery:number;exposure?:number};
type WeatherLocationPlayer={world?:{version:number;region:string}};
type WeatherGame={round:number;climateVersion?:number;rulesVersion?:number;environmentVersion?:number;weatherSchedule?:readonly WeatherId[];lifeVersion?:number;lifeSeed?:number;code?:string;turn?:number;players?:readonly WeatherLocationPlayer[];storyVersion?:number;economyVersion?:number};
type WeatherPlayer=WeatherLocationPlayer&{joy:number;energy:number;weatherUsage?:WeatherUsage};
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
const chapterMonths=['Month 1 · Spring begins.','Month 3 · Summer begins.','Month 5 · Autumn begins.','Month 7 · Winter begins.'];
const monthlyCampaign=(g?:WeatherGame)=>g?.storyVersion===1&&g.economyVersion===1;
/** Period labels are opt-in; persisted schedules, effect amounts and cap accounting stay frozen. */
function periodText(g:WeatherGame|undefined,text:string){return monthlyCampaign(g)?text.replace(/\bWeekly\b/g,'Monthly').replace(/\bweekly\b/g,'monthly').replace(/\bweeks\b/g,'months').replace(/\bweek\b/g,'month'):text;}
function chapterStart(g:WeatherGame,index:number){return index%2===0?(monthlyCampaign(g)?chapterMonths:chapterSkips)[Math.floor(index/2)]:'';}
type RegionalCondition={type:WeatherType;label:string;description:string;atmosphere:WeatherAtmosphere};
const local=(type:WeatherType,label:string,description:string,atmosphere:WeatherAtmosphere=type==='heat'?'haze':type==='cold'?'clear':type==='sun'?'clear':type)=>({type,label,description,atmosphere});
/** Regional conditions are opt-in. IDs remain the original render/effect families; season
 * describes the current chapter even when a maritime winter brings rain rather than snow.
 * No runtime imports: world-life can share these pure helpers without creating a cycle.
 */
const regionalClimates:Record<WeatherRegion,{name:string;seasons:Record<Season,readonly [RegionalCondition,RegionalCondition]>}>={
 alder:{name:'Alder Quay',seasons:{
  spring:[local('sun','Mild riverside sun','Blossoms open beside brick terraces. Willow shade and the ferry path invite a slow walk.'),local('rain','Soft spring rain','Rain freckles the river. The café, library and covered workshop feel especially welcoming.')],
  summer:[local('sun','Long river light','Warm light reaches the allotments; the river breeze leaves room for picnics.'),local('heat','Still quayside heat','The sheltered quay holds the heat. Strenuous outdoor work asks for more energy.')],
  autumn:[local('sun','Crisp riverside light','Amber leaves collect beside the ferry steps. Clear air rewards a walk.'),local('rain','Windy quay showers','Showers sweep along the river while warm windows glow behind the brick façades.')],
  winter:[local('snow','Light quayside snow','A quiet dusting settles on rooftops. Greenhouses and warm reading rooms stay open.'),local('cold','Frost beside the ferry','Clear cold outlines the mooring ropes. A warm meal or indoor rest restores more energy.')]
 }},
 saffron:{name:'Saffron Reach',seasons:{
  spring:[local('sun','Warm canal light','Sun warms the ochre arcades. Narrow bridges and shaded gardens invite an easy stroll.'),local('rain','Brief canal showers','Gentle rain ripples the canals; covered arcades keep the cafés and craft tables comfortable.')],
  summer:[local('heat','High canal heat','Heat lingers between the courtyards. Run errands in the shade and save energy for outdoor work.'),local('sun','Canal breeze','A mild breeze follows the water through the arcades. Shaded garden leisure feels especially good.')],
  autumn:[local('sun','Golden courtyard warmth','Courtyards hold the afternoon warmth while market awnings throw long shadows.'),local('rain','Warm autumn showers','Rain beads on ceramic roofs. Covered cafés and creative work offer a pleasant pause.')],
  winter:[local('rain','Cool canal rain','Cool rain falls between the arcades without snow. Indoor gatherings make the wet week brighter.'),local('cold','Cool canal evenings','The canals remain open, but evenings turn cool. Warm food and indoor rest are especially restorative.')]
 }},
 glasssteppe:{name:'Glasssteppe',seasons:{
  spring:[local('cold','Cool hillside fog','Low fog curls around the elevated rails. A warm book nook or bowl of broth helps after the climb.','fog'),local('rain','Fine highland drizzle','Fine rain darkens the retaining walls. The railway hall and copper workshops offer shelter.')],
  summer:[local('sun','Clear highland light','The plateau stays mild beneath bright skies. Terraced paths and reading gardens invite a walk.'),local('cold','Summer hill fog','Cool fog returns above the switchbacks even in summer. Indoor rest and warm meals restore more energy.','fog')],
  autumn:[local('cold','Copper-roof mist','Mist blurs the copper roofs and cools the terraces. Warm indoor places make useful stopping points.','fog'),local('rain','Highland rain','Steady rain follows the railway uphill. Reading rooms and workshops provide a sheltered alternative.')],
  winter:[local('snow','Soft highland snow','Soft snow edges the stairs and railings. The station stays open and neighbors gather indoors.'),local('cold','Bright plateau frost','Clear frost settles between the stone terraces. Warm cooking, reading and rest restore extra energy.')]
 }},
 pelagia:{name:'Pelagia',seasons:{
  spring:[local('rain','Tidal spring showers','Passing showers stipple the flood basins. Raised walkways and the glazed café remain open.'),local('sun','Bright tidal breeze','Bright light crosses the domes at low tide. The raised promenade makes a pleasant walking route.')],
  summer:[local('sun','Clear island morning','Sea air softens the sunshine. Harbor gardens and the raised promenade reward a slow visit.'),local('rain','Warm island showers','Brief maritime showers pass over the glass domes. Sheltered reading and café visits lift the mood.')],
  autumn:[local('rain','Harbor rain and wind','Ordinary sea wind pushes rain past the tide gates. Covered harbor rooms are warm and welcoming.'),local('cold','Brisk salt-air wind','A brisk salt breeze crosses the raised walkways. Warm food and sheltered rest help after time outside.','wind')],
  winter:[local('rain','Mild winter harbor rain','The sea keeps winter mild and wet. Tide gates follow their usual schedule and indoor gatherings stay lively.'),local('cold','Cool tidal wind','Cool wind moves across the working harbor. Homes, ferries and the raised paths remain open.','wind')]
 }},
 embermesa:{name:'Ember Mesa',seasons:{
  spring:[local('sun','Clear desert morning','Dry, clear light warms the timber boardwalks. Cottonwood shade makes an easy walk rewarding.'),local('heat','Warm dusty afternoon','A little wind lifts dry dust beyond the station. Warm outdoor work takes extra energy.','dust')],
  summer:[local('heat','Dry mesa heat','Strong dry heat settles over the railway town. Water, shade and indoor alternatives make the day gentler.'),local('heat','Dusty summer warmth','A light veil of dust hangs beyond the boardwalks. Strenuous outdoor work asks for extra energy.','dust')],
  autumn:[local('sun','Golden boardwalk light','Low sun warms the shopfronts. The cottonwood paths and kitchen garden are pleasant places to linger.'),local('cold','Cool desert evenings','The mesa cools quickly after sunset. The diner and a warm home meal restore more energy.')],
  winter:[local('sun','Clear winter desert light','Dry sunshine reaches the boardwalk at midday. A sheltered walk is pleasant; evenings still turn cool.'),local('cold','Cold clear mesa night','Clear skies bring a cold evening without snow. Warm cooking, reading and indoor rest are restorative.')]
 }}
};
/** Climate version 1 is a new-room rule. The earlier regional table above remains frozen. */
type ClimateCondition=RegionalCondition&Required<Pick<Weather,'temperature'|'moisture'|'exposure'>>;
const climateCondition=(type:WeatherType,temperature:ClimateCondition['temperature'],moisture:ClimateCondition['moisture'],label:string,description:string,heavy=false):ClimateCondition=>({
 ...local(type,label,description),temperature,moisture,
 exposure:{outdoor:temperature==='hot'||temperature==='cold'||heavy?2:0,strenuous:temperature==='hot'?4:temperature==='cold'||heavy?3:moisture==='wet'?2:0,travel:heavy?3:temperature==='hot'||temperature==='cold'?2:moisture==='wet'?1:0}
});
const cc=climateCondition;
export const climateProfiles:Record<WeatherRegion,{name:string;description:string;seasons:Record<Season,readonly [ClimateCondition,ClimateCondition]>}>={
 alder:{name:'Cool maritime',description:'A temperate river port, moderated by the sea: cool wet winters and gentle summers.',seasons:{
 spring:[cc('sun','mild','dry','Mild riverside sun','A break between coastal showers opens the riverside paths and allotments.'),cc('rain','cool','wet','Soft spring rain','Frequent coastal rain wets the ferry paths. The café and public reading room offer shelter.')],
 summer:[cc('sun','warm','dry','Warm river breeze','Sea air keeps the summer comfortable. Long light favors picnics and garden leisure.'),cc('rain','mild','showers','Passing summer showers','Brief coastal showers cool the quay. Covered café tables make a useful alternative.')],
 autumn:[cc('sun','cool','dry','Crisp riverside light','Cool clear air returns between fronts. A sheltered riverside walk is inviting.'),cc('rain','cool','wet','Windy quay rain','A coastal front brings sustained rain. Outdoor work and exposed ferry approaches take more energy.')],
 winter:[cc('rain','cool','wet','Wet maritime winter','The sea keeps most winter precipitation liquid. Warm public rooms stay open beside rain-dark streets.'),cc('sun','cool','dry','Clear winter interval','A bright cool interval follows the rain. The river remains open and sheltered walks are comfortable.')]
 }},
 saffron:{name:'Mediterranean',description:'A sheltered warm-sea canal port: hot dry summers and mild wetter winters.',seasons:{
 spring:[cc('sun','warm','dry','Warm canal spring','Winter rain has fed the gardens. Dry warm days invite courtyard walks.'),cc('rain','mild','showers','Last spring showers','Late showers ripple the canals before the summer dry season. Arcades shelter cafés and makers.')],
 summer:[cc('heat','hot','dry','Dry Mediterranean heat','Rain is scarce and stone courtyards hold the heat. Save energy with shaded routes and indoor breaks.'),cc('sun','warm','dry','Dry canal breeze','Dry summer warmth eases in the sea breeze. Shaded gardens reward a slow visit.')],
 autumn:[cc('sun','warm','dry','Golden courtyard warmth','Warm dry days linger before the seasonal rains. Courtyard picnics are inviting.'),cc('rain','mild','wet','Autumn rains return','The first sustained rains replenish the gardens. Covered craft tables offer a sheltered alternative.')],
 winter:[cc('rain','mild','wet','Mild Mediterranean rain','Mild wet weather fills the canals without a freeze. Outdoor work is tiring; covered gatherings stay lively.'),cc('sun','mild','dry','Mild winter sunshine','A mild sunny break between winter rains opens the courtyard gardens. There is no routine snow or hard frost.')]
 }},
 glasssteppe:{name:'Continental highland',description:'An inland plateau: cold relatively dry winters, retained snow and short mild summers.',seasons:{
 spring:[cc('cold','cold','dry','Late plateau frost','Cold nights linger on the inland plateau. Meltwater runs below old snowbanks; a warm reading room is restorative.'),cc('rain','cool','showers','Highland thaw showers','Brief spring showers reach the terraces as the snow retreats. Workshops offer shelter.')],
 summer:[cc('sun','mild','dry','Short highland summer','Mild clear days open the stepped gardens during the plateau’s short growing season.'),cc('sun','mild','dry','Bright plateau interval','Dry mild air makes this a good month for terrace walks and outdoor work before autumn cools.')],
 autumn:[cc('sun','cool','dry','Dry copper-roof autumn','Clear cool days arrive early inland. Garden paths remain inviting before the first hard frost.'),cc('cold','cold','dry','Early highland frost','Dry continental air cools sharply. Outdoor effort takes more energy; warm meals help recovery.')],
 winter:[cc('snow','cold','dry','Light snow on frozen terraces','A modest snowfall stays on frozen ground through the dry cold. The railway and warm public rooms remain open.'),cc('cold','cold','dry','Dry continental cold','Clear bitter air preserves earlier snow between the terraces. Plan an indoor rest before exposed journeys.')]
 }},
 pelagia:{name:'Tropical monsoon',description:'A warm humid island harbor: heavy summer and autumn rain, with warmer drier intervals year-round.',seasons:{
 spring:[cc('sun','warm','dry','Warm trade-wind interval','Warm sea breezes open a drier interval. Raised promenade walks and harbor gardens are inviting.'),cc('heat','hot','showers','Humid pre-monsoon heat','Humidity builds before the rains. Shaded indoor breaks ease strenuous outdoor work.')],
 summer:[cc('rain','warm','wet','Summer monsoon rain','Heavy seasonal rain sweeps the harbor. Raised paths remain open, but exposed travel and outdoor work take extra energy.',true),cc('rain','warm','wet','Warm monsoon downpours','Another wet spell fills the working basins. Sheltered café, reading and repair sessions offer useful alternatives.',true)],
 autumn:[cc('rain','warm','wet','Late monsoon rain','Heavy late-season rain continues around the tide gates. Plan energy for wet crossings and rest indoors.',true),cc('sun','warm','showers','Monsoon break','Warm sunshine returns between showers. The raised promenade offers a welcome outdoor interval.')],
 winter:[cc('sun','warm','dry','Warm dry-season breeze','The tropical sea stays warm through winter. Drier trade winds favor walks along the raised gardens.'),cc('rain','warm','showers','Warm trade-wind showers','Brief warm showers pass over the harbor. Sheltered activities lift the mood; snow and winter cold do not belong here.')]
 }},
 embermesa:{name:'Hot arid',description:'A dry inland desert: intense summer heat, little rain and quick cooling after sunset.',seasons:{
 spring:[cc('sun','warm','dry','Clear desert spring','Dry warmth reaches the boardwalks. Cottonwood shade makes a slow walk rewarding.'),cc('heat','hot','dry','Hot dry spring afternoon','The inland air heats quickly. Shade and indoor work conserve energy.')],
 summer:[cc('heat','hot','dry','Intense dry mesa heat','Strong desert heat makes outdoor effort tiring. The diner, repair shop and home offer shade and recovery.'),{...cc('heat','hot','dry','Dusty summer heat','Hot dry wind lifts dust beyond town. Plan rest around journeys and strenuous outdoor work.'),atmosphere:'dust'}],
 autumn:[cc('sun','warm','dry','Golden boardwalk warmth','Dry warm days return after the summer peak. Cottonwood paths are comfortable again.'),cc('cold','cold','dry','Cold clear desert evening','Heat escapes quickly after sunset. A warm meal or indoor rest restores extra energy.')],
 winter:[cc('sun','mild','dry','Mild winter desert day','Dry sunshine warms the boardwalk at midday, although clear nights still turn cold.'),cc('cold','cold','dry','Cold desert night','A cold clear night follows a mild desert day. Sheltered rest helps before an exposed journey.')]
 }}
};
const seasons:readonly Season[]=['spring','summer','autumn','winter'];
function regionalPlayer(g:WeatherGame,p?:WeatherLocationPlayer|null):WeatherRegion|null{
 const candidate=p===undefined?g.players?.[g.turn??0]:p;
 const w=candidate?.world;
 return g.lifeVersion===1&&w?.version===1&&Object.hasOwn(regionalClimates,w.region)?w.region as WeatherRegion:null;
}
function regionalSeed(g:WeatherGame,region:WeatherRegion,chapter:number){
 // Room code is public on both server and sanitized client snapshots. Private lifeSeed
 // must never influence weather or the displayed forecast would disagree with effects.
 const text=`${g.code??'crosswalk'}:${region}:${chapter}`;let hash=2166136261;
 for(let i=0;i<text.length;i++)hash=Math.imul(hash^text.charCodeAt(i),16777619);
 return hash>>>0;
}
function conditionId(type:WeatherType,season:Season):WeatherId{
 if(type==='heat')return'summer-heat';if(type==='snow')return'winter-snow';if(type==='cold')return'winter-cold';
 if(type==='rain')return season==='autumn'||season==='winter'?'autumn-rain':'spring-rain';
 return season==='spring'?'spring-sun':season==='summer'?'summer-sun':'autumn-sun';
}
function regionalWeather(g:WeatherGame,region:WeatherRegion):Weather[]{
 const climate=regionalClimates[region];
 return weatherSchedule.map((_,i)=>{
  const chapter=Math.floor(i/2),season=seasons[chapter];
  // Each season shows both authored local conditions; travel and reload never reroll them.
  const offset=region==='alder'&&chapter===0?0:regionalSeed(g,region,chapter)%2;
  const profile=g.climateVersion===1?climateProfiles[region]:undefined;
  const c=(profile??climate).seasons[season][(i%2+offset)%2];
  const rule=c.type==='sun'?sunRule:c.type==='rain'?rainRule:c.type==='heat'?heatRule:winterRule;
  return{id:conditionId(c.type,season),week:i+1,season,...c,...(profile?{climate:profile.name}:{}),description:periodText(g,c.description),label:`${climate.name} · ${c.label}`,effectSummary:periodText(g,profile?`${profile.name}. ${rule} Exposed activities and regional journeys may cost extra energy, sharing a maximum of 8 extra energy per player this month. Exact costs appear before confirming. Rest at home is free of weather costs.`:`${climate.name}: ${rule}`),region,chapter:chapter+1,chapterWeek:i%2+1,timeSkip:chapterStart(g,i)};
 });
}
export function createEnvironment(){return{environmentVersion:1 as const,weatherSchedule:[...weatherSchedule]};}
export function campaignWeather(g:WeatherGame,p?:WeatherLocationPlayer|null):Weather[]{
 if(g.environmentVersion!==1||g.rulesVersion!==2)return[];
 const region=regionalPlayer(g,p);if(region)return regionalWeather(g,region);
 return weatherSchedule.map((fallback,i)=>{const id=g.weatherSchedule?.[i];const c=id&&weatherSchedule.includes(id)?conditions[id]:conditions[fallback];return{...c,description:periodText(g,c.description),effectSummary:periodText(g,c.effectSummary),week:i+1,chapter:Math.floor(i/2)+1,chapterWeek:i%2+1,timeSkip:chapterStart(g,i)};});
}
export function getWeather(g?:WeatherGame|null,p?:WeatherLocationPlayer|null):Weather|null{return g?campaignWeather(g,p)[g.round-1]||null:null;}
export function nextWeather(g?:WeatherGame|null,p?:WeatherLocationPlayer|null):Weather|null{return g?campaignWeather(g,p)[g.round]||null:null;}
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
 if(g?.climateVersion===1&&getWeather(g,p)?.climate)return climateEffect(p,a,g,base);
 const weather=getWeather(g,p),usage=currentWeatherUsage(p,g),remaining={joy:4-usage.joy,heat:8-usage.heat,recovery:8-usage.recovery};
 let joy=0,energy=0,heat=0,recovery=0,applies=false,capReached=false,summary='';
 if(weather?.type==='sun'&&includes(weatherTags.outdoorLeisure,a.id)||weather?.type==='rain'&&includes(weatherTags.sheltered,a.id)){
  applies=true;capReached=remaining.joy===0;joy=Math.min(2,remaining.joy,100-clamp(p.joy+base.joy));
  summary=capReached?'Weekly weather happiness cap reached (+4); no extra happiness.':joy?`${weather!.label}: +${joy} weather happiness (${remaining.joy-joy} of 4 remains this week).`:'Happiness is already capped at 100; no extra weather happiness.';
 }else if(weather?.type==='heat'&&includes(weatherTags.strenuousOutdoor,a.id)){
  applies=true;capReached=remaining.heat===0;heat=Math.min(4,remaining.heat);energy=clamp(p.energy+base.energy-heat)-clamp(p.energy+base.energy);
  summary=capReached?'Weekly extra heat cost reached (8 energy); no additional weather cost.':`${weather?.region?weather.label:'Hot spell'}: ${heat} extra energy required (${remaining.heat-heat} of 8 remains this week). Indoor alternative: read at the library.`;
 }else if((weather?.type==='snow'||weather?.type==='cold')&&includes(weatherTags.cozy,a.id)){
  applies=true;capReached=remaining.recovery===0;recovery=Math.min(4,remaining.recovery,100-clamp(p.energy+base.energy));energy=recovery;
  summary=capReached?'Weekly weather recovery cap reached (+8); no extra recovery.':recovery?`${weather?.region?weather.label+' · Cozy recovery':'Cozy winter recovery'}: +${recovery} energy (${remaining.recovery-recovery} of 8 remains this week).`:'Energy is already capped at 100; no extra weather recovery.';
 }
 return{joy,energy,remaining,summary:periodText(g,summary),applies,capReached,joyUsed:joy,heatUsed:heat,recoveryUsed:recovery,requiredEnergy:Math.max(0,-base.energy+heat)};
}
export function weatherSummary(p:WeatherPlayer,a:WeatherActivity,g?:WeatherGame){return weatherEffect(p,a,g).summary;}
export function consumeWeather(p:WeatherPlayer,a:WeatherActivity,g:WeatherGame,base?:{joy:number;energy:number}){
 if(g.climateVersion===1&&getWeather(g,p)?.climate){consumeClimateEffect(p,g,climateEffect(p,a,g,base));return;}
 if(!getWeather(g,p))return;const e=weatherEffect(p,a,g,base);if(!e.applies)return;const u=currentWeatherUsage(p,g);p.weatherUsage={round:g.round,joy:u.joy+e.joyUsed,heat:u.heat+e.heatUsed,recovery:u.recovery+e.recoveryUsed};
}
/** All new-climate exposure, including travel, shares one per-player monthly budget. */
export function climateExposureRemaining(p:WeatherPlayer,g:WeatherGame){return 8-Math.max(0,Math.min(8,p.weatherUsage?.round===g.round?p.weatherUsage.exposure||0:0));}
export function climateEffect(p:WeatherPlayer,a:WeatherActivity,g:WeatherGame,base={joy:a.joy||0,energy:a.energy||0}){
 const weather=getWeather(g,p)!,usage=currentWeatherUsage(p,g),remaining={joy:4-usage.joy,heat:8-usage.heat,recovery:8-usage.recovery},available=climateExposureRemaining(p,g);
 const strenuous=includes(weatherTags.strenuousOutdoor,a.id),outdoor=includes(weatherTags.outdoorLeisure,a.id)||a.id==='explore';
 const exposure=Math.min(available,strenuous?weather.exposure?.strenuous||0:outdoor?weather.exposure?.outdoor||0:0);
 const pleasant=weather.type==='sun'&&outdoor,cozy=(weather.type==='cold'||weather.type==='snow')&&includes(weatherTags.cozy,a.id);
 const sheltered=weather.type==='rain'&&(includes(weatherTags.sheltered,a.id)||a.id==='weekly_opportunity');
 const joy=pleasant||sheltered?Math.min(2,remaining.joy,100-clamp(p.joy+base.joy)):0;
 const recovery=cozy?Math.min(4,remaining.recovery,100-clamp(p.energy+base.energy)):0;
 const energy=clamp(p.energy+base.energy-exposure)-clamp(p.energy+base.energy)+recovery;
 const applies=pleasant||sheltered||cozy||!!(strenuous?weather.exposure?.strenuous:outdoor?weather.exposure?.outdoor:0);
 const capReached=applies&&(pleasant||sheltered?remaining.joy===0:cozy?remaining.recovery===0:available===0);
 const notes=[];
 if(exposure)notes.push(`${exposure} extra energy for exposed activity (${available-exposure} of 8 remains this month). Rest at home or choose a sheltered café activity.`);
 if(joy)notes.push(`+${joy} weather happiness (${remaining.joy-joy} of 4 remains this month).`);
 if(recovery)notes.push(`+${recovery} indoor recovery (${remaining.recovery-recovery} of 8 remains this month).`);
 if(capReached)notes.push('Monthly weather limit reached; no additional weather adjustment.');
 if(applies&&!notes.length)notes.push('Your resources are already full; no extra weather benefit.');
 const storySummary=exposure?`${weather.label}. This exposed activity is more tiring; a sheltered café break or rest at home is an alternative.`:joy?`${weather.label}. ${sheltered?'Sheltered company makes the wet weather feel gentler.':'An unhurried outdoor visit makes the most of the pleasant weather.'}`:recovery?`${weather.label}. A warm indoor break is especially restorative.`:applies?`${weather.label}. Any weather adjustment is already included in your preview.`:'';
 return{joy,energy,remaining,storySummary,summary:applies?`${weather.label}: ${notes.join(' ')}`:'',applies,capReached,joyUsed:joy,heatUsed:0,recoveryUsed:recovery,exposureUsed:exposure,requiredEnergy:Math.max(0,-base.energy+exposure)};
}
export function consumeClimateEffect(p:WeatherPlayer,g:WeatherGame,e:{joyUsed:number;recoveryUsed:number;exposureUsed:number}){
 const u=currentWeatherUsage(p,g);p.weatherUsage={...u,joy:u.joy+e.joyUsed,recovery:u.recovery+e.recoveryUsed,exposure:8-climateExposureRemaining(p,g)+e.exposureUsed};
}
/** Regional journeys use both endpoints before moving; charge the worse, never both. */
export function climateTravelEffect(p:WeatherPlayer,g:WeatherGame,destination:WeatherRegion){
 const from=getWeather(g,p),to=getWeather(g,{world:{version:1,region:destination}});
 if(g.climateVersion!==1||!from?.climate||!to?.climate)return null;
 const available=climateExposureRemaining(p,g),cost=Math.min(available,Math.max(from.exposure?.travel||0,to.exposure?.travel||0));
 return{joy:0,joyUsed:0,recoveryUsed:0,exposureUsed:cost,energy:cost?-cost:0,requiredEnergy:cost,storySummary:`Departure: ${from.label}. Arrival: ${to.label}. ${cost?'The exposed approaches make this journey more tiring; rest at home first if needed.':'The route stays open.'} There is no extra fare or time.`,summary:`Departure: ${from.label}. Arrival: ${to.label}. Weather adds ${cost} energy to this journey; no extra fare or time. ${cost?`${available-cost} of 8 monthly exposure energy remains. Rest at home first if needed.`:'The route stays open.'}`};
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
 const weather=getWeather(g);if(!weather)return base;
 if(weather.climate){const title=weather.type==='rain'?'Covered neighborhood gathering':weather.type==='heat'?'Shaded community showcase':weather.type==='cold'||weather.type==='snow'?'Warm-room neighborhood supper':'Open-air neighborhood showcase';return{...base,title:`${weather.region?regionalClimates[weather.region].name+' · ':''}${title}`,text:`${weather.description} The local opening adapts to the forecast. ${weather.type==='sun'?'Meet in the sheltered community courtyard.':'Use the indoor community room.'} The reward and any weather benefit are included in your preview.`};}
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
