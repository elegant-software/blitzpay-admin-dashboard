import ar from './messages/ar.json';
import de from './messages/de.json';
import en from './messages/en.json';

/**
 * Dashboard text, one JSON file per language in ./messages, keyed by the English source text.
 * English source strings are the fallback for any untranslated interface text.
 */
export const ADMIN_TRANSLATIONS: Readonly<Record<string, Readonly<Record<string, string>>>> = { en, de, ar };
