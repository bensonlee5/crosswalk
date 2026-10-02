import {Sun,CloudRain,Snowflake,Thermometer,Wind} from 'lucide-react';
export default function WeatherIcon({type,size=24}:{type?:string;size?:number}){const Icon=type==='rain'?CloudRain:type==='heat'?Thermometer:type==='snow'?Snowflake:type==='cold'?Wind:Sun;return <Icon size={size} aria-hidden="true"/>;}
