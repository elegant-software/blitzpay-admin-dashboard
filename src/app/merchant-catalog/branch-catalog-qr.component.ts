import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges } from '@angular/core';
import * as QRCode from 'qrcode';

@Component({
  selector: 'app-branch-catalog-qr',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="branch-catalog-qr" *ngIf="url">
      <img *ngIf="imageUrl" [src]="imageUrl" alt="Branch Catalog QR code" />
      <p class="branch-catalog-url">{{ url }}</p>
    </div>
  `,
  styleUrl: './branch-catalog-qr.component.css'
})
export class BranchCatalogQrComponent implements OnChanges {
  @Input() url = '';
  imageUrl = '';

  ngOnChanges(): void {
    this.imageUrl = '';
    if (!this.url) return;
    QRCode.toDataURL(this.url, { errorCorrectionLevel: 'M', margin: 4, width: 208 })
      .then((imageUrl) => this.imageUrl = imageUrl)
      .catch(() => this.imageUrl = '');
  }
}
