import assert from 'node:assert/strict';
import {after, test} from 'node:test';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {buildSync} from 'esbuild';
import {JSDOM} from 'jsdom';

// Real Radix/React interactions in an in-process DOM, not rendered mobile QA.
const dom = new JSDOM('<!doctype html><html><body></body></html>', {url: 'https://test.invalid/'});
const previous = new Map();
for (const [key, value] of Object.entries({window: dom.window, document: dom.window.document, navigator: dom.window.navigator, HTMLElement: dom.window.HTMLElement, HTMLInputElement: dom.window.HTMLInputElement, Node: dom.window.Node, NodeFilter: dom.window.NodeFilter, CustomEvent: dom.window.CustomEvent, MutationObserver: dom.window.MutationObserver, getComputedStyle: dom.window.getComputedStyle, IS_REACT_ACT_ENVIRONMENT: true})) {
  previous.set(key, Object.getOwnPropertyDescriptor(globalThis, key));
  Object.defineProperty(globalThis, key, {configurable: true, writable: true, value});
}
after(() => {
  dom.window.close();
  for (const [key, descriptor] of previous) {
    if (descriptor) Object.defineProperty(globalThis, key, descriptor);
    else delete globalThis[key];
  }
});
const React = await import('react');
const {createRoot} = await import('react-dom/client');
const {act, createElement: h, useState} = React;
const compiled = buildSync({
  stdin: {contents: "export {restoreDialogFocus} from './lib/dialog-focus.ts'; export {Dialog,DialogContent,DialogDescription,DialogTitle,DialogTrigger} from './components/ui/dialog.tsx'; export {SoundSettings} from './app/sound-controls.tsx';", resolveDir: fileURLToPath(new URL('../', import.meta.url)), sourcefile: 'sound-dialog-entry.ts'},
  bundle: true, write: false, platform: 'node', format: 'cjs', packages: 'external', logLevel: 'silent',
}).outputFiles[0].text;
const module = {exports: {}};
new Function('require', 'module', 'exports', compiled)(createRequire(import.meta.url), module, module.exports);
const {restoreDialogFocus, Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger, SoundSettings} = module.exports;

test('sound dialog preserves real modal focus, Escape, Close and settings across repeated opens', async () => {
  const container = document.createElement('div'); document.body.append(container);
  const root = createRoot(container);
  let sipTests = 0;
  function Probe() {
    const [settings, setSettings] = useState({music: true, effects: true, musicVolume: 0.3, effectsVolume: 0.6});
    return h(Dialog, null,
      h(DialogTrigger, null, 'Sound'),
      h(DialogContent, {className: 'sound-dialog'},
        h(DialogTitle, null, 'Sound & music'),
        h(DialogDescription, null, 'Set the mood for your little life.'),
        h(SoundSettings, {sound: {settings, change: patch => setSettings(value => ({...value, ...patch})), testSip: async () => {sipTests++;}, testStatus: '', unavailable: false, unlocked: false}})));
  }
  const settle = async action => act(async () => {action?.(); await new Promise(resolve => setTimeout(resolve, 5));});
  try {
    await settle(() => root.render(h(Probe)));
    const trigger = container.querySelector('button');
    await settle(() => trigger.click());
    let dialog = document.querySelector('[role=dialog]');
    assert.ok(dialog);
    assert.equal(container.getAttribute('aria-hidden'), 'true');
    assert.ok(dialog.contains(document.activeElement));
    const close = dialog.querySelector('[data-slot=dialog-close]');
    assert.match(close.textContent, /Close/);
    await settle(() => {close.focus(); close.dispatchEvent(new dom.window.KeyboardEvent('keydown', {key: 'Tab', bubbles: true, cancelable: true}));});
    assert.equal(document.activeElement, dialog.querySelector('input[type=checkbox]'));
    assert.equal(dialog.querySelectorAll('input[type=range]').length, 2);
    await settle(() => dialog.querySelector('input[type=checkbox]').click());
    assert.equal(dialog.querySelector('input[type=checkbox]').checked, false);
    await settle(() => [...dialog.querySelectorAll('button')].find(button => button.textContent === 'Test coffee sip').click());
    assert.equal(sipTests, 1);
    await settle(() => close.click());
    assert.equal(document.querySelector('[role=dialog]'), null);
    assert.equal(document.activeElement, trigger);
    await settle(() => trigger.click());
    dialog = document.querySelector('[role=dialog]');
    assert.equal(dialog.querySelector('input[type=checkbox]').checked, false);
    await settle(() => document.activeElement.dispatchEvent(new dom.window.KeyboardEvent('keydown', {key: 'Escape', bubbles: true})));
    assert.equal(document.querySelector('[role=dialog]'), null);
    assert.equal(document.activeElement, trigger);
  } finally {
    await settle(() => root.unmount());
    container.remove();
  }
});


