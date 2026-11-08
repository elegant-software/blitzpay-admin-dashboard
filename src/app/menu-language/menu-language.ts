// International Menu helpers shared by the merchant edit, catalog and Printed Catalog views.
import { CatalogTranslation, Merchant, MenuLanguage, TranslationOrigin } from '../models/merchant-catalog.models';

export const INTERNATIONAL_MENU = 'INTERNATIONAL_MENU';

const RIGHT_TO_LEFT = new Set(['ar', 'fa', 'he', 'ur', 'ku']);

/** The merchant's languages: Original Menu Language first, then its Supported Menu Languages. */
export function merchantMenuLanguages(merchant: Merchant | null | undefined): string[] {
  const original = merchant?.originalMenuLanguage;
  if (!original) return [];
  return [original, ...(merchant?.supportedMenuLanguages ?? []).filter((code) => code !== original)];
}

/** Product display follows the UI when supported; writes always pin the original language separately. */
export function displayProductLanguage(merchant: Merchant | null | undefined, uiLanguage: string): string | undefined {
  const languages = merchantMenuLanguages(merchant);
  if (languages.length <= 1) return languages[0];
  const code = uiLanguage.toLowerCase();
  return languages.find(language => language.toLowerCase() === code)
    ?? languages.find(language => language.toLowerCase() === code.split('-')[0])
    ?? languages[0];
}

/** "German — Deutsch"; just the English name when both names are the same. */
export function languageLabel(code: string, catalogue: MenuLanguage[]): string {
  const entry = catalogue.find((language) => language.code === code);
  if (!entry) return code.toUpperCase();
  return entry.nativeName && entry.nativeName !== entry.displayName
    ? `${entry.displayName} — ${entry.nativeName}`
    : entry.displayName;
}

export function offersInternationalMenu(merchant: Merchant | null | undefined): boolean {
  return !!merchant?.offerings?.includes(INTERNATIONAL_MENU);
}

export function isRightToLeft(code: string | null | undefined): boolean {
  return !!code && RIGHT_TO_LEFT.has(code);
}

/** Editable state of one Product or Category Translation in a Supported Menu Language. */
export interface TranslationRow {
  language: string;
  name: string;
  description: string;
  origin: TranslationOrigin | null;
  stale: boolean;
  exists: boolean;
  saving: boolean;
  error: string;
}

export function toTranslationRow(language: string, translation?: CatalogTranslation): TranslationRow {
  return {
    language,
    name: translation?.name ?? '',
    description: translation?.description ?? '',
    origin: translation?.origin ?? null,
    stale: translation?.stale ?? false,
    exists: !!translation,
    saving: false,
    error: '',
  };
}
