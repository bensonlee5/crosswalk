import {player,createEnvironment} from '../lib/game.ts';
import {initializeLife} from '../lib/life-events.ts';
import {initializeWorldPlayer,initializeSharedWorld} from '../lib/world-life.ts';
import {initializeStory} from '../lib/story-arcs.ts';
import {initializeCast} from '../lib/character-cast.ts';
import {initializeMotivesPlayer} from '../lib/character-motives.ts';
import {initializeSharedOpportunities} from '../lib/shared-opportunities.ts';
import {initializeCareerPlayer} from '../lib/careers.ts';
import {initializeFinancialRecovery} from '../lib/financial-recovery.ts';
import {initializeActionIncidents} from '../lib/action-incidents.ts';
/** Fresh current room, never an adapter for stored data. */
export function currentGame({names=['A'],seed=42,playing=true}={}){
 const players=names.map(player),g={schemaVersion:1,code:'MODERN',mode:'hotseat',host:'owner',members:{owner:players.map(p=>p.id)},players,status:'lobby',round:1,turn:0,maxRounds:8,log:[],turnsTaken:0,...createEnvironment()};
 initializeLife(g,seed);for(const p of players)initializeWorldPlayer(p);initializeSharedWorld(g);initializeSharedOpportunities(g);initializeStory(g);initializeCast(g);for(const p of players){initializeMotivesPlayer(g,p);initializeCareerPlayer(g,p);initializeFinancialRecovery(g,p);}initializeActionIncidents(g,()=>new Uint32Array([seed,2,3,4]));
 if(playing){g.status='playing';initializeStory(g);}return g;
}
