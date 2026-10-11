/** Authored regional climates shared by previews and action settlement. */
export type Season = 'spring' | 'summer' | 'autumn' | 'winter';
export type WeatherType = 'sun' | 'rain' | 'heat' | 'snow' | 'cold';
export type WeatherId = 'spring-sun' | 'spring-rain' | 'summer-sun' | 'summer-heat' | 'autumn-sun' | 'autumn-rain' | 'winter-snow' | 'winter-cold';
export type WeatherRegion = 'alder' | 'saffron' | 'glasssteppe' | 'pelagia' | 'embermesa';
export type WeatherAtmosphere = 'clear' | 'rain' | 'haze' | 'fog' | 'snow' | 'wind' | 'dust';
export type Weather = {
    id: WeatherId;
    week: number;
    season: Season;
    type: WeatherType;
    label: string;
    description: string;
    effectSummary: string;
    chapter: number;
    chapterWeek: number;
    timeSkip: string;
    climate?: string;
    temperature?: 'cold' | 'cool' | 'mild' | 'warm' | 'hot';
    moisture?: 'dry' | 'showers' | 'wet';
    exposure?: {
        outdoor: number;
        strenuous: number;
        travel: number;
    };
    region?: WeatherRegion;
    atmosphere?: WeatherAtmosphere;
};
export type WeatherUsage = {
    round: number;
    joy: number;
    heat: number;
    recovery: number;
    exposure?: number;
};
type WeatherLocationPlayer = {
    world?: {
        version: number;
        region: string;
    };
};
type WeatherGame = {
    round: number;
    weatherSchedule?: readonly WeatherId[];
    lifeSeed?: number;
    code?: string;
    turn?: number;
    players?: readonly WeatherLocationPlayer[];
};
type WeatherPlayer = WeatherLocationPlayer & {
    joy: number;
    energy: number;
    weatherUsage?: WeatherUsage;
};
type WeatherActivity = {
    id: string;
    joy?: number;
    energy?: number;
};
const sunRule = 'Walks, picnics and garden leisure gain +2 happiness, up to +4 weather happiness per player this week.';
const rainRule = 'Sheltered café, library, repair and creative activities gain +2 happiness, up to +4 per player this week.';
const heatRule = 'Runs, courier routes, harvests and outdoor setup cost 4 extra energy, up to 8 extra energy per player this week.';
const winterRule = 'Cozy indoor rest, reading and cooking restore 4 extra energy, up to 8 weather recovery per player this week.';
export const weatherSchedule: readonly WeatherId[] = Object.freeze(['spring-sun', 'spring-rain', 'summer-sun', 'summer-heat', 'autumn-sun', 'autumn-rain', 'winter-snow', 'winter-cold']);




const chapterMonths = ['Month 1 · Spring begins.', 'Month 3 · Summer begins.', 'Month 5 · Autumn begins.', 'Month 7 · Winter begins.'];


function periodText(_g:WeatherGame|undefined,text:string){return text.replace(/\bWeekly\b/g,'Monthly').replace(/\bweekly\b/g,'monthly').replace(/\bweeks\b/g,'months').replace(/\bweek\b/g,'month');}

function chapterStart(_g:WeatherGame,index:number){return index%2===0?chapterMonths[Math.floor(index/2)]:'';}

type RegionalCondition = {
    type: WeatherType;
    label: string;
    description: string;
    atmosphere: WeatherAtmosphere;
};
const local = (type: WeatherType, label: string, description: string, atmosphere: WeatherAtmosphere = type === 'heat' ? 'haze' : type === 'cold' ? 'clear' : type === 'sun' ? 'clear' : type) => ({ type, label, description, atmosphere });
const regionNames:Record<WeatherRegion,string>={alder:'Alder Quay',saffron:'Saffron Reach',glasssteppe:'Glasssteppe',pelagia:'Pelagia',embermesa:'Ember Mesa'};

