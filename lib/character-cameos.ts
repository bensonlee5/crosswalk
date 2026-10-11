import type { Game, Player } from './game.ts';
import type { CastAppearance, CastPersonView, CastChoice } from './character-cast.ts';
import type { RegionId } from './world-life.ts';
import { visiblePlaces } from './world-life.ts';
import { getStoryView } from './story-arcs.ts';
import { canonicalCharacterById, canonicalFamilyVenue } from './character-canon.ts';
type Cameo = {
    id: string;
    venue: string;
    period: number;
    offset: number;
    guardian?: string;
    intro: string;
    listenTitle: string;
    listen: string;
    choiceTitle: string;
    choice: string;
    listenCallback: string;
    choiceCallback: string;
};
/** A few local lives, not 68 simultaneous NPCs. Children have no employment,
 * romantic, caregiving, favor, promise, trust or reward track. */
export const characterCameos: Cameo[] = [
    { id: 'celia_baptiste', venue: 'COMMUNITY', period: 2, offset: 1,
        intro: 'Celia has cleared one corner of a community table for a small painting. A bag of dominoes waits beside it. “You may have an opinion about the blue. It is not a vote.”',
        listenTitle: 'Ask about the painting she chose', listen: 'Celia describes clearing family storage out of her painting space. “I love them. I also want this corner back.” She enjoys explaining the strange blue without promising the pantry another shift.',
        choiceTitle: 'Compare two patches of blue', choice: 'You name which patch looks colder to you. Celia studies both, then chooses the other one. “Useful disagreement. I still get the brush.” The painting changes by her decision; your opinion was company, not an instruction.',
        listenCallback: 'Celia remembers that you asked about the painting instead of finding her another job. She has brought the same small canvas, with one changed edge.', choiceCallback: 'Celia remembers the blue you preferred and points to the different shade she chose. You helped her look; you did not become the painter.' },
    { id: 'farah_hussain', venue: 'CORNER CAFÉ', period: 2, offset: 0,
        intro: 'Farah is reading a radio-drama program after closing the haberdashery. Sami’s game plans are not on the table. “I have enough unfinished plots already.”',
        listenTitle: 'Ask what draws her to the drama', listen: 'Farah defends one implausible character with magnificent seriousness. She catches your look. “Yes, I would question that excuse from a supplier.” She can enjoy a story without turning the evening into work or spoiling its ending.',
        choiceTitle: 'Check a shorter shop-hours notice', choice: 'Farah asks whether her drafted closing time is easy to find. You point to the buried line; she moves it above the explanation. The notice is a draft she can decide to use. Tonight’s listening group remains a reason to go out, not a job for you to cover.',
        listenCallback: 'Farah remembers discussing the plot without giving its ending away. She asks whether you want one recommendation, then waits.', choiceCallback: 'Farah remembers the closing-time line you helped make visible. She has kept the draft in her bag to think over before choosing new hours.' },
    { id: 'liang_chen', venue: 'COMMUNITY', period: 3, offset: 0,
        intro: 'Liang has come on time for a community drawing session. “That chair has a better light,” he begins, then laughs at himself. “I am the sitter, not the whole class.”',
        listenTitle: 'Ask what it feels like to be drawn', listen: 'Liang considers a sketch that makes him look older than he expected. “That is my face today. Show me what caught your eye.” He is interested in the artist’s observation, not a flattering replacement.',
        choiceTitle: 'Ask before offering a note', choice: 'You ask whether Liang wants a suggestion about the sitting or simply company. He chooses company. “I do give the answer before checking the question. Qiao has pointed that out.” You listen without settling his conversation with his adult daughter for him.',
        listenCallback: 'Liang remembers that you asked about being drawn rather than asking for another goods-lift story. His present life has something to say too.', choiceCallback: 'Liang remembers being asked what sort of response he wanted. This time he asks the same question before offering you a recommendation.' },
    { id: 'mei_chen', venue: 'COMMUNITY', period: 3, offset: 1,
        intro: 'Mei is putting chorus copies into a small stack. “Enough chairs, enough copies, and then we can actually sing.” Ren’s mother catches herself before choosing a song for everyone.',
        listenTitle: 'Ask which part of choir she enjoys', listen: 'Mei begins with the pleasure of a familiar chorus acquiring an unfamiliar voice. She almost fills your pause with a second question, then waits. A lively room can leave room for someone else to begin.',
        choiceTitle: 'Read the start-and-finish notice', choice: 'You check the two times on Mei’s rehearsal notice. She makes the finish as visible as the start and keeps the song choice open for the singers. The room will not require an endlessly available organizer.',
        listenCallback: 'Mei remembers leaving the pause for your answer. She asks a shorter question and gives it time.', choiceCallback: 'Mei remembers the equally visible finishing time. She leaves the extra chorus for another gathering instead of quietly extending this one.' },
    { id: 'hana_mori', venue: 'THE PARK', period: 3, offset: 2,
        intro: 'Hana compares a sheltered loop with a longer climb. Her old postal round is no longer the measure of a successful morning. “Which walk are we actually having?”',
        listenTitle: 'Ask about a card she kept', listen: 'Hana recalls an ordinary greeting card with hardly any news. “They thought to send it. That is news enough for me.” A visit to her adult nibling Sora need not turn into an inspection of the workshop.',
        choiceTitle: 'Choose a shorter walk together', choice: 'You say plainly that the sheltered loop is what fits today. Hana changes the plan. “Then we stop there. No postbag waiting at the top.” The agreement is this short visit, with no promise to complete a longer route.',
        listenCallback: 'Hana remembers your interest in the uneventful card. This time her first observation is about a familiar doorway rather than the distance still to cover.', choiceCallback: 'Hana remembers taking the shorter route you agreed. She names both options again instead of assuming yesterday’s pace.' },
    { id: 'yuna_park', venue: 'CORNER CAFÉ', period: 2, offset: 0,
        intro: 'Yuna has put the microphone away after her Pelagian neighborhood radio hour. “I think I have used all my introductions. Could this just be a conversation?”',
        listenTitle: 'Ask how the new neighborhood feels', listen: 'Yuna says that flat harbor routes still feel different from Glasssteppe’s stairs. Her mother Eun and sibling Min remain in the highlands. Today she wants a familiar supper and an ordinary conversation; being new does not make every evening an interview.',
        choiceTitle: 'Read an introduction with permission', choice: 'Yuna offers her own draft introduction for a reading, with no recording. You flag a hurried phrase. “How would you like me to say it?” She stops, realizes this wording is hers to choose, and tries a shorter opening with a pause for the next voice.',
        listenCallback: 'Yuna remembers a conversation that did not need a microphone. She can begin with an ordinary detail instead of introducing herself all over again.', choiceCallback: 'Yuna remembers leaving a pause in the introduction you read. The contribution still requires its owner’s permission before any broadcast.' },
    { id: 'ravi_desai', venue: 'COMMUNITY', period: 2, offset: 1,
        intro: 'Ravi has a freight notebook beside a small astronomy chart. “I was about to say I had the whole evening. Let me check what I have actually promised.”',
        listenTitle: 'Ask about watching the sky', listen: 'Ravi describes enjoying a cloudy evening even when there are no meteors to offer. “No grand event to sell. We can still sit.” He wants family time with Mara, his biological child Nila and stepchild Lin to have dependable hours, not a better-sounding estimate.',
        choiceTitle: 'Help separate a hope from a commitment', choice: 'You read one draft time estimate. Ravi replaces “early” with the commitments already in his notebook, and leaves the unconfirmed time open. He puts the notebook away to talk the plan through with Mara himself.',
        listenCallback: 'Ravi remembers allowing a quiet sky to stay quiet. He does not need to invent a better event before offering company.', choiceCallback: 'Ravi remembers the unconfirmed line you left open. He checks the notebook before offering a time, rather than improving his estimate by sounding hopeful.' },
    { id: 'esperanza_vega', venue: 'CORNER CAFÉ', period: 2, offset: 1,
        intro: 'Esperanza has parked the grocery van for a break. A receipt sticks out of her pocket. “The van has heard enough yeses today. I am trying to catch up with it.”',
        listenTitle: 'Ask about an evening of her own', listen: 'Esperanza wants conversation that is not another buying trip. She mentions her mother Inez and teenage child Luz without offering them as extra hands. “If the joke only works because Luz cannot get away from the audience, it can stay untold.”',
        choiceTitle: 'Check a realistic final stop', choice: 'You help Esperanza distinguish an essential supply stop already agreed from an optional extra. She keeps the essential delivery on the plan and drafts a later time for the extra. She puts the optional stop on a separate note to agree after checking the next route.',
        listenCallback: 'Esperanza remembers that an evening can belong to her without becoming a supply run. She leaves a family anecdote unshared rather than deciding Luz would not mind.', choiceCallback: 'Esperanza remembers keeping the necessary stop and leaving the optional one for a real later agreement. Her receipt still needs filing; one useful choice did not make every habit perfect.' },
    { id: 'asha', venue: 'COMMUNITY', period: 2, offset: 1, guardian: 'eli',
        intro: 'Asha has brought a sketchbook to a family visit with Eli nearby. The fifteen-year-old shows one imaginary garden, keeping the other pages closed.',
        listenTitle: 'Ask about the page they chose to show', listen: 'Asha points to a path that turns into a leaf shape. You ask before looking closer and leave the closed pages alone. Eli listens while Asha explains the path; the other notebook pages stay closed.',
        choiceTitle: 'Ask whether they want a question or quiet', choice: 'Asha chooses one question about the winding path, then keeps their original drawing. Eli stays nearby. Asha tucks the notebook away when they have said what they wanted to say.',
        listenCallback: 'You remember only the page Asha chose to show. Today’s closed pages remain private.', choiceCallback: 'You previously asked what sort of response Asha wanted. You ask again; yesterday’s welcome is not standing permission to open a notebook.' },
    { id: 'nico', venue: 'CORNER CAFÉ', period: 2, offset: 0, guardian: 'alder_tess',
        intro: 'Nico sits at a family table with Tess nearby, arranging a few fallen leaves collected with appropriate company. At nine, comparing shapes can be the whole point.',
        listenTitle: 'Let Nico show a leaf shape', listen: 'Nico points out the edge that made this leaf worth keeping. You follow their description instead of correcting the collection into a lesson. Tess stays beside the family table while Nico looks for another interesting edge.',
        choiceTitle: 'Ask before moving a leaf', choice: 'You ask which leaf, if any, Nico would like you to turn. They choose one and keep the rest arranged their way. Nico gathers the leaves when their attention moves on, and you let the little comparison end.',
        listenCallback: 'You recognize the kind of edge Nico showed before, without claiming their collection must still have the same order.', choiceCallback: 'You remember asking before touching the leaves and leave the choice with Nico again.' },
    { id: 'jian_wu', venue: 'COMMUNITY', period: 2, offset: 0,
        intro: 'Jian is looking at two covers for a four-page zine at a public community drawing table. The seventeen-year-old has left room for a title and one more drawing.',
        listenTitle: 'Ask which cover he prefers', listen: '“I see why the other one reads faster. I still like this one,” Jian says. He tries a larger title while keeping his preferred cover. His cousin Ren’s work does not make the booklet a transport responsibility.',
        choiceTitle: 'Let him define a small finish', choice: 'Jian chooses four readable pages before another redraw. You ask before viewing a page and keep your suggestion to the question he offered. The zine stays his, with time for school, friends and something unrelated afterward.',
        listenCallback: 'Jian remembers discussing the cover without having the decision taken away. The next page can have a different answer.', choiceCallback: 'Jian remembers choosing a small finish. You do not claim he completed or published pages you have not seen.' },
    { id: 'lin', venue: 'COMMUNITY', period: 2, offset: 1, guardian: 'pelagia_mara',
        intro: 'Lin is at a dry community-room play table with Mara beside them, well away from machinery and working water. Their seven-year-old paper town has acquired another street.',
        listenTitle: 'Ask the street’s name', listen: '“Cloud Street. Yesterday it was Spoon Street,” Lin says. Mara follows the story without straightening the crooked road. You leave the model where Lin put it.',
        choiceTitle: 'Offer help with one fold', choice: 'A paper roof falls. You ask whether Lin wants help and wait. They point to one corner to hold, keeping the other houses their own. Mara stays beside them while Lin gives the crooked house a new name.',
        listenCallback: 'Cloud Street was its name when Lin told you. You ask today instead of insisting a made-up town must keep yesterday’s map.', choiceCallback: 'You helped only with the fold Lin chose. Another fallen roof can be frustrating without making the whole afternoon a failure.' },
    { id: 'bea', venue: 'COMMUNITY', period: 1, offset: 0, guardian: 'kit',
        intro: 'Bea is beside Kit in a safe, shaded family corner with chunky wooden cups. Their two-year-old attention moves from a cup to Kit’s face and back again.',
        listenTitle: 'Share a brief cup-stacking moment with Kit', listen: 'Two cups balance. “Cup!” Bea says, looking toward Kit. Kit responds to the little discovery. You stay beside the parent and let the moment end without asking for a performance.',
        choiceTitle: 'Give the family a quiet pause', choice: 'Bea reaches toward Kit. “Up.” Kit puts the drawing away and offers comfort. You give them space and leave the cups where Bea put them. Kit takes the quiet pause with their child.',
        listenCallback: 'The cup game was welcome for a moment before. Today Bea can want something else; Kit reads the immediate care needs.', choiceCallback: 'You gave Kit and Bea a quiet pause. It creates no claim on Bea’s attention at the next visit.' },
];
const cameoGoals: Record<string, string> = {
    celia_baptiste: 'Keep a corner for her own painting and make room for a serious domino game.',
    farah_hussain: 'Choose shop hours that leave a real evening for radio drama and company.',
    liang_chen: 'Take part in the drawing session without directing the whole room.',
    mei_chen: 'Make a lively choir gathering that starts and finishes when it says it will.',
    hana_mori: 'Choose a walk for pleasure, with a pace the company can actually enjoy.',
    yuna_park: 'Make room for another voice and an ordinary life away from the microphone.',
    ravi_desai: 'Turn a hopeful estimate into time he can honestly offer.',
    esperanza_vega: 'Keep essential deliveries dependable and leave a real end to the route.',
};
export function cameoAppearances(week: number): CastAppearance[] {
    return characterCameos.filter(c => week % c.period === c.offset).map(c => ({ id: c.id, region: canonicalCharacterById[c.id].region as RegionId, spot: c.venue, kind: 'local' }));
}
function spotFor(g: Game, p: Player, c: Cameo, appearance: CastAppearance): string | null {
    if (c.guardian === 'eli')
        return getStoryView(g, p).scenes.find(s => s.characters.includes('eli'))?.spot ?? null;
    if (c.guardian === 'kit')
        return g.cast?.schedule[g.round]?.find(a => a.id === 'kit' && a.region === 'embermesa' && ['COMMUNITY', 'CORNER CAFÉ'].includes(a.spot))?.spot ?? null;
    if (c.guardian)
        return canonicalFamilyVenue(g.round, c.guardian);
    return appearance.spot;
}
export function cameoPeople(g: Game, p: Player): CastPersonView[] {
    if (!g.cast || !p.cast)
        return [];
    const region = p.world?.region ?? 'alder', visible = visiblePlaces(p, g), redacted = p.castRedacted === true;
    return (g.cast.schedule[g.round] ?? []).filter(a => a.region === region).flatMap(a => {
        const c = characterCameos.find(c => c.id === a.id);
        if (!c)
            return [];
        const canon = canonicalCharacterById[c.id], spot = spotFor(g, p, c, a);
        if (!spot || !visible.includes(spot))
            return [];
        const receipts = redacted ? [] : p.cast!.receipts.filter(r => r.id.split(':')[2] === c.id), lastReceipt = receipts.at(-1), today = lastReceipt?.week === g.round;
        const previous = lastReceipt ? (lastReceipt.id.endsWith(':cameo_listen') ? c.listenCallback : c.choiceCallback) : null;
        const rows = [{ key: 'cameo_listen', title: c.listenTitle, outcome: c.listen }, { key: 'cameo_choice', title: c.choiceTitle, outcome: c.choice }];
        const choices: CastChoice[] = today || redacted ? [] : rows.map(row => {
            const time = canon.age < 18 ? 0 : 1, reason = g.status !== 'playing' ? 'This life is complete' : g.players[g.turn]?.id !== p.id ? 'It is another player’s turn' : p.place !== spot ? `Visit ${spot} first` : p.hours < time ? 'Needs one priority block' : '';
            const id = `cast:${g.round}:${c.id}:${row.key}`;
            return { id, actionId: id, key: row.key, title: row.title, body: c.intro, outcome: row.outcome, available: !reason, reason, cost: { time, cash: 0, energy: 0 }, energy: 0, joy: 0, previewText: [time ? '1 priority block · $0' : 'A brief family moment · $0 · no priority block', 'One small moment together, with no further commitment.'] };
        });
        return [{ id: c.id, name: canon.name, role: canon.role, bio: canon.intro, goal: canon.age < 18 ? (c.id === 'bea' ? 'Safe company, rest and brief play with Kit nearby.' : 'Their own interests, with privacy, safe company and room to stop.') : cameoGoals[c.id], region: canon.region as RegionId, spot, status: redacted ? 'Conversation private' : today ? 'A moment to let settle' : lastReceipt ? 'A familiar neighborhood face' : 'A local life to get to know', body: redacted ? ['This player’s conversations are private.'] : [...(previous ? [previous] : []), c.intro], invitation: null, memories: receipts.map(r => ({ week: r.week, text: r.outcome })), tie: c.guardian ? `With ${canonicalCharacterById[c.guardian].name}; the adult remains responsible for care.` : 'Their family and other responsibilities continue outside this encounter.', remote: false, interactionKind: canon.age < 18 ? 'family' as const : 'local' as const, choices, lastReceipt, ...(c.guardian ? { companionId: c.guardian } : {}) }];
    });
}
/** Called only after cast ownership/running/retry guards. Stores prose at the time
 * it happened; later canon updates never regenerate a historical conversation. */
export function resolveCameoChoice(g: Game, p: Player, id: string): boolean {
    const actorId = id.split(':')[2];
    if (!characterCameos.some(c => c.id === actorId))
        return false;
    const view = cameoPeople(g, p).find(c => c.id === actorId), choice = view?.choices.find(c => c.id === id);
    if (!choice)
        throw Error('That local moment is no longer available');
    if (!choice.available)
        throw Error(choice.reason);
    p.hours -= choice.cost.time;
    p.cast!.receipts.push({ id, week: g.round, title: `${view!.name}: ${choice.title}`, body: choice.body, outcome: choice.outcome });
    g.log.unshift(`${p.name} shared a small moment with ${view!.name}.`);
    g.log = g.log.slice(0, 32);
    return true;
}
