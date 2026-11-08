import { Injectable, signal } from '@angular/core';
import { ADMIN_TRANSLATIONS } from './admin-translations';

const normalized = (value: string) => value.replace(/\s+/g, ' ').trim();
const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
// Compile source-message patterns once. Only explicit UI bindings call this translator.
const patterns = [...new Set(Object.values(ADMIN_TRANSLATIONS).flatMap(table => Object.keys(table)))]
  .filter(key => /\{\d+\}/.test(key))
  .sort((a, b) => b.replace(/\{\d+\}/g, '').length - a.replace(/\{\d+\}/g, '').length)
  .map(key => {
    const indices: number[] = [];
    let previous = 0;
    let expression = '^';
    for (const match of key.matchAll(/\{(\d+)\}/g)) {
      expression += escapeRegex(key.slice(previous, match.index)) + '(.*?)';
      indices.push(Number(match[1]));
      previous = match.index! + match[0].length;
    }
    expression += escapeRegex(key.slice(previous)) + '$';
    return { key, indices, matcher: new RegExp(expression) };
  });

/** UI translation state without HTTP dependencies, also usable by notifications. */
@Injectable({ providedIn: 'root' })
export class AdminLocaleService {
  private readonly current = signal('en');
  readonly code = this.current.asReadonly();
  use(code: string): void { this.current.set(code); }

  text(source: string | null | undefined, values: readonly unknown[] = []): string {
    if (source == null) return '';
    let key = normalized(source);
    const table = ADMIN_TRANSLATIONS[this.current()];
    let parameters = values;
    if (table && table[key] === undefined && !values.length) {
      for (const pattern of patterns) {
        const match = pattern.matcher.exec(key);
        if (!match || table[pattern.key] === undefined) continue;
        const extracted: string[] = [];
        pattern.indices.forEach((index, position) => extracted[index] = match[position + 1]);
        parameters = extracted;
        key = pattern.key;
        break;
      }
    }
    const translation = table?.[key];
    const text = translation === undefined ? source : source.replace(/\S(?:[\s\S]*\S)?/, () => translation);
    return text.replace(/\{(\d+)\}/g, (placeholder, index: string) => {
      if (Number(index) >= parameters.length) return placeholder;
      const value = String(parameters[Number(index)] ?? '');
      return this.current() === 'ar' ? `\u2068${value}\u2069` : value;
    });
  }
}
