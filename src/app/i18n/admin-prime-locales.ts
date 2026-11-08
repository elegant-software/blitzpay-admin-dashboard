import { Translation } from 'primeng/api';
import ar from './primeng/ar.json';
import de from './primeng/de.json';

/** PrimeNG component text (filters, calendars), one JSON file per language in ./primeng. */
export const ADMIN_PRIME_LOCALES: Readonly<Record<string, Translation>> = { de, ar };