/** One authored climate model applies to every current campaign. */
type ClimateCondition = RegionalCondition & Required<Pick<Weather, 'temperature' | 'moisture' | 'exposure'>>;
const climateCondition = (type: WeatherType, temperature: ClimateCondition['temperature'], moisture: ClimateCondition['moisture'], label: string, description: string, heavy = false): ClimateCondition => ({
    ...local(type, label, description), temperature, moisture,
    exposure: { outdoor: temperature === 'hot' || temperature === 'cold' || heavy ? 2 : 0, strenuous: temperature === 'hot' ? 4 : temperature === 'cold' || heavy ? 3 : moisture === 'wet' ? 2 : 0, travel: heavy ? 3 : temperature === 'hot' || temperature === 'cold' ? 2 : moisture === 'wet' ? 1 : 0 }
});
const cc = climateCondition;
export const climateProfiles: Record<WeatherRegion, {
    name: string;
    description: string;
    seasons: Record<Season, readonly [
        ClimateCondition,
        ClimateCondition
    ]>;
}> = {
    alder: { name: 'Cool maritime', description: 'A temperate river port, moderated by the sea: cool wet winters and gentle summers.', seasons: {
            spring: [cc('sun', 'mild', 'dry', 'Mild riverside sun', 'A break between coastal showers opens the riverside paths and allotments.'), cc('rain', 'cool', 'wet', 'Soft spring rain', 'Frequent coastal rain wets the ferry paths. The café and public reading room offer shelter.')],
            summer: [cc('sun', 'warm', 'dry', 'Warm river breeze', 'Sea air keeps the summer comfortable. Long light favors picnics and garden leisure.'), cc('rain', 'mild', 'showers', 'Passing summer showers', 'Brief coastal showers cool the quay. Covered café tables make a useful alternative.')],
            autumn: [cc('sun', 'cool', 'dry', 'Crisp riverside light', 'Cool clear air returns between fronts. A sheltered riverside walk is inviting.'), cc('rain', 'cool', 'wet', 'Windy quay rain', 'A coastal front brings sustained rain. Outdoor work and exposed ferry approaches take more energy.')],
            winter: [cc('rain', 'cool', 'wet', 'Wet maritime winter', 'The sea keeps most winter precipitation liquid. Warm public rooms stay open beside rain-dark streets.'), cc('sun', 'cool', 'dry', 'Clear winter interval', 'A bright cool interval follows the rain. The river remains open and sheltered walks are comfortable.')]
        } },
    saffron: { name: 'Mediterranean', description: 'A sheltered warm-sea canal port: hot dry summers and mild wetter winters.', seasons: {
            spring: [cc('sun', 'warm', 'dry', 'Warm canal spring', 'Winter rain has fed the gardens. Dry warm days invite courtyard walks.'), cc('rain', 'mild', 'showers', 'Last spring showers', 'Late showers ripple the canals before the summer dry season. Arcades shelter cafés and makers.')],
            summer: [cc('heat', 'hot', 'dry', 'Dry Mediterranean heat', 'Rain is scarce and stone courtyards hold the heat. Save energy with shaded routes and indoor breaks.'), cc('sun', 'warm', 'dry', 'Dry canal breeze', 'Dry summer warmth eases in the sea breeze. Shaded gardens reward a slow visit.')],
            autumn: [cc('sun', 'warm', 'dry', 'Golden courtyard warmth', 'Warm dry days linger before the seasonal rains. Courtyard picnics are inviting.'), cc('rain', 'mild', 'wet', 'Autumn rains return', 'The first sustained rains replenish the gardens. Covered craft tables offer a sheltered alternative.')],
            winter: [cc('rain', 'mild', 'wet', 'Mild Mediterranean rain', 'Mild wet weather fills the canals without a freeze. Outdoor work is tiring; covered gatherings stay lively.'), cc('sun', 'mild', 'dry', 'Mild winter sunshine', 'A mild sunny break between winter rains opens the courtyard gardens. There is no routine snow or hard frost.')]
        } },
    glasssteppe: { name: 'Continental highland', description: 'An inland plateau: cold relatively dry winters, retained snow and short mild summers.', seasons: {
            spring: [cc('cold', 'cold', 'dry', 'Late plateau frost', 'Cold nights linger on the inland plateau. Meltwater runs below old snowbanks; a warm reading room is restorative.'), cc('rain', 'cool', 'showers', 'Highland thaw showers', 'Brief spring showers reach the terraces as the snow retreats. Workshops offer shelter.')],
            summer: [cc('sun', 'mild', 'dry', 'Short highland summer', 'Mild clear days open the stepped gardens during the plateau’s short growing season.'), cc('sun', 'mild', 'dry', 'Bright plateau interval', 'Dry mild air makes this a good month for terrace walks and outdoor work before autumn cools.')],
            autumn: [cc('sun', 'cool', 'dry', 'Dry copper-roof autumn', 'Clear cool days arrive early inland. Garden paths remain inviting before the first hard frost.'), cc('cold', 'cold', 'dry', 'Early highland frost', 'Dry continental air cools sharply. Outdoor effort takes more energy; warm meals help recovery.')],
            winter: [cc('snow', 'cold', 'dry', 'Light snow on frozen terraces', 'A modest snowfall stays on frozen ground through the dry cold. The railway and warm public rooms remain open.'), cc('cold', 'cold', 'dry', 'Dry continental cold', 'Clear bitter air preserves earlier snow between the terraces. Plan an indoor rest before exposed journeys.')]
        } },
    pelagia: { name: 'Tropical monsoon', description: 'A warm humid island harbor: heavy summer and autumn rain, with warmer drier intervals year-round.', seasons: {
            spring: [cc('sun', 'warm', 'dry', 'Warm trade-wind interval', 'Warm sea breezes open a drier interval. Raised promenade walks and harbor gardens are inviting.'), cc('heat', 'hot', 'showers', 'Humid pre-monsoon heat', 'Humidity builds before the rains. Shaded indoor breaks ease strenuous outdoor work.')],
            summer: [cc('rain', 'warm', 'wet', 'Summer monsoon rain', 'Heavy seasonal rain sweeps the harbor. Raised paths remain open, but exposed travel and outdoor work take extra energy.', true), cc('rain', 'warm', 'wet', 'Warm monsoon downpours', 'Another wet spell fills the working basins. Sheltered café, reading and repair sessions offer useful alternatives.', true)],
            autumn: [cc('rain', 'warm', 'wet', 'Late monsoon rain', 'Heavy late-season rain continues around the tide gates. Plan energy for wet crossings and rest indoors.', true), cc('sun', 'warm', 'showers', 'Monsoon break', 'Warm sunshine returns between showers. The raised promenade offers a welcome outdoor interval.')],
            winter: [cc('sun', 'warm', 'dry', 'Warm dry-season breeze', 'The tropical sea stays warm through winter. Drier trade winds favor walks along the raised gardens.'), cc('rain', 'warm', 'showers', 'Warm trade-wind showers', 'Brief warm showers pass over the harbor. Sheltered activities lift the mood; snow and winter cold do not belong here.')]
        } },
    embermesa: { name: 'Hot arid', description: 'A dry inland desert: intense summer heat, little rain and quick cooling after sunset.', seasons: {
            spring: [cc('sun', 'warm', 'dry', 'Clear desert spring', 'Dry warmth reaches the boardwalks. Cottonwood shade makes a slow walk rewarding.'), cc('heat', 'hot', 'dry', 'Hot dry spring afternoon', 'The inland air heats quickly. Shade and indoor work conserve energy.')],
            summer: [cc('heat', 'hot', 'dry', 'Intense dry mesa heat', 'Strong desert heat makes outdoor effort tiring. The diner, repair shop and home offer shade and recovery.'), { ...cc('heat', 'hot', 'dry', 'Dusty summer heat', 'Hot dry wind lifts dust beyond town. Plan rest around journeys and strenuous outdoor work.'), atmosphere: 'dust' }],
            autumn: [cc('sun', 'warm', 'dry', 'Golden boardwalk warmth', 'Dry warm days return after the summer peak. Cottonwood paths are comfortable again.'), cc('cold', 'cold', 'dry', 'Cold clear desert evening', 'Heat escapes quickly after sunset. A warm meal or indoor rest restores extra energy.')],
            winter: [cc('sun', 'mild', 'dry', 'Mild winter desert day', 'Dry sunshine warms the boardwalk at midday, although clear nights still turn cold.'), cc('cold', 'cold', 'dry', 'Cold desert night', 'A cold clear night follows a mild desert day. Sheltered rest helps before an exposed journey.')]
        } }
};
const seasons: readonly Season[] = ['spring', 'summer', 'autumn', 'winter'];
function regionalPlayer(g:WeatherGame,p?:WeatherLocationPlayer|null):WeatherRegion { const id=(p===undefined?g.players?.[g.turn??0]:p)?.world?.region??'alder'; if(!Object.hasOwn(climateProfiles,id))throw Error('Unknown weather region');return id as WeatherRegion; }

