import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import postcss from 'postcss';
import ts from 'typescript';

// Structural/cascade regressions only. CSS geometry and input behavior are also
// checked in the resized cloud browser; this test does not emulate a phone.
const read = path => readFileSync(new URL('../' + path, import.meta.url), 'utf8');
const css = postcss.parse(read('app/isometric.css'));
const mobile = '(max-width:760px)';
const landscape = '(max-width:760px) and (max-height:500px) and (min-width:500px)';
function declarations(sheet, selector, media = null) {
  const result = {};
  sheet.walkRules(rule => {
    if (!rule.selectors.includes(selector)) return;
    if ((rule.parent.type === 'atrule' ? rule.parent.params : null) !== media) return;
    rule.walkDecls(decl => result[decl.prop] = decl.value);
  });
  return result;
}
const mobileRule = selector => declarations(css, selector, mobile);

test('mobile header, map and footer use separate content-sized layout regions', () => {
  assert.equal(mobileRule('.game-screen').display, 'flex');
  assert.equal(mobileRule('.game-screen')['flex-direction'], 'column');
  assert.match(mobileRule('.game-screen').padding, /safe-area-inset-top.*safe-area-inset-right.*safe-area-inset-bottom.*safe-area-inset-left/);
  assert.equal(mobileRule('.game-header').flex, 'none');
  for (const selector of ['.game-screen .game-top-hud', '.game-screen .game-district-tabs', '.game-screen .game-board-button', '.game-screen .game-news-button', '.game-screen .game-weather-plaque', '.game-screen .game-status', '.game-screen .game-bottom-hud']) {
    assert.equal(mobileRule(selector).position, 'static', selector + ' must not overlap from a fixed top/bottom offset');
  }
  assert.equal(mobileRule('.game-screen .game-map-viewport').flex, '1');
  assert.equal(mobileRule('.game-screen .game-map-viewport')['min-height'], '0');
  assert.equal(mobileRule('.game-screen .engine-host').inset, '0');
});

test('short narrow landscape keeps a single toolbar and reachable horizontal map controls', () => {
  const toolbar = declarations(css, '.game-screen .game-map-toolbar', '(max-width:760px) and (max-height:500px)');
  assert.equal(toolbar.display, 'flex');
  assert.equal(toolbar['flex-wrap'], 'nowrap');
  assert.equal(toolbar['overflow-x'], 'auto');
  assert.equal(declarations(css, '.game-screen .game-top-hud', landscape)['flex-wrap'], 'nowrap');
  assert.equal(declarations(css, '.game-screen .game-resource-row', landscape).order, '0');
  assert.equal(declarations(css, '.game-screen .game-player-badge small', landscape)['font-size'], '10px');
  assert.equal(declarations(css, '.game-screen .game-resource-row small', landscape)['font-size'], '10px');
  assert.equal(mobileRule('.game-screen .game-camera-controls summary').height, '44px');
  assert.equal(mobileRule('.game-screen .game-camera-controls>div')['grid-template-columns'], 'repeat(4,44px)');
});

test('desktop remains on the existing absolute HUD layout', () => {
  for (const selector of ['.game-header', '.game-map-toolbar', '.game-map-viewport']) {
    assert.equal(declarations(css, selector).display, 'contents');
  }
  assert.equal(declarations(css, '.game-screen .engine-host').position, 'absolute');
  assert.equal(declarations(css, '.game-screen .engine-host').inset, '152px 0 114px');
});

test('sound settings cap the dynamic viewport, scroll only the body and keep Close reachable', () => {
  const sheet = postcss.parse(read('app/globals.css'));
  const dialog = declarations(sheet, '.sound-dialog');
  assert.equal(dialog['max-height'], 'calc(100dvh - var(--sound-top) - var(--sound-bottom))');
  assert.equal(dialog.top, 'calc((100dvh + var(--sound-top) - var(--sound-bottom))/2)');
  assert.equal(dialog['grid-template-rows'], 'auto auto minmax(0,1fr)');
  assert.equal(dialog.overflow, 'hidden');
  for (const side of ['top', 'bottom', 'left', 'right']) {
    assert.equal(dialog['--sound-' + side], `max(12px,env(safe-area-inset-${side}))`);
  }
  const body = declarations(sheet, '.sound-dialog>.sound-settings');
  assert.equal(body['overflow-y'], 'auto');
  assert.equal(body['min-height'], '0');
  assert.equal(body['overscroll-behavior'], 'contain');
  const close = declarations(sheet, '.sound-dialog>[data-slot=dialog-close]');
  assert.equal(close.width, '44px');
  assert.equal(close.height, '44px');
  assert.equal(close.top, '8px');
});

test('text-only ensemble headers stack rather than shrinking three columns', () => {
  const sheet = postcss.parse(read('app/encounter-story.css'));
  assert.equal(declarations(sheet, '.ensemble-scene .encounter-heading').display, 'block');
});

test('the game header and map controls are wrapped without changing map keyboard behavior', () => {
  const source = ts.createSourceFile('game-screen.tsx', read('app/game-screen.tsx'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const elements = new Map();
  function visit(node) {
    if (ts.isJsxElement(node)) {
      const attribute = node.openingElement.attributes.properties.find(attr => ts.isJsxAttribute(attr) && attr.name.getText(source) === 'className');
      if (attribute && attribute.initializer && ts.isStringLiteral(attribute.initializer)) elements.set(attribute.initializer.text, node);
    }
    ts.forEachChild(node, visit);
  }
  visit(source);
  const contains = (parent, child) => child.pos >= parent.pos && child.end <= parent.end;
  assert.ok(contains(elements.get('game-header'), elements.get('game-top-hud')));
  assert.ok(contains(elements.get('game-header'), elements.get('game-map-toolbar')));
  assert.match(elements.get('game-news-button').getText(source), /aria-label="The Chronicle"/);
  assert.ok(contains(elements.get('game-map-viewport'), elements.get('game-camera-controls')));
  assert.ok(!contains(elements.get('game-header'), elements.get('game-map-viewport')));
  const map = elements.get('game-map-viewport').getText(source);
  assert.match(map, /ref=\{host\}/);
  assert.match(map, /className="engine-host"/);
  assert.match(map, /tabIndex=\{0\}/);
  assert.match(map, /ArrowLeft/);
  assert.match(map, /showMenu\('places'\)/);
});
