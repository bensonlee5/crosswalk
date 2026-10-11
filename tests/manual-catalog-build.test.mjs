import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync, mkdirSync, writeFileSync, existsSync, rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {resolve, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
test('catalog rebuilds remove retired entries without leaving stale pages', () => {
  const output = mkdtempSync(resolve(tmpdir(), 'crosswalk-catalog-retirement-'));
  try {
    for (const directory of ['items','venues','brands']) {
      const target = resolve(output, directory, 'retired-fixture');
      mkdirSync(target, {recursive:true});
      writeFileSync(resolve(target, 'index.html'), 'Stale generated fixture');
    }
    const result = spawnSync(process.execPath, ['scripts/build-manual.mjs', '--output', output], {cwd:root, encoding:'utf8'});
    assert.equal(result.status, 0, result.stderr || result.stdout);
    for (const directory of ['items','venues','brands']) {
      assert.ok(!existsSync(resolve(output, directory, 'retired-fixture')));
      assert.ok(existsSync(resolve(output, directory, 'index.html')));
    }
  } finally { rmSync(output, {recursive:true, force:true}); }
});
