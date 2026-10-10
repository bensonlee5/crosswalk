'use client';
import {useState} from 'react';
import {assetUrl} from '@/lib/asset-url';
import {characterPortraits} from '@/lib/character-portraits';
import {expressionSheets,expressionPosition,type PortraitExpression} from '@/lib/portrait-expression';

/** Unknown IDs and image load failures stay legible without showing another person's face. */
export default function CharacterPortrait({id,name,className='encounter-portrait',priority=false,expression='neutral'}:{id:string;name:string;className?:string;priority?:boolean;expression?:PortraitExpression}){
 const portrait=characterPortraits[id];const [failedSource,setFailedSource]=useState('');
 const sheet=expression!=='neutral'?expressionSheets[id]:undefined;
 if(sheet&&expression!=='neutral'&&failedSource!==sheet.src&&failedSource!==portrait?.src)return <span className={`${className} character-expression`} role="img" aria-label={`${name}, ${sheet.labels[expression]}`} style={{backgroundImage:`url("${assetUrl(sheet.src)}")`,backgroundPosition:expressionPosition[expression]}}><img className="character-expression-preload" src={assetUrl(sheet.src)} alt="" aria-hidden="true" loading={priority?'eager':'lazy'} onError={()=>setFailedSource(sheet.src)}/></span>;
 if(!portrait||failedSource===portrait.src)return <span className={`${className} character-portrait-fallback`} role="img" aria-label={`${name}, portrait unavailable`}><span aria-hidden="true">{name.slice(0,1)}</span></span>;
 return <img className={className} src={assetUrl(`${portrait.src}?v=${portrait.revision}`)} alt={portrait.alt} width={640} height={640} loading={priority?'eager':'lazy'} decoding="async" onError={()=>setFailedSource(portrait.src)}/>;
}
