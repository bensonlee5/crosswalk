import {actions} from './game.ts';
import type {Player} from './game.ts';
export type ActionSound = 'travel'|'work'|'buy'|'learn'|'social'|'rest'|'craft'|'success'|'endWeek'|'start'|'finish'|'error';
export function actionSound(op:string,action:string|undefined,before?:Player,after?:Player,finished=false):ActionSound|null{
 if(finished)return 'finish';
 if(op==='start'||op==='create')return 'start';
 if(op!=='move')return null;
 if(action==='end')return 'endWeek';
 if(action==='visit')return before?.place!==after?.place?'travel':null;
 if(!action)return null;
 const activity=actions.find(a=>a.id===action);
 if((after?.job??0)>(before?.job??0)||(after?.legacy??0)>(before?.legacy??0)||activity?.promote)return 'success';
 if(action.startsWith('maker_')||action==='garden_project'||(activity?.craft??0)>0)return 'craft';
 if((activity?.workHours??0)>0||(activity?.earn??0)>0)return 'work';
 if((activity?.skill??0)>0)return 'learn';
 if(activity?.story||(activity?.social??0)>0)return 'social';
 if((activity?.energy??0)>0)return 'rest';
 if((activity?.cost??0)>0||activity?.housing)return 'buy';
 return 'social';
}
export function clockSound(before?:Player,after?:Player):'tick'|'timeUp'|null{
 if(!before||!after||before.id!==after.id||after.hours>=before.hours)return null;
 return after.hours===0?'timeUp':after.hours===1?'tick':null;
}
