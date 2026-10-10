/** Player presentation policy: numbers are kept by the simulation, while personal
 * states use broad, neutral bands. Never use these labels for eligibility or math.
 * Money, work hours, dates, priority blocks and people counts remain explicit.
 * No meter, percentage, hidden title, ARIA value or optional detail exposes points.
 */
export type PersonalStat='energy'|'joy'|'skill'|'social'|'craft'|'legacy';
const bands:Record<PersonalStat,{cuts:number[];labels:string[]}>= {
 energy:{cuts:[10,20,30,40,50,60,70,80,90],labels:['Spent','Worn down','Drained','Weary','A little tired','Steady','Refreshed','Rested','Energized','Full of life']},
 joy:{cuts:[10,20,30,40,50,60,70,80,90],labels:['Heavy-hearted','Discouraged','Low spirits','Unsettled','Finding balance','At ease','Content','Cheerful','Buoyant','Delighted']},
 // These capabilities have genuinely discrete engine values. Keep one label
 // per real step instead of inventing thresholds or changing earned rewards.
 skill:{cuts:[1,2,3,4,5,6],labels:['New to this','Learning the basics','Finding your footing','Growing confident','Practiced','Experienced','Accomplished']},
 social:{cuts:[1,2,4,6,8,11,14,18,24],labels:['A quiet circle','Making introductions','Getting acquainted','Familiar faces','A growing circle','An expanding circle','Connected across town','A wide circle','Well connected','Connections far and wide']},
 craft:{cuts:[1,2,3,4,5,6,7,8],labels:['Curious','Experimenting','Learning the tools','Finding your style','Developing a practice','Assured in your work','A distinctive touch','Seasoned','Fluent in your craft']},
 legacy:{cuts:[1,2,3,4,5,6,7,8,9,10],labels:['A beginning','Early impressions','Shared memories','Small contributions','Something lasting','Taking root','A growing legacy','Part of local life','Deep roots','Remembered with warmth','A lasting part of this place']},
};
export function qualitativeStat(stat:PersonalStat,value:number):string {
 const {cuts,labels}=bands[stat];const safe=Number.isFinite(value)?Math.max(0,value):0;
 return labels[cuts.filter(cut=>safe>=cut).length];
}
export function effortLabel(cost:number):string{return cost<=0?'No exertion needed':cost<8?'A little effort':cost<20?'Some effort':'Demanding';}
export function qualitativeEffect(stat:PersonalStat,value:number):string {
 if(!value)return '';
 const up:Record<PersonalStat,string>={energy:'Restorative',joy:'May lift your spirits',skill:'Builds your skills',social:'Broadens your circle',craft:'Develops your craft',legacy:'Leaves something lasting'};
 const down:Record<PersonalStat,string>={energy:'Tiring',joy:'May weigh on your spirits',skill:'A learning setback',social:'May strain connections',craft:'A creative setback',legacy:'A change in what you leave behind'};
 return (value>0?up:down)[stat];
}
export function personalEffects(e:Partial<Record<PersonalStat,number>>):string[]{return (Object.keys(bands) as PersonalStat[]).map(key=>qualitativeEffect(key,e[key]??0)).filter(Boolean);}
export function gardenStage(done:number,goal:number,complete=false):string{return complete?'Open to the neighborhood':done<=0?'Ready for a first helping hand':done/Math.max(1,goal)<.5?'Taking root':done<goal?'Coming together':'Ready to open';}
/** Boundary for legacy/authored narrative receipts. Deliberately targets stat
 * vocabulary, never general numbers, prices, names, dates or paid-hour limits. */
