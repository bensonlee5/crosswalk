'use client';
import {useEffect, useRef, useState} from 'react';
import {BookOpen, X} from 'lucide-react';
import {advanceTutorial, restoreTutorial, TUTORIAL_STORAGE_KEY, type TutorialEvent, type TutorialState} from '@/lib/tutorial';
import type {Game, Player} from '@/lib/game';
import {getWeather} from '@/lib/weather';

export function useGameTutorial(room: string, replay: number, offer: boolean) {
  const [state, setState] = useState<TutorialState | null>(null);
  const current = useRef<TutorialState | null>(null);
  const replaySeen = useRef(replay);
  const lastNext = useRef(0);
  useEffect(() => {
    let raw = null;
    try { raw = localStorage.getItem(TUTORIAL_STORAGE_KEY); } catch {}
    const restored = restoreTutorial(raw, room, offer);
    current.current = restored;
    setState(restored);
    // Save the invitation too: a reload while the first Chronicle is open must not lose it.
    if (restored.status === 'active') {
      try { localStorage.setItem(TUTORIAL_STORAGE_KEY, JSON.stringify(restored)); } catch {}
    }
  }, [room, offer]);
  function send(event: TutorialEvent) {
    if (!current.current) return;
    if (event === 'next') {
      const now = Date.now();
      if (now - lastNext.current < 300) return;
      lastNext.current = now;
    }
    const next = advanceTutorial(current.current, event);
    if (next === current.current) return;
    current.current = next;
    setState(next);
    try { localStorage.setItem(TUTORIAL_STORAGE_KEY, JSON.stringify(next)); } catch {}
  }
  useEffect(() => {
    if (replaySeen.current !== replay) { replaySeen.current = replay; send('replay'); }
  }, [replay]);
  return {state, send, visible: state?.status === 'active'};
}

