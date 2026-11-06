export interface BrandingSettings {
  enabled: boolean | null;
  displayName: string | null;
  logoStorageKey: string | null;
  primaryColor: string | null;
  accentColor: string | null;
}
export interface EffectiveBranding {
  platformName: string;
  enabled: boolean;
  displayName: string;
  logoUrl: string | null;
  primaryColor: string;
  primaryTextColor: string;
  accentColor: string;
  accentTextColor: string;
}
export interface BrandingResponse {
  settings: BrandingSettings;
  effective: EffectiveBranding;
  logoPreviewUrl?: string | null;
}
