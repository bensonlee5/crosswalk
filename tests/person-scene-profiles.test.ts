import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync, readFileSync} from 'node:fs';
import {personFamiliarityLines, personSceneProfiles} from '../lib/person-scene-profiles.ts';
import {characterVoices} from '../lib/character-voice.ts';
import {characterCameos} from '../lib/character-cameos.ts';
import {canonicalCharacterById} from '../lib/character-canon.ts';

const words = (text: string) => text.trim().split(/\s+/).length;

test('core cast and 14 additional story actors have authored profiles and canonical portraits', () => {
  const onstageIds = [...Object.keys(characterVoices), ...characterCameos.map(person => person.id)];
  assert.equal(new Set(onstageIds).size, 39);
  const additionalStoryIds = ["lata_rao", "nila_desai", "safia_odhiambo", "rosa_moreno", "mateo_moreno", "nell_harper", "ruth_harper", "jonah_bell", "lucien_morel", "qiao_chen", "akira_mori", "ines_valdes", "vera_valdes", "rafael_valdes"];
  assert.deepEqual(Object.keys(personSceneProfiles).sort(), [...onstageIds, ...additionalStoryIds].sort());
  for (const id of Object.keys(personSceneProfiles)) {
    assert.ok(canonicalCharacterById[id], `${id} has approved canon`);
    assert.ok(existsSync(new URL(`../public/paintings/character-portraits/${id}.webp`, import.meta.url)), `${id} has a portrait`);
  }
});

