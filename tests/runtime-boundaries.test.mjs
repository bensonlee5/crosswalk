import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

const root=path.resolve(new URL('..',import.meta.url).pathname);
const pkg=JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8'));
const declared=new Set([...Object.keys(pkg.dependencies),...Object.keys(pkg.devDependencies)]);
const retired=new Set(['three','phaser','next','vinext','drizzle-orm','@cloudflare/workers-types']);

test('current browser and backend import graphs resolve without retired stacks or implicit packages',()=>{
 const queue=['src/main.tsx','supabase/functions/crosswalk-game/index.ts'],seen=new Set();
 while(queue.length){
  const file=queue.pop();if(seen.has(file))continue;seen.add(file);
  const absolute=path.join(root,file);assert.ok(fs.existsSync(absolute),file);
  if(/\.(css|json)$/.test(file))continue;
  const source=ts.createSourceFile(file,fs.readFileSync(absolute,'utf8'),ts.ScriptTarget.Latest,true);
  const imports=[];
  function visit(node){
   if((ts.isImportDeclaration(node)||ts.isExportDeclaration(node))&&node.moduleSpecifier&&ts.isStringLiteral(node.moduleSpecifier))imports.push(node.moduleSpecifier.text);
   if(ts.isCallExpression(node)&&node.expression.kind===ts.SyntaxKind.ImportKeyword&&ts.isStringLiteral(node.arguments[0]))imports.push(node.arguments[0].text);
   ts.forEachChild(node,visit);
  }
  visit(source);
  for(const spec of imports){
   if(spec.startsWith('node:'))continue;
   if(spec.startsWith('.')||spec.startsWith('@/')){
    const base=spec.startsWith('@/')?path.join(root,spec.slice(2)):path.resolve(path.dirname(absolute),spec);
    const found=[base,...['.ts','.tsx','.mjs','.mts','.js','.css','.json','/index.ts','/index.tsx'].map(ext=>base+ext)].find(p=>fs.existsSync(p)&&fs.statSync(p).isFile());
    assert.ok(found,`${file}: unresolved ${spec}`);queue.push(path.relative(root,found));
   }else{
    const name=spec.replace(/^npm:/,'').match(/^(@[^/]+\/[^/@]+|[^/@]+)/)?.[0];
    assert.ok(declared.has(name),`${file}: undeclared ${spec}`);
    assert.ok(!retired.has(name),`${file}: retired runtime ${spec}`);
   }
  }
 }
 assert.ok(seen.has('app/game-engine.ts'),'actual dynamically loaded illustrated renderer is included');
 assert.ok(!seen.has('app/api/game/route.ts'),'no alternate cookie/D1 backend');
});
