import { provideHttpClient } from '@angular/common/http';
import { isDevMode } from '@angular/core';
import { provideServiceWorker } from '@angular/service-worker';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, withEnabledBlockingInitialNavigation } from '@angular/router';
import { AppComponent } from './app/app.component';
import { storefrontRoutes } from './app/app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import AuraBase from '@primeuix/themes/aura/base';
import AuraToast from '@primeuix/themes/aura/toast';

bootstrapApplication(AppComponent, {
  providers: [
    provideAnimationsAsync(),
    providePrimeNG({
      theme: {
        preset: { ...AuraBase, components: { toast: AuraToast } },
        options: { darkModeSelector: '[data-theme="dark"]' }
      }
    }),
    provideServiceWorker('ngsw-worker.js', { enabled: !isDevMode(), registrationStrategy: 'registerWhenStable:30000' }),
    provideHttpClient(),
    provideRouter(storefrontRoutes, withEnabledBlockingInitialNavigation())
  ]
}).catch((error: unknown) => console.error(error));
