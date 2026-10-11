import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, existsSync} from 'node:fs';
import {resolve, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import vm from 'node:vm';
import {buildPage, renderCharacters, renderLocations, wordCount} from '../scripts/build-guide.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const page = readFileSync(resolve(root, 'public/guide/index.html'), 'utf8');
const js = readFileSync(resolve(root, 'public/guide/guide.js'), 'utf8');
const content = JSON.parse(readFileSync(resolve(root, 'docs/guide-content.json'), 'utf8'));
const approvedRoster=JSON.parse(readFileSync(resolve(root,'docs/guide-approved-roster.json'),'utf8'));
const history = readFileSync(resolve(root, 'lib/character-histories.ts'), 'utf8');
const decode = text => text.replaceAll('&amp;', '&').replaceAll('&lt;', '<').replaceAll('&gt;', '>').replaceAll('&quot;', '"').replaceAll('&#39;', "'");

test('all 68 canonical identities have complete 250–500-word backstories in static HTML', () => {
  const canonical = [...history.matchAll(/\{id:'([^']+)',name:'([^']+)',before:/g)].map(match => [match[1], match[2]]);
  assert.equal(content.characters.length, 68);
  assert.deepEqual(content.characters.map(({id,name})=>[id,name]).sort(),approvedRoster.map(({id,name})=>[id,name]).sort());
  for(const [id,name]of canonical)assert.ok(content.characters.some(p=>p.id===id&&p.name===name));
  assert.equal(new Set(content.characters.map(person => person.id)).size, 68);
  for (const person of content.characters) {
    const count = wordCount(person.paragraphs);
    assert.ok(count >= 250 && count <= 500, `${person.name}: ${count} words`);
    assert.ok(person.paragraphs.length >= 3, `${person.name} needs readable paragraphs`);
    const card = page.match(new RegExp(`<article class="person" id="person-${person.id}"[^>]*>([\\s\\S]*?)</article>`))[1];
    const body = card.match(/<div class="backstory-copy">([\s\S]*?)<\/div><\/details>/)[1];
    const paragraphs = [...body.matchAll(/<p>(.*?)<\/p>/g)].map(match => decode(match[1]));
    assert.deepEqual(paragraphs, person.paragraphs, `${person.name}: deployed paragraphs differ`);
    assert.equal(wordCount(paragraphs), count);
    assert.ok(card.includes(`${count} words`));
    assert.match(card, /<details class="backstory" name="character-backstories"><summary>Read /);
    assert.doesNotMatch(card, /<details[^>]*\bopen\b/);
    assert.ok(card.indexOf('<img ') < card.indexOf('<details'), 'Portrait is visible before opening');
    assert.ok(card.indexOf('<h4>') < card.indexOf('<details'), 'Identity is visible before opening');
  }
});

test('five illustrated location histories cover the existing canonical world art', () => {
  assert.deepEqual(content.locations.map(place => place.id).sort(), ['alder', 'embermesa', 'glasssteppe', 'pelagia', 'saffron']);
  for (const location of content.locations) {
    assert.ok(location.paragraphs.length >= 2);
    assert.ok(wordCount(location.paragraphs) >= 100 && wordCount(location.paragraphs) <= 350);
    assert.ok(existsSync(resolve(root, `public/paintings/world/${location.id}.webp`)));
    assert.ok(page.includes(`id="place-${location.id}"`));
    assert.ok(page.includes(`alt="${location.alt}"`));
    assert.ok(page.includes(renderLocations([location])));
  }
});

test('guide source regenerates deterministically, escapes text, and rejects undersized stories', () => {
  assert.equal(buildPage(page, content), page);
  assert.equal(buildPage(buildPage(page, content), content), page);
  const person = structuredClone(content.characters[0]);
  person.name = '<script>"&\'';
  person.family=[];
  const rendered = renderCharacters([person]);
  assert.doesNotMatch(rendered, /<script>/);
  assert.match(rendered, /&lt;script&gt;&quot;&amp;&#39;/);
  person.paragraphs = ['Too short.'];
  assert.throws(() => renderCharacters([person]), /expected 250–500/);
});

test('private recollections and outcome vocabulary are absent from public prose', () => {
  const prose = JSON.stringify(content);
  for (const [, recollection] of history.matchAll(/closer:'([^']+)'/g)) {
    assert.ok(!prose.includes(recollection), 'A deeper recollection leaked into the guide');
  }
  assert.doesNotMatch(prose, /keepsake|unlock|month [1-8]|missed promise|chapter [1-8]|historyScene|shareOutcome/i);
  assert.doesNotMatch(page, /character-histories\.ts|cast-characters\.ts|fetch\(|XMLHttpRequest/);
});

test('search includes expanded prose, place filters combine, and reset returns focus', () => {
  const listeners = {};
  const fields = {
    '#character-search': {value: '', addEventListener: (_, fn) => listeners.search = fn, focus() { this.focused = true; }},
    '#character-region': {value: '', addEventListener: (_, fn) => listeners.region = fn},
    '#reset-cast': {addEventListener: (_, fn) => listeners.reset = fn},
    '#cast-count': {}, '#no-results': {},
  };
  const people = content.characters.map(person => ({dataset: {region: person.region}, textContent: [person.name, person.role, person.intro, ...person.paragraphs].join(' '), hidden: false}));
  const document = {documentElement: {classList: {add() {}}}, querySelector: selector => fields[selector], querySelectorAll: selector => selector === '.person' ? people : []};
  vm.runInNewContext(js, {document});
  fields['#character-search'].value = '  PRISTINE  ';
  listeners.search();
  assert.equal(people.filter(person => !person.hidden).length, 1);
  assert.equal(people[content.characters.findIndex(p=>p.id==='neri')].hidden,false);
  fields['#character-region'].value = 'alder';
  listeners.region();
  assert.equal(fields['#no-results'].hidden, false);
  listeners.reset();
  assert.equal(people.filter(person => !person.hidden).length, 68);
  assert.equal(fields['#character-search'].focused, true);
  assert.equal(fields['#character-region'].value, '');
});

test('print opens every backstory and restores disclosure state after repeated print events', () => {
  const events = {};
  const details = [false, true, false].map(open => ({open, name: 'character-backstories', getAttribute() {return this.name;}, removeAttribute() {this.name = null;}, setAttribute(_, value) {this.name = value;}}));
  const fields = {'#character-search': {value: '', addEventListener() {}}, '#character-region': {value: '', addEventListener() {}}, '#cast-count': {}, '#no-results': {}};
  const document = {documentElement: {classList: {add() {}}}, querySelector: selector => fields[selector], querySelectorAll: selector => selector === '.backstory' ? details : []};
  vm.runInNewContext(js, {document, window: {addEventListener: (event, fn) => events[event] = fn}});
  events.beforeprint(); events.beforeprint();
  assert.ok(details.every(item => item.open && item.name === null));
  events.afterprint(); events.afterprint();
  assert.deepEqual(details.map(item => item.open), [false, true, false]);
  assert.ok(details.every(item => item.name === 'character-backstories'));
});

test('real geography sections group every profile once and expose working jump anchors', () => {
  const expected = {alder:22,saffron:8,glasssteppe:14,pelagia:14,embermesa:8,traveler:2};
  const groups = [...page.matchAll(/<section class="cast-region" id="people-([^"]+)"[^>]*>([\s\S]*?)<\/section>/g)];
  assert.equal(groups.length, 6);
  for (const [, region, body] of groups) {
    assert.match(body, new RegExp(`<h3 id="heading-${region}">`));
    const cards = [...body.matchAll(/<article class="person" id="person-([^"]+)" data-region="([^"]+)">/g)];
    assert.equal(cards.length, expected[region]);
    assert.ok(cards.every(card => card[2] === region));
    assert.ok(page.includes(`href="#people-${region}" data-cast-region="${region}"`));
  }
  assert.equal(content.affinities.length, 2);
  for (const affinity of content.affinities) {
    const people = affinity.ids.map(id => content.characters.find(person => person.id === id));
    assert.ok(people.every(Boolean));
    assert.notEqual(people[0].region, people[1].region);
  }
  assert.match(page, /Shared interests suggest a few possible introductions/);
});

test('geography jumps clear a conflicting search, reveal the target group, and keep counts accurate', () => {
  const listeners = {};
  const fields = {
    '#character-search': {value: '', addEventListener: (_, fn) => listeners.search = fn},
    '#character-region': {value: '', addEventListener: (_, fn) => listeners.region = fn},
    '#cast-count': {}, '#no-results': {},
  };
  const people = [{dataset: {region: 'alder'}, textContent: 'Mina', hidden: false}, {dataset: {region: 'glasssteppe'}, textContent: 'Ren', hidden: false}];
  const groups = ['alder', 'glasssteppe'].map(region => ({hidden: false, count: {}, querySelectorAll: () => people.filter(person => person.dataset.region === region), querySelector() {return this.count;}}));
  const link = {dataset: {castRegion: 'glasssteppe'}, addEventListener: (_, fn) => listeners.jump = fn};
  const document = {documentElement: {classList: {add() {}}}, querySelector: selector => fields[selector], querySelectorAll: selector => ({'.person': people, '.cast-region': groups, '[data-cast-region]': [link]}[selector] ?? [])};
  vm.runInNewContext(js, {document});
  fields['#character-search'].value = 'Mina'; listeners.search();
  assert.equal(groups[1].hidden, true);
  listeners.jump();
  assert.equal(fields['#character-search'].value, '');
  assert.equal(fields['#character-region'].value, 'glasssteppe');
  assert.equal(groups[0].hidden, true);
  assert.equal(groups[1].hidden, false);
  assert.equal(groups[1].count.textContent, '1 of 1 person');
  assert.equal(fields['#no-results'].hidden, true);
});

test('authored ages span generations and preserve every previously explicit age', () => {
  const ages = Object.fromEntries(content.characters.map(person => [person.id, person.age]));
  const originalAges = {
    mina:27, eli:46, jo:54, alder_tess:52, alder_rowan:39, bram:43, oren:57, hugo:36, priya:68,
    saffron_leila:44, saffron_tomas:39, saffron_ada:35, sami:31, glass_ren:26, glass_sora:30,
    glass_pavel:70, miro:62, pelagia_mara:45, pelagia_lio:41, pelagia_esme:72, pelagia_tavi:24,
    sefu:49, mesa_june:60, mesa_inez:65, kit:28, neri:29,
  };
  for(const [id,age]of Object.entries(originalAges))assert.equal(ages[id],age);
  assert.deepEqual(content.characters.map(({id,age})=>[id,age]).sort(),approvedRoster.map(({id,age})=>[id,age]).sort());
  assert.equal(Math.min(...Object.values(ages)), 2);
  assert.equal(Math.max(...Object.values(ages)), 91);
  assert.ok(content.characters.filter(person => person.age < 35).length >= 3);
  assert.ok(content.characters.filter(person => person.age >= 35 && person.age < 60).length >= 3);
  assert.ok(content.characters.filter(person => person.age >= 60).length >= 3);
  for (const person of content.characters) {
    const card = page.match(new RegExp(`<article class="person" id="person-${person.id}"[^>]*>([\\s\\S]*?)</article>`))[1];
    assert.ok(card.includes(`<span class="age">Age ${person.age}</span>`));
    assert.ok(card.indexOf('class="age"') < card.indexOf('<details'), 'Age stays visible when collapsed');
  }
  assert.throws(() => renderCharacters([{...content.characters[0], age: 17}]), /minor profile requires family/);
});

test('three public family identities are reciprocal, age-consistent, and in the backstories', () => {
  const people = Object.fromEntries(content.characters.map(person => [person.id, person]));
  const expected = [
    ['jo', 'kit', 'Parent of', 'Adult child of'],
    ['saffron_leila', 'saffron_tomas', 'Older sister of', 'Younger brother of'],
    ['miro', 'oren', 'Older brother of', 'Younger brother of'],
  ];
  assert.equal(content.characters.reduce((total,person)=>total+person.family.length,0),182);
  for(const person of content.characters)for(const tie of person.family)assert.ok(people[tie.id]?.family.some(t=>t.id===person.id));
  for (const [older, younger, forward, reverse] of expected) {
    assert.ok(people[older].family.some(t=>t.id===younger&&t.label===forward));
    assert.ok(people[younger].family.some(t=>t.id===older&&t.label===reverse));
    assert.ok(people[older].age > people[younger].age);
    for (const [id, relative] of [[older, younger], [younger, older]]) {
      assert.ok(people[id].paragraphs.join(' ').includes(people[relative].name));
      const card = page.match(new RegExp(`<article class="person" id="person-${id}"[^>]*>([\\s\\S]*?)</article>`))[1];
      assert.match(card, /class="family-ties"/);
      assert.ok(card.includes(`href="#person-${relative}" data-cast-region="${people[relative].region}"`));
    }
  }
  assert.equal(people.jo.age - people.kit.age, 26);
  assert.notEqual(people.jo.region, people.kit.region);
  assert.notEqual(people.miro.region, people.oren.region);
  assert.match(people.kit.paragraphs.join(' '), /adult child/);
});

test('player introduction distinguishes the wider cast and illustrated navigation', () => {
  const readme=readFileSync(resolve(root,'README.md'),'utf8');
  assert.match(readme,/illustrated isometric neighborhoods/);
  assert.match(readme,/68 character backstories/);
  assert.match(readme,/39 regular neighbors and occasional visitors/);
  assert.match(readme,/earlier game formats are unsupported/);
  assert.match(readme,/older stored records are not migrated or deleted/i);
  assert.match(readme,/Apply for work at named venues/);
  assert.doesNotMatch(readme,/Older saved rooms retain their original cast/);
  for(const text of [readme,page]){
    assert.doesNotMatch(text,/painted 3D town|Drag to orbit|two fingers to pan/);
    assert.match(text,/Find me/);
    assert.match(text,/Entire map/);
  }
});
