/** Brief, optional exchanges only. Availability, adult status and physical venue
 * are validated by the engine before one of these can become a receipt. */
export type IncidentPersonLine={speech:string;activity:string;emotion:'attentive'|'warm';gesture:'listen'|'offer'|'pause'|'point'|'wave'};
type Pair=readonly [string,string];
type PlaceMoment={speech:Pair;activity:Pair};
export const incidentalPeople:Readonly<Record<string,Record<string,PlaceMoment>>>={
 alder_tess:{
  'CORNER CAFÉ':{speech:['That window gives you something to look at while the cup cools.','A quiet table for once. I might admire it from here.'],activity:['Tess straightens a saucer at the counter and glances toward the window.','Tess folds the counter cloth, leaving your table undisturbed.']},
  TRANSIT:{speech:['A good bench is half the journey. The timetable gets the credit.','You can watch the river without making a plan for it.'],activity:['Tess checks a posted timetable, then tips her pencil toward the bench.','Tess lowers her timetable and looks briefly across the water.']}
 },
 alder_rowan:{
  LIBRARY:{speech:['The bookmark is an underrated invention. Permission to stop, included.','I was looking for one book and found three. A very ordinary hazard.'],activity:['Rowan tucks a plain bookmark into a return without disturbing the loose pages.','Rowan balances three returns on the trolley, then chooses one to shelve.']},
  GARDEN:{speech:['Some of these labels are mostly optimism. We do put the date on it.','A seed packet can contain a remarkable number of plans.'],activity:['Rowan turns a dated seed packet over in their hand.','Rowan sets the seed packets beside the empty trays.']},
  COMMUNITY:{speech:['That chair can stay empty until somebody actually needs it.','One table is enough for a beginning. The other plans can wait.'],activity:['Rowan shifts a chair clear of the walkway, then steps back.','Rowan straightens a folded sign on the table.']}
 },
 saffron_leila:{
  MARKET:{speech:['Smell the lemon before the griddle takes all the attention.','Lunch does not need a new idea every day. Some days it needs eating.'],activity:['Leila lifts the edge of a prepared fold, then secures its paper band.','Leila sets down the griddle spatula for a brief pause.']},
  'CORNER CAFÉ':{speech:['A cup you can sit down with is different from a cup beside the griddle.','I am letting that cool. For once, the next thing can wait.'],activity:['Leila turns her cup by its handle and leaves it on the table.','Leila rests her hands beside the cup rather than reaching for it.']}
 },
 saffron_tomas:{
  MAKERSPACE:{speech:['That pencil is almost entirely sharpening now. Still works.','A clear diagram saves a surprising number of words.'],activity:['Tomas sets a short pencil beside a repair drawing.','Tomas rotates a small drawing so its labels are upright.']},
  TRANSIT:{speech:['The sign is clearer from here. Someone finally moved it.','One useful arrow. I appreciate a modest ambition.'],activity:['Tomas checks the direction sign before folding his route note.','Tomas follows an arrow on the sign with one finger, then lowers his hand.']}
 },
 saffron_ada:{
  CINEMA:{speech:['I always notice a different corner of the frame. It makes repeats dangerous.','There is a whole conversation in that pause. I can leave it there.'],activity:['Ada folds a screening leaflet and leaves a moment of quiet.','Ada rests the leaflet on her knee rather than opening the discussion herself.']},
  COMMUNITY:{speech:['One question at a time. I am practicing.','It is all right if the best thing about the room is a quiet chair.'],activity:['Ada places a question card face down on the table.','Ada pulls a chair out of the walkway and leaves it unclaimed.']}
 },
 glass_ren:{
  TRANSIT:{speech:['The bench is just beyond the sign. It is a better landmark than the sign.','That path has a seat at the turn, if a pause suits you.'],activity:['Ren indicates the near bench, keeping the direction small and specific.','Ren traces a short section of the station plan with a finger.']},
  'CORNER CAFÉ':{speech:['I can see the steps from this table. Today I am only looking at them.','A seat without a departure time attached. A useful discovery.'],activity:['Ren sets their folded route note beside the cup.','Ren lets the route note stay closed for a moment.']}
 },
 glass_sora:{
  MAKERSPACE:{speech:['That edge is the difference. Small enough to miss, large enough to matter.','I like a diagram you can put a finger on.'],activity:['Sora points to one edge of a small repair sketch, then waits.','Sora sets the pencil down beside a clearly labeled part.']},
  WORK:{speech:['That is the finished pile. It can stay finished for a moment.','A clear handover is a pleasant thing. Very little to guess.'],activity:['Sora squares the completed notes and leaves them on the desk.','Sora clips the handover pages together and steps back.']}
 },
 glass_pavel:{
  LIBRARY:{speech:['A book can wait for you. One of its better qualities.','That chair has never asked anyone to improve themselves.'],activity:['Pavel returns a book to its shelf without hurrying the pause.','Pavel smooths the back of a reading chair and lets it stand.']},
  GARDEN:{speech:['The plants have declined to hurry. I am learning from them.','You can look for a while. There is no examination afterward.'],activity:['Pavel rests a hand on the empty watering can.','Pavel looks along the bed, then leaves the silence open.']}
 },
 pelagia_mara:{
  MAKERSPACE:{speech:['The date belongs beside the note. Saves the next person asking.','Checked, then put away. A perfectly good ending.'],activity:['Mara adds a date to a handover note and puts down the pen.','Mara closes the tool case after checking its latch.']},
  WORK:{speech:['One clear note can make a quiet handover.','Finished means the next person can find what they need.'],activity:['Mara places the checked handover on the desk.','Mara turns the completed note toward the next work station.']},
  TRANSIT:{speech:['The public path is this one. The work gate can stay a work gate.','That sign is for the walkway. It is easy to read past it.'],activity:['Mara points along the signed public route without opening the work gate.','Mara indicates the walkway sign, then lets her hand fall.']}
 },
 pelagia_lio:{
  MARKET:{speech:['Ginger first. The rest of the story can wait until after breakfast.','The board is short today. It still describes a meal.'],activity:['Lio taps the ingredient chalkboard with the clean end of the chalk.','Lio puts the chalk back beside the small menu board.']},
  'CORNER CAFÉ':{speech:['A little ginger stays with you after the bowl is empty.','The first quiet sip is worth keeping quiet.'],activity:['Lio sets a clean bowl beside the counter and pauses.','Lio lowers his cup, leaving the short exchange there.']}
 },
 pelagia_esme:{
  LIBRARY:{speech:['An empty margin is allowed to remain empty.','This list is only a list. The photograph gets the dramatic lighting.'],activity:['Esme places a blank slip beside an archive folder.','Esme straightens a labeled folder and gives the display a brief look.']},
  COMMUNITY:{speech:['A small gathering need not produce a record.','There is no form for this pause. I thought you should know.'],activity:['Esme closes the folder before looking around the room.','Esme puts her pen away and leaves her hands on the closed folder.']}
 },
 pelagia_tavi:{
  GARDEN:{speech:['One leaf is larger. That is an observation, not a victory yet.','I have three theories. We could just look at the first leaf.'],activity:['Tavi compares two dated labels without moving either tray.','Tavi points to one leaf, then stops before beginning a longer explanation.']},
  'THE PARK':{speech:['I nearly made that a growing question. It can just be a nice leaf.','Some things can stay observations until tomorrow.'],activity:['Tavi lowers a notebook and looks around without writing.','Tavi closes the notebook with a finger keeping the page.']}
 },
 mesa_june:{
  'CORNER CAFÉ':{speech:['There is my tea. I have successfully found it before it became history.','A whole pause with no fourth apron. Look at me learning.'],activity:['June takes her own cup from the counter and leaves the cloth folded.','June sets the spatula down before turning toward her cup.']},
  MAKERSPACE:{speech:['That tool is back where it belongs. We could celebrate by leaving it there.','A finished repair. I will resist giving it a companion.'],activity:['June settles a spanner into its place on the bench.','June puts the checked tool down and wipes her hands.']},
  TRANSIT:{speech:['A pause between announcements. I am trying not to announce it.','The microphone gets its own little rest.'],activity:['June steps back from the station microphone.','June lowers the announcement sheet and lets the microphone stand.']}
 },
 mesa_inez:{
  LIBRARY:{speech:['A bookmark is cheaper than remembering the whole page.','The book is not due back this minute. You can stop checking it.'],activity:['Inez slides a plain bookmark beside a returned book.','Inez closes the returns ledger after checking a date.']},
  GARDEN:{speech:['That label is plain enough to understand tomorrow. A good start.','A small bed is still a bed. It does not need a committee to become one.'],activity:['Inez presses a dated label firmly into the edge of a bed.','Inez rests the hand fork beside a small tray.']},
  COMMUNITY:{speech:['We have enough chairs. That is a useful kind of enough.','One clear sign. The wall will survive the empty space.'],activity:['Inez counts the arranged chairs, then puts down her pencil.','Inez straightens the single notice and steps away.']}
 }
};
