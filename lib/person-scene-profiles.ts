/** Authored presentation, not simulated state or evidence of a completed action.
 * Appearance details follow the shipped portraits; their painted backgrounds do
 * not locate an encounter. The caller supplies the actual venue and selects any
 * emotional response from confirmed, visible receipts. Familiar lines do not
 * invent progress, promises, permission, or a particular previous conversation.
 */
export type PersonSceneProfile = {
  appearance: string;
  activity: string;
  greeting: string;
  familiar: string;
  farewell: string;
  prop: 'page' | 'cup' | 'plant' | 'tools' | 'map' | 'food' | 'drawing' | 'cups' | 'leaf' | 'none';
};

export const personSceneProfiles: Record<string, PersonSceneProfile> = {
  mina: {
    appearance: 'Dark curls, hoop earrings, and a blue shirt beneath charcoal knitwear.',
    activity: 'Rests a pencil beside a handwritten verse.',
    greeting: 'I keep catching on this line. It sounds different out loud.',
    familiar: 'I have a little quiet. We can leave some of it quiet.',
    farewell: 'I’ll keep the page for a while. See you around.',
    prop: 'page',
  },
  eli: {
    appearance: 'Olive bucket hat, salt-and-pepper beard, and a quilted blue vest.',
    activity: 'Turns a small herb pot to check its leaves.',
    greeting: 'I started with borrowed pots. This one has ideas about spreading.',
    familiar: 'I can put the pot down. How are you doing?',
    farewell: 'I’ll leave you to your day. Take care.',
    prop: 'plant',
  },
  jo: {
    appearance: 'Round glasses, swept silver hair, and a scuffed ochre apron.',
    activity: 'Checks a small wooden offcut against a repair sketch.',
    greeting: 'I’m checking this edge. The drawing was more optimistic than the wood.',
    familiar: 'I can hear you with the pencil down.',
    farewell: 'I’ll put these away. That is enough for now.',
    prop: 'tools',
  },
  neri: {
    appearance: 'A dark asymmetrical bob and pale scarf above a blue jacket.',
    activity: 'Studies an old annotation on a folded chart.',
    greeting: 'I’m looking at the older mark. It might explain the newer one.',
    familiar: 'I have a question, if you have a moment.',
    farewell: 'I’ll fold this carefully. The crease has enough history.',
    prop: 'map',
  },
  alder_tess: {
    appearance: 'Red hair, a yellow headband, square glasses, and a checked shirt.',
    activity: 'Checks the finishing time on a short handover note.',
    greeting: 'I’m checking the last line. A closing time ought to be easy to find.',
    familiar: 'I have a few minutes. What did you want to ask?',
    farewell: 'I’ll get back to this. Good to see you.',
    prop: 'page',
  },
  alder_rowan: {
    appearance: 'Short springy curls and a plum knitted vest with a leaf pin.',
    activity: 'Compares a seed label with a page in a book.',
    greeting: 'I found three possible names. Shall we start with the useful one?',
    familiar: 'I was about to offer a reading list. One page will do.',
    farewell: 'I’ll keep my place. Enjoy the rest of your day.',
    prop: 'page',
  },
  saffron_leila: {
    appearance: 'A teal headwrap and blue apron over a red-striped blouse.',
    activity: 'Unwraps a small portion of food for a pause.',
    greeting: 'I’m taking a bite before I start describing it. Better evidence.',
    familiar: 'I can talk a little. No need to make an occasion of it.',
    farewell: 'I’ll finish eating while it is warm. Take care.',
    prop: 'food',
  },
  saffron_tomas: {
    appearance: 'Dark curls, a neat moustache, and a blue work jacket.',
    activity: 'Traces one step on a folded maintenance diagram.',
    greeting: 'I know this step. The next one still needs checking.',
    familiar: 'I can show you the diagram. Which part are you looking at?',
    farewell: 'I’ll keep the unchecked part marked. See you.',
    prop: 'page',
  },
  saffron_ada: {
    appearance: 'Large amber glasses, close curls, and a gold-patterned scarf.',
    activity: 'Turns a film program over beside a cup of tea.',
    greeting: 'I’m still thinking about that last shot. What caught your eye?',
    familiar: 'I have another question. You can let this one wait.',
    farewell: 'I’ll let that thought sit. Thanks for the conversation.',
    prop: 'cup',
  },
  glass_ren: {
    appearance: 'A navy conductor’s cap, short red hair, and a rust scarf.',
    activity: 'Marks a bench beside a turn on a pocket map.',
    greeting: 'I’m marking the bench. It is easier to spot than the turning.',
    familiar: 'I can show you where I mean. What route are you considering?',
    farewell: 'I’ll put the map away now. Take your own pace.',
    prop: 'map',
  },
  glass_sora: {
    appearance: 'Shaved sides, a dark topknot, and leather straps over olive workwear.',
    activity: 'Draws a joint large enough to see its two edges.',
    greeting: 'I’ve drawn this bigger. Now you can see where the edges differ.',
    familiar: 'I can leave the drawing between us. What do you notice?',
    farewell: 'I’ll stop at this diagram. See you around.',
    prop: 'drawing',
  },
  glass_pavel: {
    appearance: 'A long white beard, green cardigan, and thick mustard scarf.',
    activity: 'Keeps one finger between the pages of an open book.',
    greeting: 'I was reading. Company can be quiet too, if that suits you.',
    familiar: 'I have kept my page. There is no hurry to fill the silence.',
    farewell: 'I think I’ll return to my chapter. Take care.',
    prop: 'page',
  },
  pelagia_mara: {
    appearance: 'Short curls streaked with grey and a yellow waterproof jacket.',
    activity: 'Checks which lines on a handover note remain unverified.',
    greeting: 'I’m separating checked from expected. Both need their own line.',
    familiar: 'I can pause here. What is the question?',
    farewell: 'I’ll finish my part of the note. See you.',
    prop: 'page',
  },
  pelagia_lio: {
    appearance: 'Swept black hair and a red apron over a cream shirt.',
    activity: 'Looks over a short handwritten list of ingredients.',
    greeting: 'I’ve written down the greens first. They are what I actually have.',
    familiar: 'I have a little pause. We can keep it simple.',
    farewell: 'I’ll get back to my list. Good to see you.',
    prop: 'page',
  },
  pelagia_esme: {
    appearance: 'Silver locs pinned back, delicate glasses, and a patterned blue shawl.',
    activity: 'Sets a blank note beside a carefully labeled photograph.',
    greeting: 'I’m leaving room for a correction. A neat label can still be wrong.',
    familiar: 'I can listen without writing. What would you like to keep off the page?',
    farewell: 'I’ll leave the blank space. Thank you for your company.',
    prop: 'page',
  },
  pelagia_tavi: {
    appearance: 'Dark curls beneath a straw hat, yellow shirt, and teal overalls.',
    activity: 'Compares a seedling’s newest leaf with a dated note.',
    greeting: 'I’m looking at this new leaf. One leaf is not a conclusion.',
    familiar: 'I have two guesses. I’m trying to remember they are guesses.',
    farewell: 'I’ll write down what I saw. The explanation can wait.',
    prop: 'plant',
  },
  mesa_june: {
    appearance: 'Short silver hair, a red neckerchief, and a mustard work apron.',
    activity: 'Wraps both hands around a mug for a pause.',
    greeting: 'I’ve got my tea. That counts as an activity, doesn’t it?',
    familiar: 'I’m keeping both hands on the mug for a minute. What’s new?',
    farewell: 'I’ll finish this before it goes cold. See you around.',
    prop: 'cup',
  },
  mesa_inez: {
    appearance: 'A straw hat, long dark-grey braid, square glasses, and pale scarf.',
    activity: 'Reads a lending label beside a closed book.',
    greeting: 'I’m checking the label. It ought to answer a question someone actually has.',
    familiar: 'I can put this down. What do you need to know?',
    farewell: 'I’ll keep the note short. Take care.',
    prop: 'page',
  },
  bram: {
    appearance: 'A shaved head, close dark beard, and bright blue knitted scarf.',
    activity: 'Adds a small dashed line to a pocket notebook map.',
    greeting: 'I haven’t checked that entrance. The dashed line means exactly that.',
    familiar: 'I can show you what I know. At what hour?',
    farewell: 'I’ll leave that line dashed. See you around.',
    prop: 'map',
  },
  oren: {
    appearance: 'Round glasses and a button pinned to a patterned cardigan.',
    activity: 'Rests with a cup, leaving the miniature scenery put away.',
    greeting: 'I’m keeping the stage packed today. Ordinary company would suit me.',
    familiar: 'I may do more listening today. The audience gets a chair too.',
    farewell: 'I’ll take a quiet pause now. Thanks for stopping by.',
    prop: 'cup',
  },
  hugo: {
    appearance: 'Cropped hair, a dark beard, and flour across a blue apron.',
    activity: 'Checks a handwritten recipe note with a flour-dusted finger.',
    greeting: 'I wrote “until ready.” Not much use if you haven’t seen ready.',
    familiar: 'I can hear the whole question before I reach for the pencil.',
    farewell: 'I’ll leave a clearer note. Take care.',
    prop: 'page',
  },
  priya: {
    appearance: 'Silver hair in a low bun, round glasses, and a mustard scarf.',
    activity: 'Pauses over a weather notebook to listen to nearby sounds.',
    greeting: 'I’m listening before I write anything. There is usually more than one sound.',
    familiar: 'I have an observation. It need not become advice.',
    farewell: 'I’ll keep listening for a little while. Enjoy your day.',
    prop: 'page',
  },
  sami: {
    appearance: 'Loose dark curls and a teal overshirt over a white collar.',
    activity: 'Moves one small game piece beside a sketched rule.',
    greeting: 'I’m testing one rule. This piece is behaving suspiciously well.',
    familiar: 'I can put the pieces aside. Unless a sketch would help?',
    farewell: 'I’ll keep the other rules where they are. One change is plenty.',
    prop: 'drawing',
  },
  miro: {
    appearance: 'A curled white moustache, tousled silver hair, and a burgundy scarf.',
    activity: 'Tilts a paper silhouette to look at its shadow.',
    greeting: 'I’ve given him a magnificent hat. It has rather outgrown the plot.',
    familiar: 'I can be the audience this time. No scenery required.',
    farewell: 'I’ll fold the theatre away. Even the hat needs a rest.',
    prop: 'drawing',
  },
  sefu: {
    appearance: 'Short grey-tipped hair, a narrow beard, and a pale striped shirt.',
    activity: 'Quietly counts a dance rhythm with a small foot tap.',
    greeting: 'I’m counting the steps. My feet sometimes hold a different opinion.',
    familiar: 'I can stop counting for a conversation. Probably for the best.',
    farewell: 'I’ll try it once more on my own. Take care.',
    prop: 'none',
  },
  kit: {
    appearance: 'Short plum hair, a nose ring, and a black-and-cream striped overshirt.',
    activity: 'Adds one small panel to a clean order slip.',
    greeting: 'I’m drawing the pause. The cup does most of the acting.',
    familiar: 'I can leave the panel unfinished for a minute.',
    farewell: 'I’ll tuck this away. It fits in a pocket.',
    prop: 'drawing',
  },
  celia_baptiste: {
    appearance: 'Close silver curls and a plum coat over a striped shirt.',
    activity: 'Compares two painted patches on a small canvas.',
    greeting: 'I’m choosing a blue. You may disagree, but I keep the brush.',
    familiar: 'I can hear another opinion. That is not the same as a vote.',
    farewell: 'I’ll get back to my blue. It has waited quite politely.',
    prop: 'drawing',
  },
  farah_hussain: {
    appearance: 'Dark curls streaked with grey, orange blouse, and a pale-blue scarf.',
    activity: 'Reads a radio-drama program with one corner folded.',
    greeting: 'I’m defending this character. I would not accept the same excuse from a supplier.',
    familiar: 'I can discuss the plot. The ending stays with me.',
    farewell: 'I’ll return to my program. No spoilers on your way out.',
    prop: 'page',
  },
  liang_chen: {
    appearance: 'Swept silver hair and a burgundy sweater beneath a dark jacket.',
    activity: 'Settles into a portrait pose, then adjusts one shoulder.',
    greeting: 'I’m the sitter today. I am trying not to arrange the whole room.',
    familiar: 'I almost offered a recommendation. What did you want to ask?',
    farewell: 'I’ll hold still again. That is my part of this.',
    prop: 'none',
  },
  mei_chen: {
    appearance: 'Short dark-grey hair and a blue patterned sweater with a silver pin.',
    activity: 'Straightens a small stack of chorus sheets.',
    greeting: 'I’ve got the copies. Which song do you like? Wait, let me hear you.',
    familiar: 'I can leave a pause. Your turn.',
    farewell: 'I’ll put these together. We can leave the extra chorus for another time.',
    prop: 'page',
  },
  hana_mori: {
    appearance: 'Silver hair beneath a navy knitted cap and a grey jacket.',
    activity: 'Studies a short route on a folded walking map.',
    greeting: 'I’m choosing a walk, not delivering the post. What pace suits you?',
    familiar: 'I have the shorter route here too. Which walk are we actually having?',
    farewell: 'I’ll take my time from here. Good to see you.',
    prop: 'map',
  },
  yuna_park: {
    appearance: 'A short dark bob and black headphones above a burgundy vest.',
    activity: 'Rests her headphones beside a folded radio program.',
    greeting: 'I think I’ve used all my introductions. Could this just be a conversation?',
    familiar: 'I’m leaving the microphone out of this. How has your day been?',
    farewell: 'I’ll keep that as a conversation. Thanks for the company.',
    prop: 'page',
  },
  ravi_desai: {
    appearance: 'Salt-and-pepper curls and beard, a teal shirt, and a cream jacket.',
    activity: 'Looks between a freight notebook and a small astronomy chart.',
    greeting: 'I was about to say “all evening.” Let me check my notebook first.',
    familiar: 'I can enjoy a quiet sky. There needn’t be a grand event.',
    farewell: 'I’ll check the time before I make a plan. Take care.',
    prop: 'map',
  },
  esperanza_vega: {
    appearance: 'A straw hat, dark braid, mustard overshirt, and a mauve scarf.',
    activity: 'Folds a grocery receipt before taking a short break.',
    greeting: 'I’m off the route for a moment. Even the receipt can wait.',
    familiar: 'I can manage a conversation without adding another stop. Watch me try.',
    farewell: 'I’ll tuck the receipt away. Good to see you.',
    prop: 'page',
  },
  asha: {
    appearance: 'Short curls, a denim jacket, and a burgundy-and-yellow hoodie.',
    activity: 'Shows one imaginary garden page, with Eli nearby.',
    greeting: 'I made the path turn into a leaf. Just this page, okay?',
    familiar: 'I can show this bit. I’m keeping the other pages closed.',
    farewell: 'I’m putting it away now. Bye.',
    prop: 'drawing',
  },
  nico: {
    appearance: 'Bright red curls, a green knitted sweater, and blue backpack straps.',
    activity: 'Arranges fallen leaves at a family table beside Tess.',
    greeting: 'I like this leaf. See the edge? It looks like little teeth.',
    familiar: 'I’m still looking. Don’t turn that one yet.',
    farewell: 'I’m taking my leaves. Bye!',
    prop: 'leaf',
  },
  jian_wu: {
    appearance: 'Tousled dark hair, a teal jacket, and a dark backpack strap.',
    activity: 'Compares zine covers at a supervised public drawing table.',
    greeting: 'I like this cover. The other one is clearer, though. Annoying.',
    familiar: 'I’m looking at the title today. Just the title.',
    farewell: 'I’ll keep the pages. Thanks for looking.',
    prop: 'drawing',
  },
  lin: {
    appearance: 'Short brown curls and a bright yellow jacket over a blue shirt.',
    activity: 'Folds paper houses at a dry play table beside Mara.',
    greeting: 'I made Cloud Street. Actually, this bit is Spoon Street now.',
    familiar: 'I’m naming this house. Don’t move it yet.',
    farewell: 'I’m keeping my houses here. Bye!',
    prop: 'drawing',
  },
  bea: {
    appearance: 'Soft auburn curls and rust-red overalls over a cream shirt.',
    activity: 'Stacks chunky wooden cups in a safe family corner beside Kit.',
    greeting: 'Cup!',
    familiar: 'More cup.',
    farewell: 'Bye-bye.',
    prop: 'cups',
  },
  lata_rao: {
      "appearance": "Long dark braid, small gold hoops, and a pale green shirt.",
      "activity": "Adjusts the folded navy jacket resting over one arm.",
      "greeting": "I can give you the distance. Whether it feels short is another question.",
      "familiar": "I have a moment before I check the route again.",
      "farewell": "I’ll get back to the road. Enjoy your own afternoon.",
      "prop": "none"
  },
  nila_desai: {
      "appearance": "Curly hair tied high, ochre overshirt, and a dark backpack strap.",
      "activity": "Adjusts the bag strap and gives the question a sideways look.",
      "greeting": "I’m wondering what that sentence leaves out. It sounds rather complete.",
      "familiar": "I can hear a different reading without promising to use it.",
      "farewell": "I’ll leave that question open while I think. See you.",
      "prop": "none"
  },
  safia_odhiambo: {
      "appearance": "Short silver curls, gold hoop earrings, and a turquoise blouse.",
      "activity": "Rests folded fingers beneath her chin, waiting for an answer.",
      "greeting": "I have an objection. You might enjoy answering it.",
      "familiar": "I can let you finish before I find the clever part.",
      "farewell": "I’ll save the next objection for somebody else. Take care.",
      "prop": "none"
  },
  rosa_moreno: {
      "appearance": "Loose white curls, embroidered rust blouse, and a cream knitted shawl.",
      "activity": "Turns from her radio with one hand resting against her cheek.",
      "greeting": "I heard the result. I’m not finished with my opinion of it.",
      "familiar": "I can hear you. The commentator is only repeating himself.",
      "farewell": "I’ll get back to listening. Mind how you go.",
      "prop": "none"
  },
  mateo_moreno: {
      "appearance": "Broad sun hat, dark curls, dusty blue shirt, and folded fleece.",
      "activity": "Holds the folded fleece while considering an unfinished thought.",
      "greeting": "I had an idea for a corridor. You wouldn’t want to walk down it.",
      "familiar": "I can talk about the story without explaining what it teaches.",
      "farewell": "I’ll leave that image where it is for now. See you.",
      "prop": "none"
  },
  nell_harper: {
      "appearance": "Copper curls, freckles, dark outdoor layers, and a broad backpack strap.",
      "activity": "Adjusts her backpack strap and pauses before the next question.",
      "greeting": "I know where the case is. The evening takes a little more explaining.",
      "familiar": "I can answer the question you actually asked. Start there.",
      "farewell": "I’ll leave you to your plans. Mine still need a look.",
      "prop": "none"
  },
  ruth_harper: {
      "appearance": "Wavy silver-and-copper hair, blue cardigan, patterned scarf, and tortoiseshell glasses.",
      "activity": "Holds her glasses near her cheek, considering a mischievous title.",
      "greeting": "I’m considering a title. The people involved might prefer a quieter one.",
      "familiar": "I can leave the story there if you would rather.",
      "farewell": "I’ll keep my glasses out. There may be something worth noticing.",
      "prop": "none"
  },
  jonah_bell: {
      "appearance": "Short dark twists, trimmed beard, yellow shirt, and a dark jacket.",
      "activity": "Opens one hand, then waits to see whether anybody answers.",
      "greeting": "I like that phrase. Give me a second before I make it worse.",
      "familiar": "I can have a conversation without auditioning the entire time.",
      "farewell": "I’ll let the sentence end there. Take care.",
      "prop": "none"
  },
  lucien_morel: {
      "appearance": "Short grey curls, silver moustache, dark coat, and a rust scarf.",
      "activity": "Lifts a finger, then gives the other person room to speak.",
      "greeting": "I can think of one exception. That doesn’t necessarily spoil the whole idea.",
      "familiar": "I have a question before I offer the counterexample.",
      "farewell": "I’ll leave you the last word. This time.",
      "prop": "none"
  },
  qiao_chen: {
      "appearance": "Short dark hair streaked grey, burgundy padded vest, and navy knitwear.",
      "activity": "Glances aside, leaving a clipped question hanging for a moment.",
      "greeting": "I can tell you when. First tell me how much.",
      "familiar": "I have a minute. It doesn’t need an invoice.",
      "farewell": "I’ll leave you to it. I have an evening to get to.",
      "prop": "none"
  },
  akira_mori: {
      "appearance": "Swept-back grey hair, brown coat, green sweater, and a red scarf.",
      "activity": "Opens his palm, then catches himself extending the explanation.",
      "greeting": "I have a very small part. The explanation is rather larger.",
      "familiar": "I can leave room for another voice. Go on.",
      "farewell": "I’ll stop there, before I add the rehearsal to the goodbye.",
      "prop": "none"
  },
  ines_valdes: {
      "appearance": "Grey-streaked curls, pearl earrings, plum blouse, and a cream patterned shawl.",
      "activity": "Tilts her head, waiting to hear how a sentence will end.",
      "greeting": "I can explain why it matters without telling you the ending. Probably.",
      "familiar": "I want to hear what moved you, if anything did.",
      "farewell": "I’ll leave the ending alone. Enjoy the rest of your day.",
      "prop": "none"
  },
  vera_valdes: {
      "appearance": "Dark curls, pale green overshirt, backpack strap, and a blue game box.",
      "activity": "Keeps her own game box close at an adult-run public table.",
      "greeting": "I want to check the rule before we start. Winning afterward is more satisfying.",
      "familiar": "I’m deciding whether I want another game. Give me a minute.",
      "farewell": "I’m keeping my box with me. Bye.",
      "prop": "none"
  },
  rafael_valdes: {
      "appearance": "Dark curls, salt-and-pepper stubble, pale blue shirt, and a straw hat.",
      "activity": "Turns the straw hat in his hands before answering.",
      "greeting": "I was going to say nearly finished. Let me check before I say it.",
      "familiar": "I can give this conversation a little attention without promising the afternoon.",
      "farewell": "I’ll go when I said I would. Good to see you.",
      "prop": "none"
  },

};

