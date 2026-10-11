import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, readdirSync, existsSync, statSync} from 'node:fs';
import {resolve, dirname, relative} from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const publicDir = resolve(root, 'public');
const manual = resolve(publicDir, 'manual');
const read = path => readFileSync(resolve(root, path), 'utf8');
const json = path => JSON.parse(read(path));
const guide = json('docs/guide-content.json');
const personalities = json('docs/character-canon/personalities.json');
const graph = json('docs/character-canon/families.json');
const dispersed = json('docs/manual/dispersed-families.json');
const items = json('docs/manual/items.json').items;
const venues = json('docs/manual/venues.json').venues;
const brands = json('docs/manual/items.json').brands ?? [];
const expansionArt = new Set([...items,...venues].filter(entry=>entry.image).map(entry=>entry.image.src));
const baseArt = new Set([...guide.characters.map(p=>`character-portraits/${p.id}.webp`),...guide.locations.map(p=>`world/${p.id}.webp`)]);
const artCount = new Set([...baseArt,...expansionArt]).size;
const escape = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
const decode = value => value.replaceAll('&quot;', '"').replaceAll('&#39;', "'").replaceAll('&lt;', '<').replaceAll('&gt;', '>').replaceAll('&amp;', '&');
const files = (base, path=base) => readdirSync(path, {withFileTypes:true}).flatMap(entry => entry.isDirectory() ? files(base, resolve(path, entry.name)) : [relative(base, resolve(path, entry.name))]).sort();
const htmlFiles = files(manual).filter(path => path.endsWith('.html'));
const html = path => readFileSync(resolve(manual, path), 'utf8');
const page = id => html(`characters/${id}/index.html`);

test('the full manual is reproducible from canonical sources without authoring or hosting files', () => {
  const result = spawnSync(process.execPath, ['scripts/build-manual.mjs', '--check'], {cwd:root, encoding:'utf8'});
  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.equal(guide.characters.length, 68);
  assert.equal(personalities.profiles.length, 68);
  assert.equal(graph.people.length, 68);
  assert.equal(guide.locations.length, 5);
  const regions = [...new Set(guide.characters.map(person => person.region))];
  assert.equal(regions.length, 6);
  const expectedPages = ['index.html', '404.html', 'characters/index.html', 'families/index.html', 'items/index.html', 'venues/index.html', ...(brands.length ? ['brands/index.html',...brands.map(brand=>`brands/${brand.id}/index.html`)] : []), ...items.map(item=>`items/${item.id}/index.html`), ...venues.map(venue=>`venues/${venue.id}/index.html`), ...guide.characters.map(person => `characters/${person.id}/index.html`), ...guide.locations.map(place => `places/${place.id}/index.html`), ...regions.map(region => `regions/${region}/index.html`)].sort();
  assert.deepEqual(htmlFiles, expectedPages);
  assert.deepEqual(files(manual), [...expectedPages, 'assets/favicon.svg', 'assets/site.css', 'assets/site.js', 'assets/catalog.css', 'assets/catalog.js'].sort());
  assert.equal(htmlFiles.length, 85+items.length+venues.length+brands.length+(brands.length ? 1 : 0));
  for (const path of htmlFiles) assert.doesNotMatch(html(path), /(?:chatgpt\.site|chatgpt\.com|supabase\.(?:co|com)|\/authoring\/|private[-_ ]review|service[_-]role|sb_secret_|sb_publishable_|\.openai\/|source_repository|BEGIN PRIVATE KEY)/i, path);
  assert.doesNotMatch(html('index.html'), /Review edition/);
  assert.ok(read('README.md').includes('https://bensonlee5.github.io/crosswalk/manual/'));
});

