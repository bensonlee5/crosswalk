import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
const root=process.env.CROSSWALK_TEST_ROOT||fileURLToPath(new URL('../',import.meta.url)).replace(/\/$/,'');
const require=createRequire(root+'/package.json');
const {actions,player,createEnvironment}=require(root+'/lib/game.ts');
const {actionPreview}=require(root+'/lib/game-view.ts');
const {choiceTerms,neighborAtPlace,afterChoiceInvitation}=require(root+'/lib/place-invitations.ts');
let cases=0;
for(const modern of [false,true])for(const round of [1,2,4,7,8])for(const hours of [0,1,2,3,6])for(const action of actions){
 const p={...player('Preview'),rulesVersion:modern?2:undefined,hours,place:action.place};
 const g={code:'QA0001',mode:'hotseat',host:'owner',members:{owner:[p.id]},players:[p],status:'playing',round,turn:0,maxRounds:8,log:[],seen:[],event:0,rulesVersion:modern?2:undefined,...createEnvironment()};
 const before=JSON.stringify(g),preview=actionPreview(p,action.id,g),terms=choiceTerms(p,action,g);
 assert.equal(preview.afterHours,Math.max(0,hours-action.time));
 assert.equal(preview.missingHours,Math.max(0,action.time-hours));
 assert.equal(preview.hours,-action.time,'the real action cost is unchanged');
 assert.doesNotMatch(terms.time,/-\d.*left/);
 if(action.time>hours)assert.match(terms.time,new RegExp(`Needs ${action.time-hours} more time block${action.time-hours===1?'':'s'}`));
 else assert.match(terms.time,new RegExp(`${hours-action.time} left after`));
 assert.equal(JSON.stringify(g),before,'presentation is read-only');cases++;
}
for(const round of [7,8]){
 const before=player('Neighbor'),p={...before,stories:{mina:1},storyWeeks:{mina:round}};
 const g={code:'QA0001',round,maxRounds:8,players:[p],turn:0,status:'playing'};
 if(round===8){assert.doesNotMatch(neighborAtPlace(p,'CORNER CAFÉ',g).text,/next week/);assert.equal(afterChoiceInvitation(before,p,g),null);}
 else{assert.match(neighborAtPlace(p,'CORNER CAFÉ',g).text,/other plans just now/);assert.match(afterChoiceInvitation(before,p,g).reason,/shared a good moment/);}
}
console.log(`PASS: ${cases} classic/modern activity previews: nonnegative remaining time, exact missing-block copy, unchanged cost and game state; final-week invitations stay honest.`);
