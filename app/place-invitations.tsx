import { activityIntent } from '@/lib/decision-presentation';
import type { Activity,Game,Player } from '@/lib/game';
import { choiceTerms } from '@/lib/place-invitations';
import { effortLabel,qualitativeText } from '@/lib/point-presentation';
export function ChoiceTerms({p,a,g}:{p:Player;a:Activity;g:Game}){
 const t=choiceTerms(p,a,g);
 // The energy cost is always shown. Only the actual action lock asks for rest.
 const requirements=t.requirements.replace(/(?:Needs )?(\d+(?:\.\d+)?) energy\b/g,(_match,n)=>effortLabel(Number(n)));
 return <div className="choice-terms" aria-label="Before you choose"><span>{t.time}</span><span>{t.cash}</span>{t.unitPrice&&<span>{t.unitPrice}</span>}{requirements&&<span>{qualitativeText(requirements)}</span>}<span>{t.afterCash}</span>{t.bills&&<strong>{t.bills}</strong>}</div>;
}
export function ChoiceBenefit({a}:{p:Player;a:Activity;g:Game}){return <strong className="choice-benefit">{activityIntent(a)}</strong>;}
