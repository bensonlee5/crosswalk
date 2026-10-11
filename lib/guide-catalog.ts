/** Generated from the current Travel Guide. Edit the authoring JSON and run
 * node scripts/build-game-canon.mjs. Do not edit this adapter by hand. */
/** Associations describe the guide's world; they do not establish current
 * presence, inventory, ownership transfers, or completed story events. */
export type GuideAssociation={id:string;relationship:string};
export type GuideVenue={id:string;regionId:string;regionName:string;placeId:string;name:string;function:string;summary:string;history:string;architecture:string;climateNotes:string;civicLife:string;people:GuideAssociation[]};
export type GuideOwnership={ownerIds?:string[];ownerLabel?:string;keeperIds?:string[];borrowerIds?:string[];makerIds?:string[];makerLabel?:string;adultCareIds?:string[];currentCustody?:string;contentsOwnership?:string};
export type GuideItem={id:string;name:string;kind:string;summary:string;description:string[];history:string[];regionIds:string[];people:GuideAssociation[];venueIds:string[];storyStatus:string;gameStatus:string;ownership:GuideOwnership;brandId?:string;brandIds?:string[];brand?:string;brandRole?:string;image?:{src:string;alt:string;type:string};storyNote?:string;placeNote?:string};
export type GuideBrand={id:string;name:string;category:string;summary:string;identity:string;pricePosition:string;quality:string;history:string[];description:string[];itemIds:string[];regionIds:string[];fictional:boolean};
export const guideVenues:GuideVenue[]=[
  {
    "id": "alder-apartments",
    "regionId": "alder",
    "regionName": "Alder Quay",
    "placeId": "APARTMENTS",
    "name": "Rainwell Court",
    "function": "Housing and home life",
    "summary": "Rainwell Court puts private domestic life inside Alder’s compact working streets. A modest kitchen, a window plant and a room that can be reset matter as much here as the view of the river.",
    "history": "The building belongs to the quay’s tradition of adjoining brick homes rather than a separate residential estate. Successive small alterations have made room for different households: a divided landing, a repaired cupboard, a table carried carefully upstairs. Its history is the accumulation of ordinary tenancies, not the claim that every named neighbor lives behind the same door.",
    "architecture": "Rain-dark masonry and gabled roofs continue the street wall. Deep window reveals make sheltered ledges; a narrow shared entrance opens into a quieter interior, where coats and muddy shoes can be left before reaching the living space. Rooms feel compact without being described as identical.",
    "climateNotes": "A porch catches the first rain from arriving coats. Ventilated storage and places to dry cloth are practical responses to the wet maritime air; mild summer evenings can bring an open window.",
    "civicLife": "A potluck begins as an invitation into someone’s own space. The surrounding port is sociable, but a closed door also makes room for rest, music and a meal without an audience.",
    "people": []
  },
  {
    "id": "alder-work",
    "regionId": "alder",
    "regionName": "Alder Quay",
    "placeId": "WORK",
    "name": "Clockhouse Workrooms",
    "function": "Career and regional work",
    "summary": "Clockhouse Workrooms is Alder’s address for the paid work that keeps a life going. Its close-set rooms belong to a port where administration, practical tasks and ferry timing overlap.",
    "history": "The clockhouse is one of the quay’s established landmarks. The workrooms grew around its dependable timekeeping: a former tally room gains shared desks, while a service bay keeps its broad doors. The older purpose remains legible without assigning the player a particular port trade or changing their chosen career.",
    "architecture": "A solid brick front faces the compact street grid. Tall workshop windows light long surfaces; a gabled service wing sits beside smaller office rooms. The contrast between an open bench and a quiet desk suits several kinds of work under the same local name.",
    "climateNotes": "Covered approaches limit exposure during a rainy change of shift. Matting, coat hooks and protected paper storage keep river damp from becoming the organizing principle of the whole room.",
    "civicLife": "Tess’s regional lunch-round work links the café, crew orders and dispatch timetable here. A useful shift has agreed limits and a finish; nobody’s ability to organize a busy room makes them permanently available.",
    "people": [
      {
        "id": "alder_tess",
        "relationship": "Regional-work contact for coordinating the ferry lunch round; café owner and ferry dispatcher, not the stated owner of these workrooms."
      }
    ]
  },
  {
    "id": "alder-campus",
    "regionId": "alder",
    "regionName": "Alder Quay",
    "placeId": "CAMPUS",
    "name": "Bellweather College",
    "function": "Courses and peer learning",
    "summary": "Bellweather College is a small urban learning address, fitted into the quay rather than placed beyond it. A class can sit between paid work, an errand and the trip home.",
    "history": "Its history is one of adaptation: practical teaching takes over rooms with good daylight, shared tables replace isolated desks, and old workshop proportions remain useful for new subjects. The college is not given a grand founding legend. Its importance comes from letting adults return to learning without pretending they have left the rest of life behind.",
    "architecture": "A broad brick teaching block has the gabled silhouette of neighboring work buildings. Higher windows hold the light over project tables, while smaller side rooms allow a tutorial or a quiet explanation. The doorway faces the public street rather than an enclosed ceremonial campus.",
    "climateNotes": "Deep sills and a covered threshold provide a place to shake off drizzle before opening a notebook. Winter afternoons call for warm interior light; summer study is shaped by Alder’s generally mild air.",
    "civicLife": "Peer study shares both materials and uncertainty. Tutors bring knowledge earned elsewhere, and learners can ask basic questions without a public performance.",
    "people": []
  },
  {
    "id": "alder-career-hub",
    "regionId": "alder",
    "regionName": "Alder Quay",
    "placeId": "CAREER HUB",
    "name": "The Next Landing",
    "function": "Career progression and referrals",
    "summary": "The Next Landing is a compact place for turning experience into a next step. It gathers applications, portfolio work and introductions within the same neighborhood that supplies the everyday jobs.",
    "history": "It began as a desk people could find without entering a large administrative building. Its rooms expanded around that simple need: somewhere to lay out a project, check an application, and speak without a queue listening. The modest name remains even after the desk needs more than one room.",
    "architecture": "A side-facing brick frontage distinguishes it from the larger workrooms. A glazed entrance gives onto a waiting alcove and several small interview spaces; a long shared surface can hold a portfolio without taking over a corridor. Notices are close to the door rather than hidden upstairs.",
    "climateNotes": "The entrance recess offers cover from river rain. A draught lobby and places for wet umbrellas keep papers and conversations away from the worst of the weather.",
    "civicLife": "The desk links personal ambition with a dense network of ordinary workplaces. A meetup can produce a useful introduction, but a conversation is not itself a job offer. Its history leaves room for people returning, changing direction or deciding to keep their present role.",
    "people": []
  },
  {
    "id": "alder-corner-cafe",
    "regionId": "alder",
    "regionName": "Alder Quay",
    "placeId": "CORNER CAFÉ",
    "name": "Ferry Corner Café",
    "function": "Coffee, food and company",
    "summary": "Ferry Corner Café is Tess’s working counter and one of the quay’s familiar pauses. The ferry bell, remembered coffee orders and a chalkboard near the window give it a rhythm of its own.",
    "history": "Tess took over a café whose afternoons were already measured by crossings. During a difficult wet winter, ferry crew members bought lunches in advance, helping it remain open through many small acts of support. That history belongs to a business and its neighbors, not to a claim that Tess can meet every request herself.",
    "architecture": "The brick corner turns a narrow street into a view toward the public quay. Warm glazing, closely set tables and a deep window seat make a room for a solitary cup as well as company. The counter is practical, with the chalkboard visible before an order is placed.",
    "climateNotes": "A sheltered doorway, covered seats and room for damp coats soften the wet coastal weather. Passing sun lights the window without changing the café into a permanently outdoor venue.",
    "civicLife": "Mina’s songs and Bram’s route papers can enter the room without taking it over. Nico’s family table is a visit with Tess nearby. For the traveler, that mix of quiet attention and practical comings-and-goings is the café’s charm; there is room to sit without becoming part of every conversation.",
    "people": [
      {
        "id": "alder_tess",
        "relationship": "Confirmed café owner and ferry dispatcher."
      },
      {
        "id": "mina",
        "relationship": "Songwriter with café story scenes; not identified as its owner."
      },
      {
        "id": "bram",
        "relationship": "Recurring café visitor and mapmaking conversation contact."
      },
      {
        "id": "nico",
        "relationship": "Child visiting a family table with Tess nearby on scheduled family months."
      }
    ]
  },
  {
    "id": "alder-community",
    "regionId": "alder",
    "regionName": "Alder Quay",
    "placeId": "COMMUNITY",
    "name": "Common Table Hall",
    "function": "Pantry, volunteering and neighborhood projects",
    "summary": "Common Table Hall makes room for pantry work, practical workshops and gatherings that need more chairs than someone’s kitchen. It is a public room within the dense neighborhood, not a grand civic monument.",
    "history": "The quay’s history of shared suppers and small contributions gives this room its purpose. Eli’s useful herb harvest belonged to that wider pantry life; other residents bring time, skills or company. Furniture is repaired and rearranged as needs change, with an old table remaining useful long after the activity around it has changed.",
    "architecture": "A wide brick doorway leads to a rectangular hall with a clear central floor. Folded tables sit along one wall; a serving counter and dry store take the working end. Noticeboards and family corners occupy the edges rather than forcing every gathering into one arrangement.",
    "climateNotes": "A roofed loading recess keeps donation boxes out of rain. Washable entrance surfaces and high windows make the room practical in wet months without turning the building into an emergency claim.",
    "civicLife": "Celia sometimes brings painting and dominoes for her own enjoyment. Oren, Hugo and Priya also appear here on their schedules. Their presence makes a shared place richer without making them an unlimited volunteer workforce.",
    "people": [
      {
        "id": "celia_baptiste",
        "relationship": "Scheduled visitor with a painting and dominoes; not assigned pantry work."
      },
      {
        "id": "oren",
        "relationship": "Recurring community-room visitor and miniature-theatre maker."
      },
      {
        "id": "hugo",
        "relationship": "Recurring visitor whose bread knowledge can be discussed here."
      },
      {
        "id": "priya",
        "relationship": "Recurring visitor and retired weather observer."
      },
      {
        "id": "eli",
        "relationship": "Pantry neighbor whose shared story may use community space."
      }
    ]
  },
  {
    "id": "alder-park",
    "regionId": "alder",
    "regionName": "Alder Quay",
    "placeId": "THE PARK",
    "name": "Willow Park",
    "function": "Outdoor rest and recreation",
    "summary": "Willow Park is a pause in the close-built quay. Its trees and small public seats serve people with a spare hour as readily as those setting out for a longer walk.",
    "history": "Gardens occupy gaps and courtyards throughout Alder; this park gives that greenery a public address. Its history follows a pocket of ground kept open while the working streets grew around it. The planted edges, worn paths and repaired seats suggest repeated local use rather than a landscape made only to be admired from a distance.",
    "architecture": "A low boundary lets the park remain visible from the street. Willow branches soften the brick backdrop, and a loop of paths passes open sitting places and quieter corners. The layout offers a distinct outdoor room without implying that the painted scene is an exact surveyed plan.",
    "climateNotes": "Rain collects in leaf tips and darkens the paving before the streets dry. Draining paths and sheltered edges matter in the maritime climate; a bright break can change the whole character of an afternoon.",
    "civicLife": "Bram checks the usefulness of routes and resting places, while Priya enjoys noticing weather without producing another report. Their interests give the park texture, but visitors can also run, read or simply stop without undertaking a project.",
    "people": [
      {
        "id": "bram",
        "relationship": "Recurring park visitor who checks night-walk routes and places to sit."
      },
      {
        "id": "priya",
        "relationship": "Recurring park visitor; retired weather observer with an interest in rain."
      }
    ]
  },
  {
    "id": "alder-library",
    "regionId": "alder",
    "regionName": "Alder Quay",
    "placeId": "LIBRARY",
    "name": "Brickhouse Library",
    "function": "Reading, learning and archives",
    "summary": "Brickhouse Library connects reading with the small practical exchanges of the quay. Rowan’s returns trolley and bicycle basket make books and growing things familiar neighbors here.",
    "history": "Rowan’s seed swap began beside the library returns trolley. The gardening club grew partly from wanting company, and knowledge accumulated through trying things together. That modest origin matters more than an impressive opening ceremony: lending and learning can start at the scale somebody can maintain. Later tool-loan programs belong to the evolving game rather than being assumed from the first visit.",
    "architecture": "A substantial brick room holds shelves against sheltered walls and reading tables near taller windows. The returns area has space for a small display without blocking the reading room. Low lamps and visible handwritten labels make the interior feel used rather than staged.",
    "climateNotes": "Weatherproof returns storage, an inner coat space and paper kept back from draughty windows answer the persistent damp. On a cold afternoon, the interior offers a different kind of quiet from the exposed river.",
    "civicLife": "Rowan is a librarian with interests of their own, as well as a volunteer gardener. Their curiosity connects a written explanation with something a neighbor can try. The room also suits Priya’s careful weather observations, with space for someone to read quietly instead of producing another report.",
    "people": [
      {
        "id": "alder_rowan",
        "relationship": "Confirmed librarian; also a volunteer gardener."
      },
      {
        "id": "priya",
        "relationship": "Authored library association for a retired weather observer. Her current local encounters use the park or community room."
      }
    ]
  },
  {
    "id": "alder-market",
    "regionId": "alder",
    "regionName": "Alder Quay",
    "placeId": "MARKET",
    "name": "Ferry Bell Market",
    "function": "Food, stalls and casual work",
    "summary": "Ferry Bell Market gathers food, casual work and secondhand selling around Alder’s working-day appetite. Its name belongs to the flow of people and supplies through the quay, not to a single stallholder.",
    "history": "Covered stalls grew beside the routines of ferry crews: provisions before a crossing, a cooked meal between shifts, and produce brought in from the neighborhood’s small growing spaces. Tess’s advance-order counter is a later regional program with an actual game condition, so the base market’s history leaves its arrival in the future.",
    "architecture": "A brick-edged market hall breaks into narrow bays under one practical roof. Serving counters face a shared aisle; a side court can hold temporary tables when the weather allows. Goods sit above the floor, and glazed roof strips put useful light onto working surfaces.",
    "climateNotes": "Awnings overlap enough to keep the main stall fronts sheltered during showers. The court remains open to the sea air, so stall cloths, dry stores and a quick way to cover produce are everyday necessities.",
    "civicLife": "Hugo’s breadmaking gives him a practical connection to the market’s food culture, while Tess’s later lunch-round program links meals with ferry work. A visitor can learn to cook, enjoy a market lunch or take on paid stall work. These are different ways of spending time in the same busy room.",
    "people": [
      {
        "id": "hugo",
        "relationship": "Authored market association for an early-shift baker. His current local encounters use the café or community room."
      },
      {
        "id": "alder_tess",
        "relationship": "Associated with the later ferry lunch pre-order program."
      }
    ]
  },
  {
    "id": "alder-fitness",
    "regionId": "alder",
    "regionName": "Alder Quay",
    "placeId": "FITNESS",
    "name": "Second Wind Studio",
    "function": "Movement and recovery",
    "summary": "Second Wind Studio is a compact indoor place for movement and recovery among the port’s working streets. A gentle class and an energetic session can belong under the same roof.",
    "history": "The studio occupies a reused practical room rather than a destination resort. Broad floor space once valuable for moving materials becomes valuable for mats and equipment. Small changes make the new purpose legible: a quiet reception area, a place to leave coats, and storage that clears the floor between sessions.",
    "architecture": "Brick outer walls and tall, plain windows retain the proportions of a quay workshop. Inside, the main floor remains visually simple, with equipment placed around the edges and a separate recovery space. The design lets activity change without making the entire building feel like a machine.",
    "climateNotes": "Indoor shelter matters during Alder’s long wet spells. A lobby catches rain from clothing before it reaches the exercise floor; high-level ventilation keeps a busy room comfortable when the coastal summer is mild.",
    "civicLife": "The studio is one alternative to the park, especially when someone wants structure or a warm interior. Desk work, a class and recovery are different uses with different costs.",
    "people": []
  },
  {
    "id": "alder-makerspace",
    "regionId": "alder",
    "regionName": "Alder Quay",
    "placeId": "MAKERSPACE",
    "name": "Foundry Makerspace",
    "function": "Repair, making and craft",
    "summary": "Foundry Makerspace is the quay’s address for useful repair and work done by hand. Its benches belong to people making decisions about materials, credit and what a job can reasonably ask of them.",
    "history": "Jo learned by keeping well-used neighborhood things working. Labeled offcuts, useful tools and an inherited broken sign tie their story to repair rather than novelty for its own sake. An old foundry shell has been adapted to smaller, cleaner everyday work, leaving the heavy outline while changing what happens inside.",
    "architecture": "A tall gabled roof spans shared benches and a deeper service bay. Copper scraps, timber pieces and labeled storage give each working surface a purpose; a clear aisle separates visitors from active tasks. Broad windows bring light onto a joint or a written instruction.",
    "climateNotes": "Rain is kept off tools at the entrance and damp materials have somewhere to dry. The large brick enclosure is sheltered, but the coastal air still makes careful storage and ordinary maintenance necessary.",
    "civicLife": "Jo’s repair work and Oren’s miniature making need different scales of attention. Both make the workshop’s materials feel particular: a useful copper scrap for one task, a piece of tiny scenery for another. Clearing a bench for company should still leave its maker a say over the work and its finish.",
    "people": [
      {
        "id": "jo",
        "relationship": "Confirmed repairer and maker associated with this bench and the shared story; ownership is not specified."
      },
      {
        "id": "oren",
        "relationship": "Authored makerspace association for a coat mender and miniature-theatre maker. His current local encounters use the café or community room."
      }
    ]
  },
  {
    "id": "alder-cinema",
    "regionId": "alder",
    "regionName": "Alder Quay",
    "placeId": "CINEMA",
    "name": "Lantern Cinema",
    "function": "Films and discussion",
    "summary": "Lantern Cinema offers a warm, enclosed evening within a town more often heard through ferry bells and rain. Films, discussion and casual usher work give this small venue several ordinary lives.",
    "history": "The name echoes the quay’s lantern-lit public traditions without claiming that the cinema founded the autumn walk. A modest screening room grew behind a street-front ticket counter, carrying traces of earlier seating arrangements and repaired fittings. The building earns its place by being used, not by hosting invented premieres.",
    "architecture": "A narrow brick entrance opens into a deeper auditorium. The roofline keeps the gabled language of surrounding workshops, while a small lit canopy and poster cases identify the public doorway. Inside, heavy curtains and staggered seats focus attention toward a single screen.",
    "climateNotes": "The foyer is a buffer between wet coats and the darker room. A covered queue can wait through a passing shower, and warm interior light is visible from the compact evening streets.",
    "civicLife": "An afternoon audience need not be the same group that stays to discuss a film. Some visitors want conversation; others want a quiet escape and home.",
    "people": []
  },
  {
    "id": "alder-transit",
    "regionId": "alder",
    "regionName": "Alder Quay",
    "placeId": "TRANSIT",
    "name": "Alder Ferry & Rail",
    "function": "Transport, travel and bicycle work",
    "summary": "Alder Ferry & Rail joins the quay’s local routines to the wider world. Timetables, parcels and bicycle work share space with people who simply need to reach the next part of their day.",
    "history": "Tess’s evening dispatch work links this place with the café counter. Bram knows that a route can look simple on paper and still fail when a gate is locked or a resting place is missing. Together these established histories make the station a place of usable information, without claiming either person runs every transport service.",
    "architecture": "A low brick hall and a broad covered apron face the public routes. Noticeboards sit where arrivals can stop without standing in a working doorway. A repair stand and parcel surface give practical tasks their own edge of the hall rather than treating travelers as workshop traffic.",
    "climateNotes": "Wind off the water and sudden rain make roof depth and sheltered waiting important. The hall offers a dry place to read a timetable before stepping out toward an exposed landing.",
    "civicLife": "Tess’s dispatch work and Bram’s attention to usable directions give the station a grounded human character. A well-marked rest stop can matter more than a pretty shortcut. Some meetings become conversations across a distance, with room at a map desk for an unhurried call.",
    "people": [
      {
        "id": "alder_tess",
        "relationship": "Confirmed evening ferry dispatcher."
      },
      {
        "id": "bram",
        "relationship": "Authored transit association for a night-bus cleaner and mapmaker. His current local encounters use the café or park."
      },
      {
        "id": "neri",
        "relationship": "Conditional story meeting or remote-call contact at transit desks, not station staff."
      }
    ]
  },
  {
    "id": "alder-garden",
    "regionId": "alder",
    "regionName": "Alder Quay",
    "placeId": "GARDEN",
    "name": "Willowbank Allotments",
    "function": "Growing, harvest and outdoor rest",
    "summary": "Willowbank Allotments fits food-growing into the narrow spaces of an urban quay. Small plots, containers and a greenhouse make the scale intimate enough that a single useful harvest can be recognized.",
    "history": "Eli began with borrowed containers and brought herbs to a supper assembled from small contributions. Rowan’s seed exchange and volunteer gardening provide another route into the allotments. These histories keep the place grounded in learning and repeated care, rather than describing a perfected garden that has never lost a seedling.",
    "architecture": "Beds and paths fill a gap between brick boundaries. The greenhouse makes a bright, enclosed working end, while water vessels and tool storage sit close to the growing area. A bench offers a place to pause that does not require standing among somebody else’s plants.",
    "climateNotes": "Good drainage is as important as water supply in Alder’s wet climate. Raised containers, clear paths and protection for tender plants let growers respond to chilly rain and brief bright spells without pretending every season is favorable.",
    "civicLife": "Eli’s pantry work and Rowan’s shared gardening rota intersect here. Shared suppers give the harvest a destination beyond the beds. Looking after the garden also means leaving room for its regulars to stop for the day.",
    "people": [
      {
        "id": "eli",
        "relationship": "Confirmed gardener and pantry neighbor associated with the allotments and shared story."
      },
      {
        "id": "alder_rowan",
        "relationship": "Confirmed volunteer gardener and seed-swap organizer."
      }
    ]
  },
  {
    "id": "alder-arcade",
    "regionId": "alder",
    "regionName": "Alder Quay",
    "placeId": "ARCADE",
    "name": "Clocktower Arcade",
    "function": "Games and social play",
    "summary": "Clocktower Arcade is an indoor place to play within the quay’s practical street network. A game table can occupy a whole evening without needing to justify itself as work, training or community service.",
    "history": "Its history borrows the neighborhood’s habit of keeping useful things in circulation: cabinets are repaired, chairs are replaced individually, and favorite games remain beside newer arrivals. The clocktower name gives it a local reference point, but the guide does not identify an actual tower room as an additional explorable floor.",
    "architecture": "A plain brick frontage opens into a long room with cabinets along the walls and larger shared tables farther back. Pockets of colored light sit against the warmer masonry. A staffed desk can see the entrance without making the social tables feel like a queue.",
    "climateNotes": "A recessed doorway and coat space keep the rainy street out of the playing area. On a mild evening, conversation can drift to the threshold; the main games remain an indoor shelter from coastal showers.",
    "civicLife": "Some visitors come alone to play a familiar favorite; others want a seat at a tabletop night. Hosting asks for people as well as a room. The arcade gives Alder’s community life a lighter corner, where sharing an evening can be enough without ending in a useful neighborhood project.",
    "people": []
  },
  {
    "id": "saffron-apartments",
    "regionId": "saffron",
    "regionName": "Saffron Reach",
    "placeId": "APARTMENTS",
    "name": "Three Arches Court",
    "function": "Housing and home life",
    "summary": "Three Arches Court gathers domestic life around open courts rather than one imposing frontage. It belongs to the spacious residential side of Saffron Reach, where a journey home leaves the market crowd behind before reaching familiar doors.",
    "history": "The housing grew in small clusters as dependable canal crossings allowed households to live farther from the busiest quay. Later additions followed the earlier courts instead of joining everything into a continuous block. Differences in plaster and paving mark those successive pieces of building.",
    "architecture": "Low ochre wings enclose shaded sitting edges and a brighter central patch. Recessed doorways, plain shutters and terracotta rooflines give individual homes a recognizable place within the shared arrangement. Garden walls leave intervals of sky between neighboring clusters.",
    "climateNotes": "Summer life moves toward the shaded side of each court as the day warms. Winter rain darkens the paving, while covered door recesses become more valuable than the broad sunny center.",
    "civicLife": "The shared courts carry the sound of meals and arriving visitors. A greeting can become a conversation, but closed shutters are equally ordinary. For a visitor, the apartments reveal the domestic pace behind Saffron’s busy public evenings.",
    "people": []
  },
  {
    "id": "saffron-work",
    "regionId": "saffron",
    "regionName": "Saffron Reach",
    "placeId": "WORK",
    "name": "Towpath Workrooms",
    "function": "Career and regional work",
    "summary": "Towpath Workrooms gives Saffron Reach a quieter working address between its residential courts and commercial waterway. Small rooms support the concentration, preparation and ordinary paperwork behind the district’s more visible meals, crossings and performances.",
    "history": "The earliest rooms served the clerical side of canal trade, when a delivery needed a legible list as much as a boat. Interior partitions were subsequently rearranged for different kinds of work, leaving broad original openings beside more private modern rooms.",
    "architecture": "A low, elongated building presents an arcade to the approach and working windows toward a narrow planted court. Deep reveals soften the light over desks. Plain walls, timber screens and carefully fitted shelves make the interior feel adaptable rather than ceremonial.",
    "climateNotes": "The shaded frontage moderates summer glare without removing the sense of daylight. During the wetter winter months, rain can be heard along the arcade while papers and equipment remain within the enclosed rooms.",
    "civicLife": "The workrooms reveal the district between its public occasions: a drawing under revision, a delayed delivery, an invoice being checked. Their subdued atmosphere makes a useful counterpart to the market’s bustle and the sociability of the evening courtyards.",
    "people": [
      {
        "id": "saffron_leila",
        "relationship": "Regional-work contact for the shared-oven market morning; market cook, not a stated owner of the workrooms."
      }
    ]
  },
  {
    "id": "saffron-campus",
    "regionId": "saffron",
    "regionName": "Saffron Reach",
    "placeId": "CAMPUS",
    "name": "Azulejo College",
    "function": "Courses and peer learning",
    "summary": "Azulejo College is Saffron Reach’s place for sustained learning within a district better known for its evenings. Its modest scale makes classrooms part of the neighborhood fabric, with lessons continuing beyond the hours kept by many nearby shops.",
    "history": "The college developed from teaching rooms around an existing arcade. As canal trades changed, its purpose widened from passing on familiar methods to explaining unfamiliar ones. Evening education has particular weight where work and study often overlap.",
    "architecture": "Classroom wings frame a court of pale paving and restrained planting. The arcade provides an intermediate space between the open neighborhood and enclosed rooms; simple notice surfaces and generous windows keep the building legible without monumental stairs or a grand institutional facade.",
    "climateNotes": "Shade makes the court usable through much of the warm season, although midday heat still settles on exposed stone. Mild winter rain shifts conversations toward the covered edges and changes the sound inside open doorways.",
    "civicLife": "For visitors interested in the knowledge behind a working town, the college adds depth to the canal scenery. Evening arrivals may already have a full working day behind them. Unfinished questions and the need to leave on time belong here alongside academic ambition.",
    "people": []
  },
  {
    "id": "saffron-career-hub",
    "regionId": "saffron",
    "regionName": "Saffron Reach",
    "placeId": "CAREER HUB",
    "name": "Next Crossing Careers",
    "function": "Career progression and referrals",
    "summary": "Next Crossing Careers is a small civic service point in a neighborhood whose livelihoods extend from the water to shops, studios and indoor work. Its name reflects that maritime economy without making it a boat terminal.",
    "history": "The desk grew out of a practical need to separate employment enquiries from the rush of dockside business. A permanent room gave those conversations somewhere to happen without requiring a person to stand beside a loading queue or explain their circumstances over a counter of goods.",
    "architecture": "A shallow arcade leads to an unadorned interior with a clearly visible main desk, places to sit and a quieter side of the room. Muted ochre walls and plain wooden partitions borrow the neighborhood’s domestic scale rather than the appearance of a corporate office.",
    "climateNotes": "The recessed frontage stays cooler than the exposed crossing paths in summer. On wet winter days, damp coats and umbrellas collect near the entrance rather than around the papers farther inside.",
    "civicLife": "This is a quieter civic stop, useful for understanding how the district supports changing working lives. Its small scale suits a question that needs context. Experienced residents and newcomers bring different uncertainties into the same unpretentious room.",
    "people": []
  },
  {
    "id": "saffron-corner-cafe",
    "regionId": "saffron",
    "regionName": "Saffron Reach",
    "placeId": "CORNER CAFÉ",
    "name": "Bridge Corner Café",
    "function": "Coffee, food and company",
    "summary": "Bridge Corner Café occupies one of Saffron Reach’s meeting points between movement and lingering. A canal crossing brings people to its vicinity; shade, food and conversation give them reasons to let a short stop become a longer one.",
    "history": "The café’s identity grew around the traffic of the nearby bridge rather than a formal square. Early custom came in uneven waves as boats arrived and people crossed between courts. Tables gradually became a place to wait for someone as well as somewhere to finish a drink.",
    "architecture": "Plain ochre piers frame a shallow terrace, with smaller tables tucked nearer the inner wall. The corner turns toward the bridge, giving the room two directions of attention: the water’s bright movement and the steadier shade of the arcade.",
    "climateNotes": "Dry summer afternoons sharpen the contrast between the shaded tables and the pale crossing outside. During winter showers, the covered edge draws people inward and the canal view takes on a softer, grayer light.",
    "civicLife": "Leila’s local routes include the café; Sami sometimes brings his tabletop work. Farah visits after closing her haberdashery, with radio drama on her mind. Come for the bridge-side atmosphere and company that need not become an organized occasion.",
    "people": [
      {
        "id": "saffron_leila",
        "relationship": "Market cook whose local appearances include the café and food market."
      },
      {
        "id": "sami",
        "relationship": "Visiting tile restorer and tabletop-game maker whose local appearances include the café."
      },
      {
        "id": "farah_hussain",
        "relationship": "After-work café visitor with her own interest in radio drama."
      }
    ]
  },
  {
    "id": "saffron-community",
    "regionId": "saffron",
    "regionName": "Saffron Reach",
    "placeId": "COMMUNITY",
    "name": "Casa del Patio",
    "function": "Pantry, volunteering and neighborhood projects",
    "summary": "Casa del Patio is Saffron Reach’s flexible indoor gathering place, opening onto the kind of shared exterior space that gives the district its social shape. It can hold conversation without requiring an entire evening to revolve around a performance.",
    "history": "The room developed as a dependable counterpart to gatherings held outside. Chairs and tables no longer had to be borrowed from several homes whenever rain threatened. Its history lies in repeated rearrangement: an open floor one afternoon, a circle of seats on another.",
    "architecture": "A broad opening faces the courtyard, while solid side walls provide quieter edges and storage for furniture. The interior keeps its finishes simple. Light from the court reaches across the floor without competing with the people or objects gathered there.",
    "climateNotes": "In dry weather the threshold connects indoor conversation with the cooler evening air. Winter gatherings draw farther inside, with the court retaining the sound of rain after the room has warmed.",
    "civicLife": "Ada’s organizing connects the room to the district’s film culture, while Sami brings a different tabletop interest. It is worth noticing how a plain shared room accommodates such distinct uses: the furniture changes, but the neighborhood remains recognizable around it.",
    "people": [
      {
        "id": "saffron_ada",
        "relationship": "Community cinema organizer associated with this gathering room and the separate cinema."
      },
      {
        "id": "sami",
        "relationship": "Local tabletop-game maker whose community appearances include this room."
      }
    ]
  },
  {
    "id": "saffron-park",
    "regionId": "saffron",
    "regionName": "Saffron Reach",
    "placeId": "THE PARK",
    "name": "Lemonshade Park",
    "function": "Outdoor rest and recreation",
    "summary": "Lemonshade Park gives the low-rise neighborhoods a substantial stretch of planted public space. Its character comes from broad patches of shelter and room between paths, offering a different pace from the narrower canal crossings.",
    "history": "The park grew from land kept open between courtyard clusters as the residential district expanded. Planting and resting places made the gap a shared destination. Older paths still follow useful lines between neighboring streets.",
    "architecture": "Low retaining edges define planting without enclosing it as a formal garden. Loose groups of trees create uneven islands of shade, while pale paths and modest seats keep the ground visually open. Views between trunks reveal roofs rather than a continuous urban wall.",
    "climateNotes": "Summer shade is the park’s most valued material, but it changes position through the day. Dry-season planting favors measured watering. Winter rain brings darker soil and the smell of damp leaves to a landscape often pictured in sunshine.",
    "civicLife": "The park is particularly rewarding between busier stops, when space and shade matter more than another destination. Family walks, solitary pauses and unhurried conversations overlap without filling every corner. Its spaciousness shows a quieter side of Saffron’s sociable coastal character.",
    "people": []
  },
  {
    "id": "saffron-library",
    "regionId": "saffron",
    "regionName": "Saffron Reach",
    "placeId": "LIBRARY",
    "name": "Blue Tile Library",
    "function": "Reading, learning and archives",
    "summary": "Blue Tile Library offers the district a place where words can remain available after a conversation ends. Its collection and reading rooms sit within Saffron Reach’s everyday routes, balancing the speed of waterfront errands with the slower work of understanding.",
    "history": "The library began as a reliable dry home for books and reference material circulating through a working canal district. Its role broadened as neighboring households used the rooms for sustained study and brief questions between errands.",
    "architecture": "A recessed entrance leads away from reflected water glare into a sequence of quieter rooms. Plain shelving, pale plaster and shaded windows keep the building consistent with the low-rise arcades outside. A small inner court supplies light without making the reading tables part of street traffic.",
    "climateNotes": "In summer, shade protects both readers and paper from the harshest afternoon sun. Winter brings greater concern for damp arrivals; the reading rooms feel particularly settled when rain is moving along the canal outside.",
    "civicLife": "Visit for a quieter encounter with a multilingual canal neighborhood. Household reading, sustained study and practical questions share the same building. Its connection with local film culture may grow, but the calm of a reading room already gives it a distinct purpose.",
    "people": []
  },
  {
    "id": "saffron-market",
    "regionId": "saffron",
    "regionName": "Saffron Reach",
    "placeId": "MARKET",
    "name": "Three Arches Market",
    "function": "Food, stalls and casual work",
    "summary": "Three Arches Market concentrates Saffron Reach’s food life beneath a connected run of shaded openings. Boat shifts and household errands give it several daily rhythms, while the smell of warm flatbread can connect the waterfront with the residential courts beyond.",
    "history": "Leila began with a portable griddle beside the early boat shift. Her questions about which fillings survived a rolling deck made the journey after purchase part of her cooking. That working history remains more important than a polished story of expansion.",
    "architecture": "Ochre arcade bays distinguish individual stalls without cutting them off from a shared passage. Work surfaces sit back from the main flow, with baskets, wrappers and serving shelves arranged around repeated small handovers. The covered structure gives the market a steady outline even when its contents change.",
    "climateNotes": "Summer heat makes the arcade’s shade essential to the feel of the market. Mild, wetter winters bring people closer beneath the roof and leave the open approaches shining after rain.",
    "civicLife": "Leila cooks here for crews and late-arriving friends, alongside other cooks with their own routines. Her stall gives visitors a human-scale introduction to the district’s food: remembered preferences, useful wrapping and a meal designed for the journey after the counter.",
    "people": [
      {
        "id": "saffron_leila",
        "relationship": "Market cook whose stall began with a portable griddle beside the early boat shift."
      }
    ]
  },
  {
    "id": "saffron-fitness",
    "regionId": "saffron",
    "regionName": "Saffron Reach",
    "placeId": "FITNESS",
    "name": "The Cool Hour",
    "function": "Movement and recovery",
    "summary": "The Cool Hour gives physical practice an indoor home beside the district’s outdoor social life. It is a modest neighborhood venue, shaped for repeat visits and ordinary routines rather than the spectacle of a large sporting complex.",
    "history": "The studio took form in a courtyard building whose broad rooms could accommodate movement more readily than another set of small shops. Changes to the interior emphasized a clear floor and places to put belongings, leaving the older courtyard arrangement recognizable outside.",
    "architecture": "A restrained frontage opens into a bright principal room, with smaller supporting spaces kept to one side. High windows admit light while giving the main floor some privacy. The adjacent court creates a visual breathing space between the studio and the next cluster of homes.",
    "climateNotes": "Warm, dry summers make shade and moving air central to the building’s comfort. Winter rain changes the approach more than the interior, where the enclosed floor offers a different setting from wet park paths.",
    "civicLife": "The studio shows the town keeping ordinary habits between its more conspicuous evenings. Its neighborhood scale suits repeat visits rather than spectacle, and different working hours bring changing company. The courtyard gives arrivals a moment to settle before entering the main room.",
    "people": []
  },
  {
    "id": "saffron-makerspace",
    "regionId": "saffron",
    "regionName": "Saffron Reach",
    "placeId": "MAKERSPACE",
    "name": "Kiln & Current",
    "function": "Repair, making and craft",
    "summary": "Kiln & Current carries the material history of Saffron Reach’s canal edges indoors. Tile, repaired fittings and careful handwork give it a relationship with the water even when the work on a particular bench belongs to a much smaller object.",
    "history": "The makerspace developed around maintaining surfaces and useful things that weather beside the canals. Its ceramic name records that foundation, while the work widened with the neighborhood. Tomas’s boat knowledge and Sami’s tile restoration fit different parts of this lineage.",
    "architecture": "Sturdy tables sit beneath high, shaded openings, with storage arranged to keep small components distinct. Washable surfaces and a sheltered working court make the building less domestic than its neighboring courtyards. Muted clay colors are interrupted by glazed fragments and the occasional bright diagram.",
    "climateNotes": "Dry-season dust gathers at the open edges, while summer light becomes gentler deeper inside the workshop. Winter rain emphasizes the value of keeping materials under cover instead of beside an exposed canal wall.",
    "civicLife": "Tomas brings boat-repair knowledge; Sami brings tile restoration and playful tabletop forms. Their friendship includes a reused crate lid and a retiled shelf. The makerspace rewards attention to small materials, where the canal district’s working history becomes visible at hand scale.",
    "people": [
      {
        "id": "saffron_tomas",
        "relationship": "Canal mechanic whose regular associated venues include the makerspace."
      },
      {
        "id": "sami",
        "relationship": "Authored makerspace association for a tile restorer and tabletop-game maker. His current local encounters use the café or community room."
      }
    ]
  },
  {
    "id": "saffron-cinema",
    "regionId": "saffron",
    "regionName": "Saffron Reach",
    "placeId": "CINEMA",
    "name": "Six Chairs Cinema",
    "function": "Films and discussion",
    "summary": "Six Chairs Cinema turns Saffron Reach’s pleasure in evening company toward a shared screen. The film provides a beginning, while the district’s habit of lingering makes the time afterward part of the venue’s identity.",
    "history": "Ada’s first screening used a borrowed sheet, six chairs and a projector that required cooling pauses. Leila brought food, and conversation outlasted the picture. The cinema’s local history retains that modest beginning rather than pretending it started as a grand entertainment institution.",
    "architecture": "A simple screening room opens toward a court where light and conversation can return after a film. Plain walls and movable furniture preserve the feeling of a gathering made by people. The exterior belongs to the same low ochre townscape as the nearby homes.",
    "climateNotes": "Warm summer evenings let the court hold the social part of a screening without the heat of midday. In the wetter months, discussion draws beneath cover and the indoor room becomes the center of the evening.",
    "civicLife": "Ada’s screenings give the evening its center, with tea and different responses afterward. Leila’s food belongs to the first gathering’s story. Visit for the transition from a darkened audience to a courtyard conversation that may follow an unexpected detail from the film.",
    "people": [
      {
        "id": "saffron_ada",
        "relationship": "Organizer of community screenings and film discussions."
      },
      {
        "id": "saffron_leila",
        "relationship": "Brought food to Ada’s first screening; a historical contribution rather than a permanent cinema job."
      }
    ]
  },
  {
    "id": "saffron-transit",
    "regionId": "saffron",
    "regionName": "Saffron Reach",
    "placeId": "TRANSIT",
    "name": "Water Tower Landing",
    "function": "Transport, travel and bicycle work",
    "summary": "Water Tower Landing makes the working water legible as a place of departures and arrivals. It connects Saffron Reach’s dispersed courtyard neighborhoods to routes beyond them while sharing the canal setting with boats engaged in everyday work.",
    "history": "The station grew where repeated crossings needed a dependable reference point. As ferry technology changed, familiar maintenance knowledge met new electrical systems. Tomas’s return to study belongs to that transition, part of the district’s continuing working history.",
    "architecture": "A low ticket frontage and covered waiting edge face the landing. Plain masonry holds the building back from the water, while the quay’s changing levels remain visible beyond it. The recognizable canal landmarks help orient a traveler who has just emerged from residential paths.",
    "climateNotes": "Water reflects strong summer light into the exposed parts of the station. Shade under the waiting cover feels distinct from the landing. Winter rain wets the canal steps, and breezes can make waiting cooler than walking through sheltered courts.",
    "civicLife": "Tomas’s connection is to the boats and their maintenance. Passengers bring bags, fare questions and reunions to the same waterfront setting. The station is worth lingering over as a working scene, especially where the sheltered waiting edge faces the movement of the canal.",
    "people": [
      {
        "id": "saffron_tomas",
        "relationship": "Canal mechanic associated with the station and the boats that serve it."
      }
    ]
  },
  {
    "id": "saffron-garden",
    "regionId": "saffron",
    "regionName": "Saffron Reach",
    "placeId": "GARDEN",
    "name": "Above the Arcade",
    "function": "Growing, harvest and outdoor rest",
    "summary": "Above the Arcade brings a more enclosed form of growing above Saffron Reach’s low buildings. From the planted roof, nearby courts and terracotta edges read as a patchwork rather than one continuous street frontage.",
    "history": "The garden began as a way to use a bare upper surface for something besides catching the sun. Containers and defined beds developed gradually, shaped by the roof’s exposure and the practical limits of carrying materials upstairs.",
    "architecture": "Low parapets frame planted sections, a clear circulation strip and modest resting places. The architecture stays subordinate to the growing space: pale surfaces, simple vessels and shelter positioned where it can make a difference. The ceramic water tower remains a fitting landmark in the wider view.",
    "climateNotes": "The roof receives more sun and wind than a shaded courtyard below. Dry summers demand careful water use, while winter rain changes the feel of open paving. Evening cool arrives with a greater sense of exposure.",
    "civicLife": "Visit for a closer view of growing and a wider view of the roofs. A changed leaf or shifting patch of shade matters here more than a grand display. Its small scale offers a different pause from the paths of Lemonshade Park.",
    "people": []
  },
  {
    "id": "saffron-arcade",
    "regionId": "saffron",
    "regionName": "Saffron Reach",
    "placeId": "ARCADE",
    "name": "The Long Game",
    "function": "Games and social play",
    "summary": "The Long Game adds a bright, indoor leisure room to Saffron Reach’s evening geography. Its game-centered atmosphere differs from a cinema audience: attention breaks into short bursts, spectators change places, and several little contests can share the same hour.",
    "history": "A covered commercial bay became a leisure destination rather than merely a route between errands. Its fittings have changed more often than its shell, with successive games occupying a building shaped by an older canal economy.",
    "architecture": "The entrance sits beneath a plain arch, while the deeper room concentrates color and light around its play areas. A strip near the frontage retains a view of the canal neighborhood. Heavy exterior walls contain much of the visual bustle within a modest footprint.",
    "climateNotes": "Summer evenings contrast warm outdoor air with the shaded room. Winter rain makes the covered frontage a useful pause, although the noisy interior differs from the library’s quiet shelter.",
    "civicLife": "Come for short bursts of play and the company around them. Watching a round can be as sociable as taking part, and a brief stop need not consume the evening. The arcade adds another rhythm to a neighborhood better known for films and shared meals.",
    "people": []
  },
  {
    "id": "glasssteppe-apartments",
    "regionId": "glasssteppe",
    "regionName": "Glasssteppe",
    "placeId": "APARTMENTS",
    "name": "Copperline Court",
    "function": "Housing and home life",
    "summary": "Copperline Court turns Glasssteppe’s steepness into a succession of front doors, landings and closely spaced homes. The buildings belong to a compact city where an upstairs window can be near another street’s pavement.",
    "history": "The apartments accumulated around railway employment as households made lasting homes on the terraces. Early retaining walls determined the shape of later rooms. Extensions followed the slope rather than erasing it, so the history of building remains visible in changes of level and stonework.",
    "architecture": "Stone wings step with the hillside beneath copper-toned roofs. Deep window reveals and enclosed shared landings soften the exterior’s angular geometry. Small courts catch a limited patch of sky, while taller retaining walls form the backs of homes on the level below.",
    "climateNotes": "Long winters make warm interiors and protection from platform winds particularly important. Snow can persist in the shaded approaches after sunnier edges have cleared. Short summers bring open windows and voices across the narrow space between buildings.",
    "civicLife": "The apartments show the railway city at its most domestic: shopping carried upstairs, letters read and voices crossing a small court. A visitor can see how densely lives fit around the slope while remembering that these familiar-looking doors lead to private homes.",
    "people": []
  },
  {
    "id": "glasssteppe-work",
    "regionId": "glasssteppe",
    "regionName": "Glasssteppe",
    "placeId": "WORK",
    "name": "Rail Hall Workrooms",
    "function": "Career and regional work",
    "summary": "Rail Hall Workrooms houses the slower, detailed labor that sits behind the railway city’s public movement. Drawings, fittings and partly resolved questions belong to rooms where useful work can continue after the sound of an arriving train has passed.",
    "history": "The rooms developed around the railway hall’s supporting trades. Their purpose broadened as recovered materials acquired uses beyond the railway. Sora’s work with salvaged station metal belongs to this exchange between transport infrastructure and everyday life.",
    "architecture": "Close-set rooms occupy a substantial stone shell, with a sheltered gallery connecting their doors. Tall windows admit a measured band of highland light. Work surfaces sit against solid walls, and the visible arrangement of shelves and components gives each room its own working character.",
    "climateNotes": "Enclosure matters through the cold season, when exposed platforms are windy. Frost on outer windows emphasizes the divide between workshop and railway. Summer ventilation brings mechanical sounds farther inside.",
    "civicLife": "Sora’s work connects these rooms with The Copper Bench. Their clear diagrams reflect the city’s respect for explanations another person can use. The appeal here is the detail behind finished things, with individual concentration occasionally interrupted by a useful conversation across a doorway.",
    "people": [
      {
        "id": "glass_sora",
        "relationship": "Copper repairer associated with the workrooms and the separate makerspace."
      }
    ]
  },
  {
    "id": "glasssteppe-campus",
    "regionId": "glasssteppe",
    "regionName": "Glasssteppe",
    "placeId": "CAMPUS",
    "name": "Switchback Institute",
    "function": "Courses and peer learning",
    "summary": "Switchback Institute gives Glasssteppe’s culture of study a visible place on the slope. Its teaching rooms belong to the same compact fabric as repair shops and station services, keeping formal learning close to the questions raised by practical work.",
    "history": "The college expanded through neighboring terrace buildings rather than one level campus. Rooms changed purpose as courses developed, but connections retained the hillside’s older logic. Learning here has a physical history of adaptation as well as an institutional one.",
    "architecture": "Stone facades and copper roof edges form a stepped outline, with covered connections where adjoining buildings meet. Deep windows light teaching rooms without opening them directly to the busiest passage. Small landings serve as pauses between enclosed spaces and changes in height.",
    "climateNotes": "Cold winters encourage people to gather just inside doorways rather than linger on exposed steps. Snow can remain along shaded exterior edges. The brief mild summer brings open windows and a stronger sense of the surrounding mountains.",
    "civicLife": "The college is worth noticing for the way learning occupies the same hillside as practical trades. Questions range from a particular diagram to subjects far beyond the railway. Between classes, small landings briefly become the city’s most concentrated patches of conversation.",
    "people": []
  },
  {
    "id": "glasssteppe-career-hub",
    "regionId": "glasssteppe",
    "regionName": "Glasssteppe",
    "placeId": "CAREER HUB",
    "name": "The Next Platform",
    "function": "Career progression and referrals",
    "summary": "The Next Platform provides a civic address for questions about working life in a city strongly shaped by its railway. It stands among the service rooms where a practical enquiry can be separated from the urgency of catching a train.",
    "history": "The desk brought scattered employment information into a recognizable place. Its audience gradually widened beyond people seeking the same railway work as their neighbors. The name records its setting while leaving room for different occupations.",
    "architecture": "A modest enclosed office faces a sheltered service gallery. Its main counter is easy to identify, with seating set away from the flow past the door. Stone walls and warm interior finishes make the room feel like part of the railway hall’s public fabric.",
    "climateNotes": "The enclosed waiting space matters most during long cold spells, when a short outdoor conversation can become uncomfortable quickly. Meltwater follows boots inside during thaws, while summer light reaches more deeply into the gallery.",
    "civicLife": "This modest stop reveals the city’s civic life beneath its impressive railway geometry. Experienced workers and recent arrivals bring different questions. The room gives uncertainty a practical address in a place often associated with competence, careful study and things made to work.",
    "people": []
  },
  {
    "id": "glasssteppe-corner-cafe",
    "regionId": "glasssteppe",
    "regionName": "Glasssteppe",
    "placeId": "CORNER CAFÉ",
    "name": "Platform Corner Café",
    "function": "Coffee, food and company",
    "summary": "Platform Corner Café holds a warm corner of Glasssteppe’s transport district. It faces a world of scheduled departures while making space for the less scheduled business of waiting, thinking and talking over something hot.",
    "history": "The café grew around railway intervals: a gap between services, a finished shift or time before a connection. It has always drawn a mixed public, with familiar residents sitting near people who would soon leave the city.",
    "architecture": "Deep windows look toward the railway setting from a thick-walled stone room. A recessed entrance limits the direct sweep of outside air. Small tables follow the edges, leaving the middle legible even when coats and bags make the room feel fuller.",
    "climateNotes": "In winter, cold glass and warm indoor air make the view feel farther away than it is. Exposed approaches can be windy. Summer brings longer light and the possibility of sitting near an open window without dressing for a platform wait.",
    "civicLife": "Ren’s conductor’s knowledge meets the ordinary experience of waiting here. Miro also visits, bringing a retired signal painter’s eye and present-day paper comedies. The café is a rewarding pause for watching station life without immediately becoming part of the departing crowd.",
    "people": [
      {
        "id": "glass_ren",
        "relationship": "Rail conductor whose local appearances include the café."
      },
      {
        "id": "miro",
        "relationship": "Visiting retired signal painter and shadow-comedy maker."
      }
    ]
  },
  {
    "id": "glasssteppe-community",
    "regionId": "glasssteppe",
    "regionName": "Glasssteppe",
    "placeId": "COMMUNITY",
    "name": "Reunion Hall",
    "function": "Pantry, volunteering and neighborhood projects",
    "summary": "Reunion Hall gives Glasssteppe’s compact center a shared interior for pleasures and questions that do not belong to a shift. Its connection to the railway is geographic and historical; the lives gathered inside range much further.",
    "history": "A reliable gathering room met a need among densely settled railway households. Repeated uses shaped its flexible interior, where stacked chairs and an available wall proved more useful than fittings designed for only one kind of occasion.",
    "architecture": "Thick stone walls contain a broad principal room with storage around its edges. High windows supply light without exposing every table to the street. The geometry is simple enough for a group to reorganize the room around singing, drawing or a small performance.",
    "climateNotes": "Winter makes warmth part of the gathering’s appeal, while snow shortens doorway conversations. During the mild summer, open windows let railway sound accompany the room’s own voices.",
    "civicLife": "Mei brings choir organization; Liang attends drawing sessions as a sitter; Jian appears with zine pages; Miro has his paper theatre. Their separate interests make the room an especially revealing stop for the city’s life beyond work, with different voices sharing its simple interior.",
    "people": [
      {
        "id": "mei_chen",
        "relationship": "Community choir organizer associated with the room."
      },
      {
        "id": "liang_chen",
        "relationship": "Attendee and portrait sitter at community drawing sessions."
      },
      {
        "id": "jian_wu",
        "relationship": "Teenage participant at the community drawing table, with his own zine project."
      },
      {
        "id": "miro",
        "relationship": "Local shadow-comedy maker whose appearances include the room."
      }
    ]
  },
  {
    "id": "glasssteppe-park",
    "regionId": "glasssteppe",
    "regionName": "Glasssteppe",
    "placeId": "THE PARK",
    "name": "Windbreak Park",
    "function": "Outdoor rest and recreation",
    "summary": "Windbreak Park offers Glasssteppe an outdoor pause within its densely built slope. It is shaped less like a broad level field than a series of planted ledges, each with its own view, shelter and relationship to the route uphill.",
    "history": "The park links spaces retained between roads, walls and homes as the city grew. A shared public purpose joined the fragments without disguising their different heights. Older stone edges explain why a path turns instead of continuing straight.",
    "architecture": "Retaining walls form the strongest lines, softened by planting and places to sit. Paths bend around the hillside, revealing rooftops and rails at changing angles. Sheltered corners feel intimate even when an opening beyond them gives a long mountain view.",
    "climateNotes": "Snow and ice can remain on shaded sections while sunnier edges thaw. Wind crosses the more exposed ledges. Short summers bring the park’s fullest color and make a slow outdoor conversation feel less dependent on finding immediate shelter.",
    "civicLife": "Hana’s walking-club life is associated with the park. Her former postal rounds give her a detailed local map, but a chosen walk can end wherever the company wants. Visit for these changing views and the pleasure of a pause that need not justify itself.",
    "people": [
      {
        "id": "hana_mori",
        "relationship": "Retired postal worker and walking-club participant whose local appearances include the park."
      }
    ]
  },
  {
    "id": "glasssteppe-library",
    "regionId": "glasssteppe",
    "regionName": "Glasssteppe",
    "placeId": "LIBRARY",
    "name": "Switchback Library",
    "function": "Reading, learning and archives",
    "summary": "Switchback Library sits within the railway city’s culture of close observation and patient study. Its reading rooms and neighboring planted terraces allow a book, a difficult question or a quiet pause to remain within hearing of the trains.",
    "history": "The library grew alongside working households needing dependable reading space. Pavel’s garden added another layer: its first bulbs went into mismatched tubs carried upstairs with Ren. Modest planting changed the way a terrace could be used.",
    "architecture": "Stone rooms follow the hillside, with deep windows and sheltered landings between levels. Reading tables occupy the calmer light inside, while planted corners soften the edge outside. The building’s geometry frames the railway view rather than trying to remove the working city from it.",
    "climateNotes": "Long winters concentrate reading indoors and leave exposed planting dormant. Sheltered corners reduce the wind without abolishing the cold. In the brief mild summer, the relationship between book, seat and garden becomes especially visible.",
    "civicLife": "Pavel cares for the reading-garden setting, while Ren knows gentler approaches through the switchbacks. The library rewards a slower visit: a settled reading table, a sheltered planted corner and the railway still audible below. Its quiet is part of the city rather than an escape from it.",
    "people": [
      {
        "id": "glass_pavel",
        "relationship": "Caretaker of the reading-garden terraces associated with the library."
      },
      {
        "id": "glass_ren",
        "relationship": "Helped Pavel carry the first planting tubs and knows the library’s hillside approaches."
      }
    ]
  },
  {
    "id": "glasssteppe-market",
    "regionId": "glasssteppe",
    "regionName": "Glasssteppe",
    "placeId": "MARKET",
    "name": "The Goods Exchange",
    "function": "Food, stalls and casual work",
    "summary": "The Goods Exchange brings provisions into the compact network around Glasssteppe’s railway. Its scale suits people carrying a modest purchase uphill, combining the railway’s wider reach with the immediate requirements of a neighborhood supper.",
    "history": "The market developed where arriving goods and residents’ daily routes already met. Covered selling space allowed trade to continue through weather that made an exposed square less dependable. Subsequent alterations retained the market’s direct relationship with circulation rather than turning it into an isolated hall.",
    "architecture": "Stalls fit within a strong stone envelope, with sheltered passages and broad openings at the ends. Crates, counters and hanging signs introduce smaller geometries inside the larger structural bays. Copper-toned details link the building visually to the roofs above the surrounding terraces.",
    "climateNotes": "Cold weather makes the difference between covered trading space and the outdoor approach immediately apparent. Snowmelt follows deliveries and shoppers inside during thaws. Summer brings longer daylight to the entrances without removing the market’s useful shelter.",
    "civicLife": "Visit for the everyday relationship between railway supply and a household supper. Sellers and shoppers discuss availability, taste and what can be carried uphill. The market’s compactness makes those practical choices visible, from the counter to the bag heading toward the next terrace.",
    "people": []
  },
  {
    "id": "glasssteppe-fitness",
    "regionId": "glasssteppe",
    "regionName": "Glasssteppe",
    "placeId": "FITNESS",
    "name": "Second Summit",
    "function": "Movement and recovery",
    "summary": "Second Summit provides an enclosed place for physical practice in a city where ordinary travel can already involve a climb. Its purpose is separate from the effort of getting home, giving movement a chosen time and an indoor setting.",
    "history": "A broad room in the terraced service district became the venue. Adaptations cleared the interior and separated it from neighboring uses while retaining the stone shell: another everyday service fitted into a city with little spare level ground.",
    "architecture": "A high principal room sits behind a compact frontage, with storage and supporting spaces placed along the solid side walls. Deep-set windows temper glare. Clear internal sightlines contrast with the turns and landings of the exterior streets.",
    "climateNotes": "Long cold winters increase the importance of an indoor floor when outdoor conditions vary between snow, ice and thaw. The brief summer changes the light and ventilation, while the building keeps a more predictable atmosphere than an exposed terrace.",
    "civicLife": "The studio offers a different view of a city celebrated for studying and making. Residents bring varied routines and appetites for company to the same indoor floor. Its neighborhood atmosphere matters as much as its setting above streets where walking already means negotiating a slope.",
    "people": []
  },
  {
    "id": "glasssteppe-makerspace",
    "regionId": "glasssteppe",
    "regionName": "Glasssteppe",
    "placeId": "MAKERSPACE",
    "name": "The Copper Bench",
    "function": "Repair, making and craft",
    "summary": "The Copper Bench makes Glasssteppe’s repair culture tangible in benches, recovered parts and drawings left where another pair of hands can understand them. The railway supplies part of its material history, while useful objects eventually return to many different kinds of homes and work.",
    "history": "Sora began with salvaged station fittings and tools borrowed one at a time. Wear on recovered pieces offered evidence to examine before choosing their next use. Clear diagrams developed alongside the practical kit, never merely as decoration.",
    "architecture": "A dense stone workshop encloses substantial tables and orderly stretches of storage. Copper and other recovered metals bring varied surfaces to the subdued room. High light reveals edges and fastenings, while drawings and visibly worked labels make the space understandable at close range.",
    "climateNotes": "Winter draws work inside, away from platform winds and snow. Cold materials still carry the season indoors. Summer light lasts longer over the benches, with open windows admitting railway sound.",
    "civicLife": "Sora’s repair work anchors this venue’s character. Their exchange with Miro, a repaired projection lamp for hand-painted drawer labels, connects practical care with performance. Visit for the material detail: worn edges, visible brushwork and explanations that remain useful after their maker leaves the bench.",
    "people": [
      {
        "id": "glass_sora",
        "relationship": "Copper repairer whose associated venues include this makerspace."
      }
    ]
  },
  {
    "id": "glasssteppe-cinema",
    "regionId": "glasssteppe",
    "regionName": "Glasssteppe",
    "placeId": "CINEMA",
    "name": "Signal Light Cinema",
    "function": "Films and discussion",
    "summary": "Signal Light Cinema gives the railway district a different kind of arrival: people gather to watch something together rather than continue along the line. Its enclosed room brings evening leisure into the city’s close-set service streets.",
    "history": "The cinema grew within the railway hall’s civic surroundings, providing indoor entertainment through the cold season. Projected films share its history with smaller visual performances. Miro’s paper railway comedies belong to that second tradition.",
    "architecture": "A restrained stone entrance leads to a darker viewing room set back from busy circulation. Plain surfaces let the screen and changing light carry the atmosphere. The surrounding hall’s strong geometry remains apparent in the ceiling and walls, even when the exterior city disappears from sight.",
    "climateNotes": "Winter turns the passage from cold street to enclosed audience into part of an evening’s pleasure. Snow and wind remain concerns for the journey home. Summer screenings meet a different contrast, with daylight sometimes lingering outside after the room has darkened.",
    "civicLife": "Miro’s local appearances include the cinema, where his interest in silhouettes suits a room devoted to looking. Visit for its contrast with the working hall outside. Afterward, conversation often begins with the discovery that two viewers noticed different parts of the same scene.",
    "people": [
      {
        "id": "miro",
        "relationship": "Authored cinema association for a retired signal painter and shadow-comedy maker. His current local encounters use the café or community room."
      }
    ]
  },
  {
    "id": "glasssteppe-transit",
    "regionId": "glasssteppe",
    "regionName": "Glasssteppe",
    "placeId": "TRANSIT",
    "name": "Glasssteppe Rail Station",
    "function": "Transport, travel and bicycle work",
    "summary": "Glasssteppe Rail Station is the city’s most concentrated meeting of distance and height. Trains connect the highlands to elsewhere, while galleries, platforms and hillside approaches organize the shorter but equally consequential journey into the surrounding neighborhoods.",
    "history": "Railway growth drew households and supporting trades toward these terraces. Ren remembers a week when snow stopped every train and the station became a shared kitchen. Mutual improvisation belongs beside the building’s official transport history.",
    "architecture": "The copper railway hall anchors a network of sheltered service galleries beneath the city’s stepped stone outline. Covered interiors and exposed platform edges form distinct environments. The nearby funicular belongs to the larger system by which Glasssteppe makes changes in elevation part of daily travel.",
    "climateNotes": "Wind can make an exposed platform much colder than a sheltered stone corner. Snow sometimes disrupts the familiar timetable and persists on shaded routes. Short summers reveal a station of long light and open views rather than permanent winter scenery.",
    "civicLife": "Ren brings a walking map’s attention to official railway work: benches, windbreaks and recognizable turns beyond the train. For visitors, the station is both arrival point and introduction to the city’s vertical geography, where the final stretch uphill remains part of every journey.",
    "people": [
      {
        "id": "glass_ren",
        "relationship": "Rail conductor associated with the station and its passenger routes."
      }
    ]
  },
  {
    "id": "glasssteppe-garden",
    "regionId": "glasssteppe",
    "regionName": "Glasssteppe",
    "placeId": "GARDEN",
    "name": "Short Summer Garden",
    "function": "Growing, harvest and outdoor rest",
    "summary": "Short Summer Garden fits productive planting into the railway city’s limited pockets of sheltered ground. Its beds occupy a different kind of terrace from a station platform: close attention goes to soil, light and the short season between cold spells.",
    "history": "Growing space emerged beside existing walls in small increments. The containers and beds share the adaptable spirit of Pavel’s early reading-garden tubs, while giving food plants a distinct place of their own.",
    "architecture": "Retaining masonry defines the garden’s outline, with growing areas arranged within the shelter the slope can offer. Low containers and clear passages keep the space readable at close range. Railway roofs and upper windows remain visible beyond the planting, making this an urban garden rather than a retreat outside town.",
    "climateNotes": "The short, mild summer bounds the planting season. Frost lingers in shaded corners, and exposed soil loses warmth quickly. Winter quiet belongs to the garden’s identity without ending its care.",
    "civicLife": "Pavel is associated with this garden as well as the library’s reading terraces. Visit for the particularity of a short growing season: one warmer corner, one sheltered bed, one plant worth returning to. Railway sound keeps even this patient place connected to the working city.",
    "people": [
      {
        "id": "glass_pavel",
        "relationship": "Caretaker associated with the garden and the library’s separate reading terraces."
      }
    ]
  },
  {
    "id": "glasssteppe-arcade",
    "regionId": "glasssteppe",
    "regionName": "Glasssteppe",
    "placeId": "ARCADE",
    "name": "Off Duty",
    "function": "Games and social play",
    "summary": "Off Duty gives Glasssteppe’s service district a lively pocket of indoor play. It sits comfortably beside a city of timetables and careful diagrams while allowing attention to follow a score, a quick contest or the spectacle of somebody else’s attempt.",
    "history": "Commercial space near the station became a covered leisure room for local evenings and gaps between journeys. Games and fittings changed around an older stone shell. Its history is repeated reuse rather than one defining machine.",
    "architecture": "A compact entrance opens into a deeper room whose light is concentrated around play areas. Heavy walls separate the interior bustle from neighboring passages. Copper-colored trim and strong rectangular bays preserve a visual connection with the railway district beneath the room’s brighter surfaces.",
    "climateNotes": "Long winters make indoor leisure appealing, although coats and damp boots bring weather inside. Summer evenings can remain bright outdoors after the arcade’s interior lighting begins to feel like night.",
    "civicLife": "The arcade adds a playful stop to a city often described through work and study. Company gathers around brief attempts, scores and somebody else’s lucky moment. Its appeal is a self-contained interval of leisure, with the station district’s wider movement continuing just outside.",
    "people": []
  },
  {
    "id": "pelagia-apartments",
    "regionId": "pelagia",
    "regionName": "Pelagia",
    "placeId": "APARTMENTS",
    "name": "Stiltwalk Apartments",
    "function": "Housing and home life",
    "summary": "Choose Stiltwalk Apartments for the domestic side of Pelagia: cooking above the water, a breeze through the shutters and the soft footfall of neighbors on a raised walk. The harbor’s famous domes are only part of life here.",
    "history": "These homes belong to the settlement’s long practice of building around moving water. Smaller households occupy raised structures beside the routes to gardens and workrooms, with additions made as daily needs change. A patched screen or renewed length of decking tells as much about the place as its skyline.",
    "architecture": "Slender supports lift the living floor clear of the working ground and water below. Shaded verandas connect compact rooms, while deeper eaves protect the openings. The arrangement leaves air between buildings and gives each dwelling a threshold rather than turning every home into a public promenade.",
    "climateNotes": "Warm, humid weather makes shade and ventilation useful throughout much of the year. During the monsoon, rain can blow under a roof edge; shutters and dry indoor storage matter alongside the raised floor.",
    "civicLife": "This is a place to make a meal, invite company or regain some privacy. The apartments do not establish which named resident lives in which unit. A visit to Pelagia and a decision to make it home remain separate choices.",
    "people": []
  },
  {
    "id": "pelagia-work",
    "regionId": "pelagia",
    "regionName": "Pelagia",
    "placeId": "WORK",
    "name": "Tide Ledger Workrooms",
    "function": "Career and regional work",
    "summary": "Tide Ledger Workrooms brings Pelagia’s celebrated engineering down to the scale of an ordinary paid task. Come for the view of how a working harbor is supported by records, coordination and patient maintenance.",
    "history": "Mara’s flood-gate work gives the place a clear human connection. Pumps and gates need continuing attention, and the people planning that care need somewhere to compare notes and explain useful information. The workrooms’ history is built around making essential, sometimes unnoticed work visible without treating every visitor as an engineer.",
    "architecture": "A raised service building has a broad roof and open-sided circulation around enclosed work areas. Tall tables keep paper above the damp floor edge; a public-facing desk is separate from equipment and technical storage. Glazed panels catch the watery light without requiring every room to be a decorative dome.",
    "climateNotes": "Deep eaves handle heavy rain while cross-ventilation tempers humid heat. Sheltered approaches connect the desks to the boardwalk network; wind-driven water still makes proper storage part of daily work.",
    "civicLife": "Mara’s regional job concerns a public tide-safe crossing board, with technical inspection left to trained engineers. The workrooms also support the player’s existing career. Being useful here need not mean promising to settle or taking responsibility for machinery.",
    "people": [
      {
        "id": "pelagia_mara",
        "relationship": "Confirmed flood-gate engineer and regional-work contact; public-information work remains separate from trained technical inspection."
      }
    ]
  },
  {
    "id": "pelagia-campus",
    "regionId": "pelagia",
    "regionName": "Pelagia",
    "placeId": "CAMPUS",
    "name": "Tideworks College",
    "function": "Courses and peer learning",
    "summary": "Tideworks College is the harbor’s learning address, where everyday ecology and practical construction provide a setting for study. You can arrive with a question rather than a finished explanation.",
    "history": "Its character grows from the relationship between maintained waterways and the surrounding growing country. Classrooms sit close enough to working life for a discussion to have concrete examples, yet learning has its own pace. The college’s story is about giving people room to acquire skills, not granting an unearned engineering title after a single visit.",
    "architecture": "Low teaching pavilions stand on a raised base, linked by a shaded passage. One room favors shared project tables; another is small enough for a tutorial. Broad roofs and glazed upper panels give useful daylight while leaving wall space for diagrams and student work.",
    "climateNotes": "Monsoon rain can be loud on a roof, so interior study areas sit behind the more open circulation edge. Shutters and high vents let the rooms respond to humid heat and a sudden squall.",
    "civicLife": "A month of peer study has a different social texture from an intensive course. Learners bring experience from households, boats or gardens without needing to speak for an entire community. Its scale leaves room to ask a question without needing to make an occasion of it.",
    "people": []
  },
  {
    "id": "pelagia-career-hub",
    "regionId": "pelagia",
    "regionName": "Pelagia",
    "placeId": "CAREER HUB",
    "name": "Farther Shore Careers",
    "function": "Career progression and referrals",
    "summary": "Pelagia’s Farther Shore Careers serves a small town with a wide working hinterland. Its appeal is practical: a dry place to put a portfolio, ask about a next role and turn an introduction into a considered choice.",
    "history": "The desk’s history follows the need for a common meeting point among scattered homes, growing areas and harbor services. A public counter becomes a small suite of rooms, but the purpose stays modest. It helps connect work and people without promising that every useful skill must lead to the same career.",
    "architecture": "A compact raised building branches from the public walk. The front counter shares light with a waiting bench; more private conversations take place behind an inner partition. A flat work surface is large enough for drawings without borrowing space from a busy passage.",
    "climateNotes": "A projecting roof keeps much of the seasonal rain away from arriving documents. Ventilated storage and a sheltered threshold suit the damp air, while adjustable shutters temper glare reflected off the water.",
    "civicLife": "Visitors can consider professional plans while keeping a life elsewhere. Engineering and ecology supply much of Pelagia’s public context, but an individual’s next step can draw on a different interest. A good introduction leaves room to ask another question before making a commitment.",
    "people": []
  },
  {
    "id": "pelagia-corner-cafe",
    "regionId": "pelagia",
    "regionName": "Pelagia",
    "placeId": "CORNER CAFÉ",
    "name": "Dome Corner Café",
    "function": "Coffee, food and company",
    "summary": "Dome Corner Café offers an ordinary meal beneath Pelagia’s extraordinary skyline. Ginger broth, a shaded seat and a conversation after work make it worth stopping before chasing another view.",
    "history": "Lio’s cooking began with a pot shared among an early ferry shift. That history is one of practical generosity and adaptable ingredients: delayed boats can change what arrives, while the familiar base of a meal remains. The café is a meeting place connected to Lio’s cooking, without implying that Lio owns every counter serving food in town.",
    "architecture": "A modest curved canopy takes up the dome language on a smaller scale. The serving area is protected behind the open seating edge, and shutters can change the room from breezy to sheltered. Tables leave enough visual space to notice the water and the movement along the raised walk.",
    "climateNotes": "Warm rain and humidity encourage covered, ventilated seating. A sudden monsoon shower can shift company farther under the roof; the café’s character includes those ordinary adjustments rather than permanent clear weather.",
    "civicLife": "Yuna sometimes comes after her neighborhood radio hour, wanting an unrecorded conversation and a familiar supper. That desire makes the café a place where a person can be company without being interviewed. Lio’s patient explanations give an unfamiliar meal a welcoming point of entry.",
    "people": [
      {
        "id": "pelagia_lio",
        "relationship": "Confirmed harbor cook associated with the café and market; ownership is not specified."
      },
      {
        "id": "yuna_park",
        "relationship": "Scheduled café visitor after her neighborhood radio work."
      }
    ]
  },
  {
    "id": "pelagia-community",
    "regionId": "pelagia",
    "regionName": "Pelagia",
    "placeId": "COMMUNITY",
    "name": "The Dry Room",
    "function": "Pantry, volunteering and neighborhood projects",
    "summary": "The Dry Room is a dry gathering place for a settlement whose homes and work are spread across raised routes. It holds ordinary company as well as the discussions that keep public work understandable.",
    "history": "Esme’s interest in everyday records gives the room a strong connection to the town’s quieter history. Lunches, friendships and small decisions deserve attention beside storm accounts and engineering achievements. The room’s uses can change from a practical meeting to a family visit without requiring either to become a public performance.",
    "architecture": "A broad raised hall has an enclosed dry center and a more open veranda edge. Tables can be moved clear of a family corner; displayed notices belong near the entrance where arrivals can read them without interrupting. The building’s simple roof contrasts with the harbor’s more ceremonial domes.",
    "climateNotes": "Roof overhangs and protected doorways answer heavy seasonal rain. Ventilation and shade matter on humid afternoons, while paper and play materials can remain in the dry interior.",
    "civicLife": "Mara accompanies Lin at a dry play table, away from machinery and working water. Ravi’s astronomy conversation and Sefu’s scheduled visits add other interests. The room allows people with practical responsibilities to have lives beyond those responsibilities.",
    "people": [
      {
        "id": "pelagia_esme",
        "relationship": "Confirmed archivist with community-room associations."
      },
      {
        "id": "pelagia_mara",
        "relationship": "Scheduled family visitor with Lin; also a flood-gate engineer."
      },
      {
        "id": "lin",
        "relationship": "Child at a supervised dry play table with Mara nearby."
      },
      {
        "id": "ravi_desai",
        "relationship": "Scheduled visitor interested in astronomy and realistic commitments."
      },
      {
        "id": "sefu",
        "relationship": "Recurring community-room visitor."
      }
    ]
  },
  {
    "id": "pelagia-park",
    "regionId": "pelagia",
    "regionName": "Pelagia",
    "placeId": "THE PARK",
    "name": "Highwater Promenade",
    "function": "Outdoor rest and recreation",
    "summary": "Highwater Promenade is Pelagia’s public place to slow down above the water. It combines the openness of a harbor walk with planted edges and seats that let a view become part of an ordinary afternoon.",
    "history": "The promenade belongs to the town’s practical habit of lifting everyday routes above working basins. Its park character comes from retaining room to pause along those routes rather than filling every dry surface with another building. Tavi’s interest in plants beside salt water gives the planted margins a connection to local growing knowledge.",
    "architecture": "A broad raised path bends through seating pockets and planted sections. Railings define the water-facing edge, while low roofs provide intermittent shade rather than enclosing the whole park. The arrangement keeps the harbor visible and gives resting places an identity beyond a transit corridor.",
    "climateNotes": "Heat, reflected glare and sudden heavy rain all change the experience. Sheltered pauses are valuable, but an outdoor promenade remains exposed compared with a room; weather belongs in the decision about how long to stay.",
    "civicLife": "Tavi is associated with both the park and the garden, which remain distinct destinations. Sefu also visits on a changing schedule. A short walk or a quiet reading session needs no gardening achievement and no contribution to harbor upkeep.",
    "people": [
      {
        "id": "pelagia_tavi",
        "relationship": "Confirmed raised-garden grower also associated with the park."
      },
      {
        "id": "sefu",
        "relationship": "Recurring park visitor, not a stated park employee."
      }
    ]
  },
  {
    "id": "pelagia-library",
    "regionId": "pelagia",
    "regionName": "Pelagia",
    "placeId": "LIBRARY",
    "name": "Tidal Library",
    "function": "Reading, learning and archives",
    "summary": "Tidal Library is worth visiting for the harbor’s quieter voices. Its shelves make space for the ordinary lives behind the famous domes, alongside the resources for reading, study and shared discussion.",
    "history": "Esme gathered neighbors’ handwritten stories because lunches and friendships belong in a town’s record as surely as storms do. This concern gives the library a specific historical purpose without turning every conversation into material to collect. A later listening-alcove program develops in the game; it should be discovered as a change rather than presumed on arrival.",
    "architecture": "The reading rooms occupy a raised, enclosed building with pale surfaces and carefully placed windows. Shelves sit within the dry center; reading tables take the softer perimeter light. A sheltered entrance provides a pause before wet clothing and loose papers reach the collection.",
    "climateNotes": "Humidity and monsoon rain demand protected storage, ventilation and care over where paper is left. The surrounding water can be beautiful without being a harmless backdrop to an archive.",
    "civicLife": "Esme’s approach leaves the teller in charge of what is shared. Readers can spend time with a book or join a discussion without donating a life story. The paid digitization activity has its own skill condition; affection for local history does not erase the work involved.",
    "people": [
      {
        "id": "pelagia_esme",
        "relationship": "Confirmed neighborhood archivist associated with the library."
      }
    ]
  },
  {
    "id": "pelagia-market",
    "regionId": "pelagia",
    "regionName": "Pelagia",
    "placeId": "MARKET",
    "name": "First Ferry Market",
    "function": "Food, stalls and casual work",
    "summary": "First Ferry Market is where the boats and the growing hinterland meet a lunch appetite. Stop for adaptable food, conversation around a stall and a sense of what arrived safely today.",
    "history": "Lio’s first shared broth pot connects the market to early ferry workers. Tavi’s patient experiments connect it to growing beside salt water, with dependable vegetables as important as an interesting trial. Their later shared harvest table is an evolving regional program; the underlying market already has a life of its own.",
    "architecture": "Covered stalls stand on a raised deck with a generous central aisle. The roof breaks into separate bays so light and air reach the working surfaces. Food preparation sits back from the edge; the public frontage gives customers somewhere to wait without occupying a loading route.",
    "climateNotes": "Monsoon storms can delay supplies and drive rain sideways under an awning. Covered storage, flexible menus and shaded working space make more sense here than a promise of identical ingredients every day.",
    "civicLife": "Lio explains substitutions instead of treating them as an embarrassment. Tavi’s growing work gives the food conversations a connection to the country beyond the harbor. The visitor’s cooking lesson, market lunch and paid stall work are distinct ways to spend time here.",
    "people": [
      {
        "id": "pelagia_lio",
        "relationship": "Confirmed harbor cook working with market food."
      },
      {
        "id": "pelagia_tavi",
        "relationship": "Grower connected to the later resilient-harvest-table program; no market ownership is stated."
      }
    ]
  },
  {
    "id": "pelagia-fitness",
    "regionId": "pelagia",
    "regionName": "Pelagia",
    "placeId": "FITNESS",
    "name": "Stillwater Studio",
    "function": "Movement and recovery",
    "summary": "Stillwater Studio is the sheltered counterpart to Pelagia’s open walks. Come for a class, a structured session or recovery when humid weather makes the outdoor route less appealing.",
    "history": "The studio’s history follows a small harbor’s need to reuse limited raised space carefully. A broad room accommodates changing kinds of movement rather than demanding a separate building for each one. Its purpose is ordinary wellbeing, independent of the more conspicuous engineering that supports the surrounding town.",
    "architecture": "A lightweight pavilion sits above the damp ground line, with a solid central floor and screened edges. A compact front desk separates arriving visitors from the active room. Equipment storage keeps the main surface clear, while a quieter recovery area has a more enclosed character.",
    "climateNotes": "Shade and cross-ventilation temper warm, wet air. Screens reduce glare from the water, and closable panels keep wind-driven rain off the interior when a shower turns into a squall.",
    "civicLife": "The view can be restful, and a class gives the day a different structure from an errand or a walk. Company is welcome without turning every session into a group undertaking. This is another way to enjoy the harbor, alongside its more visible culture of work, study and upkeep.",
    "people": []
  },
  {
    "id": "pelagia-makerspace",
    "regionId": "pelagia",
    "regionName": "Pelagia",
    "placeId": "MAKERSPACE",
    "name": "Floodworks Makerspace",
    "function": "Repair, making and craft",
    "summary": "Floodworks Makerspace reveals the practical work behind Pelagia’s polished-looking skyline. It is a place for making and repair at bench scale, with the harbor’s larger technical systems visible as context rather than visitor toys.",
    "history": "Mara’s maintenance work gives the venue its connection to tidal gates and pumps. The wider town learned to live with water through construction and continued care, so a workbench belongs naturally in its story. Useful repairs need clear roles, safe tasks and acknowledgement of the people who keep returning to them.",
    "architecture": "A raised workshop has a deep service roof, sturdy benches and a protected tool wall. Open panels admit light to the public side; specialist equipment and storage occupy a more controlled working edge. The geometry is practical, with broad spans rather than a miniature version of every harbor dome.",
    "climateNotes": "Moist salt air and heavy rain make sheltered storage and routine cleaning important. Water is directed away from the bench area; shade keeps long practical sessions more comfortable in humid heat.",
    "civicLife": "Mara can explain the engineering without handing an untrained visitor a dangerous inspection. The game’s repair courses, craft practice and commissions remain the shared bench activities. The regional crossing-board job is specifically located at Tide Ledger Workrooms, so not every task linked to Mara occurs here.",
    "people": [
      {
        "id": "pelagia_mara",
        "relationship": "Confirmed flood-gate engineer associated with the makerspace; trained technical work is distinct from visitor activities."
      }
    ]
  },
  {
    "id": "pelagia-cinema",
    "regionId": "pelagia",
    "regionName": "Pelagia",
    "placeId": "CINEMA",
    "name": "The Lantern Dome",
    "function": "Films and discussion",
    "summary": "The Lantern Dome is a compact screen room that borrows Pelagia’s curved roofline for an everyday pleasure. It offers an enclosed pause after a day of bright water and open walkways.",
    "history": "Its history begins with the simple need for a dark, dry gathering room in a town famous for its exterior views. A small auditorium and ticket area make entertainment part of local life instead of something reserved for visitors. The building’s name does not make it the enormous central dome pictured in the regional painting.",
    "architecture": "A shallow curved roof covers a rectangular seating plan, with an enclosed projection end and a small sheltered foyer. Narrow bands of daylight belong to the entrance; curtains keep the screen room focused. Raised foundations continue the practical language of neighboring public buildings.",
    "climateNotes": "A generous entry canopy lets people gather during rain, while the enclosed auditorium separates the film from glare and humid wind. Seasonal showers still shape the approach along the open harbor walks.",
    "civicLife": "A matinee and a film discussion bring different audiences and moods. A visitor can join a conversation or simply leave with the story still in mind. The cinema’s shared darkness has its own appeal in a town so often approached through open views and bright water.",
    "people": []
  },
  {
    "id": "pelagia-transit",
    "regionId": "pelagia",
    "regionName": "Pelagia",
    "placeId": "TRANSIT",
    "name": "Gatehouse Landing",
    "function": "Transport, travel and bicycle work",
    "summary": "Gatehouse Landing is the useful front door between Pelagia and the wider world. The most valuable thing here may be a clear explanation of a crossing rather than a spectacular view of it.",
    "history": "Mara’s tide-mark explanations connect the station to the work that makes travel legible. The harbor’s engineering history is a history of people translating changing water into workable routines. Later, a tide-safe crossing board becomes a regional program; the exact opening belongs to the game’s passing months.",
    "architecture": "A raised waiting hall meets branching boardwalks, with ticket and information surfaces set back under a deep roof. A bicycle repair area occupies a separate working edge. The public desk is distinct from gates, pumps and other technical systems, preserving a useful boundary between information and inspection.",
    "climateNotes": "Heavy rain, warm humidity and wind over open water make sheltered waiting worthwhile. A covered hall does not remove exposure from the rest of a journey; the live travel preview is the guide to the current game’s weather effects.",
    "civicLife": "Mara and Sefu have verified associations with this transit place. Neri’s later story contact can happen here or through a remote call. A visit keeps the traveler’s existing home, while relocation is a separate apartment decision.",
    "people": [
      {
        "id": "pelagia_mara",
        "relationship": "Confirmed engineering contact associated with transit and its later crossing-board program."
      },
      {
        "id": "sefu",
        "relationship": "Authored transit association. His current local encounters use the community room or park."
      },
      {
        "id": "neri",
        "relationship": "Conditional story meeting or remote-call contact; not a station employee."
      }
    ]
  },
  {
    "id": "pelagia-garden",
    "regionId": "pelagia",
    "regionName": "Pelagia",
    "placeId": "GARDEN",
    "name": "Salt & Seed Garden",
    "function": "Growing, harvest and outdoor rest",
    "summary": "Salt & Seed Garden shows the growing country reaching into Pelagia’s waterside life. Its beds are a practical response to place, with reliable greens sharing attention with a small number of experiments.",
    "history": "Tavi tests ways to grow familiar vegetables near salt water. A failed experimental crop is part of that history, and so is the quieter success of dependable greens feeding people. The garden therefore rewards close looking: an ordinary healthy row can carry more useful knowledge than the most unusual plant.",
    "architecture": "Growing beds sit above the harbor edge, separated by working paths and small shaded pauses. Containers and protected planting areas let growers vary conditions at a manageable scale. A simple greenhouse or covered work area serves the plants rather than competing with the city’s domes.",
    "climateNotes": "Warmth can encourage growth, while heavy rain and saline exposure complicate it. Raised beds, drainage and attention to freshwater give the garden its form. The rural hinterland shares these ecological questions without being reduced to a decorative background.",
    "civicLife": "Tavi can offer company and knowledge without promising every trial will succeed. The later harvest connection with Lio has a particular game opening. A visitor can tend, learn, help with the harvest or rest; sitting quietly does not make them responsible for the whole plot.",
    "people": [
      {
        "id": "pelagia_tavi",
        "relationship": "Confirmed raised-garden grower and experimenter."
      }
    ]
  },
  {
    "id": "pelagia-arcade",
    "regionId": "pelagia",
    "regionName": "Pelagia",
    "placeId": "ARCADE",
    "name": "Pierlight Arcade",
    "function": "Games and social play",
    "summary": "Pierlight Arcade puts indoor play at the edge of the harbor’s working routes. Bright cabinets and a shared tabletop give it a very different atmosphere from the maintenance desks and reading rooms nearby.",
    "history": "Its history is one of a small public room finding a use between arrivals and departures. Games provide a reason to stay after the immediate errand is finished, while a staffed desk keeps the room organized. It is a social venue in its own right, not an invented training simulator for the harbor’s engineering work.",
    "architecture": "A long raised pavilion has a sheltered entrance, a drier enclosed cabinet wall and tables under the broadest part of the roof. Windows frame fragments of the pier rather than exposing every screen to glare. Storage and seating make room for both quick play and a longer group session.",
    "climateNotes": "Humid salt air calls for enclosed equipment and sensible upkeep. Adjustable panels let breezes pass in fair weather and close against monsoon spray; the approach still belongs to the outdoor boardwalk network.",
    "civicLife": "The pleasure here is a game allowed to remain a game. A meetup can gather people whose ordinary days hardly overlap, while a favorite cabinet offers a quieter kind of familiarity. The room adds playful company to the harbor without asking every activity to serve its engineering or ecology.",
    "people": []
  },
  {
    "id": "embermesa-apartments",
    "regionId": "embermesa",
    "regionName": "Ember Mesa",
    "placeId": "APARTMENTS",
    "name": "Longshadow Court",
    "function": "Housing and home life",
    "summary": "Longshadow Court offers a small cluster of homes within Ember Mesa’s otherwise dispersed settlement. The appeal is a porch, a practical kitchen and the chance to be near a shared route without filling the surrounding land with buildings.",
    "history": "Their history follows the railway’s need for modest places to live near its timetable. The apartments retain that compact starting point as the wider town spreads into homesteads, gardens and workshops. An added shade panel or carefully repaired stair tells a domestic story alongside the old station clock.",
    "architecture": "Low timber buildings stand apart enough for air and long views between them. Deep porches shade the doors, while small windows and solid wall areas keep the afternoon sun from reaching every surface. A shared landing is a meeting point rather than an obligation to socialize.",
    "climateNotes": "Dry heat makes shade valuable; cooler evenings can bring people outside again. Dust at a threshold and sunlight on an exposed wall are ordinary maintenance concerns. The porch is shelter, not a claim that the whole route is shaded.",
    "civicLife": "A home-cooked meal or a quiet reset can be its own reason to return. Nearby neighbors do not remove the privacy of a household, and an open porch can be a place to exchange a greeting or enjoy the changing light alone. Domestic life has room for both.",
    "people": []
  },
  {
    "id": "embermesa-work",
    "regionId": "embermesa",
    "regionName": "Ember Mesa",
    "placeId": "WORK",
    "name": "Roster House",
    "function": "Career and regional work",
    "summary": "Roster House is a practical working stop on the rural loop. The building brings desks and bounded paid tasks together while the workshops, gardens and homes around it remain spread out.",
    "history": "The settlement’s history joins an old railway town to modern repair and solar-roof work. These rooms keep that combination visible: a modest former service building can hold contemporary administration without surrendering its weathered proportions. June’s diner-and-repair roster gives regional work here a particularly local purpose.",
    "architecture": "A long, low timber shed has a deep front porch and a simpler service side. The interior divides into desk space, a shared table and storage rather than a row of identical offices. High openings admit light above the working surfaces, with heavier shade on the sun-facing edge.",
    "climateNotes": "The distance between buildings makes exposed arrivals part of a hot day. The shaded threshold provides a pause, and ventilated upper space helps the interior lose heat as the air cools later.",
    "civicLife": "June’s regional shift involves safe desk tasks and coordination; trained repairers handle brakes and wiring. The workrooms support a visitor’s paid contribution without recruiting them into every town responsibility. The same door also leads to the player’s continuing career work.",
    "people": [
      {
        "id": "mesa_june",
        "relationship": "Regional-work contact for the diner and repair roster; specialist repairs remain with trained workers."
      }
    ]
  },
  {
    "id": "embermesa-campus",
    "regionId": "embermesa",
    "regionName": "Ember Mesa",
    "placeId": "CAMPUS",
    "name": "Open Sky College",
    "function": "Courses and peer learning",
    "summary": "Open Sky College keeps learning small enough to belong in a rural settlement. Come for a focused course or a patient group session rather than the spectacle of an enormous academic campus.",
    "history": "Its history grows from the need to learn without leaving every local responsibility behind. A teaching room, a store of shared materials and space to spread out a project can serve many subjects over time. That modest scale gives a returning learner a recognizable doorway rather than another long journey.",
    "architecture": "Several low volumes gather around a shaded entry rather than an enclosed urban quadrangle. Timber screens temper the light; a broad classroom has movable tables and a side room for quieter work. A simple roofline leaves the mesa and open sky as the largest shapes in view.",
    "climateNotes": "Study in the dry heat benefits from deep shade and windows placed for indirect light. Cooler evenings suit a different atmosphere, as the long light gives way to a gentler breeze.",
    "civicLife": "Learners arrive from scattered homes with different practical interests. Peer study makes materials and questions shareable; tutoring recognizes knowledge already earned. The town’s craft culture supplies context, but neither a course nor a visit obliges everyone to want the same trade.",
    "people": []
  },
  {
    "id": "embermesa-career-hub",
    "regionId": "embermesa",
    "regionName": "Ember Mesa",
    "placeId": "CAREER HUB",
    "name": "Next Mile Careers",
    "function": "Career progression and referrals",
    "summary": "Next Mile Careers is a small professional foothold within a wide rural world. Its useful quality is scale: a person can arrive with one application or a portfolio and find a place to consider it.",
    "history": "The desk belongs to the settlement’s newer layer of practical services behind familiar timber fronts. Its history begins with a public table and grows into rooms for private conversation, retaining a plain name people can ask for. It connects local work with larger possibilities without treating leaving town as the only successful outcome.",
    "architecture": "A narrow shopfront under a porch opens into a deeper, quieter interior. The first room holds notices and a worktable; a partition protects interview conversations from people passing along the boardwalk. Simple joinery and a solid shade canopy matter more than a grand reception space.",
    "climateNotes": "The porch reduces sun at the door, and sheltered document storage protects against dust. Long exposed routes elsewhere in the settlement still call for attention to the dry heat and cooler return journey.",
    "civicLife": "Networking and portfolio work offer different ways to consider a next step. The town’s practical culture values a clear account of what someone can do, but a person’s ambitions can reach beyond the work most visible around them. A useful introduction leaves that choice with the visitor.",
    "people": []
  },
  {
    "id": "embermesa-corner-cafe",
    "regionId": "embermesa",
    "regionName": "Ember Mesa",
    "placeId": "CORNER CAFÉ",
    "name": "Last Light Diner",
    "function": "Coffee, food and company",
    "summary": "Last Light Diner is Ember Mesa’s most concentrated intersection of food, repair talk and railway time. June may have more than one apron nearby, but a hot meal deserves a moment of its own.",
    "history": "June’s first repair bench was a diner table after closing. The first badly welded stool remains a reminder that learning begins imperfectly. This practical origin connects the diner with the The Second Try and station without making all three the same building or assuming June can be in every place at once.",
    "architecture": "A timber shopfront, deep porch and broad window give the room a strong street presence. The counter faces a handful of tables; the window table has room for a plant and a second mug. The modest interior leaves the mesa’s long horizon to the view outside.",
    "climateNotes": "The porch shades the bright part of the day, while cooler evening air changes the feel of the same seats. Strong sunset color is an atmosphere, not a promise of an endless warm night.",
    "civicLife": "Kit’s scheduled visits bring drawing and family life into the room. Esperanza also stops after her grocery route, wanting company that does not become another delivery request. The diner can support those ordinary pauses while June’s work has a clear end.",
    "people": [
      {
        "id": "mesa_june",
        "relationship": "Confirmed diner cook, bicycle repairer and station announcer; no broader property ownership is stated."
      },
      {
        "id": "kit",
        "relationship": "Recurring diner visitor; artist and parent with a changing schedule."
      },
      {
        "id": "esperanza_vega",
        "relationship": "Scheduled café visitor taking a break from her grocery-van route."
      }
    ]
  },
  {
    "id": "embermesa-community",
    "regionId": "embermesa",
    "regionName": "Ember Mesa",
    "placeId": "COMMUNITY",
    "name": "Waterwise Hall",
    "function": "Pantry, volunteering and neighborhood projects",
    "summary": "Waterwise Hall gives Ember Mesa’s scattered households a shared indoor address. It is worth visiting for practical conversation and small gatherings that do not have to fit on one person’s porch.",
    "history": "Inez’s account of saving water through meetings rather than heroic promises captures the hall’s civic character. The room belongs to the patient work of agreeing what can be maintained and who can reasonably help. It also holds company with no proposal to approve: a drawing, a family visit or a pause between errands.",
    "architecture": "A freestanding timber hall has a broad pitched roof, a shaded veranda and a straightforward open floor. Folding tables can move between workshops and shared food. A quieter family corner sits away from the working end, with storage that lets an event finish rather than remain permanently half set up.",
    "climateNotes": "Deep shade, high vents and a roof that throws water clear suit a dry climate with occasional weather to take seriously. The approaches are open country routes, not a continuous sheltered urban arcade.",
    "civicLife": "Inez is associated with community, library and garden life. Kit and Bea may share a brief family moment here when their schedule permits; the adult remains responsible for care. A useful hall leaves room for people to decline the next job.",
    "people": [
      {
        "id": "mesa_inez",
        "relationship": "Confirmed library and garden coordinator with community-hall associations."
      },
      {
        "id": "kit",
        "relationship": "Recurring community-hall visitor and parent."
      },
      {
        "id": "bea",
        "relationship": "Toddler appearing with Kit in a safe, shaded family corner when the current schedule permits."
      }
    ]
  },
  {
    "id": "embermesa-park",
    "regionId": "embermesa",
    "regionName": "Ember Mesa",
    "placeId": "THE PARK",
    "name": "Cottonwood Park",
    "function": "Outdoor rest and recreation",
    "summary": "Cottonwood Park makes a small patch of shade feel significant against the open mesa. It is a place to sit, read or take a measured walk without pretending the surrounding desert is a broad green lawn.",
    "history": "Its history is one of choosing where a settlement can care for trees and leave ground open. The park’s value grows from restraint: a few established shade places and worn routes can serve neighbors better than an ambitious landscape nobody has time or water to maintain. It gives outdoor pleasure a public place in a craft-centered town.",
    "architecture": "Cottonwoods gather over selected sitting areas, with sparse planting and unpaved routes between them. The boundaries remain visually open to the wider land. A small sheltered pause sits within the landscape rather than trying to wall off the horizon.",
    "climateNotes": "Shade is uneven and the dry heat is real; cooler parts of a day have a different appeal. Paths can be dusty, and seasonal weather changes the experience. A described shelter does not certify every approach as physically accessible.",
    "civicLife": "Kit appears here on their recurring schedule, with art and life beyond the repair culture around them. Reading under a tree can be a complete outing. The park offers rest independently of any contribution to the town garden.",
    "people": [
      {
        "id": "kit",
        "relationship": "Recurring park visitor; no park-staff role is stated."
      }
    ]
  },
  {
    "id": "embermesa-library",
    "regionId": "embermesa",
    "regionName": "Ember Mesa",
    "placeId": "LIBRARY",
    "name": "Seed & Story Library",
    "function": "Reading, learning and archives",
    "summary": "Seed & Story Library is the mesa’s small store of stories and practical exchange. Inez may have novels, tools and growing advice within reach, but each kind of lending begins with a manageable promise.",
    "history": "Inez’s seed-loan idea asks a grower to bring back seeds if a plant succeeds. Her water-saving work grew through ordinary meetings, with maintenance valued more than a grand opening. That history makes the library a place to compare what actually worked, while later water-wise exchange changes still have their own game timing.",
    "architecture": "A low timber reading room sits behind a shaded street front. Shelves occupy the cooler interior walls, and a long table offers room for a book, a notebook or a clearly labeled packet. Tools and seed packets give some of the storage a practical life beside the shelves.",
    "climateNotes": "A deep porch limits glare before it reaches the windows. Dust protection and dry storage matter even when rain is infrequent; books also benefit from avoiding the hottest direct sun.",
    "civicLife": "Inez’s care connects this room with the separate The Patient Patch. Borrowing knowledge is not the same as volunteering indefinitely. A reader can stay with a novel, join a discussion or use learning resources without being recruited into a growing experiment.",
    "people": [
      {
        "id": "mesa_inez",
        "relationship": "Confirmed librarian and garden coordinator; lends novels, tools and practical growing advice in the established biography."
      }
    ]
  },
  {
    "id": "embermesa-market",
    "regionId": "embermesa",
    "regionName": "Ember Mesa",
    "placeId": "MARKET",
    "name": "Sundown Exchange",
    "function": "Food, stalls and casual work",
    "summary": "Sundown Exchange is a modest supply point for a town whose households are spread across open land. Food, a stall conversation and a useful secondhand find give the stop its everyday appeal.",
    "history": "The railway gives the market a connection beyond the mesa, while local gardens contribute on a smaller scale. Its history grows from goods being gathered where people already need to pass, then making room for cooks and temporary sellers. The later evening supper tables are a regional development rather than a permanent first-day festival.",
    "architecture": "A cluster of shallow timber stalls sits beneath a long shared awning. Open sides allow the market to remain part of the street; enclosed stores protect what cannot sit in the heat. Temporary tables have a clear place without requiring another large building.",
    "climateNotes": "Shade matters most through dry, bright hours. Cooler evenings make the same market edge sociable in a different way, while covered storage protects supplies from dust and occasional rain.",
    "civicLife": "June’s later supper program borrows tables and relies on a shared roster. The market’s ordinary food and work activities continue around that use. A customer can enjoy what is available without assuming a whole rural supply network depends on their purchase or help.",
    "people": [
      {
        "id": "mesa_june",
        "relationship": "Associated with the later evening-supper-table program; not stated to own the market."
      }
    ]
  },
  {
    "id": "embermesa-fitness",
    "regionId": "embermesa",
    "regionName": "Ember Mesa",
    "placeId": "FITNESS",
    "name": "Good Pace Studio",
    "function": "Movement and recovery",
    "summary": "Good Pace Studio gives Ember Mesa an indoor alternative to its long outdoor routes. Come for a gentle class, company while training or deliberate recovery after an energy-demanding month.",
    "history": "The studio’s history is a practical conversion: a roomy service shed becomes useful for movement once storage is brought under control. It retains a rural town’s preference for a building that can do several jobs well, rather than presenting exercise as a resort experience detached from ordinary work.",
    "architecture": "A long timber room sits under a broad insulated roof, with screened high openings and a deep entrance porch. Mats and equipment have dedicated storage along one side. A compact desk marks arrival, while a more enclosed corner supports quieter recovery.",
    "climateNotes": "Indirect light and shade reduce afternoon glare. Ventilation suits cooler hours, while the solid roof and enclosed areas provide a more protected setting than the open dirt-track loop. The studio’s shelter does not make the entire journey indoors.",
    "civicLife": "Joining a class offers a different kind of company from the repair bench or garden rota. Some people want shared effort; others want a structured pause after a busy month. The studio’s appeal rests in giving both a place within the mesa’s otherwise open, dispersed daily routes.",
    "people": []
  },
  {
    "id": "embermesa-makerspace",
    "regionId": "embermesa",
    "regionName": "Ember Mesa",
    "placeId": "MAKERSPACE",
    "name": "The Second Try",
    "function": "Repair, making and craft",
    "summary": "The Second Try wears a practical solar-roof layer above Ember Mesa’s familiar timber streetscape. It is the place to look closely at a repaired joint, a useful offcut and the difference between trying a task and being trained for it.",
    "history": "June’s first repair bench was a diner table after closing, and her early welded stool remains a reminder of learning by doing. The separate repair shop gives that work a proper place as it becomes part of the town’s routine. Its history values teaching enough to let more than one person carry a repair roster.",
    "architecture": "A broad workshop door opens beneath a deep shade canopy. Benches run across the daylight rather than into the strongest glare; labeled storage keeps parts out of the dust. Solar panels sit plainly on the roof, making a modern addition without disguising the older timber shell.",
    "climateNotes": "Shade protects both people and stored materials from the dry heat. Open work edges can catch dust, so closable panels and covered tool storage matter. Cooler air changes the workshop’s comfort and the light on its timber front.",
    "civicLife": "June is a confirmed bicycle repairer, but a visitor’s permitted bench activities follow their actual skill and craft levels. The regional roster keeps trained brakes and wiring work with qualified repairers. Practical enthusiasm does not remove those boundaries.",
    "people": [
      {
        "id": "mesa_june",
        "relationship": "Confirmed bicycle repairer associated with the makerspace; safe visitor tasks remain distinct from trained repairs."
      }
    ]
  },
  {
    "id": "embermesa-cinema",
    "regionId": "embermesa",
    "regionName": "Ember Mesa",
    "placeId": "CINEMA",
    "name": "Frontier Picture House",
    "function": "Films and discussion",
    "summary": "Frontier Picture House offers a dark room and a shared story beneath Ember Mesa’s huge sky. Its old-fashioned name belongs to a small modern community cinema, not a demand that local life remain in the past.",
    "history": "Its history follows a modest entertainment room built into the railway town’s street front. Chairs and fittings are repaired over time, while the films and audience keep changing. The town’s craft culture has a place here in the upkeep, but an evening at the cinema can be free of any useful task.",
    "architecture": "A tall false-front timber façade gives the entrance more presence than the low auditorium behind it. A small canopy protects poster cases and the ticket window. Inside, curtains and closely grouped seats create a deliberate contrast with the wide, exposed routes outside.",
    "climateNotes": "The enclosed screen room reduces glare and gives shelter from dry wind. A shaded foyer eases the transition back outside; cooler evenings can arrive quickly even after a hot afternoon.",
    "civicLife": "A matinee and a film discussion ask different things of a visitor, and staying to talk is optional. The picture house’s close-seated atmosphere contrasts with a town hall gathering or a porch conversation. Walking back into the wide sky is part of what makes the enclosed room memorable.",
    "people": []
  },
  {
    "id": "embermesa-transit",
    "regionId": "embermesa",
    "regionName": "Ember Mesa",
    "placeId": "TRANSIT",
    "name": "Mesa Rail Station",
    "function": "Transport, travel and bicycle work",
    "summary": "Mesa Rail Station gathers an expansive settlement around a practical timetable. Its old clock and shaded waiting edge are memorable, but the reason to come is still an ordinary journey.",
    "history": "June announces the afternoon train as well as cooking and repairing bicycles. Her overlapping roles explain the station’s human connection to the diner and workshop. The later shared repair roster changes how that work is distributed; it grows through the regional story rather than making June perpetually available at every desk.",
    "architecture": "A timber station building faces a long covered platform edge. The clock gives the modest roofline a vertical marker, while noticeboards and a waiting bench remain close to the entrance. Bicycle work has a defined corner rather than occupying the passenger route.",
    "climateNotes": "Open land exposes the approach to dry heat, wind and dust. The roof offers meaningful shade once reached; cooler evenings bring a different kind of wait. Nothing in the view guarantees that a long rural route is fully sheltered.",
    "civicLife": "The station is a meeting point for people who may live far apart. June’s presence follows the game’s current placement, and Neri’s story contact may be a remote call. Taking a trip keeps the traveler’s home contract until a separate relocation decision is made.",
    "people": [
      {
        "id": "mesa_june",
        "relationship": "Confirmed station announcer and bicycle repairer."
      },
      {
        "id": "neri",
        "relationship": "Conditional transit story contact; may be remote rather than physically present."
      }
    ]
  },
  {
    "id": "embermesa-garden",
    "regionId": "embermesa",
    "regionName": "Ember Mesa",
    "placeId": "GARDEN",
    "name": "The Patient Patch",
    "function": "Growing, harvest and outdoor rest",
    "summary": "The Patient Patch is a deliberately modest place to grow food where water matters. Visit for the detail of a bed, a saved seed and the patient choices behind a reliable harvest.",
    "history": "Inez helped the town save water without abandoning its shared garden. The solution involved meetings and practical changes rather than one heroic promise. Her seed-library approach makes success conditional and shareable: bring seeds back if the plant grows. Failure remains something to learn from rather than conceal.",
    "architecture": "Small beds sit close to stored water and a shaded working area. Mulched surfaces, simple covers and clearly separated paths keep the garden compact. Sparse planting beyond the cultivated patches lets it belong to the arid mesa instead of resembling a transplanted ornamental park.",
    "climateNotes": "Dry heat, strong sun and cooler nights shape what growers attempt. Shade and careful watering work at bed scale; the garden does not claim to change the whole region’s climate. The quieter greenhouse edge provides a different pause from the working beds.",
    "civicLife": "Inez connects the garden with Seed & Story Library while leaving them separate destinations. A visitor can learn, tend, help harvest or rest without guaranteeing next season’s crop. The later water-wise seed exchange has its own regional opening, alongside the ordinary work that already happens here.",
    "people": [
      {
        "id": "mesa_inez",
        "relationship": "Confirmed garden coordinator and librarian associated with water-wise growing."
      }
    ]
  },
  {
    "id": "embermesa-arcade",
    "regionId": "embermesa",
    "regionName": "Ember Mesa",
    "placeId": "ARCADE",
    "name": "One More Round",
    "function": "Games and social play",
    "summary": "One More Round is a pocket of indoor brightness beside Ember Mesa’s long open routes. Come for a familiar cabinet or a seat at a table where the evening can be pleasantly unproductive.",
    "history": "Its history follows a timber-front room kept useful through careful repairs and changing games. A game cabinet can become a town favorite without becoming a historic relic; a tabletop night can gather people who spent the day far apart. The boardwalk name describes its street setting, not a coastal amusement pier.",
    "architecture": "A shallow porch fronts a deeper room, with cabinets along solid walls and tables beneath the broad roof span. The desk sits near the entrance, and chairs can be rearranged for different group sizes. Warm interior light gives the weathered front a different character after the bright outdoor day.",
    "climateNotes": "The porch shades the door but does not shelter the whole rural approach. Dust screens and covered equipment storage suit the dry wind; cooler nights can make the journey home feel unlike the arrival.",
    "civicLife": "The venue offers a particular kind of rural sociability: people arrive from separate routes and share a table for a while. A favorite game needs no grand occasion, and an evening can be worth the journey even when nothing is repaired, planted or produced before everyone goes home.",
    "people": []
  }
];
export const guideItems:GuideItem[]=[
  {
    "id": "kestrel_breakfast_tea",
    "name": "Kestrel No. 2 Breakfast Tea",
    "kind": "Shared pantry staple",
    "summary": "An ordinary blue packet turns up beside café cups, film discussions and a mender’s button tin.",
    "description": [
      "Kestrel No. 2 comes in a blue packet with a cream bird and a broad white strength panel. It is an everyday black-tea blend, usually measured by spoon rather than discussed as a luxury. The refill packet folds down neatly; older metal tins explain why the bird also appears among Oren’s buttons.",
      "Tess brews it strongly enough for customers adding milk. Ada wants a pot that can accompany conversation after a screening. Miro prefers a lighter cup and is willing to say when somebody has left it too long. These are different uses of a familiar product, not a single correct regional way to drink it. Each household or venue owns its purchased supply."
    ],
    "history": [
      "Kestrel’s tea and biscuits travel through ordinary grocers across several towns. Oren’s saved tins already connect tea packaging with his family’s button-saving habit. The current blend gives that packaging an everyday source. Running out before the discussion ends, buying the wrong strength or returning a useful tin could make this modest packet matter without a grand event being attached to it."
    ],
    "regionIds": [
      "alder",
      "saffron",
      "glasssteppe"
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
    "venueIds": [
      "alder-corner-cafe",
      "saffron-cinema",
      "glasssteppe-corner-cafe"
    ],
    "storyStatus": "established_object",
    "gameStatus": "worldbuilding",
    "ownership": {
      "ownerLabel": "Purchased separately by households and venues; no single communal packet."
    },
    "brandId": "kestrel",
    "brandIds": [
      "kestrel"
    ],
    "brand": "Kestrel",
    "brandRole": "Kestrel makes the tea; customers own their purchased packs and reuse tins in their own ways.",
    "placeNote": "Sold and brewed in several towns; linked venues indicate recurring everyday use."
  },
  {
    "id": "last_crossing_board",
    "name": "The Last Crossing Board",
    "kind": "Café chalkboard",
    "summary": "Tess’s window board puts supper and the final ferry in the same glance.",
    "description": [
      "The café window holds a narrow Gullwing blackboard with two ruled halves: something warm to eat on the left, the last crossing on the right. A brass ferry silhouette at the top is rubbed bright along its bow. Tess leaves enough space to correct a time cleanly; an attractive swirl of lettering would be little use if a hurried passenger misread it.",
      "The Last Crossing Board belongs to the café and stays under Tess’s care. Nico’s hand-drawn pretend tickets sometimes accompany family play at the window, but they remain recognizably pretend and separate from the travel information adults use."
    ],
    "history": [
      "Tess took over a café rhythm already measured by ferry bells, then added dispatch work to her day. The board lets those two kinds of knowledge meet in one useful place. Supper changes; crossing information may need a correction. Its worn ferry ornament remains familiar through both. A mistaken update would matter because people rely on it, making an ordinary eraser as consequential as the chalk."
    ],
    "regionIds": [
      "alder"
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
    "venueIds": [
      "alder-corner-cafe",
      "alder-transit"
    ],
    "storyStatus": "established_object",
    "gameStatus": "worldbuilding",
    "ownership": {
      "ownerLabel": "Tess’s café",
      "keeperIds": [
        "alder_tess"
      ],
      "ownerIds": [
        "alder_tess"
      ]
    },
    "brandId": "gullwing",
    "brandIds": [
      "gullwing"
    ],
    "brand": "Gullwing",
    "brandRole": "Gullwing makes the wipe-clean café board; Tess supplies and controls its information.",
    "placeNote": "Kept at Ferry Corner Café; its information concerns Alder Ferry & Rail."
  },
  {
    "id": "two_load_basket",
    "name": "Rowan’s Two-Load Basket",
    "kind": "Bicycle basket",
    "summary": "Library books and young plants travel together without having to share the damp.",
    "description": [
      "Rowan’s bicycle carries a deep Dalloway Two-Load wicker basket with a removable green divider. A dry, buttoned canvas sleeve fits against one side; the other has a washable tray for seedlings. The divider never quite sits straight, and a repaired pale strip near the handle makes the basket easy to recognize when the bicycle is parked among others.",
      "The Two-Load Basket is Rowan’s own carrying equipment. Books inside are still library returns, while plants may belong to Rowan or to whoever has brought them for the seed swap. The basket’s apparent abundance does not make all its contents available to take."
    ],
    "history": [
      "Rowan’s seed swap began beside the library returns trolley, with more empty pots than gardeners. The basket belongs to the same modest traffic in useful things: take something where it is needed and bring back what is due. Its wet and dry compartments allow those tasks to share a journey. The pale repair strip records continued use; its maker and repairer remain unnamed."
    ],
    "regionIds": [
      "alder"
    ],
    "people": [
      {
        "id": "alder_rowan",
        "relationship": "Owner and everyday rider"
      }
    ],
    "venueIds": [
      "alder-library",
      "alder-garden"
    ],
    "storyStatus": "established_object",
    "gameStatus": "worldbuilding",
    "ownership": {
      "ownerIds": [
        "alder_rowan"
      ]
    },
    "brandId": "dalloway",
    "brandIds": [
      "dalloway"
    ],
    "brand": "Dalloway",
    "brandRole": "Dalloway makes the Two-Load bicycle basket; books and seedlings have separate owners.",
    "placeNote": "Travels between Brickhouse Library and Willowbank Allotments; it is not a fixed display."
  },
  {
    "id": "after_hours_atlas",
    "name": "Bram’s After-Hours Atlas",
    "kind": "Working route notebook",
    "summary": "A map is only useful if its gate is open when someone gets there.",
    "description": [
      "Bram’s dark-green Rainline Night-Pocket notebook is thickened by folded cleaning rosters, their printed shifts still visible behind penciled streets. A crescent means a useful seat; a little roof means shelter. Closing times are written beside gates, with the date Bram last checked them. The elastic has stretched enough that he knots it once before putting the book away.",
      "He calls it the After-Hours Atlas without pretending it covers everything. A route may need another walk, and a penciled question is kept visible until he has an answer. Someone copying a page needs the date as much as the street name."
    ],
    "history": [
      "Bram first drew night routes on the backs of cleaning rosters. A promised shortcut that ended at a locked gate made opening hours, seats and shelter central to his work. The notebook preserves that correction-minded approach. Comparing a page with Ren’s highland directions, or discussing its marks with Neri, could be worthwhile. Neither meeting has to be invented to make Bram’s existing maps interesting."
    ],
    "regionIds": [
      "alder"
    ],
    "people": [
      {
        "id": "bram",
        "relationship": "Mapmaker, owner and reviser"
      }
    ],
    "venueIds": [
      "alder-transit",
      "alder-park"
    ],
    "storyStatus": "established_object",
    "gameStatus": "worldbuilding",
    "ownership": {
      "ownerIds": [
        "bram"
      ]
    },
    "brandId": "rainline",
    "brandIds": [
      "rainline"
    ],
    "brand": "Rainline",
    "brandRole": "Rainline makes the Night-Pocket notebook; Bram makes the After-Hours Atlas inside it.",
    "placeNote": "A personal notebook about night travel, including transit routes and places to rest."
  },
  {
    "id": "kestrel_button_tin",
    "name": "Oren’s Kestrel Tea Tin",
    "kind": "Button collection and keepsake",
    "summary": "A worn tea tin carries useful fastenings and a family habit across two towns.",
    "description": [
      "A cream kestrel spreads its wings across the blue lid of Oren’s square tea tin. The rim is chipped, and the bird nearly disappears when the tin is open beside a coat. Inside are horn-colored, pearl-colored and plain dark buttons, with larger ones nested in a shallow paper tray. Oren chooses by weight, size and use, rather than by how grand a replacement looks.",
      "The emptied Kestrel Tea packaging has outlasted its contents. This particular tin belongs to Oren. Miro shares the family history around saved buttons; that connection gives him no claim over what Oren makes or keeps."
    ],
    "history": [
      "The brothers’ relatives saved useful fastenings and moved tins between households near the Veyran railway. Oren brought that practice into his adult life in Alder. No single ancestor has been named as this tin’s giver; its family connection rests in the continuing habit. Oren can leave it closed, mend a coat, or work on miniature scenery according to his own inclination and energy."
    ],
    "regionIds": [
      "alder",
      "glasssteppe"
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
    "venueIds": [
      "alder-makerspace",
      "glasssteppe-makerspace"
    ],
    "storyStatus": "established_object",
    "gameStatus": "worldbuilding",
    "ownership": {
      "ownerIds": [
        "oren"
      ]
    },
    "brandId": "kestrel",
    "brandIds": [
      "kestrel"
    ],
    "brand": "Kestrel",
    "brandRole": "Kestrel originally sold tea in the tin; Oren’s saved buttons are a separate family collection.",
    "image": {
      "src": "items/kestrel-tin.webp",
      "alt": "A chipped blue-and-cream Kestrel Tea tin holding mixed coat buttons.",
      "type": "object_portrait"
    },
    "placeNote": "A private family object connecting Alder mending and Glasssteppe craft; the makerspaces are contextual links, not its storage address."
  },
  {
    "id": "rainline_notebook",
    "name": "Priya’s Rainline No. 3",
    "kind": "Weather notebook",
    "summary": "A weatherproof wrapper protects observations that can remain honestly unfinished.",
    "description": [
      "Rainline No. 3 is a plain oatmeal-colored notebook inside a cloudy Whaleskin Clearfold cover. A blue cord closes the flap; the corners of the paper stay dry even when the cover has to be wiped before Priya opens it. The number identifies the stationery model; the pages have their own unnumbered rhythms. Her notes leave room beside an observation for a later correction.",
      "Some pages hold the sort of concise record her working years required. Others attend to rain on railings, roofing and water without trying to turn every sound into a prediction. Priya decides which pages to share."
    ],
    "history": [
      "Weather-reporting work brought Priya from Pelagia to Bellweather, along with the habits needed to carry a readable record through bad weather. Retirement has given those habits a less hurried purpose. The notebook can keep a useful observation or a sound worth remembering. Comparing it with Tavi’s growing notes is a possibility, not an exchange that has already taken place or a promise about anyone’s harvest."
    ],
    "regionIds": [
      "alder",
      "pelagia"
    ],
    "people": [
      {
        "id": "priya",
        "relationship": "Owner and observer"
      }
    ],
    "venueIds": [
      "alder-park",
      "alder-transit"
    ],
    "storyStatus": "established_object",
    "gameStatus": "worldbuilding",
    "ownership": {
      "ownerIds": [
        "priya"
      ]
    },
    "brandId": "rainline",
    "brandIds": [
      "rainline",
      "whaleskin"
    ],
    "brand": "Rainline notebook; Whaleskin Clearfold sleeve",
    "brandRole": "Rainline makes the No. 3 notebook and Whaleskin makes its Clearfold sleeve; Priya writes the contents.",
    "placeNote": "Carried on Priya’s walks in Alder; Pelagia is part of its owner’s history, not a second fixed location."
  },
  {
    "id": "first_shift_griddle",
    "name": "Leila’s First Shift Griddle",
    "kind": "Portable cooking equipment",
    "summary": "One compact cooking surface became the beginning of Leila’s market work.",
    "description": [
      "Leila’s Gullwing First Shift is a squat black portable griddle with two short handles and a rubbed copper maker’s plaque. One edge has a shallow lip that makes its silhouette recognizable beneath a folded wrapper. The seasoned cooking surface shows use without being treated as a precious relic. Leila can appreciate what it started and still need equipment that earns its space.",
      "First Shift is its model name, apt enough that customers use it as the griddle’s own name. It belongs to Leila. Tomas’s place in its story is as her brother, not an invented claim that he built or maintained the cooker."
    ],
    "history": [
      "Leila’s market work began with one portable griddle beside the early boat shift. She asked crews which fillings survived the rolling deck and used their answers to improve breakfast. That feedback connects the cooking surface to the meal’s whole journey. A recipe can succeed in front of the cook and disappoint the person unwrapping it later. The griddle’s history is in the adjustments that closed that gap."
    ],
    "regionIds": [
      "saffron"
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
    "venueIds": [
      "saffron-market",
      "saffron-transit"
    ],
    "storyStatus": "established_object",
    "gameStatus": "worldbuilding",
    "ownership": {
      "ownerIds": [
        "saffron_leila"
      ]
    },
    "brandId": "gullwing",
    "brandIds": [
      "gullwing"
    ],
    "brand": "Gullwing",
    "brandRole": "Gullwing makes the First Shift griddle.",
    "image": {
      "src": "items/first-shift-griddle.webp",
      "alt": "Leila’s compact black griddle with two short handles, a copper plaque and a folded food wrapper.",
      "type": "object_portrait"
    },
    "placeNote": "Associated with Leila’s market cooking and departing boat crews."
  },
  {
    "id": "six_chair_screen",
    "name": "The Six-Chair Screen",
    "kind": "Borrowed cinema sheet",
    "summary": "Ada’s first screen remembers an evening whose conversation outlasted its film.",
    "description": [
      "The Six-Chair Screen is an ordinary pale sheet with a narrow green laundry stripe along one edge. Hung flat, the stripe sits just outside the projected image; folded, it becomes the easiest way to recognize the bundle. Its name recalls the number of seats at Ada’s first film night rather than a limit on who may join a later gathering.",
      "Ada borrowed the sheet. The original lender has not been named, and organizing the screening did not transfer ownership. Inés belongs to the cinema’s present circle and wants to introduce a film herself; she is not silently written into the earlier event."
    ],
    "history": [
      "The first evening’s projector needed cooling between reels, and Leila brought food. Discussion continued longer than the picture. The sheet and six chairs made a place to begin without making the beginning grander than it was. Whether the same sheet comes out again, or another screen takes its place, can change the evening’s practical arrangements without erasing the little gathering from which Ada’s cinema work grew."
    ],
    "regionIds": [
      "saffron"
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
    "venueIds": [
      "saffron-cinema",
      "saffron-community"
    ],
    "storyStatus": "established_object",
    "gameStatus": "worldbuilding",
    "ownership": {
      "ownerLabel": "Unnamed original lender",
      "borrowerIds": [
        "saffron_ada"
      ],
      "currentCustody": "Unspecified"
    },
    "placeNote": "Historically associated with Ada’s courtyard screenings; its current keeper is unspecified."
  },
  {
    "id": "nine_locks",
    "name": "Nine Locks",
    "kind": "Handmade tabletop game",
    "summary": "Sami’s rounded tile pieces make a small canal game inviting enough to question.",
    "description": [
      "Nine Locks fits inside a shallow box: a blue-and-cream board, rounded terracotta and teal counters, and a rule card that folds into the lid. Sami makes the pieces from safe offcuts with comfortable edges. A row of nine pale lock shapes gives the game its name and makes the board recognizable before anyone explains a turn.",
      "This demonstration set belongs to Sami. Vera may use or borrow it by agreement. It is distinct from the game box she carries between her parents’ homes, with its own inventory of misplaced pieces. Her curiosity is useful feedback, but she is free to care about winning as well as design."
    ],
    "history": [
      "Sami began making games from safe offcuts after tile restoration had taught him about edges and fit. A crowded game night prompted a further ambition: a board that would welcome someone without a speech. Vera’s questions about how pieces move meet that ambition usefully, even when she argues for a rule he doubts. The final rules and any tournament outcome remain open; a handsome set is only the beginning of a good game."
    ],
    "regionIds": [
      "saffron"
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
    "venueIds": [
      "saffron-makerspace",
      "saffron-arcade",
      "saffron-community"
    ],
    "storyStatus": "established_object",
    "gameStatus": "worldbuilding",
    "ownership": {
      "ownerIds": [
        "sami"
      ],
      "makerIds": [
        "sami"
      ]
    },
    "image": {
      "src": "items/nine-locks.webp",
      "alt": "A handmade blue-and-cream tabletop board with rounded terracotta and teal counters and a folded rule card.",
      "type": "object_portrait"
    },
    "placeNote": "A demonstration set used in making and tabletop play; it travels with permission."
  },
  {
    "id": "gullwing_lunch_tin",
    "name": "Tomas’s Gullwing Lunch Tin",
    "kind": "Everyday lunch container",
    "summary": "A sister-packed lunch tin connects old engine work with new lessons.",
    "description": [
      "The blue Gullwing tin has a white gull stamped into its lid and a latch polished bright by Tomas’s thumb. A dent on one corner means the lid settles with a small sideways nudge. Inside, a removable divider keeps a wrapped meal clear of a piece of fruit. Its age is evident in the enamel, not in any failure to keep lunch usable.",
      "Gullwing makes ordinary kitchenware. Tomas owns and carries this tin. Leila once packed it for him; that familiar detail does not establish who purchased it or make her responsible for his meals now."
    ],
    "history": [
      "When electric ferries brought new systems to the canals, Tomas went back to night classes with this same battered tin. The new material required effort after a working day, while the lunch container belonged to an older routine with Leila. Maintenance dates, course notes and a packed meal could occupy the same bench. The tin’s usefulness is simple: something familiar and serviceable carried into another stretch of learning."
    ],
    "regionIds": [
      "saffron"
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
    "venueIds": [
      "saffron-work",
      "saffron-campus"
    ],
    "storyStatus": "established_object",
    "gameStatus": "worldbuilding",
    "ownership": {
      "ownerIds": [
        "saffron_tomas"
      ]
    },
    "brandId": "gullwing",
    "brandIds": [
      "gullwing"
    ],
    "brand": "Gullwing",
    "brandRole": "Gullwing makes the lunch tin.",
    "placeNote": "Travels with Tomas between canal work and study."
  },
  {
    "id": "first_ferry_broth_pot",
    "name": "Lio’s First Ferry Pot",
    "kind": "Shared food and stockpot",
    "summary": "Ginger broth, a changing chalk line and a familiar pot make an early harbor meal.",
    "description": [
      "Lio’s First Ferry Pot is a broad Gullwing stockpot with dark-blue handles and a lid that rests securely beside the serving space. Ginger gives the broth its familiar starting point. Vegetables and other ingredients change with the deliveries, and Lio writes that day’s contents in chalk where a customer can read them before ordering.",
      "Lio keeps and uses the pot. Mara and Sefu may arrive with different amounts of time to eat; neither needs the bowl turned into a performance of gratitude. Tavi’s vegetables can contribute when a suitable harvest is available and a supply is agreed. The chalk list stays specific rather than letting a familiar name imply an identical recipe."
    ],
    "history": [
      "The stall began with a pot shared among the first ferry shift. Storm-delayed boats taught Lio to cook from the supplies that had actually arrived. The named Gullwing pot gives the routine a recognizable vessel, while its real continuity is the work of tasting, serving and making tomorrow’s meal dependable. A changed ingredient is ordinary harbor news, worth explaining clearly."
    ],
    "regionIds": [
      "pelagia"
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
    "venueIds": [
      "pelagia-market",
      "pelagia-corner-cafe",
      "pelagia-transit",
      "pelagia-garden"
    ],
    "storyStatus": "established_object",
    "gameStatus": "worldbuilding",
    "ownership": {
      "ownerIds": [
        "pelagia_lio"
      ]
    },
    "brandId": "gullwing",
    "brandIds": [
      "gullwing"
    ],
    "brand": "Gullwing",
    "brandRole": "Gullwing makes the stockpot; Lio makes the broth and chooses each batch’s contents.",
    "placeNote": "Used in Lio’s harbor food routine; garden link identifies a possible local ingredient source, not a guaranteed supply contract."
  },
  {
    "id": "tide_mill_bridge_flour",
    "name": "Tide Mill Bridge Flour",
    "kind": "Baking staple",
    "summary": "The same striped flour bag can lead to Hugo’s loaf or Leila’s portable breakfast.",
    "description": [
      "Tide Mill Bridge Flour comes in a cream paper sack crossed by two broad teal stripes. A larger trade bag carries the same design, so a café kitchen and a household shelf can be recognized as buying the same staple. It is an ordinary wheat flour; the sack does not promise that a recipe will manage itself.",
      "Hugo notices how the dough feels and adjusts his working notes accordingly. Leila values a flour that makes a pliable griddle bread capable of holding a filling on a moving boat. Eli is happy to bring a less polished loaf to a shared meal. A familiar brand gives them something concrete to compare without making their methods interchangeable."
    ],
    "history": [
      "Tide Mill grew through supplying grains to working-port stores. Hugo’s repeated batches and margin notes, Leila’s griddle cooking and Eli’s shared suppers provide different destinations for its flour. Those people buy their own supplies; they do not hold a single collective sack. A missing delivery or a mistaken bag size could pass through several kitchens before becoming anybody’s grand story."
    ],
    "regionIds": [
      "alder",
      "saffron"
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
    "venueIds": [
      "alder-market",
      "alder-corner-cafe",
      "saffron-market"
    ],
    "storyStatus": "established_object",
    "gameStatus": "worldbuilding",
    "ownership": {
      "ownerLabel": "Bought in separate household and trade quantities."
    },
    "brandId": "tide_mill",
    "brandIds": [
      "tide_mill"
    ],
    "brand": "Tide Mill",
    "brandRole": "Tide Mill supplies the wheat flour; individual cooks own their purchases and make their own food.",
    "placeNote": "A staple stocked through market suppliers and used in ordinary baking."
  },
  {
    "id": "copperleaf_fox",
    "name": "Copperleaf the Fox",
    "kind": "Child’s hand puppet",
    "summary": "Natsumi’s fox has an extravagant tail and a strong opinion about when the story should begin.",
    "description": [
      "Copperleaf is a russet soft hand puppet with a cream muzzle and a tail nearly as showy as the fox itself. Uneven red stitching marks the tail’s attachment. The name is Natsumi’s to keep or change, along with the fox’s voice, clothes and willingness to enter a forest. A purple coat can matter more to her than an adult’s tidy repair explanation.",
      "The puppet belongs to Natsumi. Sora handles tools and the safe attachment of parts; Natsumi can ask for help while disagreeing about the result. Akira’s grand voices are welcome until he forgets which animal is shy. Hana may quite reasonably ask where the story is going."
    ],
    "history": [
      "The fox’s first tail fell off before a story reached the forest. Natsumi declared it asleep and postponed the matter until the next afternoon. Getting the tail to last is still more interesting to her than a solemn account of what the repair means. The fox can enter another story when she wants; being a favorite toy does not require a finished show or an audience on demand."
    ],
    "regionIds": [
      "glasssteppe"
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
    "venueIds": [
      "glasssteppe-community",
      "glasssteppe-park"
    ],
    "storyStatus": "established_object",
    "gameStatus": "worldbuilding",
    "ownership": {
      "ownerIds": [
        "natsumi_mori"
      ],
      "adultCareIds": [
        "glass_sora"
      ]
    },
    "image": {
      "src": "items/copperleaf-fox.webp",
      "alt": "A soft russet fox hand puppet with a cream muzzle, floppy tail and visible red repair stitching.",
      "type": "object_portrait"
    },
    "placeNote": "Can accompany supervised family play; it is kept with Natsumi rather than installed at either venue."
  },
  {
    "id": "kestrel_ferry_mix",
    "name": "Kestrel Ferry Mix",
    "kind": "Shared savory snack",
    "summary": "Blue paper packets hold salted biscuit pieces that turn a waiting interval into something companionable.",
    "description": [
      "Ferry Mix is Kestrel’s savory companion to its sweet biscuits: crisp salted pieces and little cumin-seed twists in a blue folded packet. A rust-colored corner distinguishes it from Lemon Rounds before the bag is opened. The folded top makes it easy to share at a table and put away when somebody wants to get on with a film or a conversation.",
      "Farah likes the spiced twists with a radio drama. Inés picks out the plain pieces and still has opinions about the film. Eun values a small packet that fits a walking bag; Yuna can put a bowl out for guests who have agreed to join a listening evening. Nobody’s attendance is assumed because food was bought."
    ],
    "history": [
      "Kestrel’s biscuit range reaches several regions through ordinary groceries. The different users bring their own social routines to the same packet: chosen company, a discussion worth staying for, or a short pause during a walk. Its value is familiar and modest. Buying two packets rather than one can be a practical choice without becoming a symbolic statement about a whole community."
    ],
    "regionIds": [
      "saffron",
      "glasssteppe",
      "pelagia"
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
    "venueIds": [
      "saffron-cinema",
      "saffron-community",
      "glasssteppe-park",
      "pelagia-community"
    ],
    "storyStatus": "established_object",
    "gameStatus": "worldbuilding",
    "ownership": {
      "ownerLabel": "Individual packets are bought separately; any sharing is by invitation."
    },
    "brandId": "kestrel",
    "brandIds": [
      "kestrel"
    ],
    "brand": "Kestrel",
    "brandRole": "Kestrel makes the packaged biscuits; each buyer owns the packet they bring.",
    "placeNote": "Associated with chosen listening, cinema and walking gatherings across the three regions."
  },
  {
    "id": "hugos_late_shift_loaf",
    "name": "Hugo’s Late-Shift Loaf",
    "kind": "Locally made bread",
    "summary": "A broad loaf with an uneven cross is food for ordinary tables, not a baker’s showpiece.",
    "description": [
      "Hugo’s Late-Shift Loaf is broad enough for substantial slices, with a shallow cross cut off-center into the crust. It comes in plain paper, with the bake date and Hugo’s small handwritten H. The name belongs to the people eating later; Hugo still does the early work of making it. A heel with soup or a slice beside a cup is an entirely adequate destination.",
      "Tess can serve it in the café, and Eli can bring a loaf to supper. Mina may prefer something simple after a shift. Jonah knows the baker as a chosen brother, a relationship that can include eating in peace without being asked for a joke."
    ],
    "history": [
      "Hugo learned bread through repeated batches, touch and notes beside recipes. His reliable work is the foundation of this named everyday loaf. Buyers own the loaf they take away, while the recipe and working decisions remain Hugo’s. The food connects people who need not agree about its ideal crust, topping or hour of consumption to enjoy sharing a table."
    ],
    "regionIds": [
      "alder"
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
    "venueIds": [
      "alder-market",
      "alder-corner-cafe",
      "alder-community"
    ],
    "storyStatus": "established_object",
    "gameStatus": "worldbuilding",
    "ownership": {
      "ownerLabel": "Hugo makes the bread; each purchaser owns the loaf they buy."
    },
    "placeNote": "Made and eaten around Alder’s market, café and shared-supper routines."
  },
  {
    "id": "landing_names_box",
    "name": "Esme’s Landing Names Box",
    "kind": "Archive collection",
    "summary": "Ferry photographs retain the voices that supplied their names, including the uncertain ones.",
    "description": [
      "The Landing Names Box is a shallow charcoal archive box with a faded blue ferry photograph reproduced on its lid. Inside, image sleeves sit beside cards recording the contributor, place-name, date if known, and what may be shared. A penciled question stays a question when two memories disagree. Shopping lists are filed with equal care, even when their only dramatic feature is a corrected quantity.",
      "Esme stewards the collection under each contribution’s terms. The box is not a claim on every family paper in Pelagia. Lata’s own chosen letters remain distinct, and her interest in the archive does not appoint her its next keeper."
    ],
    "history": [
      "The archive began with donated lists and ferry photographs whose contributors could sometimes name people in the background. Esme kept sources and sharing limits attached to those accounts. The named box gives a small, tangible home to that practice. Its usefulness depends on the context surviving alongside the picture, rather than on a confidently tidy story replacing an uncertain one."
    ],
    "regionIds": [
      "pelagia"
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
    "venueIds": [
      "pelagia-library",
      "pelagia-transit"
    ],
    "storyStatus": "established_object",
    "gameStatus": "worldbuilding",
    "ownership": {
      "ownerLabel": "Collection held by Esme under individual contribution terms",
      "keeperIds": [
        "pelagia_esme"
      ]
    },
    "placeNote": "Connected to the neighborhood archive and ferry history; access follows the collection’s contribution terms."
  },
  {
    "id": "tide_mill_harbor_rice",
    "name": "Tide Mill Harbor Rice",
    "kind": "Pantry grain",
    "summary": "A teal-striped bag links family kitchens while leaving the meal to the cook.",
    "description": [
      "Harbor Rice carries Tide Mill’s paired teal stripes around a clear grain window. The smaller bag has a folded paper top; the trade sack is sturdier and easier to stack. It is a medium-grain pantry rice, familiar enough that the bag can disappear into a kitchen routine until somebody notices the last portion is gone.",
      "Lio can serve rice beside a suitable batch of broth, with the day’s menu clear. Priya keeps her own household way of preparing it. Leila tests whether a rice filling stays useful inside a traveling meal. Tavi’s interest starts with which vegetables are ready, rather than with a brand deciding what their garden should grow."
    ],
    "history": [
      "Tide Mill supplies both flour and rice through port groceries, making the striped sack recognizable across towns. These are separate purchases and distinct meals. Priya’s Pelagian upbringing, Lio’s market-dependent cooking and Leila’s feedback from boat crews give the same staple different meanings. The name Harbor Rice identifies a product; it does not erase the cooks’ choices or claim a single recipe for three regions."
    ],
    "regionIds": [
      "pelagia",
      "alder",
      "saffron"
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
    "venueIds": [
      "pelagia-market",
      "alder-market",
      "saffron-market",
      "pelagia-corner-cafe"
    ],
    "storyStatus": "established_object",
    "gameStatus": "worldbuilding",
    "ownership": {
      "ownerLabel": "Separate household and business purchases."
    },
    "brandId": "tide_mill",
    "brandIds": [
      "tide_mill"
    ],
    "brand": "Tide Mill",
    "brandRole": "Tide Mill supplies the grain; preparation, portions and accompanying foods belong to each cook.",
    "placeNote": "Stocked in market groceries and prepared in different regional kitchens."
  },
  {
    "id": "rainroom_keyboard",
    "name": "The Rainroom 49",
    "kind": "Borrowed musical keyboard",
    "summary": "Amir’s borrowed keyboard holds ambitions larger than its scuffed plastic case.",
    "description": [
      "The Bracken Rainroom 49 is a compact grey keyboard with one yellow corner sticker and a scuffed music rest. Its forty-nine keys leave enough range for a tune while the case still fits a small table. Amir uses it to build tracks, working over short passages until they feel right. A small strip of removable tape marks a setting he wants to find again without settling every choice permanently.",
      "Amir is the borrower; the lender has not been named. Sefu helps make practice fit sleep, school and neighbors. Safia can enjoy hearing the result when invited. Neither family enthusiasm nor the presence of an instrument turns an ordinary visit into a required performance."
    ],
    "history": [
      "After changing a shared piece’s tempo without his classmate, Amir listened to both versions and tried a third together. The keyboard gives that disagreement a concrete working surface: a few notes can make a difference audible. Adults handle public release and major purchases. Amir’s interest can be serious while his next ambition remains a single satisfying piece, completed with a friend rather than perfected indefinitely alone."
    ],
    "regionIds": [
      "pelagia"
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
    "venueIds": [
      "pelagia-community"
    ],
    "storyStatus": "established_object",
    "gameStatus": "worldbuilding",
    "ownership": {
      "ownerLabel": "Unnamed lender",
      "borrowerIds": [
        "amir_odhiambo"
      ]
    },
    "brandId": "bracken",
    "brandIds": [
      "bracken"
    ],
    "brand": "Bracken",
    "brandRole": "Bracken makes the Rainroom 49; Amir is a borrower, not the instrument’s established owner.",
    "placeNote": "Primarily a privately borrowed instrument; community is a music-context link, not an unsupervised booking or public performance claim."
  },
  {
    "id": "kestrel_lemon_rounds",
    "name": "Kestrel Lemon Rounds",
    "kind": "Biscuits and reusable box",
    "summary": "An ordinary biscuit box can last long enough to become the home of Lin’s paper city.",
    "description": [
      "Kestrel Lemon Rounds are plain circular biscuits with a light lemon flavor and a crimped edge. Their blue-and-cream box has a yellow corner panel, easy to distinguish from the rust corner on savory Ferry Mix. A broad family tin version closes without crushing what is inside; after cleaning and adult checking, an emptied box can be useful for something entirely different.",
      "Mara handles Lin’s family snacks, and Tess keeps café supplies separate from Nico’s pretend-shop games. Ada can set biscuits beside the tea after a film. Each person can prefer a smaller portion, a different snack or no biscuit without upsetting the occasion."
    ],
    "history": [
      "The memorable afterlife belongs to Lin, whose folded paper houses fit across the broad base of an empty Kestrel box. Mara helps make suitable space; Lin names and rearranges the streets. Kestrel made the packaging, not the city. In other homes the same recognizable box may simply go into recycling, having done its ordinary job perfectly well."
    ],
    "regionIds": [
      "pelagia",
      "alder",
      "saffron"
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
    "venueIds": [
      "pelagia-community",
      "alder-corner-cafe",
      "saffron-cinema"
    ],
    "storyStatus": "established_object",
    "gameStatus": "worldbuilding",
    "ownership": {
      "ownerLabel": "Purchased by individual adults or venues; Lin keeps the particular empty box used for their paper city."
    },
    "brandId": "kestrel",
    "brandIds": [
      "kestrel"
    ],
    "brand": "Kestrel",
    "brandRole": "Kestrel makes the biscuits and packaging; Lin owns and makes the paper play set kept in one reused box.",
    "placeNote": "Food is shared in family and cinema settings; the reused play box stays with Lin."
  },
  {
    "id": "six_panel_order_slips",
    "name": "Kit’s Six-Panel Slips",
    "kind": "Working comic pages",
    "summary": "Clean diner paper holds the pauses a grand desert landscape can leave out.",
    "description": [
      "A spring clip holds Kit’s clean Rainline Counterstock order slips in a narrow fan. Each page is divided into six panels, with the printed order line still visible above a cup, stool or person waiting for the next thing to happen. A muted rust border distinguishes the kept pages from loose paper awaiting a sketch. The format is small enough to carry and demanding enough that an unnecessary line soon shows.",
      "The drawings belong to Kit. June shares the workplace that supplies many observations, and Jo remains family in Alder; neither relationship supplies automatic permission to edit, exhibit or reproduce the pages. A recognizable subject may also deserve a conversation before a comic goes public."
    ],
    "history": [
      "Kit began drawing between diner jobs and turned toward inhabited desert life after a visitor treated a dramatic landscape as somewhere nobody could live. Six-panel comics made room for cups, work and quiet beats. The clipped collection gives those pages a portable identity while leaving Kit’s next finished story their own decision."
    ],
    "regionIds": [
      "embermesa",
      "alder"
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
    "venueIds": [
      "embermesa-corner-cafe",
      "embermesa-cinema"
    ],
    "storyStatus": "established_object",
    "gameStatus": "worldbuilding",
    "ownership": {
      "ownerIds": [
        "kit"
      ],
      "makerIds": [
        "kit"
      ]
    },
    "brandId": "rainline",
    "brandIds": [
      "rainline"
    ],
    "brand": "Rainline",
    "brandRole": "Rainline supplies Counterstock order pads; Kit creates the six-panel comic pages.",
    "placeNote": "Made around Last Light Diner; cinema is an art/storytelling connection, not an existing exhibition."
  },
  {
    "id": "three_hills_cups",
    "name": "Bea’s Three Hills Cups",
    "kind": "Toddler stacking cups",
    "summary": "Three broad wooden cups can be a tower, a row, or simply something to name.",
    "description": [
      "The Three Hills set has chunky wooden cups with broad rounded rims and bands of rust, ochre and sage. Nested, they look like a small stepped hill; separated, each is large enough for Bea to grip with both hands. There are no decorative beads or other small loose parts. A faint uneven grain on the biggest cup makes it the easiest one to pick out of the stack.",
      "These are Bea’s familiar play things, cared for by Kit. Jo is Bea’s grandparent, but the cups are not automatically credited to the family repairer. Their maker and giver remain unspecified. The name describes the set rather than assigning a lesson Bea must complete."
    ],
    "history": [
      "Bea already enjoys chunky wooden cups, naming nearby things and discovering what will balance. At two, a tower can matter completely and be abandoned a moment later. Public use keeps Kit beside Bea in a quiet café seat or community play corner. A toppled cup is an ordinary part of play, not a test of patience or achievement."
    ],
    "regionIds": [
      "embermesa",
      "alder"
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
    "venueIds": [
      "embermesa-community",
      "embermesa-corner-cafe"
    ],
    "storyStatus": "established_object",
    "gameStatus": "worldbuilding",
    "ownership": {
      "ownerIds": [
        "bea"
      ],
      "adultCareIds": [
        "kit"
      ]
    },
    "image": {
      "src": "items/three-hills-cups.webp",
      "alt": "Three chunky wooden stacking cups with rounded rims and muted rust, ochre and sage bands.",
      "type": "object_portrait"
    },
    "placeNote": "Can accompany Kit and Bea in a quiet family café seat or community play corner."
  },
  {
    "id": "rosa_moreno_stall_sign",
    "name": "Rosa Moreno’s Scratched Stall Sign",
    "kind": "Retired market sign",
    "summary": "The scratches stay because Rosa wants the object she remembers, not a polished substitute.",
    "description": [
      "ROSA MORENO runs across a sun-faded green board in large cream letters, with room below for the day’s produce. A pale scratch cuts through the second O. Old fixing holes remain at the ends; neither perfectly matches the present hanging cord. It is recognizably a working sign that has spent more time being read quickly than admired closely.",
      "Rosa owns the board and decides what happens to it. Mateo offered to repair the lettering, but her choice was to retain the scratches and hang this one where she could see it. Another sign could go. Keeping one object does not commit her to keeping every piece of her former stall."
    ],
    "history": [
      "The choice took place during a radio match, interrupted by Rosa’s opinions about the commentary. Mateo’s offer of help became useful once it followed what she wanted to keep. The sign now hangs at her outlying home, where its scratches remain visible. Its market connection belongs to a working past of slow hours, spoiled produce, good customers and the pleasure of sufficient takings."
    ],
    "regionIds": [
      "embermesa"
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
    "venueIds": [
      "embermesa-market"
    ],
    "storyStatus": "established_object",
    "gameStatus": "worldbuilding",
    "ownership": {
      "ownerIds": [
        "rosa_moreno"
      ]
    },
    "placeNote": "Now at Rosa’s private outlying home; Sundown Exchange is its historical work connection."
  },
  {
    "id": "touchline_radio",
    "name": "Rosa’s Touchline Radio",
    "kind": "Portable radio",
    "summary": "A stout cream radio makes room for a match, a visit and Rosa’s own running commentary.",
    "description": [
      "Rosa’s Bracken Touchline radio has a cream case, a broad red tuning wheel and a handle worn smooth underneath. A short pencil mark on the dial identifies the station she usually wants; it does not stop her turning away when the commentary becomes intolerable. The cloth speaker grille carries one darker patch where a familiar hand steadies the radio.",
      "Touchline is an ordinary portable model. Rosa owns it and chooses the match, volume and company. Visitors can bring conversation without insisting that every minute be filled. Sometimes the point is to sit comfortably, listen, and disagree about a decision on the field."
    ],
    "history": [
      "Matches accompany Rosa’s visits and market recollections without needing to become background sound for somebody else’s plans. She has asked June to help arrange a station-side listening afternoon, and that remains something to look forward to. A suitable chair, shade and transport matter at least as much as bringing the radio. Rosa wants to know the start time and enjoy the occasion on her own terms."
    ],
    "regionIds": [
      "embermesa"
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
    "venueIds": [
      "embermesa-community",
      "embermesa-transit"
    ],
    "storyStatus": "established_object",
    "gameStatus": "worldbuilding",
    "ownership": {
      "ownerIds": [
        "rosa_moreno"
      ]
    },
    "brandId": "bracken",
    "brandIds": [
      "bracken"
    ],
    "brand": "Bracken",
    "brandRole": "Bracken makes the Touchline radio; Rosa chooses what to listen to.",
    "placeNote": "Primarily kept at Rosa’s home; linked venues concern her requested future listening outing, not a completed event."
  },
  {
    "id": "fallen_sandwich_chart",
    "name": "The Fallen Sandwich Chart",
    "kind": "Teenager’s sky sketch",
    "summary": "Luz’s careful labels leave space for a constellation that sounds like lunch went wrong.",
    "description": [
      "The Fallen Sandwich Chart is a folded sheet of Rainline Nightblue paper crowded with silver pencil points. One pattern is circled in orange, its serious first label crossed out above a smaller, ridiculous replacement. A broad blank margin allows a later name, a correction or a doodle that has nothing to do with the sky. This is a working sketch, not a finished astronomical reference.",
      "Luz keeps the chart and shares decisions with the friend who helped make its joke memorable. Esperanza handles the practical responsibilities that belong to an adult. Inez can be interested without inheriting the work or becoming the person who must make the project educational."
    ],
    "history": [
      "A friend suggested that an elaborate shape resembled a fallen sandwich. Luz objected, then added the name to a rough version and laughed. They still want to learn established names and identify real patterns. Any nighttime outing needs adult arrangements, safe conditions and supervision; a cloudy evening can simply leave the chart folded while they do something else."
    ],
    "regionIds": [
      "embermesa"
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
    "venueIds": [
      "embermesa-library",
      "embermesa-park"
    ],
    "storyStatus": "established_object",
    "gameStatus": "worldbuilding",
    "ownership": {
      "ownerIds": [
        "luz_vega"
      ],
      "makerLabel": "Luz, with an unnamed school friend contributing ideas",
      "adultCareIds": [
        "esperanza_vega"
      ]
    },
    "brandId": "rainline",
    "brandIds": [
      "rainline"
    ],
    "brand": "Rainline",
    "brandRole": "Rainline makes the Nightblue paper; Luz and a friend supply the chart and its names.",
    "placeNote": "Connected to learning and appropriately supervised observation; no night outing or access is implied by the links."
  },
  {
    "id": "route_green_grocery_van",
    "name": "Esperanza’s Route-Green Van",
    "kind": "Mobile grocery vehicle",
    "summary": "A visible order list keeps cheerful promises within the space of a real van.",
    "description": [
      "Esperanza’s small grocery van has faded leaf-green doors and a cream roof. Reusable crates sit behind a clipped order list whose top line is deliberately left clear for the next delivery. One magnetic label on her own lunch reads “Executive Emergency Biscuit Department.” She can move the joke without relabeling anyone else’s belongings or making a customer its unwilling subject.",
      "The van is Esperanza’s business vehicle. Its space, fuel and refrigeration needs set practical limits on what a friendly conversation can promise. Luz is her child, not an unpaid route worker or a stock of stories to tell customers. Inez’s lending shelves are a separate enterprise."
    ],
    "history": [
      "After accepting three special orders, Esperanza discovered one required an extra trip. She delivered it, then began using a visible list and checking space before agreeing. Her self-directed jokes still brighten the route. When Luz asked her to stop retelling a school story in front of customers, she learned that a funny anecdote can belong to more than its teller. The van carries groceries more comfortably than unexamined obligations."
    ],
    "regionIds": [
      "embermesa"
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
    "venueIds": [
      "embermesa-market",
      "embermesa-transit"
    ],
    "storyStatus": "established_object",
    "gameStatus": "worldbuilding",
    "ownership": {
      "ownerIds": [
        "esperanza_vega"
      ]
    },
    "placeNote": "Travels between station-side supplies and outlying homes; this is a contextual transport link, not player-drivable inventory."
  },
  {
    "id": "leilas_dock_folds",
    "name": "Leila’s Dock Folds",
    "kind": "Fresh portable meal",
    "summary": "A folded griddle bread is judged by the last bite on the boat, not only by its first good smell.",
    "description": [
      "A Dock Fold is Leila’s soft griddle bread folded firmly around a filling and wrapped with one broad blue paper band. The day’s choices are written at the stall. Beans, cooked vegetables or another listed filling can change the meal without changing the practical test: it needs to hold together when the person carrying it reaches work.",
      "Tomas wants lunch that survives a long day; Rafael may eat between canopy jobs. Vera can choose a familiar filling without being treated as a miniature food critic. Ada may arrange a larger order when food is part of a screening. The blue band helps people recognize the source, while each buyer owns the meal they take."
    ],
    "history": [
      "Leila developed her cooking by asking boat crews what remained in the wrapper on arrival. Dock Folds give a specific name to that practical lesson. They are her fresh food, made on a Gullwing griddle from ingredients that can include Tide Mill flour. The suppliers do not own the recipe, and changing a filling need not change the entire identity of the stall."
    ],
    "regionIds": [
      "saffron"
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
    "venueIds": [
      "saffron-market",
      "saffron-transit",
      "saffron-cinema"
    ],
    "storyStatus": "established_object",
    "gameStatus": "worldbuilding",
    "ownership": {
      "ownerLabel": "Leila makes and sells them; buyers own their individual meals."
    },
    "placeNote": "Prepared at the market, carried toward boats and sometimes ordered for screenings by agreement."
  },
  {
    "id": "yellow_tab_survey_case",
    "name": "Nell’s Yellow-Tab Survey Case",
    "kind": "Professional equipment case",
    "summary": "An exact kit list leaves Nell more freedom once the paid measurements are finished.",
    "description": [
      "A hard dark-blue Whaleskin Survey case follows Nell between short acoustic-survey jobs. Yellow pull-tabs mark the compartments for the easy-to-forget pieces: leads, adapters and spare covers. A transparent pocket under the lid holds the current kit list, with irrelevant equipment crossed off before departure. The case is recognizable even when the instruments inside change for a contract.",
      "Nell owns the case and is responsible for what she carries. Individual instruments can belong to her, a client or a hiring provider; the list keeps that distinction visible. Her careful equipment record does not extend into an obligation to give family a live account of every hour after work."
    ],
    "history": [
      "On an early contract Nell packed an unnecessary instrument and forgot a simple adapter. The modest inconvenience changed her packing routine across wet harbors, cold highlands and desert evenings. Now the yellow tabs prompt a last check before the lid shuts. Reliable preparation supports her working freedom, while rehearsal invitations and personal plans remain choices beyond the case."
    ],
    "regionIds": [
      "traveler",
      "alder",
      "saffron",
      "glasssteppe",
      "pelagia",
      "embermesa"
    ],
    "people": [
      {
        "id": "nell_harper",
        "relationship": "Owner of the carrying case and technician responsible for each assigned kit"
      }
    ],
    "venueIds": [
      "alder-transit",
      "glasssteppe-transit",
      "pelagia-transit",
      "embermesa-transit",
      "saffron-transit"
    ],
    "storyStatus": "established_object",
    "gameStatus": "worldbuilding",
    "ownership": {
      "ownerIds": [
        "nell_harper"
      ],
      "contentsOwnership": "Varies by contract; case ownership does not settle instrument ownership."
    },
    "brandId": "whaleskin",
    "brandIds": [
      "whaleskin"
    ],
    "brand": "Whaleskin",
    "brandRole": "Whaleskin makes the Survey case; ownership of the instruments varies by contract.",
    "placeNote": "Travels with Nell; regional transit links are route associations rather than proof of a contract at every stop."
  },
  {
    "id": "whaleskin",
    "name": "Whaleskin",
    "kind": "Fitted van cover · story object",
    "summary": "Two useless mirror sleeves make a supposedly universal cover impossible to mistake.",
    "description": [
      "Whaleskin is a silver-grey waterproof fitted van cover with two conspicuously floppy wing-mirror sleeves and a bright stitched name label. Spread on the ground, it still looks unmistakably meant for a vehicle. Its advertised universal fit supplies the joke: on Lata’s van, the back would remain uncovered despite the price.",
      "In the playable story, Lata buys the cover and gives the misfit to Tavi for sheltering produce-staging equipment beside a platform. That gift transfers ownership. The loose hem needs proper assessment in its new setting: a recognizable sleeve can identify the material, while Mara’s professional inspection establishes its effect on runoff. An early check can prevent the obstruction; later consequences depend on the choices and weather recorded in that life."
    ],
    "history": [
      "The story draws on Lata’s delivery work, Tavi’s harbor growing and Mara’s maintenance expertise. The mirror sleeves make a failed promise of universal fit visible before anyone understands the risk of its new use. A later photograph can tell a selective version of the work, but neither a heroic account nor a blocked outlet is guaranteed history. Each life records whether the edge was checked, what the weather affected and what the crew actually established."
    ],
    "regionIds": [
      "pelagia"
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
    "venueIds": [
      "pelagia-transit",
      "pelagia-garden",
      "pelagia-work"
    ],
    "storyStatus": "playable_story_object",
    "gameStatus": "implemented",
    "ownership": {
      "ownerLabel": "In the story, Lata buys the cover and gives it to Tavi. Later agreed custody is recorded separately from ownership."
    },
    "brandId": "whaleskin",
    "brandIds": [
      "whaleskin"
    ],
    "brand": "Whaleskin",
    "brandRole": "Manufacturer of the fitted cover; the story distinguishes its universal-fit claim from the fit and use of this particular object.",
    "image": {
      "src": "items/whaleskin.webp",
      "alt": "A silver-grey fitted van cover laid loose, with two floppy mirror sleeves and a stitched Whaleskin label.",
      "type": "object_portrait"
    },
    "storyNote": "Playable story situation: an ill-fitting purchase becomes a gift and a tempting reuse. Checking the outlet early can prevent a problem. If runoff is obstructed, its cause is established by professional inspection rather than a bystander’s guess. Ownership, any later agreed custody and the public account follow the events actually recorded in this life.",
    "placeNote": "The story begins at Gatehouse Landing, linking the public loading route with Tavi’s growing work and Mara’s inspection responsibilities. Produce deliveries can affect other harbor routines, but the guide does not promise an object at every linked venue."
  },
  {
    "id": "dalloway",
    "name": "Dalloway",
    "kind": "Two-note bicycle bell · story object",
    "summary": "June’s repaired bell could become an excellent way for grateful diners to ask for more.",
    "description": [
      "Dalloway’s Two-Note is a battered chrome bicycle bell clipped to the diner counter, its name stamped beside a worn thumb paddle. It rings a bright ding on the press and a lower dong when released. The return spring is ordinary and repairable; the recognizability comes from the two notes and the slightly ridiculous place where the bell has ended up.",
      "In the playable story, June owns the bell and repairs its return spring while considering a change to her station-announcing work. Esperanza’s “JUNE’S LAST ORDERS” tag and Kit’s empty-counter drawing can make the wrong workplace sound as though it is losing her. Meanwhile, appreciative customers can use her successful repair to summon still more service. June’s work decision remains hers; the diner is still open."
    ],
    "history": [
      "The story builds on June’s established combination of cooking, bicycle repair and station announcements. The bell makes her competence audible while revealing how readily people ask for more of it. Moving it by agreement to the kitchen pass, to announce finished plates, changes what the ringing asks of her. June remains a cook; whether she leaves or retains station work follows the actual story outcome."
    ],
    "regionIds": [
      "embermesa"
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
    "venueIds": [
      "embermesa-corner-cafe",
      "embermesa-transit",
      "embermesa-makerspace"
    ],
    "storyStatus": "playable_story_object",
    "gameStatus": "implemented",
    "ownership": {
      "ownerIds": [
        "mesa_june"
      ],
      "ownerLabel": "June owns the bell. Moving it by agreement changes its use, not its owner."
    },
    "brandId": "dalloway",
    "brandIds": [
      "dalloway"
    ],
    "brand": "Dalloway",
    "brandRole": "Manufacturer of the Two-Note bicycle bell; June’s repair and decisions determine the use of her particular bell.",
    "image": {
      "src": "items/dalloway.webp",
      "alt": "A battered chrome bicycle bell clipped to a diner counter, with a worn thumb paddle and stamped Dalloway name.",
      "type": "object_portrait"
    },
    "storyNote": "Playable story situation: a repaired bell and an unclear farewell can bring June exactly the extra service she hoped to escape. The sign can be corrected, food commitments still need honoring and the bell’s use can be changed with her agreement. June stays a cook; her station decision, any kitchen-pass placement and their consequences are recorded within each life.",
    "placeNote": "The story begins at Last Light Diner. Its bell, repair work and station-farewell confusion connect this counter with The Second Try and Mesa Rail Station; a link does not mean June has left either job."
  },
  {
    "id": "bracken",
    "name": "Bracken",
    "kind": "Redbank bass drum · story object",
    "summary": "A transparent drumhead makes Nell’s “one thing in storage” visibly include a place to sleep.",
    "description": [
      "The Bracken Redbank is a large dark-red bass drum with chrome lugs and a transparent front head. Nell’s own blue-check duvet is plainly visible inside, where bedding can legitimately damp the sound. A small maker’s mark stays secondary to that unmistakable circle of blue checks. The instrument is ordinary; its contents make an understatement difficult to sustain.",
      "The playable scene begins after Jonah has paid to occupy Ruth’s spare room. Nell owns both the drum and the blue-check duvet inside it; Ruth’s earlier storage permission is a different agreement from Jonah’s tenancy. Calling the remaining obstruction “one drum” minimizes how much room and fallback lodging Nell still expects. Ruth’s hospitality and Jonah’s paid occupancy create different claims that require a conversation."
    ],
    "history": [
      "The story draws on Nell’s traveling work and amateur drumming, Ruth’s home and Jonah’s wish for a room of their own. The opening tenancy is a fact of this scene, not a change to their pre-story biographies. The drum’s clear head makes the hidden expectation of a bed visible. Rehearsal, travel or paid storage can change costs and access, but a destination does not automatically settle Nell’s relationships or require her to choose a permanent home."
    ],
    "regionIds": [
      "traveler",
      "alder"
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
    "venueIds": [
      "alder-apartments",
      "alder-community",
      "alder-transit"
    ],
    "storyStatus": "playable_story_object",
    "gameStatus": "implemented",
    "ownership": {
      "ownerIds": [
        "nell_harper"
      ],
      "ownerLabel": "Nell owns the drum and duvet. In this scene Ruth owns the room, and Jonah has paid for the agreed occupancy."
    },
    "brandId": "bracken",
    "brandIds": [
      "bracken"
    ],
    "brand": "Bracken",
    "brandRole": "Manufacturer of the Redbank bass drum; Nell owns the drum and the separate duvet used inside it.",
    "image": {
      "src": "items/bracken.webp",
      "alt": "A dark-red bass drum with chrome lugs and a clear front head showing a blue-check duvet inside.",
      "type": "object_portrait"
    },
    "storyNote": "Playable story situation: Nell’s drum and bedding remain in Ruth’s room after Jonah rents it. The adults can distinguish storage, room access and accommodation, then decide where the belongings will go. Nell keeps ownership of drum and duvet; destination, expense, access and any later arrangement depend on the choices recorded in this life.",
    "placeNote": "The story begins in the Alder home setting associated with Rainwell Court, with later rehearsal and travel connections to Common Table Hall and Alder Ferry & Rail. Ruth’s room is a story setting, not an extra apartment contract offered to the player."
  }
];
export const guideBrands:GuideBrand[]=[
  {
    "id": "kestrel",
    "name": "Kestrel",
    "category": "Tea and packaged biscuits",
    "summary": "The cream bird on a blue packet turns up at tea tables and on tins with a second life.",
    "identity": "A cream bird on blue, with yellow corners for Lemon Rounds and rust corners for savory Ferry Mix. Tea strength is plainly numbered.",
    "pricePosition": "Ordinary pantry purchases. An old empty tin has little resale importance; personal use supplies most of its value.",
    "quality": "Straightforward everyday tea and biscuits with easily distinguished packets. The useful tins can chip or dent; reusing a box is an owner’s choice, not a premium feature.",
    "history": [
      "Kestrel supplies familiar tea and biscuits through grocers in several regions. No. 2 Breakfast Tea, sweet Lemon Rounds and savory Ferry Mix share a recognizable blue package while making their contents easy to distinguish.",
      "Tea tins and broad biscuit boxes often have an unceremonious second life. Oren’s buttons and Lin’s paper houses are personal uses of common packaging, not branded projects."
    ],
    "description": [
      "Tess wants tea she can brew reliably for customers; Miro prefers his less strong. Farah reaches for the spiced pieces of Ferry Mix, while Inés favors the plain ones. An ordinary shared packet can support different tastes without somebody needing to win.",
      "Kestrel’s widest reach is through repeat purchases and tables where several people interact with the same food. The reused containers keep that recognition alive after the original contents are gone."
    ],
    "itemIds": [
      "kestrel_breakfast_tea",
      "kestrel_button_tin",
      "kestrel_ferry_mix",
      "kestrel_lemon_rounds"
    ],
    "regionIds": [
      "alder",
      "glasssteppe",
      "pelagia",
      "saffron"
    ],
    "fictional": true
  },
  {
    "id": "tide_mill",
    "name": "Tide Mill",
    "category": "Flour and pantry rice",
    "summary": "Teal-striped staple bags cross town borders; the food made from them keeps each cook’s own character.",
    "identity": "Cream sacks with paired teal stripes, clearly named grain and bag size; rice has a visible grain window on smaller packs.",
    "pricePosition": "Everyday household and trade staples, with larger sacks for cooks who use them steadily. No exact prices or price guarantees are established.",
    "quality": "Dependable ordinary milled grains, while batch differences, storage and cooking still matter. The label does not promise a meal will come out identically for every cook.",
    "history": [
      "Tide Mill grew by supplying working-port groceries with flour and rice. The same restrained striped design appears on a small household bag and a larger trade sack, making the maker recognizable without confusing quantities.",
      "Its products travel into several cuisines and personal routines. That shared supply does not make every household’s food the same, or turn a regional recipe into something the mill owns."
    ],
    "description": [
      "Hugo pays attention to flour through touch and repeated batches. Leila tests the result against a boat journey. Priya’s rice is part of her own household practice; Lio can serve it beside a suitable batch of broth.",
      "A commonplace staple can connect people through practical differences: the bag size they can store, the delivery they are waiting for, or the way a familiar grain behaves in their hands."
    ],
    "itemIds": [
      "tide_mill_bridge_flour",
      "tide_mill_harbor_rice"
    ],
    "regionIds": [
      "alder",
      "pelagia",
      "saffron"
    ],
    "fictional": true
  },
  {
    "id": "gullwing",
    "name": "Gullwing",
    "category": "Kitchen, café and food-carrying goods",
    "summary": "Rounded handles, blue enamel and straightforward kitchen equipment for meals that need to work.",
    "identity": "A white gull mark, blue enamel where appropriate, rounded grip points and compact copper-colored plates on hot equipment. Wood products keep their grain visible.",
    "pricePosition": "Affordable to mid-range; durable daily items rather than prestige presentation pieces.",
    "quality": "Generally solid, cleanable construction with uncomplicated forms. Enamel can chip and lids can dent, while a well-kept working surface or wooden piece can remain useful for years.",
    "history": [
      "Gullwing’s kitchen range spread through ferry-town shops and market suppliers. Lunch tins, café boards, stockpots and compact cooking equipment serve overlapping routines of eating, working and carrying food.",
      "The recognizable gull ties the products together without turning every kitchen into a matching set. Leila’s griddle and Lio’s broth pot do related jobs in quite different meals."
    ],
    "description": [
      "Leila judges the First Shift griddle by the meal that reaches a boat. Lio values a stockpot that allows predictable cooking and straightforward serving. Tomas keeps a lunch tin whose dent requires a familiar nudge.",
      "Tess wants a board that can be wiped and read in a hurry. All four uses put practical handling ahead of a matching display."
    ],
    "itemIds": [
      "last_crossing_board",
      "first_shift_griddle",
      "gullwing_lunch_tin",
      "first_ferry_broth_pot"
    ],
    "regionIds": [
      "alder",
      "pelagia",
      "saffron"
    ],
    "fictional": true
  },
  {
    "id": "dalloway",
    "name": "Dalloway",
    "category": "Bicycle fittings and workshop carriers",
    "summary": "Modest, repairable hardware whose parts are often more memorable than the advertising.",
    "identity": "Stamped lettering, exposed sensible fasteners, brushed or chromed metal, and dark-green or natural-fiber carriers.",
    "pricePosition": "Middle-of-the-shelf working goods. Used examples are common enough that owning one does not imply a costly purchase.",
    "quality": "Sturdy where force is expected, mechanically straightforward and able to show wear. Springs, straps and woven parts still need attention; repairability does not mean indestructibility.",
    "history": [
      "Dalloway’s core business is bicycle hardware, with baskets growing from the same habit of making things carryable and accessible. A stamped name on a bell can remain legible long after its box is gone.",
      "Owners tend to recognize the practical shape before the maker’s mark. The objects can be maintained and altered without becoming anonymous; a replaced strip or strap becomes part of the particular example’s history."
    ],
    "description": [
      "Rowan’s basket is useful because it separates damp plants from dry books. A Dalloway name tells them where the basket came from, while its pale replacement strip records the work of keeping this particular one in use.",
      "June’s story bell supplies the sharper joke: a successful repair can make an object better at doing something its owner would rather it stopped demanding. What its renewed ringing means depends on the arrangements made in that life."
    ],
    "itemIds": [
      "two_load_basket",
      "dalloway"
    ],
    "regionIds": [
      "alder",
      "embermesa"
    ],
    "fictional": true
  },
  {
    "id": "bracken",
    "name": "Bracken",
    "category": "Instruments and everyday listening equipment",
    "summary": "Dark red, warm grey and large usable controls, from a bedroom keyboard to a substantial drum.",
    "identity": "Small cream maker’s marks, warm-grey controls and a deep oxblood option on larger instruments. Product names are secondary to plainly marked knobs and keys.",
    "pricePosition": "Mainly mid-range, with simpler older models circulating second-hand or on loan. A large drum is a meaningful purchase; borrowing a keyboard makes no claim about its borrower’s means.",
    "quality": "Dependable ordinary equipment with replaceable wear parts. Clear controls matter more than decorative complexity, although older plastics can scuff and rest fittings can loosen.",
    "history": [
      "Bracken grew around playable instruments and later added everyday listening equipment. The Rainroom keyboard and Touchline radio occupy different corners of that ordinary musical life.",
      "The brand does not own the work made with its products. Amir’s arrangement and Nell’s playing remain theirs, including the choice to share none of it on a particular afternoon."
    ],
    "description": [
      "Amir cares about what a keyboard lets him try quietly. Rosa wants a radio dial she can reach while delivering an opinion about the commentary. The same maker serves active music-making and happily opinionated listening.",
      "The Redbank story drum is a larger, costlier member of the same family. Its clear head makes Nell’s blue-check duvet more visually memorable than the discreet maker’s mark."
    ],
    "itemIds": [
      "rainroom_keyboard",
      "touchline_radio",
      "bracken"
    ],
    "regionIds": [
      "alder",
      "embermesa",
      "pelagia",
      "traveler"
    ],
    "fictional": true
  },
  {
    "id": "whaleskin",
    "name": "Whaleskin",
    "category": "Protective covers and carrying cases",
    "summary": "Silver-grey protection with navy seams: reassuring material, sometimes overconfident sizing.",
    "identity": "Silver-grey surfaces, navy edge binding and a stitched white name tab. Cases have easy-to-grip closures rather than hidden fasteners.",
    "pricePosition": "Mid-priced sleeves and expensive fitted covers; professional cases cost more than ordinary luggage. No fixed currency prices are established.",
    "quality": "Good protective materials and serviceable closures, with a reputation for bulky construction. A standard fit still needs checking against the actual object.",
    "history": [
      "Whaleskin began with protective wraps for working-port goods and broadened into instrument cases and vehicle covers. That shared origin explains why a small notebook sleeve and a technician’s large case carry the same navy seam.",
      "The firm’s useful promise is to protect something already worth carrying. Its weak point is how readily a broad product label can sound like a personal guarantee. The badly fitting van cover in Lata’s story is one particular purchase, not an established scandal or a product recall."
    ],
    "description": [
      "Nell favors a case that can take an ordinary knock during a transfer. Priya needs only a wipe-clean sleeve that lets her read a notebook in damp weather.",
      "Their different requirements make Whaleskin recognizable without making it everyone’s favorite. Lata’s costly story misfit can put the same brand in an altogether less flattering conversation."
    ],
    "itemIds": [
      "rainline_notebook",
      "yellow_tab_survey_case",
      "whaleskin"
    ],
    "regionIds": [
      "alder",
      "embermesa",
      "glasssteppe",
      "pelagia",
      "saffron",
      "traveler"
    ],
    "fictional": true
  },
  {
    "id": "rainline",
    "name": "Rainline",
    "category": "Stationery and working paper",
    "summary": "Quietly ruled pages, practical margins and paper that leaves room for a correction.",
    "identity": "A thin cobalt line on wrappers, unobtrusive product numbers and generous blank areas. Dark-blue craft sheets form a separate range.",
    "pricePosition": "Budget to mid-range refillable or replaceable stock; ordinary stationery that does not make its user’s private work a luxury object.",
    "quality": "Readable layouts and serviceable paper. Standard notebooks need separate weather protection; neither a blue wrapper nor the name makes every sheet waterproof.",
    "history": [
      "Rainline supplied everyday rosters, docket pads and ledgers before extending the range to pocket notebooks and craft papers. Its products travel through offices, kitchens, schoolbags and gardens without deciding what belongs on the page.",
      "A printed rule can become a useful starting point or a line an artist ignores. The brand belongs to the blank stock; Bram’s map, Kit’s comic and Luz’s chart belong to their makers."
    ],
    "description": [
      "Priya wants legible notes protected in a separate sleeve. Bram needs room to correct a route. Kit borrows the proportions of an order slip, then makes them do a different job.",
      "Luz chooses dark-blue paper for a sky sketch and leaves a margin for a less serious name. The same stationery maker serves all these habits without making the results a uniform house style."
    ],
    "itemIds": [
      "after_hours_atlas",
      "rainline_notebook",
      "six_panel_order_slips",
      "fallen_sandwich_chart"
    ],
    "regionIds": [
      "alder",
      "embermesa",
      "pelagia"
    ],
    "fictional": true
  }
];
export const guideVenueByKey:Readonly<Record<string,GuideVenue>>=Object.fromEntries(guideVenues.map(venue=>[venue.regionId+':'+venue.placeId,venue]));
export const guideItemById:Readonly<Record<string,GuideItem>>=Object.fromEntries(guideItems.map(item=>[item.id,item]));
export const guideBrandById:Readonly<Record<string,GuideBrand>>=Object.fromEntries(guideBrands.map(brand=>[brand.id,brand]));
export const guideDispersedFamilies:{id:string;anchor:string;title:string;people:string[];text:string}[]=[
  {
    "id": "jo-kit",
    "anchor": "jo",
    "title": "Coast and desert, three generations",
    "people": [
      "jo",
      "kit",
      "bea"
    ],
    "text": "Jo moved from the desert to Alder as a young adult. Kit grew up there and later chose Ember Mesa, where Bea now lives with them. Visits connect the generations without making either adult’s home a temporary arrangement."
  },
  {
    "id": "oren-miro",
    "anchor": "miro",
    "title": "Brothers along the railway",
    "people": [
      "oren",
      "miro"
    ],
    "text": "Miro stayed near Glasssteppe’s railway terraces; Oren made his adult home in Alder Quay. Letters, visits and familiar family objects connect the highlands and coast. During Oren’s chemotherapy, Miro asks what company or practical help is welcome instead of assuming a journey or a long call will fit."
  },
  {
    "id": "arul",
    "anchor": "kamala_arul",
    "title": "Alder and Pelagia, on agreed terms",
    "people": [
      "kamala_arul",
      "anil_arul",
      "priya",
      "dara_arul"
    ],
    "text": "Priya moved to Alder for weather-reporting work, with Dara then a child. Kamala and Anil remained in Pelagia. Dara stayed in Alder as an adult for her own work and friends; visits and family calls bring affection as well as disagreement about how much time anyone can promise."
  },
  {
    "id": "park",
    "anchor": "eun_park",
    "title": "A highland family and a harbor home",
    "people": [
      "eun_park",
      "min_park",
      "jiwoo_park",
      "yuna_park"
    ],
    "text": "Yuna chose a new home and neighborhood radio work in Pelagia. Eun, Min and Jiwoo remain in Glasssteppe. Recordings and calls keep them close, but an unanswered message is not a measure of love. Min’s decision to stay reflects work, friends and co-parenting, rather than a duty to be the sibling who stayed."
  },
  {
    "id": "harper",
    "anchor": "ruth_harper",
    "title": "A family base and a changing route",
    "people": [
      "ruth_harper",
      "oliver_harper",
      "alder_tess",
      "nico",
      "nell_harper"
    ],
    "text": "Nell grew up in Alder and chose traveling acoustic-survey contracts. Ruth, Oliver, Tess and Nico remain rooted there. Nell agrees to arrival messages without sharing a live itinerary; returning for a visit does not promise a permanent move home."
  }
];
