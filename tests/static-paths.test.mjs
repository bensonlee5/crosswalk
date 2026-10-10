import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import ts from 'typescript';
const source = readFileSync(new URL('../lib/asset-url.ts', import.meta.url), 'utf8');
for (const base of ['/', '/crosswalk/']) {
  test('public assets and room links respect deployment base ' + base, async () => {
    const replaced = source.replaceAll('import.meta.env', JSON.stringify({ BASE_URL: base }));
    const js = ts.transpileModule(replaced, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ESNext } }).outputText;
    const { assetUrl, homeUrl } = await import('data:text/javascript;base64,' + Buffer.from(js).toString('base64'));
    assert.equal(assetUrl('/paintings/seasons/spring.webp'), base + 'paintings/seasons/spring.webp');
    assert.equal(assetUrl(base + 'paintings/seasons/spring.webp'), base + 'paintings/seasons/spring.webp');
    assert.equal(assetUrl('https://example.com/image.webp'), 'https://example.com/image.webp');
    assert.equal(assetUrl('data:image/svg+xml,hello'), 'data:image/svg+xml,hello');
    assert.equal(assetUrl('#marble'), '#marble');
    globalThis.window = { location: { origin: 'https://user.github.io' } };
    assert.equal(homeUrl('ABC123'), 'https://user.github.io' + base + '?room=ABC123');
    delete globalThis.window;
  });
}
