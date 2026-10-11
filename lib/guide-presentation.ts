import {guideItems,guideVenueByKey,type GuideItem} from './guide-catalog.ts';
import {canonicalCharacterById} from './character-canon.ts';

/** Guide associations are never a claim about today's presence or possession. */
export function venueGuide(regionId:string,placeId:string){
 const venue=guideVenueByKey[`${regionId}:${placeId}`];
 if(!venue)return null;
 return{...venue,objects:guideItems.filter(item=>item.storyStatus==='established_object'&&item.venueIds.includes(venue.id))};
}
export function guideSentence(text:string){return text.match(/^.*?[.!?](?:\s|$)/u)?.[0].trim()??text;}
export function guideOwnershipText(item:GuideItem){
 const ownership=item.ownership;
 const names=(ids:string[])=>ids.map(id=>canonicalCharacterById[id]?.name??id).join(', ');
 if(ownership.ownerLabel)return ownership.ownerLabel;
 if(ownership.ownerIds?.length)return `Belongs to ${names(ownership.ownerIds)}.`;
 if(ownership.borrowerIds?.length)return `Borrowed by ${names(ownership.borrowerIds)}; the guide does not establish ownership.`;
 return 'Ownership is not specified in the guide.';
}
