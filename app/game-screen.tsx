'use client';
import {useCommittedRef} from '@/lib/committed-ref';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { actionIllustration } from '@/lib/action-art';
import { actionFamiliarityKey, familiarityView } from '@/lib/action-familiarity';
import { acceptedActionIncident, actionIncidentPreview } from '@/lib/action-incidents';
import { actionReaction } from '@/lib/action-reactions';
import { careerChoices, careerCurrentRole } from '@/lib/careers';
import { castPeople } from '@/lib/character-cast';
import { activityIntent, narrativeExpectation } from '@/lib/decision-presentation';
import { economyMonthLabel, economyTimeLabel } from '@/lib/economy';
import { availableActions, GameView as Game, opportunity, Player, projectGoal, projectProgress, reason } from '@/lib/game';
import { actionPreview } from '@/lib/game-view';
import { getLifeEvent } from '@/lib/life-events';
import { locationFor, locations, marbleColors } from '@/lib/locations';
import { mapActors } from '@/lib/map-actors';
import { monthlyPriceBreakdown } from '@/lib/monthly-prices';
import { capturePersonReceipt } from '@/lib/person-response';
import { firstPlaceAction, placeStory, regionalInvitation } from '@/lib/place-invitations';
import { gardenStage, personalEffects, qualitativeStat, qualitativeText } from '@/lib/point-presentation';
import { sharedOpportunityView } from '@/lib/shared-opportunities';
import { afterVenueActivity, venueChoices, venuePeople, type VenueInvitation } from '@/lib/venue-scene';
import { getWeather } from '@/lib/weather';
import { weatherStory } from '@/lib/weather-presentation';
import { visiblePlaces, worldPlaceName, worldView } from '@/lib/world-life';
import { ArrowRight, BookOpen, Clock, Flag, Leaf, LocateFixed, MapPin, Maximize2, Menu, Minus, Newspaper, Plus } from 'lucide-react';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { CastMeetups } from './cast-story';
import CharacterPortrait from './character-portrait';
import EncounterPanel from './encounter-panel';
import { gardenPainting, locationPainting } from './game-art';
import type { TownControl } from './game-engine';
import GameGlyph from './game-glyph';
import GamePainting from './game-painting';
import GameTutorial, { useGameTutorial } from './game-tutorial';
import { LifeHeadingLabel, LifeJournal, PublicLifeSummary } from './life-story';
import { PersonResponseStage } from './person-response';
import { ChoiceBenefit, ChoiceTerms } from './place-invitations';
import { ArcSpotlight } from './story-timeline';
import TurnClock from './turn-clock';
import VenueCareerBoard from './venue-career-board';
import WeatherIcon from './weather-icon';
import WorldStory from './world-story';
import { EnsembleStories, EnsembleJournal } from './ensemble-story';
import { VenueGuide } from './venue-guide';
import { getEnsembleView } from '@/lib/ensemble-story';
const money = (n: number) => '$' + n.toLocaleString('en-US');
type EncounterTarget = {
    actorId: string;
    spot: string;
    context: string;
};
type MenuView = 'places' | 'life' | 'board' | 'work' | 'world';
type PendingVisit = {
    location: string;
    context: string;
    confirmed: boolean;
    arrived: boolean;
    reaction?: string;
    previewDismissed?: boolean;
};
const gameContext = (g: Game) => [g.code, g.players[g.turn].id, g.round, g.players[g.turn].world?.region || 'alder'].join('|');
export default function GameScreen({ g, active, busy, offline, onVisit, onAction, onEnd, onRules, onHome, onCopy, onNews, onSound, tutorialReplay, tutorialOffer, tutorialBlocked, newsOpen, billsOpen, onTutorialReplay }: {
    g: Game;
    active: boolean;
    busy: boolean;
    offline: boolean;
    onVisit: (place: string) => Promise<Game | undefined>;
    onAction: (id: string) => Promise<Game | undefined>;
    onEnd: () => void;
    onRules: () => void;
    onHome: () => void;
    onCopy: () => void;
    onNews: () => void;
    onSound: () => void;
    tutorialReplay: number;
    tutorialOffer: boolean;
    tutorialBlocked: boolean;
    newsOpen: boolean;
    billsOpen: boolean;
    onTutorialReplay: () => void;
}) {
    const p: Player = g.players[g.turn];
    const weather = getWeather(g);
    const world = worldView(p, g), visible = visiblePlaces(p, g), cast = castPeople(g, p);
    const host = useRef<HTMLDivElement>(null), engine = useRef<TownControl | null>(null), latest = useCommittedRef({ g, active, busy, offline });
    const context = gameContext(g), period = 'month';
    const [encounter, setEncounter] = useState<EncounterTarget | null>(null);
    const encounterAllowed = !!encounter && encounter.context === context && p.place === encounter.spot && visible.includes(encounter.spot);
    const focusedEncounter = encounterAllowed ? encounter : null;
    const encounterRef = useCommittedRef(focusedEncounter);
    const queuedEncounter = useRef<EncounterTarget | null>(null);
    const [cooldown, setCooldown] = useState(false);
    const [personResponse, setPersonResponse] = useState<{
        g: Game;
        p: Player;
        actorId: string;
        name: string;
        receipt: import('@/lib/person-response').ResponseReceipt;
        contextNote?: string;
    } | null>(null);
    const [actionStatus, setActionStatus] = useState<'idle' | 'pending' | 'success' | 'unconfirmed'>('idle');
    const [lowQuality, setLowQuality] = useState(() => typeof window !== 'undefined' && window.innerWidth < 700);
    const qualityRef = useCommittedRef(lowQuality);
    const [ready, setReady] = useState(false), [loadError, setLoadError] = useState(false), [moving, setMoving] = useState(false), [placeState, setPlaceState] = useState<{open: string | null; last: string | null}>({open: null, last: null}), [menuState, setMenuState] = useState<{
        open: MenuView | null;
        last: MenuView;
    }>({ open: null, last: 'life' }), [choice, setChoice] = useState(''), [feedback, setFeedback] = useState(''), [districtChoice, setDistrictChoice] = useState({place: p.place, district: locationFor(p.place).district});
    // A location change resets only presentation state during render, before it can paint.
    if (districtChoice.place !== p.place) setDistrictChoice({place: p.place, district: locationFor(p.place).district});
    const district = districtChoice.place === p.place ? districtChoice.district : locationFor(p.place).district;
    const setDistrict = (next: string) => setDistrictChoice({place: p.place, district: next});
    const place = placeState.open, visiblePlace = placeState.open ?? placeState.last;
    const setPlace = useCallback((next: string | null) => setPlaceState(state => state.open === next ? state : {open: next, last: next ?? state.last}), []);
    const menu = menuState.open, menuView = menuState.open ?? menuState.last, menuRef = useRef<MenuView | null>(null);
    const setMenu = useCallback((next: MenuView | null) => { menuRef.current = next; setMenuState(state => state.open === next ? state : { open: next, last: next ?? state.last }); }, []);
    const workSession = useRef(0), [workGeneration, setWorkGeneration] = useState(0);
    const nextWorkSession = useCallback(() => { workSession.current++; setWorkGeneration(workSession.current); }, []);
    const [careerFocus, setCareerFocus] = useState<string | undefined>(), [worldFocus, setWorldFocus] = useState<string | undefined>();
    const [ensembleFocus, setEnsembleFocus] = useState<{ context: string; place: string; storyId: string } | null>(null);
    const privateWork = !!p.castRedacted || !p.career;
    const role = privateWork ? 'Work details are private' : careerCurrentRole(p)?.title ?? 'No active main role';
    const shownLife = useRef('');
    const tutorial = useGameTutorial(g.code, tutorialReplay, tutorialOffer);
    const tutorialStep = tutorial.state?.step, sendTutorial = tutorial.send;
    const viewedNews = useRef(false), viewedBills = useRef(false);
    useEffect(() => { if (newsOpen && tutorialStep === 'weather')
        viewedNews.current = true; if (!newsOpen && viewedNews.current) {
        viewedNews.current = false;
        sendTutorial('forecast-read');
    } }, [newsOpen, tutorialStep, sendTutorial]);
    useEffect(() => { if (billsOpen && tutorialStep === 'month')
        viewedBills.current = true; if (!billsOpen && viewedBills.current) {
        viewedBills.current = false;
        sendTutorial('bills-reviewed');
    } }, [billsOpen, tutorialStep, sendTutorial]);
    const movingRef = useCommittedRef(moving);
    const alive = useRef(true);
    const pending = useRef<PendingVisit | null>(null), visitLock = useRef(false), actionLock = useRef<object | null>(null), timers = useRef<ReturnType<typeof setTimeout>[]>([]), onVisitRef = useCommittedRef(onVisit);
    const requestedAction = useRef<string | null>(null);
    const [venueInvitation, setVenueInvitation] = useState<(VenueInvitation & {
        context: string;
        session: number;
    }) | null>(null);
    const venueSession = useRef(0), openPlace = useCommittedRef(place);
    const interfaceLocked = useCommittedRef(!!(moving || place || menu || focusedEncounter || tutorialBlocked));
    function dismissPlace() { setPersonResponse(null); venueSession.current++; setVenueInvitation(null); setPlace(null); }
    const localInvitation = regionalInvitation(p, g);
    function chooseAction(id: string) { setPersonResponse(null); venueSession.current++; setVenueInvitation(null); setChoice(id); requestAnimationFrame(() => { const target = document.querySelector<HTMLElement>('.game-action-detail'); if (window.innerWidth < 761)
        target?.scrollIntoView({ block: 'start', behavior: window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' }); target?.focus({ preventScroll: true }); }); }
    function openLocation(location: string) {
        const state = latest.current, player: Player = state.g.players[state.g.turn];
        if (!visiblePlaces(player, state.g).includes(location) || player.place !== location)
            return;
        venueSession.current++;
        setVenueInvitation(null);
        const requested = requestedAction.current;
        requestedAction.current = null;
        if (requested?.startsWith('ensemble-preview:')) {
            const storyId = requested.slice('ensemble-preview:'.length);
            if (getEnsembleView(state.g, player, storyId, location).scenes.some(scene => scene.id === storyId))
                setEnsembleFocus({ context: gameContext(state.g), place: location, storyId });
        }
        if (requested?.startsWith('career:')) {
            const current = careerChoices(state.g, player).find(c => c.id === requested && c.place === location);
            queuedEncounter.current = null;
            setPlace(null);
            setEncounter(null);
            if (current) {
                nextWorkSession();
                setCareerFocus(current.id);
                setMenu('work');
                tutorial.send('arrived');
            }
            else
                setFeedback('This work option changed. Open Work & learning to review it again.');
            return;
        }
        if (requested?.startsWith('world-preview:')) {
            const id = requested.slice('world-preview:'.length), current = worldView(player, state.g)?.choices.find(c => c.id === id);
            queuedEncounter.current = null;
            setPlace(null);
            setEncounter(null);
            if (current) {
                setWorldFocus(current.id);
                setMenu('world');
            }
            else
                setFeedback('This opportunity changed. Open Work & learning to review it again.');
            return;
        }
        if (!requested?.startsWith('ensemble-preview:') && !availableActions(player, location, state.g).length && careerChoices(state.g, player).some(c => c.place === location)) {
            queuedEncounter.current = null;
            setPlace(null);
            setEncounter(null);
            nextWorkSession();
            setCareerFocus(undefined);
            setMenu('work');
            tutorial.send('arrived');
            return;
        }
        setChoice(firstPlaceAction(player, location, state.g, requested));
        setMenu(null);
        const target = queuedEncounter.current;
        queuedEncounter.current = null;
        if (target && target.context === gameContext(state.g) && target.spot === location && venuePeople(state.g, player, location).some(person => person.id === target.actorId)) {
            setPlace(null);
            setEncounter(target);
        }
        else {
            setEncounter(null);
            setPlace(location);
        }
        tutorial.send('arrived');
    }
    const openRef = useCommittedRef(openLocation);
    function finishArrival(token: PendingVisit) {
        const state = latest.current;
        if (!alive.current || pending.current !== token || token.context !== gameContext(state.g) || !token.confirmed || state.g.players[state.g.turn].place !== token.location)
            return;
        if ((requestedAction.current?.startsWith('career:') || requestedAction.current?.startsWith('world-preview:')) && (token.previewDismissed || !state.active || state.offline || state.g.players[state.g.turn].castRedacted || menuRef.current)) {
            pending.current = null;
            visitLock.current = false;
            requestedAction.current = null;
            queuedEncounter.current = null;
            setMoving(false);
            return;
        }
        pending.current = null;
        visitLock.current = false;
        setMoving(false);
        setFeedback(token.reaction || 'Arrived at ' + worldPlaceName(state.g.players[state.g.turn], token.location, state.g));
        openRef.current(token.location);
    }
    const arrivalRef = useCommittedRef(finishArrival);
    async function visit(location: string, actionId?: string, target?: EncounterTarget) {
        const state = latest.current, player: Player = state.g.players[state.g.turn];
        if (!state.active || state.busy || state.offline || movingRef.current || visitLock.current || !visiblePlaces(player, state.g).includes(location))
            return;
        requestedAction.current = actionId || null;
        queuedEncounter.current = target || null;
        setVenueInvitation(null);
        setMenu(null);
        if (player.place === location) {
            openRef.current(location);
            return;
        }
        const familiarityKey = actionFamiliarityKey('visit', player, state.g, location), priorCount = familiarityView(player, { actionKey: familiarityKey }).count;
        const token: PendingVisit = { location, context: gameContext(state.g), confirmed: false, arrived: false };
        visitLock.current = true;
        pending.current = token;
        setPlace(null);
        setEncounter(null);
        setFeedback('Walking to ' + worldPlaceName(player, location, state.g) + '…');
        const unconfirmed = () => { pending.current = null; visitLock.current = false; queuedEncounter.current = null; requestedAction.current = null; setMoving(false); setFeedback('Move wasn’t confirmed. Check your connection.'); };
        try {
            const result = await onVisitRef.current(location);
            if (!alive.current || pending.current !== token || gameContext(latest.current.g) !== token.context)
                return;
            const arrived: Player | undefined = result?.code === state.g.code && result.round === state.g.round ? result.players?.find((q: Player) => q.id === player.id) : undefined;
            if (!arrived || arrived.place !== location || (arrived.world?.region || 'alder') !== (player.world?.region || 'alder')) {
                unconfirmed();
                return;
            }
            const familiar = familiarityView(arrived, { actionKey: familiarityKey }), count = familiar.count;
            if (count !== priorCount + 1) {
                unconfirmed();
                return;
            }
            if (!target)
                token.reaction = worldPlaceName(arrived, location, result) + '. ' + (actionReaction({ actionId: 'visit', count, lastVariant: familiar.lastVariant }) || '');
            token.confirmed = true;
            if (token.arrived)
                arrivalRef.current(token);
            timers.current.push(setTimeout(() => arrivalRef.current(token), 1400));
        }
        catch {
            if (alive.current && pending.current === token && gameContext(latest.current.g) === token.context)
                unconfirmed();
        }
    }
    function openEncounter(actorId: string, spot: string) {
        const state = latest.current, player: Player = state.g.players[state.g.turn];
        if (!venuePeople(state.g, player, spot).some(person => person.id === actorId))
            return;
        void visit(spot, undefined, { actorId, spot, context: gameContext(state.g) });
    }
    function closeEncounter() {
        const target = focusedEncounter;
        if (!target || encounterRef.current !== target)
            return;
        setEncounter(null);
        queuedEncounter.current = null;
        const state = latest.current, player: Player = state.g.players[state.g.turn];
        if (target && target.context === gameContext(state.g) && player.place === target.spot && visiblePlaces(player, state.g).includes(target.spot))
            openRef.current(target.spot);
    }
    const visitRef = useCommittedRef(visit);
    useEffect(() => { const lifecycleTimers = timers.current; alive.current = true; const initialQuiet = qualityRef.current; let disposed = false; import('./game-engine').then(({ createTown }) => { if (disposed || !host.current)
        return; engine.current = createTown(host.current, (spot, actorId) => { const state = latest.current, player: Player = state.g.players[state.g.turn]; if (actorId) {
        if (venuePeople(state.g, player, spot).some(person => person.id === actorId && !person.remote))
            void visitRef.current(spot, undefined, { actorId, spot, context: gameContext(state.g) });
    }
    else
        void visitRef.current(spot); }, () => { if (!disposed) {
        setLoadError(false);
        setReady(true);
    } }, isMoving => { if (disposed)
        return; setMoving(isMoving); if (!isMoving && pending.current) {
        pending.current.arrived = true;
        arrivalRef.current(pending.current);
    } }, () => { setLoadError(true); setReady(false); }); engine.current.quality(initialQuiet); const s = latest.current; engine.current.sync(s.g.players, s.g.turn, s.active && !s.busy && !s.offline && !interfaceLocked.current, s.g.project, s.g, mapActors(s.g, s.g.players[s.g.turn])); engine.current.weather(getWeather(s.g)); }).catch(() => { if (!disposed)
        setLoadError(true); }); return () => { disposed = true; alive.current = false; engine.current?.destroy(); engine.current = null; lifecycleTimers.forEach(clearTimeout); }; }, [arrivalRef, interfaceLocked, latest, qualityRef, visitRef]);
    useEffect(() => { engine.current?.sync(g.players, g.turn, active && !busy && !offline && !moving && !place && !menu && !focusedEncounter && !tutorialBlocked, g.project, g, mapActors(g, g.players[g.turn])); engine.current?.weather(getWeather(g)); }, [g, active, busy, offline, moving, place, menu, focusedEncounter, tutorialBlocked]);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Invalidate old turn/venue sessions and clear private transient UI before paint; context and delayed-response regressions cover this boundary.
    useLayoutEffect(() => { setPersonResponse(null); venueSession.current++; setVenueInvitation(null); actionLock.current = null; setCooldown(false); setActionStatus('idle'); setPlace(null); setMenu(null); setEncounter(null); queuedEncounter.current = null; pending.current = null; requestedAction.current = null; visitLock.current = false; nextWorkSession(); setCareerFocus(undefined); setWorldFocus(undefined); setMoving(false); setFeedback(''); }, [context, nextWorkSession, setMenu, setPlace]);
    const lifePending = !!getLifeEvent(p, g)?.pending;
    useEffect(() => { const key = context; if (active && !newsOpen && !tutorialBlocked && !focusedEncounter && !pending.current && lifePending && shownLife.current !== key) {
        shownLife.current = key;
        setPlace(null);
        setMenu('life');
    } }, [context, active, newsOpen, tutorialBlocked, focusedEncounter, lifePending, setMenu, setPlace]);
    // Discard invalid selection as render-owned state; a discarded render cannot publish it.
    if (encounter && !encounterAllowed) setEncounter(null);
    const hosts = visiblePlace ? venuePeople(g, p, visiblePlace) : [];
    const coffeeInvitation = venueInvitation?.context === context && venueInvitation.spot === place && hosts.some(person => person.id === venueInvitation.actorId && !person.remote && person.canTalk) ? venueInvitation : null;
    const selected = visiblePlace ? locationFor(visiblePlace) : null, options = availableActions(p, visiblePlace || '', g), a = options.find(a => a.id === choice) || options.find(a => a.id === firstPlaceAction(p, visiblePlace || '', g)) || options[0], preview = a ? actionPreview(p, a.id, g) : null, why = a ? reason(p, a.id, g) : '', selectedArt = a ? actionIllustration(a, g) : null;
    async function act() {
        const state = latest.current, player: Player = state.g.players[state.g.turn];
        if (!a || actionLock.current || !state.active || state.busy || state.offline || movingRef.current || encounterRef.current || !openPlace.current || player.place !== a.place || gameContext(state.g) !== context || reason(player, a.id, state.g))
            return;
        const token = {}, session = venueSession.current, actionContext = gameContext(state.g), spot = player.place;
        actionLock.current = token;
        setCooldown(true);
        setActionStatus('pending');
        setFeedback('');
        setPersonResponse(null);
        setVenueInvitation(null);
        const before = structuredClone(player), familiarityKey = actionFamiliarityKey(a.id, player, state.g), priorCount = familiarityView(player, { actionKey: familiarityKey }).count;
        const current = () => alive.current && actionLock.current === token && actionContext === gameContext(latest.current.g);
        const visibleResult = () => current() && venueSession.current === session && openPlace.current === spot;
        const unconfirmed = () => { if (visibleResult()) {
            setActionStatus('unconfirmed');
            setFeedback('Activity wasn’t confirmed. Check the notice above or your connection before trying again.');
        } };
        try {
            const result = await onAction(a.id);
            if (!current())
                return;
            const now: Player | undefined = result?.code === state.g.code && result.round === state.g.round ? result.players?.find((v: Player) => v.id === before.id) : undefined;
            if (!result || !now || now.place !== spot || (now.world?.region || 'alder') !== (before.world?.region || 'alder') || now.hours !== before.hours - a.time) {
                unconfirmed();
                return;
            }
            if (!visibleResult())
                return;
            const rewards = [now.cash !== before.cash ? `${now.cash > before.cash ? '+' : '−'}${money(Math.abs(now.cash - before.cash))}` : ''].filter(Boolean);
            const familiar = familiarityView(now, { actionKey: familiarityKey }), count = familiar.count;
            if (count !== priorCount + 1) {
                unconfirmed();
                return;
            }
            const response = actionReaction({ actionId: a.id, count, lastVariant: familiar.lastVariant }), incident = acceptedActionIncident(before, now, a.id);
            if (incident?.person) {
                const person = incident.person;
                setPersonResponse({ g: result, p: now, actorId: person.actorId, name: person.name, contextNote: incident.body, receipt: capturePersonReceipt({ id: incident.id, actionId: a.id, title: incident.title, body: incident.body, week: incident.round, response: { speakerId: person.actorId, speech: person.speech, activity: person.activity, emotion: person.emotion, gesture: person.gesture } }, now, person.actorId) });
            }
            setActionStatus('success');
            setFeedback(`${incident?.person ? '' : incident ? `${response || ''} ${incident.body}` : response || (a.title + '.')}${rewards.length ? ' ' + rewards.join(' · ') : ''}`.trim());
            const invitation = afterVenueActivity(result, now, a.id, spot);
            setVenueInvitation(invitation ? { ...invitation, context: actionContext, session } : null);
            engine.current?.celebrate();
            tutorial.send('acted');
        }
        catch {
            unconfirmed();
        }
        finally {
            if (current())
                timers.current.push(setTimeout(() => { if (actionLock.current !== token)
                    return; actionLock.current = null; if (alive.current) {
                    setCooldown(false);
                    setActionStatus('idle');
                } }, 650));
        }
    }
    // Work links are previews. Only the board's explicit decision button submits an action.
    function showMenu(next: MenuView) { if (pending.current && (requestedAction.current?.startsWith('career:') || requestedAction.current?.startsWith('world-preview:')))
        pending.current.previewDismissed = true; setWorldFocus(undefined); setMenu(next); }
    function navigationAllowed() { const state = latest.current, player: Player = state.g.players[state.g.turn]; return alive.current && context === gameContext(state.g) && state.g.status === 'playing' && state.active && !state.busy && !state.offline && !movingRef.current && !visitLock.current && !actionLock.current && !player.castRedacted && !!player.career; }
    function workNavigationAllowed() { return navigationAllowed() && menuRef.current === 'work' && workGeneration === workSession.current; }
    function openWork() { if (!navigationAllowed())
        return; nextWorkSession(); setCareerFocus(undefined); setWorldFocus(undefined); dismissPlace(); setEncounter(null); setMenu('work'); }
    function visitWork(location: string, actionId?: string) {
        if (!workNavigationAllowed())
            return;
        const state = latest.current, player: Player = state.g.players[state.g.turn];
        if (!careerChoices(state.g, player).some(c => c.id === actionId && c.place === location && c.region === (player.world?.region || 'alder')))
            return;
        void visit(location, actionId);
    }
    function openWorldChoice(choiceId: string) {
        if (!workNavigationAllowed())
            return;
        const state = latest.current, player: Player = state.g.players[state.g.turn], current = worldView(player, state.g)?.choices.find(c => c.id === choiceId);
        if (!current)
            return;
        if (current.spot && (current.actorId || current.id.startsWith('shared:'))) {
            void visit(current.spot, 'world-preview:' + current.id);
            return;
        }
        setWorldFocus(current.id);
        setPlace(null);
        setMenu('world');
    }
    function openSharedOpportunity(actionId: string) {
        if (!workNavigationAllowed())
            return;
        const state = latest.current, player: Player = state.g.players[state.g.turn], current = sharedOpportunityView(state.g, player)?.choices.find(c => c.actionId === actionId);
        if (current)
            openWorldChoice(current.id);
    }
    async function commitWork(actionId: string) {
        if (!workNavigationAllowed())
            return;
        const state = latest.current, player: Player = state.g.players[state.g.turn];
        if (!careerChoices(state.g, player).some(c => c.id === actionId && c.available))
            return;
        const token = {};
        actionLock.current = token;
        try {
            const result = await onAction(actionId), updated: Player | undefined = result?.code === state.g.code && result.round === state.g.round ? result.players?.find((q: Player) => q.id === player.id) : undefined;
            if (updated?.career?.receipts.some(r => r.id === actionId) && alive.current && context === gameContext(latest.current.g))
                tutorial.send('acted');
            return result;
        }
        finally {
            if (actionLock.current === token)
                actionLock.current = null;
        }
    }
    async function commitWorld(actionId: string) {
        if (!navigationAllowed() || menuRef.current !== 'world' || workGeneration !== workSession.current || worldFocus !== actionId.slice(6))
            return;
        const state = latest.current, player: Player = state.g.players[state.g.turn];
        if (!worldView(player, state.g)?.choices.some(c => 'world:' + c.id === actionId && c.available))
            return;
        const token = {};
        actionLock.current = token;
        try {
            return await onAction(actionId);
        }
        finally {
            if (actionLock.current === token)
                actionLock.current = null;
        }
    }
    function visitEnsemble(location: string, storyId?: string) {
        if (!navigationAllowed() || !storyId) return;
        const state = latest.current, player = state.g.players[state.g.turn];
        if (!getEnsembleView(state.g, player, storyId, location).scenes.some(scene => scene.id === storyId)) return;
        void visit(location, 'ensemble-preview:' + storyId);
    }
    async function commitEnsemble(actionId: string) {
        if (!navigationAllowed() || (menuRef.current !== 'places' && openPlace.current !== latest.current.g.players[latest.current.g.turn].place)) return;
        const state = latest.current, player = state.g.players[state.g.turn];
        const storyId = actionId.split(':')[1];
        if (!getEnsembleView(state.g, player, storyId, player.place).scenes.some(scene => scene.choices.some(choice => choice.actionId === actionId && choice.available))) return;
        const token = {};
        actionLock.current = token;
        try {
            const result = await onAction(actionId);
            if (result?.players.find(player => player.id === p.id)?.ensemble?.receipts.some(receipt => receipt.actionId === actionId) && alive.current && context === gameContext(latest.current.g)) tutorial.send('acted');
            return result;
        } finally {
            if (actionLock.current === token) actionLock.current = null;
        }
    }
    const boardOpportunity = actionPreview(p, 'weekly_opportunity', g);
    const workEntry = <button
        type="button"
        className="career-menu-entry"
        style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: '18px 20px', margin: '8px 0 20px', textAlign: 'left', border: '1px solid currentColor', borderRadius: 12 }}
        disabled={!active || busy || moving || offline || privateWork}
        onClick={openWork}>
      <BookOpen size={20}/>
      <span>
        <strong style={{ display: 'block', fontSize: '1.1rem' }}>Work & learning</strong>
        <small style={{ display: 'block' }}>{'Jobs, workplaces, courses & people who can help'} · review without spending time</small>
      </span>
      <ArrowRight size={18}/>
    </button>;
    function returnToGame(event: Event) { event.preventDefault(); requestAnimationFrame(() => { if (document.querySelector('[data-state="open"][data-slot="dialog-content"], [data-state="open"][data-slot="alert-dialog-content"]'))
        return; document.querySelector<HTMLElement>('.game-screen > .game-tutorial h2, .game-tools-button')?.focus({ preventScroll: true }); }); }
    function tutorialEvent(event: Parameters<typeof tutorial.send>[0]) { tutorial.send(event); if (event === 'skip' || (event === 'next' && tutorial.state?.step === 'finish'))
        requestAnimationFrame(() => { const target = document.querySelector<HTMLElement>(place ? '.game-action-detail' : menu ? '.game-menu-dialog [data-slot="dialog-title"]' : '.game-tools-button'); target?.focus({ preventScroll: true }); }); }
    const tutorialPanel = (inline = false) => tutorial.visible && tutorial.state && !tutorialBlocked && !focusedEncounter ? <GameTutorial
      state={tutorial.state}
      g={g}
      p={p}
      active={active}
      busy={busy || moving}
      inline={inline}
      place={place}
      menu={menu}
      send={tutorialEvent}
      onPlaces={() => { setPlace(null); showMenu('places'); }}
      onWork={() => openWork()}
      onLife={() => { setPlace(null); showMenu('life'); }}
      onBoard={() => { setPlace(null); showMenu('board'); }}
      onNews={() => { setPlace(null); setMenu(null); onNews(); }}
      onBills={() => { setPlace(null); setMenu(null); onEnd(); }}
      onFocusAction={() => { const target = document.querySelector<HTMLElement>('.game-action-detail'); target?.scrollIntoView({ block: 'nearest', behavior: window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' }); const button = document.querySelector<HTMLButtonElement>('.game-do-action'); if (button && !button.disabled)
        button.focus({ preventScroll: true });
    else
        target?.focus({ preventScroll: true }); }}/> : null;
    return <section
        className="game-screen"
        data-tutorial={tutorial.visible && !tutorialBlocked && !focusedEncounter ? tutorial.state?.step : undefined}
        data-season={weather?.season}
        data-weather={weather?.type || 'none'}
        aria-label="Crosswalk game">
      {!place && !menu && !focusedEncounter && tutorialPanel()}

      {!ready && <div className="game-loading">
        <strong>
          {loadError ? 'The illustrated map could not load' : 'Opening the neighborhood…'}
        </strong>
        <span>
          {loadError ? 'You can still play every activity through Places below.' : 'Unfolding a painted place.'}
        </span>
      </div>}

      <div className="game-header">
      <div className="game-top-hud">
        <button
            className="game-player-badge"
            onClick={() => showMenu('life')}
            aria-label="Open your life, relationships and legacy">
          <i style={{ background: marbleColors[g.turn] }}>
            {g.turn + 1}
          </i>
          <span>
            <strong>
              {p.name}
            </strong>
            {world && <small>
              {world.region.name}
            </small>}
            <small>{economyMonthLabel(g).toUpperCase()}/{g.maxRounds} · {active ? 'YOUR TURN' : 'WATCHING'}</small>
            <small className="life-heading-chip">
              <LifeHeadingLabel g={g} p={p}/>
            </small>
          </span>
        </button>
        <div className="game-clock-hud">
          <TurnClock
            period={period}
            announce={!place && !menu && !focusedEncounter && !tutorialBlocked}
            hours={p.hours}
            turnKey={g.code + ':' + g.round + ':' + p.id}/>
        </div>
        <div className="game-resource-row">
          <span>
            <GameGlyph kind="cash"/>
            <b>
              {money(p.cash)}
            </b>
            <small>cash</small>
          </span>
          <span>
            <GameGlyph kind="energy"/>
            <b>
              {qualitativeStat('energy', p.energy)}
            </b>
            <small>energy</small>
          </span>
          <span>
            <GameGlyph kind="joy"/>
            <b>
              {qualitativeStat('joy', p.joy)}
            </b>
            <small>joy</small>
          </span>
        </div>
        <button className="game-round-button" aria-label="Game menu" onClick={() => showMenu('life')}>
          <Menu />
        </button>
      </div>

      <div className="game-town-wordmark" aria-hidden="true">Crosswalk<span>A LITTLE LIFE, TOGETHER</span></div>
      <div className="game-map-toolbar">
      <div className="game-district-tabs" role="group" aria-label="Explore a district">
        <button onClick={() => { setDistrict('main'); engine.current?.district('main'); }} aria-pressed={district === 'main'}><span>01</span> Main Street</button>
        <button onClick={() => { setDistrict('west'); engine.current?.district('west'); }} aria-pressed={district === 'west'}><span>02</span> Westside</button>
      </div>

      <button className="game-board-button" onClick={() => showMenu('board')}>
        <Leaf size={18}/>
        <span>Neighborhood board <small>{g.opportunityClaim?.round === g.round ? 'Opportunity claimed' : '1 opportunity open'} · Garden: {gardenStage(projectProgress(g), projectGoal(g), !!g.project?.completed)}</small></span>
      </button>
      <button className="game-news-button" aria-label="The Chronicle" onClick={onNews}>
        <Newspaper size={18}/>
        <span>The Chronicle<small>
            {getLifeEvent(p, g)?.pending ? 'A decision awaits' : 'News & forecast'}
          </small></span>
      </button>
      {weather && <button className="game-weather-plaque" onClick={onNews} aria-label={weather.label + '. Open the forecast'}>
        <WeatherIcon type={weather.type}/>
        <span>
          <b>
            {weather.label}
          </b>
          <small>{weather.season} · {economyMonthLabel(g)} of {g.maxRounds} · forecast →</small>
        </span>
      </button>}

      </div>
      </div>

      <div className="game-map-viewport">
      <div
        ref={host}
        className="engine-host"
        tabIndex={0}
        role="application"
        aria-label="Illustrated isometric town. Tap a building or person to walk there. Drag to pan, pinch to zoom. Arrow keys pan. Plus and minus zoom. Press L for accessible Places."
        onKeyDown={e => { if (interfaceLocked.current)
        return; const moves: Record<string, number[]> = { ArrowLeft: [-75, 0], ArrowRight: [75, 0], ArrowUp: [0, -75], ArrowDown: [0, 75] }; if (moves[e.key]) {
        e.preventDefault();
        engine.current?.pan(...moves[e.key] as [
            number,
            number
        ]);
    } if (e.key === '+' || e.key === '=')
        engine.current?.zoom(1.15); if (e.key === '-')
        engine.current?.zoom(.87); if (e.key.toLowerCase() === 'l')
        showMenu('places'); }}/>
      <details className="game-camera-controls">
        <summary aria-label="Map view controls">
          <LocateFixed />
          <span>View</span>
        </summary>
        <div>
          <button aria-label="Zoom in" onClick={() => engine.current?.zoom(1.2)}>
            <Plus />
          </button>
          <button aria-label="Zoom out" onClick={() => engine.current?.zoom(.83)}>
            <Minus />
          </button>
          <button aria-label="Find my character" onClick={() => engine.current?.focus()}>
            <LocateFixed />
          </button>
          <button aria-label="Entire map" onClick={() => engine.current?.overview()}>
            <Maximize2 />
          </button>
        </div>
      </details>
      </div>

      {!place && !menu && !focusedEncounter && !tutorial.visible && !tutorialBlocked && active && (<div className="map-invitations game-arc-invitation">
        <ArcSpotlight g={g} p={p} disabled={busy || moving || offline} onOpen={openEncounter}/>
      </div>)}

      <div className="game-status" role="status">
        {offline ? 'Connection lost. Reconnect above.' : busy ? 'Saving your move…' : moving ? 'Walking through town…' : feedback || (!active ? `${p.name} is taking their turn` : 'Drag to explore · tap a building or person')}
      </div>

      <div className="game-bottom-hud">
        <button className="game-tools-button" onClick={() => showMenu('places')}>
          <MapPin />
          <span>Places<small>{visible.length} on your map</small></span>
        </button>
        <button
            className="game-current-place"
            disabled={!active || busy || moving || offline || !!focusedEncounter}
            onClick={() => openLocation(p.place)}>
          <span title={worldPlaceName(p, p.place, g)}>
            {worldPlaceName(p, p.place, g)}
          </span>
          <small>{moving ? 'On the way' : `Explore ${availableActions(p, p.place, g).length} activities`} <ArrowRight size={13}/></small>
        </button>
        <button
            className="game-end-button"
            disabled={!active || busy || moving || offline || !!focusedEncounter}
            onClick={onEnd}>
          <Flag />
          <span>End {period}<small>{economyTimeLabel(g, p.hours)} left</small></span>
        </button>
      </div>

      <Dialog open={!!place && !focusedEncounter} onOpenChange={v => { if (!v)
        dismissPlace(); }}>
        <DialogContent
            className="game-location-dialog"
            data-material={selected ? placeStory(selected.place).material : undefined}
            onCloseAutoFocus={returnToGame}>
          {selected && <>
            <div className="game-scene-banner">
              <GamePainting key={a?.id ?? selected.place} src={selectedArt?.src ?? locationPainting(selected.art)} alt={selectedArt?.alt ?? worldPlaceName(p, selected.place, g)} priority/>
              <div>
                <small>
                  {placeStory(selected.place).motif}
                </small>
                <DialogTitle>
                  {worldPlaceName(p, selected.place, g)}
                </DialogTitle>
                <DialogDescription>
                  {placeStory(selected.place).promise}
                </DialogDescription>
              </div>
            </div>
            <div className="game-location-body">
              {tutorialPanel(true)}
              <VenueGuide regionId={p.world?.region ?? 'alder'} placeId={selected.place}/>
              {!p.castRedacted && <EnsembleStories g={g} p={p} disabled={!active || busy || moving || offline}
                selectedVenue={selected.place}
                storyId={ensembleFocus?.context === context && ensembleFocus.place === selected.place ? ensembleFocus.storyId : undefined}
                onAction={commitEnsemble} onVisit={visitEnsemble}/>}
              <div className="interaction-heading">
                <span>What would you like to do?</span>
                <span>{options.length} activities{hosts.some(person => !person.remote) ? ` · ${hosts.filter(person => !person.remote).length} people here` : ''}</span>
              </div>
              {feedback && <p className="game-action-result" role="status">
                {feedback}
              </p>}
              {personResponse && <div className="encounter-panel">
                {personResponse.contextNote && <p className="encounter-player-reaction">
                  {personResponse.contextNote}
                </p>}
                <PersonResponseStage {...personResponse} spot={personResponse.p.place} known/>
              </div>}
              <div className="game-interaction-columns">
                <div
                    className="game-activity-grid"
                    role="group"
                    aria-label={worldPlaceName(p, selected.place, g) + ' activities and conversations'}>
                  {venueChoices(options, hosts).map(item => { if (item.kind === 'person') {
        const person = item.person;
        return <button
                      type="button"
                      key={'person-' + person.id}
                      className="venue-person-choice"
                      data-actor={person.id}
                      disabled={!active || busy || moving || offline || cooldown}
                      onClick={() => openEncounter(person.id, selected.place)}>
                    <CharacterPortrait id={person.id} name={person.name} className="venue-person-portrait"/>
                    <span className="activity-copy">
                      <span className="activity-selection">Conversation</span>
                      <strong>Talk with {person.name}</strong>
                      <span className="activity-benefit">
                        {person.role}
                      </span>
                      <small>
                        {person.canTalk ? 'Here now' : 'Here, with plans of their own'}
                      </small>
                      <small>Preview first · no time spent</small>
                    </span>
                  </button>;
    } const option = item.activity; const view = actionPreview(p, option.id, g), lock = reason(p, option.id, g), art = actionIllustration(option, g), unitPrice = monthlyPriceBreakdown(p, option, g); return <button
                      key={option.id}
                      className={lock ? 'activity-locked' : ''}
                      aria-pressed={a?.id === option.id}
                      aria-describedby={lock ? 'action-lock-' + option.id : undefined}
                      onClick={() => chooseAction(option.id)}>
                    <GamePainting className="activity-thumbnail" src={art.thumb} alt=""/>
                    <span className="activity-copy">
                      <span className="activity-selection">
                        {a?.id === option.id ? 'Selected' : 'View activity'}
                      </span>
                      <strong>
                        {option.title}
                      </strong>
                      <span className="activity-benefit">
                        {activityIntent(option)}
                      </span>
                      <small>{economyTimeLabel(g, option.time)} · {option.cost ? `${money(option.cost)} upfront${view.cash > 0 ? ` · +${money(view.cash)} net` : ''}` : view.cash > 0 ? `+${money(view.cash)}` : '$0'}</small>
                      {unitPrice && <small>
                        {unitPrice}
                      </small>}
                      {lock && <em id={'action-lock-' + option.id}>
                        <span aria-hidden="true">⌑ </span>
                        {qualitativeText(lock)}
                      </em>}
                    </span>
                  </button>; })}
                </div>
                {a && preview && <div className="game-action-detail" tabIndex={-1}>
                  <div className="game-action-preview">
                    <div className="action-clock-preview">
                      <TurnClock period={period} hours={p.hours} turnKey={g.code + ':' + g.round + ':' + p.id} previewCost={a.time}/>
                      <span>
                        {preview.missingHours ? `Needs ${preview.missingHours} more priority block${preview.missingHours === 1 ? '' : 's'}.` : `This uses ${a.time} of your remaining ${economyTimeLabel(g, p.hours)}.`}
                      </span>
                    </div>
                    <small className="outcome-label">YOUR NEXT CHOICE</small>
                    <h3 className="selected-activity-title">
                      {a.title}
                    </h3>
                    <ChoiceBenefit p={p} a={a} g={g}/>
                    <p>
                      {a.special === 'opportunity' ? opportunity(g).title + ': ' + opportunity(g).text : narrativeExpectation(a.desc)}
                    </p>
                    <ChoiceTerms p={p} a={a} g={g}/>
                    {actionIncidentPreview(g, p, a.id) && <p className="choice-incidental-note">
                      {actionIncidentPreview(g, p, a.id)!.notice}
                    </p>}
                    {preview.participation?.applies && <p className="regional-participation-note">
                      {preview.participation.storySummary}
                    </p>}
                    <details className="choice-effect-details" key={a.id}>
                      <summary>How this may feel</summary>
                      <div className="choice-effect-values">
                        {personalEffects(preview).map(text => <span key={text}>
                          {text}
                        </span>)}
                        <span>
                          <Clock size={13}/>
                          {preview.missingHours ? `Needs ${preview.missingHours} more priority block${preview.missingHours === 1 ? '' : 's'}` : `${economyTimeLabel(g, preview.afterHours)} left`}
                        </span>
                      </div>
                    </details>
                  </div>
                  {coffeeInvitation && <aside className="venue-coffee-invitation" aria-label="An optional conversation">
                    <CharacterPortrait id={coffeeInvitation.actorId} name={coffeeInvitation.name} className="venue-invitation-portrait"/>
                    <div>
                      <strong>A moment over coffee</strong>
                      <p>{coffeeInvitation.name} is here if you feel like talking.</p>
                      <small>Opening the conversation is free. Review any time or cost before choosing a response.</small>
                      <div className="venue-invitation-actions">
                        <button
                            type="button"
                            disabled={!active || busy || moving || offline}
                            onClick={() => { if (coffeeInvitation.context !== gameContext(latest.current.g) || coffeeInvitation.session !== venueSession.current || openPlace.current !== coffeeInvitation.spot)
        return; venueSession.current++; setVenueInvitation(null); openEncounter(coffeeInvitation.actorId, coffeeInvitation.spot); }}>Say hello to {coffeeInvitation.name} <ArrowRight size={14}/></button>
                        <button type="button" onClick={() => { venueSession.current++; setVenueInvitation(null); }}>Just enjoy my coffee</button>
                      </div>
                    </div>
                  </aside>}
                  {preview.weather.applies && <div className="weather-action-note">
                    <WeatherIcon type={weather?.type} size={22}/>
                    <span>
                      {'storySummary' in preview.weather ? preview.weather.storySummary : weatherStory(weather)}
                      <small>Considered in how this activity may feel</small>
                    </span>
                  </div>}
                  <button className="game-do-action" disabled={!active || busy || moving || offline || cooldown || !!why} onClick={act}>{busy || actionStatus === 'pending' ? 'Saving…' : cooldown ? actionStatus === 'success' ? 'Done · ready in a moment' : 'Not confirmed · ready in a moment' : moving ? 'Walking over…' : a.title} <ArrowRight size={18}/></button>
                  {why && <p className="game-action-lock">
                    {qualitativeText(why)}
                  </p>}
                </div>}
              </div>
              {!a && workEntry}
              {hosts.some(person => person.remote) && <details className="cast-contact-routes">
                <summary>Keep in touch <span>People you can reach from here</span></summary>
                <p>Call or send a message to someone you know.</p>
                <div>
                  {hosts.filter(person => person.remote).map(person => <button
                      type="button"
                      key={person.id}
                      disabled={!active || busy || moving || offline}
                      onClick={() => openEncounter(person.id, selected.place)}>
                    <span>
                      <strong>
                        {person.id === 'neri' ? 'Call ' : 'Message '}
                        {person.name}
                      </strong>
                      <small>
                        {person.status}
                      </small>
                    </span>
                    <ArrowRight size={14}/>
                  </button>)}
                </div>
              </details>}
            </div>
          </>}
        </DialogContent>
      </Dialog>

      <Dialog open={!!focusedEncounter} onOpenChange={v => { if (!v)
        closeEncounter(); }}>
        <DialogContent
            className="game-encounter-dialog"
            aria-labelledby="encounter-title"
            aria-describedby={undefined}
            onCloseAutoFocus={returnToGame}>
          <DialogTitle className="sr-only" id="encounter-dialog-title">A conversation in the neighborhood</DialogTitle>
          {focusedEncounter && <EncounterPanel
            key={[focusedEncounter.context, focusedEncounter.actorId, focusedEncounter.spot].join('|')}
            g={g}
            p={p}
            actorId={focusedEncounter.actorId}
            spot={focusedEncounter.spot}
            disabled={!active || busy || moving || offline}
            onAction={onAction}
            onClose={closeEncounter}/>}
        </DialogContent>
      </Dialog>

      <Dialog open={!!menu && !focusedEncounter} onOpenChange={v => { if (!v)
        setMenu(null); }}>
        <DialogContent className="game-menu-dialog" onCloseAutoFocus={returnToGame}>
          <DialogTitle tabIndex={-1}>
            {menuView === 'work' ? 'Work & learning' : menuView === 'world' ? 'Review your next step' : menuView === 'places' ? 'Where to next?' : menuView === 'board' ? 'Around the neighborhood' : 'Your little life'}
          </DialogTitle>
          <DialogDescription>
            {menuView === 'work' ? 'Compare the terms, visit the right place, then choose whether to commit.' : menuView === 'world' ? 'Opening a preview is free. Confirm only after reviewing its current terms.' : menuView === 'places' ? 'Travel within town is free; regional journeys take time and fares.' : menuView === 'board' ? `${economyMonthLabel(g)} · One shared town, different lives` : `${role} · ${qualitativeStat('social', p.social)}`}
          </DialogDescription>
          {tutorialPanel(true)}
          {menuView === 'work' ? <>
            <button type="button" onClick={() => { setCareerFocus(undefined); setMenu('places'); }}>Back to Places</button>
            <VenueCareerBoard
              key={context + ':' + workGeneration}
              g={g}
              p={p}
              disabled={!active || busy || moving || offline || privateWork}
              onAction={commitWork}
              onVisit={visitWork}
              onWorldChoice={openWorldChoice}
              onSharedOpportunity={openSharedOpportunity}
              focusActionId={careerFocus}/>
          </> : menuView === 'world' ? <>
            <button type="button" onClick={openWork}>Back to Work & learning</button>
            <WorldStory
              key={context + ':' + worldFocus}
              g={g}
              p={p}
              disabled={!active || busy || moving || offline || privateWork}
              onAction={commitWorld}
              onEncounter={openEncounter}
              focusChoiceId={worldFocus}/>
          </> : menuView === 'board' ? <div className="neighborhood-board">
            <section>
              <GamePainting
                className="notice-art"
                src={actionIllustration({ id: 'weekly_opportunity' }, g).src}
                alt={actionIllustration({ id: 'weekly_opportunity' }, g).alt}/>
              <small>ONE OPENING THIS {period.toUpperCase()}</small>
              <h3>
                {opportunity(g).title}
              </h3>
              <p>
                {opportunity(g).text}
              </p>
              <p>{economyTimeLabel(g, -boardOpportunity.hours)} · {privateWork ? 'Pay details are private' : `+${money(boardOpportunity.cash)} to cash`} · Takes some effort</p>
              <strong>
                {g.opportunityClaim?.round === g.round ? `Claimed by ${g.opportunityClaim.name}` : 'Available to the first player who claims it'}
              </strong>
              <button disabled={!active || busy || moving || g.opportunityClaim?.round === g.round} onClick={() => void visit('COMMUNITY', 'weekly_opportunity')}>Visit {worldPlaceName(p, 'COMMUNITY', g)}</button>
              <p className="fine-print">First player rotates each {period}. The same table shares this opening.</p>
            </section>
            <section>
              <GamePainting className="notice-art" src={gardenPainting(!!g.project?.completed)} alt="A painted community garden"/>
              <small>BUILD SOMETHING TOGETHER</small>
              <h3>
                {g.project?.completed ? 'The garden is open!' : 'A garden for the block'}
              </h3>
              <p className="garden-status" role="status">
                {gardenStage(projectProgress(g), projectGoal(g), !!g.project?.completed)}
              </p>
              <p>One contribution per player per {period}</p>
              <p>Every contributor earns {money(600)} and becomes part of the garden’s lasting story when it opens.</p>
              <p>
                {g.players.filter((q: Player) => g.project?.contributions[q.id]).map((q: Player) => q.name).join(', ') || 'The first helping hand is still welcome.'}
              </p>
              <button disabled={!active || busy || moving || g.project?.completed || !visible.includes('GARDEN')} onClick={() => void visit('GARDEN', 'garden_project')}>Visit {worldPlaceName(p, 'GARDEN', g)}</button>
            </section>
          </div> : menuView === 'places' ? <>
            {workEntry}
            {!p.castRedacted && <EnsembleStories g={g} p={p} disabled={!active || busy || moving || offline} onAction={commitEnsemble} onVisit={visitEnsemble}/>}
            <ArcSpotlight g={g} p={p} disabled={!active || busy || moving || offline} onOpen={openEncounter}/>
            {localInvitation && <section className="place-invitations regional-civic-invitation" aria-label="Local invitation">
              <div className="invitation-heading">
                <span>Around here</span>
                <small>An optional way to join in</small>
              </div>
              <div className="invitation-list">
                <button disabled={!active || busy || moving || offline} onClick={() => void visit(localInvitation.place, localInvitation.action)}>
                  <small>
                    {worldPlaceName(p, localInvitation.place, g)}
                  </small>
                  <strong>
                    {localInvitation.title}
                  </strong>
                  <span>
                    {qualitativeText(localInvitation.reason)}
                  </span>
                  <em>Preview the activity · no time spent <ArrowRight size={14}/></em>
                </button>
              </div>
            </section>}
            <CastMeetups g={g} p={p} disabled={!active || busy || moving || offline} onEncounter={openEncounter}/>
            <div className="game-place-list">
              {['main', 'west'].map(d => <div key={d}>
                <h3>
                  {d === 'main' ? 'Main Street' : 'Westside'}
                </h3>
                {locations.filter(s => s.district === d && visible.includes(s.place)).map(s => <button
                    data-material={placeStory(s.place).material}
                    data-place={s.place}
                    key={s.place}
                    disabled={!active || busy || moving || offline || !!focusedEncounter}
                    onClick={() => void visit(s.place)}>
                  <GamePainting src={locationPainting(s.art)} alt=""/>
                  <span>
                    <strong>
                      {worldPlaceName(p, s.place, g)}
                    </strong>
                    <small>
                      {placeStory(s.place).promise}
                    </small>
                    {cast.some(person => person.spot === s.place && !person.remote) && <small className="cast-place-hint">Here: {cast.filter(person => person.spot === s.place && !person.remote).map(person => person.name).join(', ')}</small>}
                    {cast.some(person => person.spot === s.place && person.remote) && <small className="cast-place-hint">Keep in touch with familiar contacts</small>}
                  </span>
                  <ArrowRight size={16}/>
                </button>)}
              </div>)}
            </div>
            {world && <WorldStory
              key={context}
              g={g}
              p={p}
              disabled={!active || busy || moving || offline}
              onAction={onAction}
              onEncounter={openEncounter}/>}
          </> : <>{workEntry}{p.castRedacted ? <PublicLifeSummary g={g} p={p}/> : <LifeJournal key={context} g={g} p={p} disabled={!active || busy || moving || offline} onAction={onAction}/>} {!p.castRedacted && <EnsembleJournal g={g} p={p}/>} <div className="game-menu-actions">
              <button onClick={() => { setMenu(null); onSound(); }}>Sound & music</button>
              <button aria-pressed={lowQuality} onClick={() => { const low = !lowQuality; setLowQuality(low); engine.current?.quality(low); }}>
                {lowQuality ? 'Weather motion: quiet' : 'Weather motion: animated'}
              </button>
              <button onClick={() => { setMenu(null); onTutorialReplay(); }}>Replay guided tutorial</button>
              <button onClick={() => { setMenu(null); onRules(); }}>How to play</button>
              {g.mode === 'online' && <button onClick={onCopy}>Copy room link</button>}
              <button onClick={onHome}>Save & return to title</button>
            </div><details>
              <summary>The {period} so far</summary>
              {g.log.slice(0, 8).map((s: string, i: number) => <p key={i}>
                {qualitativeText(s)}
              </p>)}
            </details></>}
        </DialogContent>
      </Dialog>

    </section>;
}
