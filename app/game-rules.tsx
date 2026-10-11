'use client';
import { Dialog,DialogContent,DialogDescription,DialogTitle } from '@/components/ui/dialog';
import { economyAssumption,economySources,economyTimeExplanation } from '@/lib/economy';

type GameRulesProps={open:boolean;playing:boolean;onOpenChange:(open:boolean)=>void;onReplay:()=>void};
/** The current monthly rules. Opening help never changes the game. */
export default function GameRules({open,playing,onOpenChange,onReplay}:GameRulesProps){
 return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="rules-dialog"><DialogTitle>There’s more than one way to thrive.</DialogTitle>
  <DialogDescription>Eight months. Six priority blocks each month. A life that changes.</DialogDescription><div className="rules-body">{playing&&<button className="tutorial-rules-replay" onClick={onReplay}>Replay guided tutorial</button>}
  <p>Choose a place on the map or in Places, then choose what to do there. Trips inside town are free. Regional journeys show their fare and priority blocks before you commit. Drag the map, pinch or scroll to zoom, or use the keyboard arrows; L opens Places.</p>
  <h3>Eight months of choices</h3>
  <p>{economyTimeExplanation} Work, training, relationships and travel compete for those priorities. A block is not a literal hour or day. End your month when you are ready; unused blocks expire.</p>
  <h3>A believable starting point</h3><p>Start with $6,000 in savings and a shared home in Alder Quay. Open Work &amp; learning to compare named employers, entry roles and later career steps. An application costs one block and $0; accepting an offer is a separate free choice. Work happens at the employer’s venue. Short, regular and demanding commitments use 40/160/200 paid hours and 1/2/3 priority blocks. All paid work shares a 200-hour monthly limit; the preview shows actual pay.</p>
  <p>{economyAssumption} Pay arrives when you commit to the work. There is no borrowing or investment product to manage.</p>
  <h3>Rent, groceries and room to grow</h3>
  <p>Your shared home costs $1,250 rent, $380 groceries and $220 essentials each month, totaling $1,850. An Alder studio totals $3,050 each month and can help you feel settled. Moving into your first studio costs $2,800 upfront: a $2,450 deposit and $350 moving costs. Rent still settles once at month-end. Everyday habits show their monthly total: 20 weekday coffees × $7 = $140; 8 café meetups × $18 = $144. Cooking upgrades add $100 for 20 dinners. Market lunches add $260: 20 × $18, less $100 of displaced groceries. Ordinary food is already budgeted, so these are additional costs. Choose each habit once per month; none renew automatically. Free walks, library reading and free social activities remain available.</p><p>Campus foundation/advanced classes cost two blocks/$600 and three blocks/$900; free Library alternatives take three and four blocks. Conversations can lead to work elsewhere, while qualifications and the employer’s response still matter. Foreign offers show return travel and home-bill costs. A second consecutive unpaid bill starts financial recovery: shared housing, one monthly administration block, paused paid tuition/studio upgrades and 20% of take-home pay toward arrears. Free learning, work and relationships remain open. Repay the arrears and settle two bills on time to recover.</p>
  <h3>A place to visit, or a place to stay</h3>
  <p>Conversations and time reveal new places and routes. Each region has its own people, work, food and living costs. Visiting leaves your home lease unchanged. Relocation is a separate choice with its moving and deposit costs shown first. Work away from home and every journey still use the same monthly priorities.</p>
  <h3>People who remember</h3>
  <p>Mina, Eli and Jo have plans that can clash and change. Open the current conversation at its marked venue, make a choice and see what follows. Other residents have their own stories. Friendships and a relationship can grow over different months; a visit never promises a move. Free cautious responses keep a difficult month playable. Your earned history stays with you.</p>
  <p>Choose an aspiration to give your life a direction, and change it once per month if your priorities shift. Contribute to the shared garden once each month; completing it pays each contributor $600. The shared project opening can be claimed only once for the whole table each month. First player rotates monthly. The ending reflects your work, relationships and unfinished plans, rather than picking a points winner.</p>
  <h3>Everyday surprises</h3>
  <p>Some ordinary activities can end in a small spill, a price correction or an unexpected exchange. The preview discloses possible extra cash effects. These moments use no extra priority blocks, and the confirmed response tells you what happened. Direct character choices keep their authored consequences.</p>
  <h3>A changing neighborhood</h3>
  <p>Places develop as time passes and neighbors contribute. Returning can reveal changed streets and familiar people with new circumstances. Weather follows the region you are in. Weather can make activities more tiring or restorative; check the preview before choosing. Every chapter is one billed month; there are no extra unbilled months between chapters.</p>
  <h3>Playing together</h3>
  <p>Pass &amp; play uses one screen. Online rooms use one device per player and refresh every three seconds. Keep your voice call in your usual app. Only the current player can act. Return with the same browser to keep a guest seat. Keep this browser’s site data to retain access to your guest seat. Email accounts and cross-device recovery are currently unavailable. A disconnected player’s turn waits.</p>
  <h3>Modern dollars, fictional places</h3>
  <p>Wages and living costs use modern U.S. dollar ranges, with fictional regional differences. The 80% take-home convention, training, essentials and priority blocks are simplified game rules, not personal tax or financial advice. Healthcare and investing are not simulated.</p>
  <details><summary>Real-world price anchors</summary><ul>{economySources.map(source=><li key={source.url}><a href={source.url} target="_blank" rel="noreferrer">{source.title}</a>
  <p>{source.note}</p></li>)}</ul></details><p className="fine-print">A fresh, original life game. No affiliation with or assets from classic life-simulation games.</p>
  </div></DialogContent></Dialog>;
}
