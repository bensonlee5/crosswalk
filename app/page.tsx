'use client';
import {useCommittedEvent} from '@/lib/committed-ref';
import AccountPanel from '@/components/account-panel';
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ActionAudioReceipts } from '@/lib/action-audio-receipts';
import { actionFamiliarityKey, familiarityView } from '@/lib/action-familiarity';
import { actionReaction } from '@/lib/action-reactions';
import { actionSound, clockSound } from '@/lib/action-sounds';
import { assetUrl } from '@/lib/asset-url';
import { CURRENT_GAME_PROTOCOL, currentGameQuery } from '@/lib/current-game';
import { economyMonthLabel } from '@/lib/economy';
import { restoreDialogFocus } from '@/lib/dialog-focus';
import { isFoleyCue } from '@/lib/foley';
import type { Player } from '@/lib/game';
import { gameFetch, getOwnerSession, subscribeOwnerSession } from '@/lib/game-api';
import {gameErrorEnvelope, type OwnedGameSnapshot, type RoomLookupSnapshot} from '@/lib/game-response';
import { snapshotIsCurrent, weekPreview } from '@/lib/game-view';
import { getLifeEvent } from '@/lib/life-events';
import { qualitativeStat, qualitativeText, visibleGameSummary } from '@/lib/point-presentation';
import { forgetPending, isCurrentSaveRequest, isOwnedGameSnapshot, isRoomLookupSnapshot, mergeSavedRoom, pendingSaves, postSavedRequest, rememberPending, roomSummary, type PendingSave, type SavedRoom, type SaveRequest } from '@/lib/save-session';
import { nextWeather } from '@/lib/weather';
import { weatherStory } from '@/lib/weather-presentation';
import { regionDefinitions, worldChoices } from '@/lib/world-life';
import { ArrowLeft, Check, Clock, Copy, Flag, Globe, Users } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { CastPromiseNotice } from './cast-story';
import GamePainting from './game-painting';
import GameRules from './game-rules';
import GameScreen from './game-screen';
import { LifeEnding } from './life-story';
import MonthlyNews from './monthly-news';
import './save-progress.css';
import { SoundSettings, useGameSound } from './sound-controls';
import WeatherIcon from './weather-icon';
const colors = ['#ef8767', '#7aa4ef', '#ad89d6', '#dfb851'];
type ModelContextDocument = Document & { modelContext?: { registerTool?: (tool: { name: string; description: string; inputSchema: { type: 'object'; properties: Record<string, never>; additionalProperties: false }; annotations: { readOnlyHint: true }; execute: () => { game: ReturnType<typeof visibleGameSummary> } }, options: { signal: AbortSignal }) => unknown } };
const money = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
export default function Home() {
    const [g, setG] = useState<OwnedGameSnapshot | null>(null), [screen, setScreen] = useState('home'), [mode, setMode] = useState('hotseat'), [count, setCount] = useState(2), [names, setNames] = useState(['Alex', 'Sam', 'Charlie', 'Jordan']), [name, setName] = useState(''), [code, setCode] = useState(''), [busy, setBusy] = useState(false), [error, setError] = useState(''), [offline, setOffline] = useState(false), [rules, setRules] = useState(false), [handoff, setHandoff] = useState(false), [copied, setCopied] = useState(false), [lastRoom, setLastRoom] = useState(''), [restoring, setRestoring] = useState(false), [reviewWeek, setReviewWeek] = useState(false), [reviewStart, setReviewStart] = useState(false), [lastSync, setLastSync] = useState(0);
    const [newsOpen, setNewsOpen] = useState(false);
    const [refreshRequired, setRefreshRequired] = useState(false);
    const [newLifeRequired, setNewLifeRequired] = useState(false);
    const [closingReaction, setClosingReaction] = useState<{
        name: string;
        line: string;
    } | null>(null);
    useEffect(() => { if (!closingReaction)
        return; const timer = setTimeout(() => setClosingReaction(null), 12000); return () => clearTimeout(timer); }, [closingReaction]);
    const [savedRooms, setSavedRooms] = useState<SavedRoom[]>([]), [pending, setPending] = useState<PendingSave | null>(null), [historyError, setHistoryError] = useState(''), [storageWarning, setStorageWarning] = useState(false), [ownerMismatch, setOwnerMismatch] = useState(false), [deferredSaves, setDeferredSaves] = useState<PendingSave[]>([]), [historyCursor, setHistoryCursor] = useState<string | null>(null), [historyLoading, setHistoryLoading] = useState(false);
    const pendingRef = useRef<PendingSave | null>(null), historyRequest = useRef(0), ownerRef = useRef<string | null>(null);
    const [soundOpen, setSoundOpen] = useState(false);
    const soundFocusReturn = useRef<{trigger: HTMLElement | null; fallback: HTMLElement | null}>({trigger: null, fallback: null});
    function openSound(trigger?: HTMLElement) {
        soundFocusReturn.current = {
            trigger: trigger ?? (document.activeElement instanceof HTMLElement ? document.activeElement : null),
            fallback: document.querySelector<HTMLElement>('.game-round-button'),
        };
        setSoundOpen(true);
    }
    const sound = useGameSound(screen === 'game' && g?.status === 'playing');
    const [tutorialReplay, setTutorialReplay] = useState(0), [tutorialOfferRoom, setTutorialOfferRoom] = useState('');
    const current = useRef<OwnedGameSnapshot | null>(null), lock = useRef(false), session = useRef({ epoch: 0, code: '' });
    // receive/leave own this authoritative value; a speculative render must never roll it back.
    const audioReceipts = useRef(new ActionAudioReceipts());
    function receive(data: RoomLookupSnapshot, epoch: number) { if (epoch !== session.current.epoch)
        return false; if (isOwnedGameSnapshot(data)) {
        const old = current.current;
        if (!snapshotIsCurrent(old, data))
            return false;
        if (old && old.code === data.code && data.mode === 'hotseat' && data.players.length > 1 && data.status === 'playing' && (old.turn !== data.turn || old.round !== data.round))
            setHandoff(true);
        if (old && old.code === data.code && (old.turn !== data.turn || old.round !== data.round))
            setReviewWeek(false);
        if (!old || old.code !== data.code || old.status !== data.status)
            requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: 'instant' }));
        current.current = data;
        session.current.code = data.code;
        setG(data);
        setScreen('game');
        if (data.status === 'playing' && (!old || old.code !== data.code || old.round !== data.round)) {
            let seen = false;
            try {
                seen = sessionStorage.getItem('cw_news_' + data.code + '_' + data.round) === 'read';
            }
            catch { /* The Chronicle can be shown again if session storage is unavailable. */ }
            if (!seen)
                setNewsOpen(true);
        }
        try {
            localStorage.setItem('cw_room', data.code);
        }
        catch { /* The authoritative saved-game history remains available without this local shortcut. */ }
        setLastRoom(data.code);
        historyRequest.current++;
        setHistoryLoading(false);
        setSavedRooms(rooms => mergeSavedRoom(rooms, roomSummary(data)));
        history.replaceState(null, '', '?room=' + data.code);
    }
    else {
        current.current = null;
        setG(null);
        setHandoff(false);
        setNewsOpen(false);
        setCode(data.code);
        setScreen('join');
        if (!data.joinable)
            setError('This room has started or is full. If this is your seat, reopen the link in the browser you used to join.');
    } setLastSync(Date.now()); setOffline(false); return !!data.mine; }
    async function refresh(c: string, restore = false) { if (restore) {
        if (lock.current || pendingRef.current)
            return;
        lock.current = true;
        session.current.epoch++;
        session.current.code = c;
        setRestoring(true);
        setError('');
    } const epoch = session.current.epoch; try {
        const r = await gameFetch(currentGameQuery({ code: c }), { cache: 'no-store' });
        const d: unknown = await r.json(), failure = gameErrorEnvelope(d);
        if (failure.newLifeRequired) {
            if (epoch === session.current.epoch) {
                setNewLifeRequired(true);
                setOffline(false);
                setError('');
            }
            return;
        }
        if (failure.refreshRequired) {
            if (epoch === session.current.epoch) {
                setRefreshRequired(true);
                setOffline(false);
                setError(failure.error || 'Open the latest Crosswalk page to resume. Your saved seat is unchanged.');
            }
            return;
        }
        if (!r.ok)
            throw Error(failure.error);
        if (!isRoomLookupSnapshot(d, c))
            throw Error('The server response was incomplete. Your last confirmed game is unchanged.');
        if (epoch !== session.current.epoch || session.current.code !== c)
            return;
        receive(d, epoch);
        setLastSync(Date.now());
        setOffline(false);
    }
    catch (e) {
        if (epoch !== session.current.epoch)
            return;
        setOffline(true);
        if (restore)
            setError((e as Error).message);
    }
    finally {
        if (restore && epoch === session.current.epoch) {
            lock.current = false;
            setRestoring(false);
        }
    } }
    function readPending() { try {
        return pendingSaves(localStorage);
    }
    catch {
        return [];
    } }
    function keepPending(value: PendingSave) { value = { ...value, deferred: false }; pendingRef.current = value; setPending(value); setOwnerMismatch(false); setDeferredSaves(saves => saves.filter(s => s.request.requestId !== value.request.requestId)); try {
        if (!rememberPending(localStorage, value))
            setStorageWarning(true);
    }
    catch {
        setStorageWarning(true);
    } }
    function clearPending(id: string) { try {
        forgetPending(localStorage, id);
    }
    catch { /* Continue updating in-memory recovery state if browser storage cannot be cleared. */ } const records = readPending(); const next = records.find(p => p.request.requestId !== id && !p.deferred) || null; pendingRef.current = next; setPending(next); setDeferredSaves(records.filter(p => p.deferred)); setOwnerMismatch(false); }
    function checkLater(unsupported = false) { const value = pendingRef.current; if (!value)
        return; const deferred = { ...value, deferred: true, ...(unsupported ? { unsupported: true } : {}) }; let persisted = false; try {
        persisted = rememberPending(localStorage, deferred);
    }
    catch { /* Report the failed persistence below while retaining this request in memory. */ } setDeferredSaves(saves => [deferred, ...saves.filter(s => s.request.requestId !== value.request.requestId)]); pendingRef.current = null; setPending(null); setOwnerMismatch(false); leave(); if (!persisted) {
        setStorageWarning(true);
        setError('This browser could not remember Check later. Keep this tab open to return to the unconfirmed action.');
    } }
    async function loadHistory(cursor?: string | null) {
        const generation = ++historyRequest.current, epoch = session.current.epoch;
        setHistoryLoading(true);
        try {
            const response = await gameFetch(currentGameQuery({ history: 1, ...(cursor ? { cursor } : {}) }), { cache: 'no-store' });
            const data = await response.json();
            if (!response.ok)
                throw Error(data.error || 'Saved games are temporarily unavailable.');
            if (generation !== historyRequest.current || epoch !== session.current.epoch)
                return;
            const rooms: SavedRoom[] = Array.isArray(data.rooms) ? data.rooms : [];
            setSavedRooms(previous => cursor ? [...previous, ...rooms.filter(room => !previous.some(old => old.code === room.code))] : rooms);
            setHistoryCursor(typeof data.nextCursor === 'string' ? data.nextCursor : null);
            if (!cursor && !current.current)
                setLastRoom(rooms[0]?.code || '');
            setHistoryError('');
        }
        catch {
            if (generation === historyRequest.current && epoch === session.current.epoch)
                setHistoryError('Saved games could not be loaded. Reconnect and try again.');
        }
        finally {
            if (generation === historyRequest.current)
                setHistoryLoading(false);
        }
    }
    async function send(op: string, extra: Partial<SaveRequest> = {}, recovery?: PendingSave) {
        if ((refreshRequired || newLifeRequired) && !recovery)
            return;
        if (recovery && (recovery.unsupported || !isCurrentSaveRequest(recovery.request))) {
            setNewLifeRequired(true);
            setOffline(false);
            setError('');
            return;
        }
        // A callback retained by an old room/turn must never target the newer snapshot.
        if (!recovery && (op === 'move' || op === 'start') && (!g || !current.current || g.code !== current.current.code || g.version !== current.current.version || g.round !== current.current.round || g.turn !== current.current.turn))
            return;
        if (lock.current || (!recovery && pendingRef.current))
            return;
        if (!recovery)
            void sound.unlock();
        const audioToken = sound.capture();
        lock.current = true;
        setBusy(true);
        setError('');
        if (!recovery)
            setClosingReaction(null);
        if (op === 'create' || op === 'join')
            session.current.epoch++;
        const epoch = session.current.epoch, started = Date.now(), state = current.current;
        let intent = recovery, uncertain = false;
        try {
            if (!intent) {
                const owner = await getOwnerSession();
                if (epoch !== session.current.epoch)
                    return;
                ownerRef.current = owner;
                intent = { createdAt: Date.now(), request: { op: op as SaveRequest['op'], code: state?.code || code, version: state?.version, ...extra, requestId: crypto.randomUUID(), ownerSession: owner, protocolVersion: CURRENT_GAME_PROTOCOL } };
            }
            // Keep the original owner, version and request ID, including after a reload.
            keepPending(intent);
            uncertain = true;
            const { response: r, data: d } = await postSavedRequest(intent.request, gameFetch);
            const failure = gameErrorEnvelope(d);
            if (!r.ok) {
                if (failure.newLifeRequired) {
                    if (epoch === session.current.epoch) {
                        setNewLifeRequired(true);
                        setOwnerMismatch(false);
                        setOffline(false);
                        setError('');
                    }
                    return;
                }
                if (failure.refreshRequired) {
                    if (epoch === session.current.epoch) {
                        setRefreshRequired(true);
                        setOwnerMismatch(false);
                        setOffline(false);
                        setError(failure.error || 'Open the latest Crosswalk page, then check this saved action. Your progress is safe.');
                    }
                    return;
                }
                if (r.status === 401 || failure.sessionRequired || r.status === 403 && failure.identityMismatch) {
                    if (epoch === session.current.epoch) {
                        setOwnerMismatch(true);
                        setError(failure.error || 'Return to the account or guest session that owns this action, then check it again.');
                    }
                    return;
                }
                if (r.status < 500 && r.status !== 408 && r.status !== 429) {
                    clearPending(intent.request.requestId);
                    uncertain = false;
                    if (epoch === session.current.epoch)
                        setOffline(false);
                }
                if (epoch !== session.current.epoch)
                    return;
                if (r.status === 409 && intent.request.code) {
                    session.current.code = intent.request.code;
                    await refresh(intent.request.code);
                }
                throw Error(r.status === 428 ? 'This browser is not keeping a saved session. Allow site storage before starting a game.' : failure.error || 'The saved action could not be checked.');
            }
            if (!isOwnedGameSnapshot(d) || (intent.request.op !== 'create' && d.code !== intent.request.code))
                throw Error('The server response was incomplete. Check your saved action again.');
            clearPending(intent.request.requestId);
            uncertain = false;
            if (epoch !== session.current.epoch) {
                if (ownerRef.current && ownerRef.current === intent.request.ownerSession) {
                    setSavedRooms(rooms => mergeSavedRoom(rooms, roomSummary(d)));
                    setLastRoom(d.code);
                }
                return d;
            }
            ownerRef.current = intent.request.ownerSession || ownerRef.current;
            const accepted = receive(d, epoch);
            if (accepted && !refreshRequired)
                setError('');
            setOffline(false);
            if (audioReceipts.current.consume({ request: intent.request, epoch, currentEpoch: session.current.epoch, currentOwner: ownerRef.current, recovery: !!recovery, accepted, before: state, after: d })) {
                const beforePlayer: Player | undefined = state?.players?.[state.turn], afterPlayer: Player | undefined = d.players?.find((p: Player) => p.id === beforePlayer?.id);
                if (op === 'move' && state && beforePlayer && afterPlayer) {
                    const actionId = intent.request.action || '', worldChoice = actionId.startsWith('world:') ? worldChoices(beforePlayer, state).find(c => c.id === actionId.slice(6)) : undefined;
                    const transition = actionId === 'end' ? 'end' : worldChoice && !worldChoice.actorId && ['travel', 'relocate'].includes(worldChoice.kind) ? worldChoice.kind : null;
                    if (transition) {
                        const key = actionFamiliarityKey(actionId, beforePlayer, state), prior = familiarityView(beforePlayer, { actionKey: key }), familiar = familiarityView(afterPlayer, { actionKey: key });
                        if (familiar.count === prior.count + 1) {
                            const line = actionReaction({ actionId, kind: transition, count: familiar.count, lastVariant: familiar.lastVariant });
                            if (line)
                                setClosingReaction({ name: beforePlayer.name, line: transition === 'end' ? line : `${regionDefinitions[afterPlayer.world?.region || 'alder'].name}. ${line}` });
                        }
                    }
                }
                const cue = actionSound(op, intent.request.action, beforePlayer, afterPlayer, d.status === 'finished' && state?.status !== 'finished');
                if (cue)
                    sound.play(cue, audioToken);
                // The visible clock still updates on every move. Do not cover a short recording
                // with an unrelated warning chime; retain clock cues for otherwise quiet actions.
                const clock = op === 'move' && intent.request.action !== 'end' && (!cue || !isFoleyCue(cue)) ? clockSound(beforePlayer, afterPlayer) : null;
                if (clock)
                    sound.play(clock, audioToken);
            }
            if (!recovery && ['create', 'join', 'start'].includes(op))
                setTutorialOfferRoom(d.code);
            return d;
        }
        catch (e) {
            if (epoch !== session.current.epoch)
                return;
            setError(uncertain ? 'The last action has not been confirmed. Check it before making another move.' : e instanceof Error ? e.message : 'Saved games are temporarily unavailable.');
            if (uncertain)
                setOffline(true);
        }
        finally {
            const release = () => { if (epoch === session.current.epoch) {
                lock.current = false;
                setBusy(false);
            } };
            setTimeout(release, Math.max(0, 400 - (Date.now() - started)));
        }
    }
    function accountChanged(owner: string | null) { const previous = ownerRef.current; ownerRef.current = owner; if (previous && owner !== previous) {
        setSavedRooms([]);
        setLastRoom('');
        setHistoryCursor(null);
        leave();
        if (pendingRef.current)
            setOwnerMismatch(pendingRef.current.request.ownerSession !== owner);
    }
    else
        void loadHistory(); }
    // Only subscriptions use stable current callbacks. Rendered action handlers keep their
    // captured snapshot so an old button cannot target a newer room or turn.
    const ownerChanged = useCommittedEvent(accountChanged), loadRoomHistory = useCommittedEvent(loadHistory);
    const refreshRoom = useCommittedEvent(refresh), sendPending = useCommittedEvent(send);
    useEffect(() => subscribeOwnerSession(ownerChanged), [ownerChanged]);
    useEffect(() => { try {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- Mount bootstrap reconciles optional browser storage with authoritative history/recovery; Strict Mode and exact-ID recovery tests cover replay.
        setLastRoom(localStorage.getItem('cw_room') || '');
    }
    catch {
        setStorageWarning(true);
    } void loadRoomHistory(); const c = new URLSearchParams(location.search).get('room')?.toUpperCase(); const all = readPending(); setDeferredSaves(all.filter(p => p.deferred)); const saved = all.filter(p => !p.deferred); const uncertain = (c ? saved.find(p => p.request.code === c) : saved[0]) || saved[0]; if (uncertain) {
        pendingRef.current = uncertain;
        setPending(uncertain);
        void sendPending(uncertain.request.op, {}, uncertain);
    }
    else if (c) {
        setCode(c);
        void refreshRoom(c, true);
    } }, [loadRoomHistory, refreshRoom, sendPending]);
    const pollingRoom = g?.code, pollingStatus = g?.status;
    useEffect(() => { if (!pollingRoom || pollingStatus === 'finished' || newLifeRequired)
        return; const c = pollingRoom; const poll = () => { if (document.visibilityState === 'visible' && !lock.current && !pendingRef.current)
        void refreshRoom(c); }; const reconnect = () => { if (pendingRef.current)
        void sendPending(pendingRef.current.request.op, {}, pendingRef.current);
    else
        poll(); }; const i = setInterval(poll, 3000); window.addEventListener('focus', poll); window.addEventListener('online', reconnect); document.addEventListener('visibilitychange', poll); return () => { clearInterval(i); window.removeEventListener('focus', poll); window.removeEventListener('online', reconnect); document.removeEventListener('visibilitychange', poll); }; }, [pollingRoom, pollingStatus, newLifeRequired, refreshRoom, sendPending]);
    useEffect(() => { const context = (document as ModelContextDocument).modelContext; if (!context?.registerTool)
        return; const abort = new AbortController(); try {
        context.registerTool({ name: 'read_crosswalk_game', description: 'Read the visible Crosswalk game and qualitative player status.', inputSchema: { type: 'object', properties: {}, additionalProperties: false }, annotations: { readOnlyHint: true }, execute: () => ({ game: visibleGameSummary(current.current) }) }, { signal: abort.signal });
    }
    catch { /* The optional read-only browser integration must not block gameplay. */ } return () => abort.abort(); }, []);
    const p: Player | undefined = g?.players?.[g.turn], active = !!p && !!g && g.mine.includes(p.id) && g.status === 'playing';
    const billPreview = p && active && g ? weekPreview(p, g) : null;
    const period = 'month';
    function startNewLife() { if (pendingRef.current)
        checkLater(true);
    else
        leave(); }
    function leave() { setNewLifeRequired(false); setRefreshRequired(false); setClosingReaction(null); sound.stopEffects(); session.current.epoch++; session.current.code = ''; lock.current = false; setBusy(false); setRestoring(false); setOffline(false); setG(null); current.current = null; setHandoff(false); setNewsOpen(false); setReviewWeek(false); setReviewStart(false); setScreen('home'); setError(''); history.replaceState(null, '', location.pathname); void loadHistory(); window.scrollTo({ top: 0, behavior: 'instant' }); }
    async function copy() { if (!g) return; try {
        await navigator.clipboard.writeText(location.origin + location.pathname + '?room=' + g.code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }
    catch {
        setError('Copy the room code ' + g.code + ' and send it to your friends.');
    } }
    return <main
        onPointerDownCapture={() => { void sound.unlock(); }}
        onKeyDownCapture={e => { if (e.key === 'Enter' || e.key === ' ')
        void sound.unlock(); }}
        className={screen === 'game' && g?.status === 'playing' ? 'playing-shell' : 'title-shell'}>
      <header className="topbar">
        <button className="brand" onClick={leave} aria-label="Crosswalk home"><span className="mark">▥</span>crosswalk<span className="brand-dot">.</span></button>
        <div className="header-right">
          <button className="text-button" onClick={event => openSound(event.currentTarget)}>Sound</button>
          <span className="edition">LIFE, TOGETHER · 2026 EDITION</span>
          <button className="text-button" onClick={() => setRules(true)}>How to play</button>
        </div>
      </header>

      {newLifeRequired && <div role="alert" className="reconnect-banner">
        <span>This saved life uses an older game format. Start a new life to continue.</span>
        <button onClick={startNewLife} disabled={busy || restoring}>Start a new life</button>
      </div>}
      {refreshRequired && <div role="alert" className="reconnect-banner">
        <span>This room needs the latest Crosswalk page. Your seat and pending action are kept.</span>
        <button onClick={() => window.location.reload()}>Reload latest page</button>
      </div>}
      {closingReaction && !newsOpen && !handoff && <p className="save-confirmation player-closing-reaction" role="status"><strong>
          {closingReaction.name}
        </strong> · {closingReaction.line}</p>}
      {error && <div role="alert" className="error">
        <span>
          {qualitativeText(error)}
        </span>
        <button className="text-button" onClick={() => setError('')}>Dismiss</button>
      </div>}
      {pending && !newLifeRequired && <div role="status" className="reconnect-banner">
        <span>
          {busy ? 'Checking your last action…' : ownerMismatch ? 'Return to the account or guest session that owns this action.' : 'Your last action needs checking. Other moves are paused.'}
        </span>
        <button onClick={() => send(pending.request.op, {}, pending)} disabled={busy || restoring}>Check saved action</button>
        {!busy && <button className="text-button" onClick={() => checkLater()}>Check later</button>}
      </div>}
      {offline && !pending && g && <div role="status" className="reconnect-banner">
        <span>Connection lost. The last confirmed turn is saved; new moves are paused.</span>
        <button onClick={() => refresh(g.code)} disabled={busy || restoring || !!pending}>Reconnect</button>
      </div>}
      {g && !pending && !offline && lastSync > 0 && <p className="save-confirmation" role="status">Saved to server · Resume from Saved games</p>}
      {restoring && <div className="restore-banner" role="status">Opening your saved seat…</div>}

      {screen === 'home' && <section className="start-layout">
        <div className="start-copy">
          <div className="eyebrow">A LITTLE LIFE, TOGETHER</div>
          <h1>Welcome to<br /><em>Crosswalk.</em></h1>
          <div className="start-facts">
            <span><Users size={18}/> 1–4 players</span>
            <span><Clock size={18}/> About 20–30 min</span>
            <span><Flag size={18}/> 8 months</span>
          </div>
          <div className="setup">
            <h2>Who’s in your neighborhood?</h2>
            <p className="life-caption">Unpredictable turns. People who remember. A life shaped by your choices.</p>
            <p className="tutorial-start-note">Begin with $6,000 in savings and six priority blocks each month. Play with venue-based careers, timed training, recoverable money troubles and occasional small everyday surprises. An optional guide helps you settle in.</p>
            <RadioGroup aria-label="Play mode" value={mode} onValueChange={setMode} className="mode-buttons">
              <label className={mode === 'hotseat' ? 'selected' : ''}>
                <RadioGroupItem value="hotseat"/>
                <Users size={20}/>
                <span>Same screen<small>Solo or pass & play</small></span>
              </label>
              <label className={mode === 'online' ? 'selected' : ''}>
                <RadioGroupItem value="online"/>
                <Globe size={20}/>
                <span>Online room<small>Play alongside your call</small></span>
              </label>
            </RadioGroup>
            {mode === 'hotseat' ? <>
              <div className="count">
                <span>Players</span>
                <RadioGroup
                    aria-label="Number of players"
                    value={String(count)}
                    onValueChange={v => setCount(Number(v))}
                    className="count-radios">
                  {[1, 2, 3, 4].map(n => <label key={n} className={n === count ? 'selected' : ''}>
                    <RadioGroupItem value={String(n)} aria-label={String(n) + ' players'}/>
                    <span>
                      {n}
                    </span>
                  </label>)}
                </RadioGroup>
              </div>
              <div className="name-grid">
                {names.slice(0, count).map((n, i) => <label key={i}>
                  <span className="pawn" style={{ background: colors[i] }}>
                    {i + 1}
                  </span>
                  <input
                    aria-label={'Player ' + (i + 1) + ' name'}
                    maxLength={20}
                    value={n}
                    onChange={e => setNames(names.map((v, j) => j === i ? e.target.value : v))}/>
                </label>)}
              </div>
            </> : <label className="field">Your name<input value={name} onChange={e => setName(e.target.value)} maxLength={20} placeholder="Your first name or nickname"/></label>}
            <button
                className="primary"
                disabled={busy || restoring || !!pending}
                onClick={() => send('create', { mode, names: names.slice(0, count), name })}>
              {busy ? 'Setting the table…' : mode === 'online' ? 'Create a room' : count === 1 ? 'Start a solo life' : 'Start our game'}
            </button>
            <button className="join-link" onClick={() => { setScreen('join'); setError(''); }}>Have a room code? Join friends</button>
            {lastRoom && <button className="join-link" disabled={busy || restoring || !!pending} onClick={() => refresh(lastRoom, true)}>
              {restoring ? 'Opening…' : 'Resume my last game'}
            </button>}
            <AccountPanel disabled={busy || restoring || !!pending && !ownerMismatch}/>
            <section className="saved-games" aria-label="Saved games">
              <h3>Saved games</h3>
              {deferredSaves.some(save => !save.unsupported && isCurrentSaveRequest(save.request)) && <div className="deferred-saves">
                <p>Unconfirmed actions are kept here until you check them. Their games may already have saved.</p>
                {deferredSaves.filter(save => !save.unsupported && isCurrentSaveRequest(save.request)).map(save => <button
                    key={save.request.requestId}
                    className="text-button"
                    disabled={busy || restoring || !!pending}
                    onClick={() => send(save.request.op, {}, save)}>Check {save.request.code || 'new room'} action</button>)}
              </div>}
              <p className="fine-print">Every confirmed turn is saved online. Stay in this browser to keep a guest seat. Keep its site data to retain access. Email accounts and cross-device recovery are currently unavailable.</p>
              {historyError && <p role="status">{historyError} <button className="text-button" disabled={busy || restoring} onClick={() => loadHistory()}>Retry saved games</button></p>}
              {savedRooms.length ? <ul>
                {savedRooms.map(room => <li key={room.code}>
                  <button className="saved-room" disabled={busy || restoring || !!pending} onClick={() => refresh(room.code, true)}>
                    <span>
                      <strong>
                        {room.names.join(' & ') || 'Your game'}
                      </strong>
                      <small>{room.code} · {room.status === 'finished' ? 'Finished' : room.status === 'lobby' ? 'Waiting for players' : `Chapter ${room.round} of ${room.maxRounds}`}</small>
                    </span>
                    <span>
                      {room.status === 'finished' ? 'View ending' : 'Resume'}
                    </span>
                  </button>
                </li>)}
              </ul> : !historyError && <p className="fine-print">Your games will appear here after you start or join.</p>}
              {historyCursor && <button
                  className="text-button"
                  disabled={historyLoading || busy || restoring}
                  onClick={() => loadHistory(historyCursor)}>
                {historyLoading ? 'Loading saved games…' : 'Load older saved games'}
              </button>}
              {storageWarning && <p className="fine-print">Browser storage is restricted. Keep this tab open while an action is unconfirmed; check Saved games after reconnecting.</p>}
            </section>
          </div>
        </div>
        <div className="preview-board" aria-label="Crosswalk neighborhood">
          <div className="board-heading">
            <span>CROSSWALK NEIGHBORHOOD</span>
            <span>01 / 08</span>
          </div>
          <img className="start-town-art" src={assetUrl('/neighborhood.webp')} alt="Crosswalk’s illustrated neighborhood board"/>
          <p className="start-board-caption">Pick a place. Roll your marble. Make your move.</p>
          <div className="preview-note">
            <span className="pawn" style={{ background: colors[0] }}>A</span>
            <span className="pawn" style={{ background: colors[1] }}>S</span>
            <p>Different paths.<br /><strong>Same table.</strong></p>
          </div>
          <p className="solo-note">Begin with an ambition.<br />Leave with a story worth telling.</p>
        </div>
      </section>}

      {screen === 'join' && <section className="join-card">
        <button className="text-button" onClick={leave}><ArrowLeft size={16}/> Back</button>
        <Globe size={38}/>
        <h1>Pull up a chair.</h1>
        <p>Use the code your friend shared. No account needed inside the game.</p>
        <label className="field">Room code<input
            value={code}
            maxLength={6}
            onChange={e => setCode(e.target.value.toUpperCase())}
            placeholder="ABC234"
            autoCapitalize="characters"/></label>
        <label className="field">Your name<input value={name} maxLength={20} onChange={e => setName(e.target.value)} placeholder="First name or nickname"/></label>
        <button className="primary" disabled={busy || restoring || !!pending} onClick={() => send('join', { name })}>
          {busy ? 'Joining…' : 'Join the room'}
        </button>
        <button className="text-button" disabled={busy || restoring || !!pending} onClick={() => refresh(code, true)}>Resume on this browser</button>
      </section>}

      {screen === 'game' && g && <>
        {g.status === 'lobby' ? <section className="lobby">
          <div className="eyebrow">THE TABLE IS OPEN</div>
          <h1>Good company.<br />New beginnings.</h1>
          <p>Share this link or code with up to three friends. Keep your voice call open.</p>
          <button className="room-code" onClick={copy} aria-label="Copy invitation link">{g.code} {copied ? <Check /> : <Copy />}</button>
          <p className="copy-status" role="status">
            {copied ? 'Invitation link copied' : 'Tap the code to copy your invitation link'}
          </p>
          <p className="room-count">{g.players.length} of 4 seats filled · Joining closes when play starts</p>
          <div className="lobby-players">
            {g.players.map((q: Player, i: number) => <div key={q.id}>
              <span className="pawn" style={{ background: colors[i] }}>
                {q.name[0]}
              </span>
              <strong>
                {q.name}
              </strong>
              <span>
                {i === 0 ? 'Host' : 'At the table'}
              </span>
            </div>)}
          </div>
          {g.isHost ? <button className="primary" disabled={busy || offline || !!pending} onClick={() => setReviewStart(true)}>Start with {g.players.length} player{g.players.length !== 1 ? 's' : ''}</button> : <p className="waiting-note">You’re in! Waiting for {g.players[0].name} to start.</p>}
          <p className="fine-print">Confirmed turns are saved online. Guest seats stay with this browser. Keep its site data to retain access. If someone disconnects, their turn waits.</p>
        </section> : g.status === 'finished' ? <LifeEnding g={g} onAgain={leave}/> : <GameScreen
          onSound={() => openSound()}
          key={g.code}
          tutorialReplay={tutorialReplay}
          tutorialOffer={tutorialOfferRoom === g.code}
          tutorialBlocked={handoff || newsOpen || rules || reviewWeek || reviewStart}
          newsOpen={newsOpen}
          billsOpen={reviewWeek}
          onTutorialReplay={() => setTutorialReplay(v => v + 1)}
          g={g}
          active={active && !handoff && !offline && !newsOpen && !pending && !refreshRequired && !newLifeRequired}
          busy={busy || !!pending}
          offline={offline || refreshRequired || newLifeRequired}
          onVisit={place => send('move', { action: 'visit', destination: place })}
          onAction={id => send('move', { action: id })}
          onEnd={() => setReviewWeek(true)}
          onRules={() => setRules(true)}
          onHome={leave}
          onCopy={copy}
          onNews={() => setNewsOpen(true)}/>}
      </>}

      <footer>
        <span>Crosswalk · an original game about the everyday</span>
        <button className="text-button" onClick={() => setRules(true)}>Rules & economy notes</button>
      </footer>

      <GameRules
        open={rules}
        playing={g?.status === 'playing'}
        onOpenChange={setRules}
        onReplay={() => { setRules(false); setTutorialReplay(v => v + 1); }}/>

      <AlertDialog open={reviewStart} onOpenChange={setReviewStart}>
        <AlertDialogContent className="turn-review">
          <AlertDialogTitle>Ready to start?</AlertDialogTitle>
          <AlertDialogDescription>{g?.players.length} player{g?.players.length !== 1 ? 's' : ''} at the table. No one can join once the game starts.</AlertDialogDescription>
          <div className="review-buttons">
            <AlertDialogCancel className="secondary">Wait for friends</AlertDialogCancel>
            <button
                className="primary"
                disabled={busy || offline || !!pending}
                onClick={async () => { const result = await send('start'); if (result)
        setReviewStart(false); }}>Start the game</button>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={reviewWeek} onOpenChange={setReviewWeek}>
        <AlertDialogContent className="turn-review">
          <GamePainting
            className="ledger-action-painting"
            src="/paintings/news/week-4.webp"
            alt={`An oil-painted household preparing for the ${period}’s bills`}/>
          <div className="ledger-heading">HOUSEHOLD LEDGER <span>{'MONTH'} {g?.round}</span></div>
          <AlertDialogTitle>Wrap up your {period}, {p?.name}?</AlertDialogTitle>
          <AlertDialogDescription>{p?.hours ? `${p.hours} unused priority block${p.hours > 1 ? 's' : ''} will expire.` : `You’ve used all six priority blocks.`} Review your bills before passing the turn.</AlertDialogDescription>
          {p && billPreview && <>
            <dl className="bill-summary">
              <div>
                <dt>
                  {'Rent + groceries + essentials'}
                </dt>
                <dd>−{money(billPreview.bills)}</dd>
              </div>
              <div>
                <dt>Cash after bills</dt>
                <dd className={billPreview.cash < 0 ? 'negative' : ''}>
                  {money(billPreview.cash)}
                </dd>
              </div>
              <div>
                <dt>Energy after rest</dt>
                <dd>
                  {qualitativeStat('energy', billPreview.energy)}
                </dd>
              </div>
              <div>
                <dt>Happiness after the {period}</dt>
                <dd>
                  {qualitativeStat('joy', billPreview.joy)}
                </dd>
              </div>
            </dl>
            {!billPreview.settlement && billPreview.cash < 0 && <p className="overdraft-warning">Going below $0 can weigh on your spirits. You can still work next {period}.</p>}
            {billPreview.settlement && <section className="overdraft-warning" aria-label="Bill settlement consequences">
              <p>
                {billPreview.settlement.summary}
              </p>
            </section>}
            <p className="fine-print">Shown before the next {period}’s shared city event.</p>
            {g && p && getLifeEvent(p, g)?.pending && <p className="overdraft-warning">You still have a personal decision this {period}. Ending now takes its free, cautious response, included in the figures above. Open Your little life first if you want another option.</p>}
            {g && p && <CastPromiseNotice g={g} p={p}/>}
            {g && nextWeather(g) && <div className="ledger-forecast">
              <WeatherIcon type={nextWeather(g)?.type}/>
              <span>Next {period}: {nextWeather(g)?.label}<small>
                  {weatherStory(nextWeather(g))}
                </small></span>
            </div>}
          </>}
          <div className="review-buttons">
            <AlertDialogCancel className="secondary">Keep playing</AlertDialogCancel>
            <button
                className="primary"
                disabled={busy || offline || !!pending}
                onClick={async () => { const result = await send('move', { action: 'end' }); if (result)
        setReviewWeek(false); }}>{'Settle bills'} &amp; end {period}</button>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {g && g.status === 'playing' && <MonthlyNews
        g={g}
        reaction={closingReaction}
        open={newsOpen}
        onClose={() => { setNewsOpen(false); try {
        sessionStorage.setItem('cw_news_' + g.code + '_' + g.round, 'read');
    }
    catch { /* Closing the Chronicle still applies for this visit when storage is unavailable. */ } }}/>}

      <Dialog open={handoff && !newsOpen} onOpenChange={setHandoff}>
        <DialogContent className="handoff">
          <DialogTitle>Over to you, {p?.name}.</DialogTitle>
          {closingReaction && <p role="status"><strong>
              {closingReaction.name}
            </strong> · {closingReaction.line}</p>}
          <DialogDescription>{g ? economyMonthLabel(g) : 'Month 1'}. Pass the screen and take a fresh {'six priority blocks'}.</DialogDescription>
          <button className="primary" onClick={() => { setHandoff(false); window.scrollTo({ top: 0, behavior: 'instant' }); }}>I’m ready</button>
        </DialogContent>
      </Dialog>

      <Dialog open={soundOpen} onOpenChange={open => { if (!open)
        sound.stopEffects(); setSoundOpen(open); }}>
        <DialogContent className="sound-dialog" onCloseAutoFocus={event => restoreDialogFocus(event, soundFocusReturn.current.trigger, soundFocusReturn.current.fallback)}>
          <DialogTitle>Sound & music</DialogTitle>
          <DialogDescription>Set the mood for your little life.</DialogDescription>
          <SoundSettings sound={sound}/>
        </DialogContent>
      </Dialog>
    </main>;
}
