'use client';
import { monthlyBills } from '@/lib/economy';
import type { Game,Player } from '@/lib/game';
import { qualitativeText } from '@/lib/point-presentation';
import { advanceTutorial,restoreTutorial,TUTORIAL_STORAGE_KEY,type TutorialEvent,type TutorialState } from '@/lib/tutorial';
import { BookOpen,X } from 'lucide-react';
import { useEffect,useRef,useState } from 'react';

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
export default function GameTutorial({state, g, p, active, busy, inline, place, menu, send, onPlaces, onWork, onLife, onNews, onBills, onFocusAction}: Props) {
  const heading = useRef<HTMLHeadingElement>(null);
  const money = (n: number) => '$' + n.toLocaleString('en-US');
  const index = ['resources', 'travel', 'activity', 'paths', 'neighbors', 'weather', 'month'].indexOf(state.step);
  // Guidance is nonmodal. Focus a new lesson, but never steal focus for the initial invitation.
  useEffect(() => { if (state.step !== 'welcome') heading.current?.focus({preventScroll: true}); }, [state.step]);
  let title = '', text = '', label = 'Continue', action = () => send('next');
  let secondary: {label: string; action: () => void} | null = null;
  switch (state.step) {
    case 'welcome':
      title = 'A little help settling in?';
      text = 'Learn by playing: find a place, try an activity and plan your month. You can skip or replay from How to play. Your saved life stays as it is.';
      label = 'Show me how';
      break;
    case 'resources':
      title = 'Six blocks. Your kind of life.';
      text = `You have ${p.hours} of 6 priority blocks left this month. They represent where you put your attention, not literal hours. A regular work month uses 2 blocks and 160 paid hours. Cash pays for choices and monthly bills. Visiting known local buildings is free; regional journeys show their fare and blocks.`;
      label = 'Explore the town';
      break;
    case 'travel':
      title = menu === 'places' || menu === 'work' ? 'Choose your first workplace' : 'Choose a place to go';
      text = menu === 'places' || menu === 'work' ? 'Open Work & learning to compare local entry roles. You start without a contract. Review the requirements, visit the employer, apply, then separately accept its offer before choosing a paid shift. Visiting and reviewing spend no time or cash.' : 'Drag to pan; pinch or use + / − to zoom. With the map focused, arrow keys pan and L opens Places. Discover new local buildings through people and activities.';
      label = menu === 'work' ? 'Continue to the preview lesson' : menu === 'places' ? 'Open Work & learning' : 'Open Places';
      action = menu === 'work' ? () => send('next') : menu === 'places' ? onWork : onPlaces;
      secondary = {label: 'Continue without traveling', action: () => send('next')};
      break;
    case 'activity':
      title = 'Preview it. Then make your move.';
      text = menu === 'work' ? 'Review a job, course or paid shift below. Visiting opens its current preview. Applying takes time; accepting an offer and working are separate decisions. Only the final Choose button commits the shown terms.' : place ? 'Select an illustrated activity to compare its time, cash and other effects. The large activity button commits that choice once. Try any available activity to continue; unavailable choices explain what you need.' : 'Open a destination to compare its activities. Selecting a card is only a preview; the large activity button spends the shown time and applies its effects.';
      label = menu === 'work' ? 'Continue without acting' : place ? 'Review selected activity' : 'Open Places';
      action = menu === 'work' ? () => send('next') : place ? onFocusAction : onPlaces;
      secondary = menu === 'work' ? null : {label: 'Continue without acting', action: () => send('next')};
      break;
    case 'paths':
      title = 'Give your months a direction';
      text = 'Open Your little life to choose an aspiration, see named achievements and build a foundation. Plans may change. What you earn and whom you stand beside become your legacy; there is no points winner.';
      secondary = menu !== 'life' ? {label: 'See my progress', action: onLife} : null;
      break;
    case 'neighbors':
      title = 'Leave a little good behind';
      text = 'Visit a marked conversation to meet people. Choose a response, then confirm it once. Promises, shared decisions and missed moments return in later chapters. People also have plans of their own. You can decline honestly and keep a future open. Workmates can share leads to another workplace or town. A lead is information; qualifications, applications and offers still matter.';
      secondary = menu !== 'places' ? {label: 'Find a conversation', action: onPlaces} : null;
      break;
    case 'weather':
      title = 'Eight months through the seasons';
      text = 'Two representative months in each season. The Chronicle follows your current region, with its own weather and public news. Quiet months need no manufactured event. Weather effects are included in activity previews; each played month settles one set of bills.';
      label = 'Open The Chronicle'; action = onNews;
      secondary = {label: 'Continue', action: () => send('next')};
      break;
    case 'month':
      title = 'Look at the bills before you finish';
      text = `End month opens a review of ${money(monthlyBills(p).total)} household bills. Unpaid bills become arrears. In recovery, one block each month goes to administration and some pay repays arrears. Shared housing, entry work and free study remain available. Clear arrears and settle two bills on time to leave recovery.`;
      label = 'Review my bills'; action = onBills;
      secondary = {label: 'Continue without ending month', action: () => send('next')};
      break;
    case 'finish':
      title = 'The neighborhood is yours';
      text = 'Pick a destination, compare activities, spend your six priority blocks, then review and settle your bills. Your moves save automatically. Replay this guide from the game menu or How to play whenever you like.';
      label = 'Keep playing';
      break;
  }
  const needsTurn = ['travel', 'activity', 'month'].includes(state.step);
  return <aside className={'game-tutorial' + (inline ? ' tutorial-inline' : '')} aria-label="Guided tutorial" data-step={state.step}>
    <div className="tutorial-eyebrow"><BookOpen size={15} aria-hidden="true"/><span>{index < 0 ? 'YOUR FIRST MONTH' : `LEARN AS YOU PLAY · ${index + 1} / 7`}</span><button className="tutorial-dismiss" aria-label="Skip tutorial" onClick={() => send('skip')}><X size={18}/></button></div>
    <h2 ref={heading} tabIndex={-1}>{title}</h2>
    <p>{qualitativeText(text)}</p>
    {needsTurn && !active && <p className="tutorial-pause">{g.mode === 'online' ? 'Follow along for now. Actions are available on your turn.' : 'Finish the open prompt or reconnect to take an action.'}</p>}
    <div className="tutorial-actions"><button className="tutorial-primary" disabled={needsTurn && (!active || busy)} onClick={action}>{label}</button>{secondary && <button className="tutorial-secondary" onClick={secondary.action}>{secondary.label}</button>}{state.step === 'welcome' && <button className="tutorial-secondary" onClick={() => send('skip')}>Skip tutorial</button>}</div>
  </aside>;
}
