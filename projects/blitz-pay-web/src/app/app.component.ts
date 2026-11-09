import { StorefrontTranslatePipe } from './i18n/storefront-translate.pipe';
import { Component, OnDestroy, effect, inject } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { StorefrontPwaService } from './services/storefront-pwa.service';
import { RouterOutlet } from '@angular/router';
import { StorefrontThemeService } from './services/storefront-theme.service';
import { environment } from '../environments/environment';
import { NotificationComponent } from './notifications/notification.component';
import { StorefrontBrandService } from './services/storefront-brand.service';
import { LanguageSwitcherComponent } from './components/language-switcher.component';
import { StorefrontUiService } from './services/storefront-ui.service';

@Component({
  selector: 'web-root',
  standalone: true,
  imports: [StorefrontTranslatePipe, RouterOutlet, CommonModule, NotificationComponent, LanguageSwitcherComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnDestroy {
  readonly brand = inject(StorefrontBrandService);
  /** Header logo URL that failed to load; keyed by URL so the next merchant logo is still tried. */
  failedLogo: string | null | undefined = null;
  readonly pwa = inject(StorefrontPwaService);
  readonly theme = inject(StorefrontThemeService);
  readonly environment = environment;
  private readonly document = inject(DOCUMENT);
  readonly ui = inject(StorefrontUiService);
  private readonly applyLocale = effect(() => {
    this.document.documentElement.lang = this.ui.code();
    this.document.documentElement.dir = this.ui.direction;
  });
  constructor() { this.ui.load(); }

  ngOnDestroy(): void {
    this.document.documentElement.lang = 'en';
    this.document.documentElement.dir = 'ltr';
  }

  reconnect(): void { window.location.reload(); }
}
