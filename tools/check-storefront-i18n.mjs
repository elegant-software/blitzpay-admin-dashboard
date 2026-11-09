import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
import { parseTemplate } from '@angular/compiler';
const root = 'projects/blitz-pay-web/src/app';
const walk = directory => fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => entry.isDirectory() ? walk(path.join(directory, entry.name)) : [path.join(directory, entry.name)]);
const source = fs.readFileSync(`${root}/i18n/storefront-translations.ts`, 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
const exports = {};
new Function('exports', compiled)(exports);
const tables = exports.STOREFRONT_TRANSLATIONS;
const problems = [];
let templates = 0;
const check = (text, file) => { for (const [code, table] of Object.entries(tables)) if (!table[text]) problems.push(`${file}: missing ${code}: ${text}`); };
for (const file of walk(root).filter(file => file.endsWith('.component.ts'))) {
  const code = fs.readFileSync(file, 'utf8');
  const ast = ts.createSourceFile(file, code, ts.ScriptTarget.Latest, true);
  const scan = node => {
    if (ts.isPropertyAssignment(node) && node.name.getText(ast) === 'template') inspect(node.initializer.text, file);
    if (ts.isPropertyAssignment(node) && node.name.getText(ast) === 'templateUrl') inspect(fs.readFileSync(path.join(path.dirname(file), node.initializer.text), 'utf8'), file);
    ts.forEachChild(node, scan);
  };
  const inspect = (template, file) => {
    templates++;
    const parsed = parseTemplate(template, file);
    if (parsed.errors) problems.push(...parsed.errors.map(error => error.toString()));
    // Audit literal source messages and both arms of translated conditional messages.
    for (const match of template.matchAll(/\{\{\s*'((?:\\.|[^'])*)'\s*\|\s*storefrontTranslate/g)) check(match[1].replaceAll("\\'", "'"), file);
    const visit = node => {
      if (node.constructor.name === 'Text' && /[A-Za-z]{2}/.test(node.value) && !['BlitzPay', 'App Store', 'Google Play', 'GET IT ON'].includes(node.value.trim())) problems.push(`${file}: untranslated text: ${node.value.trim()}`);
      node.children?.forEach(visit);
    };
    parsed.nodes.forEach(visit);
  };
  scan(ast);
}
if (problems.length) { console.error([...new Set(problems)].join('\n')); process.exitCode = 1; }
else console.log(`PASS: ${templates} storefront templates; ${Object.keys(tables.de).length} German/Arabic message pairs.`);
