/** Deliberate artwork mapping: illustrations never carry dynamic interface text. */
export const locationPainting=(art:string)=>`/paintings/locations/${art}.webp`;
export const storyPainting=(person:string,stage:number)=>`/paintings/stories/${person}-${stage}.webp`;
export const portraitPainting=(person:string)=>`/paintings/portraits/${person}.webp`;
export const newsPainting=(week:number)=>`/paintings/news/week-${Math.max(1,Math.min(8,week))}.webp`;
export const seasonPainting=(season:string)=>`/paintings/seasons/${season.toLowerCase()}.webp`;
export const gardenPainting=(completed:boolean)=>`/paintings/garden/${completed?'complete':'building'}.webp`;
export const keepsakePainting=(person:string)=>`/paintings/keepsakes/${person}.webp`;
