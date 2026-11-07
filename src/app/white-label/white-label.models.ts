export type WhiteLabelApp = 'SHOPPER' | 'MERCHANT' | 'STOREFRONT' | 'KITCHEN';
export type ThemeMode = 'SYSTEM' | 'LIGHT' | 'DARK';
export interface ThemePalette {
  primary: string; onPrimary: string; accent: string; onAccent: string;
  background: string; onBackground: string; surface: string; onSurface: string;
  card: string; onCard: string; muted: string; border: string;
  error: string; onError: string; success: string; onSuccess: string; warning: string; onWarning: string;
}
export interface WhiteLabelSettings {
  enabled?: boolean | null; displayName?: string | null; title?: string | null;
  logoStorageKey?: string | null; darkLogoStorageKey?: string | null;
  themeMode?: ThemeMode | null; light?: ThemePalette | null; dark?: ThemePalette | null; hiddenFeatures: string[];
}
export interface EffectiveWhiteLabel {
  enabled: boolean; displayName: string; title: string; logoUrl: string | null; darkLogoUrl: string | null;
  themeMode: ThemeMode; light: ThemePalette; dark: ThemePalette; features: string[];
}
export interface WhiteLabelResponse {
  settings: WhiteLabelSettings; revision: number; effective: EffectiveWhiteLabel;
  availableFeatures: string[]; inherited: boolean; inheritedConfiguration?: EffectiveWhiteLabel | null; logoPreviewUrl?: string | null; darkLogoPreviewUrl?: string | null;
}
export interface WhiteLabelUpdate { settings: WhiteLabelSettings; revision: number; }
export interface WhiteLabelThemeRequest { name: string; primaryColor: string; accentColor: string; light: ThemePalette; dark: ThemePalette; }
export interface WhiteLabelTheme extends WhiteLabelThemeRequest { id: string; app: WhiteLabelApp; }

export function defaultPalette(dark: boolean): ThemePalette {
  return dark
    ? {primary: '#70D7FF', onPrimary: '#000000', accent: '#C4BFFF', onAccent: '#000000',
      background: '#111113', onBackground: '#F2F2F7', surface: '#1C1C1E', onSurface: '#F2F2F7',
      card: '#242426', onCard: '#F2F2F7', muted: '#AEAEB2', border: '#8E8E93',
      error: '#FFB4AB', onError: '#000000', success: '#83DB98', onSuccess: '#000000', warning: '#FFD180', onWarning: '#000000'}
    : {primary: '#00C2FF', onPrimary: '#000000', accent: '#5856D6', onAccent: '#FFFFFF',
      background: '#FFFFFF', onBackground: '#1C1C1E', surface: '#F2F2F7', onSurface: '#1C1C1E',
      card: '#FFFFFF', onCard: '#1C1C1E', muted: '#636366', border: '#767676',
      error: '#B3261E', onError: '#FFFFFF', success: '#146C2E', onSuccess: '#FFFFFF', warning: '#805600', onWarning: '#FFFFFF'};
}
export function paletteErrors(p: ThemePalette): string[] {
  const errors: string[] = [];
  for (const [key, color] of Object.entries(p)) if (!/^#[0-9a-fA-F]{6}$/.test(color)) errors.push(key + ' must be a six-digit hex color.');
  if (errors.length) return errors;
  const lum = (hex: string) => {
    const c = [1, 3, 5].map(i => { const v = parseInt(hex.slice(i, i + 2), 16) / 255; return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
    return c[0] * 0.2126 + c[1] * 0.7152 + c[2] * 0.0722;
  };
  const ratio = (a: string, b: string) => (Math.max(lum(a), lum(b)) + 0.05) / (Math.min(lum(a), lum(b)) + 0.05);
  const pairs: [keyof ThemePalette, keyof ThemePalette][] = [
    ['primary', 'onPrimary'], ['accent', 'onAccent'], ['background', 'onBackground'], ['surface', 'onSurface'], ['card', 'onCard'],
    ['error', 'onError'], ['success', 'onSuccess'], ['warning', 'onWarning'], ['background', 'muted'], ['surface', 'muted'], ['card', 'muted']];
  for (const [bg, fg] of pairs) if (ratio(p[bg], p[fg]) < 4.5) errors.push(fg + ' needs 4.5:1 contrast against ' + bg + '.');
  for (const bg of ['background', 'surface', 'card'] as const) if (ratio(p.border, p[bg]) < 3) errors.push('border needs 3:1 contrast against ' + bg + '.');
  return errors;
}
