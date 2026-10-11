import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createRequire} from 'node:module';
import {AUDIO_PREFERENCES_KEY,defaultAudioPreferences,readAudioPreferences} from '../lib/audio-preferences.ts';
const require=createRequire(import.meta.url),ts=require('typescript');
const source=ts.transpileModule(fs.readFileSync(new URL('../app/sound-controls.tsx',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ESNext,jsx:ts.JsxEmit.ReactJSX}}).outputText;

test('existing device preferences, clamped volumes, malformed and blocked storage are safe',()=>{
 assert.deepEqual(readAudioPreferences({getItem:()=>'{"music":false,"effects":false,"musicVolume":0,"effectsVolume":0.8}'}),{music:false,effects:false,musicVolume:0,effectsVolume:.8});
 assert.deepEqual(readAudioPreferences({getItem:()=>'{"music":3,"effects":"false","musicVolume":2,"effectsVolume":-5}'}),{music:true,effects:true,musicVolume:1,effectsVolume:0});
 for(const raw of ['null','bad','{}','{"musicVolume":"0.6"}'])assert.deepEqual(readAudioPreferences({getItem:()=>raw}),defaultAudioPreferences);
 assert.deepEqual(readAudioPreferences({getItem:()=>{throw Error('Blocked');}}),defaultAudioPreferences);
});
function hookHarness(saved={}){
 const slots=[],deps=[],cleanups=[];let cursor=0,dirty=false,pending=[],value,active=false,hold=null;
 const storage=new Map([[AUDIO_PREFERENCES_KEY,JSON.stringify(saved)]]),played=[];
 const audio={effectToken:0,isDisposed:false,status:'loading',music:false,effects:true,musicVolume:0,effectsVolume:0,
  setMusicEnabled(v){this.music=v;},setEffectsEnabled(v){this.effects=v;if(!v)this.stopEffects();},setMusicVolume(v){this.musicVolume=v;},setEffectsVolume(v){this.effectsVolume=v;if(v===0)this.stopEffects();},setActive(){},
  unlock(){return hold||Promise.resolve(true);},play(cue,token=this.effectToken){if(token!==this.effectToken||this.status!=='ready'||!this.effects||this.effectsVolume===0||this.isDisposed)return false;played.push(cue);return true;},foleyStatus(){return this.status;},stopEffects(){this.effectToken++;},dispose(){this.isDisposed=true;this.stopEffects();}};
 const react={useState(initial){const i=cursor++;if(!(i in slots))slots[i]=typeof initial==='function'?initial():initial;return[slots[i],v=>{const next=typeof v==='function'?v(slots[i]):v;if(slots[i]!==next){slots[i]=next;dirty=true;}}];},useRef(initial){const i=cursor++;return slots[i]??(slots[i]={current:initial});},useEffect(fn,next){const i=cursor++;if(!deps[i]||next.some((v,j)=>v!==deps[i][j])){deps[i]=next;pending.push(()=>{cleanups[i]?.();cleanups[i]=fn();});}}};
 const exports={},mod={exports};
 vm.runInNewContext(source,{exports,module:mod,require:id=>id==='react'?react:id==='@/lib/audio'?{getAudio:()=>audio}:id==='@/lib/audio-preferences'?{AUDIO_PREFERENCES_KEY,defaultAudioPreferences,readAudioPreferences}:require(id),localStorage:{getItem:k=>storage.get(k),setItem:(k,v)=>storage.set(k,v)},document:{visibilityState:'visible',addEventListener(){},removeEventListener(){}}});
 function render(){for(let i=0;i<10;i++){cursor=0;dirty=false;value=mod.exports.useGameSound(active);pending.splice(0).forEach(fn=>fn());if(!dirty)return value;}throw Error('render loop');}
 render();return{audio,storage,played,render,get sound(){return value;},setActive(v){active=v;return render();},holdUnlock(){let resolve;hold=new Promise(r=>resolve=r);return()=>{resolve(true);hold=null;};},dispose(){cleanups.forEach(fn=>fn?.());}};
}
test('actual sound hook restores and persists independent music/effects controls',async()=>{
 const h=hookHarness({music:false,effects:false,musicVolume:.3,effectsVolume:.7});
 assert.equal(h.audio.music,false);assert.equal(h.audio.effects,false);assert.equal(h.audio.effectsVolume,.7);
 h.sound.change({music:true,effects:true,effectsVolume:.4});h.render();
 assert.equal(h.audio.music,false,'music waits until game is active');assert.equal(h.audio.effects,true);
 h.setActive(true);assert.equal(h.audio.music,true);
 const saved=JSON.parse(h.storage.get(AUDIO_PREFERENCES_KEY));assert.deepEqual(saved,{music:true,effects:true,musicVolume:.3,effectsVolume:.4});
 h.sound.change({effectsVolume:0});assert.equal(h.audio.effectsVolume,0,'mute applies synchronously before a render');h.dispose();
});
test('settings test requires another explicit tap after loading, and respects mute and cancellation',async()=>{
 const h=hookHarness();await h.sound.testSip();h.render();
 assert.deepEqual(h.played,[]);assert.match(h.sound.testStatus,/loading/);
 h.audio.status='ready';await Promise.resolve();assert.deepEqual(h.played,[],'download completion has no sound');
 await h.sound.testSip();h.render();assert.deepEqual(h.played,['sip']);
 h.sound.change({effects:false});h.render();await h.sound.testSip();h.render();assert.deepEqual(h.played,['sip']);assert.match(h.sound.testStatus,/Turn on action sounds/);
 h.sound.change({effects:true});h.render();const release=h.holdUnlock(),test=h.sound.testSip();h.sound.stopEffects();release();await test;assert.deepEqual(h.played,['sip'],'closing the dialog while unlock is pending cancels its test');h.dispose();
});
test('unmount during a pending test cannot play or revive audio',async()=>{
 const h=hookHarness();h.audio.status='ready';const release=h.holdUnlock(),test=h.sound.testSip();h.dispose();release();await test;assert.deepEqual(h.played,[]);assert.equal(h.audio.isDisposed,true);
});