test('all manual links, fragments, scripts, styles and shared art resolve beneath the GitHub Pages prefix', () => {
  const prefix = '/crosswalk/';
  const origin = 'https://bensonlee5.github.io';
  const paintings = new Set();
  let references = 0;
  for (const path of htmlFiles) {
    const source = html(path);
    const ids = [...source.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
    assert.equal(new Set(ids).size, ids.length, `Duplicate IDs: ${path}`);
    for (const match of source.matchAll(/aria-(?:labelledby|describedby|controls)="([^"]+)"/g)) for (const id of match[1].split(/\s+/)) assert.ok(ids.includes(id), `Broken ARIA reference: ${path}/${id}`);
    for (const match of source.matchAll(/<label\b[^>]*for="([^"]+)"/g)) assert.ok(ids.includes(match[1]), `Broken form label: ${path}/${match[1]}`);
    assert.equal([...source.matchAll(/<h1\b/g)].length, 1, path);
    assert.ok(source.includes('Crosswalk Travel Guide'), `Missing guide branding: ${path}`);
    assert.doesNotMatch(source, /Crosswalk manual|illustrated manual|Manual home|Return to the manual/i, path);
    const url = new URL(`${prefix}manual/${path.replace(/index\.html$/, '')}`, origin);
    for (const match of source.matchAll(/\b(?:href|src|action)="([^"]+)"/g)) {
      const ref = decode(match[1]);
      assert.ok(!ref.startsWith('/'), `Root-relative path breaks project Pages: ${path} ${ref}`);
      const target = new URL(ref, url);
      assert.equal(target.origin, origin, `External request: ${path} ${ref}`);
      assert.ok(target.pathname.startsWith(prefix), `Escapes project prefix: ${path} ${ref}`);
      let local = resolve(publicDir, decodeURIComponent(target.pathname.slice(prefix.length)));
      // The game's index.html is generated by Vite, while the manual is a public asset.
      if (target.pathname === prefix) local = resolve(root, 'index.html');
      else if (existsSync(local) && statSync(local).isDirectory()) local = resolve(local, 'index.html');
      assert.ok(existsSync(local), `Missing local target: ${path} ${ref}`);
      if (target.hash) {
        const fragment = decodeURIComponent(target.hash.slice(1));
        assert.ok(readFileSync(local, 'utf8').includes(`id="${fragment}"`), `Missing fragment: ${path} ${ref}`);
      }
      if (local.endsWith('.webp')) {
        paintings.add(local);
        const hash = createHash('sha256').update(readFileSync(local)).digest('hex').slice(0, 12);
        assert.equal(target.searchParams.get('v'), hash, `Stale artwork hash: ${path} ${ref}`);
        assert.ok(target.pathname.startsWith(`${prefix}paintings/`), 'Artwork should be shared with the game');
      }
      references++;
    }
  }
  assert.equal(paintings.size, artCount);
  assert.ok(references > 1500);
  assert.doesNotMatch(html('assets/site.css'), /(?:https?:|url\s*\()/i);
  assert.doesNotMatch(html('assets/site.js'), /(?:fetch\s*\(|XMLHttpRequest|localStorage|sessionStorage|supabase|eval\s*\(|innerHTML\s*=)/i);
});

test('all 68 biographies, cultures, ages and personality details remain verbatim and linked by geography', () => {
  const roster = new Map(json('docs/guide-approved-roster.json').map(person => [person.id, person]));
  const directory = html('characters/index.html');
  assert.equal([...directory.matchAll(/\bdata-person-card\b/g)].length, 68);
  for (const person of guide.characters) {
    const source = page(person.id);
    assert.equal(person.age, roster.get(person.id).age);
    assert.ok(source.includes(`data-profile="${person.id}"`));
    for (const paragraph of person.paragraphs) assert.ok(source.includes(`<p>${escape(paragraph)}</p>`), person.id);
    assert.ok(source.includes(escape(person.culturalBackground)), person.id);
    assert.ok(source.includes(`<dd class="plain">${person.age}</dd>`), person.id);
    assert.ok(directory.includes(`id="person-${person.id}"`));
    assert.ok(html(`regions/${person.region}/index.html`).includes(`id="person-${person.id}"`));
    const profile = personalities.profiles.find(candidate => candidate.id === person.id);
    assert.ok(source.includes(`data-personality="${person.id}"`));
    for (const field of ['coreNeeds','communicationStyle','decisionStyle','stressResponse','trustBuilding','conflictAndRepair','careStyle','contradiction']) assert.ok(source.includes(escape(profile[field])), `${person.id}/${field}`);
    for (const text of [profile.mbti.rationale, profile.homeFit.fit, profile.homeFit.friction, ...profile.canonAnchors]) assert.ok(source.includes(escape(text)), person.id);
    for (const example of profile.responseExamples) for (const field of ['situation','line','action']) assert.ok(source.includes(escape(example[field])), `${person.id}/${field}`);
    for (const [trait, value] of Object.entries(profile.ocean)) {
      assert.ok(source.includes(`data-ocean-trait="${trait}"`));
      assert.ok(source.includes(escape(value.rationale)));
    }
    assert.equal([...source.matchAll(/role="meter"/g)].length, 5);
    if (person.age < 18) assert.ok(source.includes(escape(personalities.framework.developmentalNote)));
    for (const tie of person.family ?? []) assert.ok(source.includes(`href="../../characters/${tie.id}/"`));
  }
});

test('five location histories, climate, cultures, examples and cross-region connections remain complete', () => {
  for (const place of guide.locations) {
    const source = html(`places/${place.id}/index.html`);
    for (const paragraph of place.paragraphs) assert.ok(source.includes(escape(paragraph)), place.id);
    for (const kind of ['places','regions']) {
      const regional = html(`${kind}/${place.id}/index.html`);
      for (const field of ['culturalBackground','climateLabel','climateDescription','settlementLabel','settlementDescription','socialFocusLabel','socialFocusDescription']) assert.ok(regional.includes(escape(place[field])), `${place.id}/${field}`);
      for (const text of [...place.culturalHistory, ...place.sharedPractices, ...place.climatePracticalNotes]) assert.ok(regional.includes(escape(text)), place.id);
      for (const example of place.socialFocusExamples) {
        assert.ok(regional.includes(escape(example.description)));
        assert.ok(regional.includes(`href="../../characters/${example.characterId}/"`));
      }
    }
  }
  for (const affinity of guide.affinities) {
    assert.ok(html('index.html').includes(escape(affinity.description)));
    for (const id of affinity.ids) assert.ok(html('index.html').includes(`href="./characters/${id}/"`));
  }
});

test('family browser retains reciprocal typed relationships and dispersed-family histories', () => {
  const source = html('families/index.html');
  for (const edge of graph.edges) {
    assert.equal([...source.matchAll(new RegExp(`data-family-edge="${edge.id}"`, 'g'))].length, 2, edge.id);
    for (const label of [edge.fromLabel, edge.toLabel]) assert.ok(source.includes(escape(label)), edge.id);
    for (const id of [edge.fromId, edge.toId]) assert.ok(source.includes(`href="../characters/${id}/"`), edge.id);
  }
  for (const story of dispersed) {
    assert.ok(source.includes(`data-dispersed-family="${story.id}"`), story.id);
    assert.ok(source.includes(escape(story.text)), story.id);
    for (const id of story.people) assert.ok(source.includes(`href="../characters/${id}/"`));
  }
});
