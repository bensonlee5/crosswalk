'use client';
import {qualitativeText} from '@/lib/point-presentation';
import {useEffect, useRef, useState} from 'react';
import {BookOpen, X} from 'lucide-react';
import {advanceTutorial, restoreTutorial, TUTORIAL_STORAGE_KEY, type TutorialEvent, type TutorialState} from '@/lib/tutorial';
import type {Game, Player} from '@/lib/game';
import {getWeather} from '@/lib/weather';
import {hasModernEconomy,monthlyBills} from '@/lib/economy';

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
  const weather = getWeather(g,p);
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
      text = `You have ${p.hours} of 6 time blocks left this week. Cash pays for choices and bills; energy lets you act; happiness reflects how life feels. Trips within town are free. Regional journeys use time and fares. Nothing runs on a timer.`;
      label = 'Explore the town';
      break;
    case 'travel':
      title = 'Choose a place to go';
      text = p.world ? (menu === 'places' ? 'Your local workplace is a useful first stop: a paid shift earns cash for bills. Visiting a known building is free. Regional journeys show their time and fare separately.' : 'Drag to orbit; pinch or use + / − to zoom. With the map focused, arrow keys pan and L opens Places. Discover new local buildings through people and activities.') : menu === 'places' ? 'The Shift is a useful first stop: a paid shift earns cash for bills. Choose it below, or explore any destination. Moving spends no time or cash.' : 'Drag to orbit; pinch or use + / − to zoom. With the map focused, arrow keys pan and L opens Places. Tap a building or use the Places list to travel for free.';
      label = menu === 'places' ? p.world?'Visit your workplace':'Visit The Shift' : 'Open Places';
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
      text = g.lifeVersion===1 ? 'Open Your little life to choose an aspiration, see named achievements and build a foundation. Plans may change. What you earn and whom you stand beside become your legacy; there is no points winner.' : 'Make room for work, community, creativity or home. Your journal gives a broad sense of how life is taking shape, and the ending remembers your choices. Learning and experience open new work at Next Step.';
      secondary = menu !== 'life' ? {label: 'See my progress', action: onLife} : null;
      break;
    case 'neighbors':
      title = modern ? 'Leave a little good behind' : 'Find your next step';
      text = g.lifeVersion===1 ? 'People remember your choices. Mina, Eli and Jo live in Alder Quay; other regions have their own residents, conversations and relationships. Trusted friends and shared work can become lasting chapters of your life.' : modern ? 'Learning and experience open better jobs at Next Step. Make time to get to know Mina, Eli and Jo, or help with the shared garden. The board also has one first-come opportunity each week.' : 'Take courses or learn at the library, then check Next Step and apply when you are ready. Better jobs pay more. Rest and friendships protect your happiness. This classic save keeps its original rules.';
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
      text = `End week opens a review first. Your rent and groceries are ${money(p.housing ? 705 : 505)}. Unused time expires; rest helps you recover. A studio can help you feel settled. Below $0 can weigh on your spirits, but nobody is eliminated. ${g.players.length > 1 ? 'The next player takes a turn; a new week starts after everyone finishes.' : 'After paying, your next week begins with six fresh blocks.'}`;
      label = 'Review my bills'; action = onBills;
      secondary = {label: 'Continue without ending week', action: () => send('next')};
      break;
    case 'finish':
      title = 'The neighborhood is yours';
      text = 'Pick a destination, compare activities, spend your six blocks, then review and pay your bills. Your moves save automatically. Replay this guide from the game menu or How to play whenever you like.';
      label = 'Keep playing';
      break;
  }
  if (hasModernEconomy(g)) {
    title=title.replace(/weeks/g,'months');text=text.replace(/weeks/g,'months').replace(/week/g,'month').replace(/time blocks/g,'priority blocks');
    if(secondary)secondary={...secondary,label:secondary.label.replace(/week/g,'month')};
    if(state.step==='resources')text=`You have ${p.hours} of 6 priority blocks left this month. They represent where you put your attention, not literal hours. A regular work month uses 2 blocks and 160 paid hours. Cash pays for choices and monthly bills. Visiting known local buildings is free; regional journeys show their fare and blocks.`;
    if(state.step==='neighbors'){text='Visit a marked conversation to meet people. Choose a response, then confirm it once. Promises, shared decisions and missed moments return in later chapters. People also have plans of their own. You can decline honestly and keep a future open.';secondary=menu!=='places'?{label:'Find a conversation',action:onPlaces}:null;}
    if(state.step==='weather'){title='Eight months through the seasons';text='Two representative months in each season. The Chronicle follows your current region, with its own weather and public news. Quiet months need no manufactured event. Weather effects are included in activity previews; each played month settles one set of bills.';}
    if(state.step==='week')text=`End month opens a review first. Your current monthly rent, food and essentials total ${money(monthlyBills(p).total)}. Unused priority blocks expire. Rest helps you recover, and housing affects how settled you feel. Below $0 can weigh on your spirits, but nobody is eliminated. ${g.players.length>1?'The next player takes a turn; the new month begins after everyone finishes.':'The next month starts with six fresh priority blocks.'}`;
  }
  if(g.careerVersion===1){
    if(state.step==='travel'&&(menu==='places'||menu==='work')){title='Choose your first workplace';text='Open Work & learning to compare local entry roles. You start without a contract. Review the requirements, visit the employer, apply, then separately accept its offer before choosing a paid shift. Visiting and reviewing spend no time or cash.';label=menu==='work'?'Continue to the preview lesson':'Open Work & learning';action=menu==='work'?()=>send('next'):onWork;}
    if(state.step==='activity'&&menu==='work'){text='Review a job, course or paid shift below. Visiting opens its current preview. Applying takes time; accepting an offer and working are separate decisions. Only the final Choose button commits the shown terms.';label='Continue without acting';action=()=>send('next');secondary=null;}
    if(state.step==='neighbors')text+=' Workmates can share leads to another workplace or town. A lead is information; qualifications, applications and offers still matter.';
    if(state.step==='week')text=`End month opens a review of ${money(monthlyBills(p).total)} household bills. Unpaid bills become arrears. In recovery, one block each month goes to administration and some pay repays arrears. Shared housing, entry work and free study remain available. Clear arrears and settle two bills on time to leave recovery.`;
  }
  const needsTurn = ['travel', 'activity', 'week'].includes(state.step);
  return <aside className={'game-tutorial' + (inline ? ' tutorial-inline' : '')} aria-label="Guided tutorial" data-step={state.step}>
    <div className="tutorial-eyebrow"><BookOpen size={15} aria-hidden="true"/><span>{index < 0 ? hasModernEconomy(g)?'YOUR FIRST MONTH':'YOUR FIRST LITTLE WEEK' : `LEARN AS YOU PLAY · ${index + 1} / 7`}</span><button className="tutorial-dismiss" aria-label="Skip tutorial" onClick={() => send('skip')}><X size={18}/></button></div>
    <h2 ref={heading} tabIndex={-1}>{title}</h2>
    <p>{qualitativeText(text)}</p>
    {needsTurn && !active && <p className="tutorial-pause">{g.mode === 'online' ? 'Follow along for now. Actions are available on your turn.' : 'Finish the open prompt or reconnect to take an action.'}</p>}
    <div className="tutorial-actions"><button className="tutorial-primary" disabled={needsTurn && (!active || busy)} onClick={action}>{label}</button>{secondary && <button className="tutorial-secondary" onClick={secondary.action}>{secondary.label}</button>}{state.step === 'welcome' && <button className="tutorial-secondary" onClick={() => send('skip')}>Skip tutorial</button>}</div>
  </aside>;
}
