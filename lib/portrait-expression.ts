/** Presentation-only acting cues for a scene the player is already reading.
 * Never inspect affection, hidden flags, future scenes, or another player's data.
 */
export type PortraitExpression='neutral'|'warm'|'concerned'|'hurt'|'relieved';
type VisibleScene={id:string;characters:readonly string[]};
type VisibleReceipt={sceneId:string;choiceId:string;automatic?:boolean};
const acting:Record<string,Record<string,PortraitExpression>>={
 'quay-promise':{mina:'warm',eli:'concerned',jo:'warm'},
 'quay-credit':{mina:'concerned',eli:'concerned',jo:'hurt'},
 'quay-replan':{mina:'hurt',eli:'concerned',jo:'concerned'},
 'quay-friction':{mina:'concerned',eli:'hurt',jo:'hurt'},
 'quay-build':{mina:'concerned',eli:'concerned',jo:'concerned'},
 'quay-first-set':{mina:'warm',eli:'relieved',jo:'relieved'},
 'quay-afterglow':{mina:'relieved',eli:'concerned',jo:'concerned'},
};
const responses:Record<string,Record<string,PortraitExpression>>={
 shared_credit:{mina:'relieved',eli:'relieved',jo:'relieved'},
 mina_first:{mina:'warm',eli:'concerned',jo:'hurt'},
 garden:{mina:'relieved',eli:'relieved',jo:'relieved'},
 workshop:{mina:'relieved',eli:'concerned',jo:'relieved'},
 demo:{mina:'relieved',eli:'concerned',jo:'relieved'},
 repair_first:{mina:'concerned',eli:'relieved',jo:'relieved'},
 share_evening:{mina:'relieved',eli:'relieved',jo:'relieved'},
 protect_set:{mina:'concerned',eli:'hurt',jo:'concerned'},
 be_here:{mina:'warm',eli:'warm',jo:'relieved'},
 shared_keys:{mina:'warm',eli:'relieved',jo:'relieved'},
 take_shift:{mina:'warm',eli:'relieved',jo:'relieved'},
};
export function scenePortraitExpression(actorId:string,scene?:VisibleScene|null,receipt?:VisibleReceipt|null):PortraitExpression{
 if(!scene||!scene.characters.includes(actorId))return 'neutral';
 const base=acting[scene.id]?.[actorId];if(!base)return 'neutral';
 if(receipt&&!receipt.automatic&&receipt.sceneId===scene.id){const choice=receipt.choiceId.split('~')[0];return responses[choice]?.[actorId]??base;}
 return base;
}
/** Face-aligned sheets reviewed against the current canonical manual portraits. */
export const expressionSheets:Record<string,{src:string;labels:Record<Exclude<PortraitExpression,'neutral'>,string>}>= {
 mina:{src:'/paintings/character-expressions/mina.webp',labels:{warm:'welcoming with a joyful smile',concerned:'listening with sympathetic concern',hurt:'looking hurt and disappointed',relieved:'showing tentative relief'}},
 eli:{src:'/paintings/character-expressions/eli.webp',labels:{warm:'showing quiet joy and pride',concerned:'listening with sympathetic concern',hurt:'looking hurt and disappointed',relieved:'showing grateful relief'}},
 jo:{src:'/paintings/character-expressions/jo.webp',labels:{warm:'laughing warmly',concerned:'listening with concern',hurt:'holding a firm boundary',relieved:'showing tentative hope and relief'}},
};
export const expressionPosition={warm:'0% 0%',concerned:'100% 0%',hurt:'0% 100%',relieved:'100% 100%'} as const;
