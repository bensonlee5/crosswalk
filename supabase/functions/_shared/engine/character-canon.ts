/** Approved manual canon. Generated from the reviewed snapshots in docs/character-canon.
 * Public facts are never inferred from a surname, portrait, MBTI or ethnicity.
 * Profile cues guide authored scenes; they are not assessments or player scores. */
export type CanonicalCharacter={id:string;name:string;age:number;region:string;hometown:string;role:string;intro:string;family:{id:string;label:string}[];culturalBackground:string;voice:string;needs:string;stress:string;homeFit:{basis:string;fit:string;friction:string};profileKind:string};
export const canonicalCharacters:CanonicalCharacter[]=[
  {
    "id": "mina",
    "name": "Mina",
    "age": 27,
    "region": "alder",
    "hometown": "Alder Quay",
    "role": "Songwriter",
    "intro": "Mina finds time for songs in the quiet after closing shifts. Handwritten verses and an unhurried melody are part of her everyday life.",
    "family": [
      {
        "id": "solange_morel",
        "label": "Biological child of"
      },
      {
        "id": "lucien_morel",
        "label": "Biological grandchild of"
      }
    ],
    "culturalBackground": "Bellweather port culture; an Alder Quay family with ties to Solenne.",
    "voice": "Begins with a concrete detail, leaves a beat, then offers the more personal sentence. Dry, exact observations can interrupt her softness. A short answer may protect a thought still forming.",
    "needs": "Creative ownership, time to hear her own response, and companionship that does not require a performance. Being understood matters more than being widely approved.",
    "stress": "Revises an already workable passage and becomes harder to read. Pressure to entertain can bring an unexpectedly flat refusal. Quiet and a bounded question help more than escalating reassurance.",
    "homeFit": {
      "basis": "continued_home",
      "fit": "Alder’s scraps of daily conversation, overlapping errands, and familiar sounds feed her writing without requiring a departure from home. Written exchanges fit its ordinary shared routines.",
      "friction": "A community that readily shares food and news may assume a song should also be shared. Close neighbors and ferry activity can crowd the quiet she needs."
    },
    "profileKind": "adult"
  },
  {
    "id": "eli",
    "name": "Eli",
    "age": 46,
    "region": "alder",
    "hometown": "Alder Quay",
    "role": "Gardener & pantry neighbor",
    "intro": "Eli began growing food in borrowed containers. He has a practical fondness for herbs, shared suppers and making a small patch of earth useful.",
    "family": [
      {
        "id": "asha",
        "label": "Parent of"
      },
      {
        "id": "celia_baptiste",
        "label": "Biological child of"
      },
      {
        "id": "dahlia_baptiste",
        "label": "Biological sibling of"
      },
      {
        "id": "imani_baptiste",
        "label": "Biological aunt/uncle of"
      },
      {
        "id": "noel_baptiste",
        "label": "Biological aunt/uncle of"
      }
    ],
    "culturalBackground": "Black Afro-Atlantic family; long-established Bellweather roots.",
    "voice": "Warm, plain, and comfortably initiating. Starts with what is here and what someone can use. His jokes can be earthy and matter-of-fact; repeated requests bring shorter sentences.",
    "needs": "Reciprocity, useful work that reaches an actual table, and a reliable end to his share. He needs to belong as a person with a life, not merely as available help.",
    "stress": "Begins filling gaps before admitting irritation, then sounds brisk when another appears. His warning sign is doing the handover while still answering every question himself.",
    "homeFit": {
      "basis": "continued_home",
      "fit": "Alder’s small growing spaces and shared suppers suit his preference for repeated, visible contributions. Familiar ferry-linked households give social continuity without requiring a new invented reason for staying.",
      "friction": "Mutual help can slide into assuming the willing neighbor is always available. Dense shared spaces also make stopping more conspicuous than carrying on."
    },
    "profileKind": "adult"
  },
  {
    "id": "jo",
    "name": "Jo",
    "age": 54,
    "region": "alder",
    "hometown": "Alder Quay",
    "role": "Repairer & maker",
    "intro": "Jo learned repair by keeping well-used neighborhood things working. Their bench is full of labeled offcuts, useful tools and careful handiwork.",
    "family": [
      {
        "id": "kit",
        "label": "Parent of"
      },
      {
        "id": "bea",
        "label": "Grandparent of"
      }
    ],
    "culturalBackground": "East Asian family roots within Caldera’s Latino community; now settled in Alder Quay.",
    "voice": "Concrete nouns, short diagnostic questions, and occasional deadpan understatement. They explain best with the object visible. Praise is specific; criticism should name the joint or instruction rather than the person.",
    "needs": "Autonomy over method, accurate recognition of labor, and a job with a finish. They want objects and people treated according to actual use and contribution, not appearance.",
    "stress": "Protect the bench, narrow the conversation, and take over a step too abruptly. Extra unpriced requests can make their whole manner seem like a refusal before they have explained the distinction.",
    "homeFit": {
      "basis": "chosen",
      "fit": "Jo’s adult move places them among Alder’s workshops and heavily used everyday objects. Compact routes and familiar repair needs suit their hands-on independence, without inventing a motive for the move.",
      "friction": "Neighborly familiarity may blur the line between an estimate and a favor. A sociable public culture can mistake their reserved manner for dissatisfaction."
    },
    "profileKind": "adult"
  },
  {
    "id": "alder_tess",
    "name": "Tess",
    "age": 52,
    "region": "alder",
    "hometown": "Alder Quay",
    "role": "Café owner & ferry dispatcher",
    "intro": "Tess knows coffee orders and the last ferry by heart. Her days are shaped by the café counter, the window chalkboard and the rhythm of the crossings.",
    "family": [
      {
        "id": "nico",
        "label": "Parent of"
      },
      {
        "id": "ruth_harper",
        "label": "Biological child of"
      },
      {
        "id": "oliver_harper",
        "label": "Biological sibling of"
      },
      {
        "id": "nell_harper",
        "label": "Biological aunt/uncle of"
      }
    ],
    "culturalBackground": "White European-background Bellweather family; rooted in Alder Quay.",
    "voice": "Brisk, audible, and specific. Leads with the useful fact, follows with the option, then asks a real question. Familiar teasing and remembered orders warm a manner that can otherwise sound managerial.",
    "needs": "Dependable information, shared competence, and the freedom to finish a day. She wants to trust that the café and ferry work can continue without her remaining the final answer.",
    "stress": "Speeds up, supplies answers before questions finish, and quietly checks work she has delegated. Her growth edge is tolerating a different sound method without confusing it with neglect.",
    "homeFit": {
      "basis": "continued_home",
      "fit": "Alder’s close overlap of café life and ferry movement gives her coordination a concrete purpose. Long familiarity lets her recognize the person behind a routine order.",
      "friction": "Visibility invites constant questions. The same compact neighborhood that makes her effective can make an evening off feel like leaving an unattended post."
    },
    "profileKind": "adult"
  },
  {
    "id": "alder_rowan",
    "name": "Rowan",
    "age": 39,
    "region": "alder",
    "hometown": "Alder Quay",
    "role": "Librarian & volunteer gardener",
    "intro": "Rowan carries library returns and seedlings in the same bicycle basket. A seed swap beside the returns trolley became one of their regular pursuits.",
    "family": [],
    "culturalBackground": "Long-established Bellweather family; Alder Quay’s shared port culture.",
    "voice": "Curious questions, accessible comparisons, and a lightly associative rhythm. They may offer three promising directions when one was requested, then visibly choose the most useful starting point.",
    "needs": "Accessible learning, exchange with room for beginners, and space to pursue interests beyond providing access for others. They want a living shared practice rather than a display of personal generosity.",
    "stress": "Overexplains a refusal, promises a later possibility too readily, or adds another label instead of shrinking the task. A smaller scope restores their warmth and attention.",
    "homeFit": {
      "basis": "continued_home",
      "fit": "Alder’s compact library, garden, and household routes let Rowan connect useful practices at a human scale. Their bicycle basket physically carries that overlap through a familiar hometown.",
      "friction": "A neighborhood rich in shared projects can keep producing attractive new beginnings. Close contact makes it easy to acquire more living things and requests than anyone agreed to maintain."
    },
    "profileKind": "adult"
  },
  {
    "id": "bram",
    "name": "Bram",
    "age": 43,
    "region": "alder",
    "hometown": "Alder Quay",
    "role": "Night-bus cleaner & mapmaker",
    "intro": "Patient and observant, Bram draws the town after the shops close. He keeps pencil stubs and fills his notebooks with everyday streets and places to sit.",
    "family": [],
    "culturalBackground": "Bellweather port upbringing; family connections along the ferry coast.",
    "voice": "Few decorative words, precise qualifications, and dry observations. He may answer “At what hour?” before discussing distance. Silence often means he is checking the implication rather than withholding affection.",
    "needs": "Usable truth, time to check, and recognition of the person who must actually walk the route. He wants practical limits to survive the enthusiasm of people describing a plan.",
    "stress": "Rechecks an uncertain line and becomes terse with anyone urging confidence. His caution can drift into postponing a usable imperfect version; dated uncertainty provides an honest way forward.",
    "homeFit": {
      "basis": "continued_home",
      "fit": "Alder’s intersecting ferries, streets, and changing opening hours reward his close attention. Its familiar daytime geography still offers a different town after closing, sustaining his mapmaking interest.",
      "friction": "Public descriptions may privilege daytime ease and neighborly optimism. Frequent informal directions give him many opportunities to be useful and many occasions to sound needlessly contrary."
    },
    "profileKind": "adult"
  },
  {
    "id": "oren",
    "name": "Oren",
    "age": 57,
    "region": "alder",
    "hometown": "Alder Quay",
    "role": "Coat mender & miniature-theatre maker",
    "intro": "Oren learned mending among relatives who saved every useful button. He keeps them in old tea tins and makes hand-sized scenery after work.",
    "family": [
      {
        "id": "miro",
        "label": "Younger brother of"
      }
    ],
    "culturalBackground": "A cross-regional railway-and-port family, shared with his brother Miro.",
    "voice": "Concrete observations turn sideways into small jokes. He may try a character’s line aloud or gently exaggerate an absurdity. On a tiring day, the same voice can be brief and direct.",
    "needs": "Play, control over scale, and permission to be ordinary company rather than an inspiring project. He needs his yes, no, and change of plan taken literally.",
    "stress": "Tinkers around a difficult finishing decision or jokes before naming discomfort. Separately, chemotherapy-related fatigue can change what is possible today; resting is not evidence of avoidance or a personality failure.",
    "homeFit": {
      "basis": "chosen",
      "fit": "His adult move to Alder places miniature making among crossings, workshops, and compact everyday scenes. The ferry has already supplied comic material; this fit does not invent why he relocated.",
      "friction": "A neighborly port can generate invitations and benevolent suggestions faster than he wants them. Wet conditions require ordinary protection for card and cloth, not a dramatic challenge."
    },
    "profileKind": "adult"
  },
  {
    "id": "hugo",
    "name": "Hugo",
    "age": 36,
    "region": "alder",
    "hometown": "Alder Quay",
    "role": "Early-shift baker",
    "intro": "Hugo knows bread through years of early starts and repeated batches. He judges dough by touch and writes his own notes beside recipes.",
    "family": [
      {
        "id": "jonah_bell",
        "label": "Chosen brother of"
      }
    ],
    "culturalBackground": "Bellweather local family; raised in Alder Quay’s port community.",
    "voice": "Plain, measured phrases with tactile particulars. He may initially say “until it feels right,” catch himself, and replace it with something visible. His humor is understated and close to the task.",
    "needs": "Reliability, enough preparation time, and evidence that his knowledge can become useful in someone else’s hands. He needs rest and bounded teaching as much as an edible result.",
    "stress": "Reaches for the bowl, repeats an instruction louder, or polishes the explanation past usefulness. His central challenge is letting safe awkwardness continue long enough for somebody else to learn.",
    "homeFit": {
      "basis": "continued_home",
      "fit": "Alder’s ordinary working rhythms give reliable bread a clear place in the day. His long local familiarity and neighboring-port family ties suit continuity without requiring him to enjoy every gathering.",
      "friction": "Early shifts can sit awkwardly beside evening social life. A culture of useful contributions may reinforce his tendency to measure a good day only by what he provided."
    },
    "profileKind": "adult"
  },
  {
    "id": "priya",
    "name": "Priya",
    "age": 68,
    "region": "alder",
    "hometown": "Alder Quay",
    "role": "Retired weather observer",
    "intro": "Priya spent years writing weather reports. These days she carries a well-protected notebook and enjoys listening to the different sounds of rain.",
    "family": [
      {
        "id": "kamala_arul",
        "label": "Biological child of"
      },
      {
        "id": "dara_arul",
        "label": "Biological parent of"
      },
      {
        "id": "anil_arul",
        "label": "Biological sibling of"
      }
    ],
    "culturalBackground": "South Asian; Sri Lankan Tamil family background, raised in Pelagia.",
    "voice": "Deliberate, precise, and occasionally wry. Distinguishes “I saw” from “I expect.” She can let a question remain unanswered, then surprise someone with a vivid observation about a sound.",
    "needs": "Honesty about what is known, control over her attention, and experiences allowed to have no practical yield. She wants another person’s interpretation to remain theirs without being responsible for it.",
    "stress": "Becomes overly corrective when pressed to provide certainty or meaning. She may answer the inaccurate claim while overlooking why somebody needed reassurance; returning to their actual question broadens her response.",
    "homeFit": {
      "basis": "chosen",
      "fit": "Her work brought her from Pelagia to Bellweather, and she has lived in Alder for years. Maritime variability supports both practiced observation and her newer pleasure in simply hearing rain.",
      "friction": "Neighbors may continue treating a retired observer as an on-demand forecast. Shared outings can bring pressure to guarantee agreeable weather or a meaningful result for everyone."
    },
    "profileKind": "adult"
  },
  {
    "id": "asha",
    "name": "Asha",
    "age": 15,
    "region": "alder",
    "hometown": "Alder Quay",
    "role": "Student & notebook illustrator",
    "intro": "Asha, Eli’s teenage child, fills a notebook with imaginary small gardens. They would like to finish a short sketchbook that feels like their own.",
    "family": [
      {
        "id": "eli",
        "label": "Child of"
      },
      {
        "id": "celia_baptiste",
        "label": "Biological grandchild of"
      },
      {
        "id": "dahlia_baptiste",
        "label": "Biological nibling of"
      },
      {
        "id": "imani_baptiste",
        "label": "Biological cousin of"
      },
      {
        "id": "noel_baptiste",
        "label": "Biological cousin of"
      }
    ],
    "culturalBackground": "Black Afro-Atlantic Bellweather family, shared with Eli.",
    "voice": "Points first, then finds words for what the shape should feel like. Can be lively about an imagined detail and abrupt about showing a page. Adult-sounding explanations should never replace ordinary teenage uncertainty.",
    "needs": "Creative ownership, belonging among peers, and room to be unfinished without every sketch becoming evidence of talent. They need adults to stay interested without taking over the project.",
    "stress": "Hides a page, starts another instead of finishing, or dismisses a drawing they cared about. Give them time and a specific choice; compulsory reassurance can feel like another evaluation.",
    "homeFit": {
      "basis": "family_context",
      "fit": "Alder supplies nearby gardens, benches, and awkward corners to notice, with Eli and familiar community spaces in their family context. It offers material for imagination without determining their interests.",
      "friction": "Adults may interpret a garden drawing as a practical proposal or a continuation of Eli’s work. Familiar neighbors can also make private experimentation feel conspicuous."
    },
    "profileKind": "adolescent"
  },
  {
    "id": "nico",
    "name": "Nico",
    "age": 9,
    "region": "alder",
    "hometown": "Alder Quay",
    "role": "Elementary-school child & leaf-shape collector",
    "intro": "Nico is Tess’s nine-year-old child. Fallen leaves and hand-drawn pretend ferry tickets give them small ways to arrange the world around the café window.",
    "family": [
      {
        "id": "alder_tess",
        "label": "Child of"
      },
      {
        "id": "ruth_harper",
        "label": "Biological grandchild of"
      },
      {
        "id": "oliver_harper",
        "label": "Biological nibling of"
      },
      {
        "id": "nell_harper",
        "label": "Biological cousin of"
      }
    ],
    "culturalBackground": "White European-background Bellweather family, shared with Tess.",
    "voice": "Concrete, short explanations with sudden imaginative leaps. Repeats an important question or demonstrates by moving a leaf. Dialogue can be funny and observant without giving them adult emotional wisdom.",
    "needs": "Safe room to invent, an attentive grown-up, and permission to ask what something is without losing the fun of looking. They need ordinary childhood care, play, and unhurried learning.",
    "stress": "Insists the first name was right, goes quiet in disappointment, or wants to abandon that page. Acknowledging the feeling and returning to the visible shape is more useful than a lesson about resilience.",
    "homeFit": {
      "basis": "family_context",
      "fit": "The café window, nearby leaves, and visible ferry movement furnish familiar material for drawing and make-believe while Tess remains responsible for care. Nico did not choose this home to match a personality.",
      "friction": "A busy working setting can interrupt play or tempt adults to praise imitation as readiness for responsibility. Real tickets and work remain entirely the grown-ups’ business."
    },
    "profileKind": "child"
  },
  {
    "id": "saffron_leila",
    "name": "Leila",
    "age": 44,
    "region": "saffron",
    "hometown": "Saffron Reach",
    "role": "Market cook",
    "intro": "Leila cooks for boat crews and late-arriving friends. Her market work began with one portable griddle near the early boat shift.",
    "family": [
      {
        "id": "saffron_tomas",
        "label": "Older sister of"
      },
      {
        "id": "ines_valdes",
        "label": "Biological child of"
      },
      {
        "id": "rafael_valdes",
        "label": "Biological sibling of"
      },
      {
        "id": "vera_valdes",
        "label": "Biological aunt/uncle of"
      }
    ],
    "culturalBackground": "Latina; Cuban-family background within Solenne’s coastal community.",
    "voice": "Short, concrete questions, sensory descriptions and friendly bluntness. She asks what actually happened to lunch on the boat. Let affection appear in remembered preferences, while her refusals remain unmistakable.",
    "needs": "Autonomy over scale, useful feedback, and the satisfaction of feeding somebody well. She wants her judgment respected without being installed as the neighborhood’s endlessly available cook.",
    "stress": "Gets faster and more clipped, potentially treating conversation as another interruption to clear. Restore room by reducing competing demands. She can then name what went wrong without performing cheerful hospitality.",
    "homeFit": {
      "basis": "continued_home",
      "fit": "The canal market gives her immediate feedback and meals fitted to real journeys. Her longstanding home supports familiar exchanges and practical independence; the low-rise courtyards also permit leaving the busiest corner behind.",
      "friction": "Shared tables can blur hospitality into expected labor. Evening social invitations may collide with early cooking, and local enthusiasm for a bigger gathering can ignore her preferred scale."
    },
    "profileKind": "adult"
  },
  {
    "id": "saffron_tomas",
    "name": "Tomas",
    "age": 39,
    "region": "saffron",
    "hometown": "Saffron Reach",
    "role": "Canal mechanic",
    "intro": "Tomas repairs the small boats that keep the district moving. He learned his trade around engines with handwritten maintenance dates and keeps learning as the boats change.",
    "family": [
      {
        "id": "saffron_leila",
        "label": "Younger brother of"
      },
      {
        "id": "ines_valdes",
        "label": "Biological child of"
      },
      {
        "id": "rafael_valdes",
        "label": "Biological sibling of"
      },
      {
        "id": "vera_valdes",
        "label": "Biological aunt/uncle of"
      }
    ],
    "culturalBackground": "Latino; Cuban-family background shared with his sister Leila.",
    "voice": "Uses exact nouns and ordered steps, with a pause to check understanding. Dry understatement suits him better than a long inspirational speech. A direct admission of uncertainty is a mark of seriousness.",
    "needs": "Competence earned honestly, continuity between one person’s work and the next, and permission to remain a learner. He needs time to understand without being treated as slow or asked to bluff.",
    "stress": "May repeat a check or overexplain a detail when others demand speed. His tone becomes procedural. A named stopping point and room to consult the right source help him recover flexibility.",
    "homeFit": {
      "basis": "continued_home",
      "fit": "The district’s working canals offer continuity between older engines and new ferry systems. Remaining near familiar family and repair routes fits his investment in accumulated knowledge, without requiring every interest to match the evening arts scene.",
      "friction": "Night study and early repairs can compete with courtyard invitations. Friendly pressure for a quick favor risks making established relationships feel like an informal repair queue."
    },
    "profileKind": "adult"
  },
  {
    "id": "saffron_ada",
    "name": "Ada",
    "age": 35,
    "region": "saffron",
    "hometown": "Saffron Reach",
    "role": "Community cinema organizer",
    "intro": "Ada hosts films that give neighbors plenty to discuss over tea. Her first screenings were modest affairs with a borrowed sheet and a few chairs.",
    "family": [],
    "culturalBackground": "Latina; a long-established Solenne coastal family.",
    "voice": "Inviting questions, quick associations and an occasional delighted digression. Her important writing beat is the pause after the question. Avoid making her translate every silence into a feeling or answer it herself.",
    "needs": "Open-ended conversation, shared ownership of the room and freedom to change her interpretation. She needs the gathering to include the labor that makes it possible, rather than only its most articulate participants.",
    "stress": "May offer too many prompts or try to rescue an awkward evening with more activity. Recovering means tolerating an unfinished thought and accepting that an enjoyable event can still end on time.",
    "homeFit": {
      "basis": "continued_home",
      "fit": "Canal courtyards, shared tables and distributed neighborhood spaces suit small screenings that grow from available people and equipment. Her longstanding local connections give the invitation context without making everyone an automatic audience.",
      "friction": "The same sociable setting can turn a host into a permanent organizer. Dispersed homes and late conversations require attention to departures and cleanup, even when one more discussion feels tempting."
    },
    "profileKind": "adult"
  },
  {
    "id": "sami",
    "name": "Sami",
    "age": 31,
    "region": "saffron",
    "hometown": "Saffron Reach",
    "role": "Tile restorer & tabletop-game maker",
    "intro": "Sami works with canal tiles and makes little tabletop games from safe offcuts. Patient handiwork and playful shapes share space on his worktable.",
    "family": [
      {
        "id": "farah_hussain",
        "label": "Biological child of"
      }
    ],
    "culturalBackground": "South Asian; Pakistani-family background, raised in Saffron Reach.",
    "voice": "Begins with an object, sketch or pointed question. Can become unexpectedly talkative when a pattern clicks. His humor suits a mischievous example that reveals a rule’s absurd edge, not a lecture disguised as banter.",
    "needs": "The freedom to investigate, a comprehensible point of entry and feedback that distinguishes the design from its maker. He wants participation to depend less on already knowing how the room works.",
    "stress": "Tends to add another clarifying arrow or exception until the explanation becomes denser. A short test and an explicit limit help him stop revising everything at once and return to the person present.",
    "homeFit": {
      "basis": "continued_home",
      "fit": "Canal tiles give his eye and hands a familiar material language; neighborhood game nights provide lively, imperfect tests. His childhood home offers continuity while leaving him room to make a distinctive interest of his own.",
      "friction": "Crowded social evenings can favor quick verbal confidence. Restoration requires bounded attention that does not always leave energy for another public explanation or a game that never reaches its end."
    },
    "profileKind": "adult"
  },
  {
    "id": "glass_ren",
    "name": "Ren",
    "age": 26,
    "region": "glasssteppe",
    "hometown": "Glasssteppe",
    "role": "Rail conductor",
    "intro": "Ren learned the hill railway by walking its switchbacks. They know the paths, benches and windbreaks that don't make it onto the station diagrams.",
    "family": [
      {
        "id": "mei_chen",
        "label": "Child of"
      },
      {
        "id": "jian_wu",
        "label": "Cousin of"
      },
      {
        "id": "liang_chen",
        "label": "Biological grandchild of"
      },
      {
        "id": "qiao_chen",
        "label": "Biological nibling of"
      }
    ],
    "culturalBackground": "East Asian; Chinese-family background, rooted in Glasssteppe.",
    "voice": "Clear landmarks, manageable chunks and carefully attached caveats. Asks one relevant question before giving directions. Their warmth lies in making the next step recognizable, not in telling someone how they ought to feel.",
    "needs": "Information people can genuinely use, a dependable rhythm and a distinction between being helpful and being permanently on duty. Wants firsthand observations taken seriously alongside official diagrams.",
    "stress": "May give too many qualifications or continue mentally checking a journey after it has left their hands. Naming what is verified and what belongs to someone else restores a realistic boundary.",
    "homeFit": {
      "basis": "continued_home",
      "fit": "Glasssteppe’s compact terraces reward the detailed walking knowledge Ren gathered before railway work. Benches, windbreaks and recognizable landings make the long-established family home legible at human scale.",
      "friction": "Steep routes and exposed platforms make simple reassurance unreliable. Living among people who know their occupation can invite work questions into an evening they intended to keep for themselves."
    },
    "profileKind": "adult"
  },
  {
    "id": "glass_sora",
    "name": "Sora",
    "age": 30,
    "region": "glasssteppe",
    "hometown": "Glasssteppe",
    "role": "Copper repairer",
    "intro": "Sora turns salvaged station metal into useful things. Clear diagrams and understandable repairs are as much a part of the bench as the tools.",
    "family": [
      {
        "id": "hana_mori",
        "label": "Nibling of"
      },
      {
        "id": "akira_mori",
        "label": "Biological child of"
      },
      {
        "id": "natsumi_mori",
        "label": "Adoptive parent of"
      }
    ],
    "culturalBackground": "East Asian; Japanese-family background, rooted in Glasssteppe.",
    "voice": "Spare statements, precise drawings and questions that identify a physical difference. Can sound blunt if a suggestion has no workable basis. Warmth appears when they make an explanation usable and wait for the other person to try.",
    "needs": "Control over the bench, room to observe before intervening and work that remains understandable after they leave. They want skill respected without being cast as the person who must fix everything immediately.",
    "stress": "May retreat into the object and answer the human part of a question too tersely. Space to finish one check helps; pressure to socialize while concentrating usually makes the exchange worse.",
    "homeFit": {
      "basis": "continued_home",
      "fit": "The railway’s used materials and the city’s making culture support Sora’s practical experimentation. Their established family home offers familiar routes and relationships without requiring workshop work to become every visit’s subject.",
      "friction": "Compact workshops make interruptions easy, and local pride in useful making can turn spare time into expected availability. Cold weather and worn fittings demand realism when somebody only wants a cosmetic answer."
    },
    "profileKind": "adult"
  },
  {
    "id": "glass_pavel",
    "name": "Pavel",
    "age": 70,
    "region": "glasssteppe",
    "hometown": "Glasssteppe",
    "role": "Reading-garden caretaker",
    "intro": "Pavel tends quiet terraces above a noisy railway. He came to the district for work and found a lasting interest in its sheltered growing spaces.",
    "family": [],
    "culturalBackground": "A migrant family from the outer Veyran foothills; now rooted in Glasssteppe.",
    "voice": "Unhurried, specific observations and invitations with an easy exit. His humor can gently expose overcomplication. Silence is comfortable company, not a test that the visitor must pass.",
    "needs": "A useful, inhabited garden, time to read and freedom from the assumption that caring for a place means endlessly improving it. He wants enjoyment to count as a legitimate use of time.",
    "stress": "May drift into one more small chore instead of saying he wants to stop. Once he notices the pattern, a clear finish and the physical act of sitting down help reclaim the afternoon.",
    "homeFit": {
      "basis": "chosen",
      "fit": "Came from the outer Veyran foothills for work and made a home near the railway. The sheltered terrace offers a pocket of growing and reading beside urban movement, allowing both connection and quiet.",
      "friction": "The short growing season and changing exposure invite endless adjustment. In a compact city, a welcoming garden can become a public service whose caretaker is never permitted to sit in it."
    },
    "profileKind": "adult"
  },
  {
    "id": "miro",
    "name": "Miro",
    "age": 62,
    "region": "glasssteppe",
    "hometown": "Glasssteppe",
    "role": "Retired signal painter & shadow-comedy maker",
    "intro": "Miro spent years painting railway signs and arrival posters. In retirement, he cuts small paper comedies from old timetable sheets.",
    "family": [
      {
        "id": "oren",
        "label": "Older brother of"
      }
    ],
    "culturalBackground": "A Veyran railway family, shared with his younger brother Oren.",
    "voice": "Visual comparisons, nimble reversals and a dry aside that shifts attention to the edge of the scene. When someone becomes serious, let him stop performing and ask plainly what kind of response is wanted.",
    "needs": "Room to play, human details that survive a polished image and a small piece of work allowed to reach completion. Wants an audience that can disagree without requiring the comedy to become grander.",
    "stress": "May keep proposing another version or use a joke before checking whether it is welcome. Recovers by naming the real question and reducing the scene or conversation to a scale someone actually chose.",
    "homeFit": {
      "basis": "continued_home",
      "fit": "His long-established highland home keeps familiar station gestures and working lives within sight. Railway materials and a quieter retirement practice can coexist, while his brother’s Alder Quay home maintains a connection beyond the terraces.",
      "friction": "A place organized around legibility and useful work can undervalue playful pauses. Familiarity also tempts him to assume he knows the whole story behind someone’s gesture or the joke they would enjoy."
    },
    "profileKind": "adult"
  },
  {
    "id": "mei_chen",
    "name": "Mei Chen",
    "age": 54,
    "region": "glasssteppe",
    "hometown": "Glasssteppe",
    "role": "Former bus driver & community choir organizer",
    "intro": "Mei Chen once drove the hill buses and now helps organize a community choir. Ren’s mother enjoys a lively room, a familiar chorus and a gathering that starts when it says it will.",
    "family": [
      {
        "id": "glass_ren",
        "label": "Mother of"
      },
      {
        "id": "liang_chen",
        "label": "Biological child of"
      },
      {
        "id": "qiao_chen",
        "label": "Biological sibling of"
      },
      {
        "id": "jian_wu",
        "label": "Biological aunt/uncle of"
      }
    ],
    "culturalBackground": "Chinese-family background; part of Glasssteppe’s established East Asian railway community.",
    "voice": "Hearty, direct and anecdotal, with an easily offered invitation. Her sentences may arrive before a pause has fully opened. Write the small self-correction when she realizes somebody else was about to speak.",
    "needs": "Lively shared enjoyment, a practical way to get started and permission to stop being the organizer afterward. Wants other people to contribute real preferences rather than simply accept her momentum.",
    "stress": "Tends to fill gaps with extra instructions, extra talk or another helpful job. A specific contribution from someone else helps; she must also allow that contribution to differ from her preferred method.",
    "homeFit": {
      "basis": "continued_home",
      "fit": "Compact neighborhoods and available community rooms suit regular collective singing. Her established family connections supply familiar company; the choir also gives her a local pleasure distinct from the district’s workshop and study interests.",
      "friction": "Dense social connections can turn every meeting into a request to organize something. Group enthusiasm may consume the quiet supper she wanted, and practical making is not her only measure of a worthwhile evening."
    },
    "profileKind": "adult"
  },
  {
    "id": "jian_wu",
    "name": "Jian Wu",
    "age": 17,
    "region": "glasssteppe",
    "hometown": "Glasssteppe",
    "role": "Student & zine illustrator",
    "intro": "Jian Wu is Ren’s seventeen-year-old cousin. He draws short zines about bicycle rides, school-day detours and the places his friends decide to stop.",
    "family": [
      {
        "id": "glass_ren",
        "label": "Cousin of"
      },
      {
        "id": "qiao_chen",
        "label": "Biological child of"
      },
      {
        "id": "liang_chen",
        "label": "Biological grandchild of"
      },
      {
        "id": "mei_chen",
        "label": "Biological nibling of"
      }
    ],
    "culturalBackground": "Chinese-family background; a teenager growing up in Glasssteppe’s East Asian railway community.",
    "voice": "Observant snippets, playful opinions and flashes of earnestness when a detail matters. Can argue a cover enthusiastically and then go quiet. Ask what sort of feedback he wants rather than interpreting silence for him.",
    "needs": "Creative ownership, friendship that leaves room for disagreement and a finish small enough to reach. Needs permission to be learning without a rough booklet becoming a judgment of his potential.",
    "stress": "May redraw a panel repeatedly or disparage his pages after seeing a polished booklet. Reduce the audience pressure, name one attainable finish and leave room for an unrelated activity afterward.",
    "homeFit": {
      "basis": "family_context",
      "fit": "His family home supplies hill routes, gatherings and small daily scenes for drawing. Public paths and time with friends offer age-appropriate exploration; relatives’ railway knowledge is background rather than an inherited assignment.",
      "friction": "Steep routes require sensible limits and appropriate repair help. Adults may over-identify him with family transport work, while comparison with other students can make a small creative project feel unnecessarily public."
    },
    "profileKind": "adolescent"
  },
  {
    "id": "hana_mori",
    "name": "Hana Mori",
    "age": 68,
    "region": "glasssteppe",
    "hometown": "Glasssteppe",
    "role": "Retired postal worker & walking-club member",
    "intro": "Hana Mori spent years delivering letters through Glasssteppe’s stair lanes. Sora’s aunt now chooses her walks by company, weather and the bench she would like to reach.",
    "family": [
      {
        "id": "glass_sora",
        "label": "Aunt of"
      },
      {
        "id": "akira_mori",
        "label": "Older biological sister of"
      },
      {
        "id": "natsumi_mori",
        "label": "Great-aunt through adoption of"
      }
    ],
    "culturalBackground": "Japanese-family background; part of Glasssteppe’s long-established East Asian community.",
    "voice": "Brisk route suggestions, useful landmarks and an occasional pointed question when discussion circles. Affection can be plain and understated. Leave room for a small observation that shows she was attending to people as well as directions.",
    "needs": "Purpose she can choose, company that can make a decision and recognition that familiar places keep changing. She wants her practical knowledge welcomed without turning leisure back into a postal round.",
    "stress": "May accelerate the decision and treat hesitation as wasted time. The corrective is to ask what the group wants from this morning, rather than proving that the original route remains achievable.",
    "homeFit": {
      "basis": "continued_home",
      "fit": "Longstanding family ties and years of postal rounds make Glasssteppe’s stair lanes richly legible. Compact neighborhoods let purposeful walking become sociable pleasure, with familiar doorways and window boxes along the way.",
      "friction": "Snow, shade and steep climbs make yesterday’s easy route a poor automatic assumption. The habit of finishing a round can survive retirement and turn a club outing into an obligation nobody intended."
    },
    "profileKind": "adult"
  },
  {
    "id": "pelagia_mara",
    "name": "Mara",
    "age": 45,
    "region": "pelagia",
    "hometown": "Pelagia",
    "role": "Flood-gate engineer",
    "intro": "Mara keeps the town's practical pumps running. Careful inspections and clear handover notes are the ordinary work behind a beautiful waterfront.",
    "family": [
      {
        "id": "lin",
        "label": "Parent of"
      },
      {
        "id": "ravi_desai",
        "label": "Spouse of"
      },
      {
        "id": "nila_desai",
        "label": "Stepparent of"
      }
    ],
    "culturalBackground": "South Asian-rooted Pelagian harbor family, shared with Lin.",
    "voice": "Plain verbs, specific subjects and brief questions: who checked it, when, and what remains? With Lin she can ask about an invented street without turning paper play into an inspection.",
    "needs": "Dependable colleagues, accurately shared responsibility and recognition for ordinary maintenance. She wants to be allowed to finish her part and leave, including for time with Lin.",
    "stress": "Her sentences shorten and she starts assigning owners too quickly. She may treat another person's hesitation as a missing instruction rather than a feeling that needs hearing.",
    "homeFit": {
      "basis": "continued_home",
      "fit": "Pelagia is her established home. Its concentrated harbor, shared systems and visible maintenance give her practical values a place to operate.",
      "friction": "The beautiful waterfront can attract admiration that overlooks the work underneath it. A small town can also make every off-duty encounter feel like an engineering question."
    },
    "profileKind": "adult"
  },
  {
    "id": "pelagia_lio",
    "name": "Lio",
    "age": 41,
    "region": "pelagia",
    "hometown": "Pelagia",
    "role": "Harbor cook",
    "intro": "Lio makes ginger broth for early ferry shifts. His cooking grew from a shared pot into a familiar harbor routine, with the day's ingredients written in chalk.",
    "family": [],
    "culturalBackground": "South Asian-rooted family from the Nacre island coast.",
    "voice": "Warm, concrete and sparing. He names the ingredients before explaining the weather and can let a joke end with a small smile instead of a performance.",
    "needs": "Continuity, usefulness and a manageable working rhythm. He wants people to recognize his cooking without requiring every bowl or morning to be identical.",
    "stress": "He narrows the menu and becomes repetitive about what is available. He may keep serving instead of admitting that he needs somebody else to take the next practical job.",
    "homeFit": {
      "basis": "continued_home",
      "fit": "His longstanding Pelagian home gives his stall a recognizable place in the early ferry rhythm and a steady stream of everyday relationships.",
      "friction": "Monsoonal delivery disruptions frustrate his preference for continuity. The harbor teaches him to keep familiarity flexible rather than promise an unchanging menu."
    },
    "profileKind": "adult"
  },
  {
    "id": "pelagia_esme",
    "name": "Esme",
    "age": 72,
    "region": "pelagia",
    "hometown": "Pelagia",
    "role": "Neighborhood archivist",
    "intro": "Esme records ordinary lives behind the famous domes. Ferry photographs, donated lists and the people who remember them all have a place in her archive.",
    "family": [
      {
        "id": "lata_rao",
        "label": "Biological parent of"
      }
    ],
    "culturalBackground": "South Asian-rooted Pelagian family with generations of harbor ties.",
    "voice": "Precise, patient questions with room to correct the premise. She repeats a person's chosen wording before offering her own interpretation, and her occasional humor is quietly exact.",
    "needs": "Continuity without appropriation, trustworthy records and the right of ordinary people to remain complicated. Being useful matters more than making the archive impressive.",
    "stress": "She revisits a troublesome sentence and may defer a harmless choice while searching for a perfect description. A clear limit on the question helps her stop.",
    "homeFit": {
      "basis": "continued_home",
      "fit": "Pelagia's long family histories and compact waterfront place everyday change within her reach; its interest in local memory gives the archive a public purpose.",
      "friction": "Familiarity can make neighbors assume they already know one another's stories. Picturesque harbor narratives may crowd out the mundane records she values."
    },
    "profileKind": "adult"
  },
  {
    "id": "pelagia_tavi",
    "name": "Tavi",
    "age": 24,
    "region": "pelagia",
    "hometown": "Pelagia",
    "role": "Raised-garden grower",
    "intro": "Tavi grows familiar vegetables near salt water. Dated labels, raised beds and patient experiments are part of their everyday gardening practice.",
    "family": [],
    "culturalBackground": "East Asian family background; moved from Glasssteppe to Pelagia.",
    "voice": "Starts with a specific observation and then offers alternatives. In enthusiasm they can explain the third possibility before checking whether the listener understood the first.",
    "needs": "Room to learn honestly, a useful harvest and the freedom to change their mind. They want an experiment to count as meaningful even when it produces no attractive result.",
    "stress": "They generate too many possible explanations or retreat into labels when someone wants reassurance. A practical next observation brings them back into conversation.",
    "homeFit": {
      "basis": "chosen",
      "fit": "Their established move from Glasssteppe to Pelagia puts their curiosity among different seasons, salty wind and raised beds. This is a plausible continuing attraction, not a newly invented reason for the original move.",
      "friction": "Warmth does not make every familiar crop thrive. Distance from highland relatives and the demands of useful food complicate the pleasure of experimentation."
    },
    "profileKind": "adult"
  },
  {
    "id": "sefu",
    "name": "Sefu",
    "age": 49,
    "region": "pelagia",
    "hometown": "Pelagia",
    "role": "Tide-clock caretaker & beginner dancer",
    "intro": "Sefu maintains the public tide clocks with care. Away from the clocks, he is a beginning dancer who practices his steps on paving squares.",
    "family": [
      {
        "id": "safia_odhiambo",
        "label": "Biological child of"
      },
      {
        "id": "amir_odhiambo",
        "label": "Biological parent of"
      }
    ],
    "culturalBackground": "Afro-Pelagian; a long-settled East African-rooted harbor family.",
    "voice": "Soft openings, concrete timing and a small, self-aware joke. He sometimes adds an unnecessary escape clause after the other person has already said yes.",
    "needs": "Dependability, reciprocal consideration and permission to be inexperienced. He wants his company to be welcome for itself, not owed in return for a covered shift.",
    "stress": "He rehearses an invitation, apologizes twice or retreats to a task he already knows how to do. Correcting a mechanism can feel easier than letting a friend see an uncertain step.",
    "homeFit": {
      "basis": "continued_home",
      "fit": "Long-established Pelagian routines make his dependable work tangible; familiar paving squares also become places to practice something personally new.",
      "friction": "A town that recognizes him as the clock caretaker can keep seeing competence where he wants room to be a beginner. Its engineering focus does not contain all his interests."
    },
    "profileKind": "adult"
  },
  {
    "id": "lin",
    "name": "Lin",
    "age": 7,
    "region": "pelagia",
    "hometown": "Pelagia",
    "role": "Elementary-school child & paper-city builder",
    "intro": "Lin is Mara’s seven-year-old child. They fold paper houses, arrange little streets, and invent names for the places in their model city.",
    "family": [
      {
        "id": "pelagia_mara",
        "label": "Child of"
      },
      {
        "id": "ravi_desai",
        "label": "Stepchild of"
      },
      {
        "id": "nila_desai",
        "label": "Stepsibling of"
      }
    ],
    "culturalBackground": "South Asian-rooted Pelagian harbor family, shared with Mara.",
    "voice": "Concrete announcements followed by imaginative questions. They might rename a street mid-sentence and expect the listener to catch up; their language stays that of a seven-year-old.",
    "needs": "Agency over their game, interested company and reassurance that a frustrating fold does not spoil the whole afternoon. A made-up place should be allowed to make child-sized sense.",
    "stress": "They may push a fallen piece away, insist it was meant to stand or declare the town finished. Tiredness can shorten patience without changing their underlying curiosity.",
    "homeFit": {
      "basis": "family_context",
      "fit": "Pelagia is home through Mara and family life. Domes and raised routes offer shapes for safe tabletop play and invented geography.",
      "friction": "Working water and machinery are adult-controlled spaces, not an invitation to test the model outside. Frustrating folds and wet weather can change the day's play."
    },
    "profileKind": "child"
  },
  {
    "id": "yuna_park",
    "name": "Yuna Park",
    "age": 37,
    "region": "pelagia",
    "hometown": "Pelagia",
    "role": "Community radio host",
    "intro": "Yuna Park hosts a neighborhood radio hour in Pelagia. A recent arrival from Glasssteppe, she is learning the harbor through the voices and ordinary sounds people choose to share.",
    "family": [
      {
        "id": "eun_park",
        "label": "Biological child of"
      },
      {
        "id": "min_park",
        "label": "Biological sibling of"
      },
      {
        "id": "jiwoo_park",
        "label": "Biological aunt/uncle of"
      }
    ],
    "culturalBackground": "Korean-family background; raised in Glasssteppe and now a newcomer to Pelagia.",
    "voice": "Vivid opening detail, an inviting question and a tendency to connect subjects quickly. Her practiced voice leaves a beat for an answer; her excited voice sometimes needs to be reminded.",
    "needs": "Connection, room to make good work and a feeling of belonging that does not depend on being an endlessly interesting newcomer. She needs private familiarity as well as public contact.",
    "stress": "She overexplains, fills silence or tries to repair an awkward moment with another cheerful introduction. More stimulation can make her feel less connected rather than more.",
    "homeFit": {
      "basis": "chosen",
      "fit": "Her recent Pelagian move gives her radio work conversations between longtime residents and people learning the harbor. The compact waterfront offers repeat encounters that can become familiarity.",
      "friction": "Flat walkways and tides require a different map from highland stairs. A day of introductions can leave her wanting a familiar supper and a quiet walk rather than another discovery."
    },
    "profileKind": "adult"
  },
  {
    "id": "mesa_june",
    "name": "June",
    "age": 60,
    "region": "embermesa",
    "hometown": "Ember Mesa",
    "role": "Diner cook, bicycle repairer & station announcer",
    "intro": "June's day can include the griddle, a bicycle bench and the station microphone. She knows many waiting passengers by their usual breakfasts.",
    "family": [
      {
        "id": "rosa_moreno",
        "label": "Biological child of"
      },
      {
        "id": "mateo_moreno",
        "label": "Biological parent of"
      }
    ],
    "culturalBackground": "Latina; a long-established Caldera desert family.",
    "voice": "Quick, audible and lightly teasing, with names or concrete details that tell people she remembers them. She can sound as if she has agreed before she has checked the whole request.",
    "needs": "Useful variety, familiar company and a life that contains her own next interest. She wants to be wanted without becoming the automatic answer to every uncovered job.",
    "stress": "She takes over, changes tasks too rapidly and makes jokes that hide annoyance. A pile of little favors can matter more than one dramatic crisis.",
    "homeFit": {
      "basis": "continued_home",
      "fit": "Ember Mesa's station-side cluster lets her several skills meet the same people, while the wider rural settlement makes useful combined errands valuable.",
      "friction": "A small service center can make her conspicuously available to everyone. Heat and distances leave less room for the spontaneous extra job than she first imagines."
    },
    "profileKind": "adult"
  },
  {
    "id": "mesa_inez",
    "name": "Inez",
    "age": 65,
    "region": "embermesa",
    "hometown": "Ember Mesa",
    "role": "Librarian & garden coordinator",
    "intro": "Inez lends novels, tools and practical growing advice. What began as a small lending shelf now makes room for books, seeds and everyday know-how.",
    "family": [
      {
        "id": "esperanza_vega",
        "label": "Biological parent of"
      },
      {
        "id": "luz_vega",
        "label": "Biological grandparent of"
      }
    ],
    "culturalBackground": "Latina; Mexican-family background within Caldera’s desert community.",
    "voice": "Unhurried, concrete and dryly economical. She asks what the tool is for before giving advice and can puncture an inflated proposal with one practical question.",
    "needs": "Resources people can actually use, honest returns and continuity that survives a disappointing season. She wants a small institution that functions without anyone having to be heroic.",
    "stress": "She becomes terse and may reject a proposal before the speaker has explained its human importance. Calmness can be experienced as indifference when she omits the reason for a refusal.",
    "homeFit": {
      "basis": "continued_home",
      "fit": "Her longstanding Caldera home gives practical lending a clear role among dispersed households. Seeds, tools and books can share a station-side service center.",
      "friction": "Dry seasons expose promises a tidy borrowing system cannot keep. Distances make an unnecessary return trip costly, so rules must be useful beyond the counter."
    },
    "profileKind": "adult"
  },
  {
    "id": "kit",
    "name": "Kit",
    "age": 28,
    "region": "embermesa",
    "hometown": "Ember Mesa",
    "role": "Diner dishwasher & comic artist",
    "intro": "Kit draws six-panel comics on clean order slips between diner jobs. Their eye is on ordinary desert life: cups, stools and the pauses between shifts.",
    "family": [
      {
        "id": "jo",
        "label": "Adult child of"
      },
      {
        "id": "bea",
        "label": "Parent of"
      }
    ],
    "culturalBackground": "East Asian and Caldera Latino family roots; raised in Alder Quay, settled in Ember Mesa.",
    "voice": "Brief, observant and image-led, with understated humor. When pressed to explain too much, they may point to the panel instead of supplying a manifesto.",
    "needs": "An ordinary home taken seriously, creative ownership and room to be both a working parent and an artist. They do not want every page to represent their whole family or region.",
    "stress": "They redraw a small detail, dismiss a page as nothing or become prickly about unsolicited improvement. A practical interruption can also simply be parenting or work, not avoidance.",
    "homeFit": {
      "basis": "chosen",
      "fit": "Kit explicitly chose an adult home in Ember Mesa after growing up in Alder Quay. Its lived-in diner and dramatic surroundings give their interest in unshowy daily life a productive setting.",
      "friction": "The desert's spectacle can eclipse the residents, repeating the visitor's mistaken idea that nobody really lives there. Family ties also extend back to Jo in Alder Quay."
    },
    "profileKind": "adult"
  },
  {
    "id": "bea",
    "name": "Bea",
    "age": 2,
    "region": "embermesa",
    "hometown": "Ember Mesa",
    "role": "Toddler & curious cup-stacker",
    "intro": "Bea is Kit’s two-year-old child and Jo’s grandchild. Chunky wooden cups and the names of familiar things can fill a quiet family moment with discovery.",
    "family": [
      {
        "id": "kit",
        "label": "Child of"
      },
      {
        "id": "jo",
        "label": "Grandchild of"
      }
    ],
    "culturalBackground": "East Asian and Caldera Latino family roots through Kit and Jo.",
    "voice": "Pointing, reaching, looking toward Kit and trying or repeating familiar words. Keep dialogue short; an adult may understand a gesture without giving Bea an adult explanation.",
    "needs": "Kit's nearby care, safety, rest and small opportunities to explore. Recognition, repetition and a cup balanced where Bea wanted it can be enough for the moment.",
    "stress": "Attention may break, a frown become a protest, or Bea reach for Kit. The response is a cue to check the immediate situation and care needs, not evidence of stubborn character or a failed lesson.",
    "homeFit": {
      "basis": "family_context",
      "fit": "Ember Mesa is home because Bea lives there with Kit. Familiar voices and family routines matter more to Bea than the region's adult identity or practical-skills culture.",
      "friction": "Heat, noise or tiredness can shorten comfortable play. Scenes stay with Kit in a suitable play corner or quiet café seat, with care taking priority over the scene's pace."
    },
    "profileKind": "toddler"
  },
  {
    "id": "neri",
    "name": "Neri",
    "age": 29,
    "region": "traveler",
    "hometown": "On the road",
    "role": "Map restorer",
    "intro": "Neri works with folded working charts and old ferry annotations. They are attentive to the everyday marks that make a map belong to a place.",
    "family": [],
    "culturalBackground": "A traveling map-restoration background spanning the ferry and railway regions.",
    "voice": "Exact questions, qualified claims and an occasional unexpected comparison. They may answer the hidden assumption before the question the other person thought they asked.",
    "needs": "Intellectual honesty, autonomy and connections that leave both people's working lives intact. Travel should permit attention to difference rather than turn every place into a version of the last.",
    "stress": "They retreat into qualifications, overcorrect a casual phrase or become elusive about a plan that feels presumptive. Their silence can sound like indifference when it is protecting room to decide.",
    "homeFit": {
      "basis": "mobile",
      "fit": "Neri is canonically a map restorer on the road, not a settled resident assigned to one region. Working ports offer changing names and annotations that reward their attentive, independent curiosity.",
      "friction": "Movement interrupts familiar contact, and a chart cannot convey every local assumption. They must keep asking residents rather than confuse professional observation with belonging everywhere."
    },
    "profileKind": "adult"
  },
  {
    "id": "celia_baptiste",
    "name": "Celia Baptiste",
    "age": 74,
    "region": "alder",
    "hometown": "Alder Quay",
    "role": "Retired housing clerk & competitive domino player",
    "intro": "Celia spent thirty years keeping housing records straight. Retirement has made room for fierce domino games, experimental paintings and a firmer answer when somebody assumes she is free.",
    "family": [
      {
        "id": "eli",
        "label": "Biological parent of"
      },
      {
        "id": "dahlia_baptiste",
        "label": "Biological parent of"
      },
      {
        "id": "asha",
        "label": "Biological grandparent of"
      },
      {
        "id": "imani_baptiste",
        "label": "Biological grandparent of"
      },
      {
        "id": "noel_baptiste",
        "label": "Biological grandparent of"
      }
    ],
    "culturalBackground": "Black Afro-Atlantic Bellweather family; biological mother of Eli and Dahlia.",
    "voice": "Her speech is brisk, specific and frequently funny. She can finish somebody else’s argument before they have made it, then declare the matter settled. Genuine delight makes her less economical.",
    "needs": "She needs pursuits that belong to her, serious competition and family affection that survives a refusal. Being consulted matters more than being praised as indispensable.",
    "stress": "She identifies an external nuisance first: noise, timing, an awkward table. Feeling overclaimed makes her close discussion abruptly rather than explain how resentment has accumulated.",
    "homeFit": {
      "basis": "continued_home",
      "fit": "Familiar covered landings and the ferry hall give her easy access to company, competition and family. Her painting room can expand her life without requiring a different address.",
      "friction": "That same familiarity encourages assumptions about her availability. A neighbor’s question can feel like an assignment before she has checked whether it actually is one."
    },
    "profileKind": "adult"
  },
  {
    "id": "dahlia_baptiste",
    "name": "Dahlia Baptiste",
    "age": 42,
    "region": "alder",
    "hometown": "Alder Quay",
    "role": "Parcel-depot supervisor & amateur sprinter",
    "intro": "Dahlia can untangle a missed-delivery queue and organize a crowded household. The running track is where she has started asking what she wants for herself.",
    "family": [
      {
        "id": "celia_baptiste",
        "label": "Biological child of"
      },
      {
        "id": "imani_baptiste",
        "label": "Biological parent of"
      },
      {
        "id": "noel_baptiste",
        "label": "Biological parent of"
      },
      {
        "id": "malik_reed",
        "label": "Spouse of"
      },
      {
        "id": "eli",
        "label": "Biological sibling of"
      },
      {
        "id": "asha",
        "label": "Biological aunt/uncle of"
      }
    ],
    "culturalBackground": "Black Afro-Atlantic Bellweather family, shared with Celia, Eli, Imani and Noel.",
    "voice": "She leads with the problem, the needed action and a time. Explanations become shorter when tired. Among runners she can be chatty; not every conversation has to earn its place on a schedule.",
    "needs": "She needs ambition to be taken seriously, shared domestic effort and time with a purpose of her own. Promotion interests her for pay and authority as well as recognition.",
    "stress": "She accelerates, interrupts and treats additional questions as obstacles. A helpful suggestion can sound to her like one more decision to manage. Running cannot reliably erase an overloaded day.",
    "homeFit": {
      "basis": "continued_home",
      "fit": "Alder concentrates friends, family and the working knowledge she has built. Compact streets support busy ordinary days; choosing to stay is compatible with wanting a larger role.",
      "friction": "Familiarity makes a promotion or family strain feel publicly discussable. She sometimes downplays what she wants, then resents others for not recognizing it."
    },
    "profileKind": "adult"
  },
  {
    "id": "imani_baptiste",
    "name": "Imani Baptiste",
    "age": 20,
    "region": "alder",
    "hometown": "Alder Quay",
    "role": "Screen-print apprentice & delivery cyclist",
    "intro": "Imani wants her posters noticed for their design. Between a screen-print apprenticeship and delivery shifts, she is deciding how far she needs to travel to feel independent.",
    "family": [
      {
        "id": "dahlia_baptiste",
        "label": "Biological child of"
      },
      {
        "id": "malik_reed",
        "label": "Stepchild of"
      },
      {
        "id": "celia_baptiste",
        "label": "Biological grandchild of"
      },
      {
        "id": "noel_baptiste",
        "label": "Biological sibling of"
      },
      {
        "id": "eli",
        "label": "Biological nibling of"
      },
      {
        "id": "asha",
        "label": "Biological cousin of"
      }
    ],
    "culturalBackground": "Black Afro-Atlantic Bellweather ancestry through both biological parents; part of the Baptiste family.",
    "voice": "She is most precise when discussing an image: spacing, weight, what reads across a room. Personal explanations arrive more indirectly, sometimes as a joke with a sharper edge than she intended.",
    "needs": "She needs authorship, fair payment and room to change without constant comparison with her younger self. Family closeness should include curiosity about who she is becoming.",
    "stress": "She withdraws into revision or argues the artistic principle behind a practical disagreement. An overdue invoice can become harder to open the longer she has avoided it.",
    "homeFit": {
      "basis": "continued_home",
      "fit": "Studio friendships and family make Alder a real home while she considers a seasonal opportunity elsewhere. Her continued presence is not evidence that she has rejected travel or ambition.",
      "friction": "Wet delivery rides, studio costs and constant family comparisons can make distance seem easier than a difficult conversation. She needs to distinguish those pressures when weighing departure."
    },
    "profileKind": "adult"
  },
  {
    "id": "noel_baptiste",
    "name": "Noel Baptiste",
    "age": 11,
    "region": "alder",
    "hometown": "Alder Quay",
    "role": "Schoolchild & stop-motion enthusiast",
    "intro": "Noel turns paper boats and kitchen objects into stop-motion adventures. The exciting part is showing the finished film; the harder part is sharing the decisions that make it.",
    "family": [
      {
        "id": "dahlia_baptiste",
        "label": "Biological child of"
      },
      {
        "id": "malik_reed",
        "label": "Stepchild of"
      },
      {
        "id": "celia_baptiste",
        "label": "Biological grandchild of"
      },
      {
        "id": "imani_baptiste",
        "label": "Biological sibling of"
      },
      {
        "id": "eli",
        "label": "Biological nibling of"
      },
      {
        "id": "asha",
        "label": "Biological cousin of"
      }
    ],
    "culturalBackground": "Black Afro-Atlantic Bellweather ancestry through both biological parents; part of the Baptiste family.",
    "voice": "He narrates action before explaining logistics and uses an exciting ending to argue for an idea. Embarrassment makes him insist that an accident was intentional. Questions should leave him time to answer.",
    "needs": "He wants his imagined world to feel real to somebody else, credit for his effort and permission to be an ordinary child when filmmaking stops being fun.",
    "stress": "He protests, changes the explanation or tries to control a small thing he can control, such as a credit. Adults should address the behavior without turning disappointment into a character verdict.",
    "homeFit": {
      "basis": "family_context",
      "fit": "His family and sheltered corners provide a familiar setting for school, friendship and play. Adults handle journeys, permissions, purchases and safeguarding; home is not an adult relocation decision for him.",
      "friction": "Rain disrupts outdoor shots, and the family table cannot remain a harbor forever. Sharing space and borrowing things ask for small, learnable compromises rather than adult household management."
    },
    "profileKind": "child"
  },
  {
    "id": "malik_reed",
    "name": "Malik Reed",
    "age": 44,
    "region": "alder",
    "hometown": "Alder Quay",
    "role": "Lift technician & social salsa dancer",
    "intro": "Malik is comfortable diagnosing a stalled lift and less comfortable naming a difficult feeling. His marriage, stepfamily and dance nights ask for different kinds of confidence.",
    "family": [
      {
        "id": "dahlia_baptiste",
        "label": "Spouse of"
      },
      {
        "id": "imani_baptiste",
        "label": "Stepparent of"
      },
      {
        "id": "noel_baptiste",
        "label": "Stepparent of"
      }
    ],
    "culturalBackground": "Black Afro-Atlantic Bellweather ancestry from the Reed family; joined the Baptiste household through marriage.",
    "voice": "He uses concrete observations and few extra words. When relaxed, a missed dance turn gets a laugh. When annoyed, excessive care with his wording can make a small remark sound like a verdict.",
    "needs": "He needs reliable partnership, useful work and social time in which he is more than the household’s available fixer. Belonging matters without requiring identical closeness with every family member.",
    "stress": "He becomes quieter and busier with practical tasks. Doing another chore can temporarily feel easier than mentioning an unfair arrangement, although it also adds to the resentment he is concealing.",
    "homeFit": {
      "basis": "chosen",
      "fit": "He moved from another Bellweather port. Alder’s close friends and walkable evenings support the adult life he chose, including marriage and a place in an existing family.",
      "friction": "The ease of being known can become scrutiny. Household membership also brings ambiguous expectations that technical competence alone cannot resolve; anonymity occasionally sounds restful."
    },
    "profileKind": "adult"
  },
  {
    "id": "ruth_harper",
    "name": "Ruth Harper",
    "age": 76,
    "region": "alder",
    "hometown": "Alder Quay",
    "role": "Retired hairdresser & home-film collector",
    "intro": "Ruth’s home films contain crooked horizons, bad haircuts and people laughing before they notice the camera. She intends to keep the awkward moments in the family screening.",
    "family": [
      {
        "id": "alder_tess",
        "label": "Biological parent of"
      },
      {
        "id": "oliver_harper",
        "label": "Biological parent of"
      },
      {
        "id": "nico",
        "label": "Biological grandparent of"
      },
      {
        "id": "nell_harper",
        "label": "Biological grandparent of"
      }
    ],
    "culturalBackground": "White European-background Bellweather family, shared with Tess, Oliver, Nico and Nell.",
    "voice": "She follows a detail into an anecdote, supplies an irreverent title and asks the question somebody else avoided. A joke can welcome another viewpoint or dodge a serious objection.",
    "needs": "She needs curiosity directed toward her current life, permission to surprise her family and room to choose her own pace. She wants shared history to remain lively rather than solemnly flattering.",
    "stress": "She makes another joke, changes the subject or decides others are fussing. Too many commitments make her renegotiate abruptly, leaving people surprised by limits she could have mentioned earlier.",
    "homeFit": {
      "basis": "continued_home",
      "fit": "Familiar streets and people make Alder easy to inhabit. A solo holiday can offer fresh experience while her established home remains a place she enjoys returning to.",
      "friction": "Being introduced only as Tess’s mother narrows her before she speaks. Family familiarity can make a practical offer feel like somebody taking charge of her plans."
    },
    "profileKind": "adult"
  },
  {
    "id": "oliver_harper",
    "name": "Oliver Harper",
    "age": 48,
    "region": "alder",
    "hometown": "Alder Quay",
    "role": "Commercial sign installer & sea-swimming hobbyist",
    "intro": "Oliver makes a living from signs that stay legible in bad weather. His own plans are less consistent, especially when a new hobby or an uncomfortable quote is involved.",
    "family": [
      {
        "id": "ruth_harper",
        "label": "Biological child of"
      },
      {
        "id": "nell_harper",
        "label": "Biological parent of"
      },
      {
        "id": "alder_tess",
        "label": "Biological sibling of"
      },
      {
        "id": "nico",
        "label": "Biological aunt/uncle of"
      }
    ],
    "culturalBackground": "White European-background Bellweather family; raised in Alder Quay.",
    "voice": "He asks practical questions, sometimes stacking several behind a casual opening. Warm understatement suits him; worry makes the apparently optional question sound less optional on its second appearance.",
    "needs": "He needs work to be sustainable, affection that is not measured by readiness with a ladder and evidence that care can survive distance. He wants leisure to feel worthwhile without becoming another obligation.",
    "stress": "He delays the quote he most needs to send, checks for news and offers another small task he can finish. New equipment may promise a clean start without solving the unfinished work.",
    "homeFit": {
      "basis": "continued_home",
      "fit": "Family familiarity and an established work network make staying in Alder practical and emotionally satisfying. Supported swimming gives him a local goal outside his business and family role.",
      "friction": "People know what tools he owns, and he can volunteer before anyone asks. Familiar customers also make it harder to price additional work honestly."
    },
    "profileKind": "adult"
  },
  {
    "id": "solange_morel",
    "name": "Solange Morel",
    "age": 55,
    "region": "alder",
    "hometown": "Alder Quay",
    "role": "Hotel night manager & keen card player",
    "intro": "Solange can carry a hotel through a difficult night with practiced courtesy. At home, her quick practical advice sometimes arrives before she has heard what the other person wants.",
    "family": [
      {
        "id": "lucien_morel",
        "label": "Biological child of"
      },
      {
        "id": "mina",
        "label": "Biological parent of"
      }
    ],
    "culturalBackground": "Mixed Black Afro-Atlantic Bellweather and Cuban-background Solenne ancestry; Mina’s mother and Lucien’s daughter.",
    "voice": "At work her courtesy is measured and durable; at home she can omit every softening phrase. She asks precise questions and sometimes answers the practical problem before hearing the emotional one.",
    "needs": "She needs control over her time, respect for her judgment and contact that does not feel like another shift. She wants improved work conditions without losing the autonomy she values.",
    "stress": "She narrows the conversation to what can be settled and becomes brutally concise. A day off may begin as a welcome retreat and end with her dismissing invitations she actually misses.",
    "homeFit": {
      "basis": "continued_home",
      "fit": "Her adult life in Alder is an intentional attachment supported by family ties on two coasts. Established contact and a familiar workplace give that choice practical substance.",
      "friction": "Night work shields her from some obligations and separates her from ordinary evenings. Easy family access can still feel like a succession of appointments rather than companionship."
    },
    "profileKind": "adult"
  },
  {
    "id": "lucien_morel",
    "name": "Lucien Morel",
    "age": 80,
    "region": "alder",
    "hometown": "Alder Quay",
    "role": "Retired ferry steward & chess-club contrarian",
    "intro": "Lucien likes a well-played chess move, a ferry story with a verifiable ending and the pleasure of a spirited objection. Retirement has given him more time for all three.",
    "family": [
      {
        "id": "solange_morel",
        "label": "Biological parent of"
      },
      {
        "id": "mina",
        "label": "Biological grandparent of"
      }
    ],
    "culturalBackground": "Black Afro-Atlantic Bellweather family; Solange’s father and Mina’s maternal grandfather.",
    "voice": "He offers a counterexample, a dry question or a story with an inconvenient detail. Tenderness often arrives sideways, followed by a joke that prevents anyone dwelling too long on the gesture.",
    "needs": "He needs agency in his own home, worthwhile opponents and a version of memory that permits uncertainty. He wants experience to be heard without pretending that it makes every preference correct.",
    "stress": "He becomes more exacting about small arrangements and may argue the principle long after the practical issue is clear. Prolonging discussion lets him retain control of an otherwise unwanted change.",
    "homeFit": {
      "basis": "continued_home",
      "fit": "Water, familiar routes and proximity to Solange support his longstanding independent home. He still actively enjoys these surroundings rather than treating them only as inherited habit.",
      "friction": "Other people’s helpful improvements can threaten his preferred arrangements. He also risks using local familiarity as evidence that his way remains best after circumstances have changed."
    },
    "profileKind": "adult"
  },
  {
    "id": "dara_arul",
    "name": "Dara Arul",
    "age": 39,
    "region": "alder",
    "hometown": "Alder Quay",
    "role": "Payroll clerk & recreational goalkeeper",
    "intro": "Dara can close a payroll without losing a detail. Asking for better pay, more space or a different kind of family visit is a slower and less orderly task.",
    "family": [
      {
        "id": "priya",
        "label": "Biological child of"
      },
      {
        "id": "kamala_arul",
        "label": "Biological grandchild of"
      },
      {
        "id": "anil_arul",
        "label": "Biological nibling of"
      }
    ],
    "culturalBackground": "South Asian; Sri Lankan Tamil family background through both biological parents, connecting Pelagia and Alder Quay.",
    "voice": "Exact and understated at work, she may express hurt through a dry remark. Football friends hear a quicker, more mischievous voice.",
    "needs": "She needs recognition for effort and ambition, freely chosen leisure and enjoyable family contact. She wants both coasts to contain relationships rather than competing claims.",
    "stress": "She becomes intensely useful, then resents being unnoticed. Praise can confirm the role she wanted to escape, prompting a sharp answer without explanation.",
    "homeFit": {
      "basis": "continued_home",
      "fit": "Her childhood move was a family circumstance; remaining in Alder as an adult is her decision. Work, friendships and a cooler climate support that continued home.",
      "friction": "Rain can cancel the football she protects, while family invitations may turn into arguments over loyalty. She dislikes being asked to make either coast the measure of her affection."
    },
    "profileKind": "adult"
  },
  {
    "id": "jonah_bell",
    "name": "Jonah Bell",
    "age": 32,
    "region": "alder",
    "hometown": "Alder Quay",
    "role": "Warehouse picker & aspiring stage comedian",
    "intro": "Jonah works warehouse shifts and tests jokes wherever somebody has agreed to listen. They want a paid comedy slot, a quieter room and laughter that nobody feels obliged to provide.",
    "family": [
      {
        "id": "hugo",
        "label": "Chosen brother of"
      }
    ],
    "culturalBackground": "Black Afro-Atlantic Bellweather ancestry; a separate biological family from their chosen brother Hugo.",
    "voice": "Jonah heightens a revealing phrase and tries another version if it fails. Insecurity makes him explain why a joke should work, reducing the room’s willingness to laugh.",
    "needs": "They need honest laughter, paid opportunities and enough quiet to sleep around warehouse shifts. Being taken seriously means treating comedy as work without insisting it justify itself as neighborhood service.",
    "stress": "He fills silence, argues the intention or converts a personal question into material. A rejected joke can absorb energy that would be better spent on an unpaid form or an overdue chore.",
    "homeFit": {
      "basis": "continued_home",
      "fit": "Alder offers busy streets, rented living and friendship-based belonging. Hugo is a chosen brother, and that closeness exists alongside a wish for a room where shift sleep is possible.",
      "friction": "Noise and rent are practical constraints. Familiar audiences can also blur affection with reassurance, while expectations of community-minded art leave little room for a simply ridiculous story."
    },
    "profileKind": "adult"
  },
  {
    "id": "ines_valdes",
    "name": "Inés Valdés",
    "age": 69,
    "region": "saffron",
    "hometown": "Saffron Reach",
    "role": "Retired ticket seller & film melodrama enthusiast",
    "intro": "At sixty-nine, Inés Valdés has retired from selling boat tickets and become a formidable defender of film melodramas. She is preparing to introduce a courtyard screening herself.",
    "family": [
      {
        "id": "rafael_valdes",
        "label": "Biological parent of"
      },
      {
        "id": "saffron_leila",
        "label": "Biological parent of"
      },
      {
        "id": "saffron_tomas",
        "label": "Biological parent of"
      },
      {
        "id": "vera_valdes",
        "label": "Biological grandparent of"
      }
    ],
    "culturalBackground": "Latina; Cuban-family ancestry within Solenne’s established coastal community.",
    "voice": "She is brisk about arrangements and expansive about feelings, quoting a scene’s turning point as if its force were self-evident. An invitation can quietly acquire the grammar of an instruction.",
    "needs": "She needs chosen company, permission to enjoy what moves her and a place in family life that remains meaningful as her children make separate plans. She also wants to introduce a film on her own terms.",
    "stress": "She checks for replies, adds persuasive details or complains with entertaining exaggeration. The performance may recruit sympathy without telling anyone that she simply feels lonely or overlooked.",
    "homeFit": {
      "basis": "continued_home",
      "fit": "Saffron Reach’s evening sociability and courtyard films suit her longstanding coastal home. Familiar crossings give gatherings practical texture and emotional importance.",
      "friction": "The distance between courtyard clusters can make an unplanned week quiet. She risks solving that quiet by arranging other people’s evenings before considering a pleasure she can enjoy regardless."
    },
    "profileKind": "adult"
  },
  {
    "id": "rafael_valdes",
    "name": "Rafael Valdés",
    "age": 47,
    "region": "saffron",
    "hometown": "Saffron Reach",
    "role": "Shade-canopy installer & open-water swimmer",
    "intro": "Rafael Valdés, forty-seven, installs shade canopies across Saffron Reach. Between work, co-parenting his daughter Vera and family gatherings, he is trying to protect time for long-distance swimming.",
    "family": [
      {
        "id": "ines_valdes",
        "label": "Biological child of"
      },
      {
        "id": "vera_valdes",
        "label": "Biological parent of"
      },
      {
        "id": "saffron_leila",
        "label": "Biological sibling of"
      },
      {
        "id": "saffron_tomas",
        "label": "Biological sibling of"
      }
    ],
    "culturalBackground": "Latino; Cuban-family ancestry shared with Inés, Leila, Tomas and Vera.",
    "voice": "He speaks easily about what a job needs and more vaguely about when it will finish. In company he is warm but not always explicit about leaving; reassurance can become a conversational shortcut.",
    "needs": "He needs uninterrupted time, satisfying physical work and genuine attention for Vera. His aim is a schedule containing swimming and fatherhood deliberately, rather than as leftovers after customers are satisfied.",
    "stress": "He answers with another optimistic estimate, keeps looking at a message and assumes focused time can be recovered later. This can leave somebody feeling postponed even after he finally puts the phone away.",
    "homeFit": {
      "basis": "continued_home",
      "fit": "Established work and family give Saffron Reach durable appeal. Staying supports chosen relationships while supervised open-water sessions provide the quiet concentration he actively seeks.",
      "friction": "Spread-out jobs consume travel time he can underestimate. Family gatherings also make departure conspicuous, tempting him to disappear rather than give a simple goodbye."
    },
    "profileKind": "adult"
  },
  {
    "id": "vera_valdes",
    "name": "Vera Valdés",
    "age": 14,
    "region": "saffron",
    "hometown": "Saffron Reach",
    "role": "Student & competitive tabletop player",
    "intro": "Fourteen-year-old Vera Valdés takes a strategy game between her parents' homes in Saffron Reach. She wants to win the school tournament and design rules that someone else can follow.",
    "family": [
      {
        "id": "rafael_valdes",
        "label": "Biological child of"
      },
      {
        "id": "ines_valdes",
        "label": "Biological grandchild of"
      },
      {
        "id": "saffron_leila",
        "label": "Biological nibling of"
      },
      {
        "id": "saffron_tomas",
        "label": "Biological nibling of"
      }
    ],
    "culturalBackground": "Latina; Cuban-family ancestry through both biological parents, raised in Saffron Reach.",
    "voice": "She asks pointed, concrete questions and notices loopholes quickly. Enthusiasm produces a dense explanation; embarrassment shortens her answers. Being laughed off as competitive makes her more determined to prove the rule matters.",
    "needs": "She wants serious answers, a fair chance to win and less confusing everyday arrangements. She also wants social choices without being told what she must enjoy.",
    "stress": "She goes quiet, disputes a result or becomes very precise about somebody else’s mistake. Adults can allow disappointment while holding the ordinary expectation that a game’s rules apply to everyone.",
    "homeFit": {
      "basis": "family_context",
      "fit": "Two local parental homes, school club, arcades and family gatherings shape her world. Adults manage home arrangements; her preferences are not an adult relocation judgment.",
      "friction": "Misplaced notebooks and pieces are frustrating, as are assumptions that every gathering delights her. Asking for a simpler school-bag routine does not make her responsible for coordinating her parents."
    },
    "profileKind": "adolescent"
  },
  {
    "id": "farah_hussain",
    "name": "Farah Hussain",
    "age": 58,
    "region": "saffron",
    "hometown": "Saffron Reach",
    "role": "Haberdashery owner & radio-drama devotee",
    "intro": "Farah Hussain is fifty-eight, owns a haberdashery and follows radio dramas with intense, selective loyalty. Her son Sami knows that a shop visit does not entitle him to spoilers.",
    "family": [
      {
        "id": "sami",
        "label": "Biological parent of"
      }
    ],
    "culturalBackground": "South Asian; Pakistani-family background, raised in Saffron Reach by parents who arrived through Nacre shipping routes.",
    "voice": "Her language is economical, observant and capable of a very dry verdict. She knows when a supplier is evading the number; a radio plot, however, may receive a defense that ignores equally obvious evidence.",
    "needs": "She needs a profitable independent shop, time that survives the closing hour and relationships allowing different interests. Belonging should not require repeated explanations of her family’s arrival generations of ordinary life ago.",
    "stress": "She stays open a little longer, then becomes short with a less demanding person afterward. Rechecking the accounts feels easier than admitting she wants an evening out for its own sake.",
    "homeFit": {
      "basis": "continued_home",
      "fit": "Suppliers, classmates and the shop she built make the canal district her established home. Keeping the business here remains a present choice.",
      "friction": "Questions that recast her family as perpetual arrivals irritate her. Reaching the listening group also requires a real closing time, which means resisting one more seemingly small transaction."
    },
    "profileKind": "adult"
  },
  {
    "id": "liang_chen",
    "name": "Liang Chen",
    "age": 79,
    "region": "glasssteppe",
    "hometown": "Glasssteppe",
    "role": "Retired lift operator & amateur portrait sitter",
    "intro": "Liang Chen, seventy-nine, spent decades operating a hillside goods lift. Now he sits for a drawing class, curious to see which version of his face will appear on the page.",
    "family": [
      {
        "id": "mei_chen",
        "label": "Biological parent of"
      },
      {
        "id": "qiao_chen",
        "label": "Biological parent of"
      },
      {
        "id": "glass_ren",
        "label": "Biological grandparent of"
      },
      {
        "id": "jian_wu",
        "label": "Biological grandparent of"
      }
    ],
    "culturalBackground": "East Asian; Chinese-family background within Glasssteppe’s established railway community.",
    "voice": "A definite observation followed too quickly by a recommendation. Dry comments and specific memories warm his voice; a rare question without a suggested answer signals real attention.",
    "needs": "To remain a participant with a present life, have his word count and be seen accurately rather than ceremonially. He wants closeness without admitting how often he tries to direct it.",
    "stress": "Repeats advice in slightly different words, as though misunderstanding must explain refusal. He may declare a conversation settled before its other participant has agreed.",
    "homeFit": {
      "basis": "continued_home",
      "fit": "Glasssteppe is his longstanding home, with familiar routes, family and a drawing class that lets his life keep acquiring new experiences.",
      "friction": "The climbing city asks him to budget energy. Familiarity also tempts neighbors and relatives to put him in the permanent role of adviser or keeper of tradition."
    },
    "profileKind": "adult"
  },
  {
    "id": "qiao_chen",
    "name": "Qiao Chen",
    "age": 50,
    "region": "glasssteppe",
    "hometown": "Glasssteppe",
    "role": "Station-laundry owner & recreational singer",
    "intro": "Qiao Chen is fifty, runs a laundry near Glasssteppe’s lower station and sings loudly when nobody has booked her into a rehearsal. She wants her prices to reflect her time.",
    "family": [
      {
        "id": "liang_chen",
        "label": "Biological child of"
      },
      {
        "id": "jian_wu",
        "label": "Biological parent of"
      },
      {
        "id": "mei_chen",
        "label": "Biological sibling of"
      },
      {
        "id": "glass_ren",
        "label": "Biological aunt/uncle of"
      }
    ],
    "culturalBackground": "East Asian; Chinese-family background shared with Liang, Mei, Ren and Jian Wu.",
    "voice": "Clipped practical questions with a quick comic turn. The joke can be affectionate or an attempt to leave a difficult moment before acknowledging her part.",
    "needs": "Economic independence, competent help and evenings that belong to her. She wants Jian’s creative life to flourish without family conflict becoming public material by default.",
    "stress": "Asks for help and immediately corrects the method. Her workload narrows attention until somebody’s different approach looks like another problem to solve.",
    "homeFit": {
      "basis": "continued_home",
      "fit": "She deliberately stays in Glasssteppe for her laundry, friends and familiar routes. Singing at home is a pleasure that need not join Mei’s choir.",
      "friction": "Short winter days make long shop hours costly. Dense family contact gives unsolicited advice and recognizable subjects for drawings more chances to collide."
    },
    "profileKind": "adult"
  },
  {
    "id": "akira_mori",
    "name": "Akira Mori",
    "age": 64,
    "region": "glasssteppe",
    "hometown": "Glasssteppe",
    "role": "Railway canteen buyer & enthusiastic amateur actor",
    "intro": "At sixty-four, Akira Mori buys supplies for a railway canteen and rehearses with an amateur theatre group. A supporting role is testing his ability to enjoy somebody else’s big scene.",
    "family": [
      {
        "id": "glass_sora",
        "label": "Biological parent of"
      },
      {
        "id": "hana_mori",
        "label": "Younger biological brother of"
      },
      {
        "id": "natsumi_mori",
        "label": "Grandparent through adoption of"
      }
    ],
    "culturalBackground": "East Asian; Japanese-family background shared with Hana Mori and Sora in Glasssteppe.",
    "voice": "Expansive stories, immediate praise and a promise that arrives before the calendar. Let a delighted digression run, then show him noticing whether anyone else has spoken.",
    "needs": "Enjoyment, recognition and the feeling of adding something to a group. He wants a smaller working week and a good performance without accepting that every enjoyable role belongs to him.",
    "stress": "Offers another reassuring promise, talks past an omission or campaigns harder for attention. A quiet factual reminder helps more than exposing the mistake for a laugh.",
    "homeFit": {
      "basis": "continued_home",
      "fit": "His long-established Glasssteppe home offers theatre friends and a regular rehearsal room. He can enjoy travel without wanting to replace that social base.",
      "friction": "A making-and-study city still requires unglamorous administration. His cheerful assurances meet relatives and colleagues who know the cost of a forgotten change."
    },
    "profileKind": "adult"
  },
  {
    "id": "eun_park",
    "name": "Eun Park",
    "age": 66,
    "region": "glasssteppe",
    "hometown": "Glasssteppe",
    "role": "Retired school secretary & bird-call listener",
    "intro": "Eun Park, sixty-six, has retired from school administration and stopped treating every morning as an appointment. She listens for birds on sheltered terraces and trades recordings with her daughter Yuna.",
    "family": [
      {
        "id": "yuna_park",
        "label": "Biological parent of"
      },
      {
        "id": "min_park",
        "label": "Biological parent of"
      },
      {
        "id": "jiwoo_park",
        "label": "Biological grandparent of"
      }
    ],
    "culturalBackground": "East Asian; Korean-family background within Glasssteppe’s established railway community.",
    "voice": "Specific observations and a remembered detail before the question. A worried question may arrive disguised as a practical check; her calmer voice can leave a call unfinished.",
    "needs": "Continuing connection, unhurried attention and a retired life with its own shape. She wants family closeness that survives distance without having to prove itself every day.",
    "stress": "Checks messages again or privately measures closeness by proximity. She has stopped calling Min the one who stayed; changing the underlying comparison takes longer than dropping the phrase.",
    "homeFit": {
      "basis": "continued_home",
      "fit": "Glasssteppe is her chosen continuing home, with active friendships and familiar terraces that support listening and walking at her own pace.",
      "friction": "Cold platforms can make a simple outing disagreeable. Yuna’s move changes the ease of contact, while the phrase about Min staying risks making the city a family obligation."
    },
    "profileKind": "adult"
  },
  {
    "id": "min_park",
    "name": "Min Park",
    "age": 34,
    "region": "glasssteppe",
    "hometown": "Glasssteppe",
    "role": "Funicular electrician & amateur escape-room designer",
    "intro": "Min Park is thirty-four, a funicular electrician and the father of ten-year-old Jiwoo. After her bedtime, he builds puzzle boxes that sometimes need fewer secrets than he gives them.",
    "family": [
      {
        "id": "eun_park",
        "label": "Biological child of"
      },
      {
        "id": "jiwoo_park",
        "label": "Biological parent of"
      },
      {
        "id": "yuna_park",
        "label": "Biological sibling of"
      }
    ],
    "culturalBackground": "East Asian; Korean-family background shared with Eun, Yuna and Jiwoo.",
    "voice": "Precise explanations, speculative branches and an occasionally triumphant reveal. He can forget that a listener wanted to play before hearing how clever the mechanism is.",
    "needs": "Recognition as a curious person in his own right, workable parenting and time for invention that stays pleasurable. Staying in Glasssteppe should not make him the family’s default reliable background.",
    "stress": "Complicates a game to prove himself, corrects too sharply or refuses help until he is visibly tired. A smaller question lets him regain proportion.",
    "homeFit": {
      "basis": "continued_home",
      "fit": "Work, co-parenting and compact routes make staying in Glasssteppe an active adult decision. Its technical culture supplies materials for curiosity without prescribing his whole identity.",
      "friction": "Dense family comparisons can make him feel less adventurous than Yuna. Turning a puzzle hobby into paid work risks reproducing the exhaustion he wanted it to relieve."
    },
    "profileKind": "adult"
  },
  {
    "id": "jiwoo_park",
    "name": "Jiwoo Park",
    "age": 10,
    "region": "glasssteppe",
    "hometown": "Glasssteppe",
    "role": "Schoolchild & enthusiastic football commentator",
    "intro": "Ten-year-old Jiwoo Park supplies football commentary for matches, breakfast and occasionally a missing sock. Her latest ambition is to record a funny match report with a friend.",
    "family": [
      {
        "id": "min_park",
        "label": "Biological child of"
      },
      {
        "id": "eun_park",
        "label": "Biological grandchild of"
      },
      {
        "id": "yuna_park",
        "label": "Biological nibling of"
      }
    ],
    "culturalBackground": "East Asian; Korean-family ancestry through both biological parents, raised in Glasssteppe.",
    "voice": "Excited short announcements, dramatic emphasis and unexpected commentary on ordinary objects. Her funniest lines can be spontaneous without sounding like professional broadcasting.",
    "needs": "An audience that enjoys her play, a fair chance for friends and freedom to be noisy at appropriate times. She needs adult care, not responsibility for entertaining a family.",
    "stress": "Talks louder, repeats the joke or loses interest when instructions go on too long. A pause and a clear next turn can bring her back.",
    "homeFit": {
      "basis": "family_context",
      "fit": "She grows up in Glasssteppe with Min and family connections. Summer courtyard matches and safe snow play provide familiar scenes; Yuna’s recorder is an adult-supported hobby tool.",
      "friction": "A compact home requires places and times for loud play. Min’s detailed puzzles can lose her attention, which need not become a verdict on either person."
    },
    "profileKind": "child"
  },
  {
    "id": "natsumi_mori",
    "name": "Natsumi Mori",
    "age": 8,
    "region": "glasssteppe",
    "hometown": "Glasssteppe",
    "role": "Schoolchild & animal-puppet collector",
    "intro": "Natsumi Mori is eight and owns a growing collection of animal puppets, each with firm opinions about bedtime stories. Her fox needs a tail that can survive its own adventures.",
    "family": [
      {
        "id": "glass_sora",
        "label": "Adopted child of"
      },
      {
        "id": "akira_mori",
        "label": "Grandchild through adoption of"
      },
      {
        "id": "hana_mori",
        "label": "Great-niece through adoption of"
      }
    ],
    "culturalBackground": "East Asian; Japanese-family background; adopted into Sora’s Mori household at age four.",
    "voice": "Short concrete explanations about what an animal wants, sometimes delivered through the puppet. A whispered invitation can be a large step without an adult speech about bravery.",
    "needs": "Secure nearby care, ownership of her imaginary animals and an invitation she can offer without perfect confidence. An unfinished puppet should remain worth showing.",
    "stress": "Becomes furious at a detached tail, pushes the work away or says it is ruined. A pause and a small safe choice work better than arguing that the problem is easy.",
    "homeFit": {
      "basis": "family_context",
      "fit": "Glasssteppe is her home with Sora. Akira and Hana are familiar relatives, and her stories need not resemble the practical making interests around her.",
      "friction": "A household full of useful craft knowledge can produce too much advice about a toy she mainly wants to imagine. Adult-controlled tools stay separate from her play."
    },
    "profileKind": "child"
  },
  {
    "id": "kamala_arul",
    "name": "Kamala Arul",
    "age": 91,
    "region": "pelagia",
    "hometown": "Pelagia",
    "role": "Retired shopkeeper & serialized-fiction fan",
    "intro": "Kamala has firm opinions about the serialized story she follows and the family visits she wants. At ninety-one, she still prefers a good argument to being politely managed.",
    "family": [
      {
        "id": "priya",
        "label": "Biological parent of"
      },
      {
        "id": "anil_arul",
        "label": "Biological parent of"
      },
      {
        "id": "dara_arul",
        "label": "Biological grandparent of"
      }
    ],
    "culturalBackground": "South Asian; Sri Lankan Tamil family background, rooted in Pelagia and shared with Priya, Anil and Dara.",
    "voice": "A definite opinion about a fictional character, then an unexpectedly sharp question about the real conversation. She can be amused and affectionate while refusing the proposal in front of her.",
    "needs": "Control over her day, interesting company and ordinary enjoyment. Practical help should make room for life, rather than turn every family conversation into an inventory of needs.",
    "stress": "Ends a crowded call or uses a joke with teeth. Others may hear only the refusal and miss that she still wanted a conversation she could participate in.",
    "homeFit": {
      "basis": "continued_home",
      "fit": "Her lifelong Pelagian home remains desirable through friends, an accessible home on higher inland ground and covered routes. Staying is an active preference, not a symbol of resistance to change.",
      "friction": "Humidity and heavy rain affect outings. Relatives can mistake sensible support arrangements for permission to supervise her pleasures or the fate of her notebooks."
    },
    "profileKind": "adult"
  },
  {
    "id": "anil_arul",
    "name": "Anil Arul",
    "age": 64,
    "region": "pelagia",
    "hometown": "Pelagia",
    "role": "Retired ferry accountant & aspiring social dancer",
    "intro": "Anil retired with a careful budget and very little practice at being a beginner. Dance lessons are teaching him how conspicuous a small mistake can feel, and how survivable.",
    "family": [
      {
        "id": "kamala_arul",
        "label": "Biological child of"
      },
      {
        "id": "priya",
        "label": "Biological sibling of"
      },
      {
        "id": "dara_arul",
        "label": "Biological aunt/uncle of"
      }
    ],
    "culturalBackground": "South Asian; Sri Lankan Tamil family background within Pelagia’s longstanding harbor community.",
    "voice": "An ordered account of dates and options, interrupted by a dry comment when he relaxes. He can sound as though a family call has an agenda even when he wanted closeness.",
    "needs": "Competence, trustworthy agreements and a retirement that feels lived rather than merely accounted for. He wants to enjoy a beginner’s pleasure without reliability becoming his entire family role.",
    "stress": "Explains why the error occurred, becomes quiet after a correction or negotiates a visit repeatedly. Control of logistics can stand in for naming that he misses someone.",
    "homeFit": {
      "basis": "continued_home",
      "fit": "Work, family and pleasure in the harbor explain his continuing Pelagian home. Dance offers a new experience without requiring him to leave the place to become interesting.",
      "friction": "Ferry schedules encourage the planning habits he already overuses. Interest in travel can turn into another perfect itinerary unless he leaves room for an ordinary surprise."
    },
    "profileKind": "adult"
  },
  {
    "id": "ravi_desai",
    "name": "Ravi Desai",
    "age": 47,
    "region": "pelagia",
    "hometown": "Pelagia",
    "role": "Ferry freight broker & amateur astronomy enthusiast",
    "intro": "Ravi is good at finding a spare space on a crowded ferry and a hopeful angle in a difficult week. At home, optimism works best when it comes with a dependable time.",
    "family": [
      {
        "id": "nila_desai",
        "label": "Biological parent of"
      },
      {
        "id": "pelagia_mara",
        "label": "Spouse of"
      },
      {
        "id": "lin",
        "label": "Stepparent of"
      }
    ],
    "culturalBackground": "South Asian; Gujarati-family background within Pelagia’s island-port community.",
    "voice": "Quick alternatives, confident estimates and a vivid picture of how good the plan could be. An unadorned admission is rarer and more revealing than another eloquent reassurance.",
    "needs": "Room to maneuver, a sense of competence and family warmth that is not always deferred to the next easier week. He wants quieter pleasure as well as the stimulation of a deal.",
    "stress": "Makes a larger promise, buys a conciliatory gift or takes another call to recover control. These responses can leave the original missed conversation untouched.",
    "homeFit": {
      "basis": "continued_home",
      "fit": "Pelagian upbringing and his chosen adult household keep him near work and people he values. Harbor trade suits his appetite for negotiation; the sky offers a quieter fascination.",
      "friction": "Constant work access makes stopping difficult. Monsoon cloud can spoil the viewing he imagined, testing whether he can still enjoy company without delivering a spectacle."
    },
    "profileKind": "adult"
  },
  {
    "id": "nila_desai",
    "name": "Nila Desai",
    "age": 19,
    "region": "pelagia",
    "hometown": "Pelagia",
    "role": "Boat-ticket clerk & aspiring documentary editor",
    "intro": "Nila sells boat tickets while saving for an editing course. She wants to make films with a point of view of her own, including when that view unsettles somebody she loves.",
    "family": [
      {
        "id": "ravi_desai",
        "label": "Biological child of"
      },
      {
        "id": "pelagia_mara",
        "label": "Stepchild of"
      },
      {
        "id": "lin",
        "label": "Stepsibling of"
      }
    ],
    "culturalBackground": "Mixed South Asian Gujarati-family ancestry through Ravi and Black Afro-Pelagian East African coastal ancestry through her mother.",
    "voice": "Precise, skeptical sentences and questions about the framing. She can hear an assumption in a compliment and answer it sharply; private enthusiasm becomes more expansive around an interesting edit.",
    "needs": "Independence, a paid path into editing and family attachment that does not require choosing sides. She wants to be nineteen on her own terms as well as somebody’s daughter.",
    "stress": "Defends a cut too quickly, turns a family request into a broader argument or withdraws until the pressure drops. A specific criticism is more useful than praise followed by a hidden demand.",
    "homeFit": {
      "basis": "continued_home",
      "fit": "She was raised in Pelagia and has not decided whether study will take her elsewhere. Harbor voices nourish the work she wants to make, while paid shifts support the next step.",
      "friction": "Everyone recognizing Ravi can make the town feel too small. The same family closeness that matters to her can turn visits into a test of loyalty."
    },
    "profileKind": "adult"
  },
  {
    "id": "safia_odhiambo",
    "name": "Safia Odhiambo",
    "age": 73,
    "region": "pelagia",
    "hometown": "Pelagia",
    "role": "Retired ferry provisions buyer & lively amateur debater",
    "intro": "Safia enjoys a strong argument and an audience capable of answering back. Years of buying ferry provisions gave her a confident bargaining voice; retirement has widened its uses.",
    "family": [
      {
        "id": "sefu",
        "label": "Biological parent of"
      },
      {
        "id": "amir_odhiambo",
        "label": "Biological grandparent of"
      }
    ],
    "culturalBackground": "Black Afro-Pelagian; East African coastal ancestry in a longstanding Nacre harbor family.",
    "voice": "Fast challenges, comic comparisons and a question that exposes an inconsistency. Her quieter, caring voice becomes visible when she resists adding the next clever line.",
    "needs": "Lively independent friendships, intellectual play and the feeling that her voice still matters beyond family. She wants a genuinely open discussion, even when she is tempted to win it.",
    "stress": "Doubles down on a joke, offers unsolicited advice or claims people have become too serious. That defense can shut the very conversation she meant to open.",
    "homeFit": {
      "basis": "continued_home",
      "fit": "Busy Pelagian public life is a chosen continuing pleasure. Harbor rounds and a discussion club let her friendships extend beyond the schedules of Sefu and Amir.",
      "friction": "Heavy rains interrupt social routes, and close community familiarity can make her assume a joke is welcome. An open debate still needs someone to do the minutes."
    },
    "profileKind": "adult"
  },
  {
    "id": "amir_odhiambo",
    "name": "Amir Odhiambo",
    "age": 16,
    "region": "pelagia",
    "hometown": "Pelagia",
    "role": "Student & bedroom music producer",
    "intro": "Amir builds tracks from keyboard sounds, imagined rhythms and the rain on Pelagia’s roofs. Finishing one with a friend is proving harder than perfecting a few seconds alone.",
    "family": [
      {
        "id": "sefu",
        "label": "Biological child of"
      },
      {
        "id": "safia_odhiambo",
        "label": "Biological grandchild of"
      }
    ],
    "culturalBackground": "Black Afro-Pelagian; East African coastal family roots through both biological parents, shared with Sefu and Safia.",
    "voice": "Short judgments about a sound, an occasional dry remark and more precise language once someone asks what he hears. Avoid making every answer either sullen or improbably self-aware.",
    "needs": "Creative ownership, respectful privacy and a friendship that can survive different tastes. He needs room for school, rest and ordinary fun as well as a track he wants to finish.",
    "stress": "Stops playback, dismisses the draft or says nobody gets it. A quieter return to one section is more useful than an unasked family concert to build his confidence.",
    "homeFit": {
      "basis": "family_context",
      "fit": "Pelagia is his family home, with roof sounds and rain that interest him. Curiosity about other music scenes can coexist with attachment to familiar places.",
      "friction": "Neighboring homes need reasonable practice times. Family attention can make a private hobby feel public, while Sefu’s dance learning is both embarrassing and quietly admirable."
    },
    "profileKind": "adolescent"
  },
  {
    "id": "lata_rao",
    "name": "Lata Rao",
    "age": 42,
    "region": "pelagia",
    "hometown": "Pelagia",
    "role": "Inland delivery-route owner & recreational tennis player",
    "intro": "Lata’s delivery route runs beyond the postcard harbor into Pelagia’s scattered inland homes. She knows the work in distances, fuel bills and people who are pleased to see a parcel.",
    "family": [
      {
        "id": "pelagia_esme",
        "label": "Biological child of"
      }
    ],
    "culturalBackground": "South Asian; Telugu-family ancestry within Esme’s longstanding Pelagian harbor family.",
    "voice": "Specific distances, costs and a short verdict. Private affection appears in a remembered detail or practical act, often followed by a brisk change of subject.",
    "needs": "Independence, accurately valued work and permission to love her mother without inheriting the archive. She wants Pelagia’s inland lives to matter as much as its harbor views.",
    "stress": "Presses for the decision, judges too early or turns a softer question into logistics. A familiar route can calm her more effectively than a long abstract discussion.",
    "homeFit": {
      "basis": "continued_home",
      "fit": "She deliberately made her adult life in Pelagia. Rural routes and familiar homes are central attractions, not scenery beyond the more celebrated waterfront.",
      "friction": "Fuel bills, distance and weekend requests test her wish for a sustainable route. Family pride in the archive can turn into an assumed inheritance of labor or papers."
    },
    "profileKind": "adult"
  },
  {
    "id": "rosa_moreno",
    "name": "Rosa Moreno",
    "age": 86,
    "region": "embermesa",
    "hometown": "Ember Mesa",
    "role": "Retired market trader & radio-sports listener",
    "intro": "Rosa follows radio sports with a trader’s ear for a bad bargain and a spectator’s freedom to complain. She wants visits that leave time for a match, a story and her own opinions.",
    "family": [
      {
        "id": "mesa_june",
        "label": "Biological parent of"
      },
      {
        "id": "mateo_moreno",
        "label": "Biological grandparent of"
      }
    ],
    "culturalBackground": "Latina; Mexican-family ancestry within Caldera’s longstanding rural households.",
    "voice": "Plain preferences, emphatic sports verdicts and an indignant laugh. A question about what she wants receives a livelier answer than a speech about what would be good for her.",
    "needs": "Something enjoyable to anticipate, direct conversation and continued say over the objects and routines of her own home. She wants family visits to contain pleasure as well as practical arrangements.",
    "stress": "Rejects the whole suggestion when one part feels controlling. A relative can mistake that sharp refusal for refusing company rather than refusing an inspection.",
    "homeFit": {
      "basis": "continued_home",
      "fit": "Her lifelong outlying Caldera home is familiar comfort she wants to keep. The station-side gathering provides company and sport without making rural life merely a problem to solve.",
      "friction": "Heat and distance require planned transport and suitable rests. Familiar family concern can turn visits into supervision unless her own reason for the outing stays central."
    },
    "profileKind": "adult"
  },
  {
    "id": "mateo_moreno",
    "name": "Mateo Moreno",
    "age": 35,
    "region": "embermesa",
    "hometown": "Ember Mesa",
    "role": "Solar-panel installer & amateur horror writer",
    "intro": "Mateo installs solar panels across Ember Mesa and writes unsettling stories when the working day is over. He would like one of those stories to earn its own place in the world.",
    "family": [
      {
        "id": "mesa_june",
        "label": "Biological child of"
      },
      {
        "id": "rosa_moreno",
        "label": "Biological grandchild of"
      }
    ],
    "culturalBackground": "Latino; Mexican-family Caldera ancestry through both biological parents, shared with June and Rosa.",
    "voice": "Concrete practical speech at work, then an unexpectedly vivid image when a story catches him. He can debate a fictional character more easily than admit that a rejection hurt.",
    "needs": "Room for purposeless imagination, fairly valued work and a creative attempt that does not have to justify itself to the town. He wants to finish without making acceptance the only reason to write.",
    "stress": "Goes quiet about disappointment, argues around one scene or accepts a small favor to avoid a harder negotiation. Restlessness can send him away from the desk just before useful revision.",
    "homeFit": {
      "basis": "chosen",
      "fit": "He explicitly returned after training elsewhere because open space and independent work suit him. The rural landscape supplies atmosphere without requiring every story to explain it.",
      "friction": "Distant jobs cost real time and fuel; infrequent buses and familiar neighbors can make city anonymity attractive. The practical-skills culture may ask what his horror story is for."
    },
    "profileKind": "adult"
  },
  {
    "id": "esperanza_vega",
    "name": "Esperanza Vega",
    "age": 41,
    "region": "embermesa",
    "hometown": "Ember Mesa",
    "role": "Mobile grocer & practical-joke enthusiast",
    "intro": "Esperanza’s grocery van brings supplies and conversation to Ember Mesa’s outlying homes. Her enthusiasm fills a route quickly; keeping the accounts and her own evenings clear takes more effort.",
    "family": [
      {
        "id": "mesa_inez",
        "label": "Biological child of"
      },
      {
        "id": "luz_vega",
        "label": "Biological parent of"
      }
    ],
    "culturalBackground": "Latina; Mexican-family ancestry shared with Inez and Luz in Caldera.",
    "voice": "Quick greetings, playful exaggeration and a grin that sometimes arrives before she checks the audience. A plain apology lands better than trying to repair every mistake with another joke.",
    "needs": "A viable independent business, enjoyable company and time that is not another buying trip or inherited responsibility. She wants home to hold her interests and Luz’s without either taking all the space.",
    "stress": "Accepts one more stop, misplaces paperwork or makes an ill-timed joke to lift the mood. She can get louder when what she actually needs is the quiet after the route.",
    "homeFit": {
      "basis": "continued_home",
      "fit": "She grew up in Ember Mesa and chose to stay. Dispersed homes provide the van’s purpose, while the silence between or after stops offers something different from sociable service.",
      "friction": "Distance creates both income and exhaustion. Local assumptions about succeeding Inez can erase the independent business she is trying to sustain."
    },
    "profileKind": "adult"
  },
  {
    "id": "luz_vega",
    "name": "Luz Vega",
    "age": 13,
    "region": "embermesa",
    "hometown": "Ember Mesa",
    "role": "Student & amateur star-chart maker",
    "intro": "Luz sketches constellations, invents names and leaves several versions of the same chart unfinished. The mesa’s dark sky is familiar; deciding which projects to show other people is still new.",
    "family": [
      {
        "id": "esperanza_vega",
        "label": "Biological child of"
      },
      {
        "id": "mesa_inez",
        "label": "Biological grandchild of"
      }
    ],
    "culturalBackground": "Latino; Mexican-family ancestry through both biological parents, raised in Ember Mesa.",
    "voice": "A precise observation followed by an invented name, sometimes delivered with dry humor. They may answer a public compliment with very little and explain at length later to a friend.",
    "needs": "Privacy for unfinished work, friendship that can be silly and the freedom to enjoy a quiet hobby without becoming a family symbol. They still need ordinary adult care and reminders.",
    "stress": "Rolls the chart away, becomes abrupt or insists a name was only a joke. A private question and time to answer work better than making their embarrassment another public event.",
    "homeFit": {
      "basis": "family_context",
      "fit": "Ember Mesa is their family home with Esperanza. Dark skies offer real enjoyment, while school friends and private projects matter as much as the region’s practical identity.",
      "friction": "Long distances can be boring, and nighttime interests require adult planning. Familiar neighbors can make unwanted praise or a parent’s joke feel difficult to escape."
    },
    "profileKind": "adolescent"
  },
  {
    "id": "nell_harper",
    "name": "Nell Harper",
    "age": 25,
    "region": "traveler",
    "hometown": "Alder Quay; currently traveling",
    "role": "Traveling acoustic-survey technician & amateur drummer",
    "intro": "Nell travels on short acoustic-survey contracts, keeping careful equipment records and less careful social plans. She is working out whether movement can coexist with a band, a home base and ordinary closeness.",
    "family": [
      {
        "id": "oliver_harper",
        "label": "Biological child of"
      },
      {
        "id": "ruth_harper",
        "label": "Biological grandchild of"
      },
      {
        "id": "alder_tess",
        "label": "Biological nibling of"
      },
      {
        "id": "nico",
        "label": "Biological cousin of"
      }
    ],
    "culturalBackground": "White European-background Bellweather ancestry through both biological parents; raised in Alder Quay and traveling by choice.",
    "voice": "Direct questions, quick practical observations and an invitation to try something now. She can sound breezily finished with a subject that remains unresolved for the other person.",
    "needs": "Freedom supported by earned income, musical connection and a home decision she can make for herself. Family attachment matters without requiring a running commentary on her location.",
    "stress": "Leaves correspondence unanswered or physically moves on after an argument. A fresh place can reduce the discomfort without correcting the missed conversation.",
    "homeFit": {
      "basis": "mobile",
      "fit": "Raised in Alder, she deliberately travels on short survey contracts and has not chosen a future home base. Work and drumming offer distinct reasons to enter ferry and railway towns.",
      "friction": "A changing route makes a regular band difficult and leaves routine messages easy to postpone. Family concern can become an expectation of a live itinerary she has not agreed to provide."
    },
    "profileKind": "adult"
  }
];
export const canonicalCharacterById:Readonly<Record<string,CanonicalCharacter>>=Object.fromEntries(canonicalCharacters.map(c=>[c.id,c]));
const residenceNames:Record<string,string>={alder:'Alder Quay',saffron:'Saffron Reach',glasssteppe:'Glasssteppe',pelagia:'Pelagia',embermesa:'Ember Mesa'};
function familyResidenceFact(person:CanonicalCharacter,other:CanonicalCharacter){
 if(person.region===other.region)return '';
 const home=(c:CanonicalCharacter)=>c.region==='traveler'?`${c.name} travels between regions`:`${c.name} lives in ${residenceNames[c.region]}`;
 return ` ${home(person)}; ${home(other)}.`;
}
export function canonicalIdentity(id:string){
 const c=canonicalCharacterById[id];if(!c)return null;
 return{age:c.age,family:c.family.map(link=>({otherId:link.id,relationship:link.label.replace(/ of$/,''),otherRelationship:canonicalCharacterById[link.id]?.family.find(f=>f.id===id)?.label.replace(/ of$/,'')??'',fact:`${c.name} is ${canonicalCharacterById[link.id]?.name??link.id}’s ${link.label.replace(/ of$/,'').toLowerCase()}.${familyResidenceFact(c,canonicalCharacterById[link.id])}`}))};
}
/** Family time changes only the current public meeting, never a stored receipt. */
export function canonicalFamilyVenue(round:number,id:string):string|null{
 if(id==='alder_tess'&&round%2===0)return 'CORNER CAFÉ';
 if(id==='pelagia_mara'&&round%2===1)return 'COMMUNITY';
 return null;
}

