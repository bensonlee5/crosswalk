import type { WeatherRegion } from './weather.ts';
/** New-room-only settlement and public-life context. Never an ethnicity or NPC-personality rule. */
export type RegionalLifeUsage = {
    round: number;
    participated: boolean;
};
type RegionalPlayer = {
    joy: number;
    world?: {
        version: number;
        region: string;
    };
    regionalLifeUsage?: RegionalLifeUsage;
};
type RegionalGame = {
    round: number;
};
export type RegionalLifeProfile = {
    settlement: string;
    exploreTitle: string;
    exploreText: string;
    discoveries: number;
    recovery: number;
    joy: number;
    sheltered: boolean;
    invitation: string;
    context: string;
    activities: readonly string[];
};
export const regionalLifeProfiles: Record<WeatherRegion, RegionalLifeProfile> = {
    alder: { settlement: 'Compact working port', exploreTitle: 'Follow the covered service lanes', exploreText: 'Brick terraces put the port’s everyday services close together. Covered lanes pass ferry notices and rain-dark porches without a long exposed walk.', discoveries: 2, recovery: 0, joy: 3, sheltered: true, invitation: 'Lend a hand along the quay', context: 'Ferry crews and pantry volunteers share the work of packing lunches and sorting bean tins. Join in if that is how you want to spend your time.', activities: ['volunteer', 'community_setup', 'community_skill'] },
    saffron: { settlement: 'Spacious coastal suburb', exploreTitle: 'Walk the courtyard neighborhoods', exploreText: 'Ochre homes and courtyard gardens spread between the canal arcades. A longer open-air walk follows pale paving from one shaded doorway to the next.', discoveries: 1, recovery: 6, joy: 4, sheltered: false, invitation: 'Share an evening in the courtyards', context: 'Guitar sets, courtyard films and café discussions bring people together beneath the arcades. There is room to enjoy them on your own terms.', activities: ['friends', 'cafe_openmic', 'cinema_club', 'cinema_friends', 'creative_practice'] },
    glasssteppe: { settlement: 'Compact railway city', exploreTitle: 'Follow the station service galleries', exploreText: 'Copper-roofed rail halls link this compact city’s services. Sheltered stone galleries and the step-free station route connect nearby doors.', discoveries: 2, recovery: 0, joy: 3, sheltered: true, invitation: 'Bring a question to the worktable', context: 'Reading rooms and copper-repair benches give neighbors places to compare diagrams and try a file or a hinge. Curiosity is welcome without needing to impress anyone.', activities: ['library_learn', 'maker_intro', 'maker_repair', 'study'] },
    pelagia: { settlement: 'Small harbor town and hinterland', exploreTitle: 'Explore the harbor and outer gardens', exploreText: 'The small harbor gives way to raised vegetable beds and scattered homes. Open walkways pass tide marks and shaded landings, with weather to plan around.', discoveries: 1, recovery: 6, joy: 4, sheltered: false, invitation: 'Care for the harbor’s everyday life', context: 'Seed trays, repaired bicycles and recorded lunch stories connect the harbor’s gardens, workbenches and archive. Choose a small contribution that interests you.', activities: ['garden_tend', 'transit_repair', 'library_digitize', 'community_setup'] },
    embermesa: { settlement: 'Dispersed rural mesa', exploreTitle: 'Take the open route between homesteads', exploreText: 'Timber porches and mulched kitchen beds are spread across open land. A longer unhurried outing restores energy between stops; cottonwood shade and weather matter.', discoveries: 1, recovery: 10, joy: 4, sheltered: false, invitation: 'Trade a little practical know-how', context: 'Bicycle cables, seed jars and hand-painted pottery give neighbors practical work to share across the mesa. You can take part without adopting every local interest.', activities: ['maker_hobby', 'maker_repair', 'garden_tend', 'park_read', 'community_skill'] }
};
export function regionalLifeProfile(p: RegionalPlayer, g?: RegionalGame) {
    void g;
    if (p.world?.version !== 1 || !Object.hasOwn(regionalLifeProfiles, p.world.region))
        return null;
    return regionalLifeProfiles[p.world.region as WeatherRegion];
}
const clamp = (value: number) => Math.max(0, Math.min(100, value));
/** One actually received participation benefit each month, shared across regions and reloads. */
export function regionalParticipation(p: RegionalPlayer, id: string, g: RegionalGame | undefined, baseJoy: number, visible = true) {
    const profile = regionalLifeProfile(p, g), applies = !!profile && visible && profile.activities.includes(id);
    const available = p.regionalLifeUsage?.round !== g?.round || !p.regionalLifeUsage?.participated;
    const joy = applies && available ? Math.min(2, 100 - clamp(p.joy + baseJoy)) : 0;
    return { applies, joy, storySummary: applies ? profile.context : '', summary: joy ? `+${joy} local participation happiness, included in the total.` : '' };
}
export function consumeRegionalParticipation(p: RegionalPlayer, g: RegionalGame, joy: number) { if (joy > 0)
    p.regionalLifeUsage = { round: g.round, participated: true }; }
