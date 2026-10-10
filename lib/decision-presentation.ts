/** Presentation only: never changes a price, eligibility check, receipt or effect. */
import type {Activity} from './game';
import {qualitativeText} from './point-presentation.ts';
import {ACTION_ILLUSTRATIONS,type ActionIllustration} from './action-art.ts';
import {locationFor} from './locations.ts';

/** Only standalone numeric resource effects are quieted. Commitments, money,
 * deadlines, unlocks and permanent changes always remain before confirmation. */
export function isQuietEffect(text:string){
 return /^(?:[+−-]?\d+(?:\.\d+)? (?:energy|happiness|connections?|craft|skills?|language|Neri bond|legacy)(?: points?)?|\+\d+(?:\.\d+)? bond with .+|.+ trust [+−-]?\d+(?:\.\d+)?)$/.test(text.trim());
}
export function narrativeExpectation(text:string){return qualitativeText(text);}
export function activityIntent(a:Activity){
 if(a.story)return 'Make time for a neighbor’s story';
 if(a.promote)return 'Take the next step in your working life';
 if(a.housing!==undefined)return 'Make a place of your own';
 if(a.special==='project')return 'Build something the neighborhood can share';
 if(a.special==='opportunity')return 'Be part of this month’s local opening';
 if(/work|shift|overtime|contract|commission|tutor|barista|digitize|harvest|desk|usher|courier|resell|organize/.test(a.id))return 'Do useful work and bring a paycheck home';
 if(/learn|study|bootcamp|course|workshop|intro|practice|portfolio|mentor|skill/.test(a.id))return 'Give a new skill time to grow';
 if(/friends|host|club|group|network|picnic|tabletop/.test(a.id))return 'Make room for time together';
 if(/volunteer|setup|lead|repair|cleanup|project|tend/.test(a.id))return 'Lend your hands to something that matters';
 if(/meal|cook|taste/.test(a.id))return 'Slow down over something good to eat';
 return 'A little room to breathe and enjoy the day';
}
const scene=(file:string,alt:string):ActionIllustration=>({src:`/paintings/${file}.webp`,thumb:`/paintings/${file}.webp`,alt});
type ChoiceArtInput={id:string;actionId:string;title:string;body:string};
/** Authored actions get their existing paintings; travel gets its destination.
 * Conversation-only choices use their actual setting rather than invented icons. */
export function decisionIllustration(c:ChoiceArtInput,place='COMMUNITY'):ActionIllustration&{fallback?:string}{
 const key=c.actionId.split(':').at(-1)!.split('~')[0];
 const destination=c.actionId.match(/(?:travel|relocate):(alder|embermesa|glasssteppe|saffron|pelagia)$/)?.[1];
 if(destination)return scene('world/'+destination,'A painted view of the destination');
 const travel=c.actionId.match(/travel:([^:]+)$/)?.[1];
 if(travel)return scene('world/'+travel,'A painted view of the destination');
 const relational:Record<string,string>={accept_cost:'listen',neri_accept:'make_promise',neri_decline:'set_boundary',neri_plan_coast:'make_promise',neri_plan_home:'make_promise',neri_distance:'renegotiate',neri_visit:'make_promise',neri_friends:'set_boundary',neri_partner:'make_promise',neri_friendship:'set_boundary',neri_payoff:'listen',listen:'listen',introduction:'listen',share:'listen',history_share:'listen',accept:'listen',honest:'disagree',rush:'disagree',repair:'renegotiate',renegotiate:'renegotiate',promise:'make_promise',show_up:'make_promise',shared_keys:'make_promise',no_promise:'set_boundary',small_scope:'set_boundary',respect_plan:'set_boundary',unplug:'set_boundary',release:'set_boundary',history_boundary:'set_boundary',small_future:'set_boundary',quiet:'say_goodbye',pass_on:'say_goodbye',leave_note:'say_goodbye'};
 if(relational[key])return {...scene('decisions/'+relational[key],c.title),fallback:'/paintings/locations/'+locationFor(place).art+'.webp'};
 if(key==='help'||key==='keep'){
  const helpByPlace:Record<string,string>={'COMMUNITY':'community_setup','GARDEN':'garden_tend','MAKERSPACE':'maker_repair','CORNER CAFÉ':'cafe_barista','WORK':'work_mentor','LIBRARY':'library_digitize','MARKET':'market_shift','TRANSIT':'transit_repair','CAMPUS':'campus_group','THE PARK':'rest'};
  if(helpByPlace[place])return ACTION_ILLUSTRATIONS[helpByPlace[place]];
 }
 const authored:Record<string,string>={workshop:'story_jo_2',demo:'story_mina_2',mina_first:'story_mina_3',repair_first:'maker_repair',share_evening:'home_host',protect_set:'cafe_openmic',coordinate:'community_organize',be_here:'story_mina_3',take_shift:'community_setup',setup:'community_setup',keep_setup:'community_setup',pantry:'community_setup',release_cinema:'maker_intro',keep_cinema:'cinema_matinee',food:'market_taste',learn:'library_learn',region_rest:'rest',region_shift:'work_short',regional_work:'work',explore:'transit_scenic'};
 const id=authored[key];
 if(id&&ACTION_ILLUSTRATIONS[id])return ACTION_ILLUSTRATIONS[id];
 if(key==='garden')return scene('actions/opportunity_supper','A painted garden supper');
 if(key==='shared_credit')return scene('actions/opportunity_poster','Neighbors making a poster');
 // Unmapped regional conversations retain their actual setting. The label
 // states intent, rather than claiming an unrelated painting is an exact scene.
 const location=locationFor(place);
 return scene('locations/'+location.art,location.alt);
}
