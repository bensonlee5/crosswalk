import type {Weather} from './weather.ts';
/** Plain-language implications; exact effects stay in the activity's optional details. */
export function weatherStory(weather:Weather|null|undefined):string{
 if(!weather)return '';
 const hints={sun:'A good time for an unhurried walk, picnic or garden break.',rain:'Café corners, books and indoor making offer a welcome pause.',heat:'Plan rests and shade around strenuous outdoor work; it can be more tiring.',snow:'Warm meals, indoor hobbies and quiet company can help you recover.',cold:'Warm meals, indoor hobbies and quiet company can help you recover.'};
 const travel=weather.exposure?.travel?` Exposed regional journeys take extra energy; check the departure and arrival forecast before confirming. You can recover at home without a weather cost.`:'';
 return `${weather.climate?weather.climate+' climate. ':''}${weather.description} ${hints[weather.type]}${travel}`;
}
