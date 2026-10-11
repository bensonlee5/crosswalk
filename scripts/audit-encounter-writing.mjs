import {ensembleDialogue,ensembleReplySpeech} from '../lib/ensemble-dialogue.ts';
import {characterVoices} from '../lib/character-voice.ts';
const syllables=word=>{
 const w=word.toLowerCase();let n=(w.match(/[aeiouy]+/g)||[]).length;
 if(w.endsWith('e')&&!/(?:le|ye)$/.test(w)&&n>1)n--;
 return Math.max(1,n);
};
function describe(texts){
 const text=texts.join(' '),words=text.match(/[a-z]+(?:[’'][a-z]+)?/gi)||[];
 const sentences=(text.match(/[.!?]+(?:[”’]|$|\s)/g)||[]).length;
 return {passages:texts.length,words:words.length,sentences,wordsPerSentence:+(words.length/sentences).toFixed(1),approximateFleschKincaid:+(.39*words.length/sentences+11.8*words.reduce((n,w)=>n+syllables(w),0)/words.length-15.59).toFixed(1)};
}
console.log('Editorial aid only: vowel-group syllables and punctuation estimates are not a reading-level certification. Names, contractions, quotations and short dialogue are especially noisy. Do not use this score as a quality gate.');
console.log(JSON.stringify({
 mainOpeningExchanges:describe(Object.values(ensembleDialogue).map(d=>d.body+' '+d.opening.speech)),
 mainNarration:describe(Object.values(ensembleDialogue).map(d=>d.body)),
 exactMainReplies:describe(Object.values(ensembleReplySpeech)),
 coreAdultReplies:describe(Object.values(characterVoices).flatMap(Object.values)),
},null,2));