test('scene copy stays brief, distinct, and within the supported prop vocabulary', () => {
  const props = new Set(['page', 'cup', 'plant', 'tools', 'map', 'food', 'drawing', 'cups', 'leaf', 'none']);
  const greetings = new Set<string>();
  for (const [id, profile] of Object.entries(personSceneProfiles)) {
    assert.deepEqual(Object.keys(profile).sort(), ['appearance', 'activity', 'greeting', 'familiar', 'farewell', 'prop'].sort());
    for (const field of ['appearance', 'activity'] as const) {
      assert.ok(profile[field].trim().length > 0, `${id}.${field} is present`);
      assert.ok(words(profile[field]) <= 12, `${id}.${field} should fit in a short caption`);
    }
    for (const field of ['greeting', 'familiar', 'farewell'] as const) {
      assert.ok(profile[field].trim().length > 0, `${id}.${field} is present`);
      assert.ok(words(profile[field]) <= 18, `${id}.${field} should fit in a speech bubble`);
    }
    assert.ok(props.has(profile.prop), `${id} uses a supported scene prop`);
    assert.ok(!greetings.has(profile.greeting), `${id} has an individual greeting`);
    greetings.add(profile.greeting);
    if (id !== 'bea') assert.match(profile.greeting, /\bI(?:[’']|\b)/, `${id} speaks in the first person`);
  }
});

test('family scenes keep care nearby and children’s words age-appropriate', () => {
  for (const [id, adult] of [['asha', 'Eli'], ['nico', 'Tess'], ['lin', 'Mara'], ['bea', 'Kit']]) {
    assert.match(personSceneProfiles[id].activity, new RegExp(`\\b${adult}\\b`));
  }
  assert.match(personSceneProfiles.jian_wu.activity, /supervised public drawing table/);
  assert.match(personSceneProfiles.lin.activity, /dry play table/);
  assert.match(personSceneProfiles.bea.activity, /chunky wooden cups.*safe family corner/);
  for (const field of ['greeting', 'familiar', 'farewell'] as const) {
    assert.ok(words(personSceneProfiles.bea[field]) <= 2, `Bea’s ${field} is a toddler utterance`);
  }
  assert.equal(personSceneProfiles.bea.prop, 'cups');
  assert.match(personSceneProfiles.asha.familiar, /other pages closed/);
  assert.match(personSceneProfiles.nico.familiar, /Don’t turn/);
  assert.match(personSceneProfiles.lin.familiar, /Don’t move/);
});

test('Oren can choose ordinary company without a project or a treatment claim', () => {
  const oren = personSceneProfiles.oren;
  assert.match(oren.activity, /scenery put away/);
  assert.match(oren.greeting, /stage packed today.*Ordinary company/);
  assert.match(oren.familiar, /more listening/);
  assert.doesNotMatch(Object.values(oren).join(' '), /cure|recover|chemotherapy|treatment|healthy|improv(?:ed|ing)/i);
});

test('visual captions use inspected portrait details without locating the encounter', () => {
  assert.match(personSceneProfiles.eli.appearance, /bucket hat.*quilted blue vest/);
  assert.match(personSceneProfiles.jo.appearance, /Round glasses.*silver hair.*ochre apron/);
  assert.match(personSceneProfiles.glass_sora.appearance, /Shaved sides.*topknot/);
  assert.match(personSceneProfiles.kit.appearance, /plum hair.*striped overshirt/);
  assert.match(personSceneProfiles.bea.appearance, /auburn curls.*rust-red overalls/);
  for (const [id, profile] of Object.entries(personSceneProfiles)) {
    assert.doesNotMatch(`${profile.appearance} ${profile.activity}`, /Alder Quay|Saffron|Glasssteppe|Pelagia|Ember Mesa|behind (?:her|him|them)|in the background/i, `${id} does not substitute a portrait backdrop for the current venue`);
  }
});

test('profiles are static presentation copy with no game rules or state dependencies', () => {
  const source = readFileSync(new URL('../lib/person-scene-profiles.ts', import.meta.url), 'utf8');
  assert.doesNotMatch(source, /^import\s/m);
  assert.doesNotMatch(source, /Math\.random|Date\.now|localStorage|fetch\(|\.receipts\s*=|\.hours\s*[-+]?=/);
});

test('every onstage person has distinct alternating routine and habit responses', () => {
  assert.deepEqual(Object.keys(personFamiliarityLines).sort(), Object.keys(personSceneProfiles).sort());
  for (const [id, stages] of Object.entries(personFamiliarityLines)) {
    assert.deepEqual(Object.keys(stages).sort(), ['habit', 'routine']);
    const profile = personSceneProfiles[id];
    const personLines = [profile.greeting, profile.familiar, profile.farewell];
    for (const stage of ['routine', 'habit'] as const) {
      assert.equal(stages[stage].length, 2, `${id}.${stage} alternates between two authored lines`);
      for (const line of stages[stage]) {
        assert.ok(line.trim().length > 0, `${id}.${stage} is present`);
        assert.ok(words(line) <= 18, `${id}.${stage} stays within a speech bubble`);
        assert.doesNotMatch(line, /\b(?:routine|habit|level|points?|unlocked)\b/i, `${id} speaks as a person, not a progression meter`);
        personLines.push(line);
      }
    }
    assert.equal(new Set(personLines).size, personLines.length, `${id} has distinct first, familiar, routine, habit, and farewell speech`);
  }
});

test('familiarity does not promise access, friendship, or future availability', () => {
  for (const [id, stages] of Object.entries(personFamiliarityLines)) {
    const copy = [...stages.routine, ...stages.habit].join(' ');
    assert.doesNotMatch(copy, /best friend|trust you|owe (?:me|you)|always (?:here|available|welcome)|any ?time|I promise|you can (?:open|take|read) my/i, `${id} does not turn encounter count into an obligation or permission`);
  }
  for (const stage of ['routine', 'habit'] as const) {
    for (const line of personFamiliarityLines.bea[stage]) assert.ok(words(line) <= 2);
  }
  assert.match(personFamiliarityLines.asha.routine.join(' '), /deciding whether I want to show/);
  assert.match(personFamiliarityLines.nico.routine.join(' '), /don’t want my leaves moved/);
  assert.match(personFamiliarityLines.jian_wu.habit.join(' '), /keeping the drawings to myself/);
  assert.match(personFamiliarityLines.lin.routine.join(' '), /Don’t touch yet/);
  const oren = [...personFamiliarityLines.oren.routine, ...personFamiliarityLines.oren.habit].join(' ');
  assert.match(oren, /still need a short visit/);
  assert.doesNotMatch(oren, /cure|recover|chemotherapy|treatment|healthy|improv(?:ed|ing)|more energy|stronger|better now/i);
});


test('new story portraits use inspected details and Vera keeps ordinary supervised hobby boundaries', () => {
  const observed: Record<string, RegExp> = {
    lata_rao: /braid.*green shirt/, nila_desai: /ochre overshirt/, safia_odhiambo: /silver curls.*turquoise/,
    rosa_moreno: /white curls.*rust blouse.*shawl/, mateo_moreno: /sun hat.*blue shirt/,
    nell_harper: /Copper curls.*freckles.*backpack/, ruth_harper: /blue cardigan.*tortoiseshell glasses/,
    jonah_bell: /twists.*beard.*yellow shirt/, lucien_morel: /silver moustache.*rust scarf/,
    qiao_chen: /burgundy padded vest.*navy/, akira_mori: /brown coat.*red scarf/,
    ines_valdes: /pearl earrings.*plum blouse/, vera_valdes: /pale green.*blue game box/,
    rafael_valdes: /pale blue shirt.*straw hat/,
  };
  for (const [id, detail] of Object.entries(observed)) assert.match(personSceneProfiles[id].appearance, detail, id);
  assert.equal(canonicalCharacterById.vera_valdes.age,14);
  assert.match(personSceneProfiles.vera_valdes.activity,/her own game box.*adult-run public table/);
  assert.doesNotMatch(Object.values(personSceneProfiles.vera_valdes).join(' '),/wage|shift|bet|owes|appointment|promise|commission|caregiver/);
});
