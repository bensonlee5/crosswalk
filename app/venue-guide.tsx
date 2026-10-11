import {assetUrl} from '@/lib/asset-url';
import {guideOwnershipText,guideSentence,venueGuide} from '@/lib/guide-presentation';
import './venue-guide.css';

/** Optional local context; no encounter, inventory, or rules are created by a read. */
export function VenueGuide({regionId,placeId}:{regionId:string;placeId:string}){
 const venue=venueGuide(regionId,placeId);
 if(!venue)return null;
 return <section className="venue-guide" aria-label={`${venue.name} setting`} data-guide-venue={venue.id}>
  <p className="venue-guide-intro">{venue.summary}</p>
  <details key={venue.id}>
   <summary>Look around <span>History, surroundings & everyday objects</span></summary>
   <div className="venue-guide-notes">
    <p><strong>How it grew</strong> {guideSentence(venue.history)}</p>
    <p><strong>The building</strong> {guideSentence(venue.architecture)}</p>
    <p><strong>Weather & shelter</strong> {guideSentence(venue.climateNotes)}</p>
    {venue.objects.length>0&&<div className="venue-guide-objects">
     <h4>Objects in this place’s stories</h4>
     <p>These guide connections describe local lives. People keep their own belongings; an association does not mean an item is here to take.</p>
     <ul>{venue.objects.slice(0,3).map(item=><li key={item.id}><a href={assetUrl(`/manual/items/${item.id}/`)} target="_blank" rel="noreferrer">{item.name}</a><span>{guideOwnershipText(item)}</span></li>)}</ul>
    </div>}
    <a className="venue-guide-link" href={assetUrl(`/manual/venues/${venue.id}/`)} target="_blank" rel="noreferrer">Explore {venue.name} in the Travel Guide ↗</a>
   </div>
  </details>
 </section>;
}
