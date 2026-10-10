import {readFileSync, writeFileSync} from 'node:fs';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const portraitRevisions=Object.fromEntries(JSON.parse(readFileSync(resolve(root,'public/paintings/character-portraits/manifest.json'),'utf8')).map(p=>[p.id,p.sha256.slice(0,12)]));
const escape = value => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
export const wordCount = paragraphs => paragraphs.join(' ').trim().split(/\s+/u).length;
export const regions = [
  ['alder', 'Alder Quay'], ['saffron', 'Saffron Reach'], ['glasssteppe', 'Glasssteppe'],
  ['pelagia', 'Pelagia'], ['embermesa', 'Ember Mesa'], ['traveler', 'On the road'],
];

export function renderCharacters(characters, affinities = []) {
  const cards = characters.map(person => {
    const {id, name, region, hometown, role, intro, paragraphs, age, family = []} = person;
    const count = wordCount(paragraphs);
    if (count < 250 || count > 500) throw new Error(`${name}: ${count} words; expected 250–500`);
    if (!Number.isInteger(age) || age < 2 || age > 100) throw new Error(`${name}: expected an authored age`);
    if(age<18&&(!family.length||!(person.interaction||person.interactionScope)))throw new Error(`${name}: minor profile requires family and age-appropriate context`);
    const familyLinks = family.length ? `<p class="family-ties">${family.map(tie => {
      const relative = characters.find(character => character.id === tie.id);
      if (!relative) throw new Error(`Unknown family member: ${tie.id}`);
      return `${escape(tie.label)} <a href="#person-${relative.id}" data-cast-region="${relative.region}">${escape(relative.name)}</a>`;
    }).join(' · ')}</p>` : '';
    return {region, html: `<article class="person" id="person-${id}" data-region="${region}"><div class="portrait"><span class="monogram" aria-hidden="true">${escape(name[0])}</span><img src="../paintings/character-portraits/${id}.webp${portraitRevisions[id]?`?v=${portraitRevisions[id]}`:''}" alt="${escape(person.portraitAlt||`Portrait of ${name}`)}" loading="lazy" width="640" height="640"></div><div class="person-copy"><div class="identity-line"><h4>${escape(name)}</h4>${age === undefined ? '' : `<span class="age">Age ${age}</span>`}</div><p class="role">${escape(role)}</p><p>${escape(intro)}</p><span class="hometown">${escape(hometown)}</span>${familyLinks}${age<18?`<p class="young-resident">${age<3?'A brief family presence with their caregiver.':'A younger resident with family, school and everyday interests. Adults remain responsible for care.'}</p>`:''}<details class="backstory" name="character-backstories"><summary>Read ${escape(name)}’s backstory <span class="reading-length">${count} words</span></summary><div class="backstory-copy">${paragraphs.map(paragraph => `<p>${escape(paragraph)}</p>`).join('')}</div></details></div></article>`};
  });
  const navigation = `<nav class="region-nav" aria-label="Browse people by geography">${regions.map(([id, label]) => `<a href="#people-${id}" data-cast-region="${id}">${label}</a>`).join('')}</nav>`;
  const connections = affinities.length ? `<aside class="cross-region" aria-labelledby="cross-region-title"><h3 id="cross-region-title">Across the map</h3><p>Shared interests suggest a few possible introductions.</p><div class="connection-notes">${affinities.map(affinity => {
    const names = affinity.ids.map(id => {
      const person = characters.find(character => character.id === id);
      if (!person) throw new Error(`Unknown connection: ${id}`);
      return `<a href="#person-${id}" data-cast-region="${person.region}">${escape(person.name)}</a>`;
    }).join(' &amp; ');
    return `<article><h4>${names}</h4><p class="connection-title">${escape(affinity.title)}</p><p>${escape(affinity.description)}</p></article>`;
  }).join('')}</div></aside>` : '';
  const groups = regions.map(([id, label]) => {
    const members = cards.filter(card => card.region === id);
    return `<section class="cast-region" id="people-${id}" data-region="${id}" aria-labelledby="heading-${id}"><header class="region-heading"><h3 id="heading-${id}">${label}</h3><p class="region-count">${members.length} ${members.length === 1 ? 'person' : 'people'}</p></header><div class="cast-grid">\n${members.map(card => card.html).join('\n')}\n</div></section>`;
  });
  return `${navigation}\n${connections}\n${groups.join('\n')}`;
}

export function renderLocations(locations) {
  return locations.map(place => `<article class="place-card" id="place-${place.id}"><img loading="lazy" src="../paintings/world/${place.id}.webp" width="1536" height="1024" alt="${escape(place.alt)}"><div class="place-copy"><span class="place-region">${escape(place.region)}</span><h3>${escape(place.name)}</h3><p class="place-caption">${escape(place.caption)}</p>${place.artStyle?`<p class="place-style">${escape(place.artStyle)}</p>`:''}${place.climateLabel?`<p>${escape(place.climateLabel)} · ${escape(place.settlementLabel)}</p><p>${escape(place.climateDescription)}</p>`:''}<div class="location-history">${place.paragraphs.map(paragraph => `<p>${escape(paragraph)}</p>`).join('')}</div></div></article>`).join('\n');
}

export function buildPage(page, content) {
  return page
    .replace(/<!-- guide:characters:start -->[\s\S]*?<!-- guide:characters:end -->/, `<!-- guide:characters:start -->\n${renderCharacters(content.characters, content.affinities)}\n<!-- guide:characters:end -->`)
    .replace(/<!-- guide:locations:start -->[\s\S]*?<!-- guide:locations:end -->/, `<!-- guide:locations:start -->\n${renderLocations(content.locations)}\n<!-- guide:locations:end -->`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const path = resolve(root, 'public/guide/index.html');
  const content = JSON.parse(readFileSync(resolve(root, 'docs/guide-content.json'), 'utf8'));
  const page = readFileSync(path, 'utf8');
  for (const kind of ['characters', 'locations']) {
    if (!page.includes(`<!-- guide:${kind}:start -->`) || !page.includes(`<!-- guide:${kind}:end -->`)) throw new Error(`Missing ${kind} markers`);
  }
  const next = buildPage(page, content);
  if (process.argv.includes('--check')) {
    if (next !== page) throw new Error('Field guide is stale. Run npm run guide:build.');
    console.log('Field guide matches its approved content source.');
  } else {
    writeFileSync(path, next);
    console.log(`Built ${content.characters.length} backstories and ${content.locations.length} location histories.`);
  }
}
