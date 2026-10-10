import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {weatherStory} from '../lib/weather-presentation.ts';
import {campaignWeather} from '../lib/weather.ts';
test('normal weather storytelling keeps practical implications without formulas',()=>{
 for(const region of ['alder','saffron','glasssteppe','pelagia','embermesa']){
 const player={world:{version:1,region}};const g={round:1,rulesVersion:2,environmentVersion:1,worldVersion:1,economyVersion:1,players:[player],turn:0};
 for(const weather of campaignWeather(g,player)){const text=weatherStory(weather);assert.ok(text.includes(weather.description));assert.doesNotMatch(text,/[+]\d|\bcap\b|per player|up to \d/i);assert.ok(text.length>30);}
 }
 assert.equal(weatherStory(null),'');
});
test('Chronicle and ledger avoid effect formulas and expose continuation before the artwork',()=>{
 const source=readFileSync(new URL('../app/weekly-news.tsx',import.meta.url),'utf8');assert.doesNotMatch(source,/effectSummary/);assert.equal((source.match(/chronicle-continue/g)||[]).length,2);
 for(const part of source.split('return <Dialog').slice(1))assert.ok(part.indexOf('chronicle-continue')<part.indexOf('chronicle-art'));
 const page=readFileSync(new URL('../app/page.tsx',import.meta.url),'utf8');assert.doesNotMatch(page,/nextWeather\(g\)\?\.effectSummary/);assert.match(page,/weatherStory\(nextWeather\(g\)\)/);
});
