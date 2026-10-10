import type {MotiveReceipt} from './character-motives.ts';
/** Only a confirmed visible outcome selects these current-canon, reviewed expressions. No attempt
 * is made to squeeze shame, fear or a different person's face into these four cues. */
export function motivePortrait(receipt?:Pick<MotiveReceipt,'actorId'|'emotion'>|null){
 if(receipt?.actorId!=='mina'||!receipt.emotion||!['sadness','envy','love','anger'].includes(receipt.emotion))return null;
 const labels={sadness:'feeling sadness',envy:'admitting a moment of envy',love:'showing affectionate tenderness',anger:'setting a boundary with anger'};
 return{src:`/paintings/character-expressions/mina-${receipt.emotion}.webp`,alt:`Mina, ${labels[receipt.emotion as keyof typeof labels]}`};
}
