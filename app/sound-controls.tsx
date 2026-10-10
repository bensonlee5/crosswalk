'use client';
import {useEffect,useRef,useState} from 'react';
import {getAudio,type AudioEffect} from '@/lib/audio';
type Preferences={music:boolean;effects:boolean;musicVolume:number;effectsVolume:number};
const defaults:Preferences={music:true,effects:true,musicVolume:.24,effectsVolume:.55};
export function useGameSound(active:boolean){
 const [settings,setSettings]=useState<Preferences>(defaults),[ready,setReady]=useState(false),[unlocked,setUnlocked]=useState(false),[unavailable,setUnavailable]=useState(false);
 const activeRef=useRef(active);activeRef.current=active;
 useEffect(()=>{try{const s=JSON.parse(localStorage.getItem('cw_audio_v1')||'null');if(s)setSettings({music:typeof s.music==='boolean'?s.music:true,effects:typeof s.effects==='boolean'?s.effects:true,musicVolume:Number.isFinite(s.musicVolume)?Math.max(0,Math.min(1,s.musicVolume)):.24,effectsVolume:Number.isFinite(s.effectsVolume)?Math.max(0,Math.min(1,s.effectsVolume)):.55});}catch{}setReady(true);return()=>getAudio().dispose()},[]);
 useEffect(()=>{if(!ready)return;const a=getAudio();a.setMusicEnabled(active&&settings.music);a.setEffectsEnabled(settings.effects);a.setMusicVolume(settings.musicVolume);a.setEffectsVolume(settings.effectsVolume);try{localStorage.setItem('cw_audio_v1',JSON.stringify(settings));}catch{}},[settings,ready,active]);
 useEffect(()=>{const update=()=>getAudio().setActive(document.visibilityState==='visible');update();document.addEventListener('visibilitychange',update);return()=>document.removeEventListener('visibilitychange',update)},[active]);
 async function unlock(){try{getAudio().setMusicEnabled(activeRef.current&&settings.music);getAudio().setActive(document.visibilityState==='visible');const ok=await getAudio().unlock();setUnlocked(ok);setUnavailable(!ok);return ok}catch{setUnavailable(true);return false}}
 function play(effect:AudioEffect){try{getAudio().play(effect)}catch{}}
 function change(patch:Partial<Preferences>){setSettings(s=>({...s,...patch}));void unlock()}
 return{settings,change,unlock,play,unlocked,unavailable};
}
export type GameSound=ReturnType<typeof useGameSound>;
export function SoundSettings({sound}:{sound:GameSound}){
 return <div className="sound-settings"><p>A soft neighborhood soundtrack and distinct cues for your actions. Sound preferences stay on this device.</p><label className="sound-toggle"><span><strong>Background music</strong><small>Original mellow instrumental loop</small></span><input type="checkbox" checked={sound.settings.music} onChange={e=>sound.change({music:e.target.checked})}/></label><label className="sound-volume">Music volume <output>{Math.round(sound.settings.musicVolume*100)}%</output><input aria-label="Music volume" type="range" min="0" max="100" value={sound.settings.musicVolume*100} onChange={e=>sound.change({musicVolume:Number(e.target.value)/100})}/></label><label className="sound-toggle"><span><strong>Action sounds</strong><small>Travel, work, learning, spending, and the clock</small></span><input type="checkbox" checked={sound.settings.effects} onChange={e=>sound.change({effects:e.target.checked})}/></label><label className="sound-volume">Effects volume <output>{Math.round(sound.settings.effectsVolume*100)}%</output><input aria-label="Effects volume" type="range" min="0" max="100" value={sound.settings.effectsVolume*100} onChange={e=>sound.change({effectsVolume:Number(e.target.value)/100})}/></label><button className="secondary" onClick={async()=>{if(await sound.unlock())sound.play('social')}}>Test action sound</button><p role="status" className="fine-print">{sound.unavailable?'Audio could not start. Try another tap; check your device volume and silent mode.':sound.unlocked?'Audio is ready. Music plays during the game and pauses when you leave the tab.':'Tap Test action sound or begin playing to enable audio.'}</p></div>
}
