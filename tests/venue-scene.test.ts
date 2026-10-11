import test from 'node:test';
import assert from 'node:assert/strict';
import {actions} from '../lib/game.ts';
import {regionDefinitions} from '../lib/world-life.ts';
import {currentGame} from './current-fixture.mjs';
import {venuePeople,venueChoices,afterVenueActivity,type VenuePerson} from '../lib/venue-scene.ts';

function room(){
 const g=currentGame({names:['Visitor'],seed:15}),p=g.players[0];p.place='CORNER CAFÉ';return {g,p};
}

test('one venue grid interleaves present people and activities without changing activity order',()=>{
 const activities=actions.filter(a=>a.place==='CORNER CAFÉ'),people:VenuePerson[]=[{id:'one',name:'One',role:'Neighbor',status:'Here',canTalk:true},{id:'away',name:'Away',role:'Neighbor',status:'Away',canTalk:true,remote:true},{id:'two',name:'Two',role:'Neighbor',status:'Here',canTalk:true}];
 const before=JSON.stringify({activities,people}),choices=venueChoices(activities,people);
 assert.deepEqual(choices.map(c=>c.kind),['activity','person','activity','person','activity']);
 assert.deepEqual(choices.filter(c=>c.kind==='activity').map(c=>c.activity.id),activities.map(a=>a.id));
 assert.deepEqual(choices.filter(c=>c.kind==='person').map(c=>c.person.id),['one','two']);assert.equal(JSON.stringify({activities,people}),before);
 assert.deepEqual(venueChoices([],people).map(c=>c.kind),['person','person']);assert.equal(venueChoices(activities,[]).length,activities.length);
});

test('coffee continuation prefers the actual current café host and cannot suggest unrelated activities',()=>{
 const {g,p}=room(),before=JSON.stringify(g),people=venuePeople(g,p,p.place),invite=afterVenueActivity(g,p,'cafe_break',p.place);
 assert.equal(invite?.actorId,'alder_tess');assert.ok(people.some(person=>person.id===invite?.actorId&&!person.remote));assert.equal(JSON.stringify(g),before);
 for(const action of actions.filter(a=>a.id!=='cafe_break'))assert.equal(afterVenueActivity(g,p,action.id,p.place),null,action.id);
 assert.equal(afterVenueActivity(g,p,'cafe_break','COMMUNITY'),null);p.place='WORK';assert.equal(afterVenueActivity(g,p,'cafe_break','CORNER CAFÉ'),null);
});

test('current region, discoverability, and remote contacts remain authoritative',()=>{
 const {g,p}=room();
 for(const region of Object.keys(regionDefinitions)){
  p.world!.region=region as typeof p.world.region;p.world!.discoveredPlacesByRegion[p.world!.region]=['APARTMENTS','WORK','THE PARK','CORNER CAFÉ','COMMUNITY'];p.place='CORNER CAFÉ';
  const before=JSON.stringify(g),people=venuePeople(g,p,p.place),invite=afterVenueActivity(g,p,'cafe_break',p.place);
  if(region!=='alder')assert.ok(!people.some(person=>['mina','eli','jo','alder_tess'].includes(person.id)));
  if(invite)assert.ok(people.some(person=>person.id===invite.actorId&&!person.remote&&person.canTalk));
  assert.equal(venuePeople(g,p,'LIBRARY').length,0);assert.equal(JSON.stringify(g),before);
 }
 p.world!.region='alder';p.place='COMMUNITY';g.cast!.schedule[g.round]=[];p.cast!.bonds.oren={phase:'met',approach:'listen',lastWeek:0,conflict:false,repaired:false,memories:[]};
 const remote=venuePeople(g,p,'COMMUNITY').find(person=>person.id==='oren');assert.equal(remote?.remote,true);assert.ok(!venueChoices([],venuePeople(g,p,'COMMUNITY')).some(c=>c.kind==='person'&&c.person.id==='oren'));
});

test('presence labels contain no biographies, scene outcomes or hidden scheduling fields',()=>{
 const {g,p}=room();for(const person of venuePeople(g,p,p.place))assert.ok(Object.keys(person).every(key=>['id','name','role','status','remote','canTalk'].includes(key)));
});