export type PersonFamiliarityLines = {
  routine: [string, string];
  habit: [string, string];
};

/** Repeated crossings can become recognizable without proving friendship,
 * increased access, a shared achievement, or anyone's future availability.
 * The caller selects a stage and alternates its pair using successful persisted
 * encounters, never clicks, failed actions, private receipts, or elapsed time.
 */
export const personFamiliarityLines: Record<string, PersonFamiliarityLines> = {
  mina: {
    routine: [
      'There you are. I don’t need to find an opening line every time, do I?',
      'I recognize your hello. Give me a beat to put the pencil down.',
    ],
    habit: [
      'Our paths keep crossing. I like that it needn’t become a performance.',
      'Hello again. I have no polished version of the day. You can have the ordinary one.',
    ],
  },
  eli: {
    routine: [
      'You again. I can make room for a hello without finding you a job.',
      'I’m getting used to seeing you about. The herbs still get the longer inspection.',
    ],
    habit: [
      'There you are. I know your face; I still need to ask how your day is.',
      'We keep finding a moment. I’m happy to let this one stay small.',
    ],
  },
  jo: {
    routine: [
      'I recognize you. That saves an introduction, not a measurement.',
      'Hello again. I’ll set the offcut down before I mistake it for a conversation.',
    ],
    habit: [
      'Our paths cross often. I still ask what sort of answer you want.',
      'You know where I stop to look at things. Looking is sometimes the whole job.',
    ],
  },
  neri: {
    routine: [
      'We’ve crossed paths a few times. I won’t assume that answers today’s question.',
      'I recognize you before the chart now. The chart is taking it well.',
    ],
    habit: [
      'A familiar face, a separate day. I prefer to leave the distinction visible.',
      'Hello again. I can know your greeting without knowing what you came to say.',
    ],
  },
  alder_tess: {
    routine: [
      'I’ve seen you about. A quick hello or something you wanted to ask?',
      'There you are again. I’m putting the note down so I can actually hear you.',
    ],
    habit: [
      'I know that hello by now. Tell me today’s version.',
      'We do keep crossing paths. I can remember a face without adding it to the rota.',
    ],
  },
  alder_rowan: {
    routine: [
      'Hello again. I have three possible questions. I’ll start with how you are.',
      'I’m getting used to your visits. That isn’t a reason to assign you a reading list.',
    ],
    habit: [
      'There you are. I can leave room for a familiar face and an unfamiliar thought.',
      'We keep meeting between things. I rather like a conversation that can fit on one page.',
    ],
  },
  saffron_leila: {
    routine: [
      'I know your face now. I still won’t guess what you want for lunch.',
      'Hello again. I’m finishing this bite; you can start without a speech.',
    ],
    habit: [
      'We cross paths often enough. I can enjoy the company without making a bigger batch.',
      'There you are. I’ve no grand welcome prepared. An ordinary hello will have to do.',
    ],
  },
  saffron_tomas: {
    routine: [
      'I recognize you. Let me finish this mark so I don’t lose the step.',
      'Hello again. I’ll ask rather than assume: explanation or ordinary conversation?',
    ],
    habit: [
      'We have crossed paths often. I still prefer a question with the uncertain part left in.',
      'I know the face. Today’s question gets its own check.',
    ],
  },
  saffron_ada: {
    routine: [
      'There you are again. I’m resisting the urge to give us a discussion topic.',
      'I recognize you. What has caught your attention? I’ll leave room for the answer.',
    ],
    habit: [
      'We keep meeting, and I still don’t know what you’ll notice. That leaves the conversation open.',
      'Hello again. I can let a familiar greeting lead somewhere unplanned, or nowhere much.',
    ],
  },
  glass_ren: {
    routine: [
      'I’ve seen you on my way through. Are you stopping or passing?',
      'Hello again. I can recognize a face without knowing where it is headed.',
    ],
    habit: [
      'Our paths cross quite often. I won’t decide your route for you.',
      'There you are. I can put the directions aside unless you actually want them.',
    ],
  },
  glass_sora: {
    routine: [
      'I recognize you. The drawing can stay where we can both see it.',
      'Hello again. I’ll put the pencil down. What are you looking at?',
    ],
    habit: [
      'We keep meeting. I don’t need to turn every hello into a demonstration.',
      'There you are. I can explain a line, or leave the page alone.',
    ],
  },
  glass_pavel: {
    routine: [
      'I know your face now. The book does not mind a short interruption.',
      'Hello again. I’m between sentences, which is as good a place as any.',
    ],
    habit: [
      'Our paths keep crossing. I find a familiar hello quite enough of an occasion.',
      'There you are. I can enjoy company without asking the afternoon to become more eventful.',
    ],
  },
  pelagia_mara: {
    routine: [
      'I recognize you. Give me a moment to mark where I stopped.',
      'Hello again. I can leave the note alone while you ask.',
    ],
    habit: [
      'We keep crossing paths. I know the greeting; I still check what is being asked.',
      'There you are. This can be a conversation without becoming a handover.',
    ],
  },
  pelagia_lio: {
    routine: [
      'I’m getting used to seeing you about. How is your day going?',
      'Hello again. I can leave the ingredients out of the conversation for a minute.',
    ],
    habit: [
      'There you are. A familiar face does not need a special occasion.',
      'We keep finding a small pause. I’m content to let this one stay ordinary.',
    ],
  },
  pelagia_esme: {
    routine: [
      'I recognize you. Recognition is not a reason to write anything down.',
      'Hello again. I can ask what you mean without supplying an answer for you.',
    ],
    habit: [
      'Our paths have crossed often. I still leave today’s account for you to choose.',
      'There you are. A familiar face may still have nothing it wants recorded.',
    ],
  },
  pelagia_tavi: {
    routine: [
      'I recognize you. I was about to list every possibility; one will probably do.',
      'Hello again. I can put the note down before I explain the whole seed tray.',
    ],
    habit: [
      'We keep meeting. I don’t have to produce a result every time, do I?',
      'There you are. I have observations, if you want one. Or just a hello.',
    ],
  },
  mesa_june: {
    routine: [
      'I know that face now. Give me a hello before you give me another job.',
      'There you are again. I’m practicing letting a mug be the only thing in my hands.',
    ],
    habit: [
      'We do keep finding each other between things. I can let the things wait a minute.',
      'Hello, you. I’ve managed a greeting without picking up another apron. A promising start.',
    ],
  },
  mesa_inez: {
    routine: [
      'I recognize you. What is the question this time?',
      'Hello again. I’ll leave the book closed until I know whether we need it.',
    ],
    habit: [
      'We meet often enough. I still prefer asking to guessing.',
      'There you are. Familiar company is not another item on the lending list.',
    ],
  },
  bram: {
    routine: [
      'I’ve seen you about. Passing through, or stopping here?',
      'Hello again. I know your face. Your destination remains your business.',
    ],
    habit: [
      'Our routes overlap quite often. I won’t draw a conclusion beyond that.',
      'There you are. I can leave the notebook shut if this is just a hello.',
    ],
  },
  oren: {
    routine: [
      'I recognize you. The stage remains packed; a hello requires less scenery.',
      'There you are again. I’m content to sit. No miniature engineering required.',
    ],
    habit: [
      'We keep crossing paths. I can be familiar company and still need a short visit.',
      'Hello, you. Nothing to unveil today. I’m here, and the cup is doing its modest work.',
    ],
  },
  hugo: {
    routine: [
      'I recognize you. Let me wipe the flour off this finger first.',
      'Hello again. I can listen without turning your sentence into an instruction.',
    ],
    habit: [
      'We keep finding a moment. I don’t need to make it a lesson.',
      'There you are. I know the face; I’ll wait to hear the whole question.',
    ],
  },
  priya: {
    routine: [
      'I have observed that we keep meeting. I’m making no forecast from it.',
      'Hello again. I can recognize your voice without knowing what you heard today.',
    ],
    habit: [
      'There you are. A familiar hello; the sounds around it are still worth noticing.',
      'Our paths cross often. I can leave the reasons unexamined and enjoy the pause.',
    ],
  },
  sami: {
    routine: [
      'I recognize you. No rule sheet required for saying hello.',
      'There you are again. I’m putting the piece down before it becomes my whole explanation.',
    ],
    habit: [
      'We keep meeting. I haven’t invented a score for it. Best to leave that alone.',
      'Hello, you. I can enjoy a familiar face without recruiting another play tester.',
    ],
  },
  miro: {
    routine: [
      'I recognize your entrance. No need to paint a backdrop for it.',
      'Hello again. I’m leaving the grand introduction to somebody with a larger hat.',
    ],
    habit: [
      'Our paths cross often. I can let a familiar scene have an entirely ordinary moment.',
      'There you are. I have no opening speech. Shall we spare each other the rehearsal?',
    ],
  },
  sefu: {
    routine: [
      'I recognize you. A hello is a step I’m reasonably sure of.',
      'There you are again. I can lose the count for a moment without losing the afternoon.',
    ],
    habit: [
      'We keep meeting between things. I can let the greeting be enough.',
      'Hello, you. No need to join the steps. I can stop and talk too.',
    ],
  },
  kit: {
    routine: [
      'I recognize you. This is the bit between panels, apparently.',
      'Hello again. I can tuck the slip away. Not everything needs a caption.',
    ],
    habit: [
      'We keep crossing paths. It would make a very quiet comic.',
      'There you are. Same familiar face, another ordinary moment. I don’t mean that as a complaint.',
    ],
  },
  celia_baptiste: {
    routine: [
      'I know that face now. The painting remains under my administration.',
      'There you are again. I’m allowing a conversation. Do not mistake it for a committee.',
    ],
    habit: [
      'We keep meeting. I can be pleased about that without surrendering the afternoon.',
      'Hello, you. I recognize the visitor; the blue still gets no vote.',
    ],
  },
  farah_hussain: {
    routine: [
      'I recognize you. That does not qualify you for the ending.',
      'Hello again. I can put the program down without conceding my opinion of its hero.',
    ],
    habit: [
      'Our paths keep crossing. I’m glad no elaborate explanation is required each time.',
      'There you are. I can enjoy a familiar conversation without issuing a shop announcement.',
    ],
  },
  liang_chen: {
    routine: [
      'I recognize you. I was about to suggest a chair before asking whether you wanted one.',
      'Hello again. I can turn my head for a conversation. The portrait can wait a moment.',
    ],
    habit: [
      'We keep meeting. I still have to remind myself that recognition is not an instruction.',
      'There you are. I know the face; I do not yet know the question.',
    ],
  },
  mei_chen: {
    routine: [
      'I’ve seen you about! Tell me how you are. No, I’ll let you start.',
      'Hello again. I’m leaving the chorus sheets alone while we talk.',
    ],
    habit: [
      'There you are. I know your hello by now. That doesn’t make you another choir recruit.',
      'We do keep meeting. I can enjoy that without arranging the next gathering.',
    ],
  },
  hana_mori: {
    routine: [
      'I recognize you. Stopping a moment, or on your way somewhere?',
      'Hello again. I can leave the map folded until there is an actual route question.',
    ],
    habit: [
      'Our paths overlap quite often. I don’t need to add a destination to every meeting.',
      'There you are. Familiar face, separate morning. What suits you today?',
    ],
  },
  yuna_park: {
    routine: [
      'I recognize your hello. I can answer without putting on my radio voice.',
      'There you are again. I’m leaving the headphones down. What sort of day is it?',
    ],
    habit: [
      'We keep crossing paths. I like that an ordinary greeting can stay ordinary.',
      'Hello, you. I don’t have to introduce myself this time. That leaves room to listen.',
    ],
  },
  ravi_desai: {
    routine: [
      'I recognize you. Let me resist saying I have hours before I’ve checked.',
      'Hello again. I can offer a greeting without selling you the whole evening.',
    ],
    habit: [
      'Our paths keep crossing. I don’t need to improve that into a grand plan.',
      'There you are. I’m leaving the optimistic estimate in the notebook for a moment.',
    ],
  },
  esperanza_vega: {
    routine: [
      'I know that face now. No, this is not a surprise grocery consultation.',
      'Hello again. I can keep my route out of a perfectly good conversation.',
    ],
    habit: [
      'We keep finding each other between stops. I’m trying not to turn that into another stop.',
      'There you are. A familiar face and no shopping list. I can work with that.',
    ],
  },
  asha: {
    routine: [
      'Oh, you again. I’m only showing this corner today.',
      'I remember your face. Wait, I’m deciding whether I want to show the page.',
    ],
    habit: [
      'We keep seeing each other here. I can just say hi, right?',
      'Hi again. I’ve got my notebook shut for now. Eli’s nearby.',
    ],
  },
  nico: {
    routine: [
      'It’s you! I’m keeping this leaf the other way up.',
      'Hi again. Look from there. I don’t want my leaves moved.',
    ],
    habit: [
      'You’re here again! I’m showing Tess this edge first.',
      'I know you! Wait, I’m still choosing my leaf.',
    ],
  },
  jian_wu: {
    routine: [
      'Oh, hi again. I’m deciding if I want opinions today.',
      'I recognize you. The closed pages are staying closed for now.',
    ],
    habit: [
      'We keep running into each other. We can talk about something besides the zine.',
      'Hey again. I’m keeping the drawings to myself today. Still fine to say hi.',
    ],
  },
  lin: {
    routine: [
      'It’s you! I’m making this roof stay. Don’t touch yet.',
      'Hi again. I’m telling Mara the street’s name first.',
    ],
    habit: [
      'I know you! This house is mine to move, okay?',
      'You’re here again! I’m still playing. You can look from there.',
    ],
  },
  bea: {
    routine: ['Hi!', 'Cup here.'],
    habit: ['You!', 'Hi, you!'],
  },
  lata_rao: {
      "routine": [
          "Hello again. I can stop briefly without adding a stop to the route.",
          "I recognize you. Is this a route question or an ordinary hello?"
      ],
      "habit": [
          "There you are. I’m leaving the delivery book closed for a moment.",
          "We cross paths often enough. I can ask how you are without calculating the distance."
      ]
  },
  nila_desai: {
      "routine": [
          "Oh, hello again. I’m still entitled to a different answer today.",
          "I recognize you. Let me finish this thought before I explain it."
      ],
      "habit": [
          "We keep crossing paths. I can talk about something that isn’t an edit.",
          "Hello again. I’m listening; that doesn’t mean I’ve agreed with the framing."
      ]
  },
  safia_odhiambo: {
      "routine": [
          "There you are again. I’m trying a question that actually waits for an answer.",
          "I recognize you. We can start somewhere other than my opinion."
      ],
      "habit": [
          "Hello again. I may have a good objection. I needn’t make it immediately.",
          "We keep meeting. An ordinary hello can survive without a rebuttal."
      ]
  },
  rosa_moreno: {
      "routine": [
          "It’s you again. I can turn it down; I’m not surrendering the commentary.",
          "Hello again. I’d rather hear your news than another explanation of what I should enjoy."
      ],
      "habit": [
          "There you are. I recognize the face, but I still want the answer to my question.",
          "We do keep meeting. I’m allowed a quiet greeting, even after that referee."
      ]
  },
  mateo_moreno: {
      "routine": [
          "Hello again. I’m not working on a roof at this particular moment.",
          "I recognize you. A thought about a story can wait until someone wants to hear it."
      ],
      "habit": [
          "There you are. I can have an ordinary afternoon without making it useful research.",
          "We keep meeting between things. I like having time for a sentence that goes nowhere."
      ]
  },
  nell_harper: {
      "routine": [
          "Oh, you again. I can say hello without turning it into an invitation.",
          "I recognize you. Which question did I almost skip just now?"
      ],
      "habit": [
          "There you are. I’m trying to finish this conversation before starting the next idea.",
          "We keep crossing paths. That’s an observation, not a travel plan."
      ]
  },
  ruth_harper: {
      "routine": [
          "Hello again. I recognize you without needing a film of the occasion.",
          "There you are. I can ask about today before telling you about three other years."
      ],
      "habit": [
          "We keep meeting. I’m trying not to give that a dramatic title.",
          "Hello again. I have a question, and this one isn’t an introduction to my anecdote."
      ]
  },
  jonah_bell: {
      "routine": [
          "Hello again. I can recognize you without trying the opening line again.",
          "There you are. I’m listening before looking for the funny part."
      ],
      "habit": [
          "We keep crossing paths. That doesn’t make you my permanent audience.",
          "Hello again. I can leave a perfectly ordinary pause alone."
      ]
  },
  lucien_morel: {
      "routine": [
          "Hello again. I recognize you; I haven’t decided whether to object yet.",
          "There you are. I can listen to the end before remembering a better example."
      ],
      "habit": [
          "Our paths cross often. I’m not keeping score, whatever the expression suggests.",
          "Hello again. I can admit I don’t know how that story ended."
      ]
  },
  qiao_chen: {
      "routine": [
          "Hello again. I can recognize a face without remembering anybody’s laundry.",
          "There you are. Is this business, or can I leave the price list alone?"
      ],
      "habit": [
          "We keep meeting. I’m trying not to turn every pause into a collection window.",
          "Hello again. I can talk without offering a rush service."
      ]
  },
  akira_mori: {
      "routine": [
          "There you are again. I can start with hello instead of the whole account.",
          "I recognize you. Give me a moment to put the digression down."
      ],
      "habit": [
          "We keep meeting. I’m learning that a short greeting doesn’t need a supporting speech.",
          "Hello again. I have something to say, but you may have something too."
      ]
  },
  ines_valdes: {
      "routine": [
          "Hello again. I can greet you without introducing a film.",
          "There you are. I’m asking, not announcing what you ought to enjoy."
      ],
      "habit": [
          "We keep meeting. I needn’t make every conversation an opening speech.",
          "Hello again. I can leave a little mystery in my account."
      ]
  },
  vera_valdes: {
      "routine": [
          "Oh, hi again. I’m still choosing whether to play.",
          "I remember you. That doesn’t mean I have to ask for a rematch."
      ],
      "habit": [
          "You again! I can say hi without explaining the whole rule sheet.",
          "Hi. I’m keeping my game shut for now. We can talk about something else."
      ]
  },
  rafael_valdes: {
      "routine": [
          "Hello again. I can stop briefly without calling it no time at all.",
          "I recognize you. Let me answer before I reach for the reassuring version."
      ],
      "habit": [
          "There you are. I’m trying to give the time I actually have.",
          "We keep crossing paths. I can be pleased to see you and still leave on time."
      ]
  },

};