export function qualitativeText(input:string):string {
 let text=input;
 const words='(?:zero|one|two|three|four|five|six|seven|eight|nine|ten|first|second|third|fourth|fifth|sixth|eighth|\\d+(?:\\.\\d+)?)';
 text=text
  .replace(/Everyone gets \+\d+(?:\.\d+)? happiness\./gi,'A welcome lift for everyone.')
  .replace(/Rest first: this (?:shift|work) needs \d+(?:\.\d+)? energy/gi,'Rest at home before taking this work on')
  .replace(/Craft \d+ opens creative commissions/gi,'Further practice can open creative commissions')
  .replace(/(?:costs?|lose|loses) \d+ (?:extra )?happiness/gi,'may weigh on your spirits')
  .replace(/\b(energy|happiness|joy|skills?|craft|connections?|legacy)[: ]+([+−-]\d+(?:\.\d+)?)/gi,(_m,label,n)=>`${n} ${label.toLowerCase()}`)
  .replace(/All (?:six skills|eight craft levels) earned/gi,'Your learning here is complete')
  .replace(/(?:Needs?|Requires?) \d+(?:\.\d+)? (?:career )?skills?(?: \(you have \d+(?:\.\d+)?\))?/gi,'Build your skills through learning first')
  .replace(/(?:Needs?|Requires?) \d+(?:\.\d+)? connections?(?: \(you have \d+(?:\.\d+)?\))?/gi,'Get to know more people first')
  .replace(/(?:Needs?|Requires?) \d+(?:\.\d+)? craft(?: levels?)?/gi,'Develop your craft through practice first')
  .replace(/(?:Needs?|Requires?) \d+(?:\.\d+)? energy(?: including (?:the heat adjustment|weather))?(?:; rest (?:at home )?first)?/gi,'Rest at home before taking this on')
  .replace(/rest until you have at least \d+(?:\.\d+)? energy/gi,'rest until you feel steadier')
  .replace(/until happiness reaches \d+/gi,'to help your spirits recover')
  .replace(/(?:Earn|Make|Build) \d+ more (?:career )?(skills?|connections?|craft levels?)/gi,(_m,kind)=>/connection/.test(kind)?'Broaden your circle':/craft/.test(kind)?'Keep developing your craft':'Keep building your skills')
  .replace(/\+\d+(?:\.\d+)? bond with ([^.,;·]+)/g,'Grow closer to $1')
  .replace(/([\p{L}’'-]+) trust ([+−-]?\d+(?:\.\d+)?)/gu,(_m,name,n)=>`${name}: ${Number(n.replace('−','-'))<0?'trust may be strained':'trust can grow'}`)
  .replace(/[+−-]?\d+(?:\.\d+)? (?:local participation |weather |extra )?(energy|happiness|joy|connections?|(?:career )?skills?|craft(?: levels?)?|legacy(?: points?)?|language|Neri bond|bond)(?![\p{L}])/gu,(match,label)=>{
   const n=Number(match.match(/^[+−-]?[\d.]+/)![0].replace('−','-'));
   if(label==='energy'&&!/^[+−-]/.test(match))return effortLabel(n);
   if(!/^[+−-]/.test(match)&&/skills?/.test(label))return 'practical skills';
   if(!/^[+−-]/.test(match)&&/connections?/.test(label))return 'a wider circle';
   if(!/^[+−-]/.test(match)&&/craft/.test(label))return 'craft experience';
   if(label==='language')return n<0?'Language feels less familiar':'Local words become more familiar';
   if(/bond/.test(label))return n<0?'The relationship may feel strained':'The relationship can grow';
   const key:PersonalStat=/energy/.test(label)?'energy':/happiness|joy/.test(label)?'joy':/skill/.test(label)?'skill':/connection/.test(label)?'social':/craft/.test(label)?'craft':'legacy';
   const gains:Record<PersonalStat,string>={energy:'renewed energy',joy:'a lift in spirits',skill:'practical learning',social:'new connections',craft:'creative practice',legacy:'a lasting contribution'};
   return n>0?gains[key]:qualitativeEffect(key,n)||'No noticeable change';
  })
  .replace(new RegExp('\\b'+words+' (?:(?:practical|earned|career) )*(?:career )?skills?\\b','gi'),'practical skills')
  .replace(new RegExp('\\b'+words+' craft levels?\\b','gi'),'a developed craft practice')
  .replace(new RegExp('\\b'+words+' connections?\\b','gi'),'a wider circle')
  .replace(/\b\d+ of \d+ (?:monthly |weekly )?(?:exposure energy )?remains?(?: this (?:week|month))?\.?/gi,'')
  .replace(/(?:Energy|Happiness) is already capped at 100[^.]*\.?/gi,'You already feel the benefit.')
  .replace(/\s+([.,;])/g,'$1').replace(/\s{2,}/g,' ').trim();
 return text.replace(/(^|[.!?]\s+)([a-z])/g,(_m,start,letter)=>start+letter.toUpperCase());
}
/** The browser's visible-game reader is a presentation surface, not a save dump. */
export function visibleGameSummary(g:import('./game').Game|null){
 if(!g)return null;
 return{code:g.code,status:g.status,round:g.round,maxRounds:g.maxRounds,currentPlayer:g.players[g.turn]?.name,players:g.players.map(p=>({name:p.name,place:p.place,cash:p.cash,hours:p.hours,energy:qualitativeStat('energy',p.energy),mood:qualitativeStat('joy',p.joy),learning:qualitativeStat('skill',p.skill),connections:qualitativeStat('social',p.social),creativeLife:qualitativeStat('craft',p.craft||0),legacy:qualitativeStat('legacy',p.legacy||0)})),recentEvents:g.log.slice(0,8).map(qualitativeText)};
}