test('Sound closes back to the connected Game menu when its nested menu item was removed', async () => {
  const container = document.createElement('div'); document.body.append(container);
  const root = createRoot(container);
  const focusReturn = {trigger: null, fallback: null};
  function Probe() {
    const [menu, setMenu] = useState(false), [sound, setSound] = useState(false);
    return h(React.Fragment, null,
      h(Dialog, {open: menu, onOpenChange: setMenu},
        h(DialogTrigger, {'data-game-menu-trigger': ''}, 'Game menu'),
        h(DialogContent, null, h(DialogTitle, null, 'Game menu'), h(DialogDescription, null, 'Your life'),
          h('button', {onClick: event => {
            focusReturn.trigger = event.currentTarget;
            focusReturn.fallback = container.querySelector('[data-game-menu-trigger]');
            setMenu(false); setSound(true);
          }}, 'Sound & music'))),
      h(Dialog, {open: sound, onOpenChange: setSound},
        h(DialogContent, {className: 'sound-dialog', onCloseAutoFocus: event => restoreDialogFocus(event, focusReturn.trigger, focusReturn.fallback)},
          h(DialogTitle, null, 'Sound & music'), h(DialogDescription, null, 'Set the mood.'))));
  }
  const settle = async action => act(async () => {action?.(); await new Promise(resolve => setTimeout(resolve, 10));});
  try {
    await settle(() => root.render(h(Probe)));
    const gameMenu = container.querySelector('[data-game-menu-trigger]');
    await settle(() => gameMenu.click());
    await settle(() => [...document.querySelectorAll('[role=dialog] button')].find(button => button.textContent === 'Sound & music').click());
    assert.equal(focusReturn.trigger.isConnected, false);
    assert.ok(document.querySelector('.sound-dialog'));
    await settle(() => document.querySelector('.sound-dialog [data-slot=dialog-close]').click());
    assert.equal(document.querySelector('[role=dialog]'), null);
    assert.equal(document.activeElement, gameMenu);
    await settle(() => gameMenu.click());
    assert.ok(document.querySelector('[role=dialog]'), 'returned focus can reopen the menu');
  } finally {
    await settle(() => root.unmount()); container.remove();
  }
});

test('dialog focus return preserves a newer focus or modal and ignores unavailable targets', () => {
  const trigger = document.createElement('button'), fallback = document.createElement('button'), other = document.createElement('button');
  document.body.append(trigger, fallback, other);
  const close = () => {
    const event = new dom.window.Event('closeAutoFocus', {cancelable: true});
    restoreDialogFocus(event, trigger, fallback);
    assert.equal(event.defaultPrevented, true);
  };
  try {
    close(); assert.equal(document.activeElement, trigger, 'connected original trigger wins');
    trigger.remove(); close(); assert.equal(document.activeElement, fallback, 'removed trigger uses fallback');
    other.focus(); close(); assert.equal(document.activeElement, other, 'newer user focus is not stolen');
    other.blur(); fallback.disabled = true; close(); assert.equal(document.activeElement, document.body);
    fallback.disabled = false;
    const modal = document.createElement('div'); modal.dataset.slot = 'dialog-content'; modal.dataset.state = 'open'; document.body.append(modal);
    close(); assert.equal(document.activeElement, document.body, 'new dialog can run its own autofocus'); modal.remove();
    fallback.hidden = true; close(); assert.equal(document.activeElement, document.body);
    fallback.remove(); close(); assert.equal(document.activeElement, document.body);
  } finally {trigger.remove(); fallback.remove(); other.remove();}
});
