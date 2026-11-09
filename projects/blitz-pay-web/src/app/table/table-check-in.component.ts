import { StorefrontTranslatePipe } from '../i18n/storefront-translate.pipe';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { StorefrontApiService } from '../services/storefront-api.service';
import { StorefrontTableService } from './storefront-table.service';
import { parseTableCode } from './table-code';
import { TableCodeFormComponent } from './table-code-form.component';
import { NotificationService } from '../notifications/notification.service';

type CheckInState = 'loading' | 'not-found' | 'error';

/**
 * `/t/{tableCode}`: the Table Link carried by a Table's QR code and NFC tag. Resolves the code, checks the guest in
 * at the Table and opens that Branch's Web Catalog. A deactivated Table opens the Branch for collection at the counter.
 */
@Component({
  selector: 'web-table-check-in',
  standalone: true,
  imports: [StorefrontTranslatePipe, CommonModule, TableCodeFormComponent],
  template: `
    <section class="surface catalog-loading" *ngIf="state === 'loading'" role="status" aria-live="polite" aria-busy="true">
      <p class="eyebrow">{{ 'Your table' | storefrontTranslate }}</p><h1>{{ 'Finding your table' | storefrontTranslate }}</h1><p>{{ 'Opening the menu for this table...' | storefrontTranslate }}</p>
    </section>
    <section class="surface table-check-in" *ngIf="state !== 'loading'">
      <p class="eyebrow">{{ 'Your table' | storefrontTranslate }}</p>
      <h1>{{ state === 'not-found' ? ('We could not find this table' | storefrontTranslate) : ('We could not open this table' | storefrontTranslate) }}</h1>
      <p class="muted" *ngIf="state === 'not-found'">{{ 'Check the code on your table and enter it below, or ask a member of staff.' | storefrontTranslate }}</p>
      <p class="storefront-alert" role="alert" *ngIf="state === 'error'">{{ 'Something went wrong. Check your connection and try again.' | storefrontTranslate }}</p>
      <button *ngIf="state === 'error'" class="checkout-button" type="button" (click)="resolve()">{{ 'Try again' | storefrontTranslate }}</button>
      <web-table-code-form />
    </section>
  `
})
export class TableCheckInComponent implements OnInit {
  private readonly notifications = inject(NotificationService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly api = inject(StorefrontApiService);
  private readonly tables = inject(StorefrontTableService);
  private readonly destroyRef = inject(DestroyRef);
  state: CheckInState = 'loading';
  private code: string | null = null;

  ngOnInit(): void {
    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      this.code = parseTableCode(params.get('code'));
      this.resolve();
    });
  }

  resolve(): void {
    const code = this.code;
    if (!code) {
      this.state = 'not-found';
      return;
    }
    this.state = 'loading';
    this.api.resolveTable(code).subscribe({
      next: (resolution) => {
        // The Web Catalog then scopes the cart, disclosing a cart from another location exactly as on a Branch link.
        this.tables.checkIn(code, resolution);
        if (!resolution.active) this.notifications.info('This table is unavailable. You can order for collection at the counter.');
        void this.router.navigate(['/m', resolution.merchantId, 'b', resolution.branchId], { replaceUrl: true });
      },
      error: (error: unknown) => {
        this.state = error instanceof HttpErrorResponse && error.status === 404 ? 'not-found' : 'error';
        if (this.state === 'not-found') this.notifications.warning('We could not find this table. Check the code or ask a member of staff.');
        else this.notifications.apiError(error, 'Unable to open this table. Please try again.');
      }
    });
  }
}
