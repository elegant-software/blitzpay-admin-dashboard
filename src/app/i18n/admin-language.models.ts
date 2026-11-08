/** A language the dashboard interface ships in; listed in ./languages.json. */
export interface AdminUiLanguage {
  code: string;
  displayName: string;
  nativeName: string;
  flagCode: string;
  direction: 'ltr' | 'rtl';
}
