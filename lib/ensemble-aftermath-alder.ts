import type { EnsembleAftermathDefinition, EnsembleAftermathOption } from './ensemble-aftermath-types.ts';

const activities: Record<string, string> = {
  "public_caption": "pointing to the drum in the photograph",
  "private_caption": "turning the drum photograph face up again",
  "no_caption": "turning the photograph away from Jonah",
  "read_literal": "discovering that her explanation has outgrown the sentence",
  "keep_private": "stopping herself from supplying Jonah with a better joke",
  "own_joke": "counting the labels in your version",
  "quiet_guest": "drawing a smaller drum beside the collection time",
  "ordinary_guest": "leaving space below your one-line instruction",
  "quiet_collection": "staring at the large word QUIET",
  "counter_collection": "tapping his dependable counter with a pencil",
  "no_instruction": "ruling off the unused line in the list",
  "correct_review": "adding SERVICE in suspiciously small letters",
  "plain_review": "testing the rhythm of your sentence",
  "no_review": "turning the unfortunate bread card sideways",
  "fresh_plate": "arranging the noisy crusts on your new plate",
  "close_review": "covering a note about anticipated applause",
  "name_plate": "making the closing time as prominent as the bread",
  "name_boundary": "showing you the bottom of a small cup",
  "walk_only": "putting down an invitation she will not have to host",
  "leave_with_cups": "lifting your empty cup like a trophy",
  "take_route": "calling directions over an extended goodbye",
  "own_apology": "catching herself halfway into a long explanation",
  "accurate_invite": "studying a message that praises her closing time",
  "no_cafe_invite": "wondering aloud about another venue’s cups",
  "bounded_listening": "moving one chair closer and beginning to play",
  "private_listening": "watching Eli put his pencil down",
  "decline_listening": "pulling a spare chair back from the circle",
  "one_line": "resting a hand on the empty chair",
  "keep_decline": "describing an imaginary critic with a little too much detail",
  "ask_permission": "pretending not to care which line you remember",
  "credit": "reading the order of names a second time",
  "keep_circle": "closing the music with one hand on its final page"
};

const reply = (speakerId: string, id: string, label: string, outcome: string, publicText: string, speech: string, extra: Partial<EnsembleAftermathOption> = {}): EnsembleAftermathOption => ({
  id, label, outcome, narration: { personal: outcome, public: publicText, npc: publicText },
  response: { speakerId, speech, activity: activities[id], emotion: ['one_line', 'ask_permission', 'keep_circle', 'own_apology'].includes(id) ? 'warm' : ['public_caption', 'quiet_guest', 'correct_review', 'counter_collection', 'accurate_invite', 'credit'].includes(id) ? 'proud' : 'attentive', gesture: ['public_caption', 'quiet_guest', 'counter_collection', 'name_boundary', 'take_route'].includes(id) ? 'point' : 'pause' },
  signals: [], time: 1, ...extra,
});
const nell = (id: string, label: string, outcome: string, publicText: string, speech: string, extra: Partial<EnsembleAftermathOption> = {}) => reply('nell_harper', id, label, outcome, publicText, speech, { ...extra, signals: [`after_bracken_${id}`] });
const hugo = (id: string, label: string, outcome: string, publicText: string, speech: string, extra: Partial<EnsembleAftermathOption> = {}) => reply('hugo', id, label, outcome, publicText, speech, { ...extra, signals: [`after_late_loaf_${id}`] });
const tess = (id: string, label: string, outcome: string, publicText: string, speech: string, extra: Partial<EnsembleAftermathOption> = {}) => reply('alder_tess', id, label, outcome, publicText, speech, { ...extra, signals: [`after_last_crossing_${id}`] });
const mina = (id: string, label: string, outcome: string, publicText: string, speech: string, extra: Partial<EnsembleAftermathOption> = {}) => reply('mina', id, label, outcome, publicText, speech, { ...extra, signals: [`after_pantry_song_${id}`] });

