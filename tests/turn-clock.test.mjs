import fs from 'node:fs';import assert from 'node:assert/strict';import ts from 'typescript';import {createRequire} from 'node:module';import {pathToFileURL} from 'node:url';import React from 'react';import {renderToStaticMarkup} from 'react-dom/server';
const require=createRequire(import.meta.url);
let code=ts.transpileModule(fs.readFileSync('app/turn-clock.tsx','utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText;
code=code.replace(/from ["'](react(?:\/jsx-runtime)?)["']/g,(_,m)=>'from '+JSON.stringify(pathToFileURL(require.resolve(m)).href));
const {getTurnClockState:f,default:Clock}=await import('data:text/javascript;base64,'+Buffer.from(code).toString('base64'));
assert.equal(f(6).angle,0);assert.equal(f(0).angle,359.5);assert.equal(f(2).phase,'low');assert.equal(f(1).phase,'critical');assert.equal(f(0).phase,'empty');assert.ok(f(4).segmentOffsets.slice(0,2).every(x=>x===-1));assert.equal(f(1,6,5).preview,1);assert.equal(f(NaN).remaining,0);assert.equal(f(2,4).angle,179.75);
for(const hours of [6,4,1,0]){const html=renderToStaticMarkup(React.createElement(Clock,{hours,turnKey:'room:1:p',previewCost:2}));assert.match(html,/role="meter"/);assert.match(html,new RegExp('aria-valuenow="'+hours+'"'));assert.match(html,/cw-turn-clock__hand/);assert.match(html,/cw-turn-clock__remaining/);if(hours===0)assert.match(html,/TIME UP/)}
console.log('PASS: six-segment time geometry, thresholds, cost preview, accessible clock markup, and empty state');
