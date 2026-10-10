/** Used once against frozen 4216605 to capture legacy bytes, then against current
 * sources in the regression test. No generated UUIDs or wall-clock values remain. */
export async function motiveLegacyCampaign(base,seed=15,edition='cast'){
 const G=await import(new URL('game.ts',base)),L=await import(new URL('life-events.ts',base)),E=await import(new URL('economy.ts',base)),W=await import(new URL('world-life.ts',base)),S=await import(new URL('story-arcs.ts',base)),C=await import(new URL('character-cast.ts',base));
 const p=G.player('Legacy',1);p.id='legacy-fixed';
 const g={code:'LEGACY',mode:'hotseat',host:'owner',members:{owner:[p.id]},players:[p],status:'lobby',round:1,turn:0,maxRounds:8,log:[],seen:[],event:0,rulesVersion:2,lifeVersion:1,worldVersion:1,storyVersion:1,economyVersion:1,castVersion:1,historyVersion:1,balanceVersion:1,turnsTaken:0};
 if(edition==='pre-history')delete g.historyVersion;
 if(edition==='pre-cast'){delete g.historyVersion;delete g.castVersion;}
 E.initializeEconomyPlayer(p,g);L.initializeLife(g,seed);W.initializeWorldPlayer(p);W.initializeSharedWorld(g);S.initializeStory(g);C.initializeCast(g);g.status='playing';S.initializeStory(g);
 const states=[JSON.stringify(g)];
 for(let month=1;month<=8;month++){
  G.move(g,'visit','WORK');G.move(g,'work_short');
  const scene=S.getStoryView(g,p).scenes.find(v=>v.status==='available');
  if(scene&&W.visiblePlaces(p,g).includes(scene.spot)){
   G.move(g,'visit',scene.spot);const choice=S.getStoryView(g,p).scenes.find(v=>v.id===scene.id).choices.find(c=>c.available);
   if(choice)G.move(g,`story:${scene.id}:${choice.id}`);
  }
  const actor=C.castPeople(g,p).find(c=>c.choices.length);
  if(actor){G.move(g,'visit',actor.spot);const choice=C.castPeople(g,p).find(c=>c.id===actor.id).choices.find(c=>c.available);if(choice)G.move(g,choice.id);}
  const local=W.worldView(p,g)?.choices.find(c=>c.kind==='conversation');
  if(local?.spot&&W.visiblePlaces(p,g).includes(local.spot)){
   G.move(g,'visit',local.spot);const current=W.worldView(p,g).choices.find(c=>c.key===local.key);if(current.available)G.move(g,'world:'+current.id);
  }
  G.move(g,'end');states.push(JSON.stringify(g));
 }
 return states;
}
