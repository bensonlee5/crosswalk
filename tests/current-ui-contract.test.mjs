import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync,readFileSync} from 'node:fs';
const compact=s=>s.replace(/\s+/g,'');
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
test('only one monthly rules surface and venue career board remain',()=>{
 const screen=read('app/game-screen.tsx'),page=read('app/page.tsx'),rules=read('app/game-rules.tsx'),tutorial=read('app/game-tutorial.tsx');
 assert.match(screen,/VenueCareerBoard/);assert.match(screen,/careerChoices/);assert.match(page,/GameRules/);assert.match(page,/MonthlyNews/);assert.match(rules,/Eight months/);assert.match(rules,/Start with \$6,000/);assert.match(rules,/Unpaid|unpaid/);assert.match(rules,/20% of take-home/);
 assert.doesNotMatch(screen+page+rules+tutorial,/hasModernEconomy|(?:life|story|rules|career|economy)Version|classic save|original rules|\$1,100|\$505|Eight weeks|supportedRules|careerMode|actionIncidents:/);
 assert.equal(existsSync(new URL('../app/career-board.tsx',import.meta.url)),false);assert.equal(existsSync(new URL('../app/neighborhood.tsx',import.meta.url)),false);
});
test('unsupported saves expose a new-life path while current pending requests keep recovery guards',()=>{
 const page=read('app/page.tsx');assert.match(compact(page),/currentGameQuery\(\{code:c\}\)/);assert.match(compact(page),/protocolVersion:CURRENT_GAME_PROTOCOL/);assert.match(page,/isCurrentSaveRequest\(recovery.request\)/);assert.match(page,/newLifeRequired/);assert.match(page,/Start a new life/);assert.match(compact(page),/functionstartNewLife\(\)\{if\(pendingRef.current\)checkLater\(true\);elseleave\(\);\}/);assert.match(page,/snapshotIsCurrent/);assert.match(page,/session.current.epoch/);assert.match(page,/ownerSession/);assert.match(page,/postSavedRequest/);assert.match(compact(page),/billPreview=p&&active&&g\?weekPreview/);
});
test('nonactivity workplaces open the current work preview rather than an empty modal',()=>{
 const screen=read('app/game-screen.tsx');assert.match(compact(screen),/!availableActions\(player,location,state.g\).length&&careerChoices/);assert.match(compact(screen),/setCareerFocus\(undefined\);setMenu\('work'\)/);assert.match(screen,/previewDismissed/);assert.match(compact(screen),/workGeneration===workSession.current/);assert.match(screen,/player.castRedacted/);
});
test('player documentation states one current format without claiming old-save preservation',()=>{
 const docs=read('README.md')+read('public/guide/index.html')+read('scripts/build-manual.mjs');assert.match(docs,/earlier game formats are unsupported/);assert.doesNotMatch(docs,/Older (?:saved )?(?:rooms|games) keep|retain their original|preserve their original|references for older saved rooms/);
});
