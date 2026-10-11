/** Shared source and DOM-fixture checks for both static travel-guide exports. */
import assert from 'node:assert/strict';
import {readFileSync, existsSync} from 'node:fs';
import {resolve, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import vm from 'node:vm';
import {createManualExpansion} from './manual-expansion.mjs';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const isPublic = existsSync(resolve(root, 'docs/manual/items.json'));
const sourceRoot = resolve(root, isPublic ? 'docs/manual' : 'src');
const output = resolve(root, isPublic ? 'public/manual' : 'dist');
const read = path => readFileSync(path, 'utf8');
const itemContent = JSON.parse(read(resolve(sourceRoot, 'items.json')));
const items = itemContent.items;
const brands = itemContent.brands ?? [];
const venues = JSON.parse(read(resolve(sourceRoot, 'venues.json'))).venues;
const guide = JSON.parse(read(resolve(root, isPublic ? 'docs/guide-content.json' : 'src/guide-content.json')));
const escape = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
const decode = value => value.replaceAll('&quot;', '"').replaceAll('&#39;', "'").replaceAll('&lt;', '<').replaceAll('&gt;', '>').replaceAll('&amp;', '&');
const paragraphs = value => typeof value === 'string' ? [value] : value ?? [];
assert.equal(items.length, 30, 'The approved catalog contains exactly 30 objects');
assert.ok(brands.length >= 5 && brands.length <= 8, 'Recurring brands stay within the approved scope');
assert.equal(venues.length, 75, 'Every visitable venue needs a detail page');
assert.equal(new Set(venues.map(venue => venue.id)).size, 75);
for (const region of guide.locations) assert.equal(venues.filter(venue => venue.regionId === region.id).length, 15, region.id);
for (const item of items) {
  const html = read(resolve(output, `items/${item.id}/index.html`));
  for (const field of ['name','kind','summary','description','history','storyNote','placeNote','brandRole']) for (const value of paragraphs(item[field])) assert.ok(html.includes(escape(value)), `${item.id}/${field}`);
  assert.ok(html.includes(`data-item-status="${item.storyStatus}"`));
  if (item.storyStatus === 'proposed_story_object') assert.match(html, /Proposed story use/);
  if (!item.image) assert.doesNotMatch(html, /<img\b/, 'Objects without their own art must be text-led');
  for (const person of item.people) {
    assert.ok(html.includes(`href="../../characters/${person.id}/"`));
    assert.ok(html.includes(escape(person.relationship)));
    assert.ok(read(resolve(output, `characters/${person.id}/index.html`)).includes(`href="../../items/${item.id}/"`));
  }
  for (const id of item.venueIds) {
    assert.ok(html.includes(`href="../../venues/${id}/"`));
    assert.ok(read(resolve(output, `venues/${id}/index.html`)).includes(`href="../../items/${item.id}/"`));
  }
  for (const id of item.regionIds) assert.ok(read(resolve(output, `regions/${id}/index.html`)).includes(`href="../../items/${item.id}/"`));
}
for (const venue of venues) {
  const html = read(resolve(output, `venues/${venue.id}/index.html`));
  for (const field of ['name','gameName','function','summary','history','architecture','climateNotes','civicLife','orientation','accessNotes','gameplayNotes']) for (const value of paragraphs(venue[field])) assert.ok(html.includes(escape(value)), `${venue.id}/${field}`);
  assert.match(html, /Worldbuilding notes/);
  assert.match(html, /In the current game/);
  assert.ok(html.includes(`href="../../places/${venue.regionId}/"`));
  assert.ok(html.includes(`href="../../regions/${venue.regionId}/"`));
  for (const kind of ['places','regions']) assert.ok(read(resolve(output, `${kind}/${venue.regionId}/index.html`)).includes(`href="../../venues/${venue.id}/"`));
  for (const activity of venue.activities) {
    assert.ok(html.includes(`data-activity="${activity.id}"`));
    assert.ok(html.includes(escape(activity.title)));
    for (const value of paragraphs(activity.description)) assert.ok(html.includes(escape(value)));
  }
  for (const person of venue.people) {
    assert.ok(html.includes(`href="../../characters/${person.id}/"`));
    assert.ok(html.includes(escape(person.relationship)));
    assert.ok(read(resolve(output, `characters/${person.id}/index.html`)).includes(`href="../../venues/${venue.id}/"`));
  }
}
for (const brand of brands) {
  const html = read(resolve(output, `brands/${brand.id}/index.html`));
  for (const field of ['name','summary','description','history','identity','pricePosition','quality','voicesNote']) for (const value of paragraphs(brand[field])) assert.ok(html.includes(escape(value)), `${brand.id}/${field}`);
  const products = items.filter(item => item.brandId === brand.id || item.brandIds?.includes(brand.id));
  assert.ok(products.length >= 2, `Brand needs recurring objects: ${brand.id}`);
  for (const item of products) {
    assert.ok(html.includes(`href="../../items/${item.id}/"`));
    assert.ok(read(resolve(output, `items/${item.id}/index.html`)).includes(`href="../../brands/${brand.id}/"`));
  }
  for (const voice of brand.voices ?? []) {
    assert.ok(html.includes(escape(voice.text)));
    assert.ok(html.includes(`href="../../characters/${voice.characterId}/"`));
    assert.ok(read(resolve(output, `characters/${voice.characterId}/index.html`)).includes(`href="../../brands/${brand.id}/"`));
  }
}
const venueContent = JSON.parse(read(resolve(sourceRoot, 'venues.json')));
for (const note of venueContent.guideNotes ?? []) assert.ok(read(resolve(output, 'venues/index.html')).includes(escape(note)));
const script = read(resolve(output, 'assets/catalog.js'));
const fold = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[’‘]/g, "'");
let cases = 0;
for (const kind of ['items','venues']) {
  const html = read(resolve(output, `${kind}/index.html`));
  const listeners = new Map();
  const element = (extra = {}) => ({hidden:false, value:'', disabled:false, textContent:'', handlers:{}, addEventListener(type, handler) { this.handlers[type] = handler; }, focus() { this.focused = true; }, ...extra});
  const cards = [...html.matchAll(/<article class="catalog-card" id="([^"]+)"([^>]+)>/g)].filter(match => match[2].includes('data-catalog-card')).map(match => element({id:match[1], dataset:Object.fromEntries([...match[2].matchAll(/data-([a-z]+)="([^"]*)"/g)].map(attr => [attr[1],decode(attr[2])]))}));
  assert.equal(cards.length, kind === 'items' ? items.length : venues.length);
  const select = id => {
    const markup = html.match(new RegExp(`<select id="${id}"[\\s\\S]*?</select>`))?.[0];
    if (!markup) return null;
    const control = element({options:[...markup.matchAll(/<option value="([^"]*)">([^<]+)<\/option>/g)].map(match => ({value:decode(match[1]),text:decode(match[2])}))});
    Object.defineProperty(control, 'selectedIndex', {get() { return this.options.findIndex(option => option.value === this.value); }});
    return control;
  };
  const form = element({dataset:{catalogSearch:kind}}), query = element(), region = select('catalog-region'), type = select('catalog-type'), status = select('catalog-status'), brand = select('catalog-brand'), owner = select('catalog-owner'), reset = element(), count = element(), empty = element();
  const document = {querySelector(selector) { assert.equal(selector,'[data-catalog-search]'); return form; }, querySelectorAll() { return cards; }, getElementById(id) { return {'catalog-query':query,'catalog-region':region,'catalog-type':type,'catalog-status':status,'catalog-brand':brand,'catalog-owner':owner,'catalog-reset':reset,'catalog-count':count,'catalog-empty':empty}[id]; }};
  let url = new URL(`https://example.test${isPublic ? '/crosswalk/manual' : ''}/${kind}/`);
  const window = {get location() { return {href:url.href,search:url.search}; }, history:{replaceState(a,b,path) { url = new URL(path,url); }}, addEventListener(type,handler) { listeners.set(type,handler); }};
  vm.runInNewContext(script,{document,window,URL,URLSearchParams});
  const visible = () => cards.filter(card => !card.hidden).map(card => card.id);
  const check = () => {
    const tokens = fold(query.value.trim()).split(/\s+/).filter(Boolean);
    const expected = cards.filter(card => (!region.value || card.dataset.region.split(' ').includes(region.value)) && (!type.value || card.dataset.type === type.value) && (!status?.value || card.dataset.status === status.value) && (!brand?.value || (card.dataset.brand ?? '').split(' ').includes(brand.value)) && (!owner?.value || (card.dataset.owner ?? '').split(' ').includes(owner.value)) && tokens.every(token => fold(card.dataset.search).includes(token))).map(card => card.id);
    assert.deepEqual(visible(),expected);
    assert.equal(empty.hidden,expected.length !== 0);
    assert.ok(count.textContent.startsWith(`${expected.length} of ${cards.length} ${kind}`));
    cases++;
  };
  for (let repeat = 0; repeat < 3; repeat++) {
    for (const option of region.options) for (const phrase of ['', 'café', 'cafe', 'Jo', 'garden', 'family', 'missing-value-never-matches']) {
      query.value = phrase; region.value = option.value; query.handlers.input(); check();
      assert.equal(url.searchParams.get('q'), phrase || null);
      assert.equal(url.searchParams.get('region'), option.value || null);
    }
    query.value = ''; region.value = '';
    for (const option of type.options) { type.value = option.value; type.handlers.change(); check(); }
    type.value = '';
    for (const control of [brand,owner].filter(Boolean)) { for (const option of control.options) { control.value = option.value; control.handlers.change(); check(); } control.value = ''; }
    if (status) for (const option of status.options) { status.value = option.value; status.handlers.change(); check(); }
    reset.handlers.click(); assert.equal(visible().length,cards.length); assert.equal(reset.disabled,true); assert.equal(query.focused,true);
    for (const entry of kind === 'items' ? items : venues) {
      query.value = entry.name; region.value = kind === 'items' ? entry.regionIds[0] : entry.regionId; type.value = kind === 'items' ? entry.kind : entry.placeId;
      if (brand) brand.value = entry.brandId ?? entry.brandIds?.[0] ?? 'unbranded';
      if (owner) owner.value = entry.ownership?.ownerIds?.[0] ?? 'unnamed';
      if (status) status.value = entry.storyStatus === 'proposed_story_object' ? 'proposal' : entry.gameStatus === 'implemented' ? 'implemented' : 'worldbuilding';
      query.handlers.input(); check(); assert.ok(visible().includes(`${kind === 'items' ? 'item' : 'venue'}-${entry.id}`), `Combined filters hid their exact entry: ${entry.id}`);
    }
    reset.handlers.click(); assert.equal(visible().length,cards.length);
    url = new URL(`?region=alder&q=market`,url); listeners.get('pageshow')(); check();
    const saved = visible(); query.value = 'missing-value-never-matches'; query.handlers.input(); check();
    url = new URL(`?region=alder&q=market`,url); listeners.get('popstate')(); assert.deepEqual(visible(),saved);
    url = new URL('?region=unknown&type=unknown&status=unknown&brand=unknown&owner=unknown',url); listeners.get('pageshow')(); assert.equal(region.value,''); assert.equal(type.value,''); if (status) assert.equal(status.value,''); if (brand) assert.equal(brand.value,''); if (owner) assert.equal(owner.value,''); check();
    let prevented = false; form.handlers.submit({preventDefault() { prevented = true; }}); assert.ok(prevented);
  }
}
assert.doesNotMatch(script, /fetch\s*\(|XMLHttpRequest|localStorage|sessionStorage|eval\s*\(|innerHTML\s*=/i);
vm.runInNewContext(script,{document:{querySelector() { return null; }}});
// Fail closed for unsafe IDs, missing links and unlabelled proposals.
const args = {itemContent,venueContent:{schemaVersion:1,venues},characters:guide.characters,locations:guide.locations,regions:[...guide.locations.map(place => [place.id,place.name]),['traveler','On the road']],escape,link:()=>'',image:()=>'',crumb:()=>'',imageExists:()=>true};
assert.doesNotThrow(()=>createManualExpansion(args));
const invalid = structuredClone(args.itemContent); invalid.items[0].id='../outside';
assert.throws(()=>createManualExpansion({...args,itemContent:invalid}),/unsafe items ID/);
invalid.items[0] = {...items[0],storyStatus:'proposed_story_object',storyNote:''};
assert.throws(()=>createManualExpansion({...args,itemContent:invalid}),/missing storyNote/);
invalid.items[0] = {...items[0],venueIds:['missing-venue']};
assert.throws(()=>createManualExpansion({...args,itemContent:invalid}),/invalid item venues/);
invalid.items[0] = {...items[0],image:{src:'https://example.test/x.webp',alt:'External'}};
assert.throws(()=>createManualExpansion({...args,itemContent:invalid}),/unsafe image/);
console.log(`PASS: ${items.length} item pages, all 75 venues, complete authored text and reciprocal links; ${cases} repeated search/filter cases, Reset and history restoration; source validation guards.`);
