import type {LayoutRegion} from './region-layouts';
/** Screen anchors hand-reviewed against the final 1536×1024 paintings.
 * Art is immutable; paths and occlusion follow the painted streets rather than assuming
 * the generative artist exactly reproduced a projection guide. Values are source pixels. */
export type PaintedVenue={door:[number,number];box:[number,number,number,number];via?:[number,number][];road?:string};
const ids=['APARTMENTS','WORK','CAMPUS','CAREER HUB','CORNER CAFÉ','COMMUNITY','THE PARK','LIBRARY','MARKET','FITNESS','MAKERSPACE','CINEMA','TRANSIT','GARDEN','ARCADE'];
const raw:Record<LayoutRegion,{nodes:[number,number][];venues:[number,number,number,number,number,number][]}>={
 alder:{nodes:[[443,251],[615,308],[776,379],[346,304],[505,382],[660,450],[205,370],[385,449],[565,529],[985,516],[1153,588],[1360,661],[872,574],[1048,656],[1228,738],[786,651],[967,741],[1138,823],[678,590]],venues:[
 [547,246,463,77,184,179],[637,285,594,132,155,176],[789,366,708,208,151,165],[654,485,637,341,165,174],[441,538,383,393,145,149],[306,454,207,301,184,161],[284,310,234,188,131,120],
 [1063,509,978,337,178,179],[1187,568,1112,395,189,181],[1376,634,1271,466,147,169],[1337,787,1172,610,204,180],[944,799,852,654,171,145],[799,754,723,597,156,154],[670,664,602,554,126,111],[821,556,762,408,143,147]]},
 saffron:{nodes:[[507,249],[638,304],[780,360],[381,314],[512,371],[648,430],[278,377],[407,435],[542,493],[997,490],[1161,556],[1323,630],[879,549],[1042,619],[1182,682],[778,603],[932,682],[1098,752],[661,550]],venues:[
 [531,218,487,84,120,138],[676,285,620,157,164,138],[819,359,799,235,129,126],[662,508,618,382,145,130],[439,559,382,450,109,107],[224,474,135,343,202,146],[286,303,220,198,128,106],
 [1061,491,1018,342,147,149],[1202,562,1151,415,166,151],[1353,635,1337,493,129,143],[1279,795,1168,644,180,151],[983,843,923,730,117,112],[770,780,726,630,160,151],[659,685,594,566,149,120],[846,563,741,413,143,151]]},
 glasssteppe:{nodes:[[506,281],[634,344],[759,410],[391,340],[524,407],[652,473],[279,402],[411,468],[543,535],[936,517],[1055,580],[1197,650],[821,582],[949,650],[1076,717],[709,649],[844,717],[984,786],[625,594]],venues:[
 [552,293,505,149,128,140],[640,341,618,212,141,131],[762,411,721,276,134,133],[655,565,628,449,119,116],[468,592,416,488,106,103],[325,544,282,420,120,122],[308,355,247,263,120, 90],
 [982,528,934,385,127,139],[1059,576,1041,443,126,133],[1228,650,1170,521,113,124],[1112,804,1035,679,127,128],[887,831,840,729,103,102],[752,795,714,668,122,129],[682,708,622,610,117,98],[731,606,697,490,125,116]]},
 pelagia:{nodes:[[482,259],[620,318],[754,377],[374,322],[503,390],[629,447],[548,514],[559,510],[681,569],[974,481],[1125,551],[1281,626],[881,546],[1017,615],[1176,690],[759,651],[918,723],[1063,790],[770,612]],venues:[
 [509,228,469,81,159,147],[671,290,621,150,180,141],[837,378,785,264,127,114],[666,528,622,385,140,145],[483,567,442,451,104,116],[307,458,210,325,160,135],[291,310,217,198,150,115],
 [1033,477,976,350,156,127],[1199,542,1154,405,147,138],[1380,631,1290,488,153,144],[1253,814,1126,676,161,137],[945,834,886,708,135,130],[787,782,711,635,165,145],[729,701,651,566,150,135],[815,574,741,407,103,169]]},
 embermesa:{nodes:[[466,261],[628,334],[786,407],[371,324],[539,395],[684,470],[269,377],[431,450],[585,526],[948,492],[1119,578],[1293,658],[849,560],[1014,640],[1189,720],[760,622],[928,705],[1086,790],[670,574]],venues:[
 [524,253,480,150,102,107],[688,320,647,244,114,78],[857,398,813,332,82,70],[674,535,617,437,127,103],[449,583,400,503,100, 80],[262,490,196,404,120,92],[306,329,251,228,137,107],
 [1033,488,963,402,131,91],[1196,568,1143,486,128, 90],[1404,650,1314,556,126,103],[1267,798,1175,691,125,111],[984,854,932,750,122,108],[789,771,732,684,102,91],[679,693,592,587,151,113],[818,575,758,485,103,95]]},
};
export const paintedScenes=Object.fromEntries(Object.entries(raw).map(([region,data])=>[region,{nodes:Object.fromEntries(data.nodes.map((p,i)=>[i===18?'crossing':`${i<9?'main':'west'}:${i%9}`,p])),venues:Object.fromEntries(data.venues.map(([x,y,bx,by,w,h],i)=>[ids[i],{door:[x,y],box:[bx,by,w,h]}]))}])) as Record<LayoutRegion,{nodes:Record<string,[number,number]>;venues:Record<string,PaintedVenue>}>;
// Doorways on the far face of a painted building go around its footprint first.
// These little doorstep detours prevent diagonal walks through walls or canals.
const detours:Partial<Record<LayoutRegion,Record<string,{road?:string;via:[number,number][]}>>>= {
 saffron:{'COMMUNITY':{road:'main:6',via:[[158,463],[125,440],[175,365],[275,341]]},'CORNER CAFÉ':{via:[[495,560],[507,518]]},'CAREER HUB':{road:'main:8',via:[[599,517],[574,495]]},'MAKERSPACE':{road:'west:8',via:[[1174,801],[1139,774]]},'CINEMA':{via:[[1054,846],[1085,803]]},'TRANSIT':{via:[[850,810],[903,778],[896,718]]},'GARDEN':{via:[[711,703],[764,661]]}},
 alder:{'COMMUNITY':{via:[[374,468],[398,453]]},'CORNER CAFÉ':{via:[[526,552],[565,540]]},'CAREER HUB':{via:[[619,475]]},'MAKERSPACE':{road:'west:8',via:[[1170,807],[1138,798]]},'CINEMA':{via:[[1046,817],[1104,812]]},'TRANSIT':{via:[[854,779],[920,769]]},'GARDEN':{via:[[717,689],[767,667]]}},
 glasssteppe:{'COMMUNITY':{via:[[375,549],[399,500]]},'CORNER CAFÉ':{via:[[523,595],[552,567]]},'CAREER HUB':{via:[[600,549],[609,499]]},'MAKERSPACE':{road:'west:8',via:[[1026,810],[989,802]]},'CINEMA':{via:[[954,841],[984,815]]},'TRANSIT':{via:[[802,810],[844,780]]},'GARDEN':{via:[[698,728],[722,685]]}},
 pelagia:{'COMMUNITY':{road:'main:3',via:[[367,449],[399,400],[403,349]]},'CORNER CAFÉ':{road:'main:6',via:[[530,582],[563,551]]},'CAREER HUB':{via:[[600,535],[581,500]]},'MAKERSPACE':{road:'west:8',via:[[1131,814],[1099,779]]},'CINEMA':{via:[[1006,850],[1036,833],[1054,801]]},'TRANSIT':{via:[[843,805],[890,780]]},'GARDEN':{road:'west:6',via:[[777,712],[817,681]]}},
 embermesa:{'COMMUNITY':{via:[[340,504],[405,482]]},'CORNER CAFÉ':{via:[[512,591],[553,554]]},'CAREER HUB':{via:[[603,535],[645,489]]},'MAKERSPACE':{road:'west:8',via:[[1143,830],[1100,810]]},'CINEMA':{via:[[1053,864],[1104,830]]},'TRANSIT':{via:[[858,803],[904,758]]},'GARDEN':{via:[[731,709],[770,654]]}},
};
for(const [r,entries]of Object.entries(detours))for(const[id,entry]of Object.entries(entries)){Object.assign(paintedScenes[r as LayoutRegion].venues[id],entry);}
// Bridge deck centerlines and the makerspace's north-west stair were checked
// at 2× source resolution; do not replace these with a straight waterfront chord.
Object.assign(paintedScenes.saffron.nodes,{'main:6':[266,364],'main:7':[403,427],'main:8':[532,481],'west:3':[874,565],'west:4':[1028,642],'west:5':[1168,711],'west:6':[780,624],'west:7':[935,703],'west:8':[1081,771]});
Object.assign(paintedScenes.saffron.venues.MAKERSPACE,{road:'west:5',via:[[1210,767],[1178,741],[1164,717]]});
Object.assign(paintedScenes.saffron.venues.COMMUNITY,{road:'main:6',via:[[158,463],[125,440],[175,365],[235,348]]});
// Pelagia's public walks branch around the spillway. The garden is the planted
// terrace behind Transit, with its entrance on the eastern promenade.
Object.assign(paintedScenes.pelagia.nodes,{'crossing':[913,607],'west:6':[897,652],'west:4':[977,640],'west:7':[1045,726],'west:8':[1125,734]});
Object.assign(paintedScenes.pelagia.venues.GARDEN,{door:[872,642],box:[600,555,300,148],road:'west:6',via:[]});
Object.assign(paintedScenes.pelagia.venues.TRANSIT,{road:'west:6',via:[[858,789],[891,762],[880,712]]});
Object.assign(paintedScenes.pelagia.venues['CORNER CAFÉ'],{road:'main:6',via:[[531,571],[549,548],[557,525]]});
paintedScenes.pelagia.nodes['main:6']=[563,506];
// Quay and rail-town footpaths stay on the promenade behind the south-row
// facades; entrances facing the water wrap around the outside of the buildings.
Object.assign(paintedScenes.alder.nodes,{'main:6':[381,386],'main:7':[548,468],'crossing':[715,551],'west:6':[795,590],'west:7':[971,678],'west:8':[1135,757]});
Object.assign(paintedScenes.alder.venues.TRANSIT,{road:'west:6',via:[[738,759],[701,716],[700,674],[748,614]]});
Object.assign(paintedScenes.glasssteppe.nodes,{'crossing':[631,566],'west:6':[748,629],'west:7':[891,705],'west:8':[1029,777]});
Object.assign(paintedScenes.glasssteppe.venues.TRANSIT,{road:'west:6',via:[[715,788],[692,744],[697,695]]});
Object.assign(paintedScenes.embermesa.nodes,{'main:3':[355,342],'main:4':[518,420],'main:5':[674,491]});
/** Insets of clearly visible open water, hand traced from final art. They are
 * negative-space checks, not a replacement for route/deck review. */
export const openWaterChecks:Partial<Record<LayoutRegion,[number,number][][]>>={
 saffron:[[[537,292],[710,367],[626,403],[455,327]],[[363,353],[568,439],[530,459],[346,376]],[[1044,527],[1261,626],[1151,679],[930,574]],[[920,607],[1124,698],[1092,726],[890,635]],[[1147,764],[1241,812],[1179,842],[1115,789]]],
 pelagia:[[[548,285],[691,343],[631,391],[490,333]],[[1024,536],[1190,605],[1099,655],[958,588]]],
};
Object.assign(paintedScenes.pelagia.nodes,{'main:0':[524,249],'main:1':[658,305],'main:2':[784,362]});
