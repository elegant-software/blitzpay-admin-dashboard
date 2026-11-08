import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

export const root = path.resolve('src/app');
export const files = fs.readdirSync(root, { recursive: true }).map(f => path.join(root, f));
export const components = files.filter(f => f.endsWith('.component.ts') && !f.includes(`${path.sep}auth${path.sep}`) && !f.includes(`${path.sep}i18n${path.sep}`));
export const clean = s => s.replace(/\s+/g, ' ').trim();
export const human = s => /[A-Za-zÀ-ž]/.test(s) && s.length > 1;
export const uiAttributes = new Set(['placeholder', 'title', 'aria-label', 'ariaLabel', 'alt', 'label', 'header', 'emptyMessage', 'currentPageReportTemplate', 'chooseLabel', 'cancelLabel', 'uploadLabel', 'pTooltip', 'filterPlaceHolder', 'selectedItemsLabel']);
export function templateOf(file) {
  const source = fs.readFileSync(file, 'utf8');
  const sf = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true);
  let template;
  function visit(n) {
    if (ts.isPropertyAssignment(n) && n.name.getText(sf) === 'template' && ts.isNoSubstitutionTemplateLiteral(n.initializer)) {
      template = { file, source: source.slice(n.initializer.getStart(sf) + 1, n.initializer.end - 1), offset: n.initializer.getStart(sf) + 1, inline: true };
    }
    ts.forEachChild(n, visit);
  }
  visit(sf);
  const external = file.replace(/\.ts$/, '.html');
  if (fs.existsSync(external)) template = { file: external, source: fs.readFileSync(external, 'utf8'), offset: 0, inline: false };
  return template;
}
export function walk(nodes, fn, skip = false) {
  for (const n of nodes) {
    // The printed menu is guest content, rendered in Catalog Language.
    const content = skip || n.attributes?.some(a => a.name === 'class' && /\bpc-sheet\b/.test(a.value));
    fn(n, content);
    if (n.children) walk(n.children, fn, content);
    if (n.branches) for (const b of n.branches) walk(b.children ?? [], fn, content);
  }
}