function regionalSeed(g: WeatherGame, region: WeatherRegion, chapter: number) {
    // Room code is public on both server and sanitized client snapshots. Private lifeSeed
    // must never influence weather or the displayed forecast would disagree with effects.
    const text = `${g.code ?? 'crosswalk'}:${region}:${chapter}`;
    let hash = 2166136261;
    for (let i = 0; i < text.length; i++)
        hash = Math.imul(hash ^ text.charCodeAt(i), 16777619);
    return hash >>> 0;
}
function conditionId(type: WeatherType, season: Season): WeatherId {
    if (type === 'heat')
        return 'summer-heat';
    if (type === 'snow')
        return 'winter-snow';
    if (type === 'cold')
        return 'winter-cold';
    if (type === 'rain')
        return season === 'autumn' || season === 'winter' ? 'autumn-rain' : 'spring-rain';
    return season === 'spring' ? 'spring-sun' : season === 'summer' ? 'summer-sun' : 'autumn-sun';
}
function regionalWeather(g:WeatherGame,region:WeatherRegion):Weather[]{const profile=climateProfiles[region];return weatherSchedule.map((_,i)=>{const chapter=Math.floor(i/2),season=seasons[chapter],offset=region==='alder'&&chapter===0?0:regionalSeed(g,region,chapter)%2,c=profile.seasons[season][(i%2+offset)%2],rule=c.type==='sun'?sunRule:c.type==='rain'?rainRule:c.type==='heat'?heatRule:winterRule;return{id:conditionId(c.type,season),week:i+1,season,...c,climate:profile.name,description:periodText(g,c.description),label:`${regionNames[region]} · ${c.label}`,effectSummary:periodText(g,`${profile.name}. ${rule} Exposed activities and regional journeys may cost extra energy, sharing a maximum of 8 extra energy per player this month. Exact costs appear before confirming. Rest at home is free of weather costs.`),region,chapter:chapter+1,chapterWeek:i%2+1,timeSkip:chapterStart(g,i)};});}

