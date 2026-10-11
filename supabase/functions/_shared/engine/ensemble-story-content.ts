import type { EnsembleDefinition, EnsembleRule } from './ensemble-story-types.ts';
/** Possible story events. Canon owns identity and possessions; state owns choices. */
export const ensembleStories: EnsembleDefinition[] = [
  {
    "id": "whaleskin",
    "title": "Universal Fit",
    "region": "pelagia",
    "cast": [
      "lata_rao",
      "pelagia_tavi",
      "pelagia_mara",
      "pelagia_esme"
    ],
    "venue": "pelagia-transit",
    "object": "whaleskin",
    "desire": "Lata wants a profitable inland route and credit for practical thrift.",
    "contradiction": "She would rather explain universal fit than measure the van; she later wants evidence removed before it is photographed.",
    "trigger": "Lata bought the Whaleskin for her van. She gives the ill-fitting cover to Tavi for their produce platform at Gatehouse Landing before the forecast rain.",
    "ignored": "The crew investigates and safely clears the outlet. Tavi keeps the lost-sale record; Lata resumes work. Nobody owes a rescue for ignoring an invitation.",
    "beats": [
      {
        "id": "fit",
        "title": "The back is still outside",
        "prompt": "At Gatehouse Landing, two mirror sleeves fit Lata’s van beautifully. The rear doors do not. She gives the cover to Tavi, who has a loaded platform and an unearned confidence in waterproofing.",
        "choices": [
          {
            "id": "inspect",
            "label": "Check the drain before covering the platform",
            "style": "prevention",
            "outcome": "Mara lifts a corner. “Water needs somewhere to go.” Tavi moves the cover; Lata points out that the mirror sleeves still fit.",
            "signals": [
              "road_safe"
            ],
            "set": {
              "prevented": true
            },
            "narration": {
              "personal": "Mara lifts a corner. “Water needs somewhere to go.” Tavi moves the cover; Lata points out that the mirror sleeves still fit.",
              "public": "Mara lifts a corner. “Water needs somewhere to go.” Tavi moves the cover; Lata points out that the mirror sleeves still fit.",
              "npc": "Mara lifts a corner. “Water needs somewhere to go.” Tavi moves the cover; Lata points out that the mirror sleeves still fit."
            },
            "npcLabel": null,
            "time": 1,
            "response": {
              "speakerId": "lata_rao",
              "speech": "The mirrors still fit.",
              "activity": "Folds a silver mirror sleeve over one arm.",
              "emotion": "warm",
              "gesture": "point"
            }
          },
          {
            "id": "reuse",
            "label": "Help Tavi put the Whaleskin over the platform",
            "style": "selfish",
            "outcome": "The produce stays dry. Beneath it, one silver sleeve hangs where nobody has looked. Lata calls this getting her money’s worth.",
            "signals": [
              "cover_installed"
            ],
            "narration": {
              "personal": "The produce stays dry. Beneath it, one silver sleeve hangs where nobody has looked. Lata calls this getting her money’s worth.",
              "public": "The produce stays dry. Beneath it, one silver sleeve hangs where nobody has looked. Lata calls this getting her money’s worth.",
              "npc": "The produce stays dry. Beneath it, one silver sleeve hangs where nobody has looked. Lata calls this getting her money’s worth."
            },
            "npcLabel": "Lata gives Tavi the Whaleskin for the platform",
            "time": 1,
            "response": {
              "speakerId": "lata_rao",
              "speech": "It is useful. Just for a different vehicle-shaped object.",
              "activity": "Folds a silver mirror sleeve over one arm.",
              "emotion": "proud",
              "gesture": "point"
            }
          },
          {
            "id": "pass",
            "label": "Leave Tavi and Lata to it",
            "style": "refusal",
            "outcome": "Tavi accepts the cover. Lata walks away before anyone asks why her van is still wet.",
            "signals": [
              "cover_installed"
            ],
            "narration": {
              "personal": "Tavi accepts the cover. Lata walks away before anyone asks why her van is still wet.",
              "public": "Tavi accepts the cover. Lata walks away before anyone asks why her van is still wet.",
              "npc": "Tavi accepts the cover. Lata walks away before anyone asks why her van is still wet."
            },
            "npcLabel": null,
            "time": 0,
            "response": {
              "speakerId": "lata_rao",
              "speech": "Tavi can use it. The back was never going to fit.",
              "activity": "Folds a silver mirror sleeve over one arm.",
              "emotion": "attentive",
              "gesture": "pause"
            }
          }
        ],
        "npc": "selfish"
      },
      {
        "id": "rain",
        "title": "A very useful interruption",
        "prompt": "The weather arrives. An early check can make this an ordinary wet working day; otherwise the road closes for inspection.",
        "choices": [
          {
            "id": "accurate",
            "label": "Ask Mara what the inspection actually found",
            "style": "helpful",
            "outcome": "Mara gives the road’s present condition and the next check. Lata asks whether the next check comes with an earlier time.",
            "signals": [
              "route_status"
            ],
            "narration": {
              "personal": "Mara gives the road’s present condition and the next check. Lata asks whether the next check comes with an earlier time.",
              "public": "Mara gives the road’s present condition and the next check. Lata asks whether the next check comes with an earlier time.",
              "npc": "Mara gives the road’s present condition and the next check. Lata asks whether the next check comes with an earlier time."
            },
            "npcLabel": "Lata requests Mara’s inspection findings",
            "time": 1,
            "response": {
              "speakerId": "lata_rao",
              "speech": "Mara has the actual report. I have the delivery book.",
              "activity": "Folds a silver mirror sleeve over one arm.",
              "emotion": "warm",
              "gesture": "point"
            }
          },
          {
            "id": "accuse",
            "label": "Tell people Ravi is making money while his wife keeps the road closed",
            "style": "selfish",
            "outcome": "Lata repeats the connection with great satisfaction. Ravi begins praising Mara’s efficiency. Mara tells him to stop helping.",
            "signals": [
              "route_suspicion"
            ],
            "unless": "prevented",
            "narration": {
              "personal": "Lata repeats the connection with great satisfaction. Ravi begins praising Mara’s efficiency. Mara tells him to stop helping.",
              "public": "Lata repeats the connection with great satisfaction. Ravi begins praising Mara’s efficiency. Mara tells him to stop helping.",
              "npc": "Lata repeats the connection with great satisfaction. Ravi begins praising Mara’s efficiency. Mara tells him to stop helping."
            },
            "npcLabel": null,
            "time": 1,
            "response": {
              "speakerId": "lata_rao",
              "speech": "I am only saying they are married. Quite efficiently married.",
              "activity": "Folds a silver mirror sleeve over one arm.",
              "emotion": "proud",
              "gesture": "point"
            }
          },
          {
            "id": "outside",
            "label": "Keep to your own route",
            "style": "refusal",
            "outcome": "The inspection goes on. Lata watches another empty space in her delivery book become an afternoon.",
            "signals": [
              "route_status"
            ],
            "narration": {
              "personal": "The inspection goes on. Lata watches another empty space in her delivery book become an afternoon.",
              "public": "The inspection goes on. Lata watches another empty space in her delivery book become an afternoon.",
              "npc": "The inspection goes on. Lata watches another empty space in her delivery book become an afternoon."
            },
            "npcLabel": null,
            "time": 0,
            "response": {
              "speakerId": "lata_rao",
              "speech": "I have a route to get back to.",
              "activity": "Folds a silver mirror sleeve over one arm.",
              "emotion": "attentive",
              "gesture": "pause"
            }
          }
        ],
        "npc": "helpful"
      },
      {
        "id": "sleeve",
        "title": "The recognizable sleeve",
        "prompt": "If the obstruction was prevented, Mara signs off an ordinary inspection. Otherwise a mirror sleeve appears under the platform.",
        "choices": [
          {
            "id": "context",
            "label": "Show the whole repair, including Tavi’s notes",
            "style": "helpful",
            "outcome": "Tavi puts the spoiled crate beside the good one for the photograph. Mara’s inspection stays in the frame. Lata suggests a closer angle.",
            "signals": [
              "full_record"
            ],
            "narration": {
              "personal": "Tavi puts the spoiled crate beside the good one for the photograph. Mara’s inspection stays in the frame. Lata suggests a closer angle.",
              "public": "Tavi puts the spoiled crate beside the good one for the photograph. Mara’s inspection stays in the frame. Lata suggests a closer angle.",
              "npc": "Tavi puts the spoiled crate beside the good one for the photograph. Mara’s inspection stays in the frame. Lata suggests a closer angle."
            },
            "npcLabel": "Lata agrees to the full public record",
            "time": 1,
            "response": {
              "speakerId": "lata_rao",
              "speech": "Does the whole sleeve need to be in the picture?",
              "activity": "Folds a silver mirror sleeve over one arm.",
              "emotion": "warm",
              "gesture": "point"
            }
          },
          {
            "id": "hero",
            "label": "Keep the photograph of Lata pulling out the cover",
            "style": "selfish",
            "outcome": "Once the crew has made it safe, Lata drags out the silver sheet. In the close photograph she looks like the woman who rescued the road.",
            "signals": [
              "hero_crop"
            ],
            "unless": "prevented",
            "narration": {
              "personal": "Once the crew has made it safe, Lata drags out the silver sheet. In the close photograph she looks like the woman who rescued the road.",
              "public": "Once the crew has made it safe, Lata drags out the silver sheet. In the close photograph she looks like the woman who rescued the road.",
              "npc": "Once the crew has made it safe, Lata drags out the silver sheet. In the close photograph she looks like the woman who rescued the road."
            },
            "npcLabel": null,
            "time": 1,
            "response": {
              "speakerId": "lata_rao",
              "speech": "Closer. There is a very good picture if you come closer.",
              "activity": "Folds a silver mirror sleeve over one arm.",
              "emotion": "proud",
              "gesture": "point"
            }
          },
          {
            "id": "crew",
            "label": "Leave the repair and photographs to the crew",
            "style": "refusal",
            "outcome": "The crew records the repair. Tavi asks Lata to carry their Whaleskin to dry storage, somewhere less visible.",
            "signals": [
              "full_record"
            ],
            "narration": {
              "personal": "The crew records the repair. Tavi asks Lata to carry their Whaleskin to dry storage, somewhere less visible.",
              "public": "The crew records the repair. Tavi asks Lata to carry their Whaleskin to dry storage, somewhere less visible.",
              "npc": "The crew records the repair. Tavi asks Lata to carry their Whaleskin to dry storage, somewhere less visible."
            },
            "npcLabel": null,
            "time": 0,
            "response": {
              "speakerId": "lata_rao",
              "speech": "Tavi can tell me where he wants his cover.",
              "activity": "Folds a silver mirror sleeve over one arm.",
              "emotion": "attentive",
              "gesture": "pause"
            }
          }
        ],
        "npc": "helpful"
      },
      {
        "id": "next",
        "title": "The next order",
        "prompt": "The road is safe. Any real grocery orders still exist. Tavi owns the Whaleskin now; Lata is still describing how well its mirror sleeves fit.",
        "choices": [
          {
            "id": "separate",
            "label": "Tell Ravi and Lata to run their own routes",
            "style": "helpful",
            "outcome": "They leave with separate order sheets. Tavi lets Lata hold their cover over her van once more. The back is still outside.",
            "signals": [
              "inland_available"
            ],
            "narration": {
              "personal": "They leave with separate order sheets. Tavi lets Lata hold their cover over her van once more. The back is still outside.",
              "public": "They leave with separate order sheets. Tavi lets Lata hold their cover over her van once more. The back is still outside.",
              "npc": "They leave with separate order sheets. Tavi lets Lata hold their cover over her van once more. The back is still outside."
            },
            "npcLabel": "Lata chooses to run her own route",
            "time": 1,
            "response": {
              "speakerId": "lata_rao",
              "speech": "Separate routes. It sounds almost like a plan.",
              "activity": "Folds a silver mirror sleeve over one arm.",
              "emotion": "warm",
              "gesture": "point"
            }
          },
          {
            "id": "offer",
            "label": "Ask Lata what she would charge Ravi for the inland leg",
            "style": "selfish",
            "outcome": "Lata names a price. Ravi writes it down. She kept her route and acquired another conversation about it.",
            "signals": [
              "inland_quote"
            ],
            "narration": {
              "personal": "Lata names a price. Ravi writes it down. She kept her route and acquired another conversation about it.",
              "public": "Lata names a price. Ravi writes it down. She kept her route and acquired another conversation about it.",
              "npc": "Lata names a price. Ravi writes it down. She kept her route and acquired another conversation about it."
            },
            "npcLabel": null,
            "time": 1,
            "response": {
              "speakerId": "lata_rao",
              "speech": "My inland price is on this line. That is why it has a line.",
              "activity": "Folds a silver mirror sleeve over one arm.",
              "emotion": "proud",
              "gesture": "point"
            }
          },
          {
            "id": "leave",
            "label": "Leave once the road is safe",
            "style": "refusal",
            "outcome": "Lata resumes deliveries. Tavi revises the platform. Tavi keeps the Whaleskin for the checked platform. Lata’s van remains uncovered at the back.",
            "signals": [
              "inland_available"
            ],
            "narration": {
              "personal": "Lata resumes deliveries. Tavi revises the platform. Tavi keeps the Whaleskin for the checked platform. Lata’s van remains uncovered at the back.",
              "public": "Lata resumes deliveries. Tavi revises the platform. Tavi keeps the Whaleskin for the checked platform. Lata’s van remains uncovered at the back.",
              "npc": "Lata resumes deliveries. Tavi revises the platform. Tavi keeps the Whaleskin for the checked platform. Lata’s van remains uncovered at the back."
            },
            "npcLabel": null,
            "time": 0,
            "response": {
              "speakerId": "lata_rao",
              "speech": "I still think those sleeves are excellent.",
              "activity": "Folds a silver mirror sleeve over one arm.",
              "emotion": "attentive",
              "gesture": "pause"
            }
          }
        ],
        "npc": "helpful"
      }
    ],
    "place": "TRANSIT",
    "personal": {
      "id": "own_part",
      "label": "Keep a dry parcel for your own route",
      "outcome": "You collect your parcel by the open route. Tavi offers to put a corner of their Whaleskin over it; the parcel is already indoors. Lata mentions the sleeves.",
      "narration": {
        "personal": "You collect your parcel by the open route. Tavi offers to put a corner of their Whaleskin over it; the parcel is already indoors. Lata mentions the sleeves.",
        "public": "{{actor}} makes a separate arrangement of their own.",
        "npc": "You collect your parcel by the open route. Tavi offers to put a corner of their Whaleskin over it; the parcel is already indoors. Lata mentions the sleeves."
      },
      "cost": 0,
      "time": 1,
      "signals": [],
      "response": {
        "speakerId": "lata_rao",
        "speech": "Mara has the inspection. Ask her about the road.",
        "activity": "Folds a silver mirror sleeve over one arm.",
        "emotion": "warm",
        "gesture": "point"
      }
    }
  },
  {
    "id": "extra_run",
    "title": "One More Booking",
    "region": "pelagia",
    "cast": [
      "ravi_desai",
      "lata_rao",
      "pelagia_tavi"
    ],
    "venue": "pelagia-transit",
    "object": "kestrel_ferry_mix",
    "desire": "Ravi wants enough actual orders to justify a repeat freight run.",
    "contradiction": "He enjoys selling spare capacity more than counting the hours it will consume.",
    "trigger": "At Gatehouse Landing, Ravi has room on one consignment and is already describing the second.",
    "ignored": "Ravi fulfills limited accepted orders and lets unbacked ambitions lapse; interest is never treated as a paid purchase.",
    "beats": [
      {
        "id": "demand",
        "title": "An expression of interest",
        "prompt": "Ravi calls an almost empty order sheet “flexible.” He can combine accepted grocery shipments but cannot deliver enthusiasm.",
        "choices": [
          {
            "id": "small",
            "label": "Order groceries once",
            "style": "helpful",
            "outcome": "Ravi draws a second empty box under your order. You point to the first. He labels it ONE DELIVERY, rather heavily.",
            "signals": [
              "grocery_order"
            ],
            "cost": 72,
            "narration": {
              "personal": "Ravi draws a second empty box under your order. You point to the first. He labels it ONE DELIVERY, rather heavily.",
              "public": "Ravi draws a second empty box under {{actor}}’s order. {{actor}} points to the first. He labels it ONE DELIVERY, rather heavily.",
              "npc": "Ravi draws a second empty box under {{actor}}’s order. {{actor}} points to the first. He labels it ONE DELIVERY, rather heavily."
            },
            "npcLabel": "Tavi pays for a single grocery shipment",
            "time": 1,
            "response": {
              "speakerId": "ravi_desai",
              "speech": "One box. I have written one.",
              "activity": "Draws a box on the order sheet.",
              "emotion": "warm",
              "gesture": "point"
            }
          },
          {
            "id": "repeat",
            "label": "Buy the two-delivery trial",
            "style": "selfish",
            "outcome": "Two orders give Ravi a second departure to staff. He says this is almost no extra work, then unfolds another sheet.",
            "signals": [
              "repeat_order"
            ],
            "cost": 144,
            "narration": {
              "personal": "Two orders give Ravi a second departure to staff. He says this is almost no extra work, then unfolds another sheet.",
              "public": "Two orders give Ravi a second departure to staff. He says this is almost no extra work, then unfolds another sheet.",
              "npc": "Two orders give Ravi a second departure to staff. He says this is almost no extra work, then unfolds another sheet."
            },
            "npcLabel": null,
            "time": 1,
            "response": {
              "speakerId": "ravi_desai",
              "speech": "Two deliveries. That nearly looks like a service.",
              "activity": "Draws a box on the order sheet.",
              "emotion": "proud",
              "gesture": "point"
            }
          },
          {
            "id": "decline",
            "label": "Buy nothing",
            "style": "refusal",
            "outcome": "Ravi removes your name from the customers column. It was in pencil. He would like you to notice that.",
            "signals": [
              "small_load"
            ],
            "narration": {
              "personal": "Ravi removes your name from the customers column. It was in pencil. He would like you to notice that.",
              "public": "Ravi removes {{actor}}’s name from the customers column. It was in pencil, a fact he takes care to mention.",
              "npc": "Ravi removes {{actor}}’s name from the customers column. It was in pencil, a fact he takes care to mention."
            },
            "npcLabel": null,
            "time": 0,
            "response": {
              "speakerId": "ravi_desai",
              "speech": "I was writing your name in pencil.",
              "activity": "Draws a box on the order sheet.",
              "emotion": "attentive",
              "gesture": "pause"
            }
          }
        ],
        "npc": "helpful"
      },
      {
        "id": "terms",
        "title": "A successful service needs somebody there",
        "prompt": "There is a shipment, a price and a departure time. The proposed regular service must survive ordinary staffing.",
        "choices": [
          {
            "id": "bounded",
            "label": "Take one loading shift",
            "style": "helpful",
            "outcome": "You finish the booked load. Ravi starts describing tomorrow; you ask what tomorrow pays.",
            "signals": [
              "freight_staffed"
            ],
            "commit": "loading-shift",
            "narration": {
              "personal": "You finish the booked load. Ravi starts describing tomorrow; you ask what tomorrow pays.",
              "public": "{{actor}} finishes the booked load. Ravi starts describing tomorrow; {{actor}} asks what tomorrow pays.",
              "npc": "{{actor}} finishes the booked load. Ravi starts describing tomorrow; {{actor}} asks what tomorrow pays."
            },
            "npcLabel": "Tavi takes the one paid loading shift",
            "paidHours": 4,
            "workField": "practical",
            "time": 1,
            "response": {
              "speakerId": "ravi_desai",
              "speech": "That was the shift. Shall I quote the next one?",
              "activity": "Draws a box on the order sheet.",
              "emotion": "warm",
              "gesture": "point"
            }
          },
          {
            "id": "markup",
            "label": "Ask for fewer crates at a better rate",
            "style": "selfish",
            "outcome": "Ravi offers a smaller, dearer consignment. Lio looks at the quote and starts counting how many biscuits he can buy locally.",
            "signals": [
              "premium_freight"
            ],
            "narration": {
              "personal": "Ravi offers a smaller, dearer consignment. Lio looks at the quote and starts counting how many biscuits he can buy locally.",
              "public": "Ravi offers a smaller, dearer consignment. Lio looks at the quote and starts counting how many biscuits he can buy locally.",
              "npc": "Ravi offers a smaller, dearer consignment. Lio looks at the quote and starts counting how many biscuits he can buy locally."
            },
            "npcLabel": null,
            "time": 1,
            "response": {
              "speakerId": "ravi_desai",
              "speech": "Fewer crates. Better margin. More empty space to explain.",
              "activity": "Draws a box on the order sheet.",
              "emotion": "proud",
              "gesture": "point"
            }
          },
          {
            "id": "stop",
            "label": "Turn down the shift",
            "style": "refusal",
            "outcome": "Ravi leaves with the load he can handle. The empty space is still technically an opportunity.",
            "signals": [
              "freight_limited"
            ],
            "narration": {
              "personal": "Ravi leaves with the load he can handle. The empty space is still technically an opportunity.",
              "public": "Ravi leaves with the load he can handle. The empty space is still technically an opportunity.",
              "npc": "Ravi leaves with the load he can handle. The empty space is still technically an opportunity."
            },
            "npcLabel": null,
            "time": 0,
            "response": {
              "speakerId": "ravi_desai",
              "speech": "I can run the load that is actually here.",
              "activity": "Draws a box on the order sheet.",
              "emotion": "attentive",
              "gesture": "pause"
            }
          }
        ],
        "npc": "helpful"
      }
    ],
    "place": "TRANSIT",
    "personal": {
      "id": "own_part",
      "label": "Order your own grocery box",
      "outcome": "Your own grocery box is paid for. Ravi asks whether this is a beginning. You point to the one box.",
      "narration": {
        "personal": "Your own grocery box is paid for. Ravi asks whether this is a beginning. You point to the one box.",
        "public": "{{actor}} makes a separate arrangement of their own.",
        "npc": "Your own grocery box is paid for. Ravi asks whether this is a beginning. You point to the one box."
      },
      "cost": 72,
      "time": 1,
      "signals": [
        "grocery_order"
      ],
      "response": {
        "speakerId": "ravi_desai",
        "speech": "Write the quantity down. Then I can quote the load.",
        "activity": "Draws a box on the order sheet.",
        "emotion": "warm",
        "gesture": "point"
      }
    }
  },
  {
    "id": "missing_shot",
    "title": "The Boring Part",
    "region": "pelagia",
    "cast": [
      "nila_desai",
      "ravi_desai",
      "pelagia_esme"
    ],
    "venue": "pelagia-cinema",
    "object": "landing_names_box",
    "desire": "Nila wants a documentary about people waiting that somebody will watch.",
    "contradiction": "Her most useful shot is the queue she is tempted to cut for pace.",
    "trigger": "Nila offers a private rough-cut viewing. The permitted queue sequence shows Ravi taking his proper turn.",
    "ignored": "Nila completes her own cut. Dispatch records remain an independent source; nobody obtains family publicity by persistence.",
    "beats": [
      {
        "id": "cut",
        "title": "Nothing happens, accurately",
        "prompt": "Ravi’s load waits in a long, ordinary queue. Nila can cut most of it and produce a more watchable wrong impression.",
        "choices": [
          {
            "id": "whole",
            "label": "Tell Nila to keep the uncut queue",
            "style": "helpful",
            "outcome": "Nothing happens for an impressively long time. Then Ravi’s load moves, in its proper turn. Nila stops reaching for the cut button.",
            "signals": [
              "queue_evidence"
            ],
            "narration": {
              "personal": "Nothing happens for an impressively long time. Then Ravi’s load moves, in its proper turn. Nila stops reaching for the cut button.",
              "public": "Nothing happens for an impressively long time. Then Ravi’s load moves, in its proper turn. Nila stops reaching for the cut button.",
              "npc": "Nothing happens for an impressively long time. Then Ravi’s load moves, in its proper turn. Nila stops reaching for the cut button."
            },
            "npcLabel": "Nila keeps the uninterrupted queue in her edit",
            "time": 1,
            "response": {
              "speakerId": "nila_desai",
              "speech": "Nothing happens. That is how you can see whose turn it is.",
              "activity": "Keeps one hand beside the edit controls.",
              "emotion": "warm",
              "gesture": "point"
            }
          },
          {
            "id": "pace",
            "label": "Choose the quicker cut",
            "style": "selfish",
            "outcome": "The film moves better. It can no longer tell anybody which load went first. Nila writes two different notes about that.",
            "signals": [
              "short_film"
            ],
            "narration": {
              "personal": "The film moves better. It can no longer tell anybody which load went first. Nila writes two different notes about that.",
              "public": "The film moves better. It can no longer tell anybody which load went first. Nila writes two different notes about that.",
              "npc": "The film moves better. It can no longer tell anybody which load went first. Nila writes two different notes about that."
            },
            "npcLabel": null,
            "time": 1,
            "response": {
              "speakerId": "nila_desai",
              "speech": "It moves better. It proves less.",
              "activity": "Keeps one hand beside the edit controls.",
              "emotion": "proud",
              "gesture": "point"
            }
          },
          {
            "id": "privacy",
            "label": "Let Nila keep working privately",
            "style": "refusal",
            "outcome": "Nila turns back to the edit. Ravi’s dispatch order is still written down at the landing.",
            "signals": [
              "private_cut"
            ],
            "narration": {
              "personal": "Nila turns back to the edit. Ravi’s dispatch order is still written down at the landing.",
              "public": "Nila turns back to the edit. Ravi’s dispatch order is still written down at the landing.",
              "npc": "Nila turns back to the edit. Ravi’s dispatch order is still written down at the landing."
            },
            "npcLabel": null,
            "time": 0,
            "response": {
              "speakerId": "nila_desai",
              "speech": "Good. I still need to work out the ending.",
              "activity": "Keeps one hand beside the edit controls.",
              "emotion": "attentive",
              "gesture": "pause"
            }
          }
        ],
        "npc": "helpful"
      },
      {
        "id": "permission",
        "title": "A family film is not a family defense",
        "prompt": "An authorized excerpt could settle one narrow claim. Nila can also choose a different public screening.",
        "choices": [
          {
            "id": "request",
            "label": "Ask Nila to show the uncut queue",
            "style": "helpful",
            "outcome": "Nila checks with the people filmed, then releases that sequence. It disproves a queue jump, not every complaint anyone has ever made about her father.",
            "signals": [
              "queue_correction"
            ],
            "narration": {
              "personal": "Nila checks with the people filmed, then releases that sequence. It disproves a queue jump, not every complaint anyone has ever made about her father.",
              "public": "Nila checks with the people filmed, then releases that sequence. It disproves a queue jump, not every complaint anyone has ever made about her father.",
              "npc": "Nila checks with the people filmed, then releases that sequence. It disproves a queue jump, not every complaint anyone has ever made about her father."
            },
            "npcLabel": "Nila checks permission and shares the queue excerpt",
            "time": 1,
            "response": {
              "speakerId": "nila_desai",
              "speech": "That excerpt, with their permission. It is not a film about Dad being right.",
              "activity": "Keeps one hand beside the edit controls.",
              "emotion": "warm",
              "gesture": "point"
            }
          },
          {
            "id": "screen",
            "label": "Ask Nila about showing her film at Six Chairs",
            "style": "selfish",
            "outcome": "Nila offers Ada the short about waiting. “It is not a freight advert,” she says, before Ravi has asked.",
            "signals": [
              "film_offer"
            ],
            "narration": {
              "personal": "Nila offers Ada the short about waiting. “It is not a freight advert,” she says, before Ravi has asked.",
              "public": "Nila offers Ada the short about waiting. “It is not a freight advert,” she says, before Ravi has asked.",
              "npc": "Nila offers Ada the short about waiting. “It is not a freight advert,” she says, before Ravi has asked."
            },
            "npcLabel": null,
            "time": 1,
            "response": {
              "speakerId": "nila_desai",
              "speech": "A film about waiting. Please keep that title.",
              "activity": "Keeps one hand beside the edit controls.",
              "emotion": "proud",
              "gesture": "point"
            }
          },
          {
            "id": "no_public",
            "label": "Keep the film private",
            "style": "refusal",
            "outcome": "Nila keeps the cut to herself. The landing clerk can still show the ordinary dispatch log.",
            "signals": [
              "dispatch_alternative"
            ],
            "narration": {
              "personal": "Nila keeps the cut to herself. The landing clerk can still show the ordinary dispatch log.",
              "public": "Nila keeps the cut to herself. The landing clerk can still show the ordinary dispatch log.",
              "npc": "Nila keeps the cut to herself. The landing clerk can still show the ordinary dispatch log."
            },
            "npcLabel": null,
            "time": 0,
            "response": {
              "speakerId": "nila_desai",
              "speech": "The dispatch book can answer a dispatch question.",
              "activity": "Keeps one hand beside the edit controls.",
              "emotion": "attentive",
              "gesture": "pause"
            }
          }
        ],
        "npc": "helpful"
      }
    ],
    "place": "CINEMA",
    "personal": {
      "id": "own_part",
      "label": "Watch Nila’s private rough cut",
      "outcome": "You watch the waiting sequence privately. Nothing happening turns out to require concentration. Nila keeps control of the edit.",
      "narration": {
        "personal": "You watch the waiting sequence privately. Nothing happening turns out to require concentration. Nila keeps control of the edit.",
        "public": "{{actor}} makes a separate arrangement of their own.",
        "npc": "You watch the waiting sequence privately. Nothing happening turns out to require concentration. Nila keeps control of the edit."
      },
      "cost": 0,
      "time": 1,
      "signals": [],
      "response": {
        "speakerId": "nila_desai",
        "speech": "The film and the dispatch book answer different questions.",
        "activity": "Keeps one hand beside the edit controls.",
        "emotion": "warm",
        "gesture": "point"
      }
    }
  },
  {
    "id": "broth",
    "title": "Exactly Enough Biscuits",
    "region": "pelagia",
    "cast": [
      "pelagia_lio",
      "sefu",
      "safia_odhiambo"
    ],
    "venue": "pelagia-corner-cafe",
    "object": "first_ferry_broth_pot",
    "desire": "Lio wants early customers fed and a service he can actually finish.",
    "contradiction": "He prides himself on remembering everybody, then interprets an empty biscuit bowl as a referendum on his hospitality.",
    "trigger": "Lio has broth ready and one unopened packet of Kestrel Ferry Mix.",
    "ignored": "He buys the usual quantity and closes at the agreed time; an unaccepted bulk suggestion does not create a debt.",
    "beats": [
      {
        "id": "batch",
        "title": "The packet was adequate yesterday",
        "prompt": "The first broth customers are waiting. Lio is trying to distinguish an appetite from a reliable standing order.",
        "choices": [
          {
            "id": "normal",
            "label": "Buy broth and a few biscuits",
            "style": "helpful",
            "outcome": "Lio opens the packet. It looks adequate until the second customer arrives, which is exactly what happened yesterday.",
            "signals": [
              "broth_sale"
            ],
            "cost": 18,
            "narration": {
              "personal": "Lio opens the packet. It looks adequate until the second customer arrives, which is exactly what happened yesterday.",
              "public": "Lio opens the packet. It looks adequate until the second customer arrives, which is exactly what happened yesterday.",
              "npc": "Lio opens the packet. It looks adequate until the second customer arrives, which is exactly what happened yesterday."
            },
            "npcLabel": "Sefu buys broth and a biscuit portion",
            "time": 1,
            "response": {
              "speakerId": "pelagia_lio",
              "speech": "One bowl. I can count one bowl.",
              "activity": "Rests the ladle beside the broth pot.",
              "emotion": "warm",
              "gesture": "point"
            }
          },
          {
            "id": "bulk",
            "label": "Pay for a second batch",
            "style": "selfish",
            "outcome": "Lio writes up another serving shift. Safia calls it popular demand. There are three customers behind her.",
            "signals": [
              "broth_batch"
            ],
            "cost": 90,
            "narration": {
              "personal": "Lio writes up another serving shift. Safia calls it popular demand. There are three customers behind her.",
              "public": "Lio writes up another serving shift. Safia calls it popular demand. There are three customers behind her.",
              "npc": "Lio writes up another serving shift. Safia calls it popular demand. There are three customers behind her."
            },
            "npcLabel": null,
            "time": 1,
            "response": {
              "speakerId": "pelagia_lio",
              "speech": "A second batch. That is different from opening the second packet.",
              "activity": "Rests the ladle beside the broth pot.",
              "emotion": "proud",
              "gesture": "point"
            }
          },
          {
            "id": "none",
            "label": "Have tea",
            "style": "refusal",
            "outcome": "Lio keeps the usual broth quantity. He places the unopened extra packet where he can continue thinking about it.",
            "signals": [
              "broth_limited"
            ],
            "narration": {
              "personal": "Lio keeps the usual broth quantity. He places the unopened extra packet where he can continue thinking about it.",
              "public": "Lio keeps the usual broth quantity. He places the unopened extra packet where he can continue thinking about it.",
              "npc": "Lio keeps the usual broth quantity. He places the unopened extra packet where he can continue thinking about it."
            },
            "npcLabel": null,
            "time": 0,
            "response": {
              "speakerId": "pelagia_lio",
              "speech": "Tea, then. The broth will manage without persuading you.",
              "activity": "Rests the ladle beside the broth pot.",
              "emotion": "attentive",
              "gesture": "pause"
            }
          }
        ],
        "npc": "helpful"
      },
      {
        "id": "closing",
        "title": "The grateful customer is still talking",
        "prompt": "Safia likes the meal enough to begin a debate about portions. Lio wants to sit down while there is still some broth.",
        "choices": [
          {
            "id": "close",
            "label": "Collect early and let Lio close",
            "style": "helpful",
            "outcome": "The last bowl leaves while it is still hot. Lio finally sits down; Safia brings her unfinished argument to the chair beside him.",
            "signals": [
              "early_collection"
            ],
            "narration": {
              "personal": "The last bowl leaves while it is still hot. Lio finally sits down; Safia brings her unfinished argument to the chair beside him.",
              "public": "The last bowl leaves while it is still hot. Lio finally sits down; Safia brings her unfinished argument to the chair beside him.",
              "npc": "The last bowl leaves while it is still hot. Lio finally sits down; Safia brings her unfinished argument to the chair beside him."
            },
            "npcLabel": "Sefu takes the early collection, letting Lio close",
            "time": 1,
            "response": {
              "speakerId": "pelagia_lio",
              "speech": "I might get to eat some myself.",
              "activity": "Rests the ladle beside the broth pot.",
              "emotion": "warm",
              "gesture": "point"
            }
          },
          {
            "id": "late",
            "label": "Pay for a late serving",
            "style": "selfish",
            "outcome": "Lio writes your name in the late slot. Somebody else will have to collect early. He underlines the closing time once.",
            "signals": [
              "late_service"
            ],
            "cost": 36,
            "narration": {
              "personal": "Lio writes your name in the late slot. Somebody else will have to collect early. He underlines the closing time once.",
              "public": "Lio writes {{actor}}’s name in the late slot. Somebody else must collect early. He underlines the closing time once.",
              "npc": "Lio writes {{actor}}’s name in the late slot. Somebody else must collect early. He underlines the closing time once."
            },
            "npcLabel": null,
            "time": 1,
            "response": {
              "speakerId": "pelagia_lio",
              "speech": "One late serving. I have made the word one quite large.",
              "activity": "Rests the ladle beside the broth pot.",
              "emotion": "proud",
              "gesture": "point"
            }
          },
          {
            "id": "go",
            "label": "Leave at closing time",
            "style": "refusal",
            "outcome": "Lio takes the pot off. The remaining conversation is now happening without a serving spoon.",
            "signals": [
              "early_collection"
            ],
            "narration": {
              "personal": "Lio takes the pot off. The remaining conversation is now happening without a serving spoon.",
              "public": "Lio takes the pot off. The remaining conversation is now happening without a serving spoon.",
              "npc": "Lio takes the pot off. The remaining conversation is now happening without a serving spoon."
            },
            "npcLabel": null,
            "time": 0,
            "response": {
              "speakerId": "pelagia_lio",
              "speech": "It was enough broth. I have decided it was enough.",
              "activity": "Rests the ladle beside the broth pot.",
              "emotion": "attentive",
              "gesture": "pause"
            }
          }
        ],
        "npc": "helpful"
      }
    ],
    "place": "CORNER CAFÉ",
    "personal": {
      "id": "own_part",
      "label": "Buy your own bowl and biscuits",
      "outcome": "Lio counts your bowl as one customer. The packet remains a packet. You eat while it is hot.",
      "narration": {
        "personal": "Lio counts your bowl as one customer. The packet remains a packet. You eat while it is hot.",
        "public": "{{actor}} makes a separate arrangement of their own.",
        "npc": "Lio counts your bowl as one customer. The packet remains a packet. You eat while it is hot."
      },
      "cost": 18,
      "time": 1,
      "signals": [
        "broth_sale"
      ],
      "response": {
        "speakerId": "pelagia_lio",
        "speech": "Tell me the quantity before I open another packet.",
        "activity": "Rests the ladle beside the broth pot.",
        "emotion": "warm",
        "gesture": "point"
      }
    }
  },
  {
    "id": "dalloway",
    "title": "June’s Last Orders",
    "region": "embermesa",
    "cast": [
      "mesa_june",
      "esperanza_vega",
      "kit",
      "rosa_moreno"
    ],
    "venue": "embermesa-corner-cafe",
    "object": "dalloway",
    "desire": "June wants a better working week and enjoys being unmistakably good at her old job.",
    "contradiction": "Her corrections help the service while making it look as though only she can do it.",
    "trigger": "A farewell-to-the-station sign and Kit’s empty-counter drawing make the diner look doomed.",
    "ignored": "June corrects the misunderstanding, handles accepted meals and chooses her own work. The provisional replacement offer is not secretly a promise to the player.",
    "beats": [
      {
        "id": "sign",
        "title": "Last orders for what?",
        "prompt": "June has repaired the return spring in her own Dalloway bicycle bell. Esperanza’s “JUNE’S LAST ORDERS” tag hangs beside Kit’s empty-counter drawing. June is leaving station announcing; she is still the diner’s cook. Customers look relieved and order anyway.",
        "choices": [
          {
            "id": "correct",
            "label": "Change the sign to “June’s station farewell”",
            "style": "prevention",
            "outcome": "June taps STATION twice. “The diner is open.” The Dalloway rings and somebody orders eggs.",
            "signals": [
              "clear_supper"
            ],
            "set": {
              "corrected": true
            },
            "narration": {
              "personal": "June taps STATION twice. “The diner is open.” The Dalloway rings and somebody orders eggs.",
              "public": "June taps STATION twice. “The diner is open.” The Dalloway rings and somebody orders eggs.",
              "npc": "June taps STATION twice. “The diner is open.” The Dalloway rings and somebody orders eggs."
            },
            "npcLabel": "June corrects the station-farewell sign",
            "time": 1,
            "response": {
              "speakerId": "mesa_june",
              "speech": "The station. I am leaving the station.",
              "activity": "Touches the Dalloway’s worn thumb paddle.",
              "emotion": "warm",
              "gesture": "point"
            }
          },
          {
            "id": "book",
            "label": "Keep your supper booking",
            "style": "selfish",
            "outcome": "June takes the payment. Kit gets another shift, Esperanza gets a grocery order, and the diner everyone saved remains open.",
            "signals": [
              "supper_order"
            ],
            "cost": 120,
            "narration": {
              "personal": "June takes the payment. Kit gets another shift, Esperanza gets a grocery order, and the diner everyone saved remains open.",
              "public": "June takes the payment. Kit gets another shift, Esperanza gets a grocery order, and the diner everyone saved remains open.",
              "npc": "June takes the payment. Kit gets another shift, Esperanza gets a grocery order, and the diner everyone saved remains open."
            },
            "npcLabel": null,
            "time": 1,
            "response": {
              "speakerId": "mesa_june",
              "speech": "Good. A supper booking is something I can cook.",
              "activity": "Touches the Dalloway’s worn thumb paddle.",
              "emotion": "proud",
              "gesture": "point"
            }
          },
          {
            "id": "ordinary",
            "label": "Come back for an ordinary meal",
            "style": "refusal",
            "outcome": "June corrects the sign herself. A customer reads it carefully, then orders exactly what they were going to order.",
            "signals": [
              "modest_supper"
            ],
            "narration": {
              "personal": "June corrects the sign herself. A customer reads it carefully, then orders exactly what they were going to order.",
              "public": "June corrects the sign herself. A customer reads it carefully, then orders exactly what they were going to order.",
              "npc": "June corrects the sign herself. A customer reads it carefully, then orders exactly what they were going to order."
            },
            "npcLabel": null,
            "time": 0,
            "response": {
              "speakerId": "mesa_june",
              "speech": "We will be open. I cannot make that sound more dramatic.",
              "activity": "Touches the Dalloway’s worn thumb paddle.",
              "emotion": "attentive",
              "gesture": "pause"
            }
          }
        ],
        "npc": "helpful"
      },
      {
        "id": "service",
        "title": "The bell is getting credit",
        "prompt": "An incoming adult announcer calls plates clearly. June adds the memorable lines. A tribute can show both or just the quips.",
        "choices": [
          {
            "id": "full",
            "label": "Show the newcomer calling the plates, too",
            "style": "helpful",
            "outcome": "The newcomer’s clear calls stay in the tribute. June still gets the laugh about Rosa’s eggs. The handover looks like a handover. June agrees to put her bell at the kitchen pass, where it calls out finished plates instead of summoning more work.",
            "signals": [
              "handover_evidence"
            ],
            "set": {
              "fullCredit": true,
              "bellAtPass": true
            },
            "narration": {
              "personal": "The newcomer’s clear calls stay in the tribute. June still gets the laugh about Rosa’s eggs. The handover looks like a handover. June agrees to put her bell at the kitchen pass, where it calls out finished plates instead of summoning more work.",
              "public": "The newcomer’s clear calls stay in the tribute. June still gets the laugh about Rosa’s eggs. The handover looks like a handover. June agrees to put her bell at the kitchen pass, where it calls out finished plates instead of summoning more work.",
              "npc": "The newcomer’s clear calls stay in the tribute. June still gets the laugh about Rosa’s eggs. The handover looks like a handover. June agrees to put her bell at the kitchen pass, where it calls out finished plates instead of summoning more work."
            },
            "npcLabel": "June keeps the newcomer’s plate calls in the tribute",
            "time": 1,
            "response": {
              "speakerId": "mesa_june",
              "speech": "They called the plates. I supplied the remarks.",
              "activity": "Touches the Dalloway’s worn thumb paddle.",
              "emotion": "warm",
              "gesture": "point"
            }
          },
          {
            "id": "june",
            "label": "Make the tribute all about June",
            "style": "selfish",
            "outcome": "The cut keeps June’s quips and loses the voice getting every plate to the right person. The station asks whether June might stay.",
            "signals": [
              "june_tribute"
            ],
            "narration": {
              "personal": "The cut keeps June’s quips and loses the voice getting every plate to the right person. The station asks whether June might stay.",
              "public": "The cut keeps June’s quips and loses the voice getting every plate to the right person. The station asks whether June might stay.",
              "npc": "The cut keeps June’s quips and loses the voice getting every plate to the right person. The station asks whether June might stay."
            },
            "npcLabel": null,
            "time": 1,
            "response": {
              "speakerId": "mesa_june",
              "speech": "I sound very useful when you take everybody else out.",
              "activity": "Touches the Dalloway’s worn thumb paddle.",
              "emotion": "proud",
              "gesture": "point"
            }
          },
          {
            "id": "quiet",
            "label": "Skip the tribute",
            "style": "refusal",
            "outcome": "The station reads the training record. June is disappointed for approximately as long as it takes the next plate to be ready.",
            "signals": [
              "handover_evidence"
            ],
            "set": {
              "fullCredit": true
            },
            "narration": {
              "personal": "The station reads the training record. June is disappointed for approximately as long as it takes the next plate to be ready.",
              "public": "The station reads the training record. June is disappointed for approximately as long as it takes the next plate to be ready.",
              "npc": "The station reads the training record. June is disappointed for approximately as long as it takes the next plate to be ready."
            },
            "npcLabel": null,
            "time": 0,
            "response": {
              "speakerId": "mesa_june",
              "speech": "There is a training record. They can read that.",
              "activity": "Touches the Dalloway’s worn thumb paddle.",
              "emotion": "attentive",
              "gesture": "pause"
            }
          }
        ],
        "npc": "helpful"
      },
      {
        "id": "offer",
        "title": "Four funded evenings",
        "prompt": "The station has four evening shifts. A two-shift retention offer, if made, leaves two for the incoming worker. Diner bookings still stand.",
        "choices": [
          {
            "id": "handover",
            "label": "Back the original handover",
            "style": "helpful",
            "outcome": "June sticks with the diner and lets the newcomer have the four station evenings. She demonstrates not taking over by explaining how little she will take over.",
            "signals": [
              "diner_staffed"
            ],
            "narration": {
              "personal": "June sticks with the diner and lets the newcomer have the four station evenings. She demonstrates not taking over by explaining how little she will take over.",
              "public": "June sticks with the diner and lets the newcomer have the four station evenings. She demonstrates not taking over by explaining how little she will take over.",
              "npc": "June sticks with the diner and lets the newcomer have the four station evenings. She demonstrates not taking over by explaining how little she will take over."
            },
            "npcLabel": "June keeps the original station handover",
            "time": 1,
            "response": {
              "speakerId": "mesa_june",
              "speech": "I would quite like to finish leaving one job.",
              "activity": "Touches the Dalloway’s worn thumb paddle.",
              "emotion": "warm",
              "gesture": "point"
            }
          },
          {
            "id": "split",
            "label": "Back June taking two better-paid station evenings",
            "style": "selfish",
            "outcome": "June takes the split. The newcomer now has two evenings to consider, and the diner needs a cook for meals already sold.",
            "signals": [
              "diner_cover"
            ],
            "unless": "fullCredit",
            "narration": {
              "personal": "June takes the split. The newcomer now has two evenings to consider, and the diner needs a cook for meals already sold.",
              "public": "June takes the split. The newcomer now has two evenings to consider, and the diner needs a cook for meals already sold.",
              "npc": "June takes the split. The newcomer now has two evenings to consider, and the diner needs a cook for meals already sold."
            },
            "npcLabel": null,
            "time": 1,
            "response": {
              "speakerId": "mesa_june",
              "speech": "Two evenings. They have found a persuasive number.",
              "activity": "Touches the Dalloway’s worn thumb paddle.",
              "emotion": "proud",
              "gesture": "point"
            }
          },
          {
            "id": "own_choice",
            "label": "Leave the decision with June",
            "style": "refusal",
            "outcome": "June compares the two rotas, then keeps the handover. “I can hear the bell from here anyway.”",
            "signals": [
              "diner_staffed"
            ],
            "narration": {
              "personal": "June compares the two rotas, then keeps the handover. “I can hear the bell from here anyway.”",
              "public": "June compares the two rotas, then keeps the handover. “I can hear the bell from here anyway.”",
              "npc": "June compares the two rotas, then keeps the handover. “I can hear the bell from here anyway.”"
            },
            "npcLabel": null,
            "time": 0,
            "response": {
              "speakerId": "mesa_june",
              "speech": "Let me look at the actual pay.",
              "activity": "Touches the Dalloway’s worn thumb paddle.",
              "emotion": "attentive",
              "gesture": "pause"
            }
          }
        ],
        "npc": "helpful"
      },
      {
        "id": "breakfast",
        "title": "Who rang for whom?",
        "prompt": "The next meal needs actual cooking. Nobody is employed by a tribute. At breakfast the bell rings for June’s own eggs.",
        "choices": [
          {
            "id": "cover",
            "label": "Work the supper shift",
            "style": "helpful",
            "outcome": "You finish the service. At breakfast the newcomer rings for June’s own eggs. She jumps up, then says she was only checking them.",
            "signals": [
              "meal_served"
            ],
            "commit": "diner-shift",
            "narration": {
              "personal": "You finish the service. At breakfast the newcomer rings for June’s own eggs. She jumps up, then says she was only checking them.",
              "public": "{{actor}} finishes the supper service. At breakfast the newcomer rings for June’s own eggs. She jumps up, then says she was only checking them.",
              "npc": "{{actor}} finishes the supper service. At breakfast the newcomer rings for June’s own eggs. She jumps up, then says she was only checking them."
            },
            "npcLabel": "Kit works the paid supper shift",
            "paidHours": 4,
            "workField": "service",
            "time": 1,
            "response": {
              "speakerId": "mesa_june",
              "speech": "Those are my eggs. I was only checking them.",
              "activity": "Touches the Dalloway’s worn thumb paddle.",
              "emotion": "warm",
              "gesture": "point"
            }
          },
          {
            "id": "smaller",
            "label": "Agree to the simpler supper",
            "style": "selfish",
            "outcome": "The plates are less ambitious and arrive hot. June inspects her eggs with the expression of somebody refusing to supervise.",
            "signals": [
              "simple_menu"
            ],
            "narration": {
              "personal": "The plates are less ambitious and arrive hot. June inspects her eggs with the expression of somebody refusing to supervise.",
              "public": "The plates are less ambitious and arrive hot. June inspects her eggs with the expression of somebody refusing to supervise.",
              "npc": "The plates are less ambitious and arrive hot. June inspects her eggs with the expression of somebody refusing to supervise."
            },
            "npcLabel": null,
            "time": 1,
            "response": {
              "speakerId": "mesa_june",
              "speech": "Hot food. A modest ambition, beautifully met.",
              "activity": "Touches the Dalloway’s worn thumb paddle.",
              "emotion": "proud",
              "gesture": "point"
            }
          },
          {
            "id": "refund",
            "label": "Ask for your unserved supper money back",
            "style": "refusal",
            "outcome": "June reaches for your ticket and the cash drawer. The bell rings for somebody else’s eggs.",
            "signals": [
              "meal_reduced"
            ],
            "narration": {
              "personal": "June reaches for your ticket and the cash drawer. The bell rings for somebody else’s eggs.",
              "public": "June reaches for {{actor}}’s paid ticket and the cash drawer. The bell rings for somebody else’s eggs.",
              "npc": "June reaches for {{actor}}’s paid ticket and the cash drawer. The bell rings for somebody else’s eggs."
            },
            "npcLabel": null,
            "time": 0,
            "response": {
              "speakerId": "mesa_june",
              "speech": "Your ticket. Your money. I can operate both systems.",
              "activity": "Touches the Dalloway’s worn thumb paddle.",
              "emotion": "attentive",
              "gesture": "pause"
            }
          }
        ],
        "npc": "helpful"
      }
    ],
    "place": "CORNER CAFÉ",
    "personal": {
      "id": "own_part",
      "label": "Book your own ordinary supper",
      "outcome": "June takes your supper payment and puts your name on a separate ticket. Kit draws the cup being washed.",
      "narration": {
        "personal": "June takes your supper payment and puts your name on a separate ticket. Kit draws the cup being washed.",
        "public": "{{actor}} makes a separate arrangement of their own.",
        "npc": "June takes your supper payment and puts your name on a separate ticket. Kit draws the cup being washed."
      },
      "cost": 30,
      "time": 1,
      "signals": [
        "personal_supper_order"
      ],
      "response": {
        "speakerId": "mesa_june",
        "speech": "Show me what is actually booked.",
        "activity": "Touches the Dalloway’s worn thumb paddle.",
        "emotion": "warm",
        "gesture": "point"
      }
    }
  },
  {
    "id": "empty_counter",
    "title": "A Very Moving Empty Cup",
    "region": "embermesa",
    "cast": [
      "kit",
      "mesa_june",
      "esperanza_vega"
    ],
    "venue": "embermesa-corner-cafe",
    "object": "six_panel_order_slips",
    "desire": "Kit wants paid shifts and to draw ordinary life on chosen terms.",
    "contradiction": "The picture people finally praise is praised for a disaster that never occurred.",
    "trigger": "Kit’s empty-counter drawing is read as the death of the diner. The counter was empty because somebody was washing a cup.",
    "ignored": "Kit does agreed diner work and draws a next page without a compulsory commission or family disclosure.",
    "beats": [
      {
        "id": "caption",
        "title": "Everyone understood the wrong thing",
        "prompt": "A customer wants a print of the drawing. Kit wants the sentence under it to stop claiming a closure.",
        "choices": [
          {
            "id": "caption",
            "label": "Ask Kit for a caption saying the diner is open",
            "style": "helpful",
            "outcome": "Kit writes that the missing person was washing a cup. A customer says the original was more moving. Kit looks at the customer for some time.",
            "signals": [
              "accurate_drawing"
            ],
            "narration": {
              "personal": "Kit writes that the missing person was washing a cup. A customer says the original was more moving. Kit looks at the customer for some time.",
              "public": "Kit writes that the missing person was washing a cup. A customer says the original was more moving. Kit looks at the customer for some time.",
              "npc": "Kit writes that the missing person was washing a cup. A customer says the original was more moving. Kit looks at the customer for some time."
            },
            "npcLabel": "Kit corrects the drawing’s caption",
            "time": 1,
            "response": {
              "speakerId": "kit",
              "speech": "The cup was being washed.",
              "activity": "Turns the order-slip drawing toward you.",
              "emotion": "warm",
              "gesture": "point"
            }
          },
          {
            "id": "buy",
            "label": "Buy a new page about an ordinary day",
            "style": "selfish",
            "outcome": "Kit accepts the commission and asks which ordinary day you meant. No one has to disappear from it.",
            "signals": [
              "art_commission"
            ],
            "cost": 180,
            "narration": {
              "personal": "Kit accepts the commission and asks which ordinary day you meant. No one has to disappear from it.",
              "public": "Kit accepts {{actor}}’s commission and asks which ordinary day the page should show. No one has to disappear from it.",
              "npc": "Kit accepts {{actor}}’s commission and asks which ordinary day the page should show. No one has to disappear from it."
            },
            "npcLabel": null,
            "time": 1,
            "response": {
              "speakerId": "kit",
              "speech": "An ordinary day. I can draw one of those.",
              "activity": "Turns the order-slip drawing toward you.",
              "emotion": "proud",
              "gesture": "point"
            }
          },
          {
            "id": "leave",
            "label": "Leave the drawing with Kit",
            "style": "refusal",
            "outcome": "Kit puts the page away and returns to the sink. The counter becomes briefly empty again.",
            "signals": [
              "art_private"
            ],
            "narration": {
              "personal": "Kit puts the page away and returns to the sink. The counter becomes briefly empty again.",
              "public": "Kit puts the page away and returns to the sink. The counter becomes briefly empty again.",
              "npc": "Kit puts the page away and returns to the sink. The counter becomes briefly empty again."
            },
            "npcLabel": null,
            "time": 0,
            "response": {
              "speakerId": "kit",
              "speech": "I will keep the drawing, then.",
              "activity": "Turns the order-slip drawing toward you.",
              "emotion": "attentive",
              "gesture": "pause"
            }
          }
        ],
        "npc": "helpful"
      },
      {
        "id": "next_page",
        "title": "Can the next one be sadder?",
        "prompt": "The next page shows a cup being returned. A buyer calls it a sequel with insufficient loss.",
        "choices": [
          {
            "id": "ordinary",
            "label": "Keep the page about the returned cup",
            "style": "helpful",
            "outcome": "The cup comes back in panel six. The buyer asks if it could return more sadly. Kit leaves it as it is.",
            "signals": [
              "ordinary_art"
            ],
            "narration": {
              "personal": "The cup comes back in panel six. The buyer asks if it could return more sadly. Kit leaves it as it is.",
              "public": "The cup comes back in panel six. The buyer asks if it could return more sadly. Kit leaves it as it is.",
              "npc": "The cup comes back in panel six. The buyer asks if it could return more sadly. Kit leaves it as it is."
            },
            "npcLabel": "Kit keeps the ordinary returned-cup ending",
            "time": 1,
            "response": {
              "speakerId": "kit",
              "speech": "Yes. The cup comes back.",
              "activity": "Turns the order-slip drawing toward you.",
              "emotion": "warm",
              "gesture": "point"
            }
          },
          {
            "id": "poster",
            "label": "Commission a new event poster",
            "style": "selfish",
            "outcome": "Kit takes down the date, place and price. “And this one is actually happening?”",
            "signals": [
              "poster_offer"
            ],
            "cost": 240,
            "narration": {
              "personal": "Kit takes down the date, place and price. “And this one is actually happening?”",
              "public": "Kit takes down the date, place and price. “And this one is actually happening?”",
              "npc": "Kit takes down the date, place and price. “And this one is actually happening?”"
            },
            "npcLabel": null,
            "time": 1,
            "response": {
              "speakerId": "kit",
              "speech": "A new poster. Let us put the actual time on it.",
              "activity": "Turns the order-slip drawing toward you.",
              "emotion": "proud",
              "gesture": "point"
            }
          },
          {
            "id": "no_work",
            "label": "Ask for no more drawings",
            "style": "refusal",
            "outcome": "Kit finishes the shift. The next page waits beside a clean cup.",
            "signals": [
              "art_private"
            ],
            "narration": {
              "personal": "Kit finishes the shift. The next page waits beside a clean cup.",
              "public": "Kit finishes the shift. The next page waits beside a clean cup.",
              "npc": "Kit finishes the shift. The next page waits beside a clean cup."
            },
            "npcLabel": null,
            "time": 0,
            "response": {
              "speakerId": "kit",
              "speech": "The next page can wait until the shift ends.",
              "activity": "Turns the order-slip drawing toward you.",
              "emotion": "attentive",
              "gesture": "pause"
            }
          }
        ],
        "npc": "helpful"
      }
    ],
    "place": "CORNER CAFÉ",
    "personal": {
      "id": "own_part",
      "label": "Commission your own ordinary-life page",
      "outcome": "Kit accepts a separate page commission. You ask for an ordinary cup, and get asked what is so unusual about that.",
      "narration": {
        "personal": "Kit accepts a separate page commission. You ask for an ordinary cup, and get asked what is so unusual about that.",
        "public": "{{actor}} makes a separate arrangement of their own.",
        "npc": "Kit accepts a separate page commission. You ask for an ordinary cup, and get asked what is so unusual about that."
      },
      "cost": 180,
      "time": 1,
      "signals": [
        "art_commission"
      ],
      "response": {
        "speakerId": "kit",
        "speech": "I can draw an ordinary day. It is allowed to be ordinary.",
        "activity": "Turns the order-slip drawing toward you.",
        "emotion": "warm",
        "gesture": "point"
      }
    }
  },
  {
    "id": "route_green",
    "title": "The Convenient Extra Stop",
    "region": "embermesa",
    "cast": [
      "esperanza_vega",
      "mesa_inez",
      "mesa_june"
    ],
    "venue": "embermesa-market",
    "object": "route_green_grocery_van",
    "desire": "Esperanza wants her grocery round profitable and her afternoon free.",
    "contradiction": "She enjoys the practical joke of calling an inconvenient detour “on the way” until customers learn the phrase.",
    "trigger": "The Route-Green van has one spare crate space and a route that does not pass every favorite venue.",
    "ignored": "Esperanza makes her ordinary paid route; extra stops nobody purchased do not become her obligations.",
    "beats": [
      {
        "id": "crate",
        "title": "On the way to somewhere else",
        "prompt": "A diner order, a garden collection and ordinary households could use the spare space. They cannot all fit.",
        "choices": [
          {
            "id": "food",
            "label": "Book the spare crate for diner food",
            "style": "helpful",
            "outcome": "Esperanza writes DINER on the crate space. “On the way,” she says, then shows you the actual route.",
            "signals": [
              "diner_supply"
            ],
            "cost": 72,
            "narration": {
              "personal": "Esperanza writes DINER on the crate space. “On the way,” she says, then shows you the actual route.",
              "public": "Esperanza writes DINER on the crate space. “On the way,” she says, then shows {{actor}} the actual route.",
              "npc": "Esperanza writes DINER on the crate space. “On the way,” she says, then shows {{actor}} the actual route."
            },
            "npcLabel": "June buys the diner’s spare-crate space",
            "time": 1,
            "response": {
              "speakerId": "esperanza_vega",
              "speech": "That crate fits. I can promise what fits.",
              "activity": "Checks the one remaining space in the van.",
              "emotion": "warm",
              "gesture": "point"
            }
          },
          {
            "id": "garden",
            "label": "Book the spare crate for the garden exchange",
            "style": "selfish",
            "outcome": "The garden gets the space. June will need another supplier or a different menu. Esperanza closes the rear door before anybody finds another crate.",
            "signals": [
              "garden_crate"
            ],
            "cost": 60,
            "narration": {
              "personal": "The garden gets the space. June will need another supplier or a different menu. Esperanza closes the rear door before anybody finds another crate.",
              "public": "The garden gets the space. June will need another supplier or a different menu. Esperanza closes the rear door before anybody finds another crate.",
              "npc": "The garden gets the space. June will need another supplier or a different menu. Esperanza closes the rear door before anybody finds another crate."
            },
            "npcLabel": null,
            "time": 1,
            "response": {
              "speakerId": "esperanza_vega",
              "speech": "The garden crate, then. The van remains the same size.",
              "activity": "Checks the one remaining space in the van.",
              "emotion": "proud",
              "gesture": "point"
            }
          },
          {
            "id": "empty",
            "label": "Leave the spare space unbooked",
            "style": "refusal",
            "outcome": "Esperanza carries the ordinary groceries and finishes her route. The van is allowed to contain air.",
            "signals": [
              "van_free"
            ],
            "narration": {
              "personal": "Esperanza carries the ordinary groceries and finishes her route. The van is allowed to contain air.",
              "public": "Esperanza carries the ordinary groceries and finishes her route. The van is allowed to contain air.",
              "npc": "Esperanza carries the ordinary groceries and finishes her route. The van is allowed to contain air."
            },
            "npcLabel": null,
            "time": 0,
            "response": {
              "speakerId": "esperanza_vega",
              "speech": "Unbooked is a lovely short instruction.",
              "activity": "Checks the one remaining space in the van.",
              "emotion": "attentive",
              "gesture": "pause"
            }
          }
        ],
        "npc": "helpful"
      },
      {
        "id": "stop",
        "title": "The shortest long way round",
        "prompt": "Esperanza offers one additional collection on clear terms. She tells the joke first and the actual price immediately afterward.",
        "choices": [
          {
            "id": "window",
            "label": "Collect at the early shared stop",
            "style": "helpful",
            "outcome": "Esperanza can unload several orders together. She finishes while it is still her afternoon.",
            "signals": [
              "collection_window"
            ],
            "narration": {
              "personal": "Esperanza can unload several orders together. She finishes while it is still her afternoon.",
              "public": "Esperanza can unload several orders together. She finishes while it is still her afternoon.",
              "npc": "Esperanza can unload several orders together. She finishes while it is still her afternoon."
            },
            "npcLabel": "June chooses Esperanza’s early shared collection",
            "time": 1,
            "response": {
              "speakerId": "esperanza_vega",
              "speech": "This stop really is on the way.",
              "activity": "Checks the one remaining space in the van.",
              "emotion": "warm",
              "gesture": "point"
            }
          },
          {
            "id": "private",
            "label": "Pay for the one late stop",
            "style": "selfish",
            "outcome": "Your late stop goes on the route. The next person to ask is shown the early collection time.",
            "signals": [
              "late_stop"
            ],
            "cost": 45,
            "narration": {
              "personal": "Your late stop goes on the route. The next person to ask is shown the early collection time.",
              "public": "{{actor}}’s late stop goes on the route. The next customer is shown the early collection time.",
              "npc": "{{actor}}’s late stop goes on the route. The next customer is shown the early collection time."
            },
            "npcLabel": null,
            "time": 1,
            "response": {
              "speakerId": "esperanza_vega",
              "speech": "One late stop. Mine is a van, not a second afternoon.",
              "activity": "Checks the one remaining space in the van.",
              "emotion": "proud",
              "gesture": "point"
            }
          },
          {
            "id": "decline",
            "label": "Skip the extra stop",
            "style": "refusal",
            "outcome": "Esperanza folds the route sheet. “I was nearly on the way.”",
            "signals": [
              "collection_window"
            ],
            "narration": {
              "personal": "Esperanza folds the route sheet. “I was nearly on the way.”",
              "public": "Esperanza folds the route sheet. “I was nearly on the way.”",
              "npc": "Esperanza folds the route sheet. “I was nearly on the way.”"
            },
            "npcLabel": null,
            "time": 0,
            "response": {
              "speakerId": "esperanza_vega",
              "speech": "I may finish my route before explaining the route.",
              "activity": "Checks the one remaining space in the van.",
              "emotion": "attentive",
              "gesture": "pause"
            }
          }
        ],
        "npc": "helpful"
      }
    ],
    "place": "MARKET",
    "personal": {
      "id": "own_part",
      "label": "Collect your own groceries early",
      "outcome": "Esperanza leaves your own groceries at the ordinary early stop. It is on the way this time, which makes her explanation considerably shorter.",
      "narration": {
        "personal": "Esperanza leaves your own groceries at the ordinary early stop. It is on the way this time, which makes her explanation considerably shorter.",
        "public": "{{actor}} makes a separate arrangement of their own.",
        "npc": "Esperanza leaves your own groceries at the ordinary early stop. It is on the way this time, which makes her explanation considerably shorter."
      },
      "cost": 36,
      "time": 1,
      "signals": [],
      "response": {
        "speakerId": "esperanza_vega",
        "speech": "Here is the route. Here is the space that is left.",
        "activity": "Checks the one remaining space in the van.",
        "emotion": "warm",
        "gesture": "point"
      }
    }
  },
  {
    "id": "commentary",
    "title": "The Quieter Radio",
    "region": "embermesa",
    "cast": [
      "rosa_moreno",
      "mesa_june",
      "mateo_moreno"
    ],
    "venue": "embermesa-community",
    "object": "touchline_radio",
    "desire": "Rosa wants the match audible during a visit she actually chose.",
    "contradiction": "Lowering the radio makes her own commentary much louder.",
    "trigger": "The Touchline radio shares a table with an announced supper speech.",
    "ignored": "Rosa keeps her chosen visit, listens to the result and gives an opinion afterward. Her approval never decides June’s employment.",
    "beats": [
      {
        "id": "volume",
        "title": "A quieter machine, a louder person",
        "prompt": "A speech is due during the match. Rosa has an excellent memory for decisions the referee never made.",
        "choices": [
          {
            "id": "time",
            "label": "Put the speech at half-time",
            "style": "helpful",
            "outcome": "Rosa agrees, then supplies a short explanation of why the referee will also need the interval.",
            "signals": [
              "interval_slot"
            ],
            "narration": {
              "personal": "Rosa agrees, then supplies a short explanation of why the referee will also need the interval.",
              "public": "Rosa agrees, then supplies a short explanation of why the referee will also need the interval.",
              "npc": "Rosa agrees, then supplies a short explanation of why the referee will also need the interval."
            },
            "npcLabel": "Rosa agrees to the half-time speech",
            "time": 1,
            "response": {
              "speakerId": "rosa_moreno",
              "speech": "Half-time. Unless somebody does something at half-time.",
              "activity": "Turns the radio down and leans closer.",
              "emotion": "warm",
              "gesture": "point"
            }
          },
          {
            "id": "match",
            "label": "Sit at the match table",
            "style": "selfish",
            "outcome": "The radio gets its table. The speech moves to a smaller space, where Rosa’s commentary can still be heard faintly.",
            "signals": [
              "listening_table"
            ],
            "narration": {
              "personal": "The radio gets its table. The speech moves to a smaller space, where Rosa’s commentary can still be heard faintly.",
              "public": "The radio gets its table. The speech moves to a smaller space, where Rosa’s commentary can still be heard faintly.",
              "npc": "The radio gets its table. The speech moves to a smaller space, where Rosa’s commentary can still be heard faintly."
            },
            "npcLabel": null,
            "time": 1,
            "response": {
              "speakerId": "rosa_moreno",
              "speech": "You will want to hear this decision.",
              "activity": "Turns the radio down and leans closer.",
              "emotion": "proud",
              "gesture": "point"
            }
          },
          {
            "id": "leave",
            "label": "Make it a short visit",
            "style": "refusal",
            "outcome": "You leave before the speech. Rosa keeps listening; the radio does not have to become quieter on your account.",
            "signals": [
              "radio_ordinary"
            ],
            "narration": {
              "personal": "You leave before the speech. Rosa keeps listening; the radio does not have to become quieter on your account.",
              "public": "{{actor}} leaves before the speech. Rosa keeps listening; the radio no longer needs to accommodate that visit.",
              "npc": "{{actor}} leaves before the speech. Rosa keeps listening; the radio no longer needs to accommodate that visit."
            },
            "npcLabel": null,
            "time": 0,
            "response": {
              "speakerId": "rosa_moreno",
              "speech": "The radio will still be here.",
              "activity": "Turns the radio down and leans closer.",
              "emotion": "attentive",
              "gesture": "pause"
            }
          }
        ],
        "npc": "helpful"
      },
      {
        "id": "result",
        "title": "She was right about the wrong goal",
        "prompt": "Rosa’s predicted score is correct for a reason her commentary did not include. She would like the result preserved and the explanation shortened.",
        "choices": [
          {
            "id": "accurate",
            "label": "Put up the score and leave out Rosa’s prediction",
            "style": "helpful",
            "outcome": "The score is right. Rosa’s explanation of how she knew takes longer than the match report. The table opens again.",
            "signals": [
              "table_released"
            ],
            "narration": {
              "personal": "The score is right. Rosa’s explanation of how she knew takes longer than the match report. The table opens again.",
              "public": "The score is right. Rosa’s explanation of how she knew takes longer than the match report. The table opens again.",
              "npc": "The score is right. Rosa’s explanation of how she knew takes longer than the match report. The table opens again."
            },
            "npcLabel": "Rosa agrees to a plain result notice",
            "time": 1,
            "response": {
              "speakerId": "rosa_moreno",
              "speech": "The score was right. We need not discuss the method.",
              "activity": "Turns the radio down and leans closer.",
              "emotion": "warm",
              "gesture": "point"
            }
          },
          {
            "id": "encore",
            "label": "Book a later replay table",
            "style": "selfish",
            "outcome": "Rosa secures a table for the replay. There is now an opportunity to be right about the referee twice.",
            "signals": [
              "replay_table"
            ],
            "cost": 24,
            "narration": {
              "personal": "Rosa secures a table for the replay. There is now an opportunity to be right about the referee twice.",
              "public": "Rosa secures a table for the replay. There is now an opportunity to be right about the referee twice.",
              "npc": "Rosa secures a table for the replay. There is now an opportunity to be right about the referee twice."
            },
            "npcLabel": null,
            "time": 1,
            "response": {
              "speakerId": "rosa_moreno",
              "speech": "A replay. Good. This time watch the referee.",
              "activity": "Turns the radio down and leans closer.",
              "emotion": "proud",
              "gesture": "point"
            }
          },
          {
            "id": "end",
            "label": "Finish the visit",
            "style": "refusal",
            "outcome": "The match ends, the table clears, and Rosa retains a very specific opinion.",
            "signals": [
              "table_released"
            ],
            "narration": {
              "personal": "The match ends, the table clears, and Rosa retains a very specific opinion.",
              "public": "The match ends, the table clears, and Rosa retains a very specific opinion.",
              "npc": "The match ends, the table clears, and Rosa retains a very specific opinion."
            },
            "npcLabel": null,
            "time": 0,
            "response": {
              "speakerId": "rosa_moreno",
              "speech": "I was right about the result.",
              "activity": "Turns the radio down and leans closer.",
              "emotion": "attentive",
              "gesture": "pause"
            }
          }
        ],
        "npc": "helpful"
      }
    ],
    "place": "COMMUNITY",
    "personal": {
      "id": "own_part",
      "label": "Join Rosa for the result",
      "outcome": "You hear the result and Rosa’s version of it. These are delivered in that order, but not at equal length.",
      "narration": {
        "personal": "You hear the result and Rosa’s version of it. These are delivered in that order, but not at equal length.",
        "public": "{{actor}} makes a separate arrangement of their own.",
        "npc": "You hear the result and Rosa’s version of it. These are delivered in that order, but not at equal length."
      },
      "cost": 0,
      "time": 1,
      "signals": [],
      "response": {
        "speakerId": "rosa_moreno",
        "speech": "We can fit that around the match.",
        "activity": "Turns the radio down and leans closer.",
        "emotion": "warm",
        "gesture": "point"
      }
    }
  },
  {
    "id": "bracken",
    "title": "Equipment, Transparently",
    "region": "alder",
    "cast": [
      "nell_harper",
      "ruth_harper",
      "jonah_bell",
      "neri",
      "mina"
    ],
    "venue": "alder-apartments",
    "object": "bracken",
    "desire": "Nell wants mobility, rehearsal and a bed she has not actually reserved.",
    "contradiction": "She labels everything except the plan; the equipment has a visible duvet inside.",
    "trigger": "Nell’s introduction succeeds: Jonah rents Ruth’s spare room and Ruth can fund her holiday.",
    "ignored": "Jonah’s tenancy stands. Nell must make her own accommodation and rehearsal choices; Ruth leaves on the trip she booked.",
    "beats": [
      {
        "id": "room",
        "title": "A useful introduction",
        "prompt": "Ruth owns the room. Jonah has paid for it, which funds Ruth’s booked holiday. Nell owns the Bracken and the blue-check duvet visible through its head. She says it is equipment. It is also her unspoken plan for a bed.",
        "choices": [
          {
            "id": "clarify",
            "label": "Ask Nell where she is actually sleeping",
            "style": "prevention",
            "outcome": "Nell names a different bed. Ruth’s storage permission and Jonah’s tenancy remain two separate sentences. The duvet stays visible.",
            "signals": [
              "room_clear"
            ],
            "set": {
              "clarified": true
            },
            "narration": {
              "personal": "Nell names a different bed. Ruth’s storage permission and Jonah’s tenancy remain two separate sentences. The duvet stays visible.",
              "public": "Nell names a different bed. Ruth’s storage permission and Jonah’s tenancy remain two separate sentences. The duvet stays visible.",
              "npc": "Nell names a different bed. Ruth’s storage permission and Jonah’s tenancy remain two separate sentences. The duvet stays visible."
            },
            "npcLabel": "Nell names her actual bed and separates the storage request",
            "time": 1,
            "response": {
              "speakerId": "nell_harper",
              "speech": "I had not written sleeping down as a separate question.",
              "activity": "Sets a hand on the transparent drumhead.",
              "emotion": "warm",
              "gesture": "point"
            }
          },
          {
            "id": "storage",
            "label": "Ask Ruth for a few days’ drum storage",
            "style": "selfish",
            "outcome": "Ruth gives a collection date. Nell labels it STORAGE. Jonah points to the duvet without saying anything.",
            "signals": [
              "drum_storage"
            ],
            "narration": {
              "personal": "Ruth gives a collection date. Nell labels it STORAGE. Jonah points to the duvet without saying anything.",
              "public": "Ruth gives a collection date. Nell labels it STORAGE. Jonah points to the duvet without saying anything.",
              "npc": "Ruth gives a collection date. Nell labels it STORAGE. Jonah points to the duvet without saying anything."
            },
            "npcLabel": null,
            "time": 1,
            "response": {
              "speakerId": "nell_harper",
              "speech": "It is one drum. The duvet is part of the sound.",
              "activity": "Sets a hand on the transparent drumhead.",
              "emotion": "proud",
              "gesture": "point"
            }
          },
          {
            "id": "boundary",
            "label": "Leave Nell to sort out her bed",
            "style": "refusal",
            "outcome": "Jonah keeps the paid room. Nell looks at the drum, which remains more transparent than the plan.",
            "signals": [
              "room_clear"
            ],
            "narration": {
              "personal": "Jonah keeps the paid room. Nell looks at the drum, which remains more transparent than the plan.",
              "public": "Jonah keeps the paid room. Nell looks at the drum, which remains more transparent than the plan.",
              "npc": "Jonah keeps the paid room. Nell looks at the drum, which remains more transparent than the plan."
            },
            "npcLabel": null,
            "time": 0,
            "response": {
              "speakerId": "nell_harper",
              "speech": "I can find a bed. I did make a very good introduction.",
              "activity": "Sets a hand on the transparent drumhead.",
              "emotion": "attentive",
              "gesture": "pause"
            }
          }
        ],
        "npc": "selfish"
      },
      {
        "id": "destination",
        "title": "The drum has three invitations",
        "prompt": "Mina has a rehearsal slot. Neri has sent onward-travel details from their current location; nobody has promised to meet at Alder. Jonah needs the floor space. These are different destinations.",
        "choices": [
          {
            "id": "rehearse",
            "label": "Take the drum to rehearsal storage",
            "style": "helpful",
            "outcome": "Mina has room for the instrument. Nell still has to answer about the rehearsal. Jonah can finally see that corner of the floor.",
            "signals": [
              "drum_rehearsal"
            ],
            "narration": {
              "personal": "Mina has room for the instrument. Nell still has to answer about the rehearsal. Jonah can finally see that corner of the floor.",
              "public": "Mina has room for the instrument. Nell still has to answer about the rehearsal. Jonah can finally see that corner of the floor.",
              "npc": "Mina has room for the instrument. Nell still has to answer about the rehearsal. Jonah can finally see that corner of the floor."
            },
            "npcLabel": "Nell puts the Bracken into rehearsal storage",
            "time": 1,
            "response": {
              "speakerId": "nell_harper",
              "speech": "The rehearsal room can take it. That is one destination.",
              "activity": "Sets a hand on the transparent drumhead.",
              "emotion": "warm",
              "gesture": "point"
            }
          },
          {
            "id": "travel",
            "label": "Pay to take the drum on Nell’s chosen trip",
            "style": "selfish",
            "outcome": "Nell chooses the onward journey. The rehearsal loses its drum, the bedroom loses its duvet, and the ferry gains an awkwardly round bag.",
            "signals": [
              "drum_travel"
            ],
            "cost": 60,
            "narration": {
              "personal": "Nell chooses the onward journey. The rehearsal loses its drum, the bedroom loses its duvet, and the ferry gains an awkwardly round bag.",
              "public": "Nell chooses the onward journey. The rehearsal loses its drum, the bedroom loses its duvet, and the ferry gains an awkwardly round bag.",
              "npc": "Nell chooses the onward journey. The rehearsal loses its drum, the bedroom loses its duvet, and the ferry gains an awkwardly round bag."
            },
            "npcLabel": null,
            "time": 1,
            "response": {
              "speakerId": "nell_harper",
              "speech": "The drum is coming. I have also decided to come.",
              "activity": "Sets a hand on the transparent drumhead.",
              "emotion": "proud",
              "gesture": "point"
            }
          },
          {
            "id": "separate",
            "label": "Let Nell arrange separate lodging",
            "style": "refusal",
            "outcome": "Nell books a modest bed. “It is a bed,” Jonah says, relieved that this word now means one thing.",
            "signals": [
              "room_clear"
            ],
            "narration": {
              "personal": "Nell books a modest bed. “It is a bed,” Jonah says, relieved that this word now means one thing.",
              "public": "Nell books a modest bed. “It is a bed,” Jonah says, relieved that this word now means one thing.",
              "npc": "Nell books a modest bed. “It is a bed,” Jonah says, relieved that this word now means one thing."
            },
            "npcLabel": null,
            "time": 0,
            "response": {
              "speakerId": "nell_harper",
              "speech": "A bed that has actually been booked. Very novel.",
              "activity": "Sets a hand on the transparent drumhead.",
              "emotion": "attentive",
              "gesture": "pause"
            }
          }
        ],
        "npc": "helpful"
      },
      {
        "id": "quay",
        "title": "Only seeing her off",
        "prompt": "Ruth’s departure coincides with the onward route Neri described by message. Neri joins a brief call from their current location. If Nell clarified the plans, this is simply an awkward goodbye.",
        "choices": [
          {
            "id": "plain",
            "label": "Say which journeys have actually been booked",
            "style": "helpful",
            "outcome": "Ruth gets the departure film with everyone’s real plans. Jonah tries “ensuite drummer” again. Nell requests less commentary.",
            "signals": [
              "honest_departure"
            ],
            "narration": {
              "personal": "Ruth gets the departure film with everyone’s real plans. Jonah tries “ensuite drummer” again. Nell requests less commentary.",
              "public": "Ruth gets the departure film with everyone’s real plans. Jonah tries “ensuite drummer” again. Nell requests less commentary.",
              "npc": "Ruth gets the departure film with everyone’s real plans. Jonah tries “ensuite drummer” again. Nell requests less commentary."
            },
            "npcLabel": "Nell states the booked journeys plainly",
            "time": 1,
            "response": {
              "speakerId": "nell_harper",
              "speech": "All right. The same explanation for everybody.",
              "activity": "Sets a hand on the transparent drumhead.",
              "emotion": "warm",
              "gesture": "point"
            }
          },
          {
            "id": "versions",
            "label": "Let the three explanations meet in Ruth’s film",
            "style": "selfish",
            "outcome": "On the agreed video call, Neri sees luggage. At the Alder quay, Ruth sees a goodbye and Jonah sees the duvet heading up the ramp. Nell tries one sentence for all three audiences. Neri remains at their current location.",
            "signals": [
              "duvet_reveal"
            ],
            "unless": "clarified",
            "narration": {
              "personal": "On the agreed video call, Neri sees luggage. At the Alder quay, Ruth sees a goodbye and Jonah sees the duvet heading up the ramp. Nell tries one sentence for all three audiences. Neri remains at their current location.",
              "public": "On the agreed video call, Neri sees luggage. At the Alder quay, Ruth sees a goodbye and Jonah sees the duvet heading up the ramp. Nell tries one sentence for all three audiences. Neri remains at their current location.",
              "npc": "On the agreed video call, Neri sees luggage. At the Alder quay, Ruth sees a goodbye and Jonah sees the duvet heading up the ramp. Nell tries one sentence for all three audiences. Neri remains at their current location."
            },
            "npcLabel": null,
            "time": 1,
            "response": {
              "speakerId": "nell_harper",
              "speech": "I may have described the plan in different levels of detail.",
              "activity": "Sets a hand on the transparent drumhead.",
              "emotion": "proud",
              "gesture": "point"
            }
          },
          {
            "id": "outside",
            "label": "Stay out of the departure film",
            "style": "refusal",
            "outcome": "Ruth films the people who want to be in it. Jonah’s joke can still be heard from off camera.",
            "signals": [
              "honest_departure"
            ],
            "narration": {
              "personal": "Ruth films the people who want to be in it. Jonah’s joke can still be heard from off camera.",
              "public": "Ruth films the people who want to be in it. Jonah’s joke can still be heard from off camera.",
              "npc": "Ruth films the people who want to be in it. Jonah’s joke can still be heard from off camera."
            },
            "npcLabel": null,
            "time": 0,
            "response": {
              "speakerId": "nell_harper",
              "speech": "Ruth can film her own goodbye.",
              "activity": "Sets a hand on the transparent drumhead.",
              "emotion": "attentive",
              "gesture": "pause"
            }
          }
        ],
        "npc": "helpful"
      },
      {
        "id": "night",
        "title": "A genuinely quiet laugh",
        "prompt": "The room belongs to Jonah for the agreed term. The drum is where its owner chose to take it.",
        "choices": [
          {
            "id": "respect",
            "label": "Leave Jonah a quiet night",
            "style": "helpful",
            "outcome": "Jonah lies down in a genuinely quiet room, then begins laughing at the joke again.",
            "signals": [
              "quiet_room"
            ],
            "narration": {
              "personal": "Jonah lies down in a genuinely quiet room, then begins laughing at the joke again.",
              "public": "Jonah lies down in a genuinely quiet room, then begins laughing at the joke again.",
              "npc": "Jonah lies down in a genuinely quiet room, then begins laughing at the joke again."
            },
            "npcLabel": "Nell leaves Jonah a quiet night",
            "time": 1,
            "response": {
              "speakerId": "nell_harper",
              "speech": "Jonah has the room. I have somewhere to sleep.",
              "activity": "Sets a hand on the transparent drumhead.",
              "emotion": "warm",
              "gesture": "point"
            }
          },
          {
            "id": "ask",
            "label": "Ask Jonah about an opening after some sleep",
            "style": "selfish",
            "outcome": "Jonah agrees to a later audition. “The first version or the ensuite version?” The question survives the entire walk home.",
            "signals": [
              "comedy_opening"
            ],
            "narration": {
              "personal": "Jonah agrees to a later audition. “The first version or the ensuite version?” The question survives the entire walk home.",
              "public": "Jonah agrees to a later audition. “The first version or the ensuite version?” The question survives the entire walk home.",
              "npc": "Jonah agrees to a later audition. “The first version or the ensuite version?” The question survives the entire walk home."
            },
            "npcLabel": null,
            "time": 1,
            "response": {
              "speakerId": "nell_harper",
              "speech": "Ask after he has slept. The joke might improve.",
              "activity": "Sets a hand on the transparent drumhead.",
              "emotion": "proud",
              "gesture": "point"
            }
          },
          {
            "id": "end",
            "label": "Leave everyone to their next stop",
            "style": "refusal",
            "outcome": "Ruth travels, Jonah sleeps and Nell goes to the bed she really booked. The labels can finally catch up.",
            "signals": [
              "quiet_room"
            ],
            "narration": {
              "personal": "Ruth travels, Jonah sleeps and Nell goes to the bed she really booked. The labels can finally catch up.",
              "public": "Ruth travels, Jonah sleeps and Nell goes to the bed she really booked. The labels can finally catch up.",
              "npc": "Ruth travels, Jonah sleeps and Nell goes to the bed she really booked. The labels can finally catch up."
            },
            "npcLabel": null,
            "time": 0,
            "response": {
              "speakerId": "nell_harper",
              "speech": "I have my own next stop.",
              "activity": "Sets a hand on the transparent drumhead.",
              "emotion": "attentive",
              "gesture": "pause"
            }
          }
        ],
        "npc": "helpful"
      }
    ],
    "place": "APARTMENTS",
    "personal": {
      "id": "own_part",
      "label": "Ask Nell about the next rehearsal",
      "outcome": "Nell answers your rehearsal question without offering Jonah’s room or his evening. The Bracken is still transparent about the duvet.",
      "narration": {
        "personal": "Nell answers your rehearsal question without offering Jonah’s room or his evening. The Bracken is still transparent about the duvet.",
        "public": "{{actor}} makes a separate arrangement of their own.",
        "npc": "Nell answers your rehearsal question without offering Jonah’s room or his evening. The Bracken is still transparent about the duvet."
      },
      "cost": 0,
      "time": 1,
      "signals": [],
      "response": {
        "speakerId": "nell_harper",
        "speech": "I can make one actual plan. Let me make it.",
        "activity": "Sets a hand on the transparent drumhead.",
        "emotion": "warm",
        "gesture": "point"
      }
    }
  },
  {
    "id": "late_loaf",
    "title": "Tomorrow’s Bread, Yesterday’s Hours",
    "region": "alder",
    "cast": [
      "hugo",
      "alder_tess",
      "eli",
      "jonah_bell"
    ],
    "venue": "alder-market",
    "object": "hugos_late_shift_loaf",
    "desire": "Hugo wants night workers to have good bread and the baking day to end.",
    "contradiction": "The late-shift loaf is praised as an exclusive sunrise product by people who slept through the work.",
    "trigger": "One finite late batch is ready; an early café customer calls it a new luxury line.",
    "ignored": "Hugo sells the normal batch, reserves the known night-worker orders and refuses an unlimited run.",
    "beats": [
      {
        "id": "batch",
        "title": "A new line that is the old line",
        "prompt": "A café order can pay for the batch. Taking all of it would remove the portions Hugo already earmarked for night workers.",
        "choices": [
          {
            "id": "reserve",
            "label": "Buy the café quantity after the night-worker portions",
            "style": "helpful",
            "outcome": "Hugo boxes the café order separately. Jonah’s loaf keeps its name. The café customer asks whether the remaining bread is more exclusive.",
            "signals": [
              "loaf_balanced",
              "cafe_bread_order"
            ],
            "cost": 48,
            "narration": {
              "personal": "Hugo boxes the café order separately. Jonah’s loaf keeps its name. The café customer asks whether the remaining bread is more exclusive.",
              "public": "Hugo boxes the café order separately. Jonah’s loaf keeps its name. The café customer asks whether the remaining bread is more exclusive.",
              "npc": "Hugo boxes the café order separately. Jonah’s loaf keeps its name. The café customer asks whether the remaining bread is more exclusive."
            },
            "npcLabel": "Tess buys the café quantity after the protected portions",
            "time": 1,
            "response": {
              "speakerId": "hugo",
              "speech": "The night-worker parcels are already spoken for.",
              "activity": "Folds the paper around a waiting loaf.",
              "emotion": "warm",
              "gesture": "point"
            }
          },
          {
            "id": "extra",
            "label": "Pay for one extra batch",
            "style": "selfish",
            "outcome": "Hugo takes the extra order and crosses out a later demonstration. The bread will be special; his missed rest will be quite ordinary.",
            "signals": [
              "loaf_extra",
              "cafe_bread_order"
            ],
            "cost": 96,
            "narration": {
              "personal": "Hugo takes the extra order and crosses out a later demonstration. The bread will be special; his missed rest will be quite ordinary.",
              "public": "Hugo takes the extra order and crosses out a later demonstration. The bread will be special; his missed rest will be quite ordinary.",
              "npc": "Hugo takes the extra order and crosses out a later demonstration. The bread will be special; his missed rest will be quite ordinary."
            },
            "npcLabel": null,
            "time": 1,
            "response": {
              "speakerId": "hugo",
              "speech": "Another batch, then. That also means another batch of work.",
              "activity": "Folds the paper around a waiting loaf.",
              "emotion": "proud",
              "gesture": "point"
            }
          },
          {
            "id": "normal",
            "label": "Leave Hugo with the usual batch",
            "style": "refusal",
            "outcome": "Hugo serves the night workers and closes on time. Nobody has discovered an exclusive product today.",
            "signals": [
              "baker_free"
            ],
            "narration": {
              "personal": "Hugo serves the night workers and closes on time. Nobody has discovered an exclusive product today.",
              "public": "Hugo serves the night workers and closes on time. Nobody has discovered an exclusive product today.",
              "npc": "Hugo serves the night workers and closes on time. Nobody has discovered an exclusive product today."
            },
            "npcLabel": null,
            "time": 0,
            "response": {
              "speakerId": "hugo",
              "speech": "The usual bread has a usual end.",
              "activity": "Folds the paper around a waiting loaf.",
              "emotion": "attentive",
              "gesture": "pause"
            }
          }
        ],
        "npc": "helpful"
      },
      {
        "id": "name",
        "title": "Exclusive to everyone who is awake",
        "prompt": "A poster calls the loaf Sunrise Reserve. Hugo was aiming for food, not an opinion about who deserves morning.",
        "choices": [
          {
            "id": "name",
            "label": "Keep “Late-Shift Loaf” and the real pickup time",
            "style": "helpful",
            "outcome": "Hugo changes the poster back. Somebody asks if it is still good in the morning. He says they are welcome to try eating it then.",
            "signals": [
              "bread_pickup"
            ],
            "narration": {
              "personal": "Hugo changes the poster back. Somebody asks if it is still good in the morning. He says they are welcome to try eating it then.",
              "public": "Hugo changes the poster back. Somebody asks if it is still good in the morning. He says they are welcome to try eating it then.",
              "npc": "Hugo changes the poster back. Somebody asks if it is still good in the morning. He says they are welcome to try eating it then."
            },
            "npcLabel": "Tess uses Hugo’s existing name and pickup time",
            "time": 1,
            "response": {
              "speakerId": "hugo",
              "speech": "Late-Shift Loaf. The clue is in both words.",
              "activity": "Folds the paper around a waiting loaf.",
              "emotion": "warm",
              "gesture": "point"
            }
          },
          {
            "id": "demo",
            "label": "Book a later baking demonstration",
            "style": "selfish",
            "outcome": "Hugo agrees to demonstrate after he has slept. The first lesson is now visibly about scheduling.",
            "signals": [
              "baker_demo"
            ],
            "cost": 80,
            "narration": {
              "personal": "Hugo agrees to demonstrate after he has slept. The first lesson is now visibly about scheduling.",
              "public": "Hugo agrees to demonstrate after he has slept. The first lesson is now visibly about scheduling.",
              "npc": "Hugo agrees to demonstrate after he has slept. The first lesson is now visibly about scheduling."
            },
            "npcLabel": null,
            "time": 1,
            "response": {
              "speakerId": "hugo",
              "speech": "After I have slept. Put that on the poster as well.",
              "activity": "Folds the paper around a waiting loaf.",
              "emotion": "proud",
              "gesture": "point"
            }
          },
          {
            "id": "leave",
            "label": "Leave the name alone",
            "style": "refusal",
            "outcome": "Hugo sells the bread under its usual name. A loaf leaves the bakery without acquiring a new identity.",
            "signals": [
              "bread_pickup"
            ],
            "narration": {
              "personal": "Hugo sells the bread under its usual name. A loaf leaves the bakery without acquiring a new identity.",
              "public": "Hugo sells the bread under its usual name. A loaf leaves the bakery without acquiring a new identity.",
              "npc": "Hugo sells the bread under its usual name. A loaf leaves the bakery without acquiring a new identity."
            },
            "npcLabel": null,
            "time": 0,
            "response": {
              "speakerId": "hugo",
              "speech": "It is still bread when nobody names it.",
              "activity": "Folds the paper around a waiting loaf.",
              "emotion": "attentive",
              "gesture": "pause"
            }
          }
        ],
        "npc": "helpful"
      }
    ],
    "place": "MARKET",
    "personal": {
      "id": "own_part",
      "label": "Buy one unreserved loaf for yourself",
      "outcome": "Hugo wraps one ordinary loaf for you after putting the night-worker orders aside. Your parcel is yours; it never becomes café stock.",
      "narration": {
        "personal": "Hugo wraps one ordinary loaf for you after putting the night-worker orders aside. Your parcel is yours; it never becomes café stock.",
        "public": "{{actor}} makes a separate arrangement of their own.",
        "npc": "Hugo wraps one ordinary loaf for you after putting the night-worker orders aside. Your parcel is yours; it never becomes café stock."
      },
      "cost": 8,
      "time": 1,
      "signals": [
        "personal_loaf"
      ],
      "response": {
        "speakerId": "hugo",
        "speech": "The promised parcels stay on this side.",
        "activity": "Folds the paper around a waiting loaf.",
        "emotion": "warm",
        "gesture": "point"
      }
    }
  },
  {
    "id": "last_crossing",
    "title": "The Last Last Crossing",
    "region": "alder",
    "cast": [
      "alder_tess",
      "bram",
      "lucien_morel"
    ],
    "venue": "alder-corner-cafe",
    "object": "last_crossing_board",
    "desire": "Tess wants people to catch the ferry and to close the café when she said she would.",
    "contradiction": "Every helpful clarification gives somebody one more reason to stay for tea.",
    "trigger": "The Last Crossing Board carries a ferry time and a tea offer in the same large hand.",
    "ignored": "Tess gives the correct timetable, closes normally and points late guests to the still-running regular route.",
    "beats": [
      {
        "id": "board",
        "title": "Last applies to two different things",
        "prompt": "The last advertised café tea is not the last transport out of town. Bram has already checked the later route.",
        "choices": [
          {
            "id": "separate",
            "label": "Give the café and ferry separate closing lines",
            "style": "prevention",
            "outcome": "Tess puts two times on the board. Bram points to the later route. Nobody is stranded; a few people look disappointed about the extra tea.",
            "signals": [
              "clear_timetable"
            ],
            "set": {
              "clear": true
            },
            "narration": {
              "personal": "Tess puts two times on the board. Bram points to the later route. Nobody is stranded; a few people look disappointed about the extra tea.",
              "public": "Tess puts two times on the board. Bram points to the later route. Nobody is stranded; a few people look disappointed about the extra tea.",
              "npc": "Tess puts two times on the board. Bram points to the later route. Nobody is stranded; a few people look disappointed about the extra tea."
            },
            "npcLabel": "Tess separates the café close and ferry departure",
            "time": 1,
            "response": {
              "speakerId": "alder_tess",
              "speech": "Two clocks. I should have started with two clocks.",
              "activity": "Points to the two times on the board.",
              "emotion": "warm",
              "gesture": "point"
            }
          },
          {
            "id": "tea",
            "label": "Buy one more pot for the group",
            "style": "selfish",
            "outcome": "Tess agrees to one pot. The ferry time stays on the board, where tea cannot change it.",
            "signals": [
              "tea_extension"
            ],
            "cost": 24,
            "narration": {
              "personal": "Tess agrees to one pot. The ferry time stays on the board, where tea cannot change it.",
              "public": "Tess agrees to one pot. The ferry time stays on the board, where tea cannot change it.",
              "npc": "Tess agrees to one pot. The ferry time stays on the board, where tea cannot change it."
            },
            "npcLabel": null,
            "time": 1,
            "response": {
              "speakerId": "alder_tess",
              "speech": "One pot. It does not move either clock.",
              "activity": "Points to the two times on the board.",
              "emotion": "proud",
              "gesture": "point"
            }
          },
          {
            "id": "route",
            "label": "Take Bram’s checked later route",
            "style": "refusal",
            "outcome": "The longer route works. The shortcut is still locked, exactly as Bram said it was. He enjoys this more than the walking.",
            "signals": [
              "later_route"
            ],
            "narration": {
              "personal": "The longer route works. The shortcut is still locked, exactly as Bram said it was. He enjoys this more than the walking.",
              "public": "The longer route works. The shortcut is still locked, exactly as Bram said it was. He enjoys this more than the walking.",
              "npc": "The longer route works. The shortcut is still locked, exactly as Bram said it was. He enjoys this more than the walking."
            },
            "npcLabel": null,
            "time": 0,
            "response": {
              "speakerId": "alder_tess",
              "speech": "Bram checked that route. You can use it.",
              "activity": "Points to the two times on the board.",
              "emotion": "attentive",
              "gesture": "pause"
            }
          }
        ],
        "npc": "helpful"
      },
      {
        "id": "closing",
        "title": "One more clarification",
        "prompt": "A late event asks if “last” can mean ten minutes later. Tess produces two clocks rather than a philosophy.",
        "choices": [
          {
            "id": "close",
            "label": "Let Tess close; show everyone the later connection",
            "style": "helpful",
            "outcome": "The group has somewhere to go and Tess can put the cups away. She does not offer a closing-time philosophy.",
            "signals": [
              "connection_clear"
            ],
            "narration": {
              "personal": "The group has somewhere to go and Tess can put the cups away. She does not offer a closing-time philosophy.",
              "public": "The group has somewhere to go and Tess can put the cups away. She does not offer a closing-time philosophy.",
              "npc": "The group has somewhere to go and Tess can put the cups away. She does not offer a closing-time philosophy."
            },
            "npcLabel": "Tess closes and points guests to the later connection",
            "time": 1,
            "response": {
              "speakerId": "alder_tess",
              "speech": "The café closes. The town does not.",
              "activity": "Points to the two times on the board.",
              "emotion": "warm",
              "gesture": "point"
            }
          },
          {
            "id": "reserve",
            "label": "Book tomorrow’s discussion table",
            "style": "selfish",
            "outcome": "Tess writes tomorrow at the top of the booking. “A word with a great deal to recommend it.”",
            "signals": [
              "cafe_slot"
            ],
            "cost": 40,
            "narration": {
              "personal": "Tess writes tomorrow at the top of the booking. “A word with a great deal to recommend it.”",
              "public": "Tess writes tomorrow at the top of the booking. “A word with a great deal to recommend it.”",
              "npc": "Tess writes tomorrow at the top of the booking. “A word with a great deal to recommend it.”"
            },
            "npcLabel": null,
            "time": 1,
            "response": {
              "speakerId": "alder_tess",
              "speech": "Tomorrow is an excellent time for tomorrow’s discussion.",
              "activity": "Points to the two times on the board.",
              "emotion": "proud",
              "gesture": "point"
            }
          },
          {
            "id": "go",
            "label": "Leave with the others",
            "style": "refusal",
            "outcome": "Tess closes the door behind the group. The next question about a timetable can be asked at the landing.",
            "signals": [
              "connection_clear"
            ],
            "narration": {
              "personal": "Tess closes the door behind the group. The next question about a timetable can be asked at the landing.",
              "public": "Tess closes the door behind the group. The next question about a timetable can be asked at the landing.",
              "npc": "Tess closes the door behind the group. The next question about a timetable can be asked at the landing."
            },
            "npcLabel": null,
            "time": 0,
            "response": {
              "speakerId": "alder_tess",
              "speech": "Good night. That was the last clarification.",
              "activity": "Points to the two times on the board.",
              "emotion": "attentive",
              "gesture": "pause"
            }
          }
        ],
        "npc": "helpful"
      }
    ],
    "place": "CORNER CAFÉ",
    "personal": {
      "id": "own_part",
      "label": "Buy tea before the posted close",
      "outcome": "Tess pours your tea and points to the café clock. You finish before either clock needs another explanation.",
      "narration": {
        "personal": "Tess pours your tea and points to the café clock. You finish before either clock needs another explanation.",
        "public": "{{actor}} makes a separate arrangement of their own.",
        "npc": "Tess pours your tea and points to the café clock. You finish before either clock needs another explanation."
      },
      "cost": 8,
      "time": 1,
      "signals": [],
      "response": {
        "speakerId": "alder_tess",
        "speech": "The café time is this one. The ferry time is that one.",
        "activity": "Points to the two times on the board.",
        "emotion": "warm",
        "gesture": "point"
      }
    }
  },
  {
    "id": "pantry_song",
    "title": "A Verse for Twelve",
    "region": "alder",
    "cast": [
      "mina",
      "eli",
      "nell_harper"
    ],
    "venue": "alder-community",
    "object": "tide_mill_bridge_flour",
    "desire": "Mina wants to test a song privately; Eli wants a potluck to feed the number who actually accepted.",
    "contradiction": "Her lyric on the back of a pantry list looks more decisive about twelve guests than either organizer feels.",
    "trigger": "Eli has a finite potluck list. Mina has written “twelve chairs” on its reverse and does not intend a booking.",
    "ignored": "Eli cooks for confirmed guests and Mina keeps an unfinished verse; neither silence nor poetry reserves a room.",
    "beats": [
      {
        "id": "list",
        "title": "The number scans beautifully",
        "prompt": "Twelve is a good lyric and a bad headcount unless twelve people have accepted.",
        "choices": [
          {
            "id": "count",
            "label": "Ask Eli for the guest count; give Mina back the verse",
            "style": "prevention",
            "outcome": "Eli counts six diners. Mina keeps twelve chairs in the song. Both numbers improve when they stop doing the same job.",
            "signals": [
              "potluck_count"
            ],
            "narration": {
              "personal": "Eli counts six diners. Mina keeps twelve chairs in the song. Both numbers improve when they stop doing the same job.",
              "public": "Eli counts six diners. Mina keeps twelve chairs in the song. Both numbers improve when they stop doing the same job.",
              "npc": "Eli counts six diners. Mina keeps twelve chairs in the song. Both numbers improve when they stop doing the same job."
            },
            "npcLabel": "Mina separates the verse from Eli’s guest count",
            "time": 1,
            "response": {
              "speakerId": "mina",
              "speech": "Twelve is in the song. It is not a booking.",
              "activity": "Keeps the lyric side of the page facing down.",
              "emotion": "warm",
              "gesture": "point"
            }
          },
          {
            "id": "book",
            "label": "Book supper for six",
            "style": "selfish",
            "outcome": "Eli buys for six and reserves the main table. Mina is pleased that nobody has asked the lyric to cook.",
            "signals": [
              "potluck_booking"
            ],
            "cost": 120,
            "narration": {
              "personal": "Eli buys for six and reserves the main table. Mina is pleased that nobody has asked the lyric to cook.",
              "public": "Eli buys for six and reserves the main table. Mina is pleased that nobody has asked the lyric to cook.",
              "npc": "Eli buys for six and reserves the main table. Mina is pleased that nobody has asked the lyric to cook."
            },
            "npcLabel": null,
            "time": 1,
            "response": {
              "speakerId": "mina",
              "speech": "Six actual people. I can leave twelve in the verse.",
              "activity": "Keeps the lyric side of the page facing down.",
              "emotion": "proud",
              "gesture": "point"
            }
          },
          {
            "id": "small",
            "label": "Skip the potluck",
            "style": "refusal",
            "outcome": "Eli keeps the smaller guest list. Mina turns the paper over before anyone can invite the other six chairs.",
            "signals": [
              "small_potluck"
            ],
            "narration": {
              "personal": "Eli keeps the smaller guest list. Mina turns the paper over before anyone can invite the other six chairs.",
              "public": "Eli keeps the smaller guest list. Mina turns the paper over before anyone can invite the other six chairs.",
              "npc": "Eli keeps the smaller guest list. Mina turns the paper over before anyone can invite the other six chairs."
            },
            "npcLabel": null,
            "time": 0,
            "response": {
              "speakerId": "mina",
              "speech": "I would like to keep the page.",
              "activity": "Keeps the lyric side of the page facing down.",
              "emotion": "attentive",
              "gesture": "pause"
            }
          }
        ],
        "npc": "helpful"
      },
      {
        "id": "listen",
        "title": "Everybody has one small suggestion",
        "prompt": "A rehearsal needs a time and an instrument. Mina would like listeners who can hear the ending without improving it.",
        "choices": [
          {
            "id": "listen",
            "label": "Listen to Mina’s song all the way through",
            "style": "helpful",
            "outcome": "Mina reaches the ending without an improvement from the room. After a pause, she asks about one particular line.",
            "signals": [
              "private_rehearsal"
            ],
            "narration": {
              "personal": "Mina reaches the ending without an improvement from the room. After a pause, she asks about one particular line.",
              "public": "Mina reaches the ending without an improvement from the room. After a pause, she asks about one particular line.",
              "npc": "Mina reaches the ending without an improvement from the room. After a pause, she asks about one particular line."
            },
            "npcLabel": "Mina offers a short private listening session",
            "time": 1,
            "response": {
              "speakerId": "mina",
              "speech": "Let me get to the ending before you improve it.",
              "activity": "Keeps the lyric side of the page facing down.",
              "emotion": "warm",
              "gesture": "point"
            }
          },
          {
            "id": "event",
            "label": "Ask Mina to sing one song at the paid event",
            "style": "selfish",
            "outcome": "Mina agrees to one song. Eli starts to say “and perhaps,” then sees her finger on the number.",
            "signals": [
              "song_offer"
            ],
            "cost": 100,
            "narration": {
              "personal": "Mina agrees to one song. Eli starts to say “and perhaps,” then sees her finger on the number.",
              "public": "Mina agrees to one song. Eli starts to say “and perhaps,” then sees her finger on the number.",
              "npc": "Mina agrees to one song. Eli starts to say “and perhaps,” then sees her finger on the number."
            },
            "npcLabel": null,
            "time": 1,
            "response": {
              "speakerId": "mina",
              "speech": "One song. I have offered one song.",
              "activity": "Keeps the lyric side of the page facing down.",
              "emotion": "proud",
              "gesture": "point"
            }
          },
          {
            "id": "later",
            "label": "Leave the rehearsal for another evening",
            "style": "refusal",
            "outcome": "Mina keeps the page and a later rehearsal. A song can be unfinished without being in trouble.",
            "signals": [
              "rehearsal_later"
            ],
            "narration": {
              "personal": "Mina keeps the page and a later rehearsal. A song can be unfinished without being in trouble.",
              "public": "Mina keeps the page and a later rehearsal. A song can be unfinished without being in trouble.",
              "npc": "Mina keeps the page and a later rehearsal. A song can be unfinished without being in trouble."
            },
            "npcLabel": null,
            "time": 0,
            "response": {
              "speakerId": "mina",
              "speech": "Another evening is still an evening.",
              "activity": "Keeps the lyric side of the page facing down.",
              "emotion": "attentive",
              "gesture": "pause"
            }
          }
        ],
        "npc": "helpful"
      }
    ],
    "place": "COMMUNITY",
    "personal": {
      "id": "own_part",
      "label": "Listen to Mina’s private verse",
      "outcome": "You hear the verse as invited. Twelve still scans well. Eli does not add six more plates because you enjoyed it.",
      "narration": {
        "personal": "You hear the verse as invited. Twelve still scans well. Eli does not add six more plates because you enjoyed it.",
        "public": "{{actor}} makes a separate arrangement of their own.",
        "npc": "You hear the verse as invited. Twelve still scans well. Eli does not add six more plates because you enjoyed it."
      },
      "cost": 0,
      "time": 1,
      "signals": [],
      "response": {
        "speakerId": "mina",
        "speech": "The song is not a guest list.",
        "activity": "Keeps the lyric side of the page facing down.",
        "emotion": "warm",
        "gesture": "point"
      }
    }
  },
  {
    "id": "laundry",
    "title": "Ordinary Hours at a Rush Price",
    "region": "glasssteppe",
    "cast": [
      "qiao_chen",
      "mei_chen",
      "akira_mori"
    ],
    "venue": "glasssteppe-work",
    "object": "kestrel_breakfast_tea",
    "desire": "Qiao wants enough paid work and a weekend with her friends.",
    "contradiction": "She resents being assumed available, then enthusiastically quotes for the very work she was escaping.",
    "trigger": "A canteen’s regular rush laundry slot falls on her intended departure day.",
    "ignored": "Qiao negotiates a modest increase herself and proposes a later trip. Mei’s choir invitation is optional.",
    "beats": [
      {
        "id": "quote",
        "title": "The ordinary price has retired",
        "prompt": "A supplier can have a paid rush slot or an earlier ordinary collection. Qiao wants the distinction visible.",
        "choices": [
          {
            "id": "early",
            "label": "Pay for early ordinary collection",
            "style": "helpful",
            "outcome": "Qiao writes the early time beside the ordinary price. The customer must be ready first; her departure stays free.",
            "signals": [
              "laundry_early"
            ],
            "cost": 24,
            "narration": {
              "personal": "Qiao writes the early time beside the ordinary price. The customer must be ready first; her departure stays free.",
              "public": "Qiao writes the early time beside the ordinary price. The customer must be ready first; her departure stays free.",
              "npc": "Qiao writes the early time beside the ordinary price. The customer must be ready first; her departure stays free."
            },
            "npcLabel": "Akira pays for Qiao’s early ordinary collection",
            "time": 1,
            "response": {
              "speakerId": "qiao_chen",
              "speech": "That is the ordinary price. It is still a perfectly good price.",
              "activity": "Taps the ordinary-price column.",
              "emotion": "warm",
              "gesture": "point"
            }
          },
          {
            "id": "rush",
            "label": "Pay the rush rate",
            "style": "selfish",
            "outcome": "Qiao takes the rush job with enthusiasm. Mei watches the carefully defended free afternoon disappear into a much better price.",
            "signals": [
              "laundry_rush"
            ],
            "cost": 72,
            "narration": {
              "personal": "Qiao takes the rush job with enthusiasm. Mei watches the carefully defended free afternoon disappear into a much better price.",
              "public": "Qiao takes the rush job with enthusiasm. Mei watches the carefully defended free afternoon disappear into a much better price.",
              "npc": "Qiao takes the rush job with enthusiasm. Mei watches the carefully defended free afternoon disappear into a much better price."
            },
            "npcLabel": null,
            "time": 1,
            "response": {
              "speakerId": "qiao_chen",
              "speech": "The rush number is larger for a reason.",
              "activity": "Taps the ordinary-price column.",
              "emotion": "proud",
              "gesture": "point"
            }
          },
          {
            "id": "decline",
            "label": "Use the stock you already have",
            "style": "refusal",
            "outcome": "Qiao keeps the unbooked time. She looks almost sorry that nobody argued about the rate.",
            "signals": [
              "qiao_free"
            ],
            "narration": {
              "personal": "Qiao keeps the unbooked time. She looks almost sorry that nobody argued about the rate.",
              "public": "Qiao keeps the unbooked time. She looks almost sorry that nobody argued about the rate.",
              "npc": "Qiao keeps the unbooked time. She looks almost sorry that nobody argued about the rate."
            },
            "npcLabel": null,
            "time": 0,
            "response": {
              "speakerId": "qiao_chen",
              "speech": "Then that space stays free.",
              "activity": "Taps the ordinary-price column.",
              "emotion": "attentive",
              "gesture": "pause"
            }
          }
        ],
        "npc": "helpful"
      },
      {
        "id": "invitation",
        "title": "Is there a choir rate?",
        "prompt": "Mei offers a rehearsal. Qiao produces a mock price list. Mei asks whether invitations should stop. Apparently not.",
        "choices": [
          {
            "id": "finite",
            "label": "Join Mei’s short choir visit after collection",
            "style": "helpful",
            "outcome": "Qiao arrives after the pickup and before the last song. She asks whether attendance by the minute is an available arrangement.",
            "signals": [
              "choir_finite"
            ],
            "narration": {
              "personal": "Qiao arrives after the pickup and before the last song. She asks whether attendance by the minute is an available arrangement.",
              "public": "Qiao arrives after the pickup and before the last song. She asks whether attendance by the minute is an available arrangement.",
              "npc": "Qiao arrives after the pickup and before the last song. She asks whether attendance by the minute is an available arrangement."
            },
            "npcLabel": "Qiao accepts Mei’s short choir visit after pickup",
            "time": 1,
            "response": {
              "speakerId": "qiao_chen",
              "speech": "A choir visit. Does that have a rush rate?",
              "activity": "Taps the ordinary-price column.",
              "emotion": "warm",
              "gesture": "point"
            }
          },
          {
            "id": "trip",
            "label": "Back Qiao’s later weekend trip",
            "style": "selfish",
            "outcome": "Qiao keeps the paid work and chooses a later departure. The current choir chair goes to somebody who will sit in it.",
            "signals": [
              "qiao_later"
            ],
            "narration": {
              "personal": "Qiao keeps the paid work and chooses a later departure. The current choir chair goes to somebody who will sit in it.",
              "public": "Qiao keeps the paid work and chooses a later departure. The current choir chair goes to somebody who will sit in it.",
              "npc": "Qiao keeps the paid work and chooses a later departure. The current choir chair goes to somebody who will sit in it."
            },
            "npcLabel": null,
            "time": 1,
            "response": {
              "speakerId": "qiao_chen",
              "speech": "I can take a later weekend. This price has bought a later weekend.",
              "activity": "Taps the ordinary-price column.",
              "emotion": "proud",
              "gesture": "point"
            }
          },
          {
            "id": "private",
            "label": "Leave Qiao to decide",
            "style": "refusal",
            "outcome": "Qiao declines this rehearsal. When Mei asks about stopping the invitations, Qiao says that would be an excessive interpretation.",
            "signals": [
              "choir_declined"
            ],
            "narration": {
              "personal": "Qiao declines this rehearsal. When Mei asks about stopping the invitations, Qiao says that would be an excessive interpretation.",
              "public": "Qiao declines this rehearsal. When Mei asks about stopping the invitations, Qiao says that would be an excessive interpretation.",
              "npc": "Qiao declines this rehearsal. When Mei asks about stopping the invitations, Qiao says that would be an excessive interpretation."
            },
            "npcLabel": null,
            "time": 0,
            "response": {
              "speakerId": "qiao_chen",
              "speech": "Do keep asking. I have only declined this time.",
              "activity": "Taps the ordinary-price column.",
              "emotion": "attentive",
              "gesture": "pause"
            }
          }
        ],
        "npc": "helpful"
      }
    ],
    "place": "WORK",
    "personal": {
      "id": "own_part",
      "label": "Book your own ordinary collection",
      "outcome": "Qiao writes your own early collection on the ordinary-price line. She shows you the rush number for comparison, without charging it.",
      "narration": {
        "personal": "Qiao writes your own early collection on the ordinary-price line. She shows you the rush number for comparison, without charging it.",
        "public": "{{actor}} makes a separate arrangement of their own.",
        "npc": "Qiao writes your own early collection on the ordinary-price line. She shows you the rush number for comparison, without charging it."
      },
      "cost": 24,
      "time": 1,
      "signals": [
        "laundry_early"
      ],
      "response": {
        "speakerId": "qiao_chen",
        "speech": "Which collection? It changes the price.",
        "activity": "Taps the ordinary-price column.",
        "emotion": "warm",
        "gesture": "point"
      }
    }
  },
  {
    "id": "small_pause",
    "title": "Two Seconds of Silence",
    "region": "glasssteppe",
    "cast": [
      "akira_mori",
      "hana_mori",
      "glass_ren"
    ],
    "venue": "glasssteppe-corner-cafe",
    "object": "kestrel_breakfast_tea",
    "desire": "Akira wants reduced canteen hours and his tiny theatre entrance to work.",
    "contradiction": "Explaining why his entrance must be brief lasts longer than the scene.",
    "trigger": "Akira’s handover contains three supplier holiday destinations and one usable quantity.",
    "ignored": "The hours reduction moves to the next agreed rota if needed; the play goes ahead without recruiting unpaid cover.",
    "beats": [
      {
        "id": "handover",
        "title": "A very complete document",
        "prompt": "A cup of the café’s separately purchased Kestrel tea goes cold beside the handover. A colleague needs today’s quantities. Akira is still explaining who took the supplier to the airport.",
        "choices": [
          {
            "id": "test",
            "label": "Test the short handover with a colleague",
            "style": "helpful",
            "outcome": "The colleague answers a supplier correctly without asking Akira. Akira is delighted, then briefly looks unemployed.",
            "signals": [
              "handover_clear"
            ],
            "narration": {
              "personal": "The colleague answers a supplier correctly without asking Akira. Akira is delighted, then briefly looks unemployed.",
              "public": "The colleague answers a supplier correctly without asking Akira. Akira is delighted, then briefly looks unemployed.",
              "npc": "The colleague answers a supplier correctly without asking Akira. Akira is delighted, then briefly looks unemployed."
            },
            "npcLabel": "Akira tests the shorter handover with the colleague",
            "time": 1,
            "response": {
              "speakerId": "akira_mori",
              "speech": "One page. It feels alarmingly incomplete.",
              "activity": "Folds the handover down to one useful page.",
              "emotion": "warm",
              "gesture": "point"
            }
          },
          {
            "id": "shift",
            "label": "Work one canteen handover shift",
            "style": "selfish",
            "outcome": "You handle the named shift. Akira gains rehearsal time and immediately starts using it to explain the handover.",
            "signals": [
              "canteen_cover"
            ],
            "commit": "canteen-shift",
            "narration": {
              "personal": "You handle the named shift. Akira gains rehearsal time and immediately starts using it to explain the handover.",
              "public": "{{actor}} handles the paid handover shift. Akira gains rehearsal time and immediately starts using it to explain the handover.",
              "npc": "{{actor}} handles the paid handover shift. Akira gains rehearsal time and immediately starts using it to explain the handover."
            },
            "npcLabel": null,
            "paidHours": 8,
            "workField": "service",
            "time": 1,
            "response": {
              "speakerId": "akira_mori",
              "speech": "That gives me a rehearsal. A very short part needs a rehearsal.",
              "activity": "Folds the handover down to one useful page.",
              "emotion": "proud",
              "gesture": "point"
            }
          },
          {
            "id": "later",
            "label": "Keep the old rota for another week",
            "style": "refusal",
            "outcome": "Akira’s shorter hours move back a rota. The canteen still opens; the play has not been cancelled by a sandwich count.",
            "signals": [
              "rota_later"
            ],
            "narration": {
              "personal": "Akira’s shorter hours move back a rota. The canteen still opens; the play has not been cancelled by a sandwich count.",
              "public": "Akira’s shorter hours move back a rota. The canteen still opens; the play has not been cancelled by a sandwich count.",
              "npc": "Akira’s shorter hours move back a rota. The canteen still opens; the play has not been cancelled by a sandwich count."
            },
            "npcLabel": null,
            "time": 0,
            "response": {
              "speakerId": "akira_mori",
              "speech": "I can change the rota next time.",
              "activity": "Folds the handover down to one useful page.",
              "emotion": "attentive",
              "gesture": "pause"
            }
          }
        ],
        "npc": "helpful"
      },
      {
        "id": "pause",
        "title": "First, some context for the silence",
        "prompt": "The director can rehearse the small entrance first if Akira asks. He dislikes admitting how small it is.",
        "choices": [
          {
            "id": "first",
            "label": "Ask to rehearse Akira’s entrance first",
            "style": "helpful",
            "outcome": "The director gives him the short slot. Akira spends forty minutes polishing two seconds of silence. At the performance, they work.",
            "signals": [
              "short_rehearsal"
            ],
            "narration": {
              "personal": "The director gives him the short slot. Akira spends forty minutes polishing two seconds of silence. At the performance, they work.",
              "public": "The director gives him the short slot. Akira spends forty minutes polishing two seconds of silence. At the performance, they work.",
              "npc": "The director gives him the short slot. Akira spends forty minutes polishing two seconds of silence. At the performance, they work."
            },
            "npcLabel": "Akira asks to rehearse his small entrance first",
            "time": 1,
            "response": {
              "speakerId": "akira_mori",
              "speech": "The silence is two seconds. The preparation is more complicated.",
              "activity": "Folds the handover down to one useful page.",
              "emotion": "warm",
              "gesture": "point"
            }
          },
          {
            "id": "full",
            "label": "Let Akira stay for the whole rehearsal",
            "style": "selfish",
            "outcome": "Akira keeps the old rota another cycle and attends the full rehearsal. The entrance remains two seconds long.",
            "signals": [
              "full_rehearsal"
            ],
            "narration": {
              "personal": "Akira keeps the old rota another cycle and attends the full rehearsal. The entrance remains two seconds long.",
              "public": "Akira keeps the old rota another cycle and attends the full rehearsal. The entrance remains two seconds long.",
              "npc": "Akira keeps the old rota another cycle and attends the full rehearsal. The entrance remains two seconds long."
            },
            "npcLabel": null,
            "time": 1,
            "response": {
              "speakerId": "akira_mori",
              "speech": "I will stay for the whole rehearsal and keep the present rota.",
              "activity": "Folds the handover down to one useful page.",
              "emotion": "proud",
              "gesture": "point"
            }
          },
          {
            "id": "own",
            "label": "Let Akira ask for himself",
            "style": "refusal",
            "outcome": "Akira admits how small the scene is and gets it rehearsed first. His account of this victory is substantially longer.",
            "signals": [
              "short_rehearsal"
            ],
            "narration": {
              "personal": "Akira admits how small the scene is and gets it rehearsed first. His account of this victory is substantially longer.",
              "public": "Akira admits how small the scene is and gets it rehearsed first. His account of this victory is substantially longer.",
              "npc": "Akira admits how small the scene is and gets it rehearsed first. His account of this victory is substantially longer."
            },
            "npcLabel": null,
            "time": 0,
            "response": {
              "speakerId": "akira_mori",
              "speech": "I will ask for my scene first. Quietly.",
              "activity": "Folds the handover down to one useful page.",
              "emotion": "attentive",
              "gesture": "pause"
            }
          }
        ],
        "npc": "helpful"
      }
    ],
    "place": "CORNER CAFÉ",
    "personal": {
      "id": "own_part",
      "label": "Come for Akira’s tiny entrance",
      "outcome": "You attend the performance for the agreed short visit. Akira makes the entrance, pauses, and leaves. Explaining your interest takes longer.",
      "narration": {
        "personal": "You attend the performance for the agreed short visit. Akira makes the entrance, pauses, and leaves. Explaining your interest takes longer.",
        "public": "{{actor}} makes a separate arrangement of their own.",
        "npc": "You attend the performance for the agreed short visit. Akira makes the entrance, pauses, and leaves. Explaining your interest takes longer."
      },
      "cost": 0,
      "time": 1,
      "signals": [],
      "response": {
        "speakerId": "akira_mori",
        "speech": "I can start with the useful part this time.",
        "activity": "Folds the handover down to one useful page.",
        "emotion": "warm",
        "gesture": "point"
      }
    }
  },
  {
    "id": "timetable",
    "title": "The Connection Everyone Almost Made",
    "region": "glasssteppe",
    "cast": [
      "glass_ren",
      "qiao_chen",
      "akira_mori"
    ],
    "venue": "glasssteppe-transit",
    "object": "kestrel_ferry_mix",
    "desire": "Ren wants a legible, workable connection plan and a shift that ends.",
    "contradiction": "Explaining every exception makes the plain reliable option look suspiciously simple.",
    "trigger": "A rehearsal and a collection both cite the train that departs before their advertised finish.",
    "ignored": "Ren posts the verified timetable and carries ordinary passengers. A missed optional event is not a transport fine.",
    "beats": [
      {
        "id": "times",
        "title": "Arrive five minutes before finishing",
        "prompt": "Two notices cannot both be followed. Ren has a normal later service, though nobody made it the headline.",
        "choices": [
          {
            "id": "later",
            "label": "Put the later train on the notices",
            "style": "helpful",
            "outcome": "Ren supplies the actual later departure and the wait. Organizers can now choose the inconvenience they really have.",
            "signals": [
              "later_connection"
            ],
            "narration": {
              "personal": "Ren supplies the actual later departure and the wait. Organizers can now choose the inconvenience they really have.",
              "public": "Ren supplies the actual later departure and the wait. Organizers can now choose the inconvenience they really have.",
              "npc": "Ren supplies the actual later departure and the wait. Organizers can now choose the inconvenience they really have."
            },
            "npcLabel": "Ren posts the verified later connection",
            "time": 1,
            "response": {
              "speakerId": "glass_ren",
              "speech": "The later train was on the timetable all along.",
              "activity": "Traces the departure line with a finger.",
              "emotion": "warm",
              "gesture": "point"
            }
          },
          {
            "id": "early",
            "label": "Take the early train; ask events for a shorter slot",
            "style": "selfish",
            "outcome": "The train keeps its departure time. Akira can ask to go first; nobody has to move a railway for his pause.",
            "signals": [
              "early_departure"
            ],
            "narration": {
              "personal": "The train keeps its departure time. Akira can ask to go first; nobody has to move a railway for his pause.",
              "public": "The train keeps its departure time. Akira can ask to go first; nobody has to move a railway for his pause.",
              "npc": "The train keeps its departure time. Akira can ask to go first; nobody has to move a railway for his pause."
            },
            "npcLabel": null,
            "time": 1,
            "response": {
              "speakerId": "glass_ren",
              "speech": "The early train will still leave early.",
              "activity": "Traces the departure line with a finger.",
              "emotion": "proud",
              "gesture": "point"
            }
          },
          {
            "id": "ordinary",
            "label": "Stick to your usual trip",
            "style": "refusal",
            "outcome": "Ren corrects the transport notice themself. The appendix remains available if anyone is foolish enough to request it.",
            "signals": [
              "later_connection"
            ],
            "narration": {
              "personal": "Ren corrects the transport notice themself. The appendix remains available if anyone is foolish enough to request it.",
              "public": "Ren corrects the transport notice themself. The appendix remains available if anyone is foolish enough to request it.",
              "npc": "Ren corrects the transport notice themself. The appendix remains available if anyone is foolish enough to request it."
            },
            "npcLabel": null,
            "time": 0,
            "response": {
              "speakerId": "glass_ren",
              "speech": "I will make the notice clearer.",
              "activity": "Traces the departure line with a finger.",
              "emotion": "attentive",
              "gesture": "pause"
            }
          }
        ],
        "npc": "helpful"
      },
      {
        "id": "platform",
        "title": "The short version has an appendix",
        "prompt": "Ren tries a concise notice. A passenger asks one question. They know exactly the answer and six adjacent facts.",
        "choices": [
          {
            "id": "plain",
            "label": "Keep the sign to platform, departure and fallback",
            "style": "helpful",
            "outcome": "Ren fits the useful facts on the board. They hold the remaining explanation in reserve.",
            "signals": [
              "plain_connection"
            ],
            "narration": {
              "personal": "Ren fits the useful facts on the board. They hold the remaining explanation in reserve.",
              "public": "Ren fits the useful facts on the board. They hold the remaining explanation in reserve.",
              "npc": "Ren fits the useful facts on the board. They hold the remaining explanation in reserve."
            },
            "npcLabel": "Ren keeps the essential facts on the sign",
            "time": 1,
            "response": {
              "speakerId": "glass_ren",
              "speech": "Departure. Platform. Fallback. I have left a margin.",
              "activity": "Traces the departure line with a finger.",
              "emotion": "warm",
              "gesture": "point"
            }
          },
          {
            "id": "group",
            "label": "Reserve the group’s platform meeting corner",
            "style": "selfish",
            "outcome": "The group gets a named place to wait. Ren points out that meeting beside a train is not the same as boarding it.",
            "signals": [
              "platform_group"
            ],
            "cost": 20,
            "narration": {
              "personal": "The group gets a named place to wait. Ren points out that meeting beside a train is not the same as boarding it.",
              "public": "The group gets a named place to wait. Ren points out that meeting beside a train is not the same as boarding it.",
              "npc": "The group gets a named place to wait. Ren points out that meeting beside a train is not the same as boarding it."
            },
            "npcLabel": null,
            "time": 1,
            "response": {
              "speakerId": "glass_ren",
              "speech": "Meet at that corner. Not the next corner, which has a history.",
              "activity": "Traces the departure line with a finger.",
              "emotion": "proud",
              "gesture": "point"
            }
          },
          {
            "id": "travel",
            "label": "Travel by yourself",
            "style": "refusal",
            "outcome": "You use the posted departure without joining the group. Ren has one fewer person to count twice.",
            "signals": [
              "plain_connection"
            ],
            "narration": {
              "personal": "You use the posted departure without joining the group. Ren has one fewer person to count twice.",
              "public": "{{actor}} uses the posted departure without joining the group. Ren has one fewer person to count twice.",
              "npc": "{{actor}} uses the posted departure without joining the group. Ren has one fewer person to count twice."
            },
            "npcLabel": null,
            "time": 0,
            "response": {
              "speakerId": "glass_ren",
              "speech": "The timetable works for one person, too.",
              "activity": "Traces the departure line with a finger.",
              "emotion": "attentive",
              "gesture": "pause"
            }
          }
        ],
        "npc": "helpful"
      }
    ],
    "place": "TRANSIT",
    "personal": {
      "id": "own_part",
      "label": "Take your own later connection",
      "outcome": "You use the posted later connection. Ren begins the exception, sees that you have understood, and gets back to the end of their shift.",
      "narration": {
        "personal": "You use the posted later connection. Ren begins the exception, sees that you have understood, and gets back to the end of their shift.",
        "public": "{{actor}} makes a separate arrangement of their own.",
        "npc": "You use the posted later connection. Ren begins the exception, sees that you have understood, and gets back to the end of their shift."
      },
      "cost": 0,
      "time": 1,
      "signals": [],
      "response": {
        "speakerId": "glass_ren",
        "speech": "Use the departure on the sign.",
        "activity": "Traces the departure line with a finger.",
        "emotion": "warm",
        "gesture": "point"
      }
    }
  },
  {
    "id": "portrait",
    "title": "The Informal Official Portrait",
    "region": "glasssteppe",
    "cast": [
      "liang_chen",
      "jian_wu",
      "mei_chen"
    ],
    "venue": "glasssteppe-community",
    "object": "kestrel_breakfast_tea",
    "desire": "Liang wants to be drawn as relaxed and distinguished.",
    "contradiction": "His instructions for looking unposed require everyone to stand still.",
    "trigger": "Liang has agreed a portrait sitting during a community open hour. A borrowed good chair is doing most of the work.",
    "ignored": "The sitting ends at its agreed time; Jian keeps artistic control and Liang receives no automatic authority over the hall.",
    "beats": [
      {
        "id": "chair",
        "title": "Naturally, from this angle",
        "prompt": "One quiet chair can face the light or leave the room’s small stage unobstructed.",
        "choices": [
          {
            "id": "corner",
            "label": "Move the chair to the bright side corner",
            "style": "helpful",
            "outcome": "Liang gets the light and the stage stays clear. He adjusts the chair a fraction to make the pose look less considered.",
            "signals": [
              "stage_free"
            ],
            "narration": {
              "personal": "Liang gets the light and the stage stays clear. He adjusts the chair a fraction to make the pose look less considered.",
              "public": "Liang gets the light and the stage stays clear. He adjusts the chair a fraction to make the pose look less considered.",
              "npc": "Liang gets the light and the stage stays clear. He adjusts the chair a fraction to make the pose look less considered."
            },
            "npcLabel": "Liang moves the portrait chair to the bright side corner",
            "time": 1,
            "response": {
              "speakerId": "liang_chen",
              "speech": "This corner has quite natural light. Naturally.",
              "activity": "Adjusts the good chair by a very small amount.",
              "emotion": "warm",
              "gesture": "point"
            }
          },
          {
            "id": "stage",
            "label": "Book the main chair space for the sitting",
            "style": "selfish",
            "outcome": "Liang gets his angle. The rehearsal must use a later slot or the side room. He asks Jian whether he looks effortlessly at home.",
            "signals": [
              "portrait_slot"
            ],
            "cost": 30,
            "narration": {
              "personal": "Liang gets his angle. The rehearsal must use a later slot or the side room. He asks Jian whether he looks effortlessly at home.",
              "public": "Liang gets his angle. The rehearsal must use a later slot or the side room. He asks Jian whether he looks effortlessly at home.",
              "npc": "Liang gets his angle. The rehearsal must use a later slot or the side room. He asks Jian whether he looks effortlessly at home."
            },
            "npcLabel": null,
            "time": 1,
            "response": {
              "speakerId": "liang_chen",
              "speech": "The good chair does make a small difference.",
              "activity": "Adjusts the good chair by a very small amount.",
              "emotion": "proud",
              "gesture": "point"
            }
          },
          {
            "id": "short",
            "label": "Keep the sitting short",
            "style": "refusal",
            "outcome": "Jian draws while Liang decides which relaxed expression takes least time. The chair goes back when promised.",
            "signals": [
              "stage_free"
            ],
            "narration": {
              "personal": "Jian draws while Liang decides which relaxed expression takes least time. The chair goes back when promised.",
              "public": "Jian draws while Liang decides which relaxed expression takes least time. The chair goes back when promised.",
              "npc": "Jian draws while Liang decides which relaxed expression takes least time. The chair goes back when promised."
            },
            "npcLabel": null,
            "time": 0,
            "response": {
              "speakerId": "liang_chen",
              "speech": "I can look unposed quite quickly.",
              "activity": "Adjusts the good chair by a very small amount.",
              "emotion": "attentive",
              "gesture": "pause"
            }
          }
        ],
        "npc": "helpful"
      },
      {
        "id": "expression",
        "title": "Try to catch me unaware",
        "prompt": "Liang asks whether a correction can look spontaneous. Jian explains that drawing is not evidence of surprise.",
        "choices": [
          {
            "id": "drawing",
            "label": "Let Jian keep the informal pose",
            "style": "helpful",
            "outcome": "The drawing shows Liang trying rather hard to relax. He recognizes it immediately and asks about one tiny adjustment.",
            "signals": [
              "portrait_finished"
            ],
            "narration": {
              "personal": "The drawing shows Liang trying rather hard to relax. He recognizes it immediately and asks about one tiny adjustment.",
              "public": "The drawing shows Liang trying rather hard to relax. He recognizes it immediately and asks about one tiny adjustment.",
              "npc": "The drawing shows Liang trying rather hard to relax. He recognizes it immediately and asks about one tiny adjustment."
            },
            "npcLabel": "Liang accepts Jian’s informal composition",
            "time": 1,
            "response": {
              "speakerId": "liang_chen",
              "speech": "Do I look as if I knew you were drawing me?",
              "activity": "Adjusts the good chair by a very small amount.",
              "emotion": "warm",
              "gesture": "point"
            }
          },
          {
            "id": "show",
            "label": "Ask them about a small hall display",
            "style": "selfish",
            "outcome": "Jian and Liang agree to the display. Liang practices looking surprised to see his own portrait there.",
            "signals": [
              "portrait_display"
            ],
            "narration": {
              "personal": "Jian and Liang agree to the display. Liang practices looking surprised to see his own portrait there.",
              "public": "Jian and Liang agree to the display. Liang practices looking surprised to see his own portrait there.",
              "npc": "Jian and Liang agree to the display. Liang practices looking surprised to see his own portrait there."
            },
            "npcLabel": null,
            "time": 1,
            "response": {
              "speakerId": "liang_chen",
              "speech": "A small public display. I shall try not to look expectant.",
              "activity": "Adjusts the good chair by a very small amount.",
              "emotion": "proud",
              "gesture": "point"
            }
          },
          {
            "id": "private",
            "label": "Keep the drawing private",
            "style": "refusal",
            "outcome": "The sitting ends, the chair goes back and the portrait stays with its agreed owner. Liang remains available for compliments in person.",
            "signals": [
              "stage_free"
            ],
            "narration": {
              "personal": "The sitting ends, the chair goes back and the portrait stays with its agreed owner. Liang remains available for compliments in person.",
              "public": "The sitting ends, the chair goes back and the portrait stays with its agreed owner. Liang remains available for compliments in person.",
              "npc": "The sitting ends, the chair goes back and the portrait stays with its agreed owner. Liang remains available for compliments in person."
            },
            "npcLabel": null,
            "time": 0,
            "response": {
              "speakerId": "liang_chen",
              "speech": "Then it remains our sitting.",
              "activity": "Adjusts the good chair by a very small amount.",
              "emotion": "attentive",
              "gesture": "pause"
            }
          }
        ],
        "npc": "helpful"
      }
    ],
    "place": "COMMUNITY",
    "personal": {
      "id": "own_part",
      "label": "Join the adult-run public sketch table",
      "outcome": "The adult host offers you a place at the public sketch table. Jian may draw alongside the group or keep his own page; no portrait or appointment is promised. Liang explains how little the good chair mattered to his portrait.",
      "narration": {
        "personal": "The adult host offers you a place at the public sketch table. Jian may draw alongside the group or keep his own page; no portrait or appointment is promised. Liang explains how little the good chair mattered to his portrait.",
        "public": "{{actor}} makes a separate arrangement of their own.",
        "npc": "The adult host offers you a place at the public sketch table. Jian may draw alongside the group or keep his own page; no portrait or appointment is promised. Liang explains how little the good chair mattered to his portrait."
      },
      "cost": 0,
      "time": 1,
      "signals": [],
      "response": {
        "speakerId": "liang_chen",
        "speech": "I was hoping for something quite natural.",
        "activity": "Adjusts the good chair by a very small amount.",
        "emotion": "warm",
        "gesture": "point"
      }
    }
  },
  {
    "id": "six_chairs",
    "title": "Before We Begin",
    "region": "saffron",
    "cast": [
      "ines_valdes",
      "saffron_ada",
      "saffron_leila"
    ],
    "venue": "saffron-cinema",
    "object": "six_chair_screen",
    "desire": "Inés wants the audience to appreciate melodrama without knowing the ending.",
    "contradiction": "Her warning against spoilers nearly contains the ending; her shorter version is a longer attack on bad taste.",
    "trigger": "Ada has six seats, a paid projection window and Inés’s magnificent introduction.",
    "ignored": "Ada supplies the discreet cue and the film begins; unoffered help is not required for the cinema to function.",
    "beats": [
      {
        "id": "intro",
        "title": "No one should reveal the ending",
        "prompt": "Inés has promised not to mention it, which requires explaining why everyone must understand the last scene.",
        "choices": [
          {
            "id": "cue",
            "label": "Give Inés the two-minute cue",
            "style": "helpful",
            "outcome": "“Exact fare ready,” Inés says in her old ticket-window voice. She likes the line enough to stop talking and let the film begin.",
            "signals": [
              "screening_on_time"
            ],
            "narration": {
              "personal": "“Exact fare ready,” Inés says in her old ticket-window voice. She likes the line enough to stop talking and let the film begin.",
              "public": "“Exact fare ready,” Inés says in her old ticket-window voice. She likes the line enough to stop talking and let the film begin.",
              "npc": "“Exact fare ready,” Inés says in her old ticket-window voice. She likes the line enough to stop talking and let the film begin."
            },
            "npcLabel": "Inés agrees to Ada’s two-minute cue",
            "time": 1,
            "response": {
              "speakerId": "ines_valdes",
              "speech": "Exact fare ready. I have not said that for years.",
              "activity": "Pauses beside the row of cinema seats.",
              "emotion": "warm",
              "gesture": "point"
            }
          },
          {
            "id": "long",
            "label": "Pay for an earlier slot for her whole introduction",
            "style": "selfish",
            "outcome": "Inés receives her own speaking time. The audience must arrive earlier, which she considers a sensible price for context.",
            "signals": [
              "long_intro"
            ],
            "cost": 30,
            "narration": {
              "personal": "Inés receives her own speaking time. The audience must arrive earlier, which she considers a sensible price for context.",
              "public": "Inés receives her own speaking time. The audience must arrive earlier, which she considers a sensible price for context.",
              "npc": "Inés receives her own speaking time. The audience must arrive earlier, which she considers a sensible price for context."
            },
            "npcLabel": null,
            "time": 1,
            "response": {
              "speakerId": "ines_valdes",
              "speech": "Earlier. Sensible. There is a little context.",
              "activity": "Pauses beside the row of cinema seats.",
              "emotion": "proud",
              "gesture": "point"
            }
          },
          {
            "id": "watch",
            "label": "Come for the film; leave the cue to Ada",
            "style": "refusal",
            "outcome": "Ada gives the familiar signal. The projector starts before Inés reaches the particularly dangerous part of the ending.",
            "signals": [
              "screening_on_time"
            ],
            "narration": {
              "personal": "Ada gives the familiar signal. The projector starts before Inés reaches the particularly dangerous part of the ending.",
              "public": "Ada gives the familiar signal. The projector starts before Inés reaches the particularly dangerous part of the ending.",
              "npc": "Ada gives the familiar signal. The projector starts before Inés reaches the particularly dangerous part of the ending."
            },
            "npcLabel": null,
            "time": 0,
            "response": {
              "speakerId": "ines_valdes",
              "speech": "You must come in time for the film, at least.",
              "activity": "Pauses beside the row of cinema seats.",
              "emotion": "attentive",
              "gesture": "pause"
            }
          }
        ],
        "npc": "helpful"
      },
      {
        "id": "tea",
        "title": "Now we can discuss the ending",
        "prompt": "The credits end. Ada can offer one pot of tea; a discussion is not a claim on the projectionist’s evening.",
        "choices": [
          {
            "id": "tea",
            "label": "Buy the after-film tea slot",
            "style": "helpful",
            "outcome": "The argument moves to the tea table. The projectionist leaves on time, without having to decide who understood the film.",
            "signals": [
              "film_tea"
            ],
            "cost": 24,
            "narration": {
              "personal": "The argument moves to the tea table. The projectionist leaves on time, without having to decide who understood the film.",
              "public": "The argument moves to the tea table. The projectionist leaves on time, without having to decide who understood the film.",
              "npc": "The argument moves to the tea table. The projectionist leaves on time, without having to decide who understood the film."
            },
            "npcLabel": "Ada buys the after-film tea service",
            "time": 1,
            "response": {
              "speakerId": "ines_valdes",
              "speech": "Now I can explain the ending properly.",
              "activity": "Pauses beside the row of cinema seats.",
              "emotion": "warm",
              "gesture": "point"
            }
          },
          {
            "id": "next",
            "label": "Ask Ada about a separate short-film screening",
            "style": "selfish",
            "outcome": "Ada opens another date in the book. Inés wonders if a shorter film needs a proportionally shorter introduction. Nobody answers quickly.",
            "signals": [
              "screening_open"
            ],
            "narration": {
              "personal": "Ada opens another date in the book. Inés wonders if a shorter film needs a proportionally shorter introduction. Nobody answers quickly.",
              "public": "Ada opens another date in the book. Inés wonders if a shorter film needs a proportionally shorter introduction. Nobody answers quickly.",
              "npc": "Ada opens another date in the book. Inés wonders if a shorter film needs a proportionally shorter introduction. Nobody answers quickly."
            },
            "npcLabel": null,
            "time": 1,
            "response": {
              "speakerId": "ines_valdes",
              "speech": "A short film. I shall prepare a proportionate introduction.",
              "activity": "Pauses beside the row of cinema seats.",
              "emotion": "proud",
              "gesture": "point"
            }
          },
          {
            "id": "leave",
            "label": "Leave at the credits",
            "style": "refusal",
            "outcome": "The film is over for you. Inés has discovered one more thing the ending requires her to explain.",
            "signals": [
              "cinema_free"
            ],
            "narration": {
              "personal": "The film is over for you. Inés has discovered one more thing the ending requires her to explain.",
              "public": "{{actor}} leaves at the credits. Inés has discovered one more thing the ending requires her to explain.",
              "npc": "{{actor}} leaves at the credits. Inés has discovered one more thing the ending requires her to explain."
            },
            "npcLabel": null,
            "time": 0,
            "response": {
              "speakerId": "ines_valdes",
              "speech": "We will finish the argument at tea.",
              "activity": "Pauses beside the row of cinema seats.",
              "emotion": "attentive",
              "gesture": "pause"
            }
          }
        ],
        "npc": "helpful"
      }
    ],
    "place": "CINEMA",
    "personal": {
      "id": "own_part",
      "label": "Buy your own screening seat",
      "outcome": "Ada reserves your seat in the next ordinary screening. The ticket buys the film; Inés’s introduction comes with it.",
      "narration": {
        "personal": "Ada reserves your seat in the next ordinary screening. The ticket buys the film; Inés’s introduction comes with it.",
        "public": "{{actor}} makes a separate arrangement of their own.",
        "npc": "Ada reserves your seat in the next ordinary screening. The ticket buys the film; Inés’s introduction comes with it."
      },
      "cost": 18,
      "time": 1,
      "signals": [],
      "response": {
        "speakerId": "ines_valdes",
        "speech": "Let me check Ada’s time before I begin.",
        "activity": "Pauses beside the row of cinema seats.",
        "emotion": "warm",
        "gesture": "point"
      }
    }
  },
  {
    "id": "closing_hours",
    "title": "Never Listening Again",
    "region": "saffron",
    "cast": [
      "farah_hussain",
      "ines_valdes",
      "saffron_ada"
    ],
    "venue": "saffron-market",
    "object": "kestrel_ferry_mix",
    "desire": "Farah wants a quiet-day early closing so she can reach her radio-drama group.",
    "contradiction": "Her hours notice explains the fictional romance more clearly than her collection times.",
    "trigger": "A regular customer reads Farah’s revised closing sign and asks a reasonable practical question.",
    "ignored": "Farah tries one early close and attends late. Next week she returns to the drama she said she would abandon.",
    "beats": [
      {
        "id": "notice",
        "title": "The betrayal occurs at half past",
        "prompt": "The villain’s motives occupy three lines. The shop’s new closing time has a footnote.",
        "choices": [
          {
            "id": "clear",
            "label": "Put the shop hours above the romantic betrayal",
            "style": "helpful",
            "outcome": "The regular customer reads the new time and agrees to collect early. Farah has rehearsed a much more difficult argument.",
            "signals": [
              "shop_early"
            ],
            "narration": {
              "personal": "The regular customer reads the new time and agrees to collect early. Farah has rehearsed a much more difficult argument.",
              "public": "The regular customer reads the new time and agrees to collect early. Farah has rehearsed a much more difficult argument.",
              "npc": "The regular customer reads the new time and agrees to collect early. Farah has rehearsed a much more difficult argument."
            },
            "npcLabel": "Farah puts the hours above the drama explanation",
            "time": 1,
            "response": {
              "speakerId": "farah_hussain",
              "speech": "The hours first. The betrayal remains underneath.",
              "activity": "Moves the collection time above the spoiler.",
              "emotion": "warm",
              "gesture": "point"
            }
          },
          {
            "id": "late",
            "label": "Pay for one late collection",
            "style": "selfish",
            "outcome": "Farah accepts the late pickup and reaches the listening group later. This exception has a price and your name beside it.",
            "signals": [
              "shop_late"
            ],
            "cost": 18,
            "narration": {
              "personal": "Farah accepts the late pickup and reaches the listening group later. This exception has a price and your name beside it.",
              "public": "Farah accepts {{actor}}’s late pickup and reaches the listening group later. The exception has a price and a named customer.",
              "npc": "Farah accepts {{actor}}’s late pickup and reaches the listening group later. The exception has a price and a named customer."
            },
            "npcLabel": null,
            "time": 1,
            "response": {
              "speakerId": "farah_hussain",
              "speech": "I can do that collection. They can tell me the opening scene.",
              "activity": "Moves the collection time above the spoiler.",
              "emotion": "proud",
              "gesture": "point"
            }
          },
          {
            "id": "normal",
            "label": "Shop at the ordinary time",
            "style": "refusal",
            "outcome": "Farah tries the early close on her own. The villain’s motives no longer obstruct the opening hours.",
            "signals": [
              "shop_early"
            ],
            "narration": {
              "personal": "Farah tries the early close on her own. The villain’s motives no longer obstruct the opening hours.",
              "public": "Farah tries the early close on her own. The villain’s motives no longer obstruct the opening hours.",
              "npc": "Farah tries the early close on her own. The villain’s motives no longer obstruct the opening hours."
            },
            "npcLabel": null,
            "time": 0,
            "response": {
              "speakerId": "farah_hussain",
              "speech": "I shall try closing when the sign says.",
              "activity": "Moves the collection time above the spoiler.",
              "emotion": "attentive",
              "gesture": "pause"
            }
          }
        ],
        "npc": "helpful"
      },
      {
        "id": "episode",
        "title": "Never again, same time next week",
        "prompt": "Her favorite character does something indefensible. Someone offers Farah the spare group keys.",
        "choices": [
          {
            "id": "guest",
            "label": "Keep Farah a guest, without the spare keys",
            "style": "helpful",
            "outcome": "Farah refuses the keys and hears the episode. She says she will never listen again. The next week remains in her diary.",
            "signals": [
              "listening_guest"
            ],
            "narration": {
              "personal": "Farah refuses the keys and hears the episode. She says she will never listen again. The next week remains in her diary.",
              "public": "Farah refuses the keys and hears the episode. She says she will never listen again. The next week remains in her diary.",
              "npc": "Farah refuses the keys and hears the episode. She says she will never listen again. The next week remains in her diary."
            },
            "npcLabel": "Farah declines the keys and remains a guest",
            "time": 1,
            "response": {
              "speakerId": "farah_hussain",
              "speech": "I will listen. I will not take the keys.",
              "activity": "Moves the collection time above the spoiler.",
              "emotion": "warm",
              "gesture": "point"
            }
          },
          {
            "id": "snack",
            "label": "Buy next week’s biscuits",
            "style": "selfish",
            "outcome": "One packet is ordered for the next episode. Farah calls it an excessive vote of confidence in the writers.",
            "signals": [
              "listening_snacks"
            ],
            "cost": 12,
            "narration": {
              "personal": "One packet is ordered for the next episode. Farah calls it an excessive vote of confidence in the writers.",
              "public": "One packet is ordered for the next episode. Farah calls it an excessive vote of confidence in the writers.",
              "npc": "One packet is ordered for the next episode. Farah calls it an excessive vote of confidence in the writers."
            },
            "npcLabel": null,
            "time": 1,
            "response": {
              "speakerId": "farah_hussain",
              "speech": "Biscuits for next week. Apparently we are all coming back.",
              "activity": "Moves the collection time above the spoiler.",
              "emotion": "proud",
              "gesture": "point"
            }
          },
          {
            "id": "leave",
            "label": "Leave before the argument ends",
            "style": "refusal",
            "outcome": "Farah continues explaining the betrayal to those who remain. Next week she will need to know what happened afterward.",
            "signals": [
              "listening_guest"
            ],
            "narration": {
              "personal": "Farah continues explaining the betrayal to those who remain. Next week she will need to know what happened afterward.",
              "public": "Farah continues explaining the betrayal to those who remain. Next week she will need to know what happened afterward.",
              "npc": "Farah continues explaining the betrayal to those who remain. Next week she will need to know what happened afterward."
            },
            "npcLabel": null,
            "time": 0,
            "response": {
              "speakerId": "farah_hussain",
              "speech": "I have only one more thing to say about it.",
              "activity": "Moves the collection time above the spoiler.",
              "emotion": "attentive",
              "gesture": "pause"
            }
          }
        ],
        "npc": "helpful"
      }
    ],
    "place": "MARKET",
    "personal": {
      "id": "own_part",
      "label": "Buy a packet before Farah closes",
      "outcome": "Farah sells you one Kestrel packet before the posted close. You leave knowing both the collection time and the villain’s mistake.",
      "narration": {
        "personal": "Farah sells you one Kestrel packet before the posted close. You leave knowing both the collection time and the villain’s mistake.",
        "public": "{{actor}} makes a separate arrangement of their own.",
        "npc": "Farah sells you one Kestrel packet before the posted close. You leave knowing both the collection time and the villain’s mistake."
      },
      "cost": 6,
      "time": 1,
      "signals": [
        "listening_snacks"
      ],
      "response": {
        "speakerId": "farah_hussain",
        "speech": "The hours are on the first line now.",
        "activity": "Moves the collection time above the spoiler.",
        "emotion": "warm",
        "gesture": "point"
      }
    }
  },
  {
    "id": "nine_locks",
    "title": "A Welcoming Rule",
    "region": "saffron",
    "cast": [
      "sami",
      "vera_valdes",
      "saffron_ada"
    ],
    "venue": "saffron-arcade",
    "object": "nine_locks",
    "desire": "Sami wants the prototype rules understood; Vera wants her perfectly legal win acknowledged.",
    "contradiction": "A rule introduced as welcoming is immediately used against the person who praised it.",
    "trigger": "A voluntary Nine Locks demonstration is sharing the venue’s small table schedule with other public activities.",
    "ignored": "Sami tests with willing peers. Vera’s own game remains separate property. No bets, adult labor or financial duties are assigned to a child.",
    "beats": [
      {
        "id": "rule",
        "title": "It was very easy to learn",
        "prompt": "Vera has won under the rule everybody just called friendly. Sami asks whether the rule was clear. She asks if that means the win counts.",
        "choices": [
          {
            "id": "acknowledge",
            "label": "Count Vera’s win and play another round",
            "style": "helpful",
            "outcome": "Vera accepts the acknowledgment immediately. Sami asks again whether the rule was clear. “I won clearly,” she says.",
            "signals": [
              "demo_clear"
            ],
            "narration": {
              "personal": "Vera accepts the acknowledgment immediately. Sami asks again whether the rule was clear. “I won clearly,” she says.",
              "public": "Vera accepts the acknowledgment immediately. Sami asks again whether the rule was clear. “I won clearly,” she says.",
              "npc": "Vera accepts the acknowledgment immediately. Sami asks again whether the rule was clear. “I won clearly,” she says."
            },
            "npcLabel": "Sami acknowledges Vera’s win and offers another round",
            "time": 1,
            "response": {
              "speakerId": "sami",
              "speech": "It counted. I was checking whether the rule was clear.",
              "activity": "Sets the rule sheet beside the board.",
              "emotion": "warm",
              "gesture": "point"
            }
          },
          {
            "id": "rematch",
            "label": "Ask for a quick rematch",
            "style": "selfish",
            "outcome": "The table stays occupied until the booked end. Vera is delighted by a rule that makes newcomers feel welcome enough to lose twice.",
            "signals": [
              "game_table"
            ],
            "narration": {
              "personal": "The table stays occupied until the booked end. Vera is delighted by a rule that makes newcomers feel welcome enough to lose twice.",
              "public": "The table stays occupied until the booked end. Vera is delighted by a rule that makes newcomers feel welcome enough to lose twice.",
              "npc": "The table stays occupied until the booked end. Vera is delighted by a rule that makes newcomers feel welcome enough to lose twice."
            },
            "npcLabel": null,
            "time": 1,
            "response": {
              "speakerId": "sami",
              "speech": "Another round. The table booking still ends on time.",
              "activity": "Sets the rule sheet beside the board.",
              "emotion": "proud",
              "gesture": "point"
            }
          },
          {
            "id": "stop",
            "label": "Stop after the round",
            "style": "refusal",
            "outcome": "Vera keeps the win and Sami gets the table back. She considers this a satisfactory demonstration.",
            "signals": [
              "game_done"
            ],
            "narration": {
              "personal": "Vera keeps the win and Sami gets the table back. She considers this a satisfactory demonstration.",
              "public": "Vera keeps the win and Sami gets the table back. She considers this a satisfactory demonstration.",
              "npc": "Vera keeps the win and Sami gets the table back. She considers this a satisfactory demonstration."
            },
            "npcLabel": null,
            "time": 0,
            "response": {
              "speakerId": "sami",
              "speech": "Vera keeps the win. I keep the rule sheet.",
              "activity": "Sets the rule sheet beside the board.",
              "emotion": "attentive",
              "gesture": "pause"
            }
          }
        ],
        "npc": "helpful"
      },
      {
        "id": "demo",
        "title": "A small crowd wants an explanation",
        "prompt": "Sami can repeat the demonstration at a booked adult-run event or keep it in the shop. Vera decides whether she wants to play again.",
        "choices": [
          {
            "id": "short",
            "label": "Finish the demo on time",
            "style": "helpful",
            "outcome": "Sami clears the table for the next activity. Vera repeats the score to somebody who has just arrived.",
            "signals": [
              "demo_finished"
            ],
            "narration": {
              "personal": "Sami clears the table for the next activity. Vera repeats the score to somebody who has just arrived.",
              "public": "Sami clears the table for the next activity. Vera repeats the score to somebody who has just arrived.",
              "npc": "Sami clears the table for the next activity. Vera repeats the score to somebody who has just arrived."
            },
            "npcLabel": "Sami finishes the public demonstration on time",
            "time": 1,
            "response": {
              "speakerId": "sami",
              "speech": "The next group needs the table now.",
              "activity": "Sets the rule sheet beside the board.",
              "emotion": "warm",
              "gesture": "point"
            }
          },
          {
            "id": "display",
            "label": "Ask Sami to display the rules elsewhere",
            "style": "selfish",
            "outcome": "Sami offers a display copy. Vera may play again if she wants; the poster does not sign her up for anything.",
            "signals": [
              "rules_display"
            ],
            "narration": {
              "personal": "Sami offers a display copy. Vera may play again if she wants; the poster does not sign her up for anything.",
              "public": "Sami offers a display copy. Vera may play again if she wants; the poster does not sign her up for anything.",
              "npc": "Sami offers a display copy. Vera may play again if she wants; the poster does not sign her up for anything."
            },
            "npcLabel": null,
            "time": 1,
            "response": {
              "speakerId": "sami",
              "speech": "I can bring a display copy. Playing again is up to Vera.",
              "activity": "Sets the rule sheet beside the board.",
              "emotion": "proud",
              "gesture": "point"
            }
          },
          {
            "id": "private",
            "label": "Leave future games for another day",
            "style": "refusal",
            "outcome": "The game ends as a game. Vera retains the particular pleasure of having won this one.",
            "signals": [
              "game_done"
            ],
            "narration": {
              "personal": "The game ends as a game. Vera retains the particular pleasure of having won this one.",
              "public": "The game ends as a game. Vera retains the particular pleasure of having won this one.",
              "npc": "The game ends as a game. Vera retains the particular pleasure of having won this one."
            },
            "npcLabel": null,
            "time": 0,
            "response": {
              "speakerId": "sami",
              "speech": "A finished game is useful evidence, too.",
              "activity": "Sets the rule sheet beside the board.",
              "emotion": "attentive",
              "gesture": "pause"
            }
          }
        ],
        "npc": "helpful"
      }
    ],
    "place": "ARCADE",
    "personal": {
      "id": "own_part",
      "label": "Play one voluntary round",
      "outcome": "You play one round with a willing opponent. Vera does not surrender her previous win when you win a different one.",
      "narration": {
        "personal": "You play one round with a willing opponent. Vera does not surrender her previous win when you win a different one.",
        "public": "{{actor}} makes a separate arrangement of their own.",
        "npc": "You play one round with a willing opponent. Vera does not surrender her previous win when you win a different one."
      },
      "cost": 0,
      "time": 1,
      "signals": [],
      "response": {
        "speakerId": "sami",
        "speech": "The next group still gets its table.",
        "activity": "Sets the rule sheet beside the board.",
        "emotion": "warm",
        "gesture": "point"
      }
    }
  },
  {
    "id": "first_shift",
    "title": "A Hot Lunch, Eventually",
    "region": "saffron",
    "cast": [
      "saffron_leila",
      "saffron_tomas",
      "rafael_valdes"
    ],
    "venue": "saffron-market",
    "object": "first_shift_griddle",
    "desire": "Leila wants the first-shift customers fed while Tomas wants to finish a repair and eat his own lunch hot.",
    "contradiction": "His Gullwing lunch tin is so good at keeping food that everybody assumes it also creates time to eat it.",
    "trigger": "Leila has a working griddle and a finite Dock Folds batch. A canopy repair and a cinema order want the same collection window.",
    "ignored": "Leila sells the ordinary batch and Tomas takes his agreed break. Nobody must run an errand to unlock lunch.",
    "beats": [
      {
        "id": "batch",
        "title": "The efficient lunch has gone cold",
        "prompt": "Leila can make one additional paid batch before the griddle changes over. Existing customer portions are protected.",
        "choices": [
          {
            "id": "cinema",
            "label": "Buy the extra Dock Folds for the cinema",
            "style": "helpful",
            "outcome": "Leila packs a separate cinema batch. Ada gets food and a collection time, rather than a promise that exposure will be filling.",
            "signals": [
              "folds_cinema"
            ],
            "cost": 72,
            "narration": {
              "personal": "Leila packs a separate cinema batch. Ada gets food and a collection time, rather than a promise that exposure will be filling.",
              "public": "Leila packs a separate cinema batch. Ada gets food and a collection time, rather than a promise that exposure will be filling.",
              "npc": "Leila packs a separate cinema batch. Ada gets food and a collection time, rather than a promise that exposure will be filling."
            },
            "npcLabel": "Ada buys Leila’s extra cinema snack batch",
            "time": 1,
            "response": {
              "speakerId": "saffron_leila",
              "speech": "Cinema on this label. That matters when the tins arrive.",
              "activity": "Lifts the griddle spatula clear of the next batch.",
              "emotion": "warm",
              "gesture": "point"
            }
          },
          {
            "id": "crew",
            "label": "Buy the extra repair-crew lunches",
            "style": "selfish",
            "outcome": "The crew gets the batch. Cinema guests can choose ordinary snacks. Tomas opens his lunch tin before another job can find him.",
            "signals": [
              "folds_crew"
            ],
            "cost": 72,
            "narration": {
              "personal": "The crew gets the batch. Cinema guests can choose ordinary snacks. Tomas opens his lunch tin before another job can find him.",
              "public": "The crew gets the batch. Cinema guests can choose ordinary snacks. Tomas opens his lunch tin before another job can find him.",
              "npc": "The crew gets the batch. Cinema guests can choose ordinary snacks. Tomas opens his lunch tin before another job can find him."
            },
            "npcLabel": null,
            "time": 1,
            "response": {
              "speakerId": "saffron_leila",
              "speech": "The repair crew gets this batch. They do need to eat.",
              "activity": "Lifts the griddle spatula clear of the next batch.",
              "emotion": "proud",
              "gesture": "point"
            }
          },
          {
            "id": "usual",
            "label": "Leave the extra batch unbooked",
            "style": "refusal",
            "outcome": "The regular customers eat. Leila turns the griddle over for the next service instead of cooking an imaginary queue.",
            "signals": [
              "folds_normal"
            ],
            "narration": {
              "personal": "The regular customers eat. Leila turns the griddle over for the next service instead of cooking an imaginary queue.",
              "public": "The regular customers eat. Leila turns the griddle over for the next service instead of cooking an imaginary queue.",
              "npc": "The regular customers eat. Leila turns the griddle over for the next service instead of cooking an imaginary queue."
            },
            "npcLabel": null,
            "time": 0,
            "response": {
              "speakerId": "saffron_leila",
              "speech": "The ordinary customers are still hungry.",
              "activity": "Lifts the griddle spatula clear of the next batch.",
              "emotion": "attentive",
              "gesture": "pause"
            }
          }
        ],
        "npc": "helpful"
      },
      {
        "id": "break",
        "title": "A remarkable tin cannot eat for him",
        "prompt": "The repair can wait through the agreed break or finish with a willing paid adult cover worker.",
        "choices": [
          {
            "id": "break",
            "label": "Let Tomas eat; collect after his break",
            "style": "helpful",
            "outcome": "Tomas takes a hot first bite. The collection moves to the real later time, which the remarkable tin could never have arranged for him.",
            "signals": [
              "repair_later"
            ],
            "narration": {
              "personal": "Tomas takes a hot first bite. The collection moves to the real later time, which the remarkable tin could never have arranged for him.",
              "public": "Tomas takes a hot first bite. The collection moves to the real later time, which the remarkable tin could never have arranged for him.",
              "npc": "Tomas takes a hot first bite. The collection moves to the real later time, which the remarkable tin could never have arranged for him."
            },
            "npcLabel": "Ada accepts collection after Tomas’s lunch break",
            "time": 1,
            "response": {
              "speakerId": "saffron_leila",
              "speech": "Let Tomas have his lunch. We can collect later.",
              "activity": "Lifts the griddle spatula clear of the next batch.",
              "emotion": "warm",
              "gesture": "point"
            }
          },
          {
            "id": "cover",
            "label": "Work the food collection shift",
            "style": "selfish",
            "outcome": "You hand over the food while Tomas takes his break. The specialist repair remains his job; lunch finally gets to be his lunch.",
            "signals": [
              "collection_staffed"
            ],
            "commit": "collection-shift",
            "narration": {
              "personal": "You hand over the food while Tomas takes his break. The specialist repair remains his job; lunch finally gets to be his lunch.",
              "public": "{{actor}} hands over the food while Tomas takes his break. The specialist repair remains his job; lunch finally gets to be his lunch.",
              "npc": "{{actor}} hands over the food while Tomas takes his break. The specialist repair remains his job; lunch finally gets to be his lunch."
            },
            "npcLabel": null,
            "paidHours": 4,
            "workField": "service",
            "time": 1,
            "response": {
              "speakerId": "saffron_leila",
              "speech": "Food collection. Tomas keeps the specialist repair.",
              "activity": "Lifts the griddle spatula clear of the next batch.",
              "emotion": "proud",
              "gesture": "point"
            }
          },
          {
            "id": "leave",
            "label": "Leave the ordinary schedule alone",
            "style": "refusal",
            "outcome": "Leila closes the extra order sheet. Tomas sits down with the Gullwing tin, which has completed its part of the arrangement.",
            "signals": [
              "repair_later"
            ],
            "narration": {
              "personal": "Leila closes the extra order sheet. Tomas sits down with the Gullwing tin, which has completed its part of the arrangement.",
              "public": "Leila closes the extra order sheet. Tomas sits down with the Gullwing tin, which has completed its part of the arrangement.",
              "npc": "Leila closes the extra order sheet. Tomas sits down with the Gullwing tin, which has completed its part of the arrangement."
            },
            "npcLabel": null,
            "time": 0,
            "response": {
              "speakerId": "saffron_leila",
              "speech": "The griddle changes over when it changes over.",
              "activity": "Lifts the griddle spatula clear of the next batch.",
              "emotion": "attentive",
              "gesture": "pause"
            }
          }
        ],
        "npc": "helpful"
      }
    ],
    "place": "MARKET",
    "personal": {
      "id": "own_part",
      "label": "Buy your own hot Dock Fold",
      "outcome": "Leila sells you one Dock Fold from the ordinary batch. Tomas takes his own lunch break. Your food is not cinema stock.",
      "narration": {
        "personal": "Leila sells you one Dock Fold from the ordinary batch. Tomas takes his own lunch break. Your food is not cinema stock.",
        "public": "{{actor}} makes a separate arrangement of their own.",
        "npc": "Leila sells you one Dock Fold from the ordinary batch. Tomas takes his own lunch break. Your food is not cinema stock."
      },
      "cost": 18,
      "time": 1,
      "signals": [],
      "response": {
        "speakerId": "saffron_leila",
        "speech": "Put the right name on the batch.",
        "activity": "Lifts the griddle spatula clear of the next batch.",
        "emotion": "warm",
        "gesture": "point"
      }
    }
  }
];
export const ensembleRules: EnsembleRule[] = [
  {
    "id": "ordinary_supper_table",
    "signals": [
      "modest_supper",
      "clear_supper"
    ],
    "to": "commentary",
    "label": "Book a quiet diner table away from the match",
    "outcome": "June has an ordinary table free. Rosa can keep the match on; the supper will not need to shout over it.",
    "emit": [
      "interval_slot"
    ],
    "kind": "access",
    "cost": 30,
    "narration": {
      "personal": "June has an ordinary table free. Rosa can keep the match on; the supper will not need to shout over it.",
      "public": "June has an ordinary table free. Rosa can keep the match on; the supper will not need to shout over it.",
      "npc": "June has an ordinary table free. Rosa can keep the match on; the supper will not need to shout over it."
    },
    "npcLabel": null,
    "time": 1,
    "response": {
      "speakerId": "rosa_moreno",
      "speech": "We can fit that around the match.",
      "activity": "Turns the radio down and leans closer.",
      "emotion": "warm",
      "gesture": "point"
    }
  },
  {
    "id": "artist_cover",
    "signals": [
      "art_commission"
    ],
    "to": "dalloway",
    "label": "Take Kit’s spare preparation shift",
    "outcome": "Kit draws the new page while you do the paid preparation. The commission finally bought Kit time to draw instead of another explanation.",
    "emit": [
      "diner_staffed"
    ],
    "kind": "work",
    "commit": "short-preparation-shift",
    "narration": {
      "personal": "Kit draws the new page while you do the paid preparation. The commission finally bought Kit time to draw instead of another explanation.",
      "public": "Kit draws the new page while {{actor}} does the paid preparation. The commission finally bought Kit time to draw instead of another explanation.",
      "npc": "Kit draws the new page while {{actor}} does the paid preparation. The commission finally bought Kit time to draw instead of another explanation."
    },
    "npcLabel": null,
    "paidHours": 4,
            "workField": "service",
    "time": 1,
    "response": {
      "speakerId": "mesa_june",
      "speech": "Show me what is actually booked.",
      "activity": "Touches the Dalloway’s worn thumb paddle.",
      "emotion": "warm",
      "gesture": "point"
    }
  },
  {
    "id": "consolidated_biscuits",
    "signals": [
      "grocery_order",
      "repeat_order"
    ],
    "to": "broth",
    "label": "Add one Kestrel packet to the paid grocery pickup",
    "outcome": "Lio gets one packet at the shared pickup price. Ravi draws a box for the next one. Lio turns the sheet over.",
    "emit": [
      "broth_sale"
    ],
    "kind": "resource",
    "cost": 6,
    "narration": {
      "personal": "Lio gets one packet at the shared pickup price. Ravi draws a box for the next one. Lio turns the sheet over.",
      "public": "Lio gets one packet at the shared pickup price. Ravi draws a box for the next one. Lio turns the sheet over.",
      "npc": "Lio gets one packet at the shared pickup price. Ravi draws a box for the next one. Lio turns the sheet over."
    },
    "npcLabel": null,
    "time": 1,
    "response": {
      "speakerId": "pelagia_lio",
      "speech": "Tell me the quantity before I open another packet.",
      "activity": "Rests the ladle beside the broth pot.",
      "emotion": "warm",
      "gesture": "point"
    }
  },
  {
    "id": "safe_groceries",
    "signals": [
      "road_safe",
      "route_status"
    ],
    "to": "extra_run",
    "label": "Show Ravi the current road report and ask for a quote",
    "outcome": "Ravi prices the route that is actually open. He crosses out EMERGENCY and finds another adjective.",
    "emit": [
      "inland_quote"
    ],
    "kind": "evidence",
    "narration": {
      "personal": "Ravi prices the route that is actually open. He crosses out EMERGENCY and finds another adjective.",
      "public": "Ravi prices the route that is actually open. He crosses out EMERGENCY and finds another adjective.",
      "npc": "Ravi prices the route that is actually open. He crosses out EMERGENCY and finds another adjective."
    },
    "npcLabel": null,
    "time": 1,
    "response": {
      "speakerId": "ravi_desai",
      "speech": "Write the quantity down. Then I can quote the load.",
      "activity": "Draws a box on the order sheet.",
      "emotion": "warm",
      "gesture": "point"
    }
  },
  {
    "id": "lost_buyer",
    "signals": [
      "cover_installed"
    ],
    "to": "broth",
    "label": "Ask Lio to buy the good vegetables locally",
    "outcome": "Lio buys the small usable batch. Tavi points to the healthy leaves while insisting that the missed shipment was a different failure.",
    "emit": [
      "broth_batch"
    ],
    "kind": "resource",
    "narration": {
      "personal": "Lio buys the small usable batch. Tavi points to the healthy leaves while insisting that the missed shipment was a different failure.",
      "public": "Lio buys the small usable batch. Tavi points to the healthy leaves while insisting that the missed shipment was a different failure.",
      "npc": "Lio buys the small usable batch. Tavi points to the healthy leaves while insisting that the missed shipment was a different failure."
    },
    "npcLabel": null,
    "time": 1,
    "response": {
      "speakerId": "pelagia_lio",
      "speech": "Tell me the quantity before I open another packet.",
      "activity": "Rests the ladle beside the broth pot.",
      "emotion": "warm",
      "gesture": "point"
    }
  },
  {
    "id": "queue_question",
    "signals": [
      "route_suspicion"
    ],
    "to": "missing_shot",
    "label": "Ask Nila whether her queue footage shows the disputed load",
    "outcome": "Nila finds the long, uneventful sequence. The part everybody wanted shortened now has a particular point.",
    "emit": [
      "queue_evidence"
    ],
    "kind": "evidence",
    "narration": {
      "personal": "Nila finds the long, uneventful sequence. The part everybody wanted shortened now has a particular point.",
      "public": "Nila finds the long, uneventful sequence. The part everybody wanted shortened now has a particular point.",
      "npc": "Nila finds the long, uneventful sequence. The part everybody wanted shortened now has a particular point."
    },
    "npcLabel": null,
    "time": 1,
    "response": {
      "speakerId": "nila_desai",
      "speech": "The film and the dispatch book answer different questions.",
      "activity": "Keeps one hand beside the edit controls.",
      "emotion": "warm",
      "gesture": "point"
    }
  },
  {
    "id": "record_dispatch",
    "signals": [
      "full_record"
    ],
    "to": "missing_shot",
    "label": "Check the dispatch log instead of requesting Nila’s film",
    "outcome": "The log shows the loading order. Nila can leave that argument outside her edit.",
    "emit": [
      "queue_correction"
    ],
    "kind": "evidence",
    "narration": {
      "personal": "The log shows the loading order. Nila can leave that argument outside her edit.",
      "public": "The log shows the loading order. Nila can leave that argument outside her edit.",
      "npc": "The log shows the loading order. Nila can leave that argument outside her edit."
    },
    "npcLabel": null,
    "time": 1,
    "response": {
      "speakerId": "nila_desai",
      "speech": "The film and the dispatch book answer different questions.",
      "activity": "Keeps one hand beside the edit controls.",
      "emotion": "warm",
      "gesture": "point"
    }
  },
  {
    "id": "hero_poster",
    "signals": [
      "hero_crop"
    ],
    "to": "empty_counter",
    "label": "Send Kit the whole Pelagia repair record for a new-page quote",
    "outcome": "Kit reads the permitted Pelagia photographs from Ember Mesa and offers a new page with the platform and inspection in it. Lata replies to ask whether the silver sleeve needs to be quite that recognizable.",
    "emit": [
      "poster_offer"
    ],
    "kind": "work",
    "narration": {
      "personal": "Kit reads the permitted Pelagia photographs from Ember Mesa and offers a new page with the platform and inspection in it. Lata replies to ask whether the silver sleeve needs to be quite that recognizable.",
      "public": "Kit reads the permitted Pelagia photographs from Ember Mesa and offers a new page with the platform and inspection in it. Lata replies to ask whether the silver sleeve needs to be quite that recognizable.",
      "npc": "Kit reads the permitted Pelagia photographs from Ember Mesa and offers a new page with the platform and inspection in it. Lata replies to ask whether the silver sleeve needs to be quite that recognizable."
    },
    "npcLabel": null,
    "time": 1,
    "response": {
      "speakerId": "kit",
      "speech": "I can draw an ordinary day. It is allowed to be ordinary.",
      "activity": "Turns the order-slip drawing toward you.",
      "emotion": "warm",
      "gesture": "point"
    },
    "correspondence": true
  },
  {
    "id": "inland_collection",
    "signals": [
      "inland_available",
      "inland_quote"
    ],
    "to": "route_green",
    "label": "Compare Lata’s inland quote with Esperanza’s local collection",
    "outcome": "Esperanza reads Lata’s Pelagia quote beside her own Ember Mesa route. She offers an early local collection; the two vans do not become one route.",
    "emit": [
      "collection_window"
    ],
    "kind": "option",
    "narration": {
      "personal": "Esperanza reads Lata’s Pelagia quote beside her own Ember Mesa route. She offers an early local collection; the two vans do not become one route.",
      "public": "Esperanza reads Lata’s Pelagia quote beside her own Ember Mesa route. She offers an early local collection; the two vans do not become one route.",
      "npc": "Esperanza reads Lata’s Pelagia quote beside her own Ember Mesa route. She offers an early local collection; the two vans do not become one route."
    },
    "npcLabel": null,
    "time": 1,
    "response": {
      "speakerId": "esperanza_vega",
      "speech": "Here is the route. Here is the space that is left.",
      "activity": "Checks the one remaining space in the van.",
      "emotion": "warm",
      "gesture": "point"
    },
    "correspondence": true
  },
  {
    "id": "groceries_loaf",
    "signals": [
      "grocery_order",
      "repeat_order"
    ],
    "to": "late_loaf",
    "label": "Ask Hugo for a separate Alder bread quote after Ravi’s order",
    "outcome": "Ravi’s paid Pelagia order prompts a quantity question to Hugo in Alder. Hugo sends a separate quote after setting his night-worker parcels aside. No bread has been bought or shipped on that quote.",
    "emit": [
      "bread_quote"
    ],
    "kind": "work",
    "narration": {
      "personal": "Ravi’s paid Pelagia order prompts a quantity question to Hugo in Alder. Hugo sends a separate quote after setting his night-worker parcels aside. No bread has been bought or shipped on that quote.",
      "public": "Ravi’s paid Pelagia order prompts a quantity question to Hugo in Alder. Hugo sends a separate quote after setting his night-worker parcels aside. No bread has been bought or shipped on that quote.",
      "npc": "Ravi’s paid Pelagia order prompts a quantity question to Hugo in Alder. Hugo sends a separate quote after setting his night-worker parcels aside. No bread has been bought or shipped on that quote."
    },
    "npcLabel": null,
    "time": 1,
    "response": {
      "speakerId": "hugo",
      "speech": "The promised parcels stay on this side.",
      "activity": "Folds the paper around a waiting loaf.",
      "emotion": "warm",
      "gesture": "point"
    },
    "correspondence": true
  },
  {
    "id": "freight_tea",
    "signals": [
      "repeat_order",
      "freight_staffed"
    ],
    "to": "six_chairs",
    "label": "Ask Ada to price a separate tea consignment from Pelagia",
    "outcome": "Ada in Saffron receives the terms of Ravi’s staffed Pelagia run. She asks for a Saffron freight quote and the price of the packets. Neither the route nor the tea is purchased by the question.",
    "emit": [
      "tea_supply_quote"
    ],
    "kind": "resource",
    "narration": {
      "personal": "Ada in Saffron receives the terms of Ravi’s staffed Pelagia run. She asks for a Saffron freight quote and the price of the packets. Neither the route nor the tea is purchased by the question.",
      "public": "Ada in Saffron receives the terms of Ravi’s staffed Pelagia run. She asks for a Saffron freight quote and the price of the packets. Neither the route nor the tea is purchased by the question.",
      "npc": "Ada in Saffron receives the terms of Ravi’s staffed Pelagia run. She asks for a Saffron freight quote and the price of the packets. Neither the route nor the tea is purchased by the question."
    },
    "npcLabel": null,
    "time": 1,
    "response": {
      "speakerId": "ines_valdes",
      "speech": "Let me check Ada’s time before I begin.",
      "activity": "Pauses beside the row of cinema seats.",
      "emotion": "warm",
      "gesture": "point"
    },
    "correspondence": true
  },
  {
    "id": "freight_small",
    "signals": [
      "small_load",
      "freight_limited"
    ],
    "to": "broth",
    "label": "Buy the broth supplies locally",
    "outcome": "Lio chooses the smaller local quantity. The service can work without Ravi filling another boat.",
    "emit": [
      "broth_limited"
    ],
    "kind": "option",
    "narration": {
      "personal": "Lio chooses the smaller local quantity. The service can work without Ravi filling another boat.",
      "public": "Lio chooses the smaller local quantity. The service can work without Ravi filling another boat.",
      "npc": "Lio chooses the smaller local quantity. The service can work without Ravi filling another boat."
    },
    "npcLabel": null,
    "time": 1,
    "response": {
      "speakerId": "pelagia_lio",
      "speech": "Tell me the quantity before I open another packet.",
      "activity": "Rests the ladle beside the broth pot.",
      "emotion": "warm",
      "gesture": "point"
    }
  },
  {
    "id": "premium_batch",
    "signals": [
      "premium_freight"
    ],
    "to": "route_green",
    "label": "Compare Ravi’s written freight price with Esperanza’s local van",
    "outcome": "Esperanza reads the Pelagia freight price in Ember Mesa and quotes her own remaining local crate space. “Now that,” she says, “may actually be on the way.”",
    "emit": [
      "van_free"
    ],
    "kind": "option",
    "narration": {
      "personal": "Esperanza reads the Pelagia freight price in Ember Mesa and quotes her own remaining local crate space. “Now that,” she says, “may actually be on the way.”",
      "public": "Esperanza reads the Pelagia freight price in Ember Mesa and quotes her own remaining local crate space. “Now that,” she says, “may actually be on the way.”",
      "npc": "Esperanza reads the Pelagia freight price in Ember Mesa and quotes her own remaining local crate space. “Now that,” she says, “may actually be on the way.”"
    },
    "npcLabel": null,
    "time": 1,
    "response": {
      "speakerId": "esperanza_vega",
      "speech": "Here is the route. Here is the space that is left.",
      "activity": "Checks the one remaining space in the van.",
      "emotion": "warm",
      "gesture": "point"
    },
    "correspondence": true
  },
  {
    "id": "film_clear",
    "signals": [
      "queue_correction",
      "queue_evidence"
    ],
    "to": "extra_run",
    "label": "Buy the two-run trial after checking the queue",
    "outcome": "The corrected queue record persuades you to buy two deliveries. Ravi puts the payment beside the order, where mere interest used to be.",
    "emit": [
      "repeat_order"
    ],
    "kind": "evidence",
    "cost": 144,
    "commit": "two-delivery-trial",
    "narration": {
      "personal": "The corrected queue record persuades you to buy two deliveries. Ravi puts the payment beside the order, where mere interest used to be.",
      "public": "{{actor}} checks the queue record and buys two deliveries. Ravi puts the payment beside the order, where mere interest used to be.",
      "npc": "{{actor}} checks the queue record and buys two deliveries. Ravi puts the payment beside the order, where mere interest used to be."
    },
    "npcLabel": null,
    "time": 1,
    "response": {
      "speakerId": "ravi_desai",
      "speech": "Write the quantity down. Then I can quote the load.",
      "activity": "Draws a box on the order sheet.",
      "emotion": "warm",
      "gesture": "point"
    }
  },
  {
    "id": "film_screen",
    "signals": [
      "film_offer",
      "short_film"
    ],
    "to": "six_chairs",
    "label": "Ask Ada about a separately permitted digital screening of Nila’s short",
    "outcome": "Nila in Pelagia offers a digital copy for one agreed Saffron screening, after checking the participants’ permission. Ada proposes a date. The title is still about waiting; Ravi sends a much longer suggestion.",
    "emit": [
      "screening_open"
    ],
    "kind": "option",
    "narration": {
      "personal": "Nila in Pelagia offers a digital copy for one agreed Saffron screening, after checking the participants’ permission. Ada proposes a date. The title is still about waiting; Ravi sends a much longer suggestion.",
      "public": "Nila in Pelagia offers a digital copy for one agreed Saffron screening, after checking the participants’ permission. Ada proposes a date. The title is still about waiting; Ravi sends a much longer suggestion.",
      "npc": "Nila in Pelagia offers a digital copy for one agreed Saffron screening, after checking the participants’ permission. Ada proposes a date. The title is still about waiting; Ravi sends a much longer suggestion."
    },
    "npcLabel": null,
    "time": 1,
    "response": {
      "speakerId": "ines_valdes",
      "speech": "Let me check Ada’s time before I begin.",
      "activity": "Pauses beside the row of cinema seats.",
      "emotion": "warm",
      "gesture": "point"
    },
    "correspondence": true
  },
  {
    "id": "dispatch_route",
    "signals": [
      "dispatch_alternative"
    ],
    "to": "whaleskin",
    "label": "Ask for the ordinary dispatch log",
    "outcome": "The loading order answers the queue claim. It says nothing about who should win every other argument.",
    "emit": [
      "full_record"
    ],
    "kind": "evidence",
    "beforeBeat": 3,
    "narration": {
      "personal": "The loading order answers the queue claim. It says nothing about who should win every other argument.",
      "public": "The loading order answers the queue claim. It says nothing about who should win every other argument.",
      "npc": "The loading order answers the queue claim. It says nothing about who should win every other argument."
    },
    "npcLabel": null,
    "time": 1,
    "response": {
      "speakerId": "lata_rao",
      "speech": "Mara has the inspection. Ask her about the road.",
      "activity": "Folds a silver mirror sleeve over one arm.",
      "emotion": "warm",
      "gesture": "point"
    }
  },
  {
    "id": "broth_orders",
    "signals": [
      "broth_batch",
      "broth_sale"
    ],
    "to": "extra_run",
    "label": "Pay for Lio’s extra biscuit quantity",
    "outcome": "Ravi adds the paid quantity to the load. Lio watches to make sure the word EXTRA does not acquire another zero.",
    "emit": [
      "grocery_order"
    ],
    "kind": "resource",
    "cost": 12,
    "narration": {
      "personal": "Ravi adds the paid quantity to the load. Lio watches to make sure the word EXTRA does not acquire another zero.",
      "public": "Ravi adds the paid quantity to the load. Lio watches to make sure the word EXTRA does not acquire another zero.",
      "npc": "Ravi adds the paid quantity to the load. Lio watches to make sure the word EXTRA does not acquire another zero."
    },
    "npcLabel": null,
    "time": 1,
    "response": {
      "speakerId": "ravi_desai",
      "speech": "Write the quantity down. Then I can quote the load.",
      "activity": "Draws a box on the order sheet.",
      "emotion": "warm",
      "gesture": "point"
    }
  },
  {
    "id": "broth_window",
    "signals": [
      "early_collection"
    ],
    "to": "last_crossing",
    "label": "Ask Tess for her own café collection window after Lio’s message",
    "outcome": "Lio sends his Pelagia collection terms. Tess compares them with her own Alder café closing time and offers a separate early pickup window. Nobody has to reach two towns for one bowl of broth.",
    "emit": [
      "collection_quote"
    ],
    "kind": "option",
    "narration": {
      "personal": "Lio sends his Pelagia collection terms. Tess compares them with her own Alder café closing time and offers a separate early pickup window. Nobody has to reach two towns for one bowl of broth.",
      "public": "Lio sends his Pelagia collection terms. Tess compares them with her own Alder café closing time and offers a separate early pickup window. Nobody has to reach two towns for one bowl of broth.",
      "npc": "Lio sends his Pelagia collection terms. Tess compares them with her own Alder café closing time and offers a separate early pickup window. Nobody has to reach two towns for one bowl of broth."
    },
    "npcLabel": null,
    "time": 1,
    "response": {
      "speakerId": "alder_tess",
      "speech": "The café time is this one. The ferry time is that one.",
      "activity": "Points to the two times on the board.",
      "emotion": "warm",
      "gesture": "point"
    },
    "correspondence": true
  },
  {
    "id": "broth_late",
    "signals": [
      "late_service"
    ],
    "to": "laundry",
    "label": "Ask Qiao for a local laundry quote after Lio’s late-service example",
    "outcome": "Qiao reads about Lio’s Pelagia late-service charge, then points to her own Glasssteppe ordinary price. She offers an earlier local collection. Lio’s booking occupies no part of her diary.",
    "emit": [
      "laundry_quote"
    ],
    "kind": "access",
    "narration": {
      "personal": "Qiao reads about Lio’s Pelagia late-service charge, then points to her own Glasssteppe ordinary price. She offers an earlier local collection. Lio’s booking occupies no part of her diary.",
      "public": "Qiao reads about Lio’s Pelagia late-service charge, then points to her own Glasssteppe ordinary price. She offers an earlier local collection. Lio’s booking occupies no part of her diary.",
      "npc": "Qiao reads about Lio’s Pelagia late-service charge, then points to her own Glasssteppe ordinary price. She offers an earlier local collection. Lio’s booking occupies no part of her diary."
    },
    "npcLabel": null,
    "time": 1,
    "response": {
      "speakerId": "qiao_chen",
      "speech": "Which collection? It changes the price.",
      "activity": "Taps the ordinary-price column.",
      "emotion": "warm",
      "gesture": "point"
    },
    "correspondence": true
  },
  {
    "id": "supper_jobs",
    "signals": [
      "supper_order"
    ],
    "to": "empty_counter",
    "label": "Take the supper’s extra diner shift",
    "outcome": "The paid supper buys Kit a colleague. You clear the plates while Kit finds a place to put the next drawing.",
    "emit": [
      "ordinary_art"
    ],
    "kind": "work",
    "commit": "supper-shift",
    "narration": {
      "personal": "The paid supper buys Kit a colleague. You clear the plates while Kit finds a place to put the next drawing.",
      "public": "The paid supper buys Kit a colleague. {{actor}} clears the plates while Kit finds a place to put the next drawing.",
      "npc": "The paid supper buys Kit a colleague. {{actor}} clears the plates while Kit finds a place to put the next drawing."
    },
    "npcLabel": null,
    "paidHours": 4,
            "workField": "service",
    "time": 1,
    "response": {
      "speakerId": "kit",
      "speech": "I can draw an ordinary day. It is allowed to be ordinary.",
      "activity": "Turns the order-slip drawing toward you.",
      "emotion": "warm",
      "gesture": "point"
    }
  },
  {
    "id": "supper_crate",
    "signals": [
      "supper_order",
      "clear_supper"
    ],
    "to": "route_green",
    "label": "Buy the diner’s crate from Esperanza",
    "outcome": "Esperanza takes payment for the crate and marks it for the open diner. Nobody has to be rescued for groceries to sell.",
    "emit": [
      "diner_supply"
    ],
    "kind": "resource",
    "cost": 72,
    "narration": {
      "personal": "Esperanza takes payment for the crate and marks it for the open diner. Nobody has to be rescued for groceries to sell.",
      "public": "Esperanza takes payment for the crate and marks it for the open diner. Nobody has to be rescued for groceries to sell.",
      "npc": "Esperanza takes payment for the crate and marks it for the open diner. Nobody has to be rescued for groceries to sell."
    },
    "npcLabel": null,
    "time": 1,
    "response": {
      "speakerId": "esperanza_vega",
      "speech": "Here is the route. Here is the space that is left.",
      "activity": "Checks the one remaining space in the van.",
      "emotion": "warm",
      "gesture": "point"
    }
  },
  {
    "id": "june_credit",
    "signals": [
      "june_tribute"
    ],
    "to": "commentary",
    "label": "Put June’s tribute speech at half-time",
    "outcome": "Rosa agrees to the interval. She reserves the right to finish a sentence about the referee first.",
    "emit": [
      "interval_slot"
    ],
    "kind": "access",
    "narration": {
      "personal": "Rosa agrees to the interval. She reserves the right to finish a sentence about the referee first.",
      "public": "Rosa agrees to the interval. She reserves the right to finish a sentence about the referee first.",
      "npc": "Rosa agrees to the interval. She reserves the right to finish a sentence about the referee first."
    },
    "npcLabel": null,
    "time": 1,
    "response": {
      "speakerId": "rosa_moreno",
      "speech": "We can fit that around the match.",
      "activity": "Turns the radio down and leans closer.",
      "emotion": "warm",
      "gesture": "point"
    }
  },
  {
    "id": "service_credit",
    "signals": [
      "handover_evidence"
    ],
    "to": "empty_counter",
    "label": "Ask Kit to draw both voices working the service",
    "outcome": "Kit puts the clear calls and June’s corrections on the same page. The picture now shows how the plates actually moved.",
    "emit": [
      "ordinary_art"
    ],
    "kind": "evidence",
    "narration": {
      "personal": "Kit puts the clear calls and June’s corrections on the same page. The picture now shows how the plates actually moved.",
      "public": "Kit puts the clear calls and June’s corrections on the same page. The picture now shows how the plates actually moved.",
      "npc": "Kit puts the clear calls and June’s corrections on the same page. The picture now shows how the plates actually moved."
    },
    "npcLabel": null,
    "time": 1,
    "response": {
      "speakerId": "kit",
      "speech": "I can draw an ordinary day. It is allowed to be ordinary.",
      "activity": "Turns the order-slip drawing toward you.",
      "emotion": "warm",
      "gesture": "point"
    }
  },
  {
    "id": "cover_loaf",
    "signals": [
      "diner_cover"
    ],
    "to": "late_loaf",
    "label": "Send June’s menu question to Hugo for a separate bread quote",
    "outcome": "Hugo in Alder sends a bread quantity and price to June in Ember Mesa. June compares it with her local baker. The message supplies a choice, not a delivered loaf.",
    "emit": [
      "bread_quote"
    ],
    "kind": "resource",
    "narration": {
      "personal": "Hugo in Alder sends a bread quantity and price to June in Ember Mesa. June compares it with her local baker. The message supplies a choice, not a delivered loaf.",
      "public": "Hugo in Alder sends a bread quantity and price to June in Ember Mesa. June compares it with her local baker. The message supplies a choice, not a delivered loaf.",
      "npc": "Hugo in Alder sends a bread quantity and price to June in Ember Mesa. June compares it with her local baker. The message supplies a choice, not a delivered loaf."
    },
    "npcLabel": null,
    "time": 1,
    "response": {
      "speakerId": "hugo",
      "speech": "The promised parcels stay on this side.",
      "activity": "Folds the paper around a waiting loaf.",
      "emotion": "warm",
      "gesture": "point"
    },
    "correspondence": true
  },
  {
    "id": "meal_tables",
    "signals": [
      "meal_served",
      "simple_menu"
    ],
    "to": "pantry_song",
    "label": "Ask Eli for a separate Alder supper quote using June’s menu",
    "outcome": "Eli reads the Ember Mesa menu in Alder and quotes for six actual diners of his own. June’s paid booking remains in June’s diner; it does not become Eli’s food or guest list.",
    "emit": [
      "potluck_quote"
    ],
    "kind": "resource",
    "narration": {
      "personal": "Eli reads the Ember Mesa menu in Alder and quotes for six actual diners of his own. June’s paid booking remains in June’s diner; it does not become Eli’s food or guest list.",
      "public": "Eli reads the Ember Mesa menu in Alder and quotes for six actual diners of his own. June’s paid booking remains in June’s diner; it does not become Eli’s food or guest list.",
      "npc": "Eli reads the Ember Mesa menu in Alder and quotes for six actual diners of his own. June’s paid booking remains in June’s diner; it does not become Eli’s food or guest list."
    },
    "npcLabel": null,
    "time": 1,
    "response": {
      "speakerId": "mina",
      "speech": "The song is not a guest list.",
      "activity": "Keeps the lyric side of the page facing down.",
      "emotion": "warm",
      "gesture": "point"
    },
    "correspondence": true
  },
  {
    "id": "caption_bell",
    "signals": [
      "accurate_drawing"
    ],
    "to": "dalloway",
    "label": "Put Kit’s “diner open” caption on the sign",
    "outcome": "The new caption makes STATION impossible to miss. June rings for the next ordinary order.",
    "emit": [
      "clear_supper"
    ],
    "kind": "evidence",
    "beforeBeat": 2,
    "setTarget": {
      "corrected": true
    },
    "narration": {
      "personal": "The new caption makes STATION impossible to miss. June rings for the next ordinary order.",
      "public": "The new caption makes STATION impossible to miss. June rings for the next ordinary order.",
      "npc": "The new caption makes STATION impossible to miss. June rings for the next ordinary order."
    },
    "npcLabel": null,
    "time": 1,
    "response": {
      "speakerId": "mesa_june",
      "speech": "Show me what is actually booked.",
      "activity": "Touches the Dalloway’s worn thumb paddle.",
      "emotion": "warm",
      "gesture": "point"
    }
  },
  {
    "id": "poster_cinema",
    "signals": [
      "poster_offer",
      "art_commission"
    ],
    "to": "six_chairs",
    "label": "Ask Kit to quote a new digital poster for Ada’s cinema",
    "outcome": "Ada sends the Saffron cinema time to Kit in Ember Mesa. Kit quotes for a separate digital poster and asks whether anybody will wash a cup in this one. No new drawing is owed until commissioned.",
    "emit": [
      "poster_quote"
    ],
    "kind": "work",
    "narration": {
      "personal": "Ada sends the Saffron cinema time to Kit in Ember Mesa. Kit quotes for a separate digital poster and asks whether anybody will wash a cup in this one. No new drawing is owed until commissioned.",
      "public": "Ada sends the Saffron cinema time to Kit in Ember Mesa. Kit quotes for a separate digital poster and asks whether anybody will wash a cup in this one. No new drawing is owed until commissioned.",
      "npc": "Ada sends the Saffron cinema time to Kit in Ember Mesa. Kit quotes for a separate digital poster and asks whether anybody will wash a cup in this one. No new drawing is owed until commissioned."
    },
    "npcLabel": null,
    "time": 1,
    "response": {
      "speakerId": "ines_valdes",
      "speech": "Let me check Ada’s time before I begin.",
      "activity": "Pauses beside the row of cinema seats.",
      "emotion": "warm",
      "gesture": "point"
    },
    "correspondence": true
  },
  {
    "id": "art_portrait",
    "signals": [
      "ordinary_art"
    ],
    "to": "portrait",
    "label": "Arrange a paid local display of permitted copies",
    "outcome": "The adult Glasssteppe host books a small display board. Kit sends a permitted copy from Ember Mesa; Jian chooses, with the adult host, whether his existing hobby drawing is included. No new work or appearance is assigned to him. Liang studies the ordinary cup.",
    "emit": [
      "portrait_display"
    ],
    "kind": "option",
    "narration": {
      "personal": "The adult Glasssteppe host books a small display board. Kit sends a permitted copy from Ember Mesa; Jian chooses, with the adult host, whether his existing hobby drawing is included. No new work or appearance is assigned to him. Liang studies the ordinary cup.",
      "public": "The adult Glasssteppe host books a small display board. Kit sends a permitted copy from Ember Mesa; Jian chooses, with the adult host, whether his existing hobby drawing is included. No new work or appearance is assigned to him. Liang studies the ordinary cup.",
      "npc": "The adult Glasssteppe host books a small display board. Kit sends a permitted copy from Ember Mesa; Jian chooses, with the adult host, whether his existing hobby drawing is included. No new work or appearance is assigned to him. Liang studies the ordinary cup."
    },
    "npcLabel": null,
    "time": 1,
    "response": {
      "speakerId": "liang_chen",
      "speech": "I was hoping for something quite natural.",
      "activity": "Adjusts the good chair by a very small amount.",
      "emotion": "warm",
      "gesture": "point"
    },
    "cost": 40,
    "correspondence": true
  },
  {
    "id": "supply_diner",
    "signals": [
      "diner_supply"
    ],
    "to": "dalloway",
    "label": "Plan the supper around the crate that was bought",
    "outcome": "June counts the ingredients and names the menu. The number of plates stops depending on enthusiasm.",
    "emit": [
      "meal_served"
    ],
    "kind": "resource",
    "narration": {
      "personal": "June counts the ingredients and names the menu. The number of plates stops depending on enthusiasm.",
      "public": "June counts the ingredients and names the menu. The number of plates stops depending on enthusiasm.",
      "npc": "June counts the ingredients and names the menu. The number of plates stops depending on enthusiasm."
    },
    "npcLabel": null,
    "time": 1,
    "response": {
      "speakerId": "mesa_june",
      "speech": "Show me what is actually booked.",
      "activity": "Touches the Dalloway’s worn thumb paddle.",
      "emotion": "warm",
      "gesture": "point"
    }
  },
  {
    "id": "garden_meal",
    "signals": [
      "garden_crate"
    ],
    "to": "pantry_song",
    "label": "Buy Eli a separate local crate using Esperanza’s packing list",
    "outcome": "Esperanza sends the list from her Ember Mesa garden crate. Eli uses it to order a separately paid Alder crate for his own small supper. The original crate and its owner stay in Ember Mesa. Mina changes none of the lyrics.",
    "emit": [
      "small_potluck"
    ],
    "kind": "resource",
    "narration": {
      "personal": "Esperanza sends the list from her Ember Mesa garden crate. Eli uses it to order a separately paid Alder crate for his own small supper. The original crate and its owner stay in Ember Mesa. Mina changes none of the lyrics.",
      "public": "Esperanza sends the list from her Ember Mesa garden crate. Eli uses it to order a separately paid Alder crate for his own small supper. The original crate and its owner stay in Ember Mesa. Mina changes none of the lyrics.",
      "npc": "Esperanza sends the list from her Ember Mesa garden crate. Eli uses it to order a separately paid Alder crate for his own small supper. The original crate and its owner stay in Ember Mesa. Mina changes none of the lyrics."
    },
    "npcLabel": null,
    "time": 1,
    "response": {
      "speakerId": "mina",
      "speech": "The song is not a guest list.",
      "activity": "Keeps the lyric side of the page facing down.",
      "emotion": "warm",
      "gesture": "point"
    },
    "cost": 60,
    "correspondence": true
  },
  {
    "id": "late_van_shop",
    "signals": [
      "late_stop"
    ],
    "to": "closing_hours",
    "label": "Keep Farah’s local early pickup after hearing about the booked van",
    "outcome": "Farah in Saffron reads about Esperanza’s full late stop in Ember Mesa. She keeps her own early shop collection available. The customer buys neither woman’s whole evening, and the van does not cross towns.",
    "emit": [
      "shop_early"
    ],
    "kind": "access",
    "narration": {
      "personal": "Farah in Saffron reads about Esperanza’s full late stop in Ember Mesa. She keeps her own early shop collection available. The customer buys neither woman’s whole evening, and the van does not cross towns.",
      "public": "Farah in Saffron reads about Esperanza’s full late stop in Ember Mesa. She keeps her own early shop collection available. The customer buys neither woman’s whole evening, and the van does not cross towns.",
      "npc": "Farah in Saffron reads about Esperanza’s full late stop in Ember Mesa. She keeps her own early shop collection available. The customer buys neither woman’s whole evening, and the van does not cross towns."
    },
    "npcLabel": null,
    "time": 1,
    "response": {
      "speakerId": "farah_hussain",
      "speech": "The hours are on the first line now.",
      "activity": "Moves the collection time above the spoiler.",
      "emotion": "warm",
      "gesture": "point"
    },
    "correspondence": true
  },
  {
    "id": "window_laundry",
    "signals": [
      "collection_window"
    ],
    "to": "laundry",
    "label": "Agree Qiao’s local collection window using the written route example",
    "outcome": "Esperanza sends her Ember Mesa collection timetable. Qiao uses the example to make her own Glasssteppe pickup window clear. Mei sees the departure day stay uncrossed in her sister’s diary. These are separate local routes.",
    "emit": [
      "laundry_early"
    ],
    "kind": "access",
    "narration": {
      "personal": "Esperanza sends her Ember Mesa collection timetable. Qiao uses the example to make her own Glasssteppe pickup window clear. Mei sees the departure day stay uncrossed in her sister’s diary. These are separate local routes.",
      "public": "Esperanza sends her Ember Mesa collection timetable. Qiao uses the example to make her own Glasssteppe pickup window clear. Mei sees the departure day stay uncrossed in her sister’s diary. These are separate local routes.",
      "npc": "Esperanza sends her Ember Mesa collection timetable. Qiao uses the example to make her own Glasssteppe pickup window clear. Mei sees the departure day stay uncrossed in her sister’s diary. These are separate local routes."
    },
    "npcLabel": null,
    "time": 1,
    "response": {
      "speakerId": "qiao_chen",
      "speech": "Which collection? It changes the price.",
      "activity": "Taps the ordinary-price column.",
      "emotion": "warm",
      "gesture": "point"
    },
    "correspondence": true
  },
  {
    "id": "interval_intro",
    "signals": [
      "interval_slot"
    ],
    "to": "six_chairs",
    "label": "Arrange a short recorded match message before the Saffron film",
    "outcome": "Rosa agrees to send a two-minute interval message from Ember Mesa. Ada gives the recording its own short Saffron slot before Inés’s introduction. Inés begins explaining why two minutes should be sufficient, using part of them.",
    "emit": [
      "screening_on_time"
    ],
    "kind": "access",
    "narration": {
      "personal": "Rosa agrees to send a two-minute interval message from Ember Mesa. Ada gives the recording its own short Saffron slot before Inés’s introduction. Inés begins explaining why two minutes should be sufficient, using part of them.",
      "public": "Rosa agrees to send a two-minute interval message from Ember Mesa. Ada gives the recording its own short Saffron slot before Inés’s introduction. Inés begins explaining why two minutes should be sufficient, using part of them.",
      "npc": "Rosa agrees to send a two-minute interval message from Ember Mesa. Ada gives the recording its own short Saffron slot before Inés’s introduction. Inés begins explaining why two minutes should be sufficient, using part of them."
    },
    "npcLabel": null,
    "time": 1,
    "response": {
      "speakerId": "ines_valdes",
      "speech": "Let me check Ada’s time before I begin.",
      "activity": "Pauses beside the row of cinema seats.",
      "emotion": "warm",
      "gesture": "point"
    },
    "correspondence": true
  },
  {
    "id": "listening_potluck",
    "signals": [
      "listening_table",
      "replay_table"
    ],
    "to": "pantry_song",
    "label": "Pay for Alder’s own small listening supper",
    "outcome": "Rosa sends the match time from Ember Mesa. Eli books and supplies a separate small Alder listening supper at a side table. The distant radio table stays in Ember Mesa. Mina checks the local headcount before writing anything.",
    "emit": [
      "small_potluck"
    ],
    "kind": "access",
    "narration": {
      "personal": "Rosa sends the match time from Ember Mesa. Eli books and supplies a separate small Alder listening supper at a side table. The distant radio table stays in Ember Mesa. Mina checks the local headcount before writing anything.",
      "public": "Rosa sends the match time from Ember Mesa. Eli books and supplies a separate small Alder listening supper at a side table. The distant radio table stays in Ember Mesa. Mina checks the local headcount before writing anything.",
      "npc": "Rosa sends the match time from Ember Mesa. Eli books and supplies a separate small Alder listening supper at a side table. The distant radio table stays in Ember Mesa. Mina checks the local headcount before writing anything."
    },
    "npcLabel": null,
    "time": 1,
    "response": {
      "speakerId": "mina",
      "speech": "The song is not a guest list.",
      "activity": "Keeps the lyric side of the page facing down.",
      "emotion": "warm",
      "gesture": "point"
    },
    "cost": 60,
    "correspondence": true
  },
  {
    "id": "radio_far",
    "signals": [
      "table_released"
    ],
    "to": "closing_hours",
    "label": "Arrange a brief call before Farah’s own drama group",
    "outcome": "Rosa in Ember Mesa and Farah in Saffron agree a short call before Farah’s local drama group. Farah can compare opinions and still arrive as a guest. The rooms, radios and spare keys remain separate.",
    "emit": [
      "listening_guest"
    ],
    "kind": "access",
    "narration": {
      "personal": "Rosa in Ember Mesa and Farah in Saffron agree a short call before Farah’s local drama group. Farah can compare opinions and still arrive as a guest. The rooms, radios and spare keys remain separate.",
      "public": "Rosa in Ember Mesa and Farah in Saffron agree a short call before Farah’s local drama group. Farah can compare opinions and still arrive as a guest. The rooms, radios and spare keys remain separate.",
      "npc": "Rosa in Ember Mesa and Farah in Saffron agree a short call before Farah’s local drama group. Farah can compare opinions and still arrive as a guest. The rooms, radios and spare keys remain separate."
    },
    "npcLabel": null,
    "time": 1,
    "response": {
      "speakerId": "farah_hussain",
      "speech": "The hours are on the first line now.",
      "activity": "Moves the collection time above the spoiler.",
      "emotion": "warm",
      "gesture": "point"
    },
    "correspondence": true
  },
  {
    "id": "room_bread",
    "signals": [
      "room_clear",
      "quiet_room"
    ],
    "to": "late_loaf",
    "label": "Keep Jonah’s own paid loaf for after some sleep",
    "outcome": "Hugo writes Jonah’s collection time on the separate parcel. None of this bread belongs to the café.",
    "emit": [
      "jonah_pickup"
    ],
    "kind": "resource",
    "narration": {
      "personal": "Hugo writes Jonah’s collection time on the separate parcel. None of this bread belongs to the café.",
      "public": "Hugo writes Jonah’s collection time on the separate parcel. None of this bread belongs to the café.",
      "npc": "Hugo writes Jonah’s collection time on the separate parcel. None of this bread belongs to the café."
    },
    "npcLabel": null,
    "time": 1,
    "response": {
      "speakerId": "hugo",
      "speech": "The promised parcels stay on this side.",
      "activity": "Folds the paper around a waiting loaf.",
      "emotion": "warm",
      "gesture": "point"
    }
  },
  {
    "id": "gear_song",
    "signals": [
      "drum_rehearsal"
    ],
    "to": "pantry_song",
    "label": "Ask Mina about rehearsing with the stored drum",
    "outcome": "The Bracken is available. Mina asks Nell about the date rather than assuming the drummer arrived inside it.",
    "emit": [
      "private_rehearsal"
    ],
    "kind": "resource",
    "narration": {
      "personal": "The Bracken is available. Mina asks Nell about the date rather than assuming the drummer arrived inside it.",
      "public": "The Bracken is available. Mina asks Nell about the date rather than assuming the drummer arrived inside it.",
      "npc": "The Bracken is available. Mina asks Nell about the date rather than assuming the drummer arrived inside it."
    },
    "npcLabel": null,
    "time": 1,
    "response": {
      "speakerId": "mina",
      "speech": "The song is not a guest list.",
      "activity": "Keeps the lyric side of the page facing down.",
      "emotion": "warm",
      "gesture": "point"
    }
  },
  {
    "id": "gear_departure",
    "signals": [
      "drum_travel",
      "duvet_reveal"
    ],
    "to": "last_crossing",
    "label": "Check the drum’s ferry and luggage time",
    "outcome": "Tess gives Nell the real departure. A goodbye cannot carry the drum unless somebody has booked the luggage.",
    "emit": [
      "connection_clear"
    ],
    "kind": "access",
    "narration": {
      "personal": "Tess gives Nell the real departure. A goodbye cannot carry the drum unless somebody has booked the luggage.",
      "public": "Tess gives Nell the real departure. A goodbye cannot carry the drum unless somebody has booked the luggage.",
      "npc": "Tess gives Nell the real departure. A goodbye cannot carry the drum unless somebody has booked the luggage."
    },
    "npcLabel": null,
    "time": 1,
    "response": {
      "speakerId": "alder_tess",
      "speech": "The café time is this one. The ferry time is that one.",
      "activity": "Points to the two times on the board.",
      "emotion": "warm",
      "gesture": "point"
    }
  },
  {
    "id": "film_goodbye",
    "signals": [
      "honest_departure"
    ],
    "to": "missing_shot",
    "label": "Ask Nila whether Ruth may send her a permitted goodbye clip",
    "outcome": "Ruth asks the filmed adults, then sends their permitted Alder goodbye clip to Nila in Pelagia. Nila considers it for a separate edit. Ruth wants to know whether this version also contains the joke.",
    "emit": [
      "film_offer"
    ],
    "kind": "option",
    "narration": {
      "personal": "Ruth asks the filmed adults, then sends their permitted Alder goodbye clip to Nila in Pelagia. Nila considers it for a separate edit. Ruth wants to know whether this version also contains the joke.",
      "public": "Ruth asks the filmed adults, then sends their permitted Alder goodbye clip to Nila in Pelagia. Nila considers it for a separate edit. Ruth wants to know whether this version also contains the joke.",
      "npc": "Ruth asks the filmed adults, then sends their permitted Alder goodbye clip to Nila in Pelagia. Nila considers it for a separate edit. Ruth wants to know whether this version also contains the joke."
    },
    "npcLabel": null,
    "time": 1,
    "response": {
      "speakerId": "nila_desai",
      "speech": "The film and the dispatch book answer different questions.",
      "activity": "Keeps one hand beside the edit controls.",
      "emotion": "warm",
      "gesture": "point"
    },
    "correspondence": true
  },
  {
    "id": "comedy_room",
    "signals": [
      "comedy_opening"
    ],
    "to": "portrait",
    "label": "Ask about a remote comedy clip after Liang’s sitting",
    "outcome": "The Glasssteppe host offers a later remote-comedy slot and sends the details to Jonah in Alder. Jonah can accept or decline a separately discussed recording; no trip, job or performance is booked for them.",
    "emit": [
      "comedy_invitation"
    ],
    "kind": "access",
    "narration": {
      "personal": "The Glasssteppe host offers a later remote-comedy slot and sends the details to Jonah in Alder. Jonah can accept or decline a separately discussed recording; no trip, job or performance is booked for them.",
      "public": "The Glasssteppe host offers a later remote-comedy slot and sends the details to Jonah in Alder. Jonah can accept or decline a separately discussed recording; no trip, job or performance is booked for them.",
      "npc": "The Glasssteppe host offers a later remote-comedy slot and sends the details to Jonah in Alder. Jonah can accept or decline a separately discussed recording; no trip, job or performance is booked for them."
    },
    "npcLabel": null,
    "time": 1,
    "response": {
      "speakerId": "liang_chen",
      "speech": "I was hoping for something quite natural.",
      "activity": "Adjusts the good chair by a very small amount.",
      "emotion": "warm",
      "gesture": "point"
    },
    "correspondence": true
  },
  {
    "id": "bread_tea",
    "signals": [
      "cafe_bread_order"
    ],
    "to": "last_crossing",
    "label": "Arrange pickup of the café’s own paid bread order",
    "outcome": "Tess collects the café parcel. Jonah’s named loaf stays on Hugo’s separate shelf; tea does not change its owner.",
    "emit": [
      "tea_extension"
    ],
    "kind": "resource",
    "narration": {
      "personal": "Tess collects the café parcel. Jonah’s named loaf stays on Hugo’s separate shelf; tea does not change its owner.",
      "public": "Tess collects the café parcel. Jonah’s named loaf stays on Hugo’s separate shelf; tea does not change its owner.",
      "npc": "Tess collects the café parcel. Jonah’s named loaf stays on Hugo’s separate shelf; tea does not change its owner."
    },
    "npcLabel": null,
    "time": 1,
    "response": {
      "speakerId": "alder_tess",
      "speech": "The café time is this one. The ferry time is that one.",
      "activity": "Points to the two times on the board.",
      "emotion": "warm",
      "gesture": "point"
    }
  },
  {
    "id": "baker_busy",
    "signals": [
      "loaf_extra",
      "baker_demo"
    ],
    "to": "pantry_song",
    "label": "Plan the potluck without Hugo’s demonstration",
    "outcome": "Hugo is baking the extra paid batch. Eli makes the meal smaller instead of adding a free performance to the order.",
    "emit": [
      "small_potluck"
    ],
    "kind": "access",
    "narration": {
      "personal": "Hugo is baking the extra paid batch. Eli makes the meal smaller instead of adding a free performance to the order.",
      "public": "Hugo is baking the extra paid batch. Eli makes the meal smaller instead of adding a free performance to the order.",
      "npc": "Hugo is baking the extra paid batch. Eli makes the meal smaller instead of adding a free performance to the order."
    },
    "npcLabel": null,
    "time": 1,
    "response": {
      "speakerId": "mina",
      "speech": "The song is not a guest list.",
      "activity": "Keeps the lyric side of the page facing down.",
      "emotion": "warm",
      "gesture": "point"
    }
  },
  {
    "id": "bread_menu",
    "signals": [
      "baker_free",
      "loaf_balanced"
    ],
    "to": "dalloway",
    "label": "Use Hugo’s written quote to choose a local simpler diner menu",
    "outcome": "June reads Hugo’s Alder bread quote in Ember Mesa, compares local supply and chooses a bread-first menu she can actually serve. The distant quote sends no bread and creates no delivery debt.",
    "emit": [
      "simple_menu"
    ],
    "kind": "resource",
    "narration": {
      "personal": "June reads Hugo’s Alder bread quote in Ember Mesa, compares local supply and chooses a bread-first menu she can actually serve. The distant quote sends no bread and creates no delivery debt.",
      "public": "June reads Hugo’s Alder bread quote in Ember Mesa, compares local supply and chooses a bread-first menu she can actually serve. The distant quote sends no bread and creates no delivery debt.",
      "npc": "June reads Hugo’s Alder bread quote in Ember Mesa, compares local supply and chooses a bread-first menu she can actually serve. The distant quote sends no bread and creates no delivery debt."
    },
    "npcLabel": null,
    "time": 1,
    "response": {
      "speakerId": "mesa_june",
      "speech": "Show me what is actually booked.",
      "activity": "Touches the Dalloway’s worn thumb paddle.",
      "emotion": "warm",
      "gesture": "point"
    },
    "correspondence": true
  },
  {
    "id": "route_screen",
    "signals": [
      "clear_timetable",
      "connection_clear",
      "later_route"
    ],
    "to": "six_chairs",
    "label": "Ask Ada to post her cinema’s own verified local connection",
    "outcome": "Tess sends the Alder café’s two-line board as an example. Ada checks and posts the Saffron cinema’s own connection and its actual wait. Inés reads the departure time and becomes unexpectedly concise.",
    "emit": [
      "film_tea"
    ],
    "kind": "evidence",
    "narration": {
      "personal": "Tess sends the Alder café’s two-line board as an example. Ada checks and posts the Saffron cinema’s own connection and its actual wait. Inés reads the departure time and becomes unexpectedly concise.",
      "public": "Tess sends the Alder café’s two-line board as an example. Ada checks and posts the Saffron cinema’s own connection and its actual wait. Inés reads the departure time and becomes unexpectedly concise.",
      "npc": "Tess sends the Alder café’s two-line board as an example. Ada checks and posts the Saffron cinema’s own connection and its actual wait. Inés reads the departure time and becomes unexpectedly concise."
    },
    "npcLabel": null,
    "time": 1,
    "response": {
      "speakerId": "ines_valdes",
      "speech": "Let me check Ada’s time before I begin.",
      "activity": "Pauses beside the row of cinema seats.",
      "emotion": "warm",
      "gesture": "point"
    },
    "correspondence": true
  },
  {
    "id": "cafe_full",
    "signals": [
      "cafe_slot",
      "tea_extension"
    ],
    "to": "pantry_song",
    "label": "Keep Mina’s listening rehearsal at the hall",
    "outcome": "The café table is already booked. At the hall, Mina can hear the last line without the hiss of another pot.",
    "emit": [
      "private_rehearsal"
    ],
    "kind": "access",
    "narration": {
      "personal": "The café table is already booked. At the hall, Mina can hear the last line without the hiss of another pot.",
      "public": "The café table is already booked. At the hall, Mina can hear the last line without the hiss of another pot.",
      "npc": "The café table is already booked. At the hall, Mina can hear the last line without the hiss of another pot."
    },
    "npcLabel": null,
    "time": 1,
    "response": {
      "speakerId": "mina",
      "speech": "The song is not a guest list.",
      "activity": "Keeps the lyric side of the page facing down.",
      "emotion": "warm",
      "gesture": "point"
    }
  },
  {
    "id": "route_trip",
    "signals": [
      "connection_clear"
    ],
    "to": "bracken",
    "label": "Use the ferry times to settle Nell’s different plans",
    "outcome": "Nell names the journey and the bed separately. Ruth still gets a departure film, with less to discover on camera.",
    "emit": [
      "honest_departure"
    ],
    "kind": "evidence",
    "beforeBeat": 3,
    "setTarget": {
      "clarified": true
    },
    "narration": {
      "personal": "Nell names the journey and the bed separately. Ruth still gets a departure film, with less to discover on camera.",
      "public": "Nell names the journey and the bed separately. Ruth still gets a departure film, with less to discover on camera.",
      "npc": "Nell names the journey and the bed separately. Ruth still gets a departure film, with less to discover on camera."
    },
    "npcLabel": null,
    "time": 1,
    "response": {
      "speakerId": "nell_harper",
      "speech": "I can make one actual plan. Let me make it.",
      "activity": "Sets a hand on the transparent drumhead.",
      "emotion": "warm",
      "gesture": "point"
    }
  },
  {
    "id": "meal_work",
    "signals": [
      "potluck_booking",
      "potluck_count"
    ],
    "to": "late_loaf",
    "label": "Buy bread for the confirmed potluck guests",
    "outcome": "Hugo gets a paid small order. Eli brings the six-person count; Mina keeps the twelve-chair verse.",
    "emit": [
      "loaf_balanced"
    ],
    "kind": "resource",
    "cost": 48,
    "narration": {
      "personal": "Hugo gets a paid small order. Eli brings the six-person count; Mina keeps the twelve-chair verse.",
      "public": "Hugo gets a paid small order. Eli brings the six-person count; Mina keeps the twelve-chair verse.",
      "npc": "Hugo gets a paid small order. Eli brings the six-person count; Mina keeps the twelve-chair verse."
    },
    "npcLabel": null,
    "time": 1,
    "response": {
      "speakerId": "hugo",
      "speech": "The promised parcels stay on this side.",
      "activity": "Folds the paper around a waiting loaf.",
      "emotion": "warm",
      "gesture": "point"
    }
  },
  {
    "id": "song_slot",
    "signals": [
      "song_offer",
      "private_rehearsal"
    ],
    "to": "portrait",
    "label": "Commission a separate recorded song for the local sitting room",
    "outcome": "Mina agrees a separately paid short recording from Alder for the Glasssteppe host. The host reserves a later listening slot after Liang’s sitting; the current chair booking stays intact. The recording is one song, with permission for this showing.",
    "emit": [
      "recorded_song_slot"
    ],
    "kind": "access",
    "narration": {
      "personal": "Mina agrees a separately paid short recording from Alder for the Glasssteppe host. The host reserves a later listening slot after Liang’s sitting; the current chair booking stays intact. The recording is one song, with permission for this showing.",
      "public": "Mina agrees a separately paid short recording from Alder for the Glasssteppe host. The host reserves a later listening slot after Liang’s sitting; the current chair booking stays intact. The recording is one song, with permission for this showing.",
      "npc": "Mina agrees a separately paid short recording from Alder for the Glasssteppe host. The host reserves a later listening slot after Liang’s sitting; the current chair booking stays intact. The recording is one song, with permission for this showing."
    },
    "npcLabel": null,
    "time": 1,
    "response": {
      "speakerId": "liang_chen",
      "speech": "I was hoping for something quite natural.",
      "activity": "Adjusts the good chair by a very small amount.",
      "emotion": "warm",
      "gesture": "point"
    },
    "cost": 100,
    "correspondence": true
  },
  {
    "id": "song_drum",
    "signals": [
      "rehearsal_later",
      "private_rehearsal"
    ],
    "to": "bracken",
    "label": "Ask Nell about the new rehearsal date",
    "outcome": "Nell answers the rehearsal question separately from the bed question. Mina is pleased to receive an answer in the same units as the question.",
    "emit": [
      "drum_rehearsal"
    ],
    "kind": "access",
    "beforeBeat": 3,
    "narration": {
      "personal": "Nell answers the rehearsal question separately from the bed question. Mina is pleased to receive an answer in the same units as the question.",
      "public": "Nell answers the rehearsal question separately from the bed question. Mina is pleased to receive an answer in the same units as the question.",
      "npc": "Nell answers the rehearsal question separately from the bed question. Mina is pleased to receive an answer in the same units as the question."
    },
    "npcLabel": null,
    "time": 1,
    "response": {
      "speakerId": "nell_harper",
      "speech": "I can make one actual plan. Let me make it.",
      "activity": "Sets a hand on the transparent drumhead.",
      "emotion": "warm",
      "gesture": "point"
    }
  },
  {
    "id": "laundry_canteen",
    "signals": [
      "laundry_early",
      "laundry_rush"
    ],
    "to": "small_pause",
    "label": "Put the real laundry pickup into Akira’s handover",
    "outcome": "The colleague can find a quantity and a time. Akira adds the supplier’s holiday destination in the margin, where it can do less harm.",
    "emit": [
      "handover_clear"
    ],
    "kind": "evidence",
    "narration": {
      "personal": "The colleague can find a quantity and a time. Akira adds the supplier’s holiday destination in the margin, where it can do less harm.",
      "public": "The colleague can find a quantity and a time. Akira adds the supplier’s holiday destination in the margin, where it can do less harm.",
      "npc": "The colleague can find a quantity and a time. Akira adds the supplier’s holiday destination in the margin, where it can do less harm."
    },
    "npcLabel": null,
    "time": 1,
    "response": {
      "speakerId": "akira_mori",
      "speech": "I can start with the useful part this time.",
      "activity": "Folds the handover down to one useful page.",
      "emotion": "warm",
      "gesture": "point"
    }
  },
  {
    "id": "rush_train",
    "signals": [
      "laundry_rush",
      "qiao_later"
    ],
    "to": "timetable",
    "label": "Use Qiao’s chosen later train",
    "outcome": "The group takes the early train without her. Qiao takes the rush money and the later departure she chose.",
    "emit": [
      "later_connection"
    ],
    "kind": "access",
    "narration": {
      "personal": "The group takes the early train without her. Qiao takes the rush money and the later departure she chose.",
      "public": "The group takes the early train without her. Qiao takes the rush money and the later departure she chose.",
      "npc": "The group takes the early train without her. Qiao takes the rush money and the later departure she chose."
    },
    "npcLabel": null,
    "time": 1,
    "response": {
      "speakerId": "glass_ren",
      "speech": "Use the departure on the sign.",
      "activity": "Traces the departure line with a finger.",
      "emotion": "warm",
      "gesture": "point"
    }
  },
  {
    "id": "choir_chair",
    "signals": [
      "choir_finite",
      "qiao_free"
    ],
    "to": "portrait",
    "label": "Keep the short choir slot clear of Liang’s chair",
    "outcome": "Liang shifts to the side. He asks whether singing will make the expression in the portrait look more relaxed.",
    "emit": [
      "stage_free"
    ],
    "kind": "access",
    "narration": {
      "personal": "Liang shifts to the side. He asks whether singing will make the expression in the portrait look more relaxed.",
      "public": "Liang shifts to the side. He asks whether singing will make the expression in the portrait look more relaxed.",
      "npc": "Liang shifts to the side. He asks whether singing will make the expression in the portrait look more relaxed."
    },
    "npcLabel": null,
    "time": 1,
    "response": {
      "speakerId": "liang_chen",
      "speech": "I was hoping for something quite natural.",
      "activity": "Adjusts the good chair by a very small amount.",
      "emotion": "warm",
      "gesture": "point"
    }
  },
  {
    "id": "canteen_laundry",
    "signals": [
      "canteen_cover",
      "handover_clear"
    ],
    "to": "laundry",
    "label": "Give Qiao the colleague who can now handle collection",
    "outcome": "Qiao reaches an adult who knows the quantity. Akira finds this excellent and briefly unsettling.",
    "emit": [
      "laundry_early"
    ],
    "kind": "work",
    "narration": {
      "personal": "Qiao reaches an adult who knows the quantity. Akira finds this excellent and briefly unsettling.",
      "public": "Qiao reaches an adult who knows the quantity. Akira finds this excellent and briefly unsettling.",
      "npc": "Qiao reaches an adult who knows the quantity. Akira finds this excellent and briefly unsettling."
    },
    "npcLabel": null,
    "time": 1,
    "response": {
      "speakerId": "qiao_chen",
      "speech": "Which collection? It changes the price.",
      "activity": "Taps the ordinary-price column.",
      "emotion": "warm",
      "gesture": "point"
    }
  },
  {
    "id": "actor_train",
    "signals": [
      "short_rehearsal",
      "rota_later"
    ],
    "to": "timetable",
    "label": "Find the train that fits Akira’s small scene",
    "outcome": "Ren points to a departure that actually works. Akira starts explaining the pause; they point again.",
    "emit": [
      "plain_connection"
    ],
    "kind": "access",
    "narration": {
      "personal": "Ren points to a departure that actually works. Akira starts explaining the pause; they point again.",
      "public": "Ren points to a departure that actually works. Akira starts explaining the pause; they point again.",
      "npc": "Ren points to a departure that actually works. Akira starts explaining the pause; they point again."
    },
    "npcLabel": null,
    "time": 1,
    "response": {
      "speakerId": "glass_ren",
      "speech": "Use the departure on the sign.",
      "activity": "Traces the departure line with a finger.",
      "emotion": "warm",
      "gesture": "point"
    }
  },
  {
    "id": "actor_stage",
    "signals": [
      "full_rehearsal"
    ],
    "to": "portrait",
    "label": "Move the portrait off the booked rehearsal stage",
    "outcome": "The stage stays with the play. Liang gets a bright corner and asks Jian to make it look like his first choice.",
    "emit": [
      "stage_free"
    ],
    "kind": "access",
    "narration": {
      "personal": "The stage stays with the play. Liang gets a bright corner and asks Jian to make it look like his first choice.",
      "public": "The stage stays with the play. Liang gets a bright corner and asks Jian to make it look like his first choice.",
      "npc": "The stage stays with the play. Liang gets a bright corner and asks Jian to make it look like his first choice."
    },
    "npcLabel": null,
    "time": 1,
    "response": {
      "speakerId": "liang_chen",
      "speech": "I was hoping for something quite natural.",
      "activity": "Adjusts the good chair by a very small amount.",
      "emotion": "warm",
      "gesture": "point"
    }
  },
  {
    "id": "train_laundry",
    "signals": [
      "later_connection",
      "plain_connection"
    ],
    "to": "laundry",
    "label": "Show Qiao the later train before she accepts more work",
    "outcome": "Qiao can price the real inconvenience. A later weekend begins to look surprisingly attractive beside the rush rate.",
    "emit": [
      "qiao_later"
    ],
    "kind": "access",
    "narration": {
      "personal": "Qiao can price the real inconvenience. A later weekend begins to look surprisingly attractive beside the rush rate.",
      "public": "Qiao can price the real inconvenience. A later weekend begins to look surprisingly attractive beside the rush rate.",
      "npc": "Qiao can price the real inconvenience. A later weekend begins to look surprisingly attractive beside the rush rate."
    },
    "npcLabel": null,
    "time": 1,
    "response": {
      "speakerId": "qiao_chen",
      "speech": "Which collection? It changes the price.",
      "activity": "Taps the ordinary-price column.",
      "emotion": "warm",
      "gesture": "point"
    }
  },
  {
    "id": "early_actor",
    "signals": [
      "early_departure"
    ],
    "to": "small_pause",
    "label": "Ask the director to rehearse Akira’s entrance first",
    "outcome": "Akira gets the early scene and can catch the train. Admitting how little time he needed took most of the conversation.",
    "emit": [
      "short_rehearsal"
    ],
    "kind": "access",
    "narration": {
      "personal": "Akira gets the early scene and can catch the train. Admitting how little time he needed took most of the conversation.",
      "public": "Akira gets the early scene and can catch the train. Admitting how little time he needed took most of the conversation.",
      "npc": "Akira gets the early scene and can catch the train. Admitting how little time he needed took most of the conversation."
    },
    "npcLabel": null,
    "time": 1,
    "response": {
      "speakerId": "akira_mori",
      "speech": "I can start with the useful part this time.",
      "activity": "Folds the handover down to one useful page.",
      "emotion": "warm",
      "gesture": "point"
    }
  },
  {
    "id": "platform_show",
    "signals": [
      "platform_group"
    ],
    "to": "portrait",
    "label": "Offer the portrait viewing after the group returns",
    "outcome": "Liang chooses a time when the audience will be there. He begins rehearsing his lack of expectation.",
    "emit": [
      "portrait_finished"
    ],
    "kind": "access",
    "narration": {
      "personal": "Liang chooses a time when the audience will be there. He begins rehearsing his lack of expectation.",
      "public": "Liang chooses a time when the audience will be there. He begins rehearsing his lack of expectation.",
      "npc": "Liang chooses a time when the audience will be there. He begins rehearsing his lack of expectation."
    },
    "npcLabel": null,
    "time": 1,
    "response": {
      "speakerId": "liang_chen",
      "speech": "I was hoping for something quite natural.",
      "activity": "Adjusts the good chair by a very small amount.",
      "emotion": "warm",
      "gesture": "point"
    }
  },
  {
    "id": "chair_actor",
    "signals": [
      "stage_free"
    ],
    "to": "small_pause",
    "label": "Use the short stage interval Liang left open",
    "outcome": "Akira rehearses his entrance without acquiring the whole hall. Two seconds receive a remarkable amount of attention.",
    "emit": [
      "short_rehearsal"
    ],
    "kind": "access",
    "narration": {
      "personal": "Akira rehearses his entrance without acquiring the whole hall. Two seconds receive a remarkable amount of attention.",
      "public": "Akira rehearses his entrance without acquiring the whole hall. Two seconds receive a remarkable amount of attention.",
      "npc": "Akira rehearses his entrance without acquiring the whole hall. Two seconds receive a remarkable amount of attention."
    },
    "npcLabel": null,
    "time": 1,
    "response": {
      "speakerId": "akira_mori",
      "speech": "I can start with the useful part this time.",
      "activity": "Folds the handover down to one useful page.",
      "emotion": "warm",
      "gesture": "point"
    }
  },
  {
    "id": "chair_rules",
    "signals": [
      "portrait_slot",
      "portrait_display"
    ],
    "to": "nine_locks",
    "label": "Book a separate Saffron rules-display slot after the portrait example",
    "outcome": "Liang sends the Glasssteppe sitting timetable. Sami uses it to book a later slot in Saffron’s own public schedule. The towns do not share a hall. Vera decides for herself whether to play again.",
    "emit": [
      "rules_display"
    ],
    "kind": "access",
    "narration": {
      "personal": "Liang sends the Glasssteppe sitting timetable. Sami uses it to book a later slot in Saffron’s own public schedule. The towns do not share a hall. Vera decides for herself whether to play again.",
      "public": "Liang sends the Glasssteppe sitting timetable. Sami uses it to book a later slot in Saffron’s own public schedule. The towns do not share a hall. Vera decides for herself whether to play again.",
      "npc": "Liang sends the Glasssteppe sitting timetable. Sami uses it to book a later slot in Saffron’s own public schedule. The towns do not share a hall. Vera decides for herself whether to play again."
    },
    "npcLabel": null,
    "time": 1,
    "response": {
      "speakerId": "sami",
      "speech": "The next group still gets its table.",
      "activity": "Sets the rule sheet beside the board.",
      "emotion": "warm",
      "gesture": "point"
    },
    "cost": 20,
    "correspondence": true
  },
  {
    "id": "portrait_art",
    "signals": [
      "portrait_finished"
    ],
    "to": "empty_counter",
    "label": "Pay for a permitted-copy display beside Kit’s work",
    "outcome": "The Ember Mesa host books a local display board. With the makers’ permission, a copy of the Glasssteppe portrait joins Kit’s ordinary-life page. Jian is offered no job or appearance obligation. Liang sends a question about whether the cup looks more relaxed than he does.",
    "emit": [
      "ordinary_art"
    ],
    "kind": "option",
    "narration": {
      "personal": "The Ember Mesa host books a local display board. With the makers’ permission, a copy of the Glasssteppe portrait joins Kit’s ordinary-life page. Jian is offered no job or appearance obligation. Liang sends a question about whether the cup looks more relaxed than he does.",
      "public": "The Ember Mesa host books a local display board. With the makers’ permission, a copy of the Glasssteppe portrait joins Kit’s ordinary-life page. Jian is offered no job or appearance obligation. Liang sends a question about whether the cup looks more relaxed than he does.",
      "npc": "The Ember Mesa host books a local display board. With the makers’ permission, a copy of the Glasssteppe portrait joins Kit’s ordinary-life page. Jian is offered no job or appearance obligation. Liang sends a question about whether the cup looks more relaxed than he does."
    },
    "npcLabel": null,
    "time": 1,
    "response": {
      "speakerId": "kit",
      "speech": "I can draw an ordinary day. It is allowed to be ordinary.",
      "activity": "Turns the order-slip drawing toward you.",
      "emotion": "warm",
      "gesture": "point"
    },
    "cost": 40,
    "correspondence": true
  },
  {
    "id": "film_food",
    "signals": [
      "screening_on_time",
      "long_intro"
    ],
    "to": "first_shift",
    "label": "Buy the cinema’s Dock Folds batch",
    "outcome": "Leila takes the paid cinema order and writes the pickup time. Ada now has food to offer before Inés begins.",
    "emit": [
      "folds_cinema"
    ],
    "kind": "work",
    "cost": 72,
    "narration": {
      "personal": "Leila takes the paid cinema order and writes the pickup time. Ada now has food to offer before Inés begins.",
      "public": "Leila takes the paid cinema order and writes the pickup time. Ada now has food to offer before Inés begins.",
      "npc": "Leila takes the paid cinema order and writes the pickup time. Ada now has food to offer before Inés begins."
    },
    "npcLabel": null,
    "time": 1,
    "response": {
      "speakerId": "saffron_leila",
      "speech": "Put the right name on the batch.",
      "activity": "Lifts the griddle spatula clear of the next batch.",
      "emotion": "warm",
      "gesture": "point"
    }
  },
  {
    "id": "film_shop",
    "signals": [
      "film_tea",
      "screening_open"
    ],
    "to": "closing_hours",
    "label": "Arrange Farah’s snack collection before the discussion",
    "outcome": "Farah can make the sale and still get to her own drama. She has a great deal to say about the difference.",
    "emit": [
      "shop_early"
    ],
    "kind": "access",
    "narration": {
      "personal": "Farah can make the sale and still get to her own drama. She has a great deal to say about the difference.",
      "public": "Farah can make the sale and still get to her own drama. She has a great deal to say about the difference.",
      "npc": "Farah can make the sale and still get to her own drama. She has a great deal to say about the difference."
    },
    "npcLabel": null,
    "time": 1,
    "response": {
      "speakerId": "farah_hussain",
      "speech": "The hours are on the first line now.",
      "activity": "Moves the collection time above the spoiler.",
      "emotion": "warm",
      "gesture": "point"
    }
  },
  {
    "id": "film_game",
    "signals": [
      "cinema_free"
    ],
    "to": "nine_locks",
    "label": "Ask Sami to display the game in the free public slot",
    "outcome": "Sami can show the rules after the screening. Vera’s previous win remains sufficient for her purposes.",
    "emit": [
      "rules_display"
    ],
    "kind": "access",
    "narration": {
      "personal": "Sami can show the rules after the screening. Vera’s previous win remains sufficient for her purposes.",
      "public": "Sami can show the rules after the screening. Vera’s previous win remains sufficient for her purposes.",
      "npc": "Sami can show the rules after the screening. Vera’s previous win remains sufficient for her purposes."
    },
    "npcLabel": null,
    "time": 1,
    "response": {
      "speakerId": "sami",
      "speech": "The next group still gets its table.",
      "activity": "Sets the rule sheet beside the board.",
      "emotion": "warm",
      "gesture": "point"
    }
  },
  {
    "id": "shop_food",
    "signals": [
      "shop_early",
      "listening_snacks"
    ],
    "to": "first_shift",
    "label": "Buy the listening group’s separate snack batch",
    "outcome": "Leila labels the new batch for the listening group. None of it becomes cinema stock because the two events have biscuits in common.",
    "emit": [
      "folds_listening"
    ],
    "kind": "work",
    "cost": 72,
    "narration": {
      "personal": "Leila labels the new batch for the listening group. None of it becomes cinema stock because the two events have biscuits in common.",
      "public": "Leila labels the new batch for the listening group. None of it becomes cinema stock because the two events have biscuits in common.",
      "npc": "Leila labels the new batch for the listening group. None of it becomes cinema stock because the two events have biscuits in common."
    },
    "npcLabel": null,
    "time": 1,
    "response": {
      "speakerId": "saffron_leila",
      "speech": "Put the right name on the batch.",
      "activity": "Lifts the griddle spatula clear of the next batch.",
      "emotion": "warm",
      "gesture": "point"
    }
  },
  {
    "id": "shop_screen",
    "signals": [
      "shop_late"
    ],
    "to": "six_chairs",
    "label": "Offer Farah the later short-film slot",
    "outcome": "Farah can attend later without holding the original audience. Inés discovers a fresh audience for a somewhat shortened introduction.",
    "emit": [
      "screening_open"
    ],
    "kind": "access",
    "narration": {
      "personal": "Farah can attend later without holding the original audience. Inés discovers a fresh audience for a somewhat shortened introduction.",
      "public": "Farah can attend later without holding the original audience. Inés discovers a fresh audience for a somewhat shortened introduction.",
      "npc": "Farah can attend later without holding the original audience. Inés discovers a fresh audience for a somewhat shortened introduction."
    },
    "npcLabel": null,
    "time": 1,
    "response": {
      "speakerId": "ines_valdes",
      "speech": "Let me check Ada’s time before I begin.",
      "activity": "Pauses beside the row of cinema seats.",
      "emotion": "warm",
      "gesture": "point"
    }
  },
  {
    "id": "guest_game",
    "signals": [
      "listening_guest"
    ],
    "to": "nine_locks",
    "label": "Finish the demo before the listening group arrives",
    "outcome": "Sami clears the table. Vera makes sure the incoming guests hear the score before they sit down.",
    "emit": [
      "demo_finished"
    ],
    "kind": "access",
    "narration": {
      "personal": "Sami clears the table. Vera makes sure the incoming guests hear the score before they sit down.",
      "public": "Sami clears the table. Vera makes sure the incoming guests hear the score before they sit down.",
      "npc": "Sami clears the table. Vera makes sure the incoming guests hear the score before they sit down."
    },
    "npcLabel": null,
    "time": 1,
    "response": {
      "speakerId": "sami",
      "speech": "The next group still gets its table.",
      "activity": "Sets the rule sheet beside the board.",
      "emotion": "warm",
      "gesture": "point"
    }
  },
  {
    "id": "game_film",
    "signals": [
      "game_table",
      "rules_display"
    ],
    "to": "six_chairs",
    "label": "Use the cinema’s small tea corner",
    "outcome": "The demonstration keeps its booked table. Ada fits the discussion into the tea corner, where a shorter introduction would also have fitted.",
    "emit": [
      "film_tea"
    ],
    "kind": "access",
    "narration": {
      "personal": "The demonstration keeps its booked table. Ada fits the discussion into the tea corner, where a shorter introduction would also have fitted.",
      "public": "The demonstration keeps its booked table. Ada fits the discussion into the tea corner, where a shorter introduction would also have fitted.",
      "npc": "The demonstration keeps its booked table. Ada fits the discussion into the tea corner, where a shorter introduction would also have fitted."
    },
    "npcLabel": null,
    "time": 1,
    "response": {
      "speakerId": "ines_valdes",
      "speech": "Let me check Ada’s time before I begin.",
      "activity": "Pauses beside the row of cinema seats.",
      "emotion": "warm",
      "gesture": "point"
    }
  },
  {
    "id": "game_food",
    "signals": [
      "demo_clear",
      "demo_finished",
      "game_done"
    ],
    "to": "first_shift",
    "label": "Use the table once the game finishes",
    "outcome": "The cleared table gives Leila somewhere to hand over the food. Vera carries away the win rather than another obligation.",
    "emit": [
      "collection_staffed"
    ],
    "kind": "access",
    "narration": {
      "personal": "The cleared table gives Leila somewhere to hand over the food. Vera carries away the win rather than another obligation.",
      "public": "The cleared table gives Leila somewhere to hand over the food. Vera carries away the win rather than another obligation.",
      "npc": "The cleared table gives Leila somewhere to hand over the food. Vera carries away the win rather than another obligation."
    },
    "npcLabel": null,
    "time": 1,
    "response": {
      "speakerId": "saffron_leila",
      "speech": "Put the right name on the batch.",
      "activity": "Lifts the griddle spatula clear of the next batch.",
      "emotion": "warm",
      "gesture": "point"
    }
  },
  {
    "id": "folds_film",
    "signals": [
      "folds_cinema"
    ],
    "to": "six_chairs",
    "label": "Serve the cinema’s purchased Dock Folds before the speech",
    "outcome": "Ada puts out the batch marked for the cinema. Inés notices the audience chewing and briefly loses the floor.",
    "emit": [
      "screening_on_time"
    ],
    "kind": "resource",
    "narration": {
      "personal": "Ada puts out the batch marked for the cinema. Inés notices the audience chewing and briefly loses the floor.",
      "public": "Ada puts out the batch marked for the cinema. Inés notices the audience chewing and briefly loses the floor.",
      "npc": "Ada puts out the batch marked for the cinema. Inés notices the audience chewing and briefly loses the floor."
    },
    "npcLabel": null,
    "time": 1,
    "response": {
      "speakerId": "ines_valdes",
      "speech": "Let me check Ada’s time before I begin.",
      "activity": "Pauses beside the row of cinema seats.",
      "emotion": "warm",
      "gesture": "point"
    }
  },
  {
    "id": "crew_far",
    "signals": [
      "folds_crew",
      "repair_later"
    ],
    "to": "closing_hours",
    "label": "Keep Farah’s early collection while the crew eats",
    "outcome": "The crew keeps its lunch break. Farah need not leave the shop open until a repair decides to finish.",
    "emit": [
      "shop_early"
    ],
    "kind": "access",
    "narration": {
      "personal": "The crew keeps its lunch break. Farah need not leave the shop open until a repair decides to finish.",
      "public": "The crew keeps its lunch break. Farah need not leave the shop open until a repair decides to finish.",
      "npc": "The crew keeps its lunch break. Farah need not leave the shop open until a repair decides to finish."
    },
    "npcLabel": null,
    "time": 1,
    "response": {
      "speakerId": "farah_hussain",
      "speech": "The hours are on the first line now.",
      "activity": "Moves the collection time above the spoiler.",
      "emotion": "warm",
      "gesture": "point"
    }
  },
  {
    "id": "collection_game",
    "signals": [
      "collection_staffed"
    ],
    "to": "nine_locks",
    "label": "Start the demo after the food handover",
    "outcome": "The paid adult collection clears the table. Sami sets out Nine Locks; Vera examines the welcoming rule.",
    "emit": [
      "demo_clear"
    ],
    "kind": "access",
    "narration": {
      "personal": "The paid adult collection clears the table. Sami sets out Nine Locks; Vera examines the welcoming rule.",
      "public": "The paid adult collection clears the table. Sami sets out Nine Locks; Vera examines the welcoming rule.",
      "npc": "The paid adult collection clears the table. Sami sets out Nine Locks; Vera examines the welcoming rule."
    },
    "npcLabel": null,
    "time": 1,
    "response": {
      "speakerId": "sami",
      "speech": "The next group still gets its table.",
      "activity": "Sets the rule sheet beside the board.",
      "emotion": "warm",
      "gesture": "point"
    }
  }
];
export const ensembleContinuations: EnsembleRule[] = [
  {
    "id": "next_cafe_bread",
    "from": "late_loaf",
    "signals": [
      "bread_pickup",
      "baker_demo",
      "baker_free",
      "jonah_pickup"
    ],
    "to": "last_crossing",
    "label": "Order a new small café batch at Hugo’s pickup time",
    "outcome": "The new café batch is prepaid. Tess writes a new order; Jonah’s earlier parcel stays separate. “Tomorrow’s bread,” she says, “with tomorrow written on it.”",
    "cost": 48,
    "kind": "resource",
    "narration": {
      "personal": "The new café batch is prepaid. Tess writes a new order; Jonah’s earlier parcel stays separate. “Tomorrow’s bread,” she says, “with tomorrow written on it.”",
      "public": "{{actor}} pays for the new café batch. Tess writes the new order; Jonah’s earlier parcel stays separate. “Tomorrow’s bread,” she says, “with tomorrow written on it.”",
      "npc": "{{actor}} pays for the new café batch. Tess writes the new order; Jonah’s earlier parcel stays separate. “Tomorrow’s bread,” she says, “with tomorrow written on it.”"
    },
    "npcLabel": null,
    "time": 1,
    "response": {
      "speakerId": "alder_tess",
      "speech": "The café time is this one. The ferry time is that one.",
      "activity": "Points to the two times on the board.",
      "emotion": "warm",
      "gesture": "point"
    }
  },
  {
    "id": "next_broth_pickup",
    "from": "extra_run",
    "signals": [
      "freight_staffed",
      "freight_limited",
      "premium_freight"
    ],
    "to": "broth",
    "label": "Buy the next broth supplies at the small-load price",
    "outcome": "Lio places a fresh modest order under Ravi’s now-published terms. He opens one packet, not a case. Ravi still notices the spare space.",
    "cost": 36,
    "kind": "resource",
    "narration": {
      "personal": "Lio places a fresh modest order under Ravi’s now-published terms. He opens one packet, not a case. Ravi still notices the spare space.",
      "public": "Lio places a fresh modest order under Ravi’s now-published terms. He opens one packet, not a case. Ravi still notices the spare space.",
      "npc": "Lio places a fresh modest order under Ravi’s now-published terms. He opens one packet, not a case. Ravi still notices the spare space."
    },
    "npcLabel": null,
    "time": 1,
    "response": {
      "speakerId": "pelagia_lio",
      "speech": "Tell me the quantity before I open another packet.",
      "activity": "Rests the ladle beside the broth pot.",
      "emotion": "warm",
      "gesture": "point"
    }
  },
  {
    "id": "next_diner_collection",
    "from": "route_green",
    "signals": [
      "collection_window",
      "late_stop"
    ],
    "to": "dalloway",
    "label": "Book a new supper with Esperanza’s early collection",
    "outcome": "June books the new meal under the posted early-pickup terms. She rings the Dalloway once. Kit says the counter is merely being wiped.",
    "cost": 120,
    "kind": "access",
    "narration": {
      "personal": "June books the new meal under the posted early-pickup terms. She rings the Dalloway once. Kit says the counter is merely being wiped.",
      "public": "June books the new meal under the posted early-pickup terms. She rings the Dalloway once. Kit says the counter is merely being wiped.",
      "npc": "June books the new meal under the posted early-pickup terms. She rings the Dalloway once. Kit says the counter is merely being wiped."
    },
    "npcLabel": null,
    "time": 1,
    "response": {
      "speakerId": "mesa_june",
      "speech": "Show me what is actually booked.",
      "activity": "Touches the Dalloway’s worn thumb paddle.",
      "emotion": "warm",
      "gesture": "point"
    }
  },
  {
    "id": "next_laundry_train",
    "from": "timetable",
    "signals": [
      "plain_connection",
      "platform_group"
    ],
    "to": "laundry",
    "label": "Buy a new ordinary pickup before the train",
    "outcome": "Qiao accepts the new pickup inside the known train window. She points to the ordinary price, then to the much larger rush number.",
    "cost": 24,
    "kind": "access",
    "narration": {
      "personal": "Qiao accepts the new pickup inside the known train window. She points to the ordinary price, then to the much larger rush number.",
      "public": "Qiao accepts the new pickup inside the known train window. She points to the ordinary price, then to the much larger rush number.",
      "npc": "Qiao accepts the new pickup inside the known train window. She points to the ordinary price, then to the much larger rush number."
    },
    "npcLabel": null,
    "time": 1,
    "response": {
      "speakerId": "qiao_chen",
      "speech": "Which collection? It changes the price.",
      "activity": "Taps the ordinary-price column.",
      "emotion": "warm",
      "gesture": "point"
    }
  },
  {
    "id": "next_cinema_snacks",
    "from": "first_shift",
    "signals": [
      "repair_later",
      "collection_staffed"
    ],
    "to": "six_chairs",
    "label": "Buy fresh Dock Folds for the next screening",
    "outcome": "The fresh batch is prepaid at Leila’s stated pickup time. Ada writes it into the screening plan. Inés begins explaining why this introduction will be shorter.",
    "cost": 72,
    "kind": "resource",
    "narration": {
      "personal": "The fresh batch is prepaid at Leila’s stated pickup time. Ada writes it into the screening plan. Inés begins explaining why this introduction will be shorter.",
      "public": "{{actor}} pays for the fresh Dock Folds. Ada writes the pickup into the screening plan. Inés begins explaining why this introduction will be shorter.",
      "npc": "{{actor}} pays for the fresh Dock Folds. Ada writes the pickup into the screening plan. Inés begins explaining why this introduction will be shorter."
    },
    "npcLabel": null,
    "time": 1,
    "response": {
      "speakerId": "ines_valdes",
      "speech": "Let me check Ada’s time before I begin.",
      "activity": "Pauses beside the row of cinema seats.",
      "emotion": "warm",
      "gesture": "point"
    }
  }
];
export const ensembleById = Object.fromEntries(ensembleStories.map(story => [story.id, story]));
