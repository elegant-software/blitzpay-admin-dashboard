// Run with: node tools/i18n/check.mjs
// Checks Angular template syntax, missing translations and untranslated static UI.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import ts from 'typescript';
import { parseTemplate } from '@angular/compiler';
import { components, files, templateOf, walk, clean, human, uiAttributes } from './review.mjs';

const code = ts.transpileModule(fs.readFileSync('src/app/i18n/page-translations.ts','utf8'),
  {compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText;
const context = {exports:{}};
vm.runInNewContext(code,context);
const rows = context.exports.PAGE_TRANSLATIONS;
const keys = new Set(rows.map(row=>clean(row[0])));
const failures = [];
for(const [key,de,ar] of rows) if(!de.trim()||!ar.trim())failures.push(`Empty translation: ${key}`);
const brand = new Set(['ZackPay','ZackPay Admin','GBP','Instagram']);
const counts = [];
for(const file of components) {
  const template=templateOf(file);if(!template)continue;
  const parsed=parseTemplate(template.source,template.file,{preserveWhitespaces:true});
  if(parsed.errors?.length)failures.push(...parsed.errors.map(String));
  let translated=0;
  function checkAst(ast,seen=new Set()) {
    if(!ast||typeof ast!=='object'||seen.has(ast))return;
    seen.add(ast);
    if(ast.constructor.name==='BindingPipe'&&ast.name==='adminTranslate') {
      translated++;
      const expression=ast.exp;
      if(expression.constructor.name==='LiteralPrimitive'&&typeof expression.value==='string'&&!keys.has(clean(expression.value)))
        failures.push(`${path.relative('src/app',file)}: missing translation for ${expression.value}`);
    }
    for(const [key,value] of Object.entries(ast)) {
      if(['sourceSpan','span','nameSpan'].includes(key))continue;
      if(Array.isArray(value))value.forEach(v=>checkAst(v,seen));
      else if(value&&typeof value==='object')checkAst(value,seen);
    }
  }
  walk(parsed.nodes,(n,content)=>{
    if(content)return;
    if(n.constructor.name==='Text'&&human(clean(n.value))&&!brand.has(clean(n.value)))
      failures.push(`${path.relative('src/app',file)}: untranslated text: ${clean(n.value)}`);
    for(const a of n.attributes??[])if(uiAttributes.has(a.name)&&human(clean(a.value)))
      failures.push(`${path.relative('src/app',file)}: untranslated ${a.name}: ${a.value}`);
    if(n.value?.ast)checkAst(n.value.ast);
    for(const a of n.inputs??[])if(a.value?.ast)checkAst(a.value.ast);
  });
  counts.push({component:path.relative('src/app',file).replaceAll('\\','/'),bindings:translated});
}
console.table(counts);
for(const file of files.filter(f=>f.endsWith('.css')&&!/[\\/]auth[\\/]/.test(f))) {
  const css=fs.readFileSync(file,'utf8');
  for(const match of css.matchAll(/(?:^|[;{}\n])\s*((?:margin|padding|border)-(?:left|right)(?:-[a-z]+)?|left|right|text-align)\s*:\s*([^;}\n]+)/g)) {
    const [,property,rawValue]=match;const value=rawValue.trim();
    if(property==='left'&&value==='50%')continue; // physical centering of the floor-plan hint
    if(property!=='text-align'||['left','right'].includes(value))
      failures.push(`${path.relative('src/app',file)}: physical directional style ${property}: ${value}`);
  }
}
if(failures.length){console.error(failures.join('\n'));process.exitCode=1;}
else console.log(`PASS: ${counts.length} component templates; ${rows.length} German/Arabic translation entries.`);