export function createEnvironment() { return { weatherSchedule: [...weatherSchedule] }; }
export function campaignWeather(g:WeatherGame,p?:WeatherLocationPlayer|null):Weather[]{return regionalWeather(g,regionalPlayer(g,p));}

export function getWeather(g?: WeatherGame | null, p?: WeatherLocationPlayer | null): Weather | null { return g ? campaignWeather(g, p)[g.round - 1] || null : null; }
export function nextWeather(g?: WeatherGame | null, p?: WeatherLocationPlayer | null): Weather | null { return g ? campaignWeather(g, p)[g.round] || null : null; }
/** Explicit tags prevent a location's appearance from silently changing all of its actions. */
export const weatherTags = {
    outdoorLeisure: ['rest', 'park_picnic', 'park_read', 'garden_tend', 'garden_rest'],
    sheltered: ['friends', 'cafe_break', 'cafe_openmic', 'library_learn', 'library_read', 'library_club', 'library_digitize', 'maker_intro', 'maker_commission', 'maker_hobby', 'maker_repair', 'creative_practice', 'creative_commission', 'transit_repair', 'story_mina_1', 'story_mina_2', 'story_mina_3', 'story_jo_1', 'story_jo_2', 'story_jo_3'],
    strenuousOutdoor: ['park_run', 'transit_courier', 'garden_harvest', 'garden_project', 'community_lead', 'transit_cleanup'],
    cozy: ['home_reset', 'home_meal', 'library_read', 'cafe_break', 'market_cook']
} as const;
const includes = (ids: readonly string[], id: string) => ids.includes(id);
export function currentWeatherUsage(p: WeatherPlayer, g?: WeatherGame): WeatherUsage {
    const u = p.weatherUsage?.round === g?.round ? p.weatherUsage : undefined;
    return { round: g?.round || 0, joy: Math.max(0, Math.min(4, u?.joy || 0)), heat: Math.max(0, Math.min(8, u?.heat || 0)), recovery: Math.max(0, Math.min(8, u?.recovery || 0)) };
}
const clamp = (n: number) => Math.max(0, Math.min(100, n));
export function weatherEffect(p:WeatherPlayer,a:WeatherActivity,g?:WeatherGame,base={joy:a.joy||0,energy:a.energy||0}){if(!g)return{joy:0,energy:0,remaining:{joy:4,heat:8,recovery:8},storySummary:'',summary:'',applies:false,capReached:false,joyUsed:0,heatUsed:0,recoveryUsed:0,exposureUsed:0,requiredEnergy:Math.max(0,-base.energy)};return climateEffect(p,a,g,base);}

