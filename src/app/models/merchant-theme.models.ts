export type ThemeApp = 'SHOPPER' | 'MERCHANT';

export interface MerchantThemeRequest {
  name: string;
  primaryColor: string;
  accentColor: string;
}

export interface MerchantTheme extends MerchantThemeRequest {
  app: ThemeApp;
  id: string;
  merchantId: string;
  primaryTextColor: string;
  accentTextColor: string;
}
