export const locations=[
 {district:'main',place:'APARTMENTS',art:'apartments',alt:'A sunlit apartment with a sofa, plants and a compact kitchen',name:'Maple Apartments',short:'Home',hint:'Make yourself at home',action:'move',x:18,y:24,point:[260,187]},
 {district:'main',place:'WORK',art:'work',alt:'A neighborhood workspace with desks, laptops and tools',name:'The Shift',short:'Work',hint:'Work & earn',action:'work',x:50,y:19,point:[450,166]},
 {district:'main',place:'CAMPUS',art:'campus',alt:'An adult learning classroom with books and project tables',name:'Open Campus',short:'Campus',hint:'Learn a new skill',action:'study',x:82,y:24,point:[650,204]},
 {district:'main',place:'CAREER HUB',art:'careers',alt:'A welcoming career office with an interview desk and chairs',name:'Next Step',short:'Careers',hint:'Find your next role',action:'apply',x:86,y:53,point:[695,295]},
 {district:'main',place:'CORNER CAFÉ',art:'cafe',alt:'A warm café with an espresso bar, pastries and a table for friends',name:'Corner Cup',short:'Café',hint:'Coffee with your people',action:'friends',x:74,y:76,point:[590,386]},
 {district:'main',place:'COMMUNITY',art:'community',alt:'A community hall with produce and donation sorting tables',name:'Common Ground',short:'Hall',hint:'Give a little back',action:'volunteer',x:28,y:80,point:[340,385]},
 {district:'main',place:'THE PARK',art:'park',alt:'A leafy pocket park with a gazebo, fountain and quiet bench',name:'Pocket Park',short:'Park',hint:'Breathe. Reset. Repeat.',action:'rest',x:14,y:43,point:[223,277]},
 {district:'west',place:'LIBRARY',art:'library',alt:'A sunlit library with reading tables and bookshelves',name:'Chapter House',short:'Library',hint:'Books & affordable learning',action:'library_learn',x:18,y:23,point:[260,187]},
 {district:'west',place:'MARKET',art:'market',alt:'A neighborhood market with produce and stocked shelves',name:'Fresh Market',short:'Market',hint:'Food & casual work',action:'market_shift',x:50,y:18,point:[450,166]},
 {district:'west',place:'FITNESS',art:'gym',alt:'A fitness studio with mats, weights and exercise bikes',name:'Good Form',short:'Gym',hint:'Movement & recovery',action:'gym_yoga',x:81,y:23,point:[650,204]},
 {district:'west',place:'MAKERSPACE',art:'makers',alt:'A makerspace with craft benches and repair tools',name:'The Workshop',short:'Maker',hint:'Skills & commissions',action:'maker_intro',x:85,y:49,point:[695,295]},
 {district:'west',place:'CINEMA',art:'cinema',alt:'A small cinema with a popcorn counter and velvet seats',name:'Silver Screen',short:'Cinema',hint:'Movies & evenings out',action:'cinema_matinee',x:76,y:76,point:[650,425]},
 {district:'west',place:'TRANSIT',art:'transit',alt:'A bicycle and transit hub with a repair stand and parcel desk',name:'On the Move',short:'Transit',hint:'Quick gigs & new routes',action:'transit_courier',x:49,y:88,point:[445,450]},
 {district:'west',place:'GARDEN',art:'garden',alt:'A community garden with vegetable beds and a greenhouse',name:'Growing Together',short:'Garden',hint:'Harvest & time outdoors',action:'garden_tend',x:21,y:76,point:[285,410]},
 {district:'west',place:'ARCADE',art:'arcade',alt:'An arcade and tabletop lounge with game cabinets and a pool table',name:'Extra Life',short:'Arcade',hint:'Games & new friends',action:'arcade_play',x:14,y:48,point:[223,277]},

];
export const locationFor=(place:string)=>locations.find(s=>s.place===place)||locations[0];
export const marbleColors=["#e26d38","#3d92d9","#9567d0","#dba51d"];
