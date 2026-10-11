import type { EnsembleAftermathDefinition, EnsembleAftermathOption } from './ensemble-aftermath-types.ts';

type ChoiceDetails = Pick<EnsembleAftermathOption, 'cost' | 'afterChoices' | 'sourceSignalsAny' | 'sourceSignalsNone'> & {
  time?: 0 | 1;
  emotion?: 'attentive' | 'warm' | 'proud';
  gesture?: 'pause' | 'point';
};

/** Positions stay in the personal receipt; the room sees only the observable visit. */
function choice(
  storyId: string, speakerId: string, id: string, label: string, outcome: string,
  publicText: string, speech: string, activity: string, details: ChoiceDetails = {},
): EnsembleAftermathOption {
  const { time = 1, emotion = 'warm', gesture = 'point', ...conditions } = details;
  return {
    id, label, outcome,
    narration: { personal: outcome, public: publicText, npc: publicText },
    response: { speakerId, speech, activity, emotion, gesture },
    signals: [`after_${storyId}_${id}`], time, ...conditions,
  };
}

const visibleFilm = ['queue_correction', 'film_offer', 'after_missing_shot_allow_hand', 'after_missing_shot_allow_sound'];
const literalCover = ['road_safe', 'full_record', 'route_status', 'after_whaleskin_measure_fit', 'after_whaleskin_plain_label', 'after_whaleskin_honest_bag', 'after_whaleskin_honest_shelf'];
const publicPacketExample = ['after_extra_run_share_half'];
const portionPerformance = ['broth_batch', 'late_service', 'after_broth_join_debate', 'after_broth_allow_argument'];
const publicFoodExample = ['diner_supply', 'after_route_green_offer_piece'];
const featuredBell = ['june_tribute', 'after_dalloway_credit_practice'];
const sharedDrawing = ['accurate_drawing', 'ordinary_art', 'after_empty_counter_literal_caption'];
const recordedClaim = ['table_released', 'after_commentary_read_prediction'];

