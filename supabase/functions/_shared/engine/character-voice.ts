import {canonicalCharacterById} from './character-canon.ts';
/** Scene-specific writing derived from the approved personalities. No random type,
 * ethnicity, age or OCEAN-to-reward formula chooses what a person says. */
export type CharacterVoice={help:string;boundary:string;repair:string;support:string;small:string};
export const characterVoices:Record<string,CharacterVoice>={
  "mina": {
    "help": "That is where I lost the breath. The last line still belongs there. When I read it silently, I can pretend that I have enough air for everything. Out loud, the line makes me choose.",
    "boundary": "I asked for a listener. I did not give you the ending. I stopped because I wanted to find the next word, not because the room needed to find it for me.",
    "repair": "Tell me where you stopped listening. I can choose what to change. I may keep the troublesome line. Hearing where it lost you is useful even if I decide it should stay.",
    "support": "Take your time. I want to hear how your sentence ends. You needn’t make it sound better for me. I know how much of a sentence can disappear while someone is trying to sound all right.",
    "small": "I have a little quiet before rehearsal. Which part needs hearing? We can start with the part you nearly left out. Sometimes that is the only part I still hear afterward."
  },
  "eli": {
    "help": "One name beside the next job. Then I can actually leave it. I can see where to leave off now. It is a small pleasure, finding a place on the page that does not automatically become mine.",
    "boundary": "An empty space on the rota is not automatically my name. If I fill it every time, nobody sees the empty space. I am tired enough to want them to see it today.",
    "repair": "Let us name who is doing what, including where I stop. I will try not to reach for the unfinished part the moment someone else does it differently.",
    "support": "Sit down. You can be here without earning the chair. I have spent enough of the day counting what people can bring. Tell me how you are, even if you have nothing to offer this afternoon.",
    "small": "A short break is real. I still need to finish the handover. I would like longer too. For now, sit with me while I finish this cup; the next job has a name beside it."
  },
  "jo": {
    "help": "One repair, the maker named, and a place to put the tools down. The edge is sound. Put the tools there, where the next person can find them. We can look at the finished thing for a moment.",
    "boundary": "That is another job. It needs another agreement. Look at the work still on the bench. It takes the same time whether the request arrives as a favor or an invoice.",
    "repair": "Keep the correction on the page. The work and its credit stay together. I can see the change. Leave it there rather than explaining it away; the next person needs the corrected instruction.",
    "support": "Which bit is yours to do? We can start there and leave the rest. We can look at it together before we reach for anything. Sometimes the wrong tool is simply the first one a worried person picks up.",
    "small": "I can suggest a first step. I am not taking over the whole thing. Show me the part that has stopped you. I can give that part my attention without pretending I have agreed to everything around it."
  },
  "neri": {
    "help": "Keep the older line visible. Untidy is not the same thing as wrong. A clean copy would have made the mistake look inevitable. Now somebody can see where the understanding changed.",
    "boundary": "I agreed to a conversation, not a decision about both our lives. You have already begun describing where I would live. I have not finished telling you what I want from the work.",
    "repair": "Let us separate what was offered from what was assumed. I can return to that question with you. I would rather hear an uncertain answer than another plan that quietly includes mine.",
    "support": "Which part do you want to decide today? The rest can remain a question. You may find the answer changes when we say it aloud. That does not make the first attempt dishonest.",
    "small": "I can make this check-in. The posting still has its own hours. Tell me the thing you need me to understand before I go back. I can listen without resolving the whole map of it."
  },
  "alder_tess": {
    "help": "There. Someone can answer the next question without looking for me. I shall try to survive the disappointment.",
    "boundary": "The closing hour is still there, even when I like the company. The cups still need putting away. I would like to get home while there is an evening left, even a very ordinary one.",
    "repair": "Good. Keep that finishing time on the note. I can read that without translating it. Leave the pencil there; I am trying not to improve a line that now does the job.",
    "support": "You need not solve the whole month before the tea cools. Start with the thing you can stop carrying tonight. I am very good at noticing everybody else’s unfinished lists and less good at closing my own.",
    "small": "A few minutes at the window. Then it is time to hand over. Tell me the part that cannot wait until tomorrow. We can give it our attention without pretending the clock has stopped."
  },
  "alder_rowan": {
    "help": "One label someone can use is enough for this shelf today. I almost added the other two names again. Someone looking for a seedling does not necessarily want to become an expert in my indecision.",
    "boundary": "The seedlings need care. That does not make every evening available. I would like to read something that is not an instruction for keeping another living thing alive. Just for an evening.",
    "repair": "Leave the extra jars out of it. I can agree to this one label. I can leave the unchosen versions in the notebook. They need not accompany every person who borrows the book.",
    "support": "We can start with a page, not a reading list for your entire life. Show me the passage you keep returning to. We can talk about why it stays with you before finding five more things to read.",
    "small": "One suggestion, then I need to return to the books. I can mark the page. What you do with it afterward can belong to your own afternoon."
  },
  "saffron_leila": {
    "help": "How many meals did I agree to? Good. Let us make those work. The portions are counted. I can lift a tin without wondering which promised meal somebody has decided it might become.",
    "boundary": "A larger oven is not the answer to every question about lunch. I have food on the griddle already. If you want a different meal, ask me when I have room to make it.",
    "repair": "This is the slot I chose. Ask before you add another batch. I heard the correction. Leave the original order where I can read it, and we can get this meal finished.",
    "support": "Sit. You can tell me, or we can just eat. The first mouthful can happen before the explanation. I would rather hear you after you have had something warm.",
    "small": "I can talk between batches. I am keeping the next one on time. I’m listening. Give me the important part before I have to turn back; I won’t pretend an ordinary pause lasts forever."
  },
  "saffron_tomas": {
    "help": "That is the likely step. Let me mark the part that still needs checking. I can follow the instruction without having to remember what I meant when I wrote it. That is an improvement I can trust.",
    "boundary": "A confident answer is not a checked answer. I would rather leave you with the question clearly marked than send you away reassured about the wrong thing.",
    "repair": "Keep the uncertain bit marked. We can consult the right person. I nearly answered before I read your correction. Give me a moment with it. I want to understand the difference.",
    "support": "Show me the step after this one. We can find the unclear bit together. Point to where the sequence stops making sense. We needn’t make you repeat the parts you already know to prove you tried.",
    "small": "I can explain this label before returning to the queue. I’ll explain why that mark is there. You can ask me to slow down if I start unfolding the rest of the machine."
  },
  "saffron_ada": {
    "help": "That is one reading. I am leaving space for another, including no answer yet. I had an answer ready, and yours has made it less useful. That is a better conversation than I would have organized.",
    "boundary": "We owe the room its finish. The discussion cannot borrow the cleanup shift. The projectionist is putting things away. A good discussion should not depend on somebody else quietly missing their evening.",
    "repair": "Let the pause stay. We do not have to rescue it with another question. I can hear the question differently now. Let me think rather than reward the apology with an immediate, polished answer.",
    "support": "Which bit lost you? I do not need you to rescue my choice. You are allowed to dislike the part I love. Tell me what it did to the rest of the film for you.",
    "small": "One question, and you may leave it unanswered. I would rather hear one answer you have time to consider than collect a whole conversation from somebody watching the door."
  },
  "glass_ren": {
    "help": "Two flights before the bench. That is more useful than calling it easy. I have put the steps beside the stop. People can choose what suits them without first agreeing that my favorite route is easy.",
    "boundary": "I know where it starts. I have not checked where it comes out today. That gate may be closed. I am not sending you toward it just because I can describe the path so confidently.",
    "repair": "Put the qualification back beside the route. There. The note says when I checked it. I would rather have someone take the longer way than arrive at my certainty and find a lock.",
    "support": "Would a route with fewer steps help? You can choose the pace. We can put a rest before the steep part. There is no prize for enjoying a walk exactly as I would describe it.",
    "small": "I can point out the stop. I am keeping the rest of the evening free. Here is the stop on the map. If I begin explaining the line beyond it, remind me which question you asked."
  },
  "glass_sora": {
    "help": "A drawing, or another minute with it? The piece can stay in its learner’s hands. They can see the difference now. Leave the piece in their hands; I want to know what they try before I show them my way.",
    "boundary": "No. That time already belongs to another job. The other person has waited for that slot. I am not moving their work because this request sounds more urgent when said aloud.",
    "repair": "This is the task we agreed. Leave the other person room to try. I have put my hands back on my own side of the bench. It is harder to teach that part by drawing a diagram.",
    "support": "Which difference can you see here? Start with that one. Turn it until the edges are clear. You do not need to recognize the whole solution before noticing one useful thing.",
    "small": "One diagram. The teaching bench already has an owner this afternoon. I’ll draw the joint large enough to read. After that I need to give the next learner the time already on the sheet."
  },
  "glass_pavel": {
    "help": "The next helper has a task. My book still has a chapter. There, I can sit with a book while somebody else does something useful. The garden has survived this arrangement before.",
    "boundary": "That can wait until I have finished reading. I have been very helpful today. I would like to discover what happens in the next chapter without turning it into another obligation.",
    "repair": "A useful garden should leave someone time to sit in it. That is the arrangement I meant. Leave the spare space on the bench; a garden is allowed to contain somebody doing very little.",
    "support": "You do not owe the bench a conversation. You can sit here and say nothing. It is a perfectly respectable way to spend part of the day with another person.",
    "small": "A suggestion and a place to pause. Not a whole afternoon of chores. Take the suggestion if it helps. I am keeping my place in the book while you decide what your afternoon needs."
  },
  "pelagia_mara": {
    "help": "Probably is useful information. It is not the same entry as checked. I can hand this note to the next shift without asking them to reconstruct which parts I was hoping would be true.",
    "boundary": "The inspection still needs its trained crew. A favor cannot replace that. Look at the unchecked line. That is why the crew is still here. I will not turn it into a signature to make the wait feel shorter.",
    "repair": "Name the owner and leave the unchecked line visible. The next person can see where the check stops. We can finish that part properly rather than make the note look complete.",
    "support": "Which obligation is actually yours? Start with that one. We can name the first thing that needs an answer. You do not have to become responsible for every question beside it.",
    "small": "One public question. The handover still needs finishing. I can explain the public status. The unfinished inspection remains with the people doing it, even if we both wish it were quicker."
  },
  "pelagia_lio": {
    "help": "The boat did not bring it. Today’s greens are on the board. Now the board agrees with the pot. I can serve somebody without beginning the meal with an apology for an ingredient they only imagined.",
    "boundary": "I cannot promise the next boat or put an absent ingredient in the pot. The person waiting for breakfast cannot eat an expected arrival. I am cooking what is here, while it is fresh.",
    "repair": "Let the menu describe the meal we actually have. I can point to the greens and say the same thing the menu says. A surprisingly peaceful way to begin serving lunch.",
    "support": "You can just have breakfast. There need not be a story with it. Sit while it is warm. If you want to talk afterward, I can hear you; eating needn’t be an introduction to anything.",
    "small": "A little pause between batches. The dependable part can stay simple. The next batch needs me soon. Until then, tell me how you are. I may answer while checking the pot, but I am listening."
  },
  "pelagia_esme": {
    "help": "Clear instructions can leave the contributor’s answer blank. The blank space is doing useful work. Someone can look at this without feeling the label has already decided what they ought to say.",
    "boundary": "You do not owe the display an ending. Neither does anybody else. I am putting the pencil away. You can leave the sentence unfinished, and it will not become a gap I ask somebody else to fill.",
    "repair": "Keep that account beside theirs, with its own name. Now a reader can hear both accounts without mistaking one person’s confidence for the other person’s agreement.",
    "support": "Which part would you rather keep for yourself? It can stay there. I have spent years asking questions with a place ready for the answer. We needn’t give this conversation a place in the collection.",
    "small": "One prompt, for you. Nothing from this pause goes into the archive. Tell me only what you want to say today. I can remember the company without turning it into a record."
  },
  "pelagia_tavi": {
    "help": "Let us earn another tray before we borrow the whole bed. The dated result is here. I would have preferred more vegetables, but at least we know which confident idea failed to produce them.",
    "boundary": "The reliable greens are supper. The trial is still a question. I can be curious without putting the whole meal at risk. Leave that bed for the crop people are expecting to eat.",
    "repair": "Date the result, and keep it separate from the dependable crop. I can see which observation changed. The disappointment can stay in the account too; it was a disappointing tray.",
    "support": "What could you try on a scale small enough to be wrong? We can choose something you could revise without losing the whole attempt. I find it easier to begin when being wrong has a manageable size.",
    "small": "One observation today. There is no need to explain every possibility. Tell me what you noticed first. I will keep my third explanation to myself until you have finished describing it."
  },
  "mesa_june": {
    "help": "If I start hovering over the handover, point me toward my tea. The handover is there and the mug is here. I can see both perfectly well without crossing the room to rearrange either of them.",
    "boundary": "Supper can be supper. A repair needs its own invitation to the bench. I have taken the apron off. If I put it back on every time somebody admires what I can fix, I shall never find out what my own evening contains.",
    "repair": "I did want to say yes. This is the job I can actually hand over. I can leave this job in another pair of hands. You may have to endure the sight of me watching without offering a correction.",
    "support": "Both mugs are here. For once, the desk has somebody else’s name on it. Sit with me. The quiet is rather unfamiliar; I keep hearing an imaginary bell that would give me an excuse to get up.",
    "small": "A little time between jobs. Not a fourth apron. Tell me what happened while I finish the tea. If I reach for another job, you can remind me what the mug is for."
  },
  "mesa_inez": {
    "help": "Tell me what the bed did. That is a return we can use. Put the result beside the borrowed tool’s name. A failed attempt can teach the next borrower more than a beautifully worded promise.",
    "boundary": "Who will water it in August? Answer that before choosing the ribbon. The person holding the watering can will still be here after everybody has admired the opening. Name them before we cut the ribbon.",
    "repair": "One named job, with an end. Leave the heroic promise off the form. I can see where this job ends. That makes it easier to believe somebody will still be willing to do the next one.",
    "support": "What is the tool for? Let us name the task before gathering everything. What is the first thing you need it to do? We can leave the other tools on the shelf until the task asks for them.",
    "small": "One planning note, then I need to return to the lending desk. I can help you write the question clearly. The lending desk still needs me, and the rest of your plan needs your own time to take shape."
  },
  "bram": {
    "help": "Easy at noon, or open at midnight? Those are different notes. I have put the hour beside it. The line looks less elegant and tells a tired person considerably more about getting home.",
    "boundary": "I do not know tonight. I can show the way I do know. I would prefer to disappoint you here, where we can look at another route, rather than at a gate in the dark.",
    "repair": "Date the uncertainty. An honest dashed line is still useful. You can see which part I know now. I am leaving the dash on the rest, even though a solid line would make the map look finished.",
    "support": "There is a seat before the turn. We can put the stop in the plan. There is shelter by that seat. We can let the route include stopping, rather than treating the pause as something you have failed to walk through.",
    "small": "One checked route, with the unchecked entrance still marked. That is the route I can vouch for. I will leave the other entrance marked until somebody has actually been through it tonight."
  },
  "oren": {
    "help": "The ferry is small enough. Its passenger already has unreasonable expectations. I wanted to make that one change. Now I can put the little ferry away and still have done something with the afternoon.",
    "boundary": "No building today. I can want company and still leave the stage alone. Please leave the box shut. I do not want to spend the visit explaining why the project is staying in it.",
    "repair": "Let me choose the one change. The extra window can wait. That is the change I chose. We can stop there while I still have room to enjoy what we have done.",
    "support": "Which bit matters to you? Keep that. The rest can wait for another day. You can tell me why it matters without turning it into something we must finish together. I would like to hear about it.",
    "small": "Stay a little. No building today, and I may do most of the listening. You needn’t keep asking whether we should do something. We are already keeping each other company, and that is enough for this visit."
  },
  "hugo": {
    "help": "Fair question. I left the visible part out of the instruction. I can see where the sentence failed you. That soft resistance under the thumb belongs in the instruction; ‘ready’ was just my memory doing the work.",
    "boundary": "I can give a clear starting point. I cannot guarantee every batch. Some dough rises slowly. Tell people what to look for, and let them check it. A promise about every oven would be a lie.",
    "repair": "That was your turn. Let me put it back. I reached for the page before you finished. Go on. I can learn where my explanation fails by letting you get to that part.",
    "support": "Tell me the whole thing first. I will wait before correcting a word. Start at the beginning if you need to. I am leaving the pencil on the bench until I know whether you wanted a correction or company.",
    "small": "I can read this short part before returning to the bakery. Show me the line. I’ll read it once without explaining over it, then tell you where I lose the thread."
  },
  "priya": {
    "help": "I heard the gutter. Tell me where you heard that. The same afternoon sounded different from where you stood. I can put your observation beside mine without deciding which of us heard it properly.",
    "boundary": "Possible is still the important word in that sentence. I have written it as a possibility. I would rather keep the uncertainty than let a confident sentence send someone out expecting the wrong weather.",
    "repair": "I can offer a route. The feeling will have to be yours. That is a route you can choose. I cannot give you the feeling I had on it, though I wanted to share something of the afternoon.",
    "support": "You can notice something different. I do not have to improve it. Tell me what you heard. I can listen to your version without searching for a more interesting sound to put beside it.",
    "small": "One listening suggestion. You do not owe me an account of how it felt. You may hear something else entirely. I would like that, though you do not need to bring me a report to make the suggestion worthwhile."
  },
  "sami": {
    "help": "What in that instruction told you to try it that way? I had forgotten that I knew the answer before reading the rule. Watching you use the sentence has been rather more useful than explaining it again.",
    "boundary": "One change. If we change everything, I will not know what helped. I need to see what this version does. Otherwise every result will arrive with six possible explanations and none I can actually test.",
    "repair": "Some people want the words. Leave them a way in too. I can leave the words beside the drawing. Noticing a shortcut for myself did not make it the entrance everybody else wanted.",
    "support": "Would a sketch help, or would you rather keep talking? Tell me the shape of the problem first. I am resisting the urge to make a rule for it before I know what you want to keep.",
    "small": "I can look at one idea before returning to the board. One idea is enough to begin with. We can see where it catches before designing a whole second game around the improvement."
  },
  "miro": {
    "help": "Let the cleaner have this pause. The arrival already has the whole station. I would have given the arrival another speech. The pause makes the person who has been there all day visible without asking them to explain themselves.",
    "boundary": "A clever addition can still be more work than somebody asked for. I have imagined a magnificent version. I can keep it in my head until somebody actually wants to build it, which is a different operation.",
    "repair": "Would you like a note, or shall I just be the audience? I heard you. I will put the imaginary scenery down and listen to the part you were trying to show me.",
    "support": "I have imagined a revision. First, did you actually want one? I can enjoy the thing as you made it. That is worth discovering before I begin telling you how thoroughly I could rearrange it.",
    "small": "One small response. Not a new grand backdrop. Tell me the part you want heard. I will try to leave the rest of the stage empty long enough for it to land."
  },
  "sefu": {
    "help": "No is a perfectly usable answer. I can leave it in the invitation. I can send that invitation without preparing an argument for the answer. My feet are still nervous, but the wording needn’t make anybody else nervous too.",
    "boundary": "A favor is not an evening somebody owes me. I asked because I wanted the company. I do not want to turn that into a reason somebody regrets having helped me before.",
    "repair": "Ask once, then leave room for the answer. That sounds like a question now. I can wait for the answer without filling the pause with all the reasons I would prefer yes.",
    "support": "We can try a small beginning. It does not have to look accomplished. We can begin badly and still have begun. I need reminding of that myself, particularly when there is music and somebody else appears to know the steps.",
    "small": "One gentle suggestion, and no requirement to show me afterward. Try it if you want to. You can keep the attempt for yourself; there is no performance due at the end of my suggestion."
  },
  "kit": {
    "help": "The tea went cold while they talked. That was the event. The cold tea told us how long they had been talking. I can leave the cup there without adding a speech that explains what the picture already knows.",
    "boundary": "The page is mine to change. A family visit is not an editing appointment. I have put the page away. I want to be here with my family for a while without turning the afternoon into feedback on the comic.",
    "repair": "Ask which kind of response I want before redrawing the moment. That gives me room to decide what I want from the note. I can hear the suggestion without finding my page already rearranged around it.",
    "support": "There is something worth keeping in the ordinary detail you noticed. Tell me what stayed with you before it became a better story in the retelling. Sometimes that first, awkward detail is the one worth drawing.",
    "small": "A short note. Parenting and diner work still need their own time. I can give this one moment my attention. The rest of the page may have to wait, and it will still be there when I come back."
  }
};
export function characterVoiceResponse(id:string,key:string,response:string,remote=false){
 const c=characterVoices[id];if(!c)return '';
 const line=key==='help'?c.help:key==='press'?c.boundary:key==='repair'?c.repair:key==='ask'?(response==='support'?c.support:response==='refusal'?c.boundary:c.small):'';
 return line?`${canonicalCharacterById[id].name} ${remote?'writes':'says'}, “${line}”`:'';
}
export const familyConversation:Record<string,{title:string;body:string;outcome:string}>={
 mina:{title:'Ask about home and songwriting',body:'Ask how her family fits around her own writing, without requesting private stories or an introduction.',outcome:'Mina mentions her mother Solange and grandfather Lucien. “A family table can be noisy. The line I keep afterward is still mine.” She chooses one ordinary sound to describe; no notebook or relative’s confidence is offered.'},
 eli:{title:'Leave room for Asha’s own drawings',body:'Eli is Asha’s parent. Talk about offering encouragement without turning a teenager’s notebook into pantry work.',outcome:'“Asha’s garden can stay imaginary,” Eli says. “It does not have to grow the pantry’s supper.” He also names the two school pickups his mother Celia actually agreed to; her retirement does not make her the spare rota.'},
 jo:{title:'Make a family offer that can be declined',body:'Jo lives in Alder Quay; their adult child Kit and grandchild Bea have a home in Ember Mesa. Help word a small offer across that distance.',outcome:'From their Alder Quay workbench, Jo drafts an offer of drawing materials for Kit in Ember Mesa, leaving the comic’s ending alone. “And I can ask how Bea is doing without telling Kit how the afternoon must go.” No acceptance, delivery or new care arrangement is assumed.'},
 alder_tess:{title:'Keep family time separate from café time',body:'Tess is Nico’s parent. Ask how she leaves room for a child’s interests without assigning café tasks.',outcome:'“Nico’s leaf collection is not my next display,” Tess says. She wants to hear which shape caught their eye after her named handover. Her mother Ruth and brother Oliver have their own schedules. Nell Harper’s visits from a traveling life beyond Alder bring different stories to the same family table.'},
 oren:{title:'Ask what kind of company fits today',body:'Oren is receiving chemotherapy for lymphoma. Let him choose what to share and whether today includes a project.',outcome:'“A short call with Miro can be enough,” Oren says. “I can ask for groceries another time, if I want.” His brother remains in Glasssteppe. Oren chooses company without a repair task today; neither fatigue nor accepting help cancels his agency.'},
 hugo:{title:'Ask about chosen family',body:'Hugo and Jonah Bell are chosen brothers. Leave them room to share interests without treating family as an unpaid job.',outcome:'Hugo describes Jonah as his chosen brother. “He can tell me the bread is good and still have no interest in annotating a recipe.” He keeps affection separate from recruiting the next test reader.'},
 priya:{title:'Ask about a family connection across regions',body:'Priya’s mother Kamala and brother Anil live in Pelagia; her adult child Dara has a life in Alder.',outcome:'“A weather note is not a command to stay indoors,” Priya says. She keeps Kamala and Anil’s Pelagian home distinct from Dara’s life beside her in Alder. Concern can travel between them without deciding their days. She can ask a direct question without attaching a forecast to the answer.'},
 saffron_leila:{title:'Ask about being siblings off duty',body:'Leila is Tomas’s older sister and Rafael’s sibling. Talk about family time without enlarging the stall.',outcome:'“Tomas can come for lunch without repairing something,” Leila says. Her mother Inés and brother Rafael have their own work and plans too. She describes one meal she would rather enjoy than turn into a larger event.'},
 saffron_tomas:{title:'Leave a meal free of repair advice',body:'Tomas and his older sister Leila share family history, but her kitchen remains hers to run.',outcome:'“I can tell Leila about the diagram later,” Tomas says. “First I can ask how her morning went.” He leaves an unsolicited improvement out of the conversation. His sibling Rafael and mother Inés are family, not extra hands promised to this repair.'},
 sami:{title:'Ask about interests a family need not share',body:'Sami’s mother Farah keeps her own haberdashery and follows radio dramas. Ask without expecting a game collaborator.',outcome:'Sami smiles. “Mum is entitled to an evening with her drama. My board does not need to be everybody’s hobby.” He can ask Farah about the shop without expecting a spoiler or volunteering her for a play test.'},
 glass_ren:{title:'Ask about family beyond transport work',body:'Ren is Mei Chen’s adult child and Jian Wu’s cousin. Keep the teenager’s drawing separate from railway responsibilities.',outcome:'“Jian can draw a route without operating it,” Ren says. “Mum can tell a bus story and then talk about the choir.” Their grandfather Liang has his own drawing-class visits; three generations do not need the same project.'},
 glass_sora:{title:'Ask about making room for family',body:'Sora is Natsumi’s adoptive parent, Akira’s adult child and Hana’s nibling. Ask without assuming inherited traits or a shared trade.',outcome:'Sora names Natsumi as their daughter. “Her time is not a spare shift at my bench.” A visit with Akira or Hana can be an ordinary visit; nobody has to inspect a repair.'},
 miro:{title:'Let Oren choose the length of a call',body:'Miro is Oren’s older brother. Help him word a check-in that respects Oren’s treatment, fatigue and choices.',outcome:'“No call today can simply mean no call today,” Miro says. He writes an offer of grocery help for Oren to accept or decline, without asking for reassurance in return. He leaves the proposed backdrop out of the message.'},
 pelagia_mara:{title:'Leave Lin’s paper town to Lin',body:'Mara is Lin’s parent and Ravi’s spouse. Talk about family life without treating a child’s play as engineering practice.',outcome:'“Crooked Street can stay crooked,” Mara says. Lin’s seven-year-old paper town is play, away from working water and machinery. Ravi is Lin’s stepparent and Nila’s biological parent; nobody’s place in the family depends on sharing a technical interest.'},
 mesa_june:{title:'Let family time stay off duty',body:'June is Rosa’s adult child and Mateo’s parent. Ask how they make room for one another without assigning every repair to June.',outcome:'“Mum can want a visit without a bicycle arriving first,” June says. Rosa and Mateo have their own interests; June can keep a training afternoon too. She names one ordinary gathering without volunteering the family to cover her work.'},
 pelagia_esme:{title:'Ask about family stories that stay private',body:'Ask how Esme leaves relatives control over their words, just as she does other contributors.',outcome:'Esme names her adult child Lata, then keeps Lata’s choices under the same consent rule as the archive. “Knowing the person does not mean owning the story.” She offers a blank correction form instead of supplying a relative’s memory.'},
 sefu:{title:'Make a family invitation optional',body:'Sefu is Safia’s adult child and Amir’s parent. Ask how a dance invitation can leave each person free to choose.',outcome:'“Amir’s school time is not spare clock-maintenance time,” Sefu says. Safia can enjoy her own evening too. He practices an invitation with a genuine no in it, without recruiting either relative into his work or nervousness.'},
 mesa_inez:{title:'Let two generations choose their own work',body:'Inez is Esperanza’s mother and Luz’s grandmother. Ask how lending tools differs from deciding their projects.',outcome:'“The van is Esperanza’s business. Luz’s page is Luz’s page,” Inez says. She can ask what a tool is for without making the answer a family assignment. One useful question leaves room for three different lives.'},
 kit:{title:'Keep care and creative ownership together',body:'Kit is Jo’s adult child and Bea’s parent. Talk about accepting family encouragement while keeping decisions at home.',outcome:'From Ember Mesa, Kit drafts a warm note to Jo in Alder Quay, asking for encouragement rather than an edit. “And if Bea needs me, the panel can wait.” The comic stays theirs; caring for a two-year-old is a real responsibility, not proof that they lack commitment.'},
};
