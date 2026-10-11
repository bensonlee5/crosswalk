/** Short embodied responses. Called only after an accepted action, never from a render/poll.
 * Count is the authoritative committed count, not clicks or an inferred relationship score. */
export type ActionReactionContext={actionId:string;title?:string;kind?:string;placeName?:string;count?:number;lastVariant?:number;actorId?:string};
export const activityReactionLines:Readonly<Record<string,readonly string[]>> = {
  "move": [
    "You turn the key and look around your own space.",
    "You set your things down and try the window latch.",
    "You leave your shoes by the door and take stock."
  ],
  "home_reset": [
    "You smooth the knitted throw and put the record back in its sleeve.",
    "You brush the last dust from a monstera leaf.",
    "You straighten the throw, then leave the room alone."
  ],
  "home_meal": [
    "You taste a spoonful of lentils before sitting down.",
    "You cut into a roasted carrot and let the fork rest.",
    "You scrape the last lentils from the pan onto your plate."
  ],
  "home_host": [
    "You pull another chair up to the table.",
    "You make space for the last plate on the table.",
    "You gather the cups after everyone has finished."
  ],
  "work": [
    "You finish the last task and put your work things away.",
    "You check what is finished before ending the shift.",
    "You loosen your shoulders as you step away from the work."
  ],
  "work_short": [
    "You finish the last task and put your work things away.",
    "You check what is finished before ending the shift.",
    "You loosen your shoulders as you step away from the work."
  ],
  "work_overtime": [
    "You finish the last task and put your work things away.",
    "You check what is finished before ending the shift.",
    "You loosen your shoulders as you step away from the work."
  ],
  "career_contract": [
    "You finish the last task and put your work things away.",
    "You check what is finished before ending the shift.",
    "You loosen your shoulders as you step away from the work."
  ],
  "work_mentor": [
    "You underline the part you want to try again.",
    "You close your notes with a finger marking the useful page.",
    "You put the example beside your own attempt and compare them."
  ],
  "study": [
    "You underline the part you want to try again.",
    "You close your notes with a finger marking the useful page.",
    "You put the example beside your own attempt and compare them."
  ],
  "campus_bootcamp": [
    "You underline the part you want to try again.",
    "You close your notes with a finger marking the useful page.",
    "You put the example beside your own attempt and compare them."
  ],
  "campus_group": [
    "You underline the part you want to try again.",
    "You close your notes with a finger marking the useful page.",
    "You put the example beside your own attempt and compare them."
  ],
  "community_skill": [
    "You underline the part you want to try again.",
    "You close your notes with a finger marking the useful page.",
    "You put the example beside your own attempt and compare them."
  ],
  "campus_tutor": [
    "You leave a little space beside the worked example.",
    "You pause over the explanation and try a clearer phrase.",
    "You put the notes in order after the session."
  ],
  "apply": [
    "You read the new role carefully before putting the paperwork away.",
    "You pause on the job title, then check the practical details.",
    "You fold the paperwork along its crease and take it with you."
  ],
  "career_network": [
    "You repeat a name quietly to help it stick.",
    "You tuck away the contact details before leaving.",
    "You pause by the door to put the new names in order."
  ],
  "career_portfolio": [
    "You move the strongest example to the front.",
    "You compare the finished piece with your early sketch.",
    "You give the project one last look before closing it."
  ],
  "friends": [
    "You take a small sip and turn the cup by its handle.",
    "You set the cup down, then reach for another sip.",
    "You pause with the cup in both hands before drinking."
  ],
  "cafe_break": [
    "You take a small sip and turn the cup by its handle.",
    "You set the cup down, then reach for another sip.",
    "You pause with the cup in both hands before drinking."
  ],
  "cafe_openmic": [
    "You step away from the microphone and let your hands settle.",
    "You fold your notes after the last line.",
    "You glance back at the microphone before returning to your seat."
  ],
  "cafe_barista": [
    "You wipe the espresso-bar counter after the last cup.",
    "You settle a cup on its saucer and clear the work surface.",
    "You hang the cloth back beside the espresso bar."
  ],
  "volunteer": [
    "You turn the bean tins so their labels face out.",
    "You straighten a rice sack before clearing the table.",
    "You check the last tin and set it with the others."
  ],
  "community_setup": [
    "You turn the bean tins so their labels face out.",
    "You straighten a rice sack before clearing the table.",
    "You check the last tin and set it with the others."
  ],
  "community_lead": [
    "You check the room once more before packing up.",
    "You stack the loose chairs and gather the remaining notes.",
    "You leave the shared space ready for whoever comes next."
  ],
  "community_organize": [
    "You check the room once more before packing up.",
    "You stack the loose chairs and gather the remaining notes.",
    "You leave the shared space ready for whoever comes next."
  ],
  "rest": [
    "You slow your steps beneath the trees.",
    "You let a few people pass rather than hurry.",
    "You pause beside the path before walking on."
  ],
  "park_picnic": [
    "You fold the sandwich wrapper around the crumbs.",
    "You pass the apple slices before taking another bite.",
    "You brush a crumb from your sleeve and fold the picnic cloth."
  ],
  "park_run": [
    "You ease from running to walking and catch your breath.",
    "You shorten your stride at the end of the route.",
    "You walk the last stretch while your breathing settles."
  ],
  "park_read": [
    "You slide a finger between the pages to keep your place.",
    "You reread one sentence before closing the book.",
    "You smooth a bent page corner before putting the book away."
  ],
  "library_read": [
    "You slide a finger between the pages to keep your place.",
    "You reread one sentence before closing the book.",
    "You smooth a bent page corner before putting the book away."
  ],
  "library_learn": [
    "You slide a finger between the pages to keep your place.",
    "You reread one sentence before closing the book.",
    "You smooth a bent page corner before putting the book away."
  ],
  "library_club": [
    "You turn back to the passage you discussed.",
    "You leave your bookmark beside the disputed paragraph.",
    "You close the book with one line still in mind."
  ],
  "library_digitize": [
    "You compare the scan with the paper before saving it.",
    "You straighten the next sheet, then clear the scanner.",
    "You check the file label against the archive entry."
  ],
  "market_shift": [
    "You straighten the stall before packing away the last things.",
    "You count out the change carefully and close the cash tin.",
    "You clear a space on the stall for the next person."
  ],
  "market_resell": [
    "You straighten the stall before packing away the last things.",
    "You count out the change carefully and close the cash tin.",
    "You clear a space on the stall for the next person."
  ],
  "market_cook": [
    "You taste the peppers and parsley together.",
    "You scrape the chopped parsley from the board into the pan.",
    "You turn a pepper in the pan before serving it."
  ],
  "market_taste": [
    "You try the relish on a corner of flatbread.",
    "You take a small bite before trying the next sample.",
    "You fold the tasting wrapper around the last crumbs."
  ],
  "gym_yoga": [
    "You roll the mat from one end, slowly.",
    "You uncurl your fingers and sit for a moment.",
    "You stand up without rushing the last movement."
  ],
  "gym_train": [
    "You set the equipment down before stretching your hands.",
    "You pause between the last movement and packing up.",
    "You wipe down the equipment and step back."
  ],
  "gym_sauna": [
    "You sit a moment longer before getting up.",
    "You take your time gathering your things.",
    "You ease back into the corridor rather than hurry."
  ],
  "gym_desk": [
    "You put the desk in order before handing over.",
    "You check the last entry and close the desk ledger.",
    "You return the loose pens to their cup."
  ],
  "arcade_shift": [
    "You put the desk in order before handing over.",
    "You check the last entry and close the desk ledger.",
    "You return the loose pens to their cup."
  ],
  "maker_intro": [
    "You test the hinge once more before putting the screwdriver down.",
    "You turn the screwdriver slowly for the final adjustment.",
    "You open and close the hinge to check the movement."
  ],
  "maker_repair": [
    "You test the hinge once more before putting the screwdriver down.",
    "You turn the screwdriver slowly for the final adjustment.",
    "You open and close the hinge to check the movement."
  ],
  "maker_commission": [
    "You inspect the finished edges before setting the piece aside.",
    "You clear the workbench around the finished piece.",
    "You turn the work over for one last check."
  ],
  "creative_commission": [
    "You inspect the finished edges before setting the piece aside.",
    "You clear the workbench around the finished piece.",
    "You turn the work over for one last check."
  ],
  "maker_hobby": [
    "You lift the brush after the last blue feather.",
    "You turn the ceramic bird to check the paint.",
    "You rinse the blue paint from the brush."
  ],
  "cinema_matinee": [
    "You blink as you come back into the light.",
    "You wait for the aisle to clear before getting up.",
    "You fold the ticket while the last credits roll."
  ],
  "cinema_friends": [
    "You blink as you come back into the light.",
    "You wait for the aisle to clear before getting up.",
    "You fold the ticket while the last credits roll."
  ],
  "cinema_usher": [
    "You check the rows before leaving the auditorium.",
    "You gather the discarded tickets from the aisle.",
    "You pause at the auditorium door for the last arrivals."
  ],
  "cinema_club": [
    "You try to put one scene into words.",
    "You reconsider the ending while folding your ticket.",
    "You gesture toward the screen as you recall a shot."
  ],
  "transit_courier": [
    "You stop the bicycle and check the route is finished.",
    "You loosen your grip on the handlebars after the ride.",
    "You steady the bicycle before stepping off."
  ],
  "transit_repair": [
    "You squeeze the brake lever to test the new cable.",
    "You spin the wheel and watch the brake clearance.",
    "You wipe your hands after the last cable adjustment."
  ],
  "transit_scenic": [
    "You look out as the route carries you past unfamiliar corners.",
    "You keep watching the view after the next stop is called.",
    "You turn toward the window as the scenery changes."
  ],
  "transit_cleanup": [
    "You check the cleared stretch before putting the tools away.",
    "You gather the last loose scraps from the street edge.",
    "You step back to leave the route clear."
  ],
  "garden_tend": [
    "You tap the soil from the hand fork.",
    "You press a plant label firmly into the soil.",
    "You brush the loose soil from the edge of the tray."
  ],
  "garden_project": [
    "You tap the soil from the hand fork.",
    "You press a plant label firmly into the soil.",
    "You brush the loose soil from the edge of the tray."
  ],
  "garden_harvest": [
    "You settle the last of the harvest into the crate.",
    "You check the harvest before lifting the crate.",
    "You rub the soil from your palms beside the filled crates."
  ],
  "garden_workshop": [
    "You check the spacing before covering the seeds.",
    "You compare the damp soil with the drier patch beside it.",
    "You leave the seed labels where you can read them."
  ],
  "garden_rest": [
    "You sit beside the greenhouse and watch the light change.",
    "You rest your hands and leave the afternoon unhurried.",
    "You stay on the bench a moment before getting up."
  ],
  "arcade_play": [
    "You follow the silver ball until it drops out of sight.",
    "You take your hands off the pinball buttons after the last ball.",
    "You lean back from the pinball table and blink."
  ],
  "arcade_tabletop": [
    "You gather the wooden counters into a small pile.",
    "You square the cards before passing them on.",
    "You leave the cards face down and clear your place."
  ],
  "arcade_host": [
    "You collect the cards after the last game.",
    "You sort the wooden counters back into their box.",
    "You tuck the last chair back under the game table."
  ],
  "creative_practice": [
    "You set the newest attempt beside the earlier one.",
    "You put the tools down before judging the result.",
    "You leave yourself a small note about what to try next."
  ],
  "weekly_opportunity": [
    "You finish your part and clear the space you used.",
    "You check the work is ready to hand over.",
    "You gather your things after the last task."
  ]
};
const contextual:Record<string,readonly string[]>={
 visit:['You pause at the doorway before stepping inside.','You look toward the entrance as you arrive.','You step out of the way of the doorway and look around.'],
 end:['You put the last things away and leave the next part for another day.','You pause over what is finished before turning to what comes next.','You gather your things and let this stretch of time close.'],
 aspire:['You put your chosen direction into words.','You pause over the choice before carrying it with you.','You name the direction you want to give your time.'],
 repair:['You check the repaired part before putting everything back.','You try the repaired fitting carefully.','You give the repaired area one final look.'],
 decision:['You pause over the decision before moving on.','You take a moment to consider what follows from your choice.','You leave the decision settled for now.'],
 travel:['You watch the arrival point come into view.','You gather your things as the journey ends.','You pause after arriving to get your bearings.'],
 relocate:['You set your things down in the new home.','You check the doorway before bringing your things inside.','You pause on the threshold and look around.'],
 explore:['You stop at the next corner to fix the route in your mind.','You look back along the route before walking on.','You trace the route back in your mind.'],
 food:['You try a small mouthful before taking another.','You pause between bites and set the dish down.','You gather the last bite with care.'],
 work:['You finish your part and clear the space you used.','You check the completed work before handing it over.','You put the tools back within reach.'],
 language:['You try the phrase once more, a little more carefully.','You pause over the unfamiliar sound before repeating it.','You keep the useful phrase in mind as you leave.'],
 tradeoff:['You pause over the decision before moving on.','You take a moment to consider what follows from your choice.','You leave the decision settled for now.'],
};
export function actionReaction(context:ActionReactionContext):string|null{
 if(context.actorId||/^story_|^cast:|^cameo:/.test(context.actionId))return null;
 const count=Number.isFinite(context.count)?Math.max(1,Math.floor(context.count!)):1;
 const kind=context.kind||(context.actionId==='visit'?'visit':context.actionId==='end'?'end':context.actionId.startsWith('aspire:')?'aspire':context.actionId.startsWith('home_repair:')?'repair':context.actionId.startsWith('event:')?'decision':'');
 const lines=activityReactionLines[context.actionId]||contextual[kind];
 if(!lines)return null;
 const variant=Number.isSafeInteger(context.lastVariant)&&context.lastVariant!>=0?context.lastVariant!:count-1;
 const line=lines[variant%lines.length];
 if(count===1)return line;
 const familiarity=count<4?['The steps are becoming familiar.','You remember the sequence from before.']:
 count<7?['There is a rhythm to it now.','You no longer need to think through every step.']:
 ['It has become one of your small routines.','The familiar sequence has a place in your days.','You return to the routine without starting from scratch.'];
 return line+' '+familiarity[(variant+familiarity.length-1)%familiarity.length];
}
