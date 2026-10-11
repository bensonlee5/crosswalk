import type { EnsembleAftermathDefinition } from './ensemble-aftermath-types.ts';

/** Finite, personal aftermaths. Each local crossing preserves the original ending. */
export const ensembleAftermathWest = [
  {
    "storyId": "laundry",
    "sourceStoryId": "portrait",
    "sourceSignals": [
      "stage_free",
      "portrait_slot",
      "portrait_finished",
      "portrait_display",
      "comedy_invitation",
      "recorded_song_slot",
      "after_portrait_draw_chair",
      "after_portrait_draw_self",
      "after_portrait_look_only",
      "after_portrait_chair_caption",
      "after_portrait_own_eyebrows",
      "after_portrait_visitor_credit",
      "after_portrait_no_caption",
      "after_portrait_share_chair",
      "after_portrait_share_self",
      "after_portrait_visit_qiao",
      "after_portrait_keep_page"
    ],
    "stages": [
      {
        "id": "adjective",
        "title": "An expensive expression",
        "prompt": "Liang arrives from the portrait conversation with a new theory: Qiao’s price list looks severe. He squints at it from several angles. Qiao says the numbers look much friendlier from her side of the counter.",
        "choices": [
          {
            "id": "public_comparison",
            "label": "Compare the drawing display with Qiao’s forbidding list",
            "outcome": "You compare the public drawing display with Qiao’s list. Liang admires the display’s warmth; Qiao asks whether he would prefer the rush price in a friendly oval. He laughs, then looks again to make sure she has not changed it. She leaves the list exactly as she likes it.",
            "narration": {
              "personal": "You compare the public drawing display with Qiao’s list. Liang admires the display’s warmth; Qiao asks whether he would prefer the rush price in a friendly oval. He laughs, then looks again to make sure she has not changed it. She leaves the list exactly as she likes it.",
              "public": "{{actor}} and Qiao compare a display with the laundry list. Qiao leaves the prices and wording unchanged.",
              "npc": "{{actor}} and Qiao compare a display with the laundry list. Qiao leaves the prices and wording unchanged."
            },
            "response": {
              "speakerId": "qiao_chen",
              "speech": "He asked for the wrinkles back in his portrait. My prices are also allowed to look their age.",
              "activity": "Squares the price list on the counter while Liang leans sideways to inspect it.",
              "emotion": "warm",
              "gesture": "point"
            },
            "signals": [
              "after_laundry_public_comparison"
            ],
            "time": 1,
            "sourceSignalsAny": [
              "portrait_display",
              "after_portrait_share_chair",
              "after_portrait_share_self"
            ]
          },
          {
            "id": "private_line",
            "label": "Make Liang explain what is wrong with the prices themselves",
            "outcome": "You steer Liang away from drawings and ask which price he means. He says it is the overall impression. Qiao asks whether he pays suppliers in overall impressions. His next sentence starts with an apology and ends with a suggestion; she lets the first half land.",
            "narration": {
              "personal": "You steer Liang away from drawings and ask which price he means. He says it is the overall impression. Qiao asks whether he pays suppliers in overall impressions. His next sentence starts with an apology and ends with a suggestion; she lets the first half land.",
              "public": "{{actor}} asks Liang to discuss the price list itself. Qiao keeps the drawing out of the discussion.",
              "npc": "{{actor}} asks Liang to discuss the price list itself. Qiao keeps the drawing out of the discussion."
            },
            "response": {
              "speakerId": "qiao_chen",
              "speech": "Dad, that was nearly a lovely apology. You put an extension on it.",
              "activity": "Turns the list toward Liang and rests a finger beside the ordinary rate.",
              "emotion": "warm",
              "gesture": "point"
            },
            "signals": [
              "after_laundry_private_line"
            ],
            "time": 1,
            "sourceSignalsNone": [
              "portrait_display",
              "after_portrait_share_chair",
              "after_portrait_share_self"
            ]
          },
          {
            "id": "no_editor",
            "label": "Leave the price-list argument to its enthusiastic owners",
            "outcome": "You decline to judge the list. Qiao hangs it up. Liang says it could be a little higher, meaning the paper; she thanks him for finally supporting a price increase. For a moment he cannot decide which correction would help him less.",
            "narration": {
              "personal": "You decline to judge the list. Qiao hangs it up. Liang says it could be a little higher, meaning the paper; she thanks him for finally supporting a price increase. For a moment he cannot decide which correction would help him less.",
              "public": "{{actor}} declines to review the laundry list. Qiao puts her own version back up.",
              "npc": "{{actor}} declines to review the laundry list. Qiao puts her own version back up."
            },
            "response": {
              "speakerId": "qiao_chen",
              "speech": "Higher? What an unexpectedly useful visit.",
              "activity": "Lifts the unchanged list a fraction and looks back at Liang.",
              "emotion": "attentive",
              "gesture": "pause"
            },
            "signals": [
              "after_laundry_no_editor"
            ],
            "time": 0
          }
        ]
      },
      {
        "id": "compliment",
        "title": "The empty choir chair",
        "prompt": "Mei says Qiao has the best voice of anyone who never comes. Qiao wants to hear the first half again. Mei has already begun describing an empty choir chair, right where Qiao would sound wonderful.",
        "choices": [
          {
            "id": "separate_praise",
            "label": "Ask Mei to deliver the compliment before bringing out the chair",
            "outcome": "After the price-list debate, you ask Mei to try a compliment with nothing attached. She praises Qiao’s voice. Qiao makes her repeat it, then asks what the current soloist is like. Mei says she thought Qiao was not interested in choir. “I’m interested in accuracy.”",
            "narration": {
              "personal": "After the price-list debate, you ask Mei to try a compliment with nothing attached. She praises Qiao’s voice. Qiao makes her repeat it, then asks what the current soloist is like. Mei says she thought Qiao was not interested in choir. “I’m interested in accuracy.”",
              "public": "{{actor}} asks Mei to separate the compliment from a rehearsal invitation. Qiao accepts the compliment only.",
              "npc": "{{actor}} asks Mei to separate the compliment from a rehearsal invitation. Qiao accepts the compliment only."
            },
            "response": {
              "speakerId": "qiao_chen",
              "speech": "She has pulled out a chair before I have finished enjoying the compliment.",
              "activity": "Leans on the counter, trying to look uninterested in Mei’s answer.",
              "emotion": "warm",
              "gesture": "point"
            },
            "signals": [
              "after_laundry_separate_praise"
            ],
            "time": 1,
            "afterChoices": [
              "public_comparison",
              "private_line"
            ]
          },
          {
            "id": "ask_directly",
            "label": "Ask whether Qiao would miss being invited",
            "outcome": "You stayed out of the price-list fight; now you ask Qiao whether she would miss Mei’s invitations. Her answer comes too quickly: of course not. Then she asks whether Mei was seriously considering stopping. Mei folds her arms and waits.",
            "narration": {
              "personal": "You stayed out of the price-list fight; now you ask Qiao whether she would miss Mei’s invitations. Her answer comes too quickly: of course not. Then she asks whether Mei was seriously considering stopping. Mei folds her arms and waits.",
              "public": "{{actor}} asks Qiao about the choir invitation. Qiao says she wants future invitations to remain optional.",
              "npc": "{{actor}} asks Qiao about the choir invitation. Qiao says she wants future invitations to remain optional."
            },
            "response": {
              "speakerId": "qiao_chen",
              "speech": "I would like to refuse occasionally. I cannot do that if she gets efficient about it.",
              "activity": "Straightens a fold that was already straight while waiting for Mei to answer.",
              "emotion": "warm",
              "gesture": "point"
            },
            "signals": [
              "after_laundry_ask_directly"
            ],
            "time": 1,
            "afterChoices": [
              "no_editor"
            ]
          },
          {
            "id": "no_testimonial",
            "label": "Escape before the sisters make you choose a soloist",
            "outcome": "You leave the sisters to it. Qiao asks how the choir’s new soloist handles the high phrase. Mei offers to show her. Both claim they are only trying to answer a practical question.",
            "narration": {
              "personal": "You leave the sisters to it. Qiao asks how the choir’s new soloist handles the high phrase. Mei offers to show her. Both claim they are only trying to answer a practical question.",
              "public": "{{actor}} leaves the sisters to their conversation. Qiao answers Mei herself.",
              "npc": "{{actor}} leaves the sisters to their conversation. Qiao answers Mei herself."
            },
            "response": {
              "speakerId": "qiao_chen",
              "speech": "I haven’t said I’m coming. I have said that note is difficult.",
              "activity": "Raises one eyebrow at Mei, then hums the opening note under her breath.",
              "emotion": "attentive",
              "gesture": "pause"
            },
            "signals": [
              "after_laundry_no_testimonial"
            ],
            "time": 0
          }
        ]
      },
      {
        "id": "chorus",
        "title": "The part she has forgotten",
        "prompt": "Qiao starts the chorus Mei mentioned, stops, and says she cannot remember the difficult bit. Then she sings the difficult bit beautifully while hunting for a missing cloth. She seems annoyed that anyone heard.",
        "choices": [
          {
            "id": "one_chorus",
            "label": "Stay to hear the part Qiao says she has forgotten",
            "outcome": "You stay for the chorus. Qiao finds the cloth, forgets to pick it up and sings the troublesome phrase twice. You thank her when she finishes. She starts to blame the room’s acoustics, then lets herself smile.",
            "narration": {
              "personal": "You stay for the chorus. Qiao finds the cloth, forgets to pick it up and sings the troublesome phrase twice. You thank her when she finishes. She starts to blame the room’s acoustics, then lets herself smile.",
              "public": "{{actor}} listens to Qiao sing one chorus and thanks her. No recording is made.",
              "npc": "{{actor}} listens to Qiao sing one chorus and thanks her. No recording is made."
            },
            "response": {
              "speakerId": "qiao_chen",
              "speech": "It comes back when I stop trying. Very inconvenient method.",
              "activity": "Leaves the cloth on the counter until the last note has gone.",
              "emotion": "proud",
              "gesture": "point"
            },
            "signals": [
              "after_laundry_one_chorus"
            ],
            "time": 1
          },
          {
            "id": "sing_alone",
            "label": "Slip away and leave her to the song",
            "outcome": "You leave quietly. Through the closing door, Qiao returns to the verse she skipped and takes it at her own pace. There is nobody left to impress or contradict. She sounds less tired by the second line.",
            "narration": {
              "personal": "You leave quietly. Through the closing door, Qiao returns to the verse she skipped and takes it at her own pace. There is nobody left to impress or contradict. She sounds less tired by the second line.",
              "public": "{{actor}} leaves the laundry. Qiao resumes singing to herself.",
              "npc": "{{actor}} leaves the laundry. Qiao resumes singing to herself."
            },
            "response": {
              "speakerId": "qiao_chen",
              "speech": "Go on. I am going to forget another verse.",
              "activity": "Waits for the door to settle, then takes a longer breath.",
              "emotion": "attentive",
              "gesture": "pause"
            },
            "signals": [
              "after_laundry_sing_alone"
            ],
            "time": 0
          }
        ]
      }
    ]
  },
  {
    "storyId": "small_pause",
    "sourceStoryId": "laundry",
    "sourceSignals": [
      "laundry_early",
      "laundry_rush",
      "qiao_free",
      "choir_finite",
      "qiao_later",
      "choir_declined",
      "laundry_quote",
      "after_laundry_public_comparison",
      "after_laundry_private_line",
      "after_laundry_no_editor",
      "after_laundry_separate_praise",
      "after_laundry_ask_directly",
      "after_laundry_no_testimonial",
      "after_laundry_one_chorus",
      "after_laundry_sing_alone"
    ],
    "stages": [
      {
        "id": "audience",
        "title": "A modest triumph",
        "prompt": "At the café, Akira has heard the latest about Qiao’s audience. He wonders aloud whether people appreciate restraint. Hana tells him the question would sound less general if he stopped standing in his entrance pose.",
        "choices": [
          {
            "id": "quiet_applause",
            "label": "Give his tiny entrance a little applause",
            "outcome": "You watch the entrance and give a small round of applause. Akira bows once, then adds a gracious half-bow for Hana, who has not applauded. By the time he straightens, his exit needs an entrance of its own.",
            "narration": {
              "personal": "You watch the entrance and give a small round of applause. Akira bows once, then adds a gracious half-bow for Hana, who has not applauded. By the time he straightens, his exit needs an entrance of its own.",
              "public": "{{actor}} watches Akira try his entrance and gives brief applause. Akira adds a considerably longer bow.",
              "npc": "{{actor}} watches Akira try his entrance and gives brief applause. Akira adds a considerably longer bow."
            },
            "response": {
              "speakerId": "akira_mori",
              "speech": "I was acknowledging the room. Parts of the room are rather withholding.",
              "activity": "Finishes the second bow and looks directly at Hana.",
              "emotion": "proud",
              "gesture": "point"
            },
            "signals": [
              "after_small_pause_quiet_applause"
            ],
            "time": 1,
            "sourceSignalsAny": [
              "choir_finite",
              "after_laundry_one_chorus",
              "after_laundry_separate_praise"
            ]
          },
          {
            "id": "no_explanation",
            "label": "Ask to see the entrance before he explains it",
            "outcome": "You ask for the entrance on its own. Akira pauses; you laugh. He starts to explain the pause, catches your look and stops. The second silence earns another laugh, which he clearly considers claiming as a planned improvement.",
            "narration": {
              "personal": "You ask for the entrance on its own. Akira pauses; you laugh. He starts to explain the pause, catches your look and stops. The second silence earns another laugh, which he clearly considers claiming as a planned improvement.",
              "public": "{{actor}} watches Akira’s short entrance. Akira pauses instead of adding an explanation.",
              "npc": "{{actor}} watches Akira’s short entrance. Akira pauses instead of adding an explanation."
            },
            "response": {
              "speakerId": "akira_mori",
              "speech": "That second one is still in development. You saw an early version.",
              "activity": "Holds up a finger, thinks better of it and slips the hand into his pocket.",
              "emotion": "warm",
              "gesture": "point"
            },
            "signals": [
              "after_small_pause_no_explanation"
            ],
            "time": 1,
            "sourceSignalsNone": [
              "choir_finite",
              "after_laundry_one_chorus",
              "after_laundry_separate_praise"
            ]
          },
          {
            "id": "no_audience",
            "label": "Keep this a café visit",
            "outcome": "You decline the performance. Akira sits down with exaggerated ordinariness, making a small production of being a man who sits down. Hana pushes his chair the last inch toward the table.",
            "narration": {
              "personal": "You decline the performance. Akira sits down with exaggerated ordinariness, making a small production of being a man who sits down. Hana pushes his chair the last inch toward the table.",
              "public": "{{actor}} declines the demonstration. Akira sits down with Hana.",
              "npc": "{{actor}} declines the demonstration. Akira sits down with Hana."
            },
            "response": {
              "speakerId": "akira_mori",
              "speech": "There. Seated. Nobody need review it.",
              "activity": "Pulls his scarf off the chair back and settles into the seat.",
              "emotion": "attentive",
              "gesture": "pause"
            },
            "signals": [
              "after_small_pause_no_audience"
            ],
            "time": 0
          }
        ]
      },
      {
        "id": "attribution",
        "title": "A rave in progress",
        "prompt": "Akira is telling Ren that you noticed something special about his entrance. Hana asks what you said. He remembers the spirit more clearly than the words, which seems to give him enormous room.",
        "choices": [
          {
            "id": "credit_bow",
            "label": "Tell him the bow is what you remember",
            "outcome": "You remind Akira that the bow swallowed the entrance. He looks wounded, then tries the entrance again with his arms pinned to his sides. This time he lets the laugh subside before moving. He asks Hana whether that was better; she says it was shorter. He takes the victory.",
            "narration": {
              "personal": "You remind Akira that the bow swallowed the entrance. He looks wounded, then tries the entrance again with his arms pinned to his sides. This time he lets the laugh subside before moving. He asks Hana whether that was better; she says it was shorter. He takes the victory.",
              "public": "{{actor}} watches a second attempt. Akira omits the bow and leaves the laugh unanswered.",
              "npc": "{{actor}} watches a second attempt. Akira omits the bow and leaves the laugh unanswered."
            },
            "response": {
              "speakerId": "akira_mori",
              "speech": "She means better. We have developed a difficult family shorthand.",
              "activity": "Keeps both hands firmly against his trouser seams after the pause.",
              "emotion": "warm",
              "gesture": "point"
            },
            "signals": [
              "after_small_pause_credit_bow"
            ],
            "time": 1,
            "afterChoices": [
              "quiet_applause"
            ]
          },
          {
            "id": "credit_silence",
            "label": "Give him the two-word review: “briefly excellent”",
            "outcome": "You remind him that you liked the unexplained pause and call it “briefly excellent.” Akira repeats the phrase to Ren, stressing excellent. Hana repeats it, stressing briefly. For once, neither of them has added a word.",
            "narration": {
              "personal": "You remind him that you liked the unexplained pause and call it “briefly excellent.” Akira repeats the phrase to Ren, stressing excellent. Hana repeats it, stressing briefly. For once, neither of them has added a word.",
              "public": "{{actor}} offers a short comment on the entrance. Akira repeats the comment without adding a speech.",
              "npc": "{{actor}} offers a short comment on the entrance. Akira repeats the comment without adding a speech."
            },
            "response": {
              "speakerId": "akira_mori",
              "speech": "Briefly excellent. If you put the emphasis in a strange place, that is your business.",
              "activity": "Taps two fingers on the table, lingering over the second.",
              "emotion": "proud",
              "gesture": "point"
            },
            "signals": [
              "after_small_pause_credit_silence"
            ],
            "time": 1,
            "afterChoices": [
              "no_explanation"
            ]
          },
          {
            "id": "own_account",
            "label": "Ask what he likes about doing the entrance",
            "outcome": "You skipped the café performance, so you ask Akira what he enjoys about it. His sales pitch falters. He says there is a moment when he can feel the room waiting with him, and getting that moment right makes the whole rehearsal worthwhile. Ren listens.",
            "narration": {
              "personal": "You skipped the café performance, so you ask Akira what he enjoys about it. His sales pitch falters. He says there is a moment when he can feel the room waiting with him, and getting that moment right makes the whole rehearsal worthwhile. Ren listens.",
              "public": "{{actor}} asks Akira about his own interest in acting. Akira describes the pause in his own words.",
              "npc": "{{actor}} asks Akira about his own interest in acting. Akira describes the pause in his own words."
            },
            "response": {
              "speakerId": "akira_mori",
              "speech": "It is very small until you are the one standing there.",
              "activity": "Looks toward the little gap between the café chairs and lets his hand fall.",
              "emotion": "warm",
              "gesture": "point"
            },
            "signals": [
              "after_small_pause_own_account"
            ],
            "time": 1,
            "afterChoices": [
              "no_audience"
            ]
          },
          {
            "id": "no_review",
            "label": "Refuse to become his resident critic",
            "outcome": "You decline the review. Akira tells Ren that critics are overrated, then asks Hana whether she would describe the pause as memorable. She says she has heard about little else. He seems satisfied with the adjective.",
            "narration": {
              "personal": "You decline the review. Akira tells Ren that critics are overrated, then asks Hana whether she would describe the pause as memorable. She says she has heard about little else. He seems satisfied with the adjective.",
              "public": "{{actor}} declines to provide a review. Akira describes his own interest in the play.",
              "npc": "{{actor}} declines to provide a review. Akira describes his own interest in the play."
            },
            "response": {
              "speakerId": "akira_mori",
              "speech": "Memorable. From Hana, that is almost indecent praise.",
              "activity": "Folds his proposed quotation into a smaller and smaller square.",
              "emotion": "attentive",
              "gesture": "pause"
            },
            "signals": [
              "after_small_pause_no_review"
            ],
            "time": 0
          }
        ]
      },
      {
        "id": "hana",
        "title": "The bench in the story",
        "prompt": "Hana starts telling Akira about a walk and the bench where she stopped. He hears an opening for a joke about dramatic pauses. She hears him take the breath for it and stops talking.",
        "choices": [
          {
            "id": "listen_hana",
            "label": "Stay and hear why Hana stopped there",
            "outcome": "You stay, and Akira lets Hana finish. The bench looked down over part of her old postal round; she wanted to see what had changed. He asks about one doorway he remembers. Hana’s answer turns into a story he has never heard, which seems to surprise them both.",
            "narration": {
              "personal": "You stay, and Akira lets Hana finish. The bench looked down over part of her old postal round; she wanted to see what had changed. He asks about one doorway he remembers. Hana’s answer turns into a story he has never heard, which seems to surprise them both.",
              "public": "{{actor}}, Hana and Akira talk at the café. Akira lets Hana finish her walking story before asking a question.",
              "npc": "{{actor}}, Hana and Akira talk at the café. Akira lets Hana finish her walking story before asking a question."
            },
            "response": {
              "speakerId": "akira_mori",
              "speech": "I thought I knew this one. Apparently I knew the part where I interrupted.",
              "activity": "Turns his chair toward Hana and rests his scarf in his lap.",
              "emotion": "warm",
              "gesture": "point"
            },
            "signals": [
              "after_small_pause_listen_hana"
            ],
            "time": 1
          },
          {
            "id": "leave_siblings",
            "label": "Leave the siblings to catch up",
            "outcome": "You leave them together. Hana returns to the bench, and Akira asks where it was before she has to prompt him. On your way out, you hear him get a street wrong and her correct him with obvious pleasure.",
            "narration": {
              "personal": "You leave them together. Hana returns to the bench, and Akira asks where it was before she has to prompt him. On your way out, you hear him get a street wrong and her correct him with obvious pleasure.",
              "public": "{{actor}} leaves the café conversation. Akira and Hana continue their visit.",
              "npc": "{{actor}} leaves the café conversation. Akira and Hana continue their visit."
            },
            "response": {
              "speakerId": "akira_mori",
              "speech": "All right, the bench. I am listening before I become inaccurate again.",
              "activity": "Leans toward his sister instead of watching the café door.",
              "emotion": "attentive",
              "gesture": "pause"
            },
            "signals": [
              "after_small_pause_leave_siblings"
            ],
            "time": 0
          }
        ]
      }
    ]
  },
  {
    "storyId": "timetable",
    "sourceStoryId": "small_pause",
    "sourceSignals": [
      "handover_clear",
      "canteen_cover",
      "rota_later",
      "short_rehearsal",
      "full_rehearsal",
      "after_small_pause_quiet_applause",
      "after_small_pause_no_explanation",
      "after_small_pause_no_audience",
      "after_small_pause_credit_bow",
      "after_small_pause_credit_silence",
      "after_small_pause_own_account",
      "after_small_pause_no_review",
      "after_small_pause_listen_hana",
      "after_small_pause_leave_siblings"
    ],
    "stages": [
      {
        "id": "map",
        "title": "The appendix in their pocket",
        "prompt": "Ren’s shift is over. Akira’s thoughts about pauses have reminded them of a favorite bench on their walking map. The official board has three useful facts; the little map in their pocket has evidently been having a much richer life.",
        "choices": [
          {
            "id": "read_map",
            "label": "See whether you can read the pocket map unaided",
            "outcome": "You trace Ren’s map and find the sheltered bench. Ren brightens, then watches you understand it without asking about the wind. They begin “Although in winter,” stop, and turn the map a fraction toward the view they meant.",
            "narration": {
              "personal": "You trace Ren’s map and find the sheltered bench. Ren brightens, then watches you understand it without asking about the wind. They begin “Although in winter,” stop, and turn the map a fraction toward the view they meant.",
              "public": "{{actor}} reads Ren’s personal walking map. Ren points out the symbol for a sheltered pause after the map has been read.",
              "npc": "{{actor}} reads Ren’s personal walking map. Ren points out the symbol for a sheltered pause after the map has been read."
            },
            "response": {
              "speakerId": "glass_ren",
              "speech": "You found it. Excellent. That has made about six things I know temporarily useless.",
              "activity": "Keeps a finger poised beside the bench symbol, waiting for a question.",
              "emotion": "warm",
              "gesture": "point"
            },
            "signals": [
              "after_timetable_read_map"
            ],
            "time": 1,
            "sourceSignalsAny": [
              "short_rehearsal",
              "handover_clear",
              "after_small_pause_no_explanation",
              "after_small_pause_credit_silence",
              "after_small_pause_listen_hana"
            ]
          },
          {
            "id": "hear_bench",
            "label": "Ask Ren why this bench made the map",
            "outcome": "You ask about one bench. Ren describes finding it on a miserable walk and sitting there long after the rain eased. A second bench enters the story as a rival. You point back to the first, and Ren admits that choosing a favorite has caused needless trouble.",
            "narration": {
              "personal": "You ask about one bench. Ren describes finding it on a miserable walk and sitting there long after the rain eased. A second bench enters the story as a rival. You point back to the first, and Ren admits that choosing a favorite has caused needless trouble.",
              "public": "{{actor}} asks Ren about one bench on their personal map. Ren tells the story of that marked pause.",
              "npc": "{{actor}} asks Ren about one bench on their personal map. Ren tells the story of that marked pause."
            },
            "response": {
              "speakerId": "glass_ren",
              "speech": "That other bench gets advertised by people who have never sat there in a crosswind.",
              "activity": "Cups a hand beside the marked bench as though shielding it from the weather.",
              "emotion": "warm",
              "gesture": "point"
            },
            "signals": [
              "after_timetable_hear_bench"
            ],
            "time": 1,
            "sourceSignalsNone": [
              "short_rehearsal",
              "handover_clear",
              "after_small_pause_no_explanation",
              "after_small_pause_credit_silence",
              "after_small_pause_listen_hana"
            ]
          },
          {
            "id": "keep_directions",
            "label": "Read the train board and let Ren finish for the day",
            "outcome": "You use the departure board and leave. Ren folds their map. They nearly call after you with a useful shortcut, then look at the end of their shift and let you take the perfectly good route you already have.",
            "narration": {
              "personal": "You use the departure board and leave. Ren folds their map. They nearly call after you with a useful shortcut, then look at the end of their shift and let you take the perfectly good route you already have.",
              "public": "{{actor}} reads the departure board and leaves. Ren folds their personal map.",
              "npc": "{{actor}} reads the departure board and leaves. Ren folds their personal map."
            },
            "response": {
              "speakerId": "glass_ren",
              "speech": "You have what you need. Look at that.",
              "activity": "Tucks the small map away and lowers their shoulders.",
              "emotion": "attentive",
              "gesture": "pause"
            },
            "signals": [
              "after_timetable_keep_directions"
            ],
            "time": 0
          }
        ]
      },
      {
        "id": "legend",
        "title": "The bench committee",
        "prompt": "Ren writes “quiet” beside a sheltered bench. Liang peers over their shoulder and asks what they intend to do about people who talk there. He already has a few examples. Ren looks at the tiny space available for this new branch of government.",
        "choices": [
          {
            "id": "literal_shelter",
            "label": "Suggest “sheltered” before Liang starts making rules",
            "outcome": "You understood the map without a speech, so you suggest the literal word “sheltered.” Ren changes it. Liang immediately begins a speech about how people used to know when to be quiet. Ren watches him prove the value of the correction.",
            "narration": {
              "personal": "You understood the map without a speech, so you suggest the literal word “sheltered.” Ren changes it. Liang immediately begins a speech about how people used to know when to be quiet. Ren watches him prove the value of the correction.",
              "public": "{{actor}} suggests a more literal word for the personal map. Ren marks the bench “sheltered.”",
              "npc": "{{actor}} suggests a more literal word for the personal map. Ren marks the bench “sheltered.”"
            },
            "response": {
              "speakerId": "glass_ren",
              "speech": "The wind. We are making a claim about the wind.",
              "activity": "Underlines “sheltered” while Liang continues beside them.",
              "emotion": "warm",
              "gesture": "point"
            },
            "signals": [
              "after_timetable_literal_shelter"
            ],
            "time": 1,
            "afterChoices": [
              "read_map"
            ]
          },
          {
            "id": "keep_story",
            "label": "Keep the bench’s story beside the useful mark",
            "outcome": "You liked the story and ask Ren to keep it. They give the shelter its own symbol and leave the memory beside it. Liang asks whether the map could mention the goods lift he operated. Ren says this part is a bench. He suggests that lifts also involve waiting.",
            "narration": {
              "personal": "You liked the story and ask Ren to keep it. They give the shelter its own symbol and leave the memory beside it. Liang asks whether the map could mention the goods lift he operated. Ren says this part is a bench. He suggests that lifts also involve waiting.",
              "public": "{{actor}} discusses the map wording with Ren. Ren separates a personal note from the shelter symbol.",
              "npc": "{{actor}} discusses the map wording with Ren. Ren separates a personal note from the shelter symbol."
            },
            "response": {
              "speakerId": "glass_ren",
              "speech": "Grandad is applying to become a landmark.",
              "activity": "Leaves a small gap between the shelter symbol and the personal note.",
              "emotion": "warm",
              "gesture": "point"
            },
            "signals": [
              "after_timetable_keep_story"
            ],
            "time": 1,
            "afterChoices": [
              "hear_bench"
            ]
          },
          {
            "id": "map_question",
            "label": "Ask when this pocket map became a public project",
            "outcome": "Having passed on the map earlier, you ask why Liang is now reviewing it. Ren looks down at the worn folds and laughs. They keep their note. Liang says he only thought other people might benefit; Ren says at least one person already does.",
            "narration": {
              "personal": "Having passed on the map earlier, you ask why Liang is now reviewing it. Ren looks down at the worn folds and laughs. They keep their note. Liang says he only thought other people might benefit; Ren says at least one person already does.",
              "public": "{{actor}} asks Ren whether the personal map needs a public label. Ren keeps the wording as a personal note.",
              "npc": "{{actor}} asks Ren whether the personal map needs a public label. Ren keeps the wording as a personal note."
            },
            "response": {
              "speakerId": "glass_ren",
              "speech": "It has lived in my pocket for years. It never asked for a launch.",
              "activity": "Folds the map to the familiar worn square in their palm.",
              "emotion": "warm",
              "gesture": "point"
            },
            "signals": [
              "after_timetable_map_question"
            ],
            "time": 1,
            "afterChoices": [
              "keep_directions"
            ]
          },
          {
            "id": "no_legend_vote",
            "label": "Leave Ren and Liang to the bench debate",
            "outcome": "You decline to join in. Ren folds the map. Liang says folding it does not resolve the issue. Ren says it resolves the amount of map he can point at, and puts it away.",
            "narration": {
              "personal": "You decline to join in. Ren folds the map. Liang says folding it does not resolve the issue. Ren says it resolves the amount of map he can point at, and puts it away.",
              "public": "{{actor}} declines to advise on the personal map. Ren folds it away from the departure board.",
              "npc": "{{actor}} declines to advise on the personal map. Ren folds it away from the departure board."
            },
            "response": {
              "speakerId": "glass_ren",
              "speech": "A remarkably compact solution.",
              "activity": "Closes the last fold before Liang can reach the bench again.",
              "emotion": "attentive",
              "gesture": "pause"
            },
            "signals": [
              "after_timetable_no_legend_vote"
            ],
            "time": 0
          }
        ]
      },
      {
        "id": "credit",
        "title": "A family talent",
        "prompt": "Liang says Ren’s map would look handsome beside a portrait. He calls its eye for detail a family trait and gestures, with impressive subtlety, toward himself. Ren waits for the gesture to finish.",
        "choices": [
          {
            "id": "map_credit",
            "label": "Make Liang say whose map he admires",
            "outcome": "You stay while Ren gets Liang to say “Ren’s map.” He says it, warmly, then starts tracing their powers of observation back through the family. Ren tells him to ask before showing a copy. Liang agrees and tries their name once more, this time without the family tree.",
            "narration": {
              "personal": "You stay while Ren gets Liang to say “Ren’s map.” He says it, warmly, then starts tracing their powers of observation back through the family. Ren tells him to ask before showing a copy. Liang agrees and tries their name once more, this time without the family tree.",
              "public": "{{actor}} hears Ren set the map’s attribution and copying limits with Liang. Liang agrees to ask before any display.",
              "npc": "{{actor}} hears Ren set the map’s attribution and copying limits with Liang. Liang agrees to ask before any display."
            },
            "response": {
              "speakerId": "glass_ren",
              "speech": "He is proud of me. Occasionally he takes the scenic route to saying it.",
              "activity": "Opens the fold with their name and holds it where Liang can see.",
              "emotion": "proud",
              "gesture": "point"
            },
            "signals": [
              "after_timetable_map_credit"
            ],
            "time": 1
          },
          {
            "id": "pocket_only",
            "label": "Let the map remain something Ren keeps for themself",
            "outcome": "You accept Ren’s wish to keep the map in their pocket. Liang says he merely thought it was very good. Ren thanks him. There is a pleasant little silence before he remembers another thing he meant to admire.",
            "narration": {
              "personal": "You accept Ren’s wish to keep the map in their pocket. Liang says he merely thought it was very good. Ren thanks him. There is a pleasant little silence before he remembers another thing he meant to admire.",
              "public": "{{actor}} accepts Ren’s decision to keep the map private. Ren pockets it after Liang’s compliment.",
              "npc": "{{actor}} accepts Ren’s decision to keep the map private. Ren pockets it after Liang’s compliment."
            },
            "response": {
              "speakerId": "glass_ren",
              "speech": "That was nice while it lasted.",
              "activity": "Pats the pocket containing the map and gives Liang a small smile.",
              "emotion": "attentive",
              "gesture": "pause"
            },
            "signals": [
              "after_timetable_pocket_only"
            ],
            "time": 0
          }
        ]
      }
    ]
  },
  {
    "storyId": "portrait",
    "sourceStoryId": "timetable",
    "sourceSignals": [
      "later_connection",
      "early_departure",
      "plain_connection",
      "platform_group",
      "after_timetable_read_map",
      "after_timetable_hear_bench",
      "after_timetable_keep_directions",
      "after_timetable_literal_shelter",
      "after_timetable_keep_story",
      "after_timetable_map_question",
      "after_timetable_no_legend_vote",
      "after_timetable_map_credit",
      "after_timetable_pocket_only"
    ],
    "stages": [
      {
        "id": "viewpoint",
        "title": "An excellent empty chair",
        "prompt": "Ren’s map has given Liang ideas about the family’s eye for detail. At Mei’s public sketch table, he stands beside the good chair and describes how naturally he sits in it. Jian is there with his own page; Liang has so far supplied enough advice for everyone.",
        "choices": [
          {
            "id": "draw_chair",
            "label": "Draw the chair while Liang is busy describing himself",
            "outcome": "You draw the empty chair during the open sketch session. Liang explains where his arm usually goes and how he turns toward the light. Then he realizes you have nearly finished without him. He compliments one chair leg in the tone of a man being gracious to his replacement.",
            "narration": {
              "personal": "You draw the empty chair during the open sketch session. Liang explains where his arm usually goes and how he turns toward the light. Then he realizes you have nearly finished without him. He compliments one chair leg in the tone of a man being gracious to his replacement.",
              "public": "{{actor}} draws the empty chair at Mei’s public sketch table. Liang looks at the chair without sitting for a new portrait.",
              "npc": "{{actor}} draws the empty chair at Mei’s public sketch table. Liang looks at the chair without sitting for a new portrait."
            },
            "response": {
              "speakerId": "liang_chen",
              "speech": "That is a very good chair. It has had a great deal of experience.",
              "activity": "Rests a hand on the chair back, then moves it when it enters your view.",
              "emotion": "warm",
              "gesture": "point"
            },
            "signals": [
              "after_portrait_draw_chair"
            ],
            "time": 1,
            "sourceSignalsAny": [
              "platform_group",
              "after_timetable_keep_story",
              "after_timetable_map_credit"
            ]
          },
          {
            "id": "draw_self",
            "label": "Try a self-portrait under Liang’s expert gaze",
            "outcome": "You draw your own face at Mei’s supervised table. Liang studies the uneven eyebrows and offers a correction. You leave them. He takes a step back, then another, apparently searching for a distance at which you will come round to his opinion.",
            "narration": {
              "personal": "You draw your own face at Mei’s supervised table. Liang studies the uneven eyebrows and offers a correction. You leave them. He takes a step back, then another, apparently searching for a distance at which you will come round to his opinion.",
              "public": "{{actor}} draws a rough self-portrait at Mei’s public sketch table. Liang looks at the completed page without making changes.",
              "npc": "{{actor}} draws a rough self-portrait at Mei’s public sketch table. Liang looks at the completed page without making changes."
            },
            "response": {
              "speakerId": "liang_chen",
              "speech": "From here it is quite lively. From here is probably best.",
              "activity": "Tilts his head to match the slant of the drawn eyebrows.",
              "emotion": "warm",
              "gesture": "point"
            },
            "signals": [
              "after_portrait_draw_self"
            ],
            "time": 1,
            "sourceSignalsNone": [
              "platform_group",
              "after_timetable_keep_story",
              "after_timetable_map_credit"
            ]
          },
          {
            "id": "look_only",
            "label": "Enjoy the sketch table from the spectators’ side",
            "outcome": "You visit without requesting a picture. Liang explains the difficult business of sitting still, moving steadily throughout the explanation. Mei asks him to stop circling the table. He says he was demonstrating the contrast.",
            "narration": {
              "personal": "You visit without requesting a picture. Liang explains the difficult business of sitting still, moving steadily throughout the explanation. Mei asks him to stop circling the table. He says he was demonstrating the contrast.",
              "public": "{{actor}} visits Mei’s public sketch table without requesting a drawing. Liang talks with the adult host.",
              "npc": "{{actor}} visits Mei’s public sketch table without requesting a drawing. Liang talks with the adult host."
            },
            "response": {
              "speakerId": "liang_chen",
              "speech": "Stillness is harder than it looks. I have never claimed otherwise.",
              "activity": "Stops beside the empty chair with one hand still raised.",
              "emotion": "attentive",
              "gesture": "pause"
            },
            "signals": [
              "after_portrait_look_only"
            ],
            "time": 0
          }
        ]
      },
      {
        "id": "caption",
        "title": "The consultant’s pencil",
        "prompt": "Liang has found a pencil but has yet to draw a line. He is nevertheless considering the phrase “with advice” beneath other people’s work. Mei asks whether holding the pencil is his contribution.",
        "choices": [
          {
            "id": "chair_caption",
            "label": "Credit yourself for the chair and Liang for the running commentary",
            "outcome": "You name yourself as the chair’s artist and Liang as its commentator. He wants to know whether commentator usually goes below the artist or beside. You show him how large the caption would become. He finally laughs at a label that threatens to need its own chair.",
            "narration": {
              "personal": "You name yourself as the chair’s artist and Liang as its commentator. He wants to know whether commentator usually goes below the artist or beside. You show him how large the caption would become. He finally laughs at a label that threatens to need its own chair.",
              "public": "{{actor}} and Liang discuss attribution for a drawing. Liang agrees not to describe his comments as drawing work.",
              "npc": "{{actor}} and Liang discuss attribution for a drawing. Liang agrees not to describe his comments as drawing work."
            },
            "response": {
              "speakerId": "liang_chen",
              "speech": "I suppose the commentary was more extensive than the drawing. That is not your fault.",
              "activity": "Holds the pencil across the proposed caption to measure its absurd length.",
              "emotion": "warm",
              "gesture": "point"
            },
            "signals": [
              "after_portrait_chair_caption"
            ],
            "time": 1,
            "afterChoices": [
              "draw_chair"
            ]
          },
          {
            "id": "own_eyebrows",
            "label": "Keep the eyebrows that annoy him",
            "outcome": "You keep your self-portrait and point out that recognizing a face does not make him its artist. Liang withdraws “with advice,” but takes one last look at the eyebrows. He confesses that the crooked one gives the face some character. You leave the other crooked one as well.",
            "narration": {
              "personal": "You keep your self-portrait and point out that recognizing a face does not make him its artist. Liang withdraws “with advice,” but takes one last look at the eyebrows. He confesses that the crooked one gives the face some character. You leave the other crooked one as well.",
              "public": "{{actor}} leaves a self-portrait unchanged. Liang withdraws his suggested advisory credit.",
              "npc": "{{actor}} leaves a self-portrait unchanged. Liang withdraws his suggested advisory credit."
            },
            "response": {
              "speakerId": "liang_chen",
              "speech": "Both? You are a person of very firm artistic convictions.",
              "activity": "Sets the unused pencil down parallel to the edge of your page.",
              "emotion": "warm",
              "gesture": "point"
            },
            "signals": [
              "after_portrait_own_eyebrows"
            ],
            "time": 1,
            "afterChoices": [
              "draw_self"
            ]
          },
          {
            "id": "visitor_credit",
            "label": "Persuade Liang to enjoy the view from the cheap seats",
            "outcome": "You join Liang as a visitor and ask him to leave the table to Mei. For a minute he looks bereft of a useful function. Then somebody at the table laughs, and he leans toward you to share what he noticed instead of announcing it to the room.",
            "narration": {
              "personal": "You join Liang as a visitor and ask him to leave the table to Mei. For a minute he looks bereft of a useful function. Then somebody at the table laughs, and he leans toward you to share what he noticed instead of announcing it to the room.",
              "public": "{{actor}} asks Liang to leave hosting to Mei. Liang remains a visitor at the supervised public table.",
              "npc": "{{actor}} asks Liang to leave hosting to Mei. Liang remains a visitor at the supervised public table."
            },
            "response": {
              "speakerId": "liang_chen",
              "speech": "I can see perfectly well from here. They may not need quite so much of my voice.",
              "activity": "Steps beside you, still holding the pencil he never used.",
              "emotion": "warm",
              "gesture": "point"
            },
            "signals": [
              "after_portrait_visitor_credit"
            ],
            "time": 1,
            "afterChoices": [
              "look_only"
            ]
          },
          {
            "id": "no_caption",
            "label": "Leave before the caption grows a committee",
            "outcome": "You decline the display discussion. Liang describes the exhibition that might have resulted, including a small opening speech. Mei points toward the people drawing in front of him. He looks genuinely surprised that the afternoon has carried on without an opening speech.",
            "narration": {
              "personal": "You decline the display discussion. Liang describes the exhibition that might have resulted, including a small opening speech. Mei points toward the people drawing in front of him. He looks genuinely surprised that the afternoon has carried on without an opening speech.",
              "public": "{{actor}} declines a new display. Mei continues the public sketch activity.",
              "npc": "{{actor}} declines a new display. Mei continues the public sketch activity."
            },
            "response": {
              "speakerId": "liang_chen",
              "speech": "Yes, I can see they have begun. Very informal of them.",
              "activity": "Lays the pencil across the blank label space.",
              "emotion": "attentive",
              "gesture": "pause"
            },
            "signals": [
              "after_portrait_no_caption"
            ],
            "time": 0
          }
        ]
      },
      {
        "id": "showing",
        "title": "The shortest opening speech",
        "prompt": "Mei offers space for a participant’s page on the public table. Liang clears his throat. She looks at him. He says he was only clearing his throat, then has to clear it again because the explanation caught.",
        "choices": [
          {
            "id": "share_chair",
            "label": "Show your chair drawing and let people find it themselves",
            "outcome": "You let Mei show your credited chair drawing. Liang stands aside. Someone looks from the page to the empty chair, and he smiles before remembering that he is not in either picture. He settles for pointing out how well you caught the light.",
            "narration": {
              "personal": "You let Mei show your credited chair drawing. Liang stands aside. Someone looks from the page to the empty chair, and he smiles before remembering that he is not in either picture. He settles for pointing out how well you caught the light.",
              "public": "{{actor}} permits Mei to show their chair drawing with artist credit. Liang lets visitors look without an introduction.",
              "npc": "{{actor}} permits Mei to show their chair drawing with artist credit. Liang lets visitors look without an introduction."
            },
            "response": {
              "speakerId": "liang_chen",
              "speech": "I would have hidden most of that chair. You made the correct decision.",
              "activity": "Moves half a step aside to stop casting a shadow across the drawing.",
              "emotion": "proud",
              "gesture": "point"
            },
            "signals": [
              "after_portrait_share_chair"
            ],
            "time": 1,
            "afterChoices": [
              "draw_chair"
            ]
          },
          {
            "id": "share_self",
            "label": "Show the self-portrait with every eyebrow intact",
            "outcome": "You let Mei show your self-portrait with your name. Liang looks at the eyebrows, then finds a detail near the mouth that he likes. He tells you, stops, and seems almost pleased by the effort that took.",
            "narration": {
              "personal": "You let Mei show your self-portrait with your name. Liang looks at the eyebrows, then finds a detail near the mouth that he likes. He tells you, stops, and seems almost pleased by the effort that took.",
              "public": "{{actor}} permits Mei to show their self-portrait with artist credit. Liang offers one compliment and leaves the page unchanged.",
              "npc": "{{actor}} permits Mei to show their self-portrait with artist credit. Liang offers one compliment and leaves the page unchanged."
            },
            "response": {
              "speakerId": "liang_chen",
              "speech": "The mouth is good. I am leaving it at good. There is an accomplishment for both of us.",
              "activity": "Keeps his hands behind his back while pointing with his chin.",
              "emotion": "warm",
              "gesture": "point"
            },
            "signals": [
              "after_portrait_share_self"
            ],
            "time": 1,
            "afterChoices": [
              "draw_self"
            ]
          },
          {
            "id": "visit_qiao",
            "label": "Ask Liang how he wants his next visit to Qiao to feel",
            "outcome": "You have come to look rather than draw, and you ask Liang about visiting Qiao. He says he used to know useful things to tell her. You suggest starting with her weekend. He tries the question, starts to add advice, and stops. For a moment he looks old and hopeful instead of authoritative.",
            "narration": {
              "personal": "You have come to look rather than draw, and you ask Liang about visiting Qiao. He says he used to know useful things to tell her. You suggest starting with her weekend. He tries the question, starts to add advice, and stops. For a moment he looks old and hopeful instead of authoritative.",
              "public": "{{actor}} and Liang have a quiet conversation beside the public table. Mei continues hosting the sketch activity.",
              "npc": "{{actor}} and Liang have a quiet conversation beside the public table. Mei continues hosting the sketch activity."
            },
            "response": {
              "speakerId": "liang_chen",
              "speech": "I would like her to be glad I came before she knows why.",
              "activity": "Rolls the unused pencil once between his palms and sets it down.",
              "emotion": "warm",
              "gesture": "point"
            },
            "signals": [
              "after_portrait_visit_qiao"
            ],
            "time": 1,
            "afterChoices": [
              "look_only"
            ]
          },
          {
            "id": "keep_page",
            "label": "Keep your afternoon out of the display",
            "outcome": "You decline the display. Mei moves on easily. Liang takes a little longer, then says he enjoyed the company. You wait for an improvement he wants to suggest. It does not arrive.",
            "narration": {
              "personal": "You decline the display. Mei moves on easily. Liang takes a little longer, then says he enjoyed the company. You wait for an improvement he wants to suggest. It does not arrive.",
              "public": "{{actor}} declines a new display. Mei leaves the public table to participants who choose to share.",
              "npc": "{{actor}} declines a new display. Mei leaves the public table to participants who choose to share."
            },
            "response": {
              "speakerId": "liang_chen",
              "speech": "It was good to have you here. I nearly made that much more complicated.",
              "activity": "Pushes the empty label space away and looks up at you.",
              "emotion": "attentive",
              "gesture": "pause"
            },
            "signals": [
              "after_portrait_keep_page"
            ],
            "time": 0
          }
        ]
      }
    ]
  },
  {
    "storyId": "six_chairs",
    "sourceStoryId": "nine_locks",
    "sourceSignals": [
      "demo_clear",
      "game_table",
      "game_done",
      "demo_finished",
      "rules_display",
      "after_nine_locks_read_position",
      "after_nine_locks_worked_example",
      "after_nine_locks_no_practice",
      "after_nine_locks_anonymous_example",
      "after_nine_locks_name_the_hint",
      "after_nine_locks_designer_example",
      "after_nine_locks_private_practice",
      "after_nine_locks_new_unscored",
      "after_nine_locks_no_revision_round"
    ],
    "stages": [
      {
        "id": "recommendation",
        "title": "The unnamed funerals",
        "prompt": "Sami’s game explanation has inspired Inés to prove she can recommend a film without spoiling it. She has removed every character name from her sentence. Ada notices that several funerals have survived the edit.",
        "choices": [
          {
            "id": "read_sentence",
            "label": "Read Inés’s suspiciously eventful recommendation aloud",
            "outcome": "You read the sentence aloud and reach the funeral count. Inés says no one knows whose funerals they are. Ada says an audience may still begin counting the living. Inés crosses out the number so vigorously that the envelope nearly acquires a window.",
            "narration": {
              "personal": "You read the sentence aloud and reach the funeral count. Inés says no one knows whose funerals they are. Ada says an audience may still begin counting the living. Inés crosses out the number so vigorously that the envelope nearly acquires a window.",
              "public": "{{actor}} reads Inés’s recommendation aloud. Inés removes a revealing plot detail from it.",
              "npc": "{{actor}} reads Inés’s recommendation aloud. Inés removes a revealing plot detail from it."
            },
            "response": {
              "speakerId": "ines_valdes",
              "speech": "I have withheld all identities. Apparently arithmetic is also a spoiler now.",
              "activity": "Presses the crossed-out number flat with her thumb.",
              "emotion": "warm",
              "gesture": "point"
            },
            "signals": [
              "after_six_chairs_read_sentence"
            ],
            "time": 1,
            "sourceSignalsAny": [
              "rules_display",
              "game_table",
              "after_nine_locks_worked_example",
              "after_nine_locks_anonymous_example"
            ]
          },
          {
            "id": "one_feeling",
            "label": "Ask what she liked before anybody dies in the explanation",
            "outcome": "You ask what she enjoyed. Inés describes a silence in which everyone in the room seemed to catch their breath together. Ada looks at the long sentence on her envelope. Inés folds it over and says the silence was handled by professionals.",
            "narration": {
              "personal": "You ask what she enjoyed. Inés describes a silence in which everyone in the room seemed to catch their breath together. Ada looks at the long sentence on her envelope. Inés folds it over and says the silence was handled by professionals.",
              "public": "{{actor}} asks Inés what she enjoyed about a film. Inés describes a silence without revealing the plot.",
              "npc": "{{actor}} asks Inés what she enjoyed about a film. Inés describes a silence without revealing the plot."
            },
            "response": {
              "speakerId": "ines_valdes",
              "speech": "You could hear people waiting. It was wonderful. Naturally I want to explain it.",
              "activity": "Leaves the envelope folded, with her thumb over the dangerous sentence.",
              "emotion": "warm",
              "gesture": "point"
            },
            "signals": [
              "after_six_chairs_one_feeling"
            ],
            "time": 1,
            "sourceSignalsNone": [
              "rules_display",
              "game_table",
              "after_nine_locks_worked_example",
              "after_nine_locks_anonymous_example"
            ]
          },
          {
            "id": "choose_unbriefed",
            "label": "Take your chances with the title",
            "outcome": "You decline the briefing. Inés puts the envelope away as though it contains a vital cure you have refused. Then she asks which title caught your eye. Ada warns her that the question is beginning to sound like the briefing in disguise.",
            "narration": {
              "personal": "You decline the briefing. Inés puts the envelope away as though it contains a vital cure you have refused. Then she asks which title caught your eye. Ada warns her that the question is beginning to sound like the briefing in disguise.",
              "public": "{{actor}} declines a film briefing. Inés puts her recommendation away.",
              "npc": "{{actor}} declines a film briefing. Inés puts her recommendation away."
            },
            "response": {
              "speakerId": "ines_valdes",
              "speech": "I am being curious. Ada has become very suspicious of curiosity.",
              "activity": "Slips the envelope into her bag, then keeps her hand on it.",
              "emotion": "attentive",
              "gesture": "pause"
            },
            "signals": [
              "after_six_chairs_choose_unbriefed"
            ],
            "time": 0
          }
        ]
      },
      {
        "id": "critic",
        "title": "The review inside the review",
        "prompt": "Inés is calling your conversation “a remarkably perceptive response.” Ada asks what you said. Inés gives such an admiring account of her own explanation that the response becomes difficult to locate.",
        "choices": [
          {
            "id": "credit_edit",
            "label": "Remind her that counting spoilers was not a rave",
            "outcome": "You remind Inés that you spotted the funeral count; you did not review the film. She removes your endorsement. Ada asks whether the correction deserves a thank-you. Inés says she had hoped to convey her gratitude by making you sound brilliant.",
            "narration": {
              "personal": "You remind Inés that you spotted the funeral count; you did not review the film. She removes your endorsement. Ada asks whether the correction deserves a thank-you. Inés says she had hoped to convey her gratitude by making you sound brilliant.",
              "public": "{{actor}} asks Inés not to use a correction as an endorsement. Inés removes the attribution from her recommendation.",
              "npc": "{{actor}} asks Inés not to use a correction as an endorsement. Inés removes the attribution from her recommendation."
            },
            "response": {
              "speakerId": "ines_valdes",
              "speech": "I made you a critic. You are returning the position with unusual speed.",
              "activity": "Draws a line through the attribution, leaving her own enthusiastic sentence intact.",
              "emotion": "warm",
              "gesture": "point"
            },
            "signals": [
              "after_six_chairs_credit_edit"
            ],
            "time": 1,
            "afterChoices": [
              "read_sentence"
            ]
          },
          {
            "id": "credit_silence",
            "label": "Let her repeat your short point about leaving room to listen",
            "outcome": "You let Inés repeat your point in the words you used. She says them to Ada and waits. Ada nods. Inés nearly explains the nod, catches herself, and takes a deeply theatrical sip of nothing from a cup she has not filled.",
            "narration": {
              "personal": "You let Inés repeat your point in the words you used. She says them to Ada and waits. Ada nods. Inés nearly explains the nod, catches herself, and takes a deeply theatrical sip of nothing from a cup she has not filled.",
              "public": "{{actor}} permits one specific comment about listening to be repeated. Inés uses the agreed wording without adding a film endorsement.",
              "npc": "{{actor}} permits one specific comment about listening to be repeated. Inés uses the agreed wording without adding a film endorsement."
            },
            "response": {
              "speakerId": "ines_valdes",
              "speech": "There. People can absorb a sentence. It is a surprisingly slow sensation.",
              "activity": "Lowers the empty cup after discovering there is nothing in it.",
              "emotion": "warm",
              "gesture": "point"
            },
            "signals": [
              "after_six_chairs_credit_silence"
            ],
            "time": 1,
            "afterChoices": [
              "one_feeling"
            ]
          },
          {
            "id": "credit_absence",
            "label": "Tell her you were skipping the briefing, not making a statement",
            "outcome": "You explain that declining the briefing was not a subtle review. Inés looks disappointed: she had given you such an interesting motive. She removes the attribution and admits she sometimes wants a lively room enough to populate it with opinions nobody has expressed.",
            "narration": {
              "personal": "You explain that declining the briefing was not a subtle review. Inés looks disappointed: she had given you such an interesting motive. She removes the attribution and admits she sometimes wants a lively room enough to populate it with opinions nobody has expressed.",
              "public": "{{actor}} clarifies that declining a briefing was not a review. Inés withdraws the proposed attribution.",
              "npc": "{{actor}} clarifies that declining a briefing was not a review. Inés withdraws the proposed attribution."
            },
            "response": {
              "speakerId": "ines_valdes",
              "speech": "You were just deciding what to watch. I gave you a much better role.",
              "activity": "Leaves the quotation space empty and looks toward the cinema seats.",
              "emotion": "warm",
              "gesture": "point"
            },
            "signals": [
              "after_six_chairs_credit_absence"
            ],
            "time": 1,
            "afterChoices": [
              "choose_unbriefed"
            ]
          },
          {
            "id": "no_quotation",
            "label": "Let Inés put her own name under the enthusiasm",
            "outcome": "You decline a quotation. Inés signs her own recommendation. Ada observes that it now sounds much more like her. Inés is pleased until Ada mentions that the word “essential” appears twice. She keeps it twice.",
            "narration": {
              "personal": "You decline a quotation. Inés signs her own recommendation. Ada observes that it now sounds much more like her. Inés is pleased until Ada mentions that the word “essential” appears twice. She keeps it twice.",
              "public": "{{actor}} declines an attributed quotation. Inés signs her own recommendation.",
              "npc": "{{actor}} declines an attributed quotation. Inés signs her own recommendation."
            },
            "response": {
              "speakerId": "ines_valdes",
              "speech": "One is for the film. One is for seeing the film. Quite different urgencies.",
              "activity": "Signs with a flourish large enough to crowd the last line.",
              "emotion": "attentive",
              "gesture": "pause"
            },
            "signals": [
              "after_six_chairs_no_quotation"
            ],
            "time": 0
          }
        ]
      },
      {
        "id": "taste",
        "title": "The other title",
        "prompt": "Ada opens the programme. Inés has made her favorite sound like an urgent personal matter, but another title catches your eye. She notices and asks what interests you, with the fixed smile of someone whose cake has just been passed over.",
        "choices": [
          {
            "id": "different_film",
            "label": "Buy an $18 seat for the film that interests you",
            "outcome": "You buy an ordinary seat from Ada for your own choice. Inés asks what you see in it and, this time, waits for the answer. She looks at the title again. She may still hate it, but she seems newly curious about having somebody to argue with afterward.",
            "narration": {
              "personal": "You buy an ordinary seat from Ada for your own choice. Inés asks what you see in it and, this time, waits for the answer. She looks at the title again. She may still hate it, but she seems newly curious about having somebody to argue with afterward.",
              "public": "{{actor}} chooses a film from Ada’s programme. Inés asks about the choice and leaves her own attendance undecided.",
              "npc": "{{actor}} chooses a film from Ada’s programme. Inés asks about the choice and leaves her own attendance undecided."
            },
            "response": {
              "speakerId": "ines_valdes",
              "speech": "Tell me the attraction. I would like to object to the correct thing.",
              "activity": "Keeps one finger beside her favorite while looking at the title you chose.",
              "emotion": "warm",
              "gesture": "point"
            },
            "signals": [
              "after_six_chairs_different_film"
            ],
            "time": 1,
            "cost": 18
          },
          {
            "id": "no_next_film",
            "label": "Leave the next film undecided",
            "outcome": "You do not choose another screening. Ada closes the programme. Inés starts to say that people need something to look forward to, then says she is looking forward to her own film. She smooths the envelope and leaves it in her bag.",
            "narration": {
              "personal": "You do not choose another screening. Ada closes the programme. Inés starts to say that people need something to look forward to, then says she is looking forward to her own film. She smooths the envelope and leaves it in her bag.",
              "public": "{{actor}} declines to choose a further screening. Inés keeps her recommendation as her own preference.",
              "npc": "{{actor}} declines to choose a further screening. Inés keeps her recommendation as her own preference."
            },
            "response": {
              "speakerId": "ines_valdes",
              "speech": "I will enjoy mine. You needn’t rescue the spare chair.",
              "activity": "Lets the programme close without inserting a finger between the pages.",
              "emotion": "attentive",
              "gesture": "pause"
            },
            "signals": [
              "after_six_chairs_no_next_film"
            ],
            "time": 0
          }
        ]
      }
    ]
  },
  {
    "storyId": "first_shift",
    "sourceStoryId": "six_chairs",
    "sourceSignals": [
      "screening_on_time",
      "long_intro",
      "film_tea",
      "screening_open",
      "cinema_free",
      "tea_supply_quote",
      "poster_quote",
      "after_six_chairs_read_sentence",
      "after_six_chairs_one_feeling",
      "after_six_chairs_choose_unbriefed",
      "after_six_chairs_credit_edit",
      "after_six_chairs_credit_silence",
      "after_six_chairs_credit_absence",
      "after_six_chairs_no_quotation",
      "after_six_chairs_different_film",
      "after_six_chairs_no_next_film"
    ],
    "stages": [
      {
        "id": "first_bite",
        "title": "A review before breakfast",
        "prompt": "The cinema talk has reached Leila’s stall. Tomas is praising her Dock Folds with the authority of a lifelong expert, although he has yet to take a bite today. Leila wants to know whether a wrapper holds; he has started with their childhood.",
        "choices": [
          {
            "id": "taste_first",
            "label": "Buy an $18 Dock Fold and get a bite in before Tomas",
            "outcome": "You buy your own Dock Fold and taste it before the family review begins. Leila watches the wrapper. Tomas watches your expression. They ask different questions at the same time, then each insists the other is making it difficult to get useful feedback.",
            "narration": {
              "personal": "You buy your own Dock Fold and taste it before the family review begins. Leila watches the wrapper. Tomas watches your expression. They ask different questions at the same time, then each insists the other is making it difficult to get useful feedback.",
              "public": "{{actor}} tastes an ordinary Dock Fold before Tomas gives his opinion. Leila asks about the wrapper.",
              "npc": "{{actor}} tastes an ordinary Dock Fold before Tomas gives his opinion. Leila asks about the wrapper."
            },
            "response": {
              "speakerId": "saffron_leila",
              "speech": "Ignore his eyebrows. How is the corner holding?",
              "activity": "Points at the wrapper while Tomas silently demonstrates an approving face.",
              "emotion": "warm",
              "gesture": "point"
            },
            "signals": [
              "after_first_shift_taste_first"
            ],
            "time": 1,
            "cost": 18,
            "sourceSignalsAny": [
              "screening_on_time",
              "cinema_free",
              "after_six_chairs_one_feeling",
              "after_six_chairs_credit_silence",
              "after_six_chairs_different_film"
            ]
          },
          {
            "id": "hear_filling",
            "label": "Hear Leila’s filling explanation, then buy an $18 Dock Fold",
            "outcome": "You ask about the filling and buy your own Dock Fold. Leila explains how she makes it hold together on a moving boat. Tomas calls the explanation polished. She asks him to name one repair he has described in fewer than twelve minutes. Your first bite arrives during his search.",
            "narration": {
              "personal": "You ask about the filling and buy your own Dock Fold. Leila explains how she makes it hold together on a moving boat. Tomas calls the explanation polished. She asks him to name one repair he has described in fewer than twelve minutes. Your first bite arrives during his search.",
              "public": "{{actor}} asks Leila about a Dock Fold’s filling and then tastes one. Leila explains how she wraps it.",
              "npc": "{{actor}} asks Leila about a Dock Fold’s filling and then tastes one. Leila explains how she wraps it."
            },
            "response": {
              "speakerId": "saffron_leila",
              "speech": "He once explained a washer until my tea had a skin. This is the short version.",
              "activity": "Shows you the corner fold while keeping an amused eye on her brother.",
              "emotion": "warm",
              "gesture": "point"
            },
            "signals": [
              "after_first_shift_hear_filling"
            ],
            "time": 1,
            "cost": 18,
            "sourceSignalsNone": [
              "screening_on_time",
              "cinema_free",
              "after_six_chairs_one_feeling",
              "after_six_chairs_credit_silence",
              "after_six_chairs_different_film"
            ]
          },
          {
            "id": "no_tasting",
            "label": "Avoid becoming the family’s breakfast judge",
            "outcome": "You decline food and a verdict. Leila takes it easily. Tomas says he was not trying to influence you, then gives the approving nod he had apparently been saving for your first bite. There is nowhere useful for it to land.",
            "narration": {
              "personal": "You decline food and a verdict. Leila takes it easily. Tomas says he was not trying to influence you, then gives the approving nod he had apparently been saving for your first bite. There is nowhere useful for it to land.",
              "public": "{{actor}} declines the tasting conversation. Leila returns to the ordinary portions.",
              "npc": "{{actor}} declines the tasting conversation. Leila returns to the ordinary portions."
            },
            "response": {
              "speakerId": "saffron_leila",
              "speech": "Look at him. Applauding an empty hand.",
              "activity": "Sets the spatula down and glances at Tomas’s stranded nod.",
              "emotion": "attentive",
              "gesture": "pause"
            },
            "signals": [
              "after_first_shift_no_tasting"
            ],
            "time": 0
          }
        ]
      },
      {
        "id": "wrapper",
        "title": "The unsinkable lunch",
        "prompt": "Leila is trying out “Travels beautifully” for her stall. Tomas suggests “unsinkable.” She looks at the wrapper, then at him. He says people understand enthusiasm. She asks whether he would put it on a ferry.",
        "choices": [
          {
            "id": "specific_bite",
            "label": "Tell Leila exactly what survived your first bite",
            "outcome": "You remind Leila that one successful bite is the extent of your trial. She settles on describing the fold instead of claiming a miracle. Tomas withdraws “unsinkable,” then offers “remarkably buoyant” under his breath. Leila stares until he goes back to lunch.",
            "narration": {
              "personal": "You remind Leila that one successful bite is the extent of your trial. She settles on describing the fold instead of claiming a miracle. Tomas withdraws “unsinkable,” then offers “remarkably buoyant” under his breath. Leila stares until he goes back to lunch.",
              "public": "{{actor}} discusses one wrapper with Leila. Leila describes its folded design without attributing a universal endorsement.",
              "npc": "{{actor}} discusses one wrapper with Leila. Leila describes its folded design without attributing a universal endorsement."
            },
            "response": {
              "speakerId": "saffron_leila",
              "speech": "I sell people something to eat. I would prefer them to remain above the water with it.",
              "activity": "Presses the corner of an unused wrapper flat with one practical thumb.",
              "emotion": "warm",
              "gesture": "point"
            },
            "signals": [
              "after_first_shift_specific_bite"
            ],
            "time": 1,
            "afterChoices": [
              "taste_first"
            ]
          },
          {
            "id": "food_not_story",
            "label": "Tell her whether the filling earned its own praise",
            "outcome": "You separate what you liked eating from what you liked hearing. Leila looks pleased by the food verdict and mildly offended that the story did no extra work. Tomas asks whether his childhood introduction would have helped. She says it would have made the food cold.",
            "narration": {
              "personal": "You separate what you liked eating from what you liked hearing. Leila looks pleased by the food verdict and mildly offended that the story did no extra work. Tomas asks whether his childhood introduction would have helped. She says it would have made the food cold.",
              "public": "{{actor}} gives Leila specific food feedback. Leila keeps her own recipe explanation separate from the comment.",
              "npc": "{{actor}} gives Leila specific food feedback. Leila keeps her own recipe explanation separate from the comment."
            },
            "response": {
              "speakerId": "saffron_leila",
              "speech": "So it tastes good even without me explaining myself. That is almost rude.",
              "activity": "Moves the recipe note aside to give the wrapper its own patch of counter.",
              "emotion": "warm",
              "gesture": "point"
            },
            "signals": [
              "after_first_shift_food_not_story"
            ],
            "time": 1,
            "afterChoices": [
              "hear_filling"
            ]
          },
          {
            "id": "no_invented_review",
            "label": "Remind Leila you still have not tasted anything",
            "outcome": "You point out that you declined the tasting. Leila cannot use you as a satisfied customer. She writes her own description, while Tomas attempts to qualify through family loyalty. She asks when he last paid for the childhood story he keeps serving her.",
            "narration": {
              "personal": "You point out that you declined the tasting. Leila cannot use you as a satisfied customer. She writes her own description, while Tomas attempts to qualify through family loyalty. She asks when he last paid for the childhood story he keeps serving her.",
              "public": "{{actor}} declines to be cited as a customer. Leila uses her own description of the wrapper.",
              "npc": "{{actor}} declines to be cited as a customer. Leila uses her own description of the wrapper."
            },
            "response": {
              "speakerId": "saffron_leila",
              "speech": "Made here, folded here. No distinguished relatives required.",
              "activity": "Points first to the griddle and then to the wrapping space.",
              "emotion": "warm",
              "gesture": "point"
            },
            "signals": [
              "after_first_shift_no_invented_review"
            ],
            "time": 1,
            "afterChoices": [
              "no_tasting"
            ]
          },
          {
            "id": "no_stall_copy",
            "label": "Leave the slogan to the person doing the cooking",
            "outcome": "You decline to edit. Leila writes her own plain description. Tomas reads it and says it could have more lift. She tells him the boats provide the journey and the food need only stay in the wrapper. He seems sorry to lose the word unsinkable.",
            "narration": {
              "personal": "You decline to edit. Leila writes her own plain description. Tomas reads it and says it could have more lift. She tells him the boats provide the journey and the food need only stay in the wrapper. He seems sorry to lose the word unsinkable.",
              "public": "{{actor}} declines to edit the stall description. Leila writes her own wording without customer names.",
              "npc": "{{actor}} declines to edit the stall description. Leila writes her own wording without customer names."
            },
            "response": {
              "speakerId": "saffron_leila",
              "speech": "If he says “seaworthy,” I am sending him back to the engines.",
              "activity": "Turns the description toward herself before Tomas can improve it.",
              "emotion": "attentive",
              "gesture": "pause"
            },
            "signals": [
              "after_first_shift_no_stall_copy"
            ],
            "time": 0
          }
        ]
      },
      {
        "id": "family_vote",
        "title": "Bring nothing but an appetite",
        "prompt": "Tomas calls Leila the best cook in the family, then suggests she should choose every family meal. She asks whether the best mechanic should inspect every chair before sitting down. He checks the chair beneath him before he can help it.",
        "choices": [
          {
            "id": "praise_only",
            "label": "Help Leila take the compliment without taking the menu",
            "outcome": "You stay while Leila accepts the praise and rejects the permanent menu job. Tomas admits he would like one family visit without somebody imitating an engine noise at him. They begin imagining a meal where both can sit down. For once, neither offers to organize it.",
            "narration": {
              "personal": "You stay while Leila accepts the praise and rejects the permanent menu job. Tomas admits he would like one family visit without somebody imitating an engine noise at him. They begin imagining a meal where both can sit down. For once, neither offers to organize it.",
              "public": "{{actor}} joins Leila and Tomas in separating a compliment from future family duties. Both keep their next family visit free of work promises.",
              "npc": "{{actor}} joins Leila and Tomas in separating a compliment from future family duties. Both keep their next family visit free of work promises."
            },
            "response": {
              "speakerId": "saffron_leila",
              "speech": "We could talk about a film. Badly. As ordinary people.",
              "activity": "Sets down the spatula and leans against the counter beside her brother.",
              "emotion": "warm",
              "gesture": "point"
            },
            "signals": [
              "after_first_shift_praise_only"
            ],
            "time": 1
          },
          {
            "id": "no_family_vote",
            "label": "Leave the family rankings to the family",
            "outcome": "You decline to rank anybody. Leila asks Tomas whether he can say she is a good cook and stop. He manages it. She thanks him. Then he asks if that means she has an idea for supper, and she closes her eyes.",
            "narration": {
              "personal": "You decline to rank anybody. Leila asks Tomas whether he can say she is a good cook and stop. He manages it. She thanks him. Then he asks if that means she has an idea for supper, and she closes her eyes.",
              "public": "{{actor}} declines to rank the family’s cooking. Leila and Tomas continue their own conversation.",
              "npc": "{{actor}} declines to rank the family’s cooking. Leila and Tomas continue their own conversation."
            },
            "response": {
              "speakerId": "saffron_leila",
              "speech": "He was so close. You witnessed it.",
              "activity": "Waits with her eyes closed until Tomas starts laughing.",
              "emotion": "attentive",
              "gesture": "pause"
            },
            "signals": [
              "after_first_shift_no_family_vote"
            ],
            "time": 0
          }
        ]
      }
    ]
  },
  {
    "storyId": "closing_hours",
    "sourceStoryId": "first_shift",
    "sourceSignals": [
      "folds_cinema",
      "folds_crew",
      "folds_normal",
      "repair_later",
      "collection_staffed",
      "folds_listening",
      "after_first_shift_taste_first",
      "after_first_shift_hear_filling",
      "after_first_shift_no_tasting",
      "after_first_shift_specific_bite",
      "after_first_shift_food_not_story",
      "after_first_shift_no_invented_review",
      "after_first_shift_no_stall_copy",
      "after_first_shift_praise_only",
      "after_first_shift_no_family_vote"
    ],
    "stages": [
      {
        "id": "cloth",
        "title": "The shimmer problem",
        "prompt": "After hearing the argument about Leila’s admirers, Farah has decided customers should simply choose what they like. She lays out shimmering cloth and plain cloth. One gets the good patch of light. The other is apparently expected to succeed on character.",
        "choices": [
          {
            "id": "shimmer_remnant",
            "label": "Buy the $24 shimmering remnant for yourself",
            "outcome": "You choose the small shimmering remnant. Farah wraps it with the satisfaction of a retailer whose instincts have been vindicated. Then she compares the tiny parcel with the cloth still on the shelf. She calls it the beginning of a trend and turns the parcel so it catches the light again.",
            "narration": {
              "personal": "You choose the small shimmering remnant. Farah wraps it with the satisfaction of a retailer whose instincts have been vindicated. Then she compares the tiny parcel with the cloth still on the shelf. She calls it the beginning of a trend and turns the parcel so it catches the light again.",
              "public": "{{actor}} chooses the shimmering remnant. Farah wraps that piece and leaves the rest of the decorative cloth on its shelf.",
              "npc": "{{actor}} chooses the shimmering remnant. Farah wraps that piece and leaves the rest of the decorative cloth on its shelf."
            },
            "response": {
              "speakerId": "farah_hussain",
              "speech": "A very small revival. We are building gradually.",
              "activity": "Holds the little parcel beside the much larger decorative stock, then lowers it.",
              "emotion": "warm",
              "gesture": "point"
            },
            "signals": [
              "after_closing_hours_shimmer_remnant"
            ],
            "time": 1,
            "cost": 24,
            "sourceSignalsAny": [
              "folds_cinema",
              "folds_listening",
              "after_first_shift_specific_bite",
              "after_first_shift_food_not_story",
              "after_first_shift_praise_only"
            ]
          },
          {
            "id": "plain_cloth",
            "label": "Choose $12 of plain cloth after comparing the two",
            "outcome": "You compare both and buy the plain cloth. Farah praises your practicality while wrapping it with extraordinary speed. She says the shimmering piece would make a beautiful accent. You wait. She adds that she is speaking generally, to the room.",
            "narration": {
              "personal": "You compare both and buy the plain cloth. Farah praises your practicality while wrapping it with extraordinary speed. She says the shimmering piece would make a beautiful accent. You wait. She adds that she is speaking generally, to the room.",
              "public": "{{actor}} compares two fabrics and chooses plain cloth. Farah cuts and wraps the chosen piece.",
              "npc": "{{actor}} compares two fabrics and chooses plain cloth. Farah cuts and wraps the chosen piece."
            },
            "response": {
              "speakerId": "farah_hussain",
              "speech": "Plain cloth. Dependable, useful, never tells you a thing about your taste.",
              "activity": "Sets your plain parcel neatly beyond the shimmering cloth’s reach.",
              "emotion": "warm",
              "gesture": "point"
            },
            "signals": [
              "after_closing_hours_plain_cloth"
            ],
            "time": 1,
            "cost": 12,
            "sourceSignalsNone": [
              "folds_cinema",
              "folds_listening",
              "after_first_shift_specific_bite",
              "after_first_shift_food_not_story",
              "after_first_shift_praise_only"
            ]
          },
          {
            "id": "admire_only",
            "label": "Admire the shimmer and leave it on the shelf",
            "outcome": "You look without buying. Farah asks whether “striking” was praise. She accepts your visit as a visit, then smooths the cloth again. The shimmer catches her eye and she smiles at it before remembering to look commercially disappointed.",
            "narration": {
              "personal": "You look without buying. Farah asks whether “striking” was praise. She accepts your visit as a visit, then smooths the cloth again. The shimmer catches her eye and she smiles at it before remembering to look commercially disappointed.",
              "public": "{{actor}} looks at the decorative cloth without selecting any. Farah returns it to the shelf.",
              "npc": "{{actor}} looks at the decorative cloth without selecting any. Farah returns it to the shelf."
            },
            "response": {
              "speakerId": "farah_hussain",
              "speech": "I liked it before anyone came in. That is the part making this difficult.",
              "activity": "Smooths the decorative cloth and tilts it toward the light once more.",
              "emotion": "attentive",
              "gesture": "pause"
            },
            "signals": [
              "after_closing_hours_admire_only"
            ],
            "time": 0
          }
        ]
      },
      {
        "id": "window",
        "title": "Popular demand, singular",
        "prompt": "Farah tries a window card reading “By popular demand.” Sami looks around the shop. Farah tells him a trend has to start somewhere. He asks whether it has started or whether she is reserving its place.",
        "choices": [
          {
            "id": "one_customer",
            "label": "Remind Farah how small your parcel was",
            "outcome": "You remind Farah that you bought one remnant. She holds up two fingers to indicate its modest width, looks at “popular demand,” and changes the card to “decorative remnants.” Sami suggests adding “some extremely popular.” She tells him he has inherited the wrong part of her wit.",
            "narration": {
              "personal": "You remind Farah that you bought one remnant. She holds up two fingers to indicate its modest width, looks at “popular demand,” and changes the card to “decorative remnants.” Sami suggests adding “some extremely popular.” She tells him he has inherited the wrong part of her wit.",
              "public": "{{actor}} discusses the window wording with Farah. She labels the actual decorative stock without claiming popular demand.",
              "npc": "{{actor}} discusses the window wording with Farah. She labels the actual decorative stock without claiming popular demand."
            },
            "response": {
              "speakerId": "farah_hussain",
              "speech": "The parcel was small. Your enthusiasm was also small. I may have added them incorrectly.",
              "activity": "Turns the card over and writes a description that fits the shelf.",
              "emotion": "warm",
              "gesture": "point"
            },
            "signals": [
              "after_closing_hours_one_customer"
            ],
            "time": 1,
            "afterChoices": [
              "shimmer_remnant"
            ]
          },
          {
            "id": "plain_evidence",
            "label": "Point to the plain cloth you actually chose",
            "outcome": "You remind Farah that your parcel contains plain cloth. She moves the practical stock forward, muttering that successful things always want the dullest shelf. The shimmer stays in the window, where she turns it just enough to catch the light on her way back.",
            "narration": {
              "personal": "You remind Farah that your parcel contains plain cloth. She moves the practical stock forward, muttering that successful things always want the dullest shelf. The shimmer stays in the window, where she turns it just enough to catch the light on her way back.",
              "public": "{{actor}} and Farah compare the fabrics. Farah brings the plain stock forward and leaves the decorative display intact.",
              "npc": "{{actor}} and Farah compare the fabrics. Farah brings the plain stock forward and leaves the decorative display intact."
            },
            "response": {
              "speakerId": "farah_hussain",
              "speech": "The plain cloth pays attention to the business. Somebody here has to.",
              "activity": "Brings the plain stock within easy reach, then adjusts one decorative corner.",
              "emotion": "warm",
              "gesture": "point"
            },
            "signals": [
              "after_closing_hours_plain_evidence"
            ],
            "time": 1,
            "afterChoices": [
              "plain_cloth"
            ]
          },
          {
            "id": "visit_not_demand",
            "label": "Ask whether she simply wants to keep the shimmer",
            "outcome": "You make clear that you placed no order and ask whether Farah likes having the cloth there. She admits that she does. Sami says she can write “cloth my mother likes.” Farah chooses a descriptive card instead and tells him to go sell a tile he personally admires.",
            "narration": {
              "personal": "You make clear that you placed no order and ask whether Farah likes having the cloth there. She admits that she does. Sami says she can write “cloth my mother likes.” Farah chooses a descriptive card instead and tells him to go sell a tile he personally admires.",
              "public": "{{actor}} clarifies that no cloth was ordered. Farah uses a descriptive window card without a demand claim.",
              "npc": "{{actor}} clarifies that no cloth was ordered. Farah uses a descriptive window card without a demand claim."
            },
            "response": {
              "speakerId": "farah_hussain",
              "speech": "I can like it quietly. He insists on making it a family announcement.",
              "activity": "Places the new card below the shimmer and squares it against the window edge.",
              "emotion": "warm",
              "gesture": "point"
            },
            "signals": [
              "after_closing_hours_visit_not_demand"
            ],
            "time": 1,
            "afterChoices": [
              "admire_only"
            ]
          },
          {
            "id": "no_window_quote",
            "label": "Keep your name out of the window campaign",
            "outcome": "You decline a quotation. Sami declines one before anyone asks him. Farah looks from one of you to the other and calls the morning exceptionally uncommercial. She leaves the names off the card and gives the cloth one last chance to dazzle you on its own.",
            "narration": {
              "personal": "You decline a quotation. Sami declines one before anyone asks him. Farah looks from one of you to the other and calls the morning exceptionally uncommercial. She leaves the names off the card and gives the cloth one last chance to dazzle you on its own.",
              "public": "{{actor}} declines a window quotation. Farah leaves customer names off the card.",
              "npc": "{{actor}} declines a window quotation. Farah leaves customer names off the card."
            },
            "response": {
              "speakerId": "farah_hussain",
              "speech": "So many opinions. Such a poor supply of customers.",
              "activity": "Moves the unsigned card a little lower so more of the shimmering cloth shows.",
              "emotion": "attentive",
              "gesture": "pause"
            },
            "signals": [
              "after_closing_hours_no_window_quote"
            ],
            "time": 0
          }
        ]
      },
      {
        "id": "spoiler",
        "title": "An idiot she has known for years",
        "prompt": "Farah says the radio drama has become ridiculous. Sami asks why she keeps listening. She begins defending a character she was furious with a moment ago. The explanation is approaching the episode’s dangerous part.",
        "choices": [
          {
            "id": "feeling_no_twist",
            "label": "Ask why she still cares about the character",
            "outcome": "You ask what keeps Farah listening. She talks about a character who tries to sound braver than they feel, and how she waits for them to get something right. Sami stops teasing. Farah notices the room has become sympathetic and briskly adds that the writing is still appalling.",
            "narration": {
              "personal": "You ask what keeps Farah listening. She talks about a character who tries to sound braver than they feel, and how she waits for them to get something right. Sami stops teasing. Farah notices the room has become sympathetic and briskly adds that the writing is still appalling.",
              "public": "{{actor}} asks Farah about her reaction to a drama. Farah describes its appeal without revealing the next twist to Sami.",
              "npc": "{{actor}} asks Farah about her reaction to a drama. Farah describes its appeal without revealing the next twist to Sami."
            },
            "response": {
              "speakerId": "farah_hussain",
              "speech": "I have spent years with this idiot. A person can become attached to an idiot.",
              "activity": "Looks briefly at Sami, then studies the radio as though it has misbehaved.",
              "emotion": "warm",
              "gesture": "point"
            },
            "signals": [
              "after_closing_hours_feeling_no_twist"
            ],
            "time": 1
          },
          {
            "id": "end_discussion",
            "label": "Leave before she tells you why you must never listen",
            "outcome": "You finish your part of the conversation before the twist emerges. Sami says he might listen for himself. Farah tries to look indifferent, fails, and tells him the beginning matters. She catches the next sentence before it becomes the ending.",
            "narration": {
              "personal": "You finish your part of the conversation before the twist emerges. Sami says he might listen for himself. Farah tries to look indifferent, fails, and tells him the beginning matters. She catches the next sentence before it becomes the ending.",
              "public": "{{actor}} leaves the discussion. Farah leaves the drama’s next twist unspoken.",
              "npc": "{{actor}} leaves the discussion. Farah leaves the drama’s next twist unspoken."
            },
            "response": {
              "speakerId": "farah_hussain",
              "speech": "Start at the beginning. I am showing enormous restraint about the rest.",
              "activity": "Closes her mouth around a character’s name and gives the radio a pointed look.",
              "emotion": "attentive",
              "gesture": "pause"
            },
            "signals": [
              "after_closing_hours_end_discussion"
            ],
            "time": 0
          }
        ]
      }
    ]
  },
  {
    "storyId": "nine_locks",
    "sourceStoryId": "closing_hours",
    "sourceSignals": [
      "shop_early",
      "shop_late",
      "listening_guest",
      "listening_snacks",
      "after_closing_hours_shimmer_remnant",
      "after_closing_hours_plain_cloth",
      "after_closing_hours_admire_only",
      "after_closing_hours_one_customer",
      "after_closing_hours_plain_evidence",
      "after_closing_hours_visit_not_demand",
      "after_closing_hours_no_window_quote",
      "after_closing_hours_feeling_no_twist",
      "after_closing_hours_end_discussion"
    ],
    "stages": [
      {
        "id": "example",
        "title": "The hand that wants to help",
        "prompt": "Farah’s explanation of a drama has left Sami considering how much an answer spoils. At the arcade’s public table, he sets out a Nine Locks position and holds his hands away from it. One finger keeps drifting toward the winning move. Vera may join the game if she feels like playing.",
        "choices": [
          {
            "id": "read_position",
            "label": "Try the position before Sami’s finger gives it away",
            "outcome": "You try the practice position and miss a move. Sami’s finger rises, retreats and rises again. When you finally ask, he shows you. He looks relieved enough for both of you. Discovering how long he can wait has become a second, much harder game.",
            "narration": {
              "personal": "You try the practice position and miss a move. Sami’s finger rises, retreats and rises again. When you finally ask, he shows you. He looks relieved enough for both of you. Discovering how long he can wait has become a second, much harder game.",
              "public": "{{actor}} tries Sami’s voluntary practice position. Sami shows an overlooked move after being asked.",
              "npc": "{{actor}} tries Sami’s voluntary practice position. Sami shows an overlooked move after being asked."
            },
            "response": {
              "speakerId": "sami",
              "speech": "I could feel the answer in my hand. Extremely unhelpful place for it.",
              "activity": "Clasps his hands together until you ask about the overlooked move.",
              "emotion": "warm",
              "gesture": "point"
            },
            "signals": [
              "after_nine_locks_read_position"
            ],
            "time": 1,
            "sourceSignalsAny": [
              "listening_guest",
              "after_closing_hours_feeling_no_twist",
              "after_closing_hours_end_discussion",
              "after_closing_hours_admire_only"
            ]
          },
          {
            "id": "worked_example",
            "label": "Let him show the move, then try it yourself",
            "outcome": "You ask Sami to show the move and then complete the practice position. He calls the result proof that the board explains itself. You both look at the finger still pointing to the answer. He withdraws it and revises his conclusion.",
            "narration": {
              "personal": "You ask Sami to show the move and then complete the practice position. He calls the result proof that the board explains itself. You both look at the finger still pointing to the answer. He withdraws it and revises his conclusion.",
              "public": "{{actor}} tries a voluntary worked example after Sami shows the move. Sami treats it as practice, not a scored win.",
              "npc": "{{actor}} tries a voluntary worked example after Sami shows the move. Sami treats it as practice, not a scored win."
            },
            "response": {
              "speakerId": "sami",
              "speech": "The board explains itself beautifully when I am leaning over it.",
              "activity": "Slowly tucks the pointing finger into the rest of his hand.",
              "emotion": "warm",
              "gesture": "point"
            },
            "signals": [
              "after_nine_locks_worked_example"
            ],
            "time": 1,
            "sourceSignalsNone": [
              "listening_guest",
              "after_closing_hours_feeling_no_twist",
              "after_closing_hours_end_discussion",
              "after_closing_hours_admire_only"
            ]
          },
          {
            "id": "no_practice",
            "label": "Skip the game today",
            "outcome": "You decline a round. Sami looks down at the carefully arranged position, then lets it sit. Vera can choose her own afternoon. He adjusts one piece by a tiny amount and insists the board was not waiting specifically for you.",
            "narration": {
              "personal": "You decline a round. Sami looks down at the carefully arranged position, then lets it sit. Vera can choose her own afternoon. He adjusts one piece by a tiny amount and insists the board was not waiting specifically for you.",
              "public": "{{actor}} declines a practice round. Sami leaves the public demonstration optional.",
              "npc": "{{actor}} declines a practice round. Sami leaves the public demonstration optional."
            },
            "response": {
              "speakerId": "sami",
              "speech": "No, of course. It is a perfectly attractive arrangement without a player.",
              "activity": "Straightens a safe tile that was already aligned with the board.",
              "emotion": "attentive",
              "gesture": "pause"
            },
            "signals": [
              "after_nine_locks_no_practice"
            ],
            "time": 0
          }
        ]
      },
      {
        "id": "evidence",
        "title": "Obvious to its inventor",
        "prompt": "Sami has written “obvious” beside the winning move on his example card. The arrow beside it has grown thicker. He adds a second arrow, notices what he is doing, and holds the pencil still.",
        "choices": [
          {
            "id": "anonymous_example",
            "label": "Let him show the move you missed, without your name",
            "outcome": "You let Sami use the missed move as an anonymous example. He crosses out “obvious.” It takes him longer than drawing the new route. The card finally shows why someone might overlook the move; Sami studies it and admits he can now see the trap he built for beginners.",
            "narration": {
              "personal": "You let Sami use the missed move as an anonymous example. He crosses out “obvious.” It takes him longer than drawing the new route. The card finally shows why someone might overlook the move; Sami studies it and admits he can now see the trap he built for beginners.",
              "public": "{{actor}} permits an anonymous practice example. Sami removes “obvious” from the explanation and marks the overlooked move.",
              "npc": "{{actor}} permits an anonymous practice example. Sami removes “obvious” from the explanation and marks the overlooked move."
            },
            "response": {
              "speakerId": "sami",
              "speech": "I have been calling it obvious because I know where I put it.",
              "activity": "Crosses out the adjective and traces the clearer route with the blunt end of the pencil.",
              "emotion": "warm",
              "gesture": "point"
            },
            "signals": [
              "after_nine_locks_anonymous_example"
            ],
            "time": 1,
            "afterChoices": [
              "read_position"
            ]
          },
          {
            "id": "name_the_hint",
            "label": "Make the triumphant example include his enormous hint",
            "outcome": "You remind Sami that he showed you the winning move first. He writes “worked example” above the position. The title is less impressive than proof of effortless play, but you can follow the explanation. Sami is pleased, then briefly annoyed that accuracy improved his card.",
            "narration": {
              "personal": "You remind Sami that he showed you the winning move first. He writes “worked example” above the position. The title is less impressive than proof of effortless play, but you can follow the explanation. Sami is pleased, then briefly annoyed that accuracy improved his card.",
              "public": "{{actor}} discusses the example with Sami. Sami labels it as a worked example with a demonstrated move.",
              "npc": "{{actor}} discusses the example with Sami. Sami labels it as a worked example with a demonstrated move."
            },
            "response": {
              "speakerId": "sami",
              "speech": "It worked. I wanted it to work for a more flattering reason.",
              "activity": "Adds the missing demonstration step and sets down the pencil.",
              "emotion": "warm",
              "gesture": "point"
            },
            "signals": [
              "after_nine_locks_name_the_hint"
            ],
            "time": 1,
            "afterChoices": [
              "worked_example"
            ]
          },
          {
            "id": "designer_example",
            "label": "Ask him to demonstrate it himself",
            "outcome": "You skipped the round, so you ask Sami to show his own example rather than imagine a successful tester. He labels it as the maker’s demonstration and plays it through. Halfway across the board he discovers he has been standing where a new player needs to look.",
            "narration": {
              "personal": "You skipped the round, so you ask Sami to show his own example rather than imagine a successful tester. He labels it as the maker’s demonstration and plays it through. Halfway across the board he discovers he has been standing where a new player needs to look.",
              "public": "{{actor}} asks Sami to distinguish a maker’s example from player testing. Sami labels and demonstrates his own position.",
              "npc": "{{actor}} asks Sami to distinguish a maker’s example from player testing. Sami labels and demonstrates his own position."
            },
            "response": {
              "speakerId": "sami",
              "speech": "Ah. The designer was obstructing the design. We can move him.",
              "activity": "Steps sideways to reveal the part of the board his sleeve was covering.",
              "emotion": "warm",
              "gesture": "point"
            },
            "signals": [
              "after_nine_locks_designer_example"
            ],
            "time": 1,
            "afterChoices": [
              "no_practice"
            ]
          },
          {
            "id": "private_practice",
            "label": "Leave your visit out of the demonstration",
            "outcome": "You keep your visit out of the display. Sami uses a position of his own. He spends a moment deciding whether to make the imaginary player unusually clever, then chooses a simpler example and looks faintly disappointed in his imaginary company.",
            "narration": {
              "personal": "You keep your visit out of the display. Sami uses a position of his own. He spends a moment deciding whether to make the imaginary player unusually clever, then chooses a simpler example and looks faintly disappointed in his imaginary company.",
              "public": "{{actor}} declines inclusion in the display. Sami keeps the display to his own demonstration.",
              "npc": "{{actor}} declines inclusion in the display. Sami keeps the display to his own demonstration."
            },
            "response": {
              "speakerId": "sami",
              "speech": "I had invented an excellent player. Very appreciative of my rules.",
              "activity": "Moves his own demonstration into the display and leaves the visitor space blank.",
              "emotion": "attentive",
              "gesture": "pause"
            },
            "signals": [
              "after_nine_locks_private_practice"
            ],
            "time": 0
          }
        ]
      },
      {
        "id": "revision",
        "title": "The old rule is still here",
        "prompt": "Sami puts a revised opening beside the old rules. He starts to explain that this is what he meant all along, sees the earlier sheet sitting there as a witness, and changes the sentence. Vera’s old win is an inconveniently good example of the old rule working.",
        "choices": [
          {
            "id": "new_unscored",
            "label": "Try the new opening in a fresh, unscored round",
            "outcome": "You and Sami try the new opening without keeping score. He labels the revision separately. The earlier rule sheet keeps curling back toward the board, and he flattens it with unusual care. He finally admits the new version is better because he changed something, not because everyone misunderstood him.",
            "narration": {
              "personal": "You and Sami try the new opening without keeping score. He labels the revision separately. The earlier rule sheet keeps curling back toward the board, and he flattens it with unusual care. He finally admits the new version is better because he changed something, not because everyone misunderstood him.",
              "public": "{{actor}} and Sami try a new, unscored version of the opening. Sami labels the revision separately and leaves previous results unchanged.",
              "npc": "{{actor}} and Sami try a new, unscored version of the opening. Sami labels the revision separately and leaves previous results unchanged."
            },
            "response": {
              "speakerId": "sami",
              "speech": "Version two. It sounds better when I say it quickly.",
              "activity": "Lays the revised opening beside the old sheet and pats the curled corner flat.",
              "emotion": "warm",
              "gesture": "point"
            },
            "signals": [
              "after_nine_locks_new_unscored"
            ],
            "time": 1
          },
          {
            "id": "no_revision_round",
            "label": "Stop before the revision becomes another afternoon",
            "outcome": "You decline another round. Sami leaves the revision as a proposal and keeps the finished game’s rules. He looks at the two sheets for a while, then laughs at having developed a serious disagreement with himself. He can work on that without an audience.",
            "narration": {
              "personal": "You decline another round. Sami leaves the revision as a proposal and keeps the finished game’s rules. He looks at the two sheets for a while, then laughs at having developed a serious disagreement with himself. He can work on that without an audience.",
              "public": "{{actor}} declines another round. Sami keeps the revision as an untested proposal and preserves earlier results.",
              "npc": "{{actor}} declines another round. Sami keeps the revision as an untested proposal and preserves earlier results."
            },
            "response": {
              "speakerId": "sami",
              "speech": "Yesterday’s designer is being very stubborn. You may as well go.",
              "activity": "Puts the proposal beside the closed game and folds his arms at the two versions.",
              "emotion": "attentive",
              "gesture": "pause"
            },
            "signals": [
              "after_nine_locks_no_revision_round"
            ],
            "time": 0
          }
        ]
      }
    ]
  }
] satisfies EnsembleAftermathDefinition[];
