import { StorefrontTranslatePipe } from '../i18n/storefront-translate.pipe';
import { Component } from '@angular/core';
import { environment } from '../../environments/environment';

@Component({
  selector: 'web-app-download', standalone: true,
  imports: [StorefrontTranslatePipe],
  template: `<section class="completion-download" data-testid="app-install-prompt" [attr.aria-label]="'Get the BlitzPay app' | storefrontTranslate">
    <p class="eyebrow">{{ 'For your next visit' | storefrontTranslate }}</p>
    <h2>{{ 'Enjoyed your visit?' | storefrontTranslate }}</h2>
    <p class="muted">{{ 'Get BlitzPay for an easier next visit. You can always continue as a guest.' | storefrontTranslate }}</p>
    <div class="completion-store-links">
        <a [href]="environment.appStoreUrl" target="_blank" rel="noopener noreferrer" [attr.aria-label]="'Get the BlitzPay app on the App Store (opens in a new tab)' | storefrontTranslate">
          <svg class="store-icon apple-icon" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M17.05 12.54c.03 3.19 2.8 4.25 2.83 4.26-.02.08-.44 1.52-1.46 3.01-.88 1.29-1.8 2.57-3.24 2.6-1.41.03-1.87-.84-3.48-.84-1.6 0-2.11.82-3.44.87-1.39.05-2.45-1.4-3.34-2.68-1.82-2.63-3.21-7.44-1.34-10.69.93-1.61 2.59-2.63 4.39-2.66 1.37-.03 2.67.93 3.49.93.81 0 2.34-1.15 3.95-.98.67.03 2.57.27 3.79 2.06-.1.06-2.26 1.32-2.23 4.12ZM14.4 4.61c.74-.9 1.24-2.15 1.1-3.4-1.07.04-2.37.71-3.14 1.61-.69.8-1.3 2.08-1.14 3.3 1.19.09 2.41-.61 3.18-1.51Z"/></svg>
          <span><small>{{ 'Download on the' | storefrontTranslate }}</small><strong>App Store</strong></span>
        </a>
        <a [href]="environment.googlePlayUrl" target="_blank" rel="noopener noreferrer" [attr.aria-label]="'Get the BlitzPay app on Google Play (opens in a new tab)' | storefrontTranslate">
          <svg class="store-icon" viewBox="0 0 28 30" aria-hidden="true"><path fill="#48c6ed" d="M2 1 16 15 2 29Z"/><path fill="#64d38b" d="m2 1 18 10-4 4Z"/><path fill="#ffcf53" d="m16 15 4-4 7 4-7 4Z"/><path fill="#f27883" d="m2 29 14-14 4 4Z"/></svg>
          <span><small>GET IT ON</small><strong>Google Play</strong></span>
        </a>

    </div>
  </section>`,
  styles: `:host{display:block}.completion-download{margin-block-start:2rem;padding:1.4rem;border:1px solid var(--storefront-stroke);border-radius:1rem;background:var(--storefront-surface)}h2{font-size:1.1rem;margin-block:.3rem .5rem}.completion-store-links{display:flex;flex-wrap:wrap;gap:.75rem;margin-block-start:1rem}.completion-store-links a{display:inline-flex;align-items:center;gap:.7rem;min-height:52px;padding:.6rem 1rem;background:var(--storefront-ink);color:var(--storefront-surface);border-radius:.75rem;text-decoration:none}.completion-store-links a>span{display:grid}.completion-store-links small{font-size:.65rem}.store-icon{width:26px;height:30px}a:focus-visible{outline:3px solid var(--storefront-action);outline-offset:3px}`
})
export class AppDownloadComponent { readonly environment = environment; }