export const ensembleAftermathAlder = [
  {
    storyId: 'bracken', sourceStoryId: 'pantry_song',
    sourceSignals: ['potluck_count', 'potluck_booking', 'small_potluck', 'private_rehearsal', 'song_offer', 'rehearsal_later'],
    stages: [
      { id: 'caption', title: 'The drum looks furnished', prompt: 'Mina’s latest listening arrangement reaches Nell during her next Alder visit. Nell brings a photograph of the transparent Bracken drum, with three scraps beneath it: INSTRUMENT, NOT ROOM, and STILL AN INSTRUMENT. Someone has admired the duvet inside it and asked whether the place gets much light. Nell wants the photograph to make her look like a musician. Jonah has suggested adding a floor plan.', choices: [
        nell('public_caption', 'Call it a drum before anyone asks about the rent', 'You help Nell put a plain instrument description in the programme. She crosses out one admiring reference to the bedding. The photograph suddenly looks less like a tiny, impractical flat, which disappoints Jonah.', '{{actor}} and Nell agree a programme note that describes the instrument without offering accommodation.', 'It is a bass drum. The interesting feature is what happens when I hit it.', { sourceSignalsAny: ['song_offer', 'after_pantry_song_credit'] }),
        nell('private_caption', 'Save Nell’s explanation for the listening circle', 'You keep your reply with the private listeners. Nell turns the photograph over rather than circulate it. Then she turns it back to check that you did notice the drum. She would like less attention of exactly the wrong sort.', '{{actor}} accepts the private listening boundary; Nell’s photograph is not released as a public invitation.', 'Nobody notices how good the drum looks. Everybody notices the duvet.', { sourceSignalsNone: ['song_offer', 'after_pantry_song_credit'] }),
        nell('no_caption', 'Let Nell fight the photograph herself', 'You leave your name out of the music plans. Nell studies you, then the photograph, as though one of you ought to require a longer explanation. Jonah begins offering a caption. She turns it face down.', '{{actor}} declines a role in the next music plan. No equipment, room or person is offered.', 'No, Jonah. “Compact accommodation” is not helping.', { time: 0 }),
      ] },
      { id: 'joke', title: 'The ensuite drummer', prompt: 'Jonah has discovered that “ensuite drummer” gets a laugh even when nobody understands the story. Nell has started explaining it first, which gives him time to prepare a second laugh. She asks what you intend to say. She clearly hopes it will be shorter than Jonah’s version and longer than his punchline.', choices: [
        nell('read_literal', 'Read the instrument note and starve the punchline', 'You stick to the agreed sentence about the drum. Jonah waits for his opening. Nell finishes before he gets it, then ruins her own victory by explaining why the sentence was so short.', '{{actor}} uses the agreed literal programme note and leaves the lodging joke out.', 'There. Perfectly straightforward. Let me tell you what we left out.', { afterChoices: ['public_caption'] }),
        nell('keep_private', 'Give Jonah no story to announce', 'You keep the listening conversation offstage. Nell is relieved, though she looks offended when Jonah says the joke works without any facts at all. She starts to correct him and hears the trap just in time.', '{{actor}} keeps the private listening conversation offstage.', 'He has made ignorance part of the act. Very convenient.', { afterChoices: ['private_caption', 'no_caption'] }),
        nell('own_joke', 'Make yourself the person who needed three labels', 'You tell the version in which you needed three labels to understand one photograph. Nell lets you mention the drum and laughs before remembering she wrote the labels. Jonah asks whether your version needs a drummer.', '{{actor}} tells a self-directed joke with Nell’s permission; other people’s lodging details are omitted.', 'Three labels is still fewer than three separate misunderstandings.'),
      ] },
      { id: 'morning', title: 'The doorbell solo', prompt: 'Nell arrives for her next Alder visit with a handwritten sign: PLEASE DO NOT KNOCK. Below it she has added EXCEPT AT THE AGREED TIME, then WHAT COUNTS AS KNOCKING? Hugo needs your collection instruction. Jonah says the sign has more movements than the rehearsal.', choices: [
        nell('quiet_guest', 'Put your name under “no early knock”', 'Your later, quiet collection goes on the list. Nell draws a drum beside it, decides that looks too loud, and draws a smaller drum. Jonah points out that the smaller drum still has sticks.', '{{actor}} asks for their own later, quiet collection. Other residents’ access and Jonah’s room are unchanged.', 'There. A quiet drum. I do not see the difficulty.'),
        nell('ordinary_guest', 'Give Hugo the time and leave Nell’s sign alone', 'You keep the ordinary collection. Nell looks wounded that a name and a time have done the work of three notices. She leaves a little space underneath in case you discover a complication.', '{{actor}} keeps an ordinary personal collection, without speaking for other guests.', 'Of course yours fits on one line. You have not considered the exceptions.', { time: 0 }),
      ] },
    ],
  },
  {
    storyId: 'late_loaf', sourceStoryId: 'bracken',
    sourceSignals: ['room_clear', 'drum_storage', 'drum_rehearsal', 'drum_travel', 'honest_departure', 'duvet_reveal', 'quiet_room', 'comedy_opening'],
    stages: [
      { id: 'label', title: 'Quiet Loaf', prompt: 'The Bracken arrangements have reached Hugo in three versions, one of them sung. He wants an instruction for your next collection, if you buy anything. He does not want a slogan. The pencil is already poised above a very large capital Q.', choices: [
        hugo('quiet_collection', 'Ask for a quiet handover next time you buy bread', 'You give Hugo a quiet instruction for a future purchase. He writes QUIET in large letters, then stares at it. It has the unfortunate appearance of a very good product name.', '{{actor}} and Hugo agree a quiet handover only if that person later buys a separate portion. Jonah’s portion stays his.', 'Quiet is an instruction. People will pay attention to absolutely the wrong thing.', { sourceSignalsAny: ['quiet_room', 'room_clear', 'after_bracken_quiet_guest', 'after_bracken_private_caption', 'after_bracken_keep_private'] }),
        hugo('counter_collection', 'Use the counter next time you buy bread', 'You choose the counter for a future purchase. Hugo taps it with the pencil as if demonstrating a remarkable invention. After all the talk of spare rooms and travelling drums, he is proud of something that stays put.', '{{actor}} chooses counter collection for any future personal purchase; no order, room access or extra stock is promised.', 'Here. This counter. I have never once had to explain where it sleeps.', { sourceSignalsNone: ['quiet_room', 'room_clear', 'after_bracken_quiet_guest', 'after_bracken_private_caption', 'after_bracken_keep_private'] }),
        hugo('no_instruction', 'Leave yourself off Hugo’s new list', 'You decline a new collection arrangement. Hugo leaves your existing orders alone and draws a line through the unused space. The empty line looks, to him, like the most sensible customer of the morning.', '{{actor}} declines a new collection arrangement. Existing paid portions keep their original terms.', 'Nothing new. I can be exceptionally reliable about that.', { time: 0 }),
      ] },
      { id: 'testimonial', title: 'Exceptionally quiet', prompt: 'A customer has copied QUIET from Hugo’s collection list onto a card beside the bread. A customer wants to know whether Quiet Loaf is good for sleeping. Hugo despises this name. He has also moved the card where everyone can see it.', choices: [
        hugo('correct_review', 'Point out that “quiet” meant the handover', 'You correct your note. Hugo writes SERVICE beneath QUIET in much smaller letters. He refuses to make the main word smaller: people are already reading it.', '{{actor}} clarifies that their quiet collection note described service, not a special product.', 'Nobody ever asks what an ordinary loaf does.', { afterChoices: ['quiet_collection'] }),
        hugo('plain_review', 'Describe the counter: still there, bread on it', 'You give the bare account of your counter arrangement. Hugo repeats it twice, testing whether it sounds better with a pause. He keeps the pencil just far enough from the card to deny what he is doing.', '{{actor}} supplies a factual account of their own counter arrangement, without endorsing other customers’ experiences.', '“Still there.” Dependable. No, I am not using it.', { afterChoices: ['counter_collection', 'no_instruction'] }),
        hugo('no_review', 'Keep your name off this bread phenomenon', 'You decline the testimonial. Hugo turns the card over rather than inventing a customer. The back says SUNRISE RESERVE. He turns it sideways, which does not improve matters.', '{{actor}} does not authorize a bread testimonial.', 'That was a different misunderstanding.', { time: 0 }),
      ] },
      { id: 'tasting', title: 'An extremely audible crust', prompt: 'Tess has asked what the café may call a fresh tasting plate. Hugo has written RIOTOUS CRUST, then covered it with his hand. A new plate for your table costs $24. The previous loaves are long past the stage where their owners would welcome a tasting committee.', choices: [
        hugo('fresh_plate', 'Buy the fresh tasting plate for $24', 'You pay $24 for a new plate for your café table. Hugo writes your name on it. A crust cracks as he arranges it, loudly enough to turn a head at the counter. He looks almost pleased, then remembers the quiet claim.', '{{actor}} purchases a new, separate tasting plate for their own café table. No earlier private loaf becomes café stock.', 'That is freshness you can hear. Please do not put that on the card.', { cost: 24 }),
        hugo('close_review', 'Leave Hugo with the review, without buying a plate', 'You finish without ordering a tasting plate. Hugo crosses out “anticipated applause” on a scrap beside the till. He says it was a note about the oven. You both look at the perfectly quiet oven.', '{{actor}} closes their review without placing a tasting order.', 'An oven can be appreciated. There is nothing strange about that.', { time: 0 }),
      ] },
    ],
  },
  {
    storyId: 'last_crossing', sourceStoryId: 'late_loaf',
    sourceSignals: ['loaf_balanced', 'loaf_extra', 'baker_free', 'bread_pickup', 'baker_demo', 'cafe_bread_order'],
    stages: [
      { id: 'phrase', title: 'A bottomless cup with a bottom', prompt: 'News from Hugo’s counter has reached Tess. Someone has described her café as a place where the evening can go on forever. Tess is holding the smallest cup in the building and looking at the clock. She asks what your invitation will say.', choices: [
        tess('name_plate', 'Name the plate’s purchaser, then the closing time', 'You help Tess identify the fresh plate and keep it inside the normal evening service. She sets the closing time beside the food description in equally large writing. She is tired of time being the part people develop bad eyesight for.', '{{actor}} keeps a freshly purchased tasting plate within ordinary café service, without extending the shift.', 'Everyone can read “fresh bread” from the door. Amazing what happens to their eyes by the next line.', { sourceSignalsAny: ['after_late_loaf_fresh_plate', 'cafe_bread_order'] }),
        tess('name_boundary', 'Invite people for an evening, not an eternity', 'You write your invitation without promising bread or a later closing. Tess removes “endless” from the tea description and shows you the bottom of a cup. She has clearly wanted to do this for some time.', '{{actor}} writes a café invitation that promises neither unbought bread nor extended service.', 'Look. An end. We put one in every cup.', { sourceSignalsNone: ['after_late_loaf_fresh_plate', 'cafe_bread_order'] }),
        tess('walk_only', 'Choose the walk and spare Tess an invitation', 'You choose the verified public route instead of a café gathering. Tess brightens. She can wish you a lovely evening without being responsible for the lovely part.', '{{actor}} chooses a walk rather than booking café service.', 'Bram knows the route. Let him enjoy being right about something.', { time: 0 }),
      ] },
      { id: 'guest', title: 'The shortest apology', prompt: 'Tess has begun stacking cups. A guest says “no rush” while settling deeper into a chair. Tess looks directly at you, the person whose plan made this evening sound so relaxed.', choices: [
        tess('leave_with_cups', 'Be first out, before “no rush” becomes a speech', 'You finish your visit at closing. Tess lifts your empty cup like a small trophy while the guest hunts for a coat. On the way out, you hear someone begin one last thing.', '{{actor}} ends their café visit at the agreed closing time.', 'A person who can leave. We used to get more of those.', { afterChoices: ['name_plate', 'name_boundary'] }),
        tess('take_route', 'Take your walk while everyone argues about leaving', 'You follow your public walking route independently of Tess’s shift. From the doorway she calls the directions over the guest’s third goodbye. The walk is already quieter than the departure.', '{{actor}} follows their independent walking plan without needing café staff to stay.', 'Left at the corner. You can explain why tomorrow.', { afterChoices: ['walk_only'] }),
        tess('own_apology', 'Say “My mistake” and stop talking', 'You withdraw your extra-minute request in two words. Tess says it is the best apology she has heard all month, then starts telling you about the worst one. She catches herself with a cup still in her hand.', '{{actor}} withdraws their own extra-minute request; no extension is booked.', 'Go. Before I spoil your record.', { time: 0 }),
      ] },
      { id: 'credit', title: 'Closing remarks', prompt: 'Mina’s next listening invitation needs a place, and someone has suggested Tess’s “generous late café.” Tess reads the phrase twice. She likes “generous.” She would like to find whoever added “late.” You can pass on the closing time or leave the café out.', choices: [
        tess('accurate_invite', 'Send Mina Tess’s closing time in large letters', 'You pass Mina the real café time. Tess studies the message, pleased to have her closing treated as an achievement. She asks whether the word “promptly” would sound too self-important.', '{{actor}} passes Mina an accurate café boundary, with no late-service promise.', 'I do close rather well. People rarely mention that.'),
        tess('no_cafe_invite', 'Leave the café out of Mina’s next invitation', 'You tell Mina not to use the café for your next listening invitation. Tess looks relieved, then a little jealous of wherever gets chosen instead. She asks you to report whether their cups are any good.', '{{actor}} declines café use for their next listening invitation. No booking or food order is implied.', 'I hope you have a lovely time. Not a better time. Just lovely.', { time: 0 }),
      ] },
    ],
  },
  {
    storyId: 'pantry_song', sourceStoryId: 'last_crossing',
    sourceSignals: ['clear_timetable', 'tea_extension', 'later_route', 'connection_clear', 'cafe_slot'],
    stages: [
      { id: 'invitation', title: 'Twelve chairs and a song', prompt: 'Tess’s latest evening has reached Mina, who has arranged twelve empty chairs before admitting how many people she invited. She says the space improves the sound. Eli says it makes the room look as though someone important has failed to arrive. Mina asks whether you are staying to listen.', choices: [
        mina('bounded_listening', 'Stay for one listening visit that ends on time', 'You accept the listening visit within Tess’s café hours. Mina pulls one chair closer and leaves the other eleven where they are. Eli starts counting them again. Mina begins before he can reach twelve.', '{{actor}} accepts one bounded listening visit; no extra diners or café hours are promised.', 'You are here for a song, Eli. It is not musical chairs.', { sourceSignalsAny: ['connection_clear', 'clear_timetable', 'after_last_crossing_accurate_invite', 'after_last_crossing_leave_with_cups'] }),
        mina('private_listening', 'Hear the unfinished song quietly at the hall', 'You accept a private listening visit at the hall. Mina brings the unfinished ending, then spends longer apologizing for it than it takes to play. Eli reaches for a pencil. She watches his hand until he puts it down.', '{{actor}} accepts a private hall listening visit without café service or a public performance.', 'It is unfinished. That is not an invitation for everybody to finish it.', { sourceSignalsNone: ['connection_clear', 'clear_timetable', 'after_last_crossing_accurate_invite', 'after_last_crossing_leave_with_cups'] }),
        mina('decline_listening', 'Pass on listening this time', 'You decline. Mina removes your name from the list, then pulls one chair back as though that was how she wanted the room all along. She keeps all twelve chairs in the lyric.', '{{actor}} declines the listening invitation. The lyric is not treated as a guest list.', 'The furniture in the song has been much easier to arrange.', { time: 0 }),
      ] },
      { id: 'line', title: 'The spare chair', prompt: 'Mina is stuck on the line about the twelfth chair. She says it is only furniture, then smooths the seat beside her before anyone can sit down. Eli has a pencil ready in case the song turns into a seating plan. Mina wants an answer about the line.', choices: [
        mina('one_line', 'Ask why the twelfth chair is empty', 'You answer the lyric question instead of fixing the seating. Mina says a room can miss somebody even when every chair is occupied. Eli lowers the pencil. For a moment nobody tries to make the line more useful.', '{{actor}} responds to Mina’s invited lyric question without proposing a guest list or extra service.', 'I do know how to count. That is rather the trouble.', { afterChoices: ['bounded_listening', 'private_listening'] }),
        mina('keep_decline', 'Leave the song to Mina, even though you have an idea', 'You resist sending a clever suggestion to the rehearsal you declined. Mina hears no invisible critique from the back row. When she sees you, she admits she has been arguing with an imaginary listener anyway.', '{{actor}} keeps their declined invitation separate from the rehearsal and guest count.', 'He wants a happier ending. He can write his own song.', { afterChoices: ['decline_listening'], time: 0 }),
        mina('ask_permission', 'Ask to quote the line that stayed with you', 'You ask Mina if you can repeat that one line with her name. She agrees, pretends to be casual, then makes you say which line. She is pleased it survived outside the tune and irritated that you picked the troublesome one.', '{{actor}} obtains permission to quote one literal line with Mina’s name; recording and performance rights are not granted.', 'That line? Of course that line. The others only took a few hours.'),
      ] },
      { id: 'credit', title: 'Our song, apparently', prompt: 'A listener calls the song “our project.” Mina smiles with only half her face. Nell is assembling a programme and wants to know what she can use. Eli suggests listing the chairs. Mina says the chairs have contributed about as much as some people.', choices: [
        mina('credit', 'Put Mina’s name on the song and your own part below it', 'You name Mina as the songwriter and describe your own contribution for Nell’s programme. Mina reads the order twice. Eli asks whether setting out chairs deserves a mention. She says it deserves sitting down.', '{{actor}} credits Mina as the songwriter and passes Nell a bounded programme note. No performance, instrument or lodging is booked.', 'My song. Your part. Eli’s chairs. At last, a workable arrangement.'),
        mina('keep_circle', 'Keep the listening story among the people who were there', 'You keep your account out of the programme. Nell hears there is no public contribution from you. Mina closes the music with a hand still on the last page, glad the evening can remain a little smaller than the song.', '{{actor}} keeps the listening account out of publicity. Nell receives no public programme contribution.', 'Some things sound better before everybody has an opinion.', { time: 0 }),
      ] },
    ],
  },
] satisfies EnsembleAftermathDefinition[];
