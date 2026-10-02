/** Explicit activity art coverage. Do not replace missing entries with location art. */
import type {Activity, Game} from './game';
import {getWeather} from './weather.ts';
export type ActionIllustration={src:string;thumb:string;alt:string};
const painting=(file:string,alt:string):ActionIllustration=>({src:`/paintings/${file}.webp`,thumb:`/paintings/actions/thumbs/${file.replaceAll('/','--')}.webp`,alt});
export const ACTION_ILLUSTRATIONS:Record<string,ActionIllustration>={
 "move":{src:"/paintings/actions/move.webp",thumb:"/paintings/actions/thumbs/move.webp",alt:"Oil painting: get your own place"},
 "home_reset":{src:"/paintings/actions/home_reset.webp",thumb:"/paintings/actions/thumbs/home_reset.webp",alt:"Oil painting: reset your space"},
 "home_meal":painting("locations/apartments","Oil painting: cook a proper meal"),
 "home_host":{src:"/paintings/actions/home_host.webp",thumb:"/paintings/actions/thumbs/home_host.webp",alt:"Oil painting: host a potluck"},
 "work":{src:"/paintings/actions/work.webp",thumb:"/paintings/actions/thumbs/work.webp",alt:"Oil painting: work a shift"},
 "work_short":{src:"/paintings/actions/work_short.webp",thumb:"/paintings/actions/thumbs/work_short.webp",alt:"Oil painting: pick up a short shift"},
 "work_overtime":{src:"/paintings/actions/work_overtime.webp",thumb:"/paintings/actions/thumbs/work_overtime.webp",alt:"Oil painting: take the overtime block"},
 "work_mentor":painting("locations/work","Oil painting: shadow a senior colleague"),
 "study":{src:"/paintings/actions/study.webp",thumb:"/paintings/actions/thumbs/study.webp",alt:"Oil painting: take a short course"},
 "campus_bootcamp":{src:"/paintings/actions/campus_bootcamp.webp",thumb:"/paintings/actions/thumbs/campus_bootcamp.webp",alt:"Oil painting: join an intensive bootcamp"},
 "campus_group":painting("locations/campus","Oil painting: study with a small group"),
 "campus_tutor":{src:"/paintings/actions/campus_tutor.webp",thumb:"/paintings/actions/thumbs/campus_tutor.webp",alt:"Oil painting: tutor another learner"},
 "apply":painting("locations/careers","Oil painting: make a career move"),
 "career_network":{src:"/paintings/actions/career_network.webp",thumb:"/paintings/actions/thumbs/career_network.webp",alt:"Oil painting: go to a networking meetup"},
 "career_portfolio":{src:"/paintings/actions/career_portfolio.webp",thumb:"/paintings/actions/thumbs/career_portfolio.webp",alt:"Oil painting: build a portfolio project"},
 "career_contract":{src:"/paintings/actions/career_contract.webp",thumb:"/paintings/actions/thumbs/career_contract.webp",alt:"Oil painting: take a referral contract"},
 "friends":{src:"/paintings/actions/friends.webp",thumb:"/paintings/actions/thumbs/friends.webp",alt:"Oil painting: meet your people"},
 "cafe_break":painting("locations/cafe","Oil painting: take a quiet coffee break"),
 "cafe_openmic":{src:"/paintings/actions/cafe_openmic.webp",thumb:"/paintings/actions/thumbs/cafe_openmic.webp",alt:"Oil painting: try the open mic"},
 "cafe_barista":{src:"/paintings/actions/cafe_barista.webp",thumb:"/paintings/actions/thumbs/cafe_barista.webp",alt:"Oil painting: cover the espresso bar"},
 "volunteer":painting("locations/community","Oil painting: lend a hand"),
 "community_setup":{src:"/paintings/actions/community_setup.webp",thumb:"/paintings/actions/thumbs/community_setup.webp",alt:"Oil painting: set up the food pantry"},
 "community_lead":{src:"/paintings/actions/community_lead.webp",thumb:"/paintings/actions/thumbs/community_lead.webp",alt:"Oil painting: lead a neighborhood event"},
 "community_skill":{src:"/paintings/actions/community_skill.webp",thumb:"/paintings/actions/thumbs/community_skill.webp",alt:"Oil painting: join a community workshop"},
 "rest":{src:"/paintings/actions/rest.webp",thumb:"/paintings/actions/thumbs/rest.webp",alt:"Oil painting: take the slow route"},
 "park_picnic":painting("locations/park","Oil painting: pack a picnic with friends"),
 "park_run":{src:"/paintings/actions/park_run.webp",thumb:"/paintings/actions/thumbs/park_run.webp",alt:"Oil painting: go for a morning run"},
 "park_read":{src:"/paintings/actions/park_read.webp",thumb:"/paintings/actions/thumbs/park_read.webp",alt:"Oil painting: read under a tree"},
 "library_learn":{src:"/paintings/actions/library_learn.webp",thumb:"/paintings/actions/thumbs/library_learn.webp",alt:"Oil painting: learn from free resources"},
 "library_read":painting("locations/library","Oil painting: get lost in a good book"),
 "library_club":{src:"/paintings/actions/library_club.webp",thumb:"/paintings/actions/thumbs/library_club.webp",alt:"Oil painting: join the book club"},
 "library_digitize":{src:"/paintings/actions/library_digitize.webp",thumb:"/paintings/actions/thumbs/library_digitize.webp",alt:"Oil painting: help digitize the archive"},
 "market_shift":painting("locations/market","Oil painting: cover a market stall"),
 "market_cook":{src:"/paintings/actions/market_cook.webp",thumb:"/paintings/actions/thumbs/market_cook.webp",alt:"Oil painting: take a cooking class"},
 "market_taste":{src:"/paintings/actions/market_taste.webp",thumb:"/paintings/actions/thumbs/market_taste.webp",alt:"Oil painting: explore the tasting stalls"},
 "market_resell":{src:"/paintings/actions/market_resell.webp",thumb:"/paintings/actions/thumbs/market_resell.webp",alt:"Oil painting: run a secondhand pop-up"},
 "gym_yoga":painting("locations/gym","Oil painting: join a gentle yoga class"),
 "gym_train":{src:"/paintings/actions/gym_train.webp",thumb:"/paintings/actions/thumbs/gym_train.webp",alt:"Oil painting: train with a friend"},
 "gym_sauna":{src:"/paintings/actions/gym_sauna.webp",thumb:"/paintings/actions/thumbs/gym_sauna.webp",alt:"Oil painting: take a recovery session"},
 "gym_desk":{src:"/paintings/actions/gym_desk.webp",thumb:"/paintings/actions/thumbs/gym_desk.webp",alt:"Oil painting: cover the front desk"},
 "maker_intro":painting("locations/makers","Oil painting: learn to repair"),
 "maker_commission":{src:"/paintings/actions/maker_commission.webp",thumb:"/paintings/actions/thumbs/maker_commission.webp",alt:"Oil painting: finish a custom commission"},
 "maker_hobby":{src:"/paintings/actions/maker_hobby.webp",thumb:"/paintings/actions/thumbs/maker_hobby.webp",alt:"Oil painting: make something just for fun"},
 "maker_repair":{src:"/paintings/actions/maker_repair.webp",thumb:"/paintings/actions/thumbs/maker_repair.webp",alt:"Oil painting: help at the repair caf\u00e9"},
 "cinema_matinee":painting("locations/cinema","Oil painting: catch a matinee"),
 "cinema_friends":{src:"/paintings/actions/cinema_friends.webp",thumb:"/paintings/actions/thumbs/cinema_friends.webp",alt:"Oil painting: make it a movie night"},
 "cinema_usher":{src:"/paintings/actions/cinema_usher.webp",thumb:"/paintings/actions/thumbs/cinema_usher.webp",alt:"Oil painting: work an usher shift"},
 "cinema_club":{src:"/paintings/actions/cinema_club.webp",thumb:"/paintings/actions/thumbs/cinema_club.webp",alt:"Oil painting: stay for the film discussion"},
 "transit_courier":{src:"/paintings/actions/transit_courier.webp",thumb:"/paintings/actions/thumbs/transit_courier.webp",alt:"Oil painting: take a bicycle courier route"},
 "transit_repair":{src:"/paintings/actions/transit_repair.webp",thumb:"/paintings/actions/thumbs/transit_repair.webp",alt:"Oil painting: repair bikes at the hub"},
 "transit_scenic":painting("locations/transit","Oil painting: ride somewhere new"),
 "transit_cleanup":{src:"/paintings/actions/transit_cleanup.webp",thumb:"/paintings/actions/thumbs/transit_cleanup.webp",alt:"Oil painting: join the car-free street crew"},
 "garden_tend":painting("locations/garden","Oil painting: tend a shared plot"),
 "garden_harvest":{src:"/paintings/actions/garden_harvest.webp",thumb:"/paintings/actions/thumbs/garden_harvest.webp",alt:"Oil painting: help with the harvest"},
 "garden_workshop":{src:"/paintings/actions/garden_workshop.webp",thumb:"/paintings/actions/thumbs/garden_workshop.webp",alt:"Oil painting: learn urban growing"},
 "garden_rest":{src:"/paintings/actions/garden_rest.webp",thumb:"/paintings/actions/thumbs/garden_rest.webp",alt:"Oil painting: spend a slow afternoon here"},
 "arcade_play":{src:"/paintings/actions/arcade_play.webp",thumb:"/paintings/actions/thumbs/arcade_play.webp",alt:"Oil painting: play a few favorites"},
 "arcade_tabletop":painting("locations/arcade","Oil painting: join a tabletop night"),
 "arcade_host":{src:"/paintings/actions/arcade_host.webp",thumb:"/paintings/actions/thumbs/arcade_host.webp",alt:"Oil painting: host a game meetup"},
 "arcade_shift":{src:"/paintings/actions/arcade_shift.webp",thumb:"/paintings/actions/thumbs/arcade_shift.webp",alt:"Oil painting: cover the evening desk"},
 "creative_practice":{src:"/paintings/actions/creative_practice.webp",thumb:"/paintings/actions/thumbs/creative_practice.webp",alt:"Oil painting: practice your craft"},
 "creative_commission":{src:"/paintings/actions/creative_commission.webp",thumb:"/paintings/actions/thumbs/creative_commission.webp",alt:"Oil painting: deliver a creative commission"},
 "community_organize":{src:"/paintings/actions/community_organize.webp",thumb:"/paintings/actions/thumbs/community_organize.webp",alt:"Oil painting: coordinate a paid community day"},
 "garden_project":painting("garden/building","Oil painting: build the neighborhood garden"),
 "story_mina_1":painting("stories/mina-1","Oil painting: meet mina over closing-time coffee"),
 "story_mina_2":painting("stories/mina-2","Oil painting: rehearse with mina"),
 "story_mina_3":painting("stories/mina-3","Oil painting: be there for mina\u2019s first set"),
 "story_eli_1":painting("stories/eli-1","Oil painting: meet eli by the empty beds"),
 "story_eli_2":painting("stories/eli-2","Oil painting: help eli save the seedlings"),
 "story_eli_3":painting("stories/eli-3","Oil painting: share eli\u2019s first harvest"),
 "story_jo_1":painting("stories/jo-1","Oil painting: meet jo at the repair bench"),
 "story_jo_2":painting("stories/jo-2","Oil painting: help jo rebuild the sign"),
 "story_jo_3":painting("stories/jo-3","Oil painting: light jo\u2019s restored sign"),
};
const opportunityArt=(id:string,alt:string)=>({src:`/paintings/actions/${id}.webp`,thumb:`/paintings/actions/thumbs/${id}.webp`,alt});
export const OPPORTUNITY_ILLUSTRATIONS:readonly ActionIllustration[]=[
 opportunityArt("opportunity_poster","Oil painting: spring festival poster"),
 opportunityArt("opportunity_market","Oil painting: rainy-day indoor market"),
 opportunityArt("opportunity_showcase","Oil painting: summer craft showcase"),
 opportunityArt("opportunity_research","Oil painting: cool-room neighborhood research"),
 opportunityArt("opportunity_shop","Oil painting: autumn shop welcome"),
 opportunityArt("opportunity_sign","Oil painting: rainy-day sign workshop"),
 opportunityArt("opportunity_supper","Oil painting: greenhouse harvest supper"),
 opportunityArt("opportunity_finale","Oil painting: winter lantern finale"),
];
export const CLASSIC_MURAL_ILLUSTRATION=opportunityArt('opportunity_mural','Oil painting: neighbors paint an outdoor community mural');
export const RAINY_COFFEE_ILLUSTRATION=painting('locations/cafe-rain','Oil painting: a quiet coffee break sheltered from the rain');
export const COMPLETED_GARDEN_ILLUSTRATION=painting('garden/complete','Oil painting: neighbors celebrate the completed shared garden');

type ArtGame=Pick<Game,'round'|'rulesVersion'|'environmentVersion'|'project'|'weatherSchedule'>;
/** Campaign variants change only imagery. The existing game functions own all effects. */
export function actionIllustration(action:Pick<Activity,'id'>,game?:ArtGame):ActionIllustration{
 if(action.id==='weekly_opportunity'){
  const week=game?.round||1;
  const index=((week-1)%8+8)%8;
  if(index===5&&!(game?.environmentVersion===1&&game.rulesVersion===2))return CLASSIC_MURAL_ILLUSTRATION;
  return OPPORTUNITY_ILLUSTRATIONS[index];
 }
 if(action.id==='garden_project'&&game?.project?.completed)return COMPLETED_GARDEN_ILLUSTRATION;
 if(action.id==='cafe_break'&&getWeather(game)?.type==='rain')return RAINY_COFFEE_ILLUSTRATION;
 const illustration=ACTION_ILLUSTRATIONS[action.id];
 if(!illustration)throw new Error('Missing activity illustration: '+action.id);
 return illustration;
}
