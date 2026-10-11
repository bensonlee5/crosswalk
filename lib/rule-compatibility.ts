/** A compatibility declaration, not authentication or permission to change a room.
 * Legacy rooms and saved-room listings remain accessible; only explicit create inputs enable new rule families. */
export const clientSupportedRules=['action-incidents-v1','venue-careers-v1'] as const;
export type SupportedRule=typeof clientSupportedRules[number];
export type RulesVersionFields={actionIncidentsVersion?:number;careerVersion?:number;financialRecoveryVersion?:number};
export function requiredRules(g:RulesVersionFields):SupportedRule[]{return[...(g.actionIncidentsVersion===1?['action-incidents-v1' as const]:[]),...(g.careerVersion===1||g.financialRecoveryVersion===1?['venue-careers-v1' as const]:[])];}
export function parseSupportedRules(input:unknown):SupportedRule[]{
 if(input===undefined)return[];
 if(!Array.isArray(input)||input.length>clientSupportedRules.length||input.some(value=>typeof value!=='string'||!(clientSupportedRules as readonly string[]).includes(value)))throw Error('Refresh Crosswalk: this client sent an unsupported rules declaration. Your saved seat is unchanged.');
 return [...new Set(input)] as SupportedRule[];
}
export function rulesSupportError(g:RulesVersionFields,supported:readonly string[]=[]):string|null{
 if([g.actionIncidentsVersion,g.careerVersion,g.financialRecoveryVersion].some(version=>version!==undefined&&version!==1))return 'This saved room uses a newer Crosswalk rules version. Open the latest Crosswalk page to continue. Your seat and saved progress are safe.';
 const missing=requiredRules(g).filter(rule=>!supported.includes(rule));
 return missing.length?'This saved room uses newer Crosswalk rules. Open the latest Crosswalk page, then retry this action. Your seat and saved progress are safe.':null;
}

/** GET room/restore capability is a single comma-separated, non-secret query value. */
export function parseSupportedRulesQuery(values:string[]):SupportedRule[]{if(values.length>1)throw Error('Refresh Crosswalk: the supported rules query is ambiguous. Your saved seat is unchanged.');return values.length===0||values[0]===''?[]:parseSupportedRules(values[0].split(','));}
