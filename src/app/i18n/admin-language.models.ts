import { LanguageDefinition } from '../models/merchant-catalog.models';

/** A shared catalogue entry eligible for the dashboard selector. */
export type AdminUiLanguage = Pick<LanguageDefinition, 'code' | 'displayName' | 'nativeName' | 'direction'> & { flagCode: string };
