import type {Player} from './game';
import {actions,jobs,effects} from './game';
export function snapshotIsCurrent(current:{code:string;version:number}|null,next:{code:string;version:number}){return !current||current.code!==next.code||next.version>=current.version;}
export function actionPreview(p:Player,id:string){const a=actions.find(x=>x.id===id)!;const e=effects(p,a);const headline=a.promote?(p.job<3?`Become ${jobs[p.job+1].name}`:'You’ve reached the top role'):a.workHours?`Earn $${e.cash}`:a.title;return{...e,hours:-a.time,headline,afterCash:p.cash+e.cash,afterHours:p.hours-a.time};}
export function weekPreview(p:Player){const bills=p.housing?705:505;const cash=p.cash-bills;let joy=Math.min(100,p.joy+(p.housing?6:0));joy=Math.max(0,joy-4);if(cash<0)joy=Math.max(0,joy-8);return{bills,cash,joy,energy:Math.min(100,p.energy+16)};}
export function scoreParts(p:Player){return[{label:'Savings',points:Math.min(30,Math.max(0,p.cash)/200),max:30,hint:'$6,000 saved'},{label:'Career',points:p.job/3*20,max:20,hint:'Project lead'},{label:'Learning',points:Math.min(6,p.skill)/6*20,max:20,hint:'6 skills'},{label:'Happiness',points:p.joy/100*30,max:30,hint:'100 happiness'}];}
