import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { ensembleAftermath } from '../lib/ensemble-aftermath-content.ts';

// Fingerprinted before the narrative pass against the independently accepted
// production mechanics. Foreground prose and response delivery may vary; every
// gate, cost, source, claim, public summary/effect and speaker remains included.
function mechanics(definitions) {
  return definitions.map(definition => {
    const result = { ...definition };
    delete result.stages;
    result.stages = definition.stages.map(stage => {
      const row = { ...stage };
      delete row.title;
      delete row.prompt;
      delete row.choices;
      row.choices = stage.choices.map(option => {
        const choice = { ...option };
        delete choice.label;
        delete choice.outcome;
        delete choice.narration;
        delete choice.response;
        choice.narration = { public: option.narration.public, npc: option.narration.npc };
        choice.speakerId = option.response.speakerId;
        return choice;
      });
      return row;
    });
    return result;
  });
}

test('the narrative pass preserves all twenty aftermath mechanics and public effect identities', () => {
  assert.equal(ensembleAftermath.length, 20);
  assert.equal(ensembleAftermath.flatMap(story => story.stages).length, 60);
  assert.equal(ensembleAftermath.flatMap(story => story.stages.flatMap(stage => stage.choices)).length, 169);
  const digest = createHash('sha256').update(JSON.stringify(mechanics(ensembleAftermath))).digest('hex');
  assert.equal(digest, 'b3b8121462ba1f837f813980b2062760ac3552ee256e7bb21bbd04bc307bfcd9');
});

test('every aftermath choice has its own visible reaction and a concrete response activity', () => {
  for (const story of ensembleAftermath) for (const stage of story.stages) {
    assert.ok(stage.title.length > 3 && stage.prompt.length > 40);
    for (const choice of stage.choices) {
      assert.equal(choice.narration.personal, choice.outcome);
      assert.notEqual(choice.outcome, choice.narration.public);
      assert.ok(choice.response.speech.length > 10);
      assert.ok(choice.response.activity.length > 10);
      assert.doesNotMatch(choice.response.activity, /talking through what the earlier choice changed/);
    }
  }
});

test('Alder follow-through preserves distinct comic motives and a quieter musical moment', () => {
  const story = id => ensembleAftermath.find(value => value.storyId === id);
  const text = id => JSON.stringify(story(id));
  assert.match(text('bracken'), /WHAT COUNTS AS KNOCKING/);
  assert.match(text('late_loaf'), /moved the card where everyone can see it/);
  assert.match(text('last_crossing'), /Before I spoil your record/);
  assert.match(text('pantry_song'), /a room can miss somebody/);
});
