import {initializeLife} from '../lib/life-events.ts';

/** Turn a freshly created API room into an authentic pre-story saved fixture.
 * Call before playing: older rooms began with $1,100 and the seven-event deck.
 * This does not migrate production saves or change the current API defaults.
 */
export function preStoryRoomFixture(game){
 for(const key of ['storyVersion','economyVersion','story','sharedWorld'])delete game[key];
 for(const player of game.players){
  for(const key of ['storyVersion','economyVersion','story','economyInitialized','economyWork'])delete player[key];
  if(player.world)delete player.world.story;
  player.cash=1100;
 }
 if(game.lifeVersion===1){
  const seed=game.lifeSeed;
  delete game.lifeSchedule;
  initializeLife(game,seed);
 }
 return game;
}