export function weatherSummary(p: WeatherPlayer, a: WeatherActivity, g?: WeatherGame) { return weatherEffect(p, a, g).summary; }
export function consumeWeather(p:WeatherPlayer,a:WeatherActivity,g:WeatherGame,base?:{joy:number;energy:number}){consumeClimateEffect(p,g,climateEffect(p,a,g,base));}

/** All new-climate exposure, including travel, shares one per-player monthly budget. */
export function climateExposureRemaining(p: WeatherPlayer, g: WeatherGame) { return 8 - Math.max(0, Math.min(8, p.weatherUsage?.round === g.round ? p.weatherUsage.exposure || 0 : 0)); }
export function climateEffect(p: WeatherPlayer, a: WeatherActivity, g: WeatherGame, base = { joy: a.joy || 0, energy: a.energy || 0 }) {
    const weather = getWeather(g, p)!, usage = currentWeatherUsage(p, g), remaining = { joy: 4 - usage.joy, heat: 8 - usage.heat, recovery: 8 - usage.recovery }, available = climateExposureRemaining(p, g);
    const strenuous = includes(weatherTags.strenuousOutdoor, a.id), outdoor = includes(weatherTags.outdoorLeisure, a.id) || a.id === 'explore';
    const exposure = Math.min(available, strenuous ? weather.exposure?.strenuous || 0 : outdoor ? weather.exposure?.outdoor || 0 : 0);
    const pleasant = weather.type === 'sun' && outdoor, cozy = (weather.type === 'cold' || weather.type === 'snow') && includes(weatherTags.cozy, a.id);
    const sheltered = weather.type === 'rain' && (includes(weatherTags.sheltered, a.id) || a.id === 'weekly_opportunity');
    const joy = pleasant || sheltered ? Math.min(2, remaining.joy, 100 - clamp(p.joy + base.joy)) : 0;
    const recovery = cozy ? Math.min(4, remaining.recovery, 100 - clamp(p.energy + base.energy)) : 0;
    const energy = clamp(p.energy + base.energy - exposure) - clamp(p.energy + base.energy) + recovery;
    const applies = pleasant || sheltered || cozy || !!(strenuous ? weather.exposure?.strenuous : outdoor ? weather.exposure?.outdoor : 0);
    const capReached = applies && (pleasant || sheltered ? remaining.joy === 0 : cozy ? remaining.recovery === 0 : available === 0);
    const notes = [];
    if (exposure)
        notes.push(`${exposure} extra energy for exposed activity (${available - exposure} of 8 remains this month). Rest at home or choose a sheltered café activity.`);
    if (joy)
        notes.push(`+${joy} weather happiness (${remaining.joy - joy} of 4 remains this month).`);
    if (recovery)
        notes.push(`+${recovery} indoor recovery (${remaining.recovery - recovery} of 8 remains this month).`);
    if (capReached)
        notes.push('Monthly weather limit reached; no additional weather adjustment.');
    if (applies && !notes.length)
        notes.push('Your resources are already full; no extra weather benefit.');
    const storySummary = exposure ? `${weather.label}. This exposed activity is more tiring; a sheltered café break or rest at home is an alternative.` : joy ? `${weather.label}. ${sheltered ? 'Sheltered company makes the wet weather feel gentler.' : 'An unhurried outdoor visit makes the most of the pleasant weather.'}` : recovery ? `${weather.label}. A warm indoor break is especially restorative.` : applies ? `${weather.label}. Any weather adjustment is already included in your preview.` : '';
    return { joy, energy, remaining, storySummary, summary: applies ? `${weather.label}: ${notes.join(' ')}` : '', applies, capReached, joyUsed: joy, heatUsed: 0, recoveryUsed: recovery, exposureUsed: exposure, requiredEnergy: Math.max(0, -base.energy + exposure) };
}
export function consumeClimateEffect(p: WeatherPlayer, g: WeatherGame, e: {
    joyUsed: number;
    recoveryUsed: number;
    exposureUsed: number;
}) {
    const u = currentWeatherUsage(p, g);
    p.weatherUsage = { ...u, joy: u.joy + e.joyUsed, recovery: u.recovery + e.recoveryUsed, exposure: 8 - climateExposureRemaining(p, g) + e.exposureUsed };
}
/** Regional journeys use both endpoints before moving; charge the worse, never both. */
export function climateTravelEffect(p: WeatherPlayer, g: WeatherGame, destination: WeatherRegion) {
    const from = getWeather(g, p), to = getWeather(g, { world: { version: 1, region: destination } });
    if (!from?.climate || !to?.climate)
        return null;
    const available = climateExposureRemaining(p, g), cost = Math.min(available, Math.max(from.exposure?.travel || 0, to.exposure?.travel || 0));
    return { joy: 0, joyUsed: 0, recoveryUsed: 0, exposureUsed: cost, energy: cost ? -cost : 0, requiredEnergy: cost, storySummary: `Departure: ${from.label}. Arrival: ${to.label}. ${cost ? 'The exposed approaches make this journey more tiring; rest at home first if needed.' : 'The route stays open.'} There is no extra fare or time.`, summary: `Departure: ${from.label}. Arrival: ${to.label}. Weather adds ${cost} energy to this journey; no extra fare or time. ${cost ? `${available - cost} of 8 monthly exposure energy remains. Rest at home first if needed.` : 'The route stays open.'}` };
}


export function seasonalOpportunity<T extends{title:string;text:string}>(g:WeatherGame,base:T):T{const weather=getWeather(g)!;const title=weather.type==='rain'?'Covered neighborhood gathering':weather.type==='heat'?'Shaded community showcase':weather.type==='cold'||weather.type==='snow'?'Warm-room neighborhood supper':'Open-air neighborhood showcase';return{...base,title:`${regionNames[weather.region!]} · ${title}`,text:`${weather.description} The local opening adapts to the forecast. ${weather.type==='sun'?'Meet in the sheltered community courtyard.':'Use the indoor community room.'} The reward and any weather benefit are included in your preview.`};}
