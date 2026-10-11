import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

const source = ts.transpileModule(readFileSync(new URL('../../lib/committed-ref.ts', import.meta.url), 'utf8'), {
  compilerOptions: {module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ESNext},
}).outputText;

/** Preserve the old deterministic harnesses for their serial lifecycle coverage.
 * Actual React commit/concurrency behavior is tested separately with ReactDOM. */
export function committedHooks(react) {
  const module = {exports: {}};
  const hooks = {...react, useLayoutEffect: react.useEffect};
  vm.runInNewContext(source, {module, exports: module.exports, require: id => {
    if (id === 'react') return hooks;
    throw Error(`Unexpected committed hook import: ${id}`);
  }});
  return module.exports;
}
