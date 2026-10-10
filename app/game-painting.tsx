'use client';
import {useState} from 'react';
import {assetUrl} from '@/lib/asset-url';
/** Artwork is decorative only when adjacent copy conveys its full purpose. */
export default function GamePainting({src,alt,className='',fallback,priority=false}:{src:string;alt:string;className?:string;fallback?:string;priority?:boolean}){
 const [failedSource,setFailedSource]=useState('');const failed=failedSource===src;
 return <img className={className} src={assetUrl(failed&&fallback?fallback:src)} alt={alt} loading={priority?'eager':'lazy'} fetchPriority={priority?'high':'auto'} decoding="async" onError={()=>{if(!failed&&fallback)setFailedSource(src);}}/>;
}
