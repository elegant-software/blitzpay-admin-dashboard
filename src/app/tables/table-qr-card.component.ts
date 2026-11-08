import { AdminTranslatePipe } from '../i18n/admin-translate.pipe';
import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges } from '@angular/core';
import * as QRCode from 'qrcode';

/** A printable QR card for a Table Link (or the Branch Link): title, QR code and the code to type when scanning fails. */
@Component({
  selector: 'app-table-qr-card',
  standalone: true,
  imports: [AdminTranslatePipe, CommonModule],
  template: `
    <figure class="table-qr-card">
      <img *ngIf="imageUrl" [src]="imageUrl" [alt]="('QR code for {0}' | adminTranslate: [(title)])" />
      <figcaption>
        <strong>{{ title }}</strong>
        <span *ngIf="subtitle">{{ subtitle }}</span>
        <span *ngIf="code" class="table-qr-code">{{ 'Table code' | adminTranslate }} <code>{{ code }}</code></span>
      </figcaption>
    </figure>
  `
})
export class TableQrCardComponent implements OnChanges {
  @Input({ required: true }) url = '';
  @Input({ required: true }) title = '';
  @Input() subtitle = '';
  @Input() code = '';
  imageUrl = '';

  ngOnChanges(): void {
    this.imageUrl = '';
    if (!this.url) return;
    QRCode.toDataURL(this.url, { errorCorrectionLevel: 'M', margin: 2, width: 320 })
      .then((imageUrl) => this.imageUrl = imageUrl)
      .catch(() => this.imageUrl = '');
  }
}