export const ensembleAftermathEast = [
  {
    storyId: 'whaleskin', sourceStoryId: 'missing_shot',
    sourceSignals: ['queue_evidence', 'short_film', 'private_cut', 'queue_correction', 'film_offer', 'dispatch_alternative'],
    stages: [
      {
        id: 'proof', title: 'A platform-sized universe',
        prompt: 'Nila has made people interested in looking at a cup or a queue. Lata would like some of that attention for a genuinely useful object. Tavi brings their Whaleskin to the checked platform, safely clear of the outlet. Lata calls it universal. Tavi unfolds a ruler.',
        choices: [
          choice('whaleskin', 'lata_rao', 'measure_fit', 'Measure the platform for Lata’s big demonstration',
            'Lata wants the sort of attention Nila gets for showing almost nothing. You and Tavi help make a picture of the cover fitting their platform. The outlet stays clear; the caption says PLATFORM. Lata suggests smaller lettering. Tavi holds the ruler under the word until she gives up.',
            'Lata and Tavi permit an object-only platform picture; {{actor}} helps measure the fit, with the outlet kept clear.',
            'You have photographed its least ambitious achievement.', 'Lata angles the ruler away from the word PLATFORM.', { sourceSignalsAny: visibleFilm }),
          choice('whaleskin', 'lata_rao', 'plain_label', 'Help Tavi name the thing their cover fits',
            'With Nila’s images out of the picture, Lata has to sell this one in words. You and Tavi settle on FITS THIS PLATFORM. Lata supplies “ingenious,” then “versatile,” then a silence in which she plainly hopes somebody will say “generous.” Tavi thanks her for the gift. She brightens immediately.',
            'Lata and Tavi put FITS THIS PLATFORM on the agreed cover label; Nila’s images are not used.',
            'Generous would fit along the seam. Purely as a measurement.', 'Lata smooths a patch of label that is already perfectly flat.', { sourceSignalsNone: visibleFilm }),
          choice('whaleskin', 'lata_rao', 'no_demonstration', 'Let Lata explain universal fit without you',
            'You leave Lata and Tavi with the ruler. Lata immediately tells Tavi that a demonstration works better with an audience. Tavi looks at her. She concedes that this is technically an audience.',
            '{{actor}} leaves Lata and Tavi at the landing.',
            'It needs someone who has not already seen the back of the van.', 'Lata puts the ruler down with its markings facing away from her.', { time: 0, emotion: 'attentive', gesture: 'pause' }),
        ],
      },
      {
        id: 'parcel', title: 'An unfairly well-fitting bag',
        prompt: 'You have one small parcel, and Lata has a strong opinion about how it should stay dry. A fitted dry bag costs $24. There is also an indoor shelf you can use during the visit. Lata studies both alternatives with the expression she usually reserves for a rival van.',
        choices: [
          choice('whaleskin', 'lata_rao', 'buy_bag', 'Buy the fitted dry bag for $24',
            'You pay $24 and slide your parcel into its new dry bag. It fits at once. Lata examines the seam, looking for a weakness, then objects that choosing the right size has given the bag an unfair advantage. You close it before she can propose a larger parcel.',
            '{{actor}} checks a parcel beside Lata’s van.',
            'Of course it fits. You bought it for that. It has had every advantage.', 'Lata pinches the empty half-inch above the parcel and inspects it.', { cost: 24 }),
          choice('whaleskin', 'lata_rao', 'use_shelf', 'Use the indoor shelf and spend nothing',
            'You put the parcel on the indoor shelf while you visit. Lata follows your glance to the roof. She asks whether you intend to carry the building on your route. You say the parcel only needs to stay dry here. She looks genuinely disappointed in the smallness of your problem.',
            '{{actor}} checks a parcel beside Lata’s van.',
            'We are comparing portable solutions. Otherwise the roof wins every time.', 'Lata leans into the doorway and looks accusingly upward.'),
        ],
      },
      {
        id: 'testimonial', title: '“After speaking to Lata…”',
        prompt: 'Lata has written “After speaking to Lata…” and left a promising amount of space below it. She wants one sentence about your parcel. Her pencil is poised to record a triumph; your dry bag or that indoor shelf may make the rest of the sentence awkward.',
        choices: [
          choice('whaleskin', 'lata_rao', 'honest_bag', 'Give her “I bought a bag that fits” and nothing grander',
            'You let Lata use that sentence. She writes it beneath “After speaking to Lata,” and for a moment it looks excellent. Then she reaches BAG. The Whaleskin picture goes face down. She decides it can advertise her advice, provided nobody asks what that advice was.',
            'Lata may use only the approved sentence about a fitted bag, without presenting it as a Whaleskin endorsement.',
            'I introduced you to the importance of fitting. Through contrast.', 'Lata slides the Whaleskin picture beneath the testimonial sheet.', { afterChoices: ['buy_bag'] }),
          choice('whaleskin', 'lata_rao', 'honest_shelf', 'Give her “The parcel stayed indoors”',
            'You let Lata use the sentence about the shelf. Beneath her name, it makes her sound like a landlord. She tries it above her name, then beside it. The roof continues to receive all the praise. She folds the paper around her measuring tape with unnecessary precision.',
            'Lata may use only the approved sentence that the parcel stayed indoors, without presenting it as a cover endorsement.',
            'People never thank a roof until I am trying to make a point.', 'Lata creases the paper tightly around the measuring tape.', { afterChoices: ['use_shelf'] }),
          choice('whaleskin', 'lata_rao', 'no_testimonial', 'Take your parcel before Lata writes you a better experience',
            'You take your parcel and tell Lata to leave your name out. She crosses out the opening, then asks whether the dry parcel itself looks satisfied. You refuse to speak for it. This is the first answer of the afternoon she seems to respect without an amendment.',
            'Lata removes the proposed contributor’s name; no parcel testimonial is authorized.',
            'Very discreet, your parcel. I could use more customers like that.', 'Lata crosses out your name and leaves the rest of the line blank.', { time: 0, emotion: 'attentive', gesture: 'pause' }),
        ],
      },
    ],
  },
  {
    storyId: 'extra_run', sourceStoryId: 'whaleskin',
    sourceSignals: ['road_safe', 'cover_installed', 'route_status', 'route_suspicion', 'full_record', 'hero_crop', 'inland_available', 'inland_quote'],
    stages: [
      {
        id: 'box', title: 'Please inspect the seat',
        prompt: 'Ravi has heard about Lata getting so much mileage out of one cover. He has found a second use for an empty packing box: it is now a hamper. He is also sitting on it. To demonstrate the hamper he will have to surrender the only part he is enjoying.',
        choices: [
          choice('extra_run', 'ravi_desai', 'show_empty_box', 'Help photograph the hamper with its lid open',
            'After Lata’s exacting account, Ravi agrees the box should be shown as it is. You help make his EMPTY PACKING BOX picture. He lifts the lid and discovers the cost of transparency: he has nowhere to sit. The photograph captures emptiness beautifully. Ravi would like it taken faster.',
            'Ravi permits an open-box picture captioned EMPTY PACKING BOX for his own display.',
            'You have got the air. It is all the same air. Can I sit down?', 'Ravi hovers beside the open box, still holding its lid.', { sourceSignalsAny: literalCover }),
          choice('extra_run', 'ravi_desai', 'keep_box_seat', 'Keep the box-seat joke between you',
            'You leave Lata’s episode out of Ravi’s advertising and ask him whether the hamper is comfortable. He sits, considers, and says extremely. You suggest keeping this excellent use to himself. He agrees to leave you out of the publicity, then shifts his weight like a man testing a luxury chair.',
            'Ravi keeps the box-seat conversation private, without a customer name, photograph or advertising quote.',
            'The seat is the feature. The hamper is what I call it when I stand up.', 'Ravi settles more deeply onto the closed box.', { sourceSignalsNone: literalCover }),
          choice('extra_run', 'ravi_desai', 'skip_hamper', 'Walk on before the box becomes your problem',
            'You pass on the hamper. Ravi calls after you that it can hold almost anything, then declines to open it because he has just got comfortable. His best sales point remains occupied by his trousers.',
            '{{actor}} passes Ravi at the landing.',
            'The demonstration is temporarily seated.', 'Ravi plants his palms on either side of himself and stays put.', { time: 0, emotion: 'attentive', gesture: 'pause' }),
        ],
      },
      {
        id: 'break', title: 'The packet loses its resale value',
        prompt: 'Ravi remains beside the box. A sealed Kestrel Ferry Mix packet from the landing stock costs $12. He admires its possibilities while you consider eating it. You could also simply sit with him, although he may mistake that for interest in the hamper.',
        choices: [
          choice('extra_run', 'ravi_desai', 'open_packet', 'Buy Kestrel Ferry Mix for $12 and tear it open',
            'You pay $12 for one packet and tear straight through the seal. Ravi winces at the violence done to something so easily resold. Then the biscuit smell reaches him. He turns his order sheet over and begins discussing the packet in much less commercial terms.',
            '{{actor}} takes a short break beside Ravi.',
            'That is a surprisingly good smell for a lost opportunity.', 'Ravi pushes the face-down order sheet away from the crumbs.', { cost: 12 }),
          choice('extra_run', 'ravi_desai', 'talk_without_food', 'Sit with Ravi; let the packet stay on the shelf',
            'You sit down empty-handed. Ravi asks what might tempt you. You say you were already tempted to sit with him. He laughs, looks briefly touched, and spoils it by telling you the box has room for somebody considerably heavier.',
            '{{actor}} takes a short break beside Ravi.',
            'Good company. And excellent load distribution. Both can be true.', 'Ravi moves his order sheet aside to make a little more space.'),
        ],
      },
      {
        id: 'guest', title: 'Company for the empty space',
        prompt: 'Ravi has put his order sheet face down, though one corner keeps finding its way back up. He seems glad you stayed. It would be easier to enjoy his company if he could stop treating a pleasant break as the first meeting of an enterprise.',
        choices: [
          choice('extra_run', 'ravi_desai', 'share_half', 'Share half, and let Ravi tell the one-packet joke',
            'You offer half the packet. Ravi starts to calculate how many such breaks a week would use, then stops with a biscuit halfway to his mouth. Two people, one packet: he wants to tell Lio. You tell him he can use the joke, leaving your name and his freight pitch out of it.',
            'Ravi may retell the anonymous one-packet snack joke; no freight endorsement accompanies it.',
            'Three biscuits. I am going to enjoy all three without annualizing them.', 'Ravi closes the order book with the hand not holding a biscuit.', { afterChoices: ['open_packet'] }),
          choice('extra_run', 'ravi_desai', 'ask_ordinary_question', 'Ask when the harbor feels best to Ravi',
            'For once you ask a question with nothing to sell at the end. Ravi likes the minute after a ferry pulls away, when the water closes behind it and nobody can add one more box. He looks embarrassed by how much he means it. You leave that answer here with him.',
            'Ravi and {{actor}} finish a private harbor conversation; no quotation is offered for an advert.',
            'There is a moment when even I cannot fit anything else on it.', 'Ravi looks out over the water with the order sheet still face down.', { afterChoices: ['talk_without_food'] }),
          choice('extra_run', 'ravi_desai', 'end_break', 'Go before this becomes a business success story',
            'You stand to leave. Ravi starts “What this proves is,” sees your expression, and changes it to “That was nice.” He stays on the box after you go. For a little while it has only one job.',
            '{{actor}} leaves Ravi’s break without supplying a customer testimonial.',
            'That was nice. I was nearly going to ruin it.', 'Ravi starts to lift the order sheet, then lets it fall flat.', { time: 0, emotion: 'attentive', gesture: 'pause' }),
        ],
      },
    ],
  },
  {
    storyId: 'broth', sourceStoryId: 'extra_run',
    sourceSignals: ['grocery_order', 'repeat_order', 'small_load', 'freight_staffed', 'premium_freight', 'freight_limited', 'inland_quote'],
    stages: [
      {
        id: 'portion', title: 'The more generous nothing',
        prompt: 'Ravi’s latest adventures in spare space have Lio comparing two empty bowls. The big one looks generous. The small one makes Lio imagine a customer saying “Is that all?” Safia has noticed him looking and is preparing an opinion large enough for either bowl.',
        choices: [
          choice('broth', 'pelagia_lio', 'public_portion_example', 'Put Ravi’s one-packet joke between Lio’s bowls',
            'Ravi’s shareable joke gives Lio something to put between the bowls: TWO PEOPLE; ONE PACKET. Safia reads it as an indictment of stinginess. Lio reads it as proof that Ravi can occasionally stop at one. You help set the card down before either of them can add a third line.',
            'Lio displays the permitted anonymous example TWO PEOPLE; ONE PACKET beside two clean bowls.',
            'He probably described the crumbs as remaining capacity.', 'Lio wedges the small card firmly between the two bowls.', { sourceSignalsAny: publicPacketExample }),
          choice('broth', 'pelagia_lio', 'private_bowl_test', 'Compare the two bowls with Lio, off to one side',
            'You leave the Ravi conversation alone and compare Lio’s empty bowls privately. The large one looks lavish. The small one looks full of possibilities. Lio hears both compliments, then notices he has received an excellent review for serving you nothing. It cheers him more than he wants to admit.',
            'Lio keeps the clean-bowl comparison private and puts no customer anecdote on display.',
            'I could have saved a great deal of ginger this morning.', 'Lio holds the two empty bowls at exactly the same height.', { sourceSignalsNone: publicPacketExample }),
          choice('broth', 'pelagia_lio', 'skip_bowl', 'Leave before you are asked to represent a bowl',
            'You pass on the experiment. Safia says that choosing neither bowl is itself a choice. Lio lifts the bowls out of her reach and says it is also one fewer thing to wash. He sounds more grateful for this than for any theory of portions.',
            '{{actor}} passes Lio’s café counter.',
            'Go while you can. She has not assigned you a bowl yet.', 'Lio slides both clean bowls toward his side of the counter.', { time: 0, emotion: 'attentive', gesture: 'pause' }),
        ],
      },
      {
        id: 'debate', title: 'Safia represents the larger bowl',
        prompt: 'Service is over. Safia appoints herself advocate for the large bowl. Lio has been up since the early ferry shift and would like an advocate for sitting down. He leaves both clean bowls on the counter and waits to see whether you will join her or rescue the conversation.',
        choices: [
          choice('broth', 'pelagia_lio', 'join_debate', 'Tell Safia the spoonful would look lonely in the big bowl',
            'Safia praises the generous large bowl; you call the imaginary spoonful inside it lonely. Lio laughs harder than the remark deserves. Safia immediately improves your argument and presents it back to you. Lio turns the small bowl upside down and asks which way looks hungrier.',
            '{{actor}} joins a playful debate beside two clean empty bowls at Lio’s counter.',
            'The little one is now closed. A terrible blow to hospitality.', 'Lio turns the smaller bowl over and folds his hands beside it.'),
          choice('broth', 'pelagia_lio', 'private_flavor', 'Ask Lio what resting does to the ginger',
            'You step aside with Lio and ask about the broth. He describes the ginger mellowing as the pot rests, and begins to sound like himself again. Behind him, Safia rehearses both sides of the bowl dispute. He enjoys answering you, but keeps one ear cocked to see whether she says anything outrageous.',
            'Lio and {{actor}} talk privately beside the ingredient board.',
            'The ginger softens. Safia appears to be going the other way.', 'Lio rubs a ginger stain from one fingertip and listens past his shoulder.'),
        ],
      },
      {
        id: 'quotation', title: 'The joke gets larger',
        prompt: 'Safia has found material in the bowl conversation. She is rehearsing an opening with the authority she once used to provision ferries. Lio watches the story expand. Somewhere inside it there may still be a useful thought about ginger, or a joke he can bear to hear again.',
        choices: [
          choice('broth', 'pelagia_lio', 'allow_argument', 'Let the lonely-spoonful joke travel as a playful bowl debate',
            'You tell them they can repeat the spoonful joke as a playful debate. Safia tries opening with “Customers are becoming desperate.” Lio taps PLAYFUL DEBATE and makes her start again. Her second version is funnier. This annoys him, because he had begun to enjoy being indispensable to the first.',
            'Lio keeps permission for the spoonful joke together with its PLAYFUL DEBATE label.',
            'Her second version is better. I would appreciate you not looking so pleased.', 'Lio keeps a finger on the words PLAYFUL DEBATE while Safia rehearses.', { afterChoices: ['join_debate'] }),
          choice('broth', 'pelagia_lio', 'allow_flavor_note', 'Let Lio keep “Taste after resting,” without your name',
            'You let Lio keep the anonymous cooking note. He writes TASTE AFTER RESTING, then sits down beneath it. Safia asks whether it applies to the broth or the cook. He says he is conducting a comparison and closes his eyes for one very satisfying second.',
            'Lio adds the authorized anonymous cooking note TASTE AFTER RESTING; no customer testimonial is supplied.',
            'We know what rest does for ginger. I am the remaining question.', 'Lio puts the chalk down and eases himself onto a chair.', { afterChoices: ['private_flavor'] }),
          choice('broth', 'pelagia_lio', 'keep_conversation', 'Let the bowls go back on the shelf',
            'You ask them to leave your part out of the retelling. Lio stacks the bowls before Safia can ask for a closing statement. The sharp little clink ends the argument more effectively than anything said in it. Safia appears offended by the bowl’s timing.',
            'Lio clears the clean bowls; no quotation or customer endorsement from this visit is authorized.',
            'That was the best contribution the small one has made.', 'Lio lifts the stacked bowls away from the counter.', { time: 0, emotion: 'attentive', gesture: 'pause' }),
        ],
      },
    ],
  },
  {
    storyId: 'missing_shot', sourceStoryId: 'broth',
    sourceSignals: ['broth_sale', 'broth_batch', 'broth_limited', 'early_collection', 'late_service'],
    stages: [
      {
        id: 'empty_prop', title: 'Best supporting cup',
        prompt: 'Nila has heard enough about Lio’s bowls to become irritated that tableware is attracting an audience. At the cinema edit desk, she points a camera at an empty cup. She wants it to suggest something profound. It keeps suggesting that somebody should put tea in it.',
        choices: [
          choice('missing_shot', 'nila_desai', 'describe_performance', 'Ask Nila to widen the shot before the cup becomes a tragedy',
            'The portion performance at Lio’s has given Nila ideas. In her tight crop, the cup looks abandoned. You ask her to widen it. Now it is simply a cup on a table. She stares at the less impressive image, annoyed that you have made it better for a reason she cannot put on a poster.',
            'Nila widens the new cup-prop shot to show the table; no café diner is filmed.',
            'You have taken loneliness and given it a perfectly adequate table.', 'Nila rolls the frame wider, then leans back with folded arms.', { sourceSignalsAny: portionPerformance }),
          choice('missing_shot', 'nila_desai', 'hold_empty_shot', 'Watch the cup for twelve seconds and tell Nila what happens',
            'Without a café spectacle to borrow, Nila gives you twelve private seconds of cup. At second nine you expect tea. She wanted longing. You point out that you were longing for tea. She marks the second on her screen, furious at how useful this distinction turns out to be.',
            'Nila keeps the cup-shot feedback private; no café diner or customer testimony is added.',
            'I was aiming higher, but apparently the kettle is where the audience is.', 'Nila marks the ninth second and glances irritably at the empty cup.', { sourceSignalsNone: portionPerformance }),
          choice('missing_shot', 'nila_desai', 'skip_prop_test', 'Leave Nila and the cup to work it out',
            'You leave before the cup acquires your opinion. Nila tells it that you were probably distracted. Then she changes the angle, because she has noticed exactly where your attention drifted and cannot stop thinking about it.',
            '{{actor}} leaves Nila at the cinema edit desk.',
            'It is not you. It may be the handle. Turn slightly.', 'Nila rotates the cup by a fraction and studies the monitor.', { time: 0, emotion: 'attentive', gesture: 'pause' }),
        ],
      },
      {
        id: 'contribution', title: 'Your wrist is overdoing it',
        prompt: 'Nila needs the cup put down. You can try a hand-only test, framed clear of your face and belongings, or stay off camera and make the clink. You will review the result privately before deciding whether it goes in her short. She says “natural” with worrying emphasis.',
        choices: [
          choice('missing_shot', 'nila_desai', 'record_hand', 'Try the private hand-only take',
            'Nila frames only your hand and the cup. On the first try you set it down normally. After she says “natural,” your wrist develops an elaborate flourish. She watches the playback in silence. You both start laughing at the same instant, and neither wants to admit which one of you caused it.',
            '{{actor}} works with Nila on a private prop test.',
            'The wrist appears to have trained elsewhere. Can we have the first one back?', 'Nila imitates the accidental flourish with two exaggerated fingers.'),
          choice('missing_shot', 'nila_desai', 'record_sound', 'Stay off camera and try the cup’s clink',
            'Your first sound-only clink is sharp enough to end an argument. Nila calls it judgmental. You try a softer one. She plays them back alternately until the first seems to be criticizing the second. It is the liveliest conversation the cup has produced all afternoon.',
            '{{actor}} works with Nila on a private prop test.',
            'The first one disapproves of the second one’s career.', 'Nila alternates between the two sound peaks on her screen.'),
        ],
      },
      {
        id: 'permission', title: 'The quieter cup gets the part',
        prompt: 'Nila plays your little test again. She has become deeply attached to several seconds of crockery and would like to keep your contribution in the cup short. You can give this take its tiny career or ask her to make a replacement. She is trying to look equally enthusiastic about both.',
        choices: [
          choice('missing_shot', 'nila_desai', 'allow_hand', 'Let Nila keep the reviewed hand shot, unnamed',
            'You let the reviewed hand-only shot stay in this short, with your name and face out of it. Nila plays the movement once more and smiles before she can hide it. The cup gets most of the frame. Your wrist, after its brief ambitions, has accepted a supporting role.',
            'Nila may use the reviewed hand-only prop shot in this cup short, without identifying the contributor.',
            'There. You stopped helping the cup and it became very good.', 'Nila leaves the reviewed shot in place and takes her hand off the controls.', { afterChoices: ['record_hand'] }),
          choice('missing_shot', 'nila_desai', 'allow_sound', 'Give the quieter clink the part, unnamed',
            'You let Nila use the second, quieter sound in this short without identifying you. She mutes the first clink, then gives it one last listen as though saying goodbye to a difficult colleague. The cup finally sounds as if it has been put down, rather than passed over for promotion.',
            'Nila may use the reviewed second cup sound in this short, without a contributor’s name, voice or image.',
            'The first one will tell everyone it left for creative reasons.', 'Nila mutes the first sound and lets the softer clink play through.', { afterChoices: ['record_sound'] }),
          choice('missing_shot', 'nila_desai', 'withdraw_test', 'Ask Nila to replace your take',
            'You ask her to use somebody else’s take, so she records her own. Nila says “natural” under her breath and immediately overdoes the movement. You catch her looking at you. She gives the cup a small, exasperated smile and starts again.',
            'The test contribution remains unavailable for Nila’s cup short; she replaces it with her own material.',
            'Say nothing. The cup and I are having a private disagreement.', 'Nila removes your test from the sequence and resets the cup herself.', { time: 0, emotion: 'attentive', gesture: 'pause' }),
        ],
      },
    ],
  },
  {
    storyId: 'dalloway', sourceStoryId: 'route_green',
    sourceSignals: ['diner_supply', 'garden_crate', 'van_free', 'collection_window', 'late_stop'],
    stages: [
      {
        id: 'ordinary_plate', title: 'An egg with a publicist',
        prompt: 'Something about Esperanza’s van-and-lunch story has made June look critically at her menu. Other people get remembered for a joke; she has been cooking excellent eggs for years. She taps the Dalloway beside the counter and asks whether “ordinary” sounds comforting or insulting.',
        choices: [
          choice('dalloway', 'mesa_june', 'literal_menu_note', 'Help June put “Today’s eggs” on the menu',
            'Esperanza has managed to get people talking about food again. June would like to compete using food. You help her write TODAY’S EGGS on the menu. She starts to add AT LAST. You glance at the griddle, which has been making eggs for years. She rubs the extra words away and glares at the very successful griddle.',
            'June adds TODAY’S EGGS to her ordinary menu; the diner’s existing work arrangements remain unchanged.',
            'Other people get a comeback. Mine keeps happening before breakfast.', 'June wipes away the extra words while keeping TODAY’S EGGS intact.', { sourceSignalsAny: publicFoodExample }),
          choice('dalloway', 'mesa_june', 'private_menu_try', 'Try “Ordinary eggs” on June’s scrap of paper',
            'You leave Esperanza’s break out of it and try ORDINARY EGGS on a scrap. June takes this personally. She describes the edges, the timing and the heat until the scrap seems inadequate to contain breakfast. It stays beside her, off the menu. She adds an emphatic underline beneath EGGS.',
            'June keeps the menu-wording trial on a private scrap; no route anecdote is put on display.',
            'Ordinary is what people say when they have never watched the edges.', 'June underlines EGGS and turns the scrap toward herself.', { sourceSignalsNone: publicFoodExample }),
          choice('dalloway', 'mesa_june', 'skip_meal', 'Leave June to name her own eggs',
            'You leave the naming to June. She looks at the menu, then at a waiting plate, and goes back to cooking. A moment later she mutters “Today’s excellent eggs” to herself. It sounds less like a menu line than a private correction.',
            '{{actor}} passes June’s diner counter.',
            'The eggs know how good they are. I can work with that.', 'June sets the chalk down and checks the edge of a waiting egg.', { time: 0, emotion: 'attentive', gesture: 'pause' }),
        ],
      },
      {
        id: 'bell_or_break', title: 'June does nothing, almost',
        prompt: 'The griddle has a quiet moment. June offers to show you the Dalloway’s two notes, then says she could also sit down. She has put a chair within reach of the bell, just in case sitting down requires a demonstration.',
        choices: [
          choice('dalloway', 'mesa_june', 'ring_lesson', 'Accept June’s two-note lesson',
            'June lets you try her repaired Dalloway. Your second note is late. Her hand moves toward yours, stops, and returns to the counter. You try again while she grips the counter’s edge. She looks prouder of keeping still than she ever looked of repairing the bell.',
            '{{actor}} pauses with June beside the diner counter.',
            'Both notes. Nearly neighbors. Good.', 'June grips the counter with the fingers that were about to take over.'),
          choice('dalloway', 'mesa_june', 'quiet_company', 'Ask June to sit down with you instead',
            'June sits and begins describing a bicycle spring. Halfway through, she starts to stand to fetch it. You look at the empty seat she is leaving. She sits back down, slightly sheepish, and finishes with her hands. They are capable of a remarkably detailed bicycle.',
            '{{actor}} pauses with June beside the diner counter.',
            'You are missing a very good spring. You seem strangely content about that.', 'June stays seated and draws the spring’s shape in the air.'),
        ],
      },
      {
        id: 'credit', title: 'She nearly corrects the compliment',
        prompt: 'June asks whether you enjoyed the pause. The question is casual; her attention to the answer is not. She has spent so much of the day being useful that she would rather like you to have noticed. The Dalloway waits beside her for a possible encore.',
        choices: [
          choice('dalloway', 'mesa_june', 'credit_practice', 'Let June tell the bell story, including your late second note',
            'You tell June she taught well and your second note arrived when it felt ready. She laughs, then asks if she can repeat that. You say yes, with her teaching and your timing left as they were. Her first retelling gives your late note a splendid entrance; for once she resists improving its timing.',
            'June may repeat the agreed practice account, crediting her teaching and the learner’s late note separately.',
            'The first note was mine. The second had made its own arrangements.', 'June marks the long gap between notes with two taps on the counter.', { afterChoices: ['ring_lesson'] }),
          choice('dalloway', 'mesa_june', 'credit_company', 'Tell June, just between you, that you liked sitting together',
            'You tell her the sitting was the good part. June looks mildly cheated of a technical achievement. Then her shoulders drop and she admits she needed the chair more than the demonstration. She nudges the bell a little farther from her elbow and leaves your compliment between you.',
            'June and {{actor}} finish a private diner conversation; no tribute or performance quote is authorized.',
            'I was rather good at sitting by the end. Do not tell the station.', 'June eases the bell beyond the reach of her resting elbow.', { afterChoices: ['quiet_company'] }),
          choice('dalloway', 'mesa_june', 'no_tribute', 'Say goodbye before June asks for a review',
            'You leave with an ordinary goodbye. June starts to offer one more ring, changes her mind, and gives you a small wave. Once you turn away, she sits down. The bell gets no farewell either.',
            '{{actor}} leaves the diner without authorizing a new testimonial about June.',
            'Off you go. I am going to sit here extremely well.', 'June waves without reaching for the bell paddle.', { time: 0, emotion: 'attentive', gesture: 'pause' }),
        ],
      },
    ],
  },
  {
    storyId: 'empty_counter', sourceStoryId: 'dalloway',
    sourceSignals: ['clear_supper', 'supper_order', 'modest_supper', 'handover_evidence', 'june_tribute', 'diner_staffed', 'diner_cover', 'meal_served', 'simple_menu', 'meal_reduced', 'personal_supper_order'],
    stages: [
      {
        id: 'next_frame', title: 'The cup steals the scene',
        prompt: 'June has supplied another diner moment worth talking about, and Kit is mildly annoyed that a bell can attract an audience in two notes. Their empty-counter drawing needed six panels and still got mistaken for bad news. Kit starts a new scrap page. The cup is available again.',
        choices: [
          choice('empty_counter', 'kit', 'sound_panel', 'Give Kit’s cup a voice from outside the panel',
            'June’s memorable bell has annoyed Kit into ambition. You suggest PLATE READY from outside the frame. Kit adds the lettering without inventing a speaker, then makes it slightly larger than the bell. They call this balance. You look at them until they stop adjusting it.',
            'Kit tries an off-panel sound on a new scrap page without assigning an unsupported credit.',
            'Two notes and everyone listens. I have to draw the entire cup.', 'Kit enlarges the off-panel lettering, then pretends to inspect the cup.', { sourceSignalsAny: featuredBell }),
          choice('empty_counter', 'kit', 'returning_cup', 'Give the cup an entrance of its own',
            'You keep the personal June conversation to yourself and suggest a made-up hand returning a cup. Kit draws it just above the counter. There is now a pause before an event so tiny that anyone waiting for disaster will have to invent one. Kit seems rather pleased by the inconvenience.',
            'Kit tries an invented cup-return gesture; no personal conversation with June is reproduced.',
            'I could leave it there forever. That would upset the tragedy people.', 'Kit leaves a narrow white gap between the cup and the counter.', { sourceSignalsNone: featuredBell }),
          choice('empty_counter', 'kit', 'leave_scrap', 'Leave Kit alone with the next panel',
            'You leave Kit to the scrap page. They say they may draw the cup again, with the defensiveness of someone expecting a complaint from the cup. After you turn away, they pull the page closer and begin. The sink can spare this small pause.',
            '{{actor}} leaves Kit beside the diner counter.',
            'Perhaps it is a series. Perhaps I like the handle.', 'Kit draws the first curve of another cup on the scrap page.', { time: 0, emotion: 'attentive', gesture: 'pause' }),
        ],
      },
      {
        id: 'print', title: 'Six panels, no catastrophe',
        prompt: 'Kit has a finished small print of the ordinary cup page for $36. In the last panel, the returning cup hangs a sliver above the counter. They hold the page still and watch your face, trying to work out whether you are looking at the drawing or waiting for somebody to die.',
        choices: [
          choice('empty_counter', 'kit', 'buy_print', 'Buy Kit’s finished cup print for $36',
            'You pay $36 for the print as it is. Kit starts explaining the final panel, then stops when you say that was the one you liked. They put the page in a sleeve very carefully, pretending that the paper requires more attention than their pleased face does.',
            '{{actor}} looks at a finished cup print with Kit.',
            'Good. The cup can stop auditioning for a sadder life.', 'Kit straightens a sleeve corner that needed no straightening.', { cost: 36 }),
          choice('empty_counter', 'kit', 'look_without_owning', 'Stay with all six panels; leave the print with Kit',
            'You read slowly without buying. Kit watches you reach panel six and almost tells you where to look. You get there yourself. They stop hovering. For a moment you have the uncommon pleasure of looking at a drawing with its maker quietly satisfied beside you.',
            '{{actor}} looks at a finished cup print with Kit.',
            'I was not about to explain it. That was a completely unrelated breath.', 'Kit releases the page edge and lets it lie flat.'),
        ],
      },
      {
        id: 'meaning', title: 'A very small gap',
        prompt: 'Kit asks what you noticed. They sound prepared for criticism, but their finger is already hovering near the tiny gap beneath the returning cup. Several people have praised the drawing for making them sad. Kit would like someone to have noticed a line they actually drew.',
        choices: [
          choice('empty_counter', 'kit', 'literal_caption', 'Suggest “The cup came back” for your sleeve and the display',
            'You ask for THE CUP CAME BACK on your sleeve and let Kit use the words beside the original, unnamed. They write them with obvious pleasure. At last the cup has survived in public. Kit predicts someone will still call it brave, then catches themself smiling at the sentence.',
            'Kit adds the authorized caption THE CUP CAME BACK beside the original drawing without naming the reader.',
            'It did not overcome anything. It was carried about eighteen inches.', 'Kit writes the five words, leaving a generous space below them.', { afterChoices: ['buy_print'] }),
          choice('empty_counter', 'kit', 'name_small_detail', 'Tell Kit the little gap made you wait for the cup to land',
            'You say it quietly: that little white gap made you wait. Kit looks at the panel, then back at you. They had redrawn the gap several times and thought nobody would notice. For once their next remark is simply pleased, until embarrassment supplies a joke.',
            'Kit and {{actor}} finish a private discussion of the page; no review or reproduction is authorized.',
            'Yes. That. I spent an unreasonable amount of my life on that little nothing.', 'Kit holds a fingertip beside the gap without covering it.', { afterChoices: ['look_without_owning'] }),
          choice('empty_counter', 'kit', 'keep_reading_private', 'Finish looking without explaining yourself',
            'You finish and keep your reaction to yourself. Kit opens their mouth to ask, then closes it. They know how exhausting a demand for meaning can be. Instead they straighten the page, check the cup once more, and return to their own work.',
            'Kit receives no review or public explanation from this reading of the page.',
            'The cup has already said all six things it knows.', 'Kit squares the finished page beside a fresh order slip.', { time: 0, emotion: 'attentive', gesture: 'pause' }),
        ],
      },
    ],
  },
  {
    storyId: 'commentary', sourceStoryId: 'empty_counter',
    sourceSignals: ['accurate_drawing', 'art_commission', 'art_private', 'ordinary_art', 'poster_offer'],
    stages: [
      {
        id: 'empty_seat', title: 'The stool has stormed out',
        prompt: 'Kit’s cup picture has given Rosa a new interest in empty furniture. Beside her comfortable place at the Touchline table stands an unused stool. The radio is between reports. Rosa says the stool may have left in disgust, and she has a fairly detailed idea what disgusted it.',
        choices: [
          choice('commentary', 'rosa_moreno', 'literal_picture', 'Keep Rosa’s theory close to the cup in the picture',
            'Rosa calls the cup’s return suspiciously well timed. You point to the shared picture: someone finished washing it. She considers this explanation disappointingly complete. Then she notices how long the cup has kept you both talking and gives it a grudging sort of respect.',
            'Rosa discusses only the shared cup picture and its visible caption.',
            'Washed, returned, and still the center of attention. Some people have a gift.', 'Rosa tilts her head as though the pictured cup has interrupted her.', { sourceSignalsAny: sharedDrawing }),
          choice('commentary', 'rosa_moreno', 'invent_stool_story', 'Invent the empty stool’s scandal with Rosa',
            'You leave Kit’s private page alone and make up a story about the stool. It has stormed out over the commentary. Rosa says she expected better from a stool with such a steady position. She is thoroughly enjoying the scandal, especially because nobody involved can telephone to correct her.',
            'Rosa and {{actor}} invent a plainly imaginary stool story; Kit’s private page is not circulated.',
            'It always seemed dependable. Four legs, no principles.', 'Rosa surveys the empty stool as though it has disappointed her.', { sourceSignalsNone: sharedDrawing }),
          choice('commentary', 'rosa_moreno', 'skip_interpretation', 'Let Rosa listen; the stool can remain mysterious',
            'You leave Rosa to the report. She says you are missing a developing story, then turns the Touchline up a fraction. The commentator gets something wrong. The stool is instantly forgotten in favor of a person capable of being properly irritating.',
            '{{actor}} passes Rosa’s listening table.',
            'Never mind the stool. Listen to what this man has just said.', 'Rosa leans toward the speaker with one eyebrow already raised.', { time: 0, emotion: 'attentive', gesture: 'pause' }),
        ],
      },
      {
        id: 'prediction', title: 'Three words on the back',
        prompt: 'The Touchline is about to replay a piece of match commentary. Rosa predicts that the referee will be blamed. After a pause she adds “in some form.” You are both playing for the satisfaction of being right, which Rosa considers more serious than a small bet.',
        choices: [
          choice('commentary', 'rosa_moreno', 'record_prediction', 'Write the whole prediction, including “in some form”',
            'Rosa lets you write it down, then asks whether the last three words can go on the back. You leave them on the front. She accuses you of making a friendly afternoon competitive. You point at the radio. She says the radio was competitive when she arrived.',
            '{{actor}} listens beside Rosa’s Touchline.',
            'You have underlined the least important words with extraordinary enthusiasm.', 'Rosa tries to cover the last three words with the edge of one finger.'),
          choice('commentary', 'rosa_moreno', 'unrecorded_game', 'Leave the pen down and enjoy Rosa’s prediction',
            'You leave the prediction unwritten. Rosa becomes immediately more expansive about what she saw coming. You suspect she likes the room to maneuver; you like how happily she fills it. She catches your smile and insists she was going to say all this even with a pen present.',
            '{{actor}} listens beside Rosa’s Touchline.',
            'I have never been afraid of a pen. It is the people holding them.', 'Rosa nudges the unused pen a little farther from your hand.'),
        ],
      },
      {
        id: 'verdict', title: 'Rosa brings on a substitute',
        prompt: 'The replay commentator praises the referee for letting play continue. Rosa lifts one finger. Being singled out, she explains, is blame “in some form.” The radio has finished talking; Rosa is nowhere near finished winning.',
        choices: [
          choice('commentary', 'rosa_moreno', 'read_prediction', 'Read the words back, then let Rosa tell this one joke',
            'You read the sentence. Rosa admits that “in some form” has been a magnificent substitute. You agree she can retell that one joke without naming you. She is so pleased to have salvaged a good story that she nearly thanks you for catching her out. Nearly.',
            'Rosa may retell the agreed “in some form” wording joke without identifying her guest or recounting the rest of the visit.',
            'I brought those words on late and they changed the game.', 'Rosa taps the three qualifying words as though naming her best player.', { afterChoices: ['record_prediction'] }),
          choice('commentary', 'rosa_moreno', 'enjoy_without_certifying', 'Give Rosa her victory speech, but keep it at this table',
            'You let Rosa make the speech and decline to judge the forecast. She names herself Champion of This Table. You look at the empty stool, her only other competitor. She says withdrawal is a recognized route to defeat. The championship will stay between you; it has no need of witnesses.',
            'Rosa’s prediction game ends without a certified forecast or a public account of the visit.',
            'The stool had every opportunity. I will not apologize for preparation.', 'Rosa rests a triumphant palm on the listening table.', { afterChoices: ['unrecorded_game'] }),
          choice('commentary', 'rosa_moreno', 'end_prediction', 'Leave Rosa undefeated and unjudged',
            'You end the game without declaring a winner. Rosa says that is a common way to leave when one is losing. You smile and keep going. She lets you get several steps away before calling a genuinely warm goodbye, at a volume just below the correction she wanted to add.',
            'Rosa’s prediction game ends without a public scorecard or a guest endorsement.',
            'Same table another time. Bring a less suspicious pen.', 'Rosa gives a small wave and turns back toward the Touchline.', { time: 0, emotion: 'attentive', gesture: 'pause' }),
        ],
      },
    ],
  },
  {
    storyId: 'route_green', sourceStoryId: 'commentary',
    sourceSignals: ['interval_slot', 'listening_table', 'radio_ordinary', 'table_released', 'replay_table'],
    stages: [
      {
        id: 'joke', title: 'Lunch is on the way',
        prompt: 'Rosa’s latest performance beside the Touchline has encouraged Esperanza to improve a joke of her own. She has parked the Route-Green van at the market and put ON THE WAY against her lunch. The food is within arm’s reach. She is still hungry enough to resent a poor review.',
        choices: [
          choice('route_green', 'esperanza_vega', 'separate_cards', 'Put “On the way” against Esperanza’s lunch',
            'Rosa has demonstrated what a convenient phrase can survive. You help Esperanza separate her plain route information from the grand card on her lunch. She admires the arrangement, then realizes she has spent part of her break preparing a display for food she still has not eaten. The first bite is slightly resentful.',
            '{{actor}} pauses beside Esperanza’s parked van at the market.',
            'This delivery has been delayed by its own publicity.', 'Esperanza props the card against her lunch and finally takes a bite.', { sourceSignalsAny: recordedClaim }),
          choice('route_green', 'esperanza_vega', 'test_lunch_joke', 'Ask where the lunch is supposedly going',
            'Keeping the joke between you, you read ON THE WAY and ask for the destination. Esperanza points at her mouth. You ask whether it is on the route. She pauses, realizes what you have done, and laughs with a mouth still too empty for her liking.',
            '{{actor}} pauses beside Esperanza’s parked van at the market.',
            'Very funny. You have added a conversational detour.', 'Esperanza pulls the lunch toward herself and leaves the route sheet folded.', { sourceSignalsNone: recordedClaim }),
          choice('route_green', 'esperanza_vega', 'skip_lunch_joke', 'Let Esperanza eat before the joke improves',
            'You walk on. Esperanza starts to call after you with a better ending, then sees her lunch and chooses it instead. The card slips against the container. It can wait for an audience that is less responsible for her hunger.',
            '{{actor}} passes Esperanza’s parked van.',
            'Actually, I have a better version. No. It can wait.', 'Esperanza tucks the card beneath her lunch container.', { time: 0, emotion: 'attentive', gesture: 'pause' }),
        ],
      },
      {
        id: 'own_bag', title: 'The suspiciously empty hands',
        prompt: 'You can take a short walk through the market while Esperanza eats. A small bag of fruit costs $22 and is light enough to carry yourself. She watches the market with the weary alertness of someone who came here to rest and keeps noticing things she could put in the van.',
        choices: [
          choice('route_green', 'esperanza_vega', 'buy_fruit', 'Buy a fruit bag for $22 and carry it yourself',
            'You pay $22 for a small fruit bag and carry it back. Esperanza’s hand goes toward the rear door by habit. You lift the bag. She stops, embarrassed, then examines your one-armed delivery with a professional eye. She seems both relieved and faintly offended by how easy you have made it look.',
            '{{actor}} takes a short walk through the market.',
            'Look at you. Excellent access. Almost no turning circle.', 'Esperanza takes her hand from the rear-door handle and folds her arms.', { cost: 22 }),
          choice('route_green', 'esperanza_vega', 'walk_empty_handed', 'Walk around the market and buy nothing',
            'You return empty-handed. Esperanza asks what you forgot. Nothing. Was the fruit bad? No. Did you find it expensive? You just wanted a walk. She considers this unfamiliar use of a market, then looks past the stalls toward a stretch of shade she has been ignoring.',
            '{{actor}} takes a short walk through the market.',
            'I keep coming here as if there will be a test afterward.', 'Esperanza looks beyond the produce toward the shady edge of the market.'),
        ],
      },
      {
        id: 'personal_invitation', title: 'The shortest route in Ember Mesa',
        prompt: 'You are back beside the parked van. Esperanza has a few minutes left and has stopped checking the rear door every time someone passes. She could use a small kindness. She could also use nobody wanting anything from her. The distinction is making her look at you with interest.',
        choices: [
          choice('route_green', 'esperanza_vega', 'offer_piece', 'Offer a fruit piece and let her keep the arm-length-delivery joke',
            'You offer one piece of fruit. Esperanza asks how far it has traveled; you extend your arm. She laughs and wants to reuse the joke. You tell her she can, leaving your name and any van recommendation out. She takes a bite and says she has never enjoyed a competing delivery service so much.',
            'Esperanza may reuse the anonymous arm-length-delivery lunch joke; no van testimonial accompanies it.',
            'Fast, fresh, and your driver appears to be sitting down afterward. Obscene.', 'Esperanza takes the offered fruit and leaves the van keys untouched.', { afterChoices: ['buy_fruit'] }),
          choice('route_green', 'esperanza_vega', 'invite_short_walk', 'Invite Esperanza on a short walk with no errands',
            'You suggest a short loop through the shade. Esperanza agrees, then spots something at a stall and starts “While we are…” You look at her. She laughs, finishes with “walking,” and keeps walking. She seems lighter for having disappointed nobody but an impulse.',
            'Esperanza and {{actor}} take a short errand-free walk; no customer testimonial is offered.',
            'If I point at produce, pretend I am admiring the landscape.', 'Esperanza folds the route sheet closed before joining the short walk.', { afterChoices: ['walk_empty_handed'] }),
          choice('route_green', 'esperanza_vega', 'leave_break', 'Leave Esperanza to the last quiet minutes of lunch',
            'You leave her to it. Esperanza gives you a grateful wave, then turns the joke card blank-side up. She eats without improving anything. When a thought strikes her, she lets it go. The van stays exactly where she parked it.',
            '{{actor}} leaves Esperanza to her break without adding an invitation or testimonial.',
            'I have thought of a better ending. I am not going to use it.', 'Esperanza smooths the blank side of the lunch card and leaves it alone.', { time: 0, emotion: 'attentive', gesture: 'pause' }),
        ],
      },
    ],
  },
] satisfies EnsembleAftermathDefinition[];

// A later personal consequence can itself be the next local cause. Deriving the
// additions from the authored choices keeps every source loop closed without
// making an unchanged public ending repeat or inventing a purchase upstream.
for (const definition of ensembleAftermathEast) {
  const source = ensembleAftermathEast.find((candidate) => candidate.storyId === definition.sourceStoryId);
  if (source) {
    definition.sourceSignals.push(...source.stages.flatMap((stage) => stage.choices.flatMap((option) => option.signals)));
  }
}
