'use client';
import {useEffect,useRef,useState} from 'react';
import {getAudio,type AudioEffect} from '@/lib/audio';
import {AUDIO_PREFERENCES_KEY,defaultAudioPreferences,readAudioPreferences,type AudioPreferences} from '@/lib/audio-preferences';

export function useGameSound(active:boolean){
 const [settings,setSettings]=useState<AudioPreferences>(()=>{
  try{return readAudioPreferences(localStorage);}catch{return {...defaultAudioPreferences};}
 });
 const [unlocked,setUnlocked]=useState(false),[unavailable,setUnavailable]=useState(false);
 const [testStatus,setTestStatus]=useState('');
 const activeRef=useRef(active);
 const settingsRef=useRef(settings);
 const mounted=useRef(false);
 useEffect(()=>{
  mounted.current=true;
  const audio=getAudio();
  return()=>{mounted.current=false;audio.dispose();};
 },[]);
 useEffect(()=>{
  activeRef.current=active;settingsRef.current=settings;
  const a=getAudio();
  a.setMusicEnabled(active&&settings.music);a.setEffectsEnabled(settings.effects);
  a.setMusicVolume(settings.musicVolume);a.setEffectsVolume(settings.effectsVolume);
  try{localStorage.setItem(AUDIO_PREFERENCES_KEY,JSON.stringify(settings));}catch{/* Device storage may be blocked. */}
 },[settings,active]);
 useEffect(()=>{
  const update=()=>getAudio().setActive(document.visibilityState==='visible');
  update();document.addEventListener('visibilitychange',update);
  return()=>document.removeEventListener('visibilitychange',update);
 },[]);
 async function unlock(){
  try{
   const a=getAudio(),s=settingsRef.current;
   a.setMusicEnabled(activeRef.current&&s.music);a.setActive(document.visibilityState==='visible');
   const ok=await a.unlock();
   if(mounted.current&&!a.isDisposed){setUnlocked(ok);setUnavailable(!ok);}
   return ok&&!a.isDisposed;
  }catch{if(mounted.current)setUnavailable(true);return false;}
 }
 function capture(){return getAudio().effectToken;}
 function play(effect:AudioEffect,token?:number){try{return getAudio().play(effect,token);}catch{return false;}}
 function stopEffects(){getAudio().stopEffects();}
 function change(patch:Partial<AudioPreferences>){
  const next={...settingsRef.current,...patch};settingsRef.current=next;setSettings(next);setTestStatus('');
  // Apply in the gesture itself so an in-flight acknowledgement cannot slip past mute.
  const a=getAudio();a.setEffectsEnabled(next.effects);a.setEffectsVolume(next.effectsVolume);
  a.setMusicEnabled(activeRef.current&&next.music);a.setMusicVolume(next.musicVolume);
  void unlock();
 }
 async function testSip(){
  const a=getAudio(),token=a.effectToken;
  if(!settingsRef.current.effects||settingsRef.current.effectsVolume===0){setTestStatus('Turn on action sounds and raise Effects volume to hear the sip.');return;}
  const ok=await unlock();
  if(!mounted.current||a.isDisposed||token!==a.effectToken)return;
  if(!ok)return;
  const played=a.play('sip',token);
  setTestStatus(played?'Playing the recorded coffee sip.':a.foleyStatus('sip')==='loading'
   ?'The sip is loading. Tap Test coffee sip again in a moment.'
   :'The sip recording is unavailable. Try again after reconnecting.');
 }
 return{settings,change,unlock,play,capture,stopEffects,testSip,testStatus,unlocked,unavailable};
}
export type GameSound=ReturnType<typeof useGameSound>;
export function SoundSettings({sound}:{sound:GameSound}){
 return <div className="sound-settings"><p>A soft neighborhood soundtrack and recorded sounds that match everyday actions. Sound preferences stay on this device.</p><label className="sound-toggle"><span><strong>Background music</strong><small>Original mellow instrumental loop</small></span><input type="checkbox" checked={sound.settings.music} onChange={e=>sound.change({music:e.target.checked})}/></label><label className="sound-volume">Music volume <output>{Math.round(sound.settings.musicVolume*100)}%</output><input aria-label="Music volume" type="range" min="0" max="100" value={sound.settings.musicVolume*100} onChange={e=>sound.change({musicVolume:Number(e.target.value)/100})}/></label><label className="sound-toggle"><span><strong>Action sounds</strong><small>Coffee sips, turning pages, cooking, repairs and footsteps</small></span><input type="checkbox" checked={sound.settings.effects} onChange={e=>sound.change({effects:e.target.checked})}/></label><label className="sound-volume">Effects volume <output>{Math.round(sound.settings.effectsVolume*100)}%</output><input aria-label="Effects volume" type="range" min="0" max="100" value={sound.settings.effectsVolume*100} onChange={e=>sound.change({effectsVolume:Number(e.target.value)/100})}/></label><button className="secondary" onClick={()=>{void sound.testSip();}}>Test coffee sip</button><p role="status" className="fine-print">{sound.testStatus||(sound.unavailable?'Audio could not start. Try another tap; check your device volume and silent mode.':sound.unlocked?'Audio is ready. Music plays during the game and pauses when you leave the tab.':'Tap Test coffee sip or begin playing to enable audio.')}</p></div>
}
