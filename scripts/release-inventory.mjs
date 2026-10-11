import {readFile} from 'node:fs/promises';
import {join} from 'node:path';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';

export async function fileInventory(root, paths) {
  return Promise.all(paths.map(async path => ({
    path,
    sha256: createHash('sha256').update(await readFile(join(root, path))).digest('hex'),
  })));
}

/** Use NUL-delimited paths; deleted files are never opened or silently omitted. */
export async function changeInventory(root, base) {
  const fields = execFileSync('git', ['diff', '--name-status', '--no-renames', '-z', base, '--'], {cwd: root}).toString().split('\0');
  const current = [], deleted = [];
  for (let i = 0; i + 1 < fields.length; i += 2) {
    const status = fields[i], path = fields[i + 1];
    if (!status || !path) throw new Error('Invalid Git change inventory');
    (status === 'D' ? deleted : current).push(path);
  }
  return {changed_files: await fileInventory(root, current.sort()), deleted_files: deleted.sort()};
}

export function validatePortraitRoster(portraits, roster) {
  const actual = portraits.map(p => p.id).sort(), expected = roster.map(p => p.id).sort();
  if (new Set(actual).size !== actual.length || JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error('Portrait manifest must match the approved roster exactly');
  }
}
