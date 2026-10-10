import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
const manifest = JSON.parse(await readFile(new URL('../supabase/functions/_shared/engine-manifest.json', import.meta.url), 'utf8'));
const source = resolve(process.argv[2] || 'lib');
for (const [name, hash] of Object.entries(manifest.sha256)) {
  const actual = createHash('sha256').update(await readFile(resolve(source, name))).digest('hex');
  const server = createHash('sha256').update(await readFile(new URL(`../supabase/functions/_shared/engine/${name}`, import.meta.url))).digest('hex');
  if (actual !== hash || server !== hash) throw new Error(`Engine copy drift: ${name}. Review both client and server before deployment.`);
}
console.log('Client/server engine files match the verified snapshot.');
