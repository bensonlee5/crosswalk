/** Generated from the current Travel Guide. Edit the authoring JSON and run
 * node scripts/build-game-canon.mjs. Do not edit this adapter by hand. */
/** Static lore only. Story state must record each actual transfer separately. */
export type GuideItemFact={id:string;name:string;kind:string;regionIds:string[];venueIds:string[];people:{id:string;relationship:string}[];ownership:{ownerIds?:string[];ownerLabel?:string;keeperIds?:string[];borrowerIds?:string[];makerIds?:string[];makerLabel?:string;adultCareIds?:string[];currentCustody?:string;contentsOwnership?:string};storyStatus:string;gameStatus:string;brandId?:string;brandIds?:string[];brand?:string;image?:{src:string;alt:string;type:string}};
export const guideItemFactsById:Readonly<Record<string,GuideItemFact>>={
  "kestrel_breakfast_tea": {
    "id": "kestrel_breakfast_tea",
    "name": "Kestrel No. 2 Breakfast Tea",
    "kind": "Shared pantry staple",
    "regionIds": [
      "alder",
      "saffron",
      "glasssteppe"
    ],
    "venueIds": [
      "alder-corner-cafe",
      "saffron-cinema",
      "glasssteppe-corner-cafe"
    ],
    "people": [
      {
        "id": "alder_tess",
        "relationship": "Café stock keeper and regular brewer"
      },
      {
        "id": "saffron_ada",
        "relationship": "Buys tea for cinema discussions"
      },
      {
        "id": "oren",
        "relationship": "Household user who reuses an emptied Kestrel tin"
      },
      {
        "id": "miro",
        "relationship": "Household user; prefers his cup lighter"
      }
    ],
    "ownership": {
      "ownerLabel": "Purchased separately by households and venues; no single communal packet."
    },
    "storyStatus": "established_object",
    "gameStatus": "worldbuilding",
    "brandId": "kestrel",
    "brandIds": [
      "kestrel"
    ],
    "brand": "Kestrel"
  },
  "last_crossing_board": {
    "id": "last_crossing_board",
    "name": "The Last Crossing Board",
    "kind": "Café chalkboard",
    "regionIds": [
      "alder"
    ],
    "venueIds": [
      "alder-corner-cafe",
      "alder-transit"
    ],
    "people": [
      {
        "id": "alder_tess",
        "relationship": "Café owner and board keeper"
      },
      {
        "id": "nico",
        "relationship": "Young reader and maker of separate pretend tickets"
      }
    ],
    "ownership": {
      "ownerLabel": "Tess’s café",
      "keeperIds": [
        "alder_tess"
      ],
      "ownerIds": [
        "alder_tess"
      ]
    },
    "storyStatus": "established_object",
    "gameStatus": "worldbuilding",
    "brandId": "gullwing",
    "brandIds": [
      "gullwing"
    ],
    "brand": "Gullwing"
  },
  "two_load_basket": {
    "id": "two_load_basket",
    "name": "Rowan’s Two-Load Basket",
    "kind": "Bicycle basket",
    "regionIds": [
      "alder"
    ],
    "venueIds": [
      "alder-library",
      "alder-garden"
    ],
    "people": [
      {
        "id": "alder_rowan",
        "relationship": "Owner and everyday rider"
      }
    ],
    "ownership": {
      "ownerIds": [
        "alder_rowan"
      ]
    },
    "storyStatus": "established_object",
    "gameStatus": "worldbuilding",
    "brandId": "dalloway",
    "brandIds": [
      "dalloway"
    ],
    "brand": "Dalloway"
  },
  "after_hours_atlas": {
    "id": "after_hours_atlas",
    "name": "Bram’s After-Hours Atlas",
    "kind": "Working route notebook",
    "regionIds": [
      "alder"
    ],
    "venueIds": [
      "alder-transit",
      "alder-park"
    ],
    "people": [
      {
        "id": "bram",
        "relationship": "Mapmaker, owner and reviser"
      }
    ],
    "ownership": {
      "ownerIds": [
        "bram"
      ]
    },
    "storyStatus": "established_object",
    "gameStatus": "worldbuilding",
    "brandId": "rainline",
    "brandIds": [
      "rainline"
    ],
    "brand": "Rainline"
  },
  "kestrel_button_tin": {
    "id": "kestrel_button_tin",
    "name": "Oren’s Kestrel Tea Tin",
    "kind": "Button collection and keepsake",
    "regionIds": [
      "alder",
      "glasssteppe"
    ],
    "venueIds": [
      "alder-makerspace",
      "glasssteppe-makerspace"
    ],
    "people": [
      {
        "id": "oren",
        "relationship": "Current owner and mender"
      },
      {
        "id": "miro",
        "relationship": "Brother with the same family button-saving history"
      }
    ],
    "ownership": {
      "ownerIds": [
        "oren"
      ]
    },
    "storyStatus": "established_object",
    "gameStatus": "worldbuilding",
    "brandId": "kestrel",
    "brandIds": [
      "kestrel"
    ],
    "brand": "Kestrel",
    "image": {
      "src": "items/kestrel-tin.webp",
      "alt": "A chipped blue-and-cream Kestrel Tea tin holding mixed coat buttons.",
      "type": "object_portrait"
    }
  },
  "rainline_notebook": {
    "id": "rainline_notebook",
    "name": "Priya’s Rainline No. 3",
    "kind": "Weather notebook",
    "regionIds": [
      "alder",
      "pelagia"
    ],
    "venueIds": [
      "alder-park",
      "alder-transit"
    ],
    "people": [
      {
        "id": "priya",
        "relationship": "Owner and observer"
      }
    ],
    "ownership": {
      "ownerIds": [
        "priya"
      ]
    },
    "storyStatus": "established_object",
    "gameStatus": "worldbuilding",
    "brandId": "rainline",
    "brandIds": [
      "rainline",
      "whaleskin"
    ],
    "brand": "Rainline notebook; Whaleskin Clearfold sleeve"
  },
  "first_shift_griddle": {
    "id": "first_shift_griddle",
    "name": "Leila’s First Shift Griddle",
    "kind": "Portable cooking equipment",
    "regionIds": [
      "saffron"
    ],
    "venueIds": [
      "saffron-market",
      "saffron-transit"
    ],
    "people": [
      {
        "id": "saffron_leila",
        "relationship": "Owner and cook"
      },
      {
        "id": "saffron_tomas",
        "relationship": "Brother who knows the early-shift routine"
      }
    ],
    "ownership": {
      "ownerIds": [
        "saffron_leila"
      ]
    },
    "storyStatus": "established_object",
    "gameStatus": "worldbuilding",
    "brandId": "gullwing",
    "brandIds": [
      "gullwing"
    ],
    "brand": "Gullwing",
    "image": {
      "src": "items/first-shift-griddle.webp",
      "alt": "Leila’s compact black griddle with two short handles, a copper plaque and a folded food wrapper.",
      "type": "object_portrait"
    }
  },
  "six_chair_screen": {
    "id": "six_chair_screen",
    "name": "The Six-Chair Screen",
    "kind": "Borrowed cinema sheet",
    "regionIds": [
      "saffron"
    ],
    "venueIds": [
      "saffron-cinema",
      "saffron-community"
    ],
    "people": [
      {
        "id": "saffron_ada",
        "relationship": "Original borrower and screening organizer"
      },
      {
        "id": "saffron_leila",
        "relationship": "Cook who brought food to the first screening"
      },
      {
        "id": "ines_valdes",
        "relationship": "Present-day screening participant; not an original lender"
      }
    ],
    "ownership": {
      "ownerLabel": "Unnamed original lender",
      "borrowerIds": [
        "saffron_ada"
      ],
      "currentCustody": "Unspecified"
    },
    "storyStatus": "established_object",
    "gameStatus": "worldbuilding"
  },
  "nine_locks": {
    "id": "nine_locks",
    "name": "Nine Locks",
    "kind": "Handmade tabletop game",
    "regionIds": [
      "saffron"
    ],
    "venueIds": [
      "saffron-makerspace",
      "saffron-arcade",
      "saffron-community"
    ],
    "people": [
      {
        "id": "sami",
        "relationship": "Maker and owner of the demonstration set"
      },
      {
        "id": "vera_valdes",
        "relationship": "Interested player; any borrowing requires Sami’s agreement; owns a separate travel-game box"
      }
    ],
    "ownership": {
      "ownerIds": [
        "sami"
      ],
      "makerIds": [
        "sami"
      ]
    },
    "storyStatus": "established_object",
    "gameStatus": "worldbuilding",
    "image": {
      "src": "items/nine-locks.webp",
      "alt": "A handmade blue-and-cream tabletop board with rounded terracotta and teal counters and a folded rule card.",
      "type": "object_portrait"
    }
  },
  "gullwing_lunch_tin": {
    "id": "gullwing_lunch_tin",
    "name": "Tomas’s Gullwing Lunch Tin",
    "kind": "Everyday lunch container",
    "regionIds": [
      "saffron"
    ],
    "venueIds": [
      "saffron-work",
      "saffron-campus"
    ],
    "people": [
      {
        "id": "saffron_tomas",
        "relationship": "Owner and everyday user"
      },
      {
        "id": "saffron_leila",
        "relationship": "Sister who once packed his lunches; not an assumed giver"
      }
    ],
    "ownership": {
      "ownerIds": [
        "saffron_tomas"
      ]
    },
    "storyStatus": "established_object",
    "gameStatus": "worldbuilding",
    "brandId": "gullwing",
    "brandIds": [
      "gullwing"
    ],
    "brand": "Gullwing"
  },
  "first_ferry_broth_pot": {
    "id": "first_ferry_broth_pot",
    "name": "Lio’s First Ferry Pot",
    "kind": "Shared food and stockpot",
    "regionIds": [
      "pelagia"
    ],
    "venueIds": [
      "pelagia-market",
      "pelagia-corner-cafe",
      "pelagia-transit",
      "pelagia-garden"
    ],
    "people": [
      {
        "id": "pelagia_lio",
        "relationship": "Cook and keeper of the pot"
      },
      {
        "id": "pelagia_mara",
        "relationship": "Early-shift customer who reads the day’s ingredients"
      },
      {
        "id": "sefu",
        "relationship": "Customer fitting a bowl around tide-clock work"
      },
      {
        "id": "pelagia_tavi",
        "relationship": "Grower whose available produce can enter a batch by arrangement"
      }
    ],
    "ownership": {
      "ownerIds": [
        "pelagia_lio"
      ]
    },
    "storyStatus": "established_object",
    "gameStatus": "worldbuilding",
    "brandId": "gullwing",
    "brandIds": [
      "gullwing"
    ],
    "brand": "Gullwing"
  },
  "tide_mill_bridge_flour": {
    "id": "tide_mill_bridge_flour",
    "name": "Tide Mill Bridge Flour",
    "kind": "Baking staple",
    "regionIds": [
      "alder",
      "saffron"
    ],
    "venueIds": [
      "alder-market",
      "alder-corner-cafe",
      "saffron-market"
    ],
    "people": [
      {
        "id": "hugo",
        "relationship": "Baker and regular purchaser"
      },
      {
        "id": "saffron_leila",
        "relationship": "Cook using the flour for griddle breads"
      },
      {
        "id": "eli",
        "relationship": "Household user and occasional shared-supper baker"
      }
    ],
    "ownership": {
      "ownerLabel": "Bought in separate household and trade quantities."
    },
    "storyStatus": "established_object",
    "gameStatus": "worldbuilding",
    "brandId": "tide_mill",
    "brandIds": [
      "tide_mill"
    ],
    "brand": "Tide Mill"
  },
  "copperleaf_fox": {
    "id": "copperleaf_fox",
    "name": "Copperleaf the Fox",
    "kind": "Child’s hand puppet",
    "regionIds": [
      "glasssteppe"
    ],
    "venueIds": [
      "glasssteppe-community",
      "glasssteppe-park"
    ],
    "people": [
      {
        "id": "natsumi_mori",
        "relationship": "Owner, performer and chooser of the fox’s voice"
      },
      {
        "id": "glass_sora",
        "relationship": "Parent who handles safe repairs and tools"
      },
      {
        "id": "akira_mori",
        "relationship": "Grandad and occasional guest performer"
      },
      {
        "id": "hana_mori",
        "relationship": "Great-aunt and willing listener when available"
      }
    ],
    "ownership": {
      "ownerIds": [
        "natsumi_mori"
      ],
      "adultCareIds": [
        "glass_sora"
      ]
    },
    "storyStatus": "established_object",
    "gameStatus": "worldbuilding",
    "image": {
      "src": "items/copperleaf-fox.webp",
      "alt": "A soft russet fox hand puppet with a cream muzzle, floppy tail and visible red repair stitching.",
      "type": "object_portrait"
    }
  },
  "kestrel_ferry_mix": {
    "id": "kestrel_ferry_mix",
    "name": "Kestrel Ferry Mix",
    "kind": "Shared savory snack",
    "regionIds": [
      "saffron",
      "glasssteppe",
      "pelagia"
    ],
    "venueIds": [
      "saffron-cinema",
      "saffron-community",
      "glasssteppe-park",
      "pelagia-community"
    ],
    "people": [
      {
        "id": "farah_hussain",
        "relationship": "Buyer for her own listening evenings"
      },
      {
        "id": "ines_valdes",
        "relationship": "Cinema snack buyer who prefers the plain pieces"
      },
      {
        "id": "eun_park",
        "relationship": "Takes a small packet for a chosen terrace outing"
      },
      {
        "id": "yuna_park",
        "relationship": "Keeps a packet for an agreed listening gathering"
      }
    ],
    "ownership": {
      "ownerLabel": "Individual packets are bought separately; any sharing is by invitation."
    },
    "storyStatus": "established_object",
    "gameStatus": "worldbuilding",
    "brandId": "kestrel",
    "brandIds": [
      "kestrel"
    ],
    "brand": "Kestrel"
  },
  "hugos_late_shift_loaf": {
    "id": "hugos_late_shift_loaf",
    "name": "Hugo’s Late-Shift Loaf",
    "kind": "Locally made bread",
    "regionIds": [
      "alder"
    ],
    "venueIds": [
      "alder-market",
      "alder-corner-cafe",
      "alder-community"
    ],
    "people": [
      {
        "id": "hugo",
        "relationship": "Baker and maker"
      },
      {
        "id": "alder_tess",
        "relationship": "Café buyer and server"
      },
      {
        "id": "eli",
        "relationship": "Buyer and shared-supper contributor"
      },
      {
        "id": "mina",
        "relationship": "Customer who sometimes wants something simple after work"
      },
      {
        "id": "jonah_bell",
        "relationship": "Chosen brother and ordinary household eater; not an automatic performer"
      }
    ],
    "ownership": {
      "ownerLabel": "Hugo makes the bread; each purchaser owns the loaf they buy."
    },
    "storyStatus": "established_object",
    "gameStatus": "worldbuilding"
  },
  "landing_names_box": {
    "id": "landing_names_box",
    "name": "Esme’s Landing Names Box",
    "kind": "Archive collection",
    "regionIds": [
      "pelagia"
    ],
    "venueIds": [
      "pelagia-library",
      "pelagia-transit"
    ],
    "people": [
      {
        "id": "pelagia_esme",
        "relationship": "Archivist and collection steward"
      },
      {
        "id": "lata_rao",
        "relationship": "Daughter with separately chosen family letters; not automatic successor"
      }
    ],
    "ownership": {
      "ownerLabel": "Collection held by Esme under individual contribution terms",
      "keeperIds": [
        "pelagia_esme"
      ]
    },
    "storyStatus": "established_object",
    "gameStatus": "worldbuilding"
  },
  "tide_mill_harbor_rice": {
    "id": "tide_mill_harbor_rice",
    "name": "Tide Mill Harbor Rice",
    "kind": "Pantry grain",
    "regionIds": [
      "pelagia",
      "alder",
      "saffron"
    ],
    "venueIds": [
      "pelagia-market",
      "alder-market",
      "saffron-market",
      "pelagia-corner-cafe"
    ],
    "people": [
      {
        "id": "pelagia_lio",
        "relationship": "Stall cook and purchaser"
      },
      {
        "id": "priya",
        "relationship": "Household buyer with Pelagian food memories"
      },
      {
        "id": "saffron_leila",
        "relationship": "Cook using rice in selected portable fillings"
      },
      {
        "id": "pelagia_tavi",
        "relationship": "Grower interested in what a harvest will accompany"
      }
    ],
    "ownership": {
      "ownerLabel": "Separate household and business purchases."
    },
    "storyStatus": "established_object",
    "gameStatus": "worldbuilding",
    "brandId": "tide_mill",
    "brandIds": [
      "tide_mill"
    ],
    "brand": "Tide Mill"
  },
  "rainroom_keyboard": {
    "id": "rainroom_keyboard",
    "name": "The Rainroom 49",
    "kind": "Borrowed musical keyboard",
    "regionIds": [
      "pelagia"
    ],
    "venueIds": [
      "pelagia-community"
    ],
    "people": [
      {
        "id": "amir_odhiambo",
        "relationship": "Teenage borrower and music maker"
      },
      {
        "id": "sefu",
        "relationship": "Parent who supports age-appropriate practice arrangements"
      },
      {
        "id": "safia_odhiambo",
        "relationship": "Grandmother and invited listener, when Amir wants an audience"
      }
    ],
    "ownership": {
      "ownerLabel": "Unnamed lender",
      "borrowerIds": [
        "amir_odhiambo"
      ]
    },
    "storyStatus": "established_object",
    "gameStatus": "worldbuilding",
    "brandId": "bracken",
    "brandIds": [
      "bracken"
    ],
    "brand": "Bracken"
  },
  "kestrel_lemon_rounds": {
    "id": "kestrel_lemon_rounds",
    "name": "Kestrel Lemon Rounds",
    "kind": "Biscuits and reusable box",
    "regionIds": [
      "pelagia",
      "alder",
      "saffron"
    ],
    "venueIds": [
      "pelagia-community",
      "alder-corner-cafe",
      "saffron-cinema"
    ],
    "people": [
      {
        "id": "pelagia_mara",
        "relationship": "Household buyer and parent handling family snacks"
      },
      {
        "id": "lin",
        "relationship": "Young eater and maker who reuses an empty box"
      },
      {
        "id": "alder_tess",
        "relationship": "Café stock keeper"
      },
      {
        "id": "nico",
        "relationship": "Young café-family eater, with adult care"
      },
      {
        "id": "saffron_ada",
        "relationship": "Buys biscuits for a screening tea table"
      }
    ],
    "ownership": {
      "ownerLabel": "Purchased by individual adults or venues; Lin keeps the particular empty box used for their paper city."
    },
    "storyStatus": "established_object",
    "gameStatus": "worldbuilding",
    "brandId": "kestrel",
    "brandIds": [
      "kestrel"
    ],
    "brand": "Kestrel"
  },
  "six_panel_order_slips": {
    "id": "six_panel_order_slips",
    "name": "Kit’s Six-Panel Slips",
    "kind": "Working comic pages",
    "regionIds": [
      "embermesa",
      "alder"
    ],
    "venueIds": [
      "embermesa-corner-cafe",
      "embermesa-cinema"
    ],
    "people": [
      {
        "id": "kit",
        "relationship": "Artist and owner of the drawings"
      },
      {
        "id": "mesa_june",
        "relationship": "Diner colleague whose workplace supplies their everyday setting"
      },
      {
        "id": "jo",
        "relationship": "Parent in Alder; a family connection rather than co-author"
      }
    ],
    "ownership": {
      "ownerIds": [
        "kit"
      ],
      "makerIds": [
        "kit"
      ]
    },
    "storyStatus": "established_object",
    "gameStatus": "worldbuilding",
    "brandId": "rainline",
    "brandIds": [
      "rainline"
    ],
    "brand": "Rainline"
  },
  "three_hills_cups": {
    "id": "three_hills_cups",
    "name": "Bea’s Three Hills Cups",
    "kind": "Toddler stacking cups",
    "regionIds": [
      "embermesa",
      "alder"
    ],
    "venueIds": [
      "embermesa-community",
      "embermesa-corner-cafe"
    ],
    "people": [
      {
        "id": "bea",
        "relationship": "Young owner and player"
      },
      {
        "id": "kit",
        "relationship": "Parent responsible for care and supervision"
      },
      {
        "id": "jo",
        "relationship": "Grandparent in Alder; maker and giver are not specified"
      }
    ],
    "ownership": {
      "ownerIds": [
        "bea"
      ],
      "adultCareIds": [
        "kit"
      ]
    },
    "storyStatus": "established_object",
    "gameStatus": "worldbuilding",
    "image": {
      "src": "items/three-hills-cups.webp",
      "alt": "Three chunky wooden stacking cups with rounded rims and muted rust, ochre and sage bands.",
      "type": "object_portrait"
    }
  },
  "rosa_moreno_stall_sign": {
    "id": "rosa_moreno_stall_sign",
    "name": "Rosa Moreno’s Scratched Stall Sign",
    "kind": "Retired market sign",
    "regionIds": [
      "embermesa"
    ],
    "venueIds": [
      "embermesa-market"
    ],
    "people": [
      {
        "id": "rosa_moreno",
        "relationship": "Owner and former stallholder"
      },
      {
        "id": "mateo_moreno",
        "relationship": "Grandson who offered lettering repairs"
      },
      {
        "id": "mesa_june",
        "relationship": "Daughter with a separate life and work"
      }
    ],
    "ownership": {
      "ownerIds": [
        "rosa_moreno"
      ]
    },
    "storyStatus": "established_object",
    "gameStatus": "worldbuilding"
  },
  "touchline_radio": {
    "id": "touchline_radio",
    "name": "Rosa’s Touchline Radio",
    "kind": "Portable radio",
    "regionIds": [
      "embermesa"
    ],
    "venueIds": [
      "embermesa-community",
      "embermesa-transit"
    ],
    "people": [
      {
        "id": "rosa_moreno",
        "relationship": "Owner and sports listener"
      },
      {
        "id": "mesa_june",
        "relationship": "Daughter helping arrange a requested listening outing"
      },
      {
        "id": "mateo_moreno",
        "relationship": "Grandson and occasional fellow listener"
      }
    ],
    "ownership": {
      "ownerIds": [
        "rosa_moreno"
      ]
    },
    "storyStatus": "established_object",
    "gameStatus": "worldbuilding",
    "brandId": "bracken",
    "brandIds": [
      "bracken"
    ],
    "brand": "Bracken"
  },
  "fallen_sandwich_chart": {
    "id": "fallen_sandwich_chart",
    "name": "The Fallen Sandwich Chart",
    "kind": "Teenager’s sky sketch",
    "regionIds": [
      "embermesa"
    ],
    "venueIds": [
      "embermesa-library",
      "embermesa-park"
    ],
    "people": [
      {
        "id": "luz_vega",
        "relationship": "Young chart-maker and keeper"
      },
      {
        "id": "esperanza_vega",
        "relationship": "Parent responsible for practical arrangements"
      },
      {
        "id": "mesa_inez",
        "relationship": "Grandmother; neither owner nor assigned project manager"
      }
    ],
    "ownership": {
      "ownerIds": [
        "luz_vega"
      ],
      "makerLabel": "Luz, with an unnamed school friend contributing ideas",
      "adultCareIds": [
        "esperanza_vega"
      ]
    },
    "storyStatus": "established_object",
    "gameStatus": "worldbuilding",
    "brandId": "rainline",
    "brandIds": [
      "rainline"
    ],
    "brand": "Rainline"
  },
  "route_green_grocery_van": {
    "id": "route_green_grocery_van",
    "name": "Esperanza’s Route-Green Van",
    "kind": "Mobile grocery vehicle",
    "regionIds": [
      "embermesa"
    ],
    "venueIds": [
      "embermesa-market",
      "embermesa-transit"
    ],
    "people": [
      {
        "id": "esperanza_vega",
        "relationship": "Owner-operator and keeper of the order list"
      },
      {
        "id": "luz_vega",
        "relationship": "Child whose personal stories are not route entertainment"
      },
      {
        "id": "mesa_inez",
        "relationship": "Mother with a separate lending practice"
      }
    ],
    "ownership": {
      "ownerIds": [
        "esperanza_vega"
      ]
    },
    "storyStatus": "established_object",
    "gameStatus": "worldbuilding"
  },
  "leilas_dock_folds": {
    "id": "leilas_dock_folds",
    "name": "Leila’s Dock Folds",
    "kind": "Fresh portable meal",
    "regionIds": [
      "saffron"
    ],
    "venueIds": [
      "saffron-market",
      "saffron-transit",
      "saffron-cinema"
    ],
    "people": [
      {
        "id": "saffron_leila",
        "relationship": "Cook and seller"
      },
      {
        "id": "saffron_tomas",
        "relationship": "Customer and brother who carries meals to work or study"
      },
      {
        "id": "rafael_valdes",
        "relationship": "Customer fitting food around canopy work"
      },
      {
        "id": "vera_valdes",
        "relationship": "Teenage customer with her own filling preferences"
      },
      {
        "id": "saffron_ada",
        "relationship": "Organizer who orders food by agreement for gatherings"
      }
    ],
    "ownership": {
      "ownerLabel": "Leila makes and sells them; buyers own their individual meals."
    },
    "storyStatus": "established_object",
    "gameStatus": "worldbuilding"
  },
  "yellow_tab_survey_case": {
    "id": "yellow_tab_survey_case",
    "name": "Nell’s Yellow-Tab Survey Case",
    "kind": "Professional equipment case",
    "regionIds": [
      "traveler",
      "alder",
      "saffron",
      "glasssteppe",
      "pelagia",
      "embermesa"
    ],
    "venueIds": [
      "alder-transit",
      "glasssteppe-transit",
      "pelagia-transit",
      "embermesa-transit",
      "saffron-transit"
    ],
    "people": [
      {
        "id": "nell_harper",
        "relationship": "Owner of the carrying case and technician responsible for each assigned kit"
      }
    ],
    "ownership": {
      "ownerIds": [
        "nell_harper"
      ],
      "contentsOwnership": "Varies by contract; case ownership does not settle instrument ownership."
    },
    "storyStatus": "established_object",
    "gameStatus": "worldbuilding",
    "brandId": "whaleskin",
    "brandIds": [
      "whaleskin"
    ],
    "brand": "Whaleskin"
  },
  "whaleskin": {
    "id": "whaleskin",
    "name": "Whaleskin",
    "kind": "Fitted van cover · story object",
    "regionIds": [
      "pelagia"
    ],
    "venueIds": [
      "pelagia-transit",
      "pelagia-garden",
      "pelagia-work"
    ],
    "people": [
      {
        "id": "lata_rao",
        "relationship": "Purchaser and original owner in the story; gives the misfit to Tavi"
      },
      {
        "id": "pelagia_tavi",
        "relationship": "Recipient and owner after the gift; decides how the cover is reused"
      },
      {
        "id": "pelagia_mara",
        "relationship": "Engineer whose professional inspection can establish the cover’s effect on drainage"
      }
    ],
    "ownership": {
      "ownerLabel": "In the story, Lata buys the cover and gives it to Tavi. Later agreed custody is recorded separately from ownership."
    },
    "storyStatus": "playable_story_object",
    "gameStatus": "implemented",
    "brandId": "whaleskin",
    "brandIds": [
      "whaleskin"
    ],
    "brand": "Whaleskin",
    "image": {
      "src": "items/whaleskin.webp",
      "alt": "A silver-grey fitted van cover laid loose, with two floppy mirror sleeves and a stitched Whaleskin label.",
      "type": "object_portrait"
    }
  },
  "dalloway": {
    "id": "dalloway",
    "name": "Dalloway",
    "kind": "Two-note bicycle bell · story object",
    "regionIds": [
      "embermesa"
    ],
    "venueIds": [
      "embermesa-corner-cafe",
      "embermesa-transit",
      "embermesa-makerspace"
    ],
    "people": [
      {
        "id": "mesa_june",
        "relationship": "Bell owner, repairer and decision-maker about its use and her work"
      },
      {
        "id": "esperanza_vega",
        "relationship": "Farewell-label maker in the story"
      },
      {
        "id": "kit",
        "relationship": "Illustrator whose empty-counter image can be mistaken for news about the diner"
      }
    ],
    "ownership": {
      "ownerIds": [
        "mesa_june"
      ],
      "ownerLabel": "June owns the bell. Moving it by agreement changes its use, not its owner."
    },
    "storyStatus": "playable_story_object",
    "gameStatus": "implemented",
    "brandId": "dalloway",
    "brandIds": [
      "dalloway"
    ],
    "brand": "Dalloway",
    "image": {
      "src": "items/dalloway.webp",
      "alt": "A battered chrome bicycle bell clipped to a diner counter, with a worn thumb paddle and stamped Dalloway name.",
      "type": "object_portrait"
    }
  },
  "bracken": {
    "id": "bracken",
    "name": "Bracken",
    "kind": "Redbank bass drum · story object",
    "regionIds": [
      "traveler",
      "alder"
    ],
    "venueIds": [
      "alder-apartments",
      "alder-community",
      "alder-transit"
    ],
    "people": [
      {
        "id": "nell_harper",
        "relationship": "Owner of the drum and the blue-check duvet inside it"
      },
      {
        "id": "ruth_harper",
        "relationship": "Room owner and temporary storage host in the story"
      },
      {
        "id": "jonah_bell",
        "relationship": "Paying occupant whose agreed room access is affected when this scene begins"
      }
    ],
    "ownership": {
      "ownerIds": [
        "nell_harper"
      ],
      "ownerLabel": "Nell owns the drum and duvet. In this scene Ruth owns the room, and Jonah has paid for the agreed occupancy."
    },
    "storyStatus": "playable_story_object",
    "gameStatus": "implemented",
    "brandId": "bracken",
    "brandIds": [
      "bracken"
    ],
    "brand": "Bracken",
    "image": {
      "src": "items/bracken.webp",
      "alt": "A dark-red bass drum with chrome lugs and a clear front head showing a blue-check duvet inside.",
      "type": "object_portrait"
    }
  }
};
