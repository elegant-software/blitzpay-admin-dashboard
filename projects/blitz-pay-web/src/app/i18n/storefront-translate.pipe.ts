import { Pipe, PipeTransform, inject } from '@angular/core';
import { StorefrontUiService } from '../services/storefront-ui.service';

@Pipe({ name: 'storefrontTranslate', standalone: true, pure: false })
export class StorefrontTranslatePipe implements PipeTransform {
  private readonly ui = inject(StorefrontUiService);
  transform(source: string | null | undefined, values: readonly unknown[] = []): string { return this.ui.text(source, values); }
}
