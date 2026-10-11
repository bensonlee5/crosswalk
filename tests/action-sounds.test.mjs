import test from 'node:test';
import assert from 'node:assert/strict';
import {actions} from '../lib/game.ts';
import {actionSound,activitySounds,clockSound} from '../lib/action-sounds.ts';
import {FOLEY_FILES} from '../lib/foley.ts';
const p={id:'p',place:'CORNER CAFÉ',hours:6,job:0,legacy:0};
const spent={...p,hours:5};

test('all 74 ordinary activities have an explicitly reviewed cue or intentional silence',()=>{
 assert.equal(actions.length,74);
 assert.deepEqual(Object.keys(activitySounds).sort(),actions.map(a=>a.id).sort());
 for(const cue of Object.values(activitySounds))assert.ok(cue===null||FOLEY_FILES[cue]);
});
test('physical actions use faithful recordings regardless of benefit category',()=>{
 const cases={cafe_break:'sip',friends:'sip',story_mina_1:'sip',home_meal:'cook',market_cook:'cook',park_read:'pageTurn',library_read:'pageTurn',library_learn:'pageTurn',library_club:'pageTurn',maker_intro:'repair',maker_repair:'repair',transit_repair:'repair',rest:'footsteps'};
 for(const [id,cue]of Object.entries(cases)){
  assert.equal(actionSound('move',id,p,spent),cue,id);
  assert.equal(actionSound('move',id,p,{...spent,legacy:3,job:1}),cue,'reward does not replace '+id);
  assert.equal(actionSound('move',id,p,p),null,'unchanged '+id+' remains quiet');
 }
 assert.equal(actionSound('move','visit',p,{...p,place:'THE PARK'}),'footsteps');
 assert.equal(actionSound('move','visit',p,p),null);
});
test('unknown and ambiguous activities are quiet, never inferred from stats or names',()=>{
 for(const id of ['study','work','apply','maker_hobby','garden_project','move','cafe_barista','park_run','transit_scenic','market_taste','new_action','repair:jo','cast:2:jo:repair','motive:2:jo:tag:repair','aspire:creative','world:2:1:food','world:2:1:travel:saffron']){
  assert.equal(actionSound('move',id,p,{...spent,skill:3,job:1,legacy:9,energy:80,social:4}),null,id);
 }
 assert.equal(actionSound('poll','cafe_break',p,spent),null);
 assert.equal(actionSound('move','cafe_break',p,{...spent,id:'other'}),null);
});
test('resolved story and event repairs require exact new receipts and actual work',()=>{
 const id='4:garden_setback:repair_pump',receipt={resolved:{choiceId:id,deferred:false}};
 const after={...spent,life:{receipts:[receipt]}};
 assert.equal(actionSound('move','event:'+id,p,after),'repair');
 assert.equal(actionSound('move','event:'+id,{...p,life:{receipts:[receipt]}},after),null);
 assert.equal(actionSound('move','event:'+id,p,{...spent,life:{receipts:[]}}),null);
 assert.equal(actionSound('move','event:'+id,p,{...after,life:{receipts:[{resolved:{choiceId:id,deferred:true}}]}}),null);
 assert.equal(actionSound('move','event:4:repair_bill:fund_repairs',p,{...p,life:{receipts:[{resolved:{choiceId:'4:repair_bill:fund_repairs',deferred:false}}]}}),null,'paying without doing a repair stays quiet');
 const choice='repair_first~4',story={receipts:[{sceneId:'quay-friction',choiceId:choice}]};
 assert.equal(actionSound('move','story:quay-friction:'+choice,p,{...spent,story}),'repair');
 assert.equal(actionSound('move','story:quay-friction:'+choice,p,{...p,story}),null,'backing an existing shared decision does not repair it again');
 assert.equal(actionSound('move','story:quay-credit:shared_credit~1',p,{...spent,story:{receipts:[{sceneId:'quay-credit',choiceId:'shared_credit~1'}]}}),'write');
 for(const method of ['paid','diy'])assert.equal(actionSound('move','home_repair:'+method,p,spent),'repair');
});
test('world exploration is a walk, but a transit trip is not assumed to be one',()=>{
 for(const id of ['2:1:explore','2:1:4:explore']){
  const after={...spent,world:{acceptedChoices:[id]}};
  assert.equal(actionSound('move','world:'+id,p,after),'footsteps');
  assert.equal(actionSound('move','world:'+id,{...p,world:{acceptedChoices:[id]}},after),null);
 }
});
test('chapter boundaries and clock alerts remain separate from semantic foley',()=>{
 assert.equal(actionSound('create',undefined), 'start');
 assert.equal(actionSound('move','end',p,p),'endWeek');
 assert.equal(actionSound('move','end',p,p,true),'finish');
 assert.equal(clockSound(p,{...p,hours:1}),'tick');
 assert.equal(clockSound(p,{...p,hours:0}),'timeUp');
 assert.equal(clockSound(p,p),null);
 assert.equal(clockSound(p,{...p,id:'other',hours:0}),null);
});
