import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TABLE_CODE_LENGTH, parseTableCode } from './table-code';

/** "Enter table code": for guests who cannot scan the QR code or tap the NFC tag at their Table. */
@Component({
  selector: 'web-table-code-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <form class="table-code-form" (ngSubmit)="open()" novalidate>
      <label for="table-code-input">Enter table code</label>
      <div class="table-code-row">
        <input
          id="table-code-input"
          name="tableCode"
          data-testid="table-code-input"
          [(ngModel)]="value"
          (ngModelChange)="error = ''"
          autocomplete="off"
          autocapitalize="characters"
          spellcheck="false"
          [attr.maxlength]="TABLE_CODE_LENGTH + 4"
          placeholder="e.g. AB3K7Q"
          [attr.aria-invalid]="!!error"
          aria-describedby="table-code-hint"
        />
        <button type="submit" data-testid="table-code-submit">Go to table</button>
      </div>
      <small id="table-code-hint" class="muted" *ngIf="!error">The {{ TABLE_CODE_LENGTH }}-character code printed under the QR code on your table.</small>
      <small class="table-code-error" role="alert" *ngIf="error">{{ error }}</small>
    </form>
  `
})
export class TableCodeFormComponent {
  private readonly router = inject(Router);
  readonly TABLE_CODE_LENGTH = TABLE_CODE_LENGTH;
  value = '';
  error = '';

  open(): void {
    const code = parseTableCode(this.value);
    if (!code) {
      this.error = `A table code has ${TABLE_CODE_LENGTH} letters and numbers, like AB3K7Q.`;
      return;
    }
    void this.router.navigate(['/t', code]);
  }
}
