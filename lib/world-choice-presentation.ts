import type {GameView as Game,Player} from './game';
import {worldPlaceName,type WorldChoiceView} from './world-life.ts';

/** Display names belong at the UI boundary; effects and saved receipts keep IDs.
 * Discoveries on arrival use the destination, while closures affect the origin. */
export function worldChoiceEffects(c:WorldChoiceView,p:Player,g:Game):string[]{
 const {preview}=c;
 const destination=preview.region&&p.world?{...p,world:{...p.world,region:preview.region}}:p;
 const discoveryName=(place:string)=>worldPlaceName(destination,place,g);
 return c.previewText.map(text=>{
  if(text.startsWith('Discover: '))return `Discover: ${preview.revealPlaces.map(discoveryName).join(', ')}`;
  if(text.startsWith('Permanently close here: '))return `Permanently close here: ${preview.closePlaces.map(place=>worldPlaceName(p,place,g)).join(', ')}`;
  return text;
 });
}
