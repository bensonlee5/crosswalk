import type {Game} from './game.ts';
import type {CastCharacter} from './cast-characters.ts';
import {canonicalCharacterById} from './character-canon.ts';
import {characterVoiceResponse} from './character-voice.ts';
/** Authored capacity moments, not a treatment calendar, prognosis or a reward for
 * trust. Rest remains available regardless of friendship or contribution totals. */
export function orenNeedsShortVisit(g:Game){return g.characterCanonVersion===1&&[2,5,7].includes(g.round);}
export function currentCastCharacter(g:Game,c:CastCharacter):CastCharacter{
 if(g.characterCanonVersion!==1)return c;
 const canon=canonicalCharacterById[c.id];
 const next={...c,role:canon.role,bio:`${canon.name}, ${canon.age}. ${canon.intro}`};
 if(c.id==='oren'){
  next.bio+=' Oren has lymphoma and is receiving chemotherapy. His sparse hair and fatigue are visible; he decides what company and work fit today.';
  next.listen='Oren says his miniature comedy has gathered scenery for six years. The worry about finishing is one thing; chemotherapy-related fatigue is another. “Rest is not another way of avoiding the last line.” He chooses how much to share about his treatment.';
  next.invitation='“Next month, could you listen to one short run? A recording if a seated visit is too much.” Oren chooses a small, adaptable rehearsal rather than promising a good-energy day.';
  next.kept='You make time for the promised short run in the form Oren chooses today. He reads only the lines he wants to read, seated, with a recorded passage available. The comedy reaches its small ending, and Oren leaves the stage where it is.';
  next.remoteKept='Oren sends the short recording he chose for your agreed listening. You return one specific response and leave further work for another day. He thanks you for listening from afar, then puts the recording away.';
  next.listenCallback='Oren remembers being able to explain the difference between worrying about an ending and needing to rest. He asks what kind of visit fits today, without promising the same energy as last time.';
  next.helpCallback='Oren remembers the small piece you helped with and the room left for him to choose its scale. He asks whether today’s exchange can stay just as bounded.';
  next.missed='Oren used the recording option and asked Jo for a short response rather than waiting to give a live rehearsal. The little comedy kept a listener, but you did miss the time you agreed to give it.';
  next.renegotiated='You tell Oren before the agreed listening that you cannot make it. He removes your name from the note and considers a shorter recording exchange with Jo. He can also postpone; the plan does not require him to produce a good-energy day.';
  next.repair='You acknowledge missing the agreed listening and ask what repair would fit now. Oren chooses one brief response to a recording he offers, with no building or packing session. He dates the new listening separately from the visit you missed.';
  next.remoteRepair='You acknowledge the missed listening through community correspondence. Oren chooses a short recorded passage and you send one specific response. He dates this exchange separately and keeps any future invitation flexible.';
  next.disagreementRepair='You ask Oren to name the pace and kind of response he wants. He chooses one comment on the idea, with the materials left aside. You return the decision about scale and timing to him.';
  next.friction='Oren has thought of another detail for the miniature stage, then wonders whether the small ending already works. He asks for an opinion about its scale, keeping today’s conversation separate from a building session.';
  next.boundary='Oren hears your opinion and chooses to leave the usable stage as it is today. An idea can wait in his notebook without becoming a repair you must both finish. He keeps the decision about any later work.';
  next.farewell='Oren remembers that a visit could leave room for a little comedy and a stopping point. The cardboard ferry stays his to work on or put aside. He is glad the friendship can include company without a project.';

  if(orenNeedsShortVisit(g)){
   next.intro='Oren stays seated with his blue Kestrel tea tin nearby. “Company, yes. A building session, no.” Treatment fatigue limits today’s work; he still has a joke about a ferry passenger and a clear preference about the visit.';
   next.help='Oren asks you to leave the extra cardboard window off today’s list. He keeps the small comedy his own and puts the materials aside. He closes the Kestrel tin at the stopping point he chose.';
   next.support='Oren offers a short hearing of one rough idea, seated, with no demonstration. “Which bit matters? Keep that.” He ends the exchange when he needs to rest.';
  }
 }
 return next;
}
export function castCanonResponse(g:Game,id:string,key:string,outcome:string,remote:boolean){
 if(g.characterCanonVersion!==1)return outcome;
 const mapped=key==='help'?'help':key==='repair'||key==='honest'?'repair':key==='rush'?'press':key==='accept'?'ask':'';
 const line=characterVoiceResponse(id,mapped,'support',remote);
 return [outcome,line].filter(Boolean).join(' ');
}

export function currentMotiveProfile(g:Game,c:import('./character-motive-profiles.ts').CharacterMotiveProfile){
 if(g.characterCanonVersion!==1||c.id!=='oren')return c;
 return{...c,priority:'Oren wants his small comedy to have an ending. He chooses the scale; treatment fatigue is a capacity limit, not a lack of commitment.',obligation:'Chemotherapy, rest and the paid mending he actually chooses to take on leave variable room. No friendship can promise a good-energy day.',task:'Ask which single change, or stopping point, Oren wants help naming today.',followThrough:'Oren leaves the extra window off the list and chooses a stopping point for today. The usable ferry stays his to work on, record or put aside; you do not decide how his energy should be spent.',support:'Oren offers a bounded hearing of one rough idea and asks whether you want a note or a listener. He chooses the length of the exchange and ends the visit when he needs to rest.',smallerSupport:'Oren chooses a short check-in with no building or demonstration. When he needs to stop, the idea can remain unfinished and the company still count.',boundary:'Oren will not promise energy he does not have or agree to an extra stage build. He can decline a task and still want company.',repair:'You acknowledge treating Oren’s capacity as negotiable and ask what kind of company, if any, fits today.'};
}