type Props = {state: TutorialState; g: Game; p: Player; active: boolean; busy: boolean; inline?: boolean; place: string | null; menu: string | null; send: (event: TutorialEvent) => void; onPlaces: () => void; onWork: () => void; onLife: () => void; onBoard: () => void; onNews: () => void; onBills: () => void; onFocusAction: () => void};
export default function GameTutorial({state, g, p, active, busy, inline, place, menu, send, onPlaces, onWork, onLife, onBoard, onNews, onBills, onFocusAction}: Props) {
  const heading = useRef<HTMLHeadingElement>(null);
  const weather = getWeather(g);
  const modern = p.rulesVersion === 2;
  const money = (n: number) => '$' + n.toLocaleString('en-US');
  const index = ['resources', 'travel', 'activity', 'paths', 'neighbors', 'weather', 'week'].indexOf(state.step);
  // Guidance is nonmodal. Focus a new lesson, but never steal focus for the initial invitation.
  useEffect(() => { if (state.step !== 'welcome') heading.current?.focus({preventScroll: true}); }, [state.step]);
  let title = '', text = '', label = 'Continue', action = () => send('next');
  let secondary: {label: string; action: () => void} | null = null;
  switch (state.step) {
    case 'welcome':
      title = 'A little help settling in?';
      text = 'Learn by playing: find a place, try an activity and plan your week. You can skip or replay from How to play. Your saved life stays as it is.';
      label = 'Show me how';
      break;
    case 'resources':
      title = 'Six blocks. Your kind of life.';
      text = `You have ${p.hours} of 6 time blocks left this week. Cash pays for choices and bills; energy lets you act; happiness adds to your final score. Travel is free. Nothing runs on a timer.`;
      label = 'Explore the town';
      break;
    case 'travel':
      title = 'Choose a place to go';
      text = menu === 'places' ? 'The Shift is a useful first stop: a paid shift earns cash for bills. Choose it below, or explore any destination. Moving spends no time or cash.' : 'Drag to orbit; pinch or use + / − to zoom. With the map focused, arrow keys pan and L opens Places. Tap a building or use the Places list to travel for free.';
      label = menu === 'places' ? 'Visit The Shift' : 'Open Places';
      action = menu === 'places' ? onWork : onPlaces;
      secondary = {label: 'Continue without traveling', action: () => send('next')};
      break;
    case 'activity':
      title = 'Preview it. Then make your move.';
      text = place ? 'Select an illustrated activity to compare its time, cash and other effects. The large activity button commits that choice once. Try any available activity to continue; unavailable choices explain what you need.' : 'Open a destination to compare its activities. Selecting a card is only a preview; the large activity button spends the shown time and applies its effects.';
      label = place ? 'Review selected activity' : 'Open Places';
      action = place ? onFocusAction : onPlaces;
      secondary = {label: 'Continue without acting', action: () => send('next')};
      break;
    case 'paths':
      title = 'Give your weeks a direction';
      text = modern ? 'Aim for 70 points solo, or the most points with friends after week 8. Your strongest path earns up to 40: career (jobs + skills), community (connections), or creative (craft). Savings add up to 25, happiness 25 and legacy 10.' : 'This classic save scores savings (30), career (20), learning (20) and happiness (30). Aim for 70 solo, or the most points with friends after week 8. Learning skills unlocks better jobs at Next Step.';
      secondary = menu !== 'life' ? {label: 'See my progress', action: onLife} : null;
      break;
    case 'neighbors':
      title = modern ? 'Leave a little good behind' : 'Find your next step';
      text = modern ? 'Skills 2, 4 and 6 unlock better jobs at Next Step. Mina, Eli and Jo have stories across three weeks, worth 2 legacy each. The shared garden gives contributors 4 legacy when finished. The board also has one first-come opportunity each week.' : 'Take courses or learn at the library, then apply at Next Step at 2, 4 and 6 skills. Better jobs pay more. Rest and friendships protect your happiness. This classic save keeps its original rules.';
      secondary = modern && menu !== 'board' ? {label: 'Open neighborhood board', action: onBoard} : null;
      break;
    case 'weather':
      title = weather ? 'A year in eight little weeks' : 'Read the neighborhood news';
      text = weather ? 'Two weeks each in spring, summer, autumn and winter. The Chronicle shows this week’s event and forecast. Weather can change some activities; its exact effects are already in your preview. Seasonal time skips add no extra bills.' : 'The Chronicle explains each week’s shared city event. This saved game has no seasonal weather modifiers; your original rules are preserved.';
      label = 'Open The Chronicle'; action = onNews;
      secondary = {label: 'Continue', action: () => send('next')};
      break;
    case 'week':
      title = 'Look at the bills before you finish';
      text = `End week opens a review first. Your rent and groceries are ${money(p.housing ? 705 : 505)}. Unused time expires; rest restores up to 16 energy. A studio adds up to 6 happiness before the usual 4-point drop. Below $0 costs 8 extra happiness, but nobody is eliminated. ${g.players.length > 1 ? 'The next player takes a turn; a new week starts after everyone finishes.' : 'After paying, your next week begins with six fresh blocks.'}`;
      label = 'Review my bills'; action = onBills;
      secondary = {label: 'Continue without ending week', action: () => send('next')};
      break;
    case 'finish':
      title = 'The neighborhood is yours';
      text = 'Pick a destination, compare activities, spend your six blocks, then review and pay your bills. Your moves save automatically. Replay this guide from the game menu or How to play whenever you like.';
      label = 'Keep playing';
      break;
  }
  const needsTurn = ['travel', 'activity', 'week'].includes(state.step);
  return <aside className={'game-tutorial' + (inline ? ' tutorial-inline' : '')} aria-label="Guided tutorial" data-step={state.step}>
    <div className="tutorial-eyebrow"><BookOpen size={15} aria-hidden="true"/><span>{index < 0 ? 'YOUR FIRST LITTLE WEEK' : `LEARN AS YOU PLAY · ${index + 1} / 7`}</span><button className="tutorial-dismiss" aria-label="Skip tutorial" onClick={() => send('skip')}><X size={18}/></button></div>
    <h2 ref={heading} tabIndex={-1}>{title}</h2>
    <p>{text}</p>
    {needsTurn && !active && <p className="tutorial-pause">{g.mode === 'online' ? 'Follow along for now. Actions are available on your turn.' : 'Finish the open prompt or reconnect to take an action.'}</p>}
    <div className="tutorial-actions"><button className="tutorial-primary" disabled={needsTurn && (!active || busy)} onClick={action}>{label}</button>{secondary && <button className="tutorial-secondary" onClick={secondary.action}>{secondary.label}</button>}{state.step === 'welcome' && <button className="tutorial-secondary" onClick={() => send('skip')}>Skip tutorial</button>}</div>
  </aside>;
}