/** Latest regional setting direction. Presentation only; climate rules and stored
 * weather events are owned by their versioned engine and are not retconned. */
export const canonicalRegionSetting:Record<string,{subtitle:string;description:string}>={
 alder:{subtitle:'A cool, rainwashed quay community',description:'A cool, wet urban quay of close brick terraces, ferries and shared courtyards. Libraries, pantry gardens and neighborhood rooms fit between ordinary working streets.'},
 saffron:{subtitle:'Low-rise courtyards, arts and conversation',description:'A Mediterranean low-rise suburb of ochre homes, shaded courtyards and local canals. Warm dry summers and mild wetter winters shape its outdoor film evenings, small workshops and social spaces.'},
 glasssteppe:{subtitle:'A cold rail city of learning and making',description:'A cold highland rail city built into stone terraces and switchbacks. Copper workshops, classrooms and sheltered reading gardens connect academic life and practical making around the stations.'},
 pelagia:{subtitle:'A warm monsoon harbor and its growing country',description:'A warm monsoon harbor surrounded by rural growing areas. Domes, raised homes, tidal gates and planted waterways connect everyday ecology with engineering; heavy seasonal rain is part of life beside the water.'},
 embermesa:{subtitle:'Rural mesa routes, practical craft and open sky',description:'An arid rural mesa settlement with long open routes, shaded porches and small practical workshops. Sparse planting, dry heat and cooler nights shape outdoor time, repair work and shared water-wise growing.'},
};
